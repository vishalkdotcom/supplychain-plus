import type { InfoGraphicData } from "../types";

export const inf12: InfoGraphicData = {
  id: "inf-12",
  title: "The AI Assistant \u2014 Ask Anything About Your Supply Chain",
  domain: "AI",
  shortDescription:
    "A multi-tool AI assistant that queries across all modules and returns visual, synthesized answers.",
  sections: [
    {
      type: "hero",
      title: "The AI Assistant",
      subtitle:
        "One question, every module. Ask in plain language \u2014 get charts, tables, and insights, not just text.",
      icon: "brain",
    },
    {
      type: "problem",
      text: "Supply chain compliance data lives in separate modules \u2014 cases in one place, surveys in another, risk scores in a third. Answering cross-cutting questions like \u201CWhich Bangladesh suppliers have rising risk AND declining survey participation?\u201D means opening multiple screens, exporting data, and manually correlating. The AI assistant does this in seconds.",
    },
    {
      type: "flow",
      steps: [
        {
          label: "Question",
          icon: "message",
          description:
            "User asks a plain-language question spanning any combination of modules.",
        },
        {
          label: "Tool Selection",
          icon: "settings",
          description:
            "The LLM analyzes the question and selects which tools and databases to query.",
        },
        {
          label: "Database Queries",
          icon: "search",
          description:
            "Selected tools execute queries across SQL Server, MySQL, and PostgreSQL simultaneously.",
        },
        {
          label: "Synthesized Answer",
          icon: "chart-bar",
          description:
            "Results are combined into a visual response with charts, tables, and narrative explanation.",
        },
      ],
      direction: "horizontal",
    },
    {
      type: "callout-grid",
      items: [
        {
          icon: "search",
          title: "14 Read Tools",
          text: "Query suppliers, cases, risk scores, surveys, forecasts, clusters, anomalies, remediation plans, training records, monitoring signals, and more.",
          color: "blue",
        },
        {
          icon: "clipboard-check",
          title: "2 Write Tools",
          text: "Create remediation plans and draft communications directly from the chat interface without switching screens.",
          color: "green",
        },
        {
          icon: "chart-bar",
          title: "Visual Responses",
          text: "Answers include interactive charts, sortable tables, and highlighted metrics \u2014 not just paragraphs of text.",
          color: "indigo",
        },
        {
          icon: "clock-hour-4",
          title: "Session Management",
          text: "Conversations are saved and resumable. Return to a previous thread without losing context or re-asking questions.",
          color: "amber",
        },
      ],
    },
    {
      type: "stat-highlight",
      stats: [
        { value: "16", label: "Tools available" },
        { value: "3", label: "Databases queried" },
        { value: "\u221E", label: "Questions you can ask" },
      ],
    },
    {
      type: "example",
      title: "Cross-Module Query \u2014 Bangladesh Suppliers",
      steps: [
        "User asks: \u201CShow me Bangladesh suppliers with rising risk and open cases.\u201D",
        "The LLM selects three tools: supplier lookup, risk forecast query, and case search.",
        "Queries run in parallel across PostgreSQL (risk data) and SQL Server (case data).",
        "The assistant returns a table of 7 matching suppliers with risk trends, open case counts, and recommended actions.",
        "User follows up: \u201CCreate a remediation plan for the top 3.\u201D The assistant uses its write tool to draft plans instantly.",
      ],
    },
  ],
};
