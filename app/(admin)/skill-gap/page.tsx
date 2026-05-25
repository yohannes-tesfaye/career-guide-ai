import { DashboardShell } from "@/components/layouts/dashboard-shell";
import { SkillGapAnalyzer } from "@/components/skill-gap/skill-gap-analyzer";

type PageProps = {
  searchParams: Promise<{ jobId?: string; analysisId?: string }>;
};

export default async function SkillGapPage({ searchParams }: PageProps) {
  const { jobId, analysisId } = await searchParams;

  return (
    <DashboardShell title="Skill-Gap Analysis">
      <p className="px-4 text-sm text-muted-foreground lg:px-6">
        Compare your saved profile skills and work experience against a job to see
        exactly what you are missing.
      </p>
      <SkillGapAnalyzer initialJobId={jobId} initialAnalysisId={analysisId} />
    </DashboardShell>
  );
}
