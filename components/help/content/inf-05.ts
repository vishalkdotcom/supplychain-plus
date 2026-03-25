import type { InfoGraphicData } from "../types";

export const inf05: InfoGraphicData = {
  id: "inf-05",
  title: "Systemic Pattern Detection",
  domain: "Connect Intelligence",
  shortDescription:
    "How case clustering reveals systemic issues hidden across hundreds of individual cases",
  sections: [
    {
      type: "hero",
      title: "See the Forest, Not Just the Trees",
      subtitle:
        "What if 47 separate cases in 12 different factories are actually the same problem? Clustering reveals systemic patterns that manual review can never find.",
      icon: "network",
    },
    {
      type: "problem",
      text: "2,944 cases reviewed individually, each looks like a one-off problem. A compliance officer reading cases one-by-one would never see that 47 \u201Covertime\u201D cases across 12 factories are actually one regional systemic issue.",
    },
    {
      type: "before-after",
      before: {
        title: "Without Clustering",
        items: [
          "Each case reviewed in isolation",
          "Patterns invisible across factories",
          "Same root cause investigated 47 times",
          "Regional issues missed entirely",
          "Reactive, case-by-case approach",
        ],
      },
      after: {
        title: "With Clustering",
        items: [
          "Similar cases automatically grouped",
          "Systemic patterns surface immediately",
          "One investigation covers all 47 cases",
          "Regional trends clearly visible",
          "Proactive, pattern-based intervention",
        ],
      },
    },
    {
      type: "step-list",
      title: "How It Works (4-Step Pipeline)",
      steps: [
        {
          number: 1,
          label: "Embed",
          detail:
            "Every case message is converted into a 1024-number \u201Cfingerprint\u201D that captures its meaning, regardless of language.",
        },
        {
          number: 2,
          label: "Cluster",
          detail:
            "Messages with similar fingerprints are grouped using cosine similarity. Semantically similar complaints land together.",
        },
        {
          number: 3,
          label: "Label",
          detail:
            "AI labels each group with a human-readable name and severity: e.g., \u201CSystematic Overtime Violations \u2014 Bangladesh Garment Sector\u201D (critical).",
        },
        {
          number: 4,
          label: "Surface",
          detail:
            "Clusters shown on the Connect \u2192 Clusters page with severity, affected factories, and representative cases.",
        },
      ],
    },
    {
      type: "stat-highlight",
      stats: [
        { value: "47", label: "Cases Connected" },
        { value: "12", label: "Factories Affected" },
        { value: "1", label: "Systemic Pattern" },
        { value: "1024", label: "Embedding Dimensions" },
      ],
    },
    {
      type: "example",
      title: "Real Example: Bangladesh Overtime Pattern",
      steps: [
        "47 individual messages mentioning overtime, pay delays, and forced hours across 12 Bangladesh factories",
        "Embedding model converts messages to numerical fingerprints (language-agnostic)",
        "Clustering groups them into one pattern despite different wording and languages",
        "AI labels it: \u201CSystematic Overtime Violations \u2014 Bangladesh Garment Sector\u201D with critical severity",
        "Compliance team investigates regionally instead of 47 separate case-by-case reviews",
      ],
    },
  ],
};
