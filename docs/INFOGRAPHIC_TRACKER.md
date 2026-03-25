# WOVO Infographic Tracker

> **Created**: 2026-03-25
> **Purpose**: Track creation of feature infographics — one per session, each designed for mixed business + technical audiences.
> **Total Infographics**: 22
> **Progress**: 0/22 complete (0%)

## Quick Status

| Status | Count |
|--------|-------|
| Done | 0 |
| In Progress | 0 |
| Not Started | 22 |

---

## Quick-Reference Table

| ID | Title | Domain | Status | Complexity | Audience |
|----|-------|--------|--------|-----------|----------|
| INF-01 | The Three-Database Engine | Platform | `not-started` | Complex | 40% biz / 60% tech |
| INF-02 | AI Provider Cascade & Rate Limiting | Platform | `not-started` | Complex | 40% biz / 60% tech |
| INF-03 | ML Job Queue Engine | Operations | `not-started` | Medium | 40% biz / 60% tech |
| INF-04 | Supplier Risk Scoring | Suppliers | `not-started` | Complex | 60% biz / 40% tech |
| INF-05 | HRDD Report Generation | Suppliers | `not-started` | Simple | 80% biz / 20% tech |
| INF-06 | Case Management & AI Assistance | Connect | `not-started` | Medium | 60% biz / 40% tech |
| INF-07 | Case Clustering via Embeddings | Connect | `not-started` | Complex | 40% biz / 60% tech |
| INF-08 | Payslip Anomaly Detection | Connect | `not-started` | Medium | 60% biz / 40% tech |
| INF-09 | AI Survey Designer & Sentiment Analysis | Engage | `not-started` | Medium | 60% biz / 40% tech |
| INF-10 | Survey Temporal Patterns | Engage | `not-started` | Simple | 30% biz / 70% tech |
| INF-11 | Worker Voice Trends | Engage | `not-started` | Medium | 60% biz / 40% tech |
| INF-12 | PDF-to-Course Pipeline | Educate | `not-started` | Medium | 60% biz / 40% tech |
| INF-13 | Control Center Overview | Dashboard | `not-started` | Complex | 60% biz / 40% tech |
| INF-14 | Geographic Risk Map & Network Graph | Dashboard | `not-started` | Medium | 30% biz / 70% tech |
| INF-15 | AI Briefing & Pipeline Freshness | Dashboard | `not-started` | Simple | 80% biz / 20% tech |
| INF-16 | Monitoring Signals (Silence, Decay, Contagion) | Detection | `not-started` | Medium | 60% biz / 40% tech |
| INF-17 | 60-Day Risk Forecasting | Detection | `not-started` | Medium | 60% biz / 40% tech |
| INF-18 | Conversational AI with 16 Tools | AI | `not-started` | Complex | 40% biz / 60% tech |
| INF-19 | Remediation Plan Lifecycle | Remediation | `not-started` | Complex | 80% biz / 20% tech |
| INF-20 | Auto-Evidence Sweep & Audit Log | Remediation | `not-started` | Medium | 60% biz / 40% tech |
| INF-21 | Brands & Supply Chain Hierarchy | Brands | `not-started` | Simple | 80% biz / 20% tech |
| INF-22 | Alert System & Needs Attention | Alerts | `not-started` | Simple | 80% biz / 20% tech |

---

## Detailed Briefs

---

### INF-01: The Three-Database Engine

| Field | Value |
|-------|-------|
| **Domain** | Platform Architecture |
| **Status** | `not-started` |
| **Complexity** | Complex |
| **Target Audience** | 40% business, 60% technical |
| **Key Source Files** | `lib/db/drizzle.ts`, `lib/db/sql-server.ts`, `lib/db/mysql.ts`, `lib/db/postgres.ts` |

**What**: WOVO connects three different databases — SQL Server (case management from Connect module), PostgreSQL with pgvector (analytics cache + vector embeddings), and MySQL (Moodle LMS training data) — and stitches them together via batch jobs into a unified intelligence layer.

**Why**: Real enterprise compliance platforms inherit legacy systems. Worker cases live in SQL Server (legacy SaaS), training records in MySQL (Moodle LMS), and AI/analytics need PostgreSQL + pgvector. Cross-database JOINs are impossible, so a cache-layer pattern denormalizes data into PostgreSQL for fast dashboard reads.

**How it works**:
- SQL Server holds 2,944 cases, 8,277 messages, 484 companies with geo data and hierarchy
- MySQL/Moodle holds 3,172+ course completions across factories
- PostgreSQL holds 35 cache/intelligence/operational tables (risk scores, embeddings, clusters, forecasts, anomalies)
- Batch jobs (8 total) pull from source DBs → compute intelligence → write to PostgreSQL cache
- Dashboard reads only from PostgreSQL — never queries SQL Server or MySQL directly

**When helpful**: When explaining to a CTO or architect why the system has three databases, or when onboarding engineers who need to understand data flow.

**Under the hood**:
- `lib/db/sql-server.ts` uses parameterized queries (`mssql` package) to prevent SQL injection
- `lib/db/drizzle.ts` uses Drizzle ORM with typed schemas for all PostgreSQL tables
- `lib/db/mysql.ts` uses `mysql2` for Moodle queries
- Docker Compose orchestrates all three: SQL Server 2022 (port 1433), PostgreSQL pgvector (5432), MySQL 8.0 (3306)

**Visual flow**: Architecture diagram showing 3 database cylinders → batch jobs in the middle → PostgreSQL cache → dashboard/API layer on top.

**Example**: When calculate-risk runs, it queries cases from SQL Server, training from MySQL, surveys from PostgreSQL, computes a composite score, and writes it to `supplier_risk_scores` in PostgreSQL. The dashboard then reads this single table.

**Session Notes**: _(to be filled)_

---

### INF-02: AI Provider Cascade & Rate Limiting

| Field | Value |
|-------|-------|
| **Domain** | Platform Architecture |
| **Status** | `not-started` |
| **Complexity** | Complex |
| **Target Audience** | 40% business, 60% technical |
| **Key Source Files** | `lib/ai/provider.ts`, `lib/ai/rate-limiter.ts` |

**What**: WOVO supports 10+ AI/LLM providers (OpenAI, Anthropic, Groq, Cerebras, Google, Perplexity, NIM/NVIDIA, OpenRouter, Ollama, LM Studio) with automatic fallback cascading and per-provider token-bucket rate limiting that persists daily usage to PostgreSQL.

**Why**: No single AI provider is reliable enough for production compliance workloads. Free tiers have aggressive rate limits (Groq: 500K tokens/day, Cerebras: 1M TPD). A cascade means when one provider rate-limits, the system automatically falls back to the next — zero downtime for AI features.

**How it works**:
- `AI_PROVIDER` env var sets the primary provider
- `generateTextWithFallback()` tries primary → fallback providers automatically
- Rate limiter tracks 4 dimensions per provider:model — TPM, RPM, TPD, RPD
- Daily usage persists to `rate_limit_daily_usage` table (survives server restarts)
- Request-level override via headers: `x-ai-provider`, `x-ai-model`, `x-ai-api-key`
- Thinking middleware extracts `<think>...</think>` reasoning tags from NIM models

**When helpful**: When explaining cost control to management, or when an engineer needs to add a new AI provider.

**Under the hood**:
- `buildModels()` function returns `model` (fast) and `strongModel` (reasoning) per provider
- Groq free tier: 30K TPM, 500K TPD for Llama 4 Scout; 6K TPM for Qwen3-32B
- Cerebras: 30K TPM, 1M TPD, 16K token output limit
- `safetyMargin: 0.8` keeps usage at 80% of limits to prevent hard cutoffs
- Ollama used only for local embeddings (bge-m3), not for text generation

**Visual flow**: Waterfall/cascade diagram showing Provider A → rate limited? → Provider B → rate limited? → Provider C, with a side panel showing the rate limiter's 4 dimensions (TPM/RPM/TPD/RPD) and PostgreSQL persistence.

**Example**: Survey analysis job uses Cerebras (fastest, 1M TPD) → Groq (fallback, 500K TPD) → OpenAI (final fallback, paid). If analyzing 285 surveys, it might exhaust Cerebras mid-run and seamlessly switch to Groq.

**Session Notes**: _(to be filled)_

---

### INF-03: ML Job Queue Engine

| Field | Value |
|-------|-------|
| **Domain** | Operations |
| **Status** | `not-started` |
| **Complexity** | Medium |
| **Target Audience** | 40% business, 60% technical |
| **Key Source Files** | `lib/jobs/queue-engine.ts`, `lib/jobs/constants.ts`, `lib/jobs/handlers/` |

**What**: A persistent, database-backed job queue that schedules and executes 8 ML batch jobs in dependency order, serializes Ollama-dependent jobs to prevent GPU VRAM thrashing, and tracks execution history with duration, errors, and result summaries.

**Why**: ML jobs (embedding generation, sentiment analysis, forecasting) are expensive and some require exclusive GPU access. A naive "run all in parallel" approach causes Ollama to swap models in/out of VRAM, crashing the system. The queue ensures safe, ordered execution.

**How it works**:
- 8 job types run in dependency order: calculate-risk → analyze-surveys → case-clustering → payslip-anomaly → risk-forecast → worker-voice-analytics → generate-briefing → remediation-evidence-sweep
- Queue stored in `job_queue` table (persistent across restarts)
- Poller checks every 10 seconds for waiting jobs
- Schedule checker runs every 60 seconds for cron-based jobs
- `EMBEDDING_JOBS` set (currently: case-clustering) serialized to avoid VRAM thrashing
- Stale lock threshold: 30 minutes — auto-releases stuck jobs
- Each run tracked in `job_runs` with status (queued/running/completed/failed/cancelled), duration, and JSON result summary

**When helpful**: When operations staff need to understand why jobs run in a specific order, or when debugging a failed job.

**Under the hood**:
- `enqueueJob()` creates a `job_runs` record + `job_queue` entry in one transaction
- `enqueueAll()` iterates `RUN_ALL_ORDER` with ascending priority (0, 1, 2...) to enforce order
- `requiresOllama` flag on queue entries gates serialization
- `withJobTracking()` middleware wraps API POST handlers — creates run record, executes, captures result

**Visual flow**: Pipeline diagram showing 8 jobs in order with arrows, a queue table in the middle, and a poller loop. Highlight the serialization gate for Ollama jobs.

**Example**: User clicks "Run All" → 8 jobs enqueued with priorities 0-7 → poller picks up calculate-risk first → completes → picks up analyze-surveys → ... → remediation-evidence-sweep finishes last.

**Session Notes**: _(to be filled)_

---

### INF-04: Supplier Risk Scoring

| Field | Value |
|-------|-------|
| **Domain** | Suppliers |
| **Status** | `not-started` |
| **Complexity** | Complex |
| **Target Audience** | 60% business, 40% technical |
| **Key Source Files** | `lib/jobs/handlers/calculate-risk.ts`, `lib/jobs/monitoring-signals.ts` |

**What**: Computes a composite risk score (0-100) for each of 220 suppliers by combining four weighted factors: case severity score (25%), survey sentiment score (25%), training completion score (25%), and engagement score (25%). Higher = more risk. Scores are stored with explainable reasons and tracked historically for trend analysis.

**Why**: Compliance officers need a single, actionable number per supplier to prioritize attention. But they also need to understand *why* a score is high — is it cases? surveys? training gaps? The composite score with breakdown enables both quick triage and deep investigation.

**How it works**:
- Queries cases from SQL Server (severity, volume, recency per supplier)
- Queries survey sentiment from PostgreSQL (negative sentiment % → risk contribution)
- Queries training completion from MySQL/Moodle (per-supplier course completion rates)
- Computes engagement score (recent activity frequency)
- Blends all four into composite: `riskScore = 0.25 * case + 0.25 * survey + 0.25 * training + 0.25 * engagement`
- Stores in `supplier_risk_scores` with per-factor breakdown and `reasons` JSON array
- Snapshots to `supplier_risk_history` for trend charts (30/60/90 day views)
- Triggers alert generation when score >= 75 (auto-creates `risk_spike` alerts)
- Triggers monitoring signal detection (silence, regional contagion, engagement decay)

**When helpful**: When explaining to a compliance director how WOVO prioritizes which factories need attention first, or when an analyst questions why a specific supplier is flagged.

**Under the hood**:
- `client_key` (integer) maps PostgreSQL suppliers to SQL Server `Company.Id` — this was a critical bug fix (bigint→string mismatch)
- Suppliers without Moodle training data get default score 70 with "No training data" reason
- Geo data (lat/lng, country) and parent company hierarchy fetched from SQL Server's `CompanyPost` table
- `parentCompanyMap` enables brand-level aggregation (brand risk = aggregate of child factories)

**Visual flow**: 4-input funnel diagram → Cases (SQL Server) + Surveys (PostgreSQL) + Training (MySQL) + Engagement → Composite Score (0-100) → Risk History Timeline + Alerts. Show the breakdown formula visually.

**Example**: Factory "Dhaka Textiles" has caseScore=82 (many severity-3 cases), surveyScore=65 (mixed sentiment), trainingScore=93 (low completion), engagementScore=40 (active) → composite = 70, triggers risk_spike alert.

**Session Notes**: _(to be filled)_

---

### INF-05: HRDD Report Generation

| Field | Value |
|-------|-------|
| **Domain** | Suppliers |
| **Status** | `not-started` |
| **Complexity** | Simple |
| **Target Audience** | 80% business, 20% technical |
| **Key Source Files** | `components/suppliers/supplier-hero.tsx` (export button), PDF generation in supplier detail page |

**What**: Generates a Human Rights Due Diligence (HRDD) PDF report for any supplier, combining risk scores, case history, survey sentiment, training compliance, and AI-narrated executive summary into a downloadable document formatted for EU CSDDD and UK Modern Slavery Act compliance.

**Why**: The EU Corporate Sustainability Due Diligence Directive (CSDDD) and UK Modern Slavery Act require companies to document their supply chain due diligence efforts. WOVO auto-generates these reports from live data — what would take days of manual compilation happens in seconds.

**How it works**:
- User clicks "Export HRDD Report" on a supplier detail page
- System gathers: risk score + breakdown, recent cases, survey analysis, training completion, monitoring signals
- AI generates an executive narrative summarizing findings and recommended actions
- jsPDF + jspdf-autotable renders the PDF with tables, charts, and compliance language
- PDF includes: supplier profile, risk breakdown, case summary, training status, recommendations

**When helpful**: When a compliance manager needs to file due diligence documentation for an audit, or when presenting supplier risk to a board of directors.

**Under the hood**:
- Uses `jspdf` for PDF rendering and `jspdf-autotable` for formatted tables
- AI narrative uses the configured provider (OpenAI/Groq/etc.) for natural language summary
- Report templates reference specific regulatory frameworks (CSDDD, OECD Guidelines, CCPA)

**Visual flow**: Linear flow: Supplier Data (risk, cases, surveys, training) → AI Narrative Generation → PDF Template Assembly → Downloadable HRDD Report. Show the report structure as a document mockup.

**Example**: Compliance officer needs Q1 due diligence report for "Vietnam Garments Co." → clicks export → gets a 4-page PDF with risk breakdown, case summary table, AI-written narrative, and regulatory compliance checklist.

**Session Notes**: _(to be filled)_

---

### INF-06: Case Management & AI Assistance

| Field | Value |
|-------|-------|
| **Domain** | Connect Module |
| **Status** | `not-started` |
| **Complexity** | Medium |
| **Target Audience** | 60% business, 40% technical |
| **Key Source Files** | `app/connect/page.tsx`, `app/connect/[id]/page.tsx`, `app/api/ai/summarize/route.ts`, `app/api/ai/guidance/route.ts`, `app/api/ai/draft-response/route.ts` |

**What**: The Connect module manages 2,944 worker grievance cases with 8,277 messages. Each case gets AI-powered assistance: auto-summarization (1-2 sentence digest), investigation guidance (recommended steps), and draft response generation (with language/tone options). Cases flow through statuses: New → Verified → Resolved.

**Why**: Compliance teams handle hundreds of cases across dozens of factories in multiple languages. AI assistance reduces case resolution time by auto-summarizing context, suggesting investigation steps, and drafting responses — letting humans focus on judgment calls instead of paperwork.

**How it works**:
- Case inbox shows all cases with search, severity/status/supplier filters, and pagination
- Case detail page displays: messages, AI summary card, guidance panel, action panel
- AI summarization: sends case messages to LLM → returns 1-2 sentence summary
- AI guidance: analyzes case type + region + severity → returns recommended investigation steps
- AI draft response: generates reply with tone/language selection (English, Vietnamese, Bengali, etc.)
- Cross-module context: shows related surveys, training status, and risk score for the same supplier

**When helpful**: When showing a compliance officer how WOVO accelerates their daily case triage workflow, or when demonstrating the AI value-add to management.

**Under the hood**:
- Cases and messages queried from SQL Server via parameterized queries
- AI summaries cached in `case_summary_cache` PostgreSQL table (computed once, served fast)
- Streaming AI responses for draft generation (real-time typing effect)
- Case types come from `CaseTypeCultureText` table with multi-language labels

**Visual flow**: Workflow diagram: Inbox (filter/search) → Case Detail (messages + context) → AI Analysis (summary, guidance, draft) → Action (respond, escalate, resolve). Show the AI assistance as a side panel.

**Example**: Case #1234 from "Cambodia Apparel": 6 messages about wage delay → AI summarizes "Workers report 2-month wage delay affecting 50+ employees" → AI guides "Verify payroll records, interview line managers, check payslip data" → officer drafts response in Khmer.

**Session Notes**: _(to be filled)_

---

### INF-07: Case Clustering via Embeddings

| Field | Value |
|-------|-------|
| **Domain** | Connect Intelligence |
| **Status** | `not-started` |
| **Complexity** | Complex |
| **Target Audience** | 40% business, 60% technical |
| **Key Source Files** | `lib/jobs/handlers/case-clustering.ts`, `lib/db/schema.ts` (caseEmbeddings, caseClusters) |

**What**: Converts 2,000 most recent case messages into 1024-dimensional vector embeddings using a local Ollama model (bge-m3), stores them in PostgreSQL with pgvector, then runs cosine-similarity clustering to detect systemic patterns — issues that appear across multiple suppliers indicating an industry-wide or regional problem.

**Why**: Individual cases look isolated, but patterns emerge when you look across hundreds of factories. "Wage delay" cases in 15 Bangladesh factories might indicate a regional banking issue. Clustering reveals these systemic patterns that no individual case review would catch.

**How it works**:
- Step 1: Query top 2,000 case messages from SQL Server (ordered by recency, min 20 chars)
- Step 2: Generate embeddings using Ollama's bge-m3 model (1024 dimensions) — one at a time to avoid VRAM thrashing
- Step 3: Store embeddings in `case_embeddings` table (pgvector `vector(1024)` column)
- Step 4: Run cosine similarity grouping to find clusters of similar messages
- Step 5: For each cluster, send representative messages to LLM for labeling (name, summary, severity)
- Step 6: Store clusters in `case_clusters` with Zod-validated labels (critical/warning/info severity)

**When helpful**: When explaining WOVO's unique "systemic pattern detection" capability to investors or compliance directors who need to see beyond individual cases.

**Under the hood**:
- `getOllamaEmbedding("bge-m3")` returns a local embedding model — no external API calls for embeddings
- pgvector extension enables vector similarity search directly in PostgreSQL
- `EMBEDDING_JOBS` set in constants.ts ensures case-clustering runs with exclusive Ollama access
- Cluster labels generated via `generateTextWithFallback()` with Zod schema validation (`clusterLabelSchema`)
- Each cluster links to company IDs and case type names for drill-down

**Visual flow**: Pipeline diagram: Case Messages (SQL Server) → bge-m3 Embedding (Ollama) → Vector Storage (pgvector) → Cosine Similarity Clustering → LLM Labeling → Systemic Patterns. Show a visual of dots in vector space grouping into clusters.

**Example**: 47 messages about "excessive overtime" from 12 different Bangladesh factories cluster together → labeled "Systematic Overtime Violations - Bangladesh Garment Sector" with severity "critical" → compliance team investigates as a regional issue rather than 47 separate cases.

**Session Notes**: _(to be filled)_

---

### INF-08: Payslip Anomaly Detection

| Field | Value |
|-------|-------|
| **Domain** | Connect Intelligence |
| **Status** | `not-started` |
| **Complexity** | Medium |
| **Target Audience** | 60% business, 40% technical |
| **Key Source Files** | `lib/jobs/handlers/payslip-anomaly.ts` |

**What**: Analyzes 1,174 payslips across 200 factories to detect three types of wage anomalies: below-minimum-wage violations (comparing net pay against country-specific minimums in local currency), sudden pay drops (>30% decrease between periods), and pay inconsistencies (gross/net ratio anomalies). Each anomaly gets an AI-generated interpretation with severity and recommended action.

**Why**: Wage theft is the most common and most hidden form of labor exploitation. Workers may not know their legal minimum wage. Automated detection catches violations that manual audits miss — especially when payslips are in local currencies across 16 countries.

**How it works**:
- Queries payslip data from SQL Server: net pay, gross pay, currency, country, worker count, pay period
- Compares against `MINIMUM_WAGES` lookup table with real local currency values (BDT 12,500/month for Bangladesh, VND 4,680,000 for Vietnam, etc.)
- Currency match guard: only compares when payslip currency matches minimum wage currency (prevents BDT vs USD false positives)
- Detects sudden drops: compares current period vs. previous period for same factory
- Detects inconsistencies: flags unusual gross-to-net ratios
- Each anomaly sent to LLM for interpretation (severity + recommended action via Zod schema)
- Results stored in `payslip_anomalies` table; auto-attached to active remediations

**When helpful**: When demonstrating WOVO's wage theft detection capability to brands concerned about minimum wage compliance in their supply chain, or when onboarding a new country.

**Under the hood**:
- 16 countries supported with real local currency minimums (Bangladesh ৳12,500, India ₹10,000, Pakistan ₨32,000, etc.)
- `ParentCompanyId IS NOT NULL` filter excludes brand companies (IDs 201-220) from anomaly detection
- Idempotent runs: `db.delete(payslipAnomalies)` clears before re-detecting
- `?limit=N` parameter caps LLM calls during testing
- 71 anomalies currently detected across 200 factories

**Visual flow**: Comparison diagram: Payslip Data (factory, currency, amount) → Three Detection Rules (below minimum, sudden drop, inconsistency) → AI Interpretation → Anomaly Report with severity. Show a before/after with local currency symbols.

**Example**: Factory in Bangladesh pays ৳10,000/month (BDT) → minimum is ৳12,500 → flagged as "below_minimum" with severity "critical" → AI interpretation: "Net pay 20% below Bangladesh minimum wage, affecting 45 workers. Recommend immediate payroll audit."

**Session Notes**: _(to be filled)_

---

### INF-09: AI Survey Designer & Sentiment Analysis

| Field | Value |
|-------|-------|
| **Domain** | Engage Module |
| **Status** | `not-started` |
| **Complexity** | Medium |
| **Target Audience** | 60% business, 40% technical |
| **Key Source Files** | `lib/jobs/handlers/analyze-surveys.ts`, `app/engage/page.tsx`, `app/api/ai/survey/route.ts` |

**What**: Two features in one pipeline — (1) an AI survey designer that converts a text prompt into structured survey questions with multi-language support, and (2) a batch analysis job that processes 285 surveys with sentiment classification (positive/negative/neutral percentages), theme extraction, and AI-generated insights.

**Why**: Traditional survey design requires expertise and translation budgets. WOVO's AI designer generates culturally appropriate questions in seconds. The analysis pipeline then processes thousands of responses to surface sentiment trends and emerging themes — what would take a research team weeks.

**How it works**:
- **Survey Designer**: User enters a prompt ("Ask about overtime and safety") → AI generates structured questions → preview in multiple languages (English, Vietnamese, Bengali, Mandarin, Khmer) → save as draft
- **Analysis Pipeline**: Fetches all distinct survey IDs → for each survey, fetches responses separately (fixes the old LIMIT 500 bug) → sends batches to LLM → extracts sentiment percentages, themes with mention counts, and a one-paragraph insight
- Results stored in `survey_analysis` table with Zod-validated output (`surveyAnalysisSchema`)
- Theme data feeds into the temporal patterns system for trend tracking

**When helpful**: When demonstrating WOVO's survey capability to HR directors or when explaining how the platform turns raw survey responses into actionable intelligence.

**Under the hood**:
- Survey data lives in PostgreSQL (Engage module tables: `survey_mdlsurvey`, `survey_mdlsurveyquestions`, etc.)
- Each survey processed independently to avoid the LIMIT 500 bug (previously only 2 of 285 surveys were analyzed)
- Average results: 43.69% positive, 41.69% negative, 14.62% neutral across all surveys
- Themes extracted as structured objects: `{ name, sentiment, mentionCount }`
- `riskScore` (0-100) computed per survey — feeds into supplier risk calculation

**Visual flow**: Two-part infographic: Left side = Survey Designer flow (Prompt → AI → Questions → Multi-language Preview → Deploy). Right side = Analysis Pipeline (Responses → LLM Batch Analysis → Sentiment % + Themes + Insights → Dashboard).

**Example**: Prompt "Assess worker satisfaction with living conditions and food quality" → AI generates 8 questions in English + Vietnamese → deployed to 3 factories → 450 responses collected → analysis shows 62% negative sentiment on "food quality" theme → flagged for attention.

**Session Notes**: _(to be filled)_

---

### INF-10: Survey Temporal Patterns

| Field | Value |
|-------|-------|
| **Domain** | Engage Intelligence |
| **Status** | `not-started` |
| **Complexity** | Simple |
| **Target Audience** | 30% business, 70% technical |
| **Key Source Files** | `lib/jobs/handlers/analyze-surveys.ts` (temporal pattern section), `lib/db/schema.ts` (surveyTemporalPatterns) |

**What**: Tracks how survey themes evolve over time by computing cross-survey theme trends. With 708 temporal patterns recorded, the system shows which issues are growing (e.g., "overtime complaints" trending up) and which are declining (e.g., "safety concerns" dropping after training).

**Why**: A single survey snapshot tells you what workers think *now*. Temporal patterns tell you whether things are getting *better or worse*. This is the difference between reactive ("we have a problem") and proactive ("this problem is growing") compliance.

**How it works**:
- After survey analysis completes, themes are grouped by month
- For each theme, computes: mention count this month vs. previous month
- Calculates delta (rising, falling, stable)
- Stores in `survey_temporal_patterns` table with month, theme name, count, and delta
- UI displays trend lines showing theme evolution over time

**When helpful**: When a compliance analyst needs to prove that an intervention (training, policy change) actually improved worker sentiment on a specific issue.

**Under the hood**:
- 708 temporal patterns currently tracked (themes × months × suppliers)
- Patterns linked to specific suppliers for drill-down
- Delta calculation: `(current_count - previous_count) / previous_count * 100`

**Visual flow**: Timeline chart showing 3-4 themes as lines moving up/down over 6 months. Annotate key inflection points ("Training deployed here" → theme drops).

**Example**: "Overtime" theme: Jan=45 mentions → Feb=62 → Mar=78 (rising 25%/month). After intervention in April: Apr=55 → May=30 (declining). The temporal pattern proves the intervention worked.

**Session Notes**: _(to be filled)_

---

### INF-11: Worker Voice Trends

| Field | Value |
|-------|-------|
| **Domain** | Engage Intelligence |
| **Status** | `not-started` |
| **Complexity** | Medium |
| **Target Audience** | 60% business, 40% technical |
| **Key Source Files** | `lib/jobs/handlers/worker-voice-analytics.ts`, `app/engage/voice-trends/page.tsx` |

**What**: Extracts emerging topics and sentiment shifts from worker feedback by grouping survey responses by month, running NLP topic extraction via LLM, computing sentiment scores, and tracking which topics are emerging (growing) vs. declining. Includes implicit positive topics (employment stability, peer support) to avoid negativity bias.

**Why**: Workers express concerns through surveys, but raw responses are noisy. Voice trends distill thousands of responses into "what workers are talking about most" and "how their sentiment is shifting" — giving brands a pulse on worker well-being.

**How it works**:
- Groups survey responses by month
- For each month, sends batch of 50 responses to LLM for topic extraction
- LLM returns: `{ topics: [{ name, mentions, sentiment }], overallSentiment }`
- Computes delta between current and previous month (emerging vs. declining)
- Injects 5 implicit positive/neutral topics to counteract LLM negativity bias
- Computes overall sentiment score: `(positive - negative) / total * 100`
- Stores in `worker_voice_trends` table with month, topics JSON, sentiment score

**When helpful**: When presenting a "state of worker well-being" report to brand executives, or when tracking the impact of interventions on worker sentiment.

**Under the hood**:
- Implicit topics include: "Employment Stability" (positive), "Peer & Community Support" (positive), "Skills Development" (neutral), "Factory Operations" (neutral), "Worker Engagement" (positive)
- These are injected because LLM topic extraction tends to focus on problems, missing the baseline positive aspects of employment
- Sentiment score formula: `(pos_count - neg_count) / total_count * 100`
- `extractMonth()` normalizes dates to YYYY-MM-01 format for consistent grouping

**Visual flow**: Funnel diagram: Raw Responses (thousands) → Monthly Grouping → LLM Topic Extraction → Emerging/Declining Classification → Sentiment Score Timeline. Show a sample topics bar chart with delta arrows (↑ emerging, ↓ declining).

**Example**: March 2026: Top emerging topic = "Payment Delays" (+34% from Feb), declining topic = "Safety Equipment" (-22% after PPE distribution). Overall sentiment: -12 (slightly negative, improving from -28 in January).

**Session Notes**: _(to be filled)_

---

### INF-12: PDF-to-Course Pipeline

| Field | Value |
|-------|-------|
| **Domain** | Educate Module |
| **Status** | `not-started` |
| **Complexity** | Medium |
| **Target Audience** | 60% business, 40% technical |
| **Key Source Files** | `app/educate/page.tsx`, `app/api/ai/educate/route.ts` |

**What**: Upload a PDF document (safety manual, policy document, compliance guide) and WOVO auto-generates a structured training course with lessons, quizzes, and multi-language translations. The pipeline handles: PDF extraction → AI lesson generation → quiz generation (Zod-validated) → course publishing.

**Why**: Creating training content for factory workers in 5+ languages is expensive and slow. Brands have existing documentation (safety manuals, code of conduct) that could become training — but reformatting and translating takes weeks. This pipeline does it in minutes.

**How it works**:
- Drag-and-drop PDF upload with visual progress stages (Uploading → Extracting → Generating → Ready)
- `pdf-parse` extracts text content from the uploaded PDF
- AI generates structured lesson outline from extracted text
- AI generates quiz questions with Zod schema validation (correct answer, distractors)
- Course stored with training completion tracking via MySQL/Moodle integration
- Course translations stored in `course_translations` table

**When helpful**: When showing brand L&D (Learning & Development) teams how they can deploy compliance training across their supply chain in hours instead of months.

**Under the hood**:
- PDF extraction uses the `pdf-parse` library
- Quiz schema validated via Zod to ensure consistent structure
- Training completion data from Moodle (MySQL) feeds into the risk scoring pipeline
- 3,172+ course completions tracked across all factories
- Multi-language support: English, Vietnamese, Bengali, Mandarin, Khmer

**Visual flow**: Linear pipeline: PDF Document → Extract Text → AI Lesson Generator → AI Quiz Generator → Multi-Language Translation → Deploy to Workers. Show the 4-stage progress indicator.

**Example**: Upload "Fire Safety Manual.pdf" (42 pages) → AI generates 6 lessons + 15 quiz questions → translated to Vietnamese and Bengali → deployed to 3 factories → completion tracked in real-time.

**Session Notes**: _(to be filled)_

---

### INF-13: Control Center Overview

| Field | Value |
|-------|-------|
| **Domain** | Dashboard |
| **Status** | `not-started` |
| **Complexity** | Complex |
| **Target Audience** | 60% business, 40% technical |
| **Key Source Files** | `components/dashboard/dashboard-view.tsx`, `components/dashboard/metric-card.tsx`, `components/dashboard/ml-insight-cards.tsx`, `components/dashboard/needs-attention-tabs.tsx` |

**What**: The main landing page — a control center that provides a complete supply chain compliance overview in one screen. Contains: AI briefing bar, pipeline freshness indicator, 4 priority metric cards, 4 ML insight cards, needs-attention tabs (alerts, urgent cases, risk movements, forecasts), AI copilot feed, risk distribution chart, geographic risk map, and supply chain network graph.

**Why**: Compliance directors need a single screen that answers "what needs my attention right now?" across hundreds of suppliers, thousands of cases, and multiple risk dimensions. The control center prioritizes information by urgency and surfaces ML-detected patterns alongside human-reported issues.

**How it works**:
- **AI Briefing Bar**: Pre-computed daily digest from `intelligence_briefing` table
- **Pipeline Freshness**: Shows when each of the 8 jobs last ran (green/yellow/red)
- **Priority Metrics** (4 cards): High-Risk Suppliers, Urgent Cases, Supplier Trends (improving/worsening), Training Coverage %
- **ML Insights** (4 cards): Systemic Patterns count, Forecast Alerts, Wage Anomalies, Sentiment Shift
- **Needs Attention Tabs**: Alerts (unread), Urgent Cases, Risk Movements (threshold crossings), Forecasts (predicted risk increases)
- **AI Copilot Feed**: Contextual AI recommendations
- **Risk Distribution Chart**: Histogram of supplier risk score distribution
- **Geographic Map**: World map with risk-colored supplier pins (lazy-loaded via `dynamic()`)
- **Network Graph**: Supply chain hierarchy visualization (lazy-loaded via `dynamic()`)

**When helpful**: When demoing WOVO to prospects, onboarding new compliance staff, or explaining the product's information architecture.

**Under the hood**:
- View context (`useView()`) supports global vs. brand-specific filtering
- React Query with `keepPreviousData` for smooth pagination
- Heavy visualizations (map, network) lazy-loaded with `next/dynamic` to avoid SSR issues
- Metrics endpoint aggregates from multiple PostgreSQL tables in a single query
- Collapsible visualization section for focused vs. full-view modes

**Visual flow**: Dashboard wireframe/mockup showing the 6-row layout: Freshness → Briefing → Metrics (4 cards) → ML Insights (4 cards) → Attention Tabs + Copilot → Charts/Map. Annotate each section with its data source.

**Example**: Login → see "3 suppliers crossed risk threshold 75 overnight" in briefing → ML cards show "2 new systemic patterns detected" → click Needs Attention → see supplier list → drill into worst supplier → see full detail page.

**Session Notes**: _(to be filled)_

---

### INF-14: Geographic Risk Map & Network Graph

| Field | Value |
|-------|-------|
| **Domain** | Dashboard Visualizations |
| **Status** | `not-started` |
| **Complexity** | Medium |
| **Target Audience** | 30% business, 70% technical |
| **Key Source Files** | `components/dashboard/geographic-risk-map.tsx`, `components/dashboard/supply-chain-network.tsx` |

**What**: Two spatial visualizations on the dashboard — (1) a world map showing supplier locations as risk-colored pins (red/amber/green) using react-simple-maps + D3, and (2) a network graph showing parent-company → factory relationships using React Flow (@xyflow/react).

**Why**: Geographic visualization reveals regional risk concentration (e.g., all high-risk factories in one country). Network graphs show ownership relationships — if a parent company has problems, all its factories are suspect. These visual patterns are invisible in tables.

**How it works**:
- **Geographic Map**: Fetches supplier lat/lng from `supplier_risk_scores` (sourced from SQL Server's `CompanyPost` table) → renders world map with `react-simple-maps` → plots markers colored by risk score (>=70 red, >=50 amber, <50 green) → hover shows supplier name + score
- **Network Graph**: Fetches parent-child relationships from `CompanyHierarchy` → renders interactive node graph with `@xyflow/react` → brands as parent nodes, factories as child nodes → edge connections show ownership → node color = risk level

**When helpful**: When showing executives a "war room" view of their supply chain, or when demonstrating how WOVO combines geographic and ownership dimensions of risk.

**Under the hood**:
- Both components lazy-loaded with `next/dynamic` (SSR: false) because they depend on browser APIs
- Map uses D3 geo projections for accurate positioning
- Network graph supports drag, zoom, and pan interaction
- 200 factories with lat/lng coordinates, 126 parent-child hierarchy relationships
- Loading states show animated skeleton placeholders

**Visual flow**: Side-by-side: Left = world map with clustered pins in SE Asia, South Asia, Africa. Right = network tree showing "Brand A" → 5 factories with risk-colored nodes. Annotate the color coding.

**Example**: Map shows cluster of 8 red pins in Bangladesh → network graph reveals they all belong to "Global Textiles Inc." → investigation reveals systematic overtime policy from parent company.

**Session Notes**: _(to be filled)_

---

### INF-15: AI Briefing & Pipeline Freshness

| Field | Value |
|-------|-------|
| **Domain** | Dashboard |
| **Status** | `not-started` |
| **Complexity** | Simple |
| **Target Audience** | 80% business, 20% technical |
| **Key Source Files** | `components/dashboard/ai-briefing-bar.tsx`, `components/dashboard/pipeline-freshness-bar.tsx`, `lib/jobs/handlers/generate-briefing.ts` |

**What**: Two "system health" indicators on the dashboard — (1) the AI Briefing Bar shows a daily intelligence digest with attention items categorized as critical/watch/positive, and (2) the Pipeline Freshness Bar shows when each of the 8 ML jobs last ran, with green/yellow/red status indicators based on SLA thresholds.

**Why**: Compliance officers need to know two things every morning: "What changed overnight?" (briefing) and "Can I trust the data I'm seeing?" (freshness). If the risk-scoring job hasn't run in 48 hours, the dashboard numbers are stale — freshness makes this visible.

**How it works**:
- **Briefing Generation** (batch job): Aggregates from all intelligence tables → finds high-risk suppliers by region, active case clusters, unresolved wage anomalies, rising risk forecasts, monitoring signals → creates attention items with severity, title, description, metric, and a suggested AI chat query
- **Briefing Display**: Reads `intelligence_briefing` table → shows attention items as cards with severity-colored borders → each item has a "Ask AI" button that pre-fills the chat with the suggested query
- **Freshness**: Reads `job_runs` table → shows last run time per job type → compares against SLA threshold (e.g., 24 hours for daily jobs) → green (on-time), yellow (approaching SLA), red (overdue)

**When helpful**: When explaining WOVO's proactive intelligence model — the system doesn't wait for you to ask, it tells you what to look at.

**Under the hood**:
- Briefing expires after 24 hours — `generate-briefing` job must run daily
- Attention items include a `query` field with a pre-built AI chat prompt (e.g., "Show me the 15 high-risk suppliers and their risk factors")
- Freshness checks `job_runs` for the most recent successful run per job type

**Visual flow**: Two-panel: Top = Briefing bar showing 3 attention items (critical: "15 high-risk suppliers", watch: "2 new clusters", positive: "training coverage improved 5%"). Bottom = Freshness bar showing 8 job indicators with timestamps.

**Example**: Morning login → Briefing: "15 suppliers at high risk, concentrated in Bangladesh (8), Vietnam (4), Cambodia (3)" → Freshness: all green except "Case Clustering" (yellow, last run 20h ago) → user clicks "Run" to refresh.

**Session Notes**: _(to be filled)_

---

### INF-16: Monitoring Signals (Silence, Decay, Contagion)

| Field | Value |
|-------|-------|
| **Domain** | Detection |
| **Status** | `not-started` |
| **Complexity** | Medium |
| **Target Audience** | 60% business, 40% technical |
| **Key Source Files** | `lib/jobs/monitoring-signals.ts` |

**What**: Detects three types of "absence signals" — problems you'd miss if you only looked at what's present: (1) Supplier Silence — factories with zero cases/surveys for 60+ days (suspicious absence of activity), (2) Engagement Decay — declining survey participation or training completion trends, (3) Regional Contagion — when the same issue pattern appears across multiple suppliers in a geographic region.

**Why**: Traditional compliance monitors what's reported. But the most dangerous factories are often the *silent* ones — no cases might mean no problems, or it might mean workers are too afraid to speak. Monitoring signals detect what isn't happening, which is as important as what is.

**How it works**:
- Called automatically after `calculate-risk` job completes
- **Silence Detection**: Queries SQL Server for last case/survey activity per supplier → flags suppliers with >60 days of silence → severity based on risk score (high-risk + silent = critical)
- **Regional Contagion**: Groups suppliers by country → looks for 3+ suppliers in same region with similar risk patterns → flags as regional systemic issue
- **Engagement Decay**: (framework ready, looks at participation rate trends)
- Signals stored in `supplier_monitoring_signals` table with type, severity, title, description, metadata
- Signals upserted: new signals inserted, existing updated, resolved signals marked

**When helpful**: When explaining WOVO's "what you can't see can hurt you" detection philosophy, or when training compliance teams to pay attention to silence.

**Under the hood**:
- `computeMonitoringSignals()` runs as part of the risk calculation pipeline (not a separate job)
- Silence threshold: 60 days (configurable)
- Contagion threshold: 3+ suppliers in same region with similar scores
- Detectors run in parallel via `Promise.all([detectSilence(), detectRegionalContagion()])`
- 91 signals currently detected: 64 critical, 27 warning

**Visual flow**: Three-panel diagram: Panel 1 = Silence (calendar showing 60 days with no activity, question mark). Panel 2 = Decay (declining trend line of participation). Panel 3 = Contagion (map showing 4 red dots in same region). All three → Monitoring Signal Alert.

**Example**: Factory "Myanmar Textiles" hasn't submitted a single case or survey in 90 days, but has a risk score of 72 → flagged as "critical silence" → compliance team reaches out → discovers workers fear retaliation for reporting.

**Session Notes**: _(to be filled)_

---

### INF-17: 60-Day Risk Forecasting

| Field | Value |
|-------|-------|
| **Domain** | Detection |
| **Status** | `not-started` |
| **Complexity** | Medium |
| **Target Audience** | 60% business, 40% technical |
| **Key Source Files** | `lib/jobs/handlers/risk-forecast.ts` |

**What**: Uses ordinary least-squares linear regression on historical risk score snapshots (from `supplier_risk_history`) to predict each supplier's risk score 60 days into the future. Outputs predictions with confidence scores (R² coefficient) and trend direction (rising/falling/stable) for all 220 suppliers — 440 forecasts total (30-day and 60-day).

**Why**: Reactive compliance waits for problems. Predictive compliance sees them coming. If a factory's risk score is trending from 55 to 75 over the next 60 days, you can intervene *before* it crosses the critical threshold — preventing a crisis instead of responding to one.

**How it works**:
- Fetches last 90 days of `supplier_risk_history` snapshots (avg 33 data points per supplier)
- For each supplier, runs OLS linear regression: `y = slope * x + intercept`
- Computes R² coefficient of determination (confidence: 0 = no confidence, 1 = perfect fit)
- Projects score at day 30 and day 60
- Classifies trend: rising (slope > 0.1), falling (slope < -0.1), stable (between)
- Sends predictions to LLM for narrative reasoning ("Why might this supplier's risk increase?")
- Stores in `supplier_risk_forecast` table with predicted scores, confidence, trend, and AI reasoning

**When helpful**: When demonstrating WOVO's predictive capability to CxOs, or when compliance teams plan quarterly intervention priorities.

**Under the hood**:
- Linear regression implemented from scratch (no ML library dependency): `sumX, sumY, sumXY, sumXX`
- R² formula: `1 - ssRes / ssTot` where `ssRes` = residual sum of squares
- Average confidence across 220 suppliers: 0.37 (moderate — risk scores are inherently noisy)
- Predictions clamped to 0-100 range
- Each forecast has an AI-generated `reasoning` field explaining the trend

**Visual flow**: Statistical diagram: Historical data points (scatter plot) → Linear regression line → Projected future values (dashed line) → Confidence band (shaded area). Show the R² formula and what confidence means.

**Example**: "Dhaka Apparel" risk history: 45 → 52 → 58 → 63 over 4 months → regression projects 71 at day 30 and 78 at day 60 → confidence R²=0.89 (high) → trend: "rising" → AI reasoning: "Increasing case volume and declining survey sentiment suggest growing labor issues."

**Session Notes**: _(to be filled)_

---

### INF-18: Conversational AI with 16 Tools

| Field | Value |
|-------|-------|
| **Domain** | AI Assistant |
| **Status** | `not-started` |
| **Complexity** | Complex |
| **Target Audience** | 40% business, 60% technical |
| **Key Source Files** | `lib/ai/tools.ts`, `lib/ai/prompts.ts`, `app/ai/page.tsx`, `app/api/ai/chat/route.ts` |

**What**: A conversational AI assistant equipped with 16 tools (14 read + 2 write) that can query across all WOVO modules — supplier risk, cases, surveys, training, clusters, forecasts, anomalies, monitoring signals, remediations, and voice trends. Supports session management, streaming responses, and cross-module intelligence queries.

**Why**: Compliance data is spread across dozens of tables and views. Instead of navigating 10 different pages, users ask natural language questions: "Which Bangladesh suppliers have rising risk and unresolved wage anomalies?" The AI queries multiple data sources and synthesizes a single answer.

**How it works**:
- Chat interface at `/ai` with session management (create, rename, pin, resume)
- User message → sent to LLM with system prompt + 16 tool definitions
- LLM decides which tools to call (can chain multiple tools in one response)
- **14 Read Tools**: querySupplierRisk, queryCases, querySurveys, queryTrainingCompletion, getAlerts, queryPlaybook, queryClusters, queryVoiceTrends, queryAnomalies, queryForecasts, queryMonitoringSignals, queryRemediations, queryRiskHistory
- **2 Write Tools**: markAlertRead, triggerRiskRecalculation
- Tool results rendered as visual cards in chat (bar charts, tables, lists)
- Streaming responses via Vercel AI SDK v6 with `@ai-sdk/react` `useChat` hook
- Chat history persisted in `ai_chat_history` table for session replay

**When helpful**: When demoing WOVO's AI capability, or when explaining the tool-use agent architecture to engineering teams.

**Under the hood**:
- Tools defined with `tool()` from Vercel AI SDK, schemas validated with Zod
- Each tool returns a `_card` object for visual rendering (chart type, data, columns)
- System prompt in `lib/ai/prompts.ts` describes WOVO's mission and available tools
- Supports request-level provider override via `x-ai-provider` header
- `generateTextWithFallback()` handles provider cascading during chat

**Visual flow**: Agent architecture diagram: User Question → LLM (with 16 tool definitions) → Tool Selection → Tool Execution (queries PostgreSQL/SQL Server/MySQL) → Results → LLM Synthesis → Streaming Response with Visual Cards. Show the 16 tools as a radial layout.

**Example**: User: "Show me suppliers with rising risk forecasts and unresolved anomalies in Bangladesh" → AI calls `queryForecasts(trend: rising)` + `queryAnomalies(country: Bangladesh)` → cross-references results → "3 suppliers match: Factory A (forecast: 72→85, 2 wage violations), Factory B..."

**Session Notes**: _(to be filled)_

---

### INF-19: Remediation Plan Lifecycle

| Field | Value |
|-------|-------|
| **Domain** | Remediation |
| **Status** | `not-started` |
| **Complexity** | Complex |
| **Target Audience** | 80% business, 20% technical |
| **Key Source Files** | `components/remediation/status-pipeline.tsx`, `app/remediation/page.tsx`, `app/remediation/[id]/page.tsx` |

**What**: A 6-stage lifecycle for tracking remediation actions from detection to closure: Detected → Root Cause → Action Plan → Implementing → Verifying → Closed. Each plan tracks a specific compliance issue for a specific supplier, with advancement suggestions, evidence requirements, and overdue monitoring.

**Why**: Detection without action is useless. The remediation lifecycle is WOVO's "act" phase — turning detected issues (clusters, anomalies, alerts) into tracked corrective action plans with accountability. This is the evidence trail that regulators (CSDDD, OECD) require.

**How it works**:
- **Creation**: Plans created from alerts, supplier issues, or case patterns → stored in `remediation_plans` table with title, description, supplier, source type, target date
- **6 Stages** (visual pipeline):
  1. **Detected**: Issue identified (auto-created from alerts or manual)
  2. **Root Cause**: Investigation to understand underlying problem
  3. **Action Plan**: Concrete steps defined to address root cause
  4. **Implementing**: Corrective actions being executed
  5. **Verifying**: Checking that actions resolved the issue
  6. **Closed**: Verified complete, evidence collected
- **Advancement**: Interactive pipeline component with "Advance" button → auto-suggests next steps
- **AI Root Cause Analysis**: API endpoint analyzes the issue and suggests root causes
- **Overdue Tracking**: Plans past target date flagged with overdue indicators
- **Filtering**: View by status (active, resolved), by supplier, by alert source

**When helpful**: When showing compliance managers how WOVO tracks remediation from detection to evidence, or when demonstrating regulatory compliance workflows to auditors.

**Under the hood**:
- `STATUS_STEPS` array defines the 6 stages with icons (Search, ClipboardList, Progress, Eye, CircleCheck)
- `getNextStatus()` returns the next stage in the pipeline
- Plans store `sourceType` (alert, supplier, case) and `sourceId` for traceability
- Advancement suggestions powered by AI (`/api/ai/remediation-root-cause`)

**Visual flow**: Horizontal pipeline showing 6 stages as connected nodes (like a Kanban board turned sideways), with icons, colors (grey → blue → green progression), and a sample plan card moving through stages. Show the create/advance/close flow.

**Example**: Alert "payslip anomaly at Factory X" → Create remediation → Root Cause: "Payroll system miscalculation" → Action Plan: "Audit payroll, retrain payroll staff, implement automated checks" → Implementing (2 weeks) → Verifying (check next month's payslips) → Closed with evidence.

**Session Notes**: _(to be filled)_

---

### INF-20: Auto-Evidence Sweep & Audit Log

| Field | Value |
|-------|-------|
| **Domain** | Remediation |
| **Status** | `not-started` |
| **Complexity** | Medium |
| **Target Audience** | 60% business, 40% technical |
| **Key Source Files** | `lib/jobs/handlers/remediation-evidence-sweep.ts`, `lib/remediation/auto-evidence.ts`, `components/remediation/evidence-timeline.tsx`, `components/remediation/audit-log.tsx` |

**What**: Two features that complete the "evidence" phase of detect→act→evidence: (1) Auto-Evidence Sweep — a batch job that cross-references resolved cases, training completions, and risk score drops against active remediations to automatically attach proof of progress. (2) Audit Log — an immutable change history for every remediation plan recording who changed what, when.

**Why**: Regulators don't just want to see that you *planned* to fix something — they want *evidence* that you did. Manual evidence collection is tedious and error-prone. The auto-sweep finds proof automatically. The audit log provides the immutable trail that CSDDD and OECD require.

**How it works**:
- **Evidence Sweep Job** (runs as 8th job in pipeline):
  - Finds all active (non-closed) remediations
  - For each supplier's active plans:
    - Checks SQL Server for cases resolved in last 30 days → attaches as "case_resolved" evidence
    - Checks MySQL/Moodle for training completions → attaches as "training_completed" evidence
    - Checks PostgreSQL for risk score drops → attaches as "risk_score_drop" evidence
  - Deduplication via `buildReferenceId()` — deterministic key prevents duplicate evidence (e.g., `case_resolved|2026-03-25|supplier_42|sweep`)
  - Uses `attachAutoEvidence()` helper that checks for existing reference before inserting
- **5 Evidence Types**: case_resolved, survey_improvement, training_completed, risk_score_drop, anomaly_resolved
- **Audit Log**: Every change to a remediation plan creates a row in `remediation_audit_log` with: who (demo user), when, field changed, old value, new value

**When helpful**: When explaining WOVO's automated compliance evidence collection to auditors, or when demonstrating how the platform reduces manual evidence gathering work.

**Under the hood**:
- `findAllActiveRemediations()` returns plans not in "closed" status
- `buildReferenceId(type, date, supplierId, source)` creates deterministic dedup keys
- Evidence sweep queries all 3 databases (SQL Server for cases, MySQL for training, PostgreSQL for scores)
- Audit log stored in `remediation_audit_log` table — append-only, never modified or deleted

**Visual flow**: Two-part: Left = Evidence Sweep flow (3 databases → cross-reference → auto-attach evidence cards to remediation timeline). Right = Audit Log as a vertical timeline showing changes with timestamps and actors.

**Example**: Remediation for "Wage violations at Factory X": Auto-sweep finds → 3 cases resolved (SQL Server), 45 workers completed wage compliance training (Moodle), risk score dropped from 78 to 62 (PostgreSQL) → all three auto-attached as evidence → audit log shows "status advanced from implementing to verifying by system at 2026-03-25T08:00Z".

**Session Notes**: _(to be filled)_

---

### INF-21: Brands & Supply Chain Hierarchy

| Field | Value |
|-------|-------|
| **Domain** | Brands |
| **Status** | `not-started` |
| **Complexity** | Simple |
| **Target Audience** | 80% business, 20% technical |
| **Key Source Files** | `app/brands/page.tsx`, `app/brands/[id]/page.tsx` |

**What**: Portfolio view showing parent companies (brands) and their owned/contracted factories, with aggregate risk scores across subsidiaries. The hierarchy is derived from SQL Server's `CompanyHierarchy` table (126 relationships), enabling brand-level risk assessment: if you're responsible for "Brand X", you see all its factories' combined risk.

**Why**: Brands don't manage individual factories — they manage portfolios. A brand compliance director needs to see "which of my 30 factories need attention?" not "which of 220 factories globally need attention?" The brand view filters the entire platform to show only relevant data.

**How it works**:
- Brand list page shows all parent companies with aggregate metrics (avg risk, factory count, case count)
- Brand detail page shows: brand profile, list of child factories with risk scores, aggregate charts
- View context toggle on dashboard switches between "Global" (all 220 suppliers) and "Brand" (only selected brand's factories)
- `parentCompanyMap` in calculate-risk links factories to brands via `clients_clientinfotorelationmapping`
- Network graph visualization shows brand → factory tree structure

**When helpful**: When onboarding a new brand client who wants to see only their supply chain, or when explaining multi-tenant data isolation.

**Under the hood**:
- 20 brand companies (IDs 201-220) vs. 200 factory companies (IDs 1-200)
- `useView()` context provider manages global/brand view state across all pages
- Parent-child mapping from PostgreSQL relation tables (not SQL Server hierarchy)
- Brand companies excluded from payslip anomalies and other factory-specific metrics

**Visual flow**: Hierarchy tree: "Brand A" at top → 5 factory nodes below, each with risk score badge. Show the toggle between "Global View" (all 220) and "Brand View" (filtered to 5).

**Example**: Brand "GlobalWear Inc." has 8 factories: 2 in Bangladesh (risk: 72, 68), 3 in Vietnam (risk: 45, 52, 38), 3 in Cambodia (risk: 61, 55, 49). Brand aggregate risk: 55. Dashboard filtered to show only these 8 when brand view is active.

**Session Notes**: _(to be filled)_

---

### INF-22: Alert System & Needs Attention

| Field | Value |
|-------|-------|
| **Domain** | Alerts |
| **Status** | `not-started` |
| **Complexity** | Simple |
| **Target Audience** | 80% business, 20% technical |
| **Key Source Files** | `components/dashboard/needs-attention-tabs.tsx`, `app/api/alerts/route.ts` |

**What**: A multi-type alert system that auto-generates notifications when compliance thresholds are crossed. 5 alert types: risk_spike (score >= 75), low_training (completion < 50%), survey_negative (negative sentiment > 60%), case_spike (unusual case volume), payslip_anomaly (wage violations detected). Displayed in the Needs Attention section of the dashboard with tabs for Alerts, Urgent Cases, Risk Movements, and Forecasts.

**Why**: Compliance officers can't monitor 220 suppliers continuously. Alerts surface the exceptions — the suppliers that crossed a threshold, the cases that spiked, the anomalies that appeared. It's the difference between staring at a dashboard all day and being told "look here, now."

**How it works**:
- **Alert Generation**: calculate-risk job auto-creates alerts when `riskScore >= 75` (risk_spike alert)
- **Alert Types**: Each type has a severity (critical/warning/info) and a linked supplier
- **Needs Attention UI**: 4-tab section on dashboard:
  - **Alerts tab**: Unread alerts with severity badges and timestamps
  - **Urgent Cases tab**: Cases requiring immediate attention (high severity)
  - **Risk Movements tab**: Suppliers that crossed risk thresholds (up or down)
  - **Forecasts tab**: Suppliers predicted to increase risk in next 60 days
- **Mark as Read**: API endpoint to dismiss/acknowledge alerts (`markAlertRead` AI tool)
- Alerts stored in `alerts` table with type, severity, supplier ID, title, description, read status

**When helpful**: When training compliance staff on daily workflow, or when explaining WOVO's proactive notification model.

**Under the hood**:
- Alert generation is a side effect of `calculate-risk` job (not a separate job)
- Severity determined by how far score exceeds threshold (75-84: warning, 85+: critical)
- Needs Attention tabs query different data sources: alerts table, cases with high severity, risk history deltas, forecast table
- `markAlertRead` available both via UI button and AI assistant tool

**Visual flow**: Funnel diagram: Data Sources (risk scores, cases, surveys, payslips) → Threshold Rules (>= 75, < 50%, > 60%, spike, anomaly) → Alert Generation → Needs Attention Dashboard (4 tabs). Show a sample alert card with severity badge.

**Example**: calculate-risk runs → Factory "Rangpur Garments" scores 82 → exceeds 75 threshold → auto-creates alert: "Risk spike: Rangpur Garments (82)" with severity "warning" → appears in Alerts tab → compliance officer clicks → sees risk breakdown → takes action.

**Session Notes**: _(to be filled)_

---

## Suggested Creation Order

### Phase 1 — The Core Story (5 infographics)
*Tell WOVO's detect→act→evidence mission*

1. **INF-04**: Supplier Risk Scoring — the platform's core metric
2. **INF-13**: Control Center Overview — the front door
3. **INF-06**: Case Management & AI Assistance — the "detect"
4. **INF-19**: Remediation Plan Lifecycle — the "act"
5. **INF-18**: Conversational AI with 16 Tools — the intelligence layer

### Phase 2 — The Intelligence Layer (6 infographics)
*Show the ML capabilities that differentiate WOVO*

6. **INF-07**: Case Clustering via Embeddings
7. **INF-11**: Worker Voice Trends
8. **INF-17**: 60-Day Risk Forecasting
9. **INF-16**: Monitoring Signals
10. **INF-08**: Payslip Anomaly Detection
11. **INF-09**: AI Survey Designer & Sentiment Analysis

### Phase 3 — Platform Architecture (5 infographics)
*Explain the engineering that makes it all work*

12. **INF-01**: The Three-Database Engine
13. **INF-02**: AI Provider Cascade & Rate Limiting
14. **INF-03**: ML Job Queue Engine
15. **INF-20**: Auto-Evidence Sweep & Audit Log
16. **INF-14**: Geographic Risk Map & Network Graph

### Phase 4 — Supporting Features (6 infographics)
*Complete the picture*

17. **INF-05**: HRDD Report Generation
18. **INF-12**: PDF-to-Course Pipeline
19. **INF-21**: Brands & Supply Chain Hierarchy
20. **INF-22**: Alert System & Needs Attention
21. **INF-10**: Survey Temporal Patterns
22. **INF-15**: AI Briefing & Pipeline Freshness

---

## Session Workflow

When starting a new session to create an infographic:

1. **Open this document** and find the target infographic brief
2. **Update status** to `in-progress`
3. **Reference the Key Source Files** listed in the brief — read them for accurate details
4. **Use the Content Outline** (What/Why/How/When/Under-the-hood) as the content skeleton
5. **Follow the Suggested Visual Type** for layout inspiration
6. **Create the infographic** (tool/format TBD per session)
7. **Add session notes** to the brief (design decisions, iterations, output file path)
8. **Update status** to `done` and record the output location
9. **Update the progress counters** in the header (Done count, percentage)

### Tips
- Start each session by reading the brief + source files — don't rely on memory
- The "Example" section in each brief can serve as the infographic's headline scenario
- "Under the hood" details are optional for business-heavy infographics (80% biz audience)
- Complex infographics may need 2 sessions — update notes accordingly
