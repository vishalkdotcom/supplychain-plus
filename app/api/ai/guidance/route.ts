import { NextResponse } from "next/server";
import { generateText, Output } from "ai";
import { model } from "@/lib/ai/provider";
import { caseGuidanceSchema } from "@/lib/ai/schemas";
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

    // Generate structured guidance via AI SDK
    const prompt = CASE_GUIDANCE_PROMPT.replace(
      "{caseType}",
      caseType || "General",
    )
      .replace("{severity}", severity || "medium")
      .replace("{caseText}", caseText);

    const { output } = await generateText({
      model,
      prompt,
      output: Output.object({ schema: caseGuidanceSchema }),
    });

    // Cache the guidance
    if (caseId && output) {
      await db
        .insert(caseSummaryCache)
        .values({
          caseId: String(caseId),
          aiSummary: "",
          aiGuidance: output,
        })
        .onConflictDoUpdate({
          target: caseSummaryCache.caseId,
          set: { aiGuidance: output, generatedAt: new Date() },
        });
    }

    return NextResponse.json(
      output || { recommendedSteps: [], estimatedResolutionDays: 7 },
    );
  } catch (error) {
    console.error("API Error in guidance generation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
