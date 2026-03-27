import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import {
  regulatoryFrameworks,
  frameworkRequirements,
  supplierFrameworkCompliance,
} from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    // Fetch all active frameworks
    const frameworks = await db
      .select()
      .from(regulatoryFrameworks)
      .where(eq(regulatoryFrameworks.isActive, true))
      .orderBy(regulatoryFrameworks.name);

    // For each framework, get requirement count and compliance stats
    const result = await Promise.all(
      frameworks.map(async (fw) => {
        const [reqCount] = await db
          .select({ count: count() })
          .from(frameworkRequirements)
          .where(eq(frameworkRequirements.frameworkId, fw.id));

        const complianceRows = await db
          .select({
            status: supplierFrameworkCompliance.status,
            count: count(),
          })
          .from(supplierFrameworkCompliance)
          .where(eq(supplierFrameworkCompliance.frameworkId, fw.id))
          .groupBy(supplierFrameworkCompliance.status);

        const stats = {
          total: 0,
          compliant: 0,
          partial: 0,
          nonCompliant: 0,
          notAssessed: 0,
        };
        for (const row of complianceRows) {
          const c = Number(row.count);
          stats.total += c;
          if (row.status === "compliant") stats.compliant = c;
          else if (row.status === "partial") stats.partial = c;
          else if (row.status === "non_compliant") stats.nonCompliant = c;
          else if (row.status === "not_assessed") stats.notAssessed = c;
        }

        return {
          ...fw,
          requirementCount: Number(reqCount.count),
          supplierStats: stats,
        };
      }),
    );

    return NextResponse.json(result);
  } catch (error) {
    logger.error("api/regulatory/frameworks", "Failed to fetch frameworks", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
