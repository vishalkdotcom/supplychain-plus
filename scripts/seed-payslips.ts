/**
 * Seed script: Populate Payslip + stgPayslipReportData with realistic wage data.
 *
 * Usage: bun run scripts/seed-payslips.ts
 *
 * This inserts directly into SQL Server (Payslip table + stgPayslipReportData)
 * so the payslip-anomaly job has data to analyze.
 *
 * Prerequisites:
 * - SQL Server docker container is running
 * - Company table is already seeded (200 companies)
 */

import { getPool } from "../lib/db/sql-server";

// Minimum wages by country (monthly USD) — mirrors the anomaly job
const WAGE_DATA: Record<string, { minWage: number; currency: string; avgWage: number }> = {
  Bangladesh: { minWage: 75, currency: "BDT", avgWage: 120 },
  Vietnam: { minWage: 180, currency: "VND", avgWage: 280 },
  Cambodia: { minWage: 200, currency: "KHR", avgWage: 250 },
  Myanmar: { minWage: 80, currency: "MMK", avgWage: 130 },
  Indonesia: { minWage: 150, currency: "IDR", avgWage: 220 },
  Thailand: { minWage: 280, currency: "THB", avgWage: 400 },
  Philippines: { minWage: 220, currency: "PHP", avgWage: 320 },
  India: { minWage: 120, currency: "INR", avgWage: 190 },
  China: { minWage: 300, currency: "CNY", avgWage: 500 },
  Pakistan: { minWage: 100, currency: "PKR", avgWage: 160 },
  Nepal: { minWage: 90, currency: "NPR", avgWage: 140 },
  "Sri Lanka": { minWage: 110, currency: "LKR", avgWage: 170 },
  Ethiopia: { minWage: 60, currency: "ETB", avgWage: 95 },
  Kenya: { minWage: 130, currency: "KES", avgWage: 200 },
  Mexico: { minWage: 260, currency: "MXN", avgWage: 380 },
  Turkey: { minWage: 350, currency: "TRY", avgWage: 500 },
};

async function seedPayslips() {
  console.log("🚀 Seeding payslip data for all companies...\n");

  const pool = await getPool();

  // Get all companies with their countries
  const companies = await pool.request().query(`
    SELECT Id, Name, MailingCountry FROM Company WHERE Deleted = 0 ORDER BY Id
  `);

  console.log(`   Found ${companies.recordset.length} companies\n`);

  // Clear existing payslip data
  await pool.request().query(`DELETE FROM stgPayslipReportData WHERE HeaderText IN ('Net Wage','Gross Wage','Currency','Worker Count')`);
  await pool.request().query(`DELETE FROM Payslip`);
  console.log("   Cleared existing payslip data\n");

  let payslipCount = 0;
  let reportDataCount = 0;

  for (const company of companies.recordset) {
    const country = company.MailingCountry || "Vietnam";
    const wageInfo = WAGE_DATA[country] || { minWage: 150, currency: "USD", avgWage: 230 };

    // Generate 3 months of payslip data per company
    for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
      const date = new Date();
      date.setMonth(date.getMonth() - monthOffset);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0); // last day of month

      // Determine wage scenario
      let netWage: number;
      let grossWage: number;
      const rand = Math.random();

      if (rand < 0.08) {
        // ~8% below minimum wage (anomaly)
        netWage = Math.round(wageInfo.minWage * (0.5 + Math.random() * 0.35));
        grossWage = Math.round(netWage * (1.15 + Math.random() * 0.1));
      } else if (rand < 0.12 && monthOffset === 0) {
        // ~4% sudden drop from previous month (only for latest month)
        netWage = Math.round(wageInfo.avgWage * (0.5 + Math.random() * 0.2));
        grossWage = Math.round(netWage * (1.15 + Math.random() * 0.1));
      } else if (rand < 0.17) {
        // ~5% gross/net inconsistency (net > 95% of gross)
        grossWage = Math.round(wageInfo.avgWage * (0.9 + Math.random() * 0.3));
        netWage = Math.round(grossWage * (0.96 + Math.random() * 0.03));
      } else {
        // Normal wages
        netWage = Math.round(wageInfo.avgWage * (0.85 + Math.random() * 0.4));
        grossWage = Math.round(netWage * (1.15 + Math.random() * 0.15));
      }

      const workerCount = Math.floor(100 + Math.random() * 900);

      // Insert Payslip record (let IDENTITY auto-assign Id)
      const req = pool.request();
      req.input("month", month);
      req.input("year", year);
      req.input("companyId", company.Id);
      req.input("startDate", startDate);
      req.input("endDate", endDate);
      req.input("title", `Payslip ${year}-${String(month).padStart(2, "0")}`);

      const insertResult = await req.query(`
        INSERT INTO Payslip ([Month], [Year], CompanyId, StartDate, EndDate, Title,
                             Status, Deleted, CreatedBy, Created, isFeatured, ToReceiveEmail)
        OUTPUT INSERTED.Id
        VALUES (@month, @year, @companyId, @startDate, @endDate, @title,
                1, 0, 1, GETDATE(), 0, 0)
      `);
      const payslipId = insertResult.recordset[0].Id;
      payslipCount++;

      // Insert stgPayslipReportData rows (key-value format for wage line items)
      const reportRows = [
        { header: "Net Wage", value: String(netWage) },
        { header: "Gross Wage", value: String(grossWage) },
        { header: "Currency", value: wageInfo.currency },
        { header: "Worker Count", value: String(workerCount) },
      ];

      for (const row of reportRows) {
        const rReq = pool.request();
        rReq.input("payslipId", payslipId);
        rReq.input("companyId", company.Id);
        rReq.input("header", row.header);
        rReq.input("value", row.value);
        await rReq.query(`
          INSERT INTO stgPayslipReportData (PayslipId, CompanyId, HeaderText, Value)
          VALUES (@payslipId, @companyId, @header, @value)
        `);
        reportDataCount++;
      }
    }
  }

  console.log(`✅ Seeded ${payslipCount} payslip records`);
  console.log(`✅ Seeded ${reportDataCount} report data rows`);
  console.log(`   Covering ${companies.recordset.length} companies × 3 months\n`);

  process.exit(0);
}

seedPayslips().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
