"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isToolUIPart, getToolName } from "ai";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IconArrowRight,
  IconBuilding,
  IconSend,
  IconSparkles,
  IconLoader2,
} from "@tabler/icons-react";

const SUGGESTED_QUERIES = [
  "Show suppliers at risk this month",
  "Which factories need immediate attention?",
  "What training should we deploy next?",
  "Summarize recent harassment cases",
  "Show me unread alerts",
];

export default function AIAssistantPage() {
  const [input, setInput] = useState("");

  // Persist sessionId across page refreshes within the same tab
  const [sessionId] = useState(() => {
    if (typeof window === "undefined") return "";
    let id = sessionStorage.getItem("chat_session_id");
    if (!id) {
      id = `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      sessionStorage.setItem("chat_session_id", id);
    }
    return id;
  });

  const { messages, setMessages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/ai/chat",
      body: { sessionId },
    }),
  });

  // Restore chat history on mount
  useEffect(() => {
    if (!sessionId) return;
    fetch(`/api/ai/chat/history?sessionId=${encodeURIComponent(sessionId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.messages && data.messages.length > 0) {
          const restored = data.messages.map(
            (
              m: { id: number; role: string; content: string },
              idx: number,
            ) => ({
              id: `restored-${idx}`,
              role: m.role as "user" | "assistant",
              parts: [{ type: "text" as const, text: m.content }],
            }),
          );
          setMessages(restored);
        }
      })
      .catch(() => {}); // silent fail
  }, [sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  const isLoading = status === "streaming" || status === "submitted";

  const handleSubmit = (query?: string) => {
    const q = query || input;
    if (!q.trim() || isLoading) return;
    sendMessage({ text: q });
    setInput("");
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
          Ask me about suppliers, cases, surveys, or training. I analyze data
          across all modules in real-time.
        </p>
      </div>

      {/* Query Input */}
      <Card className="border-indigo-200 bg-linear-to-br from-indigo-50/50 to-purple-50/50">
        <CardContent className="pt-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="flex gap-2"
          >
            <Input
              placeholder="Ask me anything about your supply chain..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-white"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              {isLoading ? (
                <IconLoader2 className="h-4 w-4 animate-spin" />
              ) : (
                <IconSend className="h-4 w-4" />
              )}
            </Button>
          </form>

          {/* Suggested Queries */}
          {messages.length === 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {SUGGESTED_QUERIES.map((sq) => (
                <Button
                  key={sq}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleSubmit(sq)}
                  disabled={isLoading}
                >
                  {sq}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-sm text-red-600">
              Error:{" "}
              {error.message || "Something went wrong. Please try again."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Messages */}
      <div className="space-y-4">
        {messages.map((message) => (
          <Card
            key={message.id}
            className={
              message.role === "user"
                ? "border-blue-200 bg-blue-50/50"
                : "border-indigo-100"
            }
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                {message.role === "user" ? (
                  <span className="text-blue-700">You</span>
                ) : (
                  <>
                    <IconSparkles className="h-4 w-4 text-indigo-600" />
                    <span className="text-indigo-700">AI Assistant</span>
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {message.parts.map((part, index) => {
                  if (part.type === "text") {
                    return (
                      <div
                        key={index}
                        className="prose prose-sm max-w-none text-sm whitespace-pre-wrap"
                      >
                        {part.text}
                      </div>
                    );
                  }
                  // Catch-all tool rendering using v5/v6 helpers
                  if (isToolUIPart(part)) {
                    const toolName = getToolName(part);
                    const isInProgress =
                      part.state === "input-streaming" ||
                      part.state === "input-available";
                    const isDone = part.state === "output-available";
                    const isError =
                      part.state === "output-error" ||
                      part.state === "output-denied";

                    return (
                      <div
                        key={`tool-${part.toolCallId}`}
                        className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-2"
                      >
                        {isInProgress && (
                          <>
                            <IconLoader2 className="h-3 w-3 animate-spin" />
                            <span>Querying {toolName}...</span>
                          </>
                        )}
                        {isDone && (
                          <>
                            <Badge variant="outline" className="text-xs">
                              {toolName}
                            </Badge>
                            <span className="text-green-600">
                              ✓ Data retrieved
                            </span>
                          </>
                        )}
                        {isError && (
                          <>
                            <Badge
                              variant="outline"
                              className="text-xs text-red-600"
                            >
                              {toolName}
                            </Badge>
                            <span className="text-red-600">✗ Error</span>
                          </>
                        )}
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Streaming indicator */}
        {status === "submitted" && (
          <Card className="border-indigo-100">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <IconLoader2 className="h-4 w-4 animate-spin text-indigo-600" />
                <span>Thinking...</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick links when no messages */}
      {messages.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/connect">
            <Card className="hover:border-indigo-300 transition-colors cursor-pointer">
              <CardContent className="pt-6 flex items-center gap-3">
                <IconBuilding className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium text-sm">View Cases</p>
                  <p className="text-xs text-muted-foreground">
                    Browse worker grievances
                  </p>
                </div>
                <IconArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
          <Link href="/suppliers">
            <Card className="hover:border-indigo-300 transition-colors cursor-pointer">
              <CardContent className="pt-6 flex items-center gap-3">
                <IconBuilding className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-sm">View Suppliers</p>
                  <p className="text-xs text-muted-foreground">
                    Monitor supplier risk
                  </p>
                </div>
                <IconArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        </div>
      )}
    </div>
  );
}
