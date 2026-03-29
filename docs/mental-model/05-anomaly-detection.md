# Anomaly Detection — When Rules Beat Models

## The Problem

Workers submit payslip data showing their wages. You need to detect: Is anyone being paid illegally? Has anyone's pay suddenly dropped? Are the numbers internally consistent?

## The Key Decision: Rules, Not ML

The payslip anomaly detector uses three hardcoded rules — no statistical models, no machine learning. Here's why this is the right choice for this specific problem.

### When ML-Based Anomaly Detection Makes Sense

Techniques like isolation forests, autoencoders, and z-score analysis are powerful when:
- You don't know in advance what "anomalous" looks like
- Anomalies are subtle patterns in high-dimensional data
- You have plenty of "normal" data to learn the baseline

Example: detecting unusual network traffic patterns. You don't know what attacks look like in advance, so you learn "normal" and flag deviations.

### When Rules Make More Sense

Rules are better when:
- The definition of "anomalous" is known and fixed
- The threshold is legally or operationally defined
- False negatives are dangerous (missing a real violation)
- Explainability is mandatory

Payslip checking is this second case. The law defines what "anomalous" means.

## The Three Detection Rules

### Rule 1: Below Minimum Wage

```
Trigger: NetPay < countryMinimum * 0.9
```

Minimum wage is a legal floor. If a worker's net pay is below it, that's potentially illegal regardless of context. The system checks against hardcoded minimums for 16 countries:

| Country | Monthly Minimum | Currency |
|---------|----------------|----------|
| Bangladesh | 12,500 | BDT |
| Vietnam | 4,680,000 | VND |
| Cambodia | 800,000 | KHR |
| Myanmar | 144,000 | MMK |
| Indonesia | 2,700,000 | IDR |
| Thailand | 9,900 | THB |
| Philippines | 12,000 | PHP |
| India | 10,000 | INR |
| China | 2,200 | CNY |
| Pakistan | 32,000 | PKR |
| Nepal | 15,000 | NPR |
| Sri Lanka | 35,000 | LKR |
| Ethiopia | 3,600 | ETB |
| Kenya | 15,000 | KES |
| Mexico | 5,186 | MXN |
| Turkey | 11,402 | TRY |

**Why hardcoded?** Minimum wages change rarely (annually at most). There are only 16 relevant countries. And the accuracy bar is absolute — a stale database entry could cause a **false negative** on a legal violation. Hardcoding is more reliable than a database that might not be updated.

**The 10% tolerance (0.9 multiplier):** Payslip data is messy:
- Different pay periods (weekly vs. monthly) need normalization
- Partial months for new hires show lower pay legitimately
- Currency rounding creates small discrepancies
- Some countries have different minimums for different regions/industries

Without tolerance, accounting edge cases would flood the system with false positives, and real violations would be lost in the noise.

**Currency matching:** The check only triggers when the payslip's currency matches the country's minimum wage currency. A factory in Vietnam paying in USD would skip the VND minimum wage check (different math needed).

### Rule 2: Sudden Drop

```
Trigger: (previousNetPay - latestNetPay) / previousNetPay > 0.20
```

A worker's pay drops more than 20% from one period to the next. This could indicate:
- Illegal deductions (management pocketing money)
- Demotion without proper process
- Payroll errors
- Arbitrary punishment

**Why 20%?** Small fluctuations happen legitimately (fewer overtime hours, different shift bonuses). 20% is large enough that it almost always indicates something worth investigating, yet not so large that it only catches extreme cases.

### Rule 3: Gross/Net Inconsistency

```
Trigger: NetPay / GrossPay > 0.95
```

If net pay is 95%+ of gross pay, almost no deductions are being taken. Standard deductions (tax, social security, health insurance) typically total 15-30% of gross pay. If only 5% is being deducted, either:
- The payroll system is misconfigured
- Mandatory contributions aren't being made (illegal)
- The data is wrong

**Expected ratio:** GrossPay * 0.8 = expected net (roughly 20% deductions). Anything above 0.95 is flagged.

## After Detection: LLM Interpretation

Raw anomalies are numbers: "Factory X, NetPay 3,200,000 VND, minimum 4,680,000 VND." The LLM adds context:

```json
{
  "interpretation": "Workers at Factory X are being paid 31% below Vietnam's minimum wage, affecting 47 employees. This represents a systematic wage violation.",
  "severity": "critical",
  "recommendedAction": "Request complete payroll records for the last 6 months and initiate a wage compliance audit."
}
```

This makes anomalies actionable for compliance officers who need human-readable descriptions, not just numbers.

## The Atomic Swap Pattern

Each run completely rebuilds the anomaly list:

```
BEGIN TRANSACTION
  DELETE FROM payslipAnomalies WHERE supplierId IN (affected suppliers)
  INSERT INTO payslipAnomalies VALUES (new anomalies)
COMMIT
```

Why full rebuild? Because anomalies reflect the current state of payslip data. If a factory fixed its wages, the old anomaly should disappear. If new payslip data arrives, new anomalies should appear. A full rebuild ensures the table always reflects the latest data, without complex "diff" logic.

If the transaction fails mid-way, the old data remains (rollback). You never see a half-updated state.

## Auto-Evidence Linking

When all anomalies for a supplier are resolved (none remain in the rebuilt set) and that supplier has an active remediation plan sourced from a payslip anomaly, evidence of type `anomaly_resolved` is attached:

"All previously detected payslip anomalies for Supplier X have been resolved as of 2026-03-20."

This closes the Detect→Act→Evidence loop for wage violations.
