import { generateJson, isGeminiConfigured } from "./client";

export interface OptimizedResumeSection {
  headline: string;
  summary: string;
  skills: string[];
  experienceBullets: { role: string; company: string; bullets: string[] }[];
  educationBullets: { degree: string; institution: string; detail: string }[];
  atsKeywords: string[];
  tips: string[];
}

export async function optimizeResumeWithGemini(params: {
  name: string;
  currentTitle: string | null;
  bio: string | null;
  location: string | null;
  careerGoal: string | null;
  skills: { name: string; proficiency: number }[];
  workExperience: {
    role: string;
    company: string;
    description: string;
  }[];
  education: {
    degree: string;
    institution: string;
    fieldOfStudy?: string | null;
  }[];
  targetRole?: string | null;
}): Promise<OptimizedResumeSection | null> {
  if (!isGeminiConfigured()) return null;

  const prompt = `You are an ATS resume expert. Optimize this profile into ATS-friendly resume content.

Candidate: ${params.name}
Title: ${params.currentTitle ?? ""}
Location: ${params.location ?? ""}
Bio: ${params.bio ?? ""}
Career goal: ${params.careerGoal ?? ""}
Target role: ${params.targetRole ?? params.currentTitle ?? "professional role"}

Skills: ${params.skills.map((s) => s.name).join(", ")}
Experience: ${JSON.stringify(params.workExperience.slice(0, 5))}
Education: ${JSON.stringify(params.education.slice(0, 3))}

Return JSON only:
{
  "headline": "<professional headline>",
  "summary": "<3-4 sentence ATS summary>",
  "skills": [<top 12 ATS keywords/skills>],
  "experienceBullets": [{"role":"","company":"","bullets":["action verb bullet",...]}],
  "educationBullets": [{"degree":"","institution":"","detail":""}],
  "atsKeywords": [<15 keywords for ATS scanning>],
  "tips": [<3 improvement tips>]
}`;

  try {
    return await generateJson<OptimizedResumeSection>(prompt);
  } catch (error) {
    console.error("Gemini resume optimization failed:", error);
    return null;
  }
}
