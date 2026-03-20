import { NextResponse } from "next/server";
import { withJobTracking } from "@/lib/jobs/with-job-tracking";
import { generateBriefing } from "@/lib/jobs/handlers/generate-briefing";

async function _postHandler(_request: Request) {
  const result = await generateBriefing();
  if (!result.success) {
    return NextResponse.json({ error: "Failed to generate briefing" }, { status: 500 });
  }
  return NextResponse.json(result);
}

export const POST = withJobTracking("generate-briefing", _postHandler);
