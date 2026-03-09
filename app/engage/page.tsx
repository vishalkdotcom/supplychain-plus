"use client";

import { useState } from "react";
import { useView } from "@/components/view-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Checkbox } from "@/components/ui/checkbox";
import {
  IconArrowRight,
  IconCheck,
  IconLoader,
  IconSparkles,
  IconWand,
} from "@tabler/icons-react";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { fetchSurveys } from "@/lib/api";
import { toast } from "sonner";
import { useQueryStates, parseAsInteger, parseAsString } from "nuqs";
import { useAISettings } from "@/hooks/use-ai-settings";
import { SearchInput } from "@/components/search-input";

interface GeneratedQuestion {
  id: number;
  text: string;
  type: string;
  options?: string[];
}

const AVAILABLE_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "vi", name: "Vietnamese" },
  { code: "bn", name: "Bengali" },
  { code: "zh", name: "Mandarin" },
  { code: "km", name: "Khmer" },
];

export default function EngagePage() {
  const [params, setParams] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    search: parseAsString.withDefault(""),
  });

  const perPage = 8;

  const [designerPrompt, setDesignerPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["en"]);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [generateError, setGenerateError] = useState("");
  const queryClient = useQueryClient();

  const { activeConfig } = useAISettings();

  const { viewMode, currentSupplierId } = useView();

  const { data: response, isLoading } = useQuery({
    queryKey: [
      "surveys",
      params.page,
      params.search,
      viewMode === "supplier" ? currentSupplierId : "all",
    ],
    queryFn: () =>
      fetchSurveys({
        page: params.page,
        perPage,
        search: params.search,
        supplier:
          viewMode === "supplier" && currentSupplierId
            ? currentSupplierId
            : undefined,
      }),
    placeholderData: keepPreviousData,
  });

  const surveys = response?.data || [];
  const totalPages = response?.totalPages || 0;
  const total = response?.total || 0;

  const [generatedQuestions, setGeneratedQuestions] = useState<
    GeneratedQuestion[]
  >([]);
  const [surveyTitle, setSurveyTitle] = useState("");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const handleGenerate = async () => {
    if (!designerPrompt.trim()) return;
    setIsGenerating(true);
    setGenerateError("");
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (activeConfig) {
        headers["x-ai-provider"] = activeConfig.provider;
        headers["x-ai-api-key"] = activeConfig.apiKey;
        headers["x-ai-model"] = activeConfig.model;
      }

      const response = await fetch("/api/ai/survey", {
        method: "POST",
        headers,
        body: JSON.stringify({ prompt: designerPrompt }),
      });
      const data = await response.json();
      if (!response.ok) {
        setGenerateError(data.error || "Failed to generate survey.");
        return;
      }
      if (data.questions && Array.isArray(data.questions)) {
        setGeneratedQuestions(data.questions);
        setSurveyTitle(designerPrompt);
        setShowPreview(true);
      }
    } catch (error) {
      console.error("Failed to generate survey:", error);
      setGenerateError("Network error — could not reach the AI service.");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleLanguage = (code: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(code) ? prev.filter((l) => l !== code) : [...prev, code],
    );
  };

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    try {
      const res = await fetch("/api/surveys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: surveyTitle,
          questions: generatedQuestions,
          languages: selectedLanguages,
        }),
      });

      if (!res.ok) throw new Error("Failed to save draft");

      const data = await res.json();
      toast.success(data.message || "Draft saved to server ✓");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save draft.");
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleDeploy = () => {
    toast(
      "Demo Mode: Deploying surveys is simulated and currently disabled in this environment.",
    );
  };

  const handleAnalyze = async (surveyId: string) => {
    setAnalyzingId(surveyId);
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (activeConfig) {
        headers["x-ai-provider"] = activeConfig.provider;
        headers["x-ai-api-key"] = activeConfig.apiKey;
        headers["x-ai-model"] = activeConfig.model;
      }

      await fetch("/api/jobs/analyze-surveys", {
        method: "POST",
        headers,
        body: JSON.stringify({ surveyId }),
      });
      queryClient.invalidateQueries({ queryKey: ["surveys"] });
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setAnalyzingId(null);
    }
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
        <h1 className="text-3xl font-bold tracking-tight">Engage Insights</h1>
        <p className="text-muted-foreground">
          AI-powered survey design and analysis.
        </p>
      </div>

      {/* AI Designer Card */}
      <Card className="border-indigo-200 bg-linear-to-br from-indigo-50/50 to-purple-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconSparkles className="w-5 h-5 text-indigo-500" />
            AI Survey Designer
          </CardTitle>
          <CardDescription>
            Describe what you need and AI will generate a complete survey.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="E.g., 'Fire safety awareness for Vietnam factories'..."
              value={designerPrompt}
              onChange={(e) => setDesignerPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              className="flex-1 bg-white"
            />
            <Button onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <IconLoader className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <IconWand className="w-4 h-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </div>
          {generateError && (
            <p className="text-sm text-red-600">{generateError}</p>
          )}

          {/* Preview Panel */}
          {showPreview && (
            <div className="mt-4 p-4 rounded-lg bg-white border space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">
                    Generated: &quot;{surveyTitle}&quot;
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {generatedQuestions.length} questions • Ready for review
                  </p>
                </div>
                <Badge variant="secondary" className="gap-1">
                  <IconCheck className="w-3 h-3" />
                  AI Generated
                </Badge>
              </div>

              <div className="space-y-3 border-t pt-4">
                {generatedQuestions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-medium shrink-0">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm">{q.text}</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {q.type.replace("_", " ")}
                        </Badge>
                        {q.options && q.options.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            Options: {q.options.join(", ")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Languages */}
              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-2">Languages:</p>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_LANGUAGES.map((lang) => (
                    <label
                      key={lang.code}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedLanguages.includes(lang.code)}
                        onCheckedChange={() => toggleLanguage(lang.code)}
                      />
                      <span className="text-sm">{lang.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 border-t pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleSaveDraft}
                  disabled={isSavingDraft}
                >
                  {isSavingDraft ? (
                    <>
                      <IconLoader className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save as Draft"
                  )}
                </Button>
                <Button className="flex-1" onClick={handleDeploy}>
                  Deploy to Suppliers
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <SearchInput placeholder="Search surveys..." />
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {surveys.length} of {total} surveys
        {totalPages > 1 && ` • Page ${params.page} of ${totalPages}`}
      </p>

      {/* Survey List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Surveys</CardTitle>
          <CardDescription>
            Performance and risk analysis of deployed surveys.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {surveys.map((survey) => (
            <div
              key={survey.id}
              className="flex items-start justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{survey.title}</span>
                  <Badge variant="outline">{survey.status}</Badge>
                  <Badge
                    variant={
                      survey.riskScore > 50 ? "destructive" : "secondary"
                    }
                  >
                    Risk: {survey.riskScore}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {survey.supplierName} • {survey.responses.toLocaleString()}{" "}
                  responses
                </p>
                <div className="flex items-start gap-2">
                  <IconSparkles className="w-4 h-4 mt-0.5 text-purple-500 shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    {survey.aiInsight}
                  </span>
                </div>
                {survey.themes.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {survey.themes.slice(0, 4).map((theme) => (
                      <Badge
                        key={theme.name}
                        variant={
                          theme.sentiment === "negative"
                            ? "destructive"
                            : theme.sentiment === "positive"
                              ? "secondary"
                              : "outline"
                        }
                        className="text-xs"
                      >
                        {theme.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                disabled={analyzingId === survey.id}
                onClick={() => handleAnalyze(survey.id)}
              >
                {analyzingId === survey.id ? "Analyzing..." : "Analyze"}
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
    </div>
  );
}
