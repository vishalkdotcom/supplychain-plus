import { db } from "../lib/db/drizzle";
import { supplierRiskScores, supplierRiskHistory } from "../lib/db/schema";

function clamp(n: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, Math.round(n)));
}

async function seedHistory() {
  // Fetch all suppliers with current scores as baseline
  const suppliers = await db.select().from(supplierRiskScores);

  if (suppliers.length === 0) {
    console.error("No suppliers found in supplier_risk_scores. Run calculate-risk first.");
    process.exit(1);
  }

  console.log(`Seeding 30 days of history for ${suppliers.length} suppliers...`);

  const now = new Date();
  let inserted = 0;

  for (const supplier of suppliers) {
    const rows = [];

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dateString = date.toISOString().split("T")[0];

      // Work backwards from current score with slight drift + daily noise
      const drift = (29 - i) * 0.3; // scores were slightly lower in the past
      const noise = () => Math.floor(Math.random() * 10) - 5; // +/- 5

      const riskScore = clamp((supplier.riskScore ?? 50) - drift + noise());
      const caseScore = clamp((supplier.caseScore ?? 50) - drift + noise());
      const surveyScore = clamp((supplier.surveyScore ?? 50) - drift * 0.5 + noise());
      const trainingScore = clamp((supplier.trainingScore ?? 80) + noise() * 0.5);
      const engagementScore = clamp((supplier.engagementScore ?? 70) + noise() * 0.3);

      rows.push({
        supplierId: supplier.supplierId,
        riskScore,
        caseScore,
        surveyScore,
        trainingScore,
        engagementScore,
        snapshotDate: dateString,
      });
    }

    // Batch insert per supplier
    for (const data of rows) {
      await db
        .insert(supplierRiskHistory)
        .values(data)
        .onConflictDoUpdate({
          target: [supplierRiskHistory.supplierId, supplierRiskHistory.snapshotDate],
          set: {
            riskScore: data.riskScore,
            caseScore: data.caseScore,
            surveyScore: data.surveyScore,
            trainingScore: data.trainingScore,
            engagementScore: data.engagementScore,
          },
        });
    }

    inserted += rows.length;
    if ((suppliers.indexOf(supplier) + 1) % 50 === 0) {
      console.log(`  ... ${suppliers.indexOf(supplier) + 1}/${suppliers.length} suppliers done`);
    }
  }

  console.log(`Done! Inserted ${inserted} history rows for ${suppliers.length} suppliers.`);
  process.exit(0);
}

seedHistory();
