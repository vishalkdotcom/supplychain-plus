import { openai, createOpenAI } from "@ai-sdk/openai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createPerplexity } from "@ai-sdk/perplexity";
import {
  wrapLanguageModel,
  extractReasoningMiddleware,
  generateText as aiGenerateText,
} from "ai";
import type { LanguageModelV3 } from "@ai-sdk/provider";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOllama } from "ai-sdk-ollama";
import { createGroq } from "@ai-sdk/groq";
import { createCerebras } from "@ai-sdk/cerebras";

// Strip trailing /api from OLLAMA_BASE_URL since the SDK appends it internally
const ollamaBaseURL = (process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434/api")
  .replace(/\/api\/?$/, "");
const ollamaProvider = createOllama({ baseURL: ollamaBaseURL });

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
// Controlled by JOB_AI_PROVIDER env var. Defaults to "groq".
// Valid: "groq" | "cerebras" | "nim" | "ollama"
// JOB_AI_FALLBACK specifies a fallback provider for rate-limit / error recovery.

import {
  getRateLimiter,
  estimateParamTokens,
  extractRetryAfter,
} from "@/lib/ai/rate-limiter";

const jobProvider = process.env.JOB_AI_PROVIDER ?? "groq";
const jobFallback = process.env.JOB_AI_FALLBACK ?? "";

interface JobModelResult {
  model: LanguageModelV3;
  modelId: string;
}

function buildJobModel(provider: string): JobModelResult {
  switch (provider) {
    case "groq": {
      const groq = createGroq({
        apiKey: process.env.GROQ_API_KEY ?? "",
      });
      const modelId = "llama-3.3-70b-versatile";
      return { model: groq(modelId), modelId };
    }
    case "cerebras": {
      const cerebras = createCerebras({
        apiKey: process.env.CEREBRAS_API_KEY ?? "",
      });
      const modelId = "llama-3.3-70b";
      return { model: cerebras(modelId), modelId };
    }
    case "nim": {
      const nim = createOpenAICompatible({
        name: "nim",
        baseURL: "https://integrate.api.nvidia.com/v1",
        apiKey: process.env.NIM_API_KEY,
      });
      const modelId = "deepseek-ai/deepseek-v3.1";
      return { model: nim.chatModel(modelId), modelId };
    }
    case "ollama":
    default: {
      const modelId = process.env.OLLAMA_JOB_MODEL ?? "qwen3:4b";
      return { model: ollamaProvider(modelId, { think: false }), modelId };
    }
  }
}

/**
 * Resolve the primary language model for pipeline batch jobs.
 * Reads JOB_AI_PROVIDER to pick the backend (default: groq).
 */
export function getJobModel(): LanguageModelV3 {
  return buildJobModel(jobProvider).model;
}

/** HTTP status codes that trigger fallback to the secondary provider. */
const FALLBACK_STATUS_CODES = new Set([429, 500, 502, 503]);

function isRetryableError(err: unknown): boolean {
  if (typeof err === "object" && err !== null) {
    const status =
      (err as { statusCode?: number }).statusCode ??
      (err as { status?: number }).status;
    if (status && FALLBACK_STATUS_CODES.has(status)) return true;
    const code = (err as { code?: string }).code;
    if (code === "ECONNREFUSED" || code === "ETIMEDOUT") return true;
  }
  return false;
}

// Pre-resolve primary/fallback model info for rate limiter lookups
const primaryJob = buildJobModel(jobProvider);
const fallbackJob = jobFallback && jobFallback !== jobProvider
  ? buildJobModel(jobFallback)
  : null;

/**
 * Drop-in replacement for `generateText` with rate limiting and
 * automatic fallback to JOB_AI_FALLBACK on rate-limit (429) or server errors (5xx).
 */
export const generateTextWithFallback: typeof aiGenerateText = async (
  params,
) => {
  const estimatedTokens = estimateParamTokens(params as Record<string, unknown>);
  const limiter = getRateLimiter(jobProvider, primaryJob.modelId);

  await limiter.acquire(estimatedTokens);

  try {
    const result = await aiGenerateText(params);
    // Correct the bucket with actual usage from the response
    const actual = (result.usage?.totalTokens ?? 0) || estimatedTokens;
    limiter.reportActualUsage(actual, estimatedTokens);
    return result;
  } catch (err) {
    // Report retry-after so other concurrent jobs also wait
    const retryAfter = extractRetryAfter(err);
    if (retryAfter) limiter.reportRetryAfter(retryAfter);

    if (fallbackJob && isRetryableError(err)) {
      const fbLimiter = getRateLimiter(jobFallback, fallbackJob.modelId);
      await fbLimiter.acquire(estimatedTokens);

      console.warn(
        `[ai/provider] ${jobProvider} failed (${(err as { statusCode?: number }).statusCode ?? "network"}), falling back to ${jobFallback}`,
      );

      try {
        const result = await aiGenerateText({ ...params, model: fallbackJob.model });
        const actual = (result.usage?.totalTokens ?? 0) || estimatedTokens;
        fbLimiter.reportActualUsage(actual, estimatedTokens);
        return result;
      } catch (fbErr) {
        const fbRetryAfter = extractRetryAfter(fbErr);
        if (fbRetryAfter) fbLimiter.reportRetryAfter(fbRetryAfter);
        throw fbErr;
      }
    }
    throw err;
  }
};

/** Get an Ollama embedding model (e.g. bge-m3). Always uses local Ollama. */
export function getOllamaEmbedding(modelName: string = "bge-m3") {
  return ollamaProvider.embedding(modelName);
}
