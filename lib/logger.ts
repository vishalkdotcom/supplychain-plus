/**
 * Structured logging utility.
 *
 * Wraps console methods with JSON-structured output including timestamp,
 * log level, context identifier, and optional error metadata.
 * Zero dependencies — can be swapped for pino/winston later.
 */

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

function log(
  level: LogLevel,
  context: string,
  message: string,
  error?: unknown,
  meta?: Record<string, unknown>,
): void {
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

  method(JSON.stringify(payload));
}

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
