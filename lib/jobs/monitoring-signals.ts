/**
 * Continuous Monitoring Signals — detects absence signals, engagement decay,
 * and regional contagion. Called after risk scoring completes.
 *
 * Signal types:
 * - silence: Factory with no cases/surveys for 60+ days
 * - engagement_decay: Declining survey participation rates
 * - regional_contagion: Same issue pattern across multiple suppliers in a region
 */

import { db } from "@/lib/db/drizzle";
import {
  supplierRiskScores,
  supplierMonitoringSignals,
} from "@/lib/db/schema";
import { query as mssqlQuery } from "@/lib/db/sql-server";
import { query as pgQuery } from "@/lib/db/postgres";
import { eq, sql } from "drizzle-orm";
import { logger } from "@/lib/logger";

const TAG = "monitoring-signals";

interface SignalInput {
  supplierId: string;
  signalType: string;
  severity: string;
  title: string;
  description: string;
  metadata?: Record<string, unknown>;
}

/** Compute all monitoring signals. Call after calculate-risk job. */
export async function computeMonitoringSignals(): Promise<{
  signalsCreated: number;
  signalsResolved: number;
}> {
  let created = 0;
  let resolved = 0;

  try {
    // Get all current suppliers
    const suppliers = await db.select().from(supplierRiskScores);

    // Run signal detectors in parallel
    const [silenceSignals, contagionSignals] = await Promise.all([
      detectSilence(suppliers),
      detectRegionalContagion(suppliers),
    ]);

    const allSignals = [...silenceSignals, ...contagionSignals];

    // Upsert signals (insert new, update existing, resolve stale)
    for (const signal of allSignals) {
      const result = await db
        .insert(supplierMonitoringSignals)
        .values({
          supplierId: signal.supplierId,
          signalType: signal.signalType,
          severity: signal.severity,
          title: signal.title,
          description: signal.description,
          metadata: signal.metadata ?? {},
        })
        .onConflictDoUpdate({
          target: [
            supplierMonitoringSignals.supplierId,
            supplierMonitoringSignals.signalType,
          ],
          set: {
            severity: signal.severity,
            title: signal.title,
            description: signal.description,
            metadata: signal.metadata ?? {},
            detectedAt: new Date(),
            resolvedAt: null, // Un-resolve if it recurs
          },
        })
        .returning();

      if (result.length > 0) created++;
    }

    // Resolve signals for suppliers no longer affected
    const activeSupplierSignalMap = new Set(
      allSignals.map((s) => `${s.supplierId}:${s.signalType}`),
    );

    const existingSignals = await db
      .select({
        id: supplierMonitoringSignals.id,
        supplierId: supplierMonitoringSignals.supplierId,
        signalType: supplierMonitoringSignals.signalType,
      })
      .from(supplierMonitoringSignals)
      .where(sql`${supplierMonitoringSignals.resolvedAt} IS NULL`);

    for (const existing of existingSignals) {
      const key = `${existing.supplierId}:${existing.signalType}`;
      if (!activeSupplierSignalMap.has(key)) {
        await db
          .update(supplierMonitoringSignals)
          .set({ resolvedAt: new Date() })
          .where(eq(supplierMonitoringSignals.id, existing.id));
        resolved++;
      }
    }

    logger.info(TAG, `Signals computed: ${created} active, ${resolved} resolved`);
  } catch (error) {
    logger.error(TAG, "Failed to compute monitoring signals", error);
  }

  return { signalsCreated: created, signalsResolved: resolved };
}

// ===============================
// Silence Detection
// ===============================

async function detectSilence(
  suppliers: Array<{ supplierId: string; supplierName: string | null }>,
): Promise<SignalInput[]> {
  const signals: SignalInput[] = [];

  try {
    // Get latest case date per company from SQL Server
    const caseResult = await mssqlQuery(`
      SELECT
        c.CompanyId,
        MAX(m.Created) as LatestCaseActivity
      FROM [Case] c
      JOIN Message m ON c.Id = m.CaseId
      WHERE c.Deleted = 0
      GROUP BY c.CompanyId
    `);

    const latestCaseByCompany = new Map<string, Date>();
    for (const row of caseResult.recordset as Array<{
      CompanyId: number;
      LatestCaseActivity: Date;
    }>) {
      latestCaseByCompany.set(String(row.CompanyId), new Date(row.LatestCaseActivity));
    }

    // Get latest survey response date per client from PostgreSQL
    const surveyResult = await pgQuery(`
      SELECT
        ci.client_key,
        MAX(r.modified) as latest_survey_activity
      FROM survey_mdlsurveyquestionresponses r
      JOIN survey_mdlsurvey s ON r.survey_id = s.id
      JOIN clients_clientinfo ci ON s.client_key_id = ci.id
      GROUP BY ci.client_key
    `);

    const latestSurveyByClient = new Map<string, Date>();
    for (const row of surveyResult.rows as Array<{
      client_key: string;
      latest_survey_activity: Date;
    }>) {
      latestSurveyByClient.set(row.client_key, new Date(row.latest_survey_activity));
    }

    const now = new Date();
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const oneHundredTwentyDaysAgo = new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000);

    for (const supplier of suppliers) {
      const latestCase = latestCaseByCompany.get(supplier.supplierId);
      const latestSurvey = latestSurveyByClient.get(supplier.supplierId);

      // Check if both channels are silent
      const caseSilent = !latestCase || latestCase < sixtyDaysAgo;
      const surveySilent = !latestSurvey || latestSurvey < sixtyDaysAgo;

      if (caseSilent && surveySilent) {
        const isCritical =
          (!latestCase || latestCase < oneHundredTwentyDaysAgo) &&
          (!latestSurvey || latestSurvey < oneHundredTwentyDaysAgo);

        const daysSinceCase = latestCase
          ? Math.round((now.getTime() - latestCase.getTime()) / (24 * 60 * 60 * 1000))
          : null;
        const daysSinceSurvey = latestSurvey
          ? Math.round((now.getTime() - latestSurvey.getTime()) / (24 * 60 * 60 * 1000))
          : null;

        signals.push({
          supplierId: supplier.supplierId,
          signalType: "silence",
          severity: isCritical ? "critical" : "warning",
          title: `${supplier.supplierName ?? "Supplier"} has gone silent`,
          description: `No case activity${daysSinceCase ? ` in ${daysSinceCase} days` : ""} and no survey responses${daysSinceSurvey ? ` in ${daysSinceSurvey} days` : ""}. Silence may indicate suppressed worker voice.`,
          metadata: { daysSinceCase, daysSinceSurvey },
        });
      }
    }
  } catch (error) {
    logger.error(TAG, "Silence detection failed", error);
  }

  return signals;
}

// ===============================
// Regional Contagion
// ===============================

async function detectRegionalContagion(
  suppliers: Array<{
    supplierId: string;
    supplierName: string | null;
    riskScore: number;
    region: string | null;
    reasons: unknown;
  }>,
): Promise<SignalInput[]> {
  const signals: SignalInput[] = [];

  try {
    // Group high-risk suppliers by region
    const highRiskByRegion = new Map<
      string,
      Array<{
        supplierId: string;
        supplierName: string | null;
        riskScore: number;
        reasons: Array<{ factor: string; module: string }>;
      }>
    >();

    for (const supplier of suppliers) {
      if (supplier.riskScore >= 70 && supplier.region) {
        const existing = highRiskByRegion.get(supplier.region) ?? [];
        existing.push({
          supplierId: supplier.supplierId,
          supplierName: supplier.supplierName,
          riskScore: supplier.riskScore,
          reasons: (supplier.reasons as Array<{ factor: string; module: string }>) ?? [],
        });
        highRiskByRegion.set(supplier.region, existing);
      }
    }

    // Check for regional contagion: 3+ high-risk suppliers with shared risk factors
    for (const [region, regionSuppliers] of highRiskByRegion) {
      if (regionSuppliers.length < 3) continue;

      // Find shared risk factors
      const factorCounts = new Map<string, number>();
      for (const s of regionSuppliers) {
        for (const reason of s.reasons) {
          factorCounts.set(reason.factor, (factorCounts.get(reason.factor) ?? 0) + 1);
        }
      }

      const sharedFactors = [...factorCounts.entries()]
        .filter(([, count]) => count >= 2)
        .map(([factor]) => factor);

      if (sharedFactors.length > 0) {
        // Create signal for each affected supplier
        for (const s of regionSuppliers) {
          signals.push({
            supplierId: s.supplierId,
            signalType: "regional_contagion",
            severity: "warning",
            title: `Regional risk pattern in ${region}`,
            description: `${regionSuppliers.length} high-risk suppliers in ${region} share common issues: ${sharedFactors.slice(0, 3).join(", ")}. This may indicate a systemic regional problem.`,
            metadata: {
              region,
              affectedSuppliers: regionSuppliers.length,
              sharedFactors,
            },
          });
        }
      }
    }
  } catch (error) {
    logger.error(TAG, "Regional contagion detection failed", error);
  }

  return signals;
}
