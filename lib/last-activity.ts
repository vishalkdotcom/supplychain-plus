import { db } from "@/lib/db/drizzle";
import { sql } from "drizzle-orm";

/**
 * Get the most recent activity date for a single supplier
 * by checking across all pipeline-populated tables.
 * Returns ISO date string (YYYY-MM-DD) or null if no activity found.
 */
export async function getLastActivityDate(
  supplierId: string,
): Promise<string | null> {
  const result = await db.execute(sql`
    SELECT GREATEST(
      (SELECT MAX(snapshot_date) FROM supplier_risk_history WHERE supplier_id = ${supplierId}),
      (SELECT MAX(month) FROM worker_voice_trends WHERE supplier_id = ${supplierId}),
      (SELECT MAX(detected_at::date) FROM supplier_monitoring_signals WHERE supplier_id = ${supplierId}),
      (SELECT MAX(created_at::date) FROM alerts WHERE supplier_id = ${supplierId})
    ) AS last_activity
  `);

  const lastActivity = result[0]?.last_activity;
  if (!lastActivity) return null;

  // Normalize to YYYY-MM-DD string
  const d = new Date(String(lastActivity));
  return d.toISOString().split("T")[0];
}

/**
 * Batch-fetch last activity dates for multiple suppliers in a single query.
 * Uses LATERAL joins to efficiently compute per-supplier MAX dates.
 * Returns a Map of supplierId → ISO date string.
 */
export async function getLastActivityDates(
  supplierIds: string[],
): Promise<Map<string, string>> {
  const activityMap = new Map<string, string>();
  if (supplierIds.length === 0) return activityMap;

  // Build PostgreSQL array literal to pass as a single parameter
  // (Drizzle expands JS arrays into multiple $N params, but unnest() needs a single array)
  const pgArray = `{${supplierIds.join(",")}}`;

  const result = await db.execute(sql`
    SELECT
      s.id AS supplier_id,
      GREATEST(rh.max_date, wv.max_date, ms.max_date, al.max_date) AS last_activity
    FROM unnest(${pgArray}::text[]) AS s(id)
    LEFT JOIN LATERAL (
      SELECT MAX(snapshot_date) AS max_date
      FROM supplier_risk_history WHERE supplier_id = s.id
    ) rh ON true
    LEFT JOIN LATERAL (
      SELECT MAX(month) AS max_date
      FROM worker_voice_trends WHERE supplier_id = s.id
    ) wv ON true
    LEFT JOIN LATERAL (
      SELECT MAX(detected_at::date) AS max_date
      FROM supplier_monitoring_signals WHERE supplier_id = s.id
    ) ms ON true
    LEFT JOIN LATERAL (
      SELECT MAX(created_at::date) AS max_date
      FROM alerts WHERE supplier_id = s.id
    ) al ON true
  `);

  for (const row of result) {
    if (row.last_activity) {
      const d = new Date(String(row.last_activity));
      activityMap.set(String(row.supplier_id), d.toISOString().split("T")[0]);
    }
  }

  return activityMap;
}
