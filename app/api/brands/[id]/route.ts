import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { supplierRiskScores } from "@/lib/db/schema";
import { query } from "@/lib/db/postgres";
import { Brand } from "@/types";
import { eq, sql } from "drizzle-orm";
import { logger } from "@/lib/logger";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Fetch brand info from clients_clientinfo
    const brandInfoResult = await query(
      `SELECT client_key, name, country
       FROM clients_clientinfo
       WHERE client_key = $1 AND is_deleted = false`,
      [Number(id)],
    );

    const row = brandInfoResult.rows[0];

    // Get risk aggregates if available
    const [aggregate] = await db
      .select({
        supplierCount: sql<number>`count(*)::int`,
        avgRiskScore: sql<number>`round(avg(${supplierRiskScores.riskScore}))::int`,
      })
      .from(supplierRiskScores)
      .where(eq(supplierRiskScores.parentCompanyId, id));

    // Fallback supplier count from relation mapping tables
    let supplierCount = aggregate?.supplierCount || 0;
    if (supplierCount === 0) {
      const countResult = await query(
        `SELECT COUNT(m.clientinfo_id)::int as supplier_count
         FROM clients_clientrelation cr
         JOIN clients_clientinfo ci ON ci.id = cr.relation_id
         JOIN clients_clientinfotorelationmapping m ON m.clientrelation_id = cr.id
         WHERE cr.relation_type = 0 AND ci.client_key = $1`,
        [Number(id)],
      );
      supplierCount = countResult.rows[0]?.supplier_count || 0;
    }

    const brand: Brand = {
      id,
      name: row?.name || `Brand #${id}`,
      country: row?.country || undefined,
      supplierCount,
      avgRiskScore: aggregate?.avgRiskScore || 0,
    };

    return NextResponse.json(brand);
  } catch (error) {
    logger.error("api/brands/[id]", "Failed to fetch brand detail", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
