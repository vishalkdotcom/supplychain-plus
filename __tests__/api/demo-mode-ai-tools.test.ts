import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";

const stubTool = { type: "function" as const };

mock.module("@/lib/ai/tools", () => ({
  querySupplierRisk: stubTool,
  queryCases: stubTool,
  querySurveys: stubTool,
  queryTrainingCompletion: stubTool,
  getAlerts: stubTool,
  markAlertRead: stubTool,
  triggerRiskRecalculation: stubTool,
  queryPlaybook: stubTool,
  queryClusters: stubTool,
  queryVoiceTrends: stubTool,
  queryAnomalies: stubTool,
  queryForecasts: stubTool,
  queryMonitoringSignals: stubTool,
  queryRemediations: stubTool,
  queryRiskHistory: stubTool,
}));

import {
  DEMO_ALLOWED_READ_TOOL_NAMES,
  DEMO_BLOCKED_TOOL_NAMES,
} from "@/lib/demo-mode/profile";
import { buildChatTools, CHAT_TOOL_NAMES } from "@/lib/ai/chat-tools";
import { getChatSystemPrompt } from "@/lib/ai/prompts";

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("demo mode AI chat tools", () => {
  test("chat tool registry includes every profile allowlist tool", () => {
    for (const toolName of DEMO_ALLOWED_READ_TOOL_NAMES) {
      expect(CHAT_TOOL_NAMES).toContain(toolName);
    }

    for (const toolName of DEMO_BLOCKED_TOOL_NAMES) {
      expect(CHAT_TOOL_NAMES).toContain(toolName);
    }
  });

  describe("when demo mode is off", () => {
    test("buildChatTools returns the full tool set", () => {
      delete process.env.DEMO_MODE;

      const tools = buildChatTools();

      expect(Object.keys(tools).toSorted()).toEqual(
        [...CHAT_TOOL_NAMES].toSorted(),
      );
    });

    test("getChatSystemPrompt advertises full tool routing", () => {
      delete process.env.DEMO_MODE;

      const prompt = getChatSystemPrompt();
      expect(prompt).toContain("queryCases");
      expect(prompt).toContain("querySurveys");
      expect(prompt).not.toContain("Demo Mode restrictions");
    });
  });

  describe("when demo mode is on", () => {
    beforeEach(() => {
      process.env.DEMO_MODE = "true";
      process.env.DEMO_AS_OF = "2025-06-15T12:00:00.000Z";
    });

    test("buildChatTools returns only derived read tools", () => {
      const tools = buildChatTools();

      expect(Object.keys(tools).toSorted()).toEqual(
        [...DEMO_ALLOWED_READ_TOOL_NAMES].toSorted(),
      );
      for (const toolName of DEMO_BLOCKED_TOOL_NAMES) {
        expect(tools).not.toHaveProperty(toolName);
      }
    });

    test("getChatSystemPrompt excludes blocked tools and adds demo restrictions", () => {
      const prompt = getChatSystemPrompt();

      expect(prompt).toContain("Demo Mode restrictions");
      expect(prompt).toContain("Do NOT use or suggest queryCases");
      expect(prompt).not.toContain("Grievance cases → queryCases");
      expect(prompt).toContain("queryClusters");
    });
  });
});
