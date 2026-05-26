"use client";

export async function playBase64Audio(
  base64Audio: string,
  mimeType: string
): Promise<{ audio: HTMLAudioElement; revoke: () => void }> {
  const binaryString = window.atob(base64Audio);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const audioBlob = new Blob([bytes], { type: mimeType });
  const audioUrl = URL.createObjectURL(audioBlob);

  const audio = new Audio(audioUrl);
  await audio.play();

  return {
    audio,
    revoke: () => URL.revokeObjectURL(audioUrl),
  };
}
