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

    // Get brand aggregates from supplier_risk_scores for this parentCompanyId
    const [aggregate] = await db
      .select({
        supplierCount: sql<number>`count(*)::int`,
        avgRiskScore: sql<number>`round(avg(${supplierRiskScores.riskScore}))::int`,
      })
      .from(supplierRiskScores)
      .where(eq(supplierRiskScores.parentCompanyId, id));

    // Fetch brand info from clients_clientinfo
    const brandInfoResult = await query(
      `SELECT client_key, name, country
       FROM clients_clientinfo
       WHERE client_key = $1 AND is_deleted = false`,
      [Number(id)],
    );

    const row = brandInfoResult.rows[0];

    const brand: Brand = {
      id,
      name: row?.name || `Brand #${id}`,
      country: row?.country || undefined,
      supplierCount: aggregate?.supplierCount || 0,
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
