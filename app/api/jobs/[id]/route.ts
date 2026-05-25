import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { fetchArbeitnowJobs } from "@/lib/jobs/arbeitnow";
import { normalizeArbeitnowJob } from "@/lib/jobs/normalize";
import { syncJobsToDatabase, toJobListItem } from "@/lib/jobs/sync";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    let dbJob = await prisma.jobListing.findUnique({ where: { id } });

    if (!dbJob) {
      dbJob = await prisma.jobListing.findUnique({
        where: { externalId: id },
      });
    }

    if (dbJob) {
      const apiJobs = await fetchArbeitnowJobs();
      const apiJob = apiJobs.find((j) => j.slug === dbJob!.externalId);
      return NextResponse.json({
        job: toJobListItem(dbJob, {
          url: apiJob?.url,
          remote: apiJob?.remote,
          tags: apiJob?.tags,
          jobTypes: apiJob?.job_types,
        }),
      });
    }

    const apiJobs = await fetchArbeitnowJobs();
    const apiJob = apiJobs.find((j) => j.slug === id);

    if (!apiJob) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    await syncJobsToDatabase([apiJob.slug]);
    const synced = await prisma.jobListing.findUnique({
      where: { externalId: apiJob.slug },
    });

    if (!synced) {
      const normalized = normalizeArbeitnowJob(apiJob);
      return NextResponse.json({
        job: {
          id: apiJob.slug,
          title: normalized.title,
          company: normalized.company,
          location: normalized.location,
          locationType: normalized.locationType,
          description: normalized.description,
          requiredSkills: normalized.requiredSkills,
          externalId: normalized.externalId,
          postedDate: normalized.postedDate?.toISOString() ?? null,
          source: normalized.source,
          url: apiJob.url,
          remote: apiJob.remote,
          tags: apiJob.tags,
          jobTypes: apiJob.job_types,
        },
      });
    }

    return NextResponse.json({
      job: toJobListItem(synced, {
        url: apiJob.url,
        remote: apiJob.remote,
        tags: apiJob.tags,
        jobTypes: apiJob.job_types,
      }),
    });
  } catch (error) {
    console.error("Failed to fetch job:", error);
    return NextResponse.json(
      { error: "Failed to fetch job" },
      { status: 500 }
    );
  }
}
