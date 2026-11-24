/**
 * One scene timeline for the Teach lesson "Unit fractions: why a bigger bottom number means smaller pieces".
 * Themes change nouns and art only. Beat order, actions, and fallback timing are identical for every theme.
 */
export type TeachTheme = { object: string; objects: string; people: string; piece: string; guide: string; child?: string };
const hi = (t: TeachTheme) => (t.child ? `, ${t.child}` : "");
export const teachThemes: Record<"space" | "soccer", TeachTheme> = {
  space: { object: "energy bar", objects: "energy bars", people: "crew members", piece: "piece", guide: "Nova" },
  soccer: { object: "orange", objects: "oranges", people: "players", piece: "slice", guide: "Pip" },
};
export type Choice = "1/3" | "1/6" | null;

export type Beat = {
  scene: number;
  /** Fallback seconds when speech is unavailable: action (≈1 s) + a readable hold. Speech may stretch a beat, never shorten it below the action. */
  dur: number;
  text: (t: TeachTheme, choice: Choice) => string;
  /** Pause the timeline at the end of this beat until the child taps a choice. */
  waitForChoice?: boolean;
};

export const SCENE_TITLES = [
  "More friends share",
  "Cut in two",
  "Cut in four, then eight",
  "From object to strips",
  "Meet the symbols",
  "Worked example",
  "Predict, then see",
  "Recap",
];

export const ACTION_SECONDS = 1;

export const beats: Beat[] = [
  { scene: 0, dur: 3.5, text: (t) => `Here’s one ${t.object} for the team${hi(t)}.` },
  { scene: 0, dur: 3.2, text: (t) => `Two ${t.people} want to share it.` },
  { scene: 0, dur: 2.6, text: () => "Now four." },
  { scene: 0, dur: 2.6, text: () => "Now eight!" },
  { scene: 0, dur: 5, text: () => "If more friends share, does each one get more or less?" },

  { scene: 1, dur: 3.6, text: (t) => `Let’s cut the ${t.object} into two equal parts.` },
  { scene: 1, dur: 3, text: () => "The two halves slide apart." },
  { scene: 1, dur: 3, text: () => "Here is one of them." },
  { scene: 1, dur: 3.6, text: () => "That’s one of two equal parts." },

  { scene: 2, dur: 3.4, text: (t) => `Let’s put that ${t.piece} on the shelf.` },
  { scene: 2, dur: 3.2, text: (t) => `Now the ${t.object} is whole again.` },
  { scene: 2, dur: 3.2, text: () => "This time, cut it into four equal parts." },
  { scene: 2, dur: 3.4, text: () => "One of the four parts goes to the shelf." },
  { scene: 2, dur: 3.6, text: () => "Whole again. Now cut it into eight equal parts." },
  { scene: 2, dur: 5, text: () => "One of the eight goes to the shelf. Look: each piece is smaller than the last." },

  { scene: 3, dur: 3.4, text: () => "Let’s turn these into fraction strips. Here are halves." },
  { scene: 3, dur: 2.8, text: () => "Here are fourths." },
  { scene: 3, dur: 2.8, text: () => "And eighths." },
  { scene: 3, dur: 4.6, text: () => "All three strips are the same length. One piece in each is shaded." },

  { scene: 4, dur: 5.2, text: () => "One half. The bottom number, two, counts the equal pieces. One, two." },
  { scene: 4, dur: 5.6, text: () => "One fourth. Four equal pieces. One, two, three, four." },
  { scene: 4, dur: 7, text: () => "One eighth. Eight equal pieces. One, two, three, four, five, six, seven, eight." },
  { scene: 4, dur: 4.2, text: () => "The bottom number tells how many equal pieces make the whole." },

  { scene: 5, dur: 3.8, text: () => "Which is bigger, one fourth or one eighth?" },
  { scene: 5, dur: 4, text: () => "Slide the shaded pieces out. Line them up at the same starting edge." },
  { scene: 5, dur: 3.2, text: () => "The one fourth piece is longer." },
  { scene: 5, dur: 4, text: () => "So one fourth is greater than one eighth." },

  { scene: 6, dur: 4, text: (t) => `Your turn${hi(t)}. Which is bigger, one third or one sixth? Tap your guess.`, waitForChoice: true },
  { scene: 6, dur: 4, text: (t) => `Let’s see. Cut one ${t.object} into three equal parts, and another into six.` },
  { scene: 6, dur: 3.6, text: () => "Now line up one piece of each." },
  {
    scene: 6, dur: 5,
    text: (_, c) => c === "1/3" ? "One third is longer. You guessed it! More pieces means each piece is smaller." : "One third is longer, even though six is the bigger number. More pieces means each piece is smaller.",
  },

  { scene: 7, dur: 4.6, text: () => "Remember our shelf? Here are the pieces again, largest to smallest." },
  { scene: 7, dur: 4.4, text: (t) => `More equal pieces means each piece is smaller. You’ve got it${hi(t)}!` },
];

export const sceneBeats = (scene: number) => beats.map((b, i) => ({ b, i })).filter((x) => x.b.scene === scene).map((x) => x.i);
export const beatStart = (i: number) => beats.slice(0, i).reduce((s, b) => s + b.dur, 0);
export const TOTAL_SECONDS = beatStart(beats.length);
export const sceneStart = (scene: number) => beatStart(sceneBeats(scene)[0]!);
export const sceneEnd = (scene: number) => { const ids = sceneBeats(scene); return beatStart(ids.at(-1)! + 1); };

/** Locate the beat for a timeline position (seconds). */
export function beatAt(t: number) {
  let acc = 0;
  for (let i = 0; i < beats.length; i++) {
    const d = beats[i]!.dur;
    if (t < acc + d) return { index: i, local: t - acc };
    acc += d;
  }
  return { index: beats.length - 1, local: beats.at(-1)!.dur };
}

/**
 * Recorded narration slot: map a theme to one audio file per beat (same order as `beats`).
 * When present, the player plays these files instead of the device voice; the animation timing is unchanged.
 */
export const recordedNarration: Partial<Record<"space" | "soccer", string[]>> = {};

/** Exact strip geometry: every whole has the same length, every piece is exactly length / parts. */
export const STRIP = { x: 120, length: 480 } as const;
export function pieceRect(parts: number, index: number) {
  const w = STRIP.length / parts;
  return { x: STRIP.x + index * w, w };
}

export const easeInOut = (p: number) => (p <= 0 ? 0 : p >= 1 ? 1 : p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2);
/** Progress of the beat's single action (0→1 over ACTION_SECONDS, eased). */
export const actionProgress = (local: number) => easeInOut(local / ACTION_SECONDS);


