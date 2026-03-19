import { generateText } from "ai";
import { getJobModel } from "@/lib/ai/provider";
import { stripThinkingTags } from "@/lib/ai/utils";
import { db } from "@/lib/db/drizzle";
import { surveyAnalysis, surveyTemporalPatterns, type SurveyTheme } from "@/lib/db/schema";
import { query as pgQuery } from "@/lib/db/postgres";
import { z } from "zod";
import { logger } from "@/lib/logger";
import type { JobResult, JobParams } from "./types";

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

export async function analyzeSurveys(params?: JobParams): Promise<JobResult> {
  const targetSurveyId = params?.surveyId as string | undefined;

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
  const queryParams: unknown[] = [];
  if (targetSurveyId) {
    queryParams.push(targetSurveyId);
    surveyQuery += ` WHERE s.id = $${queryParams.length}`;
  }
  surveyQuery += ` ORDER BY s.id, q.id LIMIT 500`;

  const result = await pgQuery(surveyQuery, queryParams);

  // Group responses by survey
  const surveyResponses = new Map<
    string,
    { name: string; responses: string[] }
  >();
  for (const row of result.rows) {
    if (!surveyResponses.has(row.id)) {
      surveyResponses.set(row.id, { name: row.name, responses: [] });
    }
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

  const model = getJobModel();

  for (const [surveyId, data] of surveyResponses) {
    if (data.responses.length === 0) continue;

    const responseText = data.responses.slice(0, 50).join("\n---\n");

    const { text } = await generateText({
      model,
      prompt: `Analyze these factory worker survey responses and provide a structured analysis. /no_think
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

    const jsonStr = stripThinkingTags(text)
      .replace(/```(?:json)?\s*/g, "")
      .replace(/```/g, "")
      .trim();

    let jsonObj: unknown;
    try {
      jsonObj = JSON.parse(jsonStr);
    } catch {
      logger.warn("jobs/analyze-surveys", `LLM returned non-JSON for survey ${surveyId}, skipping`, { text: text.slice(0, 200) });
      continue;
    }

    const parsed = surveyAnalysisSchema.safeParse(jsonObj);

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

  // -------------------------------------------------------
  // Cross-survey temporal analysis: detect theme trends
  // -------------------------------------------------------
  let temporalPatternsCount = 0;
  try {
    const allAnalyses = await db
      .select()
      .from(surveyAnalysis);

    // Aggregate themes across all surveys
    const themeMap = new Map<
      string,
      { mentions: number; months: Set<string>; suppliers: Set<string> }
    >();

    for (const analysis of allAnalyses) {
      const themes = analysis.themes as SurveyTheme[] | null;
      if (!themes) continue;

      const month = new Date(analysis.analyzedAt).toISOString().slice(0, 7);

      for (const theme of themes) {
        const existing = themeMap.get(theme.name) ?? {
          mentions: 0,
          months: new Set(),
          suppliers: new Set(),
        };
        existing.mentions += theme.mentionCount;
        existing.months.add(month);
        existing.suppliers.add(analysis.surveyId);
        themeMap.set(theme.name, existing);
      }
    }

    for (const [themeName, data] of themeMap) {
      if (data.mentions < 3) continue;

      const sortedMonths = [...data.months].sort();
      const mentionsByMonth: Record<string, number> = {};
      for (const m of sortedMonths) {
        mentionsByMonth[m] = (mentionsByMonth[m] ?? 0) + 1;
      }

      const midpoint = Math.floor(sortedMonths.length / 2);
      const olderMonths = sortedMonths.slice(0, midpoint);
      const recentMonths = sortedMonths.slice(midpoint);

      const trendDirection =
        recentMonths.length > olderMonths.length
          ? "rising"
          : recentMonths.length < olderMonths.length
            ? "falling"
            : "stable";

      await db
        .insert(surveyTemporalPatterns)
        .values({
          themeName,
          trendDirection,
          mentionsByMonth,
          affectedSuppliers: [...data.suppliers],
          firstSeen: `${sortedMonths[0]}-01`,
          lastSeen: `${sortedMonths[sortedMonths.length - 1]}-01`,
        })
        .onConflictDoUpdate({
          target: surveyTemporalPatterns.themeName,
          set: {
            trendDirection,
            mentionsByMonth,
            affectedSuppliers: [...data.suppliers],
            firstSeen: `${sortedMonths[0]}-01`,
            lastSeen: `${sortedMonths[sortedMonths.length - 1]}-01`,
            analyzedAt: new Date(),
          },
        });

      temporalPatternsCount++;
    }
  } catch (e) {
    logger.error("jobs/analyze-surveys", "Temporal analysis failed", e);
  }

  return {
    success: true,
    count: processedCount,
    temporalPatterns: temporalPatternsCount,
    message: `Analyzed ${processedCount} surveys, detected ${temporalPatternsCount} theme patterns`,
  };
}
