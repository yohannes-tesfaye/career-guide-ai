import { DashboardShell } from "@/components/layouts/dashboard-shell";
import { SkillGapDetail } from "@/components/skill-gap/skill-gap-detail";

type Props = { params: Promise<{ id: string }> };

export default async function SkillGapDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <DashboardShell title="Analysis details">
      <SkillGapDetail analysisId={id} />
    </DashboardShell>
  );
}
