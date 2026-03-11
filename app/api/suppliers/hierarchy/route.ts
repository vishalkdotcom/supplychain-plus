import { NextResponse } from "next/server";
import { query } from "@/lib/db/postgres";

export interface HierarchyRelation {
  parentClientKey: string;
  parentName: string;
  childClientKey: string;
  childName: string;
}

export async function GET() {
  try {
    // clients_clientrelation stores paired rows:
    //   relation_type=0 → parent (relation_id → clients_clientinfo.id)
    //   relation_type=1 → child  (next row, id = parent.id + 1)
    const result = await query(
      `SELECT
        parent_c.client_key AS parent_client_key,
        parent_c.name       AS parent_name,
        child_c.client_key  AS child_client_key,
        child_c.name        AS child_name
      FROM clients_clientrelation parent_row
      JOIN clients_clientrelation child_row
        ON child_row.id = parent_row.id + 1
        AND child_row.relation_type = 1
      JOIN clients_clientinfo parent_c
        ON parent_row.relation_id = parent_c.id
      JOIN clients_clientinfo child_c
        ON child_row.relation_id = child_c.id
      WHERE parent_row.relation_type = 0
        AND parent_c.is_deleted = false
        AND child_c.is_deleted = false
      ORDER BY parent_c.name, child_c.name`
    );

    const hierarchy: HierarchyRelation[] = result.rows.map((r: Record<string, unknown>) => ({
      parentClientKey: String(r.parent_client_key),
      parentName: String(r.parent_name),
      childClientKey: String(r.child_client_key),
      childName: String(r.child_name),
    }));

    return NextResponse.json(hierarchy);
  } catch (error) {
    console.error("Error fetching supplier hierarchy:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
