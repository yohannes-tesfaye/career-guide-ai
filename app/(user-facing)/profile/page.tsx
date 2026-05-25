import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  Calendar,
  Pencil,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/login");

  const userProfile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!userProfile) redirect("/onboarding");

  const resume = await prisma.resume.findFirst({
    where: { userId: session.user.id, isPrimary: true },
    include: {
      workExperience: { orderBy: { startDate: "desc" } },
      education: { orderBy: { graduationYear: "desc" } },
    },
  });

  const userSkills = await prisma.userSkill.findMany({
    where: { userId: session.user.id },
    include: { skill: true },
    orderBy: { proficiencyLevel: "desc" },
  });

  const analysisCount = await prisma.skillGap.count({
    where: { userId: session.user.id },
  });

  return (
    <div className="min-h-[80vh] min-w-[90vw] mx-auto p-5 bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="space-y-8 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your profile</h1>
            <p className="text-muted-foreground">
              Skills and experience used by the AI analyzer
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/edit-profile">
              <Pencil className="mr-2 size-4" />
              Edit profile
            </Link>
          </Button>
        </div>

        <Card className="overflow-hidden border-0 shadow-lg">
          <div className="h-24 bg-gradient-to-r from-primary/80 to-primary/40" />
          <CardHeader className="relative -mt-14 pb-2">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">
              <Avatar className="size-24 border-4 border-background shadow-md">
                <AvatarImage
                  src={session.user.image ?? ""}
                  alt={session.user.name}
                />
                <AvatarFallback className="text-2xl">
                  {session.user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left">
                <CardTitle className="text-3xl font-bold">
                  {session.user.name}
                </CardTitle>
                <CardDescription className="text-base font-medium text-primary">
                  {userProfile.currentTitle ?? "Add your title"}
                </CardDescription>
                <div className="mt-2 flex flex-wrap justify-center gap-3 text-sm text-muted-foreground sm:justify-start">
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3.5" />
                    {userProfile.location ?? "No location"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="size-3.5" />
                    {session.user.email}
                  </span>
                </div>
              </div>
              <Badge variant="secondary">{analysisCount} analyses run</Badge>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-8">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              About
            </h3>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {userProfile.bio || "No professional bio yet."}
            </p>
          </CardContent>
        </Card>

        {userSkills.length > 0 && (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Award className="size-5 text-primary" />
                Skills ({userSkills.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {userSkills.map((us) => (
                <div key={us.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{us.skill.name}</span>
                    <span className="text-muted-foreground">
                      {us.proficiencyLevel}%
                    </span>
                  </div>
                  <Progress value={us.proficiencyLevel} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {resume && resume.workExperience.length > 0 && (
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Briefcase className="size-5 text-primary" />
                  Work experience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {resume.workExperience.map((exp) => (
                  <div
                    key={exp.id}
                    className="relative border-l-2 border-primary/40 pl-4"
                  >
                    <h4 className="font-semibold">{exp.role}</h4>
                    <p className="text-sm text-muted-foreground">
                      {exp.company}
                    </p>
                    <Badge variant="outline" className="mt-2 gap-1 text-xs">
                      <Calendar className="size-3" />
                      {new Date(exp.startDate).toLocaleDateString()} –{" "}
                      {exp.endDate
                        ? new Date(exp.endDate).toLocaleDateString()
                        : "Present"}
                    </Badge>
                    {exp.descriptionBullets && (
                      <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                        {exp.descriptionBullets}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {resume && resume.education.length > 0 && (
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <GraduationCap className="size-5 text-primary" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {resume.education.map((edu) => (
                  <div
                    key={edu.id}
                    className="rounded-lg border bg-muted/30 p-4"
                  >
                    <h4 className="font-semibold">{edu.degree}</h4>
                    <p className="text-sm text-muted-foreground">
                      {edu.institution}
                    </p>
                    {edu.fieldOfStudy && (
                      <p className="text-xs text-muted-foreground">
                        {edu.fieldOfStudy}
                      </p>
                    )}
                    {edu.graduationYear && (
                      <Badge variant="secondary" className="mt-2">
                        {edu.graduationYear}
                      </Badge>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {!resume && (
          <Card className="border-dashed">
            <CardContent className="py-10 text-center text-muted-foreground">
              Complete onboarding to add experience and education.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
