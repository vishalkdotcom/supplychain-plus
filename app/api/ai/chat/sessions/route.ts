import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { aiChatHistory } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";
import { logger } from "@/lib/logger";

const SESSION_ID_PATTERN = /^[a-zA-Z0-9_-]{1,128}$/;

export async function GET() {
  try {
    const allHistory = await db
      .select({
        sessionId: aiChatHistory.sessionId,
        role: aiChatHistory.role,
        content: aiChatHistory.content,
        sessionTitle: aiChatHistory.sessionTitle,
        isPinned: aiChatHistory.isPinned,
        createdAt: aiChatHistory.createdAt,
      })
      .from(aiChatHistory)
      .orderBy(asc(aiChatHistory.createdAt));

    // Group into sessions
    const sessionsMap = new Map<
      string,
      {
        sessionId: string;
        title: string;
        updatedAt: Date;
        isPinned: boolean;
        hasExplicitTitle: boolean;
      }
    >();

    for (const msg of allHistory) {
      const existing = sessionsMap.get(msg.sessionId);

      if (!existing) {
        // First row for this session — seed the entry
        const hasExplicitTitle = !!msg.sessionTitle;
        sessionsMap.set(msg.sessionId, {
          sessionId: msg.sessionId,
          title: hasExplicitTitle
            ? msg.sessionTitle!
            : msg.role === "user"
              ? msg.content
              : "New Conversation",
          updatedAt: msg.createdAt,
          isPinned: msg.isPinned ?? false,
          hasExplicitTitle,
        });
      } else {
        // Update timestamp to latest message
        existing.updatedAt = msg.createdAt;

        // If we haven't found an explicit title yet, check this row
        if (!existing.hasExplicitTitle && msg.sessionTitle) {
          existing.title = msg.sessionTitle;
          existing.hasExplicitTitle = true;
        }

        // Any row with isPinned=true pins the session
        if (msg.isPinned) {
          existing.isPinned = true;
        }
      }
    }

    const sessions = Array.from(sessionsMap.values())
      // Pinned first (desc by updatedAt), then non-pinned (desc by updatedAt)
      .sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return b.updatedAt.getTime() - a.updatedAt.getTime();
      })
      .map(({ sessionId, title, updatedAt, isPinned }) => ({
        sessionId,
        title:
          title.length > 50 ? title.substring(0, 50) + "..." : title,
        updatedAt,
        isPinned,
      }));

    return NextResponse.json({ sessions });
  } catch (error) {
    logger.error("ai/chat/sessions", "Failed to fetch chat sessions", error);
    return NextResponse.json({ sessions: [] }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, title, isPinned } = body as {
      sessionId?: string;
      title?: string;
      isPinned?: boolean;
    };

    if (!sessionId || !SESSION_ID_PATTERN.test(sessionId)) {
      return NextResponse.json(
        { error: "Invalid or missing sessionId" },
        { status: 400 },
      );
    }

    if (title === undefined && isPinned === undefined) {
      return NextResponse.json(
        { error: "Nothing to update — provide title and/or isPinned" },
        { status: 400 },
      );
    }

    const updates: Partial<{
      sessionTitle: string | null;
      isPinned: boolean;
    }> = {};
    if (title !== undefined) updates.sessionTitle = title;
    if (isPinned !== undefined) updates.isPinned = isPinned;

    await db
      .update(aiChatHistory)
      .set(updates)
      .where(eq(aiChatHistory.sessionId, sessionId));

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("ai/chat/sessions", "Failed to update session", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
