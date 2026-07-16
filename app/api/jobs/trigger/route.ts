import { NextResponse } from "next/server";
import { rejectIfDemoJobExecution } from "@/lib/demo-mode/guards";
import { enqueueJob, enqueueAll } from "@/lib/jobs/queue-engine";
import { JOB_TYPES, type JobType } from "@/lib/jobs/constants";

export async function POST(request: Request) {
  const blocked = rejectIfDemoJobExecution();
  if (blocked) return blocked;

  const body = await request.json().catch(() => ({}));
  const { jobType, all } = body as { jobType?: string; all?: boolean };

  if (all) {
    const runIds = await enqueueAll("manual");
    return NextResponse.json({
      success: true,
      message: `All ${runIds.length} jobs enqueued`,
      runIds,
    });
  }

  if (!jobType || !JOB_TYPES.includes(jobType as JobType)) {
    return NextResponse.json(
      { error: `Invalid job type. Must be one of: ${JOB_TYPES.join(", ")}` },
      { status: 400 },
    );
  }

  const runId = await enqueueJob(jobType as JobType, "manual");
  return NextResponse.json({
    success: true,
    message: `Job ${jobType} enqueued`,
    runId,
  });
}
