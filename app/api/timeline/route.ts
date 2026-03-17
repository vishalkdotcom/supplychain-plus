import { NextResponse } from "next/server";
import { paramQuery as sqlParamQuery } from "@/lib/db/sql-server";
import { query as pgQuery } from "@/lib/db/postgres";
import { query as mysqlQuery } from "@/lib/db/mysql";
import { TimelineEvent } from "@/types";
import mssql from "mssql";
import { extractEnglishFromMlang } from "@/lib/mlang";
import { logger } from "@/lib/logger";


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const supplierId = searchParams.get("supplierId");

  const events: TimelineEvent[] = [];
  let eventId = 1;

  try {
    // 1. Case events from SQL Server
    try {
      const caseWhere = supplierId
        ? "WHERE c.Deleted = 0 AND co.Id = @supplierId"
        : "WHERE c.Deleted = 0";
      const caseParams: Record<
        string,
        { type: (() => mssql.ISqlType) | mssql.ISqlType; value: unknown }
      > = {};
      if (supplierId) {
        caseParams.supplierId = {
          type: mssql.Int(),
          value: parseInt(supplierId),
        };
      }

      const caseResult = await sqlParamQuery(
        `SELECT TOP 20
          c.Id, c.Name as Title, c.Created, c.Priority,
          co.Id as CompanyId, co.Name as CompanyName,
          csct.Name as StatusName, ctct.Name as TypeName
        FROM [Case] c
        LEFT JOIN Company co ON c.CompanyId = co.Id
        LEFT JOIN CaseStatusCultureText csct ON c.CaseStatusId = csct.CaseStatusId AND csct.CultureCodeId = 1
        LEFT JOIN CaseTypeCultureText ctct ON c.CaseTypeId = ctct.CaseTypeId AND ctct.CultureCodeId = 1
        ${caseWhere}
        ORDER BY c.Created DESC`,
        caseParams,
      );

      for (const row of caseResult.recordset) {
        events.push({
          id: String(eventId++),
          supplierId: String(row.CompanyId || ""),
          date: new Date(row.Created).toISOString().split("T")[0],
          type: row.Priority === 1 ? "alert" : "problem",
          module: "connect",
          title: extractEnglishFromMlang(row.Title || `Case #${row.Id}`),
          description: extractEnglishFromMlang(`${row.TypeName || "Case"} - ${row.StatusName || "Open"} (${row.Priority === 1 ? "High" : row.Priority === 2 ? "Medium" : "Low"} priority)`),
        });
      }
    } catch (e) {
      logger.warn("api/timeline", "SQL Server unavailable", e);
    }

    // 2. Survey events from PostgreSQL
    try {
      const surveyParams: unknown[] = [];
      let surveyWhere = "";
      if (supplierId) {
        surveyWhere = "WHERE c.client_key = $1";
        surveyParams.push(String(parseInt(supplierId)));
      }

      const surveyResult = await pgQuery(
        `SELECT s.id, s.name, s.status, s.from_date, s.to_date,
               c.client_key, c.name as client_name
        FROM survey_mdlsurvey s
        LEFT JOIN clients_clientinfo c ON s.client_id = c.id
        ${surveyWhere}
        ORDER BY s.created_date DESC
        LIMIT 10`,
        surveyParams,
      );

      for (const row of surveyResult.rows) {
        const statusLabel =
          row.status === 1 ? "Active" : row.status === 2 ? "Closed" : "Draft";
        events.push({
          id: String(eventId++),
          supplierId: String(row.client_key || ""),
          date: row.from_date
            ? new Date(row.from_date).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          type:
            row.status === 2
              ? "outcome"
              : row.status === 1
                ? "action"
                : "action",
          module: "engage",
          title: extractEnglishFromMlang(row.name || "Survey"),
          description: extractEnglishFromMlang(`Survey ${statusLabel} - ${row.client_name || "Unknown supplier"}`),
        });
      }
    } catch (e) {
      logger.warn("api/timeline", "PostgreSQL unavailable", e);
    }

    // 3. Training events from MySQL
    try {
      const courseResult = (await mysqlQuery(`
        SELECT c.id, c.fullname, c.timecreated,
          (SELECT COUNT(*) FROM mdl_user_enrolments ue
           JOIN mdl_enrol e ON ue.enrolid = e.id
           WHERE e.courseid = c.id) as enrolled
        FROM mdl_course c
        WHERE c.id > 1
        ORDER BY c.timecreated DESC
        LIMIT 10
      `)) as Array<{
        id: number;
        fullname: string;
        timecreated: number;
        enrolled: number;
      }>;

      for (const row of courseResult) {
        events.push({
          id: String(eventId++),
          supplierId: "", // Courses are global
          date: new Date(row.timecreated * 1000).toISOString().split("T")[0],
          type: "action",
          module: "educate",
          title: `Training: ${extractEnglishFromMlang(row.fullname)}`,
          description: extractEnglishFromMlang(`Course deployed with ${row.enrolled || 0} enrollments`),
        });
      }
    } catch (e) {
      logger.warn("api/timeline", "MySQL unavailable", e);
    }

    // Filter by supplier if needed
    let filteredEvents = events;
    if (supplierId) {
      filteredEvents = events.filter(
        (e) => e.supplierId === supplierId || e.supplierId === "",
      );
    }

    // Sort by date descending
    filteredEvents.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    return NextResponse.json(filteredEvents.slice(0, 30));
  } catch (error) {
    logger.error("api/timeline", "Failed to fetch timeline", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
