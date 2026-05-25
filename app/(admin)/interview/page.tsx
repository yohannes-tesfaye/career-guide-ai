import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardShell } from "@/components/layouts/dashboard-shell";
import { InterviewPrepHub } from "@/components/interview/InterviewPrepHub";

export default async function InterviewPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <DashboardShell title="Interview Preparation">
      <p className="px-4 text-sm text-muted-foreground lg:px-6">
        Practice technical mock interviews in a safe-to-fail environment. Choose
        text-based Q&A or video mode with AI voice (Fish Audio). Your scores and
        feedback are saved to History.
      </p>
      <InterviewPrepHub />
    </DashboardShell>
  );
}
