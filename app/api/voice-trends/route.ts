import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { workerVoiceTrends } from "@/lib/db/schema";
import { desc, eq, and, gte, lte, isNull } from "drizzle-orm";
import { logger } from "@/lib/logger";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get("supplierId");
    const monthFrom = searchParams.get("monthFrom");
    const monthTo = searchParams.get("monthTo");

    const conditions = [];

    if (supplierId && supplierId !== "all") {
      conditions.push(eq(workerVoiceTrends.supplierId, supplierId));
    } else {
      conditions.push(isNull(workerVoiceTrends.supplierId));
    }

    if (monthFrom) {
      conditions.push(gte(workerVoiceTrends.month, monthFrom));
    }
    if (monthTo) {
      conditions.push(lte(workerVoiceTrends.month, monthTo));
    }

    const results = await db
      .select()
      .from(workerVoiceTrends)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(workerVoiceTrends.month));

    return NextResponse.json(results);
  } catch (error) {
    logger.error("api/voice-trends", "Failed to fetch voice trends", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
