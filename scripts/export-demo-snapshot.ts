/**
 * Export pre-computed ML/AI data from local wovo_ai database as SQL INSERT statements.
 *
 * Run this AFTER seed-all has completed successfully on your local machine.
 * The output file can be loaded on the Oracle VM to skip re-running the full
 * AI pipeline (which requires Ollama + GPU for case-clustering).
 *
 * Usage: bun run scripts/export-demo-snapshot.ts
 * Output: dumps/demo-snapshot.sql
 */

import postgres from "postgres";
import { writeFileSync, mkdirSync } from "fs";

const connectionString = `postgres://${process.env.POSTGRES_USER || "pguser"}:${process.env.POSTGRES_PASSWORD || "pgpass"}@${process.env.POSTGRES_HOST || "localhost"}:${process.env.POSTGRES_PORT || "5432"}/${process.env.POSTGRES_DATABASE_WOVO_AI || "wovo_ai"}`;

const sql = postgres(connectionString, { max: 1 });

// Tables to export (order matters for foreign key deps)
const TABLES = [
  "supplier_risk_scores",
  "supplier_risk_history",
  "survey_analysis",
  "supplier_risk_forecast",
  "worker_voice_trends",
  "payslip_anomalies",
  "case_embeddings",
  "case_clusters",
  "cluster_snapshots",
  "supplier_monitoring_signals",
  "survey_temporal_patterns",
  "regional_benchmarks",
  "remediation_plans",
  "remediation_evidence",
  "intelligence_briefing",
  "job_runs",
  "job_schedules",
  "regulatory_frameworks",
  "framework_requirements",
  "supplier_framework_compliance",
  "requirement_evidence",
  "alerts",
  "rate_limit_daily_usage",
];

function escapeValue(val: unknown): string {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "number") return String(val);
  if (typeof val === "boolean") return val ? "TRUE" : "FALSE";
  if (val instanceof Date) return `'${val.toISOString()}'`;
  if (typeof val === "object") return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
  // String — escape single quotes
  return `'${String(val).replace(/'/g, "''")}'`;
}

async function exportTable(table: string): Promise<string> {
  const rows = await sql.unsafe(`SELECT * FROM "${table}"`);
  if (rows.length === 0) return `-- ${table}: empty\n`;

  const columns = Object.keys(rows[0]);
  const colList = columns.map((c) => `"${c}"`).join(", ");
  const lines: string[] = [`-- ${table}: ${rows.length} rows`];

  for (const row of rows) {
    const values = columns.map((c) => escapeValue(row[c])).join(", ");
    lines.push(`INSERT INTO "${table}" (${colList}) VALUES (${values}) ON CONFLICT DO NOTHING;`);
  }

  return lines.join("\n") + "\n\n";
}

async function main() {
  console.log("Exporting demo snapshot from wovo_ai...\n");

  const parts: string[] = [
    "-- SupplyChain+ Demo Snapshot",
    `-- Exported: ${new Date().toISOString()}`,
    "-- Load this on the VM after Drizzle schema push (bun run db:push)",
    "",
    "BEGIN;",
    "",
  ];

  for (const table of TABLES) {
    process.stdout.write(`  ${table}...`);
    try {
      const result = await exportTable(table);
      parts.push(result);
      const rowCount = (result.match(/INSERT/g) || []).length;
      console.log(` ${rowCount} rows`);
    } catch (err) {
      console.log(` skipped (${(err as Error).message})`);
      parts.push(`-- ${table}: skipped (error)\n\n`);
    }
  }

  parts.push("COMMIT;");

  mkdirSync("dumps", { recursive: true });
  const outputPath = "dumps/demo-snapshot.sql";
  writeFileSync(outputPath, parts.join("\n"), "utf-8");

  console.log(`\n✓ Snapshot saved to ${outputPath}`);
  console.log("  Copy this file to the VM and run:");
  console.log("  psql -h localhost -U pguser -d wovo_ai -f dumps/demo-snapshot.sql");

  await sql.end();
}

main().catch((err) => {
  console.error("Export failed:", err);
  process.exit(1);
});
