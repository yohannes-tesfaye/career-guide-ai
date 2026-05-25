import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await ctx.params;

    const gap = await prisma.skillGap.findFirst({
      where: { id, userId: session.user.id },
      include: {
        job: true,
        role: true,
        learningPaths: {
          include: { planItems: { include: { resource: true } } },
        },
      },
    });

    if (!gap) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const userSkills = await prisma.userSkill.findMany({
      where: { userId: session.user.id },
      include: { skill: true },
    });
    const userSkillNames = userSkills.map((s) => s.skill.name.toLowerCase());

    const requiredSkills = Array.isArray(gap.job?.requiredSkills)
      ? (gap.job.requiredSkills as string[])
      : [];

    const missingSkills = gap.missingSkills.filter(
      (s) => !s.toLowerCase().includes("experience")
    );
    const experienceGaps = gap.missingSkills.filter((s) =>
      s.toLowerCase().includes("experience")
    );

    const matchedSkills = requiredSkills.filter((req) => {
      const lower = req.toLowerCase();
      return (
        !missingSkills.some(
          (m) => m.toLowerCase() === lower || lower.includes(m.toLowerCase())
        ) &&
        userSkillNames.some(
          (u) => u.includes(lower) || lower.includes(u)
        )
      );
    });

    return NextResponse.json({
      analysis: {
        id: gap.id,
        matchPercentage: Number(gap.matchPercentage),
        missingSkills,
        matchedSkills,
        experienceGaps,
        reportSummary: gap.reportSummary,
        date: gap.date.toISOString(),
        source: "fallback",
        job: gap.job
          ? {
              id: gap.job.id,
              title: gap.job.title,
              company: gap.job.company,
              location: gap.job.location,
              description: gap.job.description,
            }
          : null,
        role: gap.role ? { id: gap.role.id, title: gap.role.title } : null,
        learningPaths: gap.learningPaths.map((lp) => ({
          id: lp.id,
          title: lp.title,
          status: lp.status,
          resourceCount: lp.planItems.length,
        })),
      },
    });
  } catch (error) {
    console.error("Skill gap fetch failed:", error);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}
