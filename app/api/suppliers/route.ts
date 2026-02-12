import { NextResponse } from "next/server";
import { query } from "@/lib/db/postgres";
import { wcGlobalQuery } from "@/lib/db/postgres-wc-global";
import { Supplier } from "@/types";

export async function GET() {
  try {
    const result = await query(`
      SELECT 
        c.id, 
        c.client_key,
        c.name, 
        c.country, 
        c.is_active,
        r.risk_score,
        r.case_score,
        r.survey_score,
        r.training_score,
        r.engagement_score
      FROM clients_clientinfo c
      LEFT JOIN supplier_risk_scores r ON CAST(c.client_key AS VARCHAR) = r.supplier_id
      WHERE c.is_deleted = false AND c.client_key IS NOT NULL
      ORDER BY r.risk_score DESC NULLS LAST, c.name ASC
      LIMIT 100
    `);

    // Fetch worker counts from wc_global.mdl_participant grouped by client_id
    const clientKeys = result.rows
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

    const suppliers: Supplier[] = result.rows.map((row: any) => ({
      id: String(row.client_key),
      name: row.name,
      region: "Global",
      country: row.country || "Unknown",
      location: row.country || "Unknown",
      workerCount: workerCountMap[parseInt(row.client_key)] || 0,
      contactName: "N/A",
      contactEmail: "n/a",
      riskScore: row.risk_score || 50,
      riskLevel:
        (row.risk_score || 50) > 70
          ? "high"
          : (row.risk_score || 50) > 30
            ? "medium"
            : "low",
      status: row.is_active ? "active" : "inactive",
      lastActivityDate: new Date().toISOString().split("T")[0],
      riskBreakdown: {
        caseScore: row.case_score || 50,
        surveyScore: row.survey_score || 50,
        trainingScore: row.training_score || 50,
        engagementScore: row.engagement_score || 50,
        reasons: [],
      },
    }));

    return NextResponse.json(suppliers);
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
