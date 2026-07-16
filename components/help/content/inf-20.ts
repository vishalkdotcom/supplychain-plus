import type { InfoGraphicData } from "../types";

export const inf20: InfoGraphicData = {
  id: "inf-20",
  title: "Cross-Module Context \u2014 Every Signal Connected",
  domain: "Platform",
  shortDescription:
    "Every page shows cross-module context from all data sources so no signal is ever viewed in isolation.",
  sections: [
    {
      type: "hero",
      title: "Cross-Module Context",
      subtitle:
        "No silos. Every page in SupplyChain+ surfaces signals from every other module so you always see the full picture around any supplier, case, or worker.",
      icon: "network",
    },
    {
      type: "problem",
      text: "Traditional compliance platforms store cases in one tool, surveys in another, payslip data in a third, and training records in a spreadsheet. Investigating a single issue means switching between four systems, copy-pasting IDs, and mentally stitching together a timeline that no one tool can show.",
    },
    {
      type: "before-after",
      before: {
        title: "Siloed Tools",
        items: [
          "Cases live in a case-management system",
          "Surveys locked inside a survey platform",
          "Payslip data in an HR spreadsheet",
          "Training records in a separate LMS",
          "No way to see how one signal relates to another",
        ],
      },
      after: {
        title: "Connected Context",
        items: [
          "Supplier page shows cases, surveys, training, forecasts, anomalies, remediations, monitoring signals, and voice trends",
          "Case page shows supplier risk, related training, and sentiment data",
          "AI assistant queries across ALL modules simultaneously",
          "Every data point links back to its source for drill-down",
          "Timeline view weaves all signals into a single chronological narrative",
        ],
      },
    },
    {
      type: "callout-grid",
      items: [
        {
          icon: "clipboard-check",
          title: "Supplier Page",
          text: "One page, eight data panels: open cases, survey sentiment, training completion, risk forecasts, payslip anomalies, active remediations, monitoring signals, and worker voice trends.",
          color: "blue",
        },
        {
          icon: "search",
          title: "Case Page",
          text: "Opening a case immediately shows the supplier\u2019s current risk score, recent survey sentiment, training gaps, and any related remediation plans \u2014 no tab-switching required.",
          color: "indigo",
        },
        {
          icon: "brain",
          title: "AI Assistant",
          text: "Ask a question and the AI queries cases, surveys, payslips, risk scores, forecasts, and training data in a single pass \u2014 returning a synthesized answer with citations to every module.",
          color: "green",
        },
      ],
    },
    {
      type: "prose",
      text: "Technically, cross-module context works because every entity in SupplyChain+ shares a common supplier identifier. When you open a supplier page, the platform issues parallel queries across all module tables \u2014 cases, surveys, training, remediations, forecasts, anomalies, monitoring signals, and voice analytics \u2014 and assembles the results into a unified view. The AI assistant uses the same approach: it decomposes your question into sub-queries across modules, retrieves relevant rows, and synthesizes a single response with inline citations pointing back to the originating module.",
    },
    {
      type: "example",
      title: "Investigating a Case with Full Context",
      steps: [
        "Analyst receives a critical case about overtime violations at Factory X.",
        "Opening the case page, the right panel shows Factory X\u2019s risk score spiked to 79 last week.",
        "Survey sentiment panel reveals workers reported \u201Cexcessive hours\u201D in 23% of recent responses.",
        "Training records show the factory\u2019s management completed zero hours of labor-law training this quarter.",
        "Payslip anomaly panel flags three months of overtime payments exceeding legal limits.",
        "Analyst asks the AI: \u201CSummarize all signals for Factory X.\u201D The AI returns a unified brief citing cases, surveys, payslips, and training gaps.",
        "With full context assembled in under a minute, the analyst creates a remediation plan that addresses root causes, not just symptoms.",
      ],
    },
  ],
};
