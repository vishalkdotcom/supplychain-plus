import { NextResponse } from "next/server";
import { rejectIfDemoJobExecution } from "@/lib/demo-mode/guards";
import { cancelJob } from "@/lib/jobs/queue-engine";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const blocked = rejectIfDemoJobExecution();
  if (blocked) return blocked;

  const { id } = await params;
  const success = await cancelJob(parseInt(id));

  if (!success) {
    return NextResponse.json(
      { error: "Job not found or cannot be cancelled" },
      { status: 400 },
    );
  }

  return NextResponse.json({ success: true, message: `Job #${id} cancelled` });
}
