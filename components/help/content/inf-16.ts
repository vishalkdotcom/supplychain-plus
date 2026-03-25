import type { InfoGraphicData } from "../types";

export const inf16: InfoGraphicData = {
  id: "inf-16",
  title: "Brands & Supply Chain Hierarchy",
  domain: "Brands",
  shortDescription:
    "Portfolio-scoped views and parent\u2013child relationships let brand directors see only their factories with aggregate risk rolled up across the hierarchy.",
  sections: [
    {
      type: "hero",
      title: "Brands & Supply Chain Hierarchy",
      subtitle:
        "Portfolio-scoped views give every brand director a filtered lens on their own factories, with risk aggregated across the entire parent\u2013child tree.",
      icon: "network",
    },
    {
      type: "problem",
      text: "Global sourcing teams manage dozens of brands, each linked to a different set of factories. Without hierarchy awareness, dashboards dump every supplier into one flat list \u2014 forcing directors to mentally filter hundreds of rows to find the five factories that matter to them.",
    },
    {
      type: "before-after",
      before: {
        title: "Siloed Brand View",
        items: [
          "Flat supplier list with no brand grouping",
          "Directors manually search for their factories",
          "Risk scores shown per factory only \u2014 no portfolio roll-up",
          "No way to compare brand-level performance",
          "Network ownership invisible in table format",
        ],
      },
      after: {
        title: "Integrated Portfolio",
        items: [
          "Brand toggle filters ALL dashboard widgets instantly",
          "Directors see only their assigned factories",
          "Aggregate risk score computed per brand",
          "Side-by-side brand comparison in one click",
          "Network visualization maps brand \u2192 factory tree",
        ],
      },
    },
    {
      type: "callout-grid",
      items: [
        {
          icon: "target-arrow",
          title: "Portfolio Filter",
          text: "A single toggle at the top of the dashboard scopes every widget \u2014 metrics, alerts, heatmaps, and tables \u2014 to one brand\u2019s factories.",
          color: "blue",
        },
        {
          icon: "chart-bar",
          title: "Aggregate Risk",
          text: "Risk scores roll up from factory level to brand level, giving directors a single number that summarizes their portfolio\u2019s health.",
          color: "amber",
        },
        {
          icon: "network",
          title: "Network Visualization",
          text: "An interactive graph renders the brand \u2192 factory ownership tree so structural concentration risks become visible at a glance.",
          color: "indigo",
        },
      ],
    },
    {
      type: "stat-highlight",
      stats: [
        { value: "126", label: "Brand \u2192 Factory Mappings" },
        { value: "220", label: "Suppliers Across All Brands" },
        { value: "1-click", label: "Global / Brand Toggle" },
      ],
    },
    {
      type: "example",
      title: "GlobalWear\u2019s 8-Factory Portfolio",
      steps: [
        "Brand director selects \u201CGlobalWear\u201D from the brand toggle.",
        "Dashboard filters to show only 8 factories linked to GlobalWear.",
        "Aggregate risk score of 72 appears \u2014 elevated due to two high-risk sites.",
        "Network graph highlights the two problematic factories in red.",
        "Director clicks a factory node to drill into its supplier detail page.",
        "Remediation plans are created scoped to GlobalWear\u2019s portfolio.",
      ],
    },
  ],
};
