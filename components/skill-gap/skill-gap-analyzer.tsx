"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { SkillGapResults } from "./skill-gap-results";
import type { JobListItem } from "@/lib/jobs/types";
import { toast } from "sonner";
import { BriefcaseIcon, HistoryIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalysisResult {
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
}

interface PastAnalysis {
  id: string;
  matchPercentage: number;
  missingSkills: string[];
  reportSummary: string | null;
  date: string;
  job: { id: string; title: string; company: string; location: string } | null;
}

interface SkillGapAnalyzerProps {
  initialJobId?: string;
  initialAnalysisId?: string;
}

export function SkillGapAnalyzer({
  initialJobId,
  initialAnalysisId,
}: SkillGapAnalyzerProps) {
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [selectedJobId, setSelectedJobId] = useState(initialJobId ?? "");
  const [selectedAnalysisId, setSelectedAnalysisId] = useState(
    initialAnalysisId ?? ""
  );
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<PastAnalysis[]>([]);

  const loadJobs = useCallback(async () => {
    setLoadingJobs(true);
    try {
      const res = await fetch("/api/jobs?limit=50&sync=true");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setJobs(data.jobs);
    } catch {
      toast.error("Could not load jobs");
    } finally {
      setLoadingJobs(false);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/skill-gap");
      if (res.ok) {
        const data = await res.json();
        setHistory(data.analyses ?? []);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const loadAnalysis = useCallback(async (analysisId: string) => {
    setLoadingAnalysis(true);
    setSelectedAnalysisId(analysisId);
    try {
      const res = await fetch(`/api/skill-gap/${analysisId}`);
      const data = await res.json();
      if (!res.ok || !data.analysis) {
        toast.error("Could not load analysis");
        return;
      }
      const a = data.analysis;
      setResult({
        skillGapId: a.id,
        matchPercentage: a.matchPercentage,
        missingSkills: a.missingSkills,
        matchedSkills: a.matchedSkills ?? [],
        experienceGaps: a.experienceGaps,
        reportSummary: a.reportSummary ?? "",
        source: a.source ?? "fallback",
        warning: null,
        salaryBenchmark: null,
      });
    } catch {
      toast.error("Could not load analysis");
    } finally {
      setLoadingAnalysis(false);
    }
  }, []);

  useEffect(() => {
    loadJobs();
    loadHistory();
  }, [loadJobs, loadHistory]);

  useEffect(() => {
    if (initialAnalysisId) loadAnalysis(initialAnalysisId);
  }, [initialAnalysisId, loadAnalysis]);

  const runAnalysis = async () => {
    if (!selectedJobId) {
      toast.error("Select a job first");
      return;
    }

    setAnalyzing(true);
    setResult(null);
    setSelectedAnalysisId("");

    try {
      const res = await fetch("/api/jobs/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: selectedJobId }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Analysis failed");
        return;
      }

      setResult(data.analysis);
      setSelectedAnalysisId(data.analysis.skillGapId);
      loadHistory();
      toast.success("Analysis complete");
    } catch {
      toast.error("Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BriefcaseIcon className="size-5" />
              New analysis
            </CardTitle>
            <CardDescription>Pick a job and compare your profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingJobs ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a job..." />
                </SelectTrigger>
                <SelectContent>
                  {jobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title} — {job.company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {selectedJob && (
              <p className="text-sm text-muted-foreground">{selectedJob.location}</p>
            )}
            <Button onClick={runAnalysis} disabled={analyzing || !selectedJobId}>
              {analyzing ? "Analyzing..." : "Run analysis"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <HistoryIcon className="size-4" />
              Recent analyses
            </CardTitle>
            <CardDescription>Click to view details</CardDescription>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No analyses yet.</p>
            ) : (
              <ul className="max-h-64 space-y-2 overflow-y-auto">
                {history.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => loadAnalysis(item.id)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg border p-3 text-left text-sm transition-colors hover:bg-muted/60",
                        selectedAnalysisId === item.id &&
                          "border-primary bg-primary/5"
                      )}
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="truncate font-medium">
                          {item.job?.title ?? "Unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.job?.company} ·{" "}
                          {new Date(item.date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge
                        variant={
                          item.matchPercentage >= 70 ? "default" : "secondary"
                        }
                      >
                        {item.matchPercentage}%
                      </Badge>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {loadingAnalysis && <Skeleton className="h-48 w-full" />}

      {result && !loadingAnalysis && (
        <div className="space-y-4">
          <SkillGapResults {...result} skillGapId={result.skillGapId} />
          <Button variant="outline" size="sm" asChild>
            <Link href={`/skill-gap/${result.skillGapId}`}>Open full page</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
