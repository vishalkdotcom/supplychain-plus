import type { InfoGraphicData } from "../types";

export const inf17: InfoGraphicData = {
  id: "inf-17",
  title: "The Intelligence Briefing \u2014 What Changed Overnight",
  domain: "Dashboard",
  shortDescription:
    "A proactive daily intelligence digest with severity-ranked items so you know exactly what needs attention the moment you open SupplyChain+.",
  sections: [
    {
      type: "hero",
      title: "The Intelligence Briefing",
      subtitle:
        "A pre-computed morning digest ranks every overnight change by severity \u2014 critical, watch, or positive \u2014 so you act on what matters first.",
      icon: "file-analytics",
    },
    {
      type: "problem",
      text: "Compliance teams start each day opening six different screens, scanning for anomalies, and hoping nothing slipped through. By the time they piece together what changed overnight, half the morning is gone \u2014 and urgent items may still be missed.",
    },
    {
      type: "callout-grid",
      items: [
        {
          icon: "alert-triangle",
          title: "Critical",
          text: "Items requiring immediate action: new high-severity cases, risk scores crossing thresholds, overdue remediations, or anomalous payslip patterns.",
          color: "red",
        },
        {
          icon: "eye",
          title: "Watch",
          text: "Emerging signals that aren\u2019t urgent yet but need monitoring: rising sentiment trends, approaching deadlines, or suppliers nearing risk thresholds.",
          color: "amber",
        },
        {
          icon: "trending-up",
          title: "Positive",
          text: "Good news worth noting: completed remediations, improving survey scores, declining case volumes, or successful training milestones.",
          color: "green",
        },
      ],
    },
    {
      type: "step-list",
      title: "How the Briefing Is Built",
      steps: [
        {
          number: 1,
          label: "ML Pipeline Completes",
          detail:
            "All 8 ML jobs finish their scheduled runs, producing fresh risk scores, clusters, forecasts, and anomaly flags.",
        },
        {
          number: 2,
          label: "Briefing Job Aggregates",
          detail:
            "The dedicated briefing generator scans every ML output table, compares against previous values, and identifies meaningful changes.",
        },
        {
          number: 3,
          label: "Severity Classification",
          detail:
            "Each change is classified as critical, watch, or positive based on configurable thresholds and business rules.",
        },
        {
          number: 4,
          label: "Pre-built AI Queries Attached",
          detail:
            "Every attention item gets an \u201CAsk AI\u201D button with a context-aware query so you can drill deeper in one click.",
        },
        {
          number: 5,
          label: "Briefing Displayed at Login",
          detail:
            "The finished briefing appears as a bar at the top of the dashboard the moment you open SupplyChain+.",
        },
      ],
    },
    {
      type: "prose",
      text: "Below the briefing, a pipeline freshness indicator shows when each of the 8 ML jobs last ran. Green means the job completed within its expected window. Yellow signals a delay beyond the normal schedule. Red indicates a stale result that may need a manual re-run. This lets operations teams verify at a glance that the intelligence feeding the briefing is current.",
    },
    {
      type: "example",
      title: "Morning Login Scenario",
      steps: [
        "Analyst opens SupplyChain+ at 8:30 AM and sees 2 critical, 3 watch, and 1 positive item.",
        "Critical item: a supplier\u2019s risk score jumped from 58 to 81 overnight after new survey results.",
        "Analyst clicks \u201CAsk AI\u201D next to the item \u2014 the AI explains the three survey questions driving the spike.",
        "Watch item: payslip anomaly detector flagged a new pattern at a factory in Vietnam.",
        "Positive item: a remediation plan in Bangladesh moved to \u201CVerified\u201D status.",
        "Pipeline freshness bar confirms all 8 jobs ran successfully before 6 AM.",
      ],
    },
  ],
};
