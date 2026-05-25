import { generateJson, isGeminiConfigured } from "./client";

export interface GeminiSkillGapResult {
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  experienceGaps: string[];
  reportSummary: string;
  strengths: string[];
  recommendations: string[];
}

export async function analyzeSkillGapWithGemini(params: {
  jobTitle: string;
  company: string;
  jobDescription: string;
  requiredSkills: string[];
  userSkills: { name: string; proficiency: number }[];
  workExperience: {
    role: string;
    company: string;
    description: string;
  }[];
  currentTitle?: string | null;
  careerGoal?: string | null;
}): Promise<GeminiSkillGapResult | null> {
  if (!isGeminiConfigured()) return null;

  const prompt = `You are a career coach AI. Compare the candidate profile against the job requirements.

JOB:
Title: ${params.jobTitle}
Company: ${params.company}
Detected skills/tags: ${params.requiredSkills.join(", ") || "none listed"}

JOB DESCRIPTION (excerpt):
${params.jobDescription.slice(0, 4000)}

CANDIDATE:
Current title: ${params.currentTitle ?? "Not specified"}
Career goal: ${params.careerGoal ?? "Not specified"}
Skills: ${params.userSkills.map((s) => `${s.name} (${s.proficiency}%)`).join(", ") || "none"}

Work experience:
${params.workExperience.map((e) => `- ${e.role} at ${e.company}: ${e.description.slice(0, 300)}`).join("\n") || "none"}

Return JSON only with this exact structure:
{
  "matchPercentage": <number 0-100>,
  "matchedSkills": [<skills the candidate already has that match the job>],
  "missingSkills": [<specific skills or tools they lack>],
  "experienceGaps": [<specific experience areas missing from their background>],
  "reportSummary": "<2-3 sentence summary>",
  "strengths": [<candidate strengths for this role>],
  "recommendations": [<actionable steps to improve fit>]
}`;

  try {
    return await generateJson<GeminiSkillGapResult>(prompt);
  } catch (error) {
    console.error("Gemini skill-gap analysis failed:", error);
    return null;
  }
}
