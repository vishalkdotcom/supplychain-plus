import type { InfoGraphicData } from "../types";

export const inf13: InfoGraphicData = {
  id: "inf-13",
  title: "Remediation Plan Lifecycle",
  domain: "Remediation",
  shortDescription:
    "The 6-stage lifecycle from detected problem to documented proof \u2014 the \u201Cact\u201D in detect\u2192act\u2192evidence",
  sections: [
    {
      type: "hero",
      title: "From Problem to Proof",
      subtitle:
        "Every detected issue becomes a tracked remediation plan with 6 stages, AI-assisted investigation, and an immutable audit trail.",
      icon: "clipboard-check",
    },
    {
      type: "problem",
      text: "Regulators don\u2019t ask \u201Cdid you find problems?\u201D \u2014 they ask \u201Cwhat did you do about them, and can you prove it?\u201D Without a structured lifecycle, corrective actions are scattered across emails, spreadsheets, and verbal agreements.",
    },
    {
      type: "flow",
      direction: "horizontal",
      steps: [
        {
          label: "Detected",
          icon: "search",
          description: "Issue identified from alert, anomaly, or cluster",
        },
        {
          label: "Root Cause",
          icon: "brain",
          description: "AI-assisted investigation: why is this happening?",
        },
        {
          label: "Action Plan",
          icon: "list-details",
          description: "Concrete corrective steps defined",
        },
        {
          label: "Implementing",
          icon: "settings",
          description: "Actions being executed by supplier/brand team",
        },
        {
          label: "Verifying",
          icon: "eye",
          description: "Checking outcomes: did the fix work?",
        },
        {
          label: "Closed",
          icon: "circle-check",
          description: "Verified complete with evidence collected",
        },
      ],
    },
    {
      type: "callout-grid",
      items: [
        {
          icon: "brain",
          title: "AI Root Cause Analysis",
          text: "System analyzes the issue context and suggests probable root causes, saving hours of investigation.",
          color: "indigo",
        },
        {
          icon: "trending-up",
          title: "Advancement Suggestions",
          text: "AI recommends when a plan is ready to move to the next stage based on evidence collected.",
          color: "blue",
        },
        {
          icon: "clock-hour-4",
          title: "Overdue Tracking",
          text: "Plans past their target date are flagged prominently. Overdue plans affect the supplier\u2019s risk score.",
          color: "amber",
        },
        {
          icon: "shield-check",
          title: "Immutable Audit Log",
          text: "Every change logged: who, when, what field, old value \u2192 new value. The evidence trail EU CSDDD requires.",
          color: "green",
        },
      ],
    },
    {
      type: "prose",
      text: "Plans can originate from multiple sources: risk alerts, systemic patterns (clusters), wage anomalies, monitoring signals, or manual creation. Each source provides initial context that feeds into the root cause analysis.",
    },
    {
      type: "example",
      title: "Real Example: Wage Anomaly Remediation",
      steps: [
        "DETECTED \u2014 Wage anomaly alert: net pay 20% below minimum for 45 workers in Bangladesh factory",
        "ROOT CAUSE \u2014 AI analysis: \u201CPayroll calculation error in overtime rates, affecting night shift workers\u201D",
        "ACTION PLAN \u2014 Steps: audit payroll records, correct calculations, retrain payroll staff, back-pay affected workers",
        "IMPLEMENTING \u2014 Payroll audit completed, corrections applied, training scheduled for next week",
        "VERIFYING \u2014 Next month\u2019s payslips reviewed: all workers now at or above minimum wage",
        "CLOSED \u2014 Evidence attached: corrected payslips, training certificates, risk score dropped 15 points",
      ],
    },
  ],
};
