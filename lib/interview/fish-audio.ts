import { FishAudioClient } from "fish-audio";
import { parseFishAudioError } from "./fish-audio-errors";
import { getVoiceReferenceId } from "./voice-presets";
import type { VoicePresetId } from "./types";

export { parseFishAudioError };
export type { FishAudioErrorCode } from "./fish-audio-errors";

const MP3_MIME = "audio/mpeg";

function getClient(): FishAudioClient {
  const apiKey = process.env.FISH_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("FISH_API_KEY is not configured.");
  }
  return new FishAudioClient({ apiKey });
}

export type SynthesizeResult = {
  buffer: Buffer;
  mimeType: string;
};

export async function synthesizeSpeech(params: {
  text: string;
  voicePreset: VoicePresetId;
}): Promise<SynthesizeResult> {
  const referenceId = getVoiceReferenceId(params.voicePreset);

  const client = getClient();
  let response: ReadableStream<Uint8Array>;
  try {
    response = await client.textToSpeech.convert({
      text: params.text,
      reference_id: referenceId,
      format: "mp3",
      latency: "balanced",
      normalize: true,
      prosody: { speed: 1, volume: 0 },
    });
  } catch (e) {
    const parsed = parseFishAudioError(e);
    const err = new Error(parsed.message);
    (err as Error & { code: string }).code = parsed.code;
    throw err;
  }

  const buffer = await streamToBuffer(response);

  if (!buffer.length) {
    throw new Error("Fish Audio returned empty audio data.");
  }

  return { buffer, mimeType: MP3_MIME };
}

export function encodeAudioBase64(buffer: Buffer): string {
  return buffer.toString("base64");
}

async function streamToBuffer(
  stream: ReadableStream<Uint8Array>
): Promise<Buffer> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      total += value.length;
    }
  }
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  return Buffer.from(merged);
}
