import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { buildResume } from "@/lib/ai/resume";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { targetRole } = body as { targetRole?: string };

    const profile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    });
    let resume = await prisma.resume.findFirst({
      where: { userId: session.user.id, isPrimary: true },
      include: { workExperience: true, education: true },
    });

    if (!resume) {
      resume = await prisma.resume.create({
        data: { userId: session.user.id, isPrimary: true },
        include: { workExperience: true, education: true },
      });
    }

    const userSkills = await prisma.userSkill.findMany({
      where: { userId: session.user.id },
      include: { skill: true },
    });

    const { resume: optimized, source, warning } = await buildResume({
      name: session.user.name,
      currentTitle: profile?.currentTitle ?? null,
      bio: profile?.bio ?? null,
      location: profile?.location ?? null,
      targetRole: targetRole ?? profile?.currentTitle,
      skills: userSkills.map((us) => ({ name: us.skill.name })),
      workExperience: (resume.workExperience ?? []).map((we) => ({
        role: we.role,
        company: we.company,
        description: we.descriptionBullets,
      })),
      education: (resume.education ?? []).map((edu) => ({
        degree: edu.degree,
        institution: edu.institution,
      })),
    });

    await prisma.resume.update({
      where: { id: resume.id },
      data: {
        parsedData: JSON.parse(JSON.stringify(optimized)),
        lastModified: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      resume: optimized,
      source,
      warning,
    });
  } catch (error) {
    console.error("Resume optimization failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Optimization failed",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resume = await prisma.resume.findFirst({
      where: { userId: session.user.id, isPrimary: true },
    });

    return NextResponse.json({
      parsedData: resume?.parsedData ?? null,
      lastModified: resume?.lastModified?.toISOString() ?? null,
    });
  } catch (error) {
    console.error("Failed to fetch resume:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
