import { NextResponse } from "next/server";
import { query as mysqlQuery } from "@/lib/db/mysql";
import { SupplierTraining } from "@/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supplierId = parseInt(id);

    if (isNaN(supplierId)) {
      return NextResponse.json(
        { error: "Invalid supplier ID" },
        { status: 400 },
      );
    }

    // Query to fetch training data:
    // 1. Get courses associated with the supplier (company) via mdl_company_course
    // 2. Count enrollments (mdl_user_enrolments) per course
    // 3. Count completions (mdl_course_completions) per course
    // Note: timecompleted > 0 indicates completion

    // We need to map client_key (id) to companyid in mdl_company_course.
    // Assuming client_key == companyid based on previous findings.

    const sql = `
      SELECT 
        c.id as courseId, 
        c.fullname as courseName,
        COUNT(DISTINCT ue.userid) as enrolledWorkers,
        COUNT(DISTINCT CASE WHEN cc.timecompleted > 0 THEN cc.userid END) as completedWorkers,
        MAX(ue.timecreated) as lastActivityDate
      FROM mdl_company_course cc_map
      JOIN mdl_course c ON c.id = cc_map.courseid
      JOIN mdl_enrol e ON e.courseid = c.id
      JOIN mdl_user_enrolments ue ON ue.enrolid = e.id
      LEFT JOIN mdl_course_completions cc ON cc.course = c.id AND cc.userid = ue.userid
      WHERE cc_map.companyid = ?
      GROUP BY c.id, c.fullname
    `;

    interface TrainingRow {
      courseId: number;
      courseName: string;
      enrolledWorkers: number | string;
      completedWorkers: number | string;
      lastActivityDate: number | string | null;
    }

    const rows = (await mysqlQuery(sql, [supplierId])) as TrainingRow[];

    const trainingData: SupplierTraining[] = rows.map((row) => {
      const enrolled = Number(row.enrolledWorkers);
      const completed = Number(row.completedWorkers);
      const completionRate =
        enrolled > 0 ? Math.round((completed / enrolled) * 100) : 0;

      // Convert unix timestamp to ISO date string
      const lastActivity = row.lastActivityDate
        ? new Date(Number(row.lastActivityDate) * 1000)
            .toISOString()
            .split("T")[0]
        : new Date().toISOString().split("T")[0];

      return {
        supplierId: id,
        courseId: String(row.courseId),
        courseName: row.courseName, // Moodle stores HTML entities sometimes, strictly might need decoding
        enrolledWorkers: enrolled,
        completedWorkers: completed,
        completionRate: completionRate,
        lastActivityDate: lastActivity,
      };
    });

    return NextResponse.json(trainingData);
  } catch (error) {
    console.error("Error fetching training data:", error);
    // Return empty array instead of error to not break the UI if MySQL is down/empty
    return NextResponse.json([]);
  }
}
