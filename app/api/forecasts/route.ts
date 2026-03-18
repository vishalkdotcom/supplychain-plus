import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { supplierRiskForecast } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";
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

    const results = await db
      .select()
      .from(supplierRiskForecast)
      .where(eq(supplierRiskForecast.supplierId, supplierId))
      .orderBy(asc(supplierRiskForecast.forecastDate))
      .limit(limit);

    return NextResponse.json(results);
  } catch (error) {
    logger.error("api/forecasts", "Failed to fetch forecasts", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
