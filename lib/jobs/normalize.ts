import type { ArbeitnowJob, NormalizedJob } from "./types";

export function normalizeArbeitnowJob(job: ArbeitnowJob): NormalizedJob {
  const requiredSkills = extractSkillsFromJob(job);

  return {
    externalId: job.slug,
    title: job.title,
    company: job.company_name,
    location: job.location,
    locationType: job.remote ? "remote" : "onsite",
    description: stripHtml(job.description),
    requiredSkills,
    postedDate: job.created_at
      ? new Date(job.created_at * 1000)
      : null,
    source: "arbeitnow",
    url: job.url,
    remote: job.remote,
    tags: job.tags ?? [],
    jobTypes: job.job_types ?? [],
  };
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const COMMON_SKILLS = [
  "javascript",
  "typescript",
  "python",
  "java",
  "react",
  "node",
  "nodejs",
  "angular",
  "vue",
  "sql",
  "postgresql",
  "mysql",
  "mongodb",
  "aws",
  "azure",
  "docker",
  "kubernetes",
  "git",
  "agile",
  "scrum",
  "figma",
  "html",
  "css",
  "tailwind",
  "nextjs",
  "graphql",
  "rest",
  "api",
  "linux",
  "ci/cd",
  "terraform",
  "machine learning",
  "data analysis",
  "excel",
  "communication",
  "leadership",
  "project management",
  "customer service",
  "sales",
  "marketing",
  "seo",
  "content writing",
  "design",
  "ui/ux",
  "photoshop",
  "illustrator",
  "php",
  "ruby",
  "go",
  "golang",
  "rust",
  "c++",
  "c#",
  ".net",
  "spring",
  "django",
  "flask",
  "fastapi",
  "redis",
  "elasticsearch",
  "kafka",
  "spark",
  "tableau",
  "power bi",
  "sap",
  "salesforce",
];

export function extractSkillsFromJob(job: ArbeitnowJob): string[] {
  const text = `${job.title} ${stripHtml(job.description)} ${(job.tags ?? []).join(" ")}`.toLowerCase();
  const found = new Set<string>();

  for (const skill of COMMON_SKILLS) {
    if (text.includes(skill.toLowerCase())) {
      found.add(formatSkillName(skill));
    }
  }

  for (const tag of job.tags ?? []) {
    const normalized = formatSkillName(tag);
    if (normalized.length > 1 && !isNoiseTag(normalized)) {
      found.add(normalized);
    }
  }

  return Array.from(found).slice(0, 30);
}

function formatSkillName(skill: string): string {
  return skill
    .split(/[\s-/]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function isNoiseTag(tag: string): boolean {
  const noise = [
    "high school",
    "bachelor",
    "master",
    "phd",
    "experienced",
    "entry level",
    "contract",
    "full time",
    "part time",
  ];
  return noise.some((n) => tag.toLowerCase().includes(n));
}
