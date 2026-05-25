import { prisma } from "@/lib/prisma";
import { Prisma } from "../../generated/prisma/client";
import { extractExperienceGaps } from "./skill-extractor";
import { upsertCareerRoleForJob } from "./career-role";
import { getOrCreateSalaryBenchmark } from "./salary-benchmark";

export interface UserProfileForAnalysis {
  skills: { name: string; proficiency: number }[];
  workExperience: {
    role: string;
    company: string;
    description: string;
  }[];
  currentTitle?: string | null;
}

export interface SkillGapAnalysisResult {
  skillGapId: string;
  matchPercentage: number;
  missingSkills: string[];
  matchedSkills: string[];
  experienceGaps: string[];
  reportSummary: string;
  roleId: string | null;
  salaryBenchmark: {
    jobTitle: string;
    region: string;
    percentile25: number | null;
    median: number | null;
    percentile75: number | null;
  } | null;
}

export async function analyzeSkillGap(
  userId: string,
  jobId: string,
  profile: UserProfileForAnalysis
): Promise<SkillGapAnalysisResult> {
  const job = await prisma.jobListing.findUnique({
    where: { id: jobId },
  });

  if (!job) {
    throw new Error("Job not found");
  }

  const requiredSkills = Array.isArray(job.requiredSkills)
    ? (job.requiredSkills as string[])
    : [];

  const userSkillNames = new Set(
    profile.skills.map((s) => s.name.toLowerCase())
  );

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const required of requiredSkills) {
    const lower = required.toLowerCase();
    const matched = [...userSkillNames].some(
      (userSkill) =>
        userSkill.includes(lower) ||
        lower.includes(userSkill) ||
        fuzzyMatch(userSkill, lower)
    );

    if (matched) {
      matchedSkills.push(required);
    } else {
      missingSkills.push(required);
    }
  }

  const userExpText = [
    profile.currentTitle ?? "",
    ...profile.workExperience.map(
      (e) => `${e.role} at ${e.company} ${e.description}`
    ),
  ].join(" ");

  const experienceGaps = extractExperienceGaps(job.description, userExpText);

  const allMissing = [...missingSkills, ...experienceGaps];

  const totalRequirements = Math.max(requiredSkills.length, 1);
  const matchPercentage = Math.round(
    (matchedSkills.length / totalRequirements) * 100
  );

  const role = await upsertCareerRoleForJob(job.title, requiredSkills);

  const salaryBenchmark = await getOrCreateSalaryBenchmark(
    job.title,
    job.location
  );

  const reportSummary = buildReportSummary({
    jobTitle: job.title,
    company: job.company,
    matchPercentage,
    missingSkills,
    experienceGaps,
    matchedSkills,
    userSkillCount: profile.skills.length,
  });

  const skillGap = await prisma.skillGap.create({
    data: {
      userId,
      roleId: role?.id ?? null,
      jobId: job.id,
      missingSkills: allMissing,
      matchPercentage: new Prisma.Decimal(matchPercentage),
      reportSummary,
    },
  });

  return {
    skillGapId: skillGap.id,
    matchPercentage,
    missingSkills,
    matchedSkills,
    experienceGaps,
    reportSummary,
    roleId: role?.id ?? null,
    salaryBenchmark: {
      jobTitle: salaryBenchmark.jobTitle,
      region: salaryBenchmark.region,
      percentile25: salaryBenchmark.percentile25
        ? Number(salaryBenchmark.percentile25)
        : null,
      median: salaryBenchmark.median
        ? Number(salaryBenchmark.median)
        : null,
      percentile75: salaryBenchmark.percentile75
        ? Number(salaryBenchmark.percentile75)
        : null,
    },
  };
}

function fuzzyMatch(a: string, b: string): boolean {
  const wordsA = a.split(/\s+/);
  const wordsB = b.split(/\s+/);
  return wordsA.some((wa) => wordsB.some((wb) => wa === wb && wa.length > 3));
}

function buildReportSummary(params: {
  jobTitle: string;
  company: string;
  matchPercentage: number;
  missingSkills: string[];
  experienceGaps: string[];
  matchedSkills: string[];
  userSkillCount: number;
}): string {
  const {
    jobTitle,
    company,
    matchPercentage,
    missingSkills,
    experienceGaps,
    matchedSkills,
    userSkillCount,
  } = params;

  const parts = [
    `Analysis for ${jobTitle} at ${company}: ${matchPercentage}% skill match.`,
    `You have ${matchedSkills.length} matching skills out of ${userSkillCount} profile skills.`,
  ];

  if (missingSkills.length > 0) {
    parts.push(
      `Missing skills: ${missingSkills.slice(0, 5).join(", ")}${missingSkills.length > 5 ? "..." : ""}.`
    );
  }

  if (experienceGaps.length > 0) {
    parts.push(
      `Experience gaps identified in ${experienceGaps.length} area(s).`
    );
  }

  if (matchPercentage >= 80) {
    parts.push("Strong fit — focus on highlighting your matching skills.");
  } else if (matchPercentage >= 50) {
    parts.push("Moderate fit — consider upskilling in the listed gaps.");
  } else {
    parts.push("Significant gaps — a learning plan is recommended.");
  }

  return parts.join(" ");
}

export async function getUserProfileForAnalysis(
  userId: string
): Promise<UserProfileForAnalysis> {
  const resume = await prisma.resume.findFirst({
    where: { userId, isPrimary: true },
    include: { workExperience: true },
  });

  const userSkills = await prisma.userSkill.findMany({
    where: { userId },
    include: { skill: true },
  });

  const profile = await prisma.userProfile.findUnique({
    where: { userId },
  });

  return {
    skills: userSkills.map((us) => ({
      name: us.skill.name,
      proficiency: us.proficiencyLevel,
    })),
    workExperience: (resume?.workExperience ?? []).map((we) => ({
      role: we.role,
      company: we.company,
      description: we.descriptionBullets,
    })),
    currentTitle: profile?.currentTitle,
  };
}
