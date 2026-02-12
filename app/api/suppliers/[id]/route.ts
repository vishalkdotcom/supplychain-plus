import { NextResponse } from "next/server";
import { query as pgQuery } from "@/lib/db/postgres";
import { Supplier } from "@/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // 1. Get supplier basic info from Postgres using client_key (maps to SQL Server Company.Id)
    const supplierRes = await pgQuery(
      `SELECT c.id, c.client_key, c.name, c.country, c.is_active, r.* 
       FROM clients_clientinfo c 
       LEFT JOIN supplier_risk_scores r ON CAST(c.client_key AS VARCHAR) = r.supplier_id 
       WHERE c.client_key = $1`,
      [id],
    );

    if (supplierRes.rows.length === 0) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 },
      );
    }

    const row = supplierRes.rows[0];
    const supplier: Supplier = {
      id: String(row.client_key),
      name: row.name,
      region: "Global",
      country: row.country || "Unknown",
      location: row.country || "Unknown",
      workerCount: 0,
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
    };

    return NextResponse.json(supplier);
  } catch (error) {
    console.error("Error fetching supplier detail:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
