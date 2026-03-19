import { generateText, embed, Output } from "ai";
import { getJobModel, getOllamaEmbedding } from "@/lib/ai/provider";
import { query as mssqlQuery } from "@/lib/db/sql-server";
import { db } from "@/lib/db/drizzle";
import { caseEmbeddings, caseClusters } from "@/lib/db/schema";
import { inArray } from "drizzle-orm";
import { z } from "zod";
import { logger } from "@/lib/logger";
import type { JobResult } from "./types";

const clusterLabelSchema = z.object({
  label: z.string().describe("Short label for this cluster of cases"),
  summary: z.string().describe("2-3 sentence summary of the systemic pattern"),
  severity: z.enum(["critical", "warning", "info"]),
});

export async function caseClustering(): Promise<JobResult> {
  const embeddingModel = getOllamaEmbedding("bge-m3");
  const labelModel = getJobModel();

  // Step 1: Query case messages from SQL Server
  const result = await mssqlQuery(`
    SELECT TOP 2000
      m.Id as MessageId,
      m.CaseId,
      m.MessageText,
      c.CompanyId,
      co.Name as CompanyName,
      ctct.Name as CaseTypeName
    FROM Message m
    JOIN [Case] c ON m.CaseId = c.Id
    LEFT JOIN Company co ON c.CompanyId = co.Id
    LEFT JOIN CaseTypeCultureText ctct ON c.CaseTypeId = ctct.CaseTypeId AND ctct.CultureCodeId = 1
    WHERE c.Deleted = 0
      AND m.MessageText IS NOT NULL
      AND LEN(m.MessageText) > 20
    ORDER BY m.Created DESC
  `);

  const messages = result.recordset as Array<{
    MessageId: number;
    CaseId: number;
    MessageText: string;
    CompanyId: number;
    CompanyName: string;
    CaseTypeName: string;
  }>;

  if (messages.length === 0) {
    return { success: true, message: "No messages to process" };
  }

  // Step 2: Generate embeddings
  let embeddedCount = 0;
  const allEmbeddings: Array<{
    caseId: string;
    messageId: string;
    embedding: number[];
    text: string;
    companyId: string;
    companyName: string;
    caseType: string;
  }> = [];

  for (const msg of messages) {
    try {
      const { embedding: vec } = await embed({
        model: embeddingModel,
        value: msg.MessageText.substring(0, 1000),
      });

      allEmbeddings.push({
        caseId: String(msg.CaseId),
        messageId: String(msg.MessageId),
        embedding: Array.from(vec),
        text: msg.MessageText.substring(0, 300),
        companyId: String(msg.CompanyId),
        companyName: msg.CompanyName,
        caseType: msg.CaseTypeName,
      });

      await db
        .insert(caseEmbeddings)
        .values({
          caseId: String(msg.CaseId),
          messageId: String(msg.MessageId),
          embedding: Array.from(vec),
        })
        .onConflictDoNothing();

      embeddedCount++;
    } catch (e) {
      logger.error(
        "jobs/case-clustering",
        `Embedding failed for message ${msg.MessageId} (OLLAMA_BASE_URL=${process.env.OLLAMA_BASE_URL})`,
        e,
      );
    }
  }

  // Step 3: Simple clustering using cosine similarity
  const clusters: Map<number, Array<(typeof allEmbeddings)[0]>> = new Map();
  const assigned = new Set<number>();
  let clusterIdx = 0;
  const SIMILARITY_THRESHOLD = 0.75;

  for (let i = 0; i < allEmbeddings.length; i++) {
    if (assigned.has(i)) continue;

    const cluster = [allEmbeddings[i]];
    assigned.add(i);

    for (let j = i + 1; j < allEmbeddings.length; j++) {
      if (assigned.has(j)) continue;

      const sim = cosineSimilarity(
        allEmbeddings[i].embedding,
        allEmbeddings[j].embedding,
      );
      if (sim >= SIMILARITY_THRESHOLD) {
        cluster.push(allEmbeddings[j]);
        assigned.add(j);
      }
    }

    const uniqueSuppliers = new Set(cluster.map((m) => m.companyName));
    if (cluster.length >= 3 && uniqueSuppliers.size >= 2) {
      clusters.set(clusterIdx, cluster);
      clusterIdx++;
    }
  }

  // Step 4: Label each cluster with AI
  let clustersCreated = 0;

  await db.delete(caseClusters);

  for (const [, members] of clusters) {
    const sampleTexts = members.slice(0, 5).map((m) => m.text);
    const regions = [...new Set(members.map((m) => m.companyName))];
    const caseTypes = [
      ...new Set(members.map((m) => m.caseType).filter(Boolean)),
    ];
    const supplierIds = [...new Set(members.map((m) => m.companyId).filter(Boolean))];

    try {
      const labelResult = await generateText({
        model: labelModel,
        maxRetries: 3,
        system:
          "You are an expert at identifying systemic patterns in worker grievance cases across multiple factories. You MUST respond with valid JSON only — no markdown, no explanation, no extra text.",
        prompt: `These ${members.length} worker complaints from ${regions.length} different factories share a common pattern. Analyze and label this cluster.

Factories: ${regions.join(", ")}
Case Types: ${caseTypes.join(", ")}

Sample messages:
${sampleTexts.map((t, i) => `${i + 1}. ${t}`).join("\n")}

Respond with ONLY this JSON structure:
{"label": "<short label>", "summary": "<2-3 sentence summary>", "severity": "<critical|warning|info>"}`,
        output: Output.object({ schema: clusterLabelSchema }),
      });

      if (labelResult.output) {
        const inserted = await db
          .insert(caseClusters)
          .values({
            clusterLabel: labelResult.output.label,
            caseCount: members.length,
            supplierCount: regions.length,
            regions,
            caseTypes,
            representativeMessages: sampleTexts,
            aiSummary: labelResult.output.summary,
            severity: labelResult.output.severity,
            supplierIds,
          })
          .returning({ id: caseClusters.id });

        const clusterId = inserted[0].id;
        const messageIds = members.map((m) => m.messageId);
        await db
          .update(caseEmbeddings)
          .set({ clusterId })
          .where(inArray(caseEmbeddings.messageId, messageIds));

        clustersCreated++;
      }
    } catch (e) {
      logger.error("jobs/case-clustering", "Cluster labeling failed", e);
    }
  }

  return {
    success: true,
    messagesProcessed: messages.length,
    embeddingsCreated: embeddedCount,
    clustersDetected: clusters.size,
    clustersLabeled: clustersCreated,
  };
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const mag = Math.sqrt(magA) * Math.sqrt(magB);
  return mag === 0 ? 0 : dot / mag;
}
