import { NextRequest, NextResponse } from "next/server";
import { getCachedSuppliers } from "@/lib/cache/queries";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const perPage = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("perPage") || "12")),
    );
    const search = searchParams.get("search") || "";
    const riskLevel = searchParams.get("riskLevel") || "all";
    const region = searchParams.get("region") || "all";
    const parentCompanyId = searchParams.get("parentCompanyId") || "";

    const response = await getCachedSuppliers(
      page,
      perPage,
      search,
      riskLevel,
      region,
      parentCompanyId,
    );
    return NextResponse.json(response);
  } catch (error) {
    logger.error("api/suppliers", "Failed to fetch suppliers", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
