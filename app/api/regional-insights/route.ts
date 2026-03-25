import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { regionalBenchmarks } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { logger } from "@/lib/logger";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get("region");
    const supplierId = searchParams.get("supplierId");

    // Fetch all benchmarks (or filtered by region)
    const where = region ? eq(regionalBenchmarks.region, region) : undefined;

    const results = await db
      .select()
      .from(regionalBenchmarks)
      .where(where)
      .orderBy(desc(regionalBenchmarks.supplierCount));

    // If filtering by supplierId, trim peerComparisons to highlight that supplier
    const regions = results.map((r) => {
      if (supplierId) {
        const peers = (r.peerComparisons ?? []) as Array<{ supplierId: string }>;
        const supplierComparison = peers.find(
          (p) => p.supplierId === supplierId,
        );
        return {
          ...r,
          focusedSupplier: supplierComparison ?? null,
        };
      }
      return r;
    });

    const allRegions = results.map((r) => r.region).sort();

    const latestComputed = results.length > 0
      ? results.reduce((latest, r) =>
          r.computedAt > latest ? r.computedAt : latest,
        results[0].computedAt)
      : null;

    return NextResponse.json({
      regions,
      allRegions,
      computedAt: latestComputed?.toISOString() ?? null,
    });
  } catch (error) {
    logger.error("api/regional-insights", "Failed to fetch regional insights", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
