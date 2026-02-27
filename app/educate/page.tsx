"use client";

import { useState, useRef, useCallback } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { toast } from "sonner";
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

interface PipelineItem {
  id: string;
  title: string;
  status: PipelineStatus;
  progress: number;
  currentStep: string;
  sourceFile: string;
}

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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pipelineItems, setPipelineItems] = useState<PipelineItem[]>([]);
  const [previewItem, setPreviewItem] = useState<PipelineItem | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Showing 8 courses per page

  const showToast = useCallback((msg: string) => {
    toast(msg);
  }, []);

  // Simulate pipeline processing after file upload
  const simulatePipeline = useCallback((file: File) => {
    const id = `pipe-${Date.now()}`;
    const title = file.name.replace(/\.pdf$/i, "").replace(/[-_]/g, " ");
    const newItem: PipelineItem = {
      id,
      title,
      status: "uploading",
      progress: 10,
      currentStep: "Uploading file...",
      sourceFile: file.name,
    };
    setPipelineItems((prev) => [newItem, ...prev]);

    // Simulate steps
    const steps: Array<{
      status: PipelineStatus;
      progress: number;
      step: string;
      delay: number;
    }> = [
      {
        status: "extracting",
        progress: 35,
        step: "Extracting content...",
        delay: 1500,
      },
      {
        status: "generating",
        progress: 65,
        step: "Generating quiz questions...",
        delay: 3000,
      },
      {
        status: "generating",
        progress: 85,
        step: "Creating translations...",
        delay: 4500,
      },
      { status: "ready", progress: 100, step: "Complete", delay: 6000 },
    ];

    steps.forEach(({ status, progress, step, delay }) => {
      setTimeout(() => {
        setPipelineItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? { ...item, status, progress, currentStep: step }
              : item,
          ),
        );
      }, delay);
    });
  }, []);

  const handleFileUpload = useCallback(
    (file: File) => {
      if (file && file.type === "application/pdf") {
        setUploadedFile(file);
        simulatePipeline(file);
      }
    },
    [simulatePipeline],
  );

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

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
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
            const file = e.dataTransfer.files[0];
            if (file) handleFileUpload(file);
          }}
        >
          <CardContent className="flex flex-col items-center justify-center h-[200px] gap-4">
            <div className="p-4 rounded-full bg-indigo-100">
              <IconUpload className="w-8 h-8 text-indigo-600" />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />
            <div className="text-center">
              <h3 className="font-semibold text-lg">
                {uploadedFile ? uploadedFile.name : "Drop Policy PDF Here"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {uploadedFile
                  ? `${(uploadedFile.size / 1024).toFixed(0)} KB — Ready for processing`
                  : "AI will generate lessons, quizzes, and translations."}
              </p>
            </div>
            <Button onClick={() => fileInputRef.current?.click()}>
              {uploadedFile ? "Change File" : "Select File"}
            </Button>
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
            {pipelineItems.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Upload a PDF to start generating course content.
              </p>
            ) : (
              pipelineItems.map((item) => (
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
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setPreviewItem(item)}
                      >
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() =>
                          showToast(
                            `Demo mode — "${item.title}" publish coming soon.`,
                          )
                        }
                      >
                        Publish
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recommended Training */}
      {trainingRecommendations.length > 0 && (
        <Card className="border-orange-200 bg-linear-to-br from-orange-50/50 to-amber-50/50">
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
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    showToast(
                      `Demo mode — deploying "${rec.action}" coming soon.`,
                    )
                  }
                >
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
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
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
          {paginatedCourses.map((course) => (
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  showToast(
                    `Demo mode — "${course.title}" management coming soon.`,
                  )
                }
              >
                Manage
                <IconArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          ))}

          {totalPages > 1 && (
            <div className="pt-4 border-t">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }).map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        onClick={() => setCurrentPage(i + 1)}
                        isActive={currentPage === i + 1}
                        className="cursor-pointer"
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview dialog */}
      <Dialog
        open={previewItem !== null}
        onOpenChange={(isOpen) => !isOpen && setPreviewItem(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{previewItem?.title}</DialogTitle>
            <DialogDescription>
              Generated from {previewItem?.sourceFile}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              This is a demo preview. In production, the full generated course
              content (lessons, quizzes, translations) would appear here.
            </p>
          </div>
          <div className="flex gap-2 justify-end w-full">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setPreviewItem(null)}
            >
              Close
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                showToast(
                  `Demo mode — "${previewItem?.title}" publish coming soon.`,
                );
                setPreviewItem(null);
              }}
            >
              Publish
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
