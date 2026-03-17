import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { jobSchedules } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { JOB_TYPES, type JobType } from "@/lib/jobs/constants";
import { getNextCronDate } from "@/lib/jobs/queue-engine";

export async function GET() {
  const schedules = await db
    .select()
    .from(jobSchedules)
    .orderBy(desc(jobSchedules.createdAt));

  return NextResponse.json(schedules);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { jobType, cronExpression } = body as {
    jobType?: string;
    cronExpression?: string;
  };

  if (!jobType || !JOB_TYPES.includes(jobType as JobType)) {
    return NextResponse.json(
      { error: `Invalid job type. Must be one of: ${JOB_TYPES.join(", ")}` },
      { status: 400 },
    );
  }

  if (!cronExpression) {
    return NextResponse.json(
      { error: "cronExpression is required" },
      { status: 400 },
    );
  }

  const nextRunAt = getNextCronDate(cronExpression);

  const [schedule] = await db
    .insert(jobSchedules)
    .values({
      jobType,
      cronExpression,
      nextRunAt,
    })
    .returning();

  return NextResponse.json(schedule, { status: 201 });
}
