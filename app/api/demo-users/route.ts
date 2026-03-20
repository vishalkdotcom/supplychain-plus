import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { demoUsers } from "@/lib/db/schema";

export async function GET() {
  try {
    const users = await db.select().from(demoUsers);
    return NextResponse.json(users);
  } catch {
    return NextResponse.json([], { status: 200 }); // Graceful fallback if table doesn't exist yet
  }
}
