import { db } from "../lib/db/drizzle";
import { supplierRiskHistory } from "../lib/db/schema";

async function seedHistory() {
  const supplierId = "137089";
  console.log(`🚀 Seeding historical data for supplier ${supplierId}...`);

  const now = new Date();
  const historyData = [];

  // Generate 30 days of data
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    const dateString = date.toISOString().split("T")[0];

    // Create a fluctuating risk score
    // Starting at 40, slightly trending up
    const baseScore = 40 + (29 - i) * 0.5; 
    const randomFluc = Math.floor(Math.random() * 10) - 5; // +/- 5
    const riskScore = Math.min(100, Math.max(0, Math.round(baseScore + randomFluc)));

    historyData.push({
      supplierId,
      riskScore,
      caseScore: Math.max(0, riskScore - 20),
      surveyScore: Math.min(100, riskScore + 10),
      trainingScore: 85,
      engagementScore: 70,
      snapshotDate: dateString,
    });
  }

  try {
    for (const data of historyData) {
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
    console.log(`✅ Successfully seeded 30 days of history for ${supplierId}`);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  }

  process.exit(0);
}

seedHistory();
