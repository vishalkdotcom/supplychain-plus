import { cacheLife, cacheTag } from "next/cache";
import { query as pgQuery } from "@/lib/db/postgres";
import { wcGlobalQuery } from "@/lib/db/postgres-wc-global";
import {
  query as sqlQuery,
  paramQuery as sqlParamQuery,
} from "@/lib/db/sql-server";
import mssql from "mssql";
import { query as mysqlQuery } from "@/lib/db/mysql";
import { db } from "@/lib/db/drizzle";
import {
  supplierRiskScores as supplierRiskScoresSchema,
  supplierRiskForecast,
  intelligenceBriefing,
  caseSummaryCache,
} from "@/lib/db/schema";
import { sql, eq, asc, desc, inArray } from "drizzle-orm";
import { getMetricsBriefing } from "@/lib/services/metrics-briefing";
import { getLastActivityDates } from "@/lib/last-activity";
import { deriveRegion } from "@/lib/risk-utils";
import { extractEnglishFromMlang } from "@/lib/mlang";
import { mapCaseStatus } from "@/lib/case-utils";
import { logger } from "@/lib/logger";
import { isDemoMode } from "@/lib/demo-mode/profile";
import { TAGS, forecastTag } from "./tags";
import type {
  DashboardMetrics,
  Supplier,
  PaginatedResponse,
  Case,
  AIGuidance,
  RiskReason,
} from "@/types";

// ---------------------------------------------------------------------------
// Metrics
// ---------------------------------------------------------------------------

async function getDerivedOnlyMetrics(
  parentCompanyId: string,
): Promise<DashboardMetrics> {
  const parentFilter = parentCompanyId
    ? sql`AND parent_company_id = ${parentCompanyId}`
    : sql``;

  const brandExclusion = sql`supplier_id NOT IN (
    SELECT DISTINCT parent_company_id
    FROM supplier_risk_scores
    WHERE parent_company_id IS NOT NULL
  )`;

  const [totalRes, highRiskRes, trendRes] = await Promise.all([
    db.execute(
      sql`SELECT COUNT(*) as count FROM supplier_risk_scores
          WHERE ${brandExclusion} ${parentFilter}`,
    ),
    db.execute(
      sql`SELECT COUNT(*) as count FROM supplier_risk_scores
          WHERE risk_score > 70 AND ${brandExclusion} ${parentFilter}`,
    ),
    db.execute(sql`
      WITH latest AS (
        SELECT DISTINCT ON (supplier_id) supplier_id, risk_score, snapshot_date
        FROM supplier_risk_history
        ORDER BY supplier_id, snapshot_date DESC
      ),
      previous AS (
        SELECT DISTINCT ON (supplier_id) supplier_id, risk_score, snapshot_date
        FROM supplier_risk_history
        WHERE snapshot_date < (SELECT MAX(snapshot_date) FROM supplier_risk_history)
        ORDER BY supplier_id, snapshot_date DESC
      )
      SELECT
        SUM(CASE WHEN l.risk_score < p.risk_score THEN 1 ELSE 0 END) as improving,
        SUM(CASE WHEN l.risk_score > p.risk_score THEN 1 ELSE 0 END) as worsening
      FROM latest l
      JOIN previous p ON l.supplier_id = p.supplier_id
    `).catch(() => [{ improving: 0, worsening: 0 }]),
  ]);

  return {
    totalSuppliers: parseInt(String(totalRes[0]?.count ?? 0)),
    highRiskSuppliers: parseInt(String(highRiskRes[0]?.count ?? 0)),
    activeCases: 0,
    pendingSurveys: 0,
    trainingCompletion: 0,
    trendsImproving: parseInt(String(trendRes[0]?.improving ?? 0)),
    trendsWorsening: parseInt(String(trendRes[0]?.worsening ?? 0)),
  };
}

export async function getCachedMetrics(
  parentCompanyId: string,
): Promise<DashboardMetrics> {
  "use cache";
  cacheTag(TAGS.metrics);
  cacheLife({ stale: 300, revalidate: 600, expire: 3600 });

  if (isDemoMode()) {
    return getDerivedOnlyMetrics(parentCompanyId);
  }

  // If filtering by brand, get the list of supplier IDs first
  let brandSupplierIds: string[] | null = null;
  if (parentCompanyId) {
    const brandSuppliers = await db
      .select({ supplierId: supplierRiskScoresSchema.supplierId })
      .from(supplierRiskScoresSchema)
      .where(eq(supplierRiskScoresSchema.parentCompanyId, parentCompanyId));
    brandSupplierIds = brandSuppliers.map(
      (s: { supplierId: string }) => s.supplierId,
    );
    if (brandSupplierIds.length === 0) {
      return {
        totalSuppliers: 0,
        highRiskSuppliers: 0,
        activeCases: 0,
        pendingSurveys: 0,
        trainingCompletion: 0,
        trendsImproving: 0,
        trendsWorsening: 0,
      };
    }
  }

  // Run all 6 independent queries in parallel across 4 databases
  const [
    totalSuppliers,
    highRiskSuppliers,
    activeCases,
    pendingSurveys,
    trainingCompletion,
    { trendsImproving, trendsWorsening },
  ] = await Promise.all([
    // 1. Supplier count from Postgres
    (async () => {
      if (brandSupplierIds) {
        const pgRes = await pgQuery(
          `SELECT COUNT(*) as count FROM clients_clientinfo WHERE is_deleted = false AND client_key = ANY($1)`,
          [brandSupplierIds.map(Number)],
        );
        return parseInt(pgRes.rows[0].count);
      }
      const pgRes = await pgQuery(
        `SELECT COUNT(*) as count FROM clients_clientinfo WHERE is_deleted = false`,
      );
      return parseInt(pgRes.rows[0].count);
    })(),

    // 2. High risk count from Drizzle (wovo_ai)
    (async () => {
      try {
        if (brandSupplierIds) {
          const riskRes = await db.execute(
            sql`SELECT COUNT(*) as count FROM supplier_risk_scores WHERE risk_score > 70 AND parent_company_id = ${parentCompanyId}`,
          );
          return parseInt(String(riskRes[0]?.count ?? 0));
        }
        const riskRes = await db.execute(
          sql`SELECT COUNT(*) as count FROM supplier_risk_scores WHERE risk_score > 70`,
        );
        return parseInt(String(riskRes[0]?.count ?? 0));
      } catch (e) {
        logger.warn("cache/metrics", "Risk scores table not populated", e);
        return 0;
      }
    })(),

    // 3. Active cases from SQL Server
    (async () => {
      if (brandSupplierIds) {
        const caseParams: Record<
          string,
          { type: () => mssql.ISqlType; value: unknown }
        > = {};
        const casePlaceholders = brandSupplierIds.map((id, i) => {
          caseParams[`cid${i}`] = { type: mssql.Int, value: Number(id) };
          return `@cid${i}`;
        });
        const sqlRes = await sqlParamQuery(
          `SELECT COUNT(*) as count FROM [Case] WHERE Deleted = 0 AND CaseStatusId IN (1, 2) AND CompanyId IN (${casePlaceholders.join(", ")})`,
          caseParams,
        );
        return sqlRes.recordset[0].count as number;
      }
      const sqlRes = await sqlQuery(
        `SELECT COUNT(*) as count FROM [Case] WHERE Deleted = 0 AND CaseStatusId IN (1, 2)`,
      );
      return sqlRes.recordset[0].count as number;
    })(),

    // 4. Active surveys from Postgres
    (async () => {
      if (brandSupplierIds) {
        const surveyRes = await pgQuery(
          `SELECT COUNT(*) as count FROM survey_mdlsurvey WHERE status = 1 AND client_id = ANY($1)`,
          [brandSupplierIds.map(Number)],
        );
        return parseInt(surveyRes.rows[0].count);
      }
      const surveyRes = await pgQuery(
        `SELECT COUNT(*) as count FROM survey_mdlsurvey WHERE status = 1`,
      );
      return parseInt(surveyRes.rows[0].count);
    })(),

    // 5. Training completion from MySQL
    (async () => {
      try {
        const trainingRes = (await mysqlQuery(`
          SELECT
            (SELECT COUNT(*) FROM mdl_user_enrolments) as total_enrolled,
            (SELECT COUNT(*) FROM mdl_course_completions WHERE timecompleted IS NOT NULL) as total_completed
        `)) as Array<{ total_enrolled: number; total_completed: number }>;
        const enrolled = trainingRes[0]?.total_enrolled || 0;
        const completed = trainingRes[0]?.total_completed || 0;
        return enrolled > 0 ? Math.round((completed / enrolled) * 100) : 0;
      } catch (e) {
        logger.warn("cache/metrics", "MySQL unavailable for training data", e);
        return 0;
      }
    })(),

    // 6. Risk trends from Drizzle (wovo_ai)
    (async () => {
      try {
        const trendRes = await db.execute(sql`
          WITH latest AS (
            SELECT DISTINCT ON (supplier_id) supplier_id, risk_score, snapshot_date
            FROM supplier_risk_history
            ORDER BY supplier_id, snapshot_date DESC
          ),
          previous AS (
            SELECT DISTINCT ON (supplier_id) supplier_id, risk_score, snapshot_date
            FROM supplier_risk_history
            WHERE snapshot_date < (SELECT MAX(snapshot_date) FROM supplier_risk_history)
            ORDER BY supplier_id, snapshot_date DESC
          )
          SELECT
            SUM(CASE WHEN l.risk_score < p.risk_score THEN 1 ELSE 0 END) as improving,
            SUM(CASE WHEN l.risk_score > p.risk_score THEN 1 ELSE 0 END) as worsening
          FROM latest l
          JOIN previous p ON l.supplier_id = p.supplier_id
        `);
        return {
          trendsImproving: parseInt(String(trendRes[0]?.improving ?? 0)),
          trendsWorsening: parseInt(String(trendRes[0]?.worsening ?? 0)),
        };
      } catch (e) {
        logger.warn("cache/metrics", "Risk history not populated", e);
        return { trendsImproving: 0, trendsWorsening: 0 };
      }
    })(),
  ]);

  return {
    totalSuppliers,
    highRiskSuppliers,
    activeCases,
    pendingSurveys,
    trainingCompletion,
    trendsImproving,
    trendsWorsening,
  };
}

// ---------------------------------------------------------------------------
// Suppliers
// ---------------------------------------------------------------------------

interface ClientRow {
  id: number;
  client_key: number;
  name: string;
  country: string | null;
  is_active: boolean;
}

interface MergedRow extends ClientRow {
  risk_score: number;
  case_score: number;
  survey_score: number;
  training_score: number;
  engagement_score: number;
  reasons: RiskReason[];
  cached_region: string | null;
  latitude: number | null;
  longitude: number | null;
  parent_company_id: string | null;
}

async function getDerivedOnlySuppliers(
  page: number,
  perPage: number,
  search: string,
  riskLevel: string,
  region: string,
  parentCompanyId: string,
): Promise<PaginatedResponse<Supplier>> {
  const offset = (page - 1) * perPage;

  const result = await db.execute(sql`
    SELECT
      supplier_id,
      supplier_name,
      risk_score,
      case_score,
      survey_score,
      training_score,
      engagement_score,
      reasons,
      country,
      region,
      latitude,
      longitude,
      parent_company_id
    FROM supplier_risk_scores
    WHERE supplier_id NOT IN (
      SELECT DISTINCT parent_company_id
      FROM supplier_risk_scores
      WHERE parent_company_id IS NOT NULL
    )
  `);

  type DerivedSupplierRow = {
    supplier_id: string;
    supplier_name: string | null;
    risk_score: number;
    case_score: number | null;
    survey_score: number | null;
    training_score: number | null;
    engagement_score: number | null;
    reasons: RiskReason[] | null;
    country: string | null;
    region: string | null;
    latitude: number | null;
    longitude: number | null;
    parent_company_id: string | null;
  };

  let filtered = (Array.isArray(result) ? result : []) as DerivedSupplierRow[];

  if (parentCompanyId) {
    filtered = filtered.filter((r) => r.parent_company_id === parentCompanyId);
  }

  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter((r) =>
      (r.supplier_name || "").toLowerCase().includes(searchLower),
    );
  }

  if (riskLevel !== "all") {
    filtered = filtered.filter((r) => {
      const score = Number(r.risk_score);
      if (riskLevel === "high") return score > 70;
      if (riskLevel === "medium") return score > 30 && score <= 70;
      if (riskLevel === "low") return score <= 30;
      return true;
    });
  }

  if (region !== "all") {
    filtered = filtered.filter((r) => {
      const supplierRegion = r.region || deriveRegion(r.country || "");
      return supplierRegion === region;
    });
  }

  filtered.sort((a, b) => Number(b.risk_score) - Number(a.risk_score));

  const total = filtered.length;
  const paginatedRows = filtered.slice(offset, offset + perPage);

  const suppliers: Supplier[] = paginatedRows.map((row) => ({
    id: String(row.supplier_id),
    name: row.supplier_name || `Supplier ${row.supplier_id}`,
    region: row.region || deriveRegion(row.country || ""),
    country: row.country || "Unknown",
    location: row.country || "Unknown",
    workerCount: 0,
    contactName: "N/A",
    contactEmail: "N/A",
    riskScore: Number(row.risk_score),
    riskLevel:
      Number(row.risk_score) > 70
        ? "high"
        : Number(row.risk_score) > 30
          ? "medium"
          : "low",
    status: "active",
    lastActivityDate: new Date().toISOString().split("T")[0],
    riskBreakdown: {
      caseScore: row.case_score ?? 0,
      surveyScore: row.survey_score ?? 0,
      trainingScore: row.training_score ?? 0,
      engagementScore: row.engagement_score ?? 0,
      reasons: row.reasons ?? [],
    },
    ...(row.latitude != null && { latitude: row.latitude }),
    ...(row.longitude != null && { longitude: row.longitude }),
    ...(row.parent_company_id && { parentCompanyId: row.parent_company_id }),
  }));

  return {
    data: suppliers,
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

export async function getCachedSuppliers(
  page: number,
  perPage: number,
  search: string,
  riskLevel: string,
  region: string,
  parentCompanyId: string,
): Promise<PaginatedResponse<Supplier>> {
  "use cache";
  cacheTag(TAGS.suppliers);
  cacheLife({ stale: 300, revalidate: 600, expire: 3600 });

  if (isDemoMode()) {
    return getDerivedOnlySuppliers(
      page,
      perPage,
      search,
      riskLevel,
      region,
      parentCompanyId,
    );
  }

  const offset = (page - 1) * perPage;

  // Build dynamic WHERE clauses
  const conditions: string[] = ["is_deleted = false", "client_key IS NOT NULL"];
  const params: (string | number)[] = [];
  let paramIndex = 1;

  if (search) {
    conditions.push(`name ILIKE $${paramIndex}`);
    params.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = conditions.join(" AND ");

  const result = await pgQuery(
    `SELECT id, client_key, name, country, is_active
     FROM clients_clientinfo
     WHERE ${whereClause}`,
    params,
  );

  const rows: ClientRow[] = result.rows;

  // Fetch risk scores from wovo_ai
  const clientKeysForRisk = rows.map((r) => String(r.client_key));
  type RiskScoreRow = typeof supplierRiskScoresSchema.$inferSelect;
  const riskScoresMap: Record<string, RiskScoreRow> = {};
  const brandIds = new Set<string>();

  if (clientKeysForRisk.length > 0) {
    const riskData = await db
      .select()
      .from(supplierRiskScoresSchema)
      .where(inArray(supplierRiskScoresSchema.supplierId, clientKeysForRisk));
    for (const r of riskData) {
      riskScoresMap[r.supplierId] = r;
      if (r.parentCompanyId) {
        brandIds.add(r.parentCompanyId);
      }
    }
  }

  // Get brand IDs from authoritative source
  try {
    const brandResult = await pgQuery(
      `SELECT ci.client_key FROM clients_clientrelation cr
       JOIN clients_clientinfo ci ON ci.id = cr.relation_id
       WHERE cr.relation_type = 0 AND ci.is_deleted = false`,
      [],
    );
    for (const row of brandResult.rows) {
      brandIds.add(String(row.client_key));
    }
  } catch {
    // relation table query failed — rely on risk score brand detection only
  }

  // Merge and filter
  let mergedRows: MergedRow[] = rows.map((row) => {
    const riskData = riskScoresMap[String(row.client_key)];
    return {
      ...row,
      risk_score: riskData?.riskScore || 50,
      case_score: riskData?.caseScore || 50,
      survey_score: riskData?.surveyScore || 50,
      training_score: riskData?.trainingScore || 50,
      engagement_score: riskData?.engagementScore || 50,
      reasons: riskData?.reasons || [],
      cached_region: riskData?.region || null,
      latitude: riskData?.latitude || null,
      longitude: riskData?.longitude || null,
      parent_company_id: riskData?.parentCompanyId || null,
    };
  });

  // Exclude brand/parent company rows
  if (brandIds.size > 0) {
    mergedRows = mergedRows.filter(
      (row) => !brandIds.has(String(row.client_key)),
    );
  }

  // Filter by parentCompanyId (brand)
  if (parentCompanyId) {
    mergedRows = mergedRows.filter(
      (row) => row.parent_company_id === parentCompanyId,
    );
  }

  if (riskLevel !== "all") {
    mergedRows = mergedRows.filter((row) => {
      const score = row.risk_score;
      if (riskLevel === "high") return score > 70;
      if (riskLevel === "medium") return score > 30 && score <= 70;
      if (riskLevel === "low") return score <= 30;
      return true;
    });
  }

  if (region !== "all") {
    mergedRows = mergedRows.filter((row) => {
      const supplierRegion = row.cached_region || deriveRegion(row.country);
      return supplierRegion === region;
    });
  }

  // Sort by risk_score DESC
  mergedRows.sort((a, b) => b.risk_score - a.risk_score);

  const total = mergedRows.length;
  const paginatedRows = mergedRows.slice(offset, offset + perPage);

  // Fetch worker counts from wc_global
  const clientKeysForWorkers = paginatedRows
    .map((r) => Number(r.client_key))
    .filter(Boolean);
  const workerCountMap: Record<number, number> = {};
  if (clientKeysForWorkers.length > 0) {
    try {
      const workerRes = await wcGlobalQuery(
        `SELECT client_id, COUNT(*) as count
         FROM mdl_participant
         WHERE client_id = ANY($1) AND is_deleted = false
         GROUP BY client_id`,
        [clientKeysForWorkers],
      );
      for (const row of workerRes.rows) {
        workerCountMap[row.client_id] = parseInt(row.count);
      }
    } catch (err) {
      logger.error(
        "cache/suppliers",
        "Failed to fetch worker counts from wc_global",
        err,
      );
    }
  }

  // Batch-fetch last activity dates
  const supplierIdsForActivity = paginatedRows.map((r) =>
    String(r.client_key),
  );
  let activityDateMap = new Map<string, string>();
  try {
    activityDateMap = await getLastActivityDates(supplierIdsForActivity);
  } catch (err) {
    logger.error(
      "cache/suppliers",
      "Failed to fetch last activity dates",
      err,
    );
  }

  const suppliers: Supplier[] = paginatedRows.map((row) => ({
    id: String(row.client_key),
    name: row.name,
    region: row.cached_region || deriveRegion(row.country),
    country: row.country || "Unknown",
    location: row.country || "Unknown",
    workerCount: workerCountMap[Number(row.client_key)] || 0,
    contactName: "N/A",
    contactEmail: "N/A",
    riskScore: row.risk_score,
    riskLevel:
      row.risk_score > 70 ? "high" : row.risk_score > 30 ? "medium" : "low",
    status: row.is_active ? "active" : "inactive",
    lastActivityDate:
      activityDateMap.get(String(row.client_key)) ||
      new Date().toISOString().split("T")[0],
    riskBreakdown: {
      caseScore: row.case_score,
      surveyScore: row.survey_score,
      trainingScore: row.training_score,
      engagementScore: row.engagement_score,
      reasons: row.reasons,
    },
    ...(row.latitude != null && { latitude: row.latitude }),
    ...(row.longitude != null && { longitude: row.longitude }),
    ...(row.parent_company_id && { parentCompanyId: row.parent_company_id }),
  }));

  const totalPages = Math.ceil(total / perPage);

  return { data: suppliers, total, page, perPage, totalPages };
}

// ---------------------------------------------------------------------------
// Forecasts
// ---------------------------------------------------------------------------

export async function getCachedForecasts(
  supplierId: string,
  limit: number,
) {
  "use cache";
  cacheTag(TAGS.forecasts);
  cacheTag(forecastTag(supplierId));
  cacheLife({ stale: 600, revalidate: 1800, expire: 7200 });

  const results = await db
    .select()
    .from(supplierRiskForecast)
    .where(eq(supplierRiskForecast.supplierId, supplierId))
    .orderBy(asc(supplierRiskForecast.forecastDate))
    .limit(limit);

  // Serialize Date objects for cache (generatedAt is a timestamp → Date)
  return results.map((r) => ({
    ...r,
    generatedAt: r.generatedAt.toISOString(),
  }));
}

// ---------------------------------------------------------------------------
// Intelligence
// ---------------------------------------------------------------------------

export async function getCachedIntelligence(briefingId: string | null) {
  "use cache";
  cacheTag(TAGS.intelligence);
  cacheLife({ stale: 300, revalidate: 600, expire: 3600 });

  // 1. Fetch current (or specific historical) briefing
  let current = null;
  if (briefingId) {
    const [row] = await db
      .select()
      .from(intelligenceBriefing)
      .where(eq(intelligenceBriefing.id, parseInt(briefingId)))
      .limit(1);
    current = row ?? null;
  } else {
    const [row] = await db
      .select()
      .from(intelligenceBriefing)
      .orderBy(desc(intelligenceBriefing.generatedAt))
      .limit(1);
    current = row ?? null;
  }

  // 2. Metrics briefing (real-time data)
  const metrics = await getMetricsBriefing();

  // 3. Historical briefing list
  const history = await db.execute<{
    id: number;
    generated_at: string;
    item_count: number;
  }>(sql`
    SELECT
      id,
      generated_at,
      jsonb_array_length(attention_items) as item_count
    FROM intelligence_briefing
    ORDER BY generated_at DESC
    LIMIT 10
  `);

  const stale = !current;

  return {
    current: current
      ? {
          id: current.id,
          attentionItems: current.attentionItems ?? [],
          generatedAt: current.generatedAt?.toISOString() ?? null,
          expiresAt: current.expiresAt?.toISOString() ?? null,
        }
      : null,
    metrics,
    history: (
      history as Array<{
        id: number;
        generated_at: string;
        item_count: number;
      }>
    ).map((h) => ({
      id: h.id,
      generatedAt:
        typeof h.generated_at === "string"
          ? h.generated_at
          : new Date(h.generated_at).toISOString(),
      itemCount: Number(h.item_count),
    })),
    stale,
  };
}

// ---------------------------------------------------------------------------
// Cases
// ---------------------------------------------------------------------------

export async function getCachedCases(
  page: number,
  perPage: number,
  search: string,
  supplier: string,
  supplierId: string,
  parentCompanyId: string,
  severity: string,
): Promise<PaginatedResponse<Case>> {
  "use cache";
  cacheTag(TAGS.cases);
  cacheLife({ stale: 120, revalidate: 300, expire: 1800 });

  const offset = (page - 1) * perPage;

  const conditions: string[] = ["c.Deleted = 0"];
  const params: Record<
    string,
    { type: (() => mssql.ISqlType) | mssql.ISqlType; value: unknown }
  > = {
    offset: { type: mssql.Int(), value: offset },
    perPage: { type: mssql.Int(), value: perPage },
  };

  if (search) {
    conditions.push("(c.Name LIKE @search OR ctct.Name LIKE @search)");
    params.search = { type: mssql.NVarChar(), value: `%${search}%` };
  }
  if (supplier !== "all") {
    conditions.push("co.Name = @supplier");
    params.supplier = { type: mssql.NVarChar(), value: supplier };
  }
  if (supplierId) {
    conditions.push("co.Id = @supplierId");
    params.supplierId = { type: mssql.Int(), value: parseInt(supplierId) };
  }
  if (parentCompanyId) {
    conditions.push("co.ParentCompanyId = @parentCompanyId");
    params.parentCompanyId = {
      type: mssql.Int(),
      value: parseInt(parentCompanyId),
    };
  }
  if (severity !== "all") {
    const priorityMap: Record<string, number> = {
      high: 1,
      medium: 2,
      low: 3,
    };
    if (priorityMap[severity]) {
      conditions.push("c.Priority = @priority");
      params.priority = { type: mssql.Int(), value: priorityMap[severity] };
    }
  }

  const whereClause = conditions.join(" AND ");

  const countResult = await sqlParamQuery(
    `SELECT COUNT(*) as total
     FROM [Case] c
     LEFT JOIN Company co ON c.CompanyId = co.Id
     LEFT JOIN CaseTypeCultureText ctct ON c.CaseTypeId = ctct.CaseTypeId AND ctct.CultureCodeId = 1
     WHERE ${whereClause}`,
    params,
  );
  const total = countResult.recordset[0].total;

  const result = await sqlParamQuery(
    `SELECT
      c.Id,
      c.Name as Title,
      c.Created,
      c.Modified,
      c.Priority,
      co.Name as CompanyName,
      co.Id as CompanyId,
      csct.Name as StatusName,
      ctct.Name as TypeName,
      (SELECT TOP 1 MessageText FROM Message WHERE CaseId = c.Id ORDER BY Created ASC) as FirstMessage
    FROM [Case] c
    LEFT JOIN Company co ON c.CompanyId = co.Id
    LEFT JOIN CaseStatusCultureText csct ON c.CaseStatusId = csct.CaseStatusId AND csct.CultureCodeId = 1
    LEFT JOIN CaseTypeCultureText ctct ON c.CaseTypeId = ctct.CaseTypeId AND ctct.CultureCodeId = 1
    WHERE ${whereClause}
    ORDER BY c.Created DESC
    OFFSET @offset ROWS FETCH NEXT @perPage ROWS ONLY`,
    params,
  );

  interface CaseRow {
    Id: number;
    Title: string;
    Created: string | null;
    Modified: string | null;
    Priority: number;
    CompanyName: string | null;
    CompanyId: number;
    StatusName: string | null;
    TypeName: string | null;
    FirstMessage: string | null;
  }

  // Batch-fetch cached AI summaries
  const caseIds = result.recordset.map((row: CaseRow) => String(row.Id));
  const cacheMap = new Map<
    string,
    { aiSummary: string | null; aiGuidance: unknown }
  >();
  if (caseIds.length > 0) {
    try {
      const cached = await db
        .select()
        .from(caseSummaryCache)
        .where(inArray(caseSummaryCache.caseId, caseIds));
      for (const c of cached) {
        cacheMap.set(c.caseId, {
          aiSummary: c.aiSummary,
          aiGuidance: c.aiGuidance,
        });
      }
    } catch (e) {
      logger.warn("cache/cases", "Cache DB unavailable", e);
    }
  }

  const cases: Case[] = result.recordset.map((row: CaseRow) => {
    const cached = cacheMap.get(String(row.Id));
    const fallbackSummary = row.FirstMessage
      ? row.FirstMessage.substring(0, 150) + "..."
      : "No content available.";

    return {
      id: String(row.Id),
      supplierId: String(row.CompanyId),
      supplierName: extractEnglishFromMlang(row.CompanyName || "Unknown"),
      topic: extractEnglishFromMlang(row.TypeName || "General"),
      severity:
        row.Priority === 1 ? "high" : row.Priority === 2 ? "medium" : "low",
      status: mapCaseStatus(row.StatusName || ""),
      aiSummary: cached?.aiSummary || fallbackSummary,
      fullContent: extractEnglishFromMlang(
        row.FirstMessage || row.Title || "No content.",
      ),
      createdAt: row.Created
        ? new Date(row.Created).toISOString().split("T")[0]
        : "",
      updatedAt: row.Modified
        ? new Date(row.Modified).toISOString().split("T")[0]
        : "",
      aiGuidance: (cached?.aiGuidance as AIGuidance) || {
        recommendedSteps: ["Review case details", "Contact supplier"],
        estimatedResolutionDays: 7,
      },
    };
  });

  const totalPages = Math.ceil(total / perPage);

  return { data: cases, total, page, perPage, totalPages };
}
