import { NextResponse } from "next/server";
import { withJobTracking } from "@/lib/jobs/with-job-tracking";
import { workerVoiceAnalytics } from "@/lib/jobs/handlers/worker-voice-analytics";

export const maxDuration = 600;

async function _postHandler(_request: Request) {
  const result = await workerVoiceAnalytics();
  if (!result.success) {
    return NextResponse.json({ error: "Worker voice analytics failed" }, { status: 500 });
  }
  return NextResponse.json(result);
}

export const POST = withJobTracking("worker-voice-analytics", _postHandler);
