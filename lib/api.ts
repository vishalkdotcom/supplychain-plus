import {
  Supplier,
  Case,
  Survey,
  Course,
  DashboardMetrics,
  ActivityItem,
  AIRecommendation,
  TimelineEvent,
} from "@/types";

const API_BASE = "/api";

export async function fetchSuppliers(): Promise<Supplier[]> {
  const res = await fetch(`${API_BASE}/suppliers`);
  if (!res.ok) throw new Error("Failed to fetch suppliers");
  return res.json();
}

export async function fetchSupplier(id: string): Promise<Supplier> {
  const res = await fetch(`${API_BASE}/suppliers/${id}`);
  if (!res.ok) throw new Error("Failed to fetch supplier");
  return res.json();
}

export async function fetchCases(): Promise<Case[]> {
  const res = await fetch(`${API_BASE}/cases`);
  if (!res.ok) throw new Error("Failed to fetch cases");
  return res.json();
}

export async function fetchCase(id: string): Promise<Case> {
  const res = await fetch(`${API_BASE}/cases/${id}`);
  if (!res.ok) throw new Error("Failed to fetch case");
  return res.json();
}

export async function fetchSurveys(): Promise<Survey[]> {
  const res = await fetch(`${API_BASE}/surveys`);
  if (!res.ok) throw new Error("Failed to fetch surveys");
  return res.json();
}

export async function fetchCourses(): Promise<Course[]> {
  const res = await fetch(`${API_BASE}/courses`);
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
