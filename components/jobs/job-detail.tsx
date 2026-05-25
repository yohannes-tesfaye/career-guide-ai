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
import { Skeleton } from "@/components/ui/skeleton";
import { SkillGapResults } from "@/components/skill-gap/skill-gap-results";
import type { JobListItem } from "@/lib/jobs/types";
import { toast } from "sonner";
import {
  ArrowLeftIcon,
  Building2,
  ExternalLinkIcon,
  MapPin,
  SparklesIcon,
} from "lucide-react";

interface JobDetailProps {
  jobId: string;
}

export function JobDetail({ jobId }: JobDetailProps) {
  const [job, setJob] = useState<JobListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<{
    skillGapId: string;
    matchPercentage: number;
    missingSkills: string[];
    matchedSkills: string[];
    experienceGaps: string[];
    reportSummary: string;
    strengths?: string[];
    recommendations?: string[];
    source?: string;
    warning?: string | null;
    salaryBenchmark: {
      jobTitle: string;
      region: string;
      percentile25: number | null;
      median: number | null;
      percentile75: number | null;
    } | null;
  } | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/jobs/${jobId}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setJob(data.job);
      } catch {
        toast.error("Job not found");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [jobId]);

  const runAnalysis = async () => {
    if (!job) return;
    setAnalyzing(true);
    try {
      const res = await fetch("/api/jobs/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Analysis failed");
        return;
      }
      setAnalysis(data.analysis);
      toast.success("Analysis saved to your profile");
    } catch {
      toast.error("Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 px-4 lg:px-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="px-4 py-12 text-center lg:px-6">
        <p className="text-muted-foreground">Job not found.</p>
        <Button asChild className="mt-4" variant="outline">
          <Link href="/jobs">
            <ArrowLeftIcon className="mr-1 size-4" />
            Back to jobs
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <Button asChild variant="ghost" size="sm">
        <Link href="/jobs">
          <ArrowLeftIcon className="mr-1 size-4" />
          Back to Job Explorer
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{job.title}</CardTitle>
          <CardDescription className="flex flex-wrap items-center gap-3 text-base">
            <span className="flex items-center gap-1">
              <Building2 className="size-4" />
              {job.company}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="size-4" />
              {job.location}
            </span>
            {job.remote && <Badge>Remote</Badge>}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(job.requiredSkills ?? []).length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium">Detected skills</p>
              <div className="flex flex-wrap gap-1">
                {(job.requiredSkills ?? []).map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="mb-2 text-sm font-medium">Description</p>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {job.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={runAnalysis} disabled={analyzing}>
              <SparklesIcon className="mr-1 size-4" />
              {analyzing ? "Analyzing..." : "Analyze skill gap"}
            </Button>
            <Button asChild variant="outline">
              <Link href={`/skill-gap?jobId=${job.id}`}>
                Full skill-gap page
              </Link>
            </Button>
            {job.url && (
              <Button asChild variant="outline">
                <a href={job.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLinkIcon className="mr-1 size-4" />
                  View original
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {analysis && (
        <SkillGapResults {...analysis} skillGapId={analysis.skillGapId} />
      )}
    </div>
  );
}
