import { getJobModel, generateTextWithFallback } from "@/lib/ai/provider";
import { db } from "@/lib/db/drizzle";
import {
  supplierRiskScores,
  supplierRiskHistory,
  supplierRiskForecast,
} from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { logger } from "@/lib/logger";
import type { JobResult } from "./types";

// ===============================
// Statistical Forecasting Utilities
// ===============================

interface RegressionResult {
  slope: number;
  intercept: number;
  rSquared: number;
}

/** Ordinary least-squares linear regression */
function linearRegression(
  points: Array<{ x: number; y: number }>,
): RegressionResult {
  const n = points.length;
  if (n < 2) return { slope: 0, intercept: points[0]?.y ?? 0, rSquared: 0 };

  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumXX = 0;
  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumXX += p.x * p.x;
  }

  const denom = n * sumXX - sumX * sumX;
  if (denom === 0) return { slope: 0, intercept: sumY / n, rSquared: 0 };

  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;

  // R² (coefficient of determination)
  const meanY = sumY / n;
  let ssRes = 0,
    ssTot = 0;
  for (const p of points) {
    const predicted = slope * p.x + intercept;
    ssRes += (p.y - predicted) ** 2;
    ssTot += (p.y - meanY) ** 2;
  }
  const rSquared = ssTot === 0 ? 0 : 1 - ssRes / ssTot;

  return { slope, intercept, rSquared };
}

interface ScorePrediction {
  predicted: number;
  confidence: number;
  trend: "rising" | "falling" | "stable";
}

/**
 * Predict a score using linear regression + mean-reversion damping.
 * - Extrapolates the trend forward by `daysForward` days
 * - Applies damping: 70% extrapolation + 30% historical average
 * - Clamps result to 0-100
 * - Confidence based on R² and data density
 */
function predictScore(
  values: number[],
  daysForward: number,
): ScorePrediction {
  const points = values.map((y, i) => ({ x: i, y }));
  const { slope, rSquared } = linearRegression(points);

  const lastValue = values[values.length - 1];
  const extrapolated = lastValue + slope * daysForward;

  // Mean-reversion damping: blend extrapolation with historical average
  const historicalAvg = values.reduce((a, b) => a + b, 0) / values.length;
  const dampened = extrapolated * 0.7 + historicalAvg * 0.3;

  const predicted = Math.round(Math.max(0, Math.min(100, dampened)));

  const dataDensityBonus = Math.min(values.length / 30, 1) * 0.3;
  const fitBonus = Math.max(0, rSquared) * 0.7;
  const confidence = Math.round((dataDensityBonus + fitBonus) * 100) / 100;

  const trend: "rising" | "falling" | "stable" =
    slope > 0.15 ? "rising" : slope < -0.15 ? "falling" : "stable";

  return { predicted, confidence, trend };
}

export async function riskForecast(): Promise<JobResult> {
  const model = getJobModel();

  const suppliers = await db
    .select()
    .from(supplierRiskScores)
    .orderBy(desc(supplierRiskScores.riskScore));

  if (suppliers.length === 0) {
    return { success: true, message: "No suppliers to forecast" };
  }

  const forecastDate = new Date();
  forecastDate.setDate(forecastDate.getDate() + 60);
  const forecastDateStr = forecastDate.toISOString().split("T")[0];

  let processed = 0;

  for (const supplier of suppliers) {
    const history = await db
      .select()
      .from(supplierRiskHistory)
      .where(eq(supplierRiskHistory.supplierId, supplier.supplierId))
      .orderBy(desc(supplierRiskHistory.snapshotDate))
      .limit(180);

    if (history.length < 3) continue;

    // Reverse to chronological order (oldest first) for regression
    const chronological = [...history].reverse();

    // Statistical predictions for each score dimension
    const riskPred = predictScore(
      chronological.map((h) => h.riskScore),
      60,
    );
    const casePred = predictScore(
      chronological.map((h) => h.caseScore ?? 0),
      60,
    );
    const surveyPred = predictScore(
      chronological.map((h) => h.surveyScore ?? 0),
      60,
    );
    const trainingPred = predictScore(
      chronological.map((h) => h.trainingScore ?? 0),
      60,
    );

    // Average confidence across dimensions
    const confidence =
      Math.round(
        ((riskPred.confidence +
          casePred.confidence +
          surveyPred.confidence +
          trainingPred.confidence) /
          4) *
          100,
      ) / 100;

    const trendDirection = riskPred.trend;

    // Generate narrative reasoning with LLM (text only, no structured output)
    let aiReasoning = `Risk score predicted to ${trendDirection === "rising" ? "increase" : trendDirection === "falling" ? "decrease" : "remain stable"} from ${supplier.riskScore} to ${riskPred.predicted} over 60 days (confidence: ${Math.round(confidence * 100)}%).`;

    try {
      const result = await generateTextWithFallback({
        model,
        maxRetries: 2,
        system:
          "You are an expert supply chain risk analyst. Explain a statistical risk forecast in 2-3 sentences. Be concise and actionable. Do not use markdown. /no_think",
        prompt: `Explain this forecast for supplier "${supplier.supplierName}":

Current scores → Predicted (60 days):
- Overall Risk: ${supplier.riskScore} → ${riskPred.predicted} (${trendDirection})
- Cases: ${supplier.caseScore} → ${casePred.predicted} (${casePred.trend})
- Surveys: ${supplier.surveyScore} → ${surveyPred.predicted} (${surveyPred.trend})
- Training: ${supplier.trainingScore} → ${trainingPred.predicted} (${trainingPred.trend})

Confidence: ${Math.round(confidence * 100)}% based on ${history.length} days of data.
Why might this trend continue or reverse?`,
      });

      if (result.text) {
        aiReasoning = result.text.trim();
      }
    } catch (e) {
      logger.warn(
        "jobs/risk-forecast",
        `LLM reasoning failed for ${supplier.supplierId}, using fallback`,
        e,
      );
    }

    try {
      await db
        .insert(supplierRiskForecast)
        .values({
          supplierId: supplier.supplierId,
          forecastDate: forecastDateStr,
          predictedRiskScore: riskPred.predicted,
          predictedCaseScore: casePred.predicted,
          predictedSurveyScore: surveyPred.predicted,
          predictedTrainingScore: trainingPred.predicted,
          confidence,
          trendDirection,
          aiReasoning,
        })
        .onConflictDoUpdate({
          target: [
            supplierRiskForecast.supplierId,
            supplierRiskForecast.forecastDate,
          ],
          set: {
            predictedRiskScore: riskPred.predicted,
            predictedCaseScore: casePred.predicted,
            predictedSurveyScore: surveyPred.predicted,
            predictedTrainingScore: trainingPred.predicted,
            confidence,
            trendDirection,
            aiReasoning,
            generatedAt: new Date(),
          },
        });

      processed++;
    } catch (e) {
      logger.error(
        "jobs/risk-forecast",
        `DB write failed for supplier ${supplier.supplierId}`,
        e,
      );
    }
  }

  return {
    success: true,
    suppliersForecasted: processed,
    totalSuppliers: suppliers.length,
    forecastDate: forecastDateStr,
  };
}
