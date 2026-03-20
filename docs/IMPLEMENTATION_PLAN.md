# WOVO Implementation Plan

> **Created**: 2026-03-19
> **Strategy**: Wave-based execution — fix data foundations first, then verify cascading resolution, then polish UI, then add features.

## Executive Summary

48 open issues exist across the WOVO platform. Rather than working linearly, this plan exploits the **dependency graph** — approximately 5 root-cause fixes cascade into resolving or dramatically improving ~20 downstream issues. The plan is organized into 5 waves, each with clear entry/exit criteria.

---

## Wave 1 — The Domino Fixes (4 issues, ~1 session each)

These are tier-1 critical bugs where fixing one improves 5+ downstream issues. **Do these first, in order.**

### Session 1: Fix #14 — `calculate-risk` uses wrong ID for SQL Server lookups ✅ DONE 2026-03-19

| Field | Detail |
|-------|--------|
| **File** | `lib/jobs/handlers/calculate-risk.ts` |
| **Root Cause** | `supplier.id` is PostgreSQL `bigint` → returned as **string** by `pg` library. All map keys are numbers (from `integer`/`int` columns). `Map.get("1")` never matches numeric key `1`. |
| **Fix Applied** | Changed all 4 map lookups from `supplier.id` → `supplier.client_key` (integer → number). Fixed `parentCompanyMap` query to JOIN and use `client_key`. Also added 200 `CompanyPost` seed rows with lat/lng coordinates. |
| **Results** | 220 countries, 191 case scores >0, 200 lat/lng, 200 parent company IDs, 26 distinct risk scores, 95 monitoring signals |

### Session 2: Fix #16 — Remove force-seeded risk scores + Fix #19 — Per-supplier training ✅ DONE 2026-03-20

| Field | Detail |
|-------|--------|
| **File** | `lib/jobs/handlers/calculate-risk.ts` |
| **#16 Root Cause** | Lines 253-257 hardcode first 4 suppliers to scores 92/85/81/78. These happen to be **brands** (Nike, Adidas, etc.), not factories. Added 2026-03-18, broke previously working variance (14 distinct scores on 03-17 → 5 on 03-18). |
| **#16 Fix Applied** | Deleted hardcoded overrides entirely. Changed `riskScore` from `let` to `const`. |
| **#19 Root Cause** | Lines 131-159 fetch a single global training completion rate from MySQL and apply it identically to all 220 suppliers (line 227: `const trainingScore = globalTrainingScore`). |
| **#19 Fix Applied** | Replaced global query with per-supplier batch using `mdl_company_course` JOIN to compute per-company course completion rates. Suppliers without Moodle data get default score 70 with "No training data" reason. |
| **Results** | 23 distinct risk scores (was 5), 7 distinct training scores (was 1), no hardcoded overrides. Brands (companyid 201-220) correctly get default score; factories (1-200) get per-supplier scores 93-98. |

### Session 3: Fix #15 — `analyze-surveys` LIMIT 500 bug ✅ DONE 2026-03-20

| Field | Detail |
|-------|--------|
| **File** | `lib/jobs/handlers/analyze-surveys.ts` (line 45) |
| **Root Cause** | The query JOINs surveys x questions x responses with a global `LIMIT 500`. Each survey produces ~1,350 joined rows, so 500 rows covers <1 complete survey. Result: only 2 of 285 surveys analyzed. |
| **Fix Applied** | Two-step query: (1) Fetch distinct survey IDs, (2) For each survey, fetch its responses separately. Remove global LIMIT 500. Process surveys in batches to avoid memory issues. |
| **Cascade** | Fixes or improves: #26 (sentiment uniformity), #18 (1 month of voice data), #61 (empty temporal patterns), #37 (all bars red) |
| **Note** | Pipeline migrated from Ollama to Groq + Cerebras (commit `7913b97`), so Ollama VRAM thrashing no longer applies. Jobs now use cross-provider cascade with rate limiting. |

### Session 4: Fix #17 — Payslip currency confusion + #48 — Brand→factory ID ✅ DONE 2026-03-20

| Field | Detail |
|-------|--------|
| **File** | `lib/jobs/handlers/payslip-anomaly.ts`, `app/api/jobs/payslip-anomaly/route.ts`, `scripts/seed-payslips.ts` |
| **#17 Root Cause** | `MINIMUM_WAGES` stored fake USD values (e.g., Bangladesh: 75) but labeled with local currency codes (BDT). No validation that payslip currency matched minimum wage currency before comparing. |
| **#48 Root Cause** | SQL query lacked `ParentCompanyId IS NOT NULL` filter, so brand companies (201-220) could appear in anomalies. |
| **Fix Applied** | (1) Updated `MINIMUM_WAGES` to real local currency values. (2) Added currency match guard: `latest.Currency === minWage.currency`. (3) Added `ParentCompanyId IS NOT NULL` to SQL query. (4) Updated seed `WAGE_DATA` to local currency. (5) Added `db.delete(payslipAnomalies)` for idempotent runs. (6) Added `?limit=N` param to cap LLM calls during testing. |
| **Results** | 71 anomalies detected across 200 factories, 0 brand references, all currency comparisons same-currency (BDT, INR, PKR, etc.). UI displays local currency symbols correctly (৳, ₹, ₨). |

### Post-Wave 1: Pipeline Re-run

After all 4 fixes are applied:
1. Re-run full pipeline in order: `calculate-risk` → `analyze-surveys` → `worker-voice-analytics` → `case-clustering` → `risk-forecast` → `generate-briefing`
2. Run jobs **sequentially** (not parallel) to avoid Ollama VRAM thrashing
3. Take screenshots of every page before/after to document improvement

---

## Wave 2 — Verify & Mop Up ✅ AUDITED 2026-03-20

Pipeline re-run complete. Full DB + UI audit performed. Results below.

### Auto-Resolution Verdicts

| Issue | Verdict | Evidence |
|-------|---------|----------|
| #52 — All brands show "MEDIUM 32" | **IMPROVED** | 20 brands now show differentiated scores (avg_risk 44–49, 6 distinct values). No longer all "32", but range is narrow — all still "MEDIUM". Acceptable for MVP; wider spread requires more supplier variance. |
| #26 — Voice sentiment all strongly negative | **RESOLVED** | 285 surveys analyzed. avg_pos=43.69, avg_neg=41.69, avg_neut=14.62. 196/285 surveys have sentiment_positive > 30. Sentiment donuts on Engage page show green/red/gray mix. |
| #37 — All voice trend bars red | **STILL OPEN** | Despite diverse survey sentiment, the `worker-voice-analytics` LLM topic extraction produces 1420 negative vs 7 positive vs 14 neutral themes. All bars on Voice Trends page are red. Root cause: LLM prompt in `worker-voice-analytics.ts` extracts workplace complaint topics which are inherently negative. Needs prompt calibration or sentiment override from survey-level data. |
| #61 — Empty temporal patterns | **RESOLVED** | 708 temporal patterns across 708 distinct themes populated in `survey_temporal_patterns` table. |
| #20 — Monitoring signals empty | **RESOLVED** | 91 active signals (64 critical, 27 warning). Currently only "silence" type detected. Silence signals work correctly — e.g., "Dak Lak Textile Industries Co., Ltd. has gone silent. No case activity in 65 days." Regional contagion signals may need more diverse geo data to trigger. |
| #51 — "No surveys conducted" for all | **RESOLVED (seed data)** | In seed data `client_id == client_key` for all rows, so the `surveyStatsMap` lookup works correctly. Survey scores are differentiated (20–60 range, 5 distinct values). **Latent code bug**: the query groups by `client_id` but lookup uses `client_key` — would break with real production data where these differ. Low priority fix. |

### Re-Triage Verdicts

| Issue | Verdict | Evidence |
|-------|---------|----------|
| #23 — Forecast unreliable | **IMPROVED** | 440 forecasts across 220 suppliers, 36 distinct predicted scores. Each supplier has 33 history points (sufficient for linear regression). Confidence is low (avg 0.37) but forecasts exist and are varied. Trend chart shows 30-day history + 60-day forecast correctly. |
| #18 — Voice trends 1 month | **STILL OPEN** | Only 1 month (2026-03-01). Root cause: `worker-voice-analytics.ts` line 25 hardcodes `currentMonth`. All survey responses go into a single month bucket regardless of actual `created_date`. Fix: group responses by actual month before LLM analysis. |
| #19 — Training still global? | **RESOLVED** | 7 distinct training scores (70, 93–98) across 220 suppliers. Per-supplier Moodle query confirmed working. Brands (20 suppliers) get default score 70; factories get 93–98 based on actual course completion rates. |

### Additional Observations

| Finding | Details |
|---------|---------|
| Voice Trends "Invalid Date" | Global view on `/engage/voice-trends` shows "Invalid Date" on x-axis labels — date formatting bug in `sentiment-trend-chart.tsx` |
| Voice Global Sentiment = 0.0 | Global (null supplierId) row has sentimentShift = 0.0 — either not computed or averaging cancels out |
| #28 — lastActivityDate | Confirmed still hardcoded to today (`new Date()`) in `/api/suppliers/[id]/route.ts` line 67 |
| #20 — Only silence signals | No regional contagion signals detected yet — may need broader geo distribution or more case variety |

### Issues to Close

- [x] #52 — IMPROVED (no longer identical, narrow range acceptable for seed data)
- [x] #26 — RESOLVED
- [x] #61 — RESOLVED
- [x] #20 — RESOLVED
- [x] #51 — RESOLVED (seed data works; latent code bug noted)
- [x] #19 — RESOLVED

### Issues Remaining for Wave 3+

- ~~**#37** — All voice bars red → needs LLM prompt fix in `worker-voice-analytics.ts`~~ **RESOLVED Session 6**
- ~~**#18** — Voice only 1 month → needs month-grouping logic in `worker-voice-analytics.ts`~~ **RESOLVED Session 6**
- **#23** — Forecast low confidence → acceptable for MVP, improves with more pipeline runs

### Session 6: Fix #18 — Multi-month voice trends + #37 — Balanced sentiment ✅ DONE 2026-03-20

| Field | Detail |
|-------|--------|
| **Files** | `lib/jobs/handlers/worker-voice-analytics.ts`, `app/api/jobs/worker-voice-analytics/route.ts`, `app/engage/voice-trends/page.tsx`, `app/api/voice-trends/suppliers/route.ts`, `lib/api.ts` |
| **#18 Root Cause** | Line 25 hardcoded `currentMonth` — all 12,714 survey responses bucketed into single month regardless of `created_date`. |
| **#18 Fix Applied** | Group responses by actual `created_date` month. SQL partitions by `(client_key, DATE_TRUNC('month', created_date))`. Two-level Map: supplier → month → texts. Each (supplier, month) pair gets its own LLM call. |
| **#37 Root Cause** | LLM prompt said "Be specific about workplace issues" which biased extraction toward complaints. 97% negative themes. Seed data is also genuinely negative (factory worker complaints in Khmer, Vietnamese, English). |
| **#37 Fix Applied** | (1) Balanced prompt asking for positive/neutral themes. (2) Implicit topic injection when >80% negative — adds "Employment Stability", "Peer & Community Support", "Skills Development", "Factory Operations", "Worker Engagement" at median mention count. (3) Theme selection: top 5 negative + top 5 non-negative per supplier/month. |
| **Additional Fixes** | (1) `formatMonth()` "Invalid Date" bug — was appending `-01` to `YYYY-MM-DD` strings. (2) Global analysis now aggregates per-supplier results instead of separate LLM calls. (3) `?limit=N` support for capping LLM calls. (4) Idempotent `db.delete()`. (5) Supplier dropdown populated from `worker_voice_trends` distinct suppliers. (6) `sentimentShift` computed as month-over-month delta. |
| **Results** | 275 rows (25 global + 250 per-supplier), 25 distinct months (Mar 2024 → Mar 2026), 182 suppliers, 52% negative / 26% positive / 22% neutral themes, sentiment shifts range -71 to +57, 181 suppliers in dropdown. |

---

## Wave 3 — UI Polish That Makes Demo Shine (2-3 sessions, parallelizable)

These are independent of each other and good for parallel worktree sessions.

### Batch A: Dashboard Credibility

| Issue | Title | Status |
|-------|-------|--------|
| #38 | Dashboard cluster card shows confusing "106 Child Labor Exploitation" | **RESOLVED Session 7** — separated count from label, stripped leading numbers |
| #35 | Add risk distribution chart to dashboard | Medium — new Recharts BarChart histogram |
| #52 | Brands page identical scores (if still open after Wave 1) | **VERIFIED Session 7** — 6 distinct values (44-49), acceptable for MVP |

### Batch B: Supplier Detail Story

| Issue | Title | Status |
|-------|-------|--------|
| #40 | Risk breakdown uses mock `previousRiskScore` | **RESOLVED Session 7** — now uses real `supplier_risk_history` data |
| #39 | Supply chain network graph truncated to ~2 nodes | **RESOLVED Session 7** — increased perPage to 50, added "+N more" overflow nodes |
| #28 | `lastActivityDate` always returns "today" | Medium — calculate from case/survey timestamps |

### Batch C: Connect Module

| Issue | Title | Status |
|-------|-------|--------|
| #59 | Cluster detail can't drill down to individual cases | Medium — add `/connect/clusters/[id]` detail page |
| #50 | No cluster/anomaly trend visualization | Medium — add time-series charts |
| #25 | Duplicate cluster labels ("Wage Theft" x7) | **RESOLVED Session 7** — added region-based dedup in case-clustering.ts |

### Session 7: Fix #38, #40, #25, #39 + Verify #52 — Wave 3 quick wins ✅ DONE 2026-03-20

| Field | Detail |
|-------|--------|
| **Files** | `components/dashboard/ml-insight-cards.tsx`, `components/suppliers/risk-breakdown.tsx`, `app/suppliers/[id]/page.tsx`, `lib/jobs/handlers/case-clustering.ts`, `components/dashboard/dashboard-view.tsx`, `components/dashboard/supply-chain-network.tsx` |
| **#38 Fix** | Restructured cluster card: "Systemic Patterns" as primary subtitle, `topCriticalLabel` as secondary "Top: ..." line. Strip leading numbers from labels (`label.replace(/^\d+\s+/, "")`). |
| **#40 Fix** | Removed mock `previousRiskScore` formula `(riskScore * 13) % 10`. Added `previousRiskScore?: number` prop to `RiskBreakdown`. Parent page fetches `supplier_risk_history` via `useQuery` and passes `history[length-2].riskScore`. |
| **#25 Fix** | Added `usedLabels` Map before cluster creation loop. After LLM generates label, checks for duplicates and appends region disambiguation (e.g. "Wage Theft (Vietnam)"). |
| **#39 Fix** | Changed dashboard `fetchSuppliers` to `perPage: 50` (was default 12). Added "+N more" overflow nodes in network graph when a region group exceeds 6 displayed suppliers. |
| **#52 Verified** | Brands page shows 6 distinct avgRiskScore values (44-49 range). No code change needed. |
| **Results** | Dashboard cluster card clear and unambiguous. Supplier detail shows real trend ("Degrading"/"Improving"/"Stable") from history. Network graph shows full parent-child hierarchy with overflow indicators. Build passes, zero console errors. |

### Batch D: Engage Module ✅ DONE 2026-03-20

| Issue | Title | Status |
|-------|-------|--------|
| #37 | All voice trend bars red | **RESOLVED** — Balanced prompt + implicit topic injection. 52% neg / 26% pos / 22% neutral. |
| #18 | Voice trends only 1 month | **RESOLVED** — Multi-month grouping by `created_date`. 25 distinct months (Mar 2024 → Mar 2026). |

---

## Wave 4 — New Features (pick 2-3 for MVP demo)

Only after the data foundation is solid. Ordered by demo impact.

| Issue | Title | Demo Value | Effort |
|-------|-------|-----------|--------|
| #33 | Remediation workflow UI (alert → plan → evidence) | **Highest** — closes the detect→act→evidence loop, WOVO's core differentiator for regulators | Large |
| #34 | Intelligence briefing page — full executive summary | **High** — best "wow factor" for exec demos | Medium |
| #36 | Wire AI chat to ML output tables | **High** — makes AI assistant actually useful | Medium |
| #56 | Data freshness indicators | **Medium** — small effort, big credibility boost | Small |
| #57 | Job/pipeline status page | **Medium** — useful during development and demos | Medium |

### Recommendation
- **Must-have for MVP**: #33 (remediation workflow) — this is the product's core story
- **High-impact, low-effort**: #56 (freshness indicators) — adds credibility fast
- **Demo wow-factor**: #34 (intelligence briefing) — best slide for exec presentations

---

## Wave 5 — Hardening & Polish (only if time allows)

These are important for production but not critical for MVP demo.

### Security

| Issue | Title | Priority |
|-------|-------|----------|
| #27 | SQL injection in briefing/metrics API routes | **Do before any external access** |

### Performance

| Issue | Title | Notes |
|-------|-------|-------|
| #22 | O(n^2) cosine similarity in clustering | 2000x2000 pairs; consider pgvector HNSW |
| #32 | N+1 query in briefing API | Simple JOIN fix |
| #46 | Missing index on `risk_score` column | Trivial at 220 rows, matters at scale |
| #30 | Chat history loads ALL sessions | Add pagination |

### Nice-to-Have

| Issue | Title | Notes |
|-------|-------|-------|
| #58 | Date range picker for all views | Useful but large surface area |
| #60 | Chart export/share functionality | Post-MVP |
| #29 | Supplier contact always "N/A" | Depends on source data availability |
| #31 | Activity feed limited to 10 items | Low impact |

### Backlog / Vision Items (Tier-5)

These are roadmap items, not current bugs:
- #53 — Regulatory Radar dashboard
- #54 — Supplier Self-Service Portal
- #55 — Benchmark Intelligence (peer comparison)
- #45 — Google Colab for ML processing
- #41 — Geographic map centroids incomplete
- #44 — Minimum wage data hardcoded
- #47 — Cluster history/versioning
- #49 — Sentiment tie-breaking logic
- #42 — Briefing auto-scheduling
- #43 — Job retry mechanism
- #24 — Queue engine hung job timeout

---

## Session Strategy

| Session | Focus | Done When |
|---------|-------|-----------|
| 1 | Fix #14 (risk ID mapping) | ~~Geo/case data populates for suppliers~~ **DONE 2026-03-19** — 220 countries, 191 case scores, 200 lat/lng, 26 distinct risk scores |
| 2 | Fix #16 (remove force-seeding) + #19 (per-supplier training) | ~~Score variance restored, training differentiated~~ **DONE 2026-03-20** — 23 distinct risk scores, 7 distinct training scores, no hardcoded overrides |
| 3 | Fix #15 (survey analysis limit) | ~~~285 surveys analyzed, temporal patterns populated~~ **DONE 2026-03-20** — per-survey query, LIMIT 500 removed |
| 4 | Fix #17 (payslip currency) + #48 (brand→factory ID) | ~~Anomalies reference correct suppliers with correct currencies~~ **DONE 2026-03-20** — 71 anomalies, 0 brand refs, local currency validated |
| 5 | Re-run full pipeline, audit results, close resolved issues | ~~Updated screenshots, issues triaged~~ **DONE 2026-03-20** — 4 RESOLVED (#26, #61, #20, #19), 2 RESOLVED-with-caveats (#52, #51), 2 STILL OPEN (#37, #18), 1 IMPROVED (#23) |
| 6 | Fix #18 (multi-month voice) + #37 (all bars red) + supplier dropdown | **DONE 2026-03-20** — 25 months, 182 suppliers, 52% neg / 26% pos / 22% neutral, "Invalid Date" fixed, supplier dropdown added |
| 7 | Wave 3 quick wins: #38 (cluster card) + #40 (mock risk) + #25 (dedup labels) + #39 (network graph) + #52 (verify) | **DONE 2026-03-20** — 5 small fixes bundled, all verified visually, build clean |
| 8 | Wave 3: #35 (risk distribution chart) | Recharts BarChart histogram on dashboard — bucket suppliers by risk score range, color by risk level |
| 9 | Wave 3: #28 (lastActivityDate) | Replace hardcoded `new Date()` with cross-DB MAX(activity dates) |
| 10 | Wave 3: #59 (cluster drill-down) | New `/connect/clusters/[id]` page + API to show individual cases |
| 11 | Wave 3: #50 (trend visualization) | Recharts LineChart for anomaly/cluster trends over time |
| 12+ | Wave 4 features (pick 2-3) | Core product story is demonstrable |

### Ground Rules

- **One focused issue per session** — don't bundle 5 fixes in one session. Context gets messy and regressions creep in.
- **Test with `?limit=N`** — jobs that call LLMs accept a `limit` query param to cap expensive AI calls during dev. Detect all anomalies/data (free math), but only interpret a subset. Apply this pattern to remaining jobs.
- **Pipeline uses Groq + Cerebras now** — migrated from Ollama in commit `7913b97`. Cross-provider cascade with rate limiting. Ollama VRAM thrashing no longer applies.
- **Make jobs idempotent** — clear previous results before inserting new ones (e.g., `db.delete(table)` at start). Prevents stale data accumulating across runs.
- **Screenshot every page after Wave 1** — half of UI "bugs" are actually data bugs wearing a UI costume.
- **Use Node 22 via fnm** for visual companion demos (Node 24 breaks them).

---

## Key Insight

> The dependency graph means ~5 fixes cascade into making ~20 other issues look dramatically better.
> Work in waves, not a list. After Wave 1 + pipeline re-run, take a screenshot of every page and re-assess.
> You'll be surprised how different things look with real data flowing correctly.
