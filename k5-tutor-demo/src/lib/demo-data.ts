export type SkillStatus = "Mastered" | "Practicing" | "Needs teaching" | "Not started";
export const domains = [
  {
    name: "Place value",
    skills: [
      "Read three-digit numbers",
      "Hundreds, tens, and ones",
      "Compare numbers",
      "Round to the nearest ten",
    ],
    states: ["Mastered", "Mastered", "Mastered", "Practicing"],
  },
  {
    name: "Addition & subtraction",
    skills: [
      "Add within 100",
      "Subtract within 100",
      "Regroup with addition",
      "Solve two-step problems",
    ],
    states: ["Mastered", "Mastered", "Practicing", "Not started"],
  },
  {
    name: "Multiplication & division",
    skills: [
      "Equal groups",
      "Multiply by 2, 5, and 10",
      "Multiply by 3 and 4",
      "Division as sharing",
    ],
    states: ["Mastered", "Mastered", "Practicing", "Practicing"],
  },
  {
    name: "Fractions",
    skills: [
      "Equal parts of a whole",
      "Understand unit fractions",
      "Compare unit fractions",
      "Fractions on a number line",
    ],
    states: ["Mastered", "Practicing", "Needs teaching", "Not started"],
  },
  {
    name: "Measurement & data",
    skills: [
      "Measure length",
      "Tell time to five minutes",
      "Read picture graphs",
      "Find perimeter",
    ],
    states: ["Mastered", "Mastered", "Practicing", "Not started"],
  },
  {
    name: "Geometry",
    skills: [
      "Name two-dimensional shapes",
      "Identify quadrilaterals",
      "Partition shapes",
      "Find area with unit squares",
    ],
    states: ["Mastered", "Mastered", "Not started", "Not started"],
  },
];
export const questions = [
  {
    prompt: "What is the value of the 4 in 347?",
    options: ["4", "40", "400", "7"],
    answer: "40",
    domain: "Place value",
  },
  {
    prompt: "What is 36 + 27?",
    options: ["53", "63", "73", "62"],
    answer: "63",
    domain: "Addition",
  },
  {
    prompt: "What is 82 − 35?",
    options: ["47", "57", "53", "37"],
    answer: "47",
    domain: "Subtraction",
  },
  {
    prompt: "There are 4 groups of 3 apples. How many apples?",
    options: ["7", "10", "12", "14"],
    answer: "12",
    domain: "Multiplication",
  },
  {
    prompt: "Share 20 blocks equally between 5 people. How many each?",
    options: ["3", "4", "5", "6"],
    answer: "4",
    domain: "Division",
  },
  {
    prompt: "Which fraction is larger?",
    options: ["1/8", "1/4", "They are equal", "Not sure yet"],
    answer: "1/4",
    domain: "Fractions",
  },
  {
    prompt: "Which fraction is one half of a whole?",
    options: ["1/2", "1/3", "1/4", "1/8"],
    answer: "1/2",
    domain: "Fractions",
  },
  {
    prompt: "How many centimeters are in one meter?",
    options: ["10", "60", "100", "1,000"],
    answer: "100",
    domain: "Measurement",
  },
  {
    prompt: "A square has sides of 3 cm. What is its perimeter?",
    options: ["6 cm", "9 cm", "12 cm", "15 cm"],
    answer: "12 cm",
    domain: "Geometry",
  },
  {
    prompt: "Which number is closest to 70?",
    options: ["61", "68", "79", "85"],
    answer: "68",
    domain: "Place value",
  },
];
export const practiceQuestions = [
  questions[5],
  {
    prompt: "Which unit fraction has the smaller pieces?",
    options: ["1/3", "1/6", "They are equal", "Not sure yet"],
    answer: "1/6",
    domain: "Fractions",
  },
  {
    prompt: "Which fraction is larger?",
    options: ["1/2", "1/5", "They are equal", "Not sure yet"],
    answer: "1/2",
    domain: "Fractions",
  },
  questions[3],
  questions[4],
];
export const history = [
  { date: "Nov 2", minutes: 12, accuracy: 60 },
  { date: "Nov 3", minutes: 15, accuracy: 65 },
  { date: "Nov 4", minutes: 10, accuracy: 70 },
  { date: "Nov 6", minutes: 18, accuracy: 70 },
  { date: "Nov 9", minutes: 15, accuracy: 72 },
  { date: "Nov 10", minutes: 12, accuracy: 75 },
  { date: "Nov 11", minutes: 20, accuracy: 78 },
  { date: "Nov 12", minutes: 15, accuracy: 80 },
  { date: "Nov 13", minutes: 10, accuracy: 82 },
  { date: "Nov 16", minutes: 15, accuracy: 80 },
  { date: "Nov 17", minutes: 12, accuracy: 85 },
  { date: "Nov 18", minutes: 18, accuracy: 88 },
  { date: "Nov 19", minutes: 14, accuracy: 90 },
];
export type CoachingCard = {
  id: string;
  title: string;
  date: string;
  status: "New" | "Taught" | "Snoozed";
  skill: string;
};
export type PlanDay = { day: string; skill: string; minutes: number };
export const initialCards: CoachingCard[] = [
  {
    id: "fractions",
    title: "Leo thinks a bigger denominator means a bigger fraction",
    date: "Today",
    status: "New",
    skill: "Compare unit fractions",
  },
  {
    id: "groups",
    title: "Make multiplication visible with equal groups",
    date: "Nov 12",
    status: "Taught",
    skill: "Equal groups",
  },
  {
    id: "regroup",
    title: "Trade ten ones for one ten",
    date: "Nov 5",
    status: "Taught",
    skill: "Regroup with addition",
  },
];
export const initialPlan: PlanDay[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(
  (day, i) => ({
    day,
    skill:
      [
        "Understand unit fractions",
        "Compare unit fractions",
        "Multiply by 3 and 4",
        "Compare unit fractions",
        "Fractions on a number line",
      ][i] ?? "Compare unit fractions",
    minutes: 10,
  }),
);


