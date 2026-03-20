import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { caseClusters } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { ClusterTrendPoint } from "@/types";

export async function GET() {
  try {
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

    // Pivot flat rows into ClusterTrendPoint[] (one object per month)
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
