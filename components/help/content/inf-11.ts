import type { InfoGraphicData } from "../types";

export const inf11: InfoGraphicData = {
  id: "inf-11",
  title: "60-Day Risk Forecasting \u2014 See Problems Coming",
  domain: "Detection",
  shortDescription:
    "Predicting supplier risk 30 and 60 days ahead using regression on daily risk snapshots.",
  sections: [
    {
      type: "hero",
      title: "60-Day Risk Forecasting",
      subtitle:
        "Stop reacting to risk scores that already happened. Start seeing where they\u2019re headed.",
      icon: "trending-up",
    },
    {
      type: "problem",
      text: "A supplier\u2019s risk score today tells you where they are, not where they\u2019re going. By the time a score crosses a threshold, the underlying problems have been compounding for weeks. Compliance teams need a forward-looking view to intervene before crises materialize.",
    },
    {
      type: "before-after",
      before: {
        title: "Reactive Compliance",
        items: [
          "Risk score crosses 70 \u2192 team scrambles to investigate",
          "Root cause analysis begins weeks after problems started",
          "Remediation plans created under time pressure",
          "Auditors arrive to find issues already entrenched",
        ],
      },
      after: {
        title: "Predictive Compliance",
        items: [
          "Forecast shows score reaching 70 in 30 days \u2192 early warning",
          "Team investigates while risk is still manageable",
          "Remediation plans created proactively with supplier cooperation",
          "Auditors arrive to find issues already being addressed",
        ],
      },
    },
    {
      type: "step-list",
      title: "Three Forecast Outputs Per Supplier",
      steps: [
        {
          number: 1,
          label: "Predicted Score",
          detail:
            "OLS linear regression on 90 days of daily risk snapshots projects the composite risk score at day 30 and day 60. The model captures the underlying trajectory, not just today\u2019s number.",
        },
        {
          number: 2,
          label: "Confidence (R\u00B2)",
          detail:
            "The coefficient of determination indicates how well the linear trend explains recent risk movement. Higher R\u00B2 means the trend is consistent and the forecast is more reliable.",
        },
        {
          number: 3,
          label: "Trend Direction",
          detail:
            "A simple rising, stable, or falling classification derived from the regression slope. AI-generated reasoning explains why the trend exists, citing contributing factors from cases, surveys, and training data.",
        },
      ],
    },
    {
      type: "stat-highlight",
      stats: [
        { value: "440", label: "Forecasts generated" },
        { value: "220", label: "Suppliers covered" },
        { value: "0.37", label: "Average R\u00B2 confidence" },
      ],
    },
    {
      type: "example",
      title: "Dhaka Apparel Ltd \u2014 Rising Risk Detected Early",
      steps: [
        "Dhaka Apparel\u2019s current risk score was 52 \u2014 well within acceptable range.",
        "The 60-day forecast projected the score reaching 71, with R\u00B2 of 0.64.",
        "AI reasoning cited three factors: declining survey participation, two unresolved wage cases, and zero training completions in 45 days.",
        "The compliance team scheduled a proactive call with the supplier\u2019s management.",
        "Corrective actions began 40 days before the score would have breached the threshold.",
      ],
    },
  ],
};
