import { problemsForInterest, type InterestId } from "@/lib/lesson-data";
import type { SkillStatus } from "@/lib/demo-data";

export function priceForChildren(children: number, period: "annual" | "quarterly" | "monthly") {
  const rate = { annual: 399, quarterly: 149, monthly: 59 }[period];
  return Math.round(rate * (1 + Math.max(0, children - 1) * 0.7));
}

/** Only consent (once, at sign-up), pause, time slots, and the daily limit gate the child. No parent approval. */
export function childMayStart(consent: boolean, paused: boolean, inSlot: boolean, minutesUsed: number, dailyLimit: number) {
  return consent && !paused && inSlot && minutesUsed < dailyLimit;
}

export function validPin(pin: string) {
  return /^\d{4}$/.test(pin);
}

export const allowedGrades = [2, 3, 4];
export const allowedMinutes = [10, 15, 20];
export const hints = [
  "Compare pieces from two wholes that are the same size.",
  "The bottom number counts equal pieces. More pieces in that same whole means each piece is smaller.",
];

export function nextDiagnosticQuestion(index: number, answer: string) {
  return index === 5 && answer !== "1/4" ? "Which is one half of a whole?" : undefined;
}

export function guidedQuantities(interest: InterestId) {
  const problem = problemsForInterest(interest).guided[0]!;
  return { prompt: problem.prompt, answer: problem.answer };
}

export function lessonSkillStatus(
  checkScore: number | null,
  reviewScore: number | null,
  fallback: SkillStatus = "Needs teaching",
  plainCorrect: number | null = 1,
): SkillStatus {
  if (checkScore === null) return fallback;
  if (checkScore < 4) return "Needs teaching";
  if (reviewScore === 3 && (plainCorrect ?? 0) >= 1) return "Mastered";
  return "Practicing";
}

export function checkNeedsCoaching(checkScore: number) {
  return checkScore < 4;
}

export function toggleInterest(current: InterestId[], interest: InterestId) {
  if (current.includes(interest)) return current.filter((item) => item !== interest);
  if (current.length >= 3) return current;
  return [...current, interest];
}


