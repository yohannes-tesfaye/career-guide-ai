"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VOICE_PRESETS } from "@/lib/interview/voice-presets";
import { pickQuestionCount } from "@/lib/interview/types";
import type { InterviewConfig, InterviewType, VoicePresetId } from "@/lib/interview/types";
import type { JobListItem } from "@/lib/jobs/types";
import { cn } from "@/lib/utils";
import { MessageSquare, Video } from "lucide-react";

type Props = {
  onStart: (config: InterviewConfig) => void;
};

export function InterviewConfigForm({ onStart }: Props) {
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobId, setJobId] = useState<string | undefined>();
  const [interviewType, setInterviewType] = useState<InterviewType>("text");
  const [voicePreset, setVoicePreset] = useState<VoicePresetId>("alex");
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  const loadJobs = useCallback(async () => {
    setLoadingJobs(true);
    try {
      const res = await fetch("/api/jobs?limit=50");
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs ?? []);
      }
    } finally {
      setLoadingJobs(false);
    }
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const handleJobSelect = (id: string) => {
    if (id === "none") {
      setJobId(undefined);
      return;
    }
    const job = jobs.find((j) => j.id === id);
    if (job) {
      setJobId(job.id);
      setJobTitle(job.title);
      setJobDescription(
        [job.title, job.company, job.location, job.description]
          .filter(Boolean)
          .join("\n\n")
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle.trim() || jobDescription.trim().length < 10) return;

    onStart({
      jobTitle: jobTitle.trim(),
      jobDescription: jobDescription.trim(),
      jobId,
      interviewType,
      voicePreset: interviewType === "video" ? voicePreset : undefined,
      totalQuestions: pickQuestionCount(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6 px-4 lg:px-6">
      <Card>
        <CardHeader>
          <CardTitle>Target role</CardTitle>
          <CardDescription>
            Describe the job you are preparing for. Questions will be tailored to this context.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="job-picker">Import from Job Explorer (optional)</Label>
            <Select onValueChange={handleJobSelect} disabled={loadingJobs}>
              <SelectTrigger id="job-picker">
                <SelectValue placeholder={loadingJobs ? "Loading jobs…" : "Select a saved job"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {jobs.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.title} — {job.company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="job-title">Job title</Label>
            <Input
              id="job-title"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Senior Full-Stack Engineer"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="job-desc">Job description</Label>
            <Textarea
              id="job-desc"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description, required skills, and responsibilities…"
              rows={6}
              required
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Simulation type</CardTitle>
          <CardDescription>
            Text mode saves Fish Audio credits. Video mode adds realistic interviewer voice.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setInterviewType("text")}
            className={cn(
              "flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-colors",
              interviewType === "text"
                ? "border-primary bg-primary/5"
                : "border-border hover:bg-muted/50"
            )}
          >
            <MessageSquare className="size-5" />
            <span className="font-medium">Text-based</span>
            <span className="text-xs text-muted-foreground">
              Chat-style Q&A. No voice synthesis.
            </span>
          </button>
          <button
            type="button"
            onClick={() => setInterviewType("video")}
            className={cn(
              "flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-colors",
              interviewType === "video"
                ? "border-primary bg-primary/5"
                : "border-border hover:bg-muted/50"
            )}
          >
            <Video className="size-5" />
            <span className="font-medium">Video-based</span>
            <span className="text-xs text-muted-foreground">
              Webcam + AI voice (Fish Audio; requires account credits). Falls back
              to browser voice if balance is empty.
            </span>
          </button>
        </CardContent>
      </Card>

      {interviewType === "video" && (
        <Card>
          <CardHeader>
            <CardTitle>Interviewer voice</CardTitle>
            <CardDescription>Choose one of three preset voices (free tier).</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {VOICE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setVoicePreset(preset.id)}
                className={cn(
                  "rounded-lg border p-4 text-left transition-colors",
                  voicePreset === preset.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/50"
                )}
              >
                <p className="font-medium">{preset.name}</p>
                <p className="text-sm text-muted-foreground">{preset.description}</p>
                <p className="mt-1 text-xs text-muted-foreground">{preset.style}</p>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      <Button type="submit" size="lg" className="w-full">
        Start interview
      </Button>
    </form>
  );
}
