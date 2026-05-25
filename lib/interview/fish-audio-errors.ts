import { FishAudioError } from "fish-audio";

export type FishAudioErrorCode =
  | "INSUFFICIENT_BALANCE"
  | "UNAUTHORIZED"
  | "NO_API_KEY"
  | "UNKNOWN";

export function parseFishAudioError(error: unknown): {
  message: string;
  code: FishAudioErrorCode;
} {
  if (error instanceof FishAudioError) {
    const status = error.statusCode;
    const bodyMsg =
      typeof error.body === "object" &&
      error.body !== null &&
      "message" in error.body &&
      typeof (error.body as { message: unknown }).message === "string"
        ? (error.body as { message: string }).message
        : null;

    if (status === 402) {
      return {
        code: "INSUFFICIENT_BALANCE",
        message:
          "Fish Audio credits are exhausted. Add balance at fish.audio, use text interview mode, or continue with browser voice (automatic fallback).",
      };
    }
    if (status === 401 || status === 403) {
      return {
        code: "UNAUTHORIZED",
        message:
          bodyMsg ??
          "Fish Audio API key is invalid or unauthorized. Check FISH_API_KEY in your environment.",
      };
    }

    return {
      code: "UNKNOWN",
      message: bodyMsg ?? error.message ?? "Fish Audio request failed.",
    };
  }

  if (error instanceof Error) {
    if (error.message.includes("FISH_API_KEY")) {
      return { code: "NO_API_KEY", message: error.message };
    }
    if (
      error.message.includes("402") ||
      error.message.toLowerCase().includes("insufficient balance")
    ) {
      return {
        code: "INSUFFICIENT_BALANCE",
        message:
          "Fish Audio credits are exhausted. Add balance at fish.audio, use text interview mode, or continue with browser voice (automatic fallback).",
      };
    }
    return { code: "UNKNOWN", message: error.message };
  }

  return { code: "UNKNOWN", message: "Fish Audio TTS failed." };
}
