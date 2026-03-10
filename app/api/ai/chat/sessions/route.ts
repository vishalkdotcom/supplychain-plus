import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { aiChatHistory } from "@/lib/db/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  try {
    // We want a list of unique sessions, ideally with the first user message acting as a "title"
    // Since Drizzle ORM's distinctOn isn't perfectly supported in all Postgres instances without
    // raw SQL for complex queries, we'll fetch all history ordered by date and group in memory.
    // For smaller histories this is fine. For larger, we should write a raw SQL query.
    
    // We fetch ordered by oldest first, so the first user message we hit is the "title".
    const allHistory = await db
      .select({
        sessionId: aiChatHistory.sessionId,
        role: aiChatHistory.role,
        content: aiChatHistory.content,
        createdAt: aiChatHistory.createdAt,
      })
      .from(aiChatHistory)
      .orderBy(asc(aiChatHistory.createdAt));

    // Group into sessions
    const sessionsMap = new Map<string, { sessionId: string; title: string; updatedAt: Date }>();

    for (const msg of allHistory) {
      if (!sessionsMap.has(msg.sessionId)) {
        sessionsMap.set(msg.sessionId, {
          sessionId: msg.sessionId,
          // Fallback title if there's no user message first (rare)
          title: msg.role === "user" ? msg.content : "New Conversation",
          updatedAt: msg.createdAt,
        });
      } else {
        // Update the timestamp to the latest message
        const currentSession = sessionsMap.get(msg.sessionId)!;
        currentSession.updatedAt = msg.createdAt;
      }
    }

    const sessions = Array.from(sessionsMap.values())
      // Sort sessions by most recently updated
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      // Truncate title length
      .map((session) => ({
        ...session,
        title: session.title.length > 50 ? session.title.substring(0, 50) + "..." : session.title,
      }));

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Failed to fetch chat sessions:", error);
    return NextResponse.json({ sessions: [] }, { status: 500 });
  }
}
