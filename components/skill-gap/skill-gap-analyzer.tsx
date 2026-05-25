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
import { SkillGapResults } from "./skill-gap-results";
import type { JobListItem } from "@/lib/jobs/types";
import { toast } from "sonner";
import { BriefcaseIcon, HistoryIcon } from "lucide-react";

interface AnalysisResult {
  matchPercentage: number;
  missingSkills: string[];
  matchedSkills: string[];
  experienceGaps: string[];
  reportSummary: string;
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
}

export function SkillGapAnalyzer({ initialJobId }: SkillGapAnalyzerProps) {
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [selectedJobId, setSelectedJobId] = useState(initialJobId ?? "");
  const [loadingJobs, setLoadingJobs] = useState(true);
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
      if (initialJobId && !selectedJobId) {
        setSelectedJobId(initialJobId);
      }
    } catch {
      toast.error("Could not load jobs");
    } finally {
      setLoadingJobs(false);
    }
  }, [initialJobId, selectedJobId]);

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

  useEffect(() => {
    loadJobs();
    loadHistory();
  }, [loadJobs, loadHistory]);

  const runAnalysis = async () => {
    if (!selectedJobId) {
      toast.error("Select a job first");
      return;
    }

    setAnalyzing(true);
    setResult(null);

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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BriefcaseIcon className="size-5" />
            Compare profile to job
          </CardTitle>
          <CardDescription>
            Select a job to compare your saved skills and work experience against
            its requirements.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingJobs ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select value={selectedJobId} onValueChange={setSelectedJobId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a job listing..." />
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
            <p className="text-sm text-muted-foreground">
              {selectedJob.location} ·{" "}
              {(selectedJob.requiredSkills ?? []).length} skills detected
            </p>
          )}

          <div className="flex gap-2">
            <Button onClick={runAnalysis} disabled={analyzing || !selectedJobId}>
              {analyzing ? "Analyzing..." : "Run skill-gap analysis"}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/jobs">Browse jobs</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && <SkillGapResults {...result} />}

      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <HistoryIcon className="size-4" />
              Recent analyses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {history.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between rounded-md border p-3 text-sm"
                >
                  <div>
                    <p className="font-medium">
                      {item.job?.title ?? "Unknown job"}
                    </p>
                    <p className="text-muted-foreground">
                      {item.job?.company} ·{" "}
                      {new Date(item.date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="font-semibold text-primary">
                    {item.matchPercentage}%
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
