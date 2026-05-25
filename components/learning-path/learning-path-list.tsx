"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LearningPathChart } from "./learning-path-chart";
import { BookOpenIcon } from "lucide-react";

interface PathItem {
  id: string;
  title: string;
  summary: string | null;
  status: string;
  matchPercentage: number | null;
  resourceCount: number;
  completedCount: number;
}

export function LearningPathList() {
  const [paths, setPaths] = useState<PathItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/learning-path")
      .then((r) => r.json())
      .then((d) => setPaths(d.paths ?? []))
      .finally(() => setLoading(false));
  }, []);

  const chartData = paths.map((p) => ({
    skill: p.title.slice(0, 14),
    count: p.resourceCount,
  }));

  if (loading) return <Skeleton className="h-64 w-full" />;

  return (
    <div className="space-y-6 px-4 lg:px-6">
      {paths.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resources per path</CardTitle>
          </CardHeader>
          <CardContent>
            <LearningPathChart data={chartData} />
          </CardContent>
        </Card>
      )}

      {paths.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No learning paths yet. Run a{" "}
            <Link href="/skill-gap" className="text-primary underline">
              skill-gap analysis
            </Link>{" "}
            first.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {paths.map((p) => (
            <Link key={p.id} href={`/learning-path/${p.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BookOpenIcon className="size-4" />
                    {p.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {p.summary ?? "Personalized curriculum"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <Badge variant="outline">{p.status}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {p.completedCount}/{p.resourceCount} resources
                    {p.matchPercentage != null && ` · ${p.matchPercentage}% match`}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
