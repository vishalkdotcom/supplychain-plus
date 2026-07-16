import { NextResponse } from "next/server";
import { rejectIfDemoMutation } from "@/lib/demo-mode/guards";
import { db } from "@/lib/db/drizzle";
import { jobSchedules } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getNextCronDate } from "@/lib/jobs/queue-engine";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const blocked = rejectIfDemoMutation();
  if (blocked) return blocked;

  const { id } = await params;
  const body = await request.json();
  const { enabled, cronExpression } = body as {
    enabled?: boolean;
    cronExpression?: string;
  };

  const updates: Record<string, unknown> = {};
  if (typeof enabled === "boolean") updates.enabled = enabled;
  if (cronExpression) {
    updates.cronExpression = cronExpression;
    updates.nextRunAt = getNextCronDate(cronExpression);
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No updates provided" }, { status: 400 });
  }

  const [updated] = await db
    .update(jobSchedules)
    .set(updates)
    .where(eq(jobSchedules.id, parseInt(id)))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const blocked = rejectIfDemoMutation();
  if (blocked) return blocked;

  const { id } = await params;
  const [deleted] = await db
    .delete(jobSchedules)
    .where(eq(jobSchedules.id, parseInt(id)))
    .returning();

  if (!deleted) {
    return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
