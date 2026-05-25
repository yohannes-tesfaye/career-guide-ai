import { askJson } from "./gemini";
import { fallbackLearningPath } from "./fallbacks";
import { friendlyAiMessage } from "./messages";

export type LearningPathAiResult = {
  pathTitle: string;
  summary: string;
  estimatedWeeks: number;
  resources: {
    title: string;
    provider: string;
    url: string;
    type: string;
    skill: string;
    duration: string;
    cost: string;
    description: string;
  }[];
};

const PROMPT = (p: Record<string, unknown>) => `Create a learning path JSON:
${JSON.stringify(p)}

5-6 free resources with real https URLs. Return ONLY JSON:
{"pathTitle":"","summary":"","estimatedWeeks":4,"resources":[{"title":"","provider":"","url":"https://...","type":"course","skill":"","duration":"","cost":"Free","description":""}]}`;

export async function buildLearningPath(params: {
  missingSkills: string[];
  jobTitle: string;
  matchPercentage: number;
}) {
  try {
    const { data, source } = await askJson<LearningPathAiResult>(PROMPT(params));
    return { path: data, source: source as "gemini" | "fallback", warning: null };
  } catch {
    return {
      path: fallbackLearningPath({
        missingSkills: params.missingSkills,
        jobTitle: params.jobTitle,
      }),
      source: "fallback" as const,
      warning: friendlyAiMessage(new Error("ai")),
    };
  }
}
