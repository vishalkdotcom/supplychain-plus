export const JOB_TYPES = [
  "calculate-risk",
  "analyze-surveys",
  "case-clustering",
  "payslip-anomaly",
  "risk-forecast",
  "worker-voice-analytics",
  "regional-benchmarking",
  "generate-briefing",
  "remediation-evidence-sweep",
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
  "regional-benchmarking",
  "generate-briefing",
  "remediation-evidence-sweep",
];

/** Human-readable labels for each job type */
export const JOB_LABELS: Record<JobType, string> = {
  "calculate-risk": "Risk Scoring",
  "analyze-surveys": "Survey Analysis",
  "case-clustering": "Case Clustering",
  "payslip-anomaly": "Payslip Anomaly Detection",
  "risk-forecast": "Risk Forecasting",
  "worker-voice-analytics": "Worker Voice Analytics",
  "regional-benchmarking": "Regional Benchmarking",
  "generate-briefing": "Intelligence Briefing",
  "remediation-evidence-sweep": "Evidence Sweep",
};

/** Brief descriptions for each job */
export const JOB_DESCRIPTIONS: Record<JobType, string> = {
  "calculate-risk": "Compute composite risk scores from cases, surveys, and training data",
  "analyze-surveys": "AI sentiment analysis and theme extraction from survey responses",
  "case-clustering": "Embed case messages and detect systemic patterns via clustering",
  "payslip-anomaly": "Detect wage anomalies and minimum wage violations",
  "risk-forecast": "Predict supplier risk scores 60 days ahead",
  "worker-voice-analytics": "Extract emerging topics and sentiment trends from worker feedback",
  "regional-benchmarking": "Compare suppliers against regional peers and detect contextual silence",
  "generate-briefing": "Aggregate intelligence from all jobs into a daily briefing digest",
  "remediation-evidence-sweep": "Cross-reference resolved cases, training completions, and case volumes against active remediations",
};

/** Per-job timeout in milliseconds — job is killed if it exceeds this */
export const JOB_TIMEOUTS: Record<JobType, number> = {
  "calculate-risk": 5 * 60_000,
  "analyze-surveys": 10 * 60_000,
  "case-clustering": 15 * 60_000,
  "payslip-anomaly": 10 * 60_000,
  "risk-forecast": 30 * 60_000,
  "worker-voice-analytics": 10 * 60_000,
  "regional-benchmarking": 5 * 60_000,
  "generate-briefing": 10 * 60_000,
  "remediation-evidence-sweep": 5 * 60_000,
};

/** Max automatic retries per job type */
export const JOB_MAX_RETRIES: Record<JobType, number> = {
  "calculate-risk": 2,
  "analyze-surveys": 2,
  "case-clustering": 1, // Ollama resource contention — keep retries low
  "payslip-anomaly": 2,
  "risk-forecast": 2,
  "worker-voice-analytics": 2,
  "regional-benchmarking": 2,
  "generate-briefing": 2,
  "remediation-evidence-sweep": 2,
};

/** Base delay for exponential backoff: 30s, 60s, 120s … */
export const BASE_RETRY_DELAY_MS = 30_000;
