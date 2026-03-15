import { NextResponse } from "next/server";
import { generateText } from "ai";
import { model } from "@/lib/ai/provider";
import { CASE_SUMMARY_PROMPT } from "@/lib/ai/prompts";
import { db } from "@/lib/db/drizzle";
import { caseSummaryCache } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { stripThinkingTags } from "@/lib/ai/utils";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const { caseId, caseText } = await request.json();

    if (
      !caseText ||
      typeof caseText !== "string" ||
      caseText.trim().length < 10
    ) {
      return NextResponse.json(
        {
          error:
            "Case text is too short or missing. A meaningful worker message is needed to generate a summary.",
        },
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

      if (cached.length > 0 && cached[0].aiSummary) {
        return NextResponse.json({ summary: cached[0].aiSummary });
      }
    }

    // Generate via AI SDK
    const { text: rawText } = await generateText({
      model,
      system: CASE_SUMMARY_PROMPT,
      prompt: caseText,
      maxOutputTokens: 150,
    });

    // Strip leaked reasoning tags (e.g. <think>...</think> from NIM models)
    const text = stripThinkingTags(rawText);

    // Cache result
    if (caseId) {
      await db
        .insert(caseSummaryCache)
        .values({ caseId: String(caseId), aiSummary: text })
        .onConflictDoUpdate({
          target: caseSummaryCache.caseId,
          set: { aiSummary: text, generatedAt: new Date() },
        });
    }

    return NextResponse.json({ summary: text });
  } catch (error) {
    logger.error("ai/summarize", "Summarization failed", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
