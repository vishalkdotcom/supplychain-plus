import { NextResponse } from "next/server";
import { generateText } from "ai";
import { getModelFromRequest } from "@/lib/ai/provider";
import { db } from "@/lib/db/drizzle";
import { surveyAnalysis } from "@/lib/db/schema";
import { query as pgQuery } from "@/lib/db/postgres";

import { z } from "zod";
import { logger } from "@/lib/logger";
import { withJobTracking } from "@/lib/jobs/with-job-tracking";

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

async function _postHandler(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const targetSurveyId = body?.surveyId as string | undefined;

    // Get surveys to analyze
    let surveyQuery = `
      SELECT s.id, s.name, q.title as question_text,
             r.text_response as response_text,
             opt.label as option_label
      FROM survey_mdlsurvey s
      JOIN survey_mdlsurvey_questions sq ON sq.mdlsurvey_id = s.id
      JOIN survey_mdlsurveyquestions q ON q.id = sq.mdlsurveyquestions_id
      LEFT JOIN survey_mdlsurveyquestionresponses r ON r.survey_question_id = q.id AND r.survey_id = s.id
      LEFT JOIN survey_mdlsurveyquestionoptions opt ON opt.id = r.question_option_id
    `;
    const params: unknown[] = [];
    if (targetSurveyId) {
      params.push(targetSurveyId);
      surveyQuery += ` WHERE s.id = $${params.length}`;
    }
    surveyQuery += ` ORDER BY s.id, q.id LIMIT 500`;

    const result = await pgQuery(surveyQuery, params);

    // Group responses by survey
    const surveyResponses = new Map<
      string,
      { name: string; responses: string[] }
    >();
    for (const row of result.rows) {
      if (!surveyResponses.has(row.id)) {
        surveyResponses.set(row.id, { name: row.name, responses: [] });
      }
      // Use text_response if available, otherwise fall back to option label
      const answerText = row.response_text?.trim() || row.option_label || null;
      if (answerText) {
        surveyResponses
          .get(row.id)!
          .responses.push(
            `Q: ${row.question_text || "Question"}\nA: ${answerText}`,
          );
      }
    }

    let processedCount = 0;

    for (const [surveyId, data] of surveyResponses) {
      if (data.responses.length === 0) continue;

      const responseText = data.responses.slice(0, 50).join("\n---\n");

      const activeModel = getModelFromRequest(request);

      const { text } = await generateText({
        model: activeModel,
        prompt: `Analyze these factory worker survey responses and provide a structured analysis.
Return ONLY valid JSON with exactly this shape (no markdown, no explanation):
{
  "sentimentPositive": <number 0-100>,
  "sentimentNegative": <number 0-100>,
  "sentimentNeutral": <number 0-100>,
  "riskScore": <number 0-100>,
  "themes": [{"name": "<string>", "sentiment": "positive"|"negative"|"neutral", "mentionCount": <number>}],
  "insight": "<one-paragraph summary of key findings>"
}

Survey: "${data.name}"
${responseText}`,
      });

      // Parse JSON from model response (strip markdown fences if present)
      const jsonStr = text
        .replace(/```(?:json)?\s*/g, "")
        .replace(/```/g, "")
        .trim();
      const parsed = surveyAnalysisSchema.safeParse(JSON.parse(jsonStr));

      if (parsed.success) {
        const output = parsed.data;
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
      } else {
        logger.warn("jobs/analyze-surveys", `Schema validation failed for survey ${surveyId}`, parsed.error.issues);
      }
    }

    return NextResponse.json({
      success: true,
      count: processedCount,
      message: `Analyzed ${processedCount} surveys`,
    });
  } catch (error) {
    logger.error("jobs/analyze-surveys", "Survey analysis failed", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export const POST = withJobTracking("analyze-surveys", _postHandler);
