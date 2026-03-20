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
  latitude?: number;
  longitude?: number;
  parentCompanyId?: string;
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
  caseTypeId?: string;
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
  sentimentPositive?: number;
  sentimentNegative?: number;
  sentimentNeutral?: number;
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
// Brand / Parent Company
// ===============================

export interface Brand {
  id: string; // Company.Id / client_key of the parent company
  name: string;
  country?: string;
  supplierCount: number;
  avgRiskScore: number;
}

// ===============================
// View Context
// ===============================

export type ViewPerspective = "portfolio" | "brand" | "supplier";

// ===============================
// Pagination
// ===============================

export interface EvidenceLink {
  module: "connect" | "engage" | "educate";
  referenceId: string;
  title: string;
  date: string;
  relevance: string;
}

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

// ===============================
// Dashboard Briefing (AI Co-Pilot)
// ===============================

export interface MetricsBriefing {
  summary: string;
  newAlerts: number;
  newHighRiskSuppliers: number;
  escalatedCases: number;
  resolvedCases: number;
  riskMovements: RiskMovement[];
  urgentCases: UrgentCase[];
}

export interface RiskMovement {
  supplierId: string;
  supplierName: string;
  previousScore: number;
  currentScore: number;
  direction: "worsened" | "improved";
  crossedThreshold: boolean;
}

export interface UrgentCase {
  id: string;
  supplierId: string;
  supplierName: string;
  topic: string;
  severity: "high" | "medium" | "low";
  status: string;
  aiSummary: string;
  createdAt: string;
  ageDays: number;
}

// ===============================
// Case Cross-Module Context
// ===============================

export interface CaseContext {
  supplierOpenCases: number;
  supplierRiskScore: number;
  supplierRiskLevel: "high" | "medium" | "low";
  caseAgeDays: number;
  avgResolutionDays: number | null;
  relatedSurveyThemes: string[];
  trainingGaps: string[];
  similarOpenCases: Array<{
    id: string;
    topic: string;
    severity: string;
    status: string;
  }>;
}

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
  suggestedActions?: { action: string; urgency: "immediate" | "soon" | "routine" }[];
}

export interface ClusterCase {
  caseId: string;
  messageId: string;
  messageText: string;
  companyId: string;
  companyName: string;
  caseTypeName: string;
  status: string;
  severity: "high" | "medium" | "low";
  createdAt: string;
}

export interface ClusterDetail extends CaseCluster {
  cases: ClusterCase[];
  suppliers: { id: string; name: string }[];
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
  suggestedAction?: { action: string; urgency: "immediate" | "soon" | "routine" };
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
