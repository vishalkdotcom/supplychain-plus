import { z } from "zod";

// ===============================
// Case AI Guidance
// ===============================

export const caseGuidanceSchema = z.object({
  recommendedSteps: z
    .array(z.string())
    .describe("3-5 specific, actionable investigation or resolution steps"),
  draftResponse: z
    .string()
    .describe(
      "Professional reply to the worker acknowledging their concern, 50-80 words",
    ),
  relatedTraining: z
    .array(z.string())
    .describe("1-2 relevant training course topics to prevent recurrence"),
  estimatedResolutionDays: z
    .number()
    .describe("Realistic resolution estimate in business days"),
});

export type CaseGuidance = z.infer<typeof caseGuidanceSchema>;

// ===============================
// Survey Questions Generation
// ===============================

export const surveyQuestionSchema = z.object({
  id: z.number(),
  text: z.string().describe("The survey question text"),
  type: z.enum(["yes_no", "likert", "open_text"]),
  options: z
    .array(z.string())
    .optional()
    .describe("Options for likert-type questions"),
});

export const surveyQuestionsSchema = z.array(surveyQuestionSchema);

export type SurveyQuestion = z.infer<typeof surveyQuestionSchema>;

// ===============================
// Survey Sentiment Analysis
// ===============================

export const surveyThemeSchema = z.object({
  name: z.string().describe("Theme name, e.g., 'Overtime', 'Safety'"),
  sentiment: z.enum(["positive", "negative", "neutral"]),
  mentionCount: z
    .number()
    .describe("Approximate number of responses mentioning this theme"),
});

export const surveyAnalysisSchema = z.object({
  themes: z.array(surveyThemeSchema),
  sentimentPositive: z
    .number()
    .describe("Percentage of positive responses (0-100)"),
  sentimentNegative: z
    .number()
    .describe("Percentage of negative responses (0-100)"),
  sentimentNeutral: z
    .number()
    .describe("Percentage of neutral responses (0-100)"),
  insight: z
    .string()
    .describe(
      "1-2 sentence executive summary of survey findings and recommendations",
    ),
  riskScore: z
    .number()
    .describe("Risk score 0-100 based on survey responses, higher = more risk"),
});

export type SurveyAnalysis = z.infer<typeof surveyAnalysisSchema>;

// ===============================
// Chat Intent Classification
// ===============================

export const chatIntentSchema = z.object({
  type: z.enum([
    "supplier_risk",
    "case_query",
    "training_rec",
    "survey_insight",
    "hrdd_help",
    "general",
  ]),
  filters: z
    .object({
      country: z.string().optional(),
      severity: z.enum(["high", "medium", "low"]).optional(),
      supplierId: z.string().optional(),
      dateRange: z.string().optional(),
    })
    .optional(),
});

export type ChatIntent = z.infer<typeof chatIntentSchema>;
