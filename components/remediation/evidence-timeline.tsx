"use client";

import { Button } from "@/components/ui/button";
import {
  IconCircleCheck,
  IconChartLine,
  IconSchool,
  IconTrendingDown,
  IconBellOff,
  IconPencil,
  IconPlus,
  IconHeartHandshake,
  IconMoodHappy,
  IconArrowDown,
} from "@tabler/icons-react";
import type { RemediationEvidence } from "@/types";

const EVIDENCE_TYPE_CONFIG: Record<
  string,
  { icon: typeof IconCircleCheck; color: string; label: string }
> = {
  case_resolved: { icon: IconCircleCheck, color: "text-green-600 bg-green-100", label: "Case Resolved" },
  survey_improvement: { icon: IconChartLine, color: "text-blue-600 bg-blue-100", label: "Survey Improvement" },
  training_completed: { icon: IconSchool, color: "text-purple-600 bg-purple-100", label: "Training Completed" },
  risk_score_drop: { icon: IconTrendingDown, color: "text-emerald-600 bg-emerald-100", label: "Risk Score Drop" },
  anomaly_resolved: { icon: IconBellOff, color: "text-amber-600 bg-amber-100", label: "Anomaly Resolved" },
  manual_note: { icon: IconPencil, color: "text-gray-600 bg-gray-100", label: "Manual Note" },
  engagement_improvement: { icon: IconHeartHandshake, color: "text-teal-600 bg-teal-100", label: "Engagement Improved" },
  satisfaction_improvement: { icon: IconMoodHappy, color: "text-indigo-600 bg-indigo-100", label: "Satisfaction Improved" },
  case_volume_decrease: { icon: IconArrowDown, color: "text-cyan-600 bg-cyan-100", label: "Case Volume Decrease" },
};

function getEvidenceConfig(type: string) {
  return EVIDENCE_TYPE_CONFIG[type] ?? EVIDENCE_TYPE_CONFIG.manual_note;
}

interface EvidenceTimelineProps {
  evidence: RemediationEvidence[];
  onAddEvidence?: () => void;
}

export function EvidenceTimeline({ evidence, onAddEvidence }: EvidenceTimelineProps) {
  const sorted = [...evidence].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <div className="space-y-4">
      {sorted.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No evidence collected yet
        </p>
      )}

      <div className="relative">
        {sorted.length > 0 && (
          <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-border" />
        )}
        <div className="space-y-4">
          {sorted.map((item) => {
            const config = getEvidenceConfig(item.evidenceType);
            const Icon = config.icon;
            return (
              <div key={item.id} className="relative flex gap-3 pl-1">
                <div
                  className={`relative z-10 flex items-center justify-center w-7 h-7 rounded-full shrink-0 ${config.color}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-sm font-medium">{item.title}</p>
                  {item.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {config.label}
                    </span>
                    {item.referenceId && (
                      <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                        auto
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {onAddEvidence && (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={onAddEvidence}
        >
          <IconPlus className="h-4 w-4 mr-1" />
          Add Evidence
        </Button>
      )}
    </div>
  );
}
