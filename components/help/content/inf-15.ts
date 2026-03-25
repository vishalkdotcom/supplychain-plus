import type { InfoGraphicData } from "../types";

export const inf15: InfoGraphicData = {
  id: "inf-15",
  title: "HRDD Report Generation \u2014 Audit-Ready in Seconds",
  domain: "Suppliers",
  shortDescription:
    "One-click Human Rights Due Diligence report generation formatted for EU CSDDD and UK Modern Slavery Act.",
  sections: [
    {
      type: "hero",
      title: "HRDD Report Generation",
      subtitle:
        "One click \u2192 complete Human Rights Due Diligence report. Formatted for regulators, ready for auditors.",
      icon: "file-analytics",
    },
    {
      type: "problem",
      text: "Preparing a Human Rights Due Diligence report for a single supplier takes days of manual work: pulling risk scores, summarizing case histories, aggregating survey data, checking training records, and writing the executive narrative. Multiply that across hundreds of suppliers and two regulatory frameworks, and the compliance team is buried.",
    },
    {
      type: "step-list",
      title: "From Click to PDF in Four Steps",
      steps: [
        {
          number: 1,
          label: "Click Export HRDD",
          detail:
            "A single button on the supplier detail page triggers the entire pipeline. No configuration, no parameter selection \u2014 the system knows what the report needs.",
        },
        {
          number: 2,
          label: "Gather Data",
          detail:
            "The system pulls the supplier\u2019s composite risk scores, full case history, survey sentiment trends, and training compliance rates from all three databases automatically.",
        },
        {
          number: 3,
          label: "AI Narrative",
          detail:
            "An LLM synthesizes the raw data into an executive narrative: summarizing risk posture, highlighting key incidents, noting remediation progress, and flagging areas of concern in professional compliance language.",
        },
        {
          number: 4,
          label: "PDF Download",
          detail:
            "jsPDF renders the complete report with branded formatting, structured sections, and regulatory alignment for both EU CSDDD and UK Modern Slavery Act requirements. The PDF downloads instantly.",
        },
      ],
    },
    {
      type: "callout-grid",
      items: [
        {
          icon: "alert-triangle",
          title: "Risk Profile",
          text: "Current composite score, historical trend, 60-day forecast, and breakdown by risk category with color-coded severity.",
          color: "red",
        },
        {
          icon: "list-details",
          title: "Case History",
          text: "Summary of all worker cases: open, resolved, and escalated. Key incidents are highlighted with resolution timelines.",
          color: "amber",
        },
        {
          icon: "mood-happy",
          title: "Survey Sentiment",
          text: "Worker voice data aggregated into sentiment scores and participation rates, showing trends over the reporting period.",
          color: "blue",
        },
        {
          icon: "school",
          title: "Training Compliance",
          text: "Course completion rates, overdue training flags, and worker coverage percentages from the Moodle LMS.",
          color: "green",
        },
        {
          icon: "brain",
          title: "AI Executive Narrative",
          text: "A synthesized summary written by AI that connects all data points into a coherent due diligence assessment for regulators.",
          color: "indigo",
        },
      ],
    },
    {
      type: "example",
      title: "Vietnam Garments Co. \u2014 Q1 HRDD Report",
      steps: [
        "The compliance manager opens the Vietnam Garments supplier page and clicks \u201CExport HRDD.\u201D",
        "The system gathers 90 days of data: risk score trending from 45 to 38, 12 cases (10 resolved), 85% survey participation, and 92% training completion.",
        "The AI writes an executive narrative noting strong remediation progress on wage disputes and recommending continued monitoring of overtime patterns.",
        "A formatted PDF downloads in 4 seconds, ready to submit for EU CSDDD compliance.",
        "The same report that previously took 2 days of manual compilation is now generated on demand.",
      ],
    },
  ],
};
