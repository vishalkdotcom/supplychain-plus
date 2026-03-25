"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { HelpButton } from "@/components/help";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { IconSparkles, IconLoader2, IconPlus } from "@tabler/icons-react";
import { IntelligenceBriefing } from "@/components/ai/intelligence-briefing";
import { ChatMessage } from "@/components/ai/chat-message";
import { SessionDropdown } from "@/components/ai/session-dropdown";
import { SmartInput } from "@/components/ai/smart-input";
import { ArtifactsTray, type Artifact } from "@/components/ai/artifacts-tray";
import type { BriefingAttentionItem } from "@/lib/db/schema";

export default function AIAssistantPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center p-8">
          <IconLoader2 className="animate-spin w-8 h-8 text-indigo-600" />
        </div>
      }
    >
      <AIAssistantContent />
    </Suspense>
  );
}

interface ChatSession {
  sessionId: string;
  title: string;
  updatedAt: string;
  isPinned: boolean;
}

interface BriefingData {
  attentionItems: BriefingAttentionItem[];
  generatedAt: string;
}

function AIAssistantContent() {
  const [input, setInput] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();

  // Session management
  const urlSessionId = searchParams.get("sessionId") || undefined;
  const [activeSessionId, setActiveSessionId] = useState<string | undefined>(urlSessionId);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);

  // Intelligence briefing
  const [briefing, setBriefing] = useState<BriefingData | null>(null);
  const [briefingLoading, setBriefingLoading] = useState(true);

  // Artifacts
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);

  // Sync URL session ID
  useEffect(() => {
    setActiveSessionId(urlSessionId);
  }, [urlSessionId]);

  // Fetch sessions
  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/ai/chat/sessions");
      if (res.ok) {
        const data = await res.json();
        setChatSessions(data.sessions);
      }
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Fetch briefing
  useEffect(() => {
    fetch("/api/ai/briefing")
      .then((res) => res.json())
      .then((data) => {
        if (data.briefing) {
          setBriefing({
            attentionItems: data.briefing.attentionItems,
            generatedAt: data.briefing.generatedAt,
          });
        }
      })
      .catch(() => {})
      .finally(() => setBriefingLoading(false));
  }, []);

  // Chat hook
  const { messages, setMessages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/ai/chat",
      body: { sessionId: activeSessionId },
    }),
  });

  // Auto-scroll
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  // Restore chat history
  useEffect(() => {
    if (!urlSessionId) {
      setMessages([]);
      return;
    }
    fetch(`/api/ai/chat/history?sessionId=${encodeURIComponent(urlSessionId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.messages?.length > 0) {
          const restored = data.messages.map(
            (m: { id: number; role: string; content: string }, idx: number) => ({
              id: `restored-${idx}`,
              role: m.role as "user" | "assistant",
              parts: [{ type: "text" as const, text: m.content }],
            }),
          );
          setMessages(restored);
        }
      })
      .catch(() => {});
  }, [urlSessionId, setMessages]);

  const isLoading = status === "streaming" || status === "submitted";

  const handleSubmit = async (query: string) => {
    if (!query.trim() || isLoading) return;

    let currentSessionId = activeSessionId;
    if (!currentSessionId) {
      currentSessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setActiveSessionId(currentSessionId);
      router.replace(`/ai?sessionId=${currentSessionId}`);
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    sendMessage({ text: query });
    setInput("");

    // Refresh sessions in background
    setTimeout(fetchSessions, 2000);
  };

  const handleSelectSession = (sessionId: string) => {
    router.push(`/ai?sessionId=${sessionId}`);
  };

  const handleNewChat = () => {
    setActiveSessionId(undefined);
    setMessages([]);
    setArtifacts([]);
    router.push("/ai");
  };

  const handleTogglePin = async (sessionId: string, isPinned: boolean) => {
    try {
      await fetch("/api/ai/chat/sessions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, isPinned }),
      });
      fetchSessions();
    } catch {
      // silent
    }
  };

  const handleRenameSession = async (sessionId: string, title: string) => {
    try {
      await fetch("/api/ai/chat/sessions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, title }),
      });
      fetchSessions();
    } catch {
      // silent
    }
  };

  const handleSaveArtifact = (artifact: { type: string; title: string; data: unknown }) => {
    setArtifacts((prev) => [
      ...prev,
      {
        id: `artifact-${Date.now()}`,
        ...artifact,
        createdAt: new Date(),
      },
    ]);
  };

  const handleDownloadArtifact = (artifact: Artifact) => {
    // Export as CSV for table data, JSON for others
    const data = JSON.stringify(artifact.data, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${artifact.title.toLowerCase().replace(/\s+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Current session title
  const currentSession = chatSessions.find((s) => s.sessionId === activeSessionId);
  const currentTitle = currentSession?.title;

  const isNewChat = messages.length === 0;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header bar */}
      <div className="flex items-center gap-3 px-4 md:px-6 py-2.5 border-b border-border bg-background/95 backdrop-blur shrink-0 z-30">
        <div className="flex items-center gap-2">
          <IconSparkles className="w-5 h-5 text-indigo-500" />
          <span className="text-sm font-semibold text-foreground">AI Assistant</span>
          <HelpButton infographicId="inf-12" />
        </div>
        <div className="h-4 w-px bg-border" />

        {/* Session dropdown */}
        <SessionDropdown
          sessions={chatSessions}
          currentSessionId={activeSessionId}
          currentTitle={currentTitle}
          onSelectSession={handleSelectSession}
          onTogglePin={handleTogglePin}
          onRenameSession={handleRenameSession}
        />

        <div className="flex-1" />

        {/* Artifacts tray */}
        <ArtifactsTray
          artifacts={artifacts}
          onDownload={handleDownloadArtifact}
        />

        {/* New chat button */}
        <button
          onClick={handleNewChat}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-white bg-indigo-500 hover:bg-indigo-600 transition-colors cursor-pointer"
        >
          <IconPlus className="w-3.5 h-3.5" />
          New Chat
        </button>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-6">
          <div className="flex flex-col gap-5">
            {/* Intelligence Briefing (new chat landing) */}
            {isNewChat && !briefingLoading && briefing && (
              <IntelligenceBriefing
                attentionItems={briefing.attentionItems}
                generatedAt={briefing.generatedAt}
                onItemClick={handleSubmit}
                onCapabilityClick={handleSubmit}
              />
            )}

            {/* Briefing loading skeleton */}
            {isNewChat && briefingLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 animate-pulse" />
                <div className="flex-1 rounded-2xl bg-muted/50 animate-pulse h-64" />
              </div>
            )}

            {/* Fallback if no briefing available */}
            {isNewChat && !briefingLoading && !briefing && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <IconSparkles className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="rounded-2xl p-6 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/20">
                    <p className="text-sm font-semibold text-foreground mb-2">
                      Welcome to WOVO AI
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      I can help you investigate cases, analyze risk trends, generate reports,
                      create training content, and more. Ask me anything about your supply chain.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Show suppliers at risk this month",
                        "Which factories need immediate attention?",
                        "Summarize recent cases",
                        "Show me unread alerts",
                      ].map((q) => (
                        <button
                          key={q}
                          onClick={() => handleSubmit(q)}
                          className="rounded-full px-3 py-1.5 text-xs text-muted-foreground bg-muted border border-border hover:border-indigo-500/50 hover:text-indigo-300 transition-all cursor-pointer"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onAction={handleSubmit}
                onSaveArtifact={handleSaveArtifact}
              />
            ))}

            {/* Error */}
            {error && (
              <div className="flex gap-3">
                <div className="w-8 h-8" />
                <div className="rounded-xl p-3 bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                  {error.message || "Something went wrong. Please try again."}
                </div>
              </div>
            )}

            {/* Streaming indicator */}
            {status === "submitted" && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <IconSparkles className="w-4 h-4 text-white" />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <div className="w-4 h-4 border-2 border-indigo-500/50 border-t-indigo-500 rounded-full animate-spin" />
                  Thinking...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>
      </div>

      {/* Smart input bar */}
      <div className="shrink-0 border-t border-border bg-background/95 backdrop-blur px-4 md:px-6 py-3">
        <div className="max-w-3xl mx-auto">
          <SmartInput
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
