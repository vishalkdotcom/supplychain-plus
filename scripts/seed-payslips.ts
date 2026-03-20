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

// Minimum monthly wages in LOCAL currency — mirrors the anomaly job
const WAGE_DATA: Record<string, { minWage: number; currency: string; avgWage: number }> = {
  Bangladesh: { minWage: 12500, currency: "BDT", avgWage: 18000 },
  Vietnam: { minWage: 4680000, currency: "VND", avgWage: 7000000 },
  Cambodia: { minWage: 800000, currency: "KHR", avgWage: 1000000 },
  Myanmar: { minWage: 144000, currency: "MMK", avgWage: 230000 },
  Indonesia: { minWage: 2700000, currency: "IDR", avgWage: 4000000 },
  Thailand: { minWage: 9900, currency: "THB", avgWage: 14000 },
  Philippines: { minWage: 12000, currency: "PHP", avgWage: 17000 },
  India: { minWage: 10000, currency: "INR", avgWage: 16000 },
  China: { minWage: 2200, currency: "CNY", avgWage: 3500 },
  Pakistan: { minWage: 32000, currency: "PKR", avgWage: 50000 },
  Nepal: { minWage: 15000, currency: "NPR", avgWage: 22000 },
  "Sri Lanka": { minWage: 35000, currency: "LKR", avgWage: 55000 },
  Ethiopia: { minWage: 3600, currency: "ETB", avgWage: 5500 },
  Kenya: { minWage: 15000, currency: "KES", avgWage: 23000 },
  Mexico: { minWage: 5186, currency: "MXN", avgWage: 8000 },
  Turkey: { minWage: 11402, currency: "TRY", avgWage: 17000 },
};

async function seedPayslips() {
  console.log("🚀 Seeding payslip data for all companies...\n");

  const pool = await getPool();

  // Get all companies with their countries
  const companies = await pool.request().query(`
    SELECT Id, Name, MailingCountry FROM Company WHERE Deleted = 0 AND ParentCompanyId IS NOT NULL ORDER BY Id
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
