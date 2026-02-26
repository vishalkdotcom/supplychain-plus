import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { alerts } from "@/lib/db/schema";
import { desc, eq, and } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unreadOnly") !== "false";
    const limit = parseInt(searchParams.get("limit") || "20");

    const conditions = unreadOnly ? [eq(alerts.isRead, false)] : [];

    const results = await db
      .select()
      .from(alerts)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(alerts.createdAt))
      .limit(limit);

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { alertId, isRead } = await request.json();

    if (!alertId) {
      return NextResponse.json(
        { error: "alertId is required" },
        { status: 400 },
      );
    }

    await db
      .update(alerts)
      .set({ isRead: isRead ?? true })
      .where(eq(alerts.id, alertId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating alert:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
