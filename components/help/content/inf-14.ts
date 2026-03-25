import type { InfoGraphicData } from "../types";

export const inf14: InfoGraphicData = {
  id: "inf-14",
  title: "Auto-Evidence Sweep \u2014 Proof That Collects Itself",
  domain: "Remediation",
  shortDescription:
    "Automatic evidence collection from 3 databases that attaches proof to remediation plans without manual effort.",
  sections: [
    {
      type: "hero",
      title: "Auto-Evidence Sweep",
      subtitle:
        "Every remediation plan needs proof. The system finds it, attaches it, and logs it \u2014 automatically.",
      icon: "clipboard-check",
    },
    {
      type: "problem",
      text: "Compliance teams spend hours manually gathering evidence for remediation plans: downloading resolved case records, checking training completions in Moodle, pulling risk score histories. Evidence gets missed, attached to the wrong plan, or duplicated. Auditors then question gaps in the trail.",
    },
    {
      type: "flow",
      steps: [
        {
          label: "3 Databases",
          icon: "search",
          description:
            "SQL Server (resolved cases), MySQL/Moodle (training completions), and PostgreSQL (risk score improvements) are scanned for matching evidence.",
        },
        {
          label: "Evidence Sweep",
          icon: "refresh",
          description:
            "Active remediation plans are cross-referenced against all three databases to find relevant proof automatically.",
        },
        {
          label: "Auto-Attach",
          icon: "clipboard-check",
          description:
            "Matching evidence is attached to the correct remediation plan with a deterministic reference ID to prevent duplicates.",
        },
        {
          label: "Timeline",
          icon: "file-analytics",
          description:
            "Every attachment is logged in an immutable audit trail with timestamps, source database, and evidence type.",
        },
      ],
      direction: "horizontal",
    },
    {
      type: "callout-grid",
      items: [
        {
          icon: "circle-check",
          title: "Case Resolution",
          text: "Resolved worker cases that match the remediation plan\u2019s issue type and supplier are attached as evidence of corrective action.",
          color: "green",
        },
        {
          icon: "school",
          title: "Training Completion",
          text: "Moodle course completions for the supplier\u2019s workers prove that required training was delivered and passed.",
          color: "blue",
        },
        {
          icon: "trending-down",
          title: "Risk Improvement",
          text: "Documented drops in composite risk score demonstrate measurable progress since the plan was opened.",
          color: "indigo",
        },
        {
          icon: "chart-bar",
          title: "Survey Sentiment",
          text: "Positive shifts in worker survey sentiment scores corroborate that conditions improved from the worker\u2019s perspective.",
          color: "amber",
        },
        {
          icon: "shield-check",
          title: "Audit Verification",
          text: "External audit findings that confirm issue resolution are linked when available, closing the evidence loop.",
          color: "red",
        },
      ],
    },
    {
      type: "prose",
      text: "Deduplication is handled through deterministic reference IDs. Each piece of evidence is assigned an ID derived from its source database, record key, and remediation plan ID. If the sweep encounters the same evidence again in a subsequent run, the existing reference ID matches and the duplicate is skipped. This ensures the evidence timeline remains clean regardless of how many times the sweep runs.",
    },
    {
      type: "example",
      title: "Factory X \u2014 Auto-Evidence in Action",
      steps: [
        "Factory X has an active remediation plan for excessive overtime violations.",
        "The nightly sweep queries SQL Server and finds 4 overtime cases resolved in the past 30 days.",
        "It queries Moodle and finds 38 workers completed the \u201CWorking Hours Policy\u201D course.",
        "It queries PostgreSQL and detects a risk score drop from 68 to 51 over the same period.",
        "All three evidence types are auto-attached to the plan with unique reference IDs and logged in the immutable audit trail.",
        "When the auditor reviews the plan, the evidence timeline is complete \u2014 no manual work required.",
      ],
    },
  ],
};
