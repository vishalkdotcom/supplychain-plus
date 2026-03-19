/**
 * Pure logic mapping of ML findings to suggested actions.
 * No LLM needed — these are domain-expert rules that map
 * detected issues to concrete remediation steps.
 */

export interface ActionSuggestion {
  action: string;
  urgency: "immediate" | "soon" | "routine";
  module: "connect" | "engage" | "educate" | "suppliers";
}

// ===============================
// Cluster Actions
// ===============================

export function getClusterActions(cluster: {
  severity: string | null;
  caseTypes: string[];
  supplierCount: number | null;
  caseCount: number | null;
}): ActionSuggestion[] {
  const actions: ActionSuggestion[] = [];

  if (cluster.severity === "critical") {
    actions.push({
      action: "Schedule immediate supplier audits for all affected factories",
      urgency: "immediate",
      module: "connect",
    });
  }

  const types = cluster.caseTypes.map((t) => t.toLowerCase());

  if (types.some((t) => t.includes("wage") || t.includes("pay") || t.includes("salary"))) {
    actions.push({
      action: "Review payroll compliance across affected factories",
      urgency: "immediate",
      module: "connect",
    });
  }

  if (types.some((t) => t.includes("harassment") || t.includes("abuse") || t.includes("violence"))) {
    actions.push({
      action: "Deploy targeted anti-harassment training to affected suppliers",
      urgency: "immediate",
      module: "educate",
    });
  }

  if (types.some((t) => t.includes("overtime") || t.includes("hours") || t.includes("working time"))) {
    actions.push({
      action: "Request working-hour records from affected factories for verification",
      urgency: "soon",
      module: "connect",
    });
  }

  if (types.some((t) => t.includes("safety") || t.includes("health") || t.includes("accident"))) {
    actions.push({
      action: "Conduct health & safety assessment at affected factories",
      urgency: "immediate",
      module: "connect",
    });
  }

  if ((cluster.supplierCount ?? 0) >= 3) {
    actions.push({
      action: "Investigate regional root cause — pattern spans multiple suppliers",
      urgency: "soon",
      module: "suppliers",
    });
  }

  // Fallback if no specific type matched
  if (actions.length === 0) {
    actions.push({
      action:
        cluster.severity === "critical"
          ? "Investigate and address this systemic pattern across affected suppliers"
          : "Monitor this pattern and assess if intervention is needed",
      urgency: cluster.severity === "critical" ? "immediate" : "routine",
      module: "connect",
    });
  }

  return actions;
}

// ===============================
// Anomaly Actions
// ===============================

export function getAnomalyAction(anomaly: {
  anomalyType: string;
  severity: string;
  details?: { country?: string; currency?: string } | null;
}): ActionSuggestion {
  switch (anomaly.anomalyType) {
    case "below_minimum":
      return {
        action: `Initiate wage compliance investigation — workers may be paid below${anomaly.details?.country ? ` ${anomaly.details.country}` : ""} minimum wage`,
        urgency: "immediate",
        module: "connect",
      };
    case "sudden_drop":
      return {
        action: "Request payroll records for the affected period — investigate cause of pay reduction",
        urgency: anomaly.severity === "critical" ? "immediate" : "soon",
        module: "connect",
      };
    case "inconsistency":
      return {
        action: "Verify deduction calculations — net/gross ratio suggests missing or incorrect deductions",
        urgency: "soon",
        module: "connect",
      };
    default:
      return {
        action: "Review payslip records for this supplier",
        urgency: "routine",
        module: "connect",
      };
  }
}

// ===============================
// Monitoring Signal Actions
// ===============================

export function getMonitoringSignalAction(signal: {
  signalType: string;
  severity: string;
}): ActionSuggestion {
  switch (signal.signalType) {
    case "silence":
      return {
        action:
          signal.severity === "critical"
            ? "Conduct unannounced visit — prolonged silence may indicate suppressed worker voice"
            : "Deploy a worker pulse survey to assess engagement levels",
        urgency: signal.severity === "critical" ? "immediate" : "soon",
        module: "engage",
      };
    case "engagement_decay":
      return {
        action: "Investigate declining survey participation — consider incentives or channel accessibility improvements",
        urgency: "soon",
        module: "engage",
      };
    case "regional_contagion":
      return {
        action: "Convene regional supplier meeting — shared issues may indicate industry-level problem",
        urgency: "immediate",
        module: "suppliers",
      };
    default:
      return {
        action: "Review this monitoring signal and assess required response",
        urgency: "routine",
        module: "suppliers",
      };
  }
}
