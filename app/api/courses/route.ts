import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db/mysql";
import { Course, PaginatedResponse } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const perPage = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("perPage") || "8")),
    );
    const search = searchParams.get("search") || "";
    const offset = (page - 1) * perPage;

    // Build dynamic WHERE clauses
    const conditions: string[] = ["c.id > 1"];
    const params: any[] = [];

    if (search) {
      conditions.push(`(c.fullname LIKE ? OR c.shortname LIKE ?)`);
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = conditions.join(" AND ");

    // Count total
    const countResult = (await query(
      `SELECT COUNT(*) as total FROM mdl_course c WHERE ${whereClause}`,
      params,
    )) as Array<{ total: number }>;
    const total = countResult[0].total;

    // Fetch paginated data
    const result = (await query(
      `SELECT 
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
      WHERE ${whereClause}
      ORDER BY c.timecreated DESC 
      LIMIT ? OFFSET ?`,
      [...params, Number(perPage), Number(offset)],
    )) as Array<{
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

    const totalPages = Math.ceil(total / perPage);

    const response: PaginatedResponse<Course> = {
      data: courses,
      total,
      page,
      perPage,
      totalPages,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
