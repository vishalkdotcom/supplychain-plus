"use client";

import { useState, useRef, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  IconLanguage,
  IconLoader,
  IconSchool,
  IconSparkles,
  IconUpload,
  IconWand,
} from "@tabler/icons-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchCourses, fetchSuppliers, fetchRecommendations } from "@/lib/api";
import { useQueryStates, parseAsInteger, parseAsString } from "nuqs";
import { SearchInput } from "@/components/search-input";
import { AIRecommendation } from "@/types";

interface CourseData {
  title: string;
  description: string;
  lessons: Array<{
    title: string;
    content: string;
  }>;
  quiz: Array<{
    question: string;
    options: string[];
    correctAnswerIndex: number;
  }>;
}

interface PipelineItem {
  id: string;
  title: string;
  status: PipelineStatus;
  progress: number;
  currentStep: string;
  sourceFile: string;
  courseData?: CourseData;
}

type PipelineStatus = "uploading" | "extracting" | "generating" | "ready";

const PIPELINE_STEPS: { key: PipelineStatus; label: string }[] = [
  { key: "uploading", label: "Uploading" },
  { key: "extracting", label: "Extracting" },
  { key: "generating", label: "Generating" },
  { key: "ready", label: "Ready" },
];

function CoursePreviewContent({ course }: { course: CourseData }) {
  return (
    <>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <IconFileText className="w-5 h-5 text-indigo-500" />
          Lessons
        </h3>
        {course.lessons.map((lesson, i) => (
          <Card key={i} className="bg-slate-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-md">
                Lesson {i + 1}: {lesson.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {lesson.content}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <IconCheck className="w-5 h-5 text-green-500" />
          Knowledge Check
        </h3>
        {course.quiz.map((q, i) => (
          <div key={i} className="space-y-2 p-4 border rounded-lg bg-white">
            <p className="font-medium text-sm">
              {i + 1}. {q.question}
            </p>
            <ul className="space-y-2 mt-3">
              {q.options.map((opt: string, j: number) => (
                <li
                  key={j}
                  className={`text-sm p-2 rounded-md border ${
                    j === q.correctAnswerIndex
                      ? "bg-green-50 border-green-200 text-green-800 font-medium"
                      : "bg-muted/50 border-transparent"
                  }`}
                >
                  {opt}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}

export default function EducatePage() {
  const [params, setParams] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    search: parseAsString.withDefault(""),
  });

  const perPage = 8;

  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pipelineItems, setPipelineItems] = useState<PipelineItem[]>([]);
  const [previewItem, setPreviewItem] = useState<PipelineItem | null>(null);
  const [translations, setTranslations] = useState<Record<string, CourseData>>({});
  const [translatingLang, setTranslatingLang] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("en");

  const LANGUAGES: Record<string, string> = {
    vi: "Vietnamese",
    bn: "Bengali",
    zh: "Chinese",
    km: "Khmer",
    id: "Indonesian",
    th: "Thai",
    hi: "Hindi",
    es: "Spanish",
  };

  const handleTranslate = useCallback(async (lang: string, course: CourseData) => {
    setTranslatingLang(lang);
    try {
      const res = await fetch("/api/ai/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course, language: lang }),
      });
      if (!res.ok) throw new Error("Translation failed");
      const data = await res.json();
      setTranslations((prev) => ({ ...prev, [lang]: data.translated }));
      setActiveTab(lang);
      toast.success(`Translated to ${LANGUAGES[lang]}`);
    } catch {
      toast.error(`Failed to translate to ${LANGUAGES[lang]}`);
    } finally {
      setTranslatingLang(null);
    }
  }, []);

  const showToast = useCallback((msg: string) => {
    toast(msg);
  }, []);

  // Process document through real AI pipeline
  const processDocument = useCallback(async (file: File) => {
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

    try {
      // Step 1: Uploading & Extracting
      setPipelineItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, status: "extracting", progress: 35, currentStep: "Extracting content..." }
            : item,
        ),
      );

      const formData = new FormData();
      formData.append("file", file);

      // Start generation step before awaiting API since extraction+generation happens there
      setPipelineItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, status: "generating", progress: 60, currentStep: "Generating lessons & quizzes..." }
            : item,
        ),
      );

      const res = await fetch("/api/ai/educate", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to process document");
      }

      const data = await res.json();

      setPipelineItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, status: "ready", progress: 100, currentStep: "Complete", courseData: data.course }
            : item,
        ),
      );
      toast(`Successfully generated course for ${title}`);

    } catch (err) {
      console.error(err);
      toast(`Error processing ${title}`);
      setPipelineItems((prev) => prev.filter((item) => item.id !== id));
    }
  }, []);

  const handleFileUpload = useCallback(
    (file: File) => {
      if (file && file.type === "application/pdf") {
        setUploadedFile(file);
        processDocument(file);
      }
    },
    [processDocument],
  );

  const { data: coursesResponse, isLoading: isCoursesLoading } = useQuery({
    queryKey: ["courses", params.page, params.search],
    queryFn: () =>
      fetchCourses({
        page: params.page,
        perPage,
        search: params.search,
      }),
    placeholderData: keepPreviousData,
  });

  const { data: suppliersResponse, isLoading: isSuppliersLoading } = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => fetchSuppliers(),
  });

  const { data: recommendationsData, isLoading: isRecommendationsLoading } =
    useQuery<AIRecommendation[]>({
      queryKey: ["recommendations"],
      queryFn: () => fetchRecommendations(),
    });

  const courses = coursesResponse?.data || [];
  const totalPages = coursesResponse?.totalPages || 0;
  const total = coursesResponse?.total || 0;
  const suppliers = suppliersResponse?.data || [];

  // Training recommendations based on AI analysis
  const trainingRecommendations = (recommendationsData || [])
    .filter((r: AIRecommendation) => r.category === "training")
    .map((rec: AIRecommendation) => {
      const supplier = suppliers.find((s) => s.id === rec.supplierId);
      return { ...rec, supplierName: supplier?.name || "Unknown" };
    });

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

  const getPageNumbers = () => {
    const pages: number[] = [];
    const start = Math.max(1, params.page - 2);
    const end = Math.min(totalPages, start + 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
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
                            `Demo Mode: Deployment of "${item.title}" is simulated and will not affect production.`,
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
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <SearchInput placeholder="Search courses..." />
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
          <p className="text-sm text-muted-foreground">
            Showing {courses.length} of {total} courses
            {totalPages > 1 && ` • Page ${params.page} of ${totalPages}`}
          </p>

          {courses.map((course) => (
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
                      onClick={() =>
                        setParams({ page: Math.max(1, params.page - 1) })
                      }
                      className={
                        params.page === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {getPageNumbers().map((p) => (
                    <PaginationItem key={p}>
                      <PaginationLink
                        onClick={() => setParams({ page: p })}
                        isActive={params.page === p}
                        className="cursor-pointer"
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setParams({
                          page: Math.min(totalPages, params.page + 1),
                        })
                      }
                      className={
                        params.page === totalPages
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
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setPreviewItem(null);
            setTranslations({});
            setActiveTab("en");
          }
        }}
      >
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{previewItem?.courseData?.title || previewItem?.title}</DialogTitle>
            <DialogDescription>
              {previewItem?.courseData?.description || `Generated from ${previewItem?.sourceFile}`}
            </DialogDescription>
          </DialogHeader>
          {previewItem?.courseData ? (
            <div className="space-y-4 py-4">
              {/* Translation Controls */}
              <div className="flex items-center gap-2 flex-wrap">
                <IconLanguage className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-medium">Translate to:</span>
                {Object.entries(LANGUAGES).map(([code, name]) => (
                  <Button
                    key={code}
                    size="sm"
                    variant={translations[code] ? "secondary" : "outline"}
                    disabled={translatingLang !== null}
                    onClick={() => handleTranslate(code, previewItem.courseData!)}
                    className="text-xs h-7"
                  >
                    {translatingLang === code ? (
                      <><IconLoader className="w-3 h-3 animate-spin mr-1" />{name}</>
                    ) : (
                      name
                    )}
                  </Button>
                ))}
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="en">English</TabsTrigger>
                  {Object.entries(translations).map(([code]) => (
                    <TabsTrigger key={code} value={code}>
                      {LANGUAGES[code]}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {/* English Tab */}
                <TabsContent value="en" className="space-y-4 mt-4">
                  <CoursePreviewContent course={previewItem.courseData} />
                </TabsContent>

                {/* Translated Tabs */}
                {Object.entries(translations).map(([code, translated]) => (
                  <TabsContent key={code} value={code} className="space-y-4 mt-4">
                    <CoursePreviewContent course={translated} />
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4">
              This is a demo preview. In production, the full generated course
              content (lessons, quizzes, translations) would appear here.
            </p>
          )}
          <div className="flex gap-2 justify-end w-full pt-4 border-t">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setPreviewItem(null)}
            >
              Close
            </Button>
            <Button
              className="flex-1 gap-2"
              onClick={() => {
                showToast(
                  `Published "${previewItem?.courseData?.title || previewItem?.title}" to course catalog!`,
                );
                setPreviewItem(null);
              }}
            >
              <IconSchool className="w-4 h-4" />
              Publish Course
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
