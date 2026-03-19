import { db } from "@/lib/db/drizzle";
import { client } from "@/lib/db/drizzle";
import { jobRuns, jobQueue, jobSchedules } from "@/lib/db/schema";
import { eq, and, lte } from "drizzle-orm";
import { logger } from "@/lib/logger";
import {
  type JobType,
  OLLAMA_JOBS,
  RUN_ALL_ORDER,
} from "./constants";
import { JOB_REGISTRY } from "./handlers";

const POLL_INTERVAL_MS = 10_000; // 10 seconds
const SCHEDULE_CHECK_INTERVAL_MS = 60_000; // 60 seconds
const STALE_LOCK_THRESHOLD_MS = 30 * 60 * 1000; // 30 minutes

let pollerInterval: ReturnType<typeof setInterval> | null = null;
let scheduleInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Enqueue a single job. Creates a job_runs record and a job_queue entry.
 */
export async function enqueueJob(
  jobType: JobType,
  triggeredBy: "manual" | "schedule" | "seed-script" = "manual",
  priority: number = 0,
): Promise<number> {
  const [run] = await db
    .insert(jobRuns)
    .values({
      jobType,
      status: "queued",
      triggeredBy,
    })
    .returning({ id: jobRuns.id });

  await db.insert(jobQueue).values({
    jobRunId: run.id,
    jobType,
    priority,
    requiresOllama: OLLAMA_JOBS.has(jobType),
    status: "waiting",
  });

  logger.info("jobs/queue", `Enqueued ${jobType} (run #${run.id})`);
  return run.id;
}

/**
 * Enqueue all jobs in dependency order for "Run All".
 */
export async function enqueueAll(
  triggeredBy: "manual" | "schedule" = "manual",
): Promise<number[]> {
  const runIds: number[] = [];
  for (let i = 0; i < RUN_ALL_ORDER.length; i++) {
    const runId = await enqueueJob(RUN_ALL_ORDER[i], triggeredBy, i);
    runIds.push(runId);
  }
  return runIds;
}

/**
 * Cancel a queued or running job.
 */
export async function cancelJob(jobRunId: number): Promise<boolean> {
  const [run] = await db
    .select()
    .from(jobRuns)
    .where(eq(jobRuns.id, jobRunId))
    .limit(1);

  if (!run || (run.status !== "queued" && run.status !== "running")) {
    return false;
  }

  await db
    .update(jobRuns)
    .set({ status: "cancelled", completedAt: new Date() })
    .where(eq(jobRuns.id, jobRunId));

  await db
    .update(jobQueue)
    .set({ status: "done" })
    .where(eq(jobQueue.jobRunId, jobRunId));

  logger.info("jobs/queue", `Cancelled job run #${jobRunId}`);
  return true;
}

/**
 * Poll the queue for waiting jobs and execute them.
 * Uses raw SQL for FOR UPDATE SKIP LOCKED (not supported by Drizzle ORM).
 */
async function pollQueue(): Promise<void> {
  try {
    // Reset stale locks (jobs that crashed)
    await db
      .update(jobQueue)
      .set({ status: "waiting", lockedAt: null })
      .where(
        and(
          eq(jobQueue.status, "processing"),
          lte(
            jobQueue.lockedAt,
            new Date(Date.now() - STALE_LOCK_THRESHOLD_MS),
          ),
        ),
      );

    // Pick the next waiting job using FOR UPDATE SKIP LOCKED
    const result = await client`
      SELECT jq.id as queue_id, jq.job_run_id, jq.job_type, jq.requires_ollama
      FROM job_queue jq
      WHERE jq.status = 'waiting'
      ORDER BY jq.priority ASC, jq.created_at ASC
      LIMIT 1
      FOR UPDATE SKIP LOCKED
    `;

    if (result.length === 0) return;

    const item = result[0];

    // If this job requires Ollama, check no other Ollama job is processing
    if (item.requires_ollama) {
      const ollamaRunning = await client`
        SELECT COUNT(*) as count FROM job_queue
        WHERE status = 'processing' AND requires_ollama = true
      `;
      if (parseInt(ollamaRunning[0].count) > 0) {
        return; // Wait for current Ollama job to finish
      }
    }

    // Lock the job
    await db
      .update(jobQueue)
      .set({ status: "processing", lockedAt: new Date() })
      .where(eq(jobQueue.id, item.queue_id));

    // Execute the job directly via the handler registry (no HTTP fetch)
    const handler = JOB_REGISTRY[item.job_type as JobType];
    if (!handler) {
      logger.error("jobs/queue", `No handler registered for job type: ${item.job_type}`);
      await db.update(jobRuns)
        .set({ status: "failed", completedAt: new Date(), error: `Unknown job type: ${item.job_type}` })
        .where(eq(jobRuns.id, item.job_run_id));
      await db.update(jobQueue).set({ status: "done" }).where(eq(jobQueue.id, item.queue_id));
      return;
    }

    logger.info("jobs/queue", `Starting ${item.job_type} (run #${item.job_run_id})`);

    // Update run to "running"
    await db.update(jobRuns)
      .set({ status: "running", startedAt: new Date() })
      .where(eq(jobRuns.id, item.job_run_id));

    const startTime = Date.now();

    // Fire the job in background — don't block the poller
    handler().then(async (result) => {
      const durationMs = Date.now() - startTime;
      const { success: _, ...resultSummary } = result;
      await db.update(jobRuns)
        .set({ status: "completed", completedAt: new Date(), durationMs, resultSummary })
        .where(eq(jobRuns.id, item.job_run_id));
      await db.update(jobQueue).set({ status: "done" }).where(eq(jobQueue.id, item.queue_id));
      logger.info("jobs/queue", `Completed ${item.job_type} (run #${item.job_run_id}) in ${(durationMs / 1000).toFixed(1)}s`);
    }).catch(async (err) => {
      const durationMs = Date.now() - startTime;
      const errorMessage = err instanceof Error ? err.message : String(err);
      logger.error("jobs/queue", `Failed ${item.job_type} (run #${item.job_run_id})`, err);
      await db.update(jobRuns)
        .set({ status: "failed", completedAt: new Date(), durationMs, error: errorMessage })
        .where(eq(jobRuns.id, item.job_run_id));
      await db.update(jobQueue).set({ status: "done" }).where(eq(jobQueue.id, item.queue_id));
    });
  } catch (error) {
    logger.error("jobs/queue", "Queue poll error", error);
  }
}

/**
 * Check for due schedules and enqueue them.
 */
async function checkSchedules(): Promise<void> {
  try {
    const now = new Date();
    const dueSchedules = await db
      .select()
      .from(jobSchedules)
      .where(
        and(
          eq(jobSchedules.enabled, true),
          lte(jobSchedules.nextRunAt, now),
        ),
      );

    for (const schedule of dueSchedules) {
      await enqueueJob(schedule.jobType as JobType, "schedule");

      // Compute next run time from cron expression
      const nextRun = getNextCronDate(schedule.cronExpression);
      await db
        .update(jobSchedules)
        .set({ lastRunAt: now, nextRunAt: nextRun })
        .where(eq(jobSchedules.id, schedule.id));

      logger.info(
        "jobs/scheduler",
        `Scheduled run for ${schedule.jobType}, next at ${nextRun?.toISOString()}`,
      );
    }
  } catch (error) {
    logger.error("jobs/scheduler", "Schedule check error", error);
  }
}

/**
 * Simple cron expression parser for common patterns.
 * Supports: "M H * * *" (daily), "M H * * D" (weekly), "M H D * *" (monthly)
 */
export function getNextCronDate(expression: string): Date {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) return new Date(Date.now() + 86400000); // fallback: 24h

  const [minute, hour, dayOfMonth, , dayOfWeek] = parts;
  const now = new Date();
  const next = new Date(now);

  next.setSeconds(0, 0);
  next.setMinutes(parseInt(minute) || 0);
  next.setHours(parseInt(hour) || 0);

  if (dayOfWeek !== "*") {
    // Weekly: advance to next matching day of week
    const targetDay = parseInt(dayOfWeek);
    let daysAhead = targetDay - now.getDay();
    if (daysAhead <= 0) daysAhead += 7;
    next.setDate(now.getDate() + daysAhead);
  } else if (dayOfMonth !== "*") {
    // Monthly: advance to next matching day of month
    next.setDate(parseInt(dayOfMonth) || 1);
    if (next <= now) next.setMonth(next.getMonth() + 1);
  } else {
    // Daily: if time already passed today, move to tomorrow
    if (next <= now) next.setDate(next.getDate() + 1);
  }

  return next;
}

/**
 * Start the queue poller and schedule checker.
 * Called from instrumentation.ts on server startup.
 */
export function startQueuePoller(): void {
  if (pollerInterval) return; // Already running

  logger.info("jobs/queue", "Starting queue poller (10s interval)");
  pollerInterval = setInterval(pollQueue, POLL_INTERVAL_MS);

  logger.info("jobs/scheduler", "Starting schedule checker (60s interval)");
  scheduleInterval = setInterval(checkSchedules, SCHEDULE_CHECK_INTERVAL_MS);
}

export function stopQueuePoller(): void {
  if (pollerInterval) {
    clearInterval(pollerInterval);
    pollerInterval = null;
  }
  if (scheduleInterval) {
    clearInterval(scheduleInterval);
    scheduleInterval = null;
  }
}
