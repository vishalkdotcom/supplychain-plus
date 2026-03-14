import { tool } from "ai";
import { z } from "zod";
import { db } from "@/lib/db/drizzle";
import {
  supplierRiskScores,
  alerts,
  surveyAnalysis,
  casePlaybookCache,
} from "@/lib/db/schema";
import { query as pgQuery } from "@/lib/db/postgres";
import { paramQuery as mssqlParamQuery } from "@/lib/db/sql-server";
import { query as mysqlQuery } from "@/lib/db/mysql";
import { desc, eq, gte, and, sql } from "drizzle-orm";
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

    return results.map((r) => ({
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
      limit: { type: mssql.Int, value: limit },
    };

    if (supplierId) {
      conditions.push("co.Id = @supplierId");
      params.supplierId = { type: mssql.Int, value: parseInt(supplierId) };
    }
    if (severity) {
      const priorityMap: Record<string, number> = {
        high: 1,
        medium: 2,
        low: 3,
      };
      conditions.push("c.Priority = @priority");
      params.priority = { type: mssql.Int, value: priorityMap[severity] };
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

    return result.recordset.map(
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

    return result.rows.map(
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

    return results.map((a) => ({
      id: a.id,
      supplier: a.supplierName,
      type: a.alertType,
      severity: a.severity,
      title: a.title,
      message: a.message,
      createdAt: a.createdAt,
    }));
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
