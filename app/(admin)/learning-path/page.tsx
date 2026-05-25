import { DashboardShell } from "@/components/layouts/dashboard-shell";
import { LearningPathList } from "@/components/learning-path/learning-path-list";

export default function LearningPathPage() {
  return (
    <DashboardShell title="Learning paths">
      <p className="px-4 text-sm text-muted-foreground lg:px-6">
        AI-generated courses and projects saved to your account.
      </p>
      <LearningPathList />
    </DashboardShell>
  );
}
