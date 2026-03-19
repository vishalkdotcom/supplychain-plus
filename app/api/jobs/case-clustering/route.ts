import { NextResponse } from "next/server";
import { withJobTracking } from "@/lib/jobs/with-job-tracking";
import { caseClustering } from "@/lib/jobs/handlers/case-clustering";

export const maxDuration = 600;

async function _postHandler(_request: Request) {
  const result = await caseClustering();
  if (!result.success) {
    return NextResponse.json({ error: "Case clustering failed" }, { status: 500 });
  }
  return NextResponse.json(result);
}

export const POST = withJobTracking("case-clustering", _postHandler);
