import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { supplierRiskScores } from "@/lib/db/schema";
import { query } from "@/lib/db/postgres";
import { isNotNull, sql } from "drizzle-orm";
import { Brand } from "@/types";
import { extractEnglishFromMlang } from "@/lib/mlang";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";

    // Get brand aggregates from supplier_risk_scores grouped by parentCompanyId
    const brandAggregates = await db
      .select({
        parentCompanyId: supplierRiskScores.parentCompanyId,
        supplierCount: sql<number>`count(*)::int`,
        avgRiskScore: sql<number>`round(avg(${supplierRiskScores.riskScore}))::int`,
      })
      .from(supplierRiskScores)
      .where(isNotNull(supplierRiskScores.parentCompanyId))
      .groupBy(supplierRiskScores.parentCompanyId);

    if (brandAggregates.length === 0) {
      return NextResponse.json([]);
    }

    // Fetch brand names from clients_clientinfo in wovo_new
    const brandClientKeys = brandAggregates.map((b: { parentCompanyId: string | null }) =>
      Number(b.parentCompanyId),
    );
    const brandInfoResult = await query(
      `SELECT client_key, name, country
       FROM clients_clientinfo
       WHERE client_key = ANY($1) AND is_deleted = false`,
      [brandClientKeys],
    );

    const brandInfoMap: Record<
      number,
      { name: string; country: string | null }
    > = {};
    for (const row of brandInfoResult.rows) {
      brandInfoMap[row.client_key] = {
        name: row.name,
        country: row.country,
      };
    }

    // Merge aggregates with brand info
    let brands: Brand[] = brandAggregates.map((agg: { parentCompanyId: string | null; supplierCount: number; avgRiskScore: number }) => {
      const info = brandInfoMap[Number(agg.parentCompanyId)];
      return {
        id: agg.parentCompanyId!,
        name: info
          ? extractEnglishFromMlang(info.name)
          : `Brand #${agg.parentCompanyId}`,
        country: info?.country || undefined,
        supplierCount: agg.supplierCount,
        avgRiskScore: agg.avgRiskScore,
      };
    });

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      brands = brands.filter(
        (b) =>
          b.name.toLowerCase().includes(searchLower) ||
          (b.country && b.country.toLowerCase().includes(searchLower)),
      );
    }

    // Sort by supplier count descending
    brands.sort((a, b) => b.supplierCount - a.supplierCount);

    return NextResponse.json(brands);
  } catch (error) {
    logger.error("api/brands", "Failed to fetch brands", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
