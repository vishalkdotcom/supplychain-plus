import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import {
  supplierRiskScores,
  supplierRiskHistory,
  alerts,
} from "@/lib/db/schema";
import type { RiskReason } from "@/lib/db/schema";
import { query as pgQuery } from "@/lib/db/postgres";
import { query as mssqlQuery } from "@/lib/db/sql-server";
import { query as mysqlQuery } from "@/lib/db/mysql";
import { eq } from "drizzle-orm";

interface SupplierRow {
  id: number;
  client_key: string;
  name: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const targetSupplierId = body?.supplierId as string | undefined;

    // 1. Get suppliers
    let supplierQuery = `
      SELECT id, client_key, name 
      FROM clients_clientinfo 
      WHERE is_deleted = false AND client_key IS NOT NULL
    `;
    if (targetSupplierId) {
      supplierQuery += ` AND client_key = '${parseInt(targetSupplierId)}'`;
    }
    supplierQuery += ` LIMIT 500`;

    const suppliersResult = await pgQuery(supplierQuery);
    const suppliers: SupplierRow[] = suppliersResult.rows;

    let processedCount = 0;

    for (const supplier of suppliers) {
      const supplierId = String(supplier.client_key);
      const reasons: RiskReason[] = [];

      // --- Case Score (from SQL Server) ---
      let caseScore = 0;
      try {
        const caseResult = await mssqlQuery(`
          SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN Priority = 1 THEN 1 ELSE 0 END) as high_priority,
            SUM(CASE WHEN c.CaseStatusId IN (SELECT Id FROM CaseStatus WHERE Name = 'Open') THEN 1 ELSE 0 END) as open_cases
          FROM [Case] c
          JOIN Company co ON c.CompanyId = co.Id
          WHERE c.Deleted = 0 AND co.Id = ${supplier.id}
        `);
        const row = caseResult.recordset[0];
        const total = row?.total || 0;
        const highPriority = row?.high_priority || 0;
        const openCases = row?.open_cases || 0;

        if (total > 0) {
          caseScore = Math.min(
            100,
            Math.round((highPriority / total) * 60 + (openCases / total) * 40),
          );
        }
        if (highPriority > 2) {
          reasons.push({
            factor: `${highPriority} high-priority cases`,
            impact: "high",
            description: `Supplier has ${highPriority} unresolved high-priority grievances`,
            module: "connect",
          });
        }
        if (openCases > 5) {
          reasons.push({
            factor: `${openCases} open cases`,
            impact: "medium",
            description: `${openCases} cases remain unresolved`,
            module: "connect",
          });
        }
      } catch {
        // SQL Server may be unreachable
      }

      // --- Survey Score (from PostgreSQL) ---
      let surveyScore = 0;
      try {
        const surveyResult = await pgQuery(
          `SELECT COUNT(*) as total,
                  SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as active
           FROM survey_mdlsurvey
           WHERE client_id = $1`,
          [supplier.id],
        );
        const sRow = surveyResult.rows[0];
        const totalSurveys = parseInt(sRow?.total) || 0;
        const activeSurveys = parseInt(sRow?.active) || 0;

        if (totalSurveys === 0) {
          surveyScore = 60; // No engagement = moderate risk
          reasons.push({
            factor: "No surveys conducted",
            impact: "medium",
            description: "No worker sentiment data available for this supplier",
            module: "engage",
          });
        } else {
          surveyScore = Math.max(0, 50 - activeSurveys * 10);
        }
      } catch {
        // PostgreSQL issue
      }

      // --- Training Score (from MySQL) ---
      let trainingScore = 0;
      try {
        const trainingResult = (await mysqlQuery(`
          SELECT 
            (SELECT COUNT(*) FROM mdl_user_enrolments ue
             JOIN mdl_enrol e ON ue.enrolid = e.id
             JOIN mdl_course c ON e.courseid = c.id
             WHERE c.id > 1) as total_enrolled,
            (SELECT COUNT(*) FROM mdl_course_completions cc
             WHERE cc.timecompleted IS NOT NULL) as total_completed
        `)) as Array<{ total_enrolled: number; total_completed: number }>;

        const tRow = trainingResult[0];
        const enrolled = tRow?.total_enrolled || 0;
        const completed = tRow?.total_completed || 0;

        if (enrolled > 0) {
          const completionRate = (completed / enrolled) * 100;
          trainingScore = Math.max(0, Math.round(100 - completionRate));
          if (completionRate < 50) {
            reasons.push({
              factor: `Low training completion (${Math.round(completionRate)}%)`,
              impact: completionRate < 25 ? "high" : "medium",
              description: `Only ${Math.round(completionRate)}% of enrolled workers completed training`,
              module: "educate",
            });
          }
        } else {
          trainingScore = 70;
        }
      } catch {
        // MySQL issue
      }

      // --- Engagement Score ---
      const engagementScore = Math.round(
        (caseScore * 0.3 + surveyScore * 0.3 + trainingScore * 0.4) * 0.5,
      );

      // --- Overall Risk Score ---
      const riskScore = Math.min(
        100,
        Math.round(
          caseScore * 0.35 +
            surveyScore * 0.25 +
            trainingScore * 0.25 +
            engagementScore * 0.15,
        ),
      );

      // Upsert risk score
      await db
        .insert(supplierRiskScores)
        .values({
          supplierId,
          supplierName: supplier.name,
          riskScore,
          caseScore,
          surveyScore,
          trainingScore,
          engagementScore,
          reasons,
          calculatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: supplierRiskScores.supplierId,
          set: {
            supplierName: supplier.name,
            riskScore,
            caseScore,
            surveyScore,
            trainingScore,
            engagementScore,
            reasons,
            calculatedAt: new Date(),
          },
        });

      // Insert history snapshot
      const today = new Date().toISOString().split("T")[0];
      await db
        .insert(supplierRiskHistory)
        .values({
          supplierId,
          riskScore,
          caseScore,
          surveyScore,
          trainingScore,
          engagementScore,
          snapshotDate: today,
        })
        .onConflictDoNothing();

      // Generate alerts for high-risk suppliers
      if (riskScore >= 75) {
        await db.insert(alerts).values({
          supplierId,
          supplierName: supplier.name,
          alertType: "risk_spike",
          severity: riskScore >= 90 ? "critical" : "warning",
          title: `High risk score: ${supplier.name} (${riskScore})`,
          message: `${supplier.name} has a risk score of ${riskScore}/100. Top factors: ${reasons
            .slice(0, 2)
            .map((r) => r.factor)
            .join(", ")}`,
        });
      }

      processedCount++;
    }

    return NextResponse.json({
      success: true,
      count: processedCount,
      message: `Risk scores calculated for ${processedCount} suppliers`,
    });
  } catch (error) {
    console.error("Error calculating risk scores:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
