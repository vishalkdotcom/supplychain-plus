import { NextResponse } from "next/server";
import { withJobTracking } from "@/lib/jobs/with-job-tracking";
import { riskForecast } from "@/lib/jobs/handlers/risk-forecast";

export const maxDuration = 300;

async function _postHandler(_request: Request) {
  const result = await riskForecast();
  if (!result.success) {
    return NextResponse.json({ error: "Risk forecasting failed" }, { status: 500 });
  }
  return NextResponse.json(result);
}

export const POST = withJobTracking("risk-forecast", _postHandler);
