"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { IconDownload, IconArrowsMaximize, IconArrowUp, IconArrowDown } from "@tabler/icons-react";

interface Column {
  key: string;
  label: string;
  format?: "badge" | "score" | "text";
}

interface TableCardProps {
  title: string;
  columns: Column[];
  data: Record<string, unknown>[];
  onSave?: () => void;
  onExpand?: () => void;
  onRowClick?: (row: Record<string, unknown>) => void;
}

function formatCell(value: unknown, format?: string) {
  if (value === null || value === undefined) return "—";

  if (format === "badge") {
    const str = String(value);
    const variant = str === "high" || str === "critical"
      ? "destructive"
      : str === "medium" || str === "warning"
        ? "secondary"
        : "outline";
    return <Badge variant={variant}>{str}</Badge>;
  }

  if (format === "score") {
    const num = Number(value);
    const color = num >= 70 ? "text-red-400" : num >= 50 ? "text-amber-400" : "text-green-400";
    return <span className={`font-semibold ${color}`}>{num}</span>;
  }

  return String(value);
}

export function TableCard({ title, columns, data, onSave, onExpand, onRowClick }: TableCardProps) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sortedData = sortKey
    ? [...data].sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
        return sortDir === "asc" ? cmp : -cmp;
      })
    : data;

  return (
    <div className="rounded-xl p-4 bg-card border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
        <div className="flex gap-1.5">
          {onSave && (
            <button
              onClick={onSave}
              className="rounded-md px-2 py-1 text-[10px] text-muted-foreground bg-muted hover:bg-accent transition-colors"
            >
              <IconDownload className="w-3 h-3 inline mr-1" />
              Save
            </button>
          )}
          {onExpand && (
            <button
              onClick={onExpand}
              className="rounded-md px-2 py-1 text-[10px] text-muted-foreground bg-muted hover:bg-accent transition-colors"
            >
              <IconArrowsMaximize className="w-3 h-3 inline mr-1" />
              Expand
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="text-left py-2 px-2 text-muted-foreground font-medium cursor-pointer hover:text-foreground transition-colors"
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key && (
                      sortDir === "asc"
                        ? <IconArrowUp className="w-3 h-3" />
                        : <IconArrowDown className="w-3 h-3" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.slice(0, 10).map((row, i) => (
              <tr
                key={i}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-border/50 last:border-0 ${onRowClick ? "cursor-pointer hover:bg-accent/50" : ""} transition-colors`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="py-2 px-2 text-foreground">
                    {formatCell(row[col.key], col.format)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {data.length > 10 && (
          <div className="text-center py-2 text-xs text-muted-foreground">
            Showing 10 of {data.length} rows
          </div>
        )}
      </div>
    </div>
  );
}
