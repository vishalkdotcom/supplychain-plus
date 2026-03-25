import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import {
  supplierFrameworkCompliance,
  supplierRiskScores,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const frameworkId = searchParams.get("frameworkId");
    const status = searchParams.get("status");
    const supplierId = searchParams.get("supplierId");

    const conditions = [];
    if (frameworkId) {
      conditions.push(eq(supplierFrameworkCompliance.frameworkId, parseInt(frameworkId)));
    }
    if (status) {
      conditions.push(eq(supplierFrameworkCompliance.status, status));
    }
    if (supplierId) {
      conditions.push(eq(supplierFrameworkCompliance.supplierId, supplierId));
    }

    const rows = await db
      .select({
        supplierId: supplierFrameworkCompliance.supplierId,
        frameworkId: supplierFrameworkCompliance.frameworkId,
        status: supplierFrameworkCompliance.status,
        completedRequirements: supplierFrameworkCompliance.completedRequirements,
        totalRequirements: supplierFrameworkCompliance.totalRequirements,
        supplierName: supplierRiskScores.supplierName,
      })
      .from(supplierFrameworkCompliance)
      .leftJoin(
        supplierRiskScores,
        eq(supplierFrameworkCompliance.supplierId, supplierRiskScores.supplierId),
      )
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const result = rows.map((row) => ({
      supplierId: row.supplierId,
      supplierName: row.supplierName || `Supplier ${row.supplierId}`,
      frameworkId: row.frameworkId,
      status: row.status,
      completedRequirements: row.completedRequirements ?? 0,
      totalRequirements: row.totalRequirements ?? 0,
      percentage:
        row.totalRequirements && row.totalRequirements > 0
          ? Math.round(((row.completedRequirements ?? 0) / row.totalRequirements) * 100)
          : 0,
    }));

    return NextResponse.json(result);
  } catch (error) {
    logger.error("api/regulatory/compliance", "Failed to fetch compliance data", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
