import type { InfoGraphicData } from "../types";

export const inf02: InfoGraphicData = {
  id: "inf-02",
  title: "Supplier Risk Scoring",
  domain: "Suppliers",
  shortDescription:
    "How one composite score (0\u2013100) blends four data dimensions to prioritize 220+ suppliers",
  sections: [
    {
      type: "hero",
      title: "One Number That Tells the Whole Story",
      subtitle:
        "A composite score (0\u2013100) that blends four independent dimensions. Higher means more risk. Explainable, not a black box.",
      icon: "chart-bar",
    },
    {
      type: "problem",
      text: "A brand has 200+ factories across 16 countries. How do you decide which factory needs attention TODAY? Manual spreadsheets can\u2019t keep up with the volume of cases, surveys, training records, and engagement data.",
    },
    {
      type: "callout-grid",
      items: [
        {
          icon: "message",
          title: "Cases (25%)",
          text: "Are workers reporting problems? Severity and volume of grievance cases from SQL Server (2,944 cases, 8,277 messages).",
          color: "red",
        },
        {
          icon: "mood-sad",
          title: "Surveys (25%)",
          text: "What\u2019s the sentiment? Analysis of 285 surveys with 22,675 responses from PostgreSQL.",
          color: "amber",
        },
        {
          icon: "school",
          title: "Training (25%)",
          text: "Are workers being trained? 3,172 completions tracked via Moodle/MySQL integration.",
          color: "blue",
        },
        {
          icon: "activity",
          title: "Engagement (25%)",
          text: "Is the factory active on the platform? Cross-database activity tracking measures participation.",
          color: "indigo",
        },
      ],
    },
    {
      type: "stat-highlight",
      stats: [
        { value: "82", label: "Cases Score" },
        { value: "65", label: "Survey Score" },
        { value: "93", label: "Training Score" },
        { value: "40", label: "Engagement Score" },
        { value: "70", label: "Composite Risk" },
        { value: "\u2265 75", label: "Alert Threshold" },
      ],
    },
    {
      type: "flow",
      direction: "horizontal",
      steps: [
        {
          label: "4 Data Sources",
          icon: "list-details",
          description: "Cases, surveys, training, engagement",
        },
        {
          label: "Weighted Formula",
          icon: "scale",
          description: "Equal 25% weight per dimension",
        },
        {
          label: "Composite Score",
          icon: "chart-bar",
          description: "0\u2013100 with explainable reasons",
        },
        {
          label: "Action",
          icon: "alert-triangle",
          description: "\u226575 triggers alerts, feeds forecasts",
        },
      ],
    },
    {
      type: "prose",
      text: "Every score comes with explainable reasons \u2014 e.g., \u201CHigh case volume (23 unresolved), declining survey sentiment (-12% this month).\u201D Daily snapshots enable 30/60/90 day trend charts so you can see if interventions are working.",
    },
    {
      type: "example",
      title: "Real Example: Factory Risk Assessment",
      steps: [
        "Factory A scores: cases=82, surveys=65, training=93, engagement=40",
        "Composite risk: (82+65+93+40)/4 = 70 \u2014 just below alert threshold",
        "Trend shows risk rising from 55 to 70 over 3 months",
        "AI reason: \u201CHigh case volume (23 unresolved), declining survey sentiment (-12%)\u201D",
        "Forecast predicts crossing 75 threshold in 2 weeks \u2014 intervene now",
      ],
    },
  ],
};
