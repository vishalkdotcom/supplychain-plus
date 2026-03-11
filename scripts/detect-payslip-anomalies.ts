/**
 * Detect Payslip Anomalies across suppliers.
 *
 * Usage:
 *   npx tsx scripts/detect-payslip-anomalies.ts
 *
 * What it does:
 * 1. Simulates pulling payslip data for top 10 suppliers (actual data is locked in raw JSON blobs).
 * 2. Uses simple-statistics (z-score) to find wages completely out of bounds for that region.
 * 3. Sends flagged anomalies to Gemini (via resilient-generate waterfall) to generate an explanation.
 * 4. Stores anomalies in payslip_anomalies for the UI to display.
 */

import { db } from "../lib/db/drizzle";
import { payslipAnomalies, supplierRiskScores } from "../lib/db/schema";
import { resilientGenerateText } from "../lib/ai/resilient-generate";
import { zScore, standardDeviation, mean } from "simple-statistics";

const DRY_RUN = process.argv.includes("--dry-run");

// Helper to generate a realistic looking fake payslip dataset for a factory
function generateRegionalWages(baseWage: number, count: number): number[] {
  return Array.from({ length: count }, () => {
    // Normal distribution approximation around baseWage
    const randomShift = (Math.random() + Math.random() + Math.random() - 1.5) * 50; 
    return Math.max(0, Math.round(baseWage + randomShift));
  });
}

async function explainAnomaly(
  supplierName: string,
  country: string,
  actualWage: number,
  expectedWage: number,
  anomalyType: string
): Promise<string> {
  try {
    const prompt = `You are an ethical supply chain auditor.
A payslip anomaly was detected for ${supplierName} in ${country}.
Anomaly Type: ${anomalyType}
Actual Wage found: $${actualWage}
Expected Regional Average: $${expectedWage}

Write a 2-sentence explanation of why this is concerning and what the auditor should check first. Do not use formatting.`;

    const { text } = await resilientGenerateText({
      prompt,
      system: "You are an expert labor auditor.",
      temperature: 0.3,
      maxTokens: 150,
    });
    
    return text.trim();
  } catch (error) {
    console.warn("  ⚠ Failed to generate AI explanation:", (error as Error).message);
    return `Wage (${actualWage}) is significantly below the expected regional average (${expectedWage}). Recommend immediate audit of timecards and deduction records.`;
  }
}

async function detectAnomalies() {
  console.log(DRY_RUN ? "🧪 DRY RUN MODE\n" : "🚀 Detecting Payslip Anomalies...\n");

  const suppliers = await db
    .select({
      id: supplierRiskScores.supplierId,
      name: supplierRiskScores.supplierName,
    })
    .from(supplierRiskScores)
    .limit(10); // Process 10 suppliers for the demo

  let anomaliesFound = 0;
  const countries = ["Vietnam", "China", "India", "Bangladesh"];

  for (const supplier of suppliers) {
    const mockCountry = countries[Math.floor(Math.random() * countries.length)];
    console.log(`Processing ${supplier.name} (${mockCountry})...`);

    // 1. Simulate pulling 200 payslips for this factory
    const baseWage = mockCountry === "Vietnam" ? 300 : mockCountry === "China" ? 500 : 400;

    const wages = generateRegionalWages(baseWage, 200);

    // Inject 1 or 2 anomalies purposefully
    if (Math.random() > 0.5) {
      wages.push(baseWage * 0.4); // Severely underpaid
    }

    // 2. Statistical calculation
    const avg = mean(wages);
    const stdDev = standardDeviation(wages);

    // Find anomalies (z-score < -2 means extremely below average)
    for (let i = 0; i < wages.length; i++) {
      const wage = wages[i];
      const z = zScore(wage, avg, stdDev);

      if (z < -2.0) { // Found an anomaly!
        anomaliesFound++;
        const deviationPercent = Math.round(((wage - avg) / avg) * 100);
        const anomalyType = "below_minimum_wage";
        const severity = z < -3 ? "critical" : "warning";

        console.log(`  ⚠ Anomaly detected: $${wage} (Expected ~$${Math.round(avg)}, z-score: ${z.toFixed(2)})`);

        // 3. AI Explanation
        const explanation = await explainAnomaly(
          supplier.name || "Unknown",
          mockCountry,
          wage,
          Math.round(avg),
          anomalyType
        );

        if (!DRY_RUN) {
          // 4. Store in DB
          await db.insert(payslipAnomalies).values({
            payslipId: `AUTO-${Math.random().toString(36).substring(7)}`,
            supplierId: supplier.id,
            supplierName: supplier.name,
            country: mockCountry,
            anomalyType,
            severity,
            actualWage: wage,
            expectedWage: Math.round(avg),
            deviationPercent,
            details: { zScore: z, stdDev },
            aiExplanation: explanation,
          });
        } else {
          console.log(`    📝 AI Explanation: ${explanation}\n`);
        }
      }
    }
  }

  console.log(`\n✅ Done! Found ${anomaliesFound} anomalies.`);
  process.exit(0);
}

detectAnomalies().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
