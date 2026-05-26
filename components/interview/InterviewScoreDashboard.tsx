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
import { Award, ArrowRight, RefreshCw, CheckCircle2, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const scoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500 stroke-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (score >= 60) return "text-amber-500 stroke-amber-500 bg-amber-500/10 border-amber-500/20";
    return "text-rose-500 stroke-rose-500 bg-rose-500/10 border-rose-500/20";
  };

  const scoreBarColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-rose-500";
  };

  const getRadius = 40;
  const getCircumference = 2 * Math.PI * getRadius;
  const strokeDashoffset = getCircumference - (feedback.overallScore / 100) * getCircumference;

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 lg:px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="border border-border/80 shadow-xl overflow-hidden bg-card/50 backdrop-blur-sm">
        <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 via-primary to-emerald-500 animate-gradient" />
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Award className="size-5 text-primary animate-bounce" />
              </div>
              <CardTitle className="text-xl">Evaluation Report</CardTitle>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="font-semibold">{config.jobTitle}</Badge>
              <Badge variant="outline" className="capitalize">{config.interviewType} session</Badge>
              {config.difficulty && (
                <Badge variant="outline" className={cn(
                  "capitalize border-primary/20",
                  config.difficulty === "easy" && "text-emerald-500 bg-emerald-500/5",
                  config.difficulty === "medium" && "text-amber-500 bg-amber-500/5",
                  config.difficulty === "hard" && "text-rose-500 bg-rose-500/5"
                )}>
                  {config.difficulty}
                </Badge>
              )}
            </div>
          </div>
          <CardDescription className="text-sm leading-relaxed text-muted-foreground">
            {feedback.summary}
          </CardDescription>
          {warning && (
            <p className="text-xs font-medium text-amber-500/90 bg-amber-500/5 border border-amber-500/10 rounded-lg px-3 py-2">
              ⚠️ {warning}
            </p>
          )}
          {source && (
            <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/60">
              Evaluator: {source}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-8">
          
          {/* Radial score circle */}
          <div className="flex flex-col items-center justify-center py-4 bg-muted/20 rounded-2xl border border-muted-foreground/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <TrendingUp className="size-24" />
            </div>
            
            <div className="relative flex items-center justify-center">
              <svg className="size-28 transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r={getRadius}
                  className="stroke-muted"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="56"
                  cy="56"
                  r={getRadius}
                  className={cn("transition-all duration-1000 ease-out", scoreColor(feedback.overallScore).split(" ")[1])}
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={getCircumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-3xl font-extrabold tracking-tight tabular-nums">
                  {feedback.overallScore}
                </span>
                <span className="text-xs text-muted-foreground block font-medium">/100</span>
              </div>
            </div>
            
            <p className="text-sm font-semibold tracking-wide text-muted-foreground mt-3 uppercase">
              Overall Technical Score
            </p>
          </div>

          {/* Horizontal progress bars for breakdown */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 border border-border/60 bg-muted/10 rounded-xl p-4 transition-all hover:bg-muted/20">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Communication Clarity</span>
                <span className="text-sm font-bold tabular-nums">{feedback.communicationClarity}%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={cn("h-full transition-all duration-1000 ease-out", scoreBarColor(feedback.communicationClarity))}
                  style={{ width: `${feedback.communicationClarity}%` }}
                />
              </div>
            </div>

            <div className="space-y-2 border border-border/60 bg-muted/10 rounded-xl p-4 transition-all hover:bg-muted/20">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Technical Accuracy</span>
                <span className="text-sm font-bold tabular-nums">{feedback.technicalAccuracy}%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={cn("h-full transition-all duration-1000 ease-out", scoreBarColor(feedback.technicalAccuracy))}
                  style={{ width: `${feedback.technicalAccuracy}%` }}
                />
              </div>
            </div>
          </div>

          {/* Advice cards */}
          <div>
            <h3 className="mb-3 font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-primary" />
              Key Areas for Improvement
            </h3>
            <div className="grid gap-3">
              {feedback.improvements.map((item, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg border border-border/40 bg-card p-3 shadow-sm hover:shadow transition-all duration-200">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border/40">
            <Button onClick={onViewHistory} className="cursor-pointer font-medium flex items-center gap-1.5 shadow-md shadow-primary/10">
              View History
              <ArrowRight className="size-4" />
            </Button>
            <Button variant="outline" onClick={onNewInterview} className="cursor-pointer font-medium flex items-center gap-1.5 hover:bg-muted">
              <RefreshCw className="size-4" />
              Start New Interview
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
