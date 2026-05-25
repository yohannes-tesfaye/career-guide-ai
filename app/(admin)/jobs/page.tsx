import { DashboardShell } from "@/components/layouts/dashboard-shell";
import { JobExplorer } from "@/components/jobs/job-explorer";

export default function JobsPage() {
  return (
    <DashboardShell title="Job Explorer">
      <p className="px-4 text-sm text-muted-foreground lg:px-6">
        Browse live job listings from Arbeitnow. Search, filter, and save jobs to
        analyze your skill fit.
      </p>
      <JobExplorer />
    </DashboardShell>
  );
}
