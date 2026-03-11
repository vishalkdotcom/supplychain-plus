import { db } from "../lib/db/drizzle";
import { caseEmbeddings } from "../lib/db/schema";
import { cosineDistance, desc, gt, sql } from "drizzle-orm";
import { embed } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

const ollamaUrl = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434/v1";
const ollama = createOpenAICompatible({ name: "ollama", baseURL: ollamaUrl });
const embeddingModel = ollama.textEmbeddingModel("bge-m3:latest");

async function runDemoSearch() {
  console.log("🔍 Running pgvector Semantic Search Demo...");
  
  const queryText = "People are working too many hours without pay.";
  console.log(`\nQuery string: "${queryText}"`);

  // 1. Embed the search query
  const { embedding: queryEmbedding } = await embed({
    model: embeddingModel,
    value: queryText,
  });

  console.log("Embedding generated. Querying database for semantic matches...\n");

  // 2. Perform a vector similarity search in the database using pgvector's cosine distance operator (<=>).
  // We use drizzle-orm's cosineDistance helper which translates to table.embedding <=> queryEmbedding in SQL.
  // We order by similarity (ascending distance) and limit to top 3.
  const similarCases = await db
    .select({
      id: caseEmbeddings.caseId,
      text: caseEmbeddings.messageText,
      similarity: sql<number>`1 - (${cosineDistance(caseEmbeddings.embedding, queryEmbedding)})`, // Cosine similarity is 1 - distance
    })
    .from(caseEmbeddings)
    .orderBy(cosineDistance(caseEmbeddings.embedding, queryEmbedding))
    .limit(3);

  if (similarCases.length === 0) {
    console.log("No cases found! Ensure you've run 'bun run scripts/embed-cases.ts' to populate data.");
    process.exit(0);
  }

  console.log("Top 3 Semantic Matches:");
  similarCases.forEach((c, index) => {
    console.log(`\nMatch ${index + 1} (Score: ${c.similarity.toFixed(4)})`);
    console.log(`Case ID: ${c.id}`);
    console.log(`Text: "${c.text}"`);
  });

  console.log("\n✅ Demo complete.");
  process.exit(0);
}

runDemoSearch().catch((e) => {
  console.error(e);
  process.exit(1);
});
