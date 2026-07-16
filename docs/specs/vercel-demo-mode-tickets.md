# Tickets: Vercel intelligence-first Demo Mode

Tracer-bullet slices for hosting an intelligence-first demo on Vercel with one Neon **derived database**. Source: `docs/specs/vercel-demo-mode.md` (ADR 0001).

Work the **frontier**: any ticket whose blockers are all done. For a mostly linear chain after the profile + runbook, prefer profile first, then parallel UI/auth/AI/read-only, then the wiring pass.

## Demo Mode profile seam

**What to build:** A single Demo Mode profile that answers whether demo is on, what **demo as-of** / `now` is, which routes are allowed, whether mutations and job execution are allowed, and which AI tools are allowed — with tests at that seam proving those answers.

**Blocked by:** None — can start immediately.

- [ ] Profile reads a Demo Mode env flag and demo as-of configuration
- [ ] When on, `now` / window helpers use demo as-of; when off, wall clock
- [ ] Route allowlist matches the intelligence-first surface from the spec
- [ ] Mutation and job-execution helpers return false (or equivalent) when on
- [ ] AI tool allowlist is derived-DB read-only tools only when on
- [ ] Unit tests cover on/off behavior for clock, routes, mutations, jobs, tools

## Neon snapshot runbook and Vercel env checklist

**What to build:** A short ops runbook so a human can provision Neon, push derived schema, load the demo snapshot, and set Vercel env (Demo Mode, as-of, DB URL, demo credentials, Groq/Cerebras) without rediscovering steps.

**Blocked by:** None — can start immediately.

- [ ] Runbook covers Neon + schema + snapshot load (reuse existing export/snapshot concept)
- [ ] Notes pgvector/extension needs if the snapshot includes embedding columns
- [ ] Env checklist lists Demo Mode, demo as-of, derived DB URL, demo login secrets, AI provider keys
- [ ] States clearly that source databases are not required for the Vercel deploy

## Demo login gate

**What to build:** In Demo Mode, visitors must sign in with a demo account before using the app or calling protected APIs; logged-out users are blocked.

**Blocked by:** Demo Mode profile seam

- [ ] Demo login works against seeded/configured demo credentials when Demo Mode is on
- [ ] Unauthenticated access to app routes is blocked in Demo Mode
- [ ] Unauthenticated access to protected APIs is blocked in Demo Mode
- [ ] Session can be ended (logout) for handoff
- [ ] Non-demo mode does not force this gate

## Demo chrome and intelligence-first nav/routes

**What to build:** Visible Demo Mode chrome (including demo as-of) and navigation/deep links that only expose the intelligence-first surface; blocked routes get a friendly not-in-demo experience.

**Blocked by:** Demo Mode profile seam

- [ ] Persistent chrome shows Demo Mode and demo as-of when on
- [ ] Sidebar hides or disables Case Inbox, Surveys, Educate, and other source-backed items per allowlist
- [ ] Derived pages remain reachable (clusters, payslip anomalies, voice trends, intelligence, remediation browse, governance when applicable, AI, jobs history)
- [ ] Deep links to disallowed routes do not 500; they redirect or show not-in-demo
- [ ] Non-demo mode nav unchanged

## Hard read-only and jobs no-execute

**What to build:** In Demo Mode, product mutations are rejected and batch jobs do not run, while Jobs/freshness UIs may still show snapshot history interpreted with demo as-of where product-facing.

**Blocked by:** Demo Mode profile seam

- [ ] Representative mutating APIs reject when Demo Mode is on (clear error)
- [ ] Job enqueue/execute paths do not run work when Demo Mode is on
- [ ] Jobs/freshness read APIs still serve snapshot data
- [ ] Handler-level tests (with mocked DB) prove mutation/job refusal wiring
- [ ] Non-demo mode mutations/jobs behavior unchanged

## AI chat allowlist (Groq/Cerebras-ready)

**What to build:** Live chat in Demo Mode only registers read-only derived-database tools; source and mutating tools are unavailable; prompts do not advertise them. Provider remains env-driven (Groq/Cerebras for deploy).

**Blocked by:** Demo Mode profile seam

- [ ] Demo Mode tool registry excludes source-DB tools (cases/surveys/training and similar)
- [ ] Demo Mode tool registry excludes mutating tools
- [ ] Derived read tools remain available
- [ ] System/tool guidance does not suggest unavailable tools in Demo Mode
- [ ] Non-demo mode keeps the full tool set

## Control Center and health safe on derived-only

**What to build:** With only the derived database configured, Control Center and health checks succeed for the demo path — no hard dependency on SQL Server/MySQL/source Postgres for green home/health.

**Blocked by:** Demo Mode profile seam; Demo chrome and intelligence-first nav/routes

- [ ] Control Center does not 500 when source databases are unset in Demo Mode
- [ ] Source-backed home widgets are removed, stubbed empty, or otherwise safe
- [ ] Cards/links do not send users into blocked source routes without a soft landing
- [ ] Health check in Demo Mode succeeds with derived DB only
- [ ] Non-demo health may still check all databases

## End-to-end Demo Mode wiring pass

**What to build:** A verified Demo Mode path: login → allowed pages → chat with allowlisted tools → mutation/job refusal; and confirmation that Demo Mode off leaves the local full-stack experience intact.

**Blocked by:** Demo login gate; Demo chrome and intelligence-first nav/routes; Hard read-only and jobs no-execute; AI chat allowlist (Groq/Cerebras-ready); Control Center and health safe on derived-only; Neon snapshot runbook and Vercel env checklist

- [ ] Checklist or short verification notes covering login, allowlisted tour, chat tool scope, mutation refusal, jobs off
- [ ] Confirm demo as-of windows still show snapshot data
- [ ] Confirm `DEMO_MODE` off (local) does not keep demo clock/nav gates accidentally on
- [ ] Gaps found during the pass are fixed or filed against the owning ticket’s criteria
