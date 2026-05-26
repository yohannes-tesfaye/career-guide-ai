"use client";

/** Free fallback when Fish Audio is unavailable (e.g. 402 insufficient balance). */
export function speakWithBrowserTTS(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      reject(new Error("Browser speech synthesis is not supported."));
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onend = () => resolve();
    utterance.onerror = () =>
      reject(new Error("Browser voice playback failed."));

    window.speechSynthesis.speak(utterance);
  });
}

export function stopBrowserTTS(): void {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
