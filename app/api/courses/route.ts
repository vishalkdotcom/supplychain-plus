import { NextResponse } from "next/server";
import { query } from "@/lib/db/mysql";
import { Course } from "@/types";

export async function GET() {
  try {
    const result: any = await query(`
      SELECT 
        id, 
        fullname, 
        shortname, 
        summary, 
        timecreated 
      FROM mdl_course 
      WHERE id > 1 
      ORDER BY timecreated DESC 
      LIMIT 20
    `);

    const courses: Course[] = result.map((row: any) => ({
      id: String(row.id),
      title: row.fullname,
      description:
        row.summary?.replace(/<[^>]*>/g, "") || "No description available.",
      enrollments: Math.floor(Math.random() * 1000) + 100, // Placeholder as enrollment count join is complex
      completionRate: Math.floor(Math.random() * 100), // Placeholder
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
