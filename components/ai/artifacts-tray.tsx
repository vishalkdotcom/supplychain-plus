"use client";

import { useState, useRef, useEffect } from "react";
import { IconPaperclip, IconDownload, IconChartBar, IconTable, IconFileText } from "@tabler/icons-react";

export interface Artifact {
  id: string;
  type: string; // "chart" | "table" | "action" | "report"
  title: string;
  data: unknown;
  createdAt: Date;
}

interface ArtifactsTrayProps {
  artifacts: Artifact[];
  onDownload?: (artifact: Artifact) => void;
}

const TYPE_ICONS: Record<string, typeof IconChartBar> = {
  chart: IconChartBar,
  table: IconTable,
  action: IconFileText,
  report: IconFileText,
};

export function ArtifactsTray({ artifacts, onDownload }: ArtifactsTrayProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground bg-muted hover:bg-accent transition-colors cursor-pointer"
      >
        <IconPaperclip className="w-3.5 h-3.5" />
        Artifacts
        {artifacts.length > 0 && (
          <span className="bg-indigo-500 text-white text-[10px] rounded-full px-1.5 min-w-[16px] text-center">
            {artifacts.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1 w-64 bg-popover border border-border rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="p-3 border-b border-border">
            <span className="text-xs font-semibold text-foreground">
              Saved Artifacts
            </span>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {artifacts.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                No artifacts saved yet. Click &quot;Save&quot; on any chart or table card.
              </div>
            ) : (
              artifacts.map((artifact) => {
                const Icon = TYPE_ICONS[artifact.type] || IconFileText;
                return (
                  <div
                    key={artifact.id}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-accent transition-colors"
                  >
                    <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-foreground truncate">
                        {artifact.title}
                      </div>
                      <div className="text-[10px] text-muted-foreground capitalize">
                        {artifact.type}
                      </div>
                    </div>
                    {onDownload && (
                      <button
                        onClick={() => onDownload(artifact)}
                        className="p-1 hover:bg-muted rounded transition-colors"
                      >
                        <IconDownload className="w-3 h-3 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
