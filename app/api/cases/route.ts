import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db/sql-server";
import { Case, PaginatedResponse } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const perPage = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("perPage") || "8")),
    );
    const search = searchParams.get("search") || "";
    const supplier = searchParams.get("supplier") || "all";
    const severity = searchParams.get("severity") || "all";
    const offset = (page - 1) * perPage;

    // Build dynamic WHERE clauses
    const conditions: string[] = ["c.Deleted = 0"];

    if (search) {
      const escapedSearch = search.replace(/'/g, "''");
      conditions.push(
        `(c.Name LIKE '%${escapedSearch}%' OR ctct.Name LIKE '%${escapedSearch}%')`,
      );
    }
    if (supplier !== "all") {
      const escapedSupplier = supplier.replace(/'/g, "''");
      conditions.push(`co.Name = '${escapedSupplier}'`);
    }
    if (severity !== "all") {
      if (severity === "high") conditions.push("c.Priority = 1");
      else if (severity === "medium") conditions.push("c.Priority = 2");
      else if (severity === "low") conditions.push("c.Priority = 3");
    }

    const whereClause = conditions.join(" AND ");

    // Count total
    const countResult = await query(`
      SELECT COUNT(*) as total
      FROM [Case] c
      LEFT JOIN Company co ON c.CompanyId = co.Id
      LEFT JOIN CaseTypeCultureText ctct ON c.CaseTypeId = ctct.CaseTypeId AND ctct.CultureCodeId = 1
      WHERE ${whereClause}
    `);
    const total = countResult.recordset[0].total;

    // Fetch paginated data using OFFSET/FETCH (SQL Server syntax)
    const result = await query(`
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
      WHERE ${whereClause}
      ORDER BY c.Created DESC
      OFFSET ${offset} ROWS FETCH NEXT ${perPage} ROWS ONLY
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

    const totalPages = Math.ceil(total / perPage);

    const response: PaginatedResponse<Case> = {
      data: cases,
      total,
      page,
      perPage,
      totalPages,
    };

    return NextResponse.json(response);
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
