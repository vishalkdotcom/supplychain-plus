import { NextResponse } from "next/server";
import { getPool } from "@/lib/db/sql-server";
import { query as pgQuery } from "@/lib/db/postgres";
import { db } from "@/lib/db/drizzle";
import { supplierRiskScores, casePlaybookCache } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { CaseContext } from "@/types";
import { logger } from "@/lib/logger";
import { getRiskLevel } from "@/lib/risk-utils";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const pool = await getPool();

    // 1. Get the case's company ID and case type
    const caseRes = await pool.request().input("id", id).query(`
      SELECT c.CompanyId, c.CaseTypeId, c.Created,
             ctct.Name as TypeName
      FROM [Case] c
      LEFT JOIN CaseTypeCultureText ctct ON c.CaseTypeId = ctct.CaseTypeId AND ctct.CultureCodeId = 1
      WHERE c.Id = @id AND c.Deleted = 0
    `);

    if (caseRes.recordset.length === 0) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    const { CompanyId, CaseTypeId, Created, TypeName } = caseRes.recordset[0];
    const caseAgeDays = Math.max(0, Math.floor(
      (Date.now() - new Date(Created).getTime()) / (1000 * 60 * 60 * 24)
    ));

    // 2. Count open cases at this supplier
    const openCasesRes = await pool.request().input("companyId", CompanyId).query(`
      SELECT COUNT(*) as count FROM [Case]
      WHERE CompanyId = @companyId AND Deleted = 0 AND CaseStatusId IN (1, 2)
    `);
    const supplierOpenCases = openCasesRes.recordset[0].count;

    // 3. Get supplier risk score from Drizzle
    let supplierRiskScore = 0;
    try {
      const riskRes = await db
        .select({ riskScore: supplierRiskScores.riskScore })
        .from(supplierRiskScores)
        .where(eq(supplierRiskScores.supplierId, String(CompanyId)))
        .limit(1);
      supplierRiskScore = riskRes[0]?.riskScore ?? 0;
    } catch (e) {
      logger.warn("api/cases/[id]/context", "Could not fetch risk score", e);
    }

    // 4. Get avg resolution days from playbook cache
    let avgResolutionDays: number | null = null;
    if (CaseTypeId) {
      try {
        const playbookRes = await db
          .select({ avgDays: casePlaybookCache.avgResolutionDays })
          .from(casePlaybookCache)
          .where(eq(casePlaybookCache.caseTypeId, String(CaseTypeId)))
          .limit(1);
        avgResolutionDays = playbookRes[0]?.avgDays ?? null;
      } catch (e) {
        logger.warn("api/cases/[id]/context", "Playbook lookup failed", e);
      }
    }

    // 5. Similar open cases at this supplier (same type or topic)
    const similarRes = await pool
      .request()
      .input("companyId", CompanyId)
      .input("caseId", id)
      .input("caseTypeId", CaseTypeId || 0).query(`
      SELECT TOP 5 c.Id,
        ctct.Name as Topic,
        CASE c.Priority WHEN 1 THEN 'high' WHEN 2 THEN 'medium' ELSE 'low' END as severity,
        CASE c.CaseStatusId WHEN 1 THEN 'new' WHEN 2 THEN 'in_progress' ELSE 'new' END as status
      FROM [Case] c
      LEFT JOIN CaseTypeCultureText ctct ON c.CaseTypeId = ctct.CaseTypeId AND ctct.CultureCodeId = 1
      WHERE c.CompanyId = @companyId AND c.Deleted = 0 AND c.Id != @caseId
        AND c.CaseStatusId IN (1, 2)
      ORDER BY c.Created DESC
    `);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const similarOpenCases = similarRes.recordset.map((r: any) => ({
      id: `CASE-${r.Id}`,
      topic: r.Topic || "General",
      severity: r.severity,
      status: r.status,
    }));

    // 6. Related survey themes (from PostgreSQL)
    const relatedSurveyThemes: string[] = [];
    try {
      const surveyRes = await pgQuery(
        `SELECT DISTINCT question_text FROM survey_mdlsurveyquestion
         WHERE client_id = $1 AND question_text IS NOT NULL
         LIMIT 5`,
        [Number(CompanyId)]
      );
      for (const row of surveyRes.rows) {
        if (row.question_text) {
          relatedSurveyThemes.push(row.question_text);
        }
      }
    } catch (e) {
      logger.warn("api/cases/[id]/context", "Survey theme lookup failed", e);
    }

    // 7. Training gaps
    const trainingGaps: string[] = [];
    if (TypeName) {
      trainingGaps.push(`No targeted training deployed for "${TypeName}" at this supplier`);
    }

    const context: CaseContext = {
      supplierOpenCases,
      supplierRiskScore,
      supplierRiskLevel: getRiskLevel(supplierRiskScore),
      caseAgeDays,
      avgResolutionDays,
      relatedSurveyThemes,
      trainingGaps,
      similarOpenCases,
    };

    return NextResponse.json(context);
  } catch (error) {
    logger.error("api/cases/[id]/context", "Failed to fetch case context", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
