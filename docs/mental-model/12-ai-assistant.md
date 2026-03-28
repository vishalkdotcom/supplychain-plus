# AI Assistant — 15 Tools, Not Magic

## The Problem

A compliance officer wants to ask: "Which suppliers in Vietnam have rising risk?" They don't want to write SQL or navigate 4 different dashboards. They want to type a question and get an answer.

But a generic LLM would hallucinate. It doesn't know your suppliers, your risk scores, or your data. It needs **structured access** to the real data.

## How It Actually Works

The AI assistant at `/ai` uses Vercel AI SDK's `streamText` with **tool calling** — a pattern where the LLM can invoke typed functions to access real data.

### The Flow

```
User: "Which suppliers in Vietnam have rising risk?"
  │
  ├─ LLM classifies intent → forecasts + region filter
  │
  ├─ LLM calls tool: queryForecasts({trendDirection: "rising"})
  │   └─ Tool executes: SQL query against wovo_ai.supplierRiskForecast
  │   └─ Returns: [{supplierId, supplierName, predictedScore, confidence, trend}]
  │
  ├─ LLM filters results for Vietnam (from its understanding of the question)
  │
  └─ LLM formats response: "3 suppliers in Vietnam show rising risk trends..."
     with a data card (chart or table) attached
```

The LLM **never accesses databases directly.** It calls tools that execute predefined queries with validated parameters. This prevents SQL injection, ensures consistent data access, and makes the system auditable.

## The 15 Tools

### Query Tools (13) — Read Data

| Tool | What It Queries | Source DB |
|------|----------------|-----------|
| `querySupplierRisk` | Risk scores with breakdown | wovo_ai |
| `queryCases` | Grievance cases | SQL Server |
| `querySurveys` | Surveys with sentiment analysis | wovo_new + wovo_ai |
| `queryTrainingCompletion` | Course completion rates | MySQL |
| `getAlerts` | Active notifications | wovo_ai |
| `queryPlaybook` | Best-practice resolution patterns | wovo_ai cache |
| `queryClusters` | Systemic case patterns | wovo_ai |
| `queryVoiceTrends` | Worker sentiment over time | wovo_ai |
| `queryAnomalies` | Payslip violations | wovo_ai |
| `queryForecasts` | 60-day risk predictions | wovo_ai |
| `queryMonitoringSignals` | Silence, decay, contagion | wovo_ai |
| `queryRemediations` | Remediation plan status | wovo_ai |
| `queryRiskHistory` | Risk score trends | wovo_ai |

### Action Tools (2) — Write Data

| Tool | What It Does |
|------|-------------|
| `markAlertRead` | Mark an alert as read |
| `triggerRiskRecalculation` | Enqueue the risk calculation job |

### Tool Anatomy

Each tool has three parts:

**1. Input Schema (Zod):** What the LLM can pass in.
```typescript
inputSchema: z.object({
  supplierId: z.string().optional(),
  trendDirection: z.enum(["rising", "falling", "stable"]).optional(),
  limit: z.number().default(10)
})
```

**2. Execute Function:** The actual data query.
```typescript
async execute({ supplierId, trendDirection, limit }) {
  const rows = await db.select().from(supplierRiskForecast)
    .where(/* filters */)
    .limit(limit);
  return { _card: { type: "chart", data: rows } };
}
```

**3. Card Return Type:** Rich UI metadata.
- `chart` → rendered as a bar/line chart
- `table` → rendered as a data table
- `action` → rendered as clickable next-step buttons

The `_card` prefix is a convention: the UI checks for this field and renders the appropriate visualization component instead of plain text.

## Why Typed Tools, Not Free-Text RAG?

An alternative approach (RAG — Retrieval Augmented Generation) would:
1. Embed the user's question
2. Search a vector database for relevant documents
3. Pass those documents to the LLM as context
4. Let the LLM generate an answer from the context

This fails here because:
- **Data freshness:** Risk scores change daily. A vector index would be stale within hours.
- **Numerical precision:** "Risk score is 78.4" needs to be exact, not approximately recalled from a document.
- **Structured output:** The UI needs typed data (arrays of objects with specific fields), not paragraphs.
- **Cross-database:** The answer might need data from SQL Server AND PostgreSQL AND MySQL. A vector search can't span three databases.

Tool calling solves all four: tools execute live queries, return exact numbers, produce typed structures, and can query any database.

## The 5-Step Limit

Each chat turn allows up to 5 sequential tool calls. After 5 tool invocations, the LLM must respond with what it has.

**Why limit?** Without it, the LLM might enter loops: call a tool, get results, decide it needs more data, call another tool, still not satisfied, call another... This burns tokens and rate limit budget. 5 steps is enough for complex queries (e.g., "get risk scores, then get forecasts for the high-risk ones, then check monitoring signals") while preventing runaway chains.

## System Prompts

`lib/ai/prompts.ts` defines 5 prompts that shape how the LLM behaves:

**1. CHAT_SYSTEM_PROMPT** — The main assistant personality. References all four modules (Connect, Engage, Educate, Govern). Instructs the LLM to use tools for data access, not to guess numbers, and to cite data sources.

**2. CASE_SUMMARY_PROMPT** — "Summarize this grievance in 1-2 sentences, max 280 characters, no markdown formatting." Used by the case list view for preview text.

**3. CASE_GUIDANCE_PROMPT** — "Provide recommended steps, a draft response, related training, estimated resolution time, and suggested follow-up questions." Returns structured JSON via `caseGuidanceSchema`.

**4. SURVEY_GENERATION_PROMPT** — "Design 5 simple, culturally sensitive survey questions for factory workers." Considers literacy levels, language barriers, and cultural norms around discussing workplace issues.

**5. SURVEY_ANALYSIS_PROMPT** — "Analyze these responses: extract sentiment distribution, themes with mention counts, a risk score, and an executive insight paragraph."

## Structured Output Schemas

`lib/ai/schemas.ts` defines Zod schemas that constrain LLM output:

```typescript
const caseGuidanceSchema = z.object({
  recommendedSteps: z.array(z.string()),
  draftResponse: z.string().optional(),
  relatedTraining: z.array(z.string()).optional(),
  estimatedResolutionDays: z.number(),
  suggestedFAQs: z.array(z.object({
    question: z.string(),
    answer: z.string()
  })).optional()
});
```

When the LLM generates output, it's validated against these schemas. Invalid output is caught and either retried or gracefully degraded (show raw text instead of structured card).

## The Action Suggestion Layer — Expert Rules, No LLM

Not everything needs an LLM. `lib/action-suggestions.ts` contains **hardcoded domain expert rules**:

```typescript
function getClusterActions(cluster) {
  const actions = [];

  if (cluster.severity === "critical") {
    actions.push({
      action: "Schedule immediate supplier audits",
      urgency: "immediate",
      module: "connect"
    });
  }

  if (cluster.caseTypes?.some(t => /wage|pay|salary/i.test(t))) {
    actions.push({
      action: "Review payroll compliance records",
      urgency: "immediate",
      module: "connect"
    });
  }
  // ... more rules for harassment, overtime, safety, multi-supplier patterns
}
```

**Why rules instead of LLM?**
- The response to "minimum wage violation detected" is always "investigate payroll." An LLM would just produce the same answer at 100x the cost.
- Rules are deterministic, auditable, and instant. LLM responses vary, take seconds, and cost tokens.
- Domain experts encoded their knowledge once. It doesn't need to be re-derived on every request.

The LLM handles the open-ended questions where rules can't anticipate every scenario: "Given Factory X's history, what's the most likely root cause?" or "Draft a message to the factory manager about the overtime findings."

## Session Management

Chat conversations persist across sessions in `aiChatHistory`:
- `sessionId` — Groups messages into a conversation
- `role` — "user", "assistant", "system", "tool"
- `sessionTitle` — Auto-generated or user-edited
- `isPinned` — Starred conversations that stay at the top

This lets a compliance officer start investigating a supplier in the morning, leave for a meeting, and come back to continue the conversation with full context.
