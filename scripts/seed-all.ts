/**
 * Master seed script: Rebuilds all derived data in the wovo_ai database.
 *
 * Usage: bun run scripts/seed-all.ts
 *
 * This script orchestrates all seed/job steps in the correct order:
 *   1. Push Drizzle schema (ensures wovo_ai tables exist)
 *   2. Seed payslips into SQL Server
 *   3. Calculate risk scores + monitoring signals (queries all 3 source DBs → wovo_ai)
 *   4. Backfill 30 days of risk history
 *   5. Run AI jobs sequentially (surveys, clustering, anomaly, forecast, voice)
 *   6. Generate intelligence briefing (aggregates all ML outputs)
 *   7. Seed default job schedules (idempotent)
 *
 * Prerequisites:
 *   - All 3 Docker containers running (mysql, postgres, sqlserver)
 *   - Source databases seeded (init scripts ran on first volume creation)
 *   - Dev server running (bun run dev) on port 3030
 *   - Ollama running with required models
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3030";

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
    cwd: import.meta.dir + "/..",
  });
  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();
  const code = await proc.exited;
  if (code !== 0) throw new Error(stderr || stdout || `Exit code ${code}`);
  return stdout.trim();
}

async function callJob(path: string, body?: unknown): Promise<string> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return JSON.stringify(data);
}

async function fetchJson(path: string): Promise<unknown> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function main() {
  console.log("=== SupplyChain+ Seed All ===");
  console.log(`Target: ${BASE_URL}`);

  // 0. Verify dev server is reachable
  try {
    await fetch(BASE_URL);
  } catch {
    console.error("\nDev server not reachable at " + BASE_URL);
    console.error("Start it first: bun run dev");
    process.exit(1);
  }

  // 1. Push Drizzle schema
  await run("Push Drizzle schema", async () => {
    return await shell("bunx drizzle-kit push");
  });

  // 2. Seed payslips (direct DB insert, no dev server needed)
  await run("Seed payslips", async () => {
    return await shell("bun run scripts/seed-payslips.ts");
  });

  // 3. Calculate risk scores (populates supplierRiskScores + 1 history row)
  await run("Calculate risk scores", async () => {
    return await callJob("/api/jobs/calculate-risk");
  });

  // 4. Backfill 30 days of risk history
  await run("Seed risk history (30 days)", async () => {
    return await shell("bun run scripts/seed-history.ts");
  });

  // 5. AI jobs — run sequentially to avoid Ollama VRAM thrashing
  //    Order matches RUN_ALL_ORDER from lib/jobs/constants.ts
  //    (calculate-risk already ran in step 3)
  const aiJobs = [
    { name: "Survey analysis", path: "/api/jobs/analyze-surveys" },
    { name: "Case clustering", path: "/api/jobs/case-clustering" },
    { name: "Payslip anomaly detection", path: "/api/jobs/payslip-anomaly" },
    { name: "Risk forecast", path: "/api/jobs/risk-forecast" },
    { name: "Worker voice analytics", path: "/api/jobs/worker-voice-analytics" },
  ];

  for (const job of aiJobs) {
    await run(job.name, () => callJob(job.path));
  }

  // 5b. Backfill cluster history (6 months of trend snapshots)
  await run("Seed cluster history (6 months)", async () => {
    return await shell("bun run scripts/seed-cluster-history.ts");
  });

  // 6. Seed regulatory frameworks
  await run("Seed regulatory frameworks", async () => {
    return await shell("bun run scripts/seed-regulatory.ts");
  });

  // 7. Generate intelligence briefing (aggregates all ML outputs)
  await run("Generate intelligence briefing", () =>
    callJob("/api/jobs/generate-briefing"),
  );

  // 8. Seed default job schedules (idempotent — skips existing)
  await run("Seed job schedules", async () => {
    const existing = (await fetchJson("/api/jobs/schedules")) as { jobType: string }[];
    const existingTypes = new Set(existing.map((s) => s.jobType));

    const defaults = [
      { jobType: "calculate-risk", cronExpression: "0 4 * * *" },
      { jobType: "worker-voice-analytics", cronExpression: "0 5 * * *" },
      { jobType: "risk-forecast", cronExpression: "0 5 * * 1" },
      { jobType: "generate-briefing", cronExpression: "0 6 * * *" },
    ];

    let created = 0;
    for (const sched of defaults) {
      if (existingTypes.has(sched.jobType)) continue;
      await callJob("/api/jobs/schedules", sched);
      created++;
    }
    return `${created} schedule(s) created, ${defaults.length - created} already existed`;
  });

  // Summary
  console.log("\n=== Summary ===");
  const maxName = Math.max(...results.map((r) => r.name.length));
  for (const r of results) {
    const status = r.success ? "OK" : "FAIL";
    console.log(`  ${r.name.padEnd(maxName)}  ${status.padEnd(4)}  ${r.duration.toFixed(1)}s`);
  }

  const failed = results.filter((r) => !r.success);
  if (failed.length > 0) {
    console.log(`\n${failed.length} step(s) failed.`);
    process.exit(1);
  } else {
    console.log("\nAll steps completed successfully.");
  }
}

main();
