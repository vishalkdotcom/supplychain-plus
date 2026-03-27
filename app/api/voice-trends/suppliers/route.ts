import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { workerVoiceTrends } from "@/lib/db/schema";
import { isNotNull } from "drizzle-orm";

export async function GET() {
  const rows = await db
    .selectDistinct({ supplierId: workerVoiceTrends.supplierId })
    .from(workerVoiceTrends)
    .where(isNotNull(workerVoiceTrends.supplierId))
    .orderBy(workerVoiceTrends.supplierId);

  // Enrich with supplier names from postgres (clients_clientinfo)
  const { query: pgQuery } = await import("@/lib/db/postgres");
  const supplierIds = rows.map((r) => r.supplierId).filter(Boolean);

  if (supplierIds.length === 0) {
    return NextResponse.json([]);
  }

  const placeholders = supplierIds.map((_, i) => `$${i + 1}`).join(",");
  const nameResult = await pgQuery(
    `SELECT client_key::text as id, name FROM clients_clientinfo WHERE client_key::text IN (${placeholders})`,
    supplierIds,
  );

  const nameMap = new Map(
    (nameResult.rows as Array<{ id: string; name: string }>).map((r) => [r.id, r.name]),
  );

  const suppliers = supplierIds.map((id) => ({
    id,
    name: nameMap.get(id!) || `Supplier ${id}`,
  }));

  return NextResponse.json(suppliers);
}
