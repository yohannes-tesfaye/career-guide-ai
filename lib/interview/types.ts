import { z } from "zod";

export type InterviewType = "text" | "video";
export type VoicePresetId = "talia" | "elara" | "alicia" | "caleb" | "baxter";

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
  difficulty?: "easy" | "medium" | "hard";
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
  voicePreset: z.enum(["talia", "elara", "alicia", "caleb", "baxter"]).optional(),
  totalQuestions: z.number().int().min(3).max(15),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
});

export function pickQuestionCount(): number {
  return 5;
}

export const saveInterviewSessionSchema = z.object({
  jobTitle: z.string().min(1),
  jobDescription: z.string().min(1),
  jobId: z.string().optional(),
  interviewType: z.enum(["text", "video"]),
  voicePreset: z.enum(["talia", "elara", "alicia", "caleb", "baxter"]).optional(),
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
