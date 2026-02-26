import { NextResponse } from "next/server";
import { generateText, Output } from "ai";
import { model } from "@/lib/ai/provider";
import { db } from "@/lib/db/drizzle";
import { surveyAnalysis } from "@/lib/db/schema";
import { query as pgQuery } from "@/lib/db/postgres";
import { eq } from "drizzle-orm";
import { z } from "zod";

const surveyAnalysisSchema = z.object({
  sentimentPositive: z.number(),
  sentimentNegative: z.number(),
  sentimentNeutral: z.number(),
  riskScore: z.number(),
  themes: z.array(
    z.object({
      name: z.string(),
      sentiment: z.enum(["positive", "negative", "neutral"]),
      mentionCount: z.number(),
    }),
  ),
  insight: z.string().describe("One-paragraph summary of key findings"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const targetSurveyId = body?.surveyId as number | undefined;

    // Get surveys to analyze
    let surveyQuery = `
      SELECT s.id, s.name, q.description as question_text,
             r.response_text
      FROM survey_mdlsurvey s
      JOIN survey_mdlsurveyquestion q ON q.survey_id = s.id
      LEFT JOIN survey_mdlsurveyquestionresponses r ON r.question_id = q.id
    `;
    if (targetSurveyId) {
      surveyQuery += ` WHERE s.id = ${targetSurveyId}`;
    }
    surveyQuery += ` ORDER BY s.id, q.id LIMIT 500`;

    const result = await pgQuery(surveyQuery);

    // Group responses by survey
    const surveyResponses = new Map<
      number,
      { name: string; responses: string[] }
    >();
    for (const row of result.rows) {
      if (!surveyResponses.has(row.id)) {
        surveyResponses.set(row.id, { name: row.name, responses: [] });
      }
      if (row.response_text) {
        surveyResponses
          .get(row.id)!
          .responses.push(
            `Q: ${row.question_text || "Question"}\nA: ${row.response_text}`,
          );
      }
    }

    let processedCount = 0;

    for (const [surveyId, data] of surveyResponses) {
      if (data.responses.length === 0) continue;

      const responseText = data.responses.slice(0, 50).join("\n---\n");

      const { output } = await generateText({
        model,
        prompt: `Analyze these factory worker survey responses and provide a structured analysis:

Survey: "${data.name}"
${responseText}`,
        output: Output.object({ schema: surveyAnalysisSchema }),
      });

      if (output) {
        await db
          .insert(surveyAnalysis)
          .values({
            surveyId,
            sentimentPositive: output.sentimentPositive,
            sentimentNegative: output.sentimentNegative,
            sentimentNeutral: output.sentimentNeutral,
            riskScore: output.riskScore,
            themes: output.themes,
            aiInsight: output.insight,
            responseCount: data.responses.length,
          })
          .onConflictDoUpdate({
            target: surveyAnalysis.surveyId,
            set: {
              sentimentPositive: output.sentimentPositive,
              sentimentNegative: output.sentimentNegative,
              sentimentNeutral: output.sentimentNeutral,
              riskScore: output.riskScore,
              themes: output.themes,
              aiInsight: output.insight,
              responseCount: data.responses.length,
              analyzedAt: new Date(),
            },
          });

        processedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      count: processedCount,
      message: `Analyzed ${processedCount} surveys`,
    });
  } catch (error) {
    console.error("Error analyzing surveys:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
