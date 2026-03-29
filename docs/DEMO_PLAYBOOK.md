# WOVO+ Demo Playbook

> Live walkthrough guide (20-35 min) with exact data points, URLs, and click paths.
> Last verified: 2026-03-29

---

## Quick Reference — The Data You Need

### Star Supplier (Primary Demo Thread)
| Field | Value |
|-------|-------|
| **Name** | PT. Batik & Garment Nusantara |
| **ID** | 198 |
| **URL** | `/suppliers/198` |
| **Country** | Cambodia |
| **Workers** | 799 |
| **Anomalies** | 2 critical: below minimum wage (634,664 KHR vs 800,000 min) + sudden drop (>20% pay reduction) |
| **Remediation** | Plan #1 — status: `implementing`, 6 evidence items auto-collected |
| **Evidence types** | Engagement improvement (+35%, 20→27) + training completed (6 courses) |

### Secondary Supplier (Cases + Cluster Story)
| Field | Value |
|-------|-------|
| **Name** | Southern Cotton Textile Manufacturing Co., Ltd. |
| **ID** | 25 |
| **URL** | `/suppliers/25` |
| **Risk Score** | 54 (medium) |
| **Country** | Cambodia |
| **Workers** | 328 |
| **Parent Brand** | Inditex (Zara) — ID 205 |
| **Cases** | 23 total, 5 high-priority, 13 open |
| **Case types** | Wage Theft, Safety Violation, Child Labor |
| **Cluster** | #332 "Forced Labor and Worker Exploitation" (14 cases, 10 suppliers) |

### Demo Brand (Portfolio View)
| Field | Value |
|-------|-------|
| **Name** | Gap Inc. |
| **ID** | 206 |
| **Suppliers** | 16 (largest portfolio) |
| **Avg Risk** | 47 |
| **Alt brand** | H&M Group (ID 204, 9 suppliers, avg risk 49 — highest avg risk) |

### Key Cluster
| Field | Value |
|-------|-------|
| **Cluster** | #330 "Exploitation through forced overtime and unsafe conditions" |
| **Severity** | Critical |
| **Cases** | 12 across 9 suppliers |
| **Case types** | Safety Violation, Working Hours, Discrimination, Wage Theft, Harassment, Forced Labor |
| **Factories** | Binh Duong, Madras, Vinh Gia, TBC, Dak Lak, Sri Lanka Spinnery, Vinh Son, Madaripur, Bac Giang |

### Dashboard Numbers
| Metric | Value |
|--------|-------|
| Total suppliers | 220 |
| Active cases | 2,943 |
| Pending surveys | 148 |
| Training completion | 43% |
| Trends improving | 97 |
| Trends worsening | 118 |
| Wage anomalies | 71 (all critical) |
| Silent suppliers | 101 |
| Clusters detected | 118 |
| Remediation plans | 10 active |

---

## Pre-Demo Checklist

```bash
# 1. Verify all services running
curl -s http://localhost:3030/api/health | python -m json.tool
# Expected: postgres, sqlServer, mysql all "healthy"

# 2. Verify dashboard has data
curl -s http://localhost:3030/api/metrics | python -m json.tool
# Expected: totalSuppliers=220, activeCases>0

# 3. Verify clusters exist
curl -s "http://localhost:3030/api/clusters?perPage=1" | python -m json.tool
# Expected: at least 1 cluster with caseCount > 0

# 4. Verify remediations have evidence
curl -s http://localhost:3030/api/remediations/1/evidence | python -m json.tool
# Expected: 6 evidence items

# 5. Verify AI chat works (needs AI_PROVIDER + API key)
curl -s http://localhost:3030/api/ai/chat/sessions | python -m json.tool
# Expected: 200 OK response

# 6. Verify voice trends
curl -s "http://localhost:3030/api/voice-trends?perPage=1" | python -m json.tool
# Expected: month data with emerging/declining topics

# 7. Verify regulatory frameworks
curl -s http://localhost:3030/api/regulatory/frameworks | python -m json.tool
# Expected: 4 frameworks (CSDDD, UFLPA, UK MSA, LkSG)
```

**Browser setup:** Chrome, `http://localhost:3030`, zoom ~110%, select **Sarah Chen (Compliance Officer)** in header role switcher.

---

## The 7-Act Demo Flow

### Act 1: "Sarah's Morning" — Dashboard (2-4 min)

**URL:** `http://localhost:3030/`

**Click path:**
1. Point to **KPI cards**: 220 suppliers, 2,943 active cases, 43% training completion
2. Expand the **AI Briefing bar** — read the daily intelligence summary:
   - "71 unresolved wage anomalies (71 critical)"
   - "101 suppliers have gone silent"
   - "5 emerging case patterns detected"
3. Hover the **geographic risk heatmap** — Southeast Asia cluster lights up
4. Click an **ML Insight card** (look for the cluster or anomaly card)
5. Check the **Needs Attention tabs** — alerts, anomalies, and clusters

**Say:** "It's 9am. Sarah opens WOVO. She didn't search for problems — the system found them overnight. 9 AI batch jobs ran against 4 databases, computed risk scores for all 220 suppliers, embedded 2,000 case messages into vectors, detected wage anomalies across 16 countries, and generated this briefing. All before Sarah's morning coffee."

**Transition:** Click on a supplier from the map or ML Insight card → navigate to supplier detail.

---

### Act 2: "Why Is This Factory Flagged?" — Supplier Risk (3-5 min)

**URL:** `http://localhost:3030/suppliers/25`

**Supplier: Southern Cotton Textile Manufacturing Co., Ltd.**
- Risk score: 54 (medium)
- Parent brand: Inditex (Zara)
- 328 workers, Cambodia

**Click path:**
1. Show the **risk score breakdown**:
   - Case score: 36 (of 100) × 35% weight
   - Survey score: 50 × 25% weight
   - Training score: 95 × 25% weight — "Only 5% completed training"
   - Engagement score: 32 × 15% weight
2. Point to **risk reasons**:
   - "5 unresolved high-priority grievances"
   - "13 cases remain unresolved"
   - "Low training completion (5%)"
3. Show the **risk history chart** — 30-day trend
4. Show the **risk forecast** — 60-day prediction

**Say:** "Three problems at this factory. 5 high-priority cases unresolved, 95% of workers haven't completed training, and look — the engagement score is only 32. That's the meta-signal: this factory isn't just risky, it's suspiciously quiet. We penalize silence because absence of data is itself a red flag."

**Key insight:** "We use hardcoded weights, not ML. With 300 factories, there isn't enough data to train a model. And regulators demand explainability — every score points to the exact cases and gaps that drove it."

---

### Act 3: "The Pattern Across Factories" — Cases & Clusters (4-6 min)

**URL sequence:**
1. `/connect` → filter by supplier 25
2. `/connect/clusters` → cluster #330
3. `/connect/payslip-anomalies`

**Step 1: Case Inbox** (`/connect?supplierId=25`)
- Show case list for Southern Cotton Textile
- Click a **Wage Theft** case (ID 3339) — show AI summary, severity: high
- Click a **Safety Violation** case (ID 3326) — show multilingual content (Vietnamese + English)
- "The AI reads complaints in Vietnamese, Khmer, Bengali — summarizes them, tags severity. Hours of manual triage, eliminated."

**Step 2: Systemic Patterns** (`/connect/clusters`)
- Navigate to clusters page
- Find **Cluster #330: "Exploitation through forced overtime and unsafe conditions"**
  - Severity: **Critical**
  - 12 cases across **9 different factories**
  - Case types: Safety, Hours, Discrimination, Wages, Harassment, Forced Labor
- Click into the cluster detail
- Show the **AI summary**: "Workers report being forced to work without breaks despite injuries..."
- Show the **suggested actions**: immediate audits, payroll review, anti-harassment training
- "One case is a complaint. Twelve cases across nine factories about the same thing? That's a systemic pattern. The AI found this by embedding 2,000+ messages into 1024-dimensional vectors and clustering with cosine similarity. No human could spot this across factories, countries, and languages."

**Step 3: Wage Anomalies** (`/connect/payslip-anomalies`)
- Show the anomaly list — 71 unresolved, all critical
- Click **PT. Batik & Garment Nusantara** anomaly:
  - Type: Below Minimum Wage
  - Actual: 634,664 KHR vs minimum: 800,000 KHR
  - Affected: 799 workers
  - AI interpretation: "Net pay below legal minimum wage, indicating potential wage theft"
- Also show the sudden_drop anomaly for same supplier: pay dropped >20% between periods
- "Country-specific thresholds. Cambodia minimum is 800,000 KHR. This factory's paying 634,664. That's 799 workers being underpaid. The system caught it automatically."

---

### Act 4: "What Workers Actually Think" — Engage (2-4 min)

**URL sequence:**
1. `/engage`
2. `/engage/voice-trends`

**Step 1: Survey Analytics** (`/engage`)
- Show a survey with responses, e.g., **Bac Giang Textile Industries** survey:
  - 603 responses
  - Risk score: 35
  - Sentiment: 53% positive, 18% negative, 29% neutral
  - Themes: "career advancement opportunities" (positive, 18 mentions), "lack of promotion paths" (negative, 6 mentions)
- "The AI extracts specific themes from responses. Not just 'negative' — but what workers are negative about."

**Step 2: Voice Trends** (`/engage/voice-trends`)
- Show global trends for March 2026:
  - **Working conditions**: 71 mentions, negative
  - **Wages and benefits**: 33 mentions, negative
  - **Management**: 23 mentions, negative
  - **Employment stability**: 34 mentions, positive
  - **Peer & community support**: 34 mentions, positive
- "Cases are complaints that already happened. Voice trends catch the sentiment before it becomes a grievance. Working conditions is the #1 negative topic globally — that's a leading indicator."

---

### Act 5: "Now What Do We Do?" — Intelligence + Remediation (5-8 min)

**URL sequence:**
1. `/ai` (AI Assistant)
2. `/intelligence`
3. `/remediation`
4. `/remediation/1`

**Step 1: AI Assistant** (`/ai`) — THE CENTERPIECE

Demo queries (in order):

1. **"Which suppliers need immediate attention this week?"**
   - Watch tool calls animate (`getHighRiskSuppliers`, `getAlerts`, `getPayslipAnomalies`)
   - "This isn't ChatGPT guessing. See those tool calls? The AI is calling 15 typed functions that query our databases in real-time. Every number in the response is traceable to a source record."

2. **"Tell me about Southern Cotton Textile Manufacturing"**
   - Returns: risk score 54, 5 high-priority cases, in cluster 332 (Forced Labor), 5% training completion
   - "One question, cross-database answer. SQL Server cases, PostgreSQL surveys, derived intelligence — all in one response."

3. **"What should we do about the forced overtime cluster?"**
   - Returns: action recommendations with urgency levels
   - "The AI recommends specific actions based on cluster type and severity."

4. **"Summarize the latest wage anomalies"**
   - Returns: 71 critical anomalies, top affected suppliers
   - "Cross-module intelligence from payslip analysis — pulled in real-time."

**Step 2: Intelligence Briefing** (`/intelligence`)
- Show the pre-generated daily briefing with 4 attention items:
  - 5 emerging case patterns (75 cases, 51 suppliers)
  - 6 suppliers showing improvement (avg -36 pts)
  - 71 unresolved wage anomalies (critical)
  - 101 suppliers gone silent (critical)
- "This aggregates signals from all 9 jobs into one executive summary."

**Step 3: Remediation Workflow** (`/remediation`)
- Show the remediation list — 10 active plans
- Click into **Plan #1: "Remediate: Payslip Anomaly: PT. Batik & Garment Nusantara"**
  - Status: `implementing` (step 4 of 6 in the workflow)
  - Source: payslip anomaly alert #200
  - State machine: `detected → root_cause → action_plan → implementing → verifying → closed`
- Show the **audit trail** — every state change logged with who/when
- "You can't skip steps. You can't go backwards. The workflow ensures every action progresses forward with a paper trail regulators can verify."

---

### Act 6: "Proving You Did It" — Evidence + Governance (3-5 min)

**URL sequence:**
1. `/remediation/1` (evidence tab)
2. `/governance`

**Step 1: Auto-Collected Evidence** (Remediation Plan #1)
- Click the **Evidence tab** on Plan #1
- Show 6 auto-collected evidence items:
  - **Engagement improvement**: Score rose from 20 → 27 (+35%) — collected Mar 25, 26, 27
  - **Training completed**: 6 courses completed — collected Mar 20, 26, 27
- "Not a single piece was entered manually. The evidence sweep job runs nightly, cross-referencing improvements against active plans. Engagement went up 35%? Auto-linked. Workers finished training? Auto-linked."

**Step 2: Regulatory Compliance** (`/governance`)
- Show the 4 frameworks:
  | Framework | Suppliers | Compliant | Non-Compliant |
  |-----------|-----------|-----------|---------------|
  | EU CSDDD | 146 | 73 | 24 |
  | UFLPA | 158 | 73 | 23 |
  | UK MSA | 117 | 47 | 21 |
  | German LkSG | 127 | 41 | 26 |
- Click into **EU CSDDD** — show the 7 requirements
- Click a requirement → show evidence linked from remediation plans
- "Each requirement maps to evidence types. Case resolved? Satisfies Article 8. Training completed? Article 10. The mapping is automatic."

**Step 3: The Export**
- Point to the **Export** button on Remediation Plan #1
- "This generates a PDF evidence package. The complete detect→act→evidence chain for one remediation. When UFLPA asks about forced labor, brands generate this in seconds. Without WOVO? Weeks of manual document assembly."

---

### Act 7: "The Engine Room" — Pipeline (1-3 min)

**URL:** `/operations/jobs`

**Show:**
- 9 jobs, all completed successfully:
  | Job | Last Run | Duration | Key Output |
  |-----|----------|----------|------------|
  | calculate-risk | Mar 29 | 1.7s | 220 suppliers scored |
  | analyze-surveys | Mar 27 | 2.7s | 706 theme patterns |
  | case-clustering | Mar 27 | 30 min | 118 clusters, 2000 embeddings |
  | payslip-anomaly | Mar 27 | 2 min | 71 anomalies from 600 payslips |
  | risk-forecast | Mar 27 | 6.6 min | 220 forecasts (60-day) |
  | worker-voice | Mar 27 | 16.6 min | 12,714 responses, 186 suppliers |
  | regional-benchmarking | Mar 27 | 0.2s | 5 regions, 101 silence alerts |
  | generate-briefing | Mar 27 | <1s | 4 attention items |
  | evidence-sweep | Mar 27 | 0.3s | 8 evidence items across 10 plans |

- "9 jobs. 4 databases. 220 suppliers. All automatic. The compliance officer reviews the output — the system does the work."

**Close:** "Everything you saw — the risk scores, clusters, anomalies, forecasts, briefings, action recommendations, evidence collection — computed by this pipeline. Sarah's morning took 10 minutes. Without WOVO, that's 10 people and 10 weeks."

---

## Timing Guide

| Act | Topic | Tight | Full | Key URL |
|-----|-------|:-----:|:----:|---------|
| 1 | Dashboard | 2m | 4m | `/` |
| 2 | Supplier Risk | 3m | 5m | `/suppliers/25` |
| 3 | Cases + Clusters | 4m | 6m | `/connect`, `/connect/clusters` |
| 4 | Worker Voice | 2m | 4m | `/engage`, `/engage/voice-trends` |
| 5 | AI + Remediation | 5m | 8m | `/ai`, `/remediation/1` |
| 6 | Evidence + Governance | 3m | 5m | `/remediation/1` evidence, `/governance` |
| 7 | Pipeline | 1m | 3m | `/operations/jobs` |
| **Total** | | **20m** | **35m** | |

**Running short?** Cut Acts 4 and 7. Core story (1→2→3→5→6) works in 17 min.

**Extra time?** Expand Act 5 with more AI queries. It's the most interactive.

---

## AI Chat Queries (Ranked by Impact)

| # | Query | What It Shows |
|---|-------|---------------|
| 1 | "Which suppliers need immediate attention this week?" | Cross-database aggregation, tool calling |
| 2 | "Tell me about Southern Cotton Textile Manufacturing" | Full supplier profile across all modules |
| 3 | "What's driving the risk increase for PT Wijaya?" | Explainability |
| 4 | "What should we do about the forced overtime cluster?" | Action recommendations |
| 5 | "Compare Southern Cotton to other factories in Cambodia" | Regional benchmarking |
| 6 | "Summarize the latest wage anomalies" | Payslip intelligence |
| 7 | "What remediation actions are open?" | Cross-module awareness |

---

## Recovery Procedures

| Problem | Fix Command |
|---------|-------------|
| Dashboard no data | `bun run scripts/seed-risk-scores.ts` |
| Clusters empty | `curl -X POST http://localhost:3030/api/jobs/case-clustering` (needs Ollama, ~30 min) |
| AI chat fails | Check `AI_PROVIDER` + API key in `.env.local` |
| No anomalies | `bun run scripts/seed-payslips.ts` then `curl -X POST http://localhost:3030/api/jobs/payslip-anomaly` |
| No evidence | `curl -X POST http://localhost:3030/api/jobs/remediation-evidence-sweep` |
| Risk history flat | `bun run scripts/seed-history.ts` |
| Governance empty | `bun run scripts/seed-regulatory.ts` |
| Voice trends empty | `curl -X POST http://localhost:3030/api/jobs/worker-voice-analytics` (needs AI provider, ~17 min) |

---

## The One-Liner

> **"WOVO turns weeks of manual audit preparation into seconds of automated evidence assembly — detecting labor risks across 300+ factories daily and building the regulatory proof trail automatically."**
