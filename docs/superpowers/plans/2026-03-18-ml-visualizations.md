# ML Batch Job Data Visualizations — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Surface the output data from 5 ML batch jobs (case clusters, payslip anomalies, risk forecasts, worker voice trends, survey analysis enhancements) across new pages, enhanced existing pages, and the dashboard.

**Architecture:** 5 new API routes (Drizzle → PostgreSQL) serve ML data to 3 new pages and 3 enhanced existing components. A single `/api/ml-insights` aggregation endpoint powers all dashboard ML cards. All frontend follows existing patterns: React Query 5, shadcn/ui, Recharts, nuqs URL state.

**Tech Stack:** Next.js 16 App Router, Drizzle ORM, PostgreSQL, React Query 5, Recharts, shadcn/ui, Tailwind CSS 4, nuqs, @tabler/icons-react

**Spec:** `docs/superpowers/specs/2026-03-18-ml-visualizations-design.md` (see plan file at `C:\Users\vishal\.claude\plans\resilient-moseying-iverson.md`)

---

## Task 1: TypeScript Interfaces

**Files:**
- Modify: `types/index.ts` (append after line 306)

- [ ] **Step 1: Add ML type interfaces to types/index.ts**

**Note:** `VoiceTopic` and `PayslipAnomalyDetails` already exist in `lib/db/schema.ts` as schema-level types. The versions below are their client-facing mirrors in `types/index.ts`. For all client-side code (components, pages, api.ts), import from `@/types` not `@/lib/db/schema`.

Append after the `CaseContext` interface (line 306):

```typescript
// ===============================
// ML Batch Job Output Types
// ===============================

export interface VoiceTopic {
  name: string;
  mentions: number;
  sentiment: "positive" | "negative" | "neutral";
  delta: number;
}

export interface CaseCluster {
  id: number;
  clusterLabel: string;
  caseCount: number;
  supplierCount: number;
  regions: string[];
  caseTypes: string[];
  representativeMessages: string[];
  aiSummary: string;
  severity: "critical" | "warning" | "info";
  detectedAt: string;
}

export interface PayslipAnomalyDetails {
  expected: number;
  actual: number;
  currency: string;
  country: string;
  employeeCount: number;
}

export interface PayslipAnomaly {
  id: number;
  supplierId: string;
  supplierName: string;
  anomalyType: "below_minimum" | "sudden_drop" | "inconsistency";
  severity: "critical" | "warning" | "info";
  details: PayslipAnomalyDetails;
  aiInterpretation: string;
  isResolved: boolean;
  detectedAt: string;
}

export interface SupplierForecast {
  id: number;
  supplierId: string;
  forecastDate: string;
  predictedRiskScore: number;
  predictedCaseScore: number;
  predictedSurveyScore: number;
  predictedTrainingScore: number;
  confidence: number;
  trendDirection: "rising" | "falling" | "stable";
  aiReasoning: string;
  generatedAt: string;
}

export interface VoiceTrend {
  id: number;
  supplierId: string | null;
  month: string;
  emergingTopics: VoiceTopic[];
  decliningTopics: VoiceTopic[];
  sentimentShift: number;
  topThemes: VoiceTopic[];
  analyzedAt: string;
}

export interface MLInsightsSummary {
  clusterCount: number;
  criticalClusters: CaseCluster[];
  unresolvedAnomalies: { critical: number; warning: number; info: number };
  risingForecastSuppliers: Array<{
    supplierId: string;
    supplierName: string;
    predictedRiskScore: number;
    currentRiskScore: number;
    trendDirection: string;
  }>;
  globalSentimentShift: number;
  topEmergingTopic: VoiceTopic | null;
}
```

- [ ] **Step 2: Verify types compile**

Run: `bunx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors related to new types

- [ ] **Step 3: Commit**

```bash
git add types/index.ts
git commit -m "feat: add TypeScript interfaces for ML batch job outputs"
```

---

## Task 2: API Fetch Functions

**Files:**
- Modify: `lib/api.ts` (append after line 227)

**Dependencies:** Task 1

- [ ] **Step 1: Add new imports to lib/api.ts**

Add these to the existing import block at line 1-16:

```typescript
// Add to existing imports:
import {
  // ... existing imports ...
  CaseCluster,
  PayslipAnomaly,
  SupplierForecast,
  VoiceTrend,
  MLInsightsSummary,
} from "@/types";
```

- [ ] **Step 2: Add param interfaces and fetch functions**

Append after `advanceCaseStatus` (line 227):

```typescript
// ===============================
// ML Batch Job Data
// ===============================

interface ClusterParams extends PaginationParams {
  severity?: string;
}

interface AnomalyParams extends PaginationParams {
  supplierId?: string;
  severity?: string;
  anomalyType?: string;
  isResolved?: string;
}

interface ForecastParams {
  supplierId: string;
  limit?: number;
}

interface VoiceTrendParams {
  supplierId?: string;
  monthFrom?: string;
  monthTo?: string;
}

export async function fetchClusters(
  params: ClusterParams = {},
): Promise<PaginatedResponse<CaseCluster>> {
  const qs = buildQueryString({
    page: params.page,
    perPage: params.perPage,
    severity: params.severity,
  });
  const res = await fetch(`${API_BASE}/clusters${qs}`);
  if (!res.ok) throw new Error("Failed to fetch clusters");
  return res.json();
}

export async function fetchPayslipAnomalies(
  params: AnomalyParams = {},
): Promise<PaginatedResponse<PayslipAnomaly>> {
  const qs = buildQueryString({
    page: params.page,
    perPage: params.perPage,
    search: params.search,
    supplierId: params.supplierId,
    severity: params.severity,
    anomalyType: params.anomalyType,
    isResolved: params.isResolved,
  });
  const res = await fetch(`${API_BASE}/payslip-anomalies${qs}`);
  if (!res.ok) throw new Error("Failed to fetch payslip anomalies");
  return res.json();
}

export async function toggleAnomalyResolved(
  id: number,
  isResolved: boolean,
): Promise<void> {
  const res = await fetch(`${API_BASE}/payslip-anomalies`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, isResolved }),
  });
  if (!res.ok) throw new Error("Failed to update anomaly");
}

export async function fetchForecasts(
  params: ForecastParams,
): Promise<SupplierForecast[]> {
  const qs = buildQueryString({
    supplierId: params.supplierId,
    limit: params.limit,
  });
  const res = await fetch(`${API_BASE}/forecasts${qs}`);
  if (!res.ok) throw new Error("Failed to fetch forecasts");
  return res.json();
}

export async function fetchVoiceTrends(
  params: VoiceTrendParams = {},
): Promise<VoiceTrend[]> {
  const qs = buildQueryString({
    supplierId: params.supplierId,
    monthFrom: params.monthFrom,
    monthTo: params.monthTo,
  });
  const res = await fetch(`${API_BASE}/voice-trends${qs}`);
  if (!res.ok) throw new Error("Failed to fetch voice trends");
  return res.json();
}

export async function fetchMLInsights(): Promise<MLInsightsSummary> {
  const res = await fetch(`${API_BASE}/ml-insights`);
  if (!res.ok) throw new Error("Failed to fetch ML insights");
  return res.json();
}
```

- [ ] **Step 3: Verify compile**

Run: `bunx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No new errors

- [ ] **Step 4: Commit**

```bash
git add lib/api.ts
git commit -m "feat: add API fetch functions for ML batch job data"
```

---

## Task 3: API Route — Clusters

**Files:**
- Create: `app/api/clusters/route.ts`

**Dependencies:** Task 1

**Pattern reference:** `app/api/alerts/route.ts` — Drizzle query with conditions array + `and(...)`, order by desc, NextResponse.json

- [ ] **Step 1: Create clusters API route**

```typescript
import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { caseClusters } from "@/lib/db/schema";
import { desc, eq, and, sql, count } from "drizzle-orm";
import { logger } from "@/lib/logger";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const perPage = parseInt(searchParams.get("perPage") || "10");
    const severity = searchParams.get("severity");

    const conditions = [];
    if (severity && severity !== "all") {
      conditions.push(eq(caseClusters.severity, severity));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [results, totalResult] = await Promise.all([
      db
        .select()
        .from(caseClusters)
        .where(where)
        .orderBy(desc(caseClusters.detectedAt))
        .limit(perPage)
        .offset((page - 1) * perPage),
      db
        .select({ count: count() })
        .from(caseClusters)
        .where(where),
    ]);

    const total = totalResult[0]?.count ?? 0;

    return NextResponse.json({
      data: results,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    });
  } catch (error) {
    logger.error("api/clusters", "Failed to fetch clusters", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 2: Verify compile**

Run: `bunx tsc --noEmit --pretty 2>&1 | head -20`

- [ ] **Step 3: Commit**

```bash
git add app/api/clusters/route.ts
git commit -m "feat: add GET /api/clusters endpoint"
```

---

## Task 4: API Route — Payslip Anomalies

**Files:**
- Create: `app/api/payslip-anomalies/route.ts`

**Dependencies:** Task 1

- [ ] **Step 1: Create payslip anomalies API route (GET + PATCH)**

```typescript
import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { payslipAnomalies } from "@/lib/db/schema";
import { desc, eq, and, sql, count, ilike } from "drizzle-orm";
import { logger } from "@/lib/logger";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const perPage = parseInt(searchParams.get("perPage") || "10");
    const severity = searchParams.get("severity");
    const anomalyType = searchParams.get("anomalyType");
    const supplierId = searchParams.get("supplierId");
    const isResolved = searchParams.get("isResolved");
    const search = searchParams.get("search");

    const conditions = [];
    if (severity && severity !== "all") {
      conditions.push(eq(payslipAnomalies.severity, severity));
    }
    if (anomalyType && anomalyType !== "all") {
      conditions.push(eq(payslipAnomalies.anomalyType, anomalyType));
    }
    if (supplierId && supplierId !== "all") {
      conditions.push(eq(payslipAnomalies.supplierId, supplierId));
    }
    if (isResolved === "true") {
      conditions.push(eq(payslipAnomalies.isResolved, true));
    } else if (isResolved === "false") {
      conditions.push(eq(payslipAnomalies.isResolved, false));
    }
    if (search) {
      conditions.push(ilike(payslipAnomalies.supplierName, `%${search}%`));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [results, totalResult] = await Promise.all([
      db
        .select()
        .from(payslipAnomalies)
        .where(where)
        .orderBy(desc(payslipAnomalies.detectedAt))
        .limit(perPage)
        .offset((page - 1) * perPage),
      db
        .select({ count: count() })
        .from(payslipAnomalies)
        .where(where),
    ]);

    const total = totalResult[0]?.count ?? 0;

    return NextResponse.json({
      data: results,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    });
  } catch (error) {
    logger.error("api/payslip-anomalies", "Failed to fetch anomalies", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, isResolved } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 },
      );
    }

    await db
      .update(payslipAnomalies)
      .set({ isResolved: isResolved ?? true })
      .where(eq(payslipAnomalies.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("api/payslip-anomalies", "Failed to update anomaly", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 2: Verify compile**

Run: `bunx tsc --noEmit --pretty 2>&1 | head -20`

- [ ] **Step 3: Commit**

```bash
git add app/api/payslip-anomalies/route.ts
git commit -m "feat: add GET+PATCH /api/payslip-anomalies endpoint"
```

---

## Task 5: API Route — Forecasts

**Files:**
- Create: `app/api/forecasts/route.ts`

**Dependencies:** Task 1

- [ ] **Step 1: Create forecasts API route**

```typescript
import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { supplierRiskForecast } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";
import { logger } from "@/lib/logger";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get("supplierId");
    const limit = parseInt(searchParams.get("limit") || "60");

    if (!supplierId) {
      return NextResponse.json(
        { error: "supplierId is required" },
        { status: 400 },
      );
    }

    const results = await db
      .select()
      .from(supplierRiskForecast)
      .where(eq(supplierRiskForecast.supplierId, supplierId))
      .orderBy(asc(supplierRiskForecast.forecastDate))
      .limit(limit);

    return NextResponse.json(results);
  } catch (error) {
    logger.error("api/forecasts", "Failed to fetch forecasts", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/forecasts/route.ts
git commit -m "feat: add GET /api/forecasts endpoint"
```

---

## Task 6: API Route — Voice Trends

**Files:**
- Create: `app/api/voice-trends/route.ts`

**Dependencies:** Task 1

- [ ] **Step 1: Create voice trends API route**

```typescript
import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { workerVoiceTrends } from "@/lib/db/schema";
import { desc, eq, and, gte, lte, isNull } from "drizzle-orm";
import { logger } from "@/lib/logger";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get("supplierId");
    const monthFrom = searchParams.get("monthFrom");
    const monthTo = searchParams.get("monthTo");

    const conditions = [];

    if (supplierId && supplierId !== "all") {
      conditions.push(eq(workerVoiceTrends.supplierId, supplierId));
    } else {
      // Default to global trends (supplierId IS NULL)
      conditions.push(isNull(workerVoiceTrends.supplierId));
    }

    if (monthFrom) {
      conditions.push(gte(workerVoiceTrends.month, monthFrom));
    }
    if (monthTo) {
      conditions.push(lte(workerVoiceTrends.month, monthTo));
    }

    const results = await db
      .select()
      .from(workerVoiceTrends)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(workerVoiceTrends.month));

    return NextResponse.json(results);
  } catch (error) {
    logger.error("api/voice-trends", "Failed to fetch voice trends", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/voice-trends/route.ts
git commit -m "feat: add GET /api/voice-trends endpoint"
```

---

## Task 7: API Route — ML Insights (Dashboard Aggregation)

**Files:**
- Create: `app/api/ml-insights/route.ts`

**Dependencies:** Task 1

**Key pattern:** This endpoint aggregates across 4 ML tables in a single request for dashboard efficiency. It joins `supplierRiskForecast` with `supplierRiskScores` to get current risk scores and names.

- [ ] **Step 1: Create ML insights aggregation route**

```typescript
import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import {
  caseClusters,
  payslipAnomalies,
  supplierRiskForecast,
  supplierRiskScores,
  workerVoiceTrends,
} from "@/lib/db/schema";
import { desc, eq, and, sql, count, isNull, lte } from "drizzle-orm";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    // 1. Case clusters: count + top critical
    const [clusterCountResult, criticalClusters] = await Promise.all([
      db.select({ count: count() }).from(caseClusters),
      db
        .select()
        .from(caseClusters)
        .where(eq(caseClusters.severity, "critical"))
        .orderBy(desc(caseClusters.detectedAt))
        .limit(3),
    ]);

    // 2. Unresolved anomalies grouped by severity
    const anomalyCounts = await db
      .select({
        severity: payslipAnomalies.severity,
        count: count(),
      })
      .from(payslipAnomalies)
      .where(eq(payslipAnomalies.isResolved, false))
      .groupBy(payslipAnomalies.severity);

    const unresolvedAnomalies = { critical: 0, warning: 0, info: 0 };
    for (const row of anomalyCounts) {
      if (row.severity in unresolvedAnomalies) {
        unresolvedAnomalies[row.severity as keyof typeof unresolvedAnomalies] = row.count;
      }
    }

    // 3. Rising forecast suppliers (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const risingForecasts = await db
      .select({
        supplierId: supplierRiskForecast.supplierId,
        predictedRiskScore: supplierRiskForecast.predictedRiskScore,
        trendDirection: supplierRiskForecast.trendDirection,
        supplierName: supplierRiskScores.supplierName,
        currentRiskScore: supplierRiskScores.riskScore,
      })
      .from(supplierRiskForecast)
      .innerJoin(
        supplierRiskScores,
        eq(supplierRiskForecast.supplierId, supplierRiskScores.supplierId),
      )
      .where(
        and(
          eq(supplierRiskForecast.trendDirection, "rising"),
          lte(supplierRiskForecast.forecastDate, thirtyDaysFromNow.toISOString().split("T")[0]),
        ),
      )
      .orderBy(desc(supplierRiskForecast.predictedRiskScore))
      .limit(10);

    // 4. Global voice trends (most recent month)
    const globalTrend = await db
      .select()
      .from(workerVoiceTrends)
      .where(isNull(workerVoiceTrends.supplierId))
      .orderBy(desc(workerVoiceTrends.month))
      .limit(1);

    const latestGlobal = globalTrend[0];

    return NextResponse.json({
      clusterCount: clusterCountResult[0]?.count ?? 0,
      criticalClusters,
      unresolvedAnomalies,
      risingForecastSuppliers: risingForecasts.map((f) => ({
        supplierId: f.supplierId,
        supplierName: f.supplierName || "Unknown",
        predictedRiskScore: f.predictedRiskScore,
        currentRiskScore: f.currentRiskScore ?? 0,
        trendDirection: f.trendDirection || "rising",
      })),
      globalSentimentShift: latestGlobal?.sentimentShift ?? 0,
      topEmergingTopic:
        latestGlobal?.emergingTopics?.[0] ?? null,
    });
  } catch (error) {
    logger.error("api/ml-insights", "Failed to fetch ML insights", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 2: Verify all API routes compile**

Run: `bunx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add app/api/ml-insights/route.ts
git commit -m "feat: add GET /api/ml-insights aggregation endpoint for dashboard"
```

---

## Task 8: Case Clusters Page

**Files:**
- Create: `app/connect/clusters/page.tsx`

**Dependencies:** Tasks 1-3

**Pattern reference:** `app/connect/page.tsx` — copy this file's structure as a starting template. It demonstrates all patterns needed: nuqs URL state (`useQueryStates` with `parseAsInteger`, `parseAsString`), React Query with `keepPreviousData`, shadcn Cards/Badge/Pagination, view context filtering, severity badges, search. Adapt the query, filters, and card content to cluster data.

- [ ] **Step 1: Create case clusters page**

Full page component with:
- Breadcrumb: Connect > Systemic Patterns
- Severity filter (Select: all/critical/warning/info)
- Summary stat cards (Total, Critical, Affected Suppliers)
- Card list of clusters with severity badge, label, stats, regions, AI summary, expandable messages, case types, date
- Pagination

Use `useQueryStates` from nuqs for `page` and `severity` URL state.
Use `useQuery(["clusters", page, severity], () => fetchClusters({...}))` with `keepPreviousData`.
Use `getSeverityVariant()` from `lib/risk-utils.ts` for badge variants (maps critical→destructive, warning→default, info→secondary — same mapping as high/medium/low).
Use `Collapsible` from shadcn for expandable representative messages.

- [ ] **Step 2: Verify page renders**

Run dev server, navigate to `http://localhost:3030/connect/clusters`, verify page renders (may show empty state if no data).

- [ ] **Step 3: Commit**

```bash
git add app/connect/clusters/page.tsx
git commit -m "feat: add Case Clusters page at /connect/clusters"
```

---

## Task 9: Payslip Anomalies Page

**Files:**
- Create: `app/connect/payslip-anomalies/page.tsx`

**Dependencies:** Tasks 1-2, 4

**Pattern reference:** Same as Task 8, but uses shadcn Table instead of Card list

- [ ] **Step 1: Create payslip anomalies page**

Full page component with:
- Breadcrumb: Connect > Wage Anomaly Detection
- Summary stat cards (Unresolved total, Critical, Below Minimum, Sudden Drops)
- Filters: Anomaly Type Select, Severity Select, Resolved Select, SearchInput
- Table columns: Supplier (link), Type badge, Severity badge, Expected vs Actual (formatted currency), Employees, AI Interpretation (tooltip), Status checkbox, Date
- Pagination

Use `useMutation` + `useQueryClient` for the resolved toggle checkbox (same pattern as `markAlertRead` in needs-attention-tabs.tsx):
```typescript
const mutation = useMutation({
  mutationFn: ({ id, isResolved }: { id: number; isResolved: boolean }) =>
    toggleAnomalyResolved(id, isResolved),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["payslip-anomalies"] }),
});
```

- [ ] **Step 2: Verify page renders**

Navigate to `http://localhost:3030/connect/payslip-anomalies`.

- [ ] **Step 3: Commit**

```bash
git add app/connect/payslip-anomalies/page.tsx
git commit -m "feat: add Payslip Anomalies page at /connect/payslip-anomalies"
```

---

## Task 10: Worker Voice Trends — Components

**Files:**
- Create: `components/engage/sentiment-trend-chart.tsx`
- Create: `components/engage/themes-bar-chart.tsx`
- Create: `components/engage/topic-list.tsx`

**Dependencies:** Task 1

- [ ] **Step 1: Create sentiment trend chart component**

Recharts AreaChart following `components/suppliers/risk-trend-chart.tsx` pattern:
- Props: `data: Array<{ month: string; sentimentShift: number }>`
- Green gradient fill for positive values, red for negative
- XAxis: month labels, YAxis: sentiment range
- Custom tooltip
- Wrapped in Card with title "Sentiment Over Time"

- [ ] **Step 2: Create themes bar chart component**

Recharts BarChart showing top themes by mention count:
- Props: `themes: VoiceTopic[]`
- Horizontal BarChart with theme name on YAxis, mention count on XAxis
- Bar color by sentiment: positive=#10b981, negative=#ef4444, neutral=#6b7280
- Custom tooltip showing theme name, mentions, sentiment
- Wrapped in Card with title "Top Themes by Mentions"
- Uses `ResponsiveContainer`, `BarChart`, `Bar`, `XAxis`, `YAxis`, `Tooltip`, `Cell` from recharts

- [ ] **Step 3: Create topic list component**

Reusable component for both emerging and declining topics:
- Props: `topics: VoiceTopic[], title: string, variant: "emerging" | "declining"`
- Each item: topic name, mentions count as Badge, sentiment badge (positive=green/negative=red/neutral=gray via `getSeverityVariant` mapping), delta indicator (↑/↓)
- Wrapped in Card

- [ ] **Step 4: Commit**

```bash
git add components/engage/sentiment-trend-chart.tsx components/engage/themes-bar-chart.tsx components/engage/topic-list.tsx
git commit -m "feat: add sentiment chart, themes bar chart, and topic list components"
```

---

## Task 11: Worker Voice Trends — Page

**Files:**
- Create: `app/engage/voice-trends/page.tsx`

**Dependencies:** Tasks 1-2, 6, 10

- [ ] **Step 1: Create voice trends page**

Full page with:
- Breadcrumb: Engage > Voice Trends
- Supplier Combobox filter (default=Global), month range inputs
- Global sentiment shift hero number (large ±number with arrow icon)
- 2-col chart grid: SentimentTrendChart (left), ThemesBarChart (right) — dynamic imports with ssr:false
- 2-col bottom: Emerging Topics (TopicList), Declining Topics (TopicList)

Use `useQuery(["voice-trends", supplierId], () => fetchVoiceTrends({...}))`.
Transform VoiceTrend[] → chart data by mapping `month` → `sentimentShift`.

- [ ] **Step 2: Verify page renders**

Navigate to `http://localhost:3030/engage/voice-trends`.

- [ ] **Step 3: Commit**

```bash
git add app/engage/voice-trends/page.tsx
git commit -m "feat: add Worker Voice Trends page at /engage/voice-trends"
```

---

## Task 12: Risk Forecast — Extend RiskTrendChart

**Files:**
- Modify: `components/suppliers/risk-trend-chart.tsx`

**Dependencies:** Tasks 1-2, 5

**Key change:** Add forecast data as a dashed line with confidence band overlay on the existing historical AreaChart.

- [ ] **Step 1: Modify RiskTrendChart to include forecast overlay**

Changes to `components/suppliers/risk-trend-chart.tsx`:

1. Import `fetchForecasts` from `@/lib/api` and `ReferenceLine` from recharts
2. Add second `useQuery` for forecast data:
   ```typescript
   const { data: forecasts } = useQuery({
     queryKey: ["forecasts", supplierId],
     queryFn: () => fetchForecasts({ supplierId }),
   });
   ```
3. Merge historical + forecast into unified `chartData`:
   - Historical entries keep `riskScore`, forecast entries add `forecastScore`, `forecastUpper`, `forecastLower`
   - Boundary point (last historical) gets both `riskScore` and `forecastScore` to connect the lines
4. Add new gradient def `colorForecast` (blue, 30% opacity)
5. Add `<Area dataKey="forecastScore">` with `strokeDasharray="5 5"` and blue stroke
6. Add `<Area dataKey="forecastUpper">` and `<Area dataKey="forecastLower">` with 10% opacity blue fill for confidence band
7. Add `<ReferenceLine x={todayLabel} stroke="#6b7280" strokeDasharray="3 3" label="Today" />`
8. Update CardDescription to "30-day history + 60-day forecast"

- [ ] **Step 2: Verify chart renders with forecast**

Navigate to any supplier detail page, check the risk trend chart shows historical + dashed forecast.

- [ ] **Step 3: Commit**

```bash
git add components/suppliers/risk-trend-chart.tsx
git commit -m "feat: overlay 60-day forecast on RiskTrendChart"
```

---

## Task 13: Risk Forecast — Breakdown Card

**Files:**
- Create: `components/suppliers/forecast-breakdown-card.tsx`
- Modify: `app/suppliers/[id]/page.tsx`

**Dependencies:** Tasks 1-2, 5

- [ ] **Step 1: Create ForecastBreakdownCard component**

Props: `supplierId: string`
Content:
- Card title: "60-Day Risk Forecast"
- Fetches forecast data: `useQuery(["forecasts", supplierId], () => fetchForecasts({ supplierId }))`
- Uses the most recent forecast entry
- Predicted sub-scores: 3-col grid with label + Progress bar (case, survey, training)
- Confidence meter: Progress bar (0-100%), colored by threshold (green >70%, yellow 40-70%, red <40%)
- Trend direction: Badge with IconTrendingUp (red) / IconTrendingDown (green) / IconMinus (gray)
- AI Reasoning: Collapsible section with `aiReasoning` text
- Loading: Skeleton, Empty: "No forecast data available"

- [ ] **Step 2: Add ForecastBreakdownCard to supplier detail page**

In `app/suppliers/[id]/page.tsx`, add dynamic import and place after the RiskTrendChart + RiskBreakdown grid (around line 130):

```typescript
const ForecastBreakdownCard = dynamic(
  () => import("@/components/suppliers/forecast-breakdown-card").then((m) => ({ default: m.ForecastBreakdownCard })),
  { ssr: false, loading: () => <div className="h-[200px] animate-pulse rounded-xl bg-muted" /> },
);
```

Insert in JSX: `<ForecastBreakdownCard supplierId={supplier.id} />`

- [ ] **Step 3: Verify on supplier detail**

Navigate to any supplier detail page, verify ForecastBreakdownCard renders below the trend chart.

- [ ] **Step 4: Commit**

```bash
git add components/suppliers/forecast-breakdown-card.tsx app/suppliers/[id]/page.tsx
git commit -m "feat: add forecast breakdown card to supplier detail page"
```

---

## Task 14: Dashboard — ML Insight Cards Row

**Files:**
- Create: `components/dashboard/ml-insight-cards.tsx`
- Modify: `components/dashboard/dashboard-view.tsx`

**Dependencies:** Tasks 1-2, 7

- [ ] **Step 1: Create MLInsightCards component**

4-card grid (grid-cols-2 lg:grid-cols-4), each card is a compact Link-wrapped Card with:
- Icon, value (large number), subtitle (1-line insight), and chevron arrow
- Uses `useQuery(["ml-insights"], fetchMLInsights)`
- Cards: Systemic Patterns → `/connect/clusters`, Forecast Alerts → `/suppliers`, Wage Anomalies → `/connect/payslip-anomalies`, Voice Trends → `/engage/voice-trends`
- Loading: 4 Skeleton cards
- Each card highlights urgency with variant styling (e.g., red accent if critical clusters or rising forecasts)

- [ ] **Step 2: Insert MLInsightCards into dashboard-view.tsx**

In `components/dashboard/dashboard-view.tsx`:
1. Import: `import { MLInsightCards } from "@/components/dashboard/ml-insight-cards";`
2. Insert between line 152 (end of MetricCard grid) and line 154 (start of Needs Attention row):

```tsx
{/* Row 1.5: ML Intelligence Signals */}
<MLInsightCards />
```

- [ ] **Step 3: Verify on dashboard**

Navigate to `http://localhost:3030/`, verify ML insight cards row appears between metrics and Needs Attention tabs.

- [ ] **Step 4: Commit**

```bash
git add components/dashboard/ml-insight-cards.tsx components/dashboard/dashboard-view.tsx
git commit -m "feat: add ML insight cards row to dashboard"
```

---

## Task 15: Dashboard — Forecasts Tab in NeedsAttentionTabs

**Files:**
- Modify: `components/dashboard/needs-attention-tabs.tsx`

**Dependencies:** Tasks 1-2, 7

- [ ] **Step 1: Add Forecasts tab**

Changes to `components/dashboard/needs-attention-tabs.tsx`:

1. Add imports: `fetchMLInsights` from `@/lib/api`, `MLInsightsSummary` from `@/types`
2. Add query: `const { data: mlInsights } = useQuery<MLInsightsSummary>({ queryKey: ["ml-insights"], queryFn: fetchMLInsights, staleTime: 5 * 60 * 1000 });`
3. Add count: `const forecastCount = mlInsights?.risingForecastSuppliers?.length ?? 0;`
4. Change TabsList `grid-cols-3` → `grid-cols-4` (line 57)
5. Add 4th TabsTrigger after the Risk tab:
   ```tsx
   <TabsTrigger value="forecasts" className="text-xs gap-1">
     <IconTrendingUp className="h-3.5 w-3.5" />
     Forecasts
     {forecastCount > 0 && <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">{forecastCount}</Badge>}
   </TabsTrigger>
   ```
6. Add TabsContent at the end with `ForecastsTabContent` function:
   - Maps `mlInsights.risingForecastSuppliers` to a list
   - Same visual pattern as `RiskMovementsTabContent`: supplier name (link), current → predicted score, trend badge
   - Empty state: "No rising risk forecasts"

- [ ] **Step 2: Verify tab appears**

Navigate to dashboard, verify 4 tabs visible, Forecasts tab shows data.

- [ ] **Step 3: Commit**

```bash
git add components/dashboard/needs-attention-tabs.tsx
git commit -m "feat: add Forecasts tab to NeedsAttentionTabs"
```

---

## Task 16: Dashboard — Dynamic AICopilotFeed Insight

**Files:**
- Modify: `components/dashboard/ai-copilot-feed.tsx`

**Dependencies:** Tasks 1-2, 7

- [ ] **Step 1: Replace static insight with dynamic ML-driven insight**

Changes to `components/dashboard/ai-copilot-feed.tsx`:

1. Add imports: `fetchMLInsights` from `@/lib/api`, `MLInsightsSummary` from `@/types`, `Link` from `next/link`
2. Add query inside component: `const { data: mlInsights } = useQuery<MLInsightsSummary>({ queryKey: ["ml-insights"], queryFn: fetchMLInsights, staleTime: 5 * 60 * 1000 });`
3. Create `generateInsight(insights: MLInsightsSummary)` function that returns `{ text: string, href: string }`:
   - Priority 1: critical clusters → link to /connect/clusters
   - Priority 2: rising forecasts → link to /suppliers
   - Priority 3: unresolved anomalies → link to /connect/payslip-anomalies
   - Priority 4: sentiment shift → link to /engage/voice-trends
   - Fallback: existing static text, no link
4. Replace the hardcoded `<p>` in the Cross-Module Insight block (lines 53-56) with the dynamic insight text + optional "View details →" link

- [ ] **Step 2: Verify on dashboard**

Check AI Co-Pilot feed shows dynamic insight based on available ML data.

- [ ] **Step 3: Commit**

```bash
git add components/dashboard/ai-copilot-feed.tsx
git commit -m "feat: replace static AI copilot insight with dynamic ML data"
```

---

## Task 17: Enhanced Survey Analysis — Sentiment Donut

**Files:**
- Create: `components/engage/sentiment-donut.tsx`
- Modify: `app/engage/page.tsx`

**Dependencies:** Task 1

- [ ] **Step 1: Create SentimentDonut component**

Small Recharts PieChart (60×60px):
- Props: `positive: number, negative: number, neutral: number`
- 3 segments: positive (#10b981), neutral (#6b7280), negative (#ef4444)
- No labels, no legend — just the donut visual
- Uses `PieChart`, `Pie`, `Cell` from recharts
- Inner radius 15, outer radius 28 for donut effect

- [ ] **Step 2: Enhance survey cards in engage page**

In `app/engage/page.tsx`, for each survey card:
1. Add dynamic import for SentimentDonut
2. Check if survey has sentiment data (sentimentPositive/Negative/Neutral fields — these come from the surveyAnalysis join)
3. If survey type needs extending: check `GET /api/surveys` route to verify sentiment fields are returned. If not, extend the Survey interface in `types/index.ts` with optional `sentimentPositive?: number`, `sentimentNegative?: number`, `sentimentNeutral?: number` fields and update the API route
4. Add donut inline with survey metadata
5. Add Collapsible section for full `aiInsight` text (currently only theme badges shown)

- [ ] **Step 3: Verify on engage page**

Navigate to `/engage`, verify donuts and expandable insights appear on survey cards.

- [ ] **Step 4: Commit**

```bash
git add components/engage/sentiment-donut.tsx app/engage/page.tsx
git commit -m "feat: add sentiment donut and enhanced AI insight to survey cards"
```

---

## Task 18: Navigation — Sub-Route Buttons

**Files:**
- Modify: `app/connect/page.tsx`
- Modify: `app/engage/page.tsx`

**Dependencies:** Tasks 8, 9, 11

- [ ] **Step 1: Add sub-navigation to Connect page**

In `app/connect/page.tsx`, add between the header and filter row:

```tsx
import { IconNetwork, IconCurrencyDollar } from "@tabler/icons-react";

<div className="flex gap-2">
  <Button variant="secondary" size="sm" asChild>
    <Link href="/connect/clusters">
      <IconNetwork className="w-4 h-4 mr-1" />
      Systemic Patterns
    </Link>
  </Button>
  <Button variant="secondary" size="sm" asChild>
    <Link href="/connect/payslip-anomalies">
      <IconCurrencyDollar className="w-4 h-4 mr-1" />
      Wage Anomalies
    </Link>
  </Button>
</div>
```

- [ ] **Step 2: Add sub-navigation to Engage page**

In `app/engage/page.tsx`, add between the header and AI Designer card:

```tsx
import { IconMessageCircle } from "@tabler/icons-react";

<div className="flex gap-2">
  <Button variant="secondary" size="sm" asChild>
    <Link href="/engage/voice-trends">
      <IconMessageCircle className="w-4 h-4 mr-1" />
      Voice Trends
    </Link>
  </Button>
</div>
```

- [ ] **Step 3: Verify navigation works**

Click each button, verify it navigates to the correct page, verify sidebar highlights correctly (should highlight parent Connect/Engage item).

- [ ] **Step 4: Commit**

```bash
git add app/connect/page.tsx app/engage/page.tsx
git commit -m "feat: add sub-navigation buttons to Connect and Engage pages"
```

---

## Task 19: Final Verification

**Dependencies:** All previous tasks

- [ ] **Step 1: Full TypeScript check**

Run: `bunx tsc --noEmit --pretty`
Expected: No errors

- [ ] **Step 2: Build check**

Run: `bun run build`
Expected: Build succeeds

- [ ] **Step 3: End-to-end smoke test**

Start dev server (`bun run dev`) and verify:
1. Dashboard: ML insight cards row visible, Forecasts tab in NeedsAttention, dynamic AI copilot insight
2. `/connect/clusters`: page loads, severity filter works, clusters display
3. `/connect/payslip-anomalies`: table loads, filters work, resolved toggle works
4. `/engage/voice-trends`: chart renders, topic lists display
5. Any supplier detail: RiskTrendChart shows forecast overlay, ForecastBreakdownCard renders
6. `/engage`: survey cards show sentiment donuts
7. Navigation: sub-route buttons on Connect + Engage pages work, sidebar highlights correctly

- [ ] **Step 4: Final commit (if any remaining unstaged changes)**

```bash
git status
# Review any remaining changes, then stage only expected files:
git add types/ lib/ app/ components/
git commit -m "feat: complete ML batch job data visualizations across all modules"
```
