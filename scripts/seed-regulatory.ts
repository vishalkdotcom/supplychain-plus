/**
 * Seed regulatory frameworks, requirements, and sample compliance data.
 *
 * Usage: bun run scripts/seed-regulatory.ts
 *
 * Prerequisites: PostgreSQL running, Drizzle schema pushed.
 */

import { db } from "../lib/db/drizzle";
import {
  regulatoryFrameworks,
  frameworkRequirements,
  supplierFrameworkCompliance,
  supplierRiskScores,
} from "../lib/db/schema";

const FRAMEWORKS = [
  {
    slug: "eu-csddd",
    name: "EU Corporate Sustainability Due Diligence Directive",
    shortName: "CSDDD",
    jurisdiction: "European Union",
    effectiveDate: "2027-07-01",
    nextDeadline: "2027-07-01",
    description:
      "Requires large EU companies and non-EU companies with significant EU turnover to identify, prevent, mitigate, and account for adverse human rights and environmental impacts in their operations and value chains.",
    websiteUrl: "https://commission.europa.eu/business-economy-euro/doing-business-eu/sustainability-due-diligence-responsible-business/corporate-sustainability-due-diligence_en",
    requirements: [
      { code: "CSDDD-Art5", title: "Due diligence policy", category: "Due Diligence", evidenceTypes: ["manual_note"], sortOrder: 1 },
      { code: "CSDDD-Art6", title: "Risk identification & assessment", category: "Due Diligence", evidenceTypes: ["risk_score_drop", "manual_note"], sortOrder: 2 },
      { code: "CSDDD-Art7", title: "Prevention & mitigation of adverse impacts", category: "Remediation", evidenceTypes: ["case_resolved", "anomaly_resolved"], sortOrder: 3 },
      { code: "CSDDD-Art8", title: "Remediation of actual adverse impacts", category: "Remediation", evidenceTypes: ["case_resolved", "survey_improvement"], sortOrder: 4 },
      { code: "CSDDD-Art9", title: "Monitoring & periodic assessment", category: "Monitoring", evidenceTypes: ["survey_improvement", "engagement_improvement"], sortOrder: 5 },
      { code: "CSDDD-Art10", title: "Stakeholder engagement", category: "Monitoring", evidenceTypes: ["survey_improvement", "satisfaction_improvement"], sortOrder: 6 },
      { code: "CSDDD-Art11", title: "Annual public reporting", category: "Reporting", evidenceTypes: ["manual_note"], sortOrder: 7 },
    ],
  },
  {
    slug: "uflpa",
    name: "Uyghur Forced Labor Prevention Act",
    shortName: "UFLPA",
    jurisdiction: "United States",
    effectiveDate: "2022-06-21",
    nextDeadline: null,
    description:
      "Establishes a rebuttable presumption that goods mined, produced, or manufactured wholly or in part in the Xinjiang Uyghur Autonomous Region of China are made with forced labor and prohibits their importation.",
    websiteUrl: "https://www.cbp.gov/trade/forced-labor/UFLPA",
    requirements: [
      { code: "UFLPA-S1", title: "Supply chain mapping for Xinjiang exposure", category: "Due Diligence", evidenceTypes: ["manual_note"], sortOrder: 1 },
      { code: "UFLPA-S2", title: "Forced labor risk assessment", category: "Due Diligence", evidenceTypes: ["risk_score_drop", "manual_note"], sortOrder: 2 },
      { code: "UFLPA-S3", title: "Import prohibition compliance", category: "Compliance", evidenceTypes: ["manual_note", "anomaly_resolved"], sortOrder: 3 },
      { code: "UFLPA-S4", title: "Due diligence documentation", category: "Reporting", evidenceTypes: ["manual_note", "case_resolved"], sortOrder: 4 },
      { code: "UFLPA-S5", title: "Customs declaration accuracy", category: "Compliance", evidenceTypes: ["manual_note"], sortOrder: 5 },
    ],
  },
  {
    slug: "uk-msa",
    name: "UK Modern Slavery Act",
    shortName: "UK MSA",
    jurisdiction: "United Kingdom",
    effectiveDate: "2015-10-29",
    nextDeadline: "2026-03-31",
    description:
      "Requires commercial organisations with annual turnover above £36 million to prepare an annual slavery and human trafficking statement detailing steps taken to ensure supply chains are free from modern slavery.",
    websiteUrl: "https://www.legislation.gov.uk/ukpga/2015/30/contents",
    requirements: [
      { code: "UKMSA-S1", title: "Annual modern slavery statement", category: "Reporting", evidenceTypes: ["manual_note"], sortOrder: 1 },
      { code: "UKMSA-S2", title: "Supply chain due diligence processes", category: "Due Diligence", evidenceTypes: ["risk_score_drop", "case_resolved"], sortOrder: 2 },
      { code: "UKMSA-S3", title: "Risk assessment of supply chain", category: "Due Diligence", evidenceTypes: ["risk_score_drop", "manual_note"], sortOrder: 3 },
      { code: "UKMSA-S4", title: "Remedial action tracking", category: "Remediation", evidenceTypes: ["case_resolved", "anomaly_resolved"], sortOrder: 4 },
      { code: "UKMSA-S5", title: "Training & capacity building", category: "Training", evidenceTypes: ["training_completed"], sortOrder: 5 },
      { code: "UKMSA-S6", title: "Key performance indicators", category: "Monitoring", evidenceTypes: ["engagement_improvement", "satisfaction_improvement"], sortOrder: 6 },
    ],
  },
  {
    slug: "de-lksg",
    name: "German Supply Chain Due Diligence Act (Lieferkettensorgfaltspflichtengesetz)",
    shortName: "LkSG",
    jurisdiction: "Germany",
    effectiveDate: "2023-01-01",
    nextDeadline: "2026-06-30",
    description:
      "Requires large German companies to exercise due diligence in their supply chains to prevent human rights and environmental violations, including risk analysis, prevention, and remediation measures.",
    websiteUrl: "https://www.bmas.de/EN/Europe-and-the-World/International/Supply-Chain-Act/supply-chain-act.html",
    requirements: [
      { code: "LkSG-S5", title: "Risk analysis", category: "Due Diligence", evidenceTypes: ["risk_score_drop", "manual_note"], sortOrder: 1 },
      { code: "LkSG-S6", title: "Prevention measures", category: "Due Diligence", evidenceTypes: ["training_completed", "manual_note"], sortOrder: 2 },
      { code: "LkSG-S7", title: "Remedial action", category: "Remediation", evidenceTypes: ["case_resolved", "anomaly_resolved"], sortOrder: 3 },
      { code: "LkSG-S8", title: "Complaint mechanism", category: "Monitoring", evidenceTypes: ["case_volume_decrease", "survey_improvement"], sortOrder: 4 },
      { code: "LkSG-S10a", title: "Documentation & record keeping", category: "Reporting", evidenceTypes: ["manual_note"], sortOrder: 5 },
      { code: "LkSG-S10b", title: "Annual reporting to BAFA", category: "Reporting", evidenceTypes: ["manual_note"], sortOrder: 6 },
    ],
  },
];

async function main() {
  console.log("Seeding regulatory frameworks...");

  // Clear existing data
  await db.delete(supplierFrameworkCompliance);
  await db.delete(frameworkRequirements);
  await db.delete(regulatoryFrameworks);

  // Insert frameworks and requirements
  for (const fw of FRAMEWORKS) {
    const [inserted] = await db
      .insert(regulatoryFrameworks)
      .values({
        slug: fw.slug,
        name: fw.name,
        shortName: fw.shortName,
        jurisdiction: fw.jurisdiction,
        effectiveDate: fw.effectiveDate,
        nextDeadline: fw.nextDeadline,
        description: fw.description,
        websiteUrl: fw.websiteUrl,
      })
      .returning({ id: regulatoryFrameworks.id });

    console.log(`  Framework: ${fw.shortName} (id=${inserted.id})`);

    for (const req of fw.requirements) {
      await db.insert(frameworkRequirements).values({
        frameworkId: inserted.id,
        code: req.code,
        title: req.title,
        category: req.category,
        evidenceTypes: req.evidenceTypes,
        sortOrder: req.sortOrder,
      });
    }
    console.log(`    ${fw.requirements.length} requirements inserted`);
  }

  // Get all suppliers and frameworks for sample compliance data
  const suppliers = await db
    .select({ supplierId: supplierRiskScores.supplierId })
    .from(supplierRiskScores);
  const frameworks = await db
    .select({ id: regulatoryFrameworks.id, shortName: regulatoryFrameworks.shortName })
    .from(regulatoryFrameworks);

  if (suppliers.length === 0) {
    console.log("  No suppliers found — skipping compliance seeding.");
    console.log("Done.");
    process.exit(0);
  }

  console.log(`\nSeeding compliance for ${suppliers.length} suppliers across ${frameworks.length} frameworks...`);

  // Seed random compliance: each supplier gets 2-3 frameworks assessed
  let complianceCount = 0;
  for (const supplier of suppliers) {
    // Randomly pick 2-3 frameworks to assess
    const shuffled = [...frameworks].sort(() => Math.random() - 0.5);
    const assessCount = 2 + Math.floor(Math.random() * 2); // 2 or 3
    const toAssess = shuffled.slice(0, Math.min(assessCount, frameworks.length));

    for (const fw of toAssess) {
      // Weighted random: more likely to be compliant/partial than non-compliant
      const rand = Math.random();
      const status = rand < 0.4 ? "compliant" : rand < 0.7 ? "partial" : rand < 0.9 ? "non_compliant" : "not_assessed";

      // Get requirement count for this framework
      const reqCount = FRAMEWORKS.find((f) => f.shortName === fw.shortName)?.requirements.length ?? 5;
      const completed =
        status === "compliant"
          ? reqCount
          : status === "partial"
            ? Math.floor(reqCount * (0.3 + Math.random() * 0.5))
            : status === "non_compliant"
              ? Math.floor(reqCount * Math.random() * 0.3)
              : 0;

      await db.insert(supplierFrameworkCompliance).values({
        supplierId: supplier.supplierId,
        frameworkId: fw.id,
        status,
        completedRequirements: completed,
        totalRequirements: reqCount,
        lastAssessedAt: status !== "not_assessed" ? new Date() : null,
        assessedBy: status !== "not_assessed" ? "system" : null,
      });
      complianceCount++;
    }
  }

  console.log(`  ${complianceCount} compliance records inserted`);
  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
