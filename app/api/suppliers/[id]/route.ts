import { NextResponse } from "next/server";
import { query as pgQuery } from "@/lib/db/postgres";
import { wcGlobalQuery } from "@/lib/db/postgres-wc-global";
import { db } from "@/lib/db/drizzle";
import { supplierRiskScores as supplierRiskScoresSchema } from "@/lib/db/schema";
import { Supplier } from "@/types";
import { eq } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { deriveRegion } from "@/lib/risk-utils";
import { getLastActivityDate } from "@/lib/last-activity";
import { isDemoMode } from "@/lib/demo-mode/profile";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (isDemoMode()) {
      const riskData = await db
        .select()
        .from(supplierRiskScoresSchema)
        .where(eq(supplierRiskScoresSchema.supplierId, id))
        .limit(1);

      const risk = riskData[0];
      if (!risk) {
        return NextResponse.json(
          { error: "Supplier not found" },
          { status: 404 },
        );
      }

      const riskScore = risk.riskScore ?? 50;
      const supplier: Supplier = {
        id,
        name: risk.supplierName || `Supplier ${id}`,
        region: risk.region || deriveRegion(risk.country || ""),
        country: risk.country || "Unknown",
        location: risk.country || "Unknown",
        workerCount: 0,
        contactName: "N/A",
        contactEmail: "N/A",
        riskScore,
        riskLevel: riskScore > 70 ? "high" : riskScore > 30 ? "medium" : "low",
        status: "active",
        lastActivityDate:
          (await getLastActivityDate(id)) ||
          new Date().toISOString().split("T")[0],
        riskBreakdown: {
          caseScore: risk.caseScore ?? 50,
          surveyScore: risk.surveyScore ?? 50,
          trainingScore: risk.trainingScore ?? 50,
          engagementScore: risk.engagementScore ?? 50,
          reasons: risk.reasons ?? [],
        },
        ...(risk.latitude != null && { latitude: risk.latitude }),
        ...(risk.longitude != null && { longitude: risk.longitude }),
        ...(risk.parentCompanyId && { parentCompanyId: risk.parentCompanyId }),
      };

      return NextResponse.json(supplier);
    }

    // 1. Get supplier basic info from Postgres using client_key (maps to SQL Server Company.Id)
    const supplierRes = await pgQuery(
      `SELECT id, client_key, name, country, is_active
       FROM clients_clientinfo 
       WHERE client_key = $1`,
      [id],
    );

    if (supplierRes.rows.length === 0) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 },
      );
    }

    // 2. Get worker count from wc_global.mdl_participant
    let workerCount = 0;
    try {
      const workerRes = await wcGlobalQuery(
        `SELECT COUNT(*) as count FROM mdl_participant WHERE client_id = $1 AND is_deleted = false`,
        [parseInt(id)],
      );
      workerCount = parseInt(workerRes.rows[0]?.count || "0");
    } catch (err) {
      logger.error("api/suppliers/[id]", "Failed to fetch worker count from wc_global", err);
    }

    const row = supplierRes.rows[0];
    
    // 3. Get risk score from Drizzle (wovo_ai)
    const riskData = await db.select()
      .from(supplierRiskScoresSchema)
      .where(eq(supplierRiskScoresSchema.supplierId, String(row.client_key)))
      .limit(1);
    const risk = riskData[0];

    const riskScore = risk?.riskScore || 50;
    const supplier: Supplier = {
      id: String(row.client_key),
      name: row.name,
      region: risk?.region || deriveRegion(row.country),
      country: row.country || "Unknown",
      location: row.country || "Unknown",
      workerCount,
      contactName: "N/A",
      contactEmail: "N/A",
      riskScore,
      riskLevel: riskScore > 70 ? "high" : riskScore > 30 ? "medium" : "low",
      status: row.is_active ? "active" : "inactive",
      lastActivityDate: await getLastActivityDate(String(row.client_key)) || new Date().toISOString().split("T")[0],
      riskBreakdown: {
        caseScore: risk?.caseScore || 50,
        surveyScore: risk?.surveyScore || 50,
        trainingScore: risk?.trainingScore || 50,
        engagementScore: risk?.engagementScore || 50,
        reasons: risk?.reasons || [],
      },
      ...(risk?.latitude != null && { latitude: risk.latitude }),
      ...(risk?.longitude != null && { longitude: risk.longitude }),
      ...(risk?.parentCompanyId && { parentCompanyId: risk.parentCompanyId }),
    };

    return NextResponse.json(supplier);
  } catch (error) {
    logger.error("api/suppliers/[id]", "Failed to fetch supplier detail", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
