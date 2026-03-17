import {
  Supplier,
  Brand,
  Case,
  Survey,
  Course,
  DashboardMetrics,
  ActivityItem,
  AIRecommendation,
  TimelineEvent,
  PaginatedResponse,
  Alert,
  RiskHistoryEntry,
  MetricsBriefing,
  CaseContext,
} from "@/types";

const API_BASE = "/api";

// Pagination params helpers
interface PaginationParams {
  page?: number;
  perPage?: number;
  search?: string;
}

interface SupplierParams extends PaginationParams {
  region?: string;
  riskLevel?: string;
  parentCompanyId?: string;
}

interface CaseParams extends PaginationParams {
  supplier?: string;
  supplierId?: string;
  severity?: string;
  parentCompanyId?: string;
}

interface SurveyParams extends PaginationParams {
  supplier?: string;
  supplierId?: string;
  parentCompanyId?: string;
}

function buildQueryString(
  params: Record<string, string | number | undefined>,
): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "" && value !== "all") {
      searchParams.set(key, String(value));
    }
  }
  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchSuppliers(
  params: SupplierParams = {},
): Promise<PaginatedResponse<Supplier>> {
  const qs = buildQueryString({
    page: params.page,
    perPage: params.perPage,
    search: params.search,
    region: params.region,
    riskLevel: params.riskLevel,
    parentCompanyId: params.parentCompanyId,
  });
  const res = await fetch(`${API_BASE}/suppliers${qs}`);
  if (!res.ok) throw new Error("Failed to fetch suppliers");
  return res.json();
}

export async function fetchSupplier(id: string): Promise<Supplier> {
  const res = await fetch(`${API_BASE}/suppliers/${id}`);
  if (!res.ok) throw new Error("Failed to fetch supplier");
  return res.json();
}

export async function fetchSupplierHistory(id: string): Promise<RiskHistoryEntry[]> {
  const res = await fetch(`${API_BASE}/suppliers/${id}/history`);
  if (!res.ok) throw new Error("Failed to fetch supplier history");
  return res.json();
}

export async function fetchCases(
  params: CaseParams = {},
): Promise<PaginatedResponse<Case>> {
  const qs = buildQueryString({
    page: params.page,
    perPage: params.perPage,
    search: params.search,
    supplier: params.supplier,
    supplierId: params.supplierId,
    severity: params.severity,
    parentCompanyId: params.parentCompanyId,
  });
  const res = await fetch(`${API_BASE}/cases${qs}`);
  if (!res.ok) throw new Error("Failed to fetch cases");
  return res.json();
}

export async function fetchCase(id: string): Promise<Case> {
  const res = await fetch(`${API_BASE}/cases/${id}`);
  if (!res.ok) throw new Error("Failed to fetch case");
  return res.json();
}

export async function fetchSurveys(
  params: SurveyParams = {},
): Promise<PaginatedResponse<Survey>> {
  const qs = buildQueryString({
    page: params.page,
    perPage: params.perPage,
    search: params.search,
    supplier: params.supplier,
    supplierId: params.supplierId,
    parentCompanyId: params.parentCompanyId,
  });
  const res = await fetch(`${API_BASE}/surveys${qs}`);
  if (!res.ok) throw new Error("Failed to fetch surveys");
  return res.json();
}

export async function fetchCourses(
  params: PaginationParams = {},
): Promise<PaginatedResponse<Course>> {
  const qs = buildQueryString({
    page: params.page,
    perPage: params.perPage,
    search: params.search,
  });
  const res = await fetch(`${API_BASE}/courses${qs}`);
  if (!res.ok) throw new Error("Failed to fetch courses");
  return res.json();
}

export async function fetchActivities(): Promise<ActivityItem[]> {
  const res = await fetch(`${API_BASE}/activities`);
  if (!res.ok) throw new Error("Failed to fetch activities");
  return res.json();
}

export async function fetchMetrics(parentCompanyId?: string): Promise<DashboardMetrics> {
  const qs = parentCompanyId ? `?parentCompanyId=${parentCompanyId}` : "";
  const res = await fetch(`${API_BASE}/metrics${qs}`);
  if (!res.ok) throw new Error("Failed to fetch metrics");
  return res.json();
}

export async function fetchBrands(search?: string): Promise<Brand[]> {
  const qs = search ? `?search=${encodeURIComponent(search)}` : "";
  const res = await fetch(`${API_BASE}/brands${qs}`);
  if (!res.ok) throw new Error("Failed to fetch brands");
  return res.json();
}

export async function fetchBrand(id: string): Promise<Brand> {
  const res = await fetch(`${API_BASE}/brands/${id}`);
  if (!res.ok) throw new Error("Failed to fetch brand");
  return res.json();
}

export async function fetchRecommendations(supplierId?: string): Promise<AIRecommendation[]> {
  const qs = supplierId ? `?supplierId=${supplierId}` : "";
  const res = await fetch(`${API_BASE}/recommendations${qs}`);
  if (!res.ok) throw new Error("Failed to fetch recommendations");
  return res.json();
}

// Training
export async function fetchTraining(supplierId: string) {
  const res = await fetch(`/api/suppliers/${supplierId}/training`);
  if (!res.ok) throw new Error("Failed to fetch training data");
  return res.json();
}

export async function fetchTimeline(
  supplierId?: string,
): Promise<TimelineEvent[]> {
  const url = supplierId
    ? `${API_BASE}/timeline?supplierId=${supplierId}`
    : `${API_BASE}/timeline`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch timeline");
  return res.json();
}

export async function fetchAlerts(unreadOnly = true, limit = 20): Promise<Alert[]> {
  const qs = buildQueryString({ unreadOnly: unreadOnly ? "true" : "false", limit });
  const res = await fetch(`${API_BASE}/alerts${qs}`);
  if (!res.ok) throw new Error("Failed to fetch alerts");
  return res.json();
}

export async function markAlertRead(alertId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/alerts`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ alertId, isRead: true })
  });
  if (!res.ok) throw new Error("Failed to update alert");
}

export async function fetchBriefing(since?: string): Promise<MetricsBriefing> {
  const qs = since ? `?since=${encodeURIComponent(since)}` : "";
  const res = await fetch(`${API_BASE}/metrics/briefing${qs}`);
  if (!res.ok) throw new Error("Failed to fetch briefing");
  return res.json();
}

export async function fetchCaseContext(caseId: string): Promise<CaseContext> {
  const res = await fetch(`${API_BASE}/cases/${caseId}/context`);
  if (!res.ok) throw new Error("Failed to fetch case context");
  return res.json();
}

export async function advanceCaseStatus(caseId: string): Promise<{ newStatus: string }> {
  const res = await fetch(`${API_BASE}/cases/${caseId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to advance case status");
  return res.json();
}
