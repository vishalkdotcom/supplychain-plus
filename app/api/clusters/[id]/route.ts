import { NextRequest, NextResponse } from "next/server";
import { mapCaseStatus } from "@/lib/case-utils";
import { db } from "@/lib/db/drizzle";
import { caseClusters, caseEmbeddings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { paramQuery } from "@/lib/db/sql-server";
import mssql from "mssql";
import { extractEnglishFromMlang } from "@/lib/mlang";
import { getClusterActions } from "@/lib/action-suggestions";
import { logger } from "@/lib/logger";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const clusterId = parseInt(id);
    if (isNaN(clusterId)) {
      return NextResponse.json({ error: "Invalid cluster ID" }, { status: 400 });
    }

    // 1. Fetch the cluster record from PostgreSQL
    const [cluster] = await db
      .select()
      .from(caseClusters)
      .where(eq(caseClusters.id, clusterId));

    if (!cluster) {
      return NextResponse.json({ error: "Cluster not found" }, { status: 404 });
    }

    // 2. Enrich with suggested actions
    const suggestedActions = getClusterActions({
      severity: cluster.severity,
      caseTypes: (cluster.caseTypes as string[]) || [],
      supplierCount: cluster.supplierCount,
      caseCount: cluster.caseCount,
    });

    // 3. Get message IDs from caseEmbeddings for this cluster
    const embeddings = await db
      .select({
        caseId: caseEmbeddings.caseId,
        messageId: caseEmbeddings.messageId,
      })
      .from(caseEmbeddings)
      .where(eq(caseEmbeddings.clusterId, clusterId));

    const messageIds = [...new Set(embeddings.map((e) => e.messageId))];

    // 4. Fetch case details from SQL Server
    let cases: Array<{
      caseId: string;
      messageId: string;
      messageText: string;
      companyId: string;
      companyName: string;
      caseTypeName: string;
      status: string;
      severity: "high" | "medium" | "low";
      createdAt: string;
    }> = [];

    const suppliersMap = new Map<string, string>();

    if (messageIds.length > 0) {
      // Build parameterized IN clause: @m0, @m1, @m2, ...
      const paramNames = messageIds.map((_, i) => `@m${i}`);
      const sqlParams: Record<
        string,
        { type: (() => mssql.ISqlType) | mssql.ISqlType; value: unknown }
      > = {};
      messageIds.forEach((mid, i) => {
        sqlParams[`m${i}`] = { type: mssql.Int(), value: parseInt(mid) };
      });

      const result = await paramQuery(
        `SELECT
          m.Id AS MessageId,
          m.CaseId,
          m.MessageText,
          c.Created,
          c.Priority,
          co.Id AS CompanyId,
          co.Name AS CompanyName,
          csct.Name AS StatusName,
          ctct.Name AS CaseTypeName
        FROM Message m
        JOIN [Case] c ON m.CaseId = c.Id
        LEFT JOIN Company co ON c.CompanyId = co.Id
        LEFT JOIN CaseStatusCultureText csct ON c.CaseStatusId = csct.CaseStatusId AND csct.CultureCodeId = 1
        LEFT JOIN CaseTypeCultureText ctct ON c.CaseTypeId = ctct.CaseTypeId AND ctct.CultureCodeId = 1
        WHERE m.Id IN (${paramNames.join(", ")}) AND c.Deleted = 0
        ORDER BY c.Created DESC`,
        sqlParams,
      );

      interface CaseRow {
        MessageId: number;
        CaseId: number;
        MessageText: string | null;
        Created: string | null;
        Priority: number;
        CompanyId: number;
        CompanyName: string | null;
        StatusName: string | null;
        CaseTypeName: string | null;
      }

      cases = result.recordset.map((row: CaseRow) => {
        const companyId = String(row.CompanyId);
        const companyName = extractEnglishFromMlang(row.CompanyName || "Unknown");
        suppliersMap.set(companyId, companyName);

        return {
          caseId: String(row.CaseId),
          messageId: String(row.MessageId),
          messageText: extractEnglishFromMlang(
            row.MessageText?.substring(0, 300) || "",
          ),
          companyId,
          companyName,
          caseTypeName: extractEnglishFromMlang(row.CaseTypeName || "General"),
          status: mapCaseStatus(row.StatusName || ""),
          severity: (row.Priority === 1
            ? "high"
            : row.Priority === 2
              ? "medium"
              : "low") as "high" | "medium" | "low",
          createdAt: row.Created
            ? new Date(row.Created).toISOString().split("T")[0]
            : "",
        };
      });
    }

    const suppliers = Array.from(suppliersMap.entries()).map(([id, name]) => ({
      id,
      name,
    }));

    return NextResponse.json({
      ...cluster,
      suggestedActions,
      cases,
      suppliers,
    });
  } catch (error) {
    logger.error("api/clusters/[id]", "Failed to fetch cluster detail", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

