// Core Types for WOVO AI Control Center

// ===============================
// Supplier & Risk Types
// ===============================

export interface Supplier {
  id: string;
  name: string;
  region: string;
  country: string;
  location: string;
  workerCount: number;
  contactName: string;
  contactEmail: string;
  riskScore: number; // 0-100, higher = more risk
  riskLevel: "low" | "medium" | "high";
  status: "active" | "inactive" | "onboarding";
  lastActivityDate: string;
  riskBreakdown: RiskBreakdown;
}

export interface RiskBreakdown {
  caseScore: number; // 0-100
  surveyScore: number; // 0-100
  trainingScore: number; // 0-100
  engagementScore: number; // 0-100
  reasons: RiskReason[];
}

export interface RiskReason {
  factor: string;
  impact: "high" | "medium" | "low";
  description: string;
  module: "connect" | "engage" | "educate";
}

// ===============================
// Timeline & Events
// ===============================

export interface TimelineEvent {
  id: string;
  supplierId: string;
  date: string;
  type: "problem" | "action" | "outcome" | "alert";
  module: "connect" | "engage" | "educate" | "system";
  title: string;
  description: string;
  linkedId?: string; // ID of related case, survey, or course
  linkedType?: "case" | "survey" | "course";
}

// ===============================
// AI Recommendations
// ===============================

export interface AIRecommendation {
  id: string;
  supplierId: string;
  supplierName?: string;
  action: string;
  reason: string;
  urgency: "immediate" | "this_week" | "this_month";
  category: "training" | "investigation" | "remediation" | "monitoring";
  linkedModule?: "connect" | "engage" | "educate";
  linkedId?: string;
}

// ===============================
// Cases (Connect Module)
// ===============================

export interface Case {
  id: string;
  supplierId: string;
  supplierName: string;
  topic: string;
  severity: "high" | "medium" | "low";
  status:
    | "new"
    | "triage"
    | "assigned"
    | "in_progress"
    | "resolved"
    | "verified";
  assignee?: string;
  aiSummary: string;
  fullContent: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  aiGuidance?: AIGuidance;
}

export interface AIGuidance {
  recommendedSteps: string[];
  draftResponse?: string;
  relatedTraining?: string[];
  similarCases?: string[];
  estimatedResolutionDays: number;
  suggestedFAQs?: Array<{
    question: string;
    answer: string;
    confidence: number;
  }>;
}

// ===============================
// Surveys (Engage Module)
// ===============================

export interface Survey {
  id: string;
  supplierId: string;
  supplierName: string;
  title: string;
  responses: number;
  riskScore: number;
  status: "draft" | "active" | "closed";
  aiInsight: string;
  themes: SurveyTheme[];
  createdAt: string;
  closedAt?: string;
}

export interface SurveyTheme {
  name: string;
  sentiment: "positive" | "negative" | "neutral";
  mentionCount: number;
}

// ===============================
// Courses (Educate Module)
// ===============================

export interface Course {
  id: string;
  title: string;
  description: string;
  enrollments: number;
  completionRate: number; // 0-100
  aiStatus: "generated" | "drafting" | "processing" | "manual";
  aiGenerated: boolean;
  source?: string;
  relevantFor: string[]; // Case types this training addresses
  languages: string[];
  createdAt: string;
}

export interface SupplierTraining {
  supplierId: string;
  courseId: string;
  enrolledWorkers: number;
  completedWorkers: number;
  completionRate: number;
  lastActivityDate: string;
}

// ===============================
// Activity Stream
// ===============================

export interface ActivityItem {
  id: string;
  action: string;
  details: string;
  time: string;
  module: "connect" | "engage" | "educate" | "system";
  supplierId?: string;
  supplierName?: string;
  linkedId?: string;
  linkedType?: "case" | "survey" | "course" | "supplier";
}

// ===============================
// Dashboard Metrics
// ===============================

export interface DashboardMetrics {
  totalSuppliers: number;
  highRiskSuppliers: number;
  activeCases: number;
  pendingSurveys: number;
  trainingCompletion: number;
  trendsImproving: number;
  trendsWorsening: number;
}

// ===============================
// View Context
// ===============================

export type ViewPerspective = "brand" | "supplier";

// ===============================
// Pagination
// ===============================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface RiskHistoryEntry {
  id: number;
  supplierId: string;
  riskScore: number;
  caseScore: number;
  surveyScore: number;
  trainingScore: number;
  engagementScore: number;
  snapshotDate: string;
}

export interface Alert {
  id: string;
  supplierId: string;
  title: string;
  message: string;
  severity: "high" | "medium" | "low";
  isRead: boolean;
  createdAt: string;
}
