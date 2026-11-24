/** Choosing a natural-sounding device voice. Pure helpers so the rules are testable. */
export type VoiceLike = { name: string; lang: string; localService?: boolean; default?: boolean };

const NATURAL = /natural|neural|enhanced|premium|online|wavenet|studio/i;
const WARM = /\b(ava|samantha|aria|jenny|emma|serena|allison|susan|zoe|michelle|libby|sonia|nicky|google us english|google uk english female)\b/i;
const ROBOTIC = /espeak|zarvox|trinoids|albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|good news|hysterical|organ|superstar|whisper|wobble|fred|ralph|junior|kathy|pipe|novelty|compact/i;

export function voiceScore(v: VoiceLike) {
  if (!/^en(-|_|$)/i.test(v.lang) || ROBOTIC.test(v.name)) return -1;
  let s = 0;
  if (NATURAL.test(v.name)) s += 3;
  if (WARM.test(v.name)) s += 2;
  if (/en[-_]us/i.test(v.lang)) s += 0.5;
  return s;
}

/** Only voices scoring at least 2 count as natural enough. Anything less falls back to captions. */
export const MIN_NATURAL_SCORE = 2;
export function naturalVoices<T extends VoiceLike>(voices: T[]) {
  return voices.filter((v) => voiceScore(v) >= MIN_NATURAL_SCORE).sort((a, b) => voiceScore(b) - voiceScore(a) || a.name.localeCompare(b.name));
}
export function pickVoice<T extends VoiceLike>(voices: T[], preferred: string | null): T | null {
  const list = naturalVoices(voices);
  return list.find((v) => v.name === preferred) ?? list[0] ?? null;
}

/** Speak one short sentence at a time, with natural pauses between ideas. */
export function sentences(text: string) {
  return text.match(/[^.!?]+[.!?]+["”’]?|[^.!?]+$/g)?.map((s) => s.trim()).filter(Boolean) ?? [text];
}
export const SPEECH_RATE = 0.9;
export const SPEECH_PITCH = 1.02;
export const SENTENCE_PAUSE_MS = 280;


