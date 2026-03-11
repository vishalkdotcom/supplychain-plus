import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { db } from "../lib/db/drizzle";
import { caseEmbeddings } from "../lib/db/schema";
import { embed } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { resilientGenerateText } from "../lib/ai/resilient-generate";
import { kmeans } from "ml-kmeans";
import { query as sqlServerQuery } from "../lib/db/sql-server";

const DRY_RUN = process.argv.includes("--dry-run");

// Setup local Ollama
const ollamaUrl = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434/v1";
const ollama = createOpenAICompatible({ name: "ollama", baseURL: ollamaUrl });
const embeddingModel = ollama.textEmbeddingModel("bge-m3:latest");

async function fetchRealCases() {
  const caseIds = [1522255, 1522672, 1522696, 1522062];
  try {
    const result = await sqlServerQuery(`
      SELECT 
        CAST(CaseId AS VARCHAR) as id,
        ISNULL(MessageText, 'No message provided') as text,
        'Unknown' as company,
        'Unknown' as country
      FROM [Message]
      WHERE CaseId IN (${caseIds.join(", ")})
    `);
    
    return result.recordset.map((row: any) => ({
      id: row.id,
      text: row.text,
      company: row.company || 'Unknown',
      country: row.country || 'Unknown'
    }));
  } catch (error) {
    console.warn("Could not fetch from SQL Server, falling back to empty array.", error);
    return [];
  }
}

async function generateClusterLabel(messages: string[]) {
  const prompt = `You are a compliance analyst grouping worker complaints.
Here is a cluster of similar complaints:
${messages.map((m, i) => `${i + 1}. "${m}"`).join("\n")}

Provide a 2-4 word label describing the core issue of this cluster (e.g., "Verbal Harassment", "Unpaid Overtime", "Heat/Ventilation Issues").
Return ONLY the label, no quotes or formatting.`;

  try {
    const { text } = await resilientGenerateText({
      prompt,
      system: "You categorize compliance issues concisely.",
      temperature: 0.3,
      maxTokens: 50,
    });
    return text.trim();
  } catch (error) {
    console.warn("Failed to generate label, using fallback.");
    return "Operations Issue";
  }
}

async function runClustering() {
  console.log(DRY_RUN ? "🧪 DRY RUN MODE\n" : "🚀 Running Case Embedding & Clustering...\n");

  console.log("Fetching real case data from sqlserver-qa...");
  const rawCases = await fetchRealCases();
  console.log(`Found ${rawCases.length} cases to process.`);

  const casesToProcess = DRY_RUN ? rawCases.slice(0, 3) : rawCases;
  const vectors: number[][] = [];
  const processedCases: Array<{id: string, text: string, company: string, country: string, embedding: number[]}> = [];

  console.log(`1. Generating embeddings via local bge-m3 for ${casesToProcess.length} cases...`);
  
  for (const c of casesToProcess) {
    if (!c.text || c.text === 'No notes provided') {
      console.warn(`  ⚠ Skipping case ${c.id} due to empty text.`);
      continue;
    }
    try {
      const { embedding } = await embed({
        model: embeddingModel,
        value: c.text,
      });
      vectors.push(embedding);
      processedCases.push({ ...c, embedding });
    } catch (e) {
      console.warn(`  ⚠ Failed to embed case ${c.id}, skipping.`, e instanceof Error ? e.message : String(e));
    }
  }

  // If there are too few cases, fake the clustering
  const k = Math.min(3, Math.max(1, Math.floor(processedCases.length / 3)));
  
  if (processedCases.length === 0) {
    console.log("No valid cases embedded. Exiting.");
    process.exit(0);
  }

  console.log(`\n2. Running k-means clustering (k=${k})...`);
  const clusterResult = kmeans(vectors, k, { initialization: "kmeans++" });
  
  // Group cases by cluster
  const clusters: Record<number, typeof processedCases> = {};
  clusterResult.clusters.forEach((clusterId, i) => {
    if (!clusters[clusterId]) clusters[clusterId] = [];
    clusters[clusterId].push(processedCases[i]);
  });

  console.log(`\n3. Generating AI labels for clusters...`);
  const clusterLabels: Record<number, string> = {};

  for (const [clusterIdStr, clusterCases] of Object.entries(clusters)) {
    const clusterId = parseInt(clusterIdStr);
    const sampleMessages = clusterCases.slice(0, 3).map(c => c.text);
    const label = await generateClusterLabel(sampleMessages);
    clusterLabels[clusterId] = label;
    console.log(`   Cluster ${clusterId}: "${label}" (${clusterCases.length} cases)`);
  }

  if (!DRY_RUN) {
    console.log("\n4. Saving results to database...");
    
    // Clear old embeddings (for demo purposes)
    await db.delete(caseEmbeddings);

    for (let i = 0; i < processedCases.length; i++) {
      const c = processedCases[i];
      const clusterId = clusterResult.clusters[i];
      
      await db.insert(caseEmbeddings).values({
        caseId: c.id,
        messageText: c.text,
        embedding: c.embedding,
        clusterId: clusterId,
        clusterLabel: clusterLabels[clusterId],
        companyName: c.company,
        country: c.country,
      });
    }
  }

  console.log(`\n✅ Finished clustering.`);
}

runClustering()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
