/**
 * Structured logging utility.
 *
 * Wraps console methods with JSON-structured output including timestamp,
 * log level, context identifier, and optional error metadata.
 *
 * Features:
 * - Console output (always on)
 * - File output (when LOG_FILE env var is set)
 * - Level filtering (LOG_LEVEL env var, default: "info")
 * - Size-based log rotation (10 MB max, keeps 5 rotated files)
 *
 * Zero runtime dependencies — uses only Node.js built-in fs/path.
 */

import {
  appendFileSync,
  existsSync,
  mkdirSync,
  renameSync,
  statSync,
  unlinkSync,
} from "fs";
import { dirname } from "path";

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogPayload {
  timestamp: string;
  level: LogLevel;
  context: string;
  message: string;
  errorMessage?: string;
  stack?: string;
  [key: string]: unknown;
}

// ─── Level filtering ──────────────────────────────────────

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/** Reads LOG_LEVEL on each call so it can be changed at runtime. */
function getMinLevel(): number {
  const env = (process.env.LOG_LEVEL || "info").toLowerCase() as LogLevel;
  return LEVEL_PRIORITY[env] ?? LEVEL_PRIORITY.info;
}

// ─── File transport with rotation ─────────────────────────

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_ROTATED_FILES = 5;

let _dirEnsured = false;

function rotateIfNeeded(filePath: string): void {
  try {
    const stat = statSync(filePath);
    if (stat.size < MAX_FILE_SIZE) return;
  } catch {
    return; // File doesn't exist yet
  }

  // Shift rotated files: .5 deleted, .4→.5, .3→.4, .2→.3, .1→.2, current→.1
  for (let i = MAX_ROTATED_FILES; i >= 1; i--) {
    const src = i === 1 ? filePath : `${filePath}.${i - 1}`;
    const dest = `${filePath}.${i}`;
    try {
      if (i === MAX_ROTATED_FILES) {
        try { unlinkSync(dest); } catch { /* ok if missing */ }
      }
      renameSync(src, dest);
    } catch { /* source doesn't exist, skip */ }
  }
}

function writeToFile(line: string): void {
  const filePath = process.env.LOG_FILE;
  if (!filePath) return;

  // Ensure parent directory exists (once per process)
  if (!_dirEnsured) {
    const dir = dirname(filePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    _dirEnsured = true;
  }

  rotateIfNeeded(filePath);
  appendFileSync(filePath, line + "\n", "utf-8");
}

// ─── Core log function ────────────────────────────────────

function log(
  level: LogLevel,
  context: string,
  message: string,
  error?: unknown,
  meta?: Record<string, unknown>,
): void {
  if (LEVEL_PRIORITY[level] < getMinLevel()) return;

  const payload: LogPayload = {
    timestamp: new Date().toISOString(),
    level,
    context,
    message,
    ...meta,
  };

  if (error instanceof Error) {
    payload.errorMessage = error.message;
    payload.stack = error.stack;
  } else if (error !== undefined) {
    payload.errorMessage = String(error);
  }

  const method =
    level === "error"
      ? console.error
      : level === "warn"
        ? console.warn
        : level === "debug"
          ? console.debug
          : console.log;

  const jsonLine = JSON.stringify(payload);
  method(jsonLine);
  writeToFile(jsonLine);
}

// ─── Public API (unchanged) ───────────────────────────────

export const logger = {
  debug: (context: string, message: string, meta?: Record<string, unknown>) =>
    log("debug", context, message, undefined, meta),
  info: (context: string, message: string, meta?: Record<string, unknown>) =>
    log("info", context, message, undefined, meta),
  warn: (
    context: string,
    message: string,
    error?: unknown,
    meta?: Record<string, unknown>,
  ) => log("warn", context, message, error, meta),
  error: (
    context: string,
    message: string,
    error?: unknown,
    meta?: Record<string, unknown>,
  ) => log("error", context, message, error, meta),
};
