import { NextResponse } from "next/server";
import { generateText, Output } from "ai";
import { getModelFromRequest } from "@/lib/ai/provider";
import { caseGuidanceSchema, type CaseGuidance } from "@/lib/ai/schemas";
import { CASE_GUIDANCE_PROMPT } from "@/lib/ai/prompts";
import { db } from "@/lib/db/drizzle";
import { caseSummaryCache } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { caseId, caseText, caseType, severity } = await request.json();

    if (!caseText) {
      return NextResponse.json(
        { error: "Case text is required" },
        { status: 400 },
      );
    }

    // Check cache first
    if (caseId) {
      const cached = await db
        .select()
        .from(caseSummaryCache)
        .where(eq(caseSummaryCache.caseId, String(caseId)))
        .limit(1);

      if (cached.length > 0 && cached[0].aiGuidance) {
        return NextResponse.json(cached[0].aiGuidance);
      }
    }

    // Build the base prompt
    const prompt = CASE_GUIDANCE_PROMPT.replace(
      "{caseType}",
      caseType || "General",
    )
      .replace("{severity}", severity || "medium")
      .replace("{caseText}", caseText);

    const activeModel = getModelFromRequest(request);
    
    // Use structured output generation
    const result = await generateText({ 
      model: activeModel, 
      prompt,
      output: Output.object({ schema: caseGuidanceSchema })
    });

    const guidance: CaseGuidance = result.output;

    // Cache the guidance
    if (caseId && guidance) {
      await db
        .insert(caseSummaryCache)
        .values({
          caseId: String(caseId),
          aiSummary: "",
          aiGuidance: guidance,
        })
        .onConflictDoUpdate({
          target: caseSummaryCache.caseId,
          set: { aiGuidance: guidance, generatedAt: new Date() },
        });
    }

    return NextResponse.json(guidance);
  } catch (error) {
    console.error("API Error in guidance generation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
