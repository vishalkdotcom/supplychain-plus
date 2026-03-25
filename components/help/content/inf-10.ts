import type { InfoGraphicData } from "../types";

export const inf10: InfoGraphicData = {
  id: "inf-10",
  title: "Monitoring Signals \u2014 Detecting What\u2019s Missing",
  domain: "Detection",
  shortDescription:
    "Detecting the absence of data as a risk signal \u2014 silence, decay, and regional contagion reveal hidden problems.",
  sections: [
    {
      type: "hero",
      title: "Monitoring Signals",
      subtitle:
        "The most dangerous suppliers aren\u2019t the ones raising alarms \u2014 they\u2019re the ones that go quiet.",
      icon: "eye",
    },
    {
      type: "problem",
      text: "Traditional compliance monitoring waits for reports and complaints. But when a supplier stops filing cases, surveys dry up, or engagement drops to zero, that silence itself is the strongest signal that something is wrong.",
    },
    {
      type: "callout-grid",
      items: [
        {
          icon: "clock-hour-4",
          title: "Supplier Silence",
          text: "Zero cases or surveys filed for 60+ days. Absence of activity where activity is expected triggers a critical signal automatically.",
          color: "red",
        },
        {
          icon: "trending-down",
          title: "Engagement Decay",
          text: "Declining survey participation or case filing rates over time. A gradual fade is harder to spot than a sudden stop, but equally dangerous.",
          color: "amber",
        },
        {
          icon: "network",
          title: "Regional Contagion",
          text: "The same issue type appearing across 3 or more factories in one region. Patterns that span suppliers suggest systemic problems, not isolated incidents.",
          color: "indigo",
        },
      ],
    },
    {
      type: "stat-highlight",
      stats: [
        { value: "91", label: "Active monitoring signals" },
        { value: "64", label: "Critical signals" },
        { value: "27", label: "Warning signals" },
      ],
    },
    {
      type: "prose",
      text: "Monitoring signals are evaluated after the nightly risk-scoring pipeline completes. Each supplier\u2019s activity is compared against expected baselines derived from their historical patterns. Signals feed directly into the risk model, ensuring that silence and decay raise a supplier\u2019s composite risk score just as effectively as an open grievance would.",
    },
    {
      type: "example",
      title: "Myanmar Textiles \u2014 Silence Detected",
      steps: [
        "Myanmar Textiles had filed 2\u20133 worker cases per month for 18 months straight.",
        "In January, case filings dropped to zero. No surveys were completed either.",
        "After 60 days of silence, the system generated a critical Supplier Silence signal.",
        "The compliance team investigated and discovered the factory had quietly replaced its worker committee.",
        "Early detection allowed intervention before the next audit cycle.",
      ],
    },
  ],
};
