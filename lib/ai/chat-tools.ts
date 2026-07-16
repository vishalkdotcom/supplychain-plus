import {
  querySupplierRisk,
  queryCases,
  querySurveys,
  queryTrainingCompletion,
  getAlerts,
  markAlertRead,
  triggerRiskRecalculation,
  queryPlaybook,
  queryClusters,
  queryVoiceTrends,
  queryAnomalies,
  queryForecasts,
  queryMonitoringSignals,
  queryRemediations,
  queryRiskHistory,
} from "@/lib/ai/tools";
import { isToolAllowed } from "@/lib/demo-mode/profile";

export const CHAT_TOOL_NAMES = [
  "querySupplierRisk",
  "queryCases",
  "querySurveys",
  "queryTrainingCompletion",
  "getAlerts",
  "markAlertRead",
  "triggerRiskRecalculation",
  "queryPlaybook",
  "queryClusters",
  "queryVoiceTrends",
  "queryAnomalies",
  "queryForecasts",
  "queryMonitoringSignals",
  "queryRemediations",
  "queryRiskHistory",
] as const;

export type ChatToolName = (typeof CHAT_TOOL_NAMES)[number];

const ALL_CHAT_TOOLS = {
  querySupplierRisk,
  queryCases,
  querySurveys,
  queryTrainingCompletion,
  getAlerts,
  markAlertRead,
  triggerRiskRecalculation,
  queryPlaybook,
  queryClusters,
  queryVoiceTrends,
  queryAnomalies,
  queryForecasts,
  queryMonitoringSignals,
  queryRemediations,
  queryRiskHistory,
} as const satisfies Record<ChatToolName, unknown>;

export function buildChatTools(): Partial<typeof ALL_CHAT_TOOLS> {
  return Object.fromEntries(
    Object.entries(ALL_CHAT_TOOLS).filter(([name]) => isToolAllowed(name)),
  ) as Partial<typeof ALL_CHAT_TOOLS>;
}
