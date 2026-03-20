import { tool } from "ai";
import { z } from "zod";
import { db } from "@/lib/db/drizzle";
import {
  supplierRiskScores,
  supplierRiskHistory,
  alerts,
  surveyAnalysis,
  casePlaybookCache,
  caseClusters,
  workerVoiceTrends,
  payslipAnomalies,
  supplierRiskForecast,
  supplierMonitoringSignals,
  remediationPlans,
} from "@/lib/db/schema";
import { query as pgQuery } from "@/lib/db/postgres";
import { paramQuery as mssqlParamQuery } from "@/lib/db/sql-server";
import { query as mysqlQuery } from "@/lib/db/mysql";
import { desc, eq, gte, and, sql, isNull } from "drizzle-orm";
import mssql from "mssql";

// ===============================
// Read Tools
// ===============================

export const querySupplierRisk = tool({
  description:
    "Get supplier risk scores sorted by risk level. Use when the user asks about high-risk suppliers, risk overview, supplier rankings, or which factories need attention.",
  inputSchema: z.object({
    limit: z.number().default(10).describe("Number of suppliers to return"),
    minRiskScore: z
      .number()
      .optional()
      .describe("Minimum risk score filter (0-100)"),
  }),
  execute: async ({ limit, minRiskScore }) => {
    const conditions = minRiskScore
      ? [gte(supplierRiskScores.riskScore, minRiskScore)]
      : [];

    const results = await db
      .select()
      .from(supplierRiskScores)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(supplierRiskScores.riskScore))
      .limit(limit);

    const suppliers = results.map((r) => ({
      supplierId: r.supplierId,
      name: r.supplierName,
      riskScore: r.riskScore,
      caseScore: r.caseScore,
      surveyScore: r.surveyScore,
      trainingScore: r.trainingScore,
      engagementScore: r.engagementScore,
      topReasons:
        (r.reasons as Array<{ factor: string; description: string }>)?.slice(
          0,
          2,
        ) || [],
    }));

    return {
      _card: {
        type: "chart" as const,
        title: "Supplier Risk Scores",
        chartType: "bar" as const,
        data: results.map((r) => ({
          name: r.supplierName || r.supplierId,
          value: r.riskScore,
          color:
            r.riskScore >= 70
              ? "#ef4444"
              : r.riskScore >= 50
                ? "#f59e0b"
                : "#22c55e",
        })),
        columns: [
          { key: "name", label: "Supplier" },
          { key: "riskScore", label: "Risk", format: "score" },
          { key: "caseScore", label: "Cases" },
          { key: "surveyScore", label: "Survey" },
          { key: "trainingScore", label: "Training" },
        ],
      },
      suppliers,
    };
  },
});

export const queryCases = tool({
  description:
    "Search worker grievance cases from the Connect module. Use when the user asks about cases, complaints, issues, grievances, or problems at a supplier.",
  inputSchema: z.object({
    supplierId: z.string().optional().describe("Filter by supplier company ID"),
    severity: z
      .enum(["high", "medium", "low"])
      .optional()
      .describe("Filter by severity"),
    limit: z.number().default(10).describe("Number of cases to return"),
  }),
  execute: async ({ supplierId, severity, limit }) => {
    const conditions: string[] = ["c.Deleted = 0"];
    const params: Record<
      string,
      { type: (() => mssql.ISqlType) | mssql.ISqlType; value: unknown }
    > = {
      limit: { type: mssql.Int(), value: limit },
    };

    if (supplierId) {
      conditions.push("co.Id = @supplierId");
      params.supplierId = { type: mssql.Int(), value: parseInt(supplierId) };
    }
    if (severity) {
      const priorityMap: Record<string, number> = {
        high: 1,
        medium: 2,
        low: 3,
      };
      conditions.push("c.Priority = @priority");
      params.priority = { type: mssql.Int(), value: priorityMap[severity] };
    }

    const whereClause = "WHERE " + conditions.join(" AND ");

    const result = await mssqlParamQuery(
      `SELECT TOP (@limit)
        c.Id, c.Name as Title, c.Created, c.Priority,
        co.Name as CompanyName,
        csct.Name as StatusName,
        ctct.Name as TypeName,
        (SELECT TOP 1 MessageText FROM Message WHERE CaseId = c.Id ORDER BY Created ASC) as FirstMessage
      FROM [Case] c
      LEFT JOIN Company co ON c.CompanyId = co.Id
      LEFT JOIN CaseStatusCultureText csct ON c.CaseStatusId = csct.CaseStatusId AND csct.CultureCodeId = 1
      LEFT JOIN CaseTypeCultureText ctct ON c.CaseTypeId = ctct.CaseTypeId AND ctct.CultureCodeId = 1
      ${whereClause}
      ORDER BY c.Created DESC`,
      params,
    );

    const items = result.recordset.map(
      (row: {
        Id: number;
        Title: string;
        CompanyName: string;
        TypeName: string;
        Priority: number;
        StatusName: string;
        Created: string;
        FirstMessage: string;
      }) => ({
        id: row.Id,
        title: row.Title,
        company: row.CompanyName,
        type: row.TypeName || "General",
        severity:
          row.Priority === 1 ? "high" : row.Priority === 2 ? "medium" : "low",
        status: row.StatusName,
        created: row.Created,
        summary: row.FirstMessage?.substring(0, 200) || "No content",
      }),
    );

    return {
      _card: {
        type: "table" as const,
        title: "Grievance Cases",
        columns: [
          { key: "id", label: "ID" },
          { key: "company", label: "Supplier" },
          { key: "type", label: "Type" },
          { key: "severity", label: "Severity", format: "badge" },
          { key: "status", label: "Status" },
        ],
      },
      items,
    };
  },
});

export const querySurveys = tool({
  description:
    "Get survey data and analysis from the Engage module. Use when the user asks about surveys, worker sentiment, engagement, or satisfaction.",
  inputSchema: z.object({
    supplierId: z.string().optional().describe("Filter by supplier client_key"),
    status: z.enum(["active", "closed", "draft"]).optional(),
    limit: z.number().default(10),
  }),
  execute: async ({ supplierId, status, limit }) => {
    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (supplierId) {
      conditions.push(`c.client_key = $${paramIndex++}`);
      params.push(String(parseInt(supplierId)));
    }
    if (status) {
      const statusMap: Record<string, number> = {
        active: 1,
        closed: 2,
        draft: 0,
      };
      conditions.push(`s.status = $${paramIndex++}`);
      params.push(statusMap[status]);
    }

    const whereClause =
      conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";

    params.push(limit); // always the last param
    const limitParam = `$${paramIndex}`;

    const result = await pgQuery(
      `SELECT s.id, s.name, s.status, s.from_date, s.to_date,
              c.name as client_name, c.client_key
       FROM survey_mdlsurvey s
       LEFT JOIN clients_clientinfo c ON s.client_id = c.id
       ${whereClause}
       ORDER BY s.created_date DESC
       LIMIT ${limitParam}`,
      params,
    );

    // Enrich with analysis data from Drizzle
    const surveyIds = result.rows.map((r: { id: number }) => String(r.id));
    const analyses =
      surveyIds.length > 0
        ? await db
            .select()
            .from(surveyAnalysis)
            .where(sql`${surveyAnalysis.surveyId} = ANY(${surveyIds}::text[])`)
        : [];

    const analysisMap = new Map(analyses.map((a) => [a.surveyId, a]));

    const items = result.rows.map(
      (row: {
        id: number;
        name: string;
        client_name: string;
        status: number;
      }) => {
        const analysis = analysisMap.get(String(row.id));
        return {
          id: row.id,
          title: row.name,
          supplier: row.client_name,
          status:
            row.status === 1 ? "active" : row.status === 2 ? "closed" : "draft",
          responseCount: analysis?.responseCount || 0,
          themes: analysis?.themes || [],
          insight: analysis?.aiInsight || "No analysis available yet",
          riskScore: analysis?.riskScore || 0,
        };
      },
    );

    return {
      _card: {
        type: "table" as const,
        title: "Survey Analysis",
        columns: [
          { key: "title", label: "Survey" },
          { key: "supplier", label: "Supplier" },
          { key: "responseCount", label: "Responses" },
          { key: "riskScore", label: "Risk", format: "score" },
          { key: "status", label: "Status" },
        ],
      },
      items,
    };
  },
});

export const queryTrainingCompletion = tool({
  description:
    "Get training completion data from the Educate module. Use when the user asks about training progress, course completion, or education metrics.",
  inputSchema: z.object({
    limit: z.number().default(10),
  }),
  execute: async ({ limit }) => {
    const result = (await mysqlQuery(
      `SELECT 
        c.id, c.fullname,
        (SELECT COUNT(*) FROM mdl_user_enrolments ue 
         JOIN mdl_enrol e ON ue.enrolid = e.id 
         WHERE e.courseid = c.id) as enrolled,
        (SELECT COUNT(*) FROM mdl_course_completions cc 
         WHERE cc.course = c.id AND cc.timecompleted IS NOT NULL) as completed
      FROM mdl_course c
      WHERE c.id > 1
      ORDER BY c.timecreated DESC
      LIMIT ?`,
      [limit],
    )) as Array<{
      id: number;
      fullname: string;
      enrolled: number;
      completed: number;
    }>;

    return result.map((row) => ({
      courseId: row.id,
      courseName: row.fullname,
      enrolled: row.enrolled || 0,
      completed: row.completed || 0,
      completionRate:
        row.enrolled > 0 ? Math.round((row.completed / row.enrolled) * 100) : 0,
    }));
  },
});

export const getAlerts = tool({
  description:
    "Get current alerts and notifications. Use when the user asks about alerts, warnings, or notifications.",
  inputSchema: z.object({
    unreadOnly: z.boolean().default(true),
    limit: z.number().default(10),
  }),
  execute: async ({ unreadOnly, limit }) => {
    const conditions = unreadOnly ? [eq(alerts.isRead, false)] : [];

    const results = await db
      .select()
      .from(alerts)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(alerts.createdAt))
      .limit(limit);

    const items = results.map((a) => ({
      id: a.id,
      supplier: a.supplierName,
      type: a.alertType,
      severity: a.severity,
      title: a.title,
      message: a.message,
      createdAt: a.createdAt,
    }));

    return {
      _card: {
        type: "table" as const,
        title: "Active Alerts",
        columns: [
          { key: "supplier", label: "Supplier" },
          { key: "type", label: "Alert Type" },
          { key: "severity", label: "Severity", format: "badge" },
          { key: "title", label: "Title" },
        ],
      },
      items,
    };
  },
});

// ===============================
// Write Tools (agent can mutate data)
// ===============================

export const markAlertRead = tool({
  description:
    "Mark an alert as read. Use when the user says they've seen an alert or asks to dismiss it.",
  inputSchema: z.object({
    alertId: z.number().describe("ID of the alert to mark as read"),
  }),
  execute: async ({ alertId }) => {
    await db.update(alerts).set({ isRead: true }).where(eq(alerts.id, alertId));

    return { success: true, message: `Alert ${alertId} marked as read.` };
  },
});

export const queryPlaybook = tool({
  description:
    "Get historical resolution patterns for a case type and region. Use when the user asks about best practices, how cases were resolved before, average resolution times, or resolution strategies.",
  inputSchema: z.object({
    caseTypeId: z
      .string()
      .optional()
      .describe("Case type ID to look up playbook for"),
    region: z
      .string()
      .optional()
      .describe("Region to filter by (e.g. Southeast Asia, South Asia)"),
  }),
  execute: async ({ caseTypeId, region }) => {
    const conditions = [];
    if (caseTypeId) {
      conditions.push(eq(casePlaybookCache.caseTypeId, caseTypeId));
    }
    if (region) {
      conditions.push(eq(casePlaybookCache.region, region));
    }

    const results = await db
      .select()
      .from(casePlaybookCache)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(casePlaybookCache.totalResolved))
      .limit(5);

    if (results.length === 0) {
      return {
        found: false,
        message: "No playbook data available yet. Run the playbook generation job first.",
      };
    }

    return results.map((r) => ({
      caseType: r.caseTypeName,
      region: r.region,
      avgResolutionDays: r.avgResolutionDays,
      bestResolutionDays: r.bestResolutionDays,
      totalResolved: r.totalResolved,
      bestPractices: r.bestPractices,
      aiSummary: r.aiSummary,
    }));
  },
});

export const triggerRiskRecalculation = tool({
  description:
    "Trigger a recalculation of supplier risk scores. Use when the user asks to refresh or recalculate risk scores.",
  inputSchema: z.object({
    supplierId: z
      .string()
      .optional()
      .describe("Specific supplier to recalculate, or omit for all"),
  }),
  execute: async ({ supplierId }) => {
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3030";
      const res = await fetch(`${baseUrl}/api/jobs/calculate-risk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supplierId }),
      });
      const data = (await res.json()) as { count?: number };
      return {
        _card: {
          type: "action" as const,
          title: "Risk Recalculation",
          actions: [
            {
              label: "View Updated Scores",
              query: "Show me the updated risk scores",
            },
          ],
        },
        success: true,
        message: supplierId
          ? `Risk scores recalculated for supplier ${supplierId}.`
          : `Risk scores recalculated for ${data.count || "all"} suppliers.`,
      };
    } catch {
      return {
        success: false,
        message: "Failed to trigger risk recalculation.",
      };
    }
  },
});

// ===============================
// ML Output Tools (Pipeline Data)
// ===============================

export const queryClusters = tool({
  description:
    "Get systemic case patterns detected by clustering analysis. Use when the user asks about patterns, clusters, systemic issues, or recurring problems across suppliers.",
  inputSchema: z.object({
    severity: z
      .enum(["critical", "warning", "info"])
      .optional()
      .describe("Filter by severity level"),
    limit: z.number().default(10).describe("Number of clusters to return"),
  }),
  execute: async ({ severity, limit }) => {
    const conditions = severity
      ? [eq(caseClusters.severity, severity)]
      : [];

    const results = await db
      .select()
      .from(caseClusters)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(caseClusters.caseCount))
      .limit(limit);

    const items = results.map((r) => ({
      id: r.id,
      label: r.clusterLabel,
      severity: r.severity,
      caseCount: r.caseCount,
      supplierCount: r.supplierCount,
      regions: (r.regions as string[])?.join(", ") || "",
      summary: r.aiSummary?.substring(0, 200) || "",
    }));

    return {
      _card: {
        type: "table" as const,
        title: "Systemic Case Patterns",
        columns: [
          { key: "label", label: "Pattern" },
          { key: "severity", label: "Severity", format: "badge" },
          { key: "caseCount", label: "Cases" },
          { key: "supplierCount", label: "Suppliers" },
          { key: "regions", label: "Regions" },
        ],
      },
      items,
    };
  },
});

export const queryVoiceTrends = tool({
  description:
    "Get worker voice trends and sentiment analysis over time. Use when the user asks about what workers are talking about, sentiment trends, emerging topics, or worker voice.",
  inputSchema: z.object({
    supplierId: z
      .string()
      .optional()
      .describe("Filter by supplier ID, or omit for global trends"),
    limit: z.number().default(5).describe("Number of months to return"),
  }),
  execute: async ({ supplierId, limit }) => {
    const conditions = supplierId
      ? [eq(workerVoiceTrends.supplierId, supplierId)]
      : [isNull(workerVoiceTrends.supplierId)];

    const results = await db
      .select()
      .from(workerVoiceTrends)
      .where(and(...conditions))
      .orderBy(desc(workerVoiceTrends.month))
      .limit(limit);

    type VoiceTopic = { name: string; mentions: number; sentiment: string };

    const items = results.map((r) => {
      const themes = (r.topThemes as VoiceTopic[]) || [];
      return {
        month: r.month,
        sentimentShift: r.sentimentShift,
        topThemes: themes
          .slice(0, 3)
          .map((t) => `${t.name} (${t.sentiment}, ${t.mentions} mentions)`)
          .join("; "),
        emergingCount: (r.emergingTopics as VoiceTopic[])?.length || 0,
        decliningCount: (r.decliningTopics as VoiceTopic[])?.length || 0,
      };
    });

    return {
      _card: {
        type: "table" as const,
        title: supplierId
          ? `Voice Trends — Supplier ${supplierId}`
          : "Global Voice Trends",
        columns: [
          { key: "month", label: "Month" },
          { key: "topThemes", label: "Top Themes" },
          { key: "sentimentShift", label: "Sentiment Δ" },
          { key: "emergingCount", label: "Emerging" },
          { key: "decliningCount", label: "Declining" },
        ],
      },
      items,
    };
  },
});

export const queryAnomalies = tool({
  description:
    "Get payslip anomalies and wage issues detected across suppliers. Use when the user asks about wage problems, payslip issues, minimum wage violations, salary anomalies, or payment irregularities.",
  inputSchema: z.object({
    supplierId: z
      .string()
      .optional()
      .describe("Filter by supplier ID"),
    severity: z
      .enum(["critical", "warning", "info"])
      .optional()
      .describe("Filter by severity"),
    unresolvedOnly: z
      .boolean()
      .default(true)
      .describe("Only show unresolved anomalies"),
    limit: z.number().default(10),
  }),
  execute: async ({ supplierId, severity, unresolvedOnly, limit }) => {
    const conditions = [];
    if (supplierId) conditions.push(eq(payslipAnomalies.supplierId, supplierId));
    if (severity) conditions.push(eq(payslipAnomalies.severity, severity));
    if (unresolvedOnly) conditions.push(eq(payslipAnomalies.isResolved, false));

    const results = await db
      .select()
      .from(payslipAnomalies)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(payslipAnomalies.detectedAt))
      .limit(limit);

    type AnomalyDetails = {
      expected?: number;
      actual?: number;
      currency?: string;
      country?: string;
      employeeCount?: number;
    };

    const items = results.map((r) => {
      const details = (r.details as AnomalyDetails) || {};
      return {
        id: r.id,
        supplier: r.supplierName,
        type: r.anomalyType,
        severity: r.severity,
        country: details.country || "",
        currency: details.currency || "",
        expected: details.expected,
        actual: details.actual,
        affected: details.employeeCount || 0,
        interpretation:
          r.aiInterpretation?.substring(0, 150) || "",
        detectedAt: r.detectedAt,
      };
    });

    return {
      _card: {
        type: "table" as const,
        title: "Payslip Anomalies",
        columns: [
          { key: "supplier", label: "Supplier" },
          { key: "type", label: "Type" },
          { key: "severity", label: "Severity", format: "badge" },
          { key: "country", label: "Country" },
          { key: "affected", label: "Workers" },
        ],
      },
      items,
    };
  },
});

export const queryForecasts = tool({
  description:
    "Get 60-day risk forecasts for suppliers. Use when the user asks about predictions, forecasts, future risk, which suppliers are getting worse, or risk outlook.",
  inputSchema: z.object({
    supplierId: z
      .string()
      .optional()
      .describe("Filter by supplier ID"),
    trendDirection: z
      .enum(["rising", "falling", "stable"])
      .optional()
      .describe("Filter by trend direction"),
    limit: z.number().default(10),
  }),
  execute: async ({ supplierId, trendDirection, limit }) => {
    const conditions = [];
    if (supplierId)
      conditions.push(eq(supplierRiskForecast.supplierId, supplierId));
    if (trendDirection)
      conditions.push(eq(supplierRiskForecast.trendDirection, trendDirection));

    const results = await db
      .select()
      .from(supplierRiskForecast)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(supplierRiskForecast.predictedRiskScore))
      .limit(limit);

    const items = results.map((r) => ({
      supplierId: r.supplierId,
      forecastDate: r.forecastDate,
      predictedRisk: r.predictedRiskScore,
      trend: r.trendDirection,
      confidence: r.confidence
        ? `${Math.round(r.confidence * 100)}%`
        : "N/A",
      reasoning: r.aiReasoning?.substring(0, 150) || "",
    }));

    return {
      _card: {
        type: "chart" as const,
        title: "Risk Forecasts (60-Day)",
        chartType: "bar" as const,
        data: results.map((r) => ({
          name: r.supplierId || "Unknown",
          value: r.predictedRiskScore || 0,
          color:
            (r.predictedRiskScore || 0) >= 70
              ? "#ef4444"
              : (r.predictedRiskScore || 0) >= 50
                ? "#f59e0b"
                : "#22c55e",
        })),
        columns: [
          { key: "supplierId", label: "Supplier" },
          { key: "predictedRisk", label: "Predicted Risk", format: "score" },
          { key: "trend", label: "Trend" },
          { key: "confidence", label: "Confidence" },
        ],
      },
      items,
    };
  },
});

export const queryMonitoringSignals = tool({
  description:
    "Get supplier monitoring signals like silence detection, engagement decay, and regional contagion. Use when the user asks about silent suppliers, disengaged suppliers, warning signals, or who needs attention.",
  inputSchema: z.object({
    signalType: z
      .enum(["silence", "engagement_decay", "regional_contagion"])
      .optional()
      .describe("Filter by signal type"),
    severity: z
      .enum(["critical", "warning", "info"])
      .optional()
      .describe("Filter by severity"),
    activeOnly: z
      .boolean()
      .default(true)
      .describe("Only show unresolved signals"),
    limit: z.number().default(10),
  }),
  execute: async ({ signalType, severity, activeOnly, limit }) => {
    const conditions = [];
    if (signalType)
      conditions.push(eq(supplierMonitoringSignals.signalType, signalType));
    if (severity)
      conditions.push(eq(supplierMonitoringSignals.severity, severity));
    if (activeOnly)
      conditions.push(isNull(supplierMonitoringSignals.resolvedAt));

    const results = await db
      .select()
      .from(supplierMonitoringSignals)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(supplierMonitoringSignals.detectedAt))
      .limit(limit);

    const items = results.map((r) => ({
      id: r.id,
      supplierId: r.supplierId,
      signalType: r.signalType,
      severity: r.severity,
      title: r.title,
      description: r.description?.substring(0, 150) || "",
      detectedAt: r.detectedAt,
    }));

    return {
      _card: {
        type: "table" as const,
        title: "Monitoring Signals",
        columns: [
          { key: "supplierId", label: "Supplier" },
          { key: "signalType", label: "Signal" },
          { key: "severity", label: "Severity", format: "badge" },
          { key: "title", label: "Title" },
          { key: "detectedAt", label: "Detected" },
        ],
      },
      items,
    };
  },
});

export const queryRemediations = tool({
  description:
    "Get remediation plans and their status. Use when the user asks about remediation progress, action plans, what's being fixed, or compliance follow-ups.",
  inputSchema: z.object({
    status: z
      .enum([
        "detected",
        "root_cause",
        "action_plan",
        "implementing",
        "verifying",
        "closed",
      ])
      .optional()
      .describe("Filter by remediation status"),
    supplierId: z
      .string()
      .optional()
      .describe("Filter by supplier ID"),
    limit: z.number().default(10),
  }),
  execute: async ({ status, supplierId, limit }) => {
    const conditions = [];
    if (status) conditions.push(eq(remediationPlans.status, status));
    if (supplierId)
      conditions.push(eq(remediationPlans.supplierId, supplierId));

    const results = await db
      .select()
      .from(remediationPlans)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(remediationPlans.createdAt))
      .limit(limit);

    const items = results.map((r) => ({
      id: r.id,
      title: r.title,
      supplierId: r.supplierId,
      status: r.status,
      sourceType: r.sourceType,
      rootCause: r.rootCause?.substring(0, 100) || "",
      targetDate: r.targetDate,
      createdAt: r.createdAt,
    }));

    return {
      _card: {
        type: "table" as const,
        title: "Remediation Plans",
        columns: [
          { key: "title", label: "Plan" },
          { key: "supplierId", label: "Supplier" },
          { key: "status", label: "Status", format: "badge" },
          { key: "sourceType", label: "Source" },
          { key: "targetDate", label: "Target Date" },
        ],
      },
      items,
    };
  },
});

export const queryRiskHistory = tool({
  description:
    "Get historical risk score trend for a specific supplier. Use when the user asks about how a supplier's risk has changed over time, risk trends, or score history.",
  inputSchema: z.object({
    supplierId: z
      .string()
      .describe("Supplier ID to get history for (required)"),
    days: z
      .number()
      .default(30)
      .describe("Number of days of history to return"),
  }),
  execute: async ({ supplierId, days }) => {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const results = await db
      .select()
      .from(supplierRiskHistory)
      .where(
        and(
          eq(supplierRiskHistory.supplierId, supplierId),
          gte(supplierRiskHistory.snapshotDate, since.toISOString().split("T")[0]),
        ),
      )
      .orderBy(supplierRiskHistory.snapshotDate);

    const items = results.map((r) => ({
      date: r.snapshotDate,
      riskScore: r.riskScore,
      caseScore: r.caseScore,
      surveyScore: r.surveyScore,
      trainingScore: r.trainingScore,
      engagementScore: r.engagementScore,
    }));

    return {
      _card: {
        type: "chart" as const,
        title: `Risk History — Supplier ${supplierId}`,
        chartType: "bar" as const,
        data: results.map((r) => ({
          name: String(r.snapshotDate),
          value: r.riskScore ?? 0,
          color:
            (r.riskScore ?? 0) >= 70
              ? "#ef4444"
              : (r.riskScore ?? 0) >= 50
                ? "#f59e0b"
                : "#22c55e",
        })),
        columns: [
          { key: "date", label: "Date" },
          { key: "riskScore", label: "Risk", format: "score" },
          { key: "caseScore", label: "Cases" },
          { key: "surveyScore", label: "Survey" },
          { key: "trainingScore", label: "Training" },
        ],
      },
      items,
    };
  },
});
