import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db/postgres";
import { wcGlobalQuery } from "@/lib/db/postgres-wc-global";
import { Supplier, PaginatedResponse } from "@/types";
import { extractEnglishFromMlang } from "@/lib/mlang";

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
    const offset = (page - 1) * perPage;

    // Build dynamic WHERE clauses
    const conditions: string[] = [
      "c.is_deleted = false",
      "c.client_key IS NOT NULL",
    ];
    const params: any[] = [];
    let paramIndex = 1;

    if (search) {
      conditions.push(`c.name ILIKE $${paramIndex}`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = conditions.join(" AND ");

    // Count total
    const countResult = await query(
      `SELECT COUNT(*) as total FROM clients_clientinfo c
       LEFT JOIN supplier_risk_scores r ON CAST(c.client_key AS VARCHAR) = r.supplier_id
       WHERE ${whereClause}`,
      params,
    );
    let total = parseInt(countResult.rows[0].total);

    // Fetch paginated data
    const result = await query(
      `SELECT 
        c.id, 
        c.client_key,
        c.name, 
        c.country, 
        c.is_active,
        r.risk_score,
        r.case_score,
        r.survey_score,
        r.training_score,
        r.engagement_score,
        r.reasons
      FROM clients_clientinfo c
      LEFT JOIN supplier_risk_scores r ON CAST(c.client_key AS VARCHAR) = r.supplier_id
      WHERE ${whereClause}
      ORDER BY r.risk_score DESC NULLS LAST, c.name ASC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, perPage, offset],
    );

    // Apply risk level filter in-memory (since it's derived from risk_score)
    let rows = result.rows;
    if (riskLevel !== "all") {
      // Re-count with risk filter applied
      const allRows = await query(
        `SELECT c.client_key, r.risk_score
         FROM clients_clientinfo c
         LEFT JOIN supplier_risk_scores r ON CAST(c.client_key AS VARCHAR) = r.supplier_id
         WHERE ${whereClause}`,
        params,
      );
      const filteredKeys = allRows.rows.filter((row: any) => {
        const score = row.risk_score || 50;
        if (riskLevel === "high") return score > 70;
        if (riskLevel === "medium") return score > 30 && score <= 70;
        if (riskLevel === "low") return score <= 30;
        return true;
      });
      total = filteredKeys.length;
      const keySet = new Set(filteredKeys.map((r: any) => r.client_key));
      rows = rows.filter((r: any) => keySet.has(r.client_key));
    }

    // Fetch worker counts from wc_global
    const clientKeys = rows
      .map((r: any) => parseInt(r.client_key))
      .filter(Boolean);
    const workerCountMap: Record<number, number> = {};
    if (clientKeys.length > 0) {
      try {
        const workerRes = await wcGlobalQuery(
          `SELECT client_id, COUNT(*) as count 
           FROM mdl_participant 
           WHERE client_id = ANY($1) AND is_deleted = false 
           GROUP BY client_id`,
          [clientKeys],
        );
        for (const row of workerRes.rows) {
          workerCountMap[row.client_id] = parseInt(row.count);
        }
      } catch (err) {
        console.error("Error fetching worker counts from wc_global:", err);
      }
    }

    const suppliers: Supplier[] = rows.map((row: any) => ({
      id: String(row.client_key),
      name: extractEnglishFromMlang(row.name),
      region: deriveRegion(row.country),
      country: row.country || "Unknown",
      location: row.country || "Unknown",
      workerCount: workerCountMap[parseInt(row.client_key)] || 0,
      contactName: "N/A", // TODO: add contact columns to clients_clientinfo
      contactEmail: "N/A",
      riskScore: row.risk_score || 50,
      riskLevel:
        (row.risk_score || 50) > 70
          ? "high"
          : (row.risk_score || 50) > 30
            ? "medium"
            : "low",
      status: row.is_active ? "active" : "inactive",
      lastActivityDate: new Date().toISOString().split("T")[0], // TODO: derive from latest case/survey date
      riskBreakdown: {
        caseScore: row.case_score || 50,
        surveyScore: row.survey_score || 50,
        trainingScore: row.training_score || 50,
        engagementScore: row.engagement_score || 50,
        reasons: Array.isArray(row.reasons) ? row.reasons : [],
      },
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
    console.error("Error fetching suppliers:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

const REGION_MAP: Record<string, string> = {
  // Asia
  Vietnam: "Asia",
  Cambodia: "Asia",
  Bangladesh: "Asia",
  China: "Asia",
  India: "Asia",
  Indonesia: "Asia",
  Thailand: "Asia",
  Myanmar: "Asia",
  Philippines: "Asia",
  Malaysia: "Asia",
  Pakistan: "Asia",
  "Sri Lanka": "Asia",
  Taiwan: "Asia",
  Japan: "Asia",
  "South Korea": "Asia",
  Laos: "Asia",
  Nepal: "Asia",
  // Europe
  Germany: "Europe",
  France: "Europe",
  Italy: "Europe",
  Spain: "Europe",
  UK: "Europe",
  "United Kingdom": "Europe",
  Portugal: "Europe",
  Turkey: "Europe",
  Poland: "Europe",
  Romania: "Europe",
  // Americas
  USA: "Americas",
  "United States": "Americas",
  Mexico: "Americas",
  Brazil: "Americas",
  Colombia: "Americas",
  Guatemala: "Americas",
  Honduras: "Americas",
  "El Salvador": "Americas",
  Canada: "Americas",
  // Africa
  Ethiopia: "Africa",
  Kenya: "Africa",
  Madagascar: "Africa",
  Tanzania: "Africa",
  Mauritius: "Africa",
  "South Africa": "Africa",
  Egypt: "Africa",
  Morocco: "Africa",
  Tunisia: "Africa",
  // Middle East
  Jordan: "Middle East",
  UAE: "Middle East",
  "Saudi Arabia": "Middle East",
  // Oceania
  Australia: "Oceania",
};

function deriveRegion(country: string | null): string {
  if (!country) return "Global";
  return REGION_MAP[country] || "Global";
}
