export const MOCK_METRICS = [
  {
    title: "Total Active Cases",
    value: "2,916",
    change: "+12%",
    trend: "up",
    icon: "message",
  },
  {
    title: "Survey Responses",
    value: "9,291",
    change: "+5%",
    trend: "up",
    icon: "chart",
  },
  {
    title: "Course Completions",
    value: "3,172",
    change: "-2%",
    trend: "down",
    icon: "school",
  },
  {
    title: "High Risk Factories",
    value: "14",
    change: "0",
    trend: "neutral",
    icon: "alert",
  },
] as const;

export const MOCK_ACTIVITY_STREAM = [
  {
    id: 1,
    action: "Case Summarized",
    details: "Summarized harassment complaint for Factory A",
    time: "2 mins ago",
    module: "Connect",
  },
  {
    id: 2,
    action: "Risk Detected",
    details: "Detected 'Unsafe Working Conditions' pattern in Survey #4122",
    time: "15 mins ago",
    module: "Engage",
  },
  {
    id: 3,
    action: "Course Drafted",
    details: "Drafted 'Fire Safety 2026' from uploaded PDF",
    time: "1 hour ago",
    module: "Educate",
  },
  {
    id: 4,
    action: "Translation",
    details: "Translated 5 case responses to Bengali",
    time: "2 hours ago",
    module: "Connect",
  },
];

export const MOCK_RISK_HEATMAP = [
  {
    id: 1,
    name: "Factory Alpha",
    score: 85,
    region: "Vietnam",
    employees: 1200,
  },
  {
    id: 2,
    name: "Factory Beta",
    score: 42,
    region: "Bangladesh",
    employees: 3500,
  },
  { id: 3, name: "Factory Gamma", score: 92, region: "China", employees: 800 },
  { id: 4, name: "Factory Delta", score: 25, region: "India", employees: 2100 },
  {
    id: 5,
    name: "Factory Epsilon",
    score: 65,
    region: "Vietnam",
    employees: 1500,
  },
  {
    id: 6,
    name: "Factory Zeta",
    score: 30,
    region: "Bangladesh",
    employees: 4000,
  },
] as const;

export const MOCK_CASES = [
  {
    id: "CASE-2041",
    summary: "Worker reported unpaid overtime for 2 consecutive weeks.",
    severity: "High",
    topic: "Wages",
    status: "Open",
    date: "2026-01-09",
    ai_summary:
      "Complaint regarding unpaid overtime hours (approx 12h total) for weeks 1 and 2 of January. Worker attached photo of time card.",
  },
  {
    id: "CASE-2042",
    summary: "Broken fan in cafeteria causing heat stress.",
    severity: "Medium",
    topic: "Health & Safety",
    status: "In Progress",
    date: "2026-01-08",
    ai_summary:
      "Facility maintenance request: Main ceiling fan in cafeteria zone B is non-functional. Reported high temperatures during lunch shift.",
  },
  {
    id: "CASE-2043",
    summary: "Supervisor shouting at line workers.",
    severity: "High",
    topic: "Harassment",
    status: "Open",
    date: "2026-01-08",
    ai_summary:
      "Verbal harassment allegation against Line 4 supervisor. Multiple witnesses cited. Requesting immediate HR intervention.",
  },
  {
    id: "CASE-2044",
    summary: "Question about maternity leave policy.",
    severity: "Low",
    topic: "Policy",
    status: "Resolved",
    date: "2026-01-07",
    ai_summary:
      "Inquiry regarding paid maternity leave entitlement and documentation requirements. Standard policy PDF sent.",
  },
  {
    id: "CASE-2045",
    summary: "Drinking water tastes strange.",
    severity: "Medium",
    topic: "Health & Safety",
    status: "In Progress",
    date: "2026-01-06",
    ai_summary:
      "Water quality concern: Dispenser on 2nd floor reported to have metallic taste. Facilities team notified for testing.",
  },
] as const;

export const MOCK_SURVEYS = [
  {
    id: "SUR-001",
    title: "Q1 Worker Satisfaction Pulse",
    responses: 1240,
    risk_score: 12,
    status: "Active",
    ai_insight:
      "85% positive sentiment. Key concern: Canteen food quality (mentioned in 23 comments).",
  },
  {
    id: "SUR-002",
    title: "Safety & Hygiene Assessment",
    responses: 856,
    risk_score: 65,
    status: "Closed",
    ai_insight:
      "HIGH RISK: 'Restrooms' and 'Fire Exits' flagged as critical issues in 4 factories.",
  },
  {
    id: "SUR-003",
    title: "Supervisory Skills Feedback",
    responses: 430,
    risk_score: 25,
    status: "Active",
    ai_insight:
      "Improvement noted in Factory Beta. Communication scores up by 15%.",
  },
  {
    id: "SUR-004",
    title: "Overtime & Wages Survey",
    responses: 2100,
    risk_score: 45,
    status: "Draft",
    ai_insight:
      "Draft analysis: Questions 4 and 7 may be confusing to workers. Suggest simplification.",
  },
] as const;

export const MOCK_COURSES = [
  {
    id: "CRS-101",
    title: "Sexual Harassment Prevention (2026)",
    enrollments: 1200,
    completion_rate: "45%",
    ai_status: "Generated",
    source: "Policy_SH_2026.pdf",
  },
  {
    id: "CRS-102",
    title: "Fire Safety Basics",
    enrollments: 3400,
    completion_rate: "89%",
    ai_status: "Manual",
    source: "N/A",
  },
  {
    id: "CRS-103",
    title: "Financial Literacy: Savings",
    enrollments: 500,
    completion_rate: "12%",
    ai_status: "Generated",
    source: "Uploaded Content",
  },
  {
    id: "CRS-104",
    title: "Grievance Mechanism Overview",
    enrollments: 2100,
    completion_rate: "67%",
    ai_status: "Drafting",
    source: "Processing...",
  },
] as const;
