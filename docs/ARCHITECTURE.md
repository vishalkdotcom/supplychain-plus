# SupplyChain+ Architecture Documentation

For a deep understanding of how the system works, read the **Mental Model** series:

## Mental Model Documents

Each document builds your intuition for one concept — the problem it solves, how it works under the hood, and why it was built that way.

| # | Document | Concept |
|---|----------|---------|
| 00 | [Overview](mental-model/00-overview.md) | The big picture: Detect → Act → Evidence |
| 01 | [Data Architecture](mental-model/01-data-architecture.md) | 5 databases, source vs. derived, cross-DB queries |
| 02 | [Risk Scoring](mental-model/02-risk-scoring.md) | Composite scoring, hardcoded weights, absence-as-risk |
| 03 | [Embeddings & Clustering](mental-model/03-embeddings-and-clustering.md) | Vectors, cosine similarity, HNSW, Union-Find |
| 04 | [Sentiment & Voice](mental-model/04-sentiment-and-voice.md) | LLM-based NLP, temporal trends, implicit positive injection |
| 05 | [Anomaly Detection](mental-model/05-anomaly-detection.md) | Rules vs. ML, minimum wage checks, tolerance |
| 06 | [Forecasting](mental-model/06-forecasting.md) | OLS regression, mean reversion, confidence scores |
| 07 | [Model Cascade](mental-model/07-model-cascade.md) | 11-model fallback, rate limiting, token budgets |
| 08 | [Queue Engine](mental-model/08-queue-engine.md) | Serial execution, FOR UPDATE SKIP LOCKED, retries |
| 09 | [Monitoring Signals](mental-model/09-monitoring-signals.md) | Silence detection, engagement decay, regional contagion |
| 10 | [Remediation & Evidence](mental-model/10-remediation-and-evidence.md) | Forward-only state machine, auto-evidence, deduplication |
| 11 | [Regulatory Compliance](mental-model/11-regulatory-compliance.md) | Framework-requirement-evidence chain, HRDD reports |
| 12 | [AI Assistant](mental-model/12-ai-assistant.md) | 15 tools, structured outputs, expert rules vs. LLM |
| 13 | [Frontend & Data Flow](mental-model/13-frontend-and-data-flow.md) | React Query, View Context, API patterns |

## Other Documentation

- [API Reference](API_REFERENCE.md) — Complete endpoint listing
- [Implementation Plan](IMPLEMENTATION_PLAN.md) — Wave-based development plan
