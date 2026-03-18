"use client";

import type { UIMessage } from "ai";
import Markdown from "react-markdown";
import { IconSparkles, IconUser } from "@tabler/icons-react";
import { ChartCard } from "./cards/chart-card";
import { TableCard } from "./cards/table-card";
import { ActionCard } from "./cards/action-card";

interface ChatMessageProps {
  message: UIMessage;
  onAction: (query: string) => void;
  onSaveArtifact?: (artifact: { type: string; title: string; data: unknown }) => void;
}

// Extract card metadata from tool result
function extractCardData(result: unknown): { card: CardData | null; items: unknown[] } {
  if (!result || typeof result !== "object") return { card: null, items: [] };

  const obj = result as Record<string, unknown>;

  if ("_card" in obj) {
    const card = obj._card as CardData;
    // Items might be under different keys depending on the tool
    const items = (obj.suppliers || obj.cases || obj.alerts || obj.surveys || obj.items || []) as unknown[];
    return { card, items };
  }

  // If it's an array directly (old format), no card
  if (Array.isArray(result)) {
    return { card: null, items: result };
  }

  return { card: null, items: [] };
}

interface CardData {
  type: "chart" | "table" | "action";
  title: string;
  chartType?: "bar" | "horizontal-bar";
  data?: Array<{ name: string; value: number; color?: string }>;
  columns?: Array<{ key: string; label: string; format?: "badge" | "score" | "text" }>;
  actions?: Array<{
    severity?: "critical" | "warning" | "info";
    label: string;
    description?: string;
    buttonLabel: string;
    buttonEmoji?: string;
    query: string;
  }>;
}

function renderCard(
  card: CardData,
  items: unknown[],
  onAction: (query: string) => void,
  onSave?: () => void,
) {
  switch (card.type) {
    case "chart":
      return (
        <ChartCard
          title={card.title}
          chartType={card.chartType}
          data={card.data || items.map((item) => {
            const i = item as Record<string, unknown>;
            return {
              name: String(i.name || i.supplierName || i.supplier || "Unknown"),
              value: Number(i.riskScore || i.value || 0),
              color: Number(i.riskScore || i.value || 0) >= 70 ? "#ef4444" : Number(i.riskScore || i.value || 0) >= 50 ? "#f59e0b" : "#22c55e",
            };
          })}
          onSave={onSave}
        />
      );
    case "table":
      return (
        <TableCard
          title={card.title}
          columns={card.columns || []}
          data={items as Record<string, unknown>[]}
          onSave={onSave}
        />
      );
    case "action":
      return (
        <ActionCard
          title={card.title}
          actions={card.actions || []}
          onAction={onAction}
        />
      );
    default:
      return null;
  }
}

export function ChatMessage({ message, onAction, onSaveArtifact }: ChatMessageProps) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="flex items-start gap-2 max-w-[70%]">
          <div className="rounded-2xl rounded-br-sm px-4 py-3 bg-indigo-600/80 text-sm text-white">
            {message.parts
              ?.filter((p) => p.type === "text")
              .map((p, i) => (
                <span key={i}>{p.text}</span>
              ))}
          </div>
          <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <IconUser className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  }

  // AI message
  return (
    <div className="flex gap-3">
      {/* AI avatar */}
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0 mt-1">
        <IconSparkles className="w-4 h-4 text-white" />
      </div>

      {/* Message content */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        {message.parts?.map((part, i) => {
          if (part.type === "text" && part.text) {
            return (
              <div key={i} className="text-sm text-foreground leading-relaxed prose prose-sm dark:prose-invert max-w-none prose-headings:text-foreground prose-headings:font-semibold prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-strong:text-foreground">
                <Markdown>{part.text}</Markdown>
              </div>
            );
          }

          // Tool invocation parts have type "tool-{toolName}" in AI SDK v6
          if (part.type.startsWith("tool-")) {
            const toolPart = part as Record<string, unknown>;
            // Show card for completed tool calls
            if (toolPart.state === "output-available" && toolPart.output) {
              const { card, items } = extractCardData(toolPart.output);
              if (card) {
                return (
                  <div key={i}>
                    {renderCard(
                      card,
                      items,
                      onAction,
                      onSaveArtifact
                        ? () => onSaveArtifact({ type: card.type, title: card.title, data: items })
                        : undefined,
                    )}
                  </div>
                );
              }
            }

            // Show loading state for pending tool calls
            if (toolPart.state === "input-streaming" || toolPart.state === "input-available") {
              return (
                <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                  <div className="w-3 h-3 border-2 border-indigo-500/50 border-t-indigo-500 rounded-full animate-spin" />
                  Analyzing {part.type.replace("tool-", "").replace(/([A-Z])/g, " $1").toLowerCase()}...
                </div>
              );
            }

            return null;
          }

          return null;
        })}
      </div>
    </div>
  );
}
