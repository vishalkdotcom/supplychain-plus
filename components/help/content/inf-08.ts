import type { InfoGraphicData } from "../types";

export const inf08: InfoGraphicData = {
  id: "inf-08",
  title: "Worker Voice Trends \u2014 Listening at Scale",
  domain: "Engage Intelligence",
  shortDescription:
    "Tracking what workers are talking about over time with delta analysis, emerging/declining topic detection, and negativity bias correction",
  sections: [
    {
      type: "hero",
      title: "Worker Voice Trends",
      subtitle:
        "Monthly voice extraction turns thousands of responses into a living pulse of worker sentiment",
      icon: "activity",
    },
    {
      type: "problem",
      text: "Survey responses capture a snapshot, but compliance teams need to see trends. Which topics are rising? Which are fading? And because workers are far more likely to voice complaints than praise, raw topic counts create a skewed picture that overstates negativity and hides genuine improvements.",
    },
    {
      type: "step-list",
      title: "How Voice Trend Analysis Works",
      steps: [
        {
          number: 1,
          label: "Extract",
          detail:
            "AI scans each month\u2019s survey responses and extracts the dominant topics workers are discussing",
        },
        {
          number: 2,
          label: "Compare",
          detail:
            "Delta tracking compares this month\u2019s topic list against previous months to identify emerging and declining topics",
        },
        {
          number: 3,
          label: "Correct",
          detail:
            "Negativity bias correction injects 5 implicit positive topics (e.g. stable employment, regular pay) that workers rarely mention but genuinely value",
        },
        {
          number: 4,
          label: "Score",
          detail:
            "A composite sentiment score combines explicit topic sentiment with bias-corrected baselines to produce a fair overall reading",
        },
      ],
    },
    {
      type: "callout-grid",
      items: [
        {
          icon: "trending-up",
          title: "Emerging Topics",
          text: "Topics that appear or spike compared to the previous period \u2014 early warning signals that demand attention before they escalate",
          color: "red",
        },
        {
          icon: "trending-down",
          title: "Declining Topics",
          text: "Topics that fade over time, indicating either resolved issues or shifting worker priorities",
          color: "green",
        },
        {
          icon: "scale",
          title: "Bias Correction",
          text: "Adds implicit positives (stable employment, safe conditions, regular pay, skill development, social bonds) to counteract the natural negativity skew in open-ended feedback",
          color: "blue",
        },
      ],
    },
    {
      type: "stat-highlight",
      stats: [
        { value: "708", label: "Voice patterns tracked" },
        { value: "5", label: "Implicit positive topics" },
        { value: "Monthly", label: "Extraction cadence" },
      ],
    },
    {
      type: "example",
      title: "Real Example: Overtime Complaints Spike in Q4",
      steps: [
        "October voice extraction surfaces \u201Cforced overtime\u201D as a new emerging topic across 3 suppliers",
        "Delta tracking shows the topic was absent in August and September, confirming it is genuinely new",
        "Bias correction ensures the overall sentiment score doesn\u2019t collapse \u2014 workers still value stable pay and safe conditions",
        "The composite score drops from 64 to 58, triggering a review rather than a false alarm",
        "After overtime policy changes in December, the January extraction shows \u201Cforced overtime\u201D declining by 40%",
      ],
    },
  ],
};
