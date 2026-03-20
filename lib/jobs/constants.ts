export const JOB_TYPES = [
  "calculate-risk",
  "analyze-surveys",
  "case-clustering",
  "payslip-anomaly",
  "risk-forecast",
  "worker-voice-analytics",
  "generate-briefing",
] as const;

export type JobType = (typeof JOB_TYPES)[number];

/** Jobs that use local Ollama embeddings and must be serialized to avoid VRAM thrashing */
export const EMBEDDING_JOBS: Set<JobType> = new Set([
  "case-clustering",
]);

/** Execution order for "Run All" — calculate-risk first since others depend on scores */
export const RUN_ALL_ORDER: JobType[] = [
  "calculate-risk",
  "analyze-surveys",
  "case-clustering",
  "payslip-anomaly",
  "risk-forecast",
  "worker-voice-analytics",
  "generate-briefing",
];

/** Human-readable labels for each job type */
export const JOB_LABELS: Record<JobType, string> = {
  "calculate-risk": "Risk Scoring",
  "analyze-surveys": "Survey Analysis",
  "case-clustering": "Case Clustering",
  "payslip-anomaly": "Payslip Anomaly Detection",
  "risk-forecast": "Risk Forecasting",
  "worker-voice-analytics": "Worker Voice Analytics",
  "generate-briefing": "Intelligence Briefing",
};

/** Brief descriptions for each job */
export const JOB_DESCRIPTIONS: Record<JobType, string> = {
  "calculate-risk": "Compute composite risk scores from cases, surveys, and training data",
  "analyze-surveys": "AI sentiment analysis and theme extraction from survey responses",
  "case-clustering": "Embed case messages and detect systemic patterns via clustering",
  "payslip-anomaly": "Detect wage anomalies and minimum wage violations",
  "risk-forecast": "Predict supplier risk scores 60 days ahead",
  "worker-voice-analytics": "Extract emerging topics and sentiment trends from worker feedback",
  "generate-briefing": "Aggregate intelligence from all jobs into a daily briefing digest",
};
