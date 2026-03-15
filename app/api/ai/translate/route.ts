import { NextResponse } from "next/server";
import { generateText, Output } from "ai";
import { model } from "@/lib/ai/provider";
import { db } from "@/lib/db/drizzle";
import { courseTranslations } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { logger } from "@/lib/logger";

export const maxDuration = 60;

const SUPPORTED_LANGUAGES: Record<string, string> = {
  vi: "Vietnamese",
  bn: "Bengali",
  zh: "Chinese (Simplified)",
  km: "Khmer",
  my: "Burmese",
  id: "Indonesian",
  th: "Thai",
  tl: "Filipino/Tagalog",
  hi: "Hindi",
  ta: "Tamil",
  ne: "Nepali",
  es: "Spanish",
  fr: "French",
  ar: "Arabic",
};

const translatedCourseSchema = z.object({
  title: z.string(),
  description: z.string(),
  lessons: z.array(
    z.object({
      title: z.string(),
      content: z.string(),
    }),
  ),
  quiz: z.array(
    z.object({
      question: z.string(),
      options: z.array(z.string()),
      correctAnswerIndex: z.number(),
    }),
  ),
});

export async function POST(request: Request) {
  try {
    const { courseId, course, language } = await request.json();

    if (!course || !language) {
      return NextResponse.json(
        { error: "Course content and target language are required" },
        { status: 400 },
      );
    }

    const languageName = SUPPORTED_LANGUAGES[language];
    if (!languageName) {
      return NextResponse.json(
        { error: `Unsupported language: ${language}` },
        { status: 400 },
      );
    }

    // Check cache first
    if (courseId) {
      try {
        const cached = await db
          .select()
          .from(courseTranslations)
          .where(
            and(
              eq(courseTranslations.courseId, courseId),
              eq(courseTranslations.language, language),
            ),
          )
          .limit(1);

        if (cached.length > 0) {
          return NextResponse.json({
            translated: cached[0].translatedContent,
            language,
            languageName,
            fromCache: true,
          });
        }
      } catch (e) {
        logger.warn("ai/translate", "Translation cache miss", e);
      }
    }

    const result = await generateText({
      model,
      system: `You are an expert translator specializing in worker training materials. Translate accurately while keeping the content accessible to factory workers. Maintain the exact same structure — same number of lessons, same number of quiz questions, same correctAnswerIndex values. Only translate the text content.`,
      prompt: `Translate the following training course from English to ${languageName}.\n\n${JSON.stringify(course, null, 2)}`,
      output: Output.object({ schema: translatedCourseSchema }),
    });

    const translated = result.output;

    // Cache the translation
    if (courseId) {
      try {
        await db
          .insert(courseTranslations)
          .values({
            courseId,
            language,
            translatedContent: translated,
          })
          .onConflictDoUpdate({
            target: [courseTranslations.courseId, courseTranslations.language],
            set: {
              translatedContent: translated,
              translatedAt: new Date(),
            },
          });
      } catch (e) {
        logger.warn("ai/translate", "Translation cache write failed", e);
      }
    }

    return NextResponse.json({
      translated,
      language,
      languageName,
      fromCache: false,
    });
  } catch (error) {
    logger.error("ai/translate", "Translation failed", error);
    return NextResponse.json(
      { error: "Failed to translate course" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({ languages: SUPPORTED_LANGUAGES });
}
