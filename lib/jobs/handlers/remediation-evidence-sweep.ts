import { paramQuery as mssqlParamQuery } from "@/lib/db/sql-server";
import mssql from "mssql";
import { query as mysqlQuery } from "@/lib/db/mysql";
import { logger } from "@/lib/logger";
import type { JobResult } from "./types";
import {
  findAllActiveRemediations,
  attachAutoEvidence,
  buildReferenceId,
} from "@/lib/remediation/auto-evidence";

export async function remediationEvidenceSweep(): Promise<JobResult> {
  const activeRemediations = await findAllActiveRemediations();

  if (activeRemediations.length === 0) {
    return { success: true, message: "No active remediations to check", evidenceAttached: 0 };
  }

  let evidenceAttached = 0;
  const today = new Date().toISOString().slice(0, 10);

  // 1. Check SQL Server for resolved cases linked to supplier
  try {
    for (const remediation of activeRemediations) {
      const supplierId = remediation.supplierId;

      // Query resolved cases (Status >= 5 means resolved in this system) for this supplier
      // CompanyId maps to supplierId via client_key
      const companyId = parseInt(supplierId) || 0;
      const resolvedCases = await mssqlParamQuery(`
        SELECT COUNT(*) as cnt
        FROM Message m
        JOIN [Case] c ON m.CaseId = c.Id
        WHERE c.CompanyId = @companyId
          AND c.StatusId >= 5
          AND c.UpdatedDate >= DATEADD(day, -30, GETDATE())
      `, { companyId: { type: mssql.Int, value: companyId } });

      const resolvedCount = resolvedCases?.recordset?.[0]?.cnt ?? 0;
      if (resolvedCount > 0) {
        const refId = buildReferenceId("case_resolved", today, supplierId, "sweep");
        const attached = await attachAutoEvidence(
          remediation.id,
          "case_resolved",
          `${resolvedCount} case(s) resolved in last 30 days`,
          `${resolvedCount} worker grievance case(s) have been resolved for this supplier in the last 30 days.`,
          refId,
        );
        if (attached) evidenceAttached++;
      }
    }
  } catch (e) {
    logger.warn("jobs/remediation-evidence-sweep", "SQL Server case resolution check failed (non-fatal)", e);
  }

  // 2. Check MySQL/Moodle for training completions
  try {
    for (const remediation of activeRemediations) {
      const supplierId = remediation.supplierId;

      const trainingResult = await mysqlQuery(`
        SELECT COUNT(*) as cnt
        FROM mdl_company_course
        WHERE company_id = ?
          AND completed > 0
      `, [parseInt(supplierId) || 0]);

      const completedCourses = (trainingResult as Array<{cnt: number}>)?.[0]?.cnt ?? 0;
      if (completedCourses > 0) {
        const refId = buildReferenceId("training_completed", today, supplierId, "sweep");
        const attached = await attachAutoEvidence(
          remediation.id,
          "training_completed",
          `${completedCourses} training course(s) completed`,
          `Supplier has ${completedCourses} completed training course(s) in the LMS system.`,
          refId,
        );
        if (attached) evidenceAttached++;
      }
    }
  } catch (e) {
    logger.warn("jobs/remediation-evidence-sweep", "MySQL training check failed (non-fatal)", e);
  }

  // 3. Check PostgreSQL for case volume decrease (last 30 days vs previous 30 days)
  try {
    for (const remediation of activeRemediations) {
      const supplierId = remediation.supplierId;

      // Compare case counts in the wovo_new database
      const { query: pgQuery } = await import("@/lib/db/postgres");
      const result = await pgQuery(`
        SELECT
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as recent_count,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '60 days' AND created_at < NOW() - INTERVAL '30 days') as previous_count
        FROM clients_clientinfo ci
        WHERE ci.client_key = $1
      `, [parseInt(supplierId) || 0]);

      const recent = result.rows[0]?.recent_count ?? 0;
      const previous = result.rows[0]?.previous_count ?? 0;

      if (previous > 0 && recent < previous * 0.7) {
        const refId = buildReferenceId("case_volume_decrease", today, supplierId);
        const attached = await attachAutoEvidence(
          remediation.id,
          "case_volume_decrease",
          `Case volume decreased: ${previous} → ${recent} (30-day comparison)`,
          `New case volume dropped by ${Math.round((1 - recent / previous) * 100)}% compared to the previous 30-day period.`,
          refId,
        );
        if (attached) evidenceAttached++;
      }
    }
  } catch (e) {
    logger.warn("jobs/remediation-evidence-sweep", "Case volume check failed (non-fatal)", e);
  }

  return {
    success: true,
    activeRemediations: activeRemediations.length,
    evidenceAttached,
    message: `Swept ${activeRemediations.length} active remediations, attached ${evidenceAttached} evidence items`,
  };
}
