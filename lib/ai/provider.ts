import { openai, createOpenAI } from "@ai-sdk/openai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createPerplexity } from "@ai-sdk/perplexity";
import { wrapLanguageModel, extractReasoningMiddleware } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createAnthropic } from "@ai-sdk/anthropic";
import { ollama as ollamaProvider } from "ai-sdk-ollama";
import { createGroq } from "@ai-sdk/groq";
import { createCerebras } from "@ai-sdk/cerebras";

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
        apiKey: process.env.NIM_API_KEY,
        supportsStructuredOutputs: true,
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

    case "ollama": {
      const ollamaModelName =
        process.env.OLLAMA_MODEL ?? "qwen3.5:4b";
      return {
        model: ollamaProvider(ollamaModelName, { think: false }),
        strongModel: ollamaProvider(ollamaModelName, { think: false }),
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
        apiKey: key,
        supportsStructuredOutputs: true,
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
      return ollamaProvider(customModel, { think: false });
    }
  }

  // Fallback to defaults
  return type === "strong" ? strongModel : model;
}

// ─── Batch job model resolver ────────────────────────────────
// Controlled by JOB_AI_PROVIDER env var. Defaults to "ollama".
// Valid: "ollama" | "groq" | "cerebras" | "nim"

const jobProvider = process.env.JOB_AI_PROVIDER ?? "ollama";

/**
 * Resolve a language model for pipeline batch jobs.
 * Reads JOB_AI_PROVIDER to pick the cloud/local backend.
 * Embeddings always use Ollama (no free cloud embedding API at volume).
 */
export function getJobModel() {
  switch (jobProvider) {
    case "groq": {
      const groq = createGroq({
        apiKey: process.env.GROQ_API_KEY ?? "",
      });
      return groq("llama-3.3-70b-versatile");
    }
    case "cerebras": {
      const cerebras = createCerebras({
        apiKey: process.env.CEREBRAS_API_KEY ?? "",
      });
      return cerebras("llama-3.3-70b");
    }
    case "nim": {
      const nim = createOpenAICompatible({
        name: "nim",
        baseURL: "https://integrate.api.nvidia.com/v1",
        apiKey: process.env.NIM_API_KEY,
      });
      return nim.chatModel("deepseek-ai/deepseek-v3.1");
    }
    case "ollama":
    default: {
      const modelName = process.env.OLLAMA_JOB_MODEL ?? "qwen3:4b";
      return ollamaProvider(modelName, { think: false });
    }
  }
}

/** @deprecated Use getJobModel() for pipeline jobs. Kept for backwards compat. */
export function getOllamaModel(modelName: string) {
  return ollamaProvider(modelName, { think: false });
}

/** Get an Ollama embedding model (e.g. bge-m3). Always uses Ollama. */
export function getOllamaEmbedding(modelName: string = "bge-m3") {
  return ollamaProvider.embedding(modelName);
}
