"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  IconAlertTriangle,
  IconArrowRight,
  IconCheck,
  IconFileText,
  IconLoader,
  IconSchool,
  IconSearch,
  IconSparkles,
  IconUpload,
  IconWand,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { fetchCourses, fetchSuppliers, fetchRecommendations } from "@/lib/api";

// Mock processing pipeline states
const MOCK_PIPELINE_ITEMS = [
  {
    id: "pipe-1",
    title: "Respectful Workplace Conduct",
    status: "generating" as const,
    progress: 67,
    currentStep: "Generating quiz questions...",
    sourceFile: "workplace-conduct-policy.pdf",
  },
  {
    id: "pipe-2",
    title: "Fire Safety Procedures",
    status: "ready" as const,
    progress: 100,
    currentStep: "Complete",
    sourceFile: "fire-safety-manual.pdf",
  },
];

type PipelineStatus = "uploading" | "extracting" | "generating" | "ready";

const PIPELINE_STEPS: { key: PipelineStatus; label: string }[] = [
  { key: "uploading", label: "Uploading" },
  { key: "extracting", label: "Extracting" },
  { key: "generating", label: "Generating" },
  { key: "ready", label: "Ready" },
];

export default function EducatePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const { data: coursesData, isLoading: isCoursesLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: fetchCourses,
  });

  const { data: suppliersData, isLoading: isSuppliersLoading } = useQuery({
    queryKey: ["suppliers"],
    queryFn: fetchSuppliers,
  });

  const { data: recommendationsData, isLoading: isRecommendationsLoading } =
    useQuery({
      queryKey: ["recommendations"],
      queryFn: fetchRecommendations,
    });

  const courses = coursesData || [];
  const suppliers = suppliersData || [];

  // Training recommendations based on AI analysis
  const trainingRecommendations = (recommendationsData || [])
    .filter((r) => r.category === "training")
    .map((rec) => {
      const supplier = suppliers.find((s) => s.id === rec.supplierId);
      return { ...rec, supplierName: supplier?.name || "Unknown" };
    });

  const filteredCourses = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.relevantFor.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  );

  if (isCoursesLoading || isSuppliersLoading || isRecommendationsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const getStepStatus = (
    pipelineStatus: PipelineStatus,
    stepKey: PipelineStatus,
  ) => {
    const statusOrder: PipelineStatus[] = [
      "uploading",
      "extracting",
      "generating",
      "ready",
    ];
    const currentIdx = statusOrder.indexOf(pipelineStatus);
    const stepIdx = statusOrder.indexOf(stepKey);

    if (stepIdx < currentIdx) return "done";
    if (stepIdx === currentIdx) return "current";
    return "pending";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Educate Studio</h1>
        <p className="text-muted-foreground">
          AI-assisted course creation and localization.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload Area */}
        <Card
          className={`border-dashed border-2 transition-colors ${
            isDragging
              ? "border-indigo-500 bg-indigo-50"
              : "border-muted-foreground/25"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            // Mock upload handling
          }}
        >
          <CardContent className="flex flex-col items-center justify-center h-[200px] gap-4">
            <div className="p-4 rounded-full bg-indigo-100">
              <IconUpload className="w-8 h-8 text-indigo-600" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-lg">Drop Policy PDF Here</h3>
              <p className="text-sm text-muted-foreground">
                AI will generate lessons, quizzes, and translations.
              </p>
            </div>
            <Button>Select File</Button>
          </CardContent>
        </Card>

        {/* Processing Pipeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconWand className="w-5 h-5 text-indigo-500" />
              Content Generation
            </CardTitle>
            <CardDescription>
              AI is processing your uploaded documents.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {MOCK_PIPELINE_ITEMS.map((item) => (
              <div key={item.id} className="p-4 rounded-lg border space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <IconFileText className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{item.title}</span>
                  </div>
                  {item.status === "ready" ? (
                    <Badge variant="secondary" className="gap-1">
                      <IconCheck className="w-3 h-3" />
                      Ready
                    </Badge>
                  ) : (
                    <Badge variant="default" className="gap-1">
                      <IconLoader className="w-3 h-3 animate-spin" />
                      Processing
                    </Badge>
                  )}
                </div>

                {/* Pipeline Steps */}
                <div className="flex items-center gap-1">
                  {PIPELINE_STEPS.map((step, idx) => {
                    const status = getStepStatus(item.status, step.key);
                    return (
                      <div key={step.key} className="flex items-center gap-1">
                        <div
                          className={`flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                            status === "done"
                              ? "bg-green-500 text-white"
                              : status === "current"
                                ? "bg-indigo-500 text-white"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {status === "done" ? (
                            <IconCheck className="w-3 h-3" />
                          ) : (
                            idx + 1
                          )}
                        </div>
                        <span
                          className={`text-xs ${
                            status === "current"
                              ? "font-medium"
                              : "text-muted-foreground"
                          }`}
                        >
                          {step.label}
                        </span>
                        {idx < PIPELINE_STEPS.length - 1 && (
                          <div
                            className={`w-4 h-0.5 ${
                              status === "done" ? "bg-green-500" : "bg-muted"
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {item.status !== "ready" && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{item.currentStep}</span>
                      <span>{item.progress}%</span>
                    </div>
                    <Progress value={item.progress} className="h-1" />
                  </div>
                )}

                {item.status === "ready" && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      Preview
                    </Button>
                    <Button size="sm" className="flex-1">
                      Publish
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recommended Training */}
      {trainingRecommendations.length > 0 && (
        <Card className="border-orange-200 bg-gradient-to-br from-orange-50/50 to-amber-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconSparkles className="w-5 h-5 text-orange-600" />
              Recommended for Your Suppliers
            </CardTitle>
            <CardDescription>
              Based on recent cases and survey insights.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {trainingRecommendations.slice(0, 3).map((rec) => (
              <div
                key={rec.id}
                className="flex items-start justify-between p-3 rounded-lg bg-white/80 border border-orange-200"
              >
                <div className="flex items-start gap-3">
                  <IconAlertTriangle className="w-4 h-4 text-orange-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">{rec.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {rec.supplierName} • {rec.reason}
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Deploy
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search courses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Course Catalog */}
      <Card>
        <CardHeader>
          <CardTitle>Course Catalog</CardTitle>
          <CardDescription>
            Manage training modules and track deployment status.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="flex items-start justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <IconSchool className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{course.title}</span>
                  {course.aiGenerated && (
                    <Badge variant="secondary" className="gap-1 text-xs">
                      <IconWand className="w-3 h-3" />
                      AI Generated
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {course.enrollments.toLocaleString()} enrolled •{" "}
                  {course.completionRate}% completion
                </p>
                <div className="flex flex-wrap gap-1">
                  {course.languages.map((lang) => (
                    <Badge key={lang} variant="outline" className="text-xs">
                      {lang}
                    </Badge>
                  ))}
                  {course.relevantFor.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button variant="ghost" size="sm">
                Manage
                <IconArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
