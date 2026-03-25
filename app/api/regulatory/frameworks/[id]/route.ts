import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import {
  regulatoryFrameworks,
  frameworkRequirements,
  supplierFrameworkCompliance,
  supplierRiskScores,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "@/lib/logger";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const frameworkId = parseInt(id);

    const [framework] = await db
      .select()
      .from(regulatoryFrameworks)
      .where(eq(regulatoryFrameworks.id, frameworkId))
      .limit(1);

    if (!framework) {
      return NextResponse.json({ error: "Framework not found" }, { status: 404 });
    }

    // Get requirements
    const requirements = await db
      .select()
      .from(frameworkRequirements)
      .where(eq(frameworkRequirements.frameworkId, frameworkId))
      .orderBy(frameworkRequirements.sortOrder);

    // Get supplier compliance with names
    const complianceRows = await db
      .select({
        supplierId: supplierFrameworkCompliance.supplierId,
        status: supplierFrameworkCompliance.status,
        completedRequirements: supplierFrameworkCompliance.completedRequirements,
        totalRequirements: supplierFrameworkCompliance.totalRequirements,
        lastAssessedAt: supplierFrameworkCompliance.lastAssessedAt,
        supplierName: supplierRiskScores.supplierName,
      })
      .from(supplierFrameworkCompliance)
      .leftJoin(
        supplierRiskScores,
        eq(supplierFrameworkCompliance.supplierId, supplierRiskScores.supplierId),
      )
      .where(eq(supplierFrameworkCompliance.frameworkId, frameworkId));

    const suppliers = complianceRows.map((row) => ({
      supplierId: row.supplierId,
      supplierName: row.supplierName || `Supplier ${row.supplierId}`,
      status: row.status,
      completedRequirements: row.completedRequirements ?? 0,
      totalRequirements: row.totalRequirements ?? 0,
      percentage:
        row.totalRequirements && row.totalRequirements > 0
          ? Math.round(((row.completedRequirements ?? 0) / row.totalRequirements) * 100)
          : 0,
      lastAssessedAt: row.lastAssessedAt,
    }));

    return NextResponse.json({
      framework,
      requirements,
      suppliers,
    });
  } catch (error) {
    logger.error("api/regulatory/frameworks/[id]", "Failed to fetch framework", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
