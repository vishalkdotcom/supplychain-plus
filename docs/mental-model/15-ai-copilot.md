# AI Copilot & Activity Stream — Passive Intelligence Without Clicking

## The Problem

SupplyChain+ runs 9 background jobs that produce clusters, forecasts, anomalies, sentiment shifts, and monitoring signals. These outputs live in separate modules: clusters in Connect, forecasts in Suppliers, anomalies in Connect, sentiment in Engage.

A compliance officer managing 300 factories shouldn't have to visit 6 different pages to discover what the system found overnight. They need a **single feed** that surfaces the most important findings at a glance.

## Two Components, One Goal

The dashboard solves this with two complementary components:

| Component | What It Shows | Data Source | Update Frequency |
|-----------|-------------|-------------|-----------------|
| **AI Copilot Feed** | One key ML insight + recent activities | `/api/ml-insights` + `/api/activities` | 5 min stale time + on-mount |
| **AI Activity Stream** | Recent automated actions from all modules | `/api/activities` | On-mount |

The copilot is the **passive** counterpart to the **interactive** AI assistant (see [12-ai-assistant.md](12-ai-assistant.md)). The assistant answers questions on demand; the copilot pushes findings without being asked.

## The Dynamic Insight — Priority Cascade

The copilot's headline insight isn't random. It follows a **priority cascade**: the system checks for the most critical finding first, and only falls through to less critical ones if nothing urgent exists.

```
1. Critical clusters?     → "Detected N critical systemic patterns affecting M suppliers"
2. Rising risk forecasts? → "N suppliers predicted to enter high-risk zone in 60 days"
3. Unresolved anomalies?  → "N unresolved wage anomalies detected. X are critical severity"
4. Sentiment shift?       → "Global worker sentiment has improved/declined by X points"
5. (none of the above)    → Generic cross-module insight (static fallback)
```

### Why This Order?

1. **Critical clusters** indicate systemic patterns across multiple factories — the highest urgency because they suggest industry-wide problems, not isolated incidents.
2. **Rising forecasts** are early warnings — still time to act, but they predict future crises.
3. **Anomalies** are detected violations — serious, but localized to specific factories.
4. **Sentiment shifts** are trend signals — important for strategic planning but not immediately actionable.

Each insight includes a **deep-link** to the relevant module page (e.g., `/connect/clusters`, `/suppliers`, `/connect/payslip-anomalies`, `/engage/voice-trends`) so the officer can investigate with one click.

### The ML Insights Aggregation

The `/api/ml-insights` endpoint runs 4 parallel queries against `wovo_ai`:

```
Promise.all([
  count caseClusters + top 3 critical clusters,
  count payslipAnomalies grouped by severity (unresolved only),
  count supplierRiskForecast + top 10 rising (next 30 days),
  latest global workerVoiceTrends (supplierId IS NULL)
])
```

This returns a single `MLInsightsSummary` object consumed by both the copilot feed and the ML insight cards elsewhere on the dashboard. One API call, multiple consumers.

## The Activity Stream — Cross-Database Event Feed

Below the headline insight, the copilot shows a chronological feed of recent events from across the platform:

```
  Case Created          │  New case: Overtime complaint (Factory X)
  connect · 5 mins ago  │

  Survey Started        │  Survey launched: Q1 Worker Wellbeing
  engage · 2 hours ago  │

  Case Created          │  New case: Wage delay report (Factory Y)
  connect · 1 day ago   │
```

### How Activities Are Aggregated

The `/api/activities` endpoint queries two source databases directly (not the derived `wovo_ai`):

**SQL Server** — 3 most recent cases:
```sql
SELECT TOP 3 c.Id, c.Name, c.Created, co.Name as CompanyName
FROM [Case] c LEFT JOIN Company co ON c.CompanyId = co.Id
WHERE c.Deleted = 0 ORDER BY c.Created DESC
```

**PostgreSQL (wovo_new)** — 3 most recent surveys:
```sql
SELECT s.id, s.name, s.from_date, c.name as client_name
FROM survey_mdlsurvey s LEFT JOIN clients_clientinfo c ON s.client_id = c.id
ORDER BY s.created_date DESC LIMIT 3
```

Results are merged, sorted by timestamp, and capped at 10 items. Each activity carries:
- `module` — which module it belongs to (connect, engage, educate)
- `supplierId` / `linkedId` — for navigation links
- `time` — human-readable relative time ("5 mins ago", "2 hours ago", "3 days ago")

### Module Color Coding

Each activity is visually tagged with its module's color and icon:
- **Connect** (cases) → `IconMessage`
- **Engage** (surveys) → `IconChartBar`
- **Educate** (training) → `IconSchool`
- **Other** → `IconSparkles` (AI/system)

This lets users scan the feed quickly and spot which modules are most active.

## Copilot vs. AI Assistant

| Feature | AI Copilot | AI Assistant |
|---------|-----------|-------------|
| **Location** | Dashboard sidebar | Dedicated `/ai` page |
| **Interaction** | Read-only feed | Interactive chat |
| **Data access** | Pre-aggregated ML insights | 15 typed tools querying live data |
| **LLM usage** | None (pure logic) | Streaming LLM with tool calling |
| **Purpose** | "Here's what happened" | "Answer my specific question" |
| **Cost** | Zero tokens | Tokens per conversation |

The copilot uses **zero LLM calls**. The priority cascade is pure JavaScript logic over pre-computed data. This is deliberate: the dashboard loads on every login, so anything in it must be instant and free. The AI assistant is for deep investigation — the copilot is for triage.

## Connection to Other Mental Models

- **Queue Engine** ([08](08-queue-engine.md)): The ML insights shown in the copilot are produced by the 9 background jobs.
- **AI Assistant** ([12](12-ai-assistant.md)): The copilot is the passive counterpart to the interactive assistant.
- **Dashboard Architecture** ([17](17-dashboard-architecture.md)): The copilot occupies the right 1/3 of the dashboard's main row, paired with the NeedsAttentionTabs on the left 2/3.
