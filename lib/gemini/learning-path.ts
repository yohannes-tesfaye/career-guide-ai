import { generateJson, isGeminiConfigured } from "./client";

export interface LearningResourceSuggestion {
  title: string;
  provider: string;
  url: string;
  type: "course" | "project" | "certification" | "article";
  skill: string;
  duration: string;
  cost: string;
  description: string;
}

export interface GeminiLearningPathResult {
  pathTitle: string;
  summary: string;
  estimatedWeeks: number;
  resources: LearningResourceSuggestion[];
}

export async function generateLearningPathWithGemini(params: {
  missingSkills: string[];
  experienceGaps: string[];
  jobTitle: string;
  matchPercentage: number;
  careerGoal?: string | null;
}): Promise<GeminiLearningPathResult | null> {
  if (!isGeminiConfigured()) return null;

  const prompt = `You are a career learning advisor. Create a learning path to bridge skill gaps for a job candidate.

Target job: ${params.jobTitle}
Current match: ${params.matchPercentage}%
Missing skills: ${params.missingSkills.join(", ") || "none"}
Experience gaps: ${params.experienceGaps.join("; ") || "none"}
Career goal: ${params.careerGoal ?? "advance in tech career"}

Suggest 5-8 specific open-source or free resources (Coursera audit, freeCodeCamp, MDN, GitHub repos, Google/Microsoft free certs, YouTube playlists with real URLs when possible).

Return JSON only:
{
  "pathTitle": "<title>",
  "summary": "<1-2 sentences>",
  "estimatedWeeks": <number>,
  "resources": [
    {
      "title": "<name>",
      "provider": "<platform>",
      "url": "<valid https URL>",
      "type": "course" | "project" | "certification" | "article",
      "skill": "<skill this addresses>",
      "duration": "<e.g. 2 weeks>",
      "cost": "Free" | "<amount>",
      "description": "<one sentence>"
    }
  ]
}`;

  try {
    return await generateJson<GeminiLearningPathResult>(prompt);
  } catch (error) {
    console.error("Gemini learning path failed:", error);
    return null;
  }
}
