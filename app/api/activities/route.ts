import { NextResponse } from "next/server";
import { query as pgQuery } from "@/lib/db/postgres";
import { query as sqlQuery } from "@/lib/db/sql-server";
import { ActivityItem } from "@/types";

export async function GET() {
  try {
    const activities: ActivityItem[] = [];

    // 1. Get recent cases from SQL Server as activities
    const sqlRes = await sqlQuery(`
      SELECT TOP 3 
        c.Id, 
        c.Name, 
        c.Created, 
        co.Name as CompanyName,
        co.Id as CompanyId
      FROM [Case] c
      LEFT JOIN Company co ON c.CompanyId = co.Id
      WHERE c.Deleted = 0
      ORDER BY c.Created DESC
    `);

    sqlRes.recordset.forEach((row: any) => {
      activities.push({
        id: `case-${row.Id}`,
        action: "Case Created",
        details: `New case: ${row.Name}`,
        time: getTimeAgo(row.Created),
        module: "connect",
        supplierId: String(row.CompanyId),
        supplierName: row.CompanyName || "Unknown",
        linkedId: String(row.Id),
        linkedType: "case",
      });
    });

    // 2. Get recent surveys from Postgres as activities
    const pgRes = await pgQuery(`
      SELECT 
        s.id, 
        s.name, 
        s.from_date, 
        c.name as client_name,
        c.id as client_id,
        c.client_key
      FROM survey_mdlsurvey s
      LEFT JOIN clients_clientinfo c ON s.client_id = c.id
      ORDER BY s.created_date DESC
      LIMIT 3
    `);

    pgRes.rows.forEach((row: any) => {
      activities.push({
        id: `survey-${row.id}`,
        action: "Survey Started",
        details: `Survey launched: ${row.name}`,
        time: getTimeAgo(row.from_date),
        module: "engage",
        supplierId: row.client_key
          ? String(row.client_key)
          : String(row.client_id),
        supplierName: row.client_name || "Unknown",
        linkedId: row.id.toString(),
        linkedType: "survey",
      });
    });

    // Sort by "time" (heuristically since we don't have absolute timestamps in the array)
    // For now we'll just return them interleaved
    return NextResponse.json(activities.slice(0, 10));
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

function getTimeAgo(date: string | Date | null): string {
  if (!date) return "N/A";
  const d = new Date(date);
  const now = new Date();
  const diffInMs = now.getTime() - d.getTime();
  const diffInMins = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMins < 60) return `${diffInMins} mins ago`;
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  return `${diffInDays} days ago`;
}
