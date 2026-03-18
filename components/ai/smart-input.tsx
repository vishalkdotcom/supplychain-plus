"use client";

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { IconArrowUp } from "@tabler/icons-react";

export interface SlashCommand {
  command: string;
  label: string;
  description: string;
  query: string; // the actual message sent to the AI
}

const SLASH_COMMANDS: SlashCommand[] = [
  { command: "/report", label: "Report", description: "Generate HRDD compliance report", query: "Generate an HRDD compliance report for the current period" },
  { command: "/risk", label: "Risk", description: "Show current risk overview", query: "Show me the current supplier risk overview" },
  { command: "/cases", label: "Cases", description: "Search grievance cases", query: "Show me recent grievance cases" },
  { command: "/forecast", label: "Forecast", description: "Show risk forecasts", query: "Show me the 60-day risk forecast for suppliers" },
  { command: "/survey", label: "Survey", description: "Design a worker survey", query: "Help me design a new worker survey" },
  { command: "/training", label: "Training", description: "Create training course", query: "Help me create a new training course" },
  { command: "/recalculate", label: "Recalculate", description: "Trigger risk recalculation", query: "Recalculate all supplier risk scores" },
];

interface SmartInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (message: string) => void;
  isLoading: boolean;
}

export function SmartInput({ value, onChange, onSubmit, isLoading }: SmartInputProps) {
  const [showCommands, setShowCommands] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Filter commands based on input
  const isSlashTyping = value.startsWith("/");
  const filteredCommands = isSlashTyping
    ? SLASH_COMMANDS.filter((cmd) =>
        cmd.command.startsWith(value.toLowerCase().trim()),
      )
    : [];

  useEffect(() => {
    setShowCommands(isSlashTyping && filteredCommands.length > 0);
    setSelectedIndex(0);
  }, [value, isSlashTyping, filteredCommands.length]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (showCommands) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filteredCommands.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        selectCommand(filteredCommands[selectedIndex]);
      } else if (e.key === "Escape") {
        setShowCommands(false);
      }
      return;
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const selectCommand = (cmd: SlashCommand) => {
    onSubmit(cmd.query);
    onChange("");
    setShowCommands(false);
  };

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSubmit(trimmed);
    onChange("");
  };

  // Auto-resize textarea
  useEffect(() => {
    const el = inputRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 120) + "px";
    }
  }, [value]);

  return (
    <div className="relative">
      {/* Slash command menu */}
      {showCommands && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-popover border border-border rounded-xl shadow-xl overflow-hidden z-50">
          {filteredCommands.map((cmd, i) => (
            <button
              key={cmd.command}
              onClick={() => selectCommand(cmd)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors cursor-pointer ${
                i === selectedIndex ? "bg-accent" : "hover:bg-accent/50"
              }`}
            >
              <span className="text-xs font-mono text-indigo-400 w-24">
                {cmd.command}
              </span>
              <span className="text-xs text-foreground">{cmd.description}</span>
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div className="flex items-end gap-3 bg-muted rounded-2xl px-4 py-3 border border-border focus-within:border-indigo-500/50 transition-colors">
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about your supply chain, or type / for commands..."
          rows={1}
          className="flex-1 text-sm bg-transparent border-none outline-none resize-none text-foreground placeholder:text-muted-foreground min-h-[24px]"
          disabled={isLoading}
        />

        {/* Command hints */}
        <div className="hidden sm:flex items-center gap-1 mb-0.5">
          {["/report", "/risk", "/cases"].map((cmd) => (
            <button
              key={cmd}
              onClick={() => onChange(cmd)}
              className="rounded-md px-2 py-0.5 text-[10px] text-muted-foreground bg-background hover:bg-accent transition-colors cursor-pointer"
            >
              {cmd}
            </button>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!value.trim() || isLoading}
          className="rounded-lg w-8 h-8 flex items-center justify-center bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex-shrink-0"
        >
          <IconArrowUp className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
