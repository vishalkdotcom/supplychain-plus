import type {
  DashboardMetrics,
  Supplier,
  PaginatedResponse,
  ActivityItem,
  AIRecommendation,
  Case,
  Survey,
  Course,
  TimelineEvent,
  RiskHistoryEntry,
  Alert,
} from "../../types";

// ─── Dashboard Metrics ───────────────────────────────────────────────
export const mockMetrics: DashboardMetrics = {
  totalSuppliers: 47,
  highRiskSuppliers: 8,
  activeCases: 23,
  pendingSurveys: 5,
  trainingCompletion: 72,
  trendsImproving: 12,
  trendsWorsening: 4,
};

// ─── Suppliers ───────────────────────────────────────────────────────
export const mockSuppliers: Supplier[] = [
  {
    id: "sup-001",
    name: "Saigon Textiles Co.",
    region: "Asia",
    country: "Vietnam",
    location: "Ho Chi Minh City, Vietnam",
    workerCount: 2400,
    contactName: "Nguyen Van Minh",
    contactEmail: "minh@saigontextiles.vn",
    riskScore: 82,
    riskLevel: "high",
    status: "active",
    lastActivityDate: "2026-03-10T08:00:00Z",
    latitude: 10.82,
    longitude: 106.63,
    riskBreakdown: {
      caseScore: 85,
      surveyScore: 78,
      trainingScore: 60,
      engagementScore: 70,
      reasons: [
        {
          factor: "Excessive overtime reported",
          impact: "high",
          description: "Workers report 60+ hour weeks",
          module: "connect",
        },
        {
          factor: "Low survey participation",
          impact: "medium",
          description: "Only 34% response rate",
          module: "engage",
        },
      ],
    },
  },
  {
    id: "sup-002",
    name: "Dhaka Garments Ltd.",
    region: "Asia",
    country: "Bangladesh",
    location: "Dhaka, Bangladesh",
    workerCount: 5200,
    contactName: "Aisha Rahman",
    contactEmail: "aisha@dhakagarments.bd",
    riskScore: 91,
    riskLevel: "high",
    status: "active",
    lastActivityDate: "2026-03-09T14:00:00Z",
    latitude: 23.81,
    longitude: 90.41,
    riskBreakdown: {
      caseScore: 92,
      surveyScore: 88,
      trainingScore: 75,
      engagementScore: 65,
      reasons: [
        {
          factor: "Fire safety non-compliance",
          impact: "high",
          description: "Missing emergency exits on 3rd floor",
          module: "connect",
        },
      ],
    },
  },
  {
    id: "sup-003",
    name: "Guangzhou Electronics",
    region: "Asia",
    country: "China",
    location: "Guangzhou, China",
    workerCount: 8100,
    contactName: "Li Wei",
    contactEmail: "liwei@gzelec.cn",
    riskScore: 45,
    riskLevel: "medium",
    status: "active",
    lastActivityDate: "2026-03-08T10:00:00Z",
    latitude: 23.13,
    longitude: 113.26,
    riskBreakdown: {
      caseScore: 40,
      surveyScore: 50,
      trainingScore: 35,
      engagementScore: 55,
      reasons: [
        {
          factor: "Moderate wage concerns",
          impact: "medium",
          description: "Wages meet minimum but below living wage",
          module: "engage",
        },
      ],
    },
  },
  {
    id: "sup-004",
    name: "Chennai Fabrics",
    region: "Asia",
    country: "India",
    location: "Chennai, India",
    workerCount: 3200,
    contactName: "Priya Sharma",
    contactEmail: "priya@chennaifabrics.in",
    riskScore: 28,
    riskLevel: "low",
    status: "active",
    lastActivityDate: "2026-03-07T12:00:00Z",
    latitude: 13.08,
    longitude: 80.27,
    riskBreakdown: {
      caseScore: 20,
      surveyScore: 30,
      trainingScore: 25,
      engagementScore: 35,
      reasons: [],
    },
  },
  {
    id: "sup-005",
    name: "Istanbul Leather Works",
    region: "Europe",
    country: "Turkey",
    location: "Istanbul, Turkey",
    workerCount: 1800,
    contactName: "Mehmet Yilmaz",
    contactEmail: "mehmet@istleather.tr",
    riskScore: 67,
    riskLevel: "medium",
    status: "active",
    lastActivityDate: "2026-03-06T09:00:00Z",
    latitude: 41.01,
    longitude: 28.98,
    riskBreakdown: {
      caseScore: 60,
      surveyScore: 70,
      trainingScore: 65,
      engagementScore: 72,
      reasons: [
        {
          factor: "Chemical handling concerns",
          impact: "medium",
          description: "Incomplete PPE usage in tanning area",
          module: "connect",
        },
      ],
    },
  },
  {
    id: "sup-006",
    name: "Puebla Automotive Parts",
    region: "Americas",
    country: "Mexico",
    location: "Puebla, Mexico",
    workerCount: 4500,
    contactName: "Carlos Rodriguez",
    contactEmail: "carlos@pueblaauto.mx",
    riskScore: 15,
    riskLevel: "low",
    status: "active",
    lastActivityDate: "2026-03-05T16:00:00Z",
    latitude: 19.04,
    longitude: -98.2,
    riskBreakdown: {
      caseScore: 10,
      surveyScore: 15,
      trainingScore: 20,
      engagementScore: 18,
      reasons: [],
    },
  },
  {
    id: "sup-007",
    name: "Phnom Penh Textiles",
    region: "Asia",
    country: "Cambodia",
    location: "Phnom Penh, Cambodia",
    workerCount: 1200,
    contactName: "Sokha Chhun",
    contactEmail: "sokha@pptextiles.kh",
    riskScore: 76,
    riskLevel: "high",
    status: "active",
    lastActivityDate: "2026-03-04T11:00:00Z",
    latitude: 11.56,
    longitude: 104.92,
    parentCompanyId: "sup-001",
    riskBreakdown: {
      caseScore: 80,
      surveyScore: 72,
      trainingScore: 68,
      engagementScore: 60,
      reasons: [
        {
          factor: "Child labor risk indicators",
          impact: "high",
          description: "Age verification process gaps",
          module: "connect",
        },
      ],
    },
  },
  {
    id: "sup-008",
    name: "Jakarta Manufacturing",
    region: "Asia",
    country: "Indonesia",
    location: "Jakarta, Indonesia",
    workerCount: 3800,
    contactName: "Dewi Sari",
    contactEmail: "dewi@jakartamfg.id",
    riskScore: 55,
    riskLevel: "medium",
    status: "active",
    lastActivityDate: "2026-03-03T07:00:00Z",
    latitude: -6.21,
    longitude: 106.85,
    parentCompanyId: "sup-003",
    riskBreakdown: {
      caseScore: 50,
      surveyScore: 58,
      trainingScore: 45,
      engagementScore: 62,
      reasons: [
        {
          factor: "Inconsistent training records",
          impact: "low",
          description: "20% of workers missing refresher courses",
          module: "educate",
        },
      ],
    },
  },
];

export function mockSuppliersResponse(
  page = 1,
  perPage = 12,
): PaginatedResponse<Supplier> {
  const start = (page - 1) * perPage;
  const data = mockSuppliers.slice(start, start + perPage);
  return {
    data,
    total: mockSuppliers.length,
    page,
    perPage,
    totalPages: Math.ceil(mockSuppliers.length / perPage),
  };
}

export function mockSupplier(id?: string): Supplier {
  return (
    mockSuppliers.find((s) => s.id === id) || mockSuppliers[0]
  );
}

// ─── Activities ──────────────────────────────────────────────────────
export const mockActivities: ActivityItem[] = [
  {
    id: "act-001",
    action: "Risk score recalculated",
    details: "Saigon Textiles risk score increased from 74 to 82 based on new case data.",
    time: "2 hours ago",
    module: "system",
    supplierId: "sup-001",
    supplierName: "Saigon Textiles Co.",
    linkedType: "supplier",
  },
  {
    id: "act-002",
    action: "Case auto-triaged",
    details: "New overtime complaint classified as high severity and assigned to regional manager.",
    time: "4 hours ago",
    module: "connect",
    supplierId: "sup-002",
    supplierName: "Dhaka Garments Ltd.",
    linkedId: "case-001",
    linkedType: "case",
  },
  {
    id: "act-003",
    action: "Survey analysis complete",
    details: "Quarterly worker satisfaction survey analyzed. Key theme: safety concerns.",
    time: "6 hours ago",
    module: "engage",
    supplierId: "sup-003",
    supplierName: "Guangzhou Electronics",
  },
  {
    id: "act-004",
    action: "Training course generated",
    details: "AI generated fire safety training module in Vietnamese and English.",
    time: "8 hours ago",
    module: "educate",
    supplierId: "sup-001",
    supplierName: "Saigon Textiles Co.",
  },
  {
    id: "act-005",
    action: "Alert: Risk threshold exceeded",
    details: "Dhaka Garments crossed 90-point risk threshold. Immediate review recommended.",
    time: "12 hours ago",
    module: "system",
    supplierId: "sup-002",
    supplierName: "Dhaka Garments Ltd.",
    linkedType: "supplier",
  },
];

// ─── Alerts ──────────────────────────────────────────────────────────
export const mockAlerts: Alert[] = [
  {
    id: "alert-001",
    supplierId: "sup-002",
    title: "Critical Risk Threshold Exceeded",
    message: "Dhaka Garments Ltd. risk score has exceeded 90. Immediate review required.",
    severity: "high",
    isRead: false,
    createdAt: "2026-03-10T06:00:00Z",
  },
  {
    id: "alert-002",
    supplierId: "sup-001",
    title: "New High-Severity Case",
    message: "Overtime complaint filed at Saigon Textiles. Workers report 70-hour weeks.",
    severity: "high",
    isRead: false,
    createdAt: "2026-03-09T14:30:00Z",
  },
  {
    id: "alert-003",
    supplierId: "sup-007",
    title: "Training Compliance Gap",
    message: "Phnom Penh Textiles has 45% training completion — below 60% threshold.",
    severity: "medium",
    isRead: true,
    createdAt: "2026-03-08T09:00:00Z",
  },
  {
    id: "alert-004",
    supplierId: "sup-005",
    title: "Survey Response Rate Drop",
    message: "Istanbul Leather Works survey response rate dropped to 22%.",
    severity: "low",
    isRead: true,
    createdAt: "2026-03-07T11:00:00Z",
  },
];

// ─── Recommendations ────────────────────────────────────────────────
export const mockRecommendations: AIRecommendation[] = [
  {
    id: "rec-001",
    supplierId: "sup-002",
    supplierName: "Dhaka Garments Ltd.",
    action: "Schedule immediate fire safety audit",
    reason: "Missing emergency exits on 3rd floor detected in recent inspection.",
    urgency: "immediate",
    category: "investigation",
    linkedModule: "connect",
  },
  {
    id: "rec-002",
    supplierId: "sup-001",
    supplierName: "Saigon Textiles Co.",
    action: "Deploy overtime management training",
    reason: "Persistent overtime violations across 3 consecutive months.",
    urgency: "this_week",
    category: "training",
    linkedModule: "educate",
  },
  {
    id: "rec-003",
    supplierId: "sup-007",
    supplierName: "Phnom Penh Textiles",
    action: "Verify age documentation process",
    reason: "Child labor risk indicators flagged during routine data analysis.",
    urgency: "immediate",
    category: "investigation",
    linkedModule: "connect",
  },
];

// ─── Cases ───────────────────────────────────────────────────────────
export const mockCases: Case[] = [
  {
    id: "CASE-2026-001",
    supplierId: "sup-002",
    supplierName: "Dhaka Garments Ltd.",
    topic: "Fire Safety Non-Compliance",
    severity: "high",
    status: "in_progress",
    assignee: "Sarah Chen",
    aiSummary: "Fire safety inspection revealed missing emergency exits on 3rd floor. Building code violations require immediate remediation.",
    fullContent: "During scheduled Q1 inspection, auditors found that the 3rd floor east wing lacks proper emergency exits. Fire extinguishers in sections B and C are expired.",
    createdAt: "2026-03-05T08:00:00Z",
    updatedAt: "2026-03-10T14:00:00Z",
    aiGuidance: {
      recommendedSteps: [
        "Issue immediate corrective action notice",
        "Schedule follow-up inspection within 14 days",
        "Deploy fire safety training module",
      ],
      draftResponse: "We have identified critical fire safety concerns at your facility...",
      estimatedResolutionDays: 21,
    },
  },
  {
    id: "CASE-2026-002",
    supplierId: "sup-001",
    supplierName: "Saigon Textiles Co.",
    topic: "Excessive Overtime",
    severity: "high",
    status: "triage",
    aiSummary: "Multiple workers report consistent 60-70 hour work weeks. Pattern suggests systemic overtime policy violations.",
    fullContent: "Worker grievance channel received 12 complaints about mandatory overtime in the past 30 days.",
    createdAt: "2026-03-08T10:00:00Z",
    updatedAt: "2026-03-10T09:00:00Z",
    aiGuidance: {
      recommendedSteps: [
        "Review production schedules and staffing levels",
        "Interview shift supervisors",
        "Implement overtime tracking system",
      ],
      estimatedResolutionDays: 30,
    },
  },
  {
    id: "CASE-2026-003",
    supplierId: "sup-003",
    supplierName: "Guangzhou Electronics",
    topic: "Wage Dispute",
    severity: "medium",
    status: "assigned",
    assignee: "James Wong",
    aiSummary: "Workers report discrepancies between contractual and actual wages. Investigation suggests payroll calculation errors.",
    fullContent: "Payroll audit reveals systematic underpayment of overtime premiums affecting approximately 200 workers.",
    createdAt: "2026-03-01T12:00:00Z",
    updatedAt: "2026-03-09T16:00:00Z",
    aiGuidance: {
      recommendedSteps: [
        "Conduct full payroll audit",
        "Calculate back-pay obligations",
        "Implement automated payroll verification",
      ],
      estimatedResolutionDays: 14,
    },
  },
  {
    id: "CASE-2026-004",
    supplierId: "sup-005",
    supplierName: "Istanbul Leather Works",
    topic: "Chemical Exposure",
    severity: "medium",
    status: "new",
    aiSummary: "Reports of inadequate PPE in tanning section. Workers exposed to chromium compounds without proper protection.",
    fullContent: "Health monitoring data shows elevated chromium levels in workers assigned to the tanning department.",
    createdAt: "2026-03-09T15:00:00Z",
    updatedAt: "2026-03-09T15:00:00Z",
    aiGuidance: {
      recommendedSteps: [
        "Immediate PPE distribution",
        "Health screening for exposed workers",
        "Review chemical handling protocols",
      ],
      estimatedResolutionDays: 7,
    },
  },
  {
    id: "CASE-2026-005",
    supplierId: "sup-004",
    supplierName: "Chennai Fabrics",
    topic: "Worker Feedback",
    severity: "low",
    status: "resolved",
    assignee: "Raj Patel",
    aiSummary: "General feedback about canteen food quality. No safety or compliance issues identified.",
    fullContent: "Workers submitted suggestions for improving cafeteria meal options and extending break times.",
    createdAt: "2026-02-20T08:00:00Z",
    updatedAt: "2026-03-01T10:00:00Z",
    resolvedAt: "2026-03-01T10:00:00Z",
    aiGuidance: {
      recommendedSteps: ["Share feedback with facility management"],
      estimatedResolutionDays: 3,
    },
  },
];

export function mockCasesResponse(
  page = 1,
  perPage = 8,
): PaginatedResponse<Case> {
  const start = (page - 1) * perPage;
  const data = mockCases.slice(start, start + perPage);
  return {
    data,
    total: mockCases.length,
    page,
    perPage,
    totalPages: Math.ceil(mockCases.length / perPage),
  };
}

export const mockCase: Case = mockCases[0];

// ─── Surveys ─────────────────────────────────────────────────────────
export const mockSurveys: Survey[] = [
  {
    id: "survey-001",
    supplierId: "sup-001",
    supplierName: "Saigon Textiles Co.",
    title: "Q1 Worker Satisfaction Survey",
    responses: 1820,
    riskScore: 68,
    status: "closed",
    aiInsight: "Key concerns around overtime and break times. Positive sentiment on management communication.",
    themes: [
      { name: "Overtime", sentiment: "negative", mentionCount: 342 },
      { name: "Safety", sentiment: "neutral", mentionCount: 218 },
      { name: "Management", sentiment: "positive", mentionCount: 195 },
    ],
    createdAt: "2026-01-15T00:00:00Z",
    closedAt: "2026-03-01T00:00:00Z",
  },
  {
    id: "survey-002",
    supplierId: "sup-002",
    supplierName: "Dhaka Garments Ltd.",
    title: "Fire Safety Awareness Check",
    responses: 3100,
    riskScore: 82,
    status: "active",
    aiInsight: "Low awareness of emergency exit locations. Training intervention recommended.",
    themes: [
      { name: "Fire Safety", sentiment: "negative", mentionCount: 890 },
      { name: "Exits", sentiment: "negative", mentionCount: 654 },
      { name: "Drills", sentiment: "positive", mentionCount: 312 },
    ],
    createdAt: "2026-02-01T00:00:00Z",
  },
  {
    id: "survey-003",
    supplierId: "sup-003",
    supplierName: "Guangzhou Electronics",
    title: "Workplace Environment Survey",
    responses: 5400,
    riskScore: 35,
    status: "closed",
    aiInsight: "Generally positive workplace sentiment. Minor concerns about cafeteria quality.",
    themes: [
      { name: "Environment", sentiment: "positive", mentionCount: 1200 },
      { name: "Food", sentiment: "negative", mentionCount: 380 },
    ],
    createdAt: "2026-01-01T00:00:00Z",
    closedAt: "2026-02-15T00:00:00Z",
  },
  {
    id: "survey-004",
    supplierId: "sup-006",
    supplierName: "Puebla Automotive Parts",
    title: "Annual Engagement Survey",
    responses: 4100,
    riskScore: 12,
    status: "active",
    aiInsight: "High engagement scores across all categories. Model supplier for best practices.",
    themes: [
      { name: "Engagement", sentiment: "positive", mentionCount: 2100 },
      { name: "Benefits", sentiment: "positive", mentionCount: 980 },
    ],
    createdAt: "2026-02-15T00:00:00Z",
  },
];

export function mockSurveysResponse(
  page = 1,
  perPage = 8,
): PaginatedResponse<Survey> {
  const start = (page - 1) * perPage;
  const data = mockSurveys.slice(start, start + perPage);
  return {
    data,
    total: mockSurveys.length,
    page,
    perPage,
    totalPages: Math.ceil(mockSurveys.length / perPage),
  };
}

// ─── Courses ─────────────────────────────────────────────────────────
export const mockCourses: Course[] = [
  {
    id: "course-001",
    title: "Fire Safety and Emergency Procedures",
    description: "Comprehensive training on fire prevention, detection, and evacuation procedures.",
    enrollments: 3200,
    completionRate: 78,
    aiStatus: "generated",
    aiGenerated: true,
    relevantFor: ["Fire Safety Non-Compliance", "Chemical Exposure"],
    languages: ["en", "vi", "bn"],
    createdAt: "2026-02-01T00:00:00Z",
  },
  {
    id: "course-002",
    title: "Overtime Regulations and Worker Rights",
    description: "Training on legal working hour limits, overtime compensation, and grievance channels.",
    enrollments: 2800,
    completionRate: 65,
    aiStatus: "generated",
    aiGenerated: true,
    relevantFor: ["Excessive Overtime", "Wage Dispute"],
    languages: ["en", "vi", "zh"],
    createdAt: "2026-02-15T00:00:00Z",
  },
  {
    id: "course-003",
    title: "Chemical Handling and PPE Usage",
    description: "Safety protocols for handling hazardous chemicals and proper use of personal protective equipment.",
    enrollments: 1500,
    completionRate: 92,
    aiStatus: "generated",
    aiGenerated: true,
    relevantFor: ["Chemical Exposure"],
    languages: ["en", "tr"],
    createdAt: "2026-01-20T00:00:00Z",
  },
  {
    id: "course-004",
    title: "Anti-Harassment Workshop",
    description: "Interactive workshop on identifying and preventing workplace harassment.",
    enrollments: 6200,
    completionRate: 84,
    aiStatus: "manual",
    aiGenerated: false,
    source: "External Provider",
    relevantFor: ["Harassment"],
    languages: ["en", "vi", "bn", "zh", "km"],
    createdAt: "2026-01-05T00:00:00Z",
  },
];

export function mockCoursesResponse(
  page = 1,
  perPage = 8,
): PaginatedResponse<Course> {
  const start = (page - 1) * perPage;
  const data = mockCourses.slice(start, start + perPage);
  return {
    data,
    total: mockCourses.length,
    page,
    perPage,
    totalPages: Math.ceil(mockCourses.length / perPage),
  };
}

// ─── Timeline ────────────────────────────────────────────────────────
export const mockTimeline: TimelineEvent[] = [
  {
    id: "tl-001",
    supplierId: "sup-001",
    date: "2026-03-10T08:00:00Z",
    type: "alert",
    module: "system",
    title: "Risk score increased to 82",
    description: "New case data pushed risk score above previous threshold.",
  },
  {
    id: "tl-002",
    supplierId: "sup-001",
    date: "2026-03-08T10:00:00Z",
    type: "problem",
    module: "connect",
    title: "Overtime complaint filed",
    description: "12 workers reported mandatory overtime exceeding legal limits.",
    linkedId: "CASE-2026-002",
    linkedType: "case",
  },
  {
    id: "tl-003",
    supplierId: "sup-001",
    date: "2026-03-05T14:00:00Z",
    type: "action",
    module: "educate",
    title: "Fire safety training deployed",
    description: "AI-generated training module sent to 2,400 workers.",
    linkedId: "course-001",
    linkedType: "course",
  },
  {
    id: "tl-004",
    supplierId: "sup-001",
    date: "2026-03-01T00:00:00Z",
    type: "outcome",
    module: "engage",
    title: "Q1 survey completed",
    description: "1,820 responses collected. Key theme: overtime concerns.",
    linkedId: "survey-001",
    linkedType: "survey",
  },
];

// ─── Risk History ────────────────────────────────────────────────────
export const mockRiskHistory: RiskHistoryEntry[] = [
  {
    id: 1,
    supplierId: "sup-001",
    riskScore: 58,
    caseScore: 55,
    surveyScore: 60,
    trainingScore: 50,
    engagementScore: 65,
    snapshotDate: "2025-10-01T00:00:00Z",
  },
  {
    id: 2,
    supplierId: "sup-001",
    riskScore: 63,
    caseScore: 65,
    surveyScore: 62,
    trainingScore: 52,
    engagementScore: 68,
    snapshotDate: "2025-11-01T00:00:00Z",
  },
  {
    id: 3,
    supplierId: "sup-001",
    riskScore: 70,
    caseScore: 72,
    surveyScore: 68,
    trainingScore: 55,
    engagementScore: 70,
    snapshotDate: "2025-12-01T00:00:00Z",
  },
  {
    id: 4,
    supplierId: "sup-001",
    riskScore: 74,
    caseScore: 78,
    surveyScore: 72,
    trainingScore: 58,
    engagementScore: 68,
    snapshotDate: "2026-01-01T00:00:00Z",
  },
  {
    id: 5,
    supplierId: "sup-001",
    riskScore: 78,
    caseScore: 82,
    surveyScore: 75,
    trainingScore: 60,
    engagementScore: 70,
    snapshotDate: "2026-02-01T00:00:00Z",
  },
  {
    id: 6,
    supplierId: "sup-001",
    riskScore: 82,
    caseScore: 85,
    surveyScore: 78,
    trainingScore: 60,
    engagementScore: 70,
    snapshotDate: "2026-03-01T00:00:00Z",
  },
];

// ─── Supplier Training ──────────────────────────────────────────────
export const mockSupplierTraining = [
  {
    supplierId: "sup-001",
    courseId: "course-001",
    enrolledWorkers: 2400,
    completedWorkers: 1872,
    completionRate: 78,
    lastActivityDate: "2026-03-08T00:00:00Z",
  },
  {
    supplierId: "sup-001",
    courseId: "course-002",
    enrolledWorkers: 2400,
    completedWorkers: 1560,
    completionRate: 65,
    lastActivityDate: "2026-03-05T00:00:00Z",
  },
];
