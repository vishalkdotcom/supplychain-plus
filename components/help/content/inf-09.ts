import type { InfoGraphicData } from "../types";

export const inf09: InfoGraphicData = {
  id: "inf-09",
  title: "PDF-to-Course Pipeline \u2014 Training in Minutes",
  domain: "Educate",
  shortDescription:
    "Turning safety manuals and policy PDFs into multilingual training courses with auto-generated quizzes, deployed in minutes instead of weeks",
  sections: [
    {
      type: "hero",
      title: "PDF-to-Course Pipeline",
      subtitle:
        "Upload a safety manual, get a multilingual training course with quizzes \u2014 in minutes, not weeks",
      icon: "school",
    },
    {
      type: "problem",
      text: "Factories receive safety manuals, chemical handling guides, and policy updates as dense PDFs \u2014 often in English only. Converting these into training content that workers actually understand requires manual lesson design, quiz writing, and professional translation. Most suppliers never finish the process.",
    },
    {
      type: "flow",
      direction: "horizontal",
      steps: [
        {
          label: "Upload",
          icon: "file-analytics",
          description:
            "Drop a PDF \u2014 safety manual, chemical guide, policy document \u2014 into the pipeline",
        },
        {
          label: "Extract",
          icon: "search",
          description:
            "AI parses the document structure, identifying key topics, procedures, and safety-critical content",
        },
        {
          label: "Lessons",
          icon: "list-details",
          description:
            "Content is reorganised into bite-sized lessons with clear learning objectives",
        },
        {
          label: "Quiz",
          icon: "clipboard-check",
          description:
            "Auto-generated comprehension questions verify worker understanding of each lesson",
        },
        {
          label: "Translate",
          icon: "message",
          description:
            "Lessons and quizzes are translated into up to 5 worker languages",
        },
        {
          label: "Deploy",
          icon: "arrow-right",
          description:
            "The finished course is published and assigned to workers, with completion tracking from day one",
        },
      ],
    },
    {
      type: "callout-grid",
      items: [
        {
          icon: "brain",
          title: "Intelligent Extraction",
          text: "AI identifies safety procedures, hazard warnings, and compliance requirements \u2014 not just raw text",
          color: "blue",
        },
        {
          icon: "clipboard-check",
          title: "Auto-Generated Quizzes",
          text: "Comprehension questions are created from lesson content to verify genuine understanding, not rote memorisation",
          color: "indigo",
        },
        {
          icon: "message",
          title: "Multilingual Deployment",
          text: "Courses ship in 5 languages so every worker receives training in the language they think in",
          color: "green",
        },
        {
          icon: "target-arrow",
          title: "Risk Score Integration",
          text: "Training completion feeds directly into each supplier\u2019s risk score with a 25% weight \u2014 untrained suppliers score higher risk",
          color: "amber",
        },
      ],
    },
    {
      type: "stat-highlight",
      stats: [
        { value: "3,172", label: "Course completions tracked" },
        { value: "5", label: "Languages per course" },
        { value: "25%", label: "Weight in risk score" },
      ],
    },
    {
      type: "example",
      title: "Real Example: Chemical Handling Guide for 4 Factories",
      steps: [
        "A brand uploads a 48-page chemical handling PDF written in English",
        "AI extracts 6 key topics: storage, labelling, PPE, spill response, disposal, and emergency contacts",
        "Each topic becomes a lesson with 3\u20135 screens of simplified content and diagrams",
        "12 quiz questions are generated covering critical safety procedures",
        "The course is translated into Vietnamese, Khmer, Bengali, and Burmese",
        "Within one week, 847 workers across 4 factories complete the course \u2014 and their suppliers\u2019 risk scores update automatically",
      ],
    },
  ],
};
