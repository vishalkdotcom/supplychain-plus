"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAuditLog } from "@/lib/api";
import type { RemediationAuditEntry } from "@/types";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  IconChevronRight,
  IconArrowsExchange,
  IconPencil,
  IconFileCheck,
  IconRobot,
} from "@tabler/icons-react";
import { useDemoUser } from "@/lib/demo-user-context";

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function actionIcon(action: string) {
  switch (action) {
    case "status_change":
      return <IconArrowsExchange className="h-3.5 w-3.5 text-muted-foreground" />;
    case "field_edit":
      return <IconPencil className="h-3.5 w-3.5 text-muted-foreground" />;
    case "evidence_added":
    case "evidence_auto_attached":
      return <IconFileCheck className="h-3.5 w-3.5 text-muted-foreground" />;
    default:
      return <IconPencil className="h-3.5 w-3.5 text-muted-foreground" />;
  }
}

function actionDescription(entry: RemediationAuditEntry): string {
  switch (entry.action) {
    case "status_change":
      return `Status changed${entry.previousValue ? ` from ${entry.previousValue.replace(/_/g, " ")}` : ""} to ${entry.newValue?.replace(/_/g, " ") ?? "unknown"}`;
    case "field_edit":
      return `Updated ${entry.field?.replace(/([A-Z])/g, " $1").toLowerCase().trim() ?? "field"}`;
    case "evidence_added":
      return `Added evidence: ${entry.newValue ?? ""}`;
    case "evidence_auto_attached":
      return `Auto-detected evidence: ${entry.newValue ?? ""}`;
    default:
      return entry.action;
  }
}

function actorDisplay(entry: RemediationAuditEntry, userNameMap: Map<string, string>) {
  if (entry.actorType === "user") {
    const displayName = userNameMap.get(entry.actorId) ?? entry.actorId;
    return <span className="text-xs text-muted-foreground">{displayName}</span>;
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <IconRobot className="h-3 w-3" />
      System
    </span>
  );
}

interface AuditLogProps {
  remediationId: number;
}

export function AuditLog({ remediationId }: AuditLogProps) {
  const { users } = useDemoUser();
  const userNameMap = new Map(users.map((u) => [u.id, u.name]));

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["remediation-audit", remediationId],
    queryFn: () => fetchAuditLog(remediationId),
  });

  return (
    <Collapsible>
      <CollapsibleTrigger className="flex w-full items-center gap-1.5 text-sm font-medium hover:text-foreground text-muted-foreground py-1">
        <IconChevronRight className="h-4 w-4 transition-transform [[data-state=open]>&]:rotate-90" />
        Activity Log ({isLoading ? "..." : entries.length})
      </CollapsibleTrigger>
      <CollapsibleContent>
        {isLoading ? (
          <p className="text-xs text-muted-foreground py-2">Loading...</p>
        ) : entries.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">No activity yet.</p>
        ) : (
          <div className="mt-2 space-y-2">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-2 text-xs"
              >
                <div className="mt-0.5 shrink-0">{actionIcon(entry.action)}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-foreground leading-snug">
                    {actionDescription(entry)}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {actorDisplay(entry, userNameMap)}
                    <span className="text-muted-foreground/60">
                      {relativeTime(entry.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
