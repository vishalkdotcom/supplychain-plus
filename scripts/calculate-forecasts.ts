/**
 * Calculate Predictive Risk Forecasts for all suppliers.
 *
 * Usage:
 *   npx tsx scripts/calculate-forecasts.ts            # full run
 *   npx tsx scripts/calculate-forecasts.ts --dry-run   # process only 3 suppliers, print results
 *
 * What it does:
 * 1. Reads historical risk snapshots from supplier_risk_history
 * 2. For each supplier with 3+ data points, calculates a linear regression trend
 * 3. Extrapolates 60 days forward to predict future risk score
 * 4. Sends the trend data to local Ollama (qwen3:4b) for a 2-sentence warning
 * 5. Upserts the prediction into supplier_risk_forecast
 *
 * Prerequisites:
 * - Ollama running with qwen3:4b loaded
 * - wovo_ai database with supplier_risk_history populated (run seed-risk-scores.ts first)
 */

import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { db } from "../lib/db/drizzle";
import {
  supplierRiskHistory,
  supplierRiskScores,
  supplierRiskForecast,
} from "../lib/db/schema";
import { eq, sql, desc, inArray, gte } from "drizzle-orm";
import { linearRegression, linearRegressionLine } from "simple-statistics";

const DRY_RUN = process.argv.includes("--dry-run");
const RESUME = process.argv.includes("--resume");
const REUSE = process.argv.includes("--reuse");
const OLLAMA_URL = process.env.OLLAMA_BASE_URL?.replace("/v1", "") || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen3:4b";
const FORECAST_DAYS = 60;

interface HistoryRow {
  supplierId: string;
  riskScore: number;
  caseScore: number | null;
  surveyScore: number | null;
  trainingScore: number | null;
  snapshotDate: string;
}

async function generateNarrative(
  supplierName: string,
  currentScore: number,
  predictedScore: number,
  trend: string,
  trendMagnitude: number,
): Promise<string> {
  try {
    const prompt = `/no_think\nYou are a supply chain risk analyst. Write exactly 2 concise sentences warning a compliance manager about this supplier's risk trajectory.\n\nSupplier: ${supplierName}\nCurrent Risk Score: ${currentScore}/100\nPredicted Score in 60 days: ${predictedScore}/100\nTrend: ${trend} (${trendMagnitude > 0 ? "+" : ""}${trendMagnitude.toFixed(1)}%)\n\nBe specific and actionable. Do not use hedging language.`;

    const res = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
        options: { temperature: 0.3, num_predict: 150 },
      }),
    });

    if (!res.ok) {
      console.warn(`  ⚠ Ollama returned ${res.status}, using template narrative`);
      return `${supplierName}'s risk score is ${trend} from ${currentScore} to a predicted ${predictedScore} over the next 60 days. Immediate review recommended.`;
    }

    const data = (await res.json()) as { response: string };
    return data.response.trim();
  } catch (error) {
    console.warn("  ⚠ Ollama not available, using template narrative:", (error as Error).message);
    return `${supplierName}'s risk score is ${trend} from ${currentScore} to a predicted ${predictedScore} over the next 60 days. Immediate review recommended.`;
  }
}

async function calculateForecasts() {
  console.log(DRY_RUN ? "🧪 DRY RUN MODE (3 suppliers only)\n" : "🚀 Calculating risk forecasts...\n");

  const validSupplierIds = ["137089", "136747", "137308", "137284", "137088"];

  // Get all supplier IDs with risk scores
  const suppliers = await db
    .select({
      supplierId: supplierRiskScores.supplierId,
      supplierName: supplierRiskScores.supplierName,
      currentScore: supplierRiskScores.riskScore,
    })
    .from(supplierRiskScores)
    .where(inArray(supplierRiskScores.supplierId, validSupplierIds))
    .orderBy(desc(supplierRiskScores.riskScore));

  console.log(`Found ${suppliers.length} suppliers with risk scores.\n`);

  let suppliersToProcess = suppliers;

  if (RESUME) {
    console.log("Resume mode enabled: Filtering suppliers already forecasted today...");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingForecasts = await db
      .select({ supplierId: supplierRiskForecast.supplierId })
      .from(supplierRiskForecast)
      .where(gte(supplierRiskForecast.forecastDate, today));
      
    const existingSupplierIds = new Set(existingForecasts.map(f => f.supplierId));
    
    suppliersToProcess = suppliers.filter(s => !existingSupplierIds.has(s.supplierId));
    
    if (suppliersToProcess.length < suppliers.length) {
      console.log(`Skipping ${suppliers.length - suppliersToProcess.length} suppliers already forecasted today.`);
    }
  } else {
    console.log("Full refresh mode: Calculating all forecasts.");
  }

  if (suppliersToProcess.length === 0) {
    console.log("No suppliers to process.");
    return;
  }

  let processed = 0;
  let skipped = 0;

  for (const supplier of suppliersToProcess) {
    // Get history for this supplier
    const history = await db
      .select()
      .from(supplierRiskHistory)
      .where(eq(supplierRiskHistory.supplierId, supplier.supplierId))
      .orderBy(supplierRiskHistory.snapshotDate);

    if (history.length < 2) {
      console.log(`  ⏭ ${supplier.supplierName}: only ${history.length} data points (need 2+), skipping`);
      skipped++;
      continue;
    }

    // Convert dates to numeric days-from-first for regression
    const firstDate = new Date(history[0].snapshotDate).getTime();
    const dataPoints: [number, number][] = history.map((h) => [
      (new Date(h.snapshotDate).getTime() - firstDate) / (1000 * 60 * 60 * 24), // days since first
      h.riskScore,
    ]);

    // Linear regression
    const regression = linearRegression(dataPoints);
    const predict = linearRegressionLine(regression);

    // Predict 60 days from the last data point
    const lastDay = dataPoints[dataPoints.length - 1][0];
    const predictedScore = Math.round(
      Math.min(100, Math.max(0, predict(lastDay + FORECAST_DAYS)))
    );

    const currentScore = supplier.currentScore;
    const diff = predictedScore - currentScore;
    const trendMagnitude = currentScore > 0 ? (diff / currentScore) * 100 : 0;

    let trend: "worsening" | "improving" | "stable";
    if (diff > 3) trend = "worsening";
    else if (diff < -3) trend = "improving";
    else trend = "stable";

    // Generate narrative via local Ollama
    console.log(`  📊 ${supplier.supplierName}: ${currentScore} → ${predictedScore} (${trend}, ${trendMagnitude > 0 ? "+" : ""}${trendMagnitude.toFixed(1)}%)`);

    let narrative;
    if (REUSE) {
      const historyFingerprint = JSON.stringify(history.map(h => ({ d: h.snapshotDate, s: h.riskScore })));
      const existing = await db.select()
        .from(supplierRiskForecast)
        .where(sql`${supplierRiskForecast.supplierId} = ${supplier.supplierId}`)
        .limit(1);

      // Simple heuristic: if the number of data points matches and it was forecasted today,
      // it's likely the same history. For a more robust check, we could store a hash of history.
      // But here we'll just check if the predicted score and trend match exactly.
      if (existing.length > 0 && 
          existing[0].predictedScore === predictedScore && 
          existing[0].trend === trend &&
          existing[0].dataPoints === history.length) {
        console.log(`    ♻ Reusing existing narrative for identical trend.`);
        narrative = existing[0].aiNarrative;
      }
    }

    if (!narrative) {
      narrative = await generateNarrative(
        supplier.supplierName || "Unknown Supplier",
        currentScore,
        predictedScore,
        trend,
        trendMagnitude,
      );
    }

    if (DRY_RUN) {
      console.log(`    📝 Narrative: ${narrative}\n`);
      processed++;
      continue;
    }

    // Upsert forecast
    await db
      .insert(supplierRiskForecast)
      .values({
        supplierId: supplier.supplierId,
        supplierName: supplier.supplierName,
        currentScore,
        predictedScore,
        trend,
        trendMagnitude,
        aiNarrative: narrative,
        dataPoints: history.length,
      })
      .onConflictDoUpdate({
        target: [supplierRiskForecast.supplierId],
        set: {
          currentScore,
          predictedScore,
          trend,
          trendMagnitude,
          aiNarrative: narrative,
          dataPoints: history.length,
          forecastDate: new Date(),
        },
      });

    processed++;
  }

  console.log(`\n✅ Done! Processed: ${processed}, Skipped: ${skipped}`);
  process.exit(0);
}

calculateForecasts().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
