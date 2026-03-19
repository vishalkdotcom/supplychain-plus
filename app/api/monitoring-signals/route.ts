import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { supplierMonitoringSignals } from "@/lib/db/schema";
import { desc, eq, and, sql, count } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { getMonitoringSignalAction } from "@/lib/action-suggestions";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get("supplierId");
    const signalType = searchParams.get("signalType");
    const activeOnly = searchParams.get("activeOnly") !== "false"; // default true

    const conditions = [];
    if (supplierId) {
      conditions.push(eq(supplierMonitoringSignals.supplierId, supplierId));
    }
    if (signalType && signalType !== "all") {
      conditions.push(eq(supplierMonitoringSignals.signalType, signalType));
    }
    if (activeOnly) {
      conditions.push(sql`${supplierMonitoringSignals.resolvedAt} IS NULL`);
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const results = await db
      .select()
      .from(supplierMonitoringSignals)
      .where(where)
      .orderBy(desc(supplierMonitoringSignals.detectedAt))
      .limit(100);

    // Enrich with action suggestions
    const enriched = results.map((signal: typeof results[number]) => ({
      ...signal,
      suggestedAction: getMonitoringSignalAction({
        signalType: signal.signalType,
        severity: signal.severity,
      }),
    }));

    return NextResponse.json(enriched);
  } catch (error) {
    logger.error("api/monitoring-signals", "Failed to fetch signals", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
