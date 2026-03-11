import { generateText, streamText, type LanguageModel } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { model, strongModel } from "./provider";

// ─── Waterfall chain of models to try on rate limit (429) errors ───
// Each entry: [providerFactory, modelName]
// The chain ends with Ollama (local) which never rate-limits.

type ModelFactory = () => LanguageModel;

function getWaterfallChain(type: "normal" | "strong" = "normal"): ModelFactory[] {
  const chain: ModelFactory[] = [];

  // 1. Primary: whatever is configured in buildModels()
  chain.push(() => (type === "strong" ? strongModel : model));

  // 2. Gemini free tier variants (different models = separate quotas)
  const geminiKey =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ??
    process.env.GEMINI_API_KEY;

  if (geminiKey) {
    const google = createGoogleGenerativeAI({ apiKey: geminiKey });
    const geminiModels =
      type === "strong"
        ? [
            "gemini-2.5-flash",
            "gemini-2.5-pro",
            "gemini-2.0-flash",
            "gemini-2.5-flash-lite-preview-06-17",
          ]
        : [
            "gemini-2.5-flash-lite-preview-06-17",
            "gemini-2.5-flash",
            "gemini-2.0-flash",
          ];

    for (const m of geminiModels) {
      chain.push(() => google(m));
    }
  }

  // 3. Final guaranteed fallback: Ollama (local, zero rate limits)
  const ollamaUrl = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434/v1";
  const ollamaModel = process.env.OLLAMA_MODEL ?? "qwen3:4b";
  const ollama = createOpenAICompatible({ name: "ollama", baseURL: ollamaUrl });
  chain.push(() => ollama.chatModel(ollamaModel));

  return chain;
}

function isRateLimitError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("429") || msg.includes("rate limit") || msg.includes("quota")) {
      return true;
    }
  }
  // Check for response status in structured error objects
  if (typeof error === "object" && error !== null) {
    const err = error as Record<string, unknown>;
    if (err.status === 429 || err.statusCode === 429) return true;
    if (typeof err.cause === "object" && err.cause !== null) {
      const cause = err.cause as Record<string, unknown>;
      if (cause.status === 429 || cause.statusCode === 429) return true;
    }
  }
  return false;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Resilient generateText with backoff + waterfall ───

interface ResilientGenerateOptions {
  system?: string;
  prompt?: string;
  messages?: Parameters<typeof generateText>[0]["messages"];
  output?: Parameters<typeof generateText>[0]["output"];
  type?: "normal" | "strong";
  maxRetriesPerModel?: number;
  /** Base delay in ms for exponential backoff (default: 2000) */
  baseDelay?: number;
  temperature?: number;
  maxTokens?: number;
}

export async function resilientGenerateText(options: ResilientGenerateOptions) {
  const {
    type = "normal",
    maxRetriesPerModel = 2,
    baseDelay = 2000,
    ...generateOptions
  } = options;

  const chain = getWaterfallChain(type);

  for (let i = 0; i < chain.length; i++) {
    const createModel = chain[i];
    const isLastInChain = i === chain.length - 1;

    for (let attempt = 0; attempt <= maxRetriesPerModel; attempt++) {
      try {
        const result = await generateText({
          model: createModel(),
          ...generateOptions,
        } as Parameters<typeof generateText>[0]);
        return result;
      } catch (error) {
        if (!isRateLimitError(error)) {
          console.warn(`[resilient-generate] Provider failed (not rate limit):`, error instanceof Error ? error.message : "Unknown error");
          if (isLastInChain) throw error;
          break; // Move to the next provider in the chain immediately
        }

        // If it's the last model in the chain (Ollama), throw the original error
        if (isLastInChain) {
          throw error;
        }

        // If we have retries left for this model, wait with exponential backoff
        if (attempt < maxRetriesPerModel) {
          const delay = baseDelay * Math.pow(2, attempt);
          console.warn(
            `[resilient-generate] 429 on model ${i}, attempt ${attempt + 1}/${maxRetriesPerModel + 1}. Retrying in ${delay}ms...`
          );
          await sleep(delay);
          continue;
        }

        // Out of retries for this model — move to next in chain
        console.warn(
          `[resilient-generate] Exhausted retries for model ${i}. Falling through to next provider...`
        );
        break;
      }
    }
  }

  // Should never reach here, but just in case
  throw new Error("[resilient-generate] All providers exhausted.");
}

// ─── Resilient streamText with backoff + waterfall ───

interface ResilientStreamOptions {
  system?: string;
  prompt?: string;
  messages?: Parameters<typeof streamText>[0]["messages"];
  type?: "normal" | "strong";
  maxRetriesPerModel?: number;
  baseDelay?: number;
}

export async function resilientStreamText(options: ResilientStreamOptions) {
  const {
    type = "normal",
    maxRetriesPerModel = 2,
    baseDelay = 2000,
    ...streamOptions
  } = options;

  const chain = getWaterfallChain(type);

  for (let i = 0; i < chain.length; i++) {
    const createModel = chain[i];
    const isLastInChain = i === chain.length - 1;

    for (let attempt = 0; attempt <= maxRetriesPerModel; attempt++) {
      try {
        const result = streamText({
          model: createModel(),
          ...streamOptions,
        } as Parameters<typeof streamText>[0]);
        return result;
      } catch (error) {
        if (!isRateLimitError(error)) {
          console.warn(`[resilient-stream] Provider failed (not rate limit):`, error instanceof Error ? error.message : "Unknown error");
          if (isLastInChain) throw error;
          break; // Move to the next provider
        }
        if (isLastInChain) {
          throw error;
        }
        if (attempt < maxRetriesPerModel) {
          const delay = baseDelay * Math.pow(2, attempt);
          console.warn(
            `[resilient-stream] 429 on model ${i}, attempt ${attempt + 1}. Retrying in ${delay}ms...`
          );
          await sleep(delay);
          continue;
        }
        console.warn(
          `[resilient-stream] Exhausted retries for model ${i}. Falling through...`
        );
        break;
      }
    }
  }

  throw new Error("[resilient-stream] All providers exhausted.");
}
