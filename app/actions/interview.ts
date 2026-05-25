"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  generateInterviewQuestion,
  evaluateInterview,
} from "@/lib/ai/interview";
import {
  encodeAudioBase64,
  synthesizeSpeech,
  parseFishAudioError,
} from "@/lib/interview/fish-audio";
import type { FishAudioErrorCode } from "@/lib/interview/fish-audio-errors";
import {
  saveInterviewSessionSchema,
  type FeedbackJson,
  type HistorySessionItem,
  type TranscriptEntry,
  type VoicePresetId,
} from "@/lib/interview/types";
import { Prisma } from "../../generated/prisma/client";

async function requireUserId(): Promise<string | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user?.id ?? null;
}

export async function generateInterviewTurn(params: {
  jobTitle: string;
  jobDescription: string;
  questionIndex: number;
  totalQuestions: number;
  priorQa: TranscriptEntry[];
}) {
  const userId = await requireUserId();
  if (!userId) {
    return { success: false as const, error: "Unauthorized" };
  }

  try {
    const result = await generateInterviewQuestion({
      jobTitle: params.jobTitle,
      jobDescription: params.jobDescription,
      questionIndex: params.questionIndex,
      totalQuestions: params.totalQuestions,
      priorQa: params.priorQa,
    });
    return { success: true as const, ...result };
  } catch (e) {
    console.error("generateInterviewTurn:", e);
    return { success: false as const, error: "Failed to generate question" };
  }
}

export async function evaluateInterviewSession(params: {
  jobTitle: string;
  jobDescription: string;
  transcript: TranscriptEntry[];
}) {
  const userId = await requireUserId();
  if (!userId) {
    return { success: false as const, error: "Unauthorized" };
  }

  try {
    const { feedback, source, warning } = await evaluateInterview(params);
    return { success: true as const, feedback, source, warning };
  } catch (e) {
    console.error("evaluateInterviewSession:", e);
    return { success: false as const, error: "Failed to evaluate interview" };
  }
}

export async function synthesizeInterviewerSpeech(params: {
  text: string;
  voicePreset: VoicePresetId;
  interviewType: "text" | "video";
}) {
  const userId = await requireUserId();
  if (!userId) {
    return { success: false as const, error: "Unauthorized" };
  }

  if (params.interviewType !== "video") {
    return {
      success: false as const,
      error: "TTS is only available in video interview mode.",
    };
  }

  try {
    const { buffer, mimeType } = await synthesizeSpeech({
      text: params.text,
      voicePreset: params.voicePreset,
    });
    return {
      success: true as const,
      base64Audio: encodeAudioBase64(buffer),
      mimeType,
    };
  } catch (e) {
    const parsed = parseFishAudioError(e);
    console.error("synthesizeInterviewerSpeech:", e);
    return {
      success: false as const,
      error: parsed.message,
      errorCode: parsed.code,
    };
  }
}

export async function saveInterviewSession(
  payload: z.infer<typeof saveInterviewSessionSchema>
) {
  const userId = await requireUserId();
  if (!userId) {
    return { success: false as const, error: "Unauthorized" };
  }

  const parsed = saveInterviewSessionSchema.safeParse(payload);
  if (!parsed.success) {
    return { success: false as const, error: "Invalid session data" };
  }

  const data = parsed.data;

  try {
    const session = await prisma.interviewSession.create({
      data: {
        userId,
        jobId: data.jobId || null,
        jobTitle: data.jobTitle,
        jobContext: data.jobDescription,
        interviewType: data.interviewType,
        voicePreset: data.voicePreset ?? null,
        overallScore: data.feedback.overallScore,
        feedbackJson: data.feedback as unknown as Prisma.InputJsonValue,
        transcriptJson: data.transcript as unknown as Prisma.InputJsonValue,
        interviewQAs: {
          create: data.transcript.map((entry) => ({
            questionText: entry.question,
            questionType: entry.questionType ?? null,
            userAnswerTranscript: entry.answer,
          })),
        },
      },
    });

    revalidatePath("/interview");

    return { success: true as const, sessionId: session.id };
  } catch (e) {
    console.error("saveInterviewSession:", e);
    return { success: false as const, error: "Failed to save interview session" };
  }
}

export async function getInterviewHistory(): Promise<{
  success: boolean;
  sessions?: HistorySessionItem[];
  error?: string;
}> {
  const userId = await requireUserId();
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const rows = await prisma.interviewSession.findMany({
      where: { userId },
      orderBy: { timestamp: "desc" },
      take: 50,
      select: {
        id: true,
        timestamp: true,
        jobTitle: true,
        interviewType: true,
        overallScore: true,
        voicePreset: true,
        feedbackJson: true,
        transcriptJson: true,
      },
    });

    const sessions: HistorySessionItem[] = rows.map((row) => ({
      id: row.id,
      date: row.timestamp.toISOString(),
      jobTitle: row.jobTitle,
      interviewType: row.interviewType,
      score: row.overallScore != null ? Number(row.overallScore) : null,
      voicePreset: row.voicePreset,
      feedbackJson: row.feedbackJson as FeedbackJson | null,
      transcriptJson: row.transcriptJson as TranscriptEntry[] | null,
    }));

    return { success: true, sessions };
  } catch (e) {
    console.error("getInterviewHistory:", e);
    return { success: false, error: "Failed to load history" };
  }
}
