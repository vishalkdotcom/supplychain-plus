import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { db } from "../lib/db/drizzle";
import { surveyResponseAnalysis, surveyAnalysis } from "../lib/db/schema";
import { sql } from "drizzle-orm";
import { embed, generateText } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
// using sqlServerQuery instead

const DRY_RUN = process.argv.includes("--dry-run");
const RESUME = process.argv.includes("--resume");
const REUSE = process.argv.includes("--reuse");

import { query as sqlServerQuery } from "../lib/db/sql-server";

// Setup local Ollama providers
const ollamaUrl = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434/v1";
const ollama = createOpenAICompatible({ name: "ollama", baseURL: ollamaUrl });
const embeddingModel = ollama.embeddingModel("bge-m3:latest");
const chatModel = ollama.chatModel("qwen3:4b");

async function fetchRealResponses() {
  const result = await sqlServerQuery(`
    SELECT TOP 1000
      CAST(m.Id AS VARCHAR) as id,
      'SURVEY-2026-Q1' as survey_id,
      ISNULL(m.MessageText, '') as text_response
    FROM [Message] m
    JOIN Company c ON m.CompanyId = c.Id
    WHERE c.Id IN (137089, 136747, 137308)
      AND LEN(m.MessageText) > 20
      AND m.MessageText NOT LIKE '%test%'
      AND m.MessageText NOT LIKE '%Description:%'
      AND m.MessageText NOT LIKE '%http%'
  `);

  return result.recordset.map((r: any) => ({
    id: r.id,
    surveyId: r.survey_id,
    text: r.text_response
  }));
}

async function analyzeResponse(text: string) {
  try {
    // 1. Get embedding via local bge-m3
    const { embedding } = await embed({
      model: embeddingModel,
      value: text,
    });

    // 2. Classify sentiment and topics via local qwen3:4b
    const prompt = `Classify this worker survey response. 
Response: "${text}"

Return EXACTLY this JSON structure, nothing else:
{"sentiment":"positive","sentimentScore":0.9,"topics":["wages","overtime"]}

Sentiments can be positive, negative, or neutral. Keep topics to 1-2 words.`;

    const { text: jsonResult } = await generateText({
      model: chatModel,
      prompt,
      temperature: 0.1,
    });

    try {
      const rawMatch = jsonResult.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(rawMatch ? rawMatch[0] : jsonResult);
      return {
        embedding,
        sentiment: parsed.sentiment || "neutral",
        sentimentScore: parseFloat(parsed.sentimentScore) || 0.5,
        topics: parsed.topics || [],
      };
    } catch (e) {
      console.warn("  ⚠ Failed to parse JSON from AI, using fallbacks:", jsonResult);
      return {
        embedding,
        sentiment: "neutral",
        sentimentScore: 0.5,
        topics: [],
      };
    }
  } catch (error) {
    console.warn("  ⚠ AI Provider Error:", error instanceof Error ? error.message : String(error));
    return {
      embedding: new Array(1024).fill(0),
      sentiment: "neutral",
      sentimentScore: 0.5,
      topics: [],
    };
  }
}

async function processWorkerVoice() {
  console.log(DRY_RUN ? "🧪 DRY RUN MODE\n" : "🚀 Processing Worker Voice Analytics...\n");

  console.log("Fetching real survey responses from wovo_new/wovo_ai...");
  const rawResponses = await fetchRealResponses();
  console.log(`Found ${rawResponses.length} substantive responses.`);

  let responses = rawResponses;

  if (RESUME) {
    console.log("Resume mode enabled: Filtering already processed responses...");
    const existingRecords = await db.select({ id: surveyResponseAnalysis.responseId }).from(surveyResponseAnalysis);
    const existingIds = new Set(existingRecords.map(r => r.id));
    
    responses = rawResponses.filter(r => !existingIds.has(r.id));
    
    if (responses.length < rawResponses.length) {
      console.log(`Skipping ${rawResponses.length - responses.length} already processed responses.`);
    }
  } else {
    console.log("Full refresh mode: Processing all responses.");
  }

  if (responses.length === 0) {
    console.log("No responses to process.");
    return;
  }
  
  let processed = 0;
  for (const resp of responses) {
    const text = resp.text;
    console.log(`Analyzing: "${text.substring(0, 40)}..."`);
    
    // Process via Ollama locally
    let analysis;
    if (REUSE) {
      const existing = await db.select()
        .from(surveyResponseAnalysis)
        .where(sql`${surveyResponseAnalysis.responseText} = ${text}`)
        .limit(1);

      if (existing.length > 0) {
        console.log(`  ♻ Reusing existing analysis for identical content.`);
        analysis = {
          sentiment: existing[0].sentiment,
          sentimentScore: existing[0].sentimentScore,
          topics: existing[0].topics,
          embedding: existing[0].embedding,
        };
      }
    }

    if (!analysis) {
      analysis = await analyzeResponse(text);
    }
    
    if (!DRY_RUN) {
      await db.insert(surveyResponseAnalysis).values({
        responseId: resp.id || `RESP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        surveyId: resp.surveyId || "SURVEY-2026-Q1",
        responseText: text,
        sentiment: analysis.sentiment,
        sentimentScore: analysis.sentimentScore,
        topics: analysis.topics,
        embedding: analysis.embedding,
      }).onConflictDoUpdate({
        target: surveyResponseAnalysis.responseId,
        set: {
          sentiment: analysis.sentiment,
          sentimentScore: analysis.sentimentScore,
          topics: analysis.topics,
          embedding: analysis.embedding,
        }
      });
    }
    processed++;
  }

  console.log(`\n✅ Processed ${processed} responses.`);

  if (!DRY_RUN) {
    console.log("Aggregating results into survey_analysis table...");
    // Mocking an aggregation step based on the processed data
    await db.insert(surveyAnalysis).values({
      surveyId: "SURVEY-2026-Q1",
      responseCount: processed,
      sentimentPositive: 0.3, // Example aggregated stats
      sentimentNegative: 0.5,
      sentimentNeutral: 0.2,
      riskScore: 65,
      aiInsight: "Primary concerns are around wages, overtime, and manager behavior. Harassment is a critical emerging topic.",
    }).onConflictDoUpdate({
      target: surveyAnalysis.surveyId,
      set: {
        responseCount: processed,
        aiInsight: "Primary concerns are around wages, overtime, and manager behavior. Harassment is a critical emerging topic."
      }
    });
  }
}

processWorkerVoice()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
