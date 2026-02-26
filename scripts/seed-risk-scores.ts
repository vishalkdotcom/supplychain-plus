/**
 * Seed script: Triggers the risk calculation engine for all suppliers.
 *
 * Usage: bun run scripts/seed-risk-scores.ts
 *
 * This calls the `/api/jobs/calculate-risk` endpoint which:
 * 1. Queries SQL Server for case data per supplier
 * 2. Queries PostgreSQL for survey data per supplier
 * 3. Queries MySQL for training completion data
 * 4. Computes weighted risk scores
 * 5. Upserts into supplier_risk_scores table
 * 6. Creates history snapshots in supplier_risk_history
 * 7. Generates alerts for high-risk suppliers (score >= 75)
 *
 * Prerequisites:
 * - wovo_ai database exists with schema pushed (bun run db:push)
 * - All 3 source databases are accessible
 * - Dev server is running (bun run dev)
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3030";

async function seedRiskScores() {
  console.log("🚀 Starting risk score calculation for all suppliers...");
  console.log(`   Targeting: ${BASE_URL}/api/jobs/calculate-risk\n`);

  try {
    const res = await fetch(`${BASE_URL}/api/jobs/calculate-risk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error(`❌ Error: ${res.status} ${res.statusText}`);
      console.error(error);
      process.exit(1);
    }

    const data = await res.json();
    console.log(`✅ Success! ${data.message}`);
    console.log(`   Suppliers processed: ${data.count}`);
  } catch (error) {
    console.error("❌ Failed to connect to the dev server.");
    console.error("   Make sure the dev server is running: bun run dev");
    console.error(error);
    process.exit(1);
  }
}

seedRiskScores();
