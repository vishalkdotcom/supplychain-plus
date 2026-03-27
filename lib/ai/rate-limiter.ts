/**
 * Token-bucket rate limiter for LLM API providers.
 *
 * One singleton per provider:model combo, shared across all concurrent
 * pipeline jobs in the process. Integrated into generateTextWithFallback()
 * so job handlers don't need to change.
 *
 * Tracks four dimensions: TPM, RPM, TPD, RPD — matching the limits
 * that Groq, Cerebras, and similar providers enforce.
 *
 * Daily usage (TPD/RPD) is persisted to PostgreSQL so it survives
 * server restarts.
 */

import { db } from "@/lib/db/drizzle";
import { rateLimitDailyUsage } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

// ─── Configuration ───────────────────────────────────────────

interface ModelRateLimitConfig {
  tokensPerMinute: number;
  requestsPerMinute: number;
  tokensPerDay: number;
  requestsPerDay: number;
  /** Fraction of the limit to actually use (0–1). Provides headroom. */
  safetyMargin: number;
}

/**
 * Built-in defaults keyed by "provider:model" or "provider:*" (provider-wide fallback).
 * Values match free-tier limits as of March 2026.
 * Sources: https://console.groq.com/docs/rate-limits
 *          https://inference-docs.cerebras.ai/support/rate-limits
 */
const DEFAULT_CONFIGS: Record<string, ModelRateLimitConfig> = {
  // ── Groq free tier ──
  "groq:meta-llama/llama-4-scout-17b-16e-instruct": {
    tokensPerMinute: 30_000, requestsPerMinute: 30,
    tokensPerDay: 500_000, requestsPerDay: 1_000,
    safetyMargin: 0.8,
  },
  "groq:qwen/qwen3-32b": {
    tokensPerMinute: 6_000, requestsPerMinute: 60,
    tokensPerDay: 500_000, requestsPerDay: 1_000,
    safetyMargin: 0.8,
  },
  "groq:moonshotai/kimi-k2-instruct": {
    tokensPerMinute: 10_000, requestsPerMinute: 60,
    tokensPerDay: 300_000, requestsPerDay: 1_000,
    safetyMargin: 0.8,
  },
  "groq:openai/gpt-oss-120b": {
    tokensPerMinute: 8_000, requestsPerMinute: 30,
    tokensPerDay: 200_000, requestsPerDay: 1_000,
    safetyMargin: 0.8,
  },
  "groq:openai/gpt-oss-20b": {
    tokensPerMinute: 8_000, requestsPerMinute: 30,
    tokensPerDay: 200_000, requestsPerDay: 1_000,
    safetyMargin: 0.8,
  },
  "groq:llama-3.3-70b-versatile": {
    tokensPerMinute: 12_000, requestsPerMinute: 30,
    tokensPerDay: 100_000, requestsPerDay: 1_000,
    safetyMargin: 0.8,
  },
  "groq:llama-3.1-8b-instant": {
    tokensPerMinute: 6_000, requestsPerMinute: 30,
    tokensPerDay: 500_000, requestsPerDay: 14_400,
    safetyMargin: 0.8,
  },
  "groq:allam-2-7b": {
    tokensPerMinute: 6_000, requestsPerMinute: 30,
    tokensPerDay: 500_000, requestsPerDay: 7_000,
    safetyMargin: 0.8,
  },
  "groq:*": {
    tokensPerMinute: 6_000, requestsPerMinute: 30,
    tokensPerDay: 100_000, requestsPerDay: 1_000,
    safetyMargin: 0.8,
  },

  // ── Cerebras free tier ──
  "cerebras:qwen-3-235b-a22b-instruct-2507": {
    tokensPerMinute: 60_000, requestsPerMinute: 30,
    tokensPerDay: 1_000_000, requestsPerDay: 14_400,
    safetyMargin: 0.9,
  },
  "cerebras:gpt-oss-120b": {
    tokensPerMinute: 64_000, requestsPerMinute: 30,
    tokensPerDay: 1_000_000, requestsPerDay: 14_400,
    safetyMargin: 0.9,
  },
  "cerebras:llama3.1-8b": {
    tokensPerMinute: 60_000, requestsPerMinute: 30,
    tokensPerDay: 1_000_000, requestsPerDay: 14_400,
    safetyMargin: 0.9,
  },
  "cerebras:*": {
    tokensPerMinute: 60_000, requestsPerMinute: 30,
    tokensPerDay: 1_000_000, requestsPerDay: 14_400,
    safetyMargin: 0.9,
  },

  // ── Local / self-hosted — effectively unlimited ──
  "ollama:*": {
    tokensPerMinute: Infinity, requestsPerMinute: Infinity,
    tokensPerDay: Infinity, requestsPerDay: Infinity,
    safetyMargin: 1.0,
  },
  "nim:*": {
    tokensPerMinute: 100_000, requestsPerMinute: 100,
    tokensPerDay: 10_000_000, requestsPerDay: 50_000,
    safetyMargin: 0.85,
  },
};

/** Absolute fallback when no config matches at all. */
const FALLBACK_CONFIG: ModelRateLimitConfig = {
  tokensPerMinute: 6_000,
  requestsPerMinute: 30,
  tokensPerDay: 100_000,
  requestsPerDay: 1_000,
  safetyMargin: 0.8,
};

type EnvSuffix = "TPM" | "RPM" | "TPD" | "RPD";

/**
 * Resolve config for a provider:model pair.
 * Lookup chain: env overrides → exact match → provider wildcard → global fallback.
 */
function resolveConfig(provider: string, model: string): ModelRateLimitConfig {
  const base = DEFAULT_CONFIGS[`${provider}:${model}`]
    ?? DEFAULT_CONFIGS[`${provider}:*`]
    ?? FALLBACK_CONFIG;

  const envTpm = readEnvLimit(provider, model, "TPM");
  const envRpm = readEnvLimit(provider, model, "RPM");
  const envTpd = readEnvLimit(provider, model, "TPD");
  const envRpd = readEnvLimit(provider, model, "RPD");

  if (envTpm !== null || envRpm !== null || envTpd !== null || envRpd !== null) {
    return {
      tokensPerMinute: envTpm ?? base.tokensPerMinute,
      requestsPerMinute: envRpm ?? base.requestsPerMinute,
      tokensPerDay: envTpd ?? base.tokensPerDay,
      requestsPerDay: envRpd ?? base.requestsPerDay,
      safetyMargin: base.safetyMargin,
    };
  }

  return base;
}

/**
 * Read RATELIMIT_<PROVIDER>_<MODEL>_<SUFFIX> or RATELIMIT_<PROVIDER>_<SUFFIX> from env.
 * Model names are normalised: dots/dashes/slashes → underscores, uppercased.
 */
function readEnvLimit(provider: string, model: string, suffix: EnvSuffix): number | null {
  const p = provider.toUpperCase();
  const m = model.toUpperCase().replace(/[.\-/]/g, "_");

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
  return Math.ceil(text.length / 3.5);
}

/** Estimated output tokens for pipeline responses (typically 150–330 tokens). */
const OUTPUT_TOKEN_ESTIMATE = 300;

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
  // Include estimated output tokens — providers count total (input + output)
  return Math.max(estimateTokens(text), 100) + OUTPUT_TOKEN_ESTIMATE;
}

// ─── Retry-after extraction ──────────────────────────────────

/** Extract retry-after seconds from a provider error. */
export function extractRetryAfter(err: unknown): number | null {
  if (typeof err !== "object" || err === null) return null;

  // AI SDK wraps errors in RetryError — unwrap to get the original API error
  const innerErr = (err as { lastError?: unknown }).lastError ?? err;

  // Try response headers (on the inner error where they actually live)
  const headers = (innerErr as { responseHeaders?: Headers }).responseHeaders
    ?? (innerErr as { headers?: Headers }).headers;
  if (headers && typeof headers.get === "function") {
    const val = headers.get("retry-after");
    if (val) {
      const s = Number(val);
      if (Number.isFinite(s) && s > 0) return s;
    }
  }

  // Groq embeds wait time in error message: "try again in 4m46.848s" or "try again in 6.215s"
  // Check both outer message (RetryError propagates it) and inner
  const msg = (err as { message?: string }).message
    ?? (innerErr as { message?: string }).message
    ?? "";
  const minSecMatch = msg.match(/try again in (\d+)m([\d.]+)s/i);
  if (minSecMatch) return Math.ceil(Number(minSecMatch[1]) * 60 + Number(minSecMatch[2]));
  const secMatch = msg.match(/try again in ([\d.]+)s/i);
  if (secMatch) return Math.ceil(Number(secMatch[1]));

  return null;
}

// ─── Bucket helper ───────────────────────────────────────────

class Bucket {
  budget: number;
  readonly max: number;
  readonly refillPerMs: number;
  lastRefill: number;

  constructor(capacity: number, refillPeriodMs: number) {
    this.max = capacity;
    this.budget = capacity;
    this.refillPerMs = Number.isFinite(capacity) ? capacity / refillPeriodMs : Infinity;
    this.lastRefill = Date.now();
  }

  refill(): void {
    if (!Number.isFinite(this.max)) return;
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    if (elapsed <= 0) return;
    this.budget = Math.min(this.budget + elapsed * this.refillPerMs, this.max);
    this.lastRefill = now;
  }

  waitMs(needed: number): number {
    if (!Number.isFinite(this.max)) return 0;
    if (needed <= this.budget) return 0;
    return (needed - this.budget) / this.refillPerMs;
  }

  deduct(amount: number): void {
    if (Number.isFinite(this.budget)) this.budget -= amount;
  }

  drain(): void {
    this.budget = 0;
  }

  correct(estimated: number, actual: number): void {
    if (!Number.isFinite(this.max)) return;
    const diff = estimated - actual;
    if (diff > 0) {
      this.budget = Math.min(this.budget + diff, this.max);
    } else if (diff < 0) {
      this.budget = Math.max(this.budget + diff, 0);
    }
  }
}

// ─── DB persistence helpers ──────────────────────────────────

function todayDateStr(): string {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

async function loadDailyUsage(
  provider: string,
  modelId: string,
): Promise<{ tokensUsed: number; requestsUsed: number }> {
  try {
    const rows = await db
      .select({
        tokensUsed: rateLimitDailyUsage.tokensUsed,
        requestsUsed: rateLimitDailyUsage.requestsUsed,
      })
      .from(rateLimitDailyUsage)
      .where(
        and(
          eq(rateLimitDailyUsage.date, todayDateStr()),
          eq(rateLimitDailyUsage.provider, provider),
          eq(rateLimitDailyUsage.modelId, modelId),
        ),
      )
      .limit(1);
    return rows[0] ?? { tokensUsed: 0, requestsUsed: 0 };
  } catch (err) {
    console.warn(`[rate-limiter] DB read failed for ${provider}:${modelId}, starting fresh`, err);
    return { tokensUsed: 0, requestsUsed: 0 };
  }
}

async function incrementDailyUsage(
  provider: string,
  modelId: string,
  tokensDelta: number,
): Promise<void> {
  try {
    await db
      .insert(rateLimitDailyUsage)
      .values({
        date: todayDateStr(),
        provider,
        modelId,
        tokensUsed: tokensDelta,
        requestsUsed: 1,
      })
      .onConflictDoUpdate({
        target: [
          rateLimitDailyUsage.date,
          rateLimitDailyUsage.provider,
          rateLimitDailyUsage.modelId,
        ],
        set: {
          tokensUsed: sql`${rateLimitDailyUsage.tokensUsed} + ${tokensDelta}`,
          requestsUsed: sql`${rateLimitDailyUsage.requestsUsed} + 1`,
          updatedAt: sql`now()`,
        },
      });
  } catch (err) {
    // Non-fatal — rate limiting still works in-memory
    console.warn(`[rate-limiter] DB write failed for ${provider}:${modelId}`, err);
  }
}

// ─── RateLimiter class ───────────────────────────────────────

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const MS_PER_MINUTE = 60_000;
const MS_PER_DAY = 86_400_000;

export class RateLimiter {
  private readonly tpm: Bucket;
  private readonly rpm: Bucket;
  private readonly tpd: Bucket;
  private readonly rpd: Bucket;
  private retryAfterUntil = 0;
  private readonly label: string;
  private readonly provider: string;
  private readonly modelId: string;
  private dbInitialized = false;
  private dbInitPromise: Promise<void> | null = null;

  constructor(provider: string, model: string) {
    const c = resolveConfig(provider, model);
    const margin = c.safetyMargin;
    this.tpm = new Bucket(Math.floor(c.tokensPerMinute * margin), MS_PER_MINUTE);
    this.rpm = new Bucket(Math.floor(c.requestsPerMinute * margin), MS_PER_MINUTE);
    this.tpd = new Bucket(Math.floor(c.tokensPerDay * margin), MS_PER_DAY);
    this.rpd = new Bucket(Math.floor(c.requestsPerDay * margin), MS_PER_DAY);
    this.label = `${provider}:${model}`;
    this.provider = provider;
    this.modelId = model;

    console.log(
      `[rate-limiter] ${this.label}: initialised — ` +
      `${this.tpm.max} TPM, ${this.rpm.max} RPM, ` +
      `${this.tpd.max} TPD, ${this.rpd.max} RPD ` +
      `(${margin * 100}% of limit)`,
    );
  }

  /** Load today's usage from DB (lazy, once per limiter lifetime). */
  private async ensureDbInit(): Promise<void> {
    if (this.dbInitialized) return;
    if (this.dbInitPromise) return this.dbInitPromise;

    this.dbInitPromise = (async () => {
      const usage = await loadDailyUsage(this.provider, this.modelId);
      // Reduce daily buckets by already-used amounts
      if (usage.tokensUsed > 0) {
        this.tpd.budget = Math.max(this.tpd.budget - usage.tokensUsed, 0);
      }
      if (usage.requestsUsed > 0) {
        this.rpd.budget = Math.max(this.rpd.budget - usage.requestsUsed, 0);
      }
      this.dbInitialized = true;
      console.log(
        `[rate-limiter] ${this.label}: loaded DB state — ` +
        `${usage.tokensUsed} tokens, ${usage.requestsUsed} requests used today ` +
        `(TPD remaining: ${Math.round(this.tpd.budget)}/${this.tpd.max})`,
      );
    })();
    return this.dbInitPromise;
  }

  /** Check if daily budget is exhausted without waiting. Used for cascade skip. */
  async isDailyExhausted(estimatedTokens: number): Promise<boolean> {
    await this.ensureDbInit();
    this.tpd.refill();
    this.rpd.refill();
    return (
      (Number.isFinite(this.tpd.max) && this.tpd.budget < estimatedTokens) ||
      (Number.isFinite(this.rpd.max) && this.rpd.budget < 1)
    );
  }

  /**
   * Peek at how long acquire() would wait, without deducting tokens.
   * Note: calls refill() which advances bucket clocks (not a pure read),
   * but this is benign — refill would happen on the next acquire() anyway.
   * Includes active retry-after timers from 429 responses.
   */
  async estimateWaitMs(estimatedTokens: number): Promise<number> {
    await this.ensureDbInit();
    const retryWait = Math.max(this.retryAfterUntil - Date.now(), 0);
    this.tpm.refill();
    this.rpm.refill();
    this.tpd.refill();
    this.rpd.refill();
    return Math.max(
      retryWait,
      this.tpm.waitMs(estimatedTokens),
      this.rpm.waitMs(1),
      this.tpd.waitMs(estimatedTokens),
      this.rpd.waitMs(1),
    );
  }

  /** Wait until budget is available across all 4 dimensions, then deduct. */
  async acquire(estimatedTokens: number): Promise<void> {
    await this.ensureDbInit();

    while (true) {
      const retryWait = this.retryAfterUntil - Date.now();
      if (retryWait > 0) {
        console.log(`[rate-limiter] ${this.label}: retry-after active, waiting ${Math.ceil(retryWait / 1000)}s`);
        await sleep(retryWait);
      }

      this.tpm.refill();
      this.rpm.refill();
      this.tpd.refill();
      this.rpd.refill();

      const waitMs = Math.max(
        this.tpm.waitMs(estimatedTokens),
        this.rpm.waitMs(1),
        this.tpd.waitMs(estimatedTokens),
        this.rpd.waitMs(1),
      );

      if (waitMs <= 0) {
        this.tpm.deduct(estimatedTokens);
        this.rpm.deduct(1);
        this.tpd.deduct(estimatedTokens);
        this.rpd.deduct(1);
        console.log(
          `[rate-limiter] ${this.label}: acquired ~${estimatedTokens} tokens ` +
          `(TPM: ${Math.round(this.tpm.budget)}/${this.tpm.max}, ` +
          `RPM: ${Math.round(this.rpm.budget)}/${this.rpm.max}, ` +
          `TPD: ${Math.round(this.tpd.budget)}/${this.tpd.max}, ` +
          `RPD: ${Math.round(this.rpd.budget)}/${this.rpd.max})`,
        );
        return;
      }

      const bottleneck =
        waitMs === this.tpd.waitMs(estimatedTokens) ? "TPD" :
        waitMs === this.rpd.waitMs(1) ? "RPD" :
        waitMs === this.tpm.waitMs(estimatedTokens) ? "TPM" : "RPM";

      const jitter = 50 + Math.random() * 150;
      const totalWait = Math.ceil(waitMs + jitter);
      const waitDisplay = totalWait > 60_000
        ? `${(totalWait / 60_000).toFixed(1)}min`
        : `${(totalWait / 1000).toFixed(1)}s`;
      console.log(
        `[rate-limiter] ${this.label}: throttling ${waitDisplay} (bottleneck: ${bottleneck}, ` +
        `need ~${estimatedTokens} tokens)`,
      );
      await sleep(totalWait);
    }
  }

  /** Record a retry-after header from a 429 response. */
  reportRetryAfter(seconds: number): void {
    const until = Date.now() + seconds * 1_000;
    if (until > this.retryAfterUntil) {
      this.retryAfterUntil = until;
      this.tpm.drain();
      this.rpm.drain();
      console.log(`[rate-limiter] ${this.label}: retry-after set for ${seconds}s`);
    }
  }

  /** Correct budgets and persist actual usage to DB. */
  reportActualUsage(actualTokens: number, estimatedTokens: number): void {
    this.tpm.correct(estimatedTokens, actualTokens);
    this.tpd.correct(estimatedTokens, actualTokens);
    // Persist to DB (fire-and-forget — non-blocking)
    incrementDailyUsage(this.provider, this.modelId, actualTokens);
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
