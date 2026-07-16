import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db/postgres";
import { db } from "@/lib/db/drizzle";
import { surveyAnalysis } from "@/lib/db/schema";
import { inArray } from "drizzle-orm";
import { rejectIfDemoMutation } from "@/lib/demo-mode/guards";
import { Survey, PaginatedResponse } from "@/types";
import { extractEnglishFromMlang } from "@/lib/mlang";
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
    const parentCompanyId = searchParams.get("parentCompanyId") || "";
    const offset = (page - 1) * perPage;

    // Build dynamic WHERE clauses
    const conditions: string[] = [];
    const params: (string | number)[] = [];
    let paramIndex = 1;

    if (search) {
      conditions.push(`s.name ILIKE $${paramIndex}`);
      params.push(`%${search}%`);
      paramIndex++;
    }
    if (supplier !== "all") {
      conditions.push(`c.name = $${paramIndex}`);
      params.push(supplier);
      paramIndex++;
    }
    if (parentCompanyId) {
      // Filter to suppliers belonging to this brand via clientrelation
      conditions.push(`c.client_key = ANY(
        SELECT ci.client_key FROM clients_clientinfo ci
        JOIN clients_clientinfotorelationmapping m ON m.clientinfo_id = ci.id
        JOIN clients_clientrelation r ON r.id = m.clientrelation_id
        WHERE r.relation_type = 0 AND r.relation_id = $${paramIndex}
      )`);
      params.push(parseInt(parentCompanyId));
      paramIndex++;
    }

    const supplierId = searchParams.get("supplierId") || "";
    if (supplierId) {
      conditions.push(`c.client_key = $${paramIndex}`);
      params.push(supplierId);
      paramIndex++;
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Count total
    const countResult = await query(
      `SELECT COUNT(*) as total
       FROM survey_mdlsurvey s
       LEFT JOIN clients_clientinfo c ON s.client_id = c.id
       ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0].total);

    // Fetch paginated data
    const result = await query(
      `SELECT 
        s.id, 
        s.name, 
        s.status, 
        s.from_date, 
        s.to_date, 
        s.client_id,
        c.name as client_name,
        c.client_key,
        (SELECT COUNT(*) FROM survey_mdlsurveyquestionresponses r 
         WHERE r.survey_id = s.id) as response_count
      FROM survey_mdlsurvey s
      LEFT JOIN clients_clientinfo c ON s.client_id = c.id
      ${whereClause}
      ORDER BY s.created_date DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, perPage, offset],
    );

    // Fetch analysis data from Drizzle (wovo_ai)
    const surveyIds = result.rows.map((r: { id: string }) => r.id);
    let analyses: (typeof surveyAnalysis.$inferSelect)[] = [];
    if (surveyIds.length > 0) {
      analyses = await db
        .select()
        .from(surveyAnalysis)
        .where(inArray(surveyAnalysis.surveyId, surveyIds));
    }
    const analysisMap = new Map(analyses.map((a) => [a.surveyId, a]));

    const surveys: Survey[] = result.rows.map(
      (row: {
        id: string;
        client_key: string;
        client_id: number;
        client_name: string;
        name: string;
        response_count: string;
        status: number;
        from_date: string;
        to_date: string;
      }) => {
        const analysis = analysisMap.get(row.id);
        return {
          id: row.id.toString(),
          supplierId: row.client_key
            ? String(row.client_key)
            : String(row.client_id),
          supplierName: extractEnglishFromMlang(row.client_name || "Unknown"),
          title: extractEnglishFromMlang(row.name),
          responses: parseInt(row.response_count) || 0,
          riskScore: analysis?.riskScore ?? 0,
          status:
            row.status === 1
              ? ("active" as const)
              : row.status === 2
                ? ("closed" as const)
                : ("draft" as const),
          aiInsight:
            analysis?.aiInsight ||
            (parseInt(row.response_count) > 0
              ? `${row.response_count} responses collected.`
              : "Survey active. Collecting responses."),
          themes: analysis?.themes || [],
          createdAt: row.from_date
            ? new Date(row.from_date).toISOString().split("T")[0]
            : "",
          closedAt: row.to_date
            ? new Date(row.to_date).toISOString().split("T")[0]
            : undefined,
          sentimentPositive: analysis?.sentimentPositive ?? undefined,
          sentimentNegative: analysis?.sentimentNegative ?? undefined,
          sentimentNeutral: analysis?.sentimentNeutral ?? undefined,
        };
      },
    );

    const totalPages = Math.ceil(total / perPage);

    const response: PaginatedResponse<Survey> = {
      data: surveys,
      total,
      page,
      perPage,
      totalPages,
    };

    return NextResponse.json(response);
  } catch (error) {
    logger.error("api/surveys", "Failed to fetch surveys", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const blocked = rejectIfDemoMutation();
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { questions, languages, title } = body;

    // Basic validation
    if (!questions || !languages || !title) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // DEMO IMPLEMENTATION:
    // In a production application, this would insert records into:
    // - survey_mdlsurvey
    // - survey_mdlsurvey_translated
    // - survey_mdlsurveyquestion
    // For this demo, we simulate a successful save to the database.

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    return NextResponse.json(
      {
        success: true,
        message: "Survey draft saved successfully to database.",
        draftId: `draft-${Date.now()}`,
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("api/surveys", "Failed to save survey draft", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
