import { domains, type SkillStatus } from "@/lib/demo-data";
import { lessonSkillStatus } from "@/lib/demo-rules";
import { FULL_LESSON_SKILL, type LessonProgress } from "@/lib/lesson-data";
import { weekDays, type Slots } from "@/lib/schedule";

export type Child = "Leo" | "Sofia";
export type Level = "Catching up" | "On track" | "Ahead";

/** Each domain bar runs from 0 (start of the grade) to 4 (all four grade-level skills mastered). */
export const LEVEL_MAX = 4;
/** Where K-5 Tutor's skill map expects a child to be by mid-November. */
export const EXPECTED_ZONE = { from: 2, to: 3.25 } as const;
export const WEEK_LABELS = ["Oct 12", "Oct 19", "Oct 26", "Nov 2", "Nov 9", "Nov 16"];

export const childGrade: Record<Child, number> = { Leo: 3, Sofia: 2 };

/** Starting-check positions, Oct 12, 2026. */
export const diagnosticLevels: Record<Child, number[]> = {
  Leo: [2.5, 2, 2.5, 0, 2, 1.5],
  Sofia: [2.5, 1.5, 2.5, 1.5, 1.5, 1.75],
};

type Mastery = { skill: string; week: number; date: string; problem: string; answer: string };
/** Skills mastered after the starting check, with one real problem answered correctly. */
export const newMasteries: Record<Child, Mastery[]> = {
  Leo: [
    { skill: "Hundreds, tens, and ones", week: 2, date: "Oct 22", problem: "What is the value of the 6 in 642?", answer: "600" },
    { skill: "Equal parts of a whole", week: 4, date: "Nov 4", problem: "A pizza is cut into 4 equal parts. What fraction is one part?", answer: "1/4" },
    { skill: "Identify quadrilaterals", week: 5, date: "Nov 12", problem: "Which shape is a quadrilateral: triangle, rectangle, circle, or pentagon?", answer: "Rectangle" },
    { skill: "Tell time to five minutes", week: 6, date: "Nov 17", problem: "The short hand is just past 4. The long hand points to 3. What time is it?", answer: "4:15" },
  ],
  Sofia: [
    { skill: "Compare numbers", week: 2, date: "Oct 21", problem: "Which is greater: 418 or 481?", answer: "481" },
    { skill: "Subtract within 100", week: 3, date: "Oct 29", problem: "What is 64 − 28?", answer: "36" },
    { skill: "Measure length", week: 5, date: "Nov 11", problem: "A pencil is 15 cm. A crayon is 9 cm. How much longer is the pencil?", answer: "6 cm" },
  ],
};
const lessonSample = { problem: "Which is larger, 1/4 or 1/8 of the same fuel tank?", answer: "1/4" };

/** Minutes per weekday, Mon Oct 12 → Wed Nov 18 (28 weekdays). Week 3 is the weak week. */
const minutesSeed: Record<Child, number[]> = {
  Leo: [12, 15, 10, 14, 9, 15, 13, 15, 11, 15, 8, 0, 12, 0, 6, 14, 15, 12, 15, 10, 15, 13, 15, 14, 12, 15, 12, 15],
  Sofia: [14, 15, 12, 15, 13, 15, 14, 15, 15, 12, 13, 15, 10, 15, 14, 15, 15, 13, 15, 12, 15, 14, 15, 15, 13, 14, 15, 13],
};

export function skillStatus(child: Child, d: number, s: number, lesson: LessonProgress): SkillStatus {
  const domain = domains[d]!;
  const raw = (domain.states[s] ?? "Not started") as SkillStatus;
  const base: SkillStatus = child === "Sofia" && raw === "Needs teaching" ? "Practicing" : raw;
  if (child === "Leo" && domain.skills[s] === FULL_LESSON_SKILL) return lessonSkillStatus(lesson.checkScore, lesson.reviewScore, base, lesson.checkPlainCorrect ?? 1);
  return base;
}

export function levelFor(position: number): Level {
  if (position < EXPECTED_ZONE.from) return "Catching up";
  if (position > EXPECTED_ZONE.to) return "Ahead";
  return "On track";
}

export function domainPosition(statuses: SkillStatus[]) {
  return statuses.reduce((sum, st) => sum + (st === "Mastered" ? 1 : st === "Practicing" ? 0.5 : 0), 0);
}

export type DomainRow = { name: string; index: number; then: number; now: number; level: Level; thenLevel: Level; statuses: SkillStatus[] };

export function progressFor(child: Child, lesson: LessonProgress) {
  const rows: DomainRow[] = domains.map((domain, d) => {
    const statuses = domain.skills.map((_, s) => skillStatus(child, d, s, lesson));
    const now = domainPosition(statuses);
    const then = diagnosticLevels[child][d]!;
    return { name: domain.name, index: d, then, now, level: levelFor(now), thenLevel: levelFor(then), statuses };
  });
  const sorted = [...rows].sort((a, b) => a.now - EXPECTED_ZONE.from - (b.now - EXPECTED_ZONE.from) || a.index - b.index);
  const masteries = [...newMasteries[child]];
  if (child === "Leo" && lesson.reviewScore === 3 && (lesson.checkScore ?? 0) >= 4 && (lesson.checkPlainCorrect ?? 1) >= 1)
    masteries.push({ skill: FULL_LESSON_SKILL, week: 6, date: (lesson.reviewDate ?? "Nov 22").replace(/, \d{4}$/, ""), ...lessonSample });
  const totalMastered = rows.reduce((n, r) => n + r.statuses.filter((s) => s === "Mastered").length, 0);
  const startMastered = totalMastered - masteries.length;
  const weekly = WEEK_LABELS.map((_, w) => startMastered + masteries.filter((m) => m.week <= w + 1).length);
  return { rows, sorted, masteries, totalMastered, startMastered, weekly };
}

const NAMES: Record<string, string> = {
  "Place value": "place value", "Addition & subtraction": "addition and subtraction", "Multiplication & division": "multiplication",
  Fractions: "fractions", "Measurement & data": "measurement", Geometry: "geometry",
};
export const plainDomain = (name: string) => NAMES[name] ?? name.toLowerCase();
const list = (items: string[]) => items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;

export function summarySentence(child: Child, lesson: LessonProgress, dayOne: boolean) {
  const p = progressFor(child, lesson);
  if (dayOne) {
    const behind = p.rows.filter((r) => r.thenLevel === "Catching up").map((r) => plainDomain(r.name));
    return `${child}’s starting check is done${behind.length ? `: K-5 Tutor will start with ${list(behind)}` : ": on track to start in every area"}.`;
  }
  const behind = p.rows.filter((r) => r.level === "Catching up").map((r) => plainDomain(r.name));
  const n = p.masteries.length;
  return `${child} has mastered ${n} new skill${n === 1 ? "" : "s"} in 6 weeks and ${behind.length ? `is catching up in ${list(behind)}` : "is on track or ahead in every area"}.`;
}

export type CalendarDay = { date: string; dayKey: (typeof weekDays)[number]; minutes: number | null; kind: "done" | "missed" | "off" | "today" | "upcoming" };

/** Six Mon–Sun weeks, Oct 12 – Nov 22, 2026. Demo "today" is Thu Nov 19. */
export function practiceCalendar(child: Child, slots: Slots, minutesToday: number): CalendarDay[] {
  const out: CalendarDay[] = [];
  const start = Date.UTC(2026, 9, 12);
  let weekday = 0;
  for (let i = 0; i < 42; i++) {
    const dt = new Date(start + i * 86400000);
    const dayKey = weekDays[i % 7]!;
    const date = dt.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
    const allowed = slots[dayKey].length > 0;
    let minutes: number | null = null;
    let kind: CalendarDay["kind"];
    if (i < 38) {
      if (i % 7 < 5) { minutes = minutesSeed[child][weekday++] ?? 0; }
      kind = !allowed && !minutes ? "off" : minutes ? "done" : "missed";
    } else if (i === 38) { minutes = minutesToday; kind = allowed ? (minutesToday ? "done" : "today") : "off"; }
    else kind = allowed ? "upcoming" : "off";
    out.push({ date, dayKey, minutes, kind });
  }
  return out;
}

export function calendarStats(days: CalendarDay[]) {
  const thisWeek = days.slice(35);
  const plannedWeek = thisWeek.filter((d) => d.kind !== "off").length;
  const doneWeek = thisWeek.filter((d) => d.kind === "done").length;
  const past = days.filter((d) => d.kind === "done" || d.kind === "missed");
  return { plannedWeek, doneWeek, toCome: thisWeek.filter((d) => d.kind === "upcoming" || d.kind === "today").length, pastPlanned: past.length, pastDone: past.filter((d) => d.kind === "done").length };
}

export type Evidence = { watched: string; practice: string; check: string; review: string };
export function evidenceFor(child: Child, skill: string, status: SkillStatus, lesson: LessonProgress): Evidence {
  if (child === "Leo" && skill === FULL_LESSON_SKILL) return {
    watched: lesson.lessonWatchedAt ?? "Not yet",
    practice: lesson.practiceCorrect === null ? "Not yet" : `${lesson.practiceCorrect} of ${lesson.practiceTotal} right on the first try`,
    check: lesson.checkScore === null ? "Not yet" : `${lesson.checkScore} of 5 · ${lesson.checkDate} · in favorite topics ${lesson.checkScore - (lesson.checkPlainCorrect ?? 0)} of 3 · in plain problems ${lesson.checkPlainCorrect ?? 0} of 2`,
    review: lesson.reviewScore === null ? (lesson.checkScore !== null && lesson.checkScore >= 4 ? "Due 3 days after the Check" : "Not yet") : `${lesson.reviewScore} of 3 in plain or new-world problems · ${lesson.reviewDate}`,
  };
  const m = newMasteries[child].find((x) => x.skill === skill);
  if (m) return { watched: shift(m.date, -6), practice: "4 of 5 right on the first try", check: `5 of 5 · ${shift(m.date, -3)}`, review: `3 of 3 · ${m.date}` };
  if (status === "Mastered") return { watched: "Not needed", practice: "Not needed", check: "Shown in the starting check · Oct 12", review: "3 of 3 · Oct 15" };
  if (status === "Practicing") return { watched: "Nov 10", practice: "3 of 5 right on the first try", check: "4 of 5 · Nov 13", review: "Due soon" };
  if (status === "Needs teaching") return { watched: "Nov 16", practice: "2 of 5 right on the first try", check: "Not yet", review: "Not yet" };
  return { watched: "Not started yet", practice: "Not started yet", check: "Not started yet", review: "Not started yet" };
}
function shift(date: string, days: number) {
  const d = new Date(`${date}, 2026 UTC`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}


