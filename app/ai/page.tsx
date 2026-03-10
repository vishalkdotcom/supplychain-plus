"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
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
  IconPlus,
  IconMessageCircle,
  IconMenu2,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
} from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const SUGGESTED_QUERIES = [
  "Show suppliers at risk this month",
  "Which factories need immediate attention?",
  "What training should we deploy next?",
  "Summarize recent harassment cases",
  "Show me unread alerts",
];

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
}

function AIAssistantContent() {
  const [input, setInput] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read sessionId from URL, otherwise undefined means a fresh chat
  const urlSessionId = searchParams.get("sessionId") || undefined;

  // Manage our active session ID internally too so we can pass it to useChat
  // If there's no urlSessionId, generate a temporary one until the first message is sent
  const [activeSessionId, setActiveSessionId] = useState<string | undefined>(
    urlSessionId,
  );
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  // When url session ID changes, update our active one and reset messages if needed
  useEffect(() => {
    setActiveSessionId(urlSessionId);
  }, [urlSessionId]);

  // Fetch session history
  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/ai/chat/sessions");
      if (res.ok) {
        const data = await res.json();
        setChatSessions(data.sessions);
      }
    } catch (e) {
      console.error("Failed to fetch sessions", e);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const { messages, setMessages, sendMessage, status, error } = useChat({
    // Always regenerate a new transport properly for a specific ID vs new chat
    transport: new DefaultChatTransport({
      api: "/api/ai/chat",
      body: { sessionId: activeSessionId },
    }),
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, status]);

  // Restore chat history on mount or when urlSessionId changes
  useEffect(() => {
    if (!urlSessionId) {
      // If no session ID in URL, we are in a "New Chat" state
      setMessages([]);
      return;
    }

    fetch(`/api/ai/chat/history?sessionId=${encodeURIComponent(urlSessionId)}`)
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
  }, [urlSessionId, setMessages]);

  const isLoading = status === "streaming" || status === "submitted";

  const handleSubmit = async (query?: string) => {
    const q = query || input;
    if (!q.trim() || isLoading) return;

    // If this is a fresh chat, generate a new ID, push the route, and then send
    let currentSessionId = activeSessionId;
    if (!currentSessionId) {
      currentSessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setActiveSessionId(currentSessionId);
      // Soft navigation so we don't reload the page, but the URL updates
      router.replace(`/ai?sessionId=${currentSessionId}`);
      // Give the transport a tick to get the new session ID via body prop
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    sendMessage({ text: q });
    setInput("");

    // Refresh sessions list in background to show new chat in sidebar
    setTimeout(fetchSessions, 2000);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white md:bg-transparent">
      <div className="flex-shrink-0 p-4">
        <Button
          className="w-full justify-start gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
          onClick={() => {
            router.push("/ai");
            setIsSidebarOpen(false);
          }}
        >
          <IconPlus className="h-4 w-4" />
          New Chat
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
        <div className="px-2 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Recent Chats
        </div>
        {chatSessions.length === 0 ? (
          <div className="px-2 py-4 text-sm text-muted-foreground text-center">
            No past chats found.
          </div>
        ) : (
          chatSessions.map((session) => (
            <Button
              key={session.sessionId}
              variant={
                urlSessionId === session.sessionId ? "secondary" : "ghost"
              }
              className="w-full justify-start font-normal px-2 h-auto py-2 flex flex-col items-start gap-1"
              onClick={() => {
                router.push(`/ai?sessionId=${session.sessionId}`);
                setIsSidebarOpen(false);
              }}
            >
              <div className="flex items-center gap-2 w-full">
                <IconMessageCircle className="h-4 w-4 text-indigo-500 shrink-0" />
                <span className="truncate text-sm">{session.title}</span>
              </div>
              <span className="text-[10px] text-muted-foreground ml-6">
                {formatDistanceToNow(new Date(session.updatedAt), {
                  addSuffix: true,
                })}
              </span>
            </Button>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-background">
      {/* Desktop Sidebar */}
      <div 
        className={`hidden md:flex flex-col border-r bg-muted/20 shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${
          isSidebarVisible ? 'w-64 opacity-100' : 'w-0 opacity-0 border-r-0'
        }`}
      >
        <div className="w-64 flex flex-col h-full">
          <SidebarContent />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Mobile Header with Sidebar Trigger */}
        <div className="md:hidden flex items-center p-4 border-b shrink-0 bg-background/95 backdrop-blur z-20">
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="-ml-2">
                <IconMenu2 className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <div className="font-semibold ml-2">AI Assistant</div>
        </div>

        <div className="flex flex-col flex-1 min-w-0 relative h-full">
          {/* Persistent Desktop Header */}
          <div className="hidden md:flex items-center justify-between px-4 py-2 border-b bg-background/95 backdrop-blur shrink-0 z-30">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setIsSidebarVisible(!isSidebarVisible)}
                title={isSidebarVisible ? "Hide Sidebar" : "Show Sidebar"}
              >
                {isSidebarVisible ? (
                  <IconLayoutSidebarLeftCollapse className="h-5 w-5" />
                ) : (
                  <IconLayoutSidebarLeftExpand className="h-5 w-5" />
                )}
              </Button>
              <div className="text-sm font-medium text-muted-foreground">
                AI Assistant
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              className="gap-2 h-8 text-xs bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700"
              onClick={() => {
                router.push("/ai");
              }}
            >
              <IconPlus className="h-3.5 w-3.5" />
              New Chat
            </Button>
          </div>

          <div className="flex flex-col flex-1 max-w-4xl mx-auto w-full px-4 relative pb-4 overflow-hidden pt-4">
            {/* Header */}
            {messages.length === 0 && (
              <div className="text-center space-y-2 mb-8 shrink-0 mt-8">
                <div className="inline-flex items-center justify-center p-3 rounded-full bg-indigo-100 mb-4">
                  <IconSparkles className="h-8 w-8 text-indigo-600" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">
                AI Assistant
              </h1>
              <p className="text-muted-foreground max-w-md mx-auto">
                Ask me about suppliers, cases, surveys, or training. I analyze
                data across all modules in real-time.
              </p>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 space-y-4 mb-4 overflow-y-auto pr-2 custom-scrollbar">
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

            {/* Invisible div for auto-scroll */}
            <div ref={messagesEndRef} className="h-4" />
          </div>

          {/* Query Input (Sticky Bottom) */}
          <div className="bg-background/95 backdrop-blur-sm pt-2 pb-4 shrink-0 mt-auto border-t md:border-t-0 md:bg-transparent md:backdrop-blur-none z-10">
            <Card className="border-indigo-200 bg-linear-to-br from-indigo-50/50 to-purple-50/50 shadow-md">
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

            {/* Quick links when no messages */}
            {messages.length === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <Link href="/connect">
                  <Card className="hover:border-indigo-300 transition-colors cursor-pointer bg-white/50 backdrop-blur-sm">
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
                  <Card className="hover:border-indigo-300 transition-colors cursor-pointer bg-white/50 backdrop-blur-sm">
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
        </div>
      </div>
    </div>
  </div>
);
}
