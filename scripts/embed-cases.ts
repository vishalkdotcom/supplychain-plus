import { db } from "../lib/db/drizzle";
import { caseEmbeddings } from "../lib/db/schema";
import { embed } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { resilientGenerateText } from "../lib/ai/resilient-generate";
import { kmeans } from "ml-kmeans";

const DRY_RUN = process.argv.includes("--dry-run");

// Setup local Ollama
const ollamaUrl = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434/v1";
const ollama = createOpenAICompatible({ name: "ollama", baseURL: ollamaUrl });
const embeddingModel = ollama.textEmbeddingModel("bge-m3:latest");

// Mocking cases to bypass complex SQL Server querying for this demo script
const SYNTHETIC_CASES = [
  { id: "CASE-001", text: "My supervisor threatened to fire me if I didn't work overtime on Sunday.", company: "TechSew", country: "Vietnam" },
  { id: "CASE-002", text: "The line manager yells at the women on line 4 every day.", company: "TechSew", country: "Vietnam" },
  { id: "CASE-003", text: "We were forced to work through our lunch break again.", company: "GarmentCo", country: "Bangladesh" },
  { id: "CASE-004", text: "I received only half my overtime pay for last month.", company: "ShoeMaker Inc", country: "China" },
  { id: "CASE-005", text: "The ventilation in section B is broken and it is extremely hot.", company: "TechSew", country: "Vietnam" },
  { id: "CASE-006", text: "The manager touched me inappropriately during the shift change.", company: "ApparelPro", country: "India" },
  { id: "CASE-007", text: "No drinking water available on the third floor.", company: "TechSew", country: "Vietnam" },
  { id: "CASE-008", text: "They are paying us less than the minimum wage for piece-rate work.", company: "ShoeMaker Inc", country: "China" },
  { id: "CASE-009", text: "Mandatory overtime without extra pay is illegal.", company: "GarmentCo", country: "Bangladesh" },
  { id: "CASE-010", text: "A worker fainted today because of the heat in the finishing department.", company: "TechSew", country: "Vietnam" }
];

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

  const casesToProcess = DRY_RUN ? SYNTHETIC_CASES.slice(0, 3) : SYNTHETIC_CASES;
  const vectors: number[][] = [];
  const processedCases: Array<{id: string, text: string, company: string, country: string, embedding: number[]}> = [];

  console.log(`1. Generating embeddings via local bge-m3 for ${casesToProcess.length} cases...`);
  
  for (const c of casesToProcess) {
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
