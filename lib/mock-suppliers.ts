import type {
  Supplier,
  TimelineEvent,
  AIRecommendation,
  Case,
  Survey,
  Course,
  SupplierTraining,
  ActivityItem,
  DashboardMetrics,
} from "@/types";

// ===============================
// SUPPLIERS (8-10 with full profiles)
// ===============================

export const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: "SUP-001",
    name: "Tiruppur Textiles Ltd",
    region: "South Asia",
    country: "India",
    location: "Tirupur, Tamil Nadu",
    workerCount: 2400,
    contactName: "Arun Krishnamurthy",
    contactEmail: "arun.k@tiruppur-textiles.com",
    riskScore: 78,
    riskLevel: "high",
    status: "active",
    lastActivityDate: "2026-01-11",
    riskBreakdown: {
      caseScore: 85,
      surveyScore: 72,
      trainingScore: 75,
      engagementScore: 80,
      reasons: [
        {
          factor: "3x increase in overtime complaints",
          impact: "high",
          description: "Wage-related cases up 200% over last quarter",
          module: "connect",
        },
        {
          factor: "Low survey scores on 'fair treatment'",
          impact: "medium",
          description: "52% negative sentiment on management questions",
          module: "engage",
        },
        {
          factor: "Harassment training incomplete",
          impact: "high",
          description: "Only 34% of supervisors completed required module",
          module: "educate",
        },
      ],
    },
  },
  {
    id: "SUP-002",
    name: "Dhaka Garments International",
    region: "South Asia",
    country: "Bangladesh",
    location: "Dhaka",
    workerCount: 5200,
    contactName: "Fatima Rahman",
    contactEmail: "f.rahman@dhaka-garments.bd",
    riskScore: 45,
    riskLevel: "medium",
    status: "active",
    lastActivityDate: "2026-01-10",
    riskBreakdown: {
      caseScore: 40,
      surveyScore: 50,
      trainingScore: 45,
      engagementScore: 45,
      reasons: [
        {
          factor: "Safety concerns in Building B",
          impact: "medium",
          description: "3 workplace safety cases reported this month",
          module: "connect",
        },
        {
          factor: "Fire drill training overdue",
          impact: "medium",
          description: "Last fire safety training was 8 months ago",
          module: "educate",
        },
      ],
    },
  },
  {
    id: "SUP-003",
    name: "Ho Chi Minh Apparel Co",
    region: "Southeast Asia",
    country: "Vietnam",
    location: "Ho Chi Minh City",
    workerCount: 1800,
    contactName: "Nguyen Van Minh",
    contactEmail: "minh.nguyen@hcm-apparel.vn",
    riskScore: 22,
    riskLevel: "low",
    status: "active",
    lastActivityDate: "2026-01-12",
    riskBreakdown: {
      caseScore: 20,
      surveyScore: 25,
      trainingScore: 18,
      engagementScore: 25,
      reasons: [
        {
          factor: "Consistent improvement trend",
          impact: "low",
          description: "Risk score down 15 points over 6 months",
          module: "engage",
        },
      ],
    },
  },
  {
    id: "SUP-004",
    name: "Shenzhen Manufacturing Hub",
    region: "East Asia",
    country: "China",
    location: "Shenzhen, Guangdong",
    workerCount: 8500,
    contactName: "Wei Chen",
    contactEmail: "w.chen@shenzhen-mfg.cn",
    riskScore: 88,
    riskLevel: "high",
    status: "active",
    lastActivityDate: "2026-01-09",
    riskBreakdown: {
      caseScore: 92,
      surveyScore: 85,
      trainingScore: 82,
      engagementScore: 93,
      reasons: [
        {
          factor: "Multiple harassment allegations",
          impact: "high",
          description: "5 verbal harassment cases against Line 4 supervisor",
          module: "connect",
        },
        {
          factor: "Dormitory complaints spike",
          impact: "high",
          description: "12 cases about living conditions in past month",
          module: "connect",
        },
        {
          factor: "Workers report fear of retaliation",
          impact: "high",
          description: "Survey shows 68% fear speaking up",
          module: "engage",
        },
        {
          factor: "Zero grievance training completed",
          impact: "medium",
          description: "Managers have not completed grievance handling module",
          module: "educate",
        },
      ],
    },
  },
  {
    id: "SUP-005",
    name: "Jakarta Footwear Factory",
    region: "Southeast Asia",
    country: "Indonesia",
    location: "Jakarta",
    workerCount: 3200,
    contactName: "Dewi Susanto",
    contactEmail: "d.susanto@jkt-footwear.id",
    riskScore: 35,
    riskLevel: "medium",
    status: "active",
    lastActivityDate: "2026-01-11",
    riskBreakdown: {
      caseScore: 30,
      surveyScore: 38,
      trainingScore: 35,
      engagementScore: 37,
      reasons: [
        {
          factor: "Minor wage calculation issues",
          impact: "low",
          description: "2 cases about overtime pay miscalculation",
          module: "connect",
        },
        {
          factor: "Good engagement overall",
          impact: "low",
          description: "85% survey participation rate",
          module: "engage",
        },
      ],
    },
  },
  {
    id: "SUP-006",
    name: "Mumbai Textile Works",
    region: "South Asia",
    country: "India",
    location: "Mumbai, Maharashtra",
    workerCount: 1500,
    contactName: "Priya Sharma",
    contactEmail: "p.sharma@mumbai-textile.in",
    riskScore: 52,
    riskLevel: "medium",
    status: "active",
    lastActivityDate: "2026-01-08",
    riskBreakdown: {
      caseScore: 55,
      surveyScore: 48,
      trainingScore: 52,
      engagementScore: 53,
      reasons: [
        {
          factor: "Health & safety gaps identified",
          impact: "medium",
          description: "Ventilation complaints from dye section workers",
          module: "connect",
        },
        {
          factor: "Training completion declining",
          impact: "medium",
          description: "Completion rate dropped from 78% to 61%",
          module: "educate",
        },
      ],
    },
  },
  {
    id: "SUP-007",
    name: "Colombo Garment Exports",
    region: "South Asia",
    country: "Sri Lanka",
    location: "Colombo",
    workerCount: 2100,
    contactName: "Chaminda Perera",
    contactEmail: "c.perera@colombo-exports.lk",
    riskScore: 18,
    riskLevel: "low",
    status: "active",
    lastActivityDate: "2026-01-12",
    riskBreakdown: {
      caseScore: 15,
      surveyScore: 20,
      trainingScore: 18,
      engagementScore: 19,
      reasons: [
        {
          factor: "Model supplier performance",
          impact: "low",
          description: "Consistently meets all compliance benchmarks",
          module: "engage",
        },
      ],
    },
  },
  {
    id: "SUP-008",
    name: "Phnom Penh Stitching Co",
    region: "Southeast Asia",
    country: "Cambodia",
    location: "Phnom Penh",
    workerCount: 4100,
    contactName: "Sokha Chea",
    contactEmail: "s.chea@pp-stitching.kh",
    riskScore: 67,
    riskLevel: "high",
    status: "active",
    lastActivityDate: "2026-01-10",
    riskBreakdown: {
      caseScore: 70,
      surveyScore: 65,
      trainingScore: 62,
      engagementScore: 71,
      reasons: [
        {
          factor: "Union-related tensions",
          impact: "high",
          description: "Workers reporting intimidation during organizing",
          module: "connect",
        },
        {
          factor: "Freedom of association concerns",
          impact: "high",
          description: "Survey shows workers feel restricted",
          module: "engage",
        },
      ],
    },
  },
  {
    id: "SUP-009",
    name: "Yangon Apparel Ltd",
    region: "Southeast Asia",
    country: "Myanmar",
    location: "Yangon",
    workerCount: 2800,
    contactName: "Kyaw Win",
    contactEmail: "k.win@yangon-apparel.mm",
    riskScore: 41,
    riskLevel: "medium",
    status: "active",
    lastActivityDate: "2026-01-07",
    riskBreakdown: {
      caseScore: 45,
      surveyScore: 38,
      trainingScore: 40,
      engagementScore: 41,
      reasons: [
        {
          factor: "Improving from previous high-risk status",
          impact: "medium",
          description: "Down from 72 after remediation program",
          module: "educate",
        },
      ],
    },
  },
  {
    id: "SUP-010",
    name: "Karachi Knits International",
    region: "South Asia",
    country: "Pakistan",
    location: "Karachi",
    workerCount: 3600,
    contactName: "Ahmed Hassan",
    contactEmail: "a.hassan@karachi-knits.pk",
    riskScore: 29,
    riskLevel: "low",
    status: "active",
    lastActivityDate: "2026-01-11",
    riskBreakdown: {
      caseScore: 28,
      surveyScore: 30,
      trainingScore: 25,
      engagementScore: 33,
      reasons: [
        {
          factor: "Strong worker engagement program",
          impact: "low",
          description: "Monthly town halls with 90%+ attendance",
          module: "engage",
        },
      ],
    },
  },
];

// ===============================
// CASES (linked to suppliers)
// ===============================

export const MOCK_CASES: Case[] = [
  {
    id: "CASE-2041",
    supplierId: "SUP-001",
    supplierName: "Tiruppur Textiles Ltd",
    topic: "Wages",
    severity: "high",
    status: "new",
    aiSummary:
      "Complaint regarding unpaid overtime hours (approx 12h total) for weeks 1 and 2 of January. Worker attached photo of time card.",
    fullContent:
      "I have been working extra hours for the past two weeks but my payslip does not show the overtime payment. I worked 6 extra hours in week 1 and 6 more in week 2. I have kept photos of the time card as proof. Please investigate this matter as I need this money for my family. Other workers in my line are facing the same issue.",
    createdAt: "2026-01-09",
    updatedAt: "2026-01-09",
    aiGuidance: {
      recommendedSteps: [
        "Request payroll records for the affected period",
        "Cross-reference with time card system data",
        "Interview line supervisor about overtime approval process",
        "Check if other workers in Line 3 have similar complaints",
      ],
      draftResponse:
        "Thank you for bringing this to our attention. We take wage concerns seriously. We are investigating the overtime discrepancy you reported and will review the time card records against payroll. You should expect an update within 5 working days.",
      relatedTraining: ["Wage & Hours 101", "Overtime Calculation Guide"],
      estimatedResolutionDays: 7,
    },
  },
  {
    id: "CASE-2042",
    supplierId: "SUP-004",
    supplierName: "Shenzhen Manufacturing Hub",
    topic: "Harassment",
    severity: "high",
    status: "triage",
    aiSummary:
      "Verbal harassment allegation against Line 4 supervisor. Multiple witnesses cited. Requesting immediate HR intervention.",
    fullContent:
      "The supervisor on Line 4 has been shouting at workers for the past month. Yesterday he called me stupid in front of everyone because I made a small mistake. Three other workers saw this happen. This is not the first time - he does this to many people. We are afraid to complain because he controls our shift assignments.",
    createdAt: "2026-01-08",
    updatedAt: "2026-01-09",
    assignee: "HR Manager",
    aiGuidance: {
      recommendedSteps: [
        "IMMEDIATE: Ensure reporter safety - do not share identity",
        "Document all witness statements confidentially",
        "Review supervisor's history for pattern of behavior",
        "Consider temporary reassignment pending investigation",
        "Schedule mandatory respectful workplace training",
      ],
      draftResponse:
        "Your report has been received confidentially. We understand how difficult it was to come forward. An investigation has been initiated and your identity will be protected. Someone from HR will follow up within 48 hours.",
      relatedTraining: [
        "Sexual Harassment Prevention",
        "Respectful Workplace Conduct",
      ],
      estimatedResolutionDays: 14,
    },
  },
  {
    id: "CASE-2043",
    supplierId: "SUP-002",
    supplierName: "Dhaka Garments International",
    topic: "Health & Safety",
    severity: "medium",
    status: "assigned",
    assignee: "Facilities Team",
    aiSummary:
      "Fire exit blocked by material storage in Building B. Worker reports this has been ongoing for weeks.",
    fullContent:
      "The fire exit near cutting section in Building B has boxes stacked in front of it. This has been like this for at least 3 weeks. If there is a fire we cannot get out quickly. I told my supervisor but nothing changed.",
    createdAt: "2026-01-08",
    updatedAt: "2026-01-10",
    aiGuidance: {
      recommendedSteps: [
        "URGENT: Clear fire exit immediately - safety priority",
        "Conduct full fire exit audit of Building B",
        "Issue reminder to all supervisors about emergency egress",
        "Schedule follow-up inspection in 7 days",
      ],
      draftResponse:
        "Thank you for this important safety report. The fire exit has been cleared. We are conducting a full safety audit of Building B and will implement better monitoring to prevent this from happening again.",
      relatedTraining: [
        "Fire Safety Basics",
        "Emergency Evacuation Procedures",
      ],
      estimatedResolutionDays: 3,
    },
  },
  {
    id: "CASE-2044",
    supplierId: "SUP-001",
    supplierName: "Tiruppur Textiles Ltd",
    topic: "Wages",
    severity: "medium",
    status: "in_progress",
    assignee: "Payroll Manager",
    aiSummary:
      "Piece rate calculation appears incorrect for sewing section. Multiple workers affected.",
    fullContent:
      "The piece rate for shirt collars was changed last month but we were not told. Now our pay is less even though we are making the same number of pieces. Can you check if this is correct?",
    createdAt: "2026-01-06",
    updatedAt: "2026-01-11",
    aiGuidance: {
      recommendedSteps: [
        "Verify piece rate change in payroll system",
        "Check if workers were notified of rate changes",
        "Calculate any underpayments for affected workers",
        "Schedule communication about wage calculation methods",
      ],
      draftResponse:
        "We are investigating the piece rate change you mentioned. Our payroll team is reviewing the records and will ensure any discrepancy is corrected in your next payslip.",
      relatedTraining: ["Wage & Hours 101", "Understanding Your Payslip"],
      estimatedResolutionDays: 5,
    },
  },
  {
    id: "CASE-2045",
    supplierId: "SUP-008",
    supplierName: "Phnom Penh Stitching Co",
    topic: "Freedom of Association",
    severity: "high",
    status: "triage",
    aiSummary:
      "Worker reports being threatened by supervisor after attending union meeting. Serious retaliation concern.",
    fullContent:
      "After I went to the worker meeting on Sunday, my supervisor told me I should be careful about which meetings I attend. He said workers who cause trouble get reassigned to night shift. I am scared but I have the right to go to meetings.",
    createdAt: "2026-01-10",
    updatedAt: "2026-01-10",
    aiGuidance: {
      recommendedSteps: [
        "CRITICAL: Escalate to brand compliance team immediately",
        "Document threat with timestamp and details",
        "Ensure worker is protected from shift changes",
        "Review factory's freedom of association policy",
        "Consider third-party investigation",
      ],
      draftResponse:
        "This is a serious matter. You have the right to attend worker meetings. We are escalating this to senior management and the brand to ensure your rights are protected. You should not experience any negative consequences.",
      relatedTraining: [
        "Worker Rights & Responsibilities",
        "Freedom of Association",
      ],
      estimatedResolutionDays: 14,
    },
  },
  {
    id: "CASE-2046",
    supplierId: "SUP-006",
    supplierName: "Mumbai Textile Works",
    topic: "Health & Safety",
    severity: "medium",
    status: "new",
    aiSummary:
      "Workers in dye section reporting respiratory issues due to poor ventilation.",
    fullContent:
      "Many workers in the dye section are having coughing and breathing problems. The ventilation fans are not working properly and the chemical smell is very strong. We asked for masks but were told there are none available.",
    createdAt: "2026-01-08",
    updatedAt: "2026-01-08",
    aiGuidance: {
      recommendedSteps: [
        "IMMEDIATE: Provide PPE (masks) to all dye section workers",
        "Inspect and repair ventilation system",
        "Conduct air quality testing",
        "Review chemical handling procedures",
        "Consider temporary relocation of affected workers",
      ],
      draftResponse:
        "Your health and safety is our priority. We are immediately providing masks to all dye section workers and have called technicians to inspect the ventilation system. A full air quality assessment will be conducted.",
      relatedTraining: ["PPE Requirements", "Chemical Safety Basics"],
      estimatedResolutionDays: 7,
    },
  },
  {
    id: "CASE-2047",
    supplierId: "SUP-004",
    supplierName: "Shenzhen Manufacturing Hub",
    topic: "Living Conditions",
    severity: "medium",
    status: "assigned",
    assignee: "Dormitory Manager",
    aiSummary:
      "Dormitory hot water not working for past week. Workers have no way to bathe properly.",
    fullContent:
      "The hot water in dormitory building 2 has been broken for 8 days now. We have complained to the dorm supervisor but nothing happens. It is cold and we cannot bathe properly. There are 200 workers affected.",
    createdAt: "2026-01-05",
    updatedAt: "2026-01-09",
    aiGuidance: {
      recommendedSteps: [
        "Expedite repair of hot water system",
        "Consider temporary solution (portable heaters, alternate facilities)",
        "Communicate repair timeline to affected workers",
        "Review maintenance request escalation process",
      ],
      draftResponse:
        "We apologize for this inconvenience. Repair technicians have been scheduled and the hot water should be restored within 48 hours. In the meantime, we are arranging access to alternate bathing facilities.",
      relatedTraining: ["Dormitory Guidelines"],
      estimatedResolutionDays: 3,
    },
  },
];

// ===============================
// SURVEYS (linked to suppliers)
// ===============================

export const MOCK_SURVEYS: Survey[] = [
  {
    id: "SUR-001",
    supplierId: "SUP-001",
    supplierName: "Tiruppur Textiles Ltd",
    title: "Q1 Worker Satisfaction Pulse",
    responses: 1240,
    riskScore: 45,
    status: "closed",
    aiInsight:
      "Key concern: Overtime payment accuracy mentioned by 23% of respondents. Recommend immediate payroll audit.",
    themes: [
      { name: "Overtime Pay", sentiment: "negative", mentionCount: 285 },
      { name: "Supervisor Behavior", sentiment: "negative", mentionCount: 156 },
      { name: "Canteen Food", sentiment: "neutral", mentionCount: 89 },
      { name: "Leave Policy", sentiment: "positive", mentionCount: 67 },
    ],
    createdAt: "2026-01-02",
    closedAt: "2026-01-09",
  },
  {
    id: "SUR-002",
    supplierId: "SUP-002",
    supplierName: "Dhaka Garments International",
    title: "Safety & Hygiene Assessment",
    responses: 856,
    riskScore: 58,
    status: "closed",
    aiInsight:
      "HIGH RISK: 'Fire exits' and 'chemical storage' flagged as critical issues. Immediate facility inspection recommended.",
    themes: [
      { name: "Fire Exits", sentiment: "negative", mentionCount: 124 },
      { name: "Chemical Storage", sentiment: "negative", mentionCount: 98 },
      { name: "Restroom Cleanliness", sentiment: "negative", mentionCount: 67 },
      { name: "First Aid", sentiment: "positive", mentionCount: 45 },
    ],
    createdAt: "2025-12-15",
    closedAt: "2025-12-30",
  },
  {
    id: "SUR-003",
    supplierId: "SUP-004",
    supplierName: "Shenzhen Manufacturing Hub",
    title: "Workplace Respect Survey",
    responses: 2340,
    riskScore: 72,
    status: "closed",
    aiInsight:
      "CRITICAL: 68% of workers report fear of speaking up. Supervisor training urgently needed.",
    themes: [
      {
        name: "Fear of Retaliation",
        sentiment: "negative",
        mentionCount: 1590,
      },
      {
        name: "Supervisor Communication",
        sentiment: "negative",
        mentionCount: 890,
      },
      { name: "Shift Fairness", sentiment: "negative", mentionCount: 456 },
    ],
    createdAt: "2025-12-20",
    closedAt: "2026-01-05",
  },
  {
    id: "SUR-004",
    supplierId: "SUP-003",
    supplierName: "Ho Chi Minh Apparel Co",
    title: "Annual Engagement Survey",
    responses: 1650,
    riskScore: 18,
    status: "closed",
    aiInsight:
      "Excellent results. 89% satisfaction rate. Recommend recognition program for management team.",
    themes: [
      { name: "Management Support", sentiment: "positive", mentionCount: 780 },
      { name: "Career Growth", sentiment: "positive", mentionCount: 560 },
      { name: "Work-Life Balance", sentiment: "positive", mentionCount: 340 },
    ],
    createdAt: "2025-12-01",
    closedAt: "2025-12-20",
  },
  {
    id: "SUR-005",
    supplierId: "SUP-008",
    supplierName: "Phnom Penh Stitching Co",
    title: "Freedom of Association Pulse",
    responses: 520,
    riskScore: 65,
    status: "active",
    aiInsight:
      "Concerning: 45% report feeling restricted from joining worker groups. Escalation recommended.",
    themes: [
      { name: "Union Access", sentiment: "negative", mentionCount: 234 },
      {
        name: "Meeting Restrictions",
        sentiment: "negative",
        mentionCount: 178,
      },
      {
        name: "Management Transparency",
        sentiment: "neutral",
        mentionCount: 89,
      },
    ],
    createdAt: "2026-01-08",
  },
];

// ===============================
// COURSES
// ===============================

export const MOCK_COURSES: Course[] = [
  {
    id: "CRS-101",
    title: "Sexual Harassment Prevention",
    description:
      "Comprehensive training on recognizing, preventing, and reporting harassment in the workplace.",
    enrollments: 4200,
    completionRate: 67,
    aiStatus: "generated",
    aiGenerated: true,
    source: "Policy_SH_2026.pdf",
    relevantFor: ["Harassment", "Workplace Conduct"],
    languages: ["English", "Hindi", "Bengali", "Vietnamese", "Mandarin"],
    createdAt: "2025-11-15",
  },
  {
    id: "CRS-102",
    title: "Fire Safety Basics",
    description:
      "Essential fire prevention and emergency evacuation procedures for all workers.",
    enrollments: 8900,
    completionRate: 89,
    aiStatus: "manual",
    aiGenerated: false,
    relevantFor: ["Health & Safety", "Emergency"],
    languages: [
      "English",
      "Hindi",
      "Bengali",
      "Vietnamese",
      "Mandarin",
      "Khmer",
    ],
    createdAt: "2025-09-01",
  },
  {
    id: "CRS-103",
    title: "Wage & Hours 101",
    description:
      "Understanding your pay, overtime calculations, and worker rights around compensation.",
    enrollments: 3500,
    completionRate: 54,
    aiStatus: "generated",
    aiGenerated: true,
    source: "Wage_Rights_Guide.pdf",
    relevantFor: ["Wages", "Overtime", "Compensation"],
    languages: ["English", "Hindi", "Bengali", "Vietnamese"],
    createdAt: "2025-10-20",
  },
  {
    id: "CRS-104",
    title: "Grievance Mechanism Overview",
    description: "How to report concerns and what happens after you speak up.",
    enrollments: 5600,
    completionRate: 71,
    aiStatus: "generated",
    aiGenerated: true,
    source: "Grievance_SOP.pdf",
    relevantFor: ["Grievance", "Reporting"],
    languages: ["English", "Hindi", "Bengali", "Vietnamese", "Mandarin"],
    createdAt: "2025-08-15",
  },
  {
    id: "CRS-105",
    title: "Respectful Workplace Conduct",
    description:
      "Guidelines for supervisors on respectful communication and leadership.",
    enrollments: 1200,
    completionRate: 45,
    aiStatus: "drafting",
    aiGenerated: true,
    source: "Processing...",
    relevantFor: ["Harassment", "Management", "Communication"],
    languages: ["English", "Mandarin"],
    createdAt: "2026-01-05",
  },
  {
    id: "CRS-106",
    title: "Freedom of Association Rights",
    description:
      "Understanding worker rights to organize and join unions without retaliation.",
    enrollments: 2100,
    completionRate: 38,
    aiStatus: "generated",
    aiGenerated: true,
    source: "FOA_Policy.pdf",
    relevantFor: ["Freedom of Association", "Worker Rights"],
    languages: ["English", "Khmer", "Vietnamese", "Burmese"],
    createdAt: "2025-12-01",
  },
];

// ===============================
// SUPPLIER TRAINING (linking suppliers to courses)
// ===============================

export const MOCK_SUPPLIER_TRAINING: SupplierTraining[] = [
  {
    supplierId: "SUP-001",
    courseId: "CRS-101",
    enrolledWorkers: 2400,
    completedWorkers: 816,
    completionRate: 34,
    lastActivityDate: "2026-01-10",
  },
  {
    supplierId: "SUP-001",
    courseId: "CRS-103",
    enrolledWorkers: 2400,
    completedWorkers: 1920,
    completionRate: 80,
    lastActivityDate: "2026-01-11",
  },
  {
    supplierId: "SUP-004",
    courseId: "CRS-101",
    enrolledWorkers: 8500,
    completedWorkers: 2550,
    completionRate: 30,
    lastActivityDate: "2026-01-08",
  },
  {
    supplierId: "SUP-004",
    courseId: "CRS-104",
    enrolledWorkers: 120,
    completedWorkers: 0,
    completionRate: 0,
    lastActivityDate: "2026-01-01",
  },
  {
    supplierId: "SUP-003",
    courseId: "CRS-102",
    enrolledWorkers: 1800,
    completedWorkers: 1710,
    completionRate: 95,
    lastActivityDate: "2026-01-12",
  },
];

// ===============================
// TIMELINE EVENTS (Problem → Action → Outcome)
// ===============================

export const MOCK_TIMELINE_EVENTS: TimelineEvent[] = [
  // Tiruppur Textiles story
  {
    id: "EVT-001",
    supplierId: "SUP-001",
    date: "2025-11-15",
    type: "problem",
    module: "connect",
    title: "Overtime complaints surge",
    description: "12 cases filed about unpaid overtime in sewing department",
    linkedId: "CASE-2041",
    linkedType: "case",
  },
  {
    id: "EVT-002",
    supplierId: "SUP-001",
    date: "2025-11-20",
    type: "action",
    module: "educate",
    title: "Wage training deployed",
    description: "Rolled out 'Wage & Hours 101' to all workers",
    linkedId: "CRS-103",
    linkedType: "course",
  },
  {
    id: "EVT-003",
    supplierId: "SUP-001",
    date: "2025-12-10",
    type: "outcome",
    module: "engage",
    title: "Survey shows improvement",
    description: "Wage understanding questions improved by 20%",
    linkedId: "SUR-001",
    linkedType: "survey",
  },
  {
    id: "EVT-004",
    supplierId: "SUP-001",
    date: "2026-01-09",
    type: "problem",
    module: "connect",
    title: "New overtime case filed",
    description:
      "Despite training, calculation issues persist - systemic problem suspected",
    linkedId: "CASE-2041",
    linkedType: "case",
  },
  // Shenzhen story
  {
    id: "EVT-005",
    supplierId: "SUP-004",
    date: "2025-12-01",
    type: "problem",
    module: "connect",
    title: "Harassment complaint filed",
    description: "First report against Line 4 supervisor",
  },
  {
    id: "EVT-006",
    supplierId: "SUP-004",
    date: "2025-12-20",
    type: "alert",
    module: "engage",
    title: "Survey reveals widespread fear",
    description: "68% of workers report fear of speaking up",
    linkedId: "SUR-003",
    linkedType: "survey",
  },
  {
    id: "EVT-007",
    supplierId: "SUP-004",
    date: "2026-01-05",
    type: "action",
    module: "system",
    title: "Brand escalation",
    description: "Elevated to GlobalWear compliance team for review",
  },
  {
    id: "EVT-008",
    supplierId: "SUP-004",
    date: "2026-01-08",
    type: "problem",
    module: "connect",
    title: "Additional harassment reports",
    description: "4 more workers come forward with similar complaints",
    linkedId: "CASE-2042",
    linkedType: "case",
  },
  // Ho Chi Minh success story
  {
    id: "EVT-009",
    supplierId: "SUP-003",
    date: "2025-06-01",
    type: "problem",
    module: "engage",
    title: "Low engagement scores",
    description: "Initial survey showed 45% satisfaction",
  },
  {
    id: "EVT-010",
    supplierId: "SUP-003",
    date: "2025-07-15",
    type: "action",
    module: "educate",
    title: "Comprehensive training program",
    description:
      "Launched supervisor communication training + worker rights modules",
  },
  {
    id: "EVT-011",
    supplierId: "SUP-003",
    date: "2025-09-01",
    type: "action",
    module: "system",
    title: "Monthly town halls started",
    description: "Management commits to regular worker feedback sessions",
  },
  {
    id: "EVT-012",
    supplierId: "SUP-003",
    date: "2025-12-20",
    type: "outcome",
    module: "engage",
    title: "89% satisfaction achieved",
    description: "Annual survey shows dramatic improvement",
    linkedId: "SUR-004",
    linkedType: "survey",
  },
];

// ===============================
// AI RECOMMENDATIONS
// ===============================

export const MOCK_AI_RECOMMENDATIONS: AIRecommendation[] = [
  {
    id: "REC-001",
    supplierId: "SUP-004",
    action: "Initiate third-party investigation",
    reason:
      "Multiple harassment allegations against same supervisor with evidence of retaliation fear",
    urgency: "immediate",
    category: "investigation",
    linkedModule: "connect",
    linkedId: "CASE-2042",
  },
  {
    id: "REC-002",
    supplierId: "SUP-004",
    action: "Deploy mandatory respectful workplace training",
    reason:
      "Survey shows 68% fear speaking up - urgent culture intervention needed",
    urgency: "this_week",
    category: "training",
    linkedModule: "educate",
    linkedId: "CRS-105",
  },
  {
    id: "REC-003",
    supplierId: "SUP-001",
    action: "Conduct payroll system audit",
    reason:
      "Recurring overtime calculation issues suggest systemic problem, not isolated incidents",
    urgency: "this_week",
    category: "investigation",
    linkedModule: "connect",
  },
  {
    id: "REC-004",
    supplierId: "SUP-002",
    action: "Complete fire exit audit",
    reason: "Worker report + survey data indicate multiple blocked exits",
    urgency: "immediate",
    category: "remediation",
    linkedModule: "connect",
    linkedId: "CASE-2043",
  },
  {
    id: "REC-005",
    supplierId: "SUP-008",
    action: "Escalate to brand compliance",
    reason:
      "Freedom of association concerns require brand-level intervention per HRDD requirements",
    urgency: "immediate",
    category: "investigation",
    linkedModule: "connect",
    linkedId: "CASE-2045",
  },
  {
    id: "REC-006",
    supplierId: "SUP-006",
    action: "Install air quality monitoring",
    reason:
      "Health complaints from dye section indicate potential occupational health risk",
    urgency: "this_week",
    category: "remediation",
    linkedModule: "connect",
    linkedId: "CASE-2046",
  },
];

// ===============================
// ACTIVITY STREAM
// ===============================

export const MOCK_ACTIVITY_STREAM: ActivityItem[] = [
  {
    id: "ACT-001",
    action: "Case Summarized",
    details: "Generated summary and guidance for harassment complaint",
    time: "2 mins ago",
    module: "connect",
    supplierId: "SUP-004",
    supplierName: "Shenzhen Manufacturing Hub",
    linkedId: "CASE-2042",
    linkedType: "case",
  },
  {
    id: "ACT-002",
    action: "Risk Alert",
    details:
      "Supplier risk score increased from 72 to 88 - multiple contributing factors",
    time: "15 mins ago",
    module: "system",
    supplierId: "SUP-004",
    supplierName: "Shenzhen Manufacturing Hub",
    linkedId: "SUP-004",
    linkedType: "supplier",
  },
  {
    id: "ACT-003",
    action: "Survey Insight",
    details: "Extracted 4 risk themes from Safety & Hygiene Assessment",
    time: "1 hour ago",
    module: "engage",
    supplierId: "SUP-002",
    supplierName: "Dhaka Garments International",
    linkedId: "SUR-002",
    linkedType: "survey",
  },
  {
    id: "ACT-004",
    action: "Training Recommendation",
    details: "Suggested 'Respectful Workplace Conduct' based on case patterns",
    time: "2 hours ago",
    module: "educate",
    supplierId: "SUP-004",
    supplierName: "Shenzhen Manufacturing Hub",
    linkedId: "CRS-105",
    linkedType: "course",
  },
  {
    id: "ACT-005",
    action: "Case Translation",
    details: "Translated 3 Bengali case submissions to English",
    time: "3 hours ago",
    module: "connect",
    supplierId: "SUP-002",
    supplierName: "Dhaka Garments International",
  },
  {
    id: "ACT-006",
    action: "HRDD Report Draft",
    details: "Generated Q4 due diligence narrative for brand review",
    time: "5 hours ago",
    module: "system",
    linkedType: "supplier",
  },
];

// ===============================
// DASHBOARD METRICS
// ===============================

export const MOCK_DASHBOARD_METRICS: DashboardMetrics = {
  totalSuppliers: 10,
  highRiskSuppliers: 3,
  activeCases: 7,
  pendingSurveys: 1,
  trainingCompletion: 62,
  trendsImproving: 4,
  trendsWorsening: 2,
};

// ===============================
// HELPER FUNCTIONS
// ===============================

export function getSupplierById(id: string): Supplier | undefined {
  return MOCK_SUPPLIERS.find((s) => s.id === id);
}

export function getCasesBySupplier(supplierId: string): Case[] {
  return MOCK_CASES.filter((c) => c.supplierId === supplierId);
}

export function getSurveysBySupplier(supplierId: string): Survey[] {
  return MOCK_SURVEYS.filter((s) => s.supplierId === supplierId);
}

export function getTimelineBySupplier(supplierId: string): TimelineEvent[] {
  return MOCK_TIMELINE_EVENTS.filter((e) => e.supplierId === supplierId).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export function getRecommendationsBySupplier(
  supplierId: string,
): AIRecommendation[] {
  return MOCK_AI_RECOMMENDATIONS.filter((r) => r.supplierId === supplierId);
}

export function getHighRiskSuppliers(): Supplier[] {
  return MOCK_SUPPLIERS.filter((s) => s.riskLevel === "high").sort(
    (a, b) => b.riskScore - a.riskScore,
  );
}

export function getSuppliersByRisk(): Supplier[] {
  return [...MOCK_SUPPLIERS].sort((a, b) => b.riskScore - a.riskScore);
}
