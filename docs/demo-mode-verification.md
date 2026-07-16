# Demo Mode manual verification checklist

End-to-end wiring pass for the Vercel intelligence-first demo. Run after setting env per [demo-mode-runbook.md](demo-mode-runbook.md).

**Prerequisites**

- Derived DB loaded with demo snapshot (`dumps/demo-snapshot.sql`)
- `DEMO_MODE=true`, `DEMO_AS_OF` set to match snapshot date
- `DEMO_USERNAME` / `DEMO_PASSWORD` / `DEMO_SESSION_SECRET` configured
- For client-side relative ages (freshness badges, connect pages): also set `NEXT_PUBLIC_DEMO_MODE` and `NEXT_PUBLIC_DEMO_AS_OF` to the same values
- `AI_PROVIDER` + Groq/Cerebras keys for live chat

---

## 1. Login flow

| Step | Action | Expected |
|------|--------|----------|
| 1.1 | Open `/` while logged out | Redirect to `/login` |
| 1.2 | Submit wrong credentials | Error message; stay on login |
| 1.3 | Submit `DEMO_USERNAME` / `DEMO_PASSWORD` | Redirect to Control Center (or `?redirect=` target) |
| 1.4 | Refresh any allowed page | Session persists; no re-login |
| 1.5 | Call `GET /api/demo-auth/session` | `{ authenticated: true }` |
| 1.6 | Log out (sidebar or `POST /api/demo-auth/logout`) | Session cleared; redirect to login |
| 1.7 | Call protected API without cookie, e.g. `GET /api/clusters` | `401 Authentication required` |
| 1.8 | Open `/api/health` without auth | `200` (public in demo) |

---

## 2. Allowlisted tour (intelligence-first surface)

Confirm **Demo Mode** banner shows pinned as-of date. Walk these routes — each should load without 500:

| Area | Routes |
|------|--------|
| Home | `/` (Control Center) |
| Portfolio | `/brands`, `/suppliers`, drill-down `/brands/[id]`, `/suppliers/[id]` |
| AI | `/ai` |
| Connect (derived) | `/connect/clusters`, `/connect/clusters/[id]`, `/connect/payslip-anomalies` |
| Engage (derived) | `/engage/voice-trends` |
| Intelligence | `/intelligence`, `/intelligence/regional-insights` |
| Governance | `/governance`, `/governance/regulatory-radar` |
| Remediation | `/remediation`, `/remediation/[id]` |
| Operations | `/operations/jobs` |
| Settings | `/settings` |

**Blocked routes** — should redirect to `/not-in-demo` (not 500):

| Route | Reason |
|-------|--------|
| `/connect` | Case Inbox hub (source-backed) |
| `/engage` | Surveys hub (source-backed) |
| `/educate` | Training (source-backed) |
| `/connect/inbox` or other `/connect/*` except clusters / payslip-anomalies | Source-backed |

**Nav**: sidebar should hide or disable Case Inbox, Surveys, Educate entries; allowed items remain clickable.

---

## 3. Chat tool scope (derived read only)

With `DEMO_MODE=true`, open AI Assistant and ask portfolio questions (e.g. “Which suppliers have highest risk?”).

| Check | Expected |
|-------|----------|
| Chat responds using derived data | Answers reference suppliers/clusters from snapshot |
| Source tools unavailable | Model does not call cases/surveys/training tools; prompts do not suggest them |
| Mutating tools unavailable | `markAlertRead`, `triggerRiskRecalculation` not registered |
| Read tools work | Risk, clusters, anomalies, voice trends, remediations, alerts, forecasts, monitoring, playbook |

**Automated**: `bun test __tests__/api/demo-mode-ai-tools.test.ts` — tool registry filters correctly.

---

## 4. Mutation refusal

While logged in with demo session, attempt writes (browser devtools or curl):

| Endpoint | Method | Expected |
|----------|--------|----------|
| `/api/remediations` | POST | `403` — `Demo Mode is read-only` |
| `/api/remediations/[id]` | PATCH | `403` |
| `/api/remediations/[id]/evidence` | POST | `403` |
| `/api/alerts` | PATCH (mark read) | `403` |
| `/api/payslip-anomalies` | PATCH | `403` |
| `/api/jobs/schedules` | POST | `403` |
| `/api/jobs/schedules/[id]` | PATCH / DELETE | `403` |
| `/api/surveys` | POST (draft save) | `403` |
| `/api/cases/[id]/status` | PATCH | `403` |
| `/api/ai/chat/sessions` | PATCH (rename/pin) | `403` |

Read endpoints (`GET` on same resources) should still return snapshot data.

**Automated**: `bun test __tests__/api/demo-mode-guards.test.ts`

---

## 5. Jobs off

| Step | Action | Expected |
|------|--------|----------|
| 5.1 | `POST /api/jobs/trigger` with `{ "jobType": "calculate-risk" }` | `403` — `Jobs cannot run in Demo Mode` |
| 5.2 | `POST /api/jobs/calculate-risk` (direct handler) | `403` |
| 5.3 | `POST /api/jobs/cancel/[id]` | `403` |
| 5.4 | Open `/operations/jobs` | Job **history** from snapshot visible; no new runs enqueued |
| 5.5 | `GET /api/jobs/runs`, `GET /api/freshness` | `200` with snapshot rows |

---

## 6. Demo as-of windows (snapshot-relative data)

Set `DEMO_AS_OF` to a date near your snapshot export (e.g. `2025-06-15T12:00:00.000Z`).

| Check | Expected |
|-------|----------|
| Banner | Shows “Data as of June 15, 2025” (or your configured date) |
| Freshness badges | “3 days ago” / “fresh” / “stale” relative to **demo as-of**, not wall clock |
| Connect cluster / anomaly ages | `formatAge` labels consistent with as-of (not hundreds of days stale) |
| Intelligence briefing windows | “Last 24h” metrics use demo clock, not empty due to wall-clock drift |
| Voice trends / regional insights | Data visible for months around as-of |

If client ages look wrong but server API data is fine, confirm `NEXT_PUBLIC_DEMO_MODE` and `NEXT_PUBLIC_DEMO_AS_OF` are set.

---

## 7. `DEMO_MODE` off (local full-stack)

Unset `DEMO_MODE` (and `NEXT_PUBLIC_DEMO_MODE`). Restart dev server with Docker source DBs available.

| Check | Expected |
|-------|----------|
| No demo banner | Banner hidden |
| No login gate | `/` loads without demo login (unless Keycloak configured) |
| Full nav | Case Inbox, Surveys, Educate visible and reachable |
| Mutations allowed | Remediation POST/PATCH succeeds (with valid payload) |
| Jobs executable | `POST /api/jobs/trigger` enqueues (when queue infra available) |
| Full AI tool set | Source + mutating tools available in chat |
| Health | `GET /api/health` checks postgres + SQL Server + MySQL |
| Wall clock | Relative ages use real time |

---

## Quick automated smoke

```bash
bun test __tests__/lib/demo-mode.test.ts
bun test __tests__/lib/demo-auth.test.ts
bun test __tests__/api/demo-mode-guards.test.ts
bun test __tests__/api/demo-mode-ai-tools.test.ts
bun test __tests__/lib/format-age.test.ts
bun test   # full suite
```

---

## Known gaps / filed follow-ups

Document anything still broken after this pass:

| Gap | Owner ticket | Notes |
|-----|--------------|-------|
| | | |
