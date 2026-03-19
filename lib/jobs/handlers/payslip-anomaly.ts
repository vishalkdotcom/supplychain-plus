import { generateText, Output } from "ai";
import { getOllamaModel } from "@/lib/ai/provider";
import { query as mssqlQuery } from "@/lib/db/sql-server";
import { db } from "@/lib/db/drizzle";
import { payslipAnomalies, alerts } from "@/lib/db/schema";
import { z } from "zod";
import { logger } from "@/lib/logger";
import type { JobResult } from "./types";

// Minimum wages in USD (approximate monthly) by country
const MINIMUM_WAGES: Record<string, { monthly: number; currency: string }> = {
  Bangladesh: { monthly: 75, currency: "BDT" },
  Vietnam: { monthly: 180, currency: "VND" },
  Cambodia: { monthly: 200, currency: "KHR" },
  Myanmar: { monthly: 80, currency: "MMK" },
  Indonesia: { monthly: 150, currency: "IDR" },
  Thailand: { monthly: 280, currency: "THB" },
  Philippines: { monthly: 220, currency: "PHP" },
  India: { monthly: 120, currency: "INR" },
  China: { monthly: 300, currency: "CNY" },
  Pakistan: { monthly: 100, currency: "PKR" },
  Nepal: { monthly: 90, currency: "NPR" },
  "Sri Lanka": { monthly: 110, currency: "LKR" },
  Ethiopia: { monthly: 60, currency: "ETB" },
  Kenya: { monthly: 130, currency: "KES" },
  Mexico: { monthly: 260, currency: "MXN" },
  Turkey: { monthly: 350, currency: "TRY" },
};

const interpretationSchema = z.object({
  interpretation: z
    .string()
    .describe("Brief interpretation of this payslip anomaly"),
  severity: z.enum(["critical", "warning", "info"]),
  recommendedAction: z.string(),
});

export async function payslipAnomaly(): Promise<JobResult> {
  const model = getOllamaModel("gemma3:1b");

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

    // Check 1: Below minimum wage
    if (minWage && latest.NetPay < minWage.monthly * 0.9) {
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
              currency: latest.Currency || "USD",
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
          currency: latest.Currency || "USD",
          country: country || "Unknown",
          employeeCount: latest.WorkerCount || 0,
        },
      });
    }
  }

  // Use AI to interpret flagged anomalies
  let savedCount = 0;

  for (const anomaly of anomalies) {
    try {
      const typeLabel =
        anomaly.anomalyType === "below_minimum"
          ? "Net pay is below the country minimum wage"
          : anomaly.anomalyType === "sudden_drop"
            ? "Net pay dropped more than 20% from previous period"
            : "Net pay is suspiciously close to gross pay (no deductions)";

      const aiResult = await generateText({
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
