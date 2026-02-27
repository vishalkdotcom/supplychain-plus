/**
 * Strip <think>...</think> reasoning tags that some models (e.g. NIM)
 * leak into their output. Also trims the result.
 */
export function stripThinkingTags(text: string): string {
  return text.replace(/<think>[\s\S]*?<\/think>\s*/gi, "").trim();
}
