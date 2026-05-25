import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { DashboardShell } from "@/components/layouts/dashboard-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LearningPathChart } from "@/components/learning-path/learning-path-chart";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ExternalLinkIcon } from "lucide-react";

type Props = { params: Promise<{ id: string }> };

export default async function LearningPathDetailPage({ params }: Props) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const { id } = await params;

  const path = await prisma.learningPath.findFirst({
    where: { id, userId: session.user.id },
    include: {
      gap: { include: { job: true } },
      planItems: { include: { resource: true } },
    },
  });

  if (!path) notFound();

  const chartData = path.planItems.reduce<Record<string, number>>((acc, pi) => {
    const skill = pi.resource.type ?? "other";
    acc[skill] = (acc[skill] ?? 0) + 1;
    return acc;
  }, {});

  const chart = Object.entries(chartData).map(([skill, count]) => ({
    skill,
    count,
  }));

  return (
    <DashboardShell title={path.title ?? "Learning path"}>
      <div className="space-y-6 px-4 lg:px-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/learning-path">← All paths</Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>{path.title ?? path.gap?.job?.title}</CardTitle>
            <CardDescription>{path.summary}</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Badge>{path.status}</Badge>
            {path.gap && (
              <Badge variant="outline">
                {Number(path.gap.matchPercentage)}% job match
              </Badge>
            )}
          </CardContent>
        </Card>

        {chart.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resource types</CardTitle>
            </CardHeader>
            <CardContent>
              <LearningPathChart data={chart} />
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {path.planItems.map((pi) => (
            <Card key={pi.id}>
              <CardHeader>
                <CardTitle className="text-base">{pi.resource.title}</CardTitle>
                <CardDescription>
                  {pi.resource.provider} · {pi.resource.duration}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {pi.resource.description && (
                  <p className="text-sm text-muted-foreground">
                    {pi.resource.description}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/learning-resources/${pi.resource.id}`}>
                      Details
                    </Link>
                  </Button>
                  <Button size="sm" asChild>
                    <a
                      href={pi.resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLinkIcon className="mr-1 size-3.5" />
                      Open
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
