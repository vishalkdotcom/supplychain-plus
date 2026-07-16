export const DEMO_ALLOWED_READ_TOOL_NAMES = [
  "querySupplierRisk",
  "queryClusters",
  "queryVoiceTrends",
  "queryAnomalies",
  "queryForecasts",
  "queryMonitoringSignals",
  "queryRemediations",
  "queryRiskHistory",
  "getAlerts",
  "queryPlaybook",
] as const;

export const DEMO_BLOCKED_TOOL_NAMES = [
  "queryCases",
  "querySurveys",
  "queryTrainingCompletion",
  "markAlertRead",
  "triggerRiskRecalculation",
] as const;

const DEMO_READ_TOOLS = new Set<string>(DEMO_ALLOWED_READ_TOOL_NAMES);
const DEMO_BLOCKED_TOOLS = new Set<string>(DEMO_BLOCKED_TOOL_NAMES);

const DEMO_ALLOWED_EXACT = new Set([
  "/",
  "/brands",
  "/suppliers",
  "/ai",
  "/connect/clusters",
  "/connect/payslip-anomalies",
  "/engage/voice-trends",
  "/intelligence",
  "/intelligence/regional-insights",
  "/governance",
  "/governance/regulatory-radar",
  "/remediation",
  "/operations/jobs",
  "/settings",
  "/login",
  "/not-in-demo",
]);

const DEMO_BLOCKED_EXACT = new Set(["/connect", "/engage", "/educate"]);

const DEMO_ALLOWED_PREFIXES = [
  "/brands/",
  "/suppliers/",
  "/remediation/",
  "/operations/",
  "/intelligence/",
  "/governance/",
  "/connect/clusters/",
  "/connect/payslip-anomalies/",
];

function isTruthyEnv(value: string | undefined): boolean {
  return value === "true" || value === "1";
}

function parseDemoAsOf(): Date | null {
  const raw = process.env.DEMO_AS_OF ?? process.env.NEXT_PUBLIC_DEMO_AS_OF;
  if (!raw) return null;

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

export function isDemoMode(): boolean {
  return (
    isTruthyEnv(process.env.DEMO_MODE) ||
    isTruthyEnv(process.env.NEXT_PUBLIC_DEMO_MODE)
  );
}

export function getDemoAsOf(): Date | null {
  if (!isDemoMode()) return null;
  return parseDemoAsOf();
}

export function now(): Date {
  if (isDemoMode()) {
    const asOf = parseDemoAsOf();
    if (asOf) return new Date(asOf.getTime());
  }
  return new Date();
}

export function daysAgo(days: number): Date {
  const result = now();
  result.setDate(result.getDate() - days);
  return result;
}

export function subtractDays(from: Date, days: number): Date {
  const result = new Date(from.getTime());
  result.setDate(result.getDate() - days);
  return result;
}

export function areMutationsAllowed(): boolean {
  return !isDemoMode();
}

export function areJobsExecutable(): boolean {
  return !isDemoMode();
}

export function isAuthRequired(): boolean {
  return isDemoMode();
}

export function normalizePathname(pathname: string): string {
  const path = pathname.split("?")[0]?.split("#")[0] ?? "/";
  if (path.length > 1 && path.endsWith("/")) {
    return path.slice(0, -1);
  }
  return path || "/";
}

export function evaluateDemoRoutePolicy(pathname: string): boolean {
  const path = normalizePathname(pathname);

  if (DEMO_BLOCKED_EXACT.has(path)) return false;
  if (DEMO_ALLOWED_EXACT.has(path)) return true;

  if (
    path === "/engage/voice-trends" ||
    path.startsWith("/engage/voice-trends/")
  ) {
    return true;
  }

  if (path.startsWith("/connect/")) {
    return (
      path.startsWith("/connect/clusters") ||
      path.startsWith("/connect/payslip-anomalies")
    );
  }

  if (path.startsWith("/engage/")) return false;

  return DEMO_ALLOWED_PREFIXES.some((prefix) => path.startsWith(prefix));
}

export function isRouteAllowed(pathname: string): boolean {
  if (!isDemoMode()) return true;
  return evaluateDemoRoutePolicy(pathname);
}

export function isToolAllowed(toolName: string): boolean {
  if (!isDemoMode()) return true;
  if (DEMO_BLOCKED_TOOLS.has(toolName)) return false;
  return DEMO_READ_TOOLS.has(toolName);
}

export function getDemoAsOfLabel(): string {
  const asOf = getDemoAsOf();
  if (!asOf) return "Demo as-of unknown";

  return asOf.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export const demoModeProfile = {
  isDemoMode,
  getDemoAsOf,
  getDemoAsOfLabel,
  now,
  daysAgo,
  subtractDays,
  areMutationsAllowed,
  areJobsExecutable,
  isAuthRequired,
  normalizePathname,
  evaluateDemoRoutePolicy,
  isRouteAllowed,
  isToolAllowed,
};
