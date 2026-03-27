import { Output } from "ai";
import { getJobModel, generateTextWithFallback } from "@/lib/ai/provider";
import { query as mssqlQuery } from "@/lib/db/sql-server";
import { db } from "@/lib/db/drizzle";
import { payslipAnomalies, alerts } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { logger } from "@/lib/logger";
import type { JobResult } from "./types";

// Minimum monthly wages in LOCAL currency (USD approximate in comments)
const MINIMUM_WAGES: Record<string, { monthly: number; currency: string }> = {
  Bangladesh: { monthly: 12500, currency: "BDT" }, // ~$113 USD
  Vietnam: { monthly: 4680000, currency: "VND" }, // ~$186 USD
  Cambodia: { monthly: 800000, currency: "KHR" }, // ~$196 USD
  Myanmar: { monthly: 144000, currency: "MMK" }, // ~$68 USD
  Indonesia: { monthly: 2700000, currency: "IDR" }, // ~$170 USD
  Thailand: { monthly: 9900, currency: "THB" }, // ~$280 USD
  Philippines: { monthly: 12000, currency: "PHP" }, // ~$214 USD
  India: { monthly: 10000, currency: "INR" }, // ~$120 USD
  China: { monthly: 2200, currency: "CNY" }, // ~$305 USD
  Pakistan: { monthly: 32000, currency: "PKR" }, // ~$115 USD
  Nepal: { monthly: 15000, currency: "NPR" }, // ~$112 USD
  "Sri Lanka": { monthly: 35000, currency: "LKR" }, // ~$108 USD
  Ethiopia: { monthly: 3600, currency: "ETB" }, // ~$62 USD
  Kenya: { monthly: 15000, currency: "KES" }, // ~$115 USD
  Mexico: { monthly: 5186, currency: "MXN" }, // ~$262 USD
  Turkey: { monthly: 11402, currency: "TRY" }, // ~$350 USD
};

const interpretationSchema = z.object({
  interpretation: z
    .string()
    .describe("Brief interpretation of this payslip anomaly"),
  severity: z.enum(["critical", "warning", "info"]),
  recommendedAction: z.string(),
});

export async function payslipAnomaly(params?: { limit?: number }): Promise<JobResult> {
  const model = getJobModel();

  const result = await mssqlQuery(`
    SELECT
      p.Id,
      p.CompanyId,
      co.Name as CompanyName,
      co.MailingCountry as Country,
      CAST(ISNULL(net.Value, '0') AS FLOAT) as NetPay,
      CAST(ISNULL(gross.Value, '0') AS FLOAT) as GrossPay,
      p.StartDate as PayPeriodStart,
      p.EndDate as PayPeriodEnd,
      ISNULL(cur.Value, 'USD') as Currency,
      CAST(ISNULL(wc.Value, '0') AS INT) as WorkerCount
    FROM Payslip p
    JOIN Company co ON p.CompanyId = co.Id
    LEFT JOIN stgPayslipReportData net ON net.PayslipId = p.Id AND net.HeaderText = 'Net Wage'
    LEFT JOIN stgPayslipReportData gross ON gross.PayslipId = p.Id AND gross.HeaderText = 'Gross Wage'
    LEFT JOIN stgPayslipReportData cur ON cur.PayslipId = p.Id AND cur.HeaderText = 'Currency'
    LEFT JOIN stgPayslipReportData wc ON wc.PayslipId = p.Id AND wc.HeaderText = 'Worker Count'
    WHERE p.Deleted = 0
      AND co.Deleted = 0
      AND co.ParentCompanyId IS NOT NULL
      AND net.Value IS NOT NULL
    ORDER BY p.EndDate DESC
  `);

  const payslips = result.recordset as Array<{
    Id: number;
    CompanyId: number;
    CompanyName: string;
    Country: string;
    NetPay: number;
    GrossPay: number;
    PayPeriodStart: string;
    PayPeriodEnd: string;
    Currency: string;
    WorkerCount: number;
  }>;

  if (payslips.length === 0) {
    return { success: true, message: "No payslip data to analyze" };
  }

  const anomalies: Array<{
    supplierId: string;
    supplierName: string;
    anomalyType: string;
    details: {
      expected: number;
      actual: number;
      currency: string;
      country: string;
      employeeCount: number;
    };
  }> = [];

  // Group payslips by company for trend analysis
  const byCompany = new Map<number, typeof payslips>();
  for (const p of payslips) {
    if (!byCompany.has(p.CompanyId)) {
      byCompany.set(p.CompanyId, []);
    }
    byCompany.get(p.CompanyId)!.push(p);
  }

  // Detect anomalies
  for (const [companyId, companyPayslips] of byCompany) {
    const latest = companyPayslips[0];
    const country = latest.Country;
    const minWage = country ? MINIMUM_WAGES[country] : null;

    // Check 1: Below minimum wage (only when currencies match)
    if (minWage && latest.Currency === minWage.currency && latest.NetPay < minWage.monthly * 0.9) {
      anomalies.push({
        supplierId: String(companyId),
        supplierName: latest.CompanyName,
        anomalyType: "below_minimum",
        details: {
          expected: minWage.monthly,
          actual: latest.NetPay,
          currency: latest.Currency || minWage.currency,
          country: country || "Unknown",
          employeeCount: latest.WorkerCount || 0,
        },
      });
    }

    // Check 2: Sudden drop (>20% decrease between periods)
    if (companyPayslips.length >= 2) {
      const prev = companyPayslips[1];
      if (prev.NetPay > 0) {
        const dropPct =
          ((prev.NetPay - latest.NetPay) / prev.NetPay) * 100;
        if (dropPct > 20) {
          anomalies.push({
            supplierId: String(companyId),
            supplierName: latest.CompanyName,
            anomalyType: "sudden_drop",
            details: {
              expected: prev.NetPay,
              actual: latest.NetPay,
              currency: latest.Currency || minWage?.currency || "Unknown",
              country: country || "Unknown",
              employeeCount: latest.WorkerCount || 0,
            },
          });
        }
      }
    }

    // Check 3: Gross/Net inconsistency
    if (
      latest.GrossPay > 0 &&
      latest.NetPay > 0 &&
      latest.NetPay / latest.GrossPay > 0.95
    ) {
      anomalies.push({
        supplierId: String(companyId),
        supplierName: latest.CompanyName,
        anomalyType: "inconsistency",
        details: {
          expected: latest.GrossPay * 0.8,
          actual: latest.NetPay,
          currency: latest.Currency || minWage?.currency || "Unknown",
          country: country || "Unknown",
          employeeCount: latest.WorkerCount || 0,
        },
      });
    }
  }

  // Use AI to interpret flagged anomalies (limit controls how many get LLM interpretation).
  // Collect results in memory first, then atomic-swap the table so a mid-run failure
  // never leaves consumers with an empty table.
  const toProcess = params?.limit ? anomalies.slice(0, params.limit) : anomalies;

  const anomalyRows: Array<{
    supplierId: string;
    supplierName: string;
    anomalyType: string;
    severity: string;
    details: typeof anomalies[number]["details"];
    aiInterpretation: string | null;
  }> = [];
  const alertRows: Array<{
    supplierId: string;
    supplierName: string;
    alertType: string;
    severity: string;
    title: string;
    message: string;
  }> = [];

  for (const anomaly of toProcess) {
    const typeLabel =
      anomaly.anomalyType === "below_minimum"
        ? "Net pay is below the country minimum wage"
        : anomaly.anomalyType === "sudden_drop"
          ? "Net pay dropped more than 20% from previous period"
          : "Net pay is suspiciously close to gross pay (no deductions)";

    try {
      const aiResult = await generateTextWithFallback({
        model,
        maxRetries: 3,
        system:
          "You are a labor compliance expert analyzing payslip data for potential wage theft or anomalies. You MUST respond with valid JSON only — no markdown, no explanation, no extra text.",
        prompt: `Interpret this payslip anomaly for ${anomaly.supplierName} in ${anomaly.details.country}:
Type: ${typeLabel}
Expected: ${anomaly.details.expected} ${anomaly.details.currency}
Actual: ${anomaly.details.actual} ${anomaly.details.currency}
Workers affected: ${anomaly.details.employeeCount}`,
        output: Output.object({ schema: interpretationSchema }),
      });

      const interpretation = aiResult.output;
      const severity = interpretation?.severity || "warning";

      anomalyRows.push({
        supplierId: anomaly.supplierId,
        supplierName: anomaly.supplierName,
        anomalyType: anomaly.anomalyType,
        severity,
        details: anomaly.details,
        aiInterpretation: interpretation?.interpretation || typeLabel,
      });

      if (severity === "critical") {
        alertRows.push({
          supplierId: anomaly.supplierId,
          supplierName: anomaly.supplierName,
          alertType: "payslip_anomaly",
          severity: "critical",
          title: `Payslip Anomaly: ${anomaly.supplierName}`,
          message:
            interpretation?.interpretation ||
            `${typeLabel} — ${anomaly.details.actual} vs expected ${anomaly.details.expected} ${anomaly.details.currency}`,
        });
      }
    } catch (e) {
      logger.error("jobs/payslip-anomaly", `Payslip interpretation failed for ${anomaly.supplierName}`, e);
      anomalyRows.push({
        supplierId: anomaly.supplierId,
        supplierName: anomaly.supplierName,
        anomalyType: anomaly.anomalyType,
        severity: "warning",
        details: anomaly.details,
        aiInterpretation: null,
      });
    }
  }

  // Atomic swap: delete old rows and insert new ones in a single transaction.
  // If anything fails, the transaction rolls back and previous data remains intact.
  let savedCount = 0;
  await db.transaction(async (tx) => {
    await tx.delete(payslipAnomalies);
    for (const row of anomalyRows) {
      await tx.insert(payslipAnomalies).values(row);
      savedCount++;
    }
    for (const alert of alertRows) {
      await tx.insert(alerts).values(alert);
    }
  });

  // Auto-link evidence: resolved anomalies for suppliers with active remediations
  try {
    const { findAllActiveRemediations, attachAutoEvidence, buildReferenceId } = await import("@/lib/remediation/auto-evidence");
    const activeRemediations = await findAllActiveRemediations();
    const today = new Date().toISOString().slice(0, 10);

    for (const remediation of activeRemediations) {
      if (remediation.sourceType !== "anomaly") continue;

      // Check if any anomalies for this supplier are resolved
      const unresolvedAnomalies = await db
        .select({ id: payslipAnomalies.id })
        .from(payslipAnomalies)
        .where(
          and(
            eq(payslipAnomalies.supplierId, remediation.supplierId),
            eq(payslipAnomalies.isResolved, false),
          ),
        );

      if (unresolvedAnomalies.length === 0) {
        const refId = buildReferenceId("anomaly_resolved", today, remediation.supplierId);
        await attachAutoEvidence(
          remediation.id,
          "anomaly_resolved",
          `All payslip anomalies resolved for supplier ${remediation.supplierId}`,
          `No unresolved payslip anomalies remain for this supplier.`,
          refId,
        );
      }
    }
  } catch (e) {
    logger.warn("jobs/payslip-anomaly", "Auto-evidence linking failed (non-fatal)", e);
  }

  return {
    success: true,
    payslipsAnalyzed: payslips.length,
    companiesChecked: byCompany.size,
    anomaliesDetected: anomalies.length,
    anomaliesSaved: savedCount,
  };
}
