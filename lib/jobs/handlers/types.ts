/**
 * Standard result shape returned by all job handler functions.
 * The queue engine reads `success` to decide completed vs failed.
 * Everything else is stored as `resultSummary` in job_runs.
 */
export interface JobResult {
  success: boolean;
  [key: string]: unknown;
}

/**
 * Optional parameters that can be passed to job handlers.
 * When invoked from the queue engine, params will be empty.
 * When invoked from the API route, params come from the request body.
 */
export interface JobParams {
  [key: string]: unknown;
}

/** Signature every job handler must satisfy. */
export type JobHandler = (params?: JobParams) => Promise<JobResult>;
