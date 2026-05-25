"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { FeedbackJson, InterviewConfig } from "@/lib/interview/types";

type Props = {
  config: InterviewConfig;
  feedback: FeedbackJson;
  source?: string;
  warning?: string | null;
  onViewHistory: () => void;
  onNewInterview: () => void;
};

export function InterviewScoreDashboard({
  config,
  feedback,
  source,
  warning,
  onViewHistory,
  onNewInterview,
}: Props) {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 lg:px-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>Interview results</CardTitle>
            <Badge variant="secondary">{config.jobTitle}</Badge>
            <Badge variant="outline">{config.interviewType}</Badge>
          </div>
          <CardDescription>{feedback.summary}</CardDescription>
          {warning && (
            <p className="text-sm text-amber-600 dark:text-amber-400">{warning}</p>
          )}
          {source && (
            <p className="text-xs text-muted-foreground">
              Evaluation source: {source}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-2 py-4">
            <span className="text-5xl font-bold tabular-nums">
              {feedback.overallScore}
            </span>
            <span className="text-sm text-muted-foreground">Overall technical score</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Metric label="Communication clarity" value={feedback.communicationClarity} />
            <Metric label="Technical accuracy" value={feedback.technicalAccuracy} />
          </div>

          <div>
            <h3 className="mb-2 font-medium">Areas for improvement</h3>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              {feedback.improvements.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={onViewHistory}>View in History</Button>
            <Button variant="outline" onClick={onNewInterview}>
              Start new interview
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}
