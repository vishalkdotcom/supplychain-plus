import { db } from "@/lib/db/drizzle";
import {
  supplierRiskScores,
  supplierMonitoringSignals,
  caseClusters,
  regionalBenchmarks,
} from "@/lib/db/schema";
import type {
  RegionalIssuePrevalence,
  PeerComparison,
  ContextualSilenceAlert,
  RegionalClusterOverlap,
} from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { logger } from "@/lib/logger";
import type { JobResult } from "./types";

const TAG = "jobs/regional-benchmarking";

export async function regionalBenchmarking(): Promise<JobResult> {
  logger.info(TAG, "Starting regional benchmarking computation");

  // 1. Load all suppliers with their risk scores
  const suppliers = await db.select().from(supplierRiskScores);

  if (suppliers.length === 0) {
    logger.warn(TAG, "No suppliers found — skipping");
    return { success: true, regionsComputed: 0 };
  }

  // 2. Group suppliers by region
  const byRegion = new Map<
    string,
    typeof suppliers
  >();

  for (const s of suppliers) {
    const region = s.region || "Unknown";
    const group = byRegion.get(region) ?? [];
    group.push(s);
    byRegion.set(region, group);
  }

  // 3. Load active silence signals
  const silenceSignals = await db
    .select()
    .from(supplierMonitoringSignals)
    .where(
      sql`${supplierMonitoringSignals.signalType} = 'silence' AND ${supplierMonitoringSignals.resolvedAt} IS NULL`,
    );

  const silenceBySupplier = new Map(
    silenceSignals.map((s) => [s.supplierId, s]),
  );

  // 4. Load recent case clusters
  const clusters = await db.select().from(caseClusters);

  // 5. Compute benchmarks per region
  let totalSilenceAlerts = 0;

  for (const [region, regionSuppliers] of byRegion) {
    const supplierCount = regionSuppliers.length;
    const supplierIdSet = new Set(regionSuppliers.map((s) => s.supplierId));

    // -- Averages --
    const avg = (field: "riskScore" | "caseScore" | "surveyScore" | "trainingScore" | "engagementScore") =>
      regionSuppliers.reduce((sum, s) => sum + (s[field] ?? 0), 0) / supplierCount;

    const avgRiskScore = avg("riskScore");
    const avgCaseScore = avg("caseScore");
    const avgSurveyScore = avg("surveyScore");
    const avgTrainingScore = avg("trainingScore");
    const avgEngagementScore = avg("engagementScore");

    // -- High-risk count --
    const highRiskCount = regionSuppliers.filter(
      (s) => s.riskScore >= 70,
    ).length;

    // -- Peer comparisons --
    const peerComparisons: PeerComparison[] = regionSuppliers
      .map((s) => ({
        supplierId: s.supplierId,
        supplierName: s.supplierName ?? "Unknown",
        riskScore: s.riskScore,
        caseScore: s.caseScore ?? 0,
        surveyScore: s.surveyScore ?? 0,
        trainingScore: s.trainingScore ?? 0,
        engagementScore: s.engagementScore ?? 0,
        deviations: {
          risk: Math.round((s.riskScore - avgRiskScore) * 10) / 10,
          case: Math.round(((s.caseScore ?? 0) - avgCaseScore) * 10) / 10,
          survey: Math.round(((s.surveyScore ?? 0) - avgSurveyScore) * 10) / 10,
          training: Math.round(((s.trainingScore ?? 0) - avgTrainingScore) * 10) / 10,
          engagement: Math.round(((s.engagementScore ?? 0) - avgEngagementScore) * 10) / 10,
        },
      }))
      .sort((a, b) => b.deviations.risk - a.deviations.risk);

    // -- Issue prevalence from clusters --
    const issuePrevalence: RegionalIssuePrevalence[] = [];
    const issueMap = new Map<
      string,
      { count: number; supplierIds: Set<string>; severity: string }
    >();

    for (const cluster of clusters) {
      // Check if this cluster touches our region
      const clusterRegions = (cluster.regions as string[]) ?? [];
      const clusterSupplierIds = (cluster.supplierIds as string[]) ?? [];
      const touchesRegion =
        clusterRegions.includes(region) ||
        clusterSupplierIds.some((id) => supplierIdSet.has(id));

      if (!touchesRegion) continue;

      const caseTypes = (cluster.caseTypes as string[]) ?? [];
      for (const issueType of caseTypes) {
        const existing = issueMap.get(issueType) ?? {
          count: 0,
          supplierIds: new Set<string>(),
          severity: "info",
        };
        existing.count += cluster.caseCount ?? 0;
        for (const sid of clusterSupplierIds) {
          if (supplierIdSet.has(sid)) existing.supplierIds.add(sid);
        }
        // Escalate severity
        if (
          cluster.severity === "critical" ||
          existing.severity === "critical"
        ) {
          existing.severity = "critical";
        } else if (
          cluster.severity === "warning" ||
          existing.severity === "warning"
        ) {
          existing.severity = "warning";
        }
        issueMap.set(issueType, existing);
      }
    }

    for (const [issueType, data] of issueMap) {
      issuePrevalence.push({
        issueType,
        count: data.count,
        supplierIds: [...data.supplierIds],
        severity: data.severity as "critical" | "warning" | "info",
      });
    }

    issuePrevalence.sort((a, b) => b.count - a.count);

    // -- Contextual silence alerts --
    const contextualSilenceAlerts: ContextualSilenceAlert[] = [];
    const activePeerIssues = issuePrevalence
      .slice(0, 5)
      .map((i) => i.issueType);

    const activeNonSilentCount = regionSuppliers.filter(
      (s) => !silenceBySupplier.has(s.supplierId),
    ).length;

    for (const s of regionSuppliers) {
      const signal = silenceBySupplier.get(s.supplierId);
      if (!signal) continue;

      const metadata = signal.metadata as {
        daysSinceCase?: number;
        daysSinceSurvey?: number;
      } | null;
      const daysSilent = Math.max(
        metadata?.daysSinceCase ?? 0,
        metadata?.daysSinceSurvey ?? 0,
      );

      contextualSilenceAlerts.push({
        supplierId: s.supplierId,
        supplierName: s.supplierName ?? "Unknown",
        daysSilent,
        peerIssues: activePeerIssues,
        peerActiveCount: activeNonSilentCount,
        severity: daysSilent >= 120 ? "critical" : "warning",
      });
    }

    totalSilenceAlerts += contextualSilenceAlerts.length;

    // -- Cluster overlap --
    const clusterOverlap: RegionalClusterOverlap[] = clusters
      .filter((c) => {
        const cRegions = (c.regions as string[]) ?? [];
        const cSupplierIds = (c.supplierIds as string[]) ?? [];
        return (
          cRegions.includes(region) ||
          cSupplierIds.some((id) => supplierIdSet.has(id))
        );
      })
      .map((c) => ({
        clusterId: c.id,
        clusterLabel: c.clusterLabel ?? "Unlabeled",
        severity: c.severity ?? "info",
        supplierCount: c.supplierCount ?? 0,
        caseCount: c.caseCount ?? 0,
      }))
      .sort((a, b) => b.caseCount - a.caseCount);

    // -- Silent count --
    const silentCount = contextualSilenceAlerts.length;

    // 6. Upsert into regionalBenchmarks
    await db
      .insert(regionalBenchmarks)
      .values({
        region,
        supplierCount,
        avgRiskScore: Math.round(avgRiskScore * 10) / 10,
        avgCaseScore: Math.round(avgCaseScore * 10) / 10,
        avgSurveyScore: Math.round(avgSurveyScore * 10) / 10,
        avgTrainingScore: Math.round(avgTrainingScore * 10) / 10,
        avgEngagementScore: Math.round(avgEngagementScore * 10) / 10,
        highRiskCount,
        silentCount,
        issuePrevalence,
        peerComparisons,
        contextualSilenceAlerts,
        clusterOverlap,
      })
      .onConflictDoUpdate({
        target: regionalBenchmarks.region,
        set: {
          supplierCount,
          avgRiskScore: Math.round(avgRiskScore * 10) / 10,
          avgCaseScore: Math.round(avgCaseScore * 10) / 10,
          avgSurveyScore: Math.round(avgSurveyScore * 10) / 10,
          avgTrainingScore: Math.round(avgTrainingScore * 10) / 10,
          avgEngagementScore: Math.round(avgEngagementScore * 10) / 10,
          highRiskCount,
          silentCount,
          issuePrevalence,
          peerComparisons,
          contextualSilenceAlerts,
          clusterOverlap,
          computedAt: new Date(),
        },
      });

    logger.info(TAG, `Region "${region}": ${supplierCount} suppliers, ${highRiskCount} high-risk, ${silentCount} silent, ${issuePrevalence.length} issue types, ${clusterOverlap.length} clusters`);
  }

  const regionsComputed = byRegion.size;
  logger.info(TAG, `Regional benchmarking complete: ${regionsComputed} regions, ${totalSilenceAlerts} contextual silence alerts`);

  return {
    success: true,
    regionsComputed,
    totalSuppliers: suppliers.length,
    silenceAlertsWithContext: totalSilenceAlerts,
  };
}
