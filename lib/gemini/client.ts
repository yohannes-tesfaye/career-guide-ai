import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL = "gemini-2.0-flash";

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return new GoogleGenerativeAI(apiKey);
}

export async function generateJson<T>(prompt: string): Promise<T> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({
    model: MODEL,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.4,
    },
  });

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return JSON.parse(text) as T;
}

export async function generateText(prompt: string): Promise<string> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({
    model: MODEL,
    generationConfig: { temperature: 0.5 },
  });

  const result = await model.generateContent(prompt);
  return result.response.text();
}

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}
