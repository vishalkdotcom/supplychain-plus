import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { jobQueue, jobRuns } from "@/lib/db/schema";
import { inArray } from "drizzle-orm";

export async function GET() {
  // Get all active queue items (waiting or processing)
  const activeItems = await db
    .select({
      queueId: jobQueue.id,
      jobRunId: jobQueue.jobRunId,
      jobType: jobQueue.jobType,
      queueStatus: jobQueue.status,
      requiresOllama: jobQueue.requiresOllama,
      lockedAt: jobQueue.lockedAt,
      queuedAt: jobQueue.createdAt,
      retryCount: jobQueue.retryCount,
      maxRetries: jobQueue.maxRetries,
      timeoutMs: jobQueue.timeoutMs,
      retryAfter: jobQueue.retryAfter,
    })
    .from(jobQueue)
    .where(inArray(jobQueue.status, ["waiting", "processing", "retry_pending"]))
    .orderBy(jobQueue.priority, jobQueue.createdAt);

  // Get corresponding run info
  const runIds = activeItems.map((i) => i.jobRunId);
  const runs =
    runIds.length > 0
      ? await db
          .select()
          .from(jobRuns)
          .where(inArray(jobRuns.id, runIds))
      : [];

  const runMap = new Map(runs.map((r) => [r.id, r]));

  const queue = activeItems.map((item) => ({
    ...item,
    run: runMap.get(item.jobRunId),
  }));

  const running = queue.filter((i) => i.queueStatus === "processing");
  const waiting = queue.filter((i) => i.queueStatus === "waiting");
  const retrying = queue.filter((i) => i.queueStatus === "retry_pending");

  return NextResponse.json({
    running,
    waiting,
    retrying,
    runningCount: running.length,
    waitingCount: waiting.length,
    retryingCount: retrying.length,
  });
}
