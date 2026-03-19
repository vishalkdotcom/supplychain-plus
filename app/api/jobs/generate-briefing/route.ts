import { NextResponse } from "next/server";
import { generateBriefing } from "@/lib/jobs/handlers/generate-briefing";
import { logger } from "@/lib/logger";

export async function POST() {
  try {
    const result = await generateBriefing();
    return NextResponse.json(result);
  } catch (error) {
    logger.error("jobs/generate-briefing", "Failed to generate intelligence briefing", error);
    return NextResponse.json({ error: "Failed to generate briefing" }, { status: 500 });
  }
}
