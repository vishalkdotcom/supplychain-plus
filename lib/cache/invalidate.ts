import { revalidateTag } from "next/cache";
import { TAGS, supplierTag, forecastTag, remediationTag } from "./tags";

/** Shorthand — always expire immediately ("max" profile) */
function purge(tag: string) {
  revalidateTag(tag, "max");
}

/** After calculate-risk job completes */
export function invalidateAfterRiskCalculation() {
  purge(TAGS.metrics);
  purge(TAGS.suppliers);
  purge(TAGS.intelligence);
  purge(TAGS.alerts);
}

/** After risk-forecast job completes */
export function invalidateAfterForecast(supplierIds?: string[]) {
  purge(TAGS.forecasts);
  purge(TAGS.intelligence);
  if (supplierIds) {
    for (const id of supplierIds) {
      purge(forecastTag(id));
    }
  }
}

/** After analyze-surveys job completes */
export function invalidateAfterSurveyAnalysis() {
  purge(TAGS.metrics);
  purge(TAGS.intelligence);
}

/** After worker-voice-analytics job completes */
export function invalidateAfterWorkerVoice() {
  purge(TAGS.metrics);
  purge(TAGS.intelligence);
}

/** After case-clustering job completes */
export function invalidateAfterCaseClustering() {
  purge(TAGS.cases);
  purge(TAGS.intelligence);
}

/** After generate-briefing job completes */
export function invalidateAfterBriefing() {
  purge(TAGS.intelligence);
}

/** After regional-benchmarking job completes */
export function invalidateAfterBenchmarking() {
  purge(TAGS.suppliers);
  purge(TAGS.intelligence);
}

/** After payslip-anomaly job completes */
export function invalidateAfterPayslipAnomaly() {
  purge(TAGS.alerts);
  purge(TAGS.intelligence);
}

/** After remediation-evidence-sweep job completes */
export function invalidateAfterEvidenceSweep() {
  purge(TAGS.remediations);
}

/** After PATCH /api/cases/[id]/status */
export function invalidateAfterCaseStatusChange() {
  purge(TAGS.cases);
  purge(TAGS.metrics);
  purge(TAGS.intelligence);
}

/** After PATCH /api/alerts */
export function invalidateAfterAlertUpdate() {
  purge(TAGS.alerts);
  purge(TAGS.intelligence);
}

/** After POST/PATCH on remediations or evidence */
export function invalidateAfterRemediationUpdate(
  remediationId: number | string,
  supplierId: string,
) {
  purge(TAGS.remediations);
  purge(remediationTag(remediationId));
  purge(supplierTag(supplierId));
}
