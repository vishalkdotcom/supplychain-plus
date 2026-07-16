# Demo Mode — guide & next steps

You have the full Demo Mode implementation on branch `vishalk/wpm-demo-mode-vercel` (commit `87248a7`). This guide is the **what to do now** checklist; deep ops and QA live in sibling docs.

| Doc                                                                                | Use when                                       |
| ---------------------------------------------------------------------------------- | ---------------------------------------------- |
| [demo-mode-runbook.md](demo-mode-runbook.md)                                       | One-time Neon setup, snapshot load, Vercel env |
| [demo-mode-verification.md](demo-mode-verification.md)                             | Manual pass before sharing the URL             |
| [specs/vercel-demo-mode.md](specs/vercel-demo-mode.md)                             | Product intent & user stories                  |
| [adr/0001-vercel-demo-derived-db-only.md](adr/0001-vercel-demo-derived-db-only.md) | Architecture decision                          |

---

## What shipped

- **Profile seam** — `lib/demo-mode/profile.ts` (clock, routes, mutations, jobs, AI tools, auth)
- **Login gate** — demo credentials + signed cookie; middleware blocks unauthenticated app/API access
- **Intelligence-first surface** — banner, filtered nav, `/not-in-demo` for blocked deep links
- **Hard read-only** — mutation + job guards on representative APIs and queue poller
- **AI allowlist** — derived read tools only in demo; Groq/Cerebras via existing provider plumbing
- **Derived-only health & Control Center** — no source DB required for green deploy path
- **Tests** — 95 passing (`bun test`)

---

## Phase 1 — Verify locally (today)

### 1. Demo Mode on

Add to `.env.local` (mirror `NEXT_PUBLIC_*` for client freshness badges):

```env
DEMO_MODE=true
DEMO_AS_OF=2025-06-15T12:00:00.000Z
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_DEMO_AS_OF=2025-06-15T12:00:00.000Z
DEMO_USERNAME=demo
DEMO_PASSWORD=<pick-a-strong-password>
DEMO_SESSION_SECRET=<random-32+-chars>
AI_PROVIDER=groq
GROQ_API_KEY=<your-key>
POSTGRES_*=<local wovo_ai or Neon>
```

Run:

```bash
bun run dev          # port 3030
bun test             # automated smoke
```

Walk through [demo-mode-verification.md](demo-mode-verification.md) sections 1–7. Fill in the **Known gaps** table at the bottom with anything that fails.

### 2. Demo Mode off (regression)

Unset `DEMO_MODE` and `NEXT_PUBLIC_DEMO_MODE`. Restart with Docker source DBs up. Confirm full nav, no login gate, mutations and jobs work as before.

---

## Phase 2 — Ship the branch

1. **Open PR** from `vishalk/wpm-demo-mode-vercel` → `main` (or your team base).
2. **CI** — ensure `bun test` runs in pipeline (add a `test` script to `package.json` if missing).
3. **Build note** — `next build` may fail on `/connect/payslip-anomalies` prerender (`Uncached data outside Suspense`). This predates Demo Mode; fix before Vercel deploy or mark route dynamic. TypeScript compile succeeds.

---

## Phase 3 — Neon + Vercel (one-time ops)

Follow [demo-mode-runbook.md](demo-mode-runbook.md) end to end:

1. Export snapshot locally (`bun run scripts/export-demo-snapshot.ts` → `dumps/demo-snapshot.sql`).
2. Create Neon project → database `wovo_ai` → `CREATE EXTENSION vector`.
3. `bun run db:push` against Neon.
4. `psql … -f dumps/demo-snapshot.sql`.
5. Set Vercel env (see runbook table). **Do not** set `SQLSERVER_*`, `MYSQL_*`, or source `POSTGRES_DATABASE`.
6. Set `NEXT_PUBLIC_APP_URL` to the production URL.
7. Deploy → hit `/api/health` → log in → run verification checklist against production.

**Refresh snapshot later:** re-seed locally, re-export, re-load SQL on Neon (ops step, not in-app).

---

## Phase 4 — Interview-ready demo

### Suggested tour (15 min)

1. **Login** — explain demo credentials, not a production IdP.
2. **Banner** — “Data frozen as of &lt;date&gt;; not live multi-source.”
3. **Control Center** — risk, ML insights, freshness relative to as-of.
4. **Systemic Patterns** → **Wage Anomalies** → **Voice Trends** — derived intelligence stories.
5. **Intelligence / Governance / Remediation** — Detect → Govern → Act without mutating.
6. **Jobs** — show last completed runs from snapshot; explain jobs don’t run on Vercel.
7. **AI Assistant** — live Groq/Cerebras; read-only tools against derived store only.
8. **Architecture** — one Neon derived DB on Vercel; full four source + derived stack on local Docker.

### Talking points

- Source vs derived mental model (see `CONTEXT.md` / mental model docs).
- Demo Mode is env-driven — local dev unchanged when flag is off.
- Honest scope: Case Inbox, Surveys, Educate not in hosted demo by design (ADR 0001).

---

## Follow-up work (optional polish)

Prioritized backlog from code review and spec gaps:

| Priority | Item                                                                          | Why                           |
| -------- | ----------------------------------------------------------------------------- | ----------------------------- |
| **P0**   | Fix `/connect/payslip-anomalies` build prerender                              | Blocks clean Vercel deploy    |
| **P1**   | Run full manual verification on Neon + Vercel                                 | Confidence before sharing URL |
| **P2**   | Label hidden nav as “Not in demo” instead of removing                         | Spec user story #30           |
| **P2**   | Guard remaining AI POST routes (`/api/ai/survey`, `/api/ai/educate`, etc.)    | Complete read-only surface    |
| **P3**   | Centralize route policy (sidebar vs profile duplication)                      | Maintainability               |
| **P3**   | Require `DEMO_AS_OF` when `DEMO_MODE=true` (fail loud vs wall-clock fallback) | Safer misconfiguration        |
| **P3**   | Add `test` script to `package.json`                                           | CI discoverability            |

---

## Quick reference

```bash
# Automated smoke
bun test

# Local demo
DEMO_MODE=true bun run dev

# Export snapshot (needs full local seed)
bun run scripts/export-demo-snapshot.ts

# Schema to Neon
bun run db:push
```

**Public demo URL checklist:** health green → login works → banner shows as-of → allowlisted tour loads → chat answers from snapshot → POST remediation returns 403 → job trigger returns 403.
