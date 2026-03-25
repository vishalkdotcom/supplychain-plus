import { NextResponse } from "next/server";
import { withJobTracking } from "@/lib/jobs/with-job-tracking";
import { regionalBenchmarking } from "@/lib/jobs/handlers/regional-benchmarking";

async function _postHandler(_request: Request) {
  const result = await regionalBenchmarking();
  if (!result.success) {
    return NextResponse.json({ error: "Failed to compute regional benchmarks" }, { status: 500 });
  }
  return NextResponse.json(result);
}

export const POST = withJobTracking("regional-benchmarking", _postHandler);
