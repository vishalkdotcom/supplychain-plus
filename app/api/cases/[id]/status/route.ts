import { NextResponse } from "next/server";
import { invalidateAfterCaseStatusChange } from "@/lib/cache/invalidate";
import { getPool } from "@/lib/db/sql-server";
import { logger } from "@/lib/logger";

// Maps application status to SQL Server CaseStatusId
const STATUS_FLOW: Array<{ key: string; label: string; sqlStatusId: number }> = [
  { key: "new", label: "New", sqlStatusId: 1 },
  { key: "in_progress", label: "In Progress", sqlStatusId: 2 },
  { key: "resolved", label: "Resolved", sqlStatusId: 3 },
];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const pool = await getPool();

    // 1. Get current status
    const current = await pool.request().input("id", id).query(`
      SELECT CaseStatusId FROM [Case] WHERE Id = @id AND Deleted = 0
    `);

    if (current.recordset.length === 0) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    const currentStatusId = current.recordset[0].CaseStatusId;
    const currentIndex = STATUS_FLOW.findIndex(
      (s) => s.sqlStatusId === currentStatusId
    );

    // 2. Determine next status
    const nextIndex = currentIndex + 1;
    if (nextIndex >= STATUS_FLOW.length) {
      return NextResponse.json(
        { error: "Case is already at final status" },
        { status: 400 }
      );
    }

    const nextStatus = STATUS_FLOW[nextIndex];

    // 3. Update in SQL Server
    await pool
      .request()
      .input("id", id)
      .input("newStatusId", nextStatus.sqlStatusId)
      .query(`
        UPDATE [Case]
        SET CaseStatusId = @newStatusId, Modified = GETDATE()
        WHERE Id = @id AND Deleted = 0
      `);

    logger.info("api/cases/[id]/status", `Case ${id} advanced to ${nextStatus.key}`);
    invalidateAfterCaseStatusChange();

    return NextResponse.json({
      newStatus: nextStatus.key,
      newStatusLabel: nextStatus.label,
      caseId: id,
    });
  } catch (error) {
    logger.error("api/cases/[id]/status", "Failed to advance case status", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
