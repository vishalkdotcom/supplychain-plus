import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { jobRuns } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const [run] = await db
    .select()
    .from(jobRuns)
    .where(eq(jobRuns.id, parseInt(id)))
    .limit(1);

  if (!run) {
    return NextResponse.json({ error: "Run not found" }, { status: 404 });
  }

  return NextResponse.json(run);
}
