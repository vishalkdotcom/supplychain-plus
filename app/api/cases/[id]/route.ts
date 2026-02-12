import { NextResponse } from "next/server";
import { getPool } from "@/lib/db/sql-server";
import { Case } from "@/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const pool = await getPool();
    const result = await pool.request().input("id", id).query(`
        SELECT
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
        WHERE c.Id = @id AND c.Deleted = 0
      `);

    if (result.recordset.length === 0) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    const row = result.recordset[0];
    const caseData: Case = {
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
    };

    return NextResponse.json(caseData);
  } catch (error) {
    console.error("Error fetching case detail:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

function mapStatus(status: string): Case["status"] {
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
