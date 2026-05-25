/** Never show raw Google/Prisma errors in the UI */
export function friendlyAiMessage(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);

  if (raw.includes("GEMINI_API_KEY") || raw.includes("not set")) {
    return "Add GEMINI_API_KEY to your .env file.";
  }
  if (raw.includes("429") || raw.includes("quota") || raw.includes("Quota")) {
    return "Gemini quota reached — using built-in templates for now.";
  }
  if (raw.includes("404") || raw.includes("not found") || raw.includes("GoogleGenerativeAI")) {
    return "Gemini is temporarily unavailable — using built-in templates.";
  }
  if (raw.includes("Unknown argument") || raw.includes("Prisma")) {
    return "Could not save to database. Please try again.";
  }

  return "AI is temporarily unavailable — using built-in templates.";
}

export function shouldShowToastNote(message: string | null): boolean {
  if (!message) return false;
  return !message.includes("GoogleGenerativeAI") && !message.includes("generativelanguage");
}
