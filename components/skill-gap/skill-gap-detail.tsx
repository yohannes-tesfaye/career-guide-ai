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
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { LearningPathPanel } from "./learning-path-panel";
import { ArrowLeftIcon } from "lucide-react";

interface AnalysisDetail {
  id: string;
  matchPercentage: number;
  missingSkills: string[];
  experienceGaps: string[];
  reportSummary: string | null;
  date: string;
  job: {
    id: string;
    title: string;
    company: string;
    location: string;
    description: string;
  } | null;
  learningPaths: { id: string; title: string | null; status: string }[];
}

export function SkillGapDetail({ analysisId }: { analysisId: string }) {
  const [data, setData] = useState<AnalysisDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/skill-gap/${analysisId}`)
      .then((r) => r.json())
      .then((d) => setData(d.analysis))
      .finally(() => setLoading(false));
  }, [analysisId]);

  if (loading) return <Skeleton className="h-96 w-full" />;
  if (!data)
    return (
      <p className="text-center text-muted-foreground py-12">Analysis not found</p>
    );

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/skill-gap">
          <ArrowLeftIcon className="mr-1 size-4" />
          Back
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{data.job?.title ?? "Skill gap analysis"}</CardTitle>
          <CardDescription>
            {data.job?.company} · {data.job?.location} ·{" "}
            {new Date(data.date).toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-primary">
              {data.matchPercentage}%
            </span>
            <span className="text-sm text-muted-foreground">match</span>
          </div>
          <Progress value={data.matchPercentage} className="h-3" />
          {data.reportSummary && (
            <p className="text-sm text-muted-foreground">{data.reportSummary}</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-destructive">
              Missing ({data.missingSkills.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-1">
            {data.missingSkills.map((s) => (
              <Badge key={s} variant="destructive">
                {s}
              </Badge>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Experience gaps</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1">
              {data.experienceGaps.map((g, i) => (
                <li key={i}>{g}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {data.job && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Job description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap max-h-48 overflow-y-auto">
              {data.job.description.slice(0, 2000)}
            </p>
            <Button variant="link" className="mt-2 px-0" asChild>
              <Link href={`/jobs/${data.job.id}`}>View full job</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <LearningPathPanel skillGapId={data.id} />

      {data.learningPaths.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Saved learning paths</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.learningPaths.map((lp) => (
              <Link
                key={lp.id}
                href={`/learning-path/${lp.id}`}
                className="block rounded-md border p-3 text-sm hover:bg-muted/50"
              >
                {lp.title ?? "Learning path"} — {lp.status}
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
