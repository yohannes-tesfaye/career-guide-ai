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
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const userProfile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!userProfile) {
    redirect("/onboarding");
  }

  const resume = await prisma.resume.findFirst({
    where: { userId: session.user.id, isPrimary: true },
    include: {
      workExperience: {
        orderBy: { startDate: "desc" },
      },
      education: {
        orderBy: { graduationYear: "desc" },
      },
    },
  });

  const userSkills = await prisma.userSkill.findMany({
    where: { userId: session.user.id },
    include: {
      skill: true,
    },
    orderBy: {
      proficiencyLevel: "desc",
    },
  });

  return (
    <div className="container py-10 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Profile</h1>
        <Link href="/dashboard/edit-profile">
          <Button>Edit Profile</Button>
        </Link>
      </div>

      <Card className="relative overflow-hidden shadow-lg border-t-4 border-t-primary">
        <CardHeader className="text-center pb-8 pt-10">
          <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-white shadow-sm ring-1 ring-border">
            <AvatarImage
              src={session.user.image ?? ""}
              alt={session.user.name}
            />
            <AvatarFallback className="text-2xl">
              {session.user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-3xl font-bold">
            {session.user.name}
          </CardTitle>
          <CardDescription className="text-lg font-medium text-primary mt-2">
            {userProfile.currentTitle}
          </CardDescription>
          <p className="text-muted-foreground text-sm flex items-center justify-center gap-1 mt-1">
            <MapPin className="w-4 h-4" />
            {userProfile.location || "Location not specified"}
          </p>
        </CardHeader>
        <CardContent className="bg-muted/50 p-6 m-4 rounded-lg">
          <h3 className="font-semibold text-lg mb-2">About Me</h3>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
            {userProfile.bio || "No professional bio provided yet."}
          </p>
        </CardContent>
      </Card>

      {resume && resume.workExperience.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Work Experience
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {resume.workExperience.map((exp) => (
              <div
                key={exp.id}
                className="border-l-2 border-primary pl-4 pb-4 last:pb-0"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-lg">{exp.role}</h4>
                    <p className="text-muted-foreground">{exp.company}</p>
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(exp.startDate).toLocaleDateString()} -{" "}
                    {exp.endDate
                      ? new Date(exp.endDate).toLocaleDateString()
                      : "Present"}
                  </Badge>
                </div>
                {exp.descriptionBullets && (
                  <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">
                    {exp.descriptionBullets}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {resume && resume.education.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Education
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {resume.education.map((edu) => (
              <div
                key={edu.id}
                className="border-l-2 border-primary pl-4 pb-4 last:pb-0"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-lg">{edu.degree}</h4>
                    <p className="text-muted-foreground">{edu.institution}</p>
                    {edu.fieldOfStudy && (
                      <p className="text-sm text-muted-foreground">
                        {edu.fieldOfStudy}
                      </p>
                    )}
                  </div>
                  {edu.graduationYear && (
                    <Badge variant="outline">{edu.graduationYear}</Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {userSkills.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {userSkills.map((userSkill) => (
                <Badge
                  key={userSkill.id}
                  variant="secondary"
                  className="text-sm"
                >
                  {userSkill.skill.name} ({userSkill.proficiencyLevel}%)
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!resume && (
        <Card className="shadow-lg">
          <CardContent className="p-6 text-center text-muted-foreground">
            <p>
              No resume data found. Complete your onboarding to add your work
              experience, education, and skills.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
