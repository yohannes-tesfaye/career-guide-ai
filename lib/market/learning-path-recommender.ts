import { prisma } from "@/lib/prisma";
import { buildLearningPath } from "@/lib/ai/learning-path";

function safeUrl(url: string) {
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:" ? url : "https://roadmap.sh/";
  } catch {
    return "https://roadmap.sh/";
  }
}

export async function createLearningPathFromGap(
  userId: string,
  skillGapId: string
) {
  const gap = await prisma.skillGap.findFirst({
    where: { id: skillGapId, userId },
    include: { job: true },
  });

  if (!gap) throw new Error("Skill gap not found");

  const missingSkills = gap.missingSkills.filter(
    (s) => !s.toLowerCase().startsWith("experience")
  );

  const { path, source, warning } = await buildLearningPath({
    missingSkills: missingSkills.length ? missingSkills : ["General skills"],
    jobTitle: gap.job?.title ?? "Target role",
    matchPercentage: Number(gap.matchPercentage),
  });

  const learningPath = await prisma.learningPath.create({
    data: {
      userId,
      gap: { connect: { id: gap.id } },
      title: path.pathTitle,
      summary: path.summary,
      status: "In Progress",
    },
  });

  for (const resource of path.resources) {
    const url = safeUrl(resource.url);
    let dbResource = await prisma.learningResource.findFirst({
      where: { url },
    });

    if (!dbResource) {
      dbResource = await prisma.learningResource.create({
        data: {
          title: resource.title,
          provider: resource.provider,
          url,
          type: resource.type,
          description: resource.description,
          duration: resource.duration,
        },
      });
    }

    await prisma.planItem.create({
      data: {
        planId: learningPath.id,
        resourceId: dbResource.id,
        status: "Saved",
      },
    });
  }

  const fullPath = await prisma.learningPath.findUnique({
    where: { id: learningPath.id },
    include: {
      planItems: { include: { resource: true } },
      gap: { include: { job: true } },
    },
  });

  return { learningPath: fullPath, path, source, warning };
}
