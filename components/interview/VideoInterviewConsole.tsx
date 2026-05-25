"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  generateInterviewTurn,
  evaluateInterviewSession,
  saveInterviewSession,
  synthesizeInterviewerSpeech,
} from "@/app/actions/interview";
import { playBase64Audio } from "@/lib/interview/play-tts-audio";
import {
  speakWithBrowserTTS,
  stopBrowserTTS,
} from "@/lib/interview/browser-tts";
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
import { Loader2, Mic, Volume2 } from "lucide-react";
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

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((ev: Event) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

function getSpeechRecognition(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function VideoInterviewConsole({ config, onComplete, onCancel }: Props) {
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [currentQuestionType, setCurrentQuestionType] = useState("technical");
  const [answer, setAnswer] = useState("");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [needsTapToPlay, setNeedsTapToPlay] = useState(false);
  const [pendingAudio, setPendingAudio] = useState<HTMLAudioElement | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [listening, setListening] = useState(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const [sttSupported, setSttSupported] = useState(false);
  const [voiceSource, setVoiceSource] = useState<"fish" | "browser" | "text">(
    "fish"
  );
  const [ttsNotice, setTtsNotice] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const revokeRef = useRef<(() => void) | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const balanceWarnedRef = useRef(false);

  const cleanupAudio = useCallback(() => {
    revokeRef.current?.();
    revokeRef.current = null;
    stopBrowserTTS();
    setPendingAudio((prev) => {
      prev?.pause();
      return null;
    });
  }, []);

  const playWithBrowserVoice = useCallback(async (text: string) => {
    setIsSpeaking(true);
    setVoiceSource("browser");
    try {
      await speakWithBrowserTTS(text);
    } catch {
      setVoiceSource("text");
      setTtsNotice("Voice unavailable — read the question below.");
    } finally {
      setIsSpeaking(false);
    }
  }, []);

  const playQuestionAudio = useCallback(
    async (text: string) => {
      if (!config.voicePreset) return;

      cleanupAudio();
      setIsSpeaking(true);
      setNeedsTapToPlay(false);

      const tts = await synthesizeInterviewerSpeech({
        text,
        voicePreset: config.voicePreset,
        interviewType: "video",
      });

      if (!tts.success) {
        setIsSpeaking(false);
        if (tts.errorCode === "INSUFFICIENT_BALANCE") {
          setTtsNotice(
            "Fish Audio balance is empty. Using free browser voice, or read questions on screen. Top up at fish.audio to restore AI voices."
          );
          if (!balanceWarnedRef.current) {
            balanceWarnedRef.current = true;
            toast.warning(tts.error, { duration: 10000 });
          }
        } else {
          toast.error(tts.error ?? "Voice synthesis failed");
          setTtsNotice("Fish Audio unavailable — using browser voice.");
        }
        await playWithBrowserVoice(text);
        return;
      }

      setVoiceSource("fish");
      setTtsNotice(null);

      try {
        const { audio, revoke } = await playBase64Audio(
          tts.base64Audio,
          tts.mimeType
        );
        revokeRef.current = revoke;
        setPendingAudio(audio);
        audio.onended = () => {
          setIsSpeaking(false);
          revoke();
          revokeRef.current = null;
        };
      } catch {
        setIsSpeaking(false);
        setNeedsTapToPlay(true);
        const binaryString = window.atob(tts.base64Audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: tts.mimeType });
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        revokeRef.current = () => URL.revokeObjectURL(url);
        setPendingAudio(audio);
      }
    },
    [config.voicePreset, cleanupAudio, playWithBrowserVoice]
  );

  const retryPlayback = async () => {
    if (!pendingAudio) {
      if (currentQuestion) await playQuestionAudio(currentQuestion);
      return;
    }
    try {
      await pendingAudio.play();
      setNeedsTapToPlay(false);
      setIsSpeaking(true);
    } catch {
      toast.error("Could not play audio. Check browser permissions.");
    }
  };

  const loadQuestion = useCallback(async () => {
    setLoading(true);
    const result = await generateInterviewTurn({
      jobTitle: config.jobTitle,
      jobDescription: config.jobDescription,
      questionIndex,
      totalQuestions: config.totalQuestions,
      priorQa: transcript,
    });
    if (!result.success) {
      toast.error(result.error ?? "Failed to load question");
      onCancel();
      return;
    }
    setCurrentQuestion(result.question);
    setCurrentQuestionType(result.questionType);
    setLoading(false);
    await playQuestionAudio(result.question);
  }, [
    config,
    questionIndex,
    transcript,
    onCancel,
    playQuestionAudio,
  ]);

  useEffect(() => {
    loadQuestion();
  }, [loadQuestion]);

  useEffect(() => {
    setSttSupported(!!getSpeechRecognition());

    async function initWebcam() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch {
        setWebcamError("Camera access denied or unavailable.");
      }
    }
    initWebcam();

    return () => {
      cleanupAudio();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      recognitionRef.current?.stop();
    };
  }, [cleanupAudio]);

  const startListening = () => {
    const Ctor = getSpeechRecognition();
    if (!Ctor) {
      toast.message("Speech recognition not supported — type your answer.");
      return;
    }
    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      let text = "";
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      setAnswer(text.trim());
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const handleSubmitAnswer = async () => {
    if (!currentQuestion || !answer.trim()) return;
    stopListening();
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
    cleanupAudio();

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
      warning: evalResult.warning,
    });
  };

  const canAnswer = !loading && !isSpeaking && !submitting && !evaluating;

  return (
    <div className="space-y-4 px-4 lg:px-6">
      <div className="flex items-center justify-between">
        <Badge variant="outline">
          Question {Math.min(questionIndex + 1, config.totalQuestions)} of{" "}
          {config.totalQuestions}
        </Badge>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Exit
        </Button>
      </div>

      {ttsNotice && (
        <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
          {ttsNotice}
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">AI Interviewer</CardTitle>
            <CardDescription>
              {isSpeaking
                ? `Speaking (${voiceSource === "fish" ? "Fish Audio" : voiceSource === "browser" ? "browser voice" : "…"})…`
                : loading
                  ? "Loading question…"
                  : "Ready for your answer"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex aspect-video items-center justify-center rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-900">
              {isSpeaking ? (
                <Volume2 className="size-12 animate-pulse text-primary" />
              ) : loading ? (
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
              ) : (
                <span className="text-4xl">🎙️</span>
              )}
            </div>
            {!loading && currentQuestion && (
              <p className="rounded-lg bg-muted/50 p-3 text-sm">{currentQuestion}</p>
            )}
            {needsTapToPlay && (
              <Button variant="secondary" size="sm" onClick={retryPlayback}>
                Tap to hear question
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your webcam</CardTitle>
          </CardHeader>
          <CardContent>
            {webcamError ? (
              <p className="text-sm text-muted-foreground">{webcamError}</p>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="aspect-video w-full rounded-lg bg-black object-cover"
              />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your answer</CardTitle>
          <CardDescription>
            {sttSupported
              ? "Use the microphone after the interviewer finishes speaking."
              : "Type your verbal response below."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Your transcribed or typed answer…"
            rows={4}
            disabled={!canAnswer}
          />
          {sttSupported && (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={listening ? stopListening : startListening}
                disabled={!canAnswer}
              >
                <Mic className="mr-2 size-4" />
                {listening ? "Stop recording" : "Start voice input"}
              </Button>
            </div>
          )}
          <Button
            className="w-full"
            onClick={handleSubmitAnswer}
            disabled={!canAnswer || !answer.trim()}
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
