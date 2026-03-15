import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { aiChatHistory } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { logger } from "@/lib/logger";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ messages: [] });
  }

  try {
    const history = await db
      .select()
      .from(aiChatHistory)
      .where(eq(aiChatHistory.sessionId, sessionId))
      .orderBy(asc(aiChatHistory.createdAt));

    return NextResponse.json({ messages: history });
  } catch (error) {
    logger.error("ai/chat/history", "Failed to fetch chat history", error);
    return NextResponse.json({ messages: [] });
  }
}
