import { DashboardShell } from "@/components/layouts/dashboard-shell";
import { JobDetail } from "@/components/jobs/job-detail";

type PageProps = { params: Promise<{ id: string }> };

export default async function JobDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <DashboardShell title="Job details">
      <JobDetail jobId={id} />
    </DashboardShell>
  );
}
