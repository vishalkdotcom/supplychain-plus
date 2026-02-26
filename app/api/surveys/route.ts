import { NextResponse } from "next/server";
import { query } from "@/lib/db/postgres";
import { db } from "@/lib/db/drizzle";
import { surveyAnalysis } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { Survey } from "@/types";

export async function GET() {
  try {
    const result = await query(`
      SELECT 
        s.id, 
        s.name, 
        s.status, 
        s.from_date, 
        s.to_date, 
        s.client_id,
        c.name as client_name,
        c.client_key,
        (SELECT COUNT(*) FROM survey_mdlsurveyquestionresponses r 
         JOIN survey_mdlsurveyquestion q ON r.question_id = q.id
         WHERE q.survey_id = s.id) as response_count
      FROM survey_mdlsurvey s
      LEFT JOIN clients_clientinfo c ON s.client_id = c.id
      ORDER BY s.created_date DESC
      LIMIT 50
    `);

    // Fetch analysis data from Drizzle (wovo_ai)
    const surveyIds = result.rows.map((r: { id: number }) => r.id) as number[];
    let analyses: (typeof surveyAnalysis.$inferSelect)[] = [];
    if (surveyIds.length > 0) {
      analyses = await db
        .select()
        .from(surveyAnalysis)
        .where(
          sql`${surveyAnalysis.surveyId} = ANY(ARRAY[${sql.raw(surveyIds.join(","))}]::int[])`,
        );
    }
    const analysisMap = new Map(analyses.map((a) => [a.surveyId, a]));

    const surveys: Survey[] = result.rows.map(
      (row: {
        id: number;
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
          supplierName: row.client_name || "Unknown",
          title: row.name,
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
        };
      },
    );

    return NextResponse.json(surveys);
  } catch (error) {
    console.error("Error fetching surveys:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
