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
export interface RegionalIssuePrevalence {
  issueType: string;
  count: number;
  supplierIds: string[];
  severity: "critical" | "warning" | "info";
  trend?: "rising" | "falling" | "stable";
}
export interface PeerComparison {
  supplierId: string;
  supplierName: string;
  riskScore: number;
  caseScore: number;
  surveyScore: number;
  trainingScore: number;
  engagementScore: number;
  deviations: {
    risk: number;
    case: number;
    survey: number;
    training: number;
    engagement: number;
  };
}
export interface ContextualSilenceAlert {
  supplierId: string;
  supplierName: string;
  daysSilent: number;
  peerIssues: string[];
  peerActiveCount: number;
  severity: "critical" | "warning";
}
export interface RegionalClusterOverlap {
  clusterId: number;
  clusterLabel: string;
  severity: string;
  supplierCount: number;
  caseCount: number;
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
  supplierIds: jsonb("supplier_ids").$type<string[]>().default([]),
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
// MONITORING LAYER
// ===============================

// Supplier Monitoring Signals (silence, engagement decay, regional contagion)
export const supplierMonitoringSignals = pgTable(
  "supplier_monitoring_signals",
  {
    id: serial("id").primaryKey(),
    supplierId: varchar("supplier_id", { length: 50 }).notNull(),
    signalType: varchar("signal_type", { length: 50 }).notNull(), // silence, engagement_decay, regional_contagion
    severity: varchar("severity", { length: 20 }).notNull(), // critical, warning, info
    title: varchar("title", { length: 500 }).notNull(),
    description: text("description").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    detectedAt: timestamp("detected_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("idx_monitoring_supplier_type").on(
      table.supplierId,
      table.signalType,
    ),
    index("idx_monitoring_type").on(table.signalType),
  ],
);

// Survey Temporal Patterns (cross-survey theme trends)
export const surveyTemporalPatterns = pgTable(
  "survey_temporal_patterns",
  {
    id: serial("id").primaryKey(),
    themeName: varchar("theme_name", { length: 255 }).notNull(),
    trendDirection: varchar("trend_direction", { length: 20 }), // rising, falling, stable
    mentionsByMonth: jsonb("mentions_by_month")
      .$type<Record<string, number>>()
      .default({}),
    affectedSuppliers: jsonb("affected_suppliers")
      .$type<string[]>()
      .default([]),
    firstSeen: date("first_seen"),
    lastSeen: date("last_seen"),
    analyzedAt: timestamp("analyzed_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("idx_temporal_theme").on(table.themeName),
  ],
);

// Regional Benchmarks (pre-computed peer comparisons per region)
export const regionalBenchmarks = pgTable(
  "regional_benchmarks",
  {
    id: serial("id").primaryKey(),
    region: varchar("region", { length: 100 }).notNull(),
    supplierCount: integer("supplier_count").default(0),
    avgRiskScore: real("avg_risk_score").default(0),
    avgCaseScore: real("avg_case_score").default(0),
    avgSurveyScore: real("avg_survey_score").default(0),
    avgTrainingScore: real("avg_training_score").default(0),
    avgEngagementScore: real("avg_engagement_score").default(0),
    highRiskCount: integer("high_risk_count").default(0),
    silentCount: integer("silent_count").default(0),
    issuePrevalence: jsonb("issue_prevalence")
      .$type<RegionalIssuePrevalence[]>()
      .default([]),
    peerComparisons: jsonb("peer_comparisons")
      .$type<PeerComparison[]>()
      .default([]),
    contextualSilenceAlerts: jsonb("contextual_silence_alerts")
      .$type<ContextualSilenceAlert[]>()
      .default([]),
    clusterOverlap: jsonb("cluster_overlap")
      .$type<RegionalClusterOverlap[]>()
      .default([]),
    computedAt: timestamp("computed_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [uniqueIndex("idx_benchmark_region").on(table.region)],
);

// ===============================
// REMEDIATION LAYER
// ===============================

// Remediation Plans — tracks lifecycle of detected issues
export const remediationPlans = pgTable(
  "remediation_plans",
  {
    id: serial("id").primaryKey(),
    supplierId: varchar("supplier_id", { length: 50 }).notNull(),
    title: varchar("title", { length: 500 }).notNull(),
    status: varchar("status", { length: 30 }).notNull().default("detected"),
    // detected -> root_cause -> action_plan -> implementing -> verifying -> closed
    sourceType: varchar("source_type", { length: 50 }).notNull(),
    // cluster, anomaly, monitoring_signal, manual
    sourceId: integer("source_id"),
    rootCause: text("root_cause"),
    actionPlan: text("action_plan"),
    assignedTo: varchar("assigned_to", { length: 255 }),
    targetDate: date("target_date"),
    closedAt: timestamp("closed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_remediation_supplier").on(table.supplierId),
    index("idx_remediation_status").on(table.status),
  ],
);

// Remediation Evidence — links to supporting data
export const remediationEvidence = pgTable(
  "remediation_evidence",
  {
    id: serial("id").primaryKey(),
    remediationId: integer("remediation_id")
      .notNull()
      .references(() => remediationPlans.id),
    evidenceType: varchar("evidence_type", { length: 50 }).notNull(),
    // case_resolved, survey_improvement, training_completed, risk_score_drop, anomaly_resolved, manual_note
    referenceId: varchar("reference_id", { length: 100 }),
    title: varchar("title", { length: 500 }).notNull(),
    description: text("description"),
    date: date("date").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_evidence_remediation").on(table.remediationId),
    uniqueIndex("idx_evidence_dedup").on(table.remediationId, table.referenceId),
  ],
);

// Remediation Audit Log — tracks every change to a remediation plan
export const remediationAuditLog = pgTable(
  "remediation_audit_log",
  {
    id: serial("id").primaryKey(),
    remediationId: integer("remediation_id")
      .notNull()
      .references(() => remediationPlans.id),
    action: varchar("action", { length: 50 }).notNull(),
    // status_change, field_edit, evidence_added, evidence_auto_attached
    field: varchar("field", { length: 100 }),
    previousValue: text("previous_value"),
    newValue: text("new_value"),
    actorId: varchar("actor_id", { length: 100 }).notNull().default("system"),
    actorType: varchar("actor_type", { length: 30 }).notNull(),
    // user, system, auto_evidence_job
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_audit_remediation").on(table.remediationId),
  ],
);

// ===============================
// AUTH LAYER
// ===============================

// Demo Users — lightweight user identities for audit trail / UI
export const demoUsers = pgTable("demo_users", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 100 }).notNull(),
  avatarColor: varchar("avatar_color", { length: 30 }).notNull(),
});

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
// ===============================
// OPERATIONS LAYER
// ===============================

// Job Runs — execution history for all ML/batch jobs
export const jobRuns = pgTable(
  "job_runs",
  {
    id: serial("id").primaryKey(),
    jobType: varchar("job_type", { length: 50 }).notNull(),
    status: varchar("status", { length: 20 }).notNull().default("queued"), // queued, running, completed, failed, cancelled
    triggeredBy: varchar("triggered_by", { length: 20 }).notNull().default("manual"), // manual, schedule, seed-script
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    durationMs: integer("duration_ms"),
    resultSummary: jsonb("result_summary").$type<Record<string, unknown>>(),
    error: text("error"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_job_runs_type").on(table.jobType),
    index("idx_job_runs_status").on(table.status),
    index("idx_job_runs_created").on(table.createdAt),
  ],
);

// Job Schedules — cron-like recurring schedules
export const jobSchedules = pgTable(
  "job_schedules",
  {
    id: serial("id").primaryKey(),
    jobType: varchar("job_type", { length: 50 }).notNull(),
    cronExpression: varchar("cron_expression", { length: 100 }).notNull(),
    enabled: boolean("enabled").default(true).notNull(),
    lastRunAt: timestamp("last_run_at", { withTimezone: true }),
    nextRunAt: timestamp("next_run_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_job_schedules_type").on(table.jobType),
    index("idx_job_schedules_next").on(table.nextRunAt),
  ],
);

// Job Queue — persistent smart queue for serializing Ollama-dependent jobs
export const jobQueue = pgTable(
  "job_queue",
  {
    id: serial("id").primaryKey(),
    jobRunId: integer("job_run_id")
      .notNull()
      .references(() => jobRuns.id),
    jobType: varchar("job_type", { length: 50 }).notNull(),
    priority: integer("priority").default(0).notNull(),
    requiresOllama: boolean("requires_ollama").default(false).notNull(),
    status: varchar("status", { length: 20 }).notNull().default("waiting"), // waiting, processing, done
    lockedAt: timestamp("locked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_job_queue_status").on(table.status),
    index("idx_job_queue_run").on(table.jobRunId),
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

// ===============================
// RATE LIMIT TRACKING
// ===============================

// Tracks daily token/request usage per provider:model so rate-limiter
// state survives server restarts. Keyed by (date, provider, model_id).
export const rateLimitDailyUsage = pgTable(
  "rate_limit_daily_usage",
  {
    id: serial("id").primaryKey(),
    date: date("date").defaultNow().notNull(),
    provider: varchar("provider", { length: 32 }).notNull(),
    modelId: varchar("model_id", { length: 128 }).notNull(),
    tokensUsed: integer("tokens_used").notNull().default(0),
    requestsUsed: integer("requests_used").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("idx_rate_limit_date_provider_model").on(
      table.date,
      table.provider,
      table.modelId,
    ),
  ],
);
