import { NextResponse } from "next/server";
import { generateText } from "ai";
import { model } from "@/lib/ai/provider";
import { caseGuidanceSchema, type CaseGuidance } from "@/lib/ai/schemas";
import { CASE_GUIDANCE_PROMPT } from "@/lib/ai/prompts";
import { db } from "@/lib/db/drizzle";
import { caseSummaryCache } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Extract and parse JSON from a text response that may contain markdown
 * code fences, thinking tags, or other surrounding text.
 */
function extractJson(text: string): unknown {
  // Strip <think>...</think> blocks
  let cleaned = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

  // Try to extract from ```json ... ``` code fence
  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) cleaned = fenceMatch[1].trim();

  // Try to find the outermost { ... }
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start !== -1 && end > start) {
    cleaned = cleaned.slice(start, end + 1);
  }

  return JSON.parse(cleaned);
}

const JSON_SCHEMA_INSTRUCTION = `

CRITICAL: You MUST respond with ONLY a valid JSON object matching this exact schema — no markdown, no extra text, no code fences:
{
  "recommendedSteps": ["step1", "step2", ...],   // 3-5 specific actionable steps
  "draftResponse": "...",                         // Professional reply to the worker, 50-80 words
  "relatedTraining": ["topic1", "topic2"],        // 1-2 relevant training topics
  "estimatedResolutionDays": <number>             // Realistic estimate in business days
}`;

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
    const basePrompt = CASE_GUIDANCE_PROMPT.replace(
      "{caseType}",
      caseType || "General",
    )
      .replace("{severity}", severity || "medium")
      .replace("{caseText}", caseText);

    // Append JSON schema instruction so models without native structured
    // output support still return the correct shape.
    const prompt = basePrompt + JSON_SCHEMA_INSTRUCTION;

    let guidance: CaseGuidance | null = null;

    const { text } = await generateText({ model, prompt });

    // Parse + validate against zod schema
    const raw = extractJson(text);
    const parsed = caseGuidanceSchema.safeParse(raw);

    if (parsed.success) {
      guidance = parsed.data;
    } else {
      console.warn(
        "Schema validation failed, returning raw parsed JSON:",
        parsed.error.issues,
      );
      // If the shape is close enough, return what we have with defaults
      const fallback = raw as Record<string, unknown>;
      guidance = {
        recommendedSteps: Array.isArray(fallback.recommendedSteps)
          ? (fallback.recommendedSteps as string[])
          : ["Review the case details and gather additional information"],
        draftResponse:
          typeof fallback.draftResponse === "string"
            ? fallback.draftResponse
            : "We have received your concern and are currently reviewing it. A case manager will follow up with you shortly.",
        relatedTraining: Array.isArray(fallback.relatedTraining)
          ? (fallback.relatedTraining as string[])
          : ["Workplace Rights Awareness"],
        estimatedResolutionDays:
          typeof fallback.estimatedResolutionDays === "number"
            ? fallback.estimatedResolutionDays
            : 7,
      };
    }

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

    return NextResponse.json(
      guidance || { recommendedSteps: [], estimatedResolutionDays: 7 },
    );
  } catch (error) {
    console.error("API Error in guidance generation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
