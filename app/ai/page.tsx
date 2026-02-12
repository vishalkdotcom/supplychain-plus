"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IconArrowRight,
  IconBuilding,
  IconSchool,
  IconSend,
  IconSparkles,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { fetchSuppliers, fetchRecommendations } from "@/lib/api";
import type { Supplier, AIRecommendation } from "@/types";

const SUGGESTED_QUERIES = [
  "Show suppliers at risk this month",
  "Which factories need immediate attention?",
  "What training should we deploy to Shenzhen?",
  "Summarize harassment cases from last quarter",
  "Generate HRDD report for Tiruppur Textiles",
];

interface MockResponse {
  type: "supplier_list" | "recommendation" | "narrative";
  title: string;
  content: string;
  suppliers?: Supplier[];
  recommendations?: AIRecommendation[];
}

export default function AIAssistantPage() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<MockResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { data: suppliers } = useQuery({
    queryKey: ["suppliers"],
    queryFn: fetchSuppliers,
  });

  const { data: recommendations } = useQuery({
    queryKey: ["recommendations"],
    queryFn: fetchRecommendations,
  });

  const handleSubmit = (inputQuery?: string) => {
    const q = inputQuery || query;
    if (!q.trim()) return;

    setIsLoading(true);
    setQuery(q);

    const allSuppliers = suppliers || [];
    const allRecommendations = recommendations || [];

    // Simulate AI response
    setTimeout(() => {
      if (
        q.toLowerCase().includes("risk") ||
        q.toLowerCase().includes("attention")
      ) {
        const highRiskSuppliers = allSuppliers
          .filter((s) => s.riskLevel === "high")
          .sort((a, b) => b.riskScore - a.riskScore);

        setResponse({
          type: "supplier_list",
          title: "Suppliers Requiring Attention",
          content:
            "Based on cross-module analysis, I've identified high-risk suppliers that need immediate focus:",
          suppliers: highRiskSuppliers,
        });
      } else if (
        q.toLowerCase().includes("training") ||
        q.toLowerCase().includes("deploy")
      ) {
        setResponse({
          type: "recommendation",
          title: "Training Recommendations",
          content:
            "Based on recent case patterns and survey results, here are my training recommendations:",
          recommendations: allRecommendations.filter(
            (r) => r.category === "training",
          ),
        });
      } else if (
        q.toLowerCase().includes("hrdd") ||
        q.toLowerCase().includes("report")
      ) {
        setResponse({
          type: "narrative",
          title: "HRDD Narrative Draft",
          content: `**Tiruppur Textiles Ltd - Q4 2025 Due Diligence Summary**

During Q4 2025, WOVO received 12 worker grievances from Tiruppur Textiles Ltd, representing a 25% increase from the previous quarter. The predominant issue category was wage-related (67%), specifically concerning overtime calculation accuracy.

**Key Actions Taken:**
- Deployed "Wage & Hours 101" training to all 2,400 workers
- Conducted payroll system audit identifying calculation errors
- Implemented weekly payroll reconciliation process

**Outcome Indicators:**
- Post-training survey showed 20% improvement in wage understanding
- New cases in January reduced to 2 (projected 75% reduction)

**Ongoing Monitoring:**
The factory remains at elevated risk (Score: 78) due to incomplete harassment training (34% completion). Recommended action: Prioritize completion of Sexual Harassment Prevention module by end of Q1 2026.`,
        });
      } else {
        setResponse({
          type: "narrative",
          title: "Response",
          content:
            "I can help you with supplier risk analysis, case summaries, training recommendations, and HRDD report generation. Try asking about specific suppliers or issues you'd like to investigate.",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-indigo-100 mb-4">
          <IconSparkles className="h-8 w-8 text-indigo-600" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">AI Assistant</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Ask me about suppliers, cases, surveys, or training. I can analyze
          data across all modules.
        </p>
      </div>

      {/* Query Input */}
      <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50/50 to-purple-50/50">
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Input
              placeholder="Ask me anything about your supply chain..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="flex-1 bg-white"
            />
            <Button onClick={() => handleSubmit()} disabled={isLoading}>
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <IconSend className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Suggested Queries */}
          <div className="flex flex-wrap gap-2 mt-4">
            {SUGGESTED_QUERIES.map((sq) => (
              <Button
                key={sq}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => handleSubmit(sq)}
              >
                {sq}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Response */}
      {response && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconSparkles className="h-5 w-5 text-indigo-600" />
              {response.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{response.content}</p>

            {/* Supplier List */}
            {response.type === "supplier_list" && response.suppliers && (
              <div className="space-y-3 mt-4">
                {response.suppliers.slice(0, 5).map((supplier) => (
                  <Link
                    key={supplier.id}
                    href={`/suppliers/${supplier.id}`}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <IconBuilding className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium group-hover:text-indigo-600 transition-colors">
                          {supplier.name}
                        </span>
                        <Badge variant="destructive">
                          {supplier.riskScore}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {supplier.country} •{" "}
                        {supplier.workerCount.toLocaleString()} workers
                      </p>
                      {supplier.riskBreakdown.reasons[0] && (
                        <p className="text-xs text-red-600 mt-1">
                          {supplier.riskBreakdown.reasons[0].factor}
                        </p>
                      )}
                    </div>
                    <IconArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </Link>
                ))}
              </div>
            )}

            {/* Recommendations */}
            {response.type === "recommendation" && response.recommendations && (
              <div className="space-y-3 mt-4">
                {response.recommendations.map((rec) => {
                  const supplier = suppliers?.find(
                    (s) => s.id === rec.supplierId,
                  );
                  return (
                    <div
                      key={rec.id}
                      className="flex items-start gap-3 p-4 rounded-lg border"
                    >
                      <IconSchool className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium">{rec.action}</p>
                        <p className="text-sm text-muted-foreground">
                          {supplier?.name} • {rec.reason}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Narrative */}
            {response.type === "narrative" && (
              <div className="mt-4 p-4 rounded-lg bg-muted/50 prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm font-sans">
                  {response.content}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
