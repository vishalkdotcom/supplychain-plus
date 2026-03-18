"use client";

import { useState, useRef, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  IconChevronDown,
  IconPin,
  IconPinFilled,
  IconSearch,
} from "@tabler/icons-react";

interface ChatSession {
  sessionId: string;
  title: string;
  updatedAt: string;
  isPinned: boolean;
}

interface SessionDropdownProps {
  sessions: ChatSession[];
  currentSessionId?: string;
  currentTitle?: string;
  onSelectSession: (sessionId: string) => void;
  onTogglePin: (sessionId: string, isPinned: boolean) => void;
  onRenameSession: (sessionId: string, title: string) => void;
}

export function SessionDropdown({
  sessions,
  currentSessionId,
  currentTitle,
  onSelectSession,
  onTogglePin,
}: SessionDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const filtered = sessions.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase()),
  );
  const pinned = filtered.filter((s) => s.isPinned);
  const recent = filtered.filter((s) => !s.isPinned);

  const displayTitle = currentTitle || "New Chat";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground bg-muted hover:bg-accent transition-colors cursor-pointer"
      >
        <span className="max-w-[200px] truncate">{displayTitle}</span>
        <IconChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-72 bg-popover border border-border rounded-xl shadow-xl z-50 overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-border">
            <div className="flex items-center gap-2 px-2 py-1.5 bg-muted rounded-lg">
              <IconSearch className="w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search chats..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 text-xs bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto p-1">
            {/* Pinned section */}
            {pinned.length > 0 && (
              <>
                <div className="px-2 py-1 text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                  📌 Pinned
                </div>
                {pinned.map((session) => (
                  <SessionItem
                    key={session.sessionId}
                    session={session}
                    isActive={session.sessionId === currentSessionId}
                    onSelect={() => { onSelectSession(session.sessionId); setOpen(false); }}
                    onTogglePin={() => onTogglePin(session.sessionId, !session.isPinned)}
                  />
                ))}
              </>
            )}

            {/* Recent section */}
            <div className="px-2 py-1 text-[10px] text-muted-foreground uppercase tracking-wider font-medium mt-1">
              Recent
            </div>
            {recent.length === 0 ? (
              <div className="px-3 py-4 text-xs text-muted-foreground text-center">
                No chats yet
              </div>
            ) : (
              recent.map((session) => (
                <SessionItem
                  key={session.sessionId}
                  session={session}
                  isActive={session.sessionId === currentSessionId}
                  onSelect={() => { onSelectSession(session.sessionId); setOpen(false); }}
                  onTogglePin={() => onTogglePin(session.sessionId, !session.isPinned)}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SessionItem({
  session,
  isActive,
  onSelect,
  onTogglePin,
}: {
  session: ChatSession;
  isActive: boolean;
  onSelect: () => void;
  onTogglePin: () => void;
}) {
  return (
    <div
      className={`group flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors ${
        isActive ? "bg-indigo-500/15 text-indigo-300" : "hover:bg-accent"
      }`}
    >
      <div className="flex-1 min-w-0" onClick={onSelect}>
        <div className="text-xs font-medium truncate text-foreground">
          {session.title}
        </div>
        <div className="text-[10px] text-muted-foreground mt-0.5">
          {formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true })}
        </div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onTogglePin(); }}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
      >
        {session.isPinned ? (
          <IconPinFilled className="w-3 h-3 text-indigo-400" />
        ) : (
          <IconPin className="w-3 h-3 text-muted-foreground" />
        )}
      </button>
    </div>
  );
}
