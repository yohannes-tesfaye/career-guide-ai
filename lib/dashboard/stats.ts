import { prisma } from "@/lib/prisma";

export async function getDashboardStats(userId: string) {
  const [
    skillCount,
    skillGaps,
    learningPaths,
    savedJobs,
    interviewSessions,
    latestGap,
  ] = await Promise.all([
    prisma.userSkill.count({ where: { userId } }),
    prisma.skillGap.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 5,
      include: { job: true, role: true },
    }),
    prisma.learningPath.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: {
        gap: { include: { job: true } },
        planItems: { include: { resource: true } },
      },
    }),
    prisma.jobListing.count(),
    prisma.interviewSession.count({ where: { userId } }),
    prisma.skillGap.findFirst({
      where: { userId },
      orderBy: { date: "desc" },
    }),
  ]);

  const avgMatch =
    skillGaps.length > 0
      ? Math.round(
          skillGaps.reduce((sum, g) => sum + Number(g.matchPercentage), 0) /
            skillGaps.length
        )
      : null;

  const activeLearningPaths = learningPaths.filter(
    (p) => p.status !== "Completed"
  ).length;

  const highFitJobs = skillGaps.filter(
    (g) => Number(g.matchPercentage) >= 70
  ).length;

  return {
    skillCount,
    avgMatch,
    analysisCount: skillGaps.length,
    activeLearningPaths,
    savedJobs,
    interviewSessions,
    highFitJobs,
    recentAnalyses: skillGaps.map((g) => ({
      id: g.id,
      matchPercentage: Number(g.matchPercentage),
      missingCount: g.missingSkills.length,
      reportSummary: g.reportSummary,
      date: g.date.toISOString(),
      jobTitle: g.job?.title ?? g.role?.title ?? "Unknown",
      company: g.job?.company ?? null,
      jobId: g.job?.id ?? null,
    })),
    recentLearningPaths: learningPaths.map((p) => ({
      id: p.id,
      status: p.status,
      title: p.title ?? p.gap?.job?.title ?? null,
      itemCount: p.planItems.length,
      gapJobTitle: p.gap?.job?.title ?? p.title ?? null,
      resources: p.planItems.slice(0, 3).map((pi) => ({
        title: pi.resource.title,
        provider: pi.resource.provider,
        url: pi.resource.url,
      })),
    })),
    latestGapId: latestGap?.id ?? null,
  };
}
