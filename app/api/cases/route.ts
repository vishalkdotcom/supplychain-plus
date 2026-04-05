import { NextRequest, NextResponse } from "next/server";
import { getCachedCases } from "@/lib/cache/queries";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const perPage = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("perPage") || "8")),
    );
    const search = searchParams.get("search") || "";
    const supplier = searchParams.get("supplier") || "all";
    const supplierId = searchParams.get("supplierId") || "";
    const parentCompanyId = searchParams.get("parentCompanyId") || "";
    const severity = searchParams.get("severity") || "all";

    const response = await getCachedCases(
      page,
      perPage,
      search,
      supplier,
      supplierId,
      parentCompanyId,
      severity,
    );
    return NextResponse.json(response);
  } catch (error) {
    logger.error("api/cases", "Failed to fetch cases", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
