# Demo Mode ops runbook (Vercel + Neon)

One-time setup for the **derived database only** (`wovo_ai`). Source databases (SQL Server, MySQL, source Postgres / `wovo_new`) are **not** required for the Vercel deploy — see [ADR 0001](adr/0001-vercel-demo-derived-db-only.md).

---

## Prerequisites (local, one-time snapshot)

Produce the snapshot on a machine that already ran the full local pipeline (see [deployment-guide.md](deployment-guide.md) Phase A):

```bash
docker compose up -d
bun run dev          # in another terminal
bun run seed-all     # 10–30 min; needs Ollama for case-clustering
bun run scripts/export-demo-snapshot.ts
```

Output: `dumps/demo-snapshot.sql` — INSERTs for pre-computed ML/AI tables (risk scores, clusters, anomalies, remediations, job history, etc.).

Commit or copy this file; Vercel does not generate it.

---

## 1. Provision Neon (derived DB only)

1. Create a [Neon](https://neon.tech) project (e.g. `wovo-demo`).
2. Create one database named **`wovo_ai`** (matches `POSTGRES_DATABASE_WOVO_AI`).
3. From the Neon dashboard, note host, port, user, password, and enable **SSL**.
4. Do **not** provision SQL Server, MySQL, or a separate source Postgres for this deploy.

---

## 2. Enable pgvector

The snapshot includes `case_embeddings` with `vector(1024)` columns. Enable the extension **before** schema push or snapshot load:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

Run in Neon SQL Editor or:

```bash
psql "$NEON_DATABASE_URL" -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

(Same requirement as local `init/postgres/03_wovo_ai_setup.sql`.)

---

## 3. Push Drizzle schema

Schema lives in `lib/db/schema.ts`; Drizzle Kit config is `drizzle.config.ts`. Same approach as [deployment-guide.md](deployment-guide.md) (Hetzner B6) — **`db:push`**, not a manual migration run, for greenfield Neon:

```bash
export POSTGRES_HOST=<neon-host>
export POSTGRES_PORT=5432
export POSTGRES_USER=<neon-user>
export POSTGRES_PASSWORD=<neon-password>
export POSTGRES_DATABASE_WOVO_AI=wovo_ai
export POSTGRES_SSL=true

bun install
bun run db:push
```

Creates all `wovo_ai` tables (including vector columns). For versioned migrations instead, use `bun run db:migrate` with files under `drizzle/` — only if you intentionally maintain migration history on Neon.

`lib/db/drizzle.ts` reads the same `POSTGRES_*` vars (no separate connection string env).

---

## 4. Load demo snapshot

After schema push:

```bash
psql "postgresql://<user>:<password>@<host>:5432/wovo_ai?sslmode=require" \
  -f dumps/demo-snapshot.sql
```

Or paste/run the file in Neon SQL Editor. The export script uses `ON CONFLICT DO NOTHING` for idempotent reloads.

To refresh demo data: re-export locally after re-seeding, then re-run this load (ops step — no in-app reset in v1).

---

## 5. Vercel environment checklist

Set in **Project → Settings → Environment Variables** (Production; Preview optional).

| Variable | Required | Notes |
|----------|----------|--------|
| `DEMO_MODE` | Yes | `true` |
| `DEMO_AS_OF` | Yes | ISO timestamp pinned as demo “now” (e.g. `2026-03-29T00:00:00.000Z`). Match snapshot export date when possible. |
| `NEXT_PUBLIC_DEMO_MODE` | Yes | Same as `DEMO_MODE` — needed for client-side relative ages (freshness badges, connect pages) |
| `NEXT_PUBLIC_DEMO_AS_OF` | Yes | Same as `DEMO_AS_OF` — mirror for client bundles |
| `POSTGRES_HOST` | Yes | Neon host |
| `POSTGRES_PORT` | Yes | Usually `5432` |
| `POSTGRES_USER` | Yes | Neon role |
| `POSTGRES_PASSWORD` | Yes | Neon password |
| `POSTGRES_DATABASE_WOVO_AI` | Yes | `wovo_ai` |
| `POSTGRES_SSL` | Yes | `true` for Neon |
| `DEMO_USERNAME` | Yes | Demo login user (Ticket 3 gate). Placeholder until wired. |
| `DEMO_PASSWORD` | Yes | Demo login password (Ticket 3 gate). Placeholder until wired. |
| `DEMO_SESSION_SECRET` | Yes | HMAC secret for signed demo session cookie |
| `AI_PROVIDER` | Yes | `groq` or `cerebras` for live chat on Vercel |
| `GROQ_API_KEY` | Yes* | Free tier: [console.groq.com](https://console.groq.com) |
| `CEREBRAS_API_KEY` | Yes* | Free tier: [cloud.cerebras.ai](https://cloud.cerebras.ai); cascade fallback |
| `NEXT_PUBLIC_APP_URL` | Yes | Public URL, e.g. `https://your-app.vercel.app` |

\*At least one provider key required; set both if using cascade/fallback.

**Leave unset on Vercel (not needed for Demo Mode):**

- `SQLSERVER_*`, `MYSQL_*`
- `POSTGRES_DATABASE` (source / `wovo_new` app DB)
- `OLLAMA_*` (embedding jobs do not run on Vercel)

---

## 6. Deploy and verify

1. Deploy to Vercel after env vars are set.
2. Hit `/api/health` — should succeed with derived DB only (once Demo Mode profile is implemented).
3. Log in with demo credentials (once Ticket 3 login gate is wired).
4. Confirm intelligence-first pages show snapshot data relative to `DEMO_AS_OF`.

---

## Quick reference

| Step | Command / action |
|------|------------------|
| Export snapshot (local) | `bun run scripts/export-demo-snapshot.ts` → `dumps/demo-snapshot.sql` |
| pgvector | `CREATE EXTENSION IF NOT EXISTS vector;` |
| Schema | `bun run db:push` |
| Load data | `psql … -f dumps/demo-snapshot.sql` |
| Full local stack (non-demo) | Docker + all DB env vars; `DEMO_MODE` off or unset |
