import { NextResponse } from "next/server";
import { query } from "@/lib/db/postgres";
import { Survey } from "@/types";

export async function GET() {
  try {
    const result = await query(`
      SELECT 
        s.id, 
        s.name, 
        s.status, 
        s.from_date, 
        s.to_date, 
        s.client_id,
        c.name as client_name,
        c.client_key
      FROM survey_mdlsurvey s
      LEFT JOIN clients_clientinfo c ON s.client_id = c.id
      ORDER BY s.created_date DESC
      LIMIT 50
    `);

    const surveys: Survey[] = result.rows.map((row: any) => ({
      id: row.id.toString(),
      supplierId: row.client_key
        ? String(row.client_key)
        : String(row.client_id),
      supplierName: row.client_name || "Unknown",
      title: row.name,
      responses: parseInt(row.response_count) || 0,
      riskScore: 0,
      status:
        row.status === 1 ? "active" : row.status === 2 ? "closed" : "draft",
      aiInsight: "Survey active. Collecting responses.",
      themes: [],
      createdAt: row.from_date
        ? new Date(row.from_date).toISOString().split("T")[0]
        : "",
      closedAt: row.to_date
        ? new Date(row.to_date).toISOString().split("T")[0]
        : undefined,
    }));

    return NextResponse.json(surveys);
  } catch (error) {
    console.error("Error fetching surveys:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
