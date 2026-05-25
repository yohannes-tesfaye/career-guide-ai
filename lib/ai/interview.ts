import { askJson } from "./gemini";
import { friendlyAiMessage } from "./messages";
import type {
  FeedbackJson,
  InterviewQuestionResult,
  TranscriptEntry,
} from "@/lib/interview/types";

type QuestionAiResponse = {
  question: string;
  questionType: string;
};

type EvaluationAiResponse = FeedbackJson;

const QUESTION_PROMPT = (p: {
  jobTitle: string;
  jobDescription: string;
  questionIndex: number;
  totalQuestions: number;
  priorQa: TranscriptEntry[];
}) => `You are a senior technical interviewer conducting a mock interview.

Job title: ${p.jobTitle}
Job description:
${p.jobDescription}

This is question ${p.questionIndex + 1} of ${p.totalQuestions}.
${p.priorQa.length ? `Prior Q&A:\n${p.priorQa.map((q) => `Q: ${q.question}\nA: ${q.answer}`).join("\n\n")}` : "This is the first question."}

Generate ONE realistic, targeted technical interview question appropriate for this role.
Return ONLY JSON:
{"question":"...","questionType":"technical|behavioral|system-design|coding"}`;

const EVAL_PROMPT = (p: {
  jobTitle: string;
  jobDescription: string;
  transcript: TranscriptEntry[];
}) => `You are grading a technical mock interview.

Job title: ${p.jobTitle}
Job description:
${p.jobDescription}

Full transcript:
${p.transcript.map((t) => `[Q${t.questionIndex + 1}] ${t.question}\n[A] ${t.answer}`).join("\n\n")}

Grade the candidate. Return ONLY JSON:
{
  "overallScore": 0,
  "communicationClarity": 0,
  "technicalAccuracy": 0,
  "improvements": ["..."],
  "summary": "..."
}

Scores are 0-100 integers. improvements: 3-5 actionable bullets.`;

const FALLBACK_QUESTIONS = [
  "Walk me through a recent project where you owned a significant technical decision. What trade-offs did you consider?",
  "How would you design a scalable API for this role's core product requirements?",
  "Describe how you debug a production incident under time pressure.",
  "What metrics would you use to evaluate success for a feature you'd ship in the first 90 days?",
  "Explain a time you disagreed with a teammate on a technical approach. How did you resolve it?",
];

export async function generateInterviewQuestion(params: {
  jobTitle: string;
  jobDescription: string;
  questionIndex: number;
  totalQuestions: number;
  priorQa: TranscriptEntry[];
}): Promise<InterviewQuestionResult> {
  try {
    const { data, source } = await askJson<QuestionAiResponse>(
      QUESTION_PROMPT(params)
    );
    return {
      question: data.question?.trim() || FALLBACK_QUESTIONS[params.questionIndex % FALLBACK_QUESTIONS.length],
      questionType: data.questionType || "technical",
      source,
      warning: null,
    };
  } catch (e) {
    return {
      question: FALLBACK_QUESTIONS[params.questionIndex % FALLBACK_QUESTIONS.length],
      questionType: "technical",
      source: "fallback",
      warning: friendlyAiMessage(e),
    };
  }
}

export async function evaluateInterview(params: {
  jobTitle: string;
  jobDescription: string;
  transcript: TranscriptEntry[];
}): Promise<{
  feedback: FeedbackJson;
  source: "gemini" | "fallback";
  warning: string | null;
}> {
  try {
    const { data, source } = await askJson<EvaluationAiResponse>(
      EVAL_PROMPT(params)
    );
    const feedback: FeedbackJson = {
      overallScore: clampScore(data.overallScore),
      communicationClarity: clampScore(data.communicationClarity),
      technicalAccuracy: clampScore(data.technicalAccuracy),
      improvements: Array.isArray(data.improvements)
        ? data.improvements.slice(0, 6)
        : ["Practice structuring answers with context, action, and result."],
      summary: data.summary?.trim() || "Interview completed. Review your answers and focus on clarity and depth.",
    };
    return { feedback, source, warning: null };
  } catch (e) {
    const avgLength =
      params.transcript.reduce((n, t) => n + t.answer.length, 0) /
      Math.max(params.transcript.length, 1);
    const base = avgLength > 120 ? 72 : avgLength > 60 ? 58 : 45;
    return {
      feedback: {
        overallScore: base,
        communicationClarity: base - 5,
        technicalAccuracy: base - 3,
        improvements: [
          "Provide more concrete examples from your experience.",
          "Structure answers with a clear beginning, middle, and conclusion.",
          "Tie your responses back to the job requirements explicitly.",
        ],
        summary:
          "Automated fallback scoring was used because AI grading was unavailable. Configure GEMINI_API_KEY for full evaluation.",
      },
      source: "fallback",
      warning: friendlyAiMessage(e),
    };
  }
}

function clampScore(n: unknown): number {
  const v = typeof n === "number" ? n : Number(n);
  if (Number.isNaN(v)) return 50;
  return Math.min(100, Math.max(0, Math.round(v)));
}
