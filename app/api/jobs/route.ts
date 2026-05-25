import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { fetchArbeitnowJobs } from "@/lib/jobs/arbeitnow";
import { filterJobs } from "@/lib/jobs/filters";
import { normalizeArbeitnowJob } from "@/lib/jobs/normalize";
import { syncJobsToDatabase, toJobListItem } from "@/lib/jobs/sync";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search") ?? undefined;
    const remoteParam = searchParams.get("remote");
    const location = searchParams.get("location") ?? undefined;
    const jobType = searchParams.get("jobType") ?? undefined;
    const sync = searchParams.get("sync") === "true";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10))
    );

    const remote =
      remoteParam === "true" ? true : remoteParam === "false" ? false : undefined;

    const apiJobs = await fetchArbeitnowJobs();
    const filtered = filterJobs(apiJobs, { search, remote, location, jobType });

    if (sync) {
      const slugs = filtered.map((j) => j.slug);
      await syncJobsToDatabase(slugs);
    }

    const total = filtered.length;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    const dbJobs = await prisma.jobListing.findMany({
      where: {
        externalId: { in: paginated.map((j) => j.slug) },
      },
    });
    const dbMap = new Map(dbJobs.map((j) => [j.externalId, j]));

    const jobs = paginated.map((apiJob) => {
      const normalized = normalizeArbeitnowJob(apiJob);
      const dbJob = dbMap.get(apiJob.slug);

      if (dbJob) {
        return toJobListItem(dbJob, {
          url: apiJob.url,
          remote: apiJob.remote,
          tags: apiJob.tags,
          jobTypes: apiJob.job_types,
        });
      }

      return {
        id: apiJob.slug,
        externalId: apiJob.slug,
        title: normalized.title,
        company: normalized.company,
        location: normalized.location,
        locationType: normalized.locationType,
        description: normalized.description,
        requiredSkills: normalized.requiredSkills,
        postedDate: normalized.postedDate?.toISOString() ?? null,
        source: normalized.source,
        url: apiJob.url,
        remote: apiJob.remote,
        tags: apiJob.tags,
        jobTypes: apiJob.job_types,
      };
    });

    const locations = [...new Set(apiJobs.map((j) => j.location))].sort();
    const jobTypes = [
      ...new Set(apiJobs.flatMap((j) => j.job_types ?? [])),
    ].sort();

    return NextResponse.json({
      jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters: { locations, jobTypes },
    });
  } catch (error) {
    console.error("Failed to fetch jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}
