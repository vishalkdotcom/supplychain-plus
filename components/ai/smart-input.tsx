"use client";

import { useState, useRef, useEffect, useImperativeHandle, forwardRef, type KeyboardEvent, type Ref } from "react";
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
  { command: "/forecast", label: "Forecast", description: "Show 60-day risk forecasts", query: "Show me the 60-day risk forecast for suppliers" },
  { command: "/clusters", label: "Clusters", description: "Show systemic case patterns", query: "What systemic patterns have been detected across suppliers?" },
  { command: "/anomalies", label: "Anomalies", description: "Show wage and payslip anomalies", query: "Show me current payslip anomalies and wage issues" },
  { command: "/signals", label: "Signals", description: "Show monitoring signals", query: "Show me active supplier monitoring signals" },
  { command: "/voice", label: "Voice", description: "Show worker voice trends", query: "What are workers talking about? Show me voice trends" },
  { command: "/remediation", label: "Remediation", description: "Show remediation plans", query: "Show me the current remediation plans and their status" },
  { command: "/survey", label: "Survey", description: "Design a worker survey", query: "Help me design a new worker survey" },
  { command: "/training", label: "Training", description: "Create training course", query: "Help me create a new training course" },
  { command: "/recalculate", label: "Recalculate", description: "Trigger risk recalculation", query: "Recalculate all supplier risk scores" },
];

// Handle exposed by CommandMenu so the parent can forward keyboard events
interface CommandMenuHandle {
  handleKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => boolean;
}

interface CommandMenuProps {
  commands: SlashCommand[];
  onSelect: (cmd: SlashCommand) => void;
}

// CommandMenu owns selectedIndex and dismissed — both reset automatically
// when the parent changes the `key` prop (driven by input value).
const CommandMenu = forwardRef(function CommandMenu(
  { commands, onSelect }: CommandMenuProps,
  ref: Ref<CommandMenuHandle>,
) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useImperativeHandle(ref, () => ({
    handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
      if (dismissed) return false;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, commands.length - 1));
        return true;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        return true;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        onSelect(commands[selectedIndex]);
        return true;
      }
      if (e.key === "Escape") {
        setDismissed(true);
        return true;
      }
      return false;
    },
  }));

  if (dismissed || commands.length === 0) return null;

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 bg-popover border border-border rounded-xl shadow-xl overflow-hidden z-50">
      {commands.map((cmd, i) => (
        <button
          key={cmd.command}
          onClick={() => onSelect(cmd)}
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
  );
});

interface SmartInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (message: string) => void;
  isLoading: boolean;
}

export function SmartInput({ value, onChange, onSubmit, isLoading }: SmartInputProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<CommandMenuHandle>(null);

  // Filter commands based on input
  const isSlashTyping = value.startsWith("/");
  const filteredCommands = isSlashTyping
    ? SLASH_COMMANDS.filter((cmd) =>
        cmd.command.startsWith(value.toLowerCase().trim()),
      )
    : [];

  const showMenu = isSlashTyping && filteredCommands.length > 0;

  const selectCommand = (cmd: SlashCommand) => {
    onSubmit(cmd.query);
    onChange("");
  };

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSubmit(trimmed);
    onChange("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Let the menu handle navigation/selection keys first
    if (menuRef.current?.handleKeyDown(e)) return;

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
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
      {/* key={value} resets selectedIndex and dismissed on every keystroke */}
      {showMenu && (
        <CommandMenu
          key={value}
          ref={menuRef}
          commands={filteredCommands}
          onSelect={selectCommand}
        />
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
          {["/risk", "/clusters", "/forecast", "/voice"].map((cmd) => (
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
