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
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ExternalLinkIcon } from "lucide-react";

type Props = { params: Promise<{ id: string }> };

export default async function LearningResourcePage({ params }: Props) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const { id } = await params;

  const resource = await prisma.learningResource.findUnique({
    where: { id },
    include: {
      planItems: {
        where: { plan: { userId: session.user.id } },
        include: { plan: true },
      },
    },
  });

  if (!resource || resource.planItems.length === 0) notFound();

  const plan = resource.planItems[0]?.plan;

  return (
    <DashboardShell title={resource.title}>
      <div className="space-y-6 px-4 lg:px-6 max-w-2xl">
        {plan && (
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/learning-path/${plan.id}`}>← Back to path</Link>
          </Button>
        )}

        <Card>
          <CardHeader>
            <CardTitle>{resource.title}</CardTitle>
            <CardDescription>
              {resource.provider ?? "Provider"} · {resource.duration ?? "—"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {resource.type && <Badge>{resource.type}</Badge>}
              {resource.cost != null && (
                <Badge variant="outline">${Number(resource.cost)}</Badge>
              )}
            </div>
            {resource.description && (
              <p className="text-sm leading-relaxed">{resource.description}</p>
            )}
            <Button asChild>
              <a href={resource.url} target="_blank" rel="noopener noreferrer">
                <ExternalLinkIcon className="mr-2 size-4" />
                Open course
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
