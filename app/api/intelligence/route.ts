import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { intelligenceBriefing } from "@/lib/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { getMetricsBriefing } from "@/lib/services/metrics-briefing";
import { logger } from "@/lib/logger";

const TAG = "api/intelligence";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const briefingId = searchParams.get("id");

    // 1. Fetch current (or specific historical) briefing
    let current = null;
    if (briefingId) {
      const [row] = await db
        .select()
        .from(intelligenceBriefing)
        .where(eq(intelligenceBriefing.id, parseInt(briefingId)))
        .limit(1);
      current = row ?? null;
    } else {
      const [row] = await db
        .select()
        .from(intelligenceBriefing)
        .orderBy(desc(intelligenceBriefing.generatedAt))
        .limit(1);
      current = row ?? null;
    }

    // 2. Fetch metrics briefing (real-time data)
    const metrics = await getMetricsBriefing();

    // 3. Fetch historical briefing list
    const history = await db.execute<{
      id: number;
      generated_at: string;
      item_count: number;
    }>(sql`
      SELECT
        id,
        generated_at,
        jsonb_array_length(attention_items) as item_count
      FROM intelligence_briefing
      ORDER BY generated_at DESC
      LIMIT 10
    `);

    const stale = !current;

    return NextResponse.json({
      current: current
        ? {
            id: current.id,
            attentionItems: current.attentionItems ?? [],
            generatedAt: current.generatedAt?.toISOString() ?? null,
            expiresAt: current.expiresAt?.toISOString() ?? null,
          }
        : null,
      metrics,
      history: (history as Array<{ id: number; generated_at: string; item_count: number }>).map((h) => ({
        id: h.id,
        generatedAt: typeof h.generated_at === "string" ? h.generated_at : new Date(h.generated_at).toISOString(),
        itemCount: Number(h.item_count),
      })),
      stale,
    });
  } catch (error) {
    logger.error(TAG, "Failed to fetch intelligence briefing", error);
    return NextResponse.json(
      { error: "Failed to fetch intelligence briefing" },
      { status: 500 },
    );
  }
}
