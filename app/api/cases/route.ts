import { NextResponse } from "next/server";
import { query } from "@/lib/db/sql-server";
import { Case } from "@/types";

export async function GET() {
  try {
    const result = await query(`
      SELECT TOP 50
        c.Id,
        c.Name as Title,
        c.Created,
        c.Modified,
        c.Priority,
        co.Name as CompanyName,
        co.Id as CompanyId,
        csct.Name as StatusName,
        ctct.Name as TypeName,
        (SELECT TOP 1 MessageText FROM Message WHERE CaseId = c.Id ORDER BY Created ASC) as FirstMessage
      FROM [Case] c
      LEFT JOIN Company co ON c.CompanyId = co.Id
      LEFT JOIN CaseStatusCultureText csct ON c.CaseStatusId = csct.CaseStatusId AND csct.CultureCodeId = 1
      LEFT JOIN CaseTypeCultureText ctct ON c.CaseTypeId = ctct.CaseTypeId AND ctct.CultureCodeId = 1
      WHERE c.Deleted = 0
      ORDER BY c.Created DESC
    `);

    const cases: Case[] = result.recordset.map((row: any) => ({
      id: String(row.Id),
      supplierId: String(row.CompanyId),
      supplierName: row.CompanyName || "Unknown",
      topic: row.TypeName || "General",
      severity:
        row.Priority === 1 ? "high" : row.Priority === 2 ? "medium" : "low",
      status: mapStatus(row.StatusName),
      aiSummary: row.FirstMessage
        ? row.FirstMessage.substring(0, 150) + "..."
        : "No content available.",
      fullContent: row.FirstMessage || row.Title || "No content.",
      createdAt: row.Created
        ? new Date(row.Created).toISOString().split("T")[0]
        : "",
      updatedAt: row.Modified
        ? new Date(row.Modified).toISOString().split("T")[0]
        : "",
      aiGuidance: {
        recommendedSteps: ["Review case details", "Contact supplier"],
        estimatedResolutionDays: 7,
      },
    }));

    return NextResponse.json(cases);
  } catch (error) {
    console.error("Error fetching cases:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

function mapStatus(status: string): any {
  switch (status?.toLowerCase()) {
    case "open":
      return "new";
    case "in progress":
      return "in_progress";
    case "resolved":
      return "resolved";
    default:
      return "new";
  }
}
