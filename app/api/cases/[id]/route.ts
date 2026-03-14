import { NextResponse } from "next/server";
import { getPool } from "@/lib/db/sql-server";
import { Case } from "@/types";
import { db } from "@/lib/db/drizzle";
import { caseSummaryCache } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

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
          c.CaseTypeId,
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

    // Check the AI cache for a previously generated summary & guidance
    let cachedSummary: string | null = null;
    let cachedGuidance = null;
    try {
      const cached = await db
        .select()
        .from(caseSummaryCache)
        .where(eq(caseSummaryCache.caseId, String(row.Id)))
        .limit(1);
      if (cached.length > 0) {
        cachedSummary = cached[0].aiSummary || null;
        cachedGuidance = cached[0].aiGuidance || null;
      }
    } catch {
      // Cache lookup failure is non-fatal — fall back to default
    }

    const caseData: Case = {
      id: String(row.Id),
      supplierId: String(row.CompanyId),
      supplierName: row.CompanyName || "Unknown",
      topic: row.TypeName || "General",
      caseTypeId: row.CaseTypeId ? String(row.CaseTypeId) : undefined,
      severity:
        row.Priority === 1 ? "high" : row.Priority === 2 ? "medium" : "low",
      status: mapStatus(row.StatusName),
      aiSummary:
        cachedSummary ||
        (row.FirstMessage
          ? row.FirstMessage.substring(0, 150) + "..."
          : "No content available."),
      fullContent: row.FirstMessage || row.Title || "No content.",
      createdAt: row.Created
        ? new Date(row.Created).toISOString().split("T")[0]
        : "",
      updatedAt: row.Modified
        ? new Date(row.Modified).toISOString().split("T")[0]
        : "",
      aiGuidance: cachedGuidance || {
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
