"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LearningPathPanel } from "./learning-path-panel";
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  DollarSignIcon,
  SparklesIcon,
  TrendingUpIcon,
} from "lucide-react";

interface SkillGapResultsProps {
  skillGapId?: string;
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

export function SkillGapResults({
  skillGapId,
  matchPercentage,
  missingSkills,
  matchedSkills,
  experienceGaps,
  reportSummary,
  strengths = [],
  recommendations = [],
  source,
  warning,
  salaryBenchmark,
}: SkillGapResultsProps) {
  const matchColor =
    matchPercentage >= 80
      ? "text-green-600"
      : matchPercentage >= 50
        ? "text-yellow-600"
        : "text-red-600";

  const showNote =
    warning &&
    !warning.includes("GoogleGenerativeAI") &&
    !warning.includes("generativelanguage");

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUpIcon className="size-5" />
            Match score
            {source && (
              <Badge variant="outline" className="text-xs font-normal">
                <SparklesIcon className="mr-1 size-3" />
                {source === "gemini" ? "Gemini AI" : "Profile match"}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>{reportSummary}</CardDescription>
          {showNote && (
            <p className="text-xs text-amber-600 dark:text-amber-400">{warning}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className={`text-3xl font-bold ${matchColor}`}>
              {matchPercentage}%
            </span>
            <span className="text-sm text-muted-foreground">skill match</span>
          </div>
          <Progress value={matchPercentage} className="h-3" />
        </CardContent>
      </Card>

      {strengths.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-green-600">Strengths</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {strengths.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {recommendations.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {salaryBenchmark && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSignIcon className="size-4" />
              Salary benchmark — {salaryBenchmark.region}
            </CardTitle>
            <CardDescription>
              Estimated range for {salaryBenchmark.jobTitle}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">25th %ile</p>
                <p className="font-semibold">
                  ${salaryBenchmark.percentile25?.toLocaleString() ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Median</p>
                <p className="text-lg font-bold text-primary">
                  ${salaryBenchmark.median?.toLocaleString() ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">75th %ile</p>
                <p className="font-semibold">
                  ${salaryBenchmark.percentile75?.toLocaleString() ?? "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-green-600">
              <CheckCircle2Icon className="size-4" />
              Skills you have ({matchedSkills.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {matchedSkills.length === 0 ? (
              <p className="text-sm text-muted-foreground">No direct matches yet.</p>
            ) : (
              <div className="flex flex-wrap gap-1">
                {matchedSkills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-destructive">
              <AlertCircleIcon className="size-4" />
              Missing ({missingSkills.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {missingSkills.length === 0 ? (
              <p className="text-sm text-muted-foreground">Great match.</p>
            ) : (
              <div className="flex flex-wrap gap-1">
                {missingSkills.map((skill) => (
                  <Badge key={skill} variant="destructive">
                    {skill}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {experienceGaps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Experience gaps</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {experienceGaps.map((gap, i) => (
                <li key={i} className="flex items-start gap-2">
                  <AlertCircleIcon className="mt-0.5 size-4 shrink-0 text-destructive" />
                  {gap}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {skillGapId && <LearningPathPanel skillGapId={skillGapId} />}
    </div>
  );
}
