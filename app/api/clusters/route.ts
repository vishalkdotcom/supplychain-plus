import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { caseClusters } from "@/lib/db/schema";
import { desc, eq, and, count } from "drizzle-orm";
import { logger } from "@/lib/logger";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const perPage = parseInt(searchParams.get("perPage") || "10");
    const severity = searchParams.get("severity");

    const conditions = [];
    if (severity && severity !== "all") {
      conditions.push(eq(caseClusters.severity, severity));
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

    return NextResponse.json({
      data: results,
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
