export type Domain = "OA" | "NBT" | "NF" | "MD";

export type SkillDef = {
  id: string;
  domain: Domain;
  grade: number;
  title: string;
  summary: string;
  kidTitle: string;
  kidIntro: string;
  prereqIds: string[];
  sortOrder: number;
  /** Asked near the start of a diagnostic for this grade. */
  entry: boolean;
};

export const DOMAIN_LABEL: Record<Domain, string> = {
  OA: "Operations & algebraic thinking",
  NBT: "Number & operations in base ten",
  NF: "Number & operations — fractions",
  MD: "Measurement & data",
};

export const DOMAIN_ORDER: Domain[] = ["OA", "NBT", "NF", "MD"];

export const SKILLS: SkillDef[] = [
  {
    id: "2.OA.B.2",
    domain: "OA",
    grade: 2,
    title: "Add and subtract within 20",
    summary: "Fluently add and subtract within 20 using mental strategies.",
    kidTitle: "Facts within 20",
    kidIntro: "Add or subtract. Both numbers stay inside 20.",
    prereqIds: [],
    sortOrder: 10,
    entry: true,
  },
  {
    id: "2.NBT.A.1",
    domain: "NBT",
    grade: 2,
    title: "Place value to 1,000",
    summary: "Understand that three-digit numbers are hundreds, tens, and ones.",
    kidTitle: "Hundreds, tens, and ones",
    kidIntro: "What is a digit worth in its place?",
    prereqIds: [],
    sortOrder: 20,
    entry: false,
  },
  {
    id: "2.NBT.A.3",
    domain: "NBT",
    grade: 2,
    title: "Read and write numbers to 1,000",
    summary: "Read and write numbers using base-ten numerals and expanded form.",
    kidTitle: "Build the number",
    kidIntro: "Turn hundreds, tens, and ones into a number.",
    prereqIds: ["2.NBT.A.1"],
    sortOrder: 30,
    entry: false,
  },
  {
    id: "2.NBT.B.5",
    domain: "NBT",
    grade: 2,
    title: "Add and subtract within 100",
    summary: "Add and subtract within 100 using place value and regrouping.",
    kidTitle: "Within 100",
    kidIntro: "Add or subtract two-digit numbers.",
    prereqIds: ["2.OA.B.2", "2.NBT.A.1"],
    sortOrder: 40,
    entry: true,
  },
  {
    id: "2.NBT.B.6",
    domain: "NBT",
    grade: 2,
    title: "Add up to four two-digit numbers",
    summary: "Add up to four two-digit numbers using place value strategies.",
    kidTitle: "Add a short list",
    kidIntro: "Add three or four two-digit numbers.",
    prereqIds: ["2.NBT.B.5"],
    sortOrder: 50,
    entry: false,
  },
  {
    id: "2.NBT.B.7",
    domain: "NBT",
    grade: 2,
    title: "Add and subtract within 1,000",
    summary: "Add and subtract within 1,000, regrouping when a column needs it.",
    kidTitle: "Within 1,000",
    kidIntro: "Add or subtract three-digit numbers. Trade when you need to.",
    prereqIds: ["2.NBT.B.5", "2.NBT.A.3"],
    sortOrder: 60,
    entry: false,
  },
  {
    id: "2.MD.C.8",
    domain: "MD",
    grade: 2,
    title: "Money amounts",
    summary: "Solve word problems with dollar bills and coins, using cents or dollars.",
    kidTitle: "Coins and cents",
    kidIntro: "Count the coins to find how many cents.",
    prereqIds: ["2.NBT.B.5"],
    sortOrder: 70,
    entry: false,
  },
  {
    id: "3.OA.A.1",
    domain: "OA",
    grade: 3,
    title: "Meaning of multiplication",
    summary: "Interpret a product as the total in equal groups.",
    kidTitle: "Equal groups",
    kidIntro: "Same number in each group. How many altogether?",
    prereqIds: ["2.OA.B.2"],
    sortOrder: 80,
    entry: false,
  },
  {
    id: "3.OA.C.7",
    domain: "OA",
    grade: 3,
    title: "Multiplication facts",
    summary: "Fluently multiply within 100, starting with 2s, 5s, 10s, then 3s and 4s.",
    kidTitle: "Multiplication facts",
    kidIntro: "A multiplication fact. Take your time.",
    prereqIds: ["3.OA.A.1"],
    sortOrder: 90,
    entry: true,
  },
  {
    id: "3.OA.A.3",
    domain: "OA",
    grade: 3,
    title: "Multiplication word problems",
    summary: "Use multiplication within 100 to solve equal-groups word problems.",
    kidTitle: "Stories about groups",
    kidIntro: "A short story about equal groups.",
    prereqIds: ["3.OA.C.7"],
    sortOrder: 100,
    entry: false,
  },
  {
    id: "3.OA.D.8",
    domain: "OA",
    grade: 3,
    title: "Two-step word problems",
    summary: "Solve two-step problems using the four operations with whole numbers.",
    kidTitle: "Two-step stories",
    kidIntro: "Two things happen. Do both steps.",
    prereqIds: ["3.OA.A.3", "2.NBT.B.5"],
    sortOrder: 110,
    entry: false,
  },
  {
    id: "3.NBT.A.1",
    domain: "NBT",
    grade: 3,
    title: "Round to the nearest 10 or 100",
    summary: "Round whole numbers to the nearest 10 or 100.",
    kidTitle: "Rounding",
    kidIntro: "Which ten or hundred is the number closest to?",
    prereqIds: ["2.NBT.A.3"],
    sortOrder: 120,
    entry: false,
  },
  {
    id: "3.NBT.A.2",
    domain: "NBT",
    grade: 3,
    title: "Fluently add and subtract within 1,000",
    summary: "Add and subtract within 1,000 with a reliable regrouping strategy.",
    kidTitle: "Fluent within 1,000",
    kidIntro: "Add or subtract. Check each column.",
    prereqIds: ["2.NBT.B.7", "3.NBT.A.1"],
    sortOrder: 130,
    entry: true,
  },
  {
    id: "3.NF.A.1",
    domain: "NF",
    grade: 3,
    title: "Fractions as parts of a whole",
    summary: "Understand a unit fraction 1/b and fractions a/b built from it.",
    kidTitle: "Parts of a whole",
    kidIntro: "Equal parts. The bottom counts the parts in the whole.",
    prereqIds: ["2.OA.B.2"],
    sortOrder: 140,
    entry: true,
  },
  {
    id: "3.NF.A.2",
    domain: "NF",
    grade: 3,
    title: "Fractions on a number line",
    summary: "Place simple fractions on a number line from 0 to 1.",
    kidTitle: "Fractions on a line",
    kidIntro: "The line from 0 to 1 is split into equal parts.",
    prereqIds: ["3.NF.A.1"],
    sortOrder: 150,
    entry: false,
  },
  {
    id: "3.NF.A.3",
    domain: "NF",
    grade: 3,
    title: "Simple equivalent fractions",
    summary: "Recognize simple equivalent fractions such as 1/2 = 2/4.",
    kidTitle: "Same amount, different name",
    kidIntro: "Two fractions can name the same amount.",
    prereqIds: ["3.NF.A.1"],
    sortOrder: 160,
    entry: false,
  },
  {
    id: "3.MD.A.1",
    domain: "MD",
    grade: 3,
    title: "Elapsed time in hours",
    summary: "Find elapsed time on whole hours.",
    kidTitle: "How long?",
    kidIntro: "How many hours from the start to the end?",
    prereqIds: ["2.NBT.B.5"],
    sortOrder: 170,
    entry: false,
  },
  {
    id: "4.NBT.A.1",
    domain: "NBT",
    grade: 4,
    title: "Ten times as much",
    summary: "A digit in one place is 10 times what it represents in the place to its right.",
    kidTitle: "Ten times the place",
    kidIntro: "Moving one place to the left makes a digit worth ten times as much.",
    prereqIds: ["2.NBT.A.1", "3.NBT.A.1"],
    sortOrder: 180,
    entry: false,
  },
  {
    id: "4.NBT.B.4",
    domain: "NBT",
    grade: 4,
    title: "Add and subtract multi-digit numbers",
    summary: "Fluently add and subtract multi-digit whole numbers using the standard algorithm.",
    kidTitle: "Bigger numbers",
    kidIntro: "Add or subtract. Line the places up in your mind.",
    prereqIds: ["3.NBT.A.2"],
    sortOrder: 190,
    entry: true,
  },
  {
    id: "4.NF.B.3",
    domain: "NF",
    grade: 4,
    title: "Add fractions with like denominators",
    summary: "Add fractions with the same denominator, including sums that make one whole.",
    kidTitle: "Add fractions",
    kidIntro: "The parts are the same size. Add how many you have.",
    prereqIds: ["3.NF.A.1", "2.OA.B.2"],
    sortOrder: 200,
    entry: true,
  },
];

export type SkillNode = {
  id: string;
  grade: number;
  domain: Domain;
  prereqIds: string[];
  sortOrder: number;
  entry: boolean;
};

export function skillNodes(skills: SkillDef[] = SKILLS): SkillNode[] {
  return skills.map((skill) => ({
    id: skill.id,
    grade: skill.grade,
    domain: skill.domain,
    prereqIds: skill.prereqIds,
    sortOrder: skill.sortOrder,
    entry: skill.entry,
  }));
}

export function skillById(id: string, skills: SkillDef[] = SKILLS): SkillDef | undefined {
  return skills.find((skill) => skill.id === id);
}
