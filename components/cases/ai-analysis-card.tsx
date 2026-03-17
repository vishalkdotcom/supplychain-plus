"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { IconRobot, IconClock, IconLoader2 } from "@tabler/icons-react";
import { Case } from "@/types";

interface AIAnalysisCardProps {
  caseData: Case;
  displaySummary: string;
  isLoadingSummary: boolean;
  isLoadingGuidance: boolean;
  summaryError: string;
  onRefreshSummary: () => void;
}

export function AIAnalysisCard({
  caseData,
  displaySummary,
  isLoadingSummary,
  isLoadingGuidance,
  summaryError,
  onRefreshSummary,
}: AIAnalysisCardProps) {
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());

  const toggleStep = useCallback((idx: number) => {
    setCheckedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }, []);

  const steps = caseData.aiGuidance?.recommendedSteps || [];
  const completedCount = checkedSteps.size;
  const totalSteps = steps.length;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <IconRobot className="h-5 w-5 text-primary" />
            AI Analysis
            {isLoadingGuidance && (
              <IconLoader2 className="h-4 w-4 text-primary animate-spin" />
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefreshSummary}
            disabled={isLoadingSummary}
          >
            {isLoadingSummary ? "Generating..." : "Refresh"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* AI Summary */}
        {isLoadingSummary ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : summaryError ? (
          <p className="text-sm text-destructive">{summaryError}</p>
        ) : (
          <p className="text-sm leading-relaxed">{displaySummary}</p>
        )}

        {/* Separator + Steps */}
        {steps.length > 0 && (
          <>
            <Separator />
            <div className="space-y-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Recommended Steps
                </span>
                {totalSteps > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {completedCount}/{totalSteps} done
                  </span>
                )}
              </div>
              <div className="space-y-2">
                {steps.map((step, idx) => (
                  <label
                    key={idx}
                    className="flex items-start gap-3 text-sm cursor-pointer group"
                  >
                    <Checkbox
                      checked={checkedSteps.has(idx)}
                      onCheckedChange={() => toggleStep(idx)}
                      className="mt-0.5"
                    />
                    <span
                      className={
                        checkedSteps.has(idx)
                          ? "line-through text-muted-foreground"
                          : "group-hover:text-foreground"
                      }
                    >
                      {step}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Est. resolution */}
        {caseData.aiGuidance && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-card/80">
            <IconClock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              Est. resolution:{" "}
              <strong>{caseData.aiGuidance.estimatedResolutionDays} days</strong>
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
