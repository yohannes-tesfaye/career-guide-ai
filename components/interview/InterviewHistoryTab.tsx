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
                  <Badge variant="outline">{session.interviewType}</Badge>
                  {session.score != null && (
                    <Badge>{session.score}/100</Badge>
                  )}
                  {expanded ? (
                    <ChevronUp className="size-4" />
                  ) : (
                    <ChevronDown className="size-4" />
                  )}
                </div>
              </div>
            </CardHeader>
            {expanded && (
              <CardContent className="space-y-4 border-t pt-4">
                {session.feedbackJson && (
                  <div>
                    <h4 className="mb-1 text-sm font-medium">Feedback</h4>
                    <p className="text-sm text-muted-foreground">
                      {session.feedbackJson.summary}
                    </p>
                    <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
                      {session.feedbackJson.improvements.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {session.transcriptJson && session.transcriptJson.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-medium">Transcript</h4>
                    <div className="space-y-3">
                      {session.transcriptJson.map((entry) => (
                        <div
                          key={entry.questionIndex}
                          className={cn(
                            "rounded-md bg-muted/50 p-3 text-sm"
                          )}
                        >
                          <p className="font-medium text-foreground">
                            Q{entry.questionIndex + 1}: {entry.question}
                          </p>
                          <p className="mt-1 text-muted-foreground">
                            {entry.answer}
                          </p>
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
