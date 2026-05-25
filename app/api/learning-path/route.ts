import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createLearningPathFromGap } from "@/lib/market/learning-path-recommender";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const paths = await prisma.learningPath.findMany({
      where: { userId: session.user.id },
      include: {
        gap: { include: { job: true } },
        planItems: { include: { resource: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({
      paths: paths.map((p) => ({
        id: p.id,
        title: p.title ?? p.gap?.job?.title ?? "Learning path",
        summary: p.summary,
        status: p.status,
        createdAt: p.createdAt.toISOString(),
        matchPercentage: p.gap ? Number(p.gap.matchPercentage) : null,
        jobTitle: p.gap?.job?.title ?? null,
        resourceCount: p.planItems.length,
        completedCount: p.planItems.filter((pi) => pi.status === "Completed")
          .length,
        resources: p.planItems.map((pi) => ({
          id: pi.id,
          resourceId: pi.resource.id,
          status: pi.status,
          title: pi.resource.title,
          provider: pi.resource.provider,
          type: pi.resource.type,
          url: pi.resource.url,
          duration: pi.resource.duration,
        })),
      })),
    });
  } catch (error) {
    console.error("Failed to fetch learning paths:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { skillGapId } = body as { skillGapId?: string };

    if (!skillGapId) {
      return NextResponse.json({ error: "skillGapId is required" }, { status: 400 });
    }

    const result = await createLearningPathFromGap(
      session.user.id,
      skillGapId
    );

    return NextResponse.json({
      success: true,
      source: result.source,
      warning: result.warning,
      learningPathId: result.learningPath?.id,
      pathTitle: result.path.pathTitle,
      summary: result.path.summary,
      estimatedWeeks: result.path.estimatedWeeks,
      resources: result.path.resources,
    });
  } catch (error) {
    console.error("Learning path generation failed:", error);
    const { friendlyAiMessage } = await import("@/lib/ai/messages");
    return NextResponse.json(
      { error: friendlyAiMessage(error) },
      { status: 500 }
    );
  }
}
