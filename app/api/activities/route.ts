import { NextResponse } from "next/server";
import { query as pgQuery } from "@/lib/db/postgres";
import { query as sqlQuery } from "@/lib/db/sql-server";
import { ActivityItem } from "@/types";
import { logger } from "@/lib/logger";
import { isDemoMode } from "@/lib/demo-mode/profile";

interface InternalActivity extends ActivityItem {
  _rawDate: Date;
}

export async function GET() {
  if (isDemoMode()) {
    return NextResponse.json([]);
  }

  try {
    const activities: InternalActivity[] = [];

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

    sqlRes.recordset.forEach((row: Record<string, unknown>) => {
      activities.push({
        id: `case-${row.Id}`,
        action: "Case Created",
        details: `New case: ${row.Name as string}`,
        time: getTimeAgo(row.Created as string),
        module: "connect",
        supplierId: String(row.CompanyId),
        supplierName: (row.CompanyName as string) || "Unknown",
        linkedId: String(row.Id),
        linkedType: "case",
        _rawDate: row.Created ? new Date(row.Created as string) : new Date(0),
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

    pgRes.rows.forEach((row: Record<string, unknown>) => {
      activities.push({
        id: `survey-${row.id}`,
        action: "Survey Started",
        details: `Survey launched: ${row.name as string}`,
        time: getTimeAgo(row.from_date as string),
        module: "engage",
        supplierId: row.client_key
          ? String(row.client_key)
          : String(row.client_id),
        supplierName: (row.client_name as string) || "Unknown",
        linkedId: String(row.id),
        linkedType: "survey",
        _rawDate: row.from_date
          ? new Date(row.from_date as string)
          : new Date(0),
      });
    });

    // Sort by actual timestamp descending
    activities.sort((a, b) => b._rawDate.getTime() - a._rawDate.getTime());

    // Strip internal _rawDate before returning
    const cleaned: ActivityItem[] = activities
      .slice(0, 10)
      .map<ActivityItem>(({ id, action, details, time, module, supplierId, supplierName, linkedId, linkedType }) => ({
        id, action, details, time, module, supplierId, supplierName, linkedId, linkedType,
      }));
    return NextResponse.json(cleaned);
  } catch (error) {
    logger.error("api/activities", "Failed to fetch activities", error);
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
