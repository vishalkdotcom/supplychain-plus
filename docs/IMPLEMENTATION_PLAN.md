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

### Session 3: Fix #15 — `analyze-surveys` LIMIT 500 bug

| Field | Detail |
|-------|--------|
| **File** | `lib/jobs/handlers/analyze-surveys.ts` (line 45) |
| **Root Cause** | The query JOINs surveys x questions x responses with a global `LIMIT 500`. Each survey produces ~1,350 joined rows, so 500 rows covers <1 complete survey. Result: only 2 of 285 surveys analyzed. |
| **Fix** | Two-step query: (1) Fetch distinct survey IDs, (2) For each survey, fetch its responses separately. Remove global LIMIT 500. Process surveys in batches to avoid memory issues. |
| **Cascade** | Fixes or improves: #26 (sentiment uniformity), #18 (1 month of voice data), #61 (empty temporal patterns), #37 (all bars red) |
| **Verify** | `SELECT count(*) FROM survey_analysis;` should be ~285. `SELECT count(*) FROM survey_temporal_patterns;` should be >0. |
| **Note** | This job uses Ollama and will be slow (~30s per survey). Consider batching or running overnight. At 285 surveys x 30s = ~2.4 hours minimum. Run sequentially to avoid VRAM model-swap thrashing. |

### Session 4: Fix #17 — Payslip currency confusion

| Field | Detail |
|-------|--------|
| **File** | `lib/jobs/handlers/payslip-anomaly.ts` (lines 10-28, 111-124) |
| **Root Cause** | `MINIMUM_WAGES` object claims USD but uses local currency codes (BDT, VND). Raw `NetPay` values are compared directly without currency conversion. Example: Bangladesh expected=75 BDT, actual=47 BDT — both under $1 USD. |
| **Additional Bug** | Anomaly `supplierId` references brand IDs from SQL Server (Under Armour=219, Uniqlo=217), not factory IDs (#48). |
| **Fix** | (1) Clarify `stgPayslipReportData.Value` currency for 'Net Wage'. (2) Either convert to USD or store min wages in local currency. (3) Fix supplier_id mapping to reference factories. |
| **Verify** | Anomalies should reference factory names, not brand names. Currency comparisons should be apples-to-apples. |

### Post-Wave 1: Pipeline Re-run

After all 4 fixes are applied:
1. Re-run full pipeline in order: `calculate-risk` → `analyze-surveys` → `worker-voice-analytics` → `case-clustering` → `risk-forecast` → `generate-briefing`
2. Run jobs **sequentially** (not parallel) to avoid Ollama VRAM thrashing
3. Take screenshots of every page before/after to document improvement

---

## Wave 2 — Verify & Mop Up (~1 session)

After re-running the pipeline with Wave 1 fixes, audit what actually changed. Many tier-2 issues will have shifted or auto-resolved.

### Expected Auto-Resolutions

| Issue | Why It May Resolve |
|-------|-------------------|
| #52 — All brands show "MEDIUM 32" | Brand scores aggregate supplier scores; with real variance from #14/#16 fix, brands differentiate |
| #26 — Voice sentiment all strongly negative | With 285 surveys analyzed (#15 fix), LLM gets more diverse input; may still need prompt calibration |
| #37 — All voice trend bars red | Likely resolves with #15 fix providing diverse sentiment data |
| #61 — Empty temporal patterns | Needs >2 surveys analyzed; #15 fix provides 285 |
| #20 — Monitoring signals empty | With real geo data (#14 fix), regional contagion can detect patterns; silence detection gets correct IDs |
| #51 — "No surveys conducted" for all | The `surveyStatsMap` uses `supplier.id` — verify this is correct for same-DB (PostgreSQL) lookup |

### Issues That Need Re-Triage

| Issue | What to Check |
|-------|--------------|
| #23 — Forecast unreliable | With real variance, forecasts improve naturally. But 3 data points is still too few — consider raising minimum to 14. |
| #18 — Voice trends 1 month | May need explicit fix to group responses by `created_date` month instead of processing as single batch |
| #19 — Training still global? | Depends on whether Moodle has per-company enrollment data |

### Action
- Close issues that are verified fixed
- Re-triage remaining issues with updated severity
- Update this document with findings

---

## Wave 3 — UI Polish That Makes Demo Shine (2-3 sessions, parallelizable)

These are independent of each other and good for parallel worktree sessions.

### Batch A: Dashboard Credibility

| Issue | Title | Effort |
|-------|-------|--------|
| #38 | Dashboard cluster card shows confusing "106 Child Labor Exploitation" | Small — separate count from label |
| #35 | Add risk distribution chart to dashboard | Medium — new Recharts PieChart/BarChart |
| #52 | Brands page identical scores (if still open after Wave 1) | Verify only |

### Batch B: Supplier Detail Story

| Issue | Title | Effort |
|-------|-------|--------|
| #40 | Risk breakdown uses mock `previousRiskScore` | Small — query `supplier_risk_history` |
| #39 | Supply chain network graph truncated to ~2 nodes | Small — add "and X more" indicator |
| #28 | `lastActivityDate` always returns "today" | Medium — calculate from case/survey timestamps |

### Batch C: Connect Module

| Issue | Title | Effort |
|-------|-------|--------|
| #59 | Cluster detail can't drill down to individual cases | Medium — add `/connect?clusterId=X` filter |
| #50 | No cluster/anomaly trend visualization | Medium — add time-series charts |
| #25 | Duplicate cluster labels ("Wage Theft" x7) | Small — post-process or deduplicate labels |

### Batch D: Engage Module

| Issue | Title | Effort |
|-------|-------|--------|
| #37 | All voice trend bars red (if still open) | Small — fix color mapping logic |
| #18 | Voice trends only 1 month (if still open) | Medium — group responses by actual month |

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
| 3 | Fix #15 (survey analysis limit) | ~285 surveys analyzed, temporal patterns populated |
| 4 | Fix #17 (payslip currency) + #48 (brand→factory ID) | Anomalies reference correct suppliers with correct currencies |
| 5 | Re-run full pipeline, audit results, close resolved issues | Updated screenshots, issues triaged |
| 6+ | Wave 3 UI fixes (parallelizable via worktrees) | Demo pages look credible |
| 8+ | Wave 4 features (pick 2-3) | Core product story is demonstrable |

### Ground Rules

- **One focused issue per session** — don't bundle 5 fixes in one session. Context gets messy and regressions creep in.
- **Run Ollama jobs sequentially** — parallel runs cause VRAM model-swap thrashing.
- **Screenshot every page after Wave 1** — half of UI "bugs" are actually data bugs wearing a UI costume.
- **Use Node 22 via fnm** for visual companion demos (Node 24 breaks them).

---

## Key Insight

> The dependency graph means ~5 fixes cascade into making ~20 other issues look dramatically better.
> Work in waves, not a list. After Wave 1 + pipeline re-run, take a screenshot of every page and re-assess.
> You'll be surprised how different things look with real data flowing correctly.
