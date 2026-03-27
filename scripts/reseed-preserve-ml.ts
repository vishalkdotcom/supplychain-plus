/**
 * Reseed all databases while preserving ML batch job results.
 *
 * Usage: bun run reseed
 *
 * Phases:
 *   1. Export ML table data to scripts/ml-backup/ as JSON
 *   2. Tear down Docker volumes & recreate containers (init SQL re-runs)
 *   3. Run non-ML seed steps (schema push, payslips, risk scores, history)
 *   4. Restore ML data from backup
 *
 * Prerequisites:
 *   - Docker running
 *   - Dev server will need restarting after Phase 2 (script prompts you)
 */

import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import postgres from "postgres";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";
import * as schema from "../lib/db/schema";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3030";
const BACKUP_DIR = join(import.meta.dir, "ml-backup");
const PROJECT_ROOT = join(import.meta.dir, "..");

// ─── Helpers (adapted from seed-all.ts) ──────────────────────

interface StepResult {
  name: string;
  success: boolean;
  duration: number;
  detail?: string;
}

const results: StepResult[] = [];

async function run(name: string, fn: () => Promise<string>) {
  const start = Date.now();
  process.stdout.write(`\n>> ${name}...`);
  try {
    const detail = await fn();
    const duration = (Date.now() - start) / 1000;
    console.log(` done (${duration.toFixed(1)}s)`);
    if (detail) console.log(`   ${detail}`);
    results.push({ name, success: true, duration, detail });
  } catch (err) {
    const duration = (Date.now() - start) / 1000;
    const msg = err instanceof Error ? err.message : String(err);
    console.log(` FAILED (${duration.toFixed(1)}s)`);
    console.log(`   ${msg}`);
    results.push({ name, success: false, duration, detail: msg });
  }
}

async function shell(cmd: string): Promise<string> {
  const proc = Bun.spawn(cmd.split(" "), {
    stdout: "pipe",
    stderr: "pipe",
    cwd: PROJECT_ROOT,
  });
  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();
  const code = await proc.exited;
  if (code !== 0) throw new Error(stderr || stdout || `Exit code ${code}`);
  return stdout.trim();
}

async function callJob(path: string): Promise<string> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return JSON.stringify(data);
}

function createDb() {
  const connectionString = `postgres://${process.env.POSTGRES_USER || "postgres"}:${process.env.POSTGRES_PASSWORD || ""}@${process.env.POSTGRES_HOST || "localhost"}:${process.env.POSTGRES_PORT || "5432"}/${process.env.POSTGRES_DATABASE_WOVO_AI}`;
  const client = postgres(connectionString, { max: 5, connect_timeout: 10 });
  const db = drizzle(client, { schema });
  return { db, client };
}

function writeBackup(name: string, data: unknown[]) {
  const path = join(BACKUP_DIR, `${name}.json`);
  writeFileSync(path, JSON.stringify(data, null, 2));
  console.log(`   ${name}: ${data.length} rows`);
}

// Timestamp fields that need Date reconversion after JSON.parse
const TIMESTAMP_FIELDS = new Set([
  "calculatedAt", "analyzedAt", "generatedAt", "detectedAt",
  "createdAt", "resolvedAt", "translatedAt", "closedAt",
  "updatedAt", "lockedAt", "startedAt", "completedAt",
]);

function readBackup<T>(name: string): T[] {
  const path = join(BACKUP_DIR, `${name}.json`);
  if (!existsSync(path)) return [];
  const raw = readFileSync(path, "utf-8");
  // Revive ISO date strings back to Date objects for timestamp columns
  return JSON.parse(raw, (key, value) => {
    if (TIMESTAMP_FIELDS.has(key) && typeof value === "string") {
      return new Date(value);
    }
    return value;
  }) as T[];
}

function waitForInput(msg: string) {
  prompt(`\n${msg}`);
}

async function waitForHealthy(timeout = 120_000) {
  const containers = ["wovo_plus_postgres", "wovo_plus_mysql", "wovo_plus_sqlserver"];
  const start = Date.now();

  for (const name of containers) {
    process.stdout.write(`   Waiting for ${name}...`);
    while (Date.now() - start < timeout) {
      try {
        const result = await shell(
          `docker inspect --format={{.State.Health.Status}} ${name}`,
        );
        if (result === "healthy") {
          console.log(" healthy");
          break;
        }
      } catch {
        // container not ready yet
      }
      await Bun.sleep(2000);
    }
    if (Date.now() - start >= timeout) {
      throw new Error(`Timeout waiting for ${name} to become healthy`);
    }
  }

  // Grace period for init scripts to finish after health checks pass
  console.log("   Waiting 5s for init scripts to complete...");
  await Bun.sleep(5000);
}

// ─── Phase 1: Export ML Data ─────────────────────────────────

async function exportMlData() {
  console.log("\n═══ Phase 1: Export ML Data ═══");

  const { db, client } = createDb();

  try {
    // Strip `id` from rows — let serial auto-assign on restore
    const stripId = <T extends { id: number }>(rows: T[]) =>
      rows.map(({ id: _, ...rest }) => rest);

    // Case clusters — keep original id for embedding→cluster mapping
    const clusters = await db.select().from(schema.caseClusters);
    writeBackup("case_clusters", clusters); // keep id for mapping

    // Case embeddings — keep clusterId reference
    const embeddings = await db.select().from(schema.caseEmbeddings);
    writeBackup("case_embeddings", stripId(embeddings));

    // Worker voice trends
    const voiceTrends = await db.select().from(schema.workerVoiceTrends);
    writeBackup("worker_voice_trends", stripId(voiceTrends));

    // Risk forecast
    const forecasts = await db.select().from(schema.supplierRiskForecast);
    writeBackup("supplier_risk_forecast", stripId(forecasts));

    // Payslip anomalies
    const anomalies = await db.select().from(schema.payslipAnomalies);
    writeBackup("payslip_anomalies", stripId(anomalies));

    // Survey analysis
    const surveys = await db.select().from(schema.surveyAnalysis);
    writeBackup("survey_analysis", stripId(surveys));

    // ML-generated alerts (payslip_anomaly type)
    const mlAlerts = await db
      .select()
      .from(schema.alerts)
      .where(eq(schema.alerts.alertType, "payslip_anomaly"));
    writeBackup(
      "ml_alerts",
      mlAlerts.map(({ id: _, isRead: __, resolvedAt: ___, ...rest }) => rest),
    );

    // Monitoring signals
    const monitoringSignals = await db.select().from(schema.supplierMonitoringSignals);
    writeBackup("supplier_monitoring_signals", stripId(monitoringSignals));

    // Survey temporal patterns
    const temporalPatterns = await db.select().from(schema.surveyTemporalPatterns);
    writeBackup("survey_temporal_patterns", stripId(temporalPatterns));

    // Remediation plans (keep IDs for evidence references)
    const remediations = await db.select().from(schema.remediationPlans);
    writeBackup("remediation_plans", remediations);

    // Remediation evidence
    const evidence = await db.select().from(schema.remediationEvidence);
    writeBackup("remediation_evidence", stripId(evidence));

    const totalRows =
      clusters.length +
      embeddings.length +
      voiceTrends.length +
      forecasts.length +
      anomalies.length +
      surveys.length +
      mlAlerts.length +
      monitoringSignals.length +
      temporalPatterns.length +
      remediations.length +
      evidence.length;

    if (totalRows === 0) {
      console.log("\n   ⚠ No ML data found — continuing with fresh seed");
    }

    return totalRows;
  } finally {
    await client.end();
  }
}

// ─── Phase 2: Tear Down & Recreate Docker ────────────────────

async function rebuildDocker(): Promise<string> {
  console.log("\n═══ Phase 2: Rebuild Docker Containers ═══");

  await shell("docker compose down -v");
  console.log("   Volumes removed, containers stopped");

  await shell("docker compose up -d");
  console.log("   Containers starting...");

  await waitForHealthy();
  return "all containers healthy";
}

// ─── Phase 3: Non-ML Seed Steps ──────────────────────────────

async function seedNonMl() {
  console.log("\n═══ Phase 3: Seed Non-ML Data ═══");

  waitForInput(
    "Start/restart your dev server (bun run dev) then press Enter...",
  );

  // Verify dev server
  await run("Verify dev server", async () => {
    const res = await fetch(BASE_URL);
    if (!res.ok) throw new Error(`Dev server returned ${res.status}`);
    return `reachable at ${BASE_URL}`;
  });
  if (results.at(-1) && !results.at(-1)!.success) {
    console.error(`\nDev server not reachable at ${BASE_URL}. Cannot continue.`);
    return;
  }

  await run("Push Drizzle schema", () => shell("bunx drizzle-kit push"));

  await run("Seed payslips", () => shell("bun run scripts/seed-payslips.ts"));

  await run("Calculate risk scores", () =>
    callJob("/api/jobs/calculate-risk"),
  );

  await run("Seed risk history (30 days)", () =>
    shell("bun run scripts/seed-history.ts"),
  );
}

// ─── Phase 4: Restore ML Data ────────────────────────────────

async function restoreMlData() {
  console.log("\n═══ Phase 4: Restore ML Data ═══");

  const { db, client } = createDb();

  try {
    // Restore case clusters first (embeddings reference their IDs)
    const clusterIdMap = new Map<number, number>();

    await run("Restore case_clusters", async () => {
      const rows = readBackup<(typeof schema.caseClusters.$inferInsert) & { id: number }>(
        "case_clusters",
      );
      if (rows.length === 0) return "no data to restore";

      // Insert without id, capture old→new ID mapping
      for (const { id: originalId, ...row } of rows) {
        const [inserted] = await db
          .insert(schema.caseClusters)
          .values(row)
          .returning({ id: schema.caseClusters.id });
        clusterIdMap.set(originalId, inserted.id);
      }

      return `${rows.length} clusters restored`;
    });

    // Restore case embeddings with mapped cluster IDs
    await run("Restore case_embeddings", async () => {
      const rows = readBackup<typeof schema.caseEmbeddings.$inferInsert>(
        "case_embeddings",
      );
      if (rows.length === 0) return "no data to restore";

      // Remap clusterId to new auto-generated IDs
      const mapped = rows.map((row) => ({
        ...row,
        clusterId: row.clusterId
          ? (clusterIdMap.get(row.clusterId) ?? row.clusterId)
          : null,
      }));

      // Batch insert (500 at a time)
      for (let i = 0; i < mapped.length; i += 500) {
        await db.insert(schema.caseEmbeddings).values(mapped.slice(i, i + 500));
      }
      return `${mapped.length} embeddings restored`;
    });

    // Simple table restores (no ID mapping needed)
    const simpleTables = [
      {
        name: "worker_voice_trends",
        table: schema.workerVoiceTrends,
        file: "worker_voice_trends",
      },
      {
        name: "supplier_risk_forecast",
        table: schema.supplierRiskForecast,
        file: "supplier_risk_forecast",
      },
      {
        name: "payslip_anomalies",
        table: schema.payslipAnomalies,
        file: "payslip_anomalies",
      },
      {
        name: "survey_analysis",
        table: schema.surveyAnalysis,
        file: "survey_analysis",
      },
      { name: "ml_alerts", table: schema.alerts, file: "ml_alerts" },
      {
        name: "supplier_monitoring_signals",
        table: schema.supplierMonitoringSignals,
        file: "supplier_monitoring_signals",
      },
      {
        name: "survey_temporal_patterns",
        table: schema.surveyTemporalPatterns,
        file: "survey_temporal_patterns",
      },
    ] as const;

    for (const { name, table, file } of simpleTables) {
      await run(`Restore ${name}`, async () => {
        const rows = readBackup<Record<string, unknown>>(file);
        if (rows.length === 0) return "no data to restore";

        for (let i = 0; i < rows.length; i += 500) {
          await db
            .insert(table)
            .values(rows.slice(i, i + 500) as never)
            .onConflictDoNothing();
        }
        return `${rows.length} rows restored`;
      });
    }
    // Restore remediation plans (keep IDs for evidence FK)
    const remediationIdMap = new Map<number, number>();

    await run("Restore remediation_plans", async () => {
      const rows = readBackup<(typeof schema.remediationPlans.$inferInsert) & { id: number }>(
        "remediation_plans",
      );
      if (rows.length === 0) return "no data to restore";

      for (const { id: originalId, ...row } of rows) {
        const [inserted] = await db
          .insert(schema.remediationPlans)
          .values(row)
          .returning({ id: schema.remediationPlans.id });
        remediationIdMap.set(originalId, inserted.id);
      }
      return `${rows.length} plans restored`;
    });

    await run("Restore remediation_evidence", async () => {
      const rows = readBackup<Record<string, unknown>>("remediation_evidence");
      if (rows.length === 0) return "no data to restore";

      const mapped = rows.map((row) => ({
        ...row,
        remediationId: row.remediationId
          ? (remediationIdMap.get(row.remediationId as number) ?? row.remediationId)
          : row.remediationId,
      }));

      for (let i = 0; i < mapped.length; i += 500) {
        await db
          .insert(schema.remediationEvidence)
          .values(mapped.slice(i, i + 500) as never)
          .onConflictDoNothing();
      }
      return `${mapped.length} evidence items restored`;
    });
  } finally {
    await client.end();
  }
}

// ─── Main ────────────────────────────────────────────────────

async function main() {
  console.log("╔══════════════════════════════════════╗");
  console.log("║  WOVO+ Reseed (ML Data Preserved)    ║");
  console.log("╚══════════════════════════════════════╝");

  mkdirSync(BACKUP_DIR, { recursive: true });

  // Phase 1: Export
  try {
    await exportMlData();
  } catch (err) {
    console.error(
      "\nFailed to export ML data — aborting to protect existing data.",
    );
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }

  // Phase 2: Docker rebuild
  await run("Rebuild Docker containers", rebuildDocker);
  if (results.some((r) => !r.success)) {
    console.error("\nDocker rebuild failed — aborting.");
    process.exit(1);
  }

  // Phase 3: Non-ML seeds
  await seedNonMl();

  // Phase 4: Restore ML data
  await restoreMlData();

  // Summary
  console.log("\n╔══════════════════════════════════════╗");
  console.log("║  Summary                             ║");
  console.log("╚══════════════════════════════════════╝");
  const maxName = Math.max(...results.map((r) => r.name.length));
  for (const r of results) {
    const status = r.success ? "OK  " : "FAIL";
    console.log(
      `  ${r.name.padEnd(maxName)}  ${status}  ${r.duration.toFixed(1)}s`,
    );
  }

  const failed = results.filter((r) => !r.success);
  if (failed.length > 0) {
    console.log(`\n${failed.length} step(s) failed.`);
    process.exit(1);
  } else {
    console.log("\nAll steps completed. ML data preserved.");
  }
}

main();
