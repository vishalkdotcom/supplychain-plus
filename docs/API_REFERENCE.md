# API Reference

All endpoints are Next.js App Router API routes under `app/api/`. Base URL: `http://localhost:3030/api`

## Table of Contents

- [Health & System](#health--system)
- [Dashboard & Metrics](#dashboard--metrics)
- [Suppliers](#suppliers)
- [Brands](#brands)
- [Connect — Cases](#connect--cases)
- [Connect — Clusters](#connect--clusters)
- [Connect — Payslip Anomalies](#connect--payslip-anomalies)
- [Engage — Surveys & Voice](#engage--surveys--voice)
- [Educate — Training](#educate--training)
- [Governance — Regulatory](#governance--regulatory)
- [Remediation](#remediation)
- [AI Features](#ai-features)
- [Pipeline Jobs](#pipeline-jobs)

---

## Health & System

System health, data freshness, and activity tracking.

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/health` | System health check across all 3 databases |
| GET | `/api/freshness` | Data pipeline freshness timestamps |
| GET | `/api/activities` | Recent activity stream across modules |
| GET | `/api/timeline` | Full activity timeline with filtering |
| GET | `/api/demo-users` | Demo user list for role switching |

## Dashboard & Metrics

Aggregated metrics, alerts, and AI-generated insights for the control center.

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/metrics` | Aggregated dashboard metrics (risk scores, case counts, survey stats) |
| GET | `/api/metrics/briefing` | Latest intelligence briefing summary |
| GET | `/api/ml-insights` | ML-generated insight cards |
| GET | `/api/monitoring-signals` | Supplier monitoring signals (silence detection, anomalies) |
| GET | `/api/forecasts` | Risk forecast data (60-day predictions) |
| GET | `/api/recommendations` | AI-generated action recommendations |
| GET | `/api/intelligence` | Cross-module intelligence feed |
| GET | `/api/regional-insights` | Regional benchmarking and peer comparison |
| GET, PATCH | `/api/alerts` | List alerts / dismiss an alert |

## Suppliers

Supplier profiles, risk scores, and history.

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/suppliers` | List suppliers with risk scores and pagination |
| GET | `/api/suppliers/[id]` | Supplier detail with risk breakdown |
| GET | `/api/suppliers/[id]/history` | Risk score history over time |
| GET | `/api/suppliers/[id]/training` | Training completion data from Moodle |

## Brands

Parent company / brand management with supplier rollups.

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/brands` | List brands with aggregated metrics |
| GET | `/api/brands/[id]` | Brand detail with factory rollup |

## Connect — Cases

Worker grievance case management sourced from SQL Server.

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/cases` | List cases with filtering and pagination |
| GET | `/api/cases/[id]` | Case detail with messages and notes |
| PATCH | `/api/cases/[id]/status` | Update case status (workflow transitions) |
| GET | `/api/cases/[id]/context` | Cross-module context for AI analysis |

## Connect — Clusters

Case clustering via pgvector embeddings for pattern detection.

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/clusters` | List case clusters with themes |
| GET | `/api/clusters/[id]` | Cluster detail with member cases |
| GET | `/api/clusters/trends` | Cluster trend history (daily snapshots) |

## Connect — Payslip Anomalies

Wage compliance analysis detecting deviations from local minimum wage.

| Method | Path | Purpose |
|--------|------|---------|
| GET, PATCH | `/api/payslip-anomalies` | List anomalies / update anomaly status |
| GET | `/api/payslip-anomalies/trends` | Anomaly trend analysis over time |

## Engage — Surveys & Voice

Worker survey deployment, sentiment analysis, and voice trends.

| Method | Path | Purpose |
|--------|------|---------|
| GET, POST | `/api/surveys` | List analyzed surveys / trigger new analysis |
| GET | `/api/voice-trends` | Worker voice topic trends (monthly themes) |
| GET | `/api/voice-trends/suppliers` | Per-supplier voice trend data |

## Educate — Training

Training course data from Moodle/iOMAD LMS.

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/courses` | List courses with completion rates |

## Governance — Regulatory

Regulatory framework compliance tracking.

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/regulatory/frameworks` | List regulatory frameworks (EU CSDDD, UK MSA, etc.) |
| GET | `/api/regulatory/frameworks/[id]` | Framework detail with requirements |
| GET | `/api/regulatory/compliance` | Compliance matrix across suppliers |
| GET | `/api/regulatory/compliance/[supplierId]` | Per-supplier compliance status |

## Remediation

Remediation plan creation, evidence collection, and audit trail.

| Method | Path | Purpose |
|--------|------|---------|
| GET, POST | `/api/remediations` | List plans / create new remediation plan |
| GET, PATCH | `/api/remediations/[id]` | Plan detail / update plan |
| GET, POST | `/api/remediations/[id]/evidence` | List evidence / add evidence item |
| GET | `/api/remediations/[id]/audit` | Audit log for the plan |
| GET | `/api/remediations/[id]/export` | PDF export (HRDD narrative) |
| GET | `/api/remediations/overdue` | List overdue remediation plans |

## AI Features

AI-powered analysis, chat, and content generation using Vercel AI SDK.

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/ai/chat` | Streaming AI chat with 29 multi-module tools |
| GET, PATCH | `/api/ai/chat/sessions` | List sessions / rename or delete session |
| GET | `/api/ai/chat/history` | Chat message history for a session |
| GET | `/api/ai/briefing` | Latest intelligence briefing |
| POST | `/api/ai/summarize` | Case summarization |
| POST | `/api/ai/guidance` | Case guidance (steps, draft reply, training recs) |
| POST | `/api/ai/draft-response` | Generate draft response to worker |
| GET | `/api/ai/playbook` | Case resolution playbook |
| POST | `/api/ai/remediation-root-cause` | Root cause analysis for remediation |
| POST | `/api/ai/reports` | HRDD narrative report generation |
| POST | `/api/ai/educate` | Training course recommendations |
| POST | `/api/ai/survey` | Survey question generation |
| GET, POST | `/api/ai/translate` | Get supported languages / translate text |
| POST | `/api/ai/translate/course` | Translate course content |

## Pipeline Jobs

Background job pipeline for compute-heavy analytics. Jobs run asynchronously with retry, timeout, and scheduling support.

### Job Management

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/jobs/trigger` | Trigger one or more jobs by type |
| POST | `/api/jobs/cancel/[id]` | Cancel a running job |
| GET | `/api/jobs/runs` | List job run history |
| GET | `/api/jobs/runs/[id]` | Job run detail with logs |
| GET | `/api/jobs/queue/status` | Current queue status |
| GET, POST | `/api/jobs/schedules` | List schedules / create schedule |
| PATCH, DELETE | `/api/jobs/schedules/[id]` | Update / delete schedule |

### Direct Job Triggers

Each job type has a dedicated POST endpoint for direct triggering:

| Method | Path | Job Type |
|--------|------|----------|
| POST | `/api/jobs/calculate-risk` | Composite risk scoring from cases, surveys, and training |
| POST | `/api/jobs/analyze-surveys` | Sentiment analysis and theme extraction |
| POST | `/api/jobs/case-clustering` | Embedding-based pattern detection (requires Ollama) |
| POST | `/api/jobs/payslip-anomaly` | Wage violation detection vs. local minimums |
| POST | `/api/jobs/risk-forecast` | 60-day risk score prediction |
| POST | `/api/jobs/worker-voice-analytics` | Monthly topic extraction from survey responses |
| POST | `/api/jobs/regional-benchmarking` | Peer comparison and silence detection |
| POST | `/api/jobs/generate-briefing` | Daily intelligence digest aggregation |
