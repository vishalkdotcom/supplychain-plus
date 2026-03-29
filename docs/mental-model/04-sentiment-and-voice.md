# Sentiment & Voice Analytics — Understanding What Workers Actually Say

## The Problem

Survey responses from factory workers look like this:

```
"overtime too much no rest"
"supervisor ok but salary come late"
"everything fine"
"afraid to speak"
"ot nhiều quá không nghỉ được"  (Vietnamese: "too much overtime, can't rest")
```

You need to extract: **What topics are workers talking about? How do they feel? Is it getting better or worse?**

## Why Traditional NLP Fails Here

### Keyword Matching

You might try: count mentions of "overtime," "wages," "safety." But:
- "afraid to speak" contains none of these keywords, yet it's deeply negative.
- "supervisor ok but salary come late" needs to split into two sentiments — positive (supervisor) and negative (salary).
- The Vietnamese text has zero English keywords.

### Pre-trained Sentiment Models (VADER, TextBlob)

These assign positive/negative scores based on word lists. They fail because:
- They're English-only (or need separate models per language).
- They can't handle implicit meaning ("afraid to speak" has no negative words by their dictionaries).
- They operate per-sentence, missing multi-topic responses.

### Why LLMs Work

Large language models handle all these issues because they:
1. **Parse multi-topic sentences.** "Supervisor ok BUT salary late" → two themes with different sentiments.
2. **Understand implicit meaning.** "Afraid to speak" → negative sentiment about voice/safety.
3. **Work multilingually.** Vietnamese, Bengali, Khmer, Mandarin — all in the same prompt, no translation step needed.
4. **Return structured output.** You can ask for JSON with exact fields, not free-form text.

## How Survey Analysis Works (`analyze-surveys` job)

### Step 1: Fetch Responses

From `wovo_new` (PostgreSQL), join `survey_mdlsurvey` → `survey_mdlsurveyquestionresponses` to get text responses per survey.

### Step 2: Batch to LLM

Up to 50 responses per LLM call. The prompt:

```
Analyze these factory worker survey responses and provide a structured analysis.
/no_think
Return ONLY valid JSON: {sentimentPositive, sentimentNegative, sentimentNeutral,
riskScore, themes: [{name, sentiment, mentionCount}], insight}
```

**The `/no_think` directive:** Some models (Qwen, DeepSeek) have chain-of-thought reasoning that generates "thinking" text before the answer. `/no_think` suppresses this, which:
- Saves tokens (and therefore rate limit budget)
- Eliminates non-JSON output that would break parsing
- For structured extraction, thinking doesn't improve quality — the answer is already constrained by the schema

### Step 3: Validate with Zod

The LLM response is parsed and validated against a Zod schema:

```typescript
const surveyAnalysisSchema = z.object({
  sentimentPositive: z.number(),
  sentimentNegative: z.number(),
  sentimentNeutral: z.number(),
  riskScore: z.number().min(0).max(100).transform((v) => Math.round(v)),
  themes: z.array(z.object({
    name: z.string(),
    sentiment: z.enum(["positive", "negative", "neutral"]),
    mentionCount: z.number()
  })),
  insight: z.string()
});
```

Note: only `riskScore` has `.min(0).max(100)` constraints with rounding — the sentiment fields are unconstrained numbers because the LLM prompt already instructs 0-100 range. The prompt-level constraint is sufficient; adding Zod constraints would cause valid-but-slightly-out-of-range responses to fail validation unnecessarily.

If the LLM returns invalid JSON or missing fields, the validation catches it and the survey is skipped (logged as a warning, not a failure). This makes the job robust against LLM quirks.

### Step 4: 24-Hour Checkpoint

Surveys that were analyzed less than 24 hours ago are skipped (unless `force=true`). This prevents redundant API calls when the job runs multiple times a day. The `analyzedAt` timestamp in `surveyAnalysis` tracks this.

## How Voice Trend Analytics Works (`worker-voice-analytics` job)

Survey analysis gives you a snapshot: "this survey has 50% negative sentiment about overtime." Voice analytics gives you **trends over time**.

### The Batching Strategy

Responses are partitioned using a SQL window function:

```sql
ROW_NUMBER() OVER (
  PARTITION BY client_key, DATE_TRUNC('month', created_date)
  ORDER BY created_date DESC
) as rn
WHERE rn <= 50
```

This takes the **50 most recent responses per supplier per month**. Why?
- LLM context windows have size limits. 2000 responses won't fit in one call.
- 50 responses is a representative sample. More doesn't significantly change the topic distribution.
- Partitioning by month enables month-over-month comparison.

### Topic Extraction

The LLM extracts topics from each batch:

```json
{
  "topics": [
    {"name": "Overtime", "mentions": 12, "sentiment": "negative"},
    {"name": "Food Quality", "mentions": 5, "sentiment": "neutral"},
    {"name": "Supervisor Relations", "mentions": 8, "sentiment": "positive"}
  ]
}
```

Topics from multiple batches for the same supplier-month are merged: same-name topics have their mention counts summed and sentiments reconciled (majority wins, ties = "mixed").

### Implicit Positive Injection

When the LLM analyzes complaint-oriented surveys, it naturally focuses on problems. If >80% of extracted topics are negative, the system injects implicit positive topics at the median mention count:

- Employment Stability
- Peer Support
- Skills Development
- Factory Operations
- Worker Engagement

**Why add topics that weren't mentioned?** Because complaint surveys have a structural bias: they're designed to surface problems, so the absence of a topic doesn't mean it's negative. Workers who show up daily, collaborate with colleagues, and develop skills are experiencing real positives that complaint surveys don't capture.

Without this correction, every factory's voice trend would look uniformly terrible, destroying the signal-to-noise ratio. You need to know which factories are *worse than average*, and that requires the average not to be 100% negative.

### Sentiment Shift

Month-over-month sentiment is computed as:

```
sentimentShift = (positiveTopicCount - negativeTopicCount) / totalTopicCount * 100
```

A shift of -15 means "sentiment got significantly more negative this month." This delta, not the absolute score, is what surfaces in the intelligence briefing.

### Global vs. Per-Supplier Trends

The job computes trends at two levels:
- **Per-supplier:** How is Factory A's sentiment changing?
- **Global** (`supplierId = null`): How is sentiment changing across ALL factories?

Global trends reuse the per-supplier topic extractions — no additional LLM calls needed. The topics are aggregated across all suppliers for each month.

## Temporal Pattern Detection (`surveyTemporalPatterns` table)

Separate from voice trends, the `analyze-surveys` job tracks **theme persistence across surveys**:

- Theme "Overtime" appeared in 3 surveys in January, 5 in February, 8 in March → **rising trend**
- Theme "Safety" appeared in 10 surveys in January, 4 in February, 2 in March → **falling trend**

The trend detection is simple: compare recent months to older months. If recent > older, it's rising. This is intentionally not a statistical test because:
- Data is sparse (some suppliers run surveys quarterly)
- Sample sizes are small (5-20 surveys per month)
- A simple comparison is honest about the data quality — it doesn't pretend statistical significance exists when it doesn't

### Auto-Evidence

When a supplier's sentiment improves (negative count drops >15% month-over-month) and that supplier has an active remediation plan, evidence of type `survey_improvement` is automatically attached to the plan. This is part of the "Evidence" phase of the Detect→Act→Evidence loop.
