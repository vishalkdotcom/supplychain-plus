import { db } from "@/lib/db/drizzle";
import {
  supplierRiskScores,
  supplierRiskHistory,
  alerts,
  remediationPlans,
  remediationEvidence,
} from "@/lib/db/schema";
import type { RiskReason } from "@/lib/db/schema";
import { query as pgQuery } from "@/lib/db/postgres";
import { query as mssqlQuery } from "@/lib/db/sql-server";
import { query as mysqlQuery } from "@/lib/db/mysql";
import { eq, and, lt, desc } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { computeMonitoringSignals } from "@/lib/jobs/monitoring-signals";
import type { JobResult, JobParams } from "./types";

interface SupplierRow {
  id: number | string; // bigint → string at runtime from pg
  client_key: number; // integer → number at runtime; maps to SQL Server Company.Id
  name: string;
}

interface CompanyGeoRow {
  Id: number;
  MailingCountry: string | null;
  ParentCompanyId: number | null;
  Latitude: number | null;
  Longitude: number | null;
}

export async function calculateRisk(params?: JobParams): Promise<JobResult> {
  const targetSupplierId = params?.supplierId as string | undefined;

  // 1. Get suppliers
  let supplierQuery = `
    SELECT id, client_key, name
    FROM clients_clientinfo
    WHERE is_deleted = false AND client_key IS NOT NULL
  `;
  const supplierParams: unknown[] = [];
  if (targetSupplierId) {
    supplierParams.push(parseInt(targetSupplierId));
    supplierQuery += ` AND client_key = $${supplierParams.length}`;
  }
  supplierQuery += ` LIMIT 500`;

  const suppliersResult = await pgQuery(supplierQuery, supplierParams);
  const suppliers: SupplierRow[] = suppliersResult.rows;

  // Fetch geo/hierarchy data from SQL Server (batch query for all suppliers)
  const companyGeoMap = new Map<number, CompanyGeoRow>();
  try {
    const geoResult = await mssqlQuery(`
      SELECT co.Id, co.MailingCountry, co.ParentCompanyId,
             cp.Latitude, cp.Longitude
      FROM Company co
      LEFT JOIN (
        SELECT CompanyId, Latitude, Longitude,
               ROW_NUMBER() OVER (PARTITION BY CompanyId ORDER BY Id DESC) as rn
        FROM CompanyPost
        WHERE Latitude IS NOT NULL AND Longitude IS NOT NULL
      ) cp ON cp.CompanyId = co.Id AND cp.rn = 1
      WHERE co.Deleted = 0
    `);
    for (const row of geoResult.recordset) {
      companyGeoMap.set(row.Id, row);
    }
  } catch (e) {
    logger.warn("jobs/calculate-risk", "Geo data unavailable from SQL Server", e);
  }

  // --- Batch: parentCompanyId from PostgreSQL relation tables (authoritative source) ---
  const parentCompanyMap = new Map<number, number>();
  try {
    const relationResult = await pgQuery(`
      SELECT ci_supplier.client_key as supplier_client_key,
             ci.client_key as brand_client_key
      FROM clients_clientinfotorelationmapping m
      JOIN clients_clientrelation cr ON cr.id = m.clientrelation_id
      JOIN clients_clientinfo ci ON ci.id = cr.relation_id
      JOIN clients_clientinfo ci_supplier ON ci_supplier.id = m.clientinfo_id
      WHERE cr.relation_type = 0 AND ci.is_deleted = false
    `);
    for (const row of relationResult.rows) {
      parentCompanyMap.set(row.supplier_client_key, row.brand_client_key);
    }
  } catch (e) {
    logger.warn("jobs/calculate-risk", "Relation table query failed for parentCompanyId", e);
  }

  // --- Batch: Case stats from SQL Server (avoid N+1) ---
  interface CaseStats { CompanyId: number; total: number; high_priority: number; open_cases: number }
  const caseStatsMap = new Map<number, CaseStats>();
  try {
    const allCaseStats = await mssqlQuery(`
      SELECT co.Id as CompanyId,
        COUNT(*) as total,
        SUM(CASE WHEN c.Priority = 1 THEN 1 ELSE 0 END) as high_priority,
        SUM(CASE WHEN c.CaseStatusId = 1 THEN 1 ELSE 0 END) as open_cases
      FROM [Case] c
      JOIN Company co ON c.CompanyId = co.Id
      WHERE c.Deleted = 0
      GROUP BY co.Id
    `);
    for (const row of allCaseStats.recordset) {
      caseStatsMap.set(row.CompanyId, row);
    }
  } catch (e) {
    logger.warn("jobs/calculate-risk", "SQL Server case stats batch query failed", e);
  }

  // --- Batch: Survey stats from PostgreSQL (avoid N+1) ---
  interface SurveyStats { client_id: number; total: string; active: string }
  const surveyStatsMap = new Map<number, SurveyStats>();
  try {
    const allSurveyStats = await pgQuery(`
      SELECT client_id,
        COUNT(*) as total,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as active
      FROM survey_mdlsurvey
      GROUP BY client_id
    `);
    for (const row of allSurveyStats.rows) {
      surveyStatsMap.set(row.client_id, row);
    }
  } catch (e) {
    logger.warn("jobs/calculate-risk", "PostgreSQL survey stats batch query failed", e);
  }

  // --- Batch: Per-supplier training stats from MySQL ---
  const trainingStatsMap = new Map<number, { enrolled: number; completed: number }>();
  try {
    const trainingResult = (await mysqlQuery(`
      SELECT
        cc_map.companyid,
        COUNT(DISTINCT ue.userid) as enrolled,
        COUNT(DISTINCT CASE WHEN ccomp.timecompleted IS NOT NULL THEN ccomp.userid END) as completed
      FROM mdl_company_course cc_map
      JOIN mdl_course c ON c.id = cc_map.courseid
      JOIN mdl_enrol e ON e.courseid = c.id
      JOIN mdl_user_enrolments ue ON ue.enrolid = e.id
      LEFT JOIN mdl_course_completions ccomp ON ccomp.course = c.id AND ccomp.userid = ue.userid
      GROUP BY cc_map.companyid
    `)) as Array<{ companyid: number; enrolled: number; completed: number }>;

    for (const row of trainingResult) {
      trainingStatsMap.set(row.companyid, {
        enrolled: row.enrolled,
        completed: row.completed,
      });
    }
  } catch (e) {
    logger.warn("jobs/calculate-risk", "MySQL per-supplier training query failed", e);
  }

  let processedCount = 0;

  for (const supplier of suppliers) {
    const supplierId = String(supplier.client_key);
    const reasons: RiskReason[] = [];

    // --- Case Score (from batched SQL Server data) ---
    let caseScore = 0;
    const caseRow = caseStatsMap.get(supplier.client_key);
    if (caseRow) {
      const total = caseRow.total || 0;
      const highPriority = caseRow.high_priority || 0;
      const openCases = caseRow.open_cases || 0;

      if (total > 0) {
        caseScore = Math.min(
          100,
          Math.round((highPriority / total) * 60 + (openCases / total) * 40),
        );
      }
      if (highPriority > 2) {
        reasons.push({
          factor: `${highPriority} high-priority cases`,
          impact: "high",
          description: `Supplier has ${highPriority} unresolved high-priority grievances`,
          module: "connect",
        });
      }
      if (openCases > 5) {
        reasons.push({
          factor: `${openCases} open cases`,
          impact: "medium",
          description: `${openCases} cases remain unresolved`,
          module: "connect",
        });
      }
    }

    // --- Survey Score (from batched PostgreSQL data) ---
    let surveyScore = 0;
    const surveyRow = surveyStatsMap.get(supplier.client_key);
    if (!surveyRow) {
      surveyScore = 60; // No engagement = moderate risk
      reasons.push({
        factor: "No surveys conducted",
        impact: "medium",
        description: "No worker sentiment data available for this supplier",
        module: "engage",
      });
    } else {
      const totalSurveys = parseInt(surveyRow.total) || 0;
      const activeSurveys = parseInt(surveyRow.active) || 0;
      if (totalSurveys === 0) {
        surveyScore = 60;
        reasons.push({
          factor: "No surveys conducted",
          impact: "medium",
          description: "No worker sentiment data available for this supplier",
          module: "engage",
        });
      } else {
        surveyScore = Math.max(0, 50 - activeSurveys * 10);
      }
    }

    // --- Training Score (from per-supplier MySQL data) ---
    let trainingScore = 70; // default: no data = moderate risk
    const trainingRow = trainingStatsMap.get(supplier.client_key);
    if (trainingRow && trainingRow.enrolled > 0) {
      const completionRate = (trainingRow.completed / trainingRow.enrolled) * 100;
      trainingScore = Math.max(0, Math.round(100 - completionRate));
      if (completionRate < 50) {
        reasons.push({
          factor: `Low training completion (${Math.round(completionRate)}%)`,
          impact: completionRate < 25 ? "high" : "medium",
          description: `Only ${Math.round(completionRate)}% of enrolled workers completed training`,
          module: "educate",
        });
      }
    } else {
      reasons.push({
        factor: "No training data",
        impact: "medium",
        description: "No Moodle enrollment data available for this supplier",
        module: "educate",
      });
    }

    // --- Engagement Score ---
    const engagementScore = Math.round(
      (caseScore * 0.3 + surveyScore * 0.3 + trainingScore * 0.4) * 0.5,
    );

    // --- Overall Risk Score ---
    const riskScore = Math.min(
      100,
      Math.round(
        caseScore * 0.35 +
          surveyScore * 0.25 +
          trainingScore * 0.25 +
          engagementScore * 0.15,
      ),
    );

    // Lookup cached geo/hierarchy data for this supplier
    const geo = companyGeoMap.get(supplier.client_key);
    const country = geo?.MailingCountry || null;
    const latitude = geo?.Latitude || null;
    const longitude = geo?.Longitude || null;
    // Prefer PostgreSQL relation tables (authoritative), fall back to SQL Server geo data
    const parentFromRelation = parentCompanyMap.get(supplier.client_key);
    const parentCompanyId = parentFromRelation
      ? String(parentFromRelation)
      : geo?.ParentCompanyId
        ? String(geo.ParentCompanyId)
        : null;
    // Derive region from country
    const regionMap: Record<string, string> = {
      Vietnam: "Southeast Asia",
      Bangladesh: "South Asia",
      Cambodia: "Southeast Asia",
      Indonesia: "Southeast Asia",
      Myanmar: "Southeast Asia",
      Thailand: "Southeast Asia",
      India: "South Asia",
      Pakistan: "South Asia",
      "Sri Lanka": "South Asia",
      China: "East Asia",
      Taiwan: "East Asia",
      Turkey: "Europe",
      Ethiopia: "Africa",
      Mexico: "Americas",
      Honduras: "Americas",
      Guatemala: "Americas",
    };
    const region = country ? regionMap[country] || "Other" : null;

    // Upsert risk score with cached geo/hierarchy data
    await db
      .insert(supplierRiskScores)
      .values({
        supplierId,
        supplierName: supplier.name,
        riskScore,
        caseScore,
        surveyScore,
        trainingScore,
        engagementScore,
        reasons,
        country,
        region,
        latitude,
        longitude,
        parentCompanyId,
        calculatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: supplierRiskScores.supplierId,
        set: {
          supplierName: supplier.name,
          riskScore,
          caseScore,
          surveyScore,
          trainingScore,
          engagementScore,
          reasons,
          country,
          region,
          latitude,
          longitude,
          parentCompanyId,
          calculatedAt: new Date(),
        },
      });

    // Insert history snapshot
    const today = new Date().toISOString().split("T")[0];
    await db
      .insert(supplierRiskHistory)
      .values({
        supplierId,
        riskScore,
        caseScore,
        surveyScore,
        trainingScore,
        engagementScore,
        snapshotDate: today,
      })
      .onConflictDoNothing();

    // Generate alerts for high-risk suppliers
    if (riskScore >= 75) {
      await db.insert(alerts).values({
        supplierId,
        supplierName: supplier.name,
        alertType: "risk_spike",
        severity: riskScore >= 90 ? "critical" : "warning",
        title: `High risk score: ${supplier.name} (${riskScore})`,
        message: `${supplier.name} has a risk score of ${riskScore}/100. Top factors: ${reasons
          .slice(0, 2)
          .map((r) => r.factor)
          .join(", ")}`,
      });
    }

    processedCount++;
  }

  // Compute monitoring signals after risk scores are updated
  const monitoringResult = await computeMonitoringSignals();

  // Auto-link evidence: if a supplier's risk dropped while a remediation is in "implementing" status
  try {
    const activeRemediations = await db
      .select()
      .from(remediationPlans)
      .where(eq(remediationPlans.status, "implementing"));

    for (const remediation of activeRemediations) {
      const supplierScore = await db
        .select()
        .from(supplierRiskScores)
        .where(eq(supplierRiskScores.supplierId, remediation.supplierId))
        .limit(1);

      if (supplierScore.length > 0) {
        const currentScore = supplierScore[0].riskScore;
        const historicalScore = await db
          .select()
          .from(supplierRiskHistory)
          .where(
            and(
              eq(supplierRiskHistory.supplierId, remediation.supplierId),
              lt(supplierRiskHistory.snapshotDate, remediation.createdAt.toISOString().slice(0, 10)),
            ),
          )
          .orderBy(desc(supplierRiskHistory.snapshotDate))
          .limit(1);

        if (historicalScore.length > 0 && currentScore < historicalScore[0].riskScore - 5) {
          await db
            .insert(remediationEvidence)
            .values({
              remediationId: remediation.id,
              evidenceType: "risk_score_drop",
              title: `Risk score improved: ${historicalScore[0].riskScore} → ${currentScore}`,
              description: `Risk score dropped by ${historicalScore[0].riskScore - currentScore} points since remediation started.`,
              date: new Date().toISOString().slice(0, 10),
            })
            .onConflictDoNothing();
        }
      }
    }
  } catch (e) {
    logger.warn("jobs/calculate-risk", "Auto-evidence linking failed (non-fatal)", e);
  }

  return {
    success: true,
    count: processedCount,
    message: `Risk scores calculated for ${processedCount} suppliers`,
    monitoring: monitoringResult,
  };
}
