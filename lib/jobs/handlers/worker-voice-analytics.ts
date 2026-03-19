import { generateText, Output } from "ai";
import { getOllamaModel } from "@/lib/ai/provider";
import { query as pgQuery } from "@/lib/db/postgres";
import { db } from "@/lib/db/drizzle";
import { workerVoiceTrends } from "@/lib/db/schema";
import { z } from "zod";
import type { VoiceTopic } from "@/lib/db/schema";
import { logger } from "@/lib/logger";
import type { JobResult } from "./types";

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

export async function workerVoiceAnalytics(): Promise<JobResult> {
  const model = getOllamaModel("qwen3:4b");
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

  // Query survey responses from PostgreSQL (engage database)
  const responsesResult = await pgQuery(
    `SELECT text_response AS response_text, created_date, client_key, client_name
    FROM (
      SELECT r.text_response, r.created_date, c.client_key, c.name as client_name,
             ROW_NUMBER() OVER (PARTITION BY c.client_key ORDER BY r.created_date DESC) as rn
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

  // Group responses by supplier
  const bySupplier = new Map<string, { name: string; texts: string[] }>();
  for (const r of responses) {
    const key = r.client_key || "global";
    if (!bySupplier.has(key)) {
      bySupplier.set(key, { name: r.client_name || "Unknown", texts: [] });
    }
    bySupplier.get(key)!.texts.push(r.response_text);
  }

  let processed = 0;

  for (const [supplierId, { texts }] of bySupplier) {
    const batchSize = 50;
    const allTopics: Array<{ name: string; mentions: number; sentiment: string }> = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      try {
        const result = await generateText({
          model,
          maxRetries: 3,
          system:
            "You are an expert at analyzing worker feedback from factory surveys. Extract the main topics/themes being discussed and their sentiment. Be specific about workplace issues. You MUST respond with valid JSON only — no markdown, no explanation, no extra text.",
          prompt: `Analyze these ${batch.length} worker survey responses and extract the key topics/themes:\n\n${batch.map((t, idx) => `${idx + 1}. ${t.substring(0, 300)}`).join("\n")}`,
          output: Output.object({ schema: topicSchema }),
        });

        if (result.output?.topics) {
          allTopics.push(...result.output.topics);
        }
      } catch (e) {
        logger.error("jobs/worker-voice-analytics", `Worker voice batch failed for supplier ${supplierId}`, e);
      }
    }

    // Aggregate topics
    const topicMap = new Map<string, { mentions: number; sentiments: string[] }>();
    for (const t of allTopics) {
      const key = t.name.toLowerCase();
      if (!topicMap.has(key)) {
        topicMap.set(key, { mentions: 0, sentiments: [] });
      }
      const entry = topicMap.get(key)!;
      entry.mentions += t.mentions;
      entry.sentiments.push(t.sentiment);
    }

    const aggregated = Array.from(topicMap.entries())
      .map(([name, { mentions, sentiments }]) => {
        const negCount = sentiments.filter((s) => s === "negative").length;
        const posCount = sentiments.filter((s) => s === "positive").length;
        const sentiment: VoiceTopic["sentiment"] =
          negCount > posCount ? "negative" : posCount > negCount ? "positive" : "neutral";
        return { name, mentions, sentiment, delta: 0 } satisfies VoiceTopic;
      })
      .sort((a, b) => b.mentions - a.mentions);

    const topThemes = aggregated.slice(0, 10);
    const emerging = aggregated.filter((t) => t.mentions >= 3).slice(0, 5);
    const negativeShift =
      topThemes.filter((t) => t.sentiment === "negative").length / Math.max(topThemes.length, 1);
    const sentimentShift = -(negativeShift * 100 - 50);

    await db
      .insert(workerVoiceTrends)
      .values({
        supplierId: supplierId === "global" ? null : supplierId,
        month: currentMonth,
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

    processed++;
  }

  // Global analysis
  const allTexts = responses.map((r) => r.response_text);
  const globalBatch = allTexts.slice(0, 50);

  try {
    const globalResult = await generateText({
      model,
      maxRetries: 3,
      system:
        "You are an expert at analyzing worker feedback. Extract the main topics across all factories. You MUST respond with valid JSON only — no markdown, no explanation, no extra text.",
      prompt: `Analyze these ${globalBatch.length} worker survey responses from multiple factories and extract global themes:\n\n${globalBatch.map((t, idx) => `${idx + 1}. ${t.substring(0, 300)}`).join("\n")}`,
      output: Output.object({ schema: topicSchema }),
    });

    if (globalResult.output?.topics) {
      const globalThemes = globalResult.output.topics.map((t) => ({
        ...t,
        delta: 0,
      }));

      await db
        .insert(workerVoiceTrends)
        .values({
          supplierId: null,
          month: currentMonth,
          emergingTopics: globalThemes.slice(0, 5),
          decliningTopics: [],
          sentimentShift: 0,
          topThemes: globalThemes,
        })
        .onConflictDoUpdate({
          target: [workerVoiceTrends.supplierId, workerVoiceTrends.month],
          set: {
            emergingTopics: globalThemes.slice(0, 5),
            topThemes: globalThemes,
            analyzedAt: new Date(),
          },
        });
    }
  } catch (e) {
    logger.error("jobs/worker-voice-analytics", "Global voice analysis failed", e);
  }

  return {
    success: true,
    suppliersProcessed: processed,
    totalResponses: responses.length,
    month: currentMonth,
  };
}
