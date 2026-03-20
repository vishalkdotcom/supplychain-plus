import { Output } from "ai";
import { getJobModel, generateTextWithFallback } from "@/lib/ai/provider";
import { query as mssqlQuery } from "@/lib/db/sql-server";
import { db } from "@/lib/db/drizzle";
import { payslipAnomalies, alerts } from "@/lib/db/schema";
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

  // Clear previous anomalies — job regenerates everything from source data
  await db.delete(payslipAnomalies);

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

  // Use AI to interpret flagged anomalies (limit controls how many get LLM interpretation)
  const toProcess = params?.limit ? anomalies.slice(0, params.limit) : anomalies;
  let savedCount = 0;

  for (const anomaly of toProcess) {
    try {
      const typeLabel =
        anomaly.anomalyType === "below_minimum"
          ? "Net pay is below the country minimum wage"
          : anomaly.anomalyType === "sudden_drop"
            ? "Net pay dropped more than 20% from previous period"
            : "Net pay is suspiciously close to gross pay (no deductions)";

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

      await db.insert(payslipAnomalies).values({
        supplierId: anomaly.supplierId,
        supplierName: anomaly.supplierName,
        anomalyType: anomaly.anomalyType,
        severity,
        details: anomaly.details,
        aiInterpretation:
          interpretation?.interpretation || typeLabel,
      });

      if (severity === "critical") {
        await db.insert(alerts).values({
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

      savedCount++;
    } catch (e) {
      logger.error("jobs/payslip-anomaly", `Payslip interpretation failed for ${anomaly.supplierName}`, e);
      await db.insert(payslipAnomalies).values({
        supplierId: anomaly.supplierId,
        supplierName: anomaly.supplierName,
        anomalyType: anomaly.anomalyType,
        severity: "warning",
        details: anomaly.details,
        aiInterpretation: null,
      });
      savedCount++;
    }
  }

  return {
    success: true,
    payslipsAnalyzed: payslips.length,
    companiesChecked: byCompany.size,
    anomaliesDetected: anomalies.length,
    anomaliesSaved: savedCount,
  };
}
