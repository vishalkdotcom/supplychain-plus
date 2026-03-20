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

// ─── Batch job model cascade ─────────────────────────────────
// Cross-provider model cascade with rate limiting.
// Tries models in quality-first order, falling through on 429/5xx.
// Configure via JOB_AI_CASCADE env var, or falls back to
// JOB_AI_PROVIDER + JOB_AI_FALLBACK for backward compatibility.

import {
  getRateLimiter,
  estimateParamTokens,
  extractRetryAfter,
} from "@/lib/ai/rate-limiter";

interface CascadeEntry {
  provider: string;
  modelId: string;
  model: LanguageModelV3;
}

/** Create a provider model from "provider:modelId" notation. */
function buildCascadeModel(provider: string, modelId: string): LanguageModelV3 {
  switch (provider) {
    case "groq": {
      const groq = createGroq({ apiKey: process.env.GROQ_API_KEY ?? "" });
      return groq(modelId);
    }
    case "cerebras": {
      const cerebras = createCerebras({ apiKey: process.env.CEREBRAS_API_KEY ?? "" });
      return cerebras(modelId);
    }
    case "nim": {
      const nim = createOpenAICompatible({
        name: "nim",
        baseURL: "https://integrate.api.nvidia.com/v1",
        apiKey: process.env.NIM_API_KEY,
      });
      return nim.chatModel(modelId);
    }
    case "ollama":
    default:
      return ollamaProvider(modelId, { think: false });
  }
}

/** Default cascade: quality-first, then budget. ~5.8M TPD total on free tier. */
const DEFAULT_CASCADE: Array<[string, string]> = [
  // Tier 1 – Best quality (70B+)
  ["cerebras", "qwen-3-235b-a22b-instruct-2507"],
  ["groq", "openai/gpt-oss-120b"],
  ["groq", "llama-3.3-70b-versatile"],
  // Tier 2 – Good quality (17B–32B)
  ["groq", "meta-llama/llama-4-scout-17b-16e-instruct"],
  ["groq", "qwen/qwen3-32b"],
  ["groq", "moonshotai/kimi-k2-instruct"],
  ["groq", "openai/gpt-oss-20b"],
  // Tier 3 – Fast/small (7B–8B)
  ["cerebras", "llama3.1-8b"],
  ["groq", "llama-3.1-8b-instant"],
  ["groq", "allam-2-7b"],
];

function buildCascade(): CascadeEntry[] {
  const cascadeEnv = process.env.JOB_AI_CASCADE;

  if (cascadeEnv) {
    // Parse "provider:model,provider:model,..." format
    return cascadeEnv.split(",").map((entry) => {
      const sep = entry.indexOf(":");
      const provider = entry.slice(0, sep).trim();
      const modelId = entry.slice(sep + 1).trim();
      return { provider, modelId, model: buildCascadeModel(provider, modelId) };
    });
  }

  // Backward compat: if old env vars are set, use them as a 2-entry cascade
  const legacyProvider = process.env.JOB_AI_PROVIDER;
  const legacyFallback = process.env.JOB_AI_FALLBACK;
  if (legacyProvider && !cascadeEnv) {
    const entries: CascadeEntry[] = [];
    // Find the default model for this provider from DEFAULT_CASCADE
    const primaryPair = DEFAULT_CASCADE.find(([p]) => p === legacyProvider);
    if (primaryPair) {
      entries.push({
        provider: primaryPair[0],
        modelId: primaryPair[1],
        model: buildCascadeModel(primaryPair[0], primaryPair[1]),
      });
    }
    if (legacyFallback && legacyFallback !== legacyProvider) {
      const fbPair = DEFAULT_CASCADE.find(([p]) => p === legacyFallback);
      if (fbPair) {
        entries.push({
          provider: fbPair[0],
          modelId: fbPair[1],
          model: buildCascadeModel(fbPair[0], fbPair[1]),
        });
      }
    }
    if (entries.length > 0) return entries;
  }

  // Default: full 11-model cascade
  return DEFAULT_CASCADE.map(([provider, modelId]) => ({
    provider,
    modelId,
    model: buildCascadeModel(provider, modelId),
  }));
}

const cascade = buildCascade();

console.log(
  `[ai/cascade] ${cascade.length} models configured: ` +
  cascade.map((e, i) => `${i + 1}. ${e.provider}:${e.modelId}`).join(", "),
);

/**
 * Resolve the primary language model for pipeline batch jobs.
 * Returns the first model in the cascade chain.
 */
export function getJobModel(): LanguageModelV3 {
  return cascade[0].model;
}

/** HTTP status codes that trigger cascade fallthrough (transient). */
const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503]);

/** HTTP status codes indicating the model is permanently unavailable. */
const PERMANENT_FAILURE_CODES = new Set([400, 401, 403, 404]);

/** Models that returned permanent errors — skip for rest of process lifetime. */
const deadModels = new Set<string>();

function getErrorStatus(err: unknown): number | undefined {
  if (typeof err !== "object" || err === null) return undefined;
  const e = err as Record<string, unknown>;
  const status = (e.statusCode ?? e.status) as number | undefined;
  if (status) return status;
  const lastError = e.lastError as Record<string, unknown> | undefined;
  return (lastError?.statusCode ?? lastError?.status) as number | undefined;
}

function isRetryableError(err: unknown): boolean {
  if (typeof err !== "object" || err === null) return false;
  const e = err as Record<string, unknown>;

  // Check top-level status (direct API errors)
  const status = (e.statusCode ?? e.status) as number | undefined;
  if (status && RETRYABLE_STATUS_CODES.has(status)) return true;

  // Check nested lastError (AI SDK RetryError wraps the original)
  const lastError = e.lastError as Record<string, unknown> | undefined;
  if (lastError) {
    const nestedStatus = (lastError.statusCode ?? lastError.status) as number | undefined;
    if (nestedStatus && RETRYABLE_STATUS_CODES.has(nestedStatus)) return true;
  }

  // Network errors (check both levels)
  const code = (e.code ?? lastError?.code) as string | undefined;
  if (code === "ECONNREFUSED" || code === "ETIMEDOUT") return true;
  return false;
}

function isPermanentFailure(err: unknown): boolean {
  const status = getErrorStatus(err);
  return status !== undefined && PERMANENT_FAILURE_CODES.has(status);
}

/** Max time (ms) to wait for a higher-quality model before trying a faster one. */
const THROTTLE_THRESHOLD_MS = Number(process.env.JOB_CASCADE_THROTTLE_MS) || 5_000;

/** Track which models have been logged as daily-exhausted (log once, not per request). */
const dailyExhaustedLogged = new Set<string>();

/**
 * Drop-in replacement for `generateText` with rate limiting and
 * smart model cascade. Picks the highest-quality model that can serve
 * within THROTTLE_THRESHOLD_MS, skipping exhausted daily budgets,
 * and falling through on 429/5xx errors.
 */
export const generateTextWithFallback: typeof aiGenerateText = async (
  params,
) => {
  const estimatedTokens = estimateParamTokens(params as Record<string, unknown>);
  let lastError: unknown;

  // ── Phase 1: Find best model with acceptable wait ──
  // Scan cascade in quality order; pick first model under threshold.
  // Track lowest-wait fallback in case all models exceed threshold.
  let selectedIdx = -1;
  let lowestWaitIdx = -1;
  let lowestWait = Infinity;

  for (let i = 0; i < cascade.length; i++) {
    const entry = cascade[i];
    const key = `${entry.provider}:${entry.modelId}`;

    if (deadModels.has(key)) continue;

    const limiter = getRateLimiter(entry.provider, entry.modelId);

    if (await limiter.isDailyExhausted(estimatedTokens)) {
      if (!dailyExhaustedLogged.has(key)) {
        console.log(
          `[ai/cascade] skipping ${key} (${i + 1}/${cascade.length}) — daily budget exhausted`,
        );
        dailyExhaustedLogged.add(key);
      }
      continue;
    }

    const waitMs = await limiter.estimateWaitMs(estimatedTokens);

    if (waitMs <= THROTTLE_THRESHOLD_MS) {
      selectedIdx = i;
      break;
    }

    if (waitMs < lowestWait) {
      lowestWait = waitMs;
      lowestWaitIdx = i;
    }
  }

  if (selectedIdx === -1) selectedIdx = lowestWaitIdx;

  if (selectedIdx === -1) {
    throw new Error("[ai/cascade] all models exhausted (daily budgets)");
  }

  // ── Phase 2: Try selected model first, then fall through all others on error ──
  // Build order: selected model first, then remaining models in cascade order
  const tryOrder: number[] = [selectedIdx];
  for (let i = 0; i < cascade.length; i++) {
    if (i !== selectedIdx) tryOrder.push(i);
  }

  for (const i of tryOrder) {
    const entry = cascade[i];
    const key = `${entry.provider}:${entry.modelId}`;
    const limiter = getRateLimiter(entry.provider, entry.modelId);

    if (deadModels.has(key)) continue;
    if (i !== selectedIdx && await limiter.isDailyExhausted(estimatedTokens)) {
      continue;
    }

    await limiter.acquire(estimatedTokens);

    try {
      console.log(
        `[ai/cascade] using ${entry.provider}:${entry.modelId} (${i + 1}/${cascade.length})`,
      );
      const result = await aiGenerateText({ ...params, model: entry.model, maxRetries: 0 });
      const actual = (result.usage?.totalTokens ?? 0) || estimatedTokens;
      limiter.reportActualUsage(actual, estimatedTokens);
      return result;
    } catch (err) {
      lastError = err;
      const retryAfter = extractRetryAfter(err);
      // Always set a cooldown on 429 — use provider's retry-after or default 30s
      if (retryAfter) {
        limiter.reportRetryAfter(retryAfter);
      } else if (isRetryableError(err)) {
        limiter.reportRetryAfter(30);
      }

      if (isPermanentFailure(err)) {
        deadModels.add(key);
        const status = getErrorStatus(err);
        console.warn(
          `[ai/cascade] ${key} marked as dead (${status}), trying next model...`,
        );
        continue;
      }

      if (isRetryableError(err)) {
        const status = (err as { statusCode?: number }).statusCode ?? "network";
        console.warn(
          `[ai/cascade] ${key} failed (${status}), trying next model...`,
        );
        continue;
      }
      // Non-retryable, non-permanent error — don't cascade
      throw err;
    }
  }

  // All models exhausted
  throw lastError ?? new Error("[ai/cascade] all models exhausted");
};

/** Get an Ollama embedding model (e.g. bge-m3). Always uses local Ollama. */
export function getOllamaEmbedding(modelName: string = "bge-m3") {
  return ollamaProvider.embedding(modelName);
}
