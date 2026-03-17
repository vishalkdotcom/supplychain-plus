import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { jobRuns, jobQueue } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "@/lib/logger";
import type { JobType } from "./constants";

/**
 * Wraps a job handler to automatically track execution in job_runs.
 * When called with a jobRunId (from the queue), it updates the existing run record.
 * When called directly (e.g., from a seed script), it creates a new run record.
 */
export function withJobTracking(
  jobType: JobType,
  handler: (request: Request) => Promise<NextResponse>,
) {
  return async (request: Request): Promise<NextResponse> => {
    // Check if this was triggered by the queue (jobRunId in body or header)
    const clonedRequest = request.clone();
    let jobRunId: number | null = null;

    try {
      const body = await clonedRequest.json().catch(() => ({}));
      jobRunId = body?._jobRunId ?? null;
    } catch {
      // No body or not JSON — that's fine
    }

    // If no jobRunId, create a new run record (direct invocation)
    if (!jobRunId) {
      const [run] = await db
        .insert(jobRuns)
        .values({
          jobType,
          status: "running",
          triggeredBy: "seed-script",
          startedAt: new Date(),
        })
        .returning({ id: jobRuns.id });
      jobRunId = run.id;
    } else {
      // Update existing run to running
      await db
        .update(jobRuns)
        .set({ status: "running", startedAt: new Date() })
        .where(eq(jobRuns.id, jobRunId));
    }

    const startTime = Date.now();

    try {
      const response = await handler(request);
      const durationMs = Date.now() - startTime;

      // Extract result summary from the response body
      let resultSummary: Record<string, unknown> = {};
      try {
        const responseClone = response.clone();
        const responseBody = await responseClone.json();
        // Remove generic fields, keep job-specific data
        const { success, error, ...rest } = responseBody;
        resultSummary = rest;
      } catch {
        // Response wasn't JSON — that's ok
      }

      await db
        .update(jobRuns)
        .set({
          status: "completed",
          completedAt: new Date(),
          durationMs,
          resultSummary,
        })
        .where(eq(jobRuns.id, jobRunId));

      // Mark queue entry as done
      await db
        .update(jobQueue)
        .set({ status: "done" })
        .where(eq(jobQueue.jobRunId, jobRunId));

      return response;
    } catch (error) {
      const durationMs = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      await db
        .update(jobRuns)
        .set({
          status: "failed",
          completedAt: new Date(),
          durationMs,
          error: errorMessage,
        })
        .where(eq(jobRuns.id, jobRunId));

      await db
        .update(jobQueue)
        .set({ status: "done" })
        .where(eq(jobQueue.jobRunId, jobRunId));

      logger.error("jobs/tracking", `Job ${jobType} failed`, error);
      throw error;
    }
  };
}
