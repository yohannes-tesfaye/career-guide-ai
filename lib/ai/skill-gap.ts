import { askJson } from "./gemini";
import { friendlyAiMessage } from "./messages";

export type SkillGapAiResult = {
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  experienceGaps: string[];
  reportSummary: string;
  strengths: string[];
  recommendations: string[];
};

const PROMPT = (p: Record<string, unknown>) => `Compare candidate vs job. Return ONLY JSON:
${JSON.stringify(p)}

{"matchPercentage":0,"matchedSkills":[],"missingSkills":[],"experienceGaps":[],"reportSummary":"","strengths":[],"recommendations":[]}`;

export async function buildSkillGapAnalysis(params: Record<string, unknown>) {
  try {
    const { data, source } = await askJson<SkillGapAiResult>(PROMPT(params));
    return { analysis: data, source: source as "gemini" | "fallback", warning: null };
  } catch (e) {
    return {
      analysis: null,
      source: "fallback" as const,
      warning: friendlyAiMessage(e),
    };
  }
}
