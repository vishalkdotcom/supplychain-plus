import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { supplierRiskScores } from "@/lib/db/schema";
import { query } from "@/lib/db/postgres";
import { isNotNull, sql } from "drizzle-orm";
import { Brand } from "@/types";
import { logger } from "@/lib/logger";
import { isDemoMode } from "@/lib/demo-mode/profile";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";

    if (isDemoMode()) {
      const brandRows = await db.execute(sql`
        SELECT
          parent_company_id as id,
          MAX(CASE WHEN supplier_id = parent_company_id THEN supplier_name END) as name,
          MAX(CASE WHEN supplier_id = parent_company_id THEN country END) as country,
          COUNT(*) FILTER (WHERE supplier_id != parent_company_id)::int as supplier_count,
          ROUND(AVG(risk_score))::int as avg_risk_score
        FROM supplier_risk_scores
        WHERE parent_company_id IS NOT NULL
        GROUP BY parent_company_id
        ORDER BY supplier_count DESC
      `);

      let brands: Brand[] = (Array.isArray(brandRows) ? brandRows : []).map(
        (row: Record<string, unknown>) => ({
          id: String(row.id),
          name: String(row.name || `Brand ${row.id}`),
          country: row.country ? String(row.country) : undefined,
          supplierCount: Number(row.supplier_count ?? 0),
          avgRiskScore: Number(row.avg_risk_score ?? 0),
        }),
      );

      if (search) {
        const searchLower = search.toLowerCase();
        brands = brands.filter(
          (b) =>
            b.name.toLowerCase().includes(searchLower) ||
            (b.country && b.country.toLowerCase().includes(searchLower)),
        );
      }

      return NextResponse.json(brands);
    }

    // 1. Get all brands from the authoritative source: clients_clientrelation
    //    relation_type=0 means PARENT (brand). relation_id points to the brand's clients_clientinfo.id
    const brandsResult = await query(
      `SELECT ci.client_key, ci.name, ci.country
       FROM clients_clientrelation cr
       JOIN clients_clientinfo ci ON ci.id = cr.relation_id
       WHERE cr.relation_type = 0 AND ci.is_deleted = false`,
      [],
    );

    if (brandsResult.rows.length === 0) {
      return NextResponse.json([]);
    }

    // 2. Get risk aggregates from supplier_risk_scores grouped by parentCompanyId (if available)
    const riskAggregates = await db
      .select({
        parentCompanyId: supplierRiskScores.parentCompanyId,
        supplierCount: sql<number>`count(*)::int`,
        avgRiskScore: sql<number>`round(avg(${supplierRiskScores.riskScore}))::int`,
      })
      .from(supplierRiskScores)
      .where(isNotNull(supplierRiskScores.parentCompanyId))
      .groupBy(supplierRiskScores.parentCompanyId);

    const riskMap: Record<string, { supplierCount: number; avgRiskScore: number }> = {};
    for (const agg of riskAggregates) {
      if (agg.parentCompanyId) {
        riskMap[agg.parentCompanyId] = {
          supplierCount: agg.supplierCount,
          avgRiskScore: agg.avgRiskScore,
        };
      }
    }

    // 3. Also count suppliers via the relation mapping tables (authoritative supplier count)
    // Map relation_id -> supplier_count. We need to join this back to brands.
    // clients_clientrelation.id is the relation_id, and relation_id (column) points to clientinfo.id
    // We need a way to map relation table id -> client_key
    const relationSupplierCountResult = await query(
      `SELECT ci.client_key, COUNT(m.clientinfo_id)::int as supplier_count
       FROM clients_clientrelation cr
       JOIN clients_clientinfo ci ON ci.id = cr.relation_id
       LEFT JOIN clients_clientinfotorelationmapping m ON m.clientrelation_id = cr.id
       WHERE cr.relation_type = 0 AND ci.is_deleted = false
       GROUP BY ci.client_key`,
      [],
    );

    const relationCountMap: Record<number, number> = {};
    for (const row of relationSupplierCountResult.rows) {
      relationCountMap[row.client_key] = row.supplier_count;
    }

    // 4. Build brand list — use relation mapping for supplier count, risk scores as enrichment
    let brands: Brand[] = brandsResult.rows.map((row: { client_key: number; name: string; country: string | null }) => {
      const clientKey = String(row.client_key);
      const riskData = riskMap[clientKey];
      const relationCount = relationCountMap[row.client_key] || 0;

      return {
        id: clientKey,
        name: row.name,
        country: row.country || undefined,
        supplierCount: riskData?.supplierCount || relationCount,
        avgRiskScore: riskData?.avgRiskScore || 0,
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
