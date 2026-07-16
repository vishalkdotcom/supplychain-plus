import { NextResponse } from "next/server";
import { withJobTracking } from "@/lib/jobs/with-job-tracking";
import { workerVoiceAnalytics } from "@/lib/jobs/handlers/worker-voice-analytics";

export const maxDuration = 300; // Hobby plan max (jobs blocked in Demo Mode)

async function _postHandler(request: Request) {
  const url = new URL(request.url);
  const limitParam = url.searchParams.get("limit");
  const limit = limitParam ? parseInt(limitParam, 10) : undefined;

  const result = await workerVoiceAnalytics(limit ? { limit } : undefined);
  if (!result.success) {
    return NextResponse.json({ error: "Worker voice analytics failed" }, { status: 500 });
  }
  return NextResponse.json(result);
}

export const POST = withJobTracking("worker-voice-analytics", _postHandler);
