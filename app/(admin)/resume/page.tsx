import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layouts/dashboard-shell";
import { ResumeBuilder } from "@/components/resume";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ResumePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/login");

  const profile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) redirect("/onboarding");

  const resume = await prisma.resume.findFirst({
    where: { userId: session.user.id, isPrimary: true },
    include: { workExperience: true, education: true },
  });

  const userSkills = await prisma.userSkill.findMany({
    where: { userId: session.user.id },
    include: { skill: true },
  });

  return (
    <DashboardShell title="ATS Resume Builder">
      <p className="px-4 text-sm text-muted-foreground lg:px-6">
        Format your profile into an industry-standard, ATS-optimized resume using
        Gemini AI.
      </p>
      <div className="px-4 lg:px-6">
        <ResumeBuilder
          profile={{
            name: session.user.name,
            email: session.user.email,
            currentTitle: profile.currentTitle,
            location: profile.location,
            bio: profile.bio,
            skills: userSkills.map((us) => ({
              name: us.skill.name,
              proficiency: us.proficiencyLevel,
            })),
            workExperience: (resume?.workExperience ?? []).map((we) => ({
              role: we.role,
              company: we.company,
              startDate: we.startDate.toISOString(),
              endDate: we.endDate?.toISOString(),
              description: we.descriptionBullets,
            })),
            education: (resume?.education ?? []).map((edu) => ({
              degree: edu.degree,
              institution: edu.institution,
              fieldOfStudy: edu.fieldOfStudy,
              graduationYear: edu.graduationYear,
            })),
          }}
        />
      </div>
    </DashboardShell>
  );
}
