import { NextResponse } from "next/server";
import { getCachedForecasts } from "@/lib/cache/queries";
import { logger } from "@/lib/logger";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get("supplierId");
    const limit = parseInt(searchParams.get("limit") || "60");

    if (!supplierId) {
      return NextResponse.json(
        { error: "supplierId is required" },
        { status: 400 },
      );
    }

    const results = await getCachedForecasts(supplierId, limit);
    return NextResponse.json(results);
  } catch (error) {
    logger.error("api/forecasts", "Failed to fetch forecasts", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
