/**
 * Token-bucket rate limiter for LLM API providers.
 *
 * One singleton per provider:model combo, shared across all concurrent
 * pipeline jobs in the process. Integrated into generateTextWithFallback()
 * so job handlers don't need to change.
 */

// ─── Configuration ───────────────────────────────────────────

interface ModelRateLimitConfig {
  tokensPerMinute: number;
  requestsPerMinute: number;
  /** Fraction of the limit to actually use (0–1). Provides headroom. */
  safetyMargin: number;
}

/**
 * Built-in defaults keyed by "provider:model" or "provider:*" (provider-wide fallback).
 * Values match free-tier limits as of March 2026.
 */
const DEFAULT_CONFIGS: Record<string, ModelRateLimitConfig> = {
  // Groq free tier
  "groq:llama-3.3-70b-versatile": { tokensPerMinute: 12_000, requestsPerMinute: 30, safetyMargin: 0.8 },
  "groq:llama-3.1-8b-instant": { tokensPerMinute: 20_000, requestsPerMinute: 30, safetyMargin: 0.8 },
  "groq:*": { tokensPerMinute: 6_000, requestsPerMinute: 30, safetyMargin: 0.8 },

  // Cerebras free tier
  "cerebras:llama-3.3-70b": { tokensPerMinute: 60_000, requestsPerMinute: 30, safetyMargin: 0.9 },
  "cerebras:llama-3.1-8b-instant": { tokensPerMinute: 60_000, requestsPerMinute: 60, safetyMargin: 0.9 },
  "cerebras:*": { tokensPerMinute: 60_000, requestsPerMinute: 30, safetyMargin: 0.9 },

  // Local / self-hosted — effectively unlimited
  "ollama:*": { tokensPerMinute: 1_000_000, requestsPerMinute: 1_000, safetyMargin: 1.0 },
  "nim:*": { tokensPerMinute: 100_000, requestsPerMinute: 100, safetyMargin: 0.85 },
};

/** Absolute fallback when no config matches at all. */
const FALLBACK_CONFIG: ModelRateLimitConfig = {
  tokensPerMinute: 6_000,
  requestsPerMinute: 30,
  safetyMargin: 0.8,
};

/**
 * Resolve config for a provider:model pair.
 * Lookup chain: env overrides → exact match → provider wildcard → global fallback.
 */
function resolveConfig(provider: string, model: string): ModelRateLimitConfig {
  // 1. Check for env-var overrides (provider-wide or model-specific)
  const envTpm = readEnvLimit(provider, model, "TPM");
  const envRpm = readEnvLimit(provider, model, "RPM");

  if (envTpm !== null || envRpm !== null) {
    const base = DEFAULT_CONFIGS[`${provider}:${model}`]
      ?? DEFAULT_CONFIGS[`${provider}:*`]
      ?? FALLBACK_CONFIG;
    return {
      tokensPerMinute: envTpm ?? base.tokensPerMinute,
      requestsPerMinute: envRpm ?? base.requestsPerMinute,
      safetyMargin: base.safetyMargin,
    };
  }

  // 2. Exact match → provider wildcard → global fallback
  return DEFAULT_CONFIGS[`${provider}:${model}`]
    ?? DEFAULT_CONFIGS[`${provider}:*`]
    ?? FALLBACK_CONFIG;
}

/**
 * Read RATELIMIT_<PROVIDER>_<MODEL>_<SUFFIX> or RATELIMIT_<PROVIDER>_<SUFFIX> from env.
 * Model names are normalised: dots/dashes → underscores, uppercased.
 */
function readEnvLimit(provider: string, model: string, suffix: "TPM" | "RPM"): number | null {
  const p = provider.toUpperCase();
  const m = model.toUpperCase().replace(/[.\-]/g, "_");

  // Model-specific first, then provider-wide
  const modelKey = `RATELIMIT_${p}_${m}_${suffix}`;
  const providerKey = `RATELIMIT_${p}_${suffix}`;

  const val = process.env[modelKey] ?? process.env[providerKey];
  if (val === undefined) return null;
  const n = Number(val);
  return Number.isFinite(n) && n > 0 ? n : null;
}

// ─── Token estimation ────────────────────────────────────────

/** Estimate token count from raw text using a conservative char-based heuristic. */
export function estimateTokens(text: string): number {
  // ~3.5 chars/token is deliberately conservative (over-estimates).
  return Math.ceil(text.length / 3.5);
}

/** Extract estimatable text from AI SDK generateText params. */
export function estimateParamTokens(params: Record<string, unknown>): number {
  let text = "";
  if (typeof params.system === "string") text += params.system;
  if (typeof params.prompt === "string") text += params.prompt;
  if (Array.isArray(params.messages)) {
    for (const msg of params.messages) {
      const content = (msg as { content?: unknown }).content;
      if (typeof content === "string") text += content;
    }
  }
  // Minimum estimate of 100 tokens to account for overhead
  return Math.max(estimateTokens(text), 100);
}

// ─── Retry-after extraction ──────────────────────────────────

/** Extract retry-after seconds from a provider error. */
export function extractRetryAfter(err: unknown): number | null {
  if (typeof err !== "object" || err === null) return null;

  // Try response headers (some SDKs attach them)
  const headers = (err as { responseHeaders?: Headers }).responseHeaders
    ?? (err as { headers?: Headers }).headers;
  if (headers && typeof headers.get === "function") {
    const val = headers.get("retry-after");
    if (val) {
      const s = Number(val);
      if (Number.isFinite(s) && s > 0) return s;
    }
  }

  // Groq embeds wait time in error message: "try again in 6.215s"
  const msg = (err as { message?: string }).message ?? "";
  const match = msg.match(/try again in (\d+(?:\.\d+)?)s/i);
  if (match) return Math.ceil(Number(match[1]));

  return null;
}

// ─── RateLimiter class ───────────────────────────────────────

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export class RateLimiter {
  private tokenBudget: number;
  private requestBudget: number;
  private readonly maxTokens: number;
  private readonly maxRequests: number;
  private readonly refillTokensPerMs: number;
  private readonly refillRequestsPerMs: number;
  private lastRefill: number;
  private retryAfterUntil = 0;
  private readonly label: string;

  constructor(provider: string, model: string) {
    const config = resolveConfig(provider, model);
    this.maxTokens = Math.floor(config.tokensPerMinute * config.safetyMargin);
    this.maxRequests = Math.floor(config.requestsPerMinute * config.safetyMargin);
    this.tokenBudget = this.maxTokens;
    this.requestBudget = this.maxRequests;
    this.refillTokensPerMs = this.maxTokens / 60_000;
    this.refillRequestsPerMs = this.maxRequests / 60_000;
    this.lastRefill = Date.now();
    this.label = `${provider}:${model}`;

    console.log(
      `[rate-limiter] ${this.label}: initialised — ${this.maxTokens} TPM, ${this.maxRequests} RPM (${config.safetyMargin * 100}% of limit)`,
    );
  }

  /** Wait until budget is available, then deduct. */
  async acquire(estimatedTokens: number): Promise<void> {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      // Honour retry-after from a previous 429
      const retryWait = this.retryAfterUntil - Date.now();
      if (retryWait > 0) {
        console.log(`[rate-limiter] ${this.label}: retry-after active, waiting ${Math.ceil(retryWait)}ms`);
        await sleep(retryWait);
      }

      this.refill();

      // Check both budgets
      const tokenWait = estimatedTokens > this.tokenBudget
        ? (estimatedTokens - this.tokenBudget) / this.refillTokensPerMs
        : 0;
      const requestWait = this.requestBudget < 1
        ? (1 - this.requestBudget) / this.refillRequestsPerMs
        : 0;
      const waitMs = Math.max(tokenWait, requestWait);

      if (waitMs <= 0) {
        // Budget available — deduct and proceed
        this.tokenBudget -= estimatedTokens;
        this.requestBudget -= 1;
        console.log(
          `[rate-limiter] ${this.label}: acquired ~${estimatedTokens} tokens (budget: ${Math.round(this.tokenBudget)}/${this.maxTokens} TPM, ${Math.round(this.requestBudget)}/${this.maxRequests} RPM)`,
        );
        return;
      }

      // Add small jitter (50–200ms) to avoid thundering herd
      const jitter = 50 + Math.random() * 150;
      const totalWait = Math.ceil(waitMs + jitter);
      console.log(
        `[rate-limiter] ${this.label}: throttling ${totalWait}ms (need ~${estimatedTokens} tokens, have ${Math.round(this.tokenBudget)})`,
      );
      await sleep(totalWait);
    }
  }

  /** Record a retry-after header from a 429 response. */
  reportRetryAfter(seconds: number): void {
    const until = Date.now() + seconds * 1_000;
    // Only extend, never shorten
    if (until > this.retryAfterUntil) {
      this.retryAfterUntil = until;
      // Drain budgets to prevent other concurrent acquires from proceeding
      this.tokenBudget = 0;
      this.requestBudget = 0;
      console.log(`[rate-limiter] ${this.label}: retry-after set for ${seconds}s`);
    }
  }

  /** Correct budget after seeing actual usage from the AI SDK response. */
  reportActualUsage(actualTokens: number, estimatedTokens: number): void {
    const diff = estimatedTokens - actualTokens;
    if (diff > 0) {
      // We over-estimated — return unused budget
      this.tokenBudget = Math.min(this.tokenBudget + diff, this.maxTokens);
    } else if (diff < 0) {
      // Under-estimated — deduct extra
      this.tokenBudget = Math.max(this.tokenBudget + diff, 0);
    }
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    if (elapsed <= 0) return;

    this.tokenBudget = Math.min(
      this.tokenBudget + elapsed * this.refillTokensPerMs,
      this.maxTokens,
    );
    this.requestBudget = Math.min(
      this.requestBudget + elapsed * this.refillRequestsPerMs,
      this.maxRequests,
    );
    this.lastRefill = now;
  }
}

// ─── Singleton registry ──────────────────────────────────────

const limiters = new Map<string, RateLimiter>();

/** Get (or create) the singleton rate limiter for a provider:model pair. */
export function getRateLimiter(provider: string, model: string): RateLimiter {
  const key = `${provider}:${model}`;
  let limiter = limiters.get(key);
  if (!limiter) {
    limiter = new RateLimiter(provider, model);
    limiters.set(key, limiter);
  }
  return limiter;
}
