import { NextRequest, NextResponse } from "next/server";
import { query as sqlQuery } from "@/lib/db/sql-server";
import { db } from "@/lib/db/drizzle";
import { supplierRiskScores } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { MetricsBriefing, RiskMovement, UrgentCase } from "@/types";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sinceParam = searchParams.get("since");
    const since = sinceParam
      ? new Date(sinceParam)
      : new Date(Date.now() - 24 * 60 * 60 * 1000); // default: last 24h

    // 1. Count new alerts since timestamp
    let newAlerts = 0;
    try {
      const alertRes = await db.execute(
        sql`SELECT COUNT(*) as count FROM alerts WHERE created_at >= ${since.toISOString()} AND is_read = false`
      );
      newAlerts = parseInt(String(alertRes[0]?.count ?? 0));
    } catch (e) {
      logger.warn("api/metrics/briefing", "Could not count new alerts", e);
    }

    // 2. Risk movements — suppliers that crossed the 70-point threshold
    const riskMovements: RiskMovement[] = [];
    try {
      const movementRes = await db.execute(sql`
        WITH latest AS (
          SELECT DISTINCT ON (supplier_id) supplier_id, risk_score, snapshot_date
          FROM supplier_risk_history
          ORDER BY supplier_id, snapshot_date DESC
        ),
        previous AS (
          SELECT DISTINCT ON (supplier_id) supplier_id, risk_score
          FROM supplier_risk_history
          WHERE snapshot_date < (SELECT MAX(snapshot_date) FROM supplier_risk_history)
          ORDER BY supplier_id, snapshot_date DESC
        )
        SELECT l.supplier_id, l.risk_score as current_score, p.risk_score as previous_score
        FROM latest l
        JOIN previous p ON l.supplier_id = p.supplier_id
        WHERE (l.risk_score > 70 AND p.risk_score <= 70)
           OR (l.risk_score <= 70 AND p.risk_score > 70)
           OR ABS(l.risk_score - p.risk_score) >= 10
        ORDER BY ABS(l.risk_score - p.risk_score) DESC
        LIMIT 10
      `);

      // Get supplier names for movements
      if (Array.isArray(movementRes) && movementRes.length > 0) {
        const riskScores = await db
          .select({
            supplierId: supplierRiskScores.supplierId,
            supplierName: supplierRiskScores.supplierName,
          })
          .from(supplierRiskScores);
        const nameMap = new Map(riskScores.map((r) => [r.supplierId, r.supplierName || ""]));


        for (const row of movementRes) {
          const current = Number(row.current_score);
          const previous = Number(row.previous_score);
          riskMovements.push({
            supplierId: String(row.supplier_id),
            supplierName: nameMap.get(String(row.supplier_id)) || `Supplier ${row.supplier_id}`,
            currentScore: current,
            previousScore: previous,
            direction: current > previous ? "worsened" : "improved",
            crossedThreshold: (current > 70 && previous <= 70) || (current <= 70 && previous > 70),
          });
        }
      }
    } catch (e) {
      logger.warn("api/metrics/briefing", "Could not compute risk movements", e);
    }

    // 3. New high-risk suppliers (crossed above 70 recently)
    const newHighRiskSuppliers = riskMovements.filter(
      (m) => m.direction === "worsened" && m.crossedThreshold
    ).length;

    // 4. Urgent cases — high severity, new/triage status
    const urgentCases: UrgentCase[] = [];
    try {
      const caseRes = await sqlQuery(`
        SELECT TOP 5
          c.Id, c.CompanyId, comp.Name as SupplierName,
          ct.Name as Topic, c.Created,
          CASE c.Priority WHEN 1 THEN 'high' WHEN 2 THEN 'medium' ELSE 'low' END as severity,
          CASE c.CaseStatusId WHEN 1 THEN 'new' WHEN 2 THEN 'in_progress' ELSE 'new' END as status
        FROM [Case] c
        LEFT JOIN Company comp ON c.CompanyId = comp.Id
        LEFT JOIN CaseTypeCultureText ct ON c.CaseTypeId = ct.CaseTypeId AND ct.CultureCodeId = 1
        WHERE c.Deleted = 0 AND c.CaseStatusId = 1 AND c.Priority = 1
        ORDER BY c.Created DESC
      `);

      for (const row of caseRes.recordset) {
        const createdDate = new Date(row.Created);
        const ageDays = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
        urgentCases.push({
          id: `CASE-${row.Id}`,
          supplierId: String(row.CompanyId),
          supplierName: row.SupplierName || "Unknown",
          topic: row.Topic || "General",
          severity: row.severity,
          status: row.status,
          aiSummary: "",
          createdAt: createdDate.toISOString(),
          ageDays,
        });
      }
    } catch (e) {
      logger.warn("api/metrics/briefing", "Could not fetch urgent cases", e);
    }

    // 5. Resolved cases since timestamp
    let resolvedCases = 0;
    try {
      const resolvedRes = await sqlQuery(`
        SELECT COUNT(*) as count FROM [Case]
        WHERE Deleted = 0 AND CaseStatusId = 3
        AND Modified >= '${since.toISOString()}'
      `);
      resolvedCases = resolvedRes.recordset[0]?.count ?? 0;
    } catch (e) {
      logger.warn("api/metrics/briefing", "Could not count resolved cases", e);
    }

    // 6. Build summary text
    const parts: string[] = [];
    if (newAlerts > 0) parts.push(`${newAlerts} new alert${newAlerts > 1 ? "s" : ""}`);
    if (urgentCases.length > 0) parts.push(`${urgentCases.length} urgent case${urgentCases.length > 1 ? "s" : ""} need attention`);
    if (newHighRiskSuppliers > 0) parts.push(`${newHighRiskSuppliers} supplier${newHighRiskSuppliers > 1 ? "s" : ""} crossed the high-risk threshold`);
    if (resolvedCases > 0) parts.push(`${resolvedCases} case${resolvedCases > 1 ? "s" : ""} resolved`);

    const riskImprovements = riskMovements.filter((m) => m.direction === "improved").length;
    if (riskImprovements > 0) parts.push(`${riskImprovements} supplier${riskImprovements > 1 ? "s" : ""} showing improvement`);

    const summary = parts.length > 0
      ? parts.join(", ") + "."
      : "All clear — no significant changes since your last visit.";

    const briefing: MetricsBriefing = {
      summary,
      newAlerts,
      newHighRiskSuppliers,
      escalatedCases: urgentCases.length,
      resolvedCases,
      riskMovements,
      urgentCases,
    };

    return NextResponse.json(briefing);
  } catch (error) {
    logger.error("api/metrics/briefing", "Failed to generate briefing", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
