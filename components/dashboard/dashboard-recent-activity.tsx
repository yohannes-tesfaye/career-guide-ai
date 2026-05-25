import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, BookOpenIcon, ListIcon } from "lucide-react";

interface DashboardRecentActivityProps {
  recentAnalyses: {
    id: string;
    matchPercentage: number;
    missingCount: number;
    reportSummary: string | null;
    date: string;
    jobTitle: string;
    company: string | null;
    jobId: string | null;
  }[];
  recentLearningPaths: {
    id: string;
    status: string;
    itemCount: number;
    gapJobTitle: string | null;
    resources: { title: string; provider: string | null; url: string }[];
  }[];
}

export function DashboardRecentActivity({
  recentAnalyses,
  recentLearningPaths,
}: DashboardRecentActivityProps) {
  return (
    <div className="grid gap-4 px-4 lg:grid-cols-2 lg:px-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <ListIcon className="size-4" />
              Recent skill-gap analyses
            </CardTitle>
            <CardDescription>Click for full details</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/skill-gap">
              View all <ArrowRightIcon className="ml-1 size-3" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentAnalyses.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No analyses yet.{" "}
              <Link href="/jobs" className="text-primary underline">
                Explore jobs
              </Link>
            </p>
          ) : (
            <ul className="space-y-2">
              {recentAnalyses.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/skill-gap/${a.id}`}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/60"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="truncate font-medium text-sm">
                        {a.jobTitle}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {a.company ?? "—"} ·{" "}
                        {new Date(a.date).toLocaleDateString()} ·{" "}
                        {a.missingCount} gaps
                      </p>
                    </div>
                    <Badge
                      variant={
                        a.matchPercentage >= 70 ? "default" : "secondary"
                      }
                    >
                      {a.matchPercentage}%
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpenIcon className="size-4" />
              Learning paths
            </CardTitle>
            <CardDescription>Saved curricula</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/learning-path">
              View all <ArrowRightIcon className="ml-1 size-3" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentLearningPaths.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Generate from a skill-gap analysis.
            </p>
          ) : (
            <ul className="space-y-2">
              {recentLearningPaths.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/learning-path/${p.id}`}
                    className="block rounded-lg border p-3 transition-colors hover:bg-muted/60"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm">
                        {p.gapJobTitle ?? "Learning path"}
                      </p>
                      <Badge variant="outline">{p.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {p.itemCount} resources
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
