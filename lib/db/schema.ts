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
} from "drizzle-orm/pg-core";
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
// ===============================
// Supplier Risk Scores (current snapshot)
// ===============================
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
    calculatedAt: timestamp("calculated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [uniqueIndex("idx_risk_supplier_id").on(table.supplierId)],
);
// ===============================
// Supplier Risk History (for trends)
// ===============================
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
// ===============================
// Alerts
// ===============================
export const alerts = pgTable(
  "alerts",
  {
    id: serial("id").primaryKey(),
    supplierId: varchar("supplier_id", { length: 50 }).notNull(),
    supplierName: varchar("supplier_name", { length: 255 }),
    alertType: varchar("alert_type", { length: 50 }).notNull(), // risk_spike, low_training, survey_negative, case_spike
    severity: varchar("severity", { length: 20 }).notNull(), // critical, warning, info
    title: varchar("title", { length: 500 }).notNull(),
    message: text("message").notNull(),
    isRead: boolean("is_read").default(false).notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_alerts_supplier").on(table.supplierId),
    index("idx_alerts_unread").on(table.isRead),
  ],
);
// ===============================
// Survey Analysis Cache
// ===============================
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
// ===============================
// Case Summary & Guidance Cache
// ===============================
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
// AI Chat History
// ===============================
export const aiChatHistory = pgTable(
  "ai_chat_history",
  {
    id: serial("id").primaryKey(),
    sessionId: varchar("session_id", { length: 100 }).notNull(),
    role: varchar("role", { length: 20 }).notNull(), // user, assistant, system, tool
    content: text("content").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
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
// Case Embeddings (for clustering)
// ===============================
export const caseEmbeddings = pgTable(
  "case_embeddings",
  {
    id: serial("id").primaryKey(),
    caseId: varchar("case_id", { length: 50 }).notNull(),
    messageId: varchar("message_id", { length: 50 }),
    messageText: text("message_text").notNull(),
    embedding: jsonb("embedding").$type<number[]>().default([]),
    clusterId: integer("cluster_id"),
    clusterLabel: varchar("cluster_label", { length: 255 }),
    companyId: varchar("company_id", { length: 50 }),
    companyName: varchar("company_name", { length: 255 }),
    country: varchar("country", { length: 100 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_case_embed_case").on(table.caseId),
    index("idx_case_embed_cluster").on(table.clusterId),
    index("idx_case_embed_company").on(table.companyId),
  ],
);
// ===============================
// Survey Response Analysis (batch NLP results)
// ===============================
export const surveyResponseAnalysis = pgTable(
  "survey_response_analysis",
  {
    id: serial("id").primaryKey(),
    responseId: varchar("response_id", { length: 50 }).notNull().unique(),
    surveyId: varchar("survey_id", { length: 50 }),
    responseText: text("response_text").notNull(),
    sentiment: varchar("sentiment", { length: 20 }), // positive, negative, neutral
    sentimentScore: real("sentiment_score").default(0),
    topics: jsonb("topics").$type<string[]>().default([]),
    embedding: jsonb("embedding").$type<number[]>().default([]),
    analyzedAt: timestamp("analyzed_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_survey_resp_survey").on(table.surveyId),
    index("idx_survey_resp_sentiment").on(table.sentiment),
  ],
);
// ===============================
// Supplier Risk Forecast (predictions)
// ===============================
export const supplierRiskForecast = pgTable(
  "supplier_risk_forecast",
  {
    id: serial("id").primaryKey(),
    supplierId: varchar("supplier_id", { length: 50 }).notNull(),
    supplierName: varchar("supplier_name", { length: 255 }),
    currentScore: integer("current_score").notNull(),
    predictedScore: integer("predicted_score").notNull(),
    trend: varchar("trend", { length: 20 }).notNull(), // improving, worsening, stable
    trendMagnitude: real("trend_magnitude").default(0), // % change
    aiNarrative: text("ai_narrative"),
    dataPoints: integer("data_points").default(0), // number of history points used
    forecastDate: timestamp("forecast_date", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("idx_forecast_supplier").on(table.supplierId),
  ],
);
// ===============================
// Payslip Anomalies (flagged issues)
// ===============================
export const payslipAnomalies = pgTable(
  "payslip_anomalies",
  {
    id: serial("id").primaryKey(),
    payslipId: varchar("payslip_id", { length: 50 }).notNull(),
    supplierId: varchar("supplier_id", { length: 50 }).notNull(),
    supplierName: varchar("supplier_name", { length: 255 }),
    country: varchar("country", { length: 100 }),
    anomalyType: varchar("anomaly_type", { length: 50 }).notNull(), // below_minimum_wage, sudden_drop, overtime_missing
    severity: varchar("severity", { length: 20 }).notNull(), // critical, warning, info
    actualWage: real("actual_wage"),
    expectedWage: real("expected_wage"),
    deviationPercent: real("deviation_percent"),
    details: jsonb("details").$type<Record<string, unknown>>().default({}),
    aiExplanation: text("ai_explanation"),
    detectedAt: timestamp("detected_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_anomaly_supplier").on(table.supplierId),
    index("idx_anomaly_severity").on(table.severity),
    index("idx_anomaly_type").on(table.anomalyType),
  ],
);
