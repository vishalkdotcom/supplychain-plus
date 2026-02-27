import { openai } from "@ai-sdk/openai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createPerplexity } from "@ai-sdk/perplexity";
import { wrapLanguageModel, extractReasoningMiddleware } from "ai";

// Middleware to extract <think>...</think> reasoning from NIM models
// into a separate `reasoning` field, keeping `text` clean.
const thinkingMiddleware = extractReasoningMiddleware({
  tagName: "think",
  startWithReasoning: true,
});

// ─── Switch providers by changing AI_PROVIDER in .env.local ───
// Valid values: "openai" | "nim" | "perplexity" | "lmstudio"
const activeProvider = process.env.AI_PROVIDER ?? "openai";

// ─── Provider factories ───────────────────────────────────
function buildModels() {
  switch (activeProvider) {
    case "nim": {
      const nim = createOpenAICompatible({
        name: "nim",
        baseURL: "https://integrate.api.nvidia.com/v1",
        headers: { Authorization: `Bearer ${process.env.NIM_API_KEY}` },
      });
      return {
        model: nim.chatModel("deepseek-ai/deepseek-v3.1"),
        strongModel: wrapLanguageModel({
          model: nim.chatModel("moonshotai/kimi-k2.5"),
          middleware: thinkingMiddleware,
        }),
      };
    }

    case "perplexity": {
      const pplx = createPerplexity({
        apiKey: process.env.PERPLEXITY_API_KEY ?? "",
      });
      return {
        model: pplx("sonar"),
        strongModel: pplx("sonar-pro"),
      };
    }

    case "lmstudio": {
      const lms = createOpenAICompatible({
        name: "lmstudio",
        baseURL: process.env.LMSTUDIO_BASE_URL ?? "http://localhost:1234/v1",
      });
      const modelName = process.env.LMSTUDIO_MODEL ?? "loaded-model";
      return {
        model: lms.chatModel(modelName),
        strongModel: lms.chatModel(modelName),
      };
    }

    case "openai":
    default:
      return {
        model: openai("gpt-4o-mini"),
        strongModel: openai("gpt-4o"),
      };
  }
}

const models = buildModels();

/** Default model for most tasks: chat, summaries, guidance, survey questions */
export const model = models.model;

/** Stronger model for complex tasks: HRDD reports, detailed analysis */
export const strongModel = models.strongModel;
