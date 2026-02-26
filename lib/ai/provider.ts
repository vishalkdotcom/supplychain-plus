import { openai } from "@ai-sdk/openai";

// Central model definitions — swap provider by changing these lines
// e.g., import { anthropic } from "@ai-sdk/anthropic"; export const model = anthropic("claude-sonnet-4-20250514");

/** Default model for most tasks: chat, summaries, guidance, survey questions */
export const model = openai("gpt-4o-mini");

/** Stronger model for complex tasks: HRDD reports, detailed analysis */
export const strongModel = openai("gpt-4o");
