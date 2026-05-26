import { getElevenLabsVoiceId, type VoicePresetId } from "./voices";

const ELEVEN_LABS_BASE_URL = "https://api.elevenlabs.io/v1/text-to-speech";

export type SynthesizeResult = {
  buffer: Buffer;
  mimeType: string;
};

export async function synthesizeSpeech(params: {
  text: string;
  voicePreset: VoicePresetId;
}): Promise<SynthesizeResult> {
  const apiKey = process.env.ELEVEN_LABS_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("ELEVEN_LABS_API_KEY is not configured.");
  }

  const voiceId = getElevenLabsVoiceId(params.voicePreset);
  const endpoint = `${ELEVEN_LABS_BASE_URL}/${voiceId}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: params.text,
      model_id: "eleven_flash_v2_5",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    }),
  });

  if (!response.ok) {
    let errorMessage = `ElevenLabs API error: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData?.detail?.message) {
        errorMessage = errorData.detail.message;
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      }
    } catch {}

    const err = new Error(errorMessage);
    (err as any).code = response.status === 402 ? "INSUFFICIENT_BALANCE" : "API";
    throw err;
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (!buffer.length) {
    throw new Error("ElevenLabs returned empty audio data.");
  }

  return { buffer, mimeType: "audio/mpeg" };
}

export function encodeAudioBase64(buffer: Buffer): string {
  return buffer.toString("base64");
}
