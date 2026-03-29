# Data Architecture — Why 5 Databases?

## The Situation

WOVO+ wasn't built from scratch. It was built **on top of** four existing systems that were already running in production. Each has its own database, its own schema, its own history.

## The 4 Source Databases

### `wovo_new` (PostgreSQL) — The Engage Platform

Connection: `lib/db/postgres.ts` using `pg` Pool with raw SQL.

This is the original WOVO platform for worker engagement. Django-era schema, roughly 120 tables. The tables you'll touch most:

- **`clients_clientinfo`** — The master supplier list. Every factory has a `client_key` (string ID) and `name`. This is the starting point for "which suppliers exist?"
- **`survey_mdlsurvey`** — Survey definitions. Title, status (0=draft, 1=active, 2=closed), linked to a `client_id`.
- **`survey_mdlsurveyquestionresponses`** — The actual text workers typed in surveys. This is the raw material for sentiment analysis.
- **`clients_clientrelation`** + **`clients_clientinfotorelationmapping`** — Brand-to-supplier hierarchy. `relation_type = 0` means "parent company." This is how you answer "which factories belong to Nike?"

**Why raw SQL instead of an ORM?** We don't own this schema. It was designed by someone else, years ago, with Django conventions. An ORM would require modeling 120 tables we mostly don't use. Raw SQL lets us write targeted queries against the 5-6 tables we need.

### `wc_global` (PostgreSQL) — Worker Identity Registry

Connection: `lib/db/postgres-wc-global.ts` using `pg` Pool with raw SQL.

This is where worker identities live. Key table:

- **`mdl_participant`** — Worker records per factory. `client_id` links to the factory, `is_active` tracks employment status.

When you need "how many workers does this factory have?", this is the source. About 22 tables total.

**The hardcoded name:** The database name `"wc_global"` is literally hardcoded in the connection file — not even in an environment variable. This tells you how long this database has existed and how tightly integrated it is with the broader WOVO ecosystem. Changing the name would mean coordinating with every other system that connects to it.

### `WOVO` (SQL Server) — Grievance Cases

Connection: `lib/db/sql-server.ts` using `mssql`.

This is the Connect module — where workers submit complaints. Key tables:

- **`[Case]`** — Each grievance. Has `CaseStatusId` (1=new, 2=in_progress, >=5=resolved), `Priority` (1=high), `CompanyId` linking to the factory.
- **`Message`** — The actual text of complaints. This is what gets embedded into vectors for clustering.
- **`Company`** — Factory master data with `MailingCountry`, `ParentCompanyId`, and geographic coordinates (via `CompanyPost` for lat/lng).
- **`Payslip` / `stgPayslipReportData`** — Worker wage records. Net pay, gross pay, currency, by factory.

**Why SQL Server?** The Connect module was built on .NET, which historically uses SQL Server. This isn't a choice WOVO+ made — it's a constraint WOVO+ inherited.

### `iomadprod` (MySQL) — Training/Moodle

Connection: `lib/db/mysql.ts` using `mysql2`.

Moodle is an open-source LMS (Learning Management System). `iomadprod` is Moodle's production database. Key tables:

- **`mdl_course`** — Training courses available.
- **`mdl_user_enrolments`** — Who's enrolled in what.
- **`mdl_course_completions`** — Who actually finished.
- **`mdl_company_course`** — Links courses to factories (`companyid`).

The training completion rate for a factory = `completed / enrolled`. This feeds directly into the training risk dimension.

## The 1 Derived Database

### `wovo_ai` (PostgreSQL) — Computed Intelligence

Connection: `lib/db/drizzle.ts` using Drizzle ORM + `postgres.js`.

**This is the only database WOVO+ owns.** Every table is defined in `lib/db/schema.ts` (~826 lines), managed by Drizzle migrations.

What lives here:
- **Cache layer:** `supplierRiskScores`, `supplierRiskHistory`, `surveyAnalysis`, `caseSummaryCache`
- **ML outputs:** `caseEmbeddings` (pgvector 1024-dim), `caseClusters`, `payslipAnomalies`, `supplierRiskForecast`
- **Monitoring:** `supplierMonitoringSignals`, `regionalBenchmarks`, `workerVoiceTrends`
- **Remediation:** `remediationPlans`, `remediationEvidence`, `remediationAuditLog`
- **Operations:** `jobQueue`, `jobRuns`, `jobSchedules`, `alerts`, `aiChatHistory`
- **Regulatory:** `regulatoryFrameworks`, `frameworkRequirements`, `supplierFrameworkCompliance`

**Why Drizzle ORM here but raw SQL for the others?** Because we control this schema. We designed every table, every column, every index. Drizzle gives us typed queries, migrations, and schema validation. The source databases have schemas we can't change, so we query them directly.

## The Core Mental Model: Source vs. Derived

```
SOURCE (ground truth):         DERIVED (computed, rebuildable):
wovo_new  ─┐                   ┌─ risk scores
wc_global  ─┤  9 batch jobs    ├─ embeddings & clusters
WOVO (SS)  ─┤  ─────────────>  ├─ forecasts & anomalies
iomadprod  ─┘                  ├─ monitoring signals
                               ├─ remediation tracking
                               └─ briefings & alerts

                               All stored in: wovo_ai
```

**The key insight:** You can `DROP DATABASE wovo_ai`, run `bun run db:push` to recreate the schema, then trigger all 9 jobs. Everything regenerates from the source databases. Nothing in `wovo_ai` is primary data — it's all derived intelligence.

This matters because:
1. **Fearless iteration.** You can change how risk is calculated, re-run the job, and see different scores. The source data is untouched.
2. **Debugging.** If a risk score looks wrong, you can trace it back to the source query that produced it.
3. **Migration safety.** Schema changes to `wovo_ai` never risk corrupting operational data.

## How Jobs Cross Database Boundaries

The most complex job (`calculate-risk`) queries all 4 source databases in a single run:

```
1. SELECT suppliers FROM wovo_new.clients_clientinfo
2. SELECT case stats FROM WOVO.[Case] (SQL Server)
3. SELECT survey counts FROM wovo_new.survey_mdlsurvey
4. SELECT training rates FROM iomadprod.mdl_course_completions (MySQL)
5. SELECT worker counts FROM wc_global.mdl_participant
6. UPSERT results INTO wovo_ai.supplier_risk_scores (Drizzle)
```

All 4 source queries happen **upfront in batch** — not per-supplier. This avoids N+1 problems (querying 300 times instead of once). The results are keyed by `supplierId` / `client_key` / `CompanyId` and joined in application code.

## Connection Patterns

| Database | Driver | Connection Pooling | Query Style |
|----------|--------|-------------------|-------------|
| `wovo_new` | `pg` | Pool (max connections via env) | Raw SQL strings |
| `wc_global` | `pg` | Pool (hardcoded DB name) | Raw SQL strings |
| `WOVO` | `mssql` | Pool (10 max, 30s idle timeout) | Parameterized with `mssql.Int()`, `mssql.NVarChar()` |
| `iomadprod` | `mysql2` | Pool (10 connections, 0 queue limit) | `?` placeholder params |
| `wovo_ai` | `postgres.js` + Drizzle | 10 connections, 20s idle, 10s connect timeout | Typed ORM queries |

All pools use **global singletons** cached on `globalThis` in development (prevents hot-reload from creating new pools). This is a Next.js pattern — without it, every code change would leak a database connection.
