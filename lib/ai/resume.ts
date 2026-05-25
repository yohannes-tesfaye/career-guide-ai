import { askJson } from "./gemini";
import { fallbackResume } from "./fallbacks";
import { friendlyAiMessage } from "./messages";
import type { OptimizedResumeSection } from "@/lib/gemini/resume";

const PROMPT = (p: Record<string, unknown>) => `Create ATS resume JSON for:
${JSON.stringify(p, null, 0)}

Return ONLY JSON:
{"headline":"","summary":"","skills":[],"experienceBullets":[{"role":"","company":"","bullets":[]}],"educationBullets":[{"degree":"","institution":"","detail":""}],"atsKeywords":[],"tips":[]}`;

export async function buildResume(params: Parameters<typeof fallbackResume>[0]) {
  try {
    const { data, source } = await askJson<OptimizedResumeSection>(PROMPT(params));
    return { resume: data, source: source as "gemini" | "fallback", warning: null };
  } catch (e) {
    return {
      resume: fallbackResume(params),
      source: "fallback" as const,
      warning: friendlyAiMessage(e),
    };
  }
}
