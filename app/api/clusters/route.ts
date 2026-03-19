import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { caseClusters } from "@/lib/db/schema";
import { desc, eq, and, count, sql } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { getClusterActions } from "@/lib/action-suggestions";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const perPage = parseInt(searchParams.get("perPage") || "10");
    const severity = searchParams.get("severity");
    const supplierId = searchParams.get("supplierId");

    const conditions = [];
    if (severity && severity !== "all") {
      conditions.push(eq(caseClusters.severity, severity));
    }
    if (supplierId) {
      // Filter clusters that contain this supplier (JSONB array contains check)
      conditions.push(
        sql`${caseClusters.supplierIds}::jsonb @> ${JSON.stringify([supplierId])}::jsonb`,
      );
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [results, totalResult] = await Promise.all([
      db
        .select()
        .from(caseClusters)
        .where(where)
        .orderBy(desc(caseClusters.detectedAt))
        .limit(perPage)
        .offset((page - 1) * perPage),
      db
        .select({ count: count() })
        .from(caseClusters)
        .where(where),
    ]);

    const total = totalResult[0]?.count ?? 0;

    // Enrich with action suggestions
    const enriched = results.map((cluster: typeof results[number]) => ({
      ...cluster,
      suggestedActions: getClusterActions({
        severity: cluster.severity,
        caseTypes: (cluster.caseTypes as string[]) || [],
        supplierCount: cluster.supplierCount,
        caseCount: cluster.caseCount,
      }),
    }));

    return NextResponse.json({
      data: enriched,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    });
  } catch (error) {
    logger.error("api/clusters", "Failed to fetch clusters", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
