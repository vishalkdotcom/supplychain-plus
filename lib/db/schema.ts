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
  (table) => [
    uniqueIndex("idx_risk_supplier_id").on(table.supplierId),
  ]
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
      table.snapshotDate
    ),
    index("idx_history_date").on(table.snapshotDate),
  ]
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
  ]
);
// ===============================
// Survey Analysis Cache
// ===============================
export const surveyAnalysis = pgTable(
  "survey_analysis",
  {
    id: serial("id").primaryKey(),
    surveyId: integer("survey_id").notNull().unique(),
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
  (table) => [index("idx_survey_analysis_survey").on(table.surveyId)]
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
  (table) => [uniqueIndex("idx_case_cache_id").on(table.caseId)]
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
  ]
);
