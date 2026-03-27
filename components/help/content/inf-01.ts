import type { InfoGraphicData } from "../types";

export const inf01: InfoGraphicData = {
  id: "inf-01",
  title: "The Detect \u2192 Act \u2192 Evidence Loop",
  domain: "Core Philosophy",
  shortDescription:
    "How WOVO+ closes the compliance loop from detection through action to documented proof",
  sections: [
    {
      type: "hero",
      title: "The Detect \u2192 Act \u2192 Evidence Loop",
      subtitle:
        "The WOVO+ core differentiator: not just finding problems, but tracking the full lifecycle from detection through corrective action to documented evidence.",
      icon: "refresh",
    },
    {
      type: "problem",
      text: "Most compliance platforms stop at detection \u2014 they show you a dashboard of problems. When regulators ask \u201Cwhat did you do about it?\u201D teams scramble to compile evidence from spreadsheets, emails, and memory.",
    },
    {
      type: "flow",
      direction: "circular",
      steps: [
        {
          label: "DETECT",
          icon: "search",
          description:
            "Risk scoring, case clustering, anomaly detection, monitoring signals, voice trends, forecasting \u2014 8 ML jobs feeding intelligence",
        },
        {
          label: "ACT",
          icon: "clipboard-check",
          description:
            "Remediation plans with a 6-stage lifecycle: detected \u2192 root cause \u2192 action plan \u2192 implementing \u2192 verifying \u2192 closed",
        },
        {
          label: "EVIDENCE",
          icon: "file-analytics",
          description:
            "Auto-evidence sweep cross-references resolved cases, training completions, and risk score improvements against active plans",
        },
      ],
    },
    {
      type: "callout-grid",
      items: [
        {
          icon: "brain",
          title: "Self-Reinforcing",
          text: "Evidence from \u201Cact\u201D feeds back into \u201Cdetect\u201D \u2014 a resolved remediation lowers the risk score, which changes the forecast, which updates the briefing.",
          color: "indigo",
        },
        {
          icon: "gavel",
          title: "Regulation-Ready",
          text: "EU CSDDD, OECD Guidelines, and UK Modern Slavery Act all demand this loop. WOVO+ makes it automatic.",
          color: "blue",
        },
        {
          icon: "settings",
          title: "8 ML Jobs",
          text: "Risk calculation, clustering, anomaly detection, survey analysis, voice analytics, forecasting, monitoring signals, and briefing generation.",
        },
        {
          icon: "shield-check",
          title: "Immutable Audit Trail",
          text: "Every change is logged: who, when, what field, old value, new value. The audit log is the proof regulators need.",
          color: "green",
        },
      ],
    },
    {
      type: "example",
      title: "Real Example: Payslip Anomaly End-to-End",
      steps: [
        "DETECT \u2014 Payslip anomaly detected: net pay 20% below Bangladesh minimum wage (\u09F312,500/month)",
        "ACT \u2014 Remediation plan created automatically. Payroll audit conducted, staff retrained on wage calculations.",
        "EVIDENCE \u2014 Auto-sweep finds 3 resolved cases + training completed + risk score dropped 15 points.",
        "CLOSED \u2014 Plan verified and closed with all evidence attached. Ready for audit.",
      ],
    },
  ],
};
