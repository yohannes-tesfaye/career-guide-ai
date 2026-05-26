export const CAREER_VOICES = {
  female: {
    talia: "OZ0L6eISlOejga3XjDFt",
    elara: "WQP7cQUF5aAS6Axh5yaa",
    alicia: "BFd5oBc2DDna33pSi4Gf"
  },
  male: {
    caleb: "AaOhDHYJ1XLZk74lXhdE",
    baxter: "jSuBIjxMKhqIfb0wCK1F"
  }
} as const;

export const VOICE_PRESETS = [
  {
    id: "talia",
    name: "Talia (Female)",
    description: "Professional and articulate technical recruiter voice",
    style: "Professional Recruiter",
  },
  {
    id: "elara",
    name: "Elara (Female)",
    description: "Expressive and friendly engineering manager voice",
    style: "Friendly Manager",
  },
  {
    id: "alicia",
    name: "Alicia (Female)",
    description: "Creative and collaborative UX lead voice",
    style: "Collaborative UX Lead",
  },
  {
    id: "caleb",
    name: "Caleb (Male)",
    description: "Calm, analytical senior technical lead voice",
    style: "Technical Architect",
  },
  {
    id: "baxter",
    name: "Baxter (Male)",
    description: "Direct, energetic startup CTO/DevOps lead voice",
    style: "Direct CTO",
  },
] as const;

export type VoicePresetId = typeof VOICE_PRESETS[number]["id"];

export function getElevenLabsVoiceId(presetId: VoicePresetId): string {
  if (presetId === "talia") return CAREER_VOICES.female.talia;
  if (presetId === "elara") return CAREER_VOICES.female.elara;
  if (presetId === "alicia") return CAREER_VOICES.female.alicia;
  if (presetId === "caleb") return CAREER_VOICES.male.caleb;
  if (presetId === "baxter") return CAREER_VOICES.male.baxter;
  return CAREER_VOICES.female.talia;
}
