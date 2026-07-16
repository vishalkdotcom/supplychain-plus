# Contributing to SupplyChain+

## Development Environment

- **OS:** Windows (primary development platform)
- **Runtime:** [Bun](https://bun.sh) — always use `bun` / `bunx` instead of npm / npx
- **Node.js:** >= 22 via [fnm](https://github.com/Schniz/fnm) (`fnm use 22`)
- **Docker Desktop:** Required for the 3 database containers
- **Editor:** Any — the project uses ESLint for code consistency

## Getting Started

See the [README quickstart](README.md#quickstart) for full setup instructions.

## Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Stable, production-ready code |
| `feat/<description>` | New features |
| `fix/<description>` | Bug fixes |
| `docs/<description>` | Documentation changes |
| `refactor/<description>` | Code restructuring |

Always branch from `main` and target `main` with pull requests.

## Commit Conventions

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add payslip anomaly trend chart (#99)
fix: resolve SQL Server ID mapping for risk scores (#14)
docs: add comprehensive project documentation (#102)
refactor: extract queue engine into separate module
```

- Start with a type prefix: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`
- Use lowercase, imperative mood ("add" not "added")
- Include the issue number in parentheses when applicable

## Pull Request Guidelines

- Reference the issue in the PR title: `feat: cluster trend history (#105)`
- Include `fixes #N` in the PR body to auto-close issues on merge
- Keep PRs focused — one feature or fix per PR
- Ensure `bun run lint` and `bun run build` pass before opening

## Development Workflow

```
1. git checkout main && git pull
2. git checkout -b feat/my-feature
3. Make changes
4. bun run lint                    # Fix any lint errors
5. bun run build                   # Verify no type errors
6. git add <files> && git commit
7. git push -u origin feat/my-feature
8. Open PR against main
```

## Code Style

- **TypeScript** strict mode throughout
- **ESLint** with `eslint-config-next` — run `bun run lint` to check
- **Tailwind CSS 4** for styling — utility-first, no custom CSS files
- **shadcn/ui** components in `components/ui/` — use these for all standard UI elements
- **Server Components** by default — only add `"use client"` when you need browser APIs, event handlers, or hooks
- **Zod** for runtime validation of AI outputs and API inputs

## Database Changes

### PostgreSQL (Drizzle ORM)

The PostgreSQL container hosts 2 databases: `wovo_new` (app data, Engage module) and `wovo_ai` (embeddings, jobs, analytics). Drizzle ORM manages the `wovo_ai` schema defined in `lib/db/schema.ts`. After making changes:

```bash
bun run db:push       # Push schema changes to wovo_ai
bun run db:generate   # Generate migration files (for production)
bun run db:studio     # Open visual DB editor to inspect data
```

### SQL Server and MySQL

Schemas live in `init/sqlserver/` and `init/mysql/` respectively. These are initialization scripts that run when Docker containers are first created. To apply schema changes to an existing container:

1. Update the SQL files in `init/`
2. Remove the Docker volume: `docker compose down -v` (destroys data)
3. Restart: `docker compose up -d`
4. Re-seed: `bun run seed-all`

## AI Provider Setup

### Minimum for Development

Set at least one free API key in `.env.local`:

- **Groq** (500K tokens/day free): `GROQ_API_KEY=...`
- **Cerebras** (1M tokens/day free): `CEREBRAS_API_KEY=...`

### Chat UI Provider

Controlled by `AI_PROVIDER` in `.env.local`. Options: `openai`, `nim`, `perplexity`, `lmstudio`, `ollama`.

### Job Pipeline Provider

Controlled by `JOB_AI_CASCADE` — a comma-separated list of `provider:model` pairs. The pipeline tries each in order, falling through on rate limits (429) or server errors (5xx). The default 11-model cascade spans Groq and Cerebras free tiers.

## Adding a New API Route

Convention: `app/api/<module>/<resource>/route.ts`

```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Use lib/db connections for data access
  return NextResponse.json({ data: [] });
}
```

- Export named functions: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`
- Use `NextRequest` for typed query params
- Return `NextResponse.json()` for JSON responses
- Add the route to `docs/API_REFERENCE.md`

## Adding a New Job Handler

1. **Register the type** in `lib/jobs/constants.ts` — add to `JOB_TYPES`, set timeout and retry config
2. **Create the handler** in `lib/jobs/handlers/<name>.ts` — export a function matching the handler signature
3. **Register in the index** at `lib/jobs/handlers/index.ts` — add to the `JOB_REGISTRY` map
4. **Add an API trigger route** at `app/api/jobs/<name>/route.ts` — POST endpoint that enqueues the job
5. **Add UI trigger** (optional) — add a card in `components/operations/job-cards.tsx`

If the job uses Ollama embeddings, set `requiresOllama: true` in the job config to prevent parallel execution with other embedding jobs (avoids VRAM model-swap thrashing).
