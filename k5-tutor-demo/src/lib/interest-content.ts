/**
 * Interest profile and the content model that maps world + sub-interest + framing onto ONE skill.
 * Every themed item is generated from a math skeleton shared with its plain twin, so numbers,
 * options and answers are identical across profiles. Only nouns and the wrapper sentence change.
 */
import type { InterestId, LessonProblem } from "@/lib/lesson-data";

export type FramingPair = { id: string; question: string; a: { id: string; label: string; plain: string }; b: { id: string; label: string; plain: string } };
export const framingPairs: FramingPair[] = [
  { id: "wrap", question: "Story mission or quick challenge?", a: { id: "mission", label: "Story mission", plain: "likes lessons told as a story mission" }, b: { id: "challenge", label: "Quick challenge", plain: "likes lessons framed as a quick challenge" } },
  { id: "goal", question: "Build something or explore somewhere?", a: { id: "build", label: "Build something", plain: "likes building goals" }, b: { id: "explore", label: "Explore somewhere", plain: "likes exploring goals" } },
  { id: "who", question: "Solo hero or team?", a: { id: "solo", label: "Solo hero", plain: "likes being the hero of the story" }, b: { id: "team", label: "Team", plain: "likes working as part of a team" } },
  { id: "pace", question: "Calm or fast?", a: { id: "calm", label: "Calm", plain: "likes a calm story mood" }, b: { id: "fast", label: "Fast", plain: "likes an exciting story mood" } },
  { id: "tone", question: "Funny or serious?", a: { id: "funny", label: "Funny", plain: "likes a guide who jokes a little" }, b: { id: "serious", label: "Serious", plain: "likes a guide who keeps it simple" } },
  { id: "time", question: "Day or night?", a: { id: "day", label: "Day", plain: "likes daytime scenes" }, b: { id: "night", label: "Night", plain: "likes night-time scenes" } },
];

export type SubInterest = { id: string; label: string };
export const worldSubs: Record<InterestId, SubInterest[]> = {
  space: [{ id: "rockets", label: "Rockets" }, { id: "planets", label: "Planets" }, { id: "astronauts", label: "Astronauts" }, { id: "stations", label: "Space stations" }],
  soccer: [{ id: "goalkeeping", label: "Goalkeeping" }, { id: "tournaments", label: "Tournaments" }, { id: "kits", label: "Team kits" }, { id: "scoring", label: "Scoring goals" }],
  animals: [{ id: "pets", label: "Pets" }, { id: "jungle", label: "Jungle animals" }, { id: "farm", label: "Farm animals" }],
  dinosaurs: [{ id: "giants", label: "Giant dinosaurs" }, { id: "fossils", label: "Fossils" }, { id: "flyers", label: "Flying reptiles" }],
  cooking: [{ id: "baking", label: "Baking" }, { id: "pizza", label: "Pizza" }, { id: "smoothies", label: "Smoothies" }],
  music: [{ id: "drums", label: "Drums" }, { id: "singing", label: "Singing" }, { id: "bands", label: "Bands" }],
  building: [{ id: "robots", label: "Robots" }, { id: "bridges", label: "Bridges" }, { id: "machines", label: "Machines" }],
  ocean: [{ id: "reefs", label: "Coral reefs" }, { id: "whales", label: "Whales" }, { id: "submarines", label: "Submarines" }],
  art: [{ id: "painting", label: "Painting" }, { id: "clay", label: "Clay" }, { id: "comics", label: "Drawing comics" }],
  castles: [{ id: "dragons", label: "Dragons" }, { id: "knights", label: "Knights" }, { id: "towers", label: "Towers" }],
  cars: [{ id: "trains", label: "Trains" }, { id: "racing", label: "Racing" }, { id: "trucks", label: "Big trucks" }],
};
/** Worlds with full lesson content in this prototype. Other worlds show "More worlds coming soon". */
export const WORKING_WORLDS = ["space", "soccer"] as const;
export type WorkingWorld = (typeof WORKING_WORLDS)[number];
export const isWorking = (w: InterestId): w is WorkingWorld => (WORKING_WORLDS as readonly string[]).includes(w);
/** Sub-interests with themed content (three per working world). */
export const WORKING_SUBS: Record<WorkingWorld, string[]> = { space: ["rockets", "planets", "astronauts"], soccer: ["goalkeeping", "tournaments", "kits"] };

export const guideNameChoices: Partial<Record<InterestId, string[]>> = {
  space: ["Nova", "Orbit", "Comet", "Luna"],
  soccer: ["Pip", "Dash", "Kicker", "Goalie"],
};

export type InterestProfile = {
  worlds: InterestId[];
  favorite: InterestId | null;
  subs: Partial<Record<InterestId, string[]>>;
  framing: Record<string, string>;
  guideName: string | null;
  /** Learned from behavior: which worlds the child picks when offered, and lessons replayed. */
  behavior: { picks: Partial<Record<InterestId, number>>; replays: Partial<Record<InterestId, number>>; finishedSessions: Partial<Record<InterestId, number>> };
  /** Demo day the profile was made, and the last day a quick question was asked (max one per session). */
  createdDay: number;
  lastAskedDay: number | null;
};

export const emptyProfile = (): InterestProfile => ({ worlds: [], favorite: null, subs: {}, framing: {}, guideName: null, behavior: { picks: {}, replays: {}, finishedSessions: {} }, createdDay: 0, lastAskedDay: null });

/** Seed A: Leo. Soccer favorite (goalkeeping, tournaments) plus Space (rockets). */
export const profileA = (): InterestProfile => ({
  worlds: ["soccer", "space"], favorite: "soccer", subs: { soccer: ["goalkeeping", "tournaments"], space: ["rockets"] },
  framing: { wrap: "mission", goal: "build", who: "team", pace: "calm", tone: "funny", time: "day" }, guideName: "Pip",
  behavior: { picks: { soccer: 5, space: 2 }, replays: { soccer: 1 }, finishedSessions: { soccer: 6, space: 3 } }, createdDay: -38, lastAskedDay: null,
});
/** Seed B for the demo swap: Space favorite (astronauts), quick challenges. */
export const profileB = (): InterestProfile => ({
  worlds: ["space"], favorite: "space", subs: { space: ["astronauts"] },
  framing: { wrap: "challenge", goal: "explore", who: "solo", pace: "fast", tone: "serious", time: "night" }, guideName: "Orbit",
  behavior: { picks: { space: 4 }, replays: {}, finishedSessions: { space: 5 } }, createdDay: -38, lastAskedDay: null,
});

/** Nouns for each context. Kept short so a themed item reads no harder than its plain twin. */
type Ctx = { id: string; world: InterestId | "plain"; whole: string; sharers: string; label: string };
export const contexts: Record<string, Ctx> = {
  rockets: { id: "rockets", world: "space", whole: "fuel tank", sharers: "rocket engines", label: "Rockets" },
  planets: { id: "planets", world: "space", whole: "planet map", sharers: "explorers", label: "Planets" },
  astronauts: { id: "astronauts", world: "space", whole: "crew snack bar", sharers: "astronauts", label: "Astronauts" },
  goalkeeping: { id: "goalkeeping", world: "soccer", whole: "save drill", sharers: "goalkeepers", label: "Goalkeeping" },
  tournaments: { id: "tournaments", world: "soccer", whole: "tournament day", sharers: "teams", label: "Tournaments" },
  kits: { id: "kits", world: "soccer", whole: "roll of kit fabric", sharers: "players", label: "Team kits" },
  plain: { id: "plain", world: "plain", whole: "paper strip", sharers: "children", label: "Plain problem" },
};

/** The working contexts a profile uses, rotating across worlds so one theme does not wear out. */
export function profileContexts(p: InterestProfile): Ctx[] {
  const order = [p.favorite, ...p.worlds.filter((w) => w !== p.favorite)].filter((w): w is InterestId => !!w && isWorking(w));
  const perWorld = order.map((w) => {
    const chosen = (p.subs[w] ?? []).filter((s) => WORKING_SUBS[w as WorkingWorld].includes(s));
    return (chosen.length ? chosen : [WORKING_SUBS[w as WorkingWorld][0]!]).map((s) => contexts[s]!);
  });
  const out: Ctx[] = [];
  for (let i = 0; out.length < 6 && perWorld.some((l) => l[i]); i++) perWorld.forEach((l) => { if (l[i]) out.push(l[i]!); });
  return out.length ? out : [contexts["plain"]!];
}
/** A working world the child did NOT choose, for the transfer Review. */
export function unchosenContext(p: InterestProfile): Ctx {
  const other = WORKING_WORLDS.find((w) => !p.worlds.includes(w));
  return other ? contexts[WORKING_SUBS[other][2]!]! : contexts["plain"]!;
}

// ---- Math skeletons: identical numbers, options and answers in every context ----
const share = (c: Ctx, a: number, b: number): LessonProblem => ({
  prompt: `One ${c.whole} is shared equally by ${a} ${c.sharers}. An identical one is shared by ${b}. Which group gets bigger parts?`,
  options: [`The group of ${a}`, `The group of ${b}`, "They are equal", "Not sure yet"],
  answer: `The group of ${Math.min(a, b)}`,
  explanation: `The same whole shared by fewer ${c.sharers} gives each one a bigger part: 1/${Math.min(a, b)} is larger than 1/${Math.max(a, b)}.`,
  model: [a, b],
});
const compare = (c: Ctx, a: number, b: number): LessonProblem => ({
  prompt: `Which is larger: 1/${a} or 1/${b} of the same ${c.whole}?`,
  options: [`1/${b}`, `1/${a}`, "They are equal", "Not sure yet"],
  answer: `1/${Math.min(a, b)}`,
  explanation: `${Math.min(a, b)} equal parts are bigger than ${Math.max(a, b)} equal parts of the same whole.`,
  model: [a, b],
});
const onePart = (c: Ctx, n: number): LessonProblem => ({
  prompt: `A ${c.whole} is cut into ${n} equal parts. What fraction is one part?`,
  options: [`1/${n}`, `${n}/1`, `1/${n - 1}`, "Not sure yet"],
  answer: `1/${n}`,
  explanation: `One of ${n} equal parts is written 1/${n}.`,
});
const smallest = (c: Ctx): LessonProblem => ({
  prompt: `Which part of the same ${c.whole} is smallest?`,
  options: ["1/2", "1/3", "1/6", "Not sure yet"],
  answer: "1/6",
  explanation: "Six equal parts are smaller than three or two parts of the same whole.",
  model: [2, 6],
});
const denominator = (c: Ctx): LessonProblem => ({
  prompt: `A ${c.whole} shows 1/5. What does the 5 tell you?`,
  options: ["The whole has 5 equal parts", "There are 5 wholes", "Each part is 5 times bigger", "Not sure yet"],
  answer: "The whole has 5 equal parts",
  explanation: "The denominator counts the equal parts that make one whole.",
});
const morePieces = (c: Ctx): LessonProblem => ({
  prompt: `What happens when the same ${c.whole} is cut into more equal parts?`,
  options: ["Each part gets smaller", "Each part gets bigger", "Each part stays the same", "Not sure yet"],
  answer: "Each part gets smaller",
  explanation: "The same amount split into more parts makes each part smaller.",
});

export type AssessedItem = LessonProblem & { context: "themed" | "plain" | "new-world"; contextLabel: string };
const tag = (p: LessonProblem, c: Ctx, kind?: AssessedItem["context"]): AssessedItem => ({ ...p, context: kind ?? (c.world === "plain" ? "plain" : "themed"), contextLabel: c.label });

/** The full unit-fraction lesson content for one profile. */
export function lessonContent(p: InterestProfile) {
  const ctx = profileContexts(p);
  const at = (i: number) => ctx[i % ctx.length]!;
  const plain = contexts["plain"]!;
  const fresh = unchosenContext(p);
  return {
    guided: [share(at(0), 4, 8), compare(at(1), 3, 9)].map((x, i) => tag(x, at(i))),
    practice: [share(at(0), 3, 6), onePart(at(1), 5), compare(at(2), 2, 5)].map((x, i) => tag(x, at(i))),
    /** Five Check items: three in the child's worlds, two plain. */
    check: [tag(compare(at(0), 4, 8), at(0)), tag(share(at(1), 3, 6), at(1)), tag(denominator(plain), plain), tag(smallest(at(2)), at(2)), tag(morePieces(plain), plain)],
    /** Review days later: plain, or a world the child did not choose. Passing it proves transfer. */
    review: [tag(compare(plain, 3, 5), plain), tag(share(fresh, 2, 4), fresh, fresh.world === "plain" ? "plain" : "new-world"), tag(onePart(plain, 7), plain)],
  };
}

/** Plain-context twin of any lesson: the reference the themed versions must match. */
export const plainContent = () => lessonContent({ ...emptyProfile(), worlds: [], favorite: null });

/** Lesson wrapper sentence from the "this or that" answers. Framing never changes the math. */
export function lessonWrapper(p: InterestProfile, child: string) {
  const c = profileContexts(p)[0]!;
  const guide = p.guideName ?? "Your guide";
  const team = p.framing["who"] === "solo" ? `${child}, you're the hero` : `${child}, the team needs you`;
  if (p.framing["wrap"] === "challenge") return `${guide}'s quick challenge: can you share the ${c.whole} fairly?`;
  return `${guide}'s mission: ${team}. Today we share the ${c.whole} fairly.`;
}

/** A short running story for the week in the favorite world. Each lesson moves it forward one part. */
export const weeklyStories: Record<WorkingWorld, { title: string; parts: string[] }> = {
  soccer: { title: "The Valley Cup", parts: ["The team packs for the Valley Cup.", "Training day: the keepers share the drills.", "Match day one: oranges at half-time.", "The semi-final under the lights.", "Final whistle and a team photo."] },
  space: { title: "Voyage to the Ringed Moon", parts: ["The crew loads the rocket.", "Launch day: share the fuel fairly.", "A stop at the space station.", "Mapping the ringed moon.", "Home again with moon-rock samples."] },
};

export function storyFor(p: InterestProfile, lessonsDoneThisWeek: number) {
  const fav = p.favorite && isWorking(p.favorite) ? p.favorite : p.worlds.find(isWorking);
  if (!fav) return null;
  const s = weeklyStories[fav];
  const part = Math.min(s.parts.length - 1, lessonsDoneThisWeek);
  return { world: fav, title: s.title, part: part + 1, of: s.parts.length, text: s.parts[part]! };
}

/** Teach-lesson nouns from the favorite world's first chosen sub-interest. Art and timing stay the same. */
export function teachWordsFor(p: InterestProfile) {
  const c = profileContexts(p)[0]!;
  const map: Record<string, { object: string; people: string }> = {
    rockets: { object: "fuel cell", people: "rocket engines" },
    planets: { object: "energy bar", people: "explorers" },
    astronauts: { object: "energy bar", people: "crew members" },
    goalkeeping: { object: "orange", people: "goalkeepers" },
    tournaments: { object: "orange", people: "teams" },
    kits: { object: "orange", people: "players" },
  };
  return map[c.id] ?? null;
}

/** The world the lesson animation uses: favorite if it has content, else another chosen working world. */
export function lessonWorld(p: InterestProfile): WorkingWorld | null {
  if (p.favorite && isWorking(p.favorite)) return p.favorite;
  return (p.worlds.find(isWorking) as WorkingWorld | undefined) ?? null;
}

/** Plain-words summary of a profile for the parent. */
export function profileSummary(p: InterestProfile, names: Record<string, string>) {
  return {
    worlds: p.worlds.map((w) => names[w] ?? w),
    favorite: p.favorite ? names[p.favorite] ?? p.favorite : null,
    subs: p.worlds.map((w) => ({ world: names[w] ?? w, items: (p.subs[w] ?? []).map((s) => worldSubs[w].find((x) => x.id === s)?.label ?? s) })),
    framing: framingPairs.filter((f) => p.framing[f.id]).map((f) => (p.framing[f.id] === f.a.id ? f.a.plain : f.b.plain)),
  };
}

/** One small Home insight when the behavior data supports it. */
export function homeInsight(p: InterestProfile, child: string, names: Record<string, string>) {
  const entries = Object.entries(p.behavior.finishedSessions).filter(([, n]) => (n ?? 0) > 0) as [InterestId, number][];
  if (entries.length < 2) return null;
  entries.sort((a, b) => b[1] - a[1]);
  if (entries[0]![1] < entries[1]![1] + 2) return null;
  return `${child} finishes more sessions in ${names[entries[0]![0]]} week.`;
}

/** Mastery: 4 of 5 on the Check, at least one plain Check item correct, and a passed Review. */
export function masteryFromResults(checkScore: number | null, plainCorrect: number | null, reviewScore: number | null) {
  if (checkScore === null) return null;
  if (checkScore < 4) return "Needs teaching" as const;
  if (reviewScore === 3 && (plainCorrect ?? 0) >= 1) return "Mastered" as const;
  return "Practicing" as const;
}


