import { openai, createOpenAI } from "@ai-sdk/openai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createPerplexity } from "@ai-sdk/perplexity";
import { wrapLanguageModel, extractReasoningMiddleware } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createAnthropic } from "@ai-sdk/anthropic";

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

/**
 * Resolves a model dynamically from a request.
 * Allows users to override the default system model using their own OpenRouter keys.
 */
export function getModelFromRequest(
  request: Request,
  type: "normal" | "strong" = "normal",
) {
  const customProvider = request.headers.get("x-ai-provider");
  const customKey = request.headers.get("x-ai-api-key");
  const customModel = request.headers.get("x-ai-model");

  if (customProvider && customModel) {
    if (customProvider === "openrouter") {
      const openrouter = createOpenRouter({
        apiKey: customKey || process.env.OPENROUTER_API_KEY || "",
      });
      return openrouter(customModel);
    }
    if (customProvider === "nim") {
      const key = customKey || process.env.NIM_API_KEY;
      const nim = createOpenAICompatible({
        name: "nim",
        baseURL: "https://integrate.api.nvidia.com/v1",
        headers: key ? { Authorization: `Bearer ${key}` } : undefined,
      });
      return nim.chatModel(customModel);
    }
    if (customProvider === "google") {
      const google = createGoogleGenerativeAI({
        apiKey:
          customKey ||
          process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
          process.env.GEMINI_API_KEY ||
          "",
      });
      return google(customModel);
    }
    if (customProvider === "openai") {
      const oai = createOpenAI({
        apiKey: customKey || process.env.OPENAI_API_KEY || "",
      });
      return oai(customModel);
    }
    if (customProvider === "anthropic") {
      const anthropic = createAnthropic({
        apiKey: customKey || process.env.ANTHROPIC_API_KEY || "",
      });
      return anthropic(customModel);
    }
    if (customProvider === "perplexity") {
      const pplx = createPerplexity({ apiKey: customKey || "" });
      return pplx(customModel);
    }
    if (customProvider === "lmstudio") {
      const url = customKey || "http://localhost:1234/v1";
      const lms = createOpenAICompatible({ name: "lmstudio", baseURL: url });
      return lms.chatModel(customModel);
    }
    if (customProvider === "ollama") {
      const url = customKey || "http://localhost:11434/v1";
      const ollama = createOpenAICompatible({ name: "ollama", baseURL: url });
      return ollama.chatModel(customModel);
    }
  }

  // Fallback to defaults
  return type === "strong" ? strongModel : model;
}
