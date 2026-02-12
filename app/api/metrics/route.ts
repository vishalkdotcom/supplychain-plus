import { NextResponse } from "next/server";
import { query as pgQuery } from "@/lib/db/postgres";
import { query as sqlQuery } from "@/lib/db/sql-server";
import { DashboardMetrics } from "@/types";

export async function GET() {
  try {
    // 1. Get supplier count from Postgres
    const pgRes = await pgQuery(
      `SELECT COUNT(*) as count FROM clients_clientinfo WHERE is_deleted = false`,
    );
    const totalSuppliers = parseInt(pgRes.rows[0].count);

    // 2. Get high risk count from our new Postgres table
    const riskRes = await pgQuery(
      `SELECT COUNT(*) as count FROM supplier_risk_scores WHERE risk_score > 70`,
    );
    const highRiskSuppliers = parseInt(riskRes.rows[0].count);

    // 3. Get active cases count from SQL Server
    const sqlRes = await sqlQuery(
      `SELECT COUNT(*) as count FROM [Case] WHERE Deleted = 0 AND CaseStatusId IN (1, 2)`,
    );
    const activeCases = sqlRes.recordset[0].count;

    // 4. Get active surveys count from Postgres
    const surveyRes = await pgQuery(
      `SELECT COUNT(*) as count FROM survey_mdlsurvey WHERE status = 1`,
    );
    const pendingSurveys = parseInt(surveyRes.rows[0].count);

    const metrics: DashboardMetrics = {
      totalSuppliers,
      highRiskSuppliers,
      activeCases,
      pendingSurveys,
      trainingCompletion: 68, // Hardcoded placeholder for now
      trendsImproving: 12, // Hardcoded placeholder for now
      trendsWorsening: 4, // Hardcoded placeholder for now
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
