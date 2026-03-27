import { embed, Output } from "ai";
import { getJobModel, getOllamaEmbedding, generateTextWithFallback } from "@/lib/ai/provider";
import { query as mssqlQuery } from "@/lib/db/sql-server";
import { db } from "@/lib/db/drizzle";
import { caseEmbeddings, caseClusters, clusterSnapshots } from "@/lib/db/schema";
import { eq, inArray, isNotNull, sql } from "drizzle-orm";
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
      if (embeddedCount % 100 === 0) {
        logger.info("jobs/case-clustering", `Embedding progress: ${embeddedCount}/${messages.length}`);
      }
    } catch (e) {
      logger.error(
        "jobs/case-clustering",
        `Embedding failed for message ${msg.MessageId} (OLLAMA_BASE_URL=${process.env.OLLAMA_BASE_URL})`,
        e,
      );
    }
  }

  // Step 3: Cluster via pgvector HNSW kNN + Union-Find connected components
  const SIMILARITY_THRESHOLD = Number(process.env.CLUSTER_SIMILARITY_THRESHOLD) || 0.75;
  const clusterStart = performance.now();

  // Build a lookup from messageId → embedding metadata
  const embeddingByMsgId = new Map(allEmbeddings.map((e) => [e.messageId, e]));

  // 3a: For each embedding, find neighbors above threshold via HNSW index
  const uf = new UnionFind();
  for (const emb of allEmbeddings) {
    uf.makeSet(emb.messageId);
  }

  const vecLiteral = (v: number[]) => `[${v.join(",")}]`;

  for (const emb of allEmbeddings) {
    const neighbors = await db.execute(sql`
      SELECT message_id
      FROM case_embeddings
      WHERE message_id != ${emb.messageId}
        AND 1 - (embedding <=> ${vecLiteral(emb.embedding)}::vector) > ${SIMILARITY_THRESHOLD}
      ORDER BY embedding <=> ${vecLiteral(emb.embedding)}::vector
      LIMIT 50
    `);

    for (const row of neighbors as Array<{ message_id: string }>) {
      uf.union(emb.messageId, row.message_id);
    }
  }

  // 3b: Extract connected components → filter by min size and supplier diversity
  const componentMap = new Map<string, string[]>();
  for (const emb of allEmbeddings) {
    const root = uf.find(emb.messageId);
    if (!componentMap.has(root)) componentMap.set(root, []);
    componentMap.get(root)!.push(emb.messageId);
  }

  const clusters: Map<number, Array<(typeof allEmbeddings)[0]>> = new Map();
  let clusterIdx = 0;
  for (const [, memberIds] of componentMap) {
    const members = memberIds.map((id) => embeddingByMsgId.get(id)!);
    const uniqueSuppliers = new Set(members.map((m) => m.companyName));
    if (members.length >= 3 && uniqueSuppliers.size >= 2) {
      clusters.set(clusterIdx, members);
      clusterIdx++;
    }
  }

  logger.info(
    "jobs/case-clustering",
    `Clustering ${allEmbeddings.length} embeddings → ${clusters.size} clusters in ${(performance.now() - clusterStart).toFixed(0)}ms (threshold=${SIMILARITY_THRESHOLD})`,
  );

  // Step 4: Label each cluster with AI (outside transaction — LLM calls are slow)
  const usedLabels = new Map<string, number>();
  const labeledClusters: Array<{
    label: string;
    summary: string;
    severity: string;
    members: typeof allEmbeddings;
    sampleTexts: string[];
    regions: string[];
    caseTypes: string[];
    supplierIds: string[];
  }> = [];

  for (const [, members] of clusters) {
    const sampleTexts = members.slice(0, 5).map((m) => m.text);
    const regions = [...new Set(members.map((m) => m.companyName))];
    const caseTypes = [
      ...new Set(members.map((m) => m.caseType).filter(Boolean)),
    ];
    const supplierIds = [...new Set(members.map((m) => m.companyId).filter(Boolean))];

    try {
      const labelResult = await generateTextWithFallback({
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
        let label = labelResult.output.label.replace(/^\d+\s+/, "");
        const count = usedLabels.get(label) ?? 0;
        usedLabels.set(label, count + 1);
        if (count > 0) {
          label = regions.length > 0 ? `${label} (${regions[0]})` : `${label} #${count + 1}`;
        }

        labeledClusters.push({
          label,
          summary: labelResult.output.summary,
          severity: labelResult.output.severity,
          members,
          sampleTexts,
          regions,
          caseTypes,
          supplierIds,
        });
      }
    } catch (e) {
      logger.error("jobs/case-clustering", "Cluster labeling failed", e);
    }
  }

  // Step 5: Atomic swap — delete old clusters, insert new, update embeddings
  let clustersCreated = 0;

  await db.transaction(async (tx) => {
    // Clear orphaned clusterId references
    await tx
      .update(caseEmbeddings)
      .set({ clusterId: null })
      .where(isNotNull(caseEmbeddings.clusterId));

    // Delete all old clusters
    await tx.delete(caseClusters);

    // Insert new clusters and link embeddings
    for (const cluster of labeledClusters) {
      const inserted = await tx
        .insert(caseClusters)
        .values({
          clusterLabel: cluster.label,
          caseCount: cluster.members.length,
          supplierCount: cluster.regions.length,
          regions: cluster.regions,
          caseTypes: cluster.caseTypes,
          representativeMessages: cluster.sampleTexts,
          aiSummary: cluster.summary,
          severity: cluster.severity,
          supplierIds: cluster.supplierIds,
        })
        .returning({ id: caseClusters.id });

      const clusterId = inserted[0].id;
      const messageIds = cluster.members.map((m) => m.messageId);
      await tx
        .update(caseEmbeddings)
        .set({ clusterId })
        .where(inArray(caseEmbeddings.messageId, messageIds));

      clustersCreated++;
    }
  });

  // Step 6: Record daily snapshot for trend history (survives future re-generations)
  try {
    const severityCounts = { critical: 0, warning: 0, info: 0 };
    let totalCases = 0;
    const allSupplierIds = new Set<string>();
    const details: Array<{ label: string; severity: string; caseCount: number; supplierCount: number }> = [];

    for (const c of labeledClusters) {
      const sev = c.severity as keyof typeof severityCounts;
      if (sev in severityCounts) severityCounts[sev]++;
      totalCases += c.members.length;
      c.supplierIds.forEach((id) => allSupplierIds.add(id));
      details.push({
        label: c.label,
        severity: c.severity,
        caseCount: c.members.length,
        supplierCount: c.regions.length,
      });
    }

    const today = new Date().toISOString().split("T")[0];
    await db
      .insert(clusterSnapshots)
      .values({
        snapshotDate: today,
        totalClusters: clustersCreated,
        critical: severityCounts.critical,
        warning: severityCounts.warning,
        info: severityCounts.info,
        totalCases,
        totalSuppliers: allSupplierIds.size,
        clusterDetails: details,
      })
      .onConflictDoUpdate({
        target: [clusterSnapshots.snapshotDate],
        set: {
          totalClusters: clustersCreated,
          critical: severityCounts.critical,
          warning: severityCounts.warning,
          info: severityCounts.info,
          totalCases,
          totalSuppliers: allSupplierIds.size,
          clusterDetails: details,
        },
      });

    logger.info("jobs/case-clustering", `Snapshot recorded: ${clustersCreated} clusters (${severityCounts.critical}C/${severityCounts.warning}W/${severityCounts.info}I)`);
  } catch (e) {
    logger.warn("jobs/case-clustering", "Snapshot recording failed (non-fatal)", e);
  }

  // Auto-link evidence: cluster case count reduction for remediations linked to clusters
  try {
    const { findAllActiveRemediations, attachAutoEvidence, buildReferenceId } = await import("@/lib/remediation/auto-evidence");
    const activeRemediations = await findAllActiveRemediations();

    for (const remediation of activeRemediations) {
      if (remediation.sourceType !== "cluster" || !remediation.sourceId) continue;

      // Check if the cluster this remediation is linked to has fewer cases
      const [cluster] = await db
        .select()
        .from(caseClusters)
        .where(eq(caseClusters.id, remediation.sourceId))
        .limit(1);

      if (cluster && cluster.caseCount !== null && cluster.caseCount < 3) {
        const refId = buildReferenceId("case_resolved", new Date().toISOString().slice(0, 10), remediation.supplierId, String(cluster.id));
        await attachAutoEvidence(
          remediation.id,
          "case_resolved",
          `Cluster cases reduced to ${cluster.caseCount}`,
          `The systemic pattern "${cluster.clusterLabel}" now has only ${cluster.caseCount} cases remaining.`,
          refId,
        );
      }
    }
  } catch (e) {
    logger.warn("jobs/case-clustering", "Auto-evidence linking failed (non-fatal)", e);
  }

  return {
    success: true,
    messagesProcessed: messages.length,
    embeddingsCreated: embeddedCount,
    clustersDetected: clusters.size,
    clustersLabeled: clustersCreated,
  };
}

class UnionFind {
  private parent = new Map<string, string>();
  private rank = new Map<string, number>();

  makeSet(x: string) {
    this.parent.set(x, x);
    this.rank.set(x, 0);
  }

  find(x: string): string {
    const p = this.parent.get(x);
    if (p === undefined) return x;
    if (p !== x) {
      const root = this.find(p);
      this.parent.set(x, root); // path compression
      return root;
    }
    return x;
  }

  union(a: string, b: string) {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra === rb) return;
    const rankA = this.rank.get(ra) ?? 0;
    const rankB = this.rank.get(rb) ?? 0;
    if (rankA < rankB) {
      this.parent.set(ra, rb);
    } else if (rankA > rankB) {
      this.parent.set(rb, ra);
    } else {
      this.parent.set(rb, ra);
      this.rank.set(ra, rankA + 1);
    }
  }
}
