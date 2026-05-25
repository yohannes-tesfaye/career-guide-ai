import { z } from "zod";

export type InterviewType = "text" | "video";
export type VoicePresetId = "alex" | "sophia" | "marcus";

export type TranscriptEntry = {
  question: string;
  answer: string;
  questionIndex: number;
  questionType?: string;
};

export type FeedbackJson = {
  overallScore: number;
  communicationClarity: number;
  technicalAccuracy: number;
  improvements: string[];
  summary: string;
};

export type InterviewConfig = {
  jobTitle: string;
  jobDescription: string;
  jobId?: string;
  interviewType: InterviewType;
  voicePreset?: VoicePresetId;
  totalQuestions: number;
};

export type InterviewQuestionResult = {
  question: string;
  questionType: string;
  source?: "gemini" | "fallback";
  warning?: string | null;
};

export type InterviewEvaluationResult = {
  feedback: FeedbackJson;
  source?: "gemini" | "fallback";
  warning?: string | null;
};

export type HistorySessionItem = {
  id: string;
  date: string;
  jobTitle: string | null;
  interviewType: string;
  score: number | null;
  voicePreset: string | null;
  feedbackJson: FeedbackJson | null;
  transcriptJson: TranscriptEntry[] | null;
};

export const interviewConfigSchema = z.object({
  jobTitle: z.string().min(1),
  jobDescription: z.string().min(10),
  jobId: z.string().optional(),
  interviewType: z.enum(["text", "video"]),
  voicePreset: z.enum(["alex", "sophia", "marcus"]).optional(),
  totalQuestions: z.number().int().min(3).max(5),
});

export function pickQuestionCount(): number {
  return Math.floor(Math.random() * 3) + 3;
}

export const saveInterviewSessionSchema = z.object({
  jobTitle: z.string().min(1),
  jobDescription: z.string().min(1),
  jobId: z.string().optional(),
  interviewType: z.enum(["text", "video"]),
  voicePreset: z.enum(["alex", "sophia", "marcus"]).optional(),
  transcript: z.array(
    z.object({
      question: z.string(),
      answer: z.string(),
      questionIndex: z.number(),
      questionType: z.string().optional(),
    })
  ),
  feedback: z.object({
    overallScore: z.number(),
    communicationClarity: z.number(),
    technicalAccuracy: z.number(),
    improvements: z.array(z.string()),
    summary: z.string(),
  }),
});
