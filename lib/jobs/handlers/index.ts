import type { JobType } from "../constants";
import type { JobHandler } from "./types";
import { calculateRisk } from "./calculate-risk";
import { analyzeSurveys } from "./analyze-surveys";
import { caseClustering } from "./case-clustering";
import { payslipAnomaly } from "./payslip-anomaly";
import { riskForecast } from "./risk-forecast";
import { workerVoiceAnalytics } from "./worker-voice-analytics";
import { generateBriefing } from "./generate-briefing";

export type { JobResult, JobParams, JobHandler } from "./types";

/**
 * Registry of all job handlers, keyed by job type.
 * The queue engine uses this to call handlers directly — no HTTP fetch needed.
 */
export const JOB_REGISTRY: Record<JobType, JobHandler> = {
  "calculate-risk": calculateRisk,
  "analyze-surveys": analyzeSurveys,
  "case-clustering": caseClustering,
  "payslip-anomaly": payslipAnomaly,
  "risk-forecast": riskForecast,
  "worker-voice-analytics": workerVoiceAnalytics,
};

/**
 * Generate-briefing is not in JOB_TYPES/queue but is available for direct invocation.
 */
export { generateBriefing };
