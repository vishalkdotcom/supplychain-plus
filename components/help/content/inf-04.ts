import type { InfoGraphicData } from "../types";

export const inf04: InfoGraphicData = {
  id: "inf-04",
  title: "Case Management & AI Assistance",
  domain: "Connect",
  shortDescription:
    "AI-powered case management that summarises grievances, recommends next steps, and drafts responses in the worker\u2019s language",
  sections: [
    {
      type: "hero",
      title: "Case Management & AI Assistance",
      subtitle:
        "From raw grievance to resolved case \u2014 with AI co-pilot at every step",
      icon: "clipboard-check",
    },
    {
      type: "problem",
      text: "Compliance teams drown in thousands of worker messages across multiple languages. Reading every case end-to-end, deciding what to investigate, and crafting culturally appropriate replies takes hours per case \u2014 time most teams simply don\u2019t have.",
    },
    {
      type: "flow",
      direction: "horizontal",
      steps: [
        {
          label: "Inbox",
          icon: "message",
          description:
            "All grievance cases land in a unified inbox with status filters and priority flags",
        },
        {
          label: "Case Detail",
          icon: "search",
          description:
            "Full conversation thread with cross-module context strip showing supplier risk, survey sentiment, and training status",
        },
        {
          label: "AI Panel",
          icon: "brain",
          description:
            "One-click AI analysis: summary, investigation guidance, and draft response in the worker\u2019s language",
        },
        {
          label: "Action",
          icon: "arrow-right",
          description:
            "Send the response, escalate, link to a remediation plan, or close with documented evidence",
        },
      ],
    },
    {
      type: "callout-grid",
      items: [
        {
          icon: "file-analytics",
          title: "Summarise",
          text: "AI reads the full message thread and produces a 1\u20132 sentence summary so managers grasp the issue in seconds",
          color: "blue",
        },
        {
          icon: "search",
          title: "Guidance",
          text: "Recommended investigation steps tailored to the grievance category \u2014 wage theft, harassment, safety, or retaliation",
          color: "indigo",
        },
        {
          icon: "message",
          title: "Draft Response",
          text: "A culturally appropriate reply drafted in the worker\u2019s own language, ready for review and send",
          color: "green",
        },
      ],
    },
    {
      type: "stat-highlight",
      stats: [
        { value: "2,944", label: "Grievance cases managed" },
        { value: "8,277", label: "Worker messages processed" },
        { value: "5", label: "Languages supported" },
      ],
    },
    {
      type: "example",
      title: "Real Example: Overtime Dispute in Vietnam",
      steps: [
        "A worker submits a grievance in Vietnamese about unpaid overtime across three pay periods",
        "The case lands in the inbox flagged as \u201CWage & Hour\u201D with high priority",
        "The case detail page shows the supplier\u2019s current risk score (72) and a recent negative survey trend",
        "AI summarises: \u201CWorker reports 36 hours of unpaid overtime across Nov\u2013Jan pay periods\u201D",
        "AI guidance recommends: review payslip records, cross-check with anomaly detection, interview shift supervisor",
        "Manager reviews the AI-drafted Vietnamese response, adjusts tone, and sends it within minutes",
      ],
    },
  ],
};
