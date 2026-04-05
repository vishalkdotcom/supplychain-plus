import { NextRequest, NextResponse } from "next/server";
import { getCachedIntelligence } from "@/lib/cache/queries";
import { logger } from "@/lib/logger";

const TAG = "api/intelligence";

export async function GET(request: NextRequest) {
  try {
    const briefingId = request.nextUrl.searchParams.get("id") || null;
    const data = await getCachedIntelligence(briefingId);
    return NextResponse.json(data);
  } catch (error) {
    logger.error(TAG, "Failed to fetch intelligence briefing", error);
    return NextResponse.json(
      { error: "Failed to fetch intelligence briefing" },
      { status: 500 },
    );
  }
}
