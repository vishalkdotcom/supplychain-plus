import { NextRequest, NextResponse } from "next/server";
import { paramQuery } from "@/lib/db/sql-server";
import { db } from "@/lib/db/drizzle";
import { caseSummaryCache } from "@/lib/db/schema";
import { inArray } from "drizzle-orm";
import { Case, AIGuidance, PaginatedResponse } from "@/types";
import mssql from "mssql";
import { extractEnglishFromMlang } from "@/lib/mlang";
import { logger } from "@/lib/logger";

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
    const supplierId = searchParams.get("supplierId") || "";
    const parentCompanyId = searchParams.get("parentCompanyId") || "";
    const severity = searchParams.get("severity") || "all";
    const offset = (page - 1) * perPage;

    // Build dynamic WHERE clauses with parameterized queries
    const conditions: string[] = ["c.Deleted = 0"];
    const params: Record<
      string,
      { type: (() => mssql.ISqlType) | mssql.ISqlType; value: unknown }
    > = {
      offset: { type: mssql.Int, value: offset },
      perPage: { type: mssql.Int, value: perPage },
    };

    if (search) {
      conditions.push("(c.Name LIKE @search OR ctct.Name LIKE @search)");
      params.search = { type: mssql.NVarChar, value: `%${search}%` };
    }
    if (supplier !== "all") {
      conditions.push("co.Name = @supplier");
      params.supplier = { type: mssql.NVarChar, value: supplier };
    }
    if (supplierId) {
      conditions.push("co.Id = @supplierId");
      params.supplierId = { type: mssql.Int, value: parseInt(supplierId) };
    }
    if (parentCompanyId) {
      conditions.push("co.ParentCompanyId = @parentCompanyId");
      params.parentCompanyId = { type: mssql.Int, value: parseInt(parentCompanyId) };
    }
    if (severity !== "all") {
      const priorityMap: Record<string, number> = {
        high: 1,
        medium: 2,
        low: 3,
      };
      if (priorityMap[severity]) {
        conditions.push("c.Priority = @priority");
        params.priority = { type: mssql.Int, value: priorityMap[severity] };
      }
    }

    const whereClause = conditions.join(" AND ");

    // Count total
    const countResult = await paramQuery(
      `SELECT COUNT(*) as total
      FROM [Case] c
      LEFT JOIN Company co ON c.CompanyId = co.Id
      LEFT JOIN CaseTypeCultureText ctct ON c.CaseTypeId = ctct.CaseTypeId AND ctct.CultureCodeId = 1
      WHERE ${whereClause}`,
      params,
    );
    const total = countResult.recordset[0].total;

    // Fetch paginated data using OFFSET/FETCH (SQL Server syntax)
    const result = await paramQuery(
      `SELECT 
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
      OFFSET @offset ROWS FETCH NEXT @perPage ROWS ONLY`,
      params,
    );

    interface CaseRow {
      Id: number;
      Title: string;
      Created: string | null;
      Modified: string | null;
      Priority: number;
      CompanyName: string | null;
      CompanyId: number;
      StatusName: string | null;
      TypeName: string | null;
      FirstMessage: string | null;
    }

    // Batch-fetch cached AI summaries & guidance from Drizzle
    const caseIds = result.recordset.map((row: CaseRow) => String(row.Id));
    const cacheMap = new Map<
      string,
      { aiSummary: string | null; aiGuidance: unknown }
    >();
    if (caseIds.length > 0) {
      try {
        const cached = await db
          .select()
          .from(caseSummaryCache)
          .where(inArray(caseSummaryCache.caseId, caseIds));
        for (const c of cached) {
          cacheMap.set(c.caseId, {
            aiSummary: c.aiSummary,
            aiGuidance: c.aiGuidance,
          });
        }
      } catch (e) {
        logger.warn("api/cases", "Cache DB unavailable", e);
      }
    }

    const cases: Case[] = result.recordset.map((row: CaseRow) => {
      const cached = cacheMap.get(String(row.Id));
      const fallbackSummary = row.FirstMessage
        ? row.FirstMessage.substring(0, 150) + "..."
        : "No content available.";

      return {
        id: String(row.Id),
        supplierId: String(row.CompanyId),
        supplierName: extractEnglishFromMlang(row.CompanyName || "Unknown"),
        topic: extractEnglishFromMlang(row.TypeName || "General"),
        severity:
          row.Priority === 1 ? "high" : row.Priority === 2 ? "medium" : "low",
        status: mapStatus(row.StatusName || ""),
        aiSummary: cached?.aiSummary || fallbackSummary,
        fullContent: extractEnglishFromMlang(row.FirstMessage || row.Title || "No content."),
        createdAt: row.Created
          ? new Date(row.Created).toISOString().split("T")[0]
          : "",
        updatedAt: row.Modified
          ? new Date(row.Modified).toISOString().split("T")[0]
          : "",
        aiGuidance: (cached?.aiGuidance as AIGuidance) || {
          recommendedSteps: ["Review case details", "Contact supplier"],
          estimatedResolutionDays: 7,
        },
      };
    });

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
    logger.error("api/cases", "Failed to fetch cases", error);
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
