import {
  Supplier,
  Case,
  Survey,
  Course,
  DashboardMetrics,
  ActivityItem,
  AIRecommendation,
  TimelineEvent,
  PaginatedResponse,
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
}

interface CaseParams extends PaginationParams {
  supplier?: string;
  severity?: string;
}

interface SurveyParams extends PaginationParams {
  supplier?: string;
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

export async function fetchCases(
  params: CaseParams = {},
): Promise<PaginatedResponse<Case>> {
  const qs = buildQueryString({
    page: params.page,
    perPage: params.perPage,
    search: params.search,
    supplier: params.supplier,
    severity: params.severity,
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

export async function fetchMetrics(): Promise<DashboardMetrics> {
  const res = await fetch(`${API_BASE}/metrics`);
  if (!res.ok) throw new Error("Failed to fetch metrics");
  return res.json();
}

export async function fetchRecommendations(): Promise<AIRecommendation[]> {
  const res = await fetch(`${API_BASE}/recommendations`);
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
