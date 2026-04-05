import { NextRequest, NextResponse } from "next/server";
import { getCachedMetrics } from "@/lib/cache/queries";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const parentCompanyId =
      request.nextUrl.searchParams.get("parentCompanyId") || "";
    const metrics = await getCachedMetrics(parentCompanyId);
    return NextResponse.json(metrics);
  } catch (error) {
    logger.error("api/metrics", "Failed to fetch metrics", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
