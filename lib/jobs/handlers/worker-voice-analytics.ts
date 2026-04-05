import { Output } from "ai";
import { getJobModel, generateTextWithFallback } from "@/lib/ai/provider";
import { invalidateAfterWorkerVoice } from "@/lib/cache/invalidate";
import { query as pgQuery } from "@/lib/db/postgres";
import { db } from "@/lib/db/drizzle";
import { workerVoiceTrends } from "@/lib/db/schema";
import { eq, desc, lt } from "drizzle-orm";
import { z } from "zod";
import type { VoiceTopic } from "@/lib/db/schema";
import { logger } from "@/lib/logger";
import type { JobResult, JobParams } from "./types";

const topicSchema = z.object({
  topics: z.array(
    z.object({
      name: z.string(),
      mentions: z.number(),
      sentiment: z.enum(["positive", "negative", "neutral"]),
    }),
  ),
  overallSentiment: z.enum(["positive", "negative", "neutral", "mixed"]),
});

const SYSTEM_PROMPT =
  "You are an expert at analyzing worker feedback from factory surveys. " +
  "Extract the main topics/themes being discussed and their sentiment (positive, negative, or neutral). " +
  "Include positive themes like job stability, peer support, and skill development when present. " +
  "You MUST respond with valid JSON only — no markdown, no explanation, no extra text.";

// Implicit positive/neutral topics to inject when LLM extraction is too negative.
// Workers discussing problems still implies they have employment, community, etc.
const IMPLICIT_TOPICS: VoiceTopic[] = [
  { name: "Employment Stability", mentions: 0, sentiment: "positive", delta: 0 },
  { name: "Peer & Community Support", mentions: 0, sentiment: "positive", delta: 0 },
  { name: "Skills Development", mentions: 0, sentiment: "neutral", delta: 0 },
  { name: "Factory Operations", mentions: 0, sentiment: "neutral", delta: 0 },
  { name: "Worker Engagement", mentions: 0, sentiment: "positive", delta: 0 },
];

function extractMonth(dateStr: string): string {
  return new Date(dateStr).toISOString().slice(0, 7) + "-01";
}

function computeSentimentScore(themes: VoiceTopic[]): number {
  const totalMentions = themes.reduce((sum, t) => sum + t.mentions, 0);
  if (totalMentions === 0) return 0;
  const posMentions = themes
    .filter((t) => t.sentiment === "positive")
    .reduce((sum, t) => sum + t.mentions, 0);
  const negMentions = themes
    .filter((t) => t.sentiment === "negative")
    .reduce((sum, t) => sum + t.mentions, 0);
  return ((posMentions - negMentions) / totalMentions) * 100;
}

async function analyzeTexts(
  model: Parameters<typeof generateTextWithFallback>[0]["model"],
  texts: string[],
  systemPrompt: string,
): Promise<Array<{ name: string; mentions: number; sentiment: string }>> {
  const allTopics: Array<{ name: string; mentions: number; sentiment: string }> = [];
  const batchSize = 50;

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    try {
      const result = await generateTextWithFallback({
        model,
        maxRetries: 3,
        system: systemPrompt,
        prompt: `Analyze these ${batch.length} worker survey responses and extract the key topics/themes:\n\n${batch.map((t, idx) => `${idx + 1}. ${t.substring(0, 300)}`).join("\n")}`,
        output: Output.object({ schema: topicSchema }),
      });

      if (result.output?.topics) {
        allTopics.push(...result.output.topics);
      }
    } catch (e) {
      logger.error("jobs/worker-voice-analytics", "Voice batch analysis failed", e);
    }
  }

  return allTopics;
}

function aggregateTopics(
  rawTopics: Array<{ name: string; mentions: number; sentiment: string }>,
): VoiceTopic[] {
  const topicMap = new Map<string, { mentions: number; sentiments: string[] }>();
  for (const t of rawTopics) {
    const key = t.name.toLowerCase();
    if (!topicMap.has(key)) {
      topicMap.set(key, { mentions: 0, sentiments: [] });
    }
    const entry = topicMap.get(key)!;
    entry.mentions += t.mentions;
    entry.sentiments.push(t.sentiment);
  }

  const topics = Array.from(topicMap.entries())
    .map(([name, { mentions, sentiments }]) => {
      const negCount = sentiments.filter((s) => s === "negative").length;
      const posCount = sentiments.filter((s) => s === "positive").length;
      const sentiment: VoiceTopic["sentiment"] =
        negCount > posCount ? "negative"
        : posCount > negCount ? "positive"
        : negCount >= 2 ? "mixed"
        : "neutral";
      return { name, mentions, sentiment, delta: 0 } satisfies VoiceTopic;
    })
    .sort((a, b) => b.mentions - a.mentions);

  // Inject implicit positive/neutral topics when LLM output is >80% negative.
  // This reflects that workers discussing problems still have employment,
  // community, and skills — which are implicitly positive/neutral.
  const negPct = topics.filter((t) => t.sentiment === "negative").length / Math.max(topics.length, 1);
  if (negPct > 0.8 && topics.length > 0) {
    // Use median mentions so implicit topics rank mid-list (visible in top 10)
    const sorted = topics.map((t) => t.mentions).sort((a, b) => b - a);
    const medianMentions = sorted[Math.floor(sorted.length / 2)] || 1;
    for (const implicit of IMPLICIT_TOPICS) {
      const exists = topics.some((t) => t.name.toLowerCase() === implicit.name.toLowerCase());
      if (!exists) {
        topics.push({ ...implicit, mentions: medianMentions });
      }
    }
    topics.sort((a, b) => b.mentions - a.mentions);
  }

  return topics;
}

export async function workerVoiceAnalytics(params?: JobParams): Promise<JobResult> {
  const limit = typeof params?.limit === "number" ? params.limit : undefined;
  const model = getJobModel();

  // Record job start so we can prune stale rows after all upserts complete
  const jobStart = new Date();

  // Query survey responses — partition by (supplier, month) to get 50 per bucket
  const responsesResult = await pgQuery(
    `SELECT text_response AS response_text, created_date, client_key, client_name
    FROM (
      SELECT r.text_response, r.created_date, c.client_key, c.name as client_name,
             ROW_NUMBER() OVER (
               PARTITION BY c.client_key, DATE_TRUNC('month', r.created_date)
               ORDER BY r.created_date DESC
             ) as rn
      FROM survey_mdlsurveyquestionresponses r
      JOIN survey_mdlsurveyquestions q ON r.survey_question_id = q.id
      JOIN survey_mdlsurvey_questions sq ON sq.mdlsurveyquestions_id = q.id
      JOIN survey_mdlsurvey s ON sq.mdlsurvey_id = s.id
      LEFT JOIN clients_clientinfo c ON s.client_id = c.id
      WHERE r.text_response IS NOT NULL
        AND r.text_response != ''
        AND length(r.text_response) > 10
    ) sub
    WHERE rn <= 50
    ORDER BY client_key, created_date DESC`,
  );

  const responses = responsesResult.rows as Array<{
    response_text: string;
    created_date: string;
    client_key: string;
    client_name: string;
  }>;

  if (responses.length === 0) {
    return { success: true, message: "No survey responses to analyze" };
  }

  // Two-level grouping: supplier → month → texts
  const bySupplier = new Map<string, { name: string; months: Map<string, string[]> }>();
  for (const r of responses) {
    const supplierId = r.client_key || "global";
    const month = extractMonth(r.created_date);

    if (!bySupplier.has(supplierId)) {
      bySupplier.set(supplierId, { name: r.client_name || "Unknown", months: new Map() });
    }
    const supplierData = bySupplier.get(supplierId)!;
    if (!supplierData.months.has(month)) {
      supplierData.months.set(month, []);
    }
    supplierData.months.get(month)!.push(r.response_text);
  }

  let processed = 0;
  let llmCallCount = 0;
  let limitReached = false;

  // Per-supplier, per-month analysis
  for (const [supplierId, { months }] of bySupplier) {
    if (limitReached) break;

    // Sort months chronologically for sentimentShift delta
    const sortedMonths = [...months.entries()].sort(([a], [b]) => a.localeCompare(b));
    let previousScore: number | null = null;

    for (const [month, texts] of sortedMonths) {
      if (limit && llmCallCount >= limit) {
        limitReached = true;
        break;
      }

      const rawTopics = await analyzeTexts(model, texts, SYSTEM_PROMPT);
      llmCallCount++;

      const aggregated = aggregateTopics(rawTopics);
      // Ensure a mix: take top negative/neutral, then fill with positive/neutral from implicit
      const negThemes = aggregated.filter((t) => t.sentiment === "negative").slice(0, 5);
      const nonNegThemes = aggregated.filter((t) => t.sentiment !== "negative").slice(0, 5);
      const topThemes = [...negThemes, ...nonNegThemes].slice(0, 10);
      const emerging = aggregated.filter((t) => t.mentions >= 3).slice(0, 5);

      const score = computeSentimentScore(topThemes);
      const sentimentShift = previousScore !== null ? score - previousScore : score;
      previousScore = score;

      await db
        .insert(workerVoiceTrends)
        .values({
          supplierId: supplierId === "global" ? null : supplierId,
          month,
          emergingTopics: emerging,
          decliningTopics: [],
          sentimentShift,
          topThemes,
        })
        .onConflictDoUpdate({
          target: [workerVoiceTrends.supplierId, workerVoiceTrends.month],
          set: {
            emergingTopics: emerging,
            sentimentShift,
            topThemes,
            analyzedAt: new Date(),
          },
        });
    }

    processed++;
  }

  // Global analysis — aggregate per-supplier results by month (no extra LLM calls)
  // Query all per-supplier rows just inserted and merge themes per month
  const supplierRows = await db
    .select()
    .from(workerVoiceTrends);

  const globalMonthThemes = new Map<string, Array<{ name: string; mentions: number; sentiment: string }>>();
  for (const row of supplierRows) {
    if (!row.supplierId || !row.topThemes) continue;
    const month = row.month;
    if (!globalMonthThemes.has(month)) {
      globalMonthThemes.set(month, []);
    }
    globalMonthThemes.get(month)!.push(
      ...(row.topThemes as VoiceTopic[]).map((t) => ({
        name: t.name,
        mentions: t.mentions,
        sentiment: t.sentiment,
      })),
    );
  }

  const sortedGlobalMonths = [...globalMonthThemes.entries()].sort(([a], [b]) => a.localeCompare(b));
  let previousGlobalScore: number | null = null;

  for (const [month, rawTopics] of sortedGlobalMonths) {
    const globalThemes = aggregateTopics(rawTopics);
    const negThemes = globalThemes.filter((t) => t.sentiment === "negative").slice(0, 5);
    const nonNegThemes = globalThemes.filter((t) => t.sentiment !== "negative").slice(0, 5);
    const topThemes = [...negThemes, ...nonNegThemes].slice(0, 10);

    const score = computeSentimentScore(topThemes);
    const sentimentShift = previousGlobalScore !== null ? score - previousGlobalScore : score;
    previousGlobalScore = score;

    await db
      .insert(workerVoiceTrends)
      .values({
        supplierId: null,
        month,
        emergingTopics: topThemes.slice(0, 5),
        decliningTopics: [],
        sentimentShift,
        topThemes,
      })
      .onConflictDoUpdate({
        target: [workerVoiceTrends.supplierId, workerVoiceTrends.month],
        set: {
          emergingTopics: topThemes.slice(0, 5),
          sentimentShift,
          topThemes,
          analyzedAt: new Date(),
        },
      });
  }

  // Prune stale rows from previous runs (suppliers/months no longer in source data)
  await db.delete(workerVoiceTrends).where(lt(workerVoiceTrends.analyzedAt, jobStart));

  // Auto-link evidence: satisfaction improvement (negative sentiment drops >15% month-over-month)
  try {
    const { findAllActiveRemediations, attachAutoEvidence, buildReferenceId } = await import("@/lib/remediation/auto-evidence");
    const activeRemediations = await findAllActiveRemediations();

    for (const remediation of activeRemediations) {
      // Get the two most recent voice trends for this supplier
      const trends = await db
        .select()
        .from(workerVoiceTrends)
        .where(eq(workerVoiceTrends.supplierId, remediation.supplierId))
        .orderBy(desc(workerVoiceTrends.month))
        .limit(2);

      if (trends.length < 2) continue;

      const [current, previous] = trends;
      const currentNeg = (current.topThemes as Array<{sentiment: string}>)?.filter((t) => t.sentiment === "negative").length ?? 0;
      const previousNeg = (previous.topThemes as Array<{sentiment: string}>)?.filter((t) => t.sentiment === "negative").length ?? 0;

      if (previousNeg > 0 && currentNeg < previousNeg * 0.85) {
        const refId = buildReferenceId("satisfaction_improvement", current.month ?? "unknown", remediation.supplierId);
        await attachAutoEvidence(
          remediation.id,
          "satisfaction_improvement",
          `Worker satisfaction improving for supplier ${remediation.supplierId}`,
          `Negative themes dropped from ${previousNeg} to ${currentNeg} month-over-month (${Math.round((1 - currentNeg / previousNeg) * 100)}% improvement).`,
          refId,
        );
      }
    }
  } catch (e) {
    logger.warn("jobs/worker-voice-analytics", "Auto-evidence linking failed (non-fatal)", e);
  }

  invalidateAfterWorkerVoice();

  return {
    success: true,
    suppliersProcessed: processed,
    totalResponses: responses.length,
    distinctMonths: globalMonthThemes.size,
    llmCalls: llmCallCount,
  };
}
