# Model Cascade & Rate Limiting — How AI Calls Survive the Real World

## The Problem

WOVO+ background jobs need LLM calls — for sentiment analysis, cluster labeling, anomaly interpretation, forecast reasoning. Each job might need 10-50 LLM calls.

If you use one provider and hit its rate limit on call #5, the job fails. You've wasted the work from calls 1-4.

If you use one expensive provider (OpenAI GPT-4), costs scale with data volume. For a system that runs daily on hundreds of surveys, this isn't sustainable.

## The Cascade: 11 Models, Quality-First Order

Instead of one model, configure a prioritized list:

```
1. Cerebras qwen-3-235b       ← Best quality, free tier
2. Groq gpt-oss-120b          ← Very good, free tier
3. Groq llama-3.3-70b         ← Good, free tier
4. Groq llama-4-scout-17b     ← Decent, free tier
5. Groq qwen3-32b             ← Decent, free tier
...8 more models...
11. Ollama local               ← Always available, smallest
```

The cascade tries the best model first. If that fails, it tries the next. This continues until one succeeds or all are exhausted.

### Smart Fallthrough Rules

Not all failures are equal:

| HTTP Status | Meaning | Action |
|-------------|---------|--------|
| **429** | Rate limited | Try next model. This one is temporarily exhausted. |
| **5xx** | Server error | Try next model. Transient issue. |
| **Network error** | Can't connect | Try next model. Provider might be down. |
| **400** | Bad request | **Skip permanently.** Your request is malformed — next model won't fix that. |
| **401/403** | Auth failed | **Skip permanently.** Wrong API key won't self-correct. |
| **404** | Model not found | **Skip permanently.** Model doesn't exist on this provider. |
| **Slow (>5s)** | Overloaded | Try next model. Configurable via `JOB_CASCADE_THROTTLE_MS`. |

The distinction between "retryable" (429, 5xx) and "permanent" (400, 401, 403, 404) prevents wasting time on broken configurations.

### Configuration

```
JOB_AI_CASCADE=cerebras:qwen-3-235b-a22b-instruct,groq:llama-3.3-70b-versatile,...
JOB_CASCADE_THROTTLE_MS=5000
```

Comma-separated `provider:model` pairs. The order is the priority. Change it to prefer different models.

## The Rate Limiter — 4 Dimensions

Each LLM provider has rate limits, but they're not all the same dimension:

| Dimension | What It Limits | Example |
|-----------|---------------|---------|
| **TPM** (tokens/minute) | Short burst volume | Groq: 6,000-30,000 depending on model |
| **RPM** (requests/minute) | Request frequency | Some APIs: 30 requests/min regardless of tokens |
| **TPD** (tokens/day) | Daily total budget | Cerebras free tier: ~1M tokens/day |
| **RPD** (requests/day) | Daily request count | Some APIs: 1,000 requests/day |

The rate limiter tracks **all four dimensions per model**. Before making a call, it checks: "Will this request exceed any of the four limits?"

### Pre-Flight Check: estimateWaitMs()

Before the cascade tries a model, it asks: "How long would I have to wait to use this model?"

```typescript
const waitMs = limiter.estimateWaitMs(estimatedTokens);
if (waitMs > THROTTLE_THRESHOLD_MS) {
  // Skip to next model — this one would make us wait too long
}
```

This avoids the situation where the cascade "picks" a model, then blocks for 4 minutes waiting for its rate limit to refill. Instead, it checks capacity upfront and falls through immediately if the wait is too long.

### Daily Budget Exhaustion

Some free tiers have daily caps. Once hit, the model is dead until midnight:

```typescript
if (limiter.isDailyExhausted()) {
  // Don't even try — this model's daily budget is gone
}
```

### Why Safety Margins?

Configured limits use 0.8-0.9x of actual limits:

```
Groq actual limit: 30,000 TPM
WOVO+ configured: 30,000 * 0.8 = 24,000 TPM
```

Why not use the full limit? Because:
- Token estimation is rough (`text.length / 3.5`) — it can be off by 20%
- Other processes might use the same API key
- Providers sometimes enforce limits slightly differently than documented

The safety margin absorbs estimation error and prevents hard-hitting the limit.

### Persistence to PostgreSQL

Daily usage (tokens used, requests made) is persisted to the `rateLimitDailyUsage` table:

```typescript
// After each request:
await limiter.reportUsage(actualTokensUsed);

// This writes to:
// rateLimitDailyUsage (date, provider, modelId, tokensUsed, requestsUsed)
```

**Why persist?** If the server restarts mid-day, in-memory counters reset to zero. The server thinks it has a full daily budget. But the provider remembers the real usage — so the next request gets a 429.

By persisting to PostgreSQL, the rate limiter reloads today's usage on startup and knows how much budget remains.

### Retry-After Parsing

When Groq returns a 429, it often includes:

```
Rate limit exceeded. Try again in 4m46.229s
```

The rate limiter parses this message to extract the exact wait time (`286229ms`). This is more accurate than guessing. The wait time is used to:
1. Set the per-minute bucket's refill timer
2. Inform the cascade's pre-flight check for this model

## Token Estimation

Before checking rate limits, you need to estimate how many tokens a request will use. WOVO+ uses:

```typescript
const inputTokens = Math.ceil(text.length / 3.5);
const outputTokens = 300; // conservative estimate for structured outputs
```

**Why 3.5?** Average English text tokenizes to roughly 1 token per 3.5-4 characters. This varies by language and vocabulary, but 3.5 is a reasonable middle ground.

**Why 300 output tokens?** Most WOVO+ LLM calls request structured JSON (sentiment scores, cluster labels, anomaly interpretations). These outputs are typically 100-250 tokens. 300 is a conservative overestimate that leaves headroom.

## Interactive Chat vs. Background Jobs

The cascade is for background jobs. Interactive chat uses a different setup:

| Feature | Background Jobs | Interactive Chat |
|---------|----------------|-----------------|
| Provider selection | Cascade (11 models, auto-fallthrough) | Single provider via `AI_PROVIDER` env var |
| Model quality | Best available at the moment | `model` (fast) or `strongModel` (powerful) |
| Rate limit handling | Automatic fallthrough | Request-level override via headers |
| Streaming | No (batch processing) | Yes (token-by-token via Vercel AI SDK) |

Interactive chat supports runtime overrides: headers `x-ai-provider`, `x-ai-api-key`, `x-ai-model` let you switch providers per request. This is useful for testing different models.

## The Thinking Middleware

Some models (NIM DeepSeek, Kimi) produce `<think>...</think>` blocks with chain-of-thought reasoning before the actual answer. The provider layer includes middleware that:

1. Detects `<think>` blocks in the response
2. Extracts them into a separate `reasoning` field
3. Returns the clean answer text without the thinking

This keeps downstream code simple — it always gets the final answer, never the internal reasoning.
