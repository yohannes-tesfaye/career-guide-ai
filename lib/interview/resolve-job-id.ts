import { prisma } from "@/lib/prisma";

/**
 * InterviewSession.jobId must reference JobListing.id (cuid).
 * The job picker may pass a slug when the listing is not synced yet.
 */
export async function resolveInterviewJobId(
  jobId: string | undefined
): Promise<string | null> {
  if (!jobId?.trim()) return null;

  const trimmed = jobId.trim();

  const byId = await prisma.jobListing.findUnique({
    where: { id: trimmed },
    select: { id: true },
  });
  if (byId) return byId.id;

  const byExternal = await prisma.jobListing.findUnique({
    where: { externalId: trimmed },
    select: { id: true },
  });
  if (byExternal) return byExternal.id;

  return null;
}
