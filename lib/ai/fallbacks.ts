import type { OptimizedResumeSection } from "@/lib/gemini/resume";

const FREE_RESOURCES: Record<
  string,
  { title: string; provider: string; url: string; type: string; duration: string }
> = {
  javascript: {
    title: "JavaScript Algorithms and Data Structures",
    provider: "freeCodeCamp",
    url: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/",
    type: "course",
    duration: "4 weeks",
  },
  python: {
    title: "Scientific Computing with Python",
    provider: "freeCodeCamp",
    url: "https://www.freecodecamp.org/learn/scientific-computing-with-python/",
    type: "course",
    duration: "4 weeks",
  },
  react: {
    title: "React Documentation",
    provider: "React",
    url: "https://react.dev/learn",
    type: "course",
    duration: "2 weeks",
  },
  sql: {
    title: "SQL Tutorial",
    provider: "W3Schools",
    url: "https://www.w3schools.com/sql/",
    type: "course",
    duration: "1 week",
  },
  default: {
    title: "Developer Roadmaps",
    provider: "roadmap.sh",
    url: "https://roadmap.sh/",
    type: "article",
    duration: "ongoing",
  },
};

export function fallbackResume(params: {
  name: string;
  currentTitle: string | null;
  bio: string | null;
  location: string | null;
  targetRole?: string | null;
  skills: { name: string }[];
  workExperience: { role: string; company: string; description: string }[];
  education: { degree: string; institution: string }[];
}): OptimizedResumeSection {
  const role = params.targetRole ?? params.currentTitle ?? "Professional";
  return {
    headline: `${role} | ${params.location ?? ""}`.trim(),
    summary:
      params.bio ??
      `Experienced ${role} with strengths in ${params.skills.slice(0, 5).map((s) => s.name).join(", ") || "multiple domains"}.`,
    skills: params.skills.map((s) => s.name).slice(0, 12),
    experienceBullets: params.workExperience.map((e) => ({
      role: e.role,
      company: e.company,
      bullets: e.description
        ? e.description.split(/\n|•/).filter(Boolean).slice(0, 4)
        : [`Contributed as ${e.role} at ${e.company}`],
    })),
    educationBullets: params.education.map((e) => ({
      degree: e.degree,
      institution: e.institution,
      detail: "",
    })),
    atsKeywords: params.skills.map((s) => s.name),
    tips: [
      "Add metrics to each bullet (%, $, time saved).",
      "Mirror keywords from the job description.",
      "Enable Gemini when quota is available for richer wording.",
    ],
  };
}

export function fallbackLearningPath(params: {
  missingSkills: string[];
  jobTitle: string;
}) {
  const resources = params.missingSkills.slice(0, 6).map((skill) => {
    const key = Object.keys(FREE_RESOURCES).find((k) =>
      skill.toLowerCase().includes(k)
    );
    const base = FREE_RESOURCES[key ?? "default"];
    return {
      title: base.title,
      provider: base.provider,
      url: base.url,
      type: base.type as "course",
      skill,
      duration: base.duration,
      cost: "Free",
      description: `Learn ${skill} for ${params.jobTitle}`,
    };
  });

  if (resources.length === 0) {
    const base = FREE_RESOURCES.default;
    resources.push({
      title: base.title,
      provider: base.provider,
      url: base.url,
      type: base.type as "course",
      skill: "General",
      duration: base.duration,
      cost: "Free",
      description: `Career growth path for ${params.jobTitle}`,
    });
  }

  return {
    pathTitle: `Bridge gaps for ${params.jobTitle}`,
    summary: "Curated free resources (fallback — Gemini quota unavailable).",
    estimatedWeeks: Math.max(4, resources.length * 2),
    resources,
  };
}
