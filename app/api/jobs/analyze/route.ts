import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { syncJobsToDatabase } from "@/lib/jobs/sync";
import {
  analyzeSkillGap,
  getUserProfileForAnalysis,
} from "@/lib/market/skill-gap-analyzer";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { jobId } = body as { jobId?: string };

    if (!jobId) {
      return NextResponse.json(
        { error: "jobId is required" },
        { status: 400 }
      );
    }

    let resolvedJobId = jobId;

    const existing = await prisma.jobListing.findUnique({
      where: { id: jobId },
    });

    if (!existing) {
      const byExternal = await prisma.jobListing.findUnique({
        where: { externalId: jobId },
      });

      if (byExternal) {
        resolvedJobId = byExternal.id;
      } else {
        await syncJobsToDatabase([jobId]);
        const synced = await prisma.jobListing.findUnique({
          where: { externalId: jobId },
        });
        if (!synced) {
          return NextResponse.json(
            { error: "Job not found" },
            { status: 404 }
          );
        }
        resolvedJobId = synced.id;
      }
    }

    const profile = await getUserProfileForAnalysis(session.user.id);

    if (profile.skills.length === 0) {
      return NextResponse.json(
        {
          error:
            "Complete your profile with skills before running analysis.",
        },
        { status: 400 }
      );
    }

    const result = await analyzeSkillGap(
      session.user.id,
      resolvedJobId,
      profile
    );

    return NextResponse.json({ success: true, analysis: result });
  } catch (error) {
    console.error("Skill gap analysis failed:", error);
    return NextResponse.json(
      { error: "Analysis failed" },
      { status: 500 }
    );
  }
}
