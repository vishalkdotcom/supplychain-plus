import { NextResponse } from "next/server";
import { generateText, Output } from "ai";
import { model } from "@/lib/ai/provider";
import { z } from "zod";
import { PDFParse } from "pdf-parse";

// Force node runtime to support pdf-parse
export const runtime = "nodejs";
export const maxDuration = 60; // Allow enough time for parsing and AI generation

const courseSchema = z.object({
  title: z.string().describe("The generated title for the course based on the document"),
  description: z.string().describe("A brief description of the course"),
  lessons: z.array(z.object({
    title: z.string().describe("Title of the lesson"),
    content: z.string().describe("Content of the lesson, covering key points from the policy document"),
  })),
  quiz: z.array(z.object({
    question: z.string(),
    options: z.array(z.string()),
    correctAnswerIndex: z.number().describe("The 0-based index of the correct answer in the options array")
  }))
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to Buffer for pdf-parse
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Parse PDF
    const parser = new PDFParse({ data: buffer });
    const pdfData = await parser.getText();
    const documentText = pdfData.text;

    // Truncate to avoid massive token limits if PDF is huge
    const truncatedText = documentText.substring(0, 15000); 

    // Generate Course with AI
    const result = await generateText({
      model,
      system: "You are an expert compliance training course creator. You receive a policy document and transform it into an engaging, structured course with lessons and a quiz. Keep it concise, accessible, and informative for workers.",
      prompt: `Generate a course from the following document:\n\n${truncatedText}`,
      output: Output.object({ schema: courseSchema }),
    });

    return NextResponse.json({ success: true, course: result.output });

  } catch (error) {
    console.error("Course generation failed:", error);
    return NextResponse.json({ error: "Failed to generate course" }, { status: 500 });
  }
}
