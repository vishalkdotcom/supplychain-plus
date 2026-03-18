import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import {
  supplierRiskScores,
  supplierRiskHistory,
  caseClusters,
  intelligenceBriefing,
} from "@/lib/db/schema";
import type { BriefingAttentionItem } from "@/lib/db/schema";
import { gte, sql, and, desc } from "drizzle-orm";
import { logger } from "@/lib/logger";

const TAG = "jobs/generate-briefing";

export async function POST() {
  try {
    logger.info(TAG, "Starting intelligence briefing generation");

    const attentionItems: BriefingAttentionItem[] = [];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // -------------------------------------------------------
    // 1. HIGH RISK suppliers (riskScore >= 70)
    // -------------------------------------------------------
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

    // -------------------------------------------------------
    // 2. CASE CLUSTERS — recent critical/warning clusters
    // -------------------------------------------------------
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

    // -------------------------------------------------------
    // 3. POSITIVE TRENDS — risk decreasing over last 30 days
    // -------------------------------------------------------
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

    // -------------------------------------------------------
    // Store the briefing
    // -------------------------------------------------------
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

    return NextResponse.json({
      success: true,
      briefing,
    });
  } catch (error) {
    logger.error(TAG, "Failed to generate intelligence briefing", error);
    return NextResponse.json(
      { error: "Failed to generate briefing" },
      { status: 500 },
    );
  }
}
