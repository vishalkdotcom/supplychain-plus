import { db } from "@/lib/db/drizzle";
import {
  supplierRiskScores,
  caseClusters,
  intelligenceBriefing,
  payslipAnomalies,
  workerVoiceTrends,
  supplierRiskForecast,
  supplierMonitoringSignals,
} from "@/lib/db/schema";
import type { BriefingAttentionItem } from "@/lib/db/schema";
import { gte, eq, and, desc, isNull, lt, sql, count } from "drizzle-orm";
import { logger } from "@/lib/logger";
import type { JobResult } from "./types";

const TAG = "jobs/generate-briefing";

export async function generateBriefing(): Promise<JobResult> {
  logger.info(TAG, "Starting intelligence briefing generation");

  const attentionItems: BriefingAttentionItem[] = [];
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // 1. HIGH RISK suppliers (riskScore >= 70)
  const highRiskByRegion = await db
    .select({
      region: supplierRiskScores.region,
      count: sql<number>`count(*)::int`,
    })
    .from(supplierRiskScores)
    .where(gte(supplierRiskScores.riskScore, 70))
    .groupBy(supplierRiskScores.region);

  const totalHighRisk = highRiskByRegion.reduce((s, r) => s + r.count, 0);

  if (totalHighRisk > 0) {
    const regionBreakdown = highRiskByRegion
      .filter((r) => r.region)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map((r) => `${r.region} (${r.count})`)
      .join(", ");

    const topRegion = highRiskByRegion
      .filter((r) => r.region)
      .sort((a, b) => b.count - a.count)[0];

    attentionItems.push({
      severity: "critical",
      title: `${totalHighRisk} suppliers at high risk`,
      description: `Suppliers with risk scores of 70 or above require attention. Concentrated in ${regionBreakdown || "multiple regions"}.`,
      metric: `${totalHighRisk} suppliers`,
      region: topRegion?.region ?? undefined,
      supplierCount: totalHighRisk,
      query: `Show me the ${totalHighRisk} high-risk suppliers and their risk factors`,
    });
  }

  // 2. CASE CLUSTERS
  const recentClusters = await db
    .select()
    .from(caseClusters)
    .where(
      and(
        gte(caseClusters.detectedAt, thirtyDaysAgo),
        sql`${caseClusters.severity} IN ('critical', 'warning')`,
      ),
    )
    .orderBy(desc(caseClusters.detectedAt))
    .limit(5);

  if (recentClusters.length > 0) {
    const totalCases = recentClusters.reduce(
      (s, c) => s + (c.caseCount ?? 0),
      0,
    );
    const totalSuppliers = recentClusters.reduce(
      (s, c) => s + (c.supplierCount ?? 0),
      0,
    );
    const clusterLabels = recentClusters
      .filter((c) => c.clusterLabel)
      .slice(0, 2)
      .map((c) => c.clusterLabel)
      .join(", ");

    attentionItems.push({
      severity: "watch",
      title: `${recentClusters.length} emerging case patterns detected`,
      description: `${totalCases} related cases across ${totalSuppliers} suppliers show systemic patterns${clusterLabels ? `: ${clusterLabels}` : ""}.`,
      metric: `${totalCases} cases`,
      supplierCount: totalSuppliers,
      query: `What are the recent case cluster patterns and which suppliers are affected?`,
    });
  }

  // 3. POSITIVE TRENDS
  const improvingSuppliers = await db.execute<{
    supplier_id: string;
    risk_drop: number;
  }>(sql`
    WITH latest AS (
      SELECT supplier_id, risk_score
      FROM supplier_risk_history
      WHERE snapshot_date >= ${thirtyDaysAgo.toISOString().slice(0, 10)}
        AND snapshot_date = (
          SELECT MAX(snapshot_date)
          FROM supplier_risk_history h2
          WHERE h2.supplier_id = supplier_risk_history.supplier_id
        )
    ),
    earliest AS (
      SELECT supplier_id, risk_score
      FROM supplier_risk_history
      WHERE snapshot_date >= ${thirtyDaysAgo.toISOString().slice(0, 10)}
        AND snapshot_date = (
          SELECT MIN(snapshot_date)
          FROM supplier_risk_history h2
          WHERE h2.supplier_id = supplier_risk_history.supplier_id
            AND h2.snapshot_date >= ${thirtyDaysAgo.toISOString().slice(0, 10)}
        )
    )
    SELECT
      latest.supplier_id,
      (earliest.risk_score - latest.risk_score) AS risk_drop
    FROM latest
    JOIN earliest ON latest.supplier_id = earliest.supplier_id
    WHERE earliest.risk_score - latest.risk_score >= 5
  `);

  const improvingCount = improvingSuppliers.length;

  if (improvingCount > 0) {
    const avgDrop =
      improvingSuppliers.reduce((s, r) => s + Number(r.risk_drop), 0) /
      improvingCount;

    attentionItems.push({
      severity: "positive",
      title: `${improvingCount} suppliers showing improvement`,
      description: `Risk scores decreased by an average of ${Math.round(avgDrop)} points over the past 30 days.`,
      metric: `avg -${Math.round(avgDrop)} pts`,
      supplierCount: improvingCount,
      query: `Which suppliers have improved their risk scores recently and what changed?`,
    });
  }

  // 4. UNRESOLVED CRITICAL ANOMALIES
  const anomalyCounts = await db
    .select({
      severity: payslipAnomalies.severity,
      count: count(),
    })
    .from(payslipAnomalies)
    .where(eq(payslipAnomalies.isResolved, false))
    .groupBy(payslipAnomalies.severity);

  const criticalAnomalies =
    anomalyCounts.find((a) => a.severity === "critical")?.count ?? 0;
  const totalUnresolved = anomalyCounts.reduce((s, a) => s + a.count, 0);

  if (totalUnresolved > 0) {
    attentionItems.push({
      severity: criticalAnomalies > 0 ? "critical" : "watch",
      title: `${totalUnresolved} unresolved wage anomalies${criticalAnomalies > 0 ? ` (${criticalAnomalies} critical)` : ""}`,
      description: `Payslip anomalies including below-minimum wages, sudden pay drops, or deduction inconsistencies require investigation.`,
      metric: `${totalUnresolved} anomalies`,
      query: `Show me the unresolved payslip anomalies and which suppliers are affected`,
    });
  }

  // 5. NEGATIVE VOICE SENTIMENT SHIFT
  const globalVoice = await db
    .select()
    .from(workerVoiceTrends)
    .where(isNull(workerVoiceTrends.supplierId))
    .orderBy(desc(workerVoiceTrends.month))
    .limit(1);

  const latestVoice = globalVoice[0];
  if (latestVoice && latestVoice.sentimentShift != null && latestVoice.sentimentShift < -5) {
    const topNegativeTopic = (
      latestVoice.emergingTopics as Array<{ name: string; sentiment: string }> | null
    )?.find((t) => t.sentiment === "negative");

    attentionItems.push({
      severity: latestVoice.sentimentShift < -15 ? "critical" : "watch",
      title: `Worker sentiment declining (${latestVoice.sentimentShift.toFixed(0)} shift)`,
      description: `Global worker voice sentiment has shifted negatively${topNegativeTopic ? `. Top concern: "${topNegativeTopic.name}"` : ""}.`,
      metric: `${latestVoice.sentimentShift.toFixed(0)} shift`,
      query: `What are the emerging negative topics in worker voice feedback?`,
    });
  }

  // 6. RISING FORECAST WARNINGS (crossing risk threshold)
  const risingForecasts = await db
    .select({
      supplierId: supplierRiskForecast.supplierId,
      predictedRiskScore: supplierRiskForecast.predictedRiskScore,
      currentRiskScore: supplierRiskScores.riskScore,
      supplierName: supplierRiskScores.supplierName,
    })
    .from(supplierRiskForecast)
    .innerJoin(
      supplierRiskScores,
      eq(supplierRiskForecast.supplierId, supplierRiskScores.supplierId),
    )
    .where(
      and(
        lt(supplierRiskScores.riskScore, 70),
        gte(supplierRiskForecast.predictedRiskScore, 70),
        eq(supplierRiskForecast.trendDirection, "rising"),
      ),
    )
    .orderBy(desc(supplierRiskForecast.predictedRiskScore))
    .limit(10);

  if (risingForecasts.length > 0) {
    const topSupplier = risingForecasts[0];
    attentionItems.push({
      severity: "watch",
      title: `${risingForecasts.length} supplier${risingForecasts.length > 1 ? "s" : ""} predicted to cross high-risk threshold`,
      description: `Risk forecasts predict ${risingForecasts.length} currently-safe supplier${risingForecasts.length > 1 ? "s" : ""} will exceed risk score 70 within 60 days${topSupplier.supplierName ? `. Highest: ${topSupplier.supplierName} (${topSupplier.currentRiskScore} → ${topSupplier.predictedRiskScore})` : ""}.`,
      metric: `${risingForecasts.length} suppliers`,
      supplierCount: risingForecasts.length,
      query: `Which suppliers are predicted to become high-risk in the next 60 days?`,
    });
  }

  // 7. MONITORING SIGNALS (silence, engagement decay, contagion)
  const activeSignals = await db
    .select({
      signalType: supplierMonitoringSignals.signalType,
      severity: supplierMonitoringSignals.severity,
      count: count(),
    })
    .from(supplierMonitoringSignals)
    .where(sql`${supplierMonitoringSignals.resolvedAt} IS NULL`)
    .groupBy(
      supplierMonitoringSignals.signalType,
      supplierMonitoringSignals.severity,
    );

  const silenceCount = activeSignals
    .filter((s) => s.signalType === "silence")
    .reduce((sum, s) => sum + s.count, 0);

  const contagionCount = activeSignals
    .filter((s) => s.signalType === "regional_contagion")
    .reduce((sum, s) => sum + s.count, 0);

  if (silenceCount > 0) {
    const criticalSilence = activeSignals.find(
      (s) => s.signalType === "silence" && s.severity === "critical",
    );
    attentionItems.push({
      severity: criticalSilence ? "critical" : "watch",
      title: `${silenceCount} supplier${silenceCount > 1 ? "s" : ""} have gone silent`,
      description: `No case or survey activity detected for 60+ days. Silence may indicate suppressed worker voice or disengaged grievance channels.`,
      metric: `${silenceCount} silent`,
      supplierCount: silenceCount,
      query: `Which suppliers have gone silent and need engagement outreach?`,
    });
  }

  if (contagionCount > 0) {
    attentionItems.push({
      severity: "watch",
      title: `Regional risk contagion detected`,
      description: `${contagionCount} supplier${contagionCount > 1 ? "s" : ""} in the same region${contagionCount > 1 ? "s" : ""} share common risk factors, suggesting systemic regional issues.`,
      metric: `${contagionCount} affected`,
      supplierCount: contagionCount,
      query: `Show me the regional contagion patterns and affected suppliers`,
    });
  }

  // Store the briefing
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const [briefing] = await db
    .insert(intelligenceBriefing)
    .values({
      attentionItems,
      generatedAt: now,
      expiresAt,
    })
    .returning();

  logger.info(TAG, `Briefing generated with ${attentionItems.length} items`, {
    briefingId: briefing.id,
    itemCount: attentionItems.length,
  });

  return {
    success: true,
    briefing,
  };
}
