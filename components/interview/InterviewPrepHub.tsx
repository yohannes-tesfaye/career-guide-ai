"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InterviewConfigForm } from "./InterviewConfigForm";
import { TextInterviewConsole } from "./TextInterviewConsole";
import { VideoInterviewConsole } from "./VideoInterviewConsole";
import { InterviewScoreDashboard } from "./InterviewScoreDashboard";
import { InterviewHistoryTab } from "./InterviewHistoryTab";
import type { FeedbackJson, InterviewConfig } from "@/lib/interview/types";

type Phase = "config" | "active" | "evaluating" | "results";

export function InterviewPrepHub() {
  const [tab, setTab] = useState("new");
  const [phase, setPhase] = useState<Phase>("config");
  const [config, setConfig] = useState<InterviewConfig | null>(null);
  const [feedback, setFeedback] = useState<FeedbackJson | null>(null);
  const [evalSource, setEvalSource] = useState<string | undefined>();
  const [evalWarning, setEvalWarning] = useState<string | null>(null);

  const handleStart = (c: InterviewConfig) => {
    setConfig(c);
    setPhase("active");
    setFeedback(null);
  };

  const handleComplete = (params: {
    feedback: FeedbackJson;
    source?: string;
    warning?: string | null;
  }) => {
    setFeedback(params.feedback);
    setEvalSource(params.source);
    setEvalWarning(params.warning ?? null);
    setPhase("results");
  };

  const resetToConfig = () => {
    setPhase("config");
    setConfig(null);
    setFeedback(null);
  };

  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full">
      <TabsList className="mx-4 lg:mx-6">
        <TabsTrigger value="new">New Interview</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
      </TabsList>

      <TabsContent value="new" className="mt-6">
        {phase === "config" && (
          <InterviewConfigForm onStart={handleStart} />
        )}
        {phase === "active" && config && config.interviewType === "text" && (
          <TextInterviewConsole
            config={config}
            onComplete={handleComplete}
            onCancel={resetToConfig}
          />
        )}
        {phase === "active" && config && config.interviewType === "video" && (
          <VideoInterviewConsole
            config={config}
            onComplete={handleComplete}
            onCancel={resetToConfig}
          />
        )}
        {phase === "results" && config && feedback && (
          <InterviewScoreDashboard
            config={config}
            feedback={feedback}
            source={evalSource}
            warning={evalWarning}
            onViewHistory={() => {
              setTab("history");
              resetToConfig();
            }}
            onNewInterview={resetToConfig}
          />
        )}
      </TabsContent>

      <TabsContent value="history" className="mt-6">
        <InterviewHistoryTab />
      </TabsContent>
    </Tabs>
  );
}
