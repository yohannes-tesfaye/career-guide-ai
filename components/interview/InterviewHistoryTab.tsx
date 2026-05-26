"use client";

import { useCallback, useEffect, useState } from "react";
import { getInterviewHistory } from "@/app/actions/interview";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { HistorySessionItem } from "@/lib/interview/types";
import { ChevronDown, ChevronUp, History } from "lucide-react";
import { cn } from "@/lib/utils";

export function InterviewHistoryTab() {
  const [sessions, setSessions] = useState<HistorySessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await getInterviewHistory();
    if (result.success && result.sessions) {
      setSessions(result.sessions);
    } else {
      setError(result.error ?? "Failed to load history");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="space-y-4 px-4 lg:px-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="px-4 text-sm text-destructive lg:px-6">{error}</p>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card className="mx-4 lg:mx-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="size-5" />
            No sessions yet
          </CardTitle>
          <CardDescription>
            Complete a mock interview to see your scores and feedback here.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4 px-4 lg:px-6">
      {sessions.map((session) => {
        const expanded = expandedId === session.id;
        return (
          <Card key={session.id}>
            <CardHeader
              className="cursor-pointer"
              onClick={() =>
                setExpandedId(expanded ? null : session.id)
              }
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-base">
                    {session.jobTitle ?? "Untitled role"}
                  </CardTitle>
                  <CardDescription>
                    {new Date(session.date).toLocaleString()}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">{session.interviewType}</Badge>
                  {session.score != null && (
                    <Badge className={cn(
                      "font-semibold",
                      session.score >= 80 ? "bg-emerald-500 hover:bg-emerald-600" :
                      session.score >= 60 ? "bg-amber-500 hover:bg-amber-600" :
                      "bg-rose-500 hover:bg-rose-600"
                    )}>
                      Score: {session.score}/100
                    </Badge>
                  )}
                  {expanded ? (
                    <ChevronUp className="size-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="size-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            </CardHeader>
            {expanded && (
              <CardContent className="space-y-4 border-t pt-4 bg-muted/5 rounded-b-xl animate-in fade-in duration-200">
                {session.feedbackJson && (
                  <div className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="bg-card border border-border/60 rounded-xl p-3 flex justify-between items-center text-xs">
                        <span className="text-muted-foreground font-semibold uppercase tracking-wider">Communication Clarity</span>
                        <span className="font-bold text-sm">{session.feedbackJson.communicationClarity}%</span>
                      </div>
                      <div className="bg-card border border-border/60 rounded-xl p-3 flex justify-between items-center text-xs">
                        <span className="text-muted-foreground font-semibold uppercase tracking-wider">Technical Accuracy</span>
                        <span className="font-bold text-sm">{session.feedbackJson.technicalAccuracy}%</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-foreground">Interviewer Feedback</h4>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        {session.feedbackJson.summary}
                      </p>
                    </div>

                    {session.feedbackJson.improvements && session.feedbackJson.improvements.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Areas for improvement</h4>
                        <ul className="mt-2 space-y-1.5">
                          {session.feedbackJson.improvements.map((item, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-primary font-bold">▪</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                {session.transcriptJson && session.transcriptJson.length > 0 && (
                  <div className="border-t border-border/40 pt-4">
                    <h4 className="mb-3 text-sm font-semibold text-foreground">Interview Transcript</h4>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                      {session.transcriptJson.map((entry) => (
                        <div
                          key={entry.questionIndex}
                          className="rounded-xl border border-border/40 bg-card p-3 shadow-sm"
                        >
                          <p className="font-semibold text-xs text-primary uppercase tracking-wide">
                            Question {entry.questionIndex + 1}
                          </p>
                          <p className="text-sm font-medium text-foreground mt-1">
                            {entry.question}
                          </p>
                          <div className="mt-2 border-t border-border/20 pt-2">
                            <p className="text-[10px] uppercase font-semibold text-muted-foreground">Your Response</p>
                            <p className="text-sm text-muted-foreground mt-0.5 whitespace-pre-wrap">
                              {entry.answer}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
