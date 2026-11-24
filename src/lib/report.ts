import { misconceptionLabel } from "@/content/misconceptions";

export type ReportSkillChange = {
  title: string;
  fromP: number;
  toP: number;
  mastered: boolean;
};

export type ReportHardSkill = {
  title: string;
  accuracy: number;
  attempts: number;
  topMisconception: string | null;
};

export type ReportRecommendation = {
  title: string;
  reason: string;
};

export type ReportInput = {
  nickname: string;
  fromLabel: string;
  toLabel: string;
  minutes: number;
  answered: number;
  correct: number;
  improved: ReportSkillChange[];
  hard: ReportHardSkill[];
  recommendations: ReportRecommendation[];
  masteredCount: number;
  inProgressCount: number;
};

export type WeeklyReport = {
  headline: string;
  paragraphs: string[];
  nextSteps: string[];
};

function pct(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return Math.round((part / whole) * 100);
}

export function renderWeeklyReport(input: ReportInput): WeeklyReport {
  const accuracy = pct(input.correct, input.answered);
  const headline =
    input.answered === 0
      ? `${input.nickname} has no practice logged from ${input.fromLabel} to ${input.toLabel}.`
      : `${input.nickname} practiced ${input.minutes} minute${input.minutes === 1 ? "" : "s"} and answered ${input.answered} question${input.answered === 1 ? "" : "s"} with ${accuracy}% correct.`;

  const paragraphs: string[] = [];
  if (input.improved.length === 0) {
    paragraphs.push(
      input.answered === 0
        ? "A short diagnostic is the way to place the first skills."
        : "Mastery did not jump this week. Steady practice on the approved plan is still the next move.",
    );
  } else {
    const names = input.improved.map((skill) => {
      if (skill.mastered) return `${skill.title} (now mastered)`;
      const from = Math.round(skill.fromP * 100);
      const to = Math.round(skill.toP * 100);
      return `${skill.title} (${from}% → ${to}% confidence)`;
    });
    paragraphs.push(`Getting stronger: ${joinList(names)}.`);
  }

  if (input.hard.length > 0) {
    const lines = input.hard.map((skill) => {
      const accuracyLabel = `${pct(skill.accuracy, 1)}% correct on ${skill.attempts} tries`;
      const mixup = misconceptionLabel(skill.topMisconception);
      return mixup
        ? `${skill.title} is still hard (${accuracyLabel}). The usual mix-up: ${mixup.toLowerCase()}.`
        : `${skill.title} is still hard (${accuracyLabel}).`;
    });
    paragraphs.push(...lines);
  }

  paragraphs.push(
    `${input.masteredCount} skill${input.masteredCount === 1 ? "" : "s"} mastered in this map, and ${input.inProgressCount} in progress.`,
  );

  const nextSteps =
    input.recommendations.length > 0
      ? input.recommendations.map((item) => `${item.title}. ${item.reason}`)
      : ["No new skill is waiting. Review mastered skills when they come due."];

  return { headline, paragraphs, nextSteps };
}

function joinList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

export function topMisconception(
  tags: (string | null | undefined)[],
): string | null {
  const counts = new Map<string, number>();
  for (const tag of tags) {
    if (!tag) continue;
    counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  let best: string | null = null;
  let n = 0;
  for (const [tag, count] of counts) {
    if (count > n) {
      best = tag;
      n = count;
    }
  }
  return n >= 1 ? best : null;
}
