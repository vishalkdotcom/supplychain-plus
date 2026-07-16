# Frontend & Data Flow — How the UI Gets and Shows Data

## The Architecture

```
5 Databases → ~72 API Routes → React Query Cache → React Components
```

No GraphQL, no tRPC, no WebSockets. Plain REST endpoints returning JSON. This is the simplest architecture that works for the problem.

## Why React Query Is the Only State Manager

SupplyChain+ has **no Redux, no Zustand, no MobX, no Context-based stores.** React Query (TanStack Query) handles all data:

**Why this works here:**
- All state is **server-derived**. There's no complex client-side state to manage. No shopping cart, no multi-step form wizard, no real-time collaboration. Every piece of data comes from an API call.
- React Query handles **caching, stale detection, refetching, and loading states** out of the box. You write `useQuery("suppliers", fetchSuppliers)` and get loading spinners, error boundaries, and automatic refetching for free.
- **URL state** (via `nuqs`) handles filters and pagination. The current page, search term, risk level filter — all encoded in the URL. This makes views reproducible and shareable.

**When would you add a state manager?** If the app needed real-time collaboration (multiple users editing the same remediation plan simultaneously) or complex client-side workflows (multi-step wizards with interdependent fields). Currently it doesn't.

## The API Layer (`lib/api.ts`)

A centralized fetch wrapper with ~46 typed functions:

```typescript
export async function fetchSuppliers(params: SupplierParams): Promise<PaginatedResponse<Supplier>> {
  const query = buildQueryString(params);
  const res = await fetch(`/api/suppliers?${query}`);
  return res.json();
}
```

**`buildQueryString()`** converts typed params into URL query strings, filtering out undefined values. This keeps API calls consistent and type-safe.

### Pagination Standard

Every list endpoint returns the same shape:
```typescript
{
  data: T[],
  total: number,      // total matching records
  page: number,       // current page (1-indexed)
  perPage: number,    // items per page
  totalPages: number  // total pages
}
```

The frontend components (`Pagination`, `DataTable`) consume this shape directly.

## View Context — Three Scope Levels

The app supports three levels of data scope:

| Level | What You See | Filter Applied |
|-------|-------------|---------------|
| **Portfolio** | All suppliers across all brands | (none) |
| **Brand** | One parent company's suppliers | `parentCompanyId={brandId}` |
| **Supplier** | One factory's details | `supplierId={id}` |

`ViewContext` (React Context) tracks the current scope:
```typescript
{
  viewMode: "portfolio" | "brand" | "supplier",
  currentBrandId: string | null,
  currentSupplierId: string | null
}
```

Every fetch function passes these filters to the API. The API routes accept `parentCompanyId` and `supplierId` as query params and filter their queries accordingly.

**How brand filtering works at the API level:**
```sql
-- From /api/surveys
WHERE ci.client_key IN (
  SELECT m.client_key
  FROM clients_clientinfotorelationmapping m
  JOIN clients_clientrelation r ON m.relation_id = r.id
  WHERE r.relation_type = 0 AND r.relation_id = $parentCompanyId
)
```

This join traverses the brand→supplier hierarchy in `wovo_new` to find which suppliers belong to the selected brand.

## The Frontend Modules

The app has 11 top-level page groups. The core 6 modules (Control Center, Connect, Engage, Educate, Intelligence, Governance) map to the Detect→Act→Evidence loop. Supporting sections (Suppliers, Remediation, AI, Operations, Brands) handle cross-cutting concerns.

### Control Center (`/`)
The executive dashboard. Renders `DashboardView` which fetches from `/api/metrics` (hits all 5 DBs), `/api/ml-insights`, `/api/alerts`, `/api/recommendations`. Shows:
- KPI metric cards (total suppliers, high-risk count, active cases, training %)
- ML insight cards (critical clusters, anomalies, forecast warnings, sentiment shifts)
- Risk distribution histogram (Recharts)
- Geographic risk map (D3-geo + React Simple Maps)
- Supply chain network graph (React Flow / Xyflow)

### Connect (`/connect`)
Case management. Three pages:
- **Case inbox** — Paginated, filterable list from SQL Server
- **Clusters** (`/connect/clusters`) — Systemic patterns from wovo_ai
- **Payslip anomalies** (`/connect/payslip-anomalies`) — Wage violations from wovo_ai

Case detail (`/connect/[id]`) is the richest page — shows status pipeline, AI guidance, draft response generator, cross-module context (related surveys, training gaps, risk score).

### Engage (`/engage`)
Survey management. Two pages:
- **Survey list** — Create and track surveys
- **Voice trends** (`/engage/voice-trends`) — Emerging/declining topics over time, sentiment charts

### Educate (`/educate`)
Training module. Features:
- PDF-to-course AI generation (upload policy PDF → structured course with quizzes)
- Multi-language translation (Vietnamese, Bengali, Mandarin, Khmer, etc.)
- Course completion tracking per supplier

### Intelligence (`/intelligence`)
Two pages:
- **Briefing** — The daily digest with attention items, stat cards, risk movements
- **Regional insights** (`/intelligence/regional-insights`) — 4 tabs: Issue Radar, Peer Comparison, Silence Alerts, Cluster Overlap

### Governance (`/governance`)
Regulatory compliance:
- **Regulatory radar** (`/governance/regulatory-radar`) — Framework list with requirement counts and compliance stats
- **Framework detail** (`[frameworkId]`) — Requirements checklist, supplier compliance heatmap, deadline tracking
- **Remediation** (`/remediation`, `/remediation/[id]`) — Plan lifecycle, evidence timeline, audit log, export

## Key Frontend Patterns

### Lazy-Loaded Charts
Heavy visualization components (maps, network graphs, charts) use dynamic imports with loading skeletons:
```typescript
const GeographicRiskMap = dynamic(
  () => import("@/components/dashboard/geographic-risk-map"),
  { loading: () => <Skeleton className="h-[400px]" /> }
);
```
This keeps initial page load fast — charts load only when scrolled into view.

### URL-Driven Filters
Search, pagination, and filter state live in the URL via `nuqs`:
```typescript
const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
const [search, setSearch] = useQueryState("search", parseAsString.withDefault(""));
const [riskLevel, setRiskLevel] = useQueryState("risk", parseAsString);
```
Benefits: browser back/forward works, views are shareable via URL, refresh preserves state.

### Cross-Module Context
The case detail page (`/connect/[id]`) calls `/api/cases/[id]/context` — the richest single endpoint. It joins **3 databases** to provide:
- Open case count at this supplier (SQL Server)
- Supplier's current risk score (wovo_ai)
- Average resolution time for this case type (wovo_ai playbook cache)
- Similar open cases at the same supplier (SQL Server)
- Survey themes for this supplier (wovo_new + wovo_ai)
- Training gaps (MySQL)

This gives case handlers full context without navigating to 6 different screens.

### Demo User Context
`DemoUserContext` provides lightweight user identity for audit trails. Users can switch between demo roles. The selected user's ID is passed as `actorId` when making changes (status transitions, evidence additions) so the audit log records who did what.

## API Route Organization

```
app/api/
  ├── suppliers/             GET (list), [id]/ GET (detail), [id]/history, [id]/training
  ├── cases/                 GET (list), [id]/ GET/PATCH, [id]/context, [id]/status
  ├── clusters/              GET (list), [id]/ GET, trends/
  ├── surveys/               GET/POST
  ├── voice-trends/          GET, suppliers/
  ├── payslip-anomalies/     GET/PATCH, trends/
  ├── forecasts/             GET
  ├── monitoring-signals/    GET
  ├── regional-insights/     GET
  ├── remediations/          GET/POST, [id]/ GET/PATCH, [id]/evidence, [id]/audit, [id]/export
  ├── regulatory/            frameworks/, compliance/
  ├── alerts/                GET/PATCH
  ├── recommendations/       GET
  ├── metrics/               GET, briefing/
  ├── intelligence/          GET
  ├── ml-insights/           GET
  ├── brands/                GET, [id]/
  ├── activities/            GET (cross-module activity feed)
  ├── timeline/              GET (per-supplier timeline)
  ├── health/                GET (pings all 5 DBs)
  ├── freshness/             GET (latest job completion times)
  ├── ai/                    chat/, briefing, guidance, summarize, draft-response,
  │                          survey, educate, translate/, reports, playbook,
  │                          remediation-root-cause
  └── jobs/                  trigger, runs/, cancel/, schedules/, queue/status
```

~72 route files total. Most follow the REST pattern. The `/api/ai/*` routes handle streaming (for chat) and structured generation (for everything else).
