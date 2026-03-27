import { NextResponse } from "next/server";
import { generateText, Output } from "ai";
import { getModelFromRequest } from "@/lib/ai/provider";
import { SUPPORTED_LANGUAGES } from "@/lib/ai/languages";
import { z } from "zod";
import { logger } from "@/lib/logger";

export const maxDuration = 60;

const MAX_TEXTS = 50;
const MAX_TOTAL_CHARS = 10_000;

const translationsSchema = z.object({
  translations: z.array(z.string()),
});

/**
 * POST /api/ai/translate
 * Translate one or more text strings into a target language.
 *
 * Body: { texts: string[], targetLanguage: string }
 * Response: { translations: string[], targetLanguage: string, languageName: string }
 */
export async function POST(request: Request) {
  try {
    const { texts, targetLanguage } = await request.json();

    if (!Array.isArray(texts) || texts.length === 0 || !targetLanguage) {
      return NextResponse.json(
        { error: "texts (non-empty array) and targetLanguage are required" },
        { status: 400 },
      );
    }

    if (texts.length > MAX_TEXTS) {
      return NextResponse.json(
        { error: `Maximum ${MAX_TEXTS} texts per request` },
        { status: 400 },
      );
    }

    const totalChars = texts.reduce((sum: number, t: string) => sum + (t?.length ?? 0), 0);
    if (totalChars > MAX_TOTAL_CHARS) {
      return NextResponse.json(
        { error: `Total input exceeds ${MAX_TOTAL_CHARS} characters` },
        { status: 400 },
      );
    }

    const languageName = SUPPORTED_LANGUAGES[targetLanguage];
    if (!languageName) {
      return NextResponse.json(
        { error: `Unsupported language: ${targetLanguage}. Use GET /api/ai/translate for available languages.` },
        { status: 400 },
      );
    }

    const resolvedModel = getModelFromRequest(request);

    const result = await generateText({
      model: resolvedModel,
      system: `You are a translator. Translate the given texts to ${languageName}. Return exactly ${texts.length} translation(s) in the same order. Keep translations natural and accessible.`,
      prompt: texts.length === 1
        ? `Translate to ${languageName}:\n\n${texts[0]}`
        : `Translate each of these ${texts.length} texts to ${languageName}:\n\n${texts.map((t: string, i: number) => `[${i + 1}] ${t}`).join("\n")}`,
      output: Output.object({ schema: translationsSchema }),
    });

    const output = result.output;
    if (!output || output.translations.length !== texts.length) {
      logger.error("ai/translate", "Translation count mismatch", {
        expected: texts.length,
        got: output?.translations?.length,
      });
      return NextResponse.json(
        { error: "Translation produced unexpected number of results" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      translations: output.translations,
      targetLanguage,
      languageName,
    });
  } catch (error) {
    logger.error("ai/translate", "Translation failed", error);
    return NextResponse.json(
      { error: "Failed to translate" },
      { status: 500 },
    );
  }
}

/** GET /api/ai/translate — returns available languages. */
export async function GET() {
  return NextResponse.json({ languages: SUPPORTED_LANGUAGES });
}
