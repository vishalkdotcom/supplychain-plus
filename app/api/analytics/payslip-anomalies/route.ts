import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { payslipAnomalies } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const anomalies = await db
      .select()
      .from(payslipAnomalies)
      .orderBy(desc(payslipAnomalies.detectedAt))
      .limit(50);

    return NextResponse.json({ anomalies });
  } catch (error) {
    console.error(`[GET /api/analytics/payslip-anomalies] Error:`, error);
    return NextResponse.json(
      { error: "Failed to fetch payslip anomalies" },
      { status: 500 }
    );
  }
}
