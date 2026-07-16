/**
 * Shared date-age formatting utilities.
 * Extracted from duplicated implementations across Connect pages.
 */

import { now } from "@/lib/demo-mode/profile";

/**
 * Format a date string as a relative age label.
 * @param dateStr - ISO date or datetime string
 * @param short - Use abbreviated format ("1d ago" vs "1 day ago")
 */
export function formatAge(dateStr: string, short = false): string {
  const days = Math.floor(
    (now().getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24),
  );
  if (days === 0) return "today";
  if (days === 1) return short ? "1d ago" : "1 day ago";
  return short ? `${days}d ago` : `${days} days ago`;
}

export type FreshnessLevel = "fresh" | "aging" | "stale" | "never";

// Thresholds in hours
const FRESH_THRESHOLD_HOURS = 24;
const AGING_THRESHOLD_DAYS = 7;

/**
 * Format a timestamp for freshness display with color-coded level.
 * Returns hour-level granularity for recent times, day-level for older.
 */
export function formatFreshnessAge(
  isoTimestamp: string | null | undefined,
): { text: string; level: FreshnessLevel } {
  if (!isoTimestamp) return { text: "Never", level: "never" };

  const ms = now().getTime() - new Date(isoTimestamp).getTime();
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  let text: string;
  if (hours < 1) text = "Just now";
  else if (hours < FRESH_THRESHOLD_HOURS) text = `${hours}h ago`;
  else if (days === 1) text = "1 day ago";
  else text = `${days} days ago`;

  let level: FreshnessLevel;
  if (hours < FRESH_THRESHOLD_HOURS) level = "fresh";
  else if (days <= AGING_THRESHOLD_DAYS) level = "aging";
  else level = "stale";

  return { text, level };
}
