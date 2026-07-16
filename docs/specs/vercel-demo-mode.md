# Spec: Vercel intelligence-first Demo Mode

Local working spec (not for commit). Grounded in `CONTEXT.md` and ADR `0001-vercel-demo-derived-db-only`.

## Problem Statement

I want to host WOVO+ on Vercel for interviews and portfolio demos, but the full product depends on multiple **source databases** plus a **derived database**. I do not want to pay for, operate, or keep healthy SQL Server, MySQL, and extra Postgres instances just for a demo. Relative windows (“last N days”) and live jobs would also make a frozen dataset look broken or empty over time. I need a reliable, honest demo of the intelligence product experience without pretending the whole multi-DB stack is online.

## Solution

Ship a **Demo Mode** runtime profile: one Neon Postgres holding a frozen **derived database** snapshot, a pinned **demo as-of** clock, in-app demo login, hard read-only mutations, jobs that do not run (Jobs UI may still show snapshot history), live AI chat via Groq/Cerebras with read-only tools against the derived store only, visible demo chrome, and an **intelligence-first demo** surface (derived-backed pages only). Local full-stack Docker remains the non-demo path.

## User Stories

1. As an interviewer, I want a single public URL for WOVO+, so that I can open the product without installing Docker.
2. As a presenter, I want Demo Mode to require only one managed Postgres (Neon) for the **derived database**, so that I am not hosting source databases for the demo.
3. As a presenter, I want a frozen snapshot of computed intelligence loaded once, so that risk, clusters, anomalies, trends, remediations, and briefings appear populated without running batch jobs.
4. As a presenter, I want a **demo as-of** date that acts as “now”, so that “last N days” and freshness language still show data months after the snapshot was taken.
5. As a presenter, I want relative labels (“3 days ago”) to follow demo as-of, so that the UI does not look absurdly stale relative to wall-clock time during the interview.
6. As a presenter, I want a clear Demo Mode banner showing the as-of date, so that nobody mistakes the freeze for a live multi-source production system.
7. As a presenter, I want source-backed navigation hidden or disabled, so that I do not click into Case Inbox, Surveys, or Educate and hit hard failures.
8. As a presenter, I want Systemic Patterns, Wage Anomalies, and Voice Trends available, so that the strongest derived-data stories remain in the tour.
9. As a presenter, I want Intelligence (briefing / regional insights) available when snapshot-backed, so that I can show Detect-phase outputs.
10. As a presenter, I want Remediation plans browsable from the snapshot, so that I can show Act/Evidence state without changing data.
11. As a presenter, I want Governance / regulatory views available when they read the derived store, so that compliance storytelling still works.
12. As a presenter, I want Control Center usable with source-backed widgets removed or safely empty, so that the home screen does not 500 on missing SQL Server/MySQL.
13. As a presenter, I want Brands/Suppliers drill-downs that depend on source databases gated or limited to derived-backed panels, so that I do not demo broken pages.
14. As a presenter, I want Jobs UI to show last completed runs from the snapshot, so that I can explain the pipeline without executing it.
15. As a presenter, I want job enqueue/execute paths disabled in Demo Mode, so that Vercel never tries to cluster, embed, or recompute risk.
16. As an interviewer, I want to log in with a demo account, so that the app is not anonymously open on the internet.
17. As a presenter, I want a small set of seeded demo users (or one shared demo user), so that login is fast to explain and hand over.
18. As a presenter, I want unauthenticated visitors blocked from app routes and APIs, so that strangers cannot burn LLM quota or scrape the dataset.
19. As an interviewer, I want to use the AI Assistant with live Groq/Cerebras models, so that the AI product story is real, not a slideshow.
20. As a presenter, I want AI tools limited to read-only derived-database tools, so that chat never calls SQL Server, MySQL, or source Postgres.
21. As a presenter, I want mutating AI tools (mark alert read, trigger recalculation, etc.) unavailable in Demo Mode, so that the snapshot cannot be corrupted via chat.
22. As a presenter, I want API mutations (create/update remediation, mark alerts, survey drafts, training pipes, etc.) rejected in Demo Mode, so that shared demos stay stable.
23. As an interviewer, I want mutation attempts to fail clearly (not silently corrupt), so that the product feels intentional.
24. As a presenter, I want rate limiting for chat still respected, so that free-tier Groq/Cerebras quotas last through interview loops.
25. As a presenter, I want Demo Mode activated by a single env profile flag, so that Vercel config is obvious and local Docker stays full-stack when the flag is off.
26. As a developer, I want one Demo Mode profile module as the seam for clock, surface allowlist, read-only, jobs-off, tool allowlist, and auth-required, so that behavior is not scattered.
27. As a developer, I want non-demo mode unchanged, so that local multi-DB development keeps working.
28. As a presenter, I want a documented one-time Neon load path (schema + snapshot), so that I can refresh the derived database when needed without rediscovering steps.
29. As a presenter, I want the existing demo snapshot export concept reused for the derived database, so that I am not inventing a second freeze format.
30. As an interviewer, I want empty or disabled nav items labeled as not in demo (where shown), so that missing modules read as scope, not bugs.
31. As a presenter, I want deep links to disallowed routes to redirect or show a friendly “not in demo” page, so that bookmarks and dashboard cards do not explode.
32. As a presenter, I want dashboard cards that link to source-backed routes adjusted or removed in Demo Mode, so that the Control Center does not send me into dead ends.
33. As a developer, I want health checks in Demo Mode to not require SQL Server/MySQL, so that deploy health is green with Neon only.
34. As a presenter, I want freshness badges driven by snapshot job history under demo as-of, so that “data as of” still teaches the freshness concept.
35. As an interviewer, I want the mental-model story (source vs derived) explainable from the running demo, so that architecture credibility does not require hosting sources.
36. As a presenter, I want logout (or session end) for the demo user, so that I can hand the laptop/browser over cleanly.
37. As a developer, I want tests at the Demo Mode profile seam, so that clock, allowlists, and read-only rules do not regress.
38. As a developer, I want a few API-level tests proving mutations and disallowed tools fail when Demo Mode is on, so that the seam is wired through real handlers.
39. As a presenter, I want Vercel env docs for Demo Mode, Neon URL, demo as-of, demo credentials, and Groq/Cerebras keys, so that redeploy is repeatable.
40. As a presenter, I want the demo to survive a cold start without Ollama, so that embedding/clustering jobs are never assumed online.
41. As an interviewer, I want chat answers grounded in snapshot suppliers/risk/clusters when I ask about the portfolio, so that the AI feels connected to the UI.
42. As a presenter, I want prompt/tool guidance in Demo Mode to avoid suggesting source-only tools, so that the model does not hallucinate unavailable capabilities.
43. As a developer, I want `DEMO_MODE=false` (or unset) to use wall-clock time and full nav, so that demos and local full stack do not share accidental freezes.
44. As a presenter, I want snapshot reload to be an ops step (re-run SQL load), not an in-app reset button in v1, so that scope stays small under hard read-only.
45. As a stakeholder, I want this behavior aligned with ADR 0001, so that future contributors do not “fix” Demo Mode back into multi-DB hosting.

## Implementation Decisions

- Respect ADR 0001: Vercel demo is derived-database-only; no SQL Server/MySQL/source Postgres required at runtime.
- Use glossary terms: **source database**, **derived database**, **demo as-of**, **intelligence-first demo**.
- **Single seam: Demo Mode profile** — env-driven module consulted for: enabled?, demo as-of / now(), route/nav allowlist, mutation allowed?, jobs executable?, AI tool allowlist, auth required.
- Prefer one flag (e.g. Demo Mode on/off) plus supporting env (demo as-of timestamp/date, demo credentials, Neon/`wovo_ai` connection, `AI_PROVIDER` / Groq & Cerebras keys). Do not maintain a forever `demo` git fork.
- **Clock**: when Demo Mode is on, all “last N days”, relative age, and similar window math use demo as-of as `now`. Wall clock remains for true infra concerns (HTTP dates) where unavoidable.
- **Surface allowlist (intelligence-first)**: keep derived-backed experiences — Control Center (with source widgets stripped/safe), AI Assistant, Systemic Patterns, Wage Anomalies, Voice Trends, Intelligence briefing/regional insights, Remediation browse, Governance when snapshot-backed, Jobs read-only history. Hide or block Case Inbox, Surveys list, Educate, and source-dependent brand/supplier/case drill-downs.
- Deep links to blocked routes → friendly not-in-demo response or redirect; do not 500 on missing source pools.
- **Hard read-only**: mutating HTTP handlers and mutating AI tools reject when Demo Mode is on (explicit error). Browsing seeded remediations/alerts/plans remains.
- **Jobs**: execution/enqueue no-op or rejected; read APIs for schedules/runs/freshness may serve snapshot rows; freshness display interprets timestamps relative to demo as-of where product-facing.
- **AI**: live chat with Groq + Cerebras cascade (existing provider plumbing); tool registry filtered to derived-DB read tools only; update system/tool guidance so the model does not offer source tools.
- **Auth**: in-app demo login required for app/API access in Demo Mode; unauthenticated access denied. Reuse or extend existing demo user concepts already present in the product UI where practical; session mechanism should be simple and sufficient for interview gating (not full IdP parity).
- **Health**: Demo Mode health should succeed with derived DB only (do not fail the deploy because source databases are unset).
- **Data ops (docs, not product UI)**: one-time Neon provision, schema push for derived DB, load demo snapshot SQL produced from the existing export approach; optional note that pgvector extension may be required if the snapshot includes embedding columns even if live embedding jobs never run.
- **UI chrome**: persistent Demo Mode indicator including demo as-of date; disabled/hidden nav should not look like accidental breakage.
- **Non-goals in code paths**: no in-app “reset snapshot” in v1; no Vercel Deployment Protection as the primary gate (in-app login is the chosen gate); no running Ollama on Vercel.
- Testing concentrates on the Demo Mode profile seam plus a thin set of handler tests proving wiring (see Testing Decisions).
- Spec and tickets live under the repo for agent work; they are local working docs and are not required to be committed.

## Testing Decisions

- Good tests assert **external behavior** of the Demo Mode profile and of handlers that must enforce it — not private helpers or UI class names.
- **Primary module under test**: Demo Mode profile (enabled, now/as-of, route allowed, mutation allowed, jobs executable, tool allowed).
- **Secondary**: representative API/AI entry points that must refuse mutations or source tools when Demo Mode is on (mock DB as in existing tests).
- Prior art: Bun tests under `__tests__/api/remediations.test.ts` and `__tests__/lib/auto-evidence.test.ts` (module mocks, chainable Drizzle stubs, behavior assertions).
- Do not require live Neon or live Groq in CI for these tests; drive the profile via env/test doubles.
- Ops scripts (psql load to Neon) are manual/verifiable outside automated unit tests unless a cheap dry-run assertion exists.

## Out of Scope

- Hosting or syncing **source databases** on Vercel/Neon.
- Running batch jobs, embedding, or clustering in the cloud.
- Soft sandbox writes, in-app snapshot reset, or continuous re-seed.
- Vercel Deployment Protection as a substitute for in-app demo login.
- Zero-DB / JSON-fixture rewrite of the API layer.
- Full production auth (Keycloak/SSO) parity for the demo host.
- Pixel-perfect preservation of every Control Center widget that needs sources.
- Committing this spec/tickets to git (local working docs unless the owner chooses otherwise).
- Paying multi-DB infrastructure for interview demos.

## Further Notes

- Mental model docs already separate four source stores from one derived store; Demo Mode is the productized consequence of that split for hosting.
- Existing `export-demo-snapshot` / deployment-guide snapshot flow is the intended freeze input for Neon.
- A `DemoUserSelector` already exists in the shell — Demo Mode auth should reconcile with that concept rather than inventing a conflicting “who am I” story.
- After implementation, interview narrative: show intelligence UX live; explain multi-DB architecture from mental model + local Docker, not from the Vercel URL.
