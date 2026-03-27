# WOVO Infographic Tracker

> **Created**: 2026-03-25
> **Purpose**: One infographic per feature — sell the idea, explain the value, show how it works. For business AND technical audiences alike.
> **Total Infographics**: 20
> **Progress**: 0/20 complete (0%)

## Quick Status

| Status | Count |
|--------|-------|
| Done | 0 |
| In Progress | 0 |
| Not Started | 20 |

---

## Quick-Reference Table

| ID | Title | Domain | Status | Complexity |
|----|-------|--------|--------|-----------|
| INF-01 | The Detect → Act → Evidence Loop | Core Philosophy | `not-started` | Medium |
| INF-02 | Supplier Risk Scoring — One Number That Tells the Whole Story | Suppliers | `not-started` | Complex |
| INF-03 | The Control Center — Your Compliance Command Post | Dashboard | `not-started` | Complex |
| INF-04 | Case Management & AI Assistance | Connect | `not-started` | Medium |
| INF-05 | Systemic Pattern Detection (Case Clustering) | Connect | `not-started` | Complex |
| INF-06 | Wage Anomaly Detection | Connect | `not-started` | Medium |
| INF-07 | AI Survey Designer & Sentiment Analysis | Engage | `not-started` | Medium |
| INF-08 | Worker Voice Trends — Listening at Scale | Engage | `not-started` | Medium |
| INF-09 | PDF-to-Course Pipeline — Training in Minutes | Educate | `not-started` | Medium |
| INF-10 | Monitoring Signals — Detecting What's Missing | Detection | `not-started` | Medium |
| INF-11 | 60-Day Risk Forecasting — See Problems Coming | Detection | `not-started` | Medium |
| INF-12 | The AI Assistant — Ask Anything About Your Supply Chain | AI | `not-started` | Complex |
| INF-13 | Remediation Plan Lifecycle — From Problem to Proof | Remediation | `not-started` | Complex |
| INF-14 | Auto-Evidence Sweep — Proof That Collects Itself | Remediation | `not-started` | Medium |
| INF-15 | HRDD Report Generation — Audit-Ready in Seconds | Suppliers | `not-started` | Simple |
| INF-16 | Brands & Supply Chain Hierarchy | Brands | `not-started` | Simple |
| INF-17 | The Intelligence Briefing — What Changed Overnight | Dashboard | `not-started` | Simple |
| INF-18 | Geographic Risk Map & Network Graph | Dashboard | `not-started` | Medium |
| INF-19 | The ML Pipeline — 8 Jobs That Power Everything | Operations | `not-started` | Medium |
| INF-20 | Cross-Module Context — Every Signal Connected | Platform | `not-started` | Simple |

---

## Detailed Briefs

---

### INF-01: The Detect → Act → Evidence Loop

| Field | Value |
|-------|-------|
| **Domain** | Core Philosophy |
| **Status** | `not-started` |
| **Complexity** | Medium |
| **Why this infographic exists** | This is the "elevator pitch" visual — the one you show first. It explains WOVO's core differentiator: not just detecting problems, but tracking the full lifecycle from detection through corrective action to documented evidence. |

**The Idea to Sell**:
Most compliance platforms stop at detection — they show you a dashboard of problems. WOVO closes the loop. Every detected issue (cluster, anomaly, alert) can become a remediation plan. Every remediation plan automatically collects evidence as actions are taken. Every piece of evidence maps back to the original detection. This is the loop that EU CSDDD, OECD Guidelines, and UK Modern Slavery Act demand.

**Content Outline**:
- **The Problem**: Compliance teams detect issues but struggle to prove they acted on them. Regulators ask "what did you do about it?" and teams scramble to compile evidence.
- **The Loop**:
  - **DETECT**: Risk scoring, case clustering, anomaly detection, monitoring signals, voice trends, forecasting — 8 ML jobs feeding intelligence from 3 databases
  - **ACT**: Remediation plans with 6-stage lifecycle (detected → root cause → action plan → implementing → verifying → closed)
  - **EVIDENCE**: Auto-evidence sweep cross-references resolved cases, training completions, and risk score improvements against active plans
- **Why It Matters**: The loop is self-reinforcing. Evidence from "act" feeds back into "detect" — a resolved remediation lowers the supplier's risk score, which changes the forecast, which updates the briefing.
- **Real Example**: Payslip anomaly detected (DETECT) → Remediation plan created, payroll audit conducted (ACT) → Auto-sweep finds 3 resolved cases + training completed + risk score dropped 15 points (EVIDENCE) → Plan verified and closed.

**Suggested Visual**: Circular flow diagram with three large segments (Detect / Act / Evidence) connected by arrows, with small icons showing specific features in each segment. Show the feedback loop where evidence feeds back into detection.

**Key Source Files**: `lib/jobs/constants.ts` (8 jobs), `components/remediation/status-pipeline.tsx` (6 stages), `lib/remediation/auto-evidence.ts`

**Session Notes**: _(to be filled)_

---

### INF-02: Supplier Risk Scoring — One Number That Tells the Whole Story

| Field | Value |
|-------|-------|
| **Domain** | Suppliers |
| **Status** | `not-started` |
| **Complexity** | Complex |
| **Why this infographic exists** | Risk scoring is the platform's core metric. Every other feature feeds into or reads from it. This infographic needs to make both a CEO and an engineer understand why one number (0-100) is enough to prioritize 220 suppliers. |

**The Idea to Sell**:
One composite score (0-100) that blends four independent dimensions: case severity, survey sentiment, training compliance, and engagement levels. Higher = more risk. The score isn't a black box — it comes with an explainable breakdown showing exactly which factor is driving the risk, plus a historical trend chart showing if things are getting better or worse.

**Content Outline**:
- **The Challenge**: A brand has 200+ factories across 16 countries. How do you decide which factory needs attention TODAY?
- **The Formula**: `riskScore = 25% cases + 25% surveys + 25% training + 25% engagement`
  - Cases: Are workers reporting problems? (SQL Server — 2,944 cases, 8,277 messages)
  - Surveys: What's the sentiment? (PostgreSQL — 285 surveys analyzed)
  - Training: Are workers being trained? (MySQL/Moodle — 3,172 completions)
  - Engagement: Is the factory active on the platform? (cross-DB activity tracking)
- **Explainability**: Each score comes with `reasons` — e.g., "High case volume (23 unresolved), declining survey sentiment (-12% this month)"
- **History**: Daily snapshots stored in `supplier_risk_history` enable 30/60/90 day trend charts
- **Thresholds**: Score >= 75 auto-generates alerts; score trends feed 60-day forecasts
- **Real Example**: Factory A: cases=82, surveys=65, training=93, engagement=40 → composite=70 → alert triggered, appears in briefing

**Suggested Visual**: A "funnel" or "4-input dial" showing the 4 data sources converging into one score. Below it, a sample trend chart. Side panel shows the explainable breakdown with reasons.

**Key Source Files**: `lib/jobs/handlers/calculate-risk.ts`

**Session Notes**: _(to be filled)_

---

### INF-03: The Control Center — Your Compliance Command Post

| Field | Value |
|-------|-------|
| **Domain** | Dashboard |
| **Status** | `not-started` |
| **Complexity** | Complex |
| **Why this infographic exists** | The dashboard is the first thing users see. This infographic shows the information hierarchy — how WOVO prioritizes what to show a busy compliance director at 9 AM. |

**The Idea to Sell**:
One screen answers "what needs my attention right now?" Six layers of information, from most urgent to most contextual:
1. **Pipeline Freshness** — Can I trust the data? (green/yellow/red indicators for each ML job)
2. **AI Briefing Bar** — What changed overnight? (pre-computed attention items)
3. **Priority Metrics** — 4 cards: High-Risk Suppliers, Urgent Cases, Trends, Training Coverage
4. **ML Intelligence** — 4 cards: Systemic Patterns, Forecast Alerts, Wage Anomalies, Sentiment Shift
5. **Needs Attention** — Tabbed section: Alerts, Urgent Cases, Risk Movements, Forecasts + AI Copilot Feed
6. **Visualizations** — Geographic risk map, supply chain network graph, risk distribution chart

**Content Outline**:
- **The Problem**: Data overload — 220 suppliers, 2,944 cases, 285 surveys, 71 anomalies. Where do you start?
- **The Solution**: Layered information architecture. Most urgent at top, deep analysis at bottom.
- **Smart Features**: Brand/Global view toggle, collapsible visualization section, pipeline freshness so you know when data was last refreshed
- **Real Example**: Morning login → briefing says "3 new systemic patterns detected" → ML card shows details → click through to cluster view → investigate → create remediation

**Suggested Visual**: Annotated wireframe/mockup of the dashboard showing the 6-layer layout. Each section labeled with its purpose and data source. Perhaps a "5 seconds / 30 seconds / 2 minutes" reading guide.

**Key Source Files**: `components/dashboard/dashboard-view.tsx`, `components/dashboard/metric-card.tsx`, `components/dashboard/ml-insight-cards.tsx`, `components/dashboard/needs-attention-tabs.tsx`, `components/dashboard/ai-briefing-bar.tsx`, `components/dashboard/pipeline-freshness-bar.tsx`

**Session Notes**: _(to be filled)_

---

### INF-04: Case Management & AI Assistance

| Field | Value |
|-------|-------|
| **Domain** | Connect Module |
| **Status** | `not-started` |
| **Complexity** | Medium |
| **Why this infographic exists** | Case management is WOVO's "detect" workhorse. The AI assistance layer (summarize, guide, draft response) is the key differentiator against manual case-by-case review. |

**The Idea to Sell**:
2,944 worker grievance cases with 8,277 messages — no human can read them all. WOVO's AI reads every case and provides: (1) a 1-2 sentence summary, (2) recommended investigation steps based on case type and region, (3) a draft response in the worker's language. The human makes the judgment call; the AI handles the paperwork.

**Content Outline**:
- **Scale of the Problem**: Hundreds of cases in multiple languages. Case officers spend 70% of time reading/summarizing, 30% actually helping.
- **AI Summarization**: Case messages → LLM → 1-2 sentence digest. Cached in `case_summary_cache` for instant access.
- **AI Guidance**: Analyzes case type + region + severity → suggests investigation steps. A "playbook" approach.
- **AI Draft Response**: Generates replies with tone/language selection (English, Vietnamese, Bengali, Mandarin, Khmer). Human reviews before sending.
- **Cross-Module Context**: Each case page shows the supplier's risk score, survey sentiment, and training status — so the officer sees the full picture.
- **Real Example**: 6-message wage delay case → AI summarizes in 1 sentence → guides "verify payroll records, interview line managers" → drafts response in Khmer → officer reviews and sends.

**Suggested Visual**: Workflow diagram: Inbox → Case Detail (messages) → AI Panel (summary + guidance + draft) → Action (respond/escalate/resolve). Show the three AI features as a side panel with icons.

**Key Source Files**: `app/connect/page.tsx`, `app/connect/[id]/page.tsx`, `app/api/ai/summarize/route.ts`, `app/api/ai/guidance/route.ts`, `app/api/ai/draft-response/route.ts`

**Session Notes**: _(to be filled)_

---

### INF-05: Systemic Pattern Detection (Case Clustering)

| Field | Value |
|-------|-------|
| **Domain** | Connect Intelligence |
| **Status** | `not-started` |
| **Complexity** | Complex |
| **Why this infographic exists** | This is WOVO's most unique ML feature. Individual cases look isolated — clustering reveals that 47 "overtime" cases across 12 factories are actually one regional systemic issue. This is the insight that manual review can never produce. |

**The Idea to Sell**:
What if 47 separate cases in 12 different factories are actually the *same problem*? WOVO converts case messages into mathematical representations (embeddings), groups similar messages together (clustering), and reveals systemic patterns that span multiple factories. A compliance officer reviewing cases one-by-one would never see this.

**Content Outline**:
- **The Blind Spot**: 2,944 cases reviewed individually. Each looks like a one-off problem. But what if they're connected?
- **How It Works** (simplified for business audience):
  1. Every case message is converted into a numerical "fingerprint" (1024 numbers) that captures its meaning
  2. Messages with similar fingerprints are grouped together
  3. AI labels each group: "Systematic Overtime Violations — Bangladesh Garment Sector" (critical)
  4. Groups shown on `/connect/clusters` with severity, affected factories, representative cases
- **Why It's Different**: Traditional compliance = read each case. WOVO = see the forest, not just the trees.
- **Technical Detail** (for tech audience): Ollama bge-m3 embeddings → pgvector HNSW kNN search → Union-Find connected components clustering → LLM labeling with Zod schema validation
- **Real Example**: 47 messages about overtime from 12 Bangladesh factories → clustered → labeled "critical systemic pattern" → compliance team investigates regionally instead of case-by-case.

**Suggested Visual**: Before/After split. Left: 47 scattered dots (individual cases). Right: dots grouped into 3 color-coded clusters with labels. Below: the pipeline (Messages → Embeddings → Clusters → Labels).

**Key Source Files**: `lib/jobs/handlers/case-clustering.ts`

**Session Notes**: _(to be filled)_

---

### INF-06: Wage Anomaly Detection

| Field | Value |
|-------|-------|
| **Domain** | Connect Intelligence |
| **Status** | `not-started` |
| **Complexity** | Medium |
| **Why this infographic exists** | Wage theft is the most common labor violation globally. WOVO automates detection across 16 countries with local currency matching — something manual audits routinely miss. |

**The Idea to Sell**:
1,174 payslips across 200 factories in 16 countries. Three types of violations detected automatically: (1) pay below legal minimum wage (in local currency — BDT, VND, INR, not USD), (2) sudden pay drops of >30% between periods, (3) suspicious gross-to-net ratios. Each anomaly gets an AI interpretation with severity and recommended action.

**Content Outline**:
- **The Problem**: Workers in Bangladesh earn in BDT, Vietnam in VND, India in INR. Comparing against minimum wage requires knowing each country's legal minimum *in local currency*. Most audit tools convert everything to USD and miss currency-specific violations.
- **Three Detection Rules**:
  - **Below Minimum**: Net pay < country minimum (Bangladesh: ৳12,500/month, Vietnam: ₫4,680,000, India: ₹10,000, etc.)
  - **Sudden Drop**: Pay decreased >30% from previous period for same factory
  - **Inconsistency**: Unusual gross-to-net ratio suggesting improper deductions
- **Currency Match Guard**: Only compares when payslip currency matches the minimum wage currency — prevents false positives (BDT payslip vs USD minimum)
- **AI Interpretation**: Each anomaly sent to LLM → returns severity (critical/warning/info), interpretation, and recommended action
- **Auto-Evidence**: Anomalies automatically attached to active remediation plans
- **Real Example**: Bangladesh factory pays ৳10,000/month → minimum is ৳12,500 → "below_minimum" critical → AI: "Net pay 20% below minimum, affecting 45 workers"

**Suggested Visual**: Three-panel detection diagram (Below Min / Sudden Drop / Inconsistency) with examples in local currencies. Show the 16-country minimum wage table as a reference card. Flow: Payslips → 3 Rules → AI Interpretation → Anomaly Report.

**Key Source Files**: `lib/jobs/handlers/payslip-anomaly.ts`

**Session Notes**: _(to be filled)_

---

### INF-07: AI Survey Designer & Sentiment Analysis

| Field | Value |
|-------|-------|
| **Domain** | Engage Module |
| **Status** | `not-started` |
| **Complexity** | Medium |
| **Why this infographic exists** | Shows two value propositions: (1) AI creates surveys from a simple prompt, (2) AI analyzes thousands of responses to extract sentiment and themes. Together they close the loop: design → collect → analyze → act. |

**The Idea to Sell**:
Type a sentence like "Ask about overtime and living conditions" → AI generates culturally appropriate survey questions in 5 languages → deploy to factories → collect responses → AI analyzes 22,675 responses across 285 surveys → extracts sentiment (43.7% positive, 41.7% negative, 14.6% neutral) and themes ("food quality", "overtime", "safety equipment") → themes tracked over time to show if interventions work.

**Content Outline**:
- **Survey Design**: Prompt → AI-generated questions → multi-language preview (English, Vietnamese, Bengali, Mandarin, Khmer) → save as draft → deploy
- **Analysis Pipeline**: Per-survey analysis (not global LIMIT 500) → LLM extracts sentiment percentages + themes + one-paragraph insight → stored in `survey_analysis`
- **Theme Tracking**: Themes tracked month-over-month in `survey_temporal_patterns` (708 patterns) → shows emerging vs. declining issues → proves whether interventions worked
- **Feeding the Loop**: Survey risk score feeds into supplier risk scoring (25% weight). Negative sentiment can trigger alerts.
- **Real Example**: "Assess worker satisfaction with food quality" → 8 questions generated → 450 responses → 62% negative on food → theme tracked → after canteen improvement → drops to 28% negative in 3 months.

**Suggested Visual**: Two-part flow: Left = Design (Prompt → Questions → Languages → Deploy). Right = Analysis (Responses → Sentiment Pie → Theme Bars → Trend Lines). Connect with "temporal tracking" arrow.

**Key Source Files**: `lib/jobs/handlers/analyze-surveys.ts`, `app/api/ai/survey/route.ts`, `app/engage/page.tsx`

**Session Notes**: _(to be filled)_

---

### INF-08: Worker Voice Trends — Listening at Scale

| Field | Value |
|-------|-------|
| **Domain** | Engage Intelligence |
| **Status** | `not-started` |
| **Complexity** | Medium |
| **Why this infographic exists** | Voice trends answer "what are workers talking about and is it getting better or worse?" — the most intuitive way for a brand executive to understand worker well-being at scale. |

**The Idea to Sell**:
Thousands of survey responses distilled into a monthly "pulse": what topics are emerging (growing mentions), what's declining (interventions working), and how overall sentiment is shifting. Includes built-in corrections for LLM negativity bias by injecting implicit positive topics (employment stability, peer support, skills development).

**Content Outline**:
- **The Insight**: Raw survey responses are noisy. Voice trends extract signal: "Payment Delays" is emerging (+34% this month), "Safety Equipment" is declining (-22% after PPE distribution).
- **Monthly Extraction**: Group responses by month → LLM topic extraction in batches of 50 → returns topics with mentions + sentiment
- **Delta Tracking**: Compare current month vs. previous → classify as emerging (↑) or declining (↓)
- **Negativity Bias Correction**: LLMs focus on problems. WOVO injects 5 implicit positive/neutral topics: Employment Stability, Peer & Community Support, Skills Development, Factory Operations, Worker Engagement — because workers having employment IS a positive signal.
- **Sentiment Score**: `(positive_count - negative_count) / total * 100` — tracks overall worker well-being trajectory
- **Real Example**: March: "Payment Delays" +34%, "Safety Equipment" -22%. Overall sentiment: -12 (improving from -28 in January). Intervention on payment delays recommended.

**Suggested Visual**: Timeline chart showing 4-5 topic lines over 6 months (some rising, some falling). Annotate intervention points. Side panel showing sentiment score gauge. Callout box explaining the negativity bias correction.

**Key Source Files**: `lib/jobs/handlers/worker-voice-analytics.ts`, `app/engage/voice-trends/page.tsx`

**Session Notes**: _(to be filled)_

---

### INF-09: PDF-to-Course Pipeline — Training in Minutes

| Field | Value |
|-------|-------|
| **Domain** | Educate Module |
| **Status** | `not-started` |
| **Complexity** | Medium |
| **Why this infographic exists** | Turns a painful manual process (creating multilingual training content) into a drag-and-drop workflow. The value prop is time savings + language accessibility. |

**The Idea to Sell**:
Upload a safety manual PDF → AI extracts content → generates structured lessons → creates quiz questions → translates to 5 languages → deploy to factory workers. What used to take weeks of L&D effort happens in minutes. Training completion feeds back into risk scoring (25% weight).

**Content Outline**:
- **The Pain**: Creating compliance training in Vietnamese, Bengali, Mandarin, Khmer, and English for 200 factories requires translators, instructional designers, and months of lead time.
- **The Pipeline**: Upload PDF → visual progress (Uploading → Extracting → Generating → Ready) → AI lesson generation → AI quiz generation (Zod-validated) → multi-language translation → deploy
- **Completion Tracking**: 3,172+ course completions tracked via Moodle/MySQL integration → feeds into training score (25% of risk)
- **Feedback Loop**: Low training completion → higher risk score → training recommended in AI guidance → more courses deployed
- **Real Example**: "Fire Safety Manual.pdf" (42 pages) → 6 lessons + 15 quiz questions → translated to Vietnamese + Bengali → deployed to 3 factories → 87% completion in 2 weeks.

**Suggested Visual**: Linear pipeline with 6 stages: PDF → Extract → Lessons → Quizzes → Translate (5 flags) → Deploy. Show the 4-stage progress indicator. Side arrow showing completion % feeding back into risk score.

**Key Source Files**: `app/educate/page.tsx`, `app/api/ai/educate/route.ts`

**Session Notes**: _(to be filled)_

---

### INF-10: Monitoring Signals — Detecting What's Missing

| Field | Value |
|-------|-------|
| **Domain** | Detection |
| **Status** | `not-started` |
| **Complexity** | Medium |
| **Why this infographic exists** | This is a counterintuitive concept — detecting the *absence* of data as a risk signal. "No news" from a factory isn't good news. This idea needs selling because it's WOVO's most novel detection approach. |

**The Idea to Sell**:
Traditional compliance watches for problems. WOVO also watches for *silence*. Three signal types detect what ISN'T happening:
1. **Supplier Silence**: Zero cases/surveys for 60+ days. No activity from a factory could mean everything is fine — or workers are afraid to speak.
2. **Engagement Decay**: Declining survey participation or training completion. Workers disengaging is an early warning sign.
3. **Regional Contagion**: Same issue pattern across 3+ factories in one region. If neighboring factories share a problem, yours might too.

**Content Outline**:
- **The Insight**: The most dangerous factories are often the quietest. A factory with zero complaints in 90 days and a risk score of 72 is suspicious, not safe.
- **Three Signal Types** (each a panel):
  - Silence: Calendar showing 60+ days of inactivity → red flag → "Why aren't workers reporting?"
  - Decay: Downward trend line of participation → "Workers are disengaging"
  - Contagion: Map showing 4+ red dots in same region → "Regional systemic issue"
- **Triggered After Risk Scoring**: Signals computed as part of `calculate-risk` job, using fresh risk data
- **Current Data**: 91 signals detected — 64 critical, 27 warning
- **Real Example**: "Myanmar Textiles" — 0 cases in 90 days, risk score 72 → "critical silence" signal → compliance team reaches out → discovers fear of retaliation.

**Suggested Visual**: Three side-by-side panels (Silence / Decay / Contagion) each with a visual metaphor: empty calendar, declining graph, spreading map dots. Below: "91 signals detected: 64 critical, 27 warning."

**Key Source Files**: `lib/jobs/monitoring-signals.ts`

**Session Notes**: _(to be filled)_

---

### INF-11: 60-Day Risk Forecasting — See Problems Coming

| Field | Value |
|-------|-------|
| **Domain** | Detection |
| **Status** | `not-started` |
| **Complexity** | Medium |
| **Why this infographic exists** | Shifts compliance from reactive to predictive. "This factory will be high-risk in 6 weeks" is a fundamentally different conversation than "this factory is high-risk today." |

**The Idea to Sell**:
Using historical risk score data, WOVO predicts each supplier's risk score 30 and 60 days ahead. The prediction comes with a confidence score (how reliable is this forecast?) and an AI-generated explanation (why is this factory trending this way?). This lets compliance teams intervene *before* problems become crises.

**Content Outline**:
- **Reactive vs. Predictive**: Today's dashboard shows today's problems. Forecasting shows next month's problems — giving time to prevent them.
- **The Method**: Ordinary least-squares linear regression on 90 days of daily risk score snapshots → project the trend line forward → confidence via R² coefficient
- **Three Outputs**:
  - Predicted score at day 30 and day 60
  - Confidence (R² from 0 to 1; avg 0.37 across 220 suppliers)
  - Trend direction: rising / falling / stable (slope threshold: ±0.1)
- **AI Reasoning**: LLM generates explanation: "Increasing case volume and declining survey sentiment suggest growing labor issues"
- **Scale**: 440 forecasts (220 suppliers × 2 time horizons)
- **Real Example**: "Dhaka Apparel" risk: 45→52→58→63 over 4 months → forecast: 71 at day 30, 78 at day 60 → R²=0.89 (high confidence) → "rising" → intervene now before it crosses 75 threshold.

**Suggested Visual**: Scatter plot with trend line extending into future (dashed). Confidence band (shaded area) around forecast. Annotate: "Intervene HERE" at the point before threshold crossing. Side panel showing the slope/confidence/direction outputs.

**Key Source Files**: `lib/jobs/handlers/risk-forecast.ts`

**Session Notes**: _(to be filled)_

---

### INF-12: The AI Assistant — Ask Anything About Your Supply Chain

| Field | Value |
|-------|-------|
| **Domain** | AI |
| **Status** | `not-started` |
| **Complexity** | Complex |
| **Why this infographic exists** | The AI assistant turns WOVO from a dashboard-you-read into a system-you-ask. 16 tools mean it can answer questions that span every module. This needs to show both the simplicity of asking and the sophistication of what happens behind the scenes. |

**The Idea to Sell**:
Instead of navigating 10 different pages and cross-referencing data manually, ask: "Which Bangladesh suppliers have rising risk, unresolved wage anomalies, AND declining survey sentiment?" The AI queries multiple data sources simultaneously and synthesizes a single, visual answer — with charts and tables, not just text.

**Content Outline**:
- **The Problem**: Compliance data is siloed across modules. Answering cross-cutting questions requires visiting Suppliers, Connect, Engage, and Forecasts pages and mentally combining the results.
- **16 Tools Available** (14 read, 2 write):
  - Read: supplier risk, cases, surveys, training, alerts, playbooks, clusters, voice trends, anomalies, forecasts, monitoring signals, remediations, risk history
  - Write: mark alerts read, trigger risk recalculation
- **How It Works**: User question → LLM selects relevant tools → tools query databases → results returned → LLM synthesizes narrative + visual cards
- **Visual Responses**: Not just text — bar charts, tables, lists rendered inline in chat
- **Session Management**: Create, rename, pin, resume conversations. History persisted.
- **Real Example**: "Show me suppliers with rising risk forecasts and unresolved anomalies in Bangladesh" → AI calls queryForecasts + queryAnomalies → cross-references → "3 suppliers match: Factory A (forecast 72→85, 2 wage violations)..."

**Suggested Visual**: Architecture/flow: User Question → LLM Brain → 16 Tool Icons (radial layout) → Selected Tools Fire → Database Queries → Synthesized Answer (chat bubble with embedded chart). Show a sample conversation.

**Key Source Files**: `lib/ai/tools.ts`, `lib/ai/prompts.ts`, `app/ai/page.tsx`, `app/api/ai/chat/route.ts`

**Session Notes**: _(to be filled)_

---

### INF-13: Remediation Plan Lifecycle — From Problem to Proof

| Field | Value |
|-------|-------|
| **Domain** | Remediation |
| **Status** | `not-started` |
| **Complexity** | Complex |
| **Why this infographic exists** | This is the "act" in detect→act→evidence. It's the feature that makes WOVO a compliance platform rather than just a monitoring dashboard. Auditors specifically look for this workflow. |

**The Idea to Sell**:
Every detected issue can become a tracked remediation plan with 6 stages: Detected → Root Cause → Action Plan → Implementing → Verifying → Closed. Each stage has clear entry/exit criteria. AI suggests root causes and next steps. An immutable audit log records every change — who, when, what field, old value, new value. This is the evidence trail that EU CSDDD requires.

**Content Outline**:
- **Why Remediation Matters**: Regulators don't ask "did you find problems?" — they ask "what did you do about them, and can you prove it?"
- **6 Stages** (each with icon and purpose):
  1. Detected: Issue identified from alert, anomaly, or cluster
  2. Root Cause: AI-assisted investigation (why is this happening?)
  3. Action Plan: Concrete corrective steps defined
  4. Implementing: Actions being executed by supplier/brand team
  5. Verifying: Checking outcomes — did the fix work?
  6. Closed: Verified complete with evidence collected
- **AI Root Cause Analysis**: System analyzes the issue and suggests probable root causes
- **Advancement Suggestions**: AI recommends when a plan is ready to move to the next stage
- **Overdue Tracking**: Plans past target date flagged prominently
- **Source Types**: Plans can originate from alerts, supplier issues, case patterns, or manual creation
- **Real Example**: Wage anomaly alert → Create plan → Root cause: "Payroll calculation error" → Action: "Audit payroll, retrain staff" → Implementing (2 weeks) → Verify (check next payslips) → Closed with evidence attached.

**Suggested Visual**: Horizontal pipeline showing 6 stages as connected nodes with icons, progressing left to right (grey → blue → green). A sample plan card "traveling" through the pipeline. Below: audit log snippet showing timestamps.

**Key Source Files**: `components/remediation/status-pipeline.tsx`, `app/remediation/page.tsx`, `app/remediation/[id]/page.tsx`

**Session Notes**: _(to be filled)_

---

### INF-14: Auto-Evidence Sweep — Proof That Collects Itself

| Field | Value |
|-------|-------|
| **Domain** | Remediation |
| **Status** | `not-started` |
| **Complexity** | Medium |
| **Why this infographic exists** | The most tedious part of compliance is gathering evidence that you fixed the problem. WOVO automates this by cross-referencing data from 3 databases against active plans. This is the "evidence" in detect→act→evidence. |

**The Idea to Sell**:
When a remediation plan is active, WOVO automatically looks for proof that things are improving — without anyone manually uploading documents. It cross-references:
- Resolved cases from SQL Server → "3 grievances resolved this month"
- Training completions from MySQL/Moodle → "45 workers completed wage compliance training"
- Risk score improvements from PostgreSQL → "Risk dropped from 78 to 62"
Each piece of evidence is deduplicated (won't attach the same proof twice) and timestamped on an evidence timeline.

**Content Outline**:
- **The Pain**: Manual evidence collection = screenshots, emails, Excel exports compiled by hand for each audit.
- **5 Evidence Types**: case_resolved, survey_improvement, training_completed, risk_score_drop, anomaly_resolved
- **How Auto-Sweep Works**: Runs as 8th job in ML pipeline → queries all 3 databases → matches findings against active remediation plans by supplier → auto-attaches with dedup
- **Deduplication**: `buildReferenceId("case_resolved", "2026-03-25", "supplier_42", "sweep")` → deterministic key prevents duplicate entries
- **Immutable Audit Log**: Every change recorded — who, when, what field, old value, new value. Append-only (never modified or deleted).
- **Real Example**: Active plan for Factory X → sweep finds: 3 resolved cases + 45 training completions + risk score -16 points → all auto-attached → audit log shows system attached evidence at 08:00Z.

**Suggested Visual**: Three database icons (SQL Server, MySQL, PostgreSQL) → arrows pointing to "Evidence Sweep" gear → arrows out to "Evidence Timeline" attached to a remediation card. Show 3 evidence type cards with dedup checkmarks.

**Key Source Files**: `lib/jobs/handlers/remediation-evidence-sweep.ts`, `lib/remediation/auto-evidence.ts`, `components/remediation/evidence-timeline.tsx`, `components/remediation/audit-log.tsx`

**Session Notes**: _(to be filled)_

---

### INF-15: HRDD Report Generation — Audit-Ready in Seconds

| Field | Value |
|-------|-------|
| **Domain** | Suppliers |
| **Status** | `not-started` |
| **Complexity** | Simple |
| **Why this infographic exists** | The tangible deliverable — a downloadable PDF that compliance teams hand to auditors. Shows WOVO isn't just a dashboard; it produces the actual documents regulators require. |

**The Idea to Sell**:
Click one button, get a Human Rights Due Diligence (HRDD) report. The PDF combines risk scores, case history, survey sentiment, training compliance, and an AI-narrated executive summary — formatted for EU CSDDD and UK Modern Slavery Act compliance. What used to take days of manual compilation happens in seconds.

**Content Outline**:
- **The Regulatory Need**: CSDDD, OECD Guidelines, UK Modern Slavery Act all require documented due diligence evidence
- **What's in the Report**: Supplier profile, risk breakdown (4 factors), case summary table, survey sentiment, training status, AI-generated executive narrative, compliance checklist
- **How It Works**: Click "Export HRDD" on supplier page → system gathers all data → AI writes narrative → jsPDF renders PDF → download
- **Real Example**: Q1 report for "Vietnam Garments Co." → 4-page PDF with risk breakdown, case summary, AI narrative, regulatory checklist → ready for auditor in 10 seconds.

**Suggested Visual**: Document mockup showing the report sections (cover page, risk dashboard, case table, narrative, checklist). Arrow from "1-click export" button to the PDF. Badge: "EU CSDDD compliant."

**Key Source Files**: Supplier detail page (export button), PDF generation using jsPDF + jspdf-autotable

**Session Notes**: _(to be filled)_

---

### INF-16: Brands & Supply Chain Hierarchy

| Field | Value |
|-------|-------|
| **Domain** | Brands |
| **Status** | `not-started` |
| **Complexity** | Simple |
| **Why this infographic exists** | Brands think in portfolios, not individual factories. This infographic shows how WOVO lets a brand director see "my 30 factories" vs. all 220, with aggregate risk. |

**The Idea to Sell**:
A brand compliance director doesn't care about all 220 suppliers — they care about their 30. WOVO's brand view filters the entire platform: dashboard metrics, risk scores, cases, surveys, training — everything scoped to just the factories in their portfolio. Parent-child relationships (126 hierarchy mappings) enable aggregate risk: if 3 of your 8 factories are high-risk, your brand risk reflects that.

**Content Outline**:
- **Portfolio View**: Brand list page → aggregate metrics per brand (avg risk, factory count, case count)
- **Brand Detail**: Click a brand → see all child factories with risk scores → drill into any factory
- **Global vs. Brand Toggle**: Dashboard switch filters ALL widgets, not just the supplier list
- **Network Visualization**: Supply chain hierarchy shown as an interactive node graph (brand → factories)
- **Real Example**: "GlobalWear Inc." — 8 factories: 2 Bangladesh (risk 72, 68), 3 Vietnam (45, 52, 38), 3 Cambodia (61, 55, 49). Brand aggregate: 55.

**Suggested Visual**: Tree diagram: Brand node at top → factory nodes below, each with risk score colored badge. Toggle switch showing Global (220 dots) vs. Brand (8 dots) view.

**Key Source Files**: `app/brands/page.tsx`, `app/brands/[id]/page.tsx`, `components/view-context.tsx`

**Session Notes**: _(to be filled)_

---

### INF-17: The Intelligence Briefing — What Changed Overnight

| Field | Value |
|-------|-------|
| **Domain** | Dashboard |
| **Status** | `not-started` |
| **Complexity** | Simple |
| **Why this infographic exists** | The briefing is WOVO's "proactive intelligence" — it tells you what to look at before you ask. This differentiates WOVO from passive dashboards that wait for you to explore. |

**The Idea to Sell**:
Every morning, WOVO has already analyzed all your data and prepared a briefing: "15 suppliers at high risk (concentrated in Bangladesh), 2 new systemic patterns detected, training coverage improved 5%." Each attention item is categorized (critical / watch / positive) and comes with a pre-built AI chat query — click to investigate immediately.

**Content Outline**:
- **Proactive vs. Reactive**: Most dashboards show numbers and wait. WOVO says "look HERE."
- **Attention Items**: Generated by aggregating across all ML tables — high-risk suppliers by region, active clusters, unresolved anomalies, rising forecasts, monitoring signals
- **Three Severities**: Critical (action required), Watch (monitor closely), Positive (good news worth noting)
- **Ask AI Button**: Each item includes a pre-built query — click to open AI chat with the question pre-filled
- **Freshness Indicator**: Shows when each of the 8 ML jobs last ran (green/yellow/red), so you know if the briefing is current
- **Real Example**: Morning login → "15 suppliers at high risk, concentrated in Bangladesh (8), Vietnam (4), Cambodia (3)" → click "Ask AI" → "Show me the 15 high-risk suppliers and their risk factors"

**Suggested Visual**: Mock briefing card with 3 attention items (color-coded by severity). Below: freshness bar showing 8 job indicators with timestamps. "Ask AI" button highlighted.

**Key Source Files**: `lib/jobs/handlers/generate-briefing.ts`, `components/dashboard/ai-briefing-bar.tsx`, `components/dashboard/pipeline-freshness-bar.tsx`

**Session Notes**: _(to be filled)_

---

### INF-18: Geographic Risk Map & Network Graph

| Field | Value |
|-------|-------|
| **Domain** | Dashboard Visualizations |
| **Status** | `not-started` |
| **Complexity** | Medium |
| **Why this infographic exists** | Spatial visualization reveals patterns invisible in tables. "All high-risk factories are in one country" or "all red factories share one parent company" are insights only visual tools can deliver. |

**The Idea to Sell**:
Two complementary views: (1) a world map showing where your factories are and how risky they are (red/amber/green pins), revealing geographic concentration of risk, and (2) a network graph showing ownership relationships (which brand owns which factories), revealing corporate-structural risk patterns.

**Content Outline**:
- **Geographic Map**: World map (react-simple-maps + D3) → supplier locations from lat/lng data → pins colored by risk score (>=70 red, >=50 amber, <50 green) → hover for details
- **Network Graph**: Interactive node diagram (@xyflow/react) → brands as parent nodes, factories as child nodes → edges show ownership → node color = risk level → drag/zoom/pan
- **Pattern Examples**:
  - Geographic: "8 red pins clustered in Bangladesh" → regional issue
  - Network: "All factories under Brand X are amber or red" → parent company issue
- **Real Example**: Map shows cluster of 8 red pins in Bangladesh → network graph reveals they all belong to "Global Textiles Inc." → investigation reveals systematic overtime policy pushed by parent company.

**Suggested Visual**: Side-by-side: Left = world map zoomed into SE Asia with color-coded pins. Right = network tree with brand → factory connections, color-coded nodes. Annotations pointing out patterns.

**Key Source Files**: `components/dashboard/geographic-risk-map.tsx`, `components/dashboard/supply-chain-network.tsx`

**Session Notes**: _(to be filled)_

---

### INF-19: The ML Pipeline — 8 Jobs That Power Everything

| Field | Value |
|-------|-------|
| **Domain** | Operations |
| **Status** | `not-started` |
| **Complexity** | Medium |
| **Why this infographic exists** | This explains *how* all the intelligence gets computed. It's the "backstage tour" — showing the 8-job pipeline that makes the dashboard, briefings, forecasts, and evidence possible. |

**The Idea to Sell**:
Behind every insight on the dashboard, 8 ML batch jobs run in a specific order. Each job reads from source databases, computes intelligence, and writes results that the next job depends on. The pipeline runs daily (or on-demand) and takes raw data through risk scoring → sentiment analysis → pattern detection → anomaly scanning → forecasting → voice analytics → briefing → evidence collection.

**Content Outline**:
- **The 8 Jobs in Order**:
  1. **Risk Scoring**: Cases + Surveys + Training → composite score per supplier
  2. **Survey Analysis**: 285 surveys → sentiment + themes + insights
  3. **Case Clustering**: 2,000 messages → embeddings → systemic patterns
  4. **Payslip Anomaly**: 1,174 payslips → wage violations detected
  5. **Risk Forecast**: 90-day history → 60-day predictions
  6. **Voice Analytics**: Monthly feedback → emerging/declining topics
  7. **Briefing**: All outputs → daily intelligence digest
  8. **Evidence Sweep**: Active remediations → auto-attach proof
- **Why Order Matters**: Risk scoring must run first (others use scores). Briefing must run last (aggregates all outputs). Evidence sweep is last because it cross-references everything.
- **Serialization**: Case clustering uses local GPU (Ollama) for embeddings — serialized to prevent VRAM thrashing. All other jobs use cloud AI providers.
- **Scheduling**: Manual trigger, cron-based schedules, or "Run All" one-click

**Suggested Visual**: Vertical pipeline/waterfall: 8 numbered boxes connected by arrows top-to-bottom. Each box shows input → output. Highlight the serialization gate for job #3. Side panel: "Run All" button + schedule indicator.

**Key Source Files**: `lib/jobs/constants.ts`, `lib/jobs/queue-engine.ts`, `lib/jobs/handlers/`

**Session Notes**: _(to be filled)_

---

### INF-20: Cross-Module Context — Every Signal Connected

| Field | Value |
|-------|-------|
| **Domain** | Platform |
| **Status** | `not-started` |
| **Complexity** | Simple |
| **Why this infographic exists** | This is a subtle but powerful feature — when you look at any supplier, you see their cases AND surveys AND training AND risk AND anomalies in one place. Most platforms silo this data. WOVO connects it. |

**The Idea to Sell**:
When a compliance officer opens a case, they don't just see messages — they see the supplier's risk score, recent survey sentiment, training completion rate, active remediations, and monitoring signals. Every page in WOVO shows cross-module context, so you never investigate in isolation.

**Content Outline**:
- **The Silo Problem**: Traditional tools: one tool for cases, another for surveys, another for training. Cross-referencing is manual and slow.
- **WOVO's Approach**: Every entity (supplier, case, survey, course) is connected. Supplier detail pages show all modules. Case pages show the supplier's full context.
- **Examples of Cross-Module Data**:
  - Supplier page: risk score + cases + surveys + training + forecasts + anomalies + remediations + monitoring signals + voice trends
  - Case page: case messages + supplier risk breakdown + training status + survey sentiment
  - AI Assistant: can query across ALL modules simultaneously
- **Why It Matters**: A case about "overtime" at a factory with declining training completion and rising risk forecast tells a different story than the same case at a factory with 95% training and stable risk.
- **The 3-Database Stitch**: SQL Server (cases) + MySQL (training) + PostgreSQL (analytics) all rendered on one page via the cache layer.

**Suggested Visual**: A supplier "hub" diagram with spokes connecting to each module: Cases (left), Surveys (top-left), Training (top-right), Risk (right), Forecasts (bottom-right), Anomalies (bottom-left), Remediations (bottom). Show how viewing any one node reveals all connected data.

**Key Source Files**: Supplier detail page, case detail page, `lib/api.ts`

**Session Notes**: _(to be filled)_

---

## Alert System & Needs Attention

*Note: The alert system is covered within INF-03 (Control Center) under the "Needs Attention" section and INF-02 (Risk Scoring) where alerts are auto-generated at threshold >= 75. It doesn't need a standalone infographic as it's better understood in context of those features.*

---

## Session Workflow

When starting a new session to create an infographic:

1. **Open this document** and find the target infographic brief
2. **Update status** to `in-progress`
3. **Reference the Key Source Files** listed in the brief — read them for accurate details
4. **Use the Content Outline** as the content skeleton
5. **Follow the Suggested Visual Type** for layout inspiration
6. **Create the infographic** (tool/format TBD per session)
7. **Add session notes** to the brief (design decisions, iterations, output file path)
8. **Update status** to `done` and record the output location
9. **Update the progress counters** in the header (Done count, percentage)

### Tips
- Start each session by reading the brief + source files — don't rely on memory
- The "Real Example" in each brief can serve as the infographic's headline scenario
- "Under the hood" and technical details are optional — include what helps understanding, skip what's just implementation trivia
- Focus on **selling the idea**: Why does this exist? What problem does it solve? Why should anyone care?
- Complex infographics may need 2 sessions — update notes accordingly
