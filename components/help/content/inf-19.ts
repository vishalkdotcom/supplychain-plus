import type { InfoGraphicData } from "../types";

export const inf19: InfoGraphicData = {
  id: "inf-19",
  title: "The ML Pipeline \u2014 8 Jobs That Power Everything",
  domain: "Operations",
  shortDescription:
    "The 8-job ML pipeline computes all intelligence in WOVO \u2014 from risk scores to forecasts \u2014 with strict ordering, GPU serialization, and flexible scheduling.",
  sections: [
    {
      type: "hero",
      title: "The ML Pipeline \u2014 8 Jobs",
      subtitle:
        "Eight machine-learning jobs run in a defined sequence to produce every score, cluster, forecast, and alert in the platform.",
      icon: "settings",
    },
    {
      type: "problem",
      text: "Intelligence features are only as good as the data feeding them. If risk scores are stale, forecasts are computed before surveys are analyzed, or GPU jobs collide in memory, the entire platform delivers misleading results \u2014 and users lose trust.",
    },
    {
      type: "step-list",
      title: "The 8 Jobs in Order",
      steps: [
        {
          number: 1,
          label: "Risk Scoring",
          detail:
            "Computes a composite risk score for every supplier by weighting case severity, survey sentiment, remediation status, and external signals.",
        },
        {
          number: 2,
          label: "Survey Analysis",
          detail:
            "Processes raw worker survey responses through sentiment analysis and theme extraction to produce structured insights.",
        },
        {
          number: 3,
          label: "Case Clustering",
          detail:
            "Groups open cases by semantic similarity using embeddings. Serialized for GPU to avoid VRAM model-swap thrashing.",
        },
        {
          number: 4,
          label: "Payslip Anomaly Detection",
          detail:
            "Scans payslip data for statistical outliers \u2014 unusual deductions, overtime spikes, or minimum-wage violations.",
        },
        {
          number: 5,
          label: "Risk Forecast",
          detail:
            "Projects supplier risk scores 30/60/90 days forward using historical trends and leading indicators from earlier jobs.",
        },
        {
          number: 6,
          label: "Worker Voice Analytics",
          detail:
            "Analyzes free-text worker feedback for emerging themes, sentiment shifts, and early-warning signals.",
        },
        {
          number: 7,
          label: "Intelligence Briefing",
          detail:
            "Aggregates all ML outputs, detects meaningful changes since the last run, and classifies items by severity.",
        },
        {
          number: 8,
          label: "Evidence Sweep",
          detail:
            "Scans remediation plans for auto-collectible evidence \u2014 linking ML outputs to open action items as proof of progress.",
        },
      ],
    },
    {
      type: "callout-grid",
      items: [
        {
          icon: "clock-hour-4",
          title: "GPU Serialization",
          text: "Case clustering and other embedding-heavy jobs run one at a time to prevent VRAM model-swap thrashing on shared GPU infrastructure.",
          color: "red",
        },
        {
          icon: "refresh",
          title: "Flexible Scheduling",
          text: "Each job supports cron schedules, manual triggers, or a \u201CRun All\u201D button that executes the full pipeline in dependency order.",
          color: "blue",
        },
        {
          icon: "arrow-right",
          title: "Dependency Chain",
          text: "Order matters: forecasts depend on fresh risk scores, briefings depend on all prior outputs, and evidence sweeps reference the latest remediations.",
          color: "amber",
        },
      ],
    },
    {
      type: "prose",
      text: "Job ordering is not arbitrary. Risk Scoring must run first because nearly every downstream job references the latest composite scores. Survey Analysis and Case Clustering feed the Risk Forecast with fresh sentiment and pattern data. The Briefing job runs second-to-last because it compares current outputs against previous values \u2014 it needs all other jobs to have finished. Finally, the Evidence Sweep closes the loop by linking new ML outputs back to open remediation plans.",
    },
    {
      type: "example",
      title: "Daily Pipeline Run",
      steps: [
        "Cron triggers the pipeline at 4:00 AM when system load is lowest.",
        "Risk Scoring completes in 3 minutes, updating 220 supplier scores.",
        "Survey Analysis processes 1,400 new responses collected yesterday.",
        "Case Clustering runs on GPU (serialized) \u2014 groups 38 open cases into 6 clusters.",
        "Payslip Anomaly flags 4 new outliers across two factories.",
        "Risk Forecast projects scores forward; one supplier is predicted to cross the high-risk threshold in 22 days.",
        "Briefing job detects 2 critical and 5 watch-level changes overnight.",
        "Evidence Sweep links the new forecast warning to an open remediation plan as supporting evidence.",
      ],
    },
  ],
};
