import type { ArbeitnowJob, JobFilters } from "./types";

export function filterJobs(
  jobs: ArbeitnowJob[],
  filters: JobFilters
): ArbeitnowJob[] {
  let result = [...jobs];

  if (filters.search?.trim()) {
    const query = filters.search.trim().toLowerCase();
    result = result.filter(
      (job) =>
        job.title.toLowerCase().includes(query) ||
        job.company_name.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query) ||
        (job.tags ?? []).some((t) => t.toLowerCase().includes(query))
    );
  }

  if (filters.remote === true) {
    result = result.filter((job) => job.remote);
  } else if (filters.remote === false) {
    result = result.filter((job) => !job.remote);
  }

  if (filters.location?.trim()) {
    const loc = filters.location.trim().toLowerCase();
    result = result.filter((job) =>
      job.location.toLowerCase().includes(loc)
    );
  }

  if (filters.jobType?.trim()) {
    const type = filters.jobType.trim().toLowerCase();
    result = result.filter((job) =>
      (job.job_types ?? []).some((t) => t.toLowerCase().includes(type))
    );
  }

  return result;
}

export function getUniqueLocations(jobs: ArbeitnowJob[]): string[] {
  const locations = new Set<string>();
  for (const job of jobs) {
    if (job.location) locations.add(job.location);
  }
  return Array.from(locations).sort();
}

export function getUniqueJobTypes(jobs: ArbeitnowJob[]): string[] {
  const types = new Set<string>();
  for (const job of jobs) {
    for (const t of job.job_types ?? []) {
      types.add(t);
    }
  }
  return Array.from(types).sort();
}
