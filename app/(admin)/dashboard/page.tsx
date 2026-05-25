import { AppSidebar } from "@/components/app-sidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, GraduationCap, Award } from "lucide-react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import data from "./data.json";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  let userProfile: {
    bio: string | null;
    currentTitle: string | null;
    location: string | null;
  } | null = null;
  let resume: {
    workExperience: { id: string; role: string; company: string }[];
    education: { id: string; degree: string; institution: string }[];
  } | null = null;
  let userSkills: { id: string; skill: { name: string } }[] = [];

  if (session) {
    userProfile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    });

    resume = await prisma.resume.findFirst({
      where: { userId: session.user.id, isPrimary: true },
      include: {
        workExperience: {
          orderBy: { startDate: "desc" },
          take: 3,
        },
        education: {
          orderBy: { graduationYear: "desc" },
          take: 3,
        },
      },
    });

    userSkills = await prisma.userSkill.findMany({
      where: { userId: session.user.id },
      include: {
        skill: true,
      },
      orderBy: {
        proficiencyLevel: "desc",
      },
      take: 6,
    });
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {session && userProfile && (
                <div className="px-4 lg:px-6">
                  <Card className="shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-16 h-16 border-2 border-primary">
                          <AvatarImage
                            src={session.user.image ?? ""}
                            alt={session.user.name}
                          />
                          <AvatarFallback className="text-xl">
                            {session.user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-2xl">
                            {session.user.name}
                          </CardTitle>
                          <CardDescription className="text-base font-medium text-primary">
                            {userProfile.currentTitle}
                          </CardDescription>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {userProfile.location || "Location not specified"}
                          </p>
                        </div>
                      </div>
                      <Link href="/dashboard/edit-profile">
                        <Button variant="outline" size="sm">
                          Edit Profile
                        </Button>
                      </Link>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {resume && resume.workExperience.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <Briefcase className="w-4 h-4" />
                              <span>Recent Experience</span>
                            </div>
                            {resume.workExperience.slice(0, 2).map((exp) => (
                              <div key={exp.id} className="text-sm">
                                <p className="font-medium">{exp.role}</p>
                                <p className="text-muted-foreground text-xs">
                                  {exp.company}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                        {resume && resume.education.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <GraduationCap className="w-4 h-4" />
                              <span>Education</span>
                            </div>
                            {resume.education.slice(0, 2).map((edu: any) => (
                              <div key={edu.id} className="text-sm">
                                <p className="font-medium">{edu.degree}</p>
                                <p className="text-muted-foreground text-xs">
                                  {edu.institution}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                        {userSkills.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <Award className="w-4 h-4" />
                              <span>Top Skills</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {userSkills.slice(0, 4).map((userSkill) => (
                                <Badge
                                  key={userSkill.id}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {userSkill.skill.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              <DataTable data={data} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
