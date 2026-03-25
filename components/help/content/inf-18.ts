import type { InfoGraphicData } from "../types";

export const inf18: InfoGraphicData = {
  id: "inf-18",
  title: "Geographic Risk Map & Network Graph",
  domain: "Dashboard Visualizations",
  shortDescription:
    "Spatial visualization reveals geographic concentration risk and structural ownership patterns that tables alone cannot surface.",
  sections: [
    {
      type: "hero",
      title: "Geographic Risk Map & Network Graph",
      subtitle:
        "Two complementary visualizations \u2014 a world map and a network graph \u2014 turn raw supplier data into spatial and structural risk patterns.",
      icon: "network",
    },
    {
      type: "problem",
      text: "Risk data buried in spreadsheets hides geographic concentration \u2014 when 40% of your supply chain sits in one flood-prone region, a table of coordinates won\u2019t raise the alarm. Similarly, corporate ownership chains that connect seemingly independent factories are invisible without a structural view.",
    },
    {
      type: "callout-grid",
      items: [
        {
          icon: "target-arrow",
          title: "Geographic Risk Map",
          text: "A world map built with react-simple-maps and D3 plots every factory as a risk-colored pin. Clusters of red pins expose geographic concentration risk \u2014 natural disasters, political instability, or regulatory changes that would hit multiple suppliers simultaneously.",
          color: "blue",
        },
        {
          icon: "network",
          title: "Network Ownership Graph",
          text: "An interactive graph powered by @xyflow/react renders brand \u2192 factory ownership edges. It reveals hidden corporate-structural patterns: a single parent company controlling factories across brands, or a bottleneck supplier that multiple brands depend on.",
          color: "indigo",
        },
      ],
    },
    {
      type: "before-after",
      before: {
        title: "Tables & Spreadsheets",
        items: [
          "Latitude and longitude columns that no one reads",
          "Country field used only for basic filtering",
          "Ownership data scattered across separate records",
          "Concentration risk discovered only after an incident",
          "Structural dependencies invisible to compliance teams",
        ],
      },
      after: {
        title: "Visual Risk Patterns",
        items: [
          "Red pin clusters instantly show geographic hot zones",
          "Zoom and pan to explore regional concentration",
          "Ownership graph reveals shared-parent risk in seconds",
          "Structural bottlenecks highlighted before they become incidents",
          "Click any node to navigate directly to the supplier detail page",
        ],
      },
    },
    {
      type: "example",
      title: "Bangladesh Cluster + GlobalTextiles Parent",
      steps: [
        "Geographic map shows a dense cluster of 12 red-orange pins in the Dhaka region.",
        "Analyst hovers over the cluster \u2014 tooltip reveals 5 of 12 factories are high-risk.",
        "Switching to the network graph, the analyst notices 4 of those factories share a single parent: GlobalTextiles Ltd.",
        "The graph highlights that GlobalTextiles supplies three different brands in the portfolio.",
        "If one regulatory action hits GlobalTextiles, three brands lose capacity simultaneously.",
        "Analyst flags this structural concentration risk and initiates a diversification review.",
      ],
    },
  ],
};
