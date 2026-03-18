import {
  pgTable,
  serial,
  varchar,
  integer,
  text,
  boolean,
  timestamp,
  date,
  jsonb,
  uniqueIndex,
  index,
  real,
  customType,
} from "drizzle-orm/pg-core";

// Custom pgvector type for embedding columns
const vector = customType<{
  data: number[];
  config: { dimensions: number };
}>({
  dataType(config) {
    return `vector(${config?.dimensions ?? 1024})`;
  },
  fromDriver(value) {
    if (typeof value === "string") {
      return value
        .slice(1, -1)
        .split(",")
        .map(Number);
    }
    return value as number[];
  },
  toDriver(value) {
    return `[${value.join(",")}]`;
  },
});
// ===============================
// Types for JSON columns
// ===============================
export interface RiskReason {
  factor: string;
  impact: "high" | "medium" | "low";
  description: string;
  module: "connect" | "engage" | "educate";
}
export interface SurveyTheme {
  name: string;
  sentiment: "positive" | "negative" | "neutral";
  mentionCount: number;
}
export interface AIGuidanceData {
  recommendedSteps: string[];
  draftResponse?: string;
  relatedTraining?: string[];
  similarCases?: string[];
  estimatedResolutionDays: number;
}
export interface VoiceTopic {
  name: string;
  mentions: number;
  sentiment: "positive" | "negative" | "neutral";
  delta: number; // change from previous month
}
export interface PayslipAnomalyDetails {
  expected: number;
  actual: number;
  currency: string;
  country: string;
  employeeCount: number;
}
// ===============================
// CACHE LAYER
// ===============================

// Supplier Risk Scores (current snapshot)
export const supplierRiskScores = pgTable(
  "supplier_risk_scores",
  {
    id: serial("id").primaryKey(),
    supplierId: varchar("supplier_id", { length: 50 }).notNull(),
    supplierName: varchar("supplier_name", { length: 255 }),
    riskScore: integer("risk_score").notNull().default(50),
    caseScore: integer("case_score").default(0),
    surveyScore: integer("survey_score").default(0),
    trainingScore: integer("training_score").default(0),
    engagementScore: integer("engagement_score").default(0),
    reasons: jsonb("reasons").$type<RiskReason[]>().default([]),
    // Cached from SQL Server to avoid cross-DB joins on every dashboard load
    country: varchar("country", { length: 100 }),
    region: varchar("region", { length: 100 }),
    latitude: real("latitude"),
    longitude: real("longitude"),
    parentCompanyId: varchar("parent_company_id", { length: 50 }),
    calculatedAt: timestamp("calculated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [uniqueIndex("idx_risk_supplier_id").on(table.supplierId)],
);
// Supplier Risk History (for trends)
export const supplierRiskHistory = pgTable(
  "supplier_risk_history",
  {
    id: serial("id").primaryKey(),
    supplierId: varchar("supplier_id", { length: 50 }).notNull(),
    riskScore: integer("risk_score").notNull(),
    caseScore: integer("case_score"),
    surveyScore: integer("survey_score"),
    trainingScore: integer("training_score"),
    engagementScore: integer("engagement_score"),
    snapshotDate: date("snapshot_date").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("idx_history_supplier_date").on(
      table.supplierId,
      table.snapshotDate,
    ),
    index("idx_history_date").on(table.snapshotDate),
  ],
);
// Survey Analysis Cache
export const surveyAnalysis = pgTable(
  "survey_analysis",
  {
    id: serial("id").primaryKey(),
    surveyId: varchar("survey_id", { length: 50 }).notNull().unique(),
    responseCount: integer("response_count").default(0),
    sentimentPositive: real("sentiment_positive").default(0),
    sentimentNegative: real("sentiment_negative").default(0),
    sentimentNeutral: real("sentiment_neutral").default(0),
    riskScore: integer("risk_score").default(0),
    themes: jsonb("themes").$type<SurveyTheme[]>().default([]),
    aiInsight: text("ai_insight"),
    analyzedAt: timestamp("analyzed_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("idx_survey_analysis_survey").on(table.surveyId)],
);
// Case Summary & Guidance Cache
export const caseSummaryCache = pgTable(
  "case_summary_cache",
  {
    id: serial("id").primaryKey(),
    caseId: varchar("case_id", { length: 50 }).notNull().unique(),
    aiSummary: text("ai_summary").notNull(),
    aiGuidance: jsonb("ai_guidance").$type<AIGuidanceData>(),
    generatedAt: timestamp("generated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [uniqueIndex("idx_case_cache_id").on(table.caseId)],
);

// ===============================
// INTELLIGENCE LAYER
// ===============================

// Case Resolution Playbook (best practices by type/region)
export const casePlaybookCache = pgTable(
  "case_playbook_cache",
  {
    id: serial("id").primaryKey(),
    caseTypeId: varchar("case_type_id", { length: 50 }).notNull(),
    caseTypeName: varchar("case_type_name", { length: 255 }),
    region: varchar("region", { length: 100 }),
    avgResolutionDays: real("avg_resolution_days"),
    bestResolutionDays: real("best_resolution_days"),
    totalResolved: integer("total_resolved"),
    bestPractices: jsonb("best_practices").$type<string[]>(),
    aiSummary: text("ai_summary"),
    generatedAt: timestamp("generated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("idx_playbook_type_region").on(
      table.caseTypeId,
      table.region,
    ),
  ],
);
// Supplier Risk Forecast (60-day predictions)
export const supplierRiskForecast = pgTable(
  "supplier_risk_forecast",
  {
    id: serial("id").primaryKey(),
    supplierId: varchar("supplier_id", { length: 50 }).notNull(),
    forecastDate: date("forecast_date").notNull(),
    predictedRiskScore: integer("predicted_risk_score").notNull(),
    predictedCaseScore: integer("predicted_case_score"),
    predictedSurveyScore: integer("predicted_survey_score"),
    predictedTrainingScore: integer("predicted_training_score"),
    confidence: real("confidence"), // 0-1
    trendDirection: varchar("trend_direction", { length: 20 }), // rising, falling, stable
    aiReasoning: text("ai_reasoning"),
    generatedAt: timestamp("generated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("idx_forecast_supplier_date").on(
      table.supplierId,
      table.forecastDate,
    ),
  ],
);
// Worker Voice Trends (monthly topic extraction)
export const workerVoiceTrends = pgTable(
  "worker_voice_trends",
  {
    id: serial("id").primaryKey(),
    supplierId: varchar("supplier_id", { length: 50 }), // null = global
    month: date("month").notNull(),
    emergingTopics: jsonb("emerging_topics").$type<VoiceTopic[]>().default([]),
    decliningTopics: jsonb("declining_topics")
      .$type<VoiceTopic[]>()
      .default([]),
    sentimentShift: real("sentiment_shift"), // delta from previous month
    topThemes: jsonb("top_themes").$type<VoiceTopic[]>().default([]),
    analyzedAt: timestamp("analyzed_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("idx_voice_supplier_month").on(
      table.supplierId,
      table.month,
    ),
  ],
);
// Payslip Anomalies (flagged wage issues)
export const payslipAnomalies = pgTable(
  "payslip_anomalies",
  {
    id: serial("id").primaryKey(),
    supplierId: varchar("supplier_id", { length: 50 }).notNull(),
    supplierName: varchar("supplier_name", { length: 255 }),
    anomalyType: varchar("anomaly_type", { length: 50 }).notNull(), // below_minimum, sudden_drop, inconsistency
    severity: varchar("severity", { length: 20 }).notNull(), // critical, warning, info
    details: jsonb("details").$type<PayslipAnomalyDetails>(),
    aiInterpretation: text("ai_interpretation"),
    isResolved: boolean("is_resolved").default(false).notNull(),
    detectedAt: timestamp("detected_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_anomaly_supplier").on(table.supplierId),
    index("idx_anomaly_detected").on(table.detectedAt),
  ],
);

// ===============================
// VECTOR LAYER (pgvector)
// ===============================

// Case Embeddings (for clustering)
export const caseEmbeddings = pgTable(
  "case_embeddings",
  {
    id: serial("id").primaryKey(),
    caseId: varchar("case_id", { length: 50 }).notNull(),
    messageId: varchar("message_id", { length: 50 }).notNull(),
    embedding: vector("embedding", { dimensions: 1024 }).$type<number[]>(), // bge-m3 output
    clusterId: integer("cluster_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_embedding_case").on(table.caseId),
    index("idx_embedding_cluster").on(table.clusterId),
  ],
);
// Case Clusters (detected systemic patterns)
export const caseClusters = pgTable("case_clusters", {
  id: serial("id").primaryKey(),
  clusterLabel: text("cluster_label"),
  caseCount: integer("case_count"),
  supplierCount: integer("supplier_count"),
  regions: jsonb("regions").$type<string[]>().default([]),
  caseTypes: jsonb("case_types").$type<string[]>().default([]),
  representativeMessages: jsonb("representative_messages")
    .$type<string[]>()
    .default([]),
  aiSummary: text("ai_summary"),
  severity: varchar("severity", { length: 20 }), // critical, warning, info
  detectedAt: timestamp("detected_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ===============================
// CONTENT LAYER
// ===============================

// Course Translations (AI-translated training content)
export const courseTranslations = pgTable(
  "course_translations",
  {
    id: serial("id").primaryKey(),
    courseId: varchar("course_id", { length: 50 }).notNull(),
    language: varchar("language", { length: 10 }).notNull(),
    translatedContent: jsonb("translated_content"),
    translatedAt: timestamp("translated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("idx_translation_course_lang").on(
      table.courseId,
      table.language,
    ),
  ],
);

// ===============================
// STATE LAYER
// ===============================

// Alerts
export const alerts = pgTable(
  "alerts",
  {
    id: serial("id").primaryKey(),
    supplierId: varchar("supplier_id", { length: 50 }).notNull(),
    supplierName: varchar("supplier_name", { length: 255 }),
    alertType: varchar("alert_type", { length: 50 }).notNull(), // risk_spike, low_training, survey_negative, case_spike, payslip_anomaly
    severity: varchar("severity", { length: 20 }).notNull(), // critical, warning, info
    title: varchar("title", { length: 500 }).notNull(),
    message: text("message").notNull(),
    isRead: boolean("is_read").default(false).notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_alerts_supplier").on(table.supplierId),
    index("idx_alerts_unread").on(table.isRead),
  ],
);
// AI Chat History
export const aiChatHistory = pgTable(
  "ai_chat_history",
  {
    id: serial("id").primaryKey(),
    sessionId: varchar("session_id", { length: 100 }).notNull(),
    role: varchar("role", { length: 20 }).notNull(), // user, assistant, system, tool
    content: text("content").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    sessionTitle: text("session_title"), // AI-generated session title (set on first row per session)
    isPinned: boolean("is_pinned").default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_chat_session").on(table.sessionId),
    index("idx_chat_created").on(table.createdAt),
  ],
);

// ===============================
// BRIEFING LAYER
// ===============================

// Intelligence Briefing (pre-computed daily digest for AI page landing)
export interface BriefingAttentionItem {
  severity: "critical" | "watch" | "positive";
  title: string;
  description: string;
  metric?: string; // e.g., "14 cases"
  region?: string;
  supplierCount?: number;
  query: string; // pre-formatted query to send to AI when clicked
}

export const intelligenceBriefing = pgTable("intelligence_briefing", {
  id: serial("id").primaryKey(),
  attentionItems: jsonb("attention_items")
    .$type<BriefingAttentionItem[]>()
    .notNull()
    .default([]),
  generatedAt: timestamp("generated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});
