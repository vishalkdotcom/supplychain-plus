import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { supplierRiskForecast } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supplierId = params.id;

    if (!supplierId) {
      return NextResponse.json(
        { error: "Supplier ID is required" },
        { status: 400 }
      );
    }

    const forecast = await db
      .select()
      .from(supplierRiskForecast)
      .where(eq(supplierRiskForecast.supplierId, supplierId))
      .limit(1);

    if (!forecast || forecast.length === 0) {
      return NextResponse.json({ forecast: null });
    }

    return NextResponse.json({ forecast: forecast[0] });
  } catch (error) {
    console.error(`[GET /api/suppliers/[id]/forecast] Error:`, error);
    return NextResponse.json(
      { error: "Failed to fetch risk forecast" },
      { status: 500 }
    );
  }
}
