import { NextRequest, NextResponse } from "next/server";
import { getMetricsBriefing } from "@/lib/services/metrics-briefing";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sinceParam = searchParams.get("since");
    const since = sinceParam
      ? new Date(sinceParam)
      : undefined;

    const briefing = await getMetricsBriefing(since);
    return NextResponse.json(briefing);
  } catch (error) {
    logger.error("api/metrics/briefing", "Failed to generate briefing", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
