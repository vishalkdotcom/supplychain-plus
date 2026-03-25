import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import {
  supplierFrameworkCompliance,
  regulatoryFrameworks,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "@/lib/logger";

interface RouteParams {
  params: Promise<{ supplierId: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { supplierId } = await params;

    const rows = await db
      .select({
        supplierId: supplierFrameworkCompliance.supplierId,
        frameworkId: supplierFrameworkCompliance.frameworkId,
        status: supplierFrameworkCompliance.status,
        completedRequirements: supplierFrameworkCompliance.completedRequirements,
        totalRequirements: supplierFrameworkCompliance.totalRequirements,
        lastAssessedAt: supplierFrameworkCompliance.lastAssessedAt,
        frameworkName: regulatoryFrameworks.name,
        frameworkShortName: regulatoryFrameworks.shortName,
        jurisdiction: regulatoryFrameworks.jurisdiction,
      })
      .from(supplierFrameworkCompliance)
      .innerJoin(
        regulatoryFrameworks,
        eq(supplierFrameworkCompliance.frameworkId, regulatoryFrameworks.id),
      )
      .where(eq(supplierFrameworkCompliance.supplierId, supplierId));

    return NextResponse.json(rows);
  } catch (error) {
    logger.error("api/regulatory/compliance/[supplierId]", "Failed to fetch supplier compliance", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
