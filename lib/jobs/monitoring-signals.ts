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
    const [silenceSignals, contagionSignals, decaySignals] = await Promise.all([
      detectSilence(suppliers),
      detectRegionalContagion(suppliers),
      detectEngagementDecay(suppliers),
    ]);

    const allSignals = [...silenceSignals, ...contagionSignals, ...decaySignals];

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
        MAX(r.created_date) as latest_survey_activity
      FROM survey_mdlsurveyquestionresponses r
      JOIN survey_mdlsurvey s ON r.survey_id = s.id
      JOIN clients_clientinfo ci ON s.client_id = ci.id
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

// ===============================
// Engagement Decay Detection
// ===============================

/**
 * Detects declining survey participation rates per supplier.
 * Compares the most recent month's response count against the trailing
 * 3-month average. Moderate thresholds:
 *   - Warning:  latest < 60% of trailing avg
 *   - Critical: latest < 40% of trailing avg OR 3+ consecutive declining months
 */
async function detectEngagementDecay(
  suppliers: Array<{ supplierId: string; supplierName: string | null }>,
): Promise<SignalInput[]> {
  const signals: SignalInput[] = [];

  try {
    // Get monthly response counts per supplier over the last 6 months
    // COUNT(DISTINCT survey_user_response_id) gives unique respondents, not individual answers
    const result = await pgQuery(`
      SELECT
        ci.client_key AS supplier_id,
        DATE_TRUNC('month', r.created_date) AS month,
        COUNT(DISTINCT r.survey_user_response_id) AS response_count
      FROM survey_mdlsurveyquestionresponses r
      JOIN survey_mdlsurvey s ON r.survey_id = s.id
      JOIN clients_clientinfo ci ON s.client_id = ci.id
      WHERE r.created_date >= NOW() - INTERVAL '6 months'
      GROUP BY ci.client_key, DATE_TRUNC('month', r.created_date)
      ORDER BY ci.client_key, month
    `);

    // Build monthly response map: supplierId → [{month, count}]
    const monthlyBySupplier = new Map<
      string,
      Array<{ month: Date; count: number }>
    >();
    for (const row of result.rows as Array<{
      supplier_id: string;
      month: Date;
      response_count: string;
    }>) {
      const existing = monthlyBySupplier.get(row.supplier_id) ?? [];
      existing.push({
        month: new Date(row.month),
        count: parseInt(row.response_count, 10),
      });
      monthlyBySupplier.set(row.supplier_id, existing);
    }

    const supplierMap = new Map(
      suppliers.map((s) => [s.supplierId, s.supplierName]),
    );

    for (const [supplierId, months] of monthlyBySupplier) {
      // Need at least 3 months of data to detect a trend
      if (months.length < 3) continue;

      // Sort chronologically
      months.sort((a, b) => a.month.getTime() - b.month.getTime());

      const latest = months[months.length - 1];
      // Trailing average excludes the latest month
      const trailing = months.slice(0, -1);
      const trailingAvg =
        trailing.reduce((sum, m) => sum + m.count, 0) / trailing.length;

      if (trailingAvg === 0) continue; // No baseline to compare against

      const ratio = latest.count / trailingAvg;

      // Check for consecutive decline (3+ months dropping)
      let consecutiveDeclines = 0;
      for (let i = 1; i < months.length; i++) {
        if (months[i].count < months[i - 1].count) {
          consecutiveDeclines++;
        } else {
          consecutiveDeclines = 0;
        }
      }

      const isCritical = ratio < 0.4 || consecutiveDeclines >= 3;
      const isWarning = ratio < 0.6;

      if (!isCritical && !isWarning) continue;

      const supplierName = supplierMap.get(supplierId) ?? "Supplier";
      const dropPct = Math.round((1 - ratio) * 100);

      signals.push({
        supplierId,
        signalType: "engagement_decay",
        severity: isCritical ? "critical" : "warning",
        title: `${supplierName} survey participation declining`,
        description: `Survey responses dropped ${dropPct}% compared to the trailing average (${latest.count} vs avg ${Math.round(trailingAvg)}).${consecutiveDeclines >= 3 ? ` Participation has declined for ${consecutiveDeclines} consecutive months.` : ""} This may indicate survey fatigue or suppressed access.`,
        metadata: {
          latestCount: latest.count,
          trailingAvg: Math.round(trailingAvg),
          dropPercent: dropPct,
          consecutiveDeclines,
          monthlyTrend: months.map((m) => ({
            month: m.month.toISOString().slice(0, 7),
            count: m.count,
          })),
        },
      });
    }
  } catch (error) {
    logger.error(TAG, "Engagement decay detection failed", error);
  }

  return signals;
}
