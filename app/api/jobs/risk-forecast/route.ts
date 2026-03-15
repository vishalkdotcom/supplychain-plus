import { NextResponse } from "next/server";
import { generateText, Output } from "ai";
import { getOllamaModel, OLLAMA_NO_THINK } from "@/lib/ai/provider";
import { db } from "@/lib/db/drizzle";
import {
  supplierRiskScores,
  supplierRiskHistory,
  supplierRiskForecast,
} from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { logger } from "@/lib/logger";

export const maxDuration = 300;

const forecastSchema = z.object({
  predictedRiskScore: z
    .number()
    .describe("Predicted risk score 60 days from now (0-100)"),
  predictedCaseScore: z.number(),
  predictedSurveyScore: z.number(),
  predictedTrainingScore: z.number(),
  confidence: z
    .number()
    .describe("Confidence in prediction (0-1)"),
  trendDirection: z.enum(["rising", "falling", "stable"]),
  reasoning: z.string().describe("Brief explanation of the prediction"),
});

/**
 * Batch job: Predict supplier risk scores 60 days out.
 * Uses historical risk snapshots + AI interpretation.
 * Run daily after calculate-risk job.
 *
 * POST /api/jobs/risk-forecast
 */
export async function POST() {
  try {
    const model = getOllamaModel("qwen3.5:4b");

    // Get all current suppliers
    const suppliers = await db
      .select()
      .from(supplierRiskScores)
      .orderBy(desc(supplierRiskScores.riskScore));

    if (suppliers.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No suppliers to forecast",
      });
    }

    const forecastDate = new Date();
    forecastDate.setDate(forecastDate.getDate() + 60);
    const forecastDateStr = forecastDate.toISOString().split("T")[0];

    let processed = 0;

    for (const supplier of suppliers) {
      // Get historical snapshots (up to 180 days)
      const history = await db
        .select()
        .from(supplierRiskHistory)
        .where(eq(supplierRiskHistory.supplierId, supplier.supplierId))
        .orderBy(desc(supplierRiskHistory.snapshotDate))
        .limit(180);

      if (history.length < 3) {
        // Not enough data to forecast
        continue;
      }

      // Calculate rate of change for each component
      const recent = history.slice(0, 30);
      const older = history.slice(Math.max(0, history.length - 30));

      const avgRecent = {
        risk: avg(recent.map((h) => h.riskScore)),
        cases: avg(recent.map((h) => h.caseScore ?? 0)),
        surveys: avg(recent.map((h) => h.surveyScore ?? 0)),
        training: avg(recent.map((h) => h.trainingScore ?? 0)),
      };

      const avgOlder = {
        risk: avg(older.map((h) => h.riskScore)),
        cases: avg(older.map((h) => h.caseScore ?? 0)),
        surveys: avg(older.map((h) => h.surveyScore ?? 0)),
        training: avg(older.map((h) => h.trainingScore ?? 0)),
      };

      try {
        const result = await generateText({
          model,
          providerOptions: OLLAMA_NO_THINK,
          system:
            "You are an expert supply chain risk analyst. Given historical risk score trends, predict the risk score 60 days from now. Be precise and data-driven.",
          prompt: `Predict risk scores for supplier "${supplier.supplierName}" 60 days from now.

Current scores:
- Overall Risk: ${supplier.riskScore}/100
- Cases: ${supplier.caseScore}/100
- Surveys: ${supplier.surveyScore}/100
- Training: ${supplier.trainingScore}/100
- Engagement: ${supplier.engagementScore}/100

30-day average vs historical average:
- Risk: ${avgRecent.risk.toFixed(1)} → was ${avgOlder.risk.toFixed(1)} (${avgRecent.risk > avgOlder.risk ? "worsening" : "improving"})
- Cases: ${avgRecent.cases.toFixed(1)} → was ${avgOlder.cases.toFixed(1)}
- Surveys: ${avgRecent.surveys.toFixed(1)} → was ${avgOlder.surveys.toFixed(1)}
- Training: ${avgRecent.training.toFixed(1)} → was ${avgOlder.training.toFixed(1)}

Data points available: ${history.length} days of history`,
          output: Output.object({ schema: forecastSchema }),
        });

        if (result.output) {
          await db
            .insert(supplierRiskForecast)
            .values({
              supplierId: supplier.supplierId,
              forecastDate: forecastDateStr,
              predictedRiskScore: result.output.predictedRiskScore,
              predictedCaseScore: result.output.predictedCaseScore,
              predictedSurveyScore: result.output.predictedSurveyScore,
              predictedTrainingScore: result.output.predictedTrainingScore,
              confidence: result.output.confidence,
              trendDirection: result.output.trendDirection,
              aiReasoning: result.output.reasoning,
            })
            .onConflictDoUpdate({
              target: [
                supplierRiskForecast.supplierId,
                supplierRiskForecast.forecastDate,
              ],
              set: {
                predictedRiskScore: result.output.predictedRiskScore,
                predictedCaseScore: result.output.predictedCaseScore,
                predictedSurveyScore: result.output.predictedSurveyScore,
                predictedTrainingScore: result.output.predictedTrainingScore,
                confidence: result.output.confidence,
                trendDirection: result.output.trendDirection,
                aiReasoning: result.output.reasoning,
                generatedAt: new Date(),
              },
            });

          processed++;
        }
      } catch (e) {
        logger.error("jobs/risk-forecast", `Forecast failed for supplier ${supplier.supplierId}`, e);
      }
    }

    return NextResponse.json({
      success: true,
      suppliersForecasted: processed,
      totalSuppliers: suppliers.length,
      forecastDate: forecastDateStr,
    });
  } catch (error) {
    logger.error("jobs/risk-forecast", "Risk forecasting failed", error);
    return NextResponse.json(
      { error: "Risk forecasting failed" },
      { status: 500 },
    );
  }
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}
