"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconSchool, IconUpload, IconWand } from "@tabler/icons-react";
import { MOCK_COURSES } from "@/lib/mock-data";

export default function EducatePage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Educate Studio</h1>
          <p className="text-muted-foreground">
            AI-assisted course creation and localization.
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <Card className="flex-1 border-dashed border-2 bg-slate-50 dark:bg-slate-900/50">
          <CardContent className="flex flex-col items-center justify-center h-[200px] gap-4">
            <div className="p-4 rounded-full bg-indigo-100 dark:bg-indigo-900/30">
              <IconUpload className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-lg">Drop Policy PDF Here</h3>
              <p className="text-sm text-muted-foreground">
                AI will generate a lesson plan, quiz, and translations.
              </p>
            </div>
            <Button>Select File</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Catalog</CardTitle>
          <CardDescription>
            Manage training modules and track AI generation status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Enrollments</TableHead>
                <TableHead>Completion Rate</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>AI Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_COURSES.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.id}</TableCell>
                  <TableCell>{course.title}</TableCell>
                  <TableCell>{course.enrollments}</TableCell>
                  <TableCell>{course.completion_rate}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {course.source}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        course.ai_status === "Generated"
                          ? "default"
                          : course.ai_status === "Drafting"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {course.ai_status === "Generated" && (
                        <IconWand className="w-3 h-3 mr-1 inline" />
                      )}
                      {course.ai_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
