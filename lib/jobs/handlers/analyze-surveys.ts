import { getJobModel, generateTextWithFallback } from "@/lib/ai/provider";
import { stripThinkingTags } from "@/lib/ai/utils";
import { db } from "@/lib/db/drizzle";
import { surveyAnalysis, surveyTemporalPatterns, type SurveyTheme } from "@/lib/db/schema";
import { query as pgQuery } from "@/lib/db/postgres";
import { gte } from "drizzle-orm";
import { z } from "zod";
import { logger } from "@/lib/logger";
import type { JobResult, JobParams } from "./types";

const surveyAnalysisSchema = z.object({
  sentimentPositive: z.number(),
  sentimentNegative: z.number(),
  sentimentNeutral: z.number(),
  riskScore: z.number().min(0).max(100).transform((v) => Math.round(v)),
  themes: z.array(
    z.object({
      name: z.string(),
      sentiment: z.enum(["positive", "negative", "neutral"]),
      mentionCount: z.number().transform((v) => Math.round(v)),
    }),
  ),
  insight: z.string().describe("One-paragraph summary of key findings"),
});

export async function analyzeSurveys(params?: JobParams): Promise<JobResult> {
  const targetSurveyId = params?.surveyId as string | undefined;

  // Step 1: Fetch distinct survey IDs
  let surveyListQuery = `SELECT DISTINCT s.id, s.name FROM survey_mdlsurvey s`;
  const listParams: unknown[] = [];
  if (targetSurveyId) {
    listParams.push(targetSurveyId);
    surveyListQuery += ` WHERE s.id = $${listParams.length}`;
  }
  surveyListQuery += ` ORDER BY s.id`;

  const surveyList = await pgQuery(surveyListQuery, listParams);
  const totalSurveys = surveyList.rows.length;
  logger.info("jobs/analyze-surveys", `Found ${totalSurveys} surveys to analyze`);

  // Step 2: For each survey, fetch its responses separately
  const surveyResponses = new Map<
    string,
    { name: string; responses: string[] }
  >();
  for (const survey of surveyList.rows) {
    const respResult = await pgQuery(
      `SELECT q.title as question_text,
              r.text_response as response_text,
              opt.label as option_label
       FROM survey_mdlsurvey_questions sq
       JOIN survey_mdlsurveyquestions q ON q.id = sq.mdlsurveyquestions_id
       LEFT JOIN survey_mdlsurveyquestionresponses r ON r.survey_question_id = q.id AND r.survey_id = $1
       LEFT JOIN survey_mdlsurveyquestionoptions opt ON opt.id = r.question_option_id
       WHERE sq.mdlsurvey_id = $1
       ORDER BY q.id`,
      [survey.id],
    );

    const responses: string[] = [];
    for (const row of respResult.rows) {
      const answerText = row.response_text?.trim() || row.option_label || null;
      if (answerText) {
        responses.push(`Q: ${row.question_text || "Question"}\nA: ${answerText}`);
      }
    }
    surveyResponses.set(survey.id, { name: survey.name, responses });
  }

  // Checkpoint: skip surveys analyzed in the last 24 hours (unless force=true)
  const forceReanalyze = params?.force === true;
  const recentlyAnalyzed = new Set<string>();
  if (!forceReanalyze) {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recent = await db
      .select({ surveyId: surveyAnalysis.surveyId })
      .from(surveyAnalysis)
      .where(gte(surveyAnalysis.analyzedAt, cutoff));
    for (const row of recent) recentlyAnalyzed.add(row.surveyId);
    if (recentlyAnalyzed.size > 0) {
      logger.info("jobs/analyze-surveys", `Checkpoint: ${recentlyAnalyzed.size} surveys analyzed <24h ago, will skip (use force=true to override)`);
    }
  }

  let processedCount = 0;
  let skippedCount = 0;
  let dbErrorCount = 0;

  const model = getJobModel();

  for (const [surveyId, data] of surveyResponses) {
    if (data.responses.length === 0) continue;

    if (recentlyAnalyzed.has(surveyId)) {
      skippedCount++;
      continue;
    }

    const responseText = data.responses.slice(0, 50).join("\n---\n");

    let text: string;
    try {
      ({ text } = await generateTextWithFallback({
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
      }));
    } catch (llmErr) {
      logger.warn("jobs/analyze-surveys", `LLM call failed for survey ${surveyId}, skipping`, llmErr);
      continue;
    }

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

    if (processedCount > 0 && processedCount % 10 === 0) {
      logger.info("jobs/analyze-surveys", `Progress: ${processedCount}/${totalSurveys} surveys analyzed`);
    }

    if (parsed.success) {
      const output = parsed.data;
      try {
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
      } catch (dbErr) {
        logger.warn("jobs/analyze-surveys", `DB write failed for survey ${surveyId}, skipping`, dbErr);
        dbErrorCount++;
      }
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
    skipped: skippedCount,
    dbErrors: dbErrorCount,
    temporalPatterns: temporalPatternsCount,
    message: `Analyzed ${processedCount} surveys${skippedCount ? `, skipped ${skippedCount} recent` : ""}${dbErrorCount ? `, ${dbErrorCount} DB errors` : ""}, detected ${temporalPatternsCount} theme patterns`,
  };
}
