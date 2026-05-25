import { GoogleGenerativeAI } from "@google/generative-ai";
import { friendlyAiMessage } from "./messages";

/** Try newest stable models first; 1.5-* often 404 on v1beta */
const MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
];

export type AiSource = "gemini" | "fallback";

export class AiError extends Error {
  constructor(
    message: string,
    public code: "NO_KEY" | "QUOTA" | "API" | "PARSE"
  ) {
    super(message);
    this.name = "AiError";
  }
}

function parseJsonFromText<T>(text: string): T {
  const cleaned = text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
  return JSON.parse(cleaned) as T;
}

function mapApiError(err: unknown): AiError {
  const friendly = friendlyAiMessage(err);
  const raw = err instanceof Error ? err.message : String(err);

  if (raw.includes("GEMINI_API_KEY") || !process.env.GEMINI_API_KEY?.trim()) {
    return new AiError(friendly, "NO_KEY");
  }
  if (raw.includes("429") || raw.includes("quota") || raw.includes("Quota")) {
    return new AiError(friendly, "QUOTA");
  }
  return new AiError(friendly, "API");
}

export async function askJson<T>(
  prompt: string
): Promise<{ data: T; source: AiSource }> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new AiError("Add GEMINI_API_KEY to your .env file.", "NO_KEY");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  let lastError: unknown;

  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return { data: parseJsonFromText<T>(text), source: "gemini" };
    } catch (e) {
      lastError = e;
      if (process.env.NODE_ENV === "development") {
        const name = modelName;
        const msg = e instanceof Error ? e.message : String(e);
        console.warn(`[gemini] ${name} failed:`, msg.slice(0, 200));
      }
      continue;
    }
  }

  throw mapApiError(lastError);
}
