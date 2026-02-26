import { NextResponse } from "next/server";
import { query } from "@/lib/db/mysql";
import { Course } from "@/types";

export async function GET() {
  try {
    const result = (await query(`
      SELECT 
        c.id, 
        c.fullname, 
        c.shortname, 
        c.summary, 
        c.timecreated,
        (SELECT COUNT(*) FROM mdl_user_enrolments ue
         JOIN mdl_enrol e ON ue.enrolid = e.id
         WHERE e.courseid = c.id) as enrolled,
        (SELECT COUNT(*) FROM mdl_course_completions cc
         WHERE cc.course = c.id AND cc.timecompleted IS NOT NULL) as completed
      FROM mdl_course c
      WHERE c.id > 1 
      ORDER BY c.timecreated DESC 
      LIMIT 20
    `)) as Array<{
      id: number;
      fullname: string;
      shortname: string;
      summary: string;
      timecreated: number;
      enrolled: number;
      completed: number;
    }>;

    const courses: Course[] = result.map((row) => ({
      id: String(row.id),
      title: row.fullname,
      description:
        row.summary?.replace(/<[^>]*>/g, "") || "No description available.",
      enrollments: row.enrolled || 0,
      completionRate:
        row.enrolled > 0 ? Math.round((row.completed / row.enrolled) * 100) : 0,
      aiStatus: "manual",
      aiGenerated: false,
      relevantFor: ["General Compliance"],
      languages: ["English", "Local"],
      createdAt: new Date(row.timecreated * 1000).toISOString().split("T")[0],
    }));

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
