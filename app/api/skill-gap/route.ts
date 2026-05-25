import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const skillGaps = await prisma.skillGap.findMany({
      where: { userId: session.user.id },
      include: {
        job: true,
        role: true,
      },
      orderBy: { date: "desc" },
      take: 20,
    });

    return NextResponse.json({
      analyses: skillGaps.map((sg) => ({
        id: sg.id,
        matchPercentage: Number(sg.matchPercentage),
        missingSkills: sg.missingSkills,
        reportSummary: sg.reportSummary,
        date: sg.date.toISOString(),
        job: sg.job
          ? {
              id: sg.job.id,
              title: sg.job.title,
              company: sg.job.company,
              location: sg.job.location,
            }
          : null,
        role: sg.role
          ? { id: sg.role.id, title: sg.role.title }
          : null,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch skill gaps:", error);
    return NextResponse.json(
      { error: "Failed to fetch analyses" },
      { status: 500 }
    );
  }
}
