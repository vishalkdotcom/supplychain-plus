import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { db } from "@/lib/db/drizzle";
import { casePlaybookCache } from "@/lib/db/schema";
import { query as mssqlQuery } from "@/lib/db/sql-server";
import { getModelFromRequest } from "@/lib/ai/provider";
import { and, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const caseTypeId = searchParams.get("caseTypeId");
    const region = searchParams.get("region") || "Global";

    if (!caseTypeId) {
      return NextResponse.json(
        { error: "caseTypeId is required" },
        { status: 400 },
      );
    }

    // Check cache first (valid for 7 days)
    const cached = await db
      .select()
      .from(casePlaybookCache)
      .where(
        and(
          eq(casePlaybookCache.caseTypeId, caseTypeId),
          eq(casePlaybookCache.region, region),
        ),
      )
      .limit(1);

    if (cached.length > 0) {
      const cacheAge =
        Date.now() - new Date(cached[0].generatedAt).getTime();
      if (cacheAge < 7 * 24 * 60 * 60 * 1000) {
        return NextResponse.json(cached[0]);
      }
    }

    // Query resolved cases from SQL Server
    const casesResult = await mssqlQuery(`
      SELECT
        c.Id, c.Created, c.ResolvedDate,
        DATEDIFF(day, c.Created, c.ResolvedDate) as ResolutionDays,
        co.Name as CompanyName, co.MailingCountry,
        ctct.Name as CaseTypeName
      FROM [Case] c
      JOIN Company co ON c.CompanyId = co.Id
      LEFT JOIN CaseTypeCultureText ctct
        ON c.CaseTypeId = ctct.CaseTypeId AND ctct.CultureCodeId = 1
      WHERE c.Deleted = 0
        AND c.ResolvedDate IS NOT NULL
        AND c.CaseTypeId = ${parseInt(caseTypeId)}
      ORDER BY DATEDIFF(day, c.Created, c.ResolvedDate) ASC
    `);

    const resolvedCases = casesResult.recordset || [];

    if (resolvedCases.length === 0) {
      return NextResponse.json({
        caseTypeId,
        caseTypeName: null,
        region,
        avgResolutionDays: null,
        bestResolutionDays: null,
        totalResolved: 0,
        bestPractices: [],
        aiSummary: "No resolved cases found for this case type.",
      });
    }

    // Calculate statistics
    const resolutionDays = resolvedCases
      .map((c: { ResolutionDays: number }) => c.ResolutionDays)
      .filter((d: number) => d >= 0);
    const avgResolutionDays =
      resolutionDays.reduce((a: number, b: number) => a + b, 0) /
      resolutionDays.length;
    const bestResolutionDays = Math.min(...resolutionDays);
    const caseTypeName = resolvedCases[0]?.CaseTypeName || `Type ${caseTypeId}`;

    // Fetch case notes from fastest resolvers (top 5)
    const fastestCaseIds = resolvedCases
      .slice(0, 5)
      .map((c: { Id: number }) => c.Id);

    let caseNotes: string[] = [];
    if (fastestCaseIds.length > 0) {
      try {
        const notesResult = await mssqlQuery(`
          SELECT cn.Notes
          FROM CaseNote cn
          WHERE cn.CaseId IN (${fastestCaseIds.join(",")})
            AND cn.Deleted = 0
          ORDER BY cn.Created ASC
        `);
        caseNotes = (notesResult.recordset || [])
          .map((n: { Notes: string }) => n.Notes)
          .filter(Boolean);
      } catch {
        // CaseNote may not have data
      }
    }

    // Generate AI insights from resolution patterns
    const model = getModelFromRequest(request);
    const prompt = `Analyze these resolved worker grievance cases and extract actionable best practices.

Case Type: ${caseTypeName}
Total Resolved: ${resolvedCases.length}
Average Resolution: ${Math.round(avgResolutionDays)} days
Fastest Resolution: ${bestResolutionDays} days
Countries: ${[...new Set(resolvedCases.map((c: { MailingCountry: string }) => c.MailingCountry))].join(", ")}

${caseNotes.length > 0 ? `Case Notes from fastest resolutions:\n${caseNotes.slice(0, 10).join("\n---\n")}` : "No case notes available."}

Respond with a JSON object:
{
  "bestPractices": ["practice 1", "practice 2", "practice 3", "practice 4", "practice 5"],
  "summary": "A 2-3 sentence summary of key patterns and recommendations"
}

Best practices should be specific, actionable steps that case managers can follow. Base them on the data provided.`;

    let bestPractices: string[] = [];
    let aiSummary =
      "Resolution patterns analyzed from historical data.";

    try {
      const { text } = await generateText({
        model,
        prompt,
        temperature: 0.3,
      });

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        bestPractices = parsed.bestPractices || [];
        aiSummary = parsed.summary || aiSummary;
      }
    } catch {
      bestPractices = [
        `Average resolution time is ${Math.round(avgResolutionDays)} days`,
        `Best performers resolve in ${bestResolutionDays} days`,
        `${resolvedCases.length} cases of this type have been resolved`,
      ];
    }

    // Cache the result
    const result = {
      caseTypeId,
      caseTypeName,
      region,
      avgResolutionDays: Math.round(avgResolutionDays * 10) / 10,
      bestResolutionDays,
      totalResolved: resolvedCases.length,
      bestPractices,
      aiSummary,
    };

    await db
      .insert(casePlaybookCache)
      .values(result)
      .onConflictDoUpdate({
        target: [casePlaybookCache.caseTypeId, casePlaybookCache.region],
        set: {
          ...result,
          generatedAt: new Date(),
        },
      });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error generating playbook:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
