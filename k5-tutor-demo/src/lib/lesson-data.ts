/** The three steps a child sees. Review appears later on its own as a warm-up. */
export const lessonSteps = [
  { id: "learn", label: "Learn", detail: "Watch, then try together" },
  { id: "practice", label: "Practice", detail: "Try it yourself" },
  { id: "check", label: "Check", detail: "Five quiet questions" },
] as const;

export type LessonStage = "teach" | "guided" | "practice" | "check" | "review" | "complete";

export function visibleStepIndex(stage: LessonStage) {
  if (stage === "teach" || stage === "guided") return 0;
  if (stage === "practice") return 1;
  if (stage === "check") return 2;
  return 3;
}
export type InterestId =
  | "space"
  | "animals"
  | "dinosaurs"
  | "soccer"
  | "cooking"
  | "music"
  | "building"
  | "ocean"
  | "art"
  | "castles"
  | "cars";

export type AvatarConfig = {
  face: "round" | "oval" | "square";
  skin: "light" | "medium" | "deep";
  hair: "short" | "curly" | "puffs";
  color: "blue" | "coral" | "sunshine" | "leaf";
  accessory: "none" | "glasses" | "headband" | "star";
};

export const defaultLeoAvatar: AvatarConfig = {
  face: "round",
  skin: "medium",
  hair: "curly",
  color: "blue",
  accessory: "star",
};
export const defaultSofiaAvatar: AvatarConfig = {
  face: "oval",
  skin: "light",
  hair: "puffs",
  color: "coral",
  accessory: "headband",
};
/** Eight ready-made avatars a parent can choose for the child with one tap. */
export const avatarPresets: AvatarConfig[] = [
  defaultLeoAvatar,
  defaultSofiaAvatar,
  { face: "square", skin: "deep", hair: "short", color: "sunshine", accessory: "glasses" },
  { face: "round", skin: "light", hair: "short", color: "leaf", accessory: "none" },
  { face: "oval", skin: "deep", hair: "puffs", color: "blue", accessory: "star" },
  { face: "square", skin: "medium", hair: "curly", color: "coral", accessory: "headband" },
  { face: "round", skin: "deep", hair: "curly", color: "leaf", accessory: "glasses" },
  { face: "oval", skin: "light", hair: "short", color: "sunshine", accessory: "star" },
];

export const defaultParentAvatar: AvatarConfig = {
  face: "oval",
  skin: "medium",
  hair: "short",
  color: "leaf",
  accessory: "glasses",
};

const avatarLabels = <T extends string>(values: readonly [T, string][]): { id: T; label: string }[] =>
  values.map(([id, label]) => ({ id, label }));
export const avatarFaceOptions = avatarLabels([
  ["round", "Round"],
  ["oval", "Oval"],
  ["square", "Soft square"],
] as const);
export const avatarSkinOptions = avatarLabels([
  ["light", "Light"],
  ["medium", "Medium"],
  ["deep", "Deep"],
] as const);
export const avatarHairOptions = avatarLabels([
  ["short", "Short sweep"],
  ["curly", "Curly"],
  ["puffs", "Two puffs"],
] as const);
export const avatarColorOptions = avatarLabels([
  ["blue", "Bold blue"],
  ["coral", "Coral"],
  ["sunshine", "Sunshine"],
  ["leaf", "Leaf green"],
] as const);
export const avatarAccessoryOptions = avatarLabels([
  ["none", "None"],
  ["glasses", "Glasses"],
  ["headband", "Headband"],
  ["star", "Star clip"],
] as const);

export const interestOptions: {
  id: InterestId;
  name: string;
  context: string;
  guideName: string;
}[] = [
  { id: "space", name: "Space", context: "Fuel tanks and crew supplies", guideName: "Nova" },
  { id: "animals", name: "Animals", context: "Food shared by animal groups", guideName: "Momo" },
  { id: "dinosaurs", name: "Dinosaurs", context: "Snacks shared by a dinosaur herd", guideName: "Dabble" },
  { id: "soccer", name: "Soccer", context: "Parts of a pitch and match snacks", guideName: "Pip" },
  { id: "cooking", name: "Cooking", context: "Pans and portions in the kitchen", guideName: "Crumb" },
  { id: "music", name: "Music", context: "Supplies shared by a band", guideName: "Tempo" },
  { id: "building", name: "Building and robots", context: "Robot crews and building supplies", guideName: "Bolt" },
  { id: "ocean", name: "Ocean", context: "Food shared by ocean animals", guideName: "Ripple" },
  { id: "art", name: "Art", context: "Paper and supplies shared by artists", guideName: "Doodle" },
  { id: "castles", name: "Castles and fairy tales", context: "Royal feasts and castle shares", guideName: "Turret" },
  { id: "cars", name: "Cars and trains", context: "Travel snacks and pit-crew supplies", guideName: "Whistle" },
];

export type LessonProgress = {
  skill: string;
  day: string;
  stage: LessonStage;
  retaught: boolean;
  interest: InterestId;
  lessonWatchedAt: string | null;
  practiceCorrect: number | null;
  practiceTotal: number;
  checkScore: number | null;
  /** Plain (unthemed) Check items answered correctly, out of 2. */
  checkPlainCorrect: number | null;
  checkDate: string | null;
  reviewScore: number | null;
  checkDay: number | null;
  reviewDate: string | null;
};

export const FULL_LESSON_SKILL = "Compare unit fractions";
export const FULL_LESSON_TITLE = "Unit fractions: why a bigger bottom number means smaller pieces";

export function lessonTitleForSkill(skill: string) {
  if (skill === FULL_LESSON_SKILL) return FULL_LESSON_TITLE;
  const titles: Record<string, string> = {
    "Understand unit fractions": "One equal piece: naming unit fractions",
    "Multiply by 3 and 4": "Equal groups with 3 and 4",
    "Fractions on a number line": "Finding unit fractions on a number line",
  };
  return titles[skill] ?? `${skill}: a guided family lesson`;
}

export function createLesson(skill = FULL_LESSON_SKILL, day = "Tuesday"): LessonProgress {
  return {
    skill,
    day,
    stage: "teach",
    retaught: false,
    interest: "space",
    lessonWatchedAt: null,
    practiceCorrect: null,
    practiceTotal: 3,
    checkScore: null,
    checkDate: null,
    checkPlainCorrect: null,
    reviewScore: null,
    checkDay: null,
    reviewDate: null,
  };
}

export type LessonScene = {
  title: string;
  caption: string;
  narration: string;
};

export function lessonScenesForInterest(interest: InterestId): LessonScene[] {
  const soccer = interest === "soccer";
  const whole = soccer ? "practice pitch" : "fuel tank";
  const unit = soccer ? "section of the pitch" : "fuel section";
  return [
    {
      title: "Meet the same whole",
      caption: `Two ${whole}s. Exactly the same size.`,
      narration: soccer
        ? "Pip has two practice pitches that are exactly the same size. We will compare equal parts of each pitch. The whole stays the same."
        : "Nova has two fuel tanks that are exactly the same size. We will compare equal parts of each tank. The whole stays the same.",
    },
    {
      title: "Make equal pieces",
      caption: "Split one whole into 4 equal pieces. Split the other into 8 equal pieces.",
      narration: `Divide the first ${whole} into four equal parts. Divide the second into eight equal parts. Four and eight are the denominators: they tell how many equal parts make the whole.`,
    },
    {
      title: "Compare one piece",
      caption: "More pieces in the same whole means each piece is smaller.",
      narration: `Look at just one ${unit} from each whole. Eight pieces have to fit into the same space as four pieces, so each eighth must be smaller than each fourth.`,
    },
    {
      title: "Connect pictures to symbols",
      caption: "One of 4 equal pieces is 1/4. One of 8 equal pieces is 1/8.",
      narration:
        "Now connect the picture to the symbols. One fourth has numerator one and denominator four. One eighth has numerator one and denominator eight. Both are unit fractions because the numerator is one.",
    },
    {
      title: "Think it through",
      caption: "The bottom number counts pieces. It does not measure the size of one piece.",
      narration:
        "Here is my think aloud. Eight is a bigger whole number than four, but in these fractions eight means more pieces are squeezed into the same whole. More pieces means smaller pieces. Therefore one fourth is greater than one eighth.",
    },
  ];
}

export type LessonProblem = {
  prompt: string;
  options: string[];
  answer: string;
  explanation: string;
  model?: [number, number];
};

type InterestContext = { item: string; people: string; group: string };
const contexts: Record<InterestId, InterestContext> = {
  space: { item: "crew snack bar", people: "astronauts", group: "crew" },
  animals: { item: "melon", people: "lemurs", group: "troop" },
  dinosaurs: { item: "fruit bar", people: "dinosaurs", group: "herd" },
  soccer: { item: "match orange", people: "players", group: "team" },
  cooking: { item: "pan of cornbread", people: "bakers", group: "baking group" },
  music: { item: "snack bar", people: "musicians", group: "band" },
  building: { item: "energy bar", people: "robots", group: "robot crew" },
  ocean: { item: "seaweed cracker", people: "dolphins", group: "pod" },
  art: { item: "sheet of paper", people: "artists", group: "art group" },
  castles: { item: "royal loaf", people: "knights", group: "castle table" },
  cars: { item: "travel snack", people: "drivers", group: "pit crew" },
};

function sharingPrompt(context: InterestContext, first: number, second: number) {
  return `One ${context.item} is shared equally among ${first} ${context.people}. An identical ${context.item} is shared among ${second}. Which ${context.group} gets the bigger pieces?`;
}
function groupOptions(first: number, second: number) {
  return [`The group of ${first}`, `The group of ${second}`, "They are equal", "Not sure yet"];
}
function smallerGroup(first: number, second: number) {
  return `The group of ${Math.min(first, second)}`;
}

export function problemsForInterest(interest: InterestId) {
  const context = contexts[interest];
  return {
    guided: [
      {
        prompt: sharingPrompt(context, 4, 8),
        options: groupOptions(4, 8),
        answer: smallerGroup(4, 8),
        explanation: `Four ${context.people} share the same amount as eight, so each person in the group of four gets a bigger piece: 1/4 is larger than 1/8.`,
        model: [4, 8] as [number, number],
      },
      {
        prompt: "Two identical wholes are split into 3 and 9 equal pieces. Which unit fraction is larger?",
        options: ["1/3", "1/9", "They are equal", "Not sure yet"],
        answer: "1/3",
        explanation: "Only 3 pieces fit in the first whole, but 9 fit in the same-sized second whole. So one third is larger than one ninth.",
        model: [3, 9] as [number, number],
      },
    ] satisfies LessonProblem[],
    practice: [
      {
        prompt: sharingPrompt(context, 3, 6),
        options: groupOptions(3, 6),
        answer: smallerGroup(3, 6),
        explanation: "Three equal pieces are each larger than six equal pieces from the same whole.",
        model: [3, 6] as [number, number],
      },
      {
        prompt: `A ${context.item} is cut into 5 equal pieces. What fraction is one piece?`,
        options: ["1/5", "1/4", "5/1", "Not sure yet"],
        answer: "1/5",
        explanation: "One piece out of five equal pieces is written 1/5.",
      },
      {
        prompt: `Which is larger: one ${context.item} shared by 2 ${context.people}, or an identical one shared by 5?`,
        options: ["1/2", "1/5", "They are equal", "Not sure yet"],
        answer: "1/2",
        explanation: "Sharing the same whole between fewer people makes each share larger.",
        model: [2, 5] as [number, number],
      },
    ] satisfies LessonProblem[],
    check: [
      {
        prompt: "Which fraction is larger?",
        options: ["1/8", "1/4", "They are equal", "Not sure yet"],
        answer: "1/4",
        explanation: "One of four equal pieces is larger than one of eight pieces from the same whole.",
        model: [4, 8] as [number, number],
      },
      {
        prompt: sharingPrompt(context, 3, 6),
        options: groupOptions(3, 6),
        answer: smallerGroup(3, 6),
        explanation: "The smaller sharing group receives larger pieces from an identical whole.",
      },
      {
        prompt: "In the unit fraction 1/5, what does the denominator 5 tell you?",
        options: ["The whole has 5 equal pieces", "There are 5 wholes", "Each piece is 5 times bigger", "Not sure yet"],
        answer: "The whole has 5 equal pieces",
        explanation: "The denominator counts the equal pieces that make one whole.",
      },
      {
        prompt: "Which unit fraction names the smallest piece of the same whole?",
        options: ["1/2", "1/3", "1/6", "Not sure yet"],
        answer: "1/6",
        explanation: "Six equal pieces are smaller than three or two pieces in the same whole.",
        model: [2, 6] as [number, number],
      },
      {
        prompt: "What happens when the same whole is split into more equal pieces?",
        options: ["Each piece gets smaller", "Each piece gets bigger", "Each piece stays the same", "Not sure yet"],
        answer: "Each piece gets smaller",
        explanation: "The same amount is shared among more pieces, so each piece is smaller.",
      },
    ] satisfies LessonProblem[],
    review: [
      {
        prompt: "Without drawing first: which is larger, 1/3 or 1/5?",
        options: ["1/3", "1/5", "They are equal", "Not sure yet"],
        answer: "1/3",
        explanation: "Three equal pieces are larger than five equal pieces from the same whole.",
        model: [3, 5] as [number, number],
      },
      {
        prompt: sharingPrompt(context, 2, 4),
        options: groupOptions(2, 4),
        answer: smallerGroup(2, 4),
        explanation: "Two people sharing the same whole get larger pieces than four people.",
      },
      {
        prompt: "A whole is split into 7 equal pieces. What unit fraction names one piece?",
        options: ["1/7", "7/1", "1/6", "Not sure yet"],
        answer: "1/7",
        explanation: "One of seven equal pieces is written 1/7.",
      },
    ] satisfies LessonProblem[],
  };
}

export const teachingSources = [
  {
    title: "Pictures + spoken words",
    principle: "Short lessons pair useful pictures with narration, highlight the important part, and let the child control each segment.",
    source: "Richard E. Mayer, Research-Based Principles for Designing Multimedia Instruction",
    url: "https://www.unh.edu/teaching-learning-resource-hub/sites/default/files/media/2023-06/itow-research-based-principles-for-designing-multimedia-instruction-mayer.pdf",
  },
  {
    title: "Model, help, then independence",
    principle: "A worked example and think-aloud come before guided practice with immediate corrective feedback and independent practice.",
    source: "What Works Clearinghouse, Assisting Students Struggling with Mathematics",
    url: "https://ies.ed.gov/ncee/wwc/PracticeGuide/26",
  },
  {
    title: "Concrete → picture → symbols",
    principle: "Children connect objects they can move to picture models and then to abstract math symbols.",
    source: "Institute of Education Sciences, Using Visual Representations",
    url: "https://ies.ed.gov/rel-southeast/2025/01/infographic-26",
  },
  {
    title: "Retrieve and revisit",
    principle: "A short recall check follows practice, then another check after a delay helps children revisit and remember the idea.",
    source: "IES Practice Guide, Organizing Instruction and Study to Improve Student Learning",
    url: "https://ies.ed.gov/ncee/WWC/PracticeGuide/1",
  },
  {
    title: "Interests inside the math",
    principle: "Familiar interests shape the quantities and sharing situations in a problem rather than adding a decorative theme.",
    source: "Walkington & Bernacki, Personalizing Algebra to Students’ Individual Interests (2018)",
    url: "https://doi.org/10.1007/s40593-018-0168-1",
  },
] as const;


