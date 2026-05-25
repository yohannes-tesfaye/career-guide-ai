import type { VoicePresetId } from "./types";

export type VoicePresetOption = {
  id: VoicePresetId;
  name: string;
  description: string;
  style: string;
};

export const VOICE_PRESETS: VoicePresetOption[] = [
  {
    id: "alex",
    name: "Alex - The Technical Bar Raiser",
    description: "Professional, calm, articulate narrator style",
    style: "Narrator",
  },
  {
    id: "sophia",
    name: "Sophia - The Friendly Lead Engineer",
    description: "Expressive, lively, charismatic style",
    style: "Character",
  },
  {
    id: "marcus",
    name: "Marcus - The Fast-Paced Startup CTO",
    description: "Direct, energetic, technical delivery",
    style: "Technical",
  },
];

/** Free-tier Fish Audio model IDs (https://fish.audio/m/<id>) */
export const DEFAULT_VOICE_REFERENCE_IDS: Record<VoicePresetId, string> = {
  alex: "802e3bc2b27e49c2995d23ef70e6ac89",
  sophia: "e47e71f6cd184508b719c3f63b9636d1",
  marcus: "7c3bc847a8c847a9a99154f8e1b0ec5c",
};

const ENV_KEYS: Record<VoicePresetId, string> = {
  alex: "FISH_VOICE_ALEX",
  sophia: "FISH_VOICE_SOPHIA",
  marcus: "FISH_VOICE_MARCUS",
};

/** Resolves Fish Audio reference_id: env override, then built-in free-tier defaults. */
export function getVoiceReferenceId(preset: VoicePresetId): string {
  const key = ENV_KEYS[preset];
  const fromEnv = process.env[key]?.trim();
  return fromEnv || DEFAULT_VOICE_REFERENCE_IDS[preset];
}

export function getVoicePresetById(id: VoicePresetId): VoicePresetOption {
  const preset = VOICE_PRESETS.find((p) => p.id === id);
  if (!preset) throw new Error(`Unknown voice preset: ${id}`);
  return preset;
}
