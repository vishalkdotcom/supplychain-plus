import { db } from "../lib/db/drizzle";
import { surveyResponseAnalysis, surveyAnalysis } from "../lib/db/schema";
import { embed, generateText } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { desc, sql } from "drizzle-orm";

const DRY_RUN = process.argv.includes("--dry-run");

// Setup local Ollama providers
const ollamaUrl = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434/v1";
const ollama = createOpenAICompatible({ name: "ollama", baseURL: ollamaUrl });
const embeddingModel = ollama.textEmbeddingModel("bge-m3:latest");
const chatModel = ollama.chatModel("qwen3:4b");

// Synthetic survey responses simulating worker feedback
const RAW_RESPONSES = [
  "The new safety training was very helpful, but the machines on line 3 still break down often.",
  "Great food in the canteen today. Thank you.",
  "I haven't been paid for my overtime last week.",
  "Supervisors are yelling at us to meet the quota.",
  "The dormitories are too hot at night. Please fix the AC.",
  "I am happy with the recent bonus.",
  "Harassment from the line manager is unacceptable. Several women want to quit.",
  "Can we have more breaks during the summer months?",
  "The factory is safe and clean.",
  "Wages are too low compared to other factories in the area.",
  "I was forced to work 12 hours without a proper meal break.",
  "Thank you for providing the female hygiene products."
];

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

  const responses = DRY_RUN ? RAW_RESPONSES.slice(0, 3) : RAW_RESPONSES;
  
  let processed = 0;
  for (const text of responses) {
    console.log(`Analyzing: "${text.substring(0, 40)}..."`);
    
    // Process via Ollama locally
    const analysis = await analyzeResponse(text);
    
    if (!DRY_RUN) {
      await db.insert(surveyResponseAnalysis).values({
        responseId: `RESP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        surveyId: "SURVEY-2026-Q1",
        responseText: text,
        sentiment: analysis.sentiment,
        sentimentScore: analysis.sentimentScore,
        topics: analysis.topics,
        embedding: analysis.embedding,
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
