import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db/postgres";
import { wcGlobalQuery } from "@/lib/db/postgres-wc-global";
import { db } from "@/lib/db/drizzle";
import { supplierRiskScores as supplierRiskScoresSchema } from "@/lib/db/schema";
import { Supplier, PaginatedResponse, RiskReason } from "@/types";
import { inArray } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { deriveRegion } from "@/lib/risk-utils";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const perPage = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("perPage") || "12")),
    );
    const search = searchParams.get("search") || "";
    const riskLevel = searchParams.get("riskLevel") || "all";
    const region = searchParams.get("region") || "all";
    const parentCompanyId = searchParams.get("parentCompanyId") || "";
    const offset = (page - 1) * perPage;

    // Build dynamic WHERE clauses for basic supplier info
    const conditions: string[] = [
      "is_deleted = false",
      "client_key IS NOT NULL",
    ];
    const params: (string | number)[] = [];
    let paramIndex = 1;

    if (search) {
      conditions.push(`name ILIKE $${paramIndex}`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = conditions.join(" AND ");

    // Fetch all matching suppliers from wovo_new without pagination yet
    // since we need to sort and filter by risk_score which lives in wovo_ai
    const result = await query(
      `SELECT 
        id, 
        client_key,
        name, 
        country, 
        is_active
      FROM clients_clientinfo
      WHERE ${whereClause}`,
      params,
    );
    
    interface ClientRow {
      id: number;
      client_key: number;
      name: string;
      country: string | null;
      is_active: boolean;
    }
    
    const rows: ClientRow[] = result.rows;

    // Fetch risk scores from wovo_ai via Drizzle
    const clientKeysForRisk = rows.map((r) => String(r.client_key));
    type RiskScoreRow = typeof supplierRiskScoresSchema.$inferSelect;
    const riskScoresMap: Record<string, RiskScoreRow> = {};
    
    // Collect all parentCompanyIds to identify brand rows (they should not appear as suppliers)
    const brandIds = new Set<string>();
    if (clientKeysForRisk.length > 0) {
      const riskData = await db.select().from(supplierRiskScoresSchema).where(inArray(supplierRiskScoresSchema.supplierId, clientKeysForRisk));
      for (const r of riskData) {
        riskScoresMap[r.supplierId] = r;
        if (r.parentCompanyId) {
          brandIds.add(r.parentCompanyId);
        }
      }
    }

    interface MergedRow extends ClientRow {
      risk_score: number;
      case_score: number;
      survey_score: number;
      training_score: number;
      engagement_score: number;
      reasons: RiskReason[];
      cached_region: string | null;
      latitude: number | null;
      longitude: number | null;
      parent_company_id: string | null;
    }

    // Merge and filter
    let mergedRows: MergedRow[] = rows.map((row) => {
      const riskData = riskScoresMap[String(row.client_key)];
      return {
        ...row,
        risk_score: riskData?.riskScore || 50,
        case_score: riskData?.caseScore || 50,
        survey_score: riskData?.surveyScore || 50,
        training_score: riskData?.trainingScore || 50,
        engagement_score: riskData?.engagementScore || 50,
        reasons: riskData?.reasons || [],
        cached_region: riskData?.region || null,
        latitude: riskData?.latitude || null,
        longitude: riskData?.longitude || null,
        parent_company_id: riskData?.parentCompanyId || null,
      };
    });

    // Exclude brand/parent company rows — they should only appear on the Brands page
    if (brandIds.size > 0) {
      mergedRows = mergedRows.filter(
        (row: MergedRow) => !brandIds.has(String(row.client_key)),
      );
    }

    // Filter by parentCompanyId (brand)
    if (parentCompanyId) {
      mergedRows = mergedRows.filter(
        (row: MergedRow) => row.parent_company_id === parentCompanyId,
      );
    }

    if (riskLevel !== "all") {
      mergedRows = mergedRows.filter((row: MergedRow) => {
        const score = row.risk_score;
        if (riskLevel === "high") return score > 70;
        if (riskLevel === "medium") return score > 30 && score <= 70;
        if (riskLevel === "low") return score <= 30;
        return true;
      });
    }

    // Filter by region
    if (region !== "all") {
      mergedRows = mergedRows.filter((row: MergedRow) => {
        const supplierRegion = row.cached_region || deriveRegion(row.country);
        return supplierRegion === region;
      });
    }

    // Sort by risk_score DESC
    mergedRows.sort((a, b) => b.risk_score - a.risk_score);

    // Apply pagination
    const total = mergedRows.length;
    const paginatedRows = mergedRows.slice(offset, offset + perPage);

    // Fetch worker counts from wc_global
    const clientKeysForWorkers = paginatedRows
      .map((r) => Number(r.client_key))
      .filter(Boolean);
    const workerCountMap: Record<number, number> = {};
    if (clientKeysForWorkers.length > 0) {
      try {
        const workerRes = await wcGlobalQuery(
          `SELECT client_id, COUNT(*) as count 
           FROM mdl_participant 
           WHERE client_id = ANY($1) AND is_deleted = false 
           GROUP BY client_id`,
          [clientKeysForWorkers],
        );
        for (const row of workerRes.rows) {
          workerCountMap[row.client_id] = parseInt(row.count);
        }
      } catch (err) {
        logger.error("api/suppliers", "Failed to fetch worker counts from wc_global", err);
      }
    }

    const suppliers: Supplier[] = paginatedRows.map((row) => ({
      id: String(row.client_key),
      name: row.name,
      region: row.cached_region || deriveRegion(row.country),
      country: row.country || "Unknown",
      location: row.country || "Unknown",
      workerCount: workerCountMap[Number(row.client_key)] || 0,
      contactName: "N/A",
      contactEmail: "N/A",
      riskScore: row.risk_score,
      riskLevel:
        row.risk_score > 70
          ? "high"
          : row.risk_score > 30
            ? "medium"
            : "low",
      status: row.is_active ? "active" : "inactive",
      lastActivityDate: new Date().toISOString().split("T")[0],
      riskBreakdown: {
        caseScore: row.case_score,
        surveyScore: row.survey_score,
        trainingScore: row.training_score,
        engagementScore: row.engagement_score,
        reasons: row.reasons,
      },
      ...(row.latitude != null && { latitude: row.latitude }),
      ...(row.longitude != null && { longitude: row.longitude }),
      ...(row.parent_company_id && { parentCompanyId: row.parent_company_id }),
    }));

    const totalPages = Math.ceil(total / perPage);

    const response: PaginatedResponse<Supplier> = {
      data: suppliers,
      total,
      page,
      perPage,
      totalPages,
    };

    return NextResponse.json(response);
  } catch (error) {
    logger.error("api/suppliers", "Failed to fetch suppliers", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

