import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { caseClusters, clusterSnapshots } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { ClusterTrendPoint } from "@/types";

export async function GET() {
  try {
    // Primary: query from cluster_snapshots (historical trend data)
    const snapshotRows = await db.execute<{
      month: string;
      critical: string;
      warning: string;
      info: string;
      total: string;
    }>(sql`
      SELECT
        to_char(${clusterSnapshots.snapshotDate}, 'YYYY-MM') as month,
        SUM(${clusterSnapshots.critical})::text as critical,
        SUM(${clusterSnapshots.warning})::text as warning,
        SUM(${clusterSnapshots.info})::text as info,
        SUM(${clusterSnapshots.totalClusters})::text as total
      FROM ${clusterSnapshots}
      GROUP BY month
      ORDER BY month ASC
    `);

    if (snapshotRows.length > 0) {
      const points: ClusterTrendPoint[] = snapshotRows.map((row) => ({
        month: row.month,
        total: parseInt(row.total),
        critical: parseInt(row.critical),
        warning: parseInt(row.warning),
        info: parseInt(row.info),
      }));
      return NextResponse.json(points);
    }

    // Fallback: if no snapshots yet, use current case_clusters.detectedAt
    const rows = await db.execute<{
      month: string;
      severity: string;
      count: string;
    }>(sql`
      SELECT
        to_char(date_trunc('month', ${caseClusters.detectedAt}), 'YYYY-MM') as month,
        ${caseClusters.severity} as severity,
        count(*)::text as count
      FROM ${caseClusters}
      GROUP BY month, severity
      ORDER BY month ASC
    `);

    const monthMap = new Map<string, ClusterTrendPoint>();

    for (const row of rows) {
      if (!monthMap.has(row.month)) {
        monthMap.set(row.month, {
          month: row.month,
          total: 0,
          critical: 0,
          warning: 0,
          info: 0,
        });
      }
      const point = monthMap.get(row.month)!;
      const count = parseInt(row.count);
      point.total += count;
      if (row.severity === "critical") point.critical = count;
      else if (row.severity === "warning") point.warning = count;
      else if (row.severity === "info") point.info = count;
    }

    return NextResponse.json(Array.from(monthMap.values()));
  } catch (error) {
    logger.error("api/clusters/trends", "Failed to fetch cluster trends", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
