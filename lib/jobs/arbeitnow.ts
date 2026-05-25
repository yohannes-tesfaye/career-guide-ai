import type { ArbeitnowJob, ArbeitnowResponse } from "./types";

const ARBEITNOW_API = "https://arbeitnow.com/api/job-board-api";

let cachedJobs: ArbeitnowJob[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 15 * 60 * 1000;

export async function fetchArbeitnowJobs(): Promise<ArbeitnowJob[]> {
  const now = Date.now();
  if (cachedJobs && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedJobs;
  }

  const response = await fetch(ARBEITNOW_API, {
    next: { revalidate: 900 },
  });

  if (!response.ok) {
    throw new Error(`Arbeitnow API error: ${response.status}`);
  }

  const json = (await response.json()) as ArbeitnowResponse;
  cachedJobs = json.data;
  cacheTimestamp = now;
  return cachedJobs;
}

export function clearArbeitnowCache() {
  cachedJobs = null;
  cacheTimestamp = 0;
}
