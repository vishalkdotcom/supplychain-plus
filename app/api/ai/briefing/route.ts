import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { intelligenceBriefing } from "@/lib/db/schema";
import { desc, gte } from "drizzle-orm";
import { logger } from "@/lib/logger";

const TAG = "api/ai/briefing";

export async function GET() {
  try {
    const now = new Date();

    const [latest] = await db
      .select()
      .from(intelligenceBriefing)
      .where(gte(intelligenceBriefing.expiresAt, now))
      .orderBy(desc(intelligenceBriefing.generatedAt))
      .limit(1);

    if (!latest) {
      logger.info(TAG, "No active briefing found");
      return NextResponse.json({ briefing: null, stale: true });
    }

    return NextResponse.json({
      briefing: latest,
      stale: false,
      generatedAt: latest.generatedAt,
    });
  } catch (error) {
    logger.error(TAG, "Failed to fetch briefing", error);
    return NextResponse.json(
      { error: "Failed to fetch briefing" },
      { status: 500 },
    );
  }
}
