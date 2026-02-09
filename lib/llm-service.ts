import OpenAI from "openai";

interface LLMService {
  generateCaseSummary(caseText: string): Promise<string>;
  generateSurveyQuestions(prompt: string): Promise<
    ({
      id: number;
      text: string;
    } & (
      | {
          type: "yes_no";
        }
      | {
          type: "likert";
          options: string[];
        }
    ))[]
  >;
}

export class OpenAIService implements LLMService {
  private openai: OpenAI | null = null;
  private readonly mockMode: boolean = false;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    } else {
      console.warn("OPENAI_API_KEY not found. Running in mock mode.");
      this.mockMode = true;
    }
  }

  async generateCaseSummary(caseText: string): Promise<string> {
    if (this.mockMode || !this.openai) {
      return "Global brands engaged to investigate remediation plan. (Mock AI Summary - configure API key for real results)";
    }

    try {
      const completion = await this.openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant for a supply chain management platform. Summarize the following worker grievance case into 1-2 concise sentences.",
          },
          {
            role: "user",
            content: caseText,
          },
        ],
        model: "gpt-4o-mini",
      });

      return (
        completion.choices[0]?.message?.content || "Could not generate summary."
      );
    } catch (error) {
      console.error("Error generating summary:", error);
      return "Error generating summary. Please check your API configuration.";
    }
  }

  async generateSurveyQuestions(prompt: string): Promise<
    ({
      id: number;
      text: string;
    } & (
      | {
          type: "yes_no";
        }
      | {
          type: "likert";
          options: string[];
        }
    ))[]
  > {
    if (this.mockMode || !this.openai) {
      // Return existing mock data structure for fallback
      return [
        {
          id: 1,
          text: `Mock Question 1 based on "${prompt}"`,
          type: "yes_no",
        },
        {
          id: 2,
          text: "Mock Question 2 (Rate 1-5)",
          type: "likert",
          options: ["1", "2", "3", "4", "5"],
        },
      ];
    }

    try {
      const completion = await this.openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are an expert survey designer for factory workers. Generate 5 survey questions based on the user's prompt. 
            Return a JSON array of objects with the following structure:
            {
              "id": number,
              "text": string,
              "type": "yes_no" | "likert" | "open_text",
              "options": string[] (optional, required for likert)
            }
            Do not include markdown formatting like \`\`\`json. Just return the raw JSON array.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "gpt-4o-mini",
      });

      const content = completion.choices[0]?.message?.content?.trim() || "[]";
      // Clean up potential markdown formatting if the model disregards instructions
      const jsonStr = content
        .replace(/^```json/, "")
        .replace(/^```/, "")
        .replace(/```$/, "");

      return JSON.parse(jsonStr);
    } catch (error) {
      console.error("Error generating survey:", error);
      return [];
    }
  }
}

export const llmService = new OpenAIService();
