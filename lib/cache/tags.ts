/** Broad endpoint-level cache tags */
export const TAGS = {
  metrics: "metrics",
  suppliers: "suppliers",
  forecasts: "forecasts",
  intelligence: "intelligence",
  cases: "cases",
  alerts: "alerts",
  remediations: "remediations",
} as const;

/** Granular per-entity cache tag constructors */
export const supplierTag = (id: string) => `supplier:${id}`;
export const forecastTag = (supplierId: string) => `forecast:${supplierId}`;
export const remediationTag = (id: number | string) => `remediation:${id}`;
