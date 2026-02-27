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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  IconSearch,
  IconSparkles,
  IconWand,
} from "@tabler/icons-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchSurveys } from "@/lib/api";
import { toast } from "sonner";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [supplierFilter, setSupplierFilter] = useState<string>("all");
  const [designerPrompt, setDesignerPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["en"]);
  const [isEditing, setIsEditing] = useState(false);
  // Removed custom savedMessage toast
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [generateError, setGenerateError] = useState("");
  const queryClient = useQueryClient();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Showing 8 surveys per page

  const { viewMode, currentSupplierId } = useView();

  const { data: surveysData, isLoading } = useQuery({
    queryKey: ["surveys", viewMode === "supplier" ? currentSupplierId : "all"],
    queryFn: () =>
      fetchSurveys(
        viewMode === "supplier" && currentSupplierId
          ? currentSupplierId
          : undefined,
      ),
  });

  const surveys = surveysData || [];
  const suppliers: string[] = [...new Set(surveys.map((s) => s.supplierName))];

  const filteredSurveys = surveys.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.aiInsight.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSupplier =
      supplierFilter === "all" || s.supplierName === supplierFilter;
    return matchesSearch && matchesSupplier;
  });

  const totalPages = Math.ceil(filteredSurveys.length / itemsPerPage);
  const paginatedSurveys = filteredSurveys.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

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
      const response = await fetch("/api/ai/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  const handleSaveDraft = () => {
    localStorage.setItem(
      "survey_draft",
      JSON.stringify({
        questions: generatedQuestions,
        languages: selectedLanguages,
      }),
    );
    toast("Draft saved locally ✓");
  };

  const handleDeploy = () => {
    toast("Demo mode — deployment coming in a future release.");
  };

  const handleAnalyze = async (surveyId: string) => {
    setAnalyzingId(surveyId);
    try {
      await fetch("/api/jobs/analyze-surveys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ surveyId }),
      });
      queryClient.invalidateQueries({ queryKey: ["surveys"] });
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setAnalyzingId(null);
    }
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
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? "Done Editing" : "Edit Questions"}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleSaveDraft}
                >
                  Save as Draft
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
        <div className="relative flex-1 max-w-sm">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search surveys..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={supplierFilter}
          onValueChange={(val) => {
            setSupplierFilter(val);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Suppliers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Suppliers</SelectItem>
            {suppliers.map((supplier) => (
              <SelectItem key={supplier} value={supplier}>
                {supplier}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {filteredSurveys.length} of {surveys.length} surveys
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
          {paginatedSurveys.map((survey) => (
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
    </div>
  );
}
