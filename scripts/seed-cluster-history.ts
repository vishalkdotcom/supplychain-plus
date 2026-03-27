import { db } from "../lib/db/drizzle";
import { clusterSnapshots } from "../lib/db/schema";

/**
 * Backfill 6 months of cluster snapshot history.
 *
 * Simulates a maturing detection system: fewer clusters early on,
 * gradually increasing as the ML pipeline processes more data.
 * Severity distribution: ~20% critical, ~35% warning, ~45% info.
 */

const CLUSTER_LABELS = [
  "Wage Underpayment",
  "Excessive Overtime",
  "Safety Equipment Shortages",
  "Harassment Reports",
  "Contract Violations",
  "Dormitory Conditions",
  "Rest Day Denial",
  "Chemical Exposure",
  "Recruitment Fee Complaints",
  "Delayed Wage Payment",
  "Verbal Abuse by Supervisors",
  "Inadequate Ventilation",
];

function pickLabels(count: number): typeof CLUSTER_LABELS {
  const shuffled = [...CLUSTER_LABELS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function assignSeverity(total: number): { critical: number; warning: number; info: number } {
  const critical = Math.max(1, Math.round(total * 0.2));
  const warning = Math.round(total * 0.35);
  const info = total - critical - warning;
  return { critical, warning, info };
}

async function seedClusterHistory() {
  const now = new Date();
  const months = 6;

  console.log(`Seeding ${months} months of cluster snapshot history...`);

  let inserted = 0;

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 15);
    const dateString = date.toISOString().split("T")[0];

    // Growth trend: ~60 clusters 6 months ago → ~106 now, with noise
    const baseClusters = Math.round(60 + (months - 1 - i) * 8 + (Math.random() * 10 - 5));
    const { critical, warning, info } = assignSeverity(baseClusters);

    // Build per-cluster detail array
    const labels = pickLabels(Math.min(baseClusters, CLUSTER_LABELS.length));
    const details = labels.map((label, idx) => {
      const sev = idx < critical ? "critical" : idx < critical + warning ? "warning" : "info";
      return {
        label,
        severity: sev,
        caseCount: Math.round(3 + Math.random() * 12),
        supplierCount: Math.round(2 + Math.random() * 5),
      };
    });

    // Total cases and suppliers from details
    const totalCases = details.reduce((sum, d) => sum + d.caseCount, 0);
    const totalSuppliers = Math.round(baseClusters * 0.4 + Math.random() * 10);

    await db
      .insert(clusterSnapshots)
      .values({
        snapshotDate: dateString,
        totalClusters: baseClusters,
        critical,
        warning,
        info,
        totalCases,
        totalSuppliers,
        clusterDetails: details,
      })
      .onConflictDoUpdate({
        target: [clusterSnapshots.snapshotDate],
        set: {
          totalClusters: baseClusters,
          critical,
          warning,
          info,
          totalCases,
          totalSuppliers,
          clusterDetails: details,
        },
      });

    inserted++;
    console.log(`  ${dateString}: ${baseClusters} clusters (${critical}C/${warning}W/${info}I)`);
  }

  console.log(`Done! Inserted ${inserted} cluster snapshot rows.`);
  process.exit(0);
}

seedClusterHistory();
