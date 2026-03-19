import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { payslipAnomalies, type PayslipAnomalyDetails } from "@/lib/db/schema";
import { desc, eq, and, count, ilike } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { getAnomalyAction } from "@/lib/action-suggestions";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const perPage = parseInt(searchParams.get("perPage") || "10");
    const severity = searchParams.get("severity");
    const anomalyType = searchParams.get("anomalyType");
    const supplierId = searchParams.get("supplierId");
    const isResolved = searchParams.get("isResolved");
    const search = searchParams.get("search");

    const conditions = [];
    if (severity && severity !== "all") {
      conditions.push(eq(payslipAnomalies.severity, severity));
    }
    if (anomalyType && anomalyType !== "all") {
      conditions.push(eq(payslipAnomalies.anomalyType, anomalyType));
    }
    if (supplierId && supplierId !== "all") {
      conditions.push(eq(payslipAnomalies.supplierId, supplierId));
    }
    if (isResolved === "true") {
      conditions.push(eq(payslipAnomalies.isResolved, true));
    } else if (isResolved === "false") {
      conditions.push(eq(payslipAnomalies.isResolved, false));
    }
    if (search) {
      conditions.push(ilike(payslipAnomalies.supplierName, `%${search}%`));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [results, totalResult] = await Promise.all([
      db
        .select()
        .from(payslipAnomalies)
        .where(where)
        .orderBy(desc(payslipAnomalies.detectedAt))
        .limit(perPage)
        .offset((page - 1) * perPage),
      db
        .select({ count: count() })
        .from(payslipAnomalies)
        .where(where),
    ]);

    const total = totalResult[0]?.count ?? 0;

    // Enrich with action suggestions
    const enriched = results.map((anomaly: typeof results[number]) => ({
      ...anomaly,
      suggestedAction: getAnomalyAction({
        anomalyType: anomaly.anomalyType,
        severity: anomaly.severity,
        details: anomaly.details as PayslipAnomalyDetails | null,
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
    logger.error("api/payslip-anomalies", "Failed to fetch anomalies", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, isResolved } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 },
      );
    }

    await db
      .update(payslipAnomalies)
      .set({ isResolved: isResolved ?? true })
      .where(eq(payslipAnomalies.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("api/payslip-anomalies", "Failed to update anomaly", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
