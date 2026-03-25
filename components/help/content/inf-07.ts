import type { InfoGraphicData } from "../types";

export const inf07: InfoGraphicData = {
  id: "inf-07",
  title: "AI Survey Designer & Sentiment Analysis",
  domain: "Engage",
  shortDescription:
    "AI-powered survey creation from a single prompt, multilingual deployment, and automated sentiment and theme extraction at scale",
  sections: [
    {
      type: "hero",
      title: "AI Survey Designer & Sentiment Analysis",
      subtitle:
        "From a one-line prompt to 22,000+ analysed responses \u2014 in five languages",
      icon: "bulb",
    },
    {
      type: "problem",
      text: "Designing effective worker surveys takes weeks of back-and-forth between compliance teams and translators. Once responses arrive, extracting actionable themes from thousands of free-text answers in multiple languages is practically impossible without automation.",
    },
    {
      type: "flow",
      direction: "horizontal",
      steps: [
        {
          label: "Prompt",
          icon: "message",
          description:
            "Type a plain-language description of what you want to learn from workers",
        },
        {
          label: "Questions",
          icon: "bulb",
          description:
            "AI generates structured survey questions with appropriate response types",
        },
        {
          label: "Deploy",
          icon: "arrow-right",
          description:
            "Publish in up to 5 languages and distribute to workers via link or app",
        },
        {
          label: "Analyse",
          icon: "brain",
          description:
            "Sentiment classification (positive, negative, neutral) and theme extraction across all responses",
        },
        {
          label: "Track",
          icon: "trending-up",
          description:
            "Monitor how themes and sentiment shift over time to measure intervention impact",
        },
      ],
    },
    {
      type: "callout-grid",
      items: [
        {
          icon: "bulb",
          title: "AI Survey Design",
          text: "Generates culturally sensitive questions from a single prompt, eliminating weeks of manual drafting and translation",
          color: "blue",
        },
        {
          icon: "brain",
          title: "Sentiment Engine",
          text: "Classifies every response as positive, negative, or neutral \u2014 43.7% positive, 41.7% negative, 14.6% neutral across the dataset",
          color: "indigo",
        },
        {
          icon: "search",
          title: "Theme Extraction",
          text: "Identifies recurring patterns and topics across thousands of free-text responses, grouping them into actionable themes",
          color: "green",
        },
        {
          icon: "chart-bar",
          title: "Trend Tracking",
          text: "Plots sentiment and theme prevalence over time so teams can see whether interventions are working",
          color: "amber",
        },
      ],
    },
    {
      type: "stat-highlight",
      stats: [
        { value: "285", label: "Surveys deployed" },
        { value: "22,675", label: "Responses analysed" },
        { value: "708", label: "Patterns extracted" },
      ],
    },
    {
      type: "example",
      title: "Real Example: Food Quality Survey Across 3 Factories",
      steps: [
        "A compliance manager types: \u201CFind out how workers feel about canteen food quality and meal timing\u201D",
        "AI generates 8 questions covering food freshness, variety, portion size, and break scheduling",
        "The survey is auto-translated into Vietnamese, Khmer, Bengali, Burmese, and English",
        "3,200 responses come back over two weeks",
        "Sentiment analysis shows 62% negative sentiment concentrated on \u201Cportion size\u201D and \u201Cmeal timing\u201D themes",
        "Three months later, a follow-up survey shows negative sentiment dropped to 35% after canteen changes",
      ],
    },
  ],
};
