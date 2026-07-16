import type { InfoGraphicData } from "../types";

export const inf03: InfoGraphicData = {
  id: "inf-03",
  title: "The Control Center",
  domain: "Dashboard",
  shortDescription:
    "How the dashboard layers 6 levels of information to answer \u201Cwhat needs my attention?\u201D",
  sections: [
    {
      type: "hero",
      title: "Your Compliance Command Post",
      subtitle:
        "One screen answers \u201Cwhat needs my attention right now?\u201D Six layers of information, from most urgent to most contextual.",
      icon: "eye",
    },
    {
      type: "problem",
      text: "220 suppliers, 2,944 cases, 285 surveys, 71 anomalies, 8 ML jobs. Data overload \u2014 where do you start? Without intelligent prioritization, critical issues get buried under noise.",
    },
    {
      type: "step-list",
      title: "6 Information Layers (Top to Bottom)",
      steps: [
        {
          number: 1,
          label: "Pipeline Freshness",
          detail:
            "Can I trust the data? Green/yellow/red indicators for each ML job\u2019s last run time.",
        },
        {
          number: 2,
          label: "AI Briefing Bar",
          detail:
            "What changed overnight? Pre-computed attention items sorted by severity: critical, watch, positive.",
        },
        {
          number: 3,
          label: "Priority Metrics",
          detail:
            "4 KPI cards: High-Risk Suppliers, Urgent Cases, Risk Trends, Training Coverage. Each with delta indicators.",
        },
        {
          number: 4,
          label: "ML Intelligence",
          detail:
            "4 insight cards: Systemic Patterns, Forecast Alerts, Wage Anomalies, Sentiment Shifts.",
        },
        {
          number: 5,
          label: "Needs Attention",
          detail:
            "Tabbed section: Alerts, Urgent Cases, Risk Movements, Forecasts + an AI Copilot Feed for recent insights.",
        },
        {
          number: 6,
          label: "Visualizations",
          detail:
            "Geographic risk map, supply chain network graph, and risk distribution chart for deep exploration.",
        },
      ],
    },
    {
      type: "callout-grid",
      items: [
        {
          icon: "eye",
          title: "Brand / Global Toggle",
          text: "Switch between portfolio-wide view and a single brand\u2019s supply chain.",
        },
        {
          icon: "activity",
          title: "Pipeline Freshness",
          text: "Know exactly when each ML job last ran. Stale data is flagged so you never make decisions on outdated intelligence.",
          color: "amber",
        },
        {
          icon: "clock-hour-4",
          title: "5s / 30s / 2min Reading Guide",
          text: "5 seconds: briefing bar. 30 seconds: metric cards. 2 minutes: full deep-dive with visualizations.",
        },
      ],
    },
    {
      type: "example",
      title: "Real Example: Morning Login Workflow",
      steps: [
        "Open SupplyChain+ \u2192 briefing bar says \u201C3 new systemic patterns detected\u201D",
        "ML Intelligence card shows cluster details: overtime violations in Bangladesh",
        "Click through to cluster view \u2192 see 47 cases across 12 factories",
        "Investigate root cause \u2192 create remediation plan directly from the cluster",
      ],
    },
  ],
};
