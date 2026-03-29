# WOVO+ Mental Model — Start Here

## What Is WOVO+?

You're responsible for 300 factories across 15 countries. Each has 500-5000 workers. Workers submit complaints, answer surveys, take training. Every day, new data pours in from all three channels.

Your job: **"Which factories need my attention right now, and why?"**

That's it. Every component in WOVO+ exists to answer some version of this question.

The catch: you can't just look at raw data. 300 factories x 3 channels x daily updates = information overload. You need **computed intelligence** — the system does the looking and tells you what it found.

## Why Does This System Exist?

Regulations. EU CSDDD (effective 2027), UK Modern Slavery Act, German LkSG — these laws say: "You must demonstrate you identified risks, took action, and can prove it." Failure = legal consequences.

This creates a three-phase loop that **every feature** maps to:

```
  DETECT              ACT                EVIDENCE
  Find problems  -->  Fix problems  -->  Prove you did both

  Risk scoring        Remediation         Audit trail
  Clustering          Action plans        Evidence linking
  Anomaly detection   Training deploy     HRDD reports
  Monitoring signals  Case resolution     Compliance matrix
  Sentiment analysis  Recommendations     Regulatory frameworks
```

## How These Documents Work

Each document below builds your intuition for **one concept**. They're ordered so each builds on the previous — but you can read any standalone.

| # | Document | What You'll Understand |
|---|----------|----------------------|
| [01](01-data-architecture.md) | **Data Architecture** | Why 5 databases? What's "source" vs "derived"? Why can you delete the intelligence layer and rebuild it? |
| [02](02-risk-scoring.md) | **Risk Scoring** | How messy data from 4 databases becomes one number. Why hardcoded weights beat ML here. Why absence is risk. |
| [03](03-embeddings-and-clustering.md) | **Embeddings & Clustering** | How 2000 multilingual complaints become 5 systemic patterns. What vectors are, why cosine similarity, how HNSW and Union-Find work. |
| [04](04-sentiment-and-voice.md) | **Sentiment & Voice Analytics** | Why LLMs work where traditional NLP fails. How temporal trends reveal what's getting worse. Why the system injects positive topics. |
| [05](05-anomaly-detection.md) | **Anomaly Detection** | When rules beat models. Why minimum wage checks don't need ML. The 10% tolerance trick. |
| [06](06-forecasting.md) | **Forecasting** | Why linear regression is the right choice for small noisy data. Mean reversion explained. What confidence scores really mean. |
| [07](07-model-cascade.md) | **Model Cascade & Rate Limiting** | How 10 LLM models fail gracefully. The 4-dimension token bucket. Why rate limits are persisted to the database. |
| [08](08-queue-engine.md) | **Queue Engine** | Why serial beats parallel here. FOR UPDATE SKIP LOCKED explained. Stale lock recovery. Exponential backoff. |
| [09](09-monitoring-signals.md) | **Monitoring Signals** | Detecting trouble by its absence. Why silence is the scariest signal. Regional contagion. Engagement decay. |
| [10](10-remediation-and-evidence.md) | **Remediation & Evidence** | The forward-only state machine. Auto-evidence: how the system notices when fixes work. Race-safe deduplication. |
| [11](11-regulatory-compliance.md) | **Regulatory Compliance** | The framework-requirement-evidence chain. How auto-linked evidence generates HRDD reports. |
| [12](12-ai-assistant.md) | **AI Assistant** | 15 tools, not magic. Why structured tools beat free-text generation. When expert rules beat LLM recommendations. |
| [13](13-frontend-and-data-flow.md) | **Frontend & Data Flow** | React Query as the only state manager. View scoping. The API layer pattern. |
| [14](14-genuine-engagement.md) | **Genuine Engagement** | Checkbox compliance vs. real engagement. The 4-dimension radar. What lopsided shapes reveal. |
| [15](15-ai-copilot.md) | **AI Copilot & Activity** | The passive intelligence feed. Priority cascade for insights. Cross-database activity stream. |
| [16](16-alerts-system.md) | **Alerts System** | Automated attention routing. Risk threshold alerts. Overdue remediation alerts. The NeedsAttentionTabs widget. |
| [17](17-dashboard-architecture.md) | **Dashboard Architecture** | How the Control Center composes all modules into one screen. Lazy loading. Data freshness. |

## The System at a Glance

```
  4 SOURCE DATABASES (ground truth, read-only)
  +-----------+  +-----------+  +----------+  +----------+
  | wovo_new  |  | wc_global |  |   WOVO   |  | iomadprod|
  | (PG)      |  | (PG)      |  | (SQL Srv)|  | (MySQL)  |
  | suppliers |  | workers   |  | cases    |  | training |
  | surveys   |  | roster    |  | payslips |  | courses  |
  +-----------+  +-----------+  +----------+  +----------+
        |              |              |              |
        +--------------+--------------+--------------+
                       |
                 9 batch jobs
                       |
                       v
  1 DERIVED DATABASE (computed intelligence, rebuildable)
  +--------------------------------------------------+
  |                    wovo_ai (PG)                   |
  | risk scores | embeddings | clusters | forecasts  |
  | anomalies | signals | remediations | briefings   |
  +--------------------------------------------------+
                       |
            +----------+----------+
            |          |          |
        Dashboard   AI Chat    Reports
```
