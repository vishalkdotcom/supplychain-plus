import { NextRequest, NextResponse } from "next/server";
import { query as pgQuery } from "@/lib/db/postgres";
import { query as sqlQuery } from "@/lib/db/sql-server";
import { query as mysqlQuery } from "@/lib/db/mysql";
import { db } from "@/lib/db/drizzle";
import { supplierRiskScores } from "@/lib/db/schema";
import { sql, eq } from "drizzle-orm";
import { DashboardMetrics } from "@/types";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parentCompanyId = searchParams.get("parentCompanyId") || "";

    // If filtering by brand, get the list of supplier IDs first
    let brandSupplierIds: string[] | null = null;
    if (parentCompanyId) {
      const brandSuppliers = await db
        .select({ supplierId: supplierRiskScores.supplierId })
        .from(supplierRiskScores)
        .where(eq(supplierRiskScores.parentCompanyId, parentCompanyId));
      brandSupplierIds = brandSuppliers.map((s: { supplierId: string }) => s.supplierId);
      if (brandSupplierIds.length === 0) {
        // No suppliers for this brand — return zeroed metrics
        return NextResponse.json({
          totalSuppliers: 0,
          highRiskSuppliers: 0,
          activeCases: 0,
          pendingSurveys: 0,
          trainingCompletion: 0,
          trendsImproving: 0,
          trendsWorsening: 0,
        } as DashboardMetrics);
      }
    }

    // 1. Get supplier count from Postgres
    let totalSuppliers: number;
    if (brandSupplierIds) {
      const pgRes = await pgQuery(
        `SELECT COUNT(*) as count FROM clients_clientinfo WHERE is_deleted = false AND client_key = ANY($1)`,
        [brandSupplierIds.map(Number)],
      );
      totalSuppliers = parseInt(pgRes.rows[0].count);
    } else {
      const pgRes = await pgQuery(
        `SELECT COUNT(*) as count FROM clients_clientinfo WHERE is_deleted = false`,
      );
      totalSuppliers = parseInt(pgRes.rows[0].count);
    }

    // 2. Get high risk count from Drizzle (wovo_ai)
    let highRiskSuppliers = 0;
    try {
      if (brandSupplierIds) {
        const riskRes = await db.execute(
          sql`SELECT COUNT(*) as count FROM supplier_risk_scores WHERE risk_score > 70 AND parent_company_id = ${parentCompanyId}`,
        );
        highRiskSuppliers = parseInt(String(riskRes[0]?.count ?? 0));
      } else {
        const riskRes = await db.execute(
          sql`SELECT COUNT(*) as count FROM supplier_risk_scores WHERE risk_score > 70`,
        );
        highRiskSuppliers = parseInt(String(riskRes[0]?.count ?? 0));
      }
    } catch (e) {
      logger.warn("api/metrics", "Risk scores table not populated", e);
    }

    // 3. Get active cases count from SQL Server
    let activeCases: number;
    if (brandSupplierIds) {
      const companyIds = brandSupplierIds.map(Number).join(",");
      const sqlRes = await sqlQuery(
        `SELECT COUNT(*) as count FROM [Case] WHERE Deleted = 0 AND CaseStatusId IN (1, 2) AND CompanyId IN (${companyIds})`,
      );
      activeCases = sqlRes.recordset[0].count;
    } else {
      const sqlRes = await sqlQuery(
        `SELECT COUNT(*) as count FROM [Case] WHERE Deleted = 0 AND CaseStatusId IN (1, 2)`,
      );
      activeCases = sqlRes.recordset[0].count;
    }

    // 4. Get active surveys count from Postgres
    let pendingSurveys: number;
    if (brandSupplierIds) {
      const surveyRes = await pgQuery(
        `SELECT COUNT(*) as count FROM survey_mdlsurvey WHERE status = 1 AND client_id = ANY($1)`,
        [brandSupplierIds.map(Number)],
      );
      pendingSurveys = parseInt(surveyRes.rows[0].count);
    } else {
      const surveyRes = await pgQuery(
        `SELECT COUNT(*) as count FROM survey_mdlsurvey WHERE status = 1`,
      );
      pendingSurveys = parseInt(surveyRes.rows[0].count);
    }

    // 5. Get training completion from MySQL
    let trainingCompletion = 0;
    try {
      const trainingRes = (await mysqlQuery(`
        SELECT 
          (SELECT COUNT(*) FROM mdl_user_enrolments) as total_enrolled,
          (SELECT COUNT(*) FROM mdl_course_completions WHERE timecompleted IS NOT NULL) as total_completed
      `)) as Array<{ total_enrolled: number; total_completed: number }>;
      const enrolled = trainingRes[0]?.total_enrolled || 0;
      const completed = trainingRes[0]?.total_completed || 0;
      trainingCompletion =
        enrolled > 0 ? Math.round((completed / enrolled) * 100) : 0;
    } catch (e) {
      logger.warn("api/metrics", "MySQL unavailable for training data", e);
    }

    // 6. Get risk trends from Drizzle (wovo_ai)
    let trendsImproving = 0;
    let trendsWorsening = 0;
    try {
      const trendRes = await db.execute(sql`
        WITH latest AS (
          SELECT DISTINCT ON (supplier_id) supplier_id, risk_score, snapshot_date
          FROM supplier_risk_history
          ORDER BY supplier_id, snapshot_date DESC
        ),
        previous AS (
          SELECT DISTINCT ON (supplier_id) supplier_id, risk_score, snapshot_date
          FROM supplier_risk_history
          WHERE snapshot_date < (SELECT MAX(snapshot_date) FROM supplier_risk_history)
          ORDER BY supplier_id, snapshot_date DESC
        )
        SELECT 
          SUM(CASE WHEN l.risk_score < p.risk_score THEN 1 ELSE 0 END) as improving,
          SUM(CASE WHEN l.risk_score > p.risk_score THEN 1 ELSE 0 END) as worsening
        FROM latest l
        JOIN previous p ON l.supplier_id = p.supplier_id
      `);
      trendsImproving = parseInt(String(trendRes[0]?.improving ?? 0));
      trendsWorsening = parseInt(String(trendRes[0]?.worsening ?? 0));
    } catch (e) {
      logger.warn("api/metrics", "Risk history not populated", e);
    }

    const metrics: DashboardMetrics = {
      totalSuppliers,
      highRiskSuppliers,
      activeCases,
      pendingSurveys,
      trainingCompletion,
      trendsImproving,
      trendsWorsening,
    };

    return NextResponse.json(metrics);
  } catch (error) {
    logger.error("api/metrics", "Failed to fetch metrics", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
