import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { payslipAnomalies } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { AnomalyTrendPoint } from "@/types";

export async function GET() {
  try {
    const rows = await db.execute<{
      month: string;
      anomaly_type: string;
      count: string;
    }>(sql`
      SELECT
        to_char(date_trunc('month', ${payslipAnomalies.detectedAt}), 'YYYY-MM') as month,
        ${payslipAnomalies.anomalyType} as anomaly_type,
        count(*)::text as count
      FROM ${payslipAnomalies}
      GROUP BY month, anomaly_type
      ORDER BY month ASC
    `);

    // Pivot flat rows into AnomalyTrendPoint[]
    const monthMap = new Map<string, AnomalyTrendPoint>();

    for (const row of rows) {
      if (!monthMap.has(row.month)) {
        monthMap.set(row.month, {
          month: row.month,
          total: 0,
          belowMinimum: 0,
          suddenDrop: 0,
          inconsistency: 0,
        });
      }
      const point = monthMap.get(row.month)!;
      const count = parseInt(row.count);
      point.total += count;
      if (row.anomaly_type === "below_minimum") point.belowMinimum = count;
      else if (row.anomaly_type === "sudden_drop") point.suddenDrop = count;
      else if (row.anomaly_type === "inconsistency") point.inconsistency = count;
    }

    return NextResponse.json(Array.from(monthMap.values()));
  } catch (error) {
    logger.error("api/payslip-anomalies/trends", "Failed to fetch anomaly trends", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
