"use client";

import { Badge } from "@/components/ui/badge";
import type { FrameworkRequirement } from "@/types";

interface RequirementListProps {
  requirements: FrameworkRequirement[];
}

const EVIDENCE_TYPE_LABELS: Record<string, string> = {
  case_resolved: "Case Resolved",
  survey_improvement: "Survey",
  training_completed: "Training",
  risk_score_drop: "Risk Drop",
  anomaly_resolved: "Anomaly",
  manual_note: "Manual",
  engagement_improvement: "Engagement",
  satisfaction_improvement: "Satisfaction",
  case_volume_decrease: "Case Volume",
};

export function RequirementList({ requirements }: RequirementListProps) {
  // Group by category
  const grouped = new Map<string, FrameworkRequirement[]>();
  for (const req of requirements) {
    const list = grouped.get(req.category) || [];
    list.push(req);
    grouped.set(req.category, list);
  }

  return (
    <div className="space-y-6">
      {[...grouped.entries()].map(([category, reqs]) => (
        <div key={category}>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {category}
          </h3>
          <div className="space-y-3">
            {reqs.map((req) => (
              <div
                key={req.id}
                className="border rounded-lg p-4 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="text-xs shrink-0 mt-0.5">
                    {req.code}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{req.title}</div>
                    {req.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {req.description}
                      </p>
                    )}
                    {req.evidenceTypes.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {req.evidenceTypes.map((type) => (
                          <span
                            key={type}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600"
                          >
                            {EVIDENCE_TYPE_LABELS[type] ?? type}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
