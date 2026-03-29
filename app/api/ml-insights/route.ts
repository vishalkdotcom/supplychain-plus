import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import {
  caseClusters,
  payslipAnomalies,
  supplierRiskForecast,
  supplierRiskScores,
  workerVoiceTrends,
} from "@/lib/db/schema";
import { desc, eq, and, count, isNull, lte } from "drizzle-orm";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    // 1. Case clusters: count + top critical
    const [clusterCountResult, criticalClusters] = await Promise.all([
      db.select({ count: count() }).from(caseClusters),
      db
        .select()
        .from(caseClusters)
        .where(eq(caseClusters.severity, "critical"))
        .orderBy(desc(caseClusters.detectedAt))
        .limit(3),
    ]);

    // 2. Unresolved anomalies grouped by severity
    const anomalyCounts = await db
      .select({
        severity: payslipAnomalies.severity,
        count: count(),
      })
      .from(payslipAnomalies)
      .where(eq(payslipAnomalies.isResolved, false))
      .groupBy(payslipAnomalies.severity);

    const unresolvedAnomalies = { critical: 0, warning: 0, info: 0 };
    for (const row of anomalyCounts) {
      if (row.severity in unresolvedAnomalies) {
        unresolvedAnomalies[row.severity as keyof typeof unresolvedAnomalies] = row.count;
      }
    }

    // 3. Forecast suppliers — total count + rising (next 30 days)
    const totalForecastResult = await db
      .select({ count: count() })
      .from(supplierRiskForecast);
    const totalForecasts = totalForecastResult[0]?.count ?? 0;

    // Forecasts predict 60 days ahead, so look 90 days out to capture them
    const forecastHorizon = new Date();
    forecastHorizon.setDate(forecastHorizon.getDate() + 90);
    const risingForecasts = await db
      .select({
        supplierId: supplierRiskForecast.supplierId,
        predictedRiskScore: supplierRiskForecast.predictedRiskScore,
        trendDirection: supplierRiskForecast.trendDirection,
        supplierName: supplierRiskScores.supplierName,
        currentRiskScore: supplierRiskScores.riskScore,
      })
      .from(supplierRiskForecast)
      .innerJoin(
        supplierRiskScores,
        eq(supplierRiskForecast.supplierId, supplierRiskScores.supplierId),
      )
      .where(
        and(
          eq(supplierRiskForecast.trendDirection, "rising"),
          lte(supplierRiskForecast.forecastDate, forecastHorizon.toISOString().split("T")[0]),
        ),
      )
      .orderBy(desc(supplierRiskForecast.predictedRiskScore))
      .limit(10);

    // 4. Global voice trends (most recent month)
    const globalTrend = await db
      .select()
      .from(workerVoiceTrends)
      .where(isNull(workerVoiceTrends.supplierId))
      .orderBy(desc(workerVoiceTrends.month))
      .limit(1);

    const latestGlobal = globalTrend[0];

    return NextResponse.json({
      clusterCount: clusterCountResult[0]?.count ?? 0,
      criticalClusters,
      unresolvedAnomalies,
      totalForecasts,
      risingForecastSuppliers: risingForecasts.map((f) => ({
        supplierId: f.supplierId,
        supplierName: f.supplierName || "Unknown",
        predictedRiskScore: f.predictedRiskScore,
        currentRiskScore: f.currentRiskScore ?? 0,
        trendDirection: f.trendDirection || "rising",
      })),
      globalSentimentShift: latestGlobal?.sentimentShift ?? 0,
      topEmergingTopic:
        latestGlobal?.emergingTopics?.[0] ?? null,
    });
  } catch (error) {
    logger.error("api/ml-insights", "Failed to fetch ML insights", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
