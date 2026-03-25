import type { InfoGraphicData } from "../types";

export const inf06: InfoGraphicData = {
  id: "inf-06",
  title: "Wage Anomaly Detection",
  domain: "Connect Intelligence",
  shortDescription:
    "Detecting wage violations across 16 countries by scanning payslips against local minimum-wage rules, drop patterns, and suspicious deduction ratios",
  sections: [
    {
      type: "hero",
      title: "Wage Anomaly Detection",
      subtitle:
        "Three detection rules \u00d7 16 countries \u00d7 local currency \u2014 wage theft has nowhere to hide",
      icon: "alert-triangle",
    },
    {
      type: "problem",
      text: "Wage violations are the most common labour abuse, yet they\u2019re buried inside thousands of payslips denominated in different currencies. Manual audits catch only a fraction, and many violations \u2014 like a gradual pay reduction or an inflated deduction \u2014 are invisible without pattern analysis.",
    },
    {
      type: "callout-grid",
      items: [
        {
          icon: "trending-down",
          title: "Below Minimum Wage",
          text: "Compares each payslip\u2019s net pay against the legal minimum wage in the local currency for that country",
          color: "red",
        },
        {
          icon: "alert-triangle",
          title: "Sudden Drop > 30%",
          text: "Flags any month-over-month wage drop exceeding 30% \u2014 a strong indicator of unauthorised deductions or hours manipulation",
          color: "red",
        },
        {
          icon: "scale",
          title: "Suspicious Gross-to-Net Ratio",
          text: "Detects abnormal deduction percentages by comparing the gross-to-net ratio against country-specific thresholds",
          color: "red",
        },
      ],
    },
    {
      type: "stat-highlight",
      stats: [
        { value: "1,174", label: "Payslips scanned" },
        { value: "16", label: "Countries covered" },
        { value: "71", label: "Anomalies detected" },
        { value: "3", label: "Detection rule types" },
      ],
    },
    {
      type: "prose",
      text: "Currency Match Guard \u2014 Every payslip is validated against the expected currency for its country before any rule fires. A Vietnamese payslip reported in USD instead of VND would produce a wildly misleading minimum-wage comparison. The guard rejects mismatched records and flags them for data-quality review, ensuring that every anomaly alert is grounded in the correct local context.",
    },
    {
      type: "example",
      title: "Real Example: Deduction Spike in Bangladesh",
      steps: [
        "A garment factory uploads 240 monthly payslips denominated in BDT",
        "The currency guard confirms all records match the expected BDT for Bangladesh",
        "Rule 1 flags 12 payslips where net pay falls below the BDT 12,500 minimum wage",
        "Rule 2 flags 5 workers whose pay dropped more than 30% from the previous month",
        "Rule 3 flags 8 payslips where deductions consume over 40% of gross pay",
        "AI interpretation rates the cluster as high severity and recommends an immediate payroll audit",
      ],
    },
  ],
};
