"use client";

import { useCallback, useEffect, useState } from "react";
import {
  generateInterviewTurn,
  evaluateInterviewSession,
  saveInterviewSession,
} from "@/app/actions/interview";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type {
  FeedbackJson,
  InterviewConfig,
  TranscriptEntry,
} from "@/lib/interview/types";

type Props = {
  config: InterviewConfig;
  onComplete: (params: {
    feedback: FeedbackJson;
    source?: string;
    warning?: string | null;
  }) => void;
  onCancel: () => void;
};

export function TextInterviewConsole({ config, onComplete, onCancel }: Props) {
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [currentQuestionType, setCurrentQuestionType] = useState<string>("technical");
  const [answer, setAnswer] = useState("");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);

  const loadQuestion = useCallback(async () => {
    setLoading(true);
    const result = await generateInterviewTurn({
      jobTitle: config.jobTitle,
      jobDescription: config.jobDescription,
      questionIndex,
      totalQuestions: config.totalQuestions,
      priorQa: transcript,
    });
    if (result.success) {
      setCurrentQuestion(result.question);
      setCurrentQuestionType(result.questionType);
      if (result.warning) setWarning(result.warning);
    } else {
      toast.error(result.error ?? "Failed to load question");
      onCancel();
    }
    setLoading(false);
  }, [config, questionIndex, transcript, onCancel]);

  useEffect(() => {
    loadQuestion();
  }, [loadQuestion]);

  const handleSubmitAnswer = async () => {
    if (!currentQuestion || !answer.trim()) return;
    setSubmitting(true);

    const entry: TranscriptEntry = {
      question: currentQuestion,
      answer: answer.trim(),
      questionIndex,
      questionType: currentQuestionType,
    };
    const nextTranscript = [...transcript, entry];
    setTranscript(nextTranscript);
    setAnswer("");

    const isLast = questionIndex + 1 >= config.totalQuestions;

    if (!isLast) {
      setQuestionIndex((i) => i + 1);
      setSubmitting(false);
      return;
    }

    setEvaluating(true);
    const evalResult = await evaluateInterviewSession({
      jobTitle: config.jobTitle,
      jobDescription: config.jobDescription,
      transcript: nextTranscript,
    });

    if (!evalResult.success) {
      toast.error(evalResult.error ?? "Evaluation failed");
      setSubmitting(false);
      setEvaluating(false);
      return;
    }

    const saveResult = await saveInterviewSession({
      jobTitle: config.jobTitle,
      jobDescription: config.jobDescription,
      jobId: config.jobId,
      interviewType: config.interviewType,
      voicePreset: config.voicePreset,
      transcript: nextTranscript,
      feedback: evalResult.feedback,
    });

    if (!saveResult.success) {
      toast.error(saveResult.error ?? "Failed to save session");
      setSubmitting(false);
      setEvaluating(false);
      return;
    }

    setSubmitting(false);
    setEvaluating(false);
    onComplete({
      feedback: evalResult.feedback,
      source: evalResult.source,
      warning: evalResult.warning ?? warning,
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 lg:px-6">
      <div className="flex items-center justify-between">
        <Badge variant="outline">
          Question {Math.min(questionIndex + 1, config.totalQuestions)} of{" "}
          {config.totalQuestions}
        </Badge>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Exit
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Interviewer</CardTitle>
          <CardDescription>Text-based mock interview</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Preparing question…
            </div>
          ) : (
            <p className="rounded-lg bg-muted/50 p-4 text-sm">{currentQuestion}</p>
          )}

          {transcript.length > 0 && (
            <div className="max-h-48 space-y-2 overflow-y-auto border-t pt-4">
              {transcript.map((t) => (
                <div key={t.questionIndex} className="text-xs text-muted-foreground">
                  <span className="font-medium">You:</span> {t.answer.slice(0, 120)}
                  {t.answer.length > 120 ? "…" : ""}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your answer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your response…"
            rows={6}
            disabled={loading || submitting || evaluating}
          />
          <Button
            className="w-full"
            onClick={handleSubmitAnswer}
            disabled={
              loading || !answer.trim() || submitting || evaluating
            }
          >
            {evaluating ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Evaluating…
              </>
            ) : submitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Saving…
              </>
            ) : questionIndex + 1 >= config.totalQuestions ? (
              "Submit final answer"
            ) : (
              "Submit & next question"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
