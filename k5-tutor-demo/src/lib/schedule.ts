import { FULL_LESSON_SKILL } from "@/lib/lesson-data";

export const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export const weekDayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
export type DayKey = (typeof weekDays)[number];

export const timeWindows = [
  { id: "morning", label: "Morning", start: 9, end: 12 },
  { id: "afternoon", label: "Afternoon", start: 12, end: 17 },
  { id: "evening", label: "Evening", start: 17, end: 20 },
] as const;
export type WindowId = (typeof timeWindows)[number]["id"];
export type Slots = Record<DayKey, WindowId[]>;

export const dailyMinuteOptions = [10, 15, 20] as const;
export type DailyMinutes = (typeof dailyMinuteOptions)[number];

export type ScheduleSettings = { minutes: DailyMinutes; slots: Slots };

/** Defaults: 15 minutes, weekdays, 9:00 to 17:00. */
export function defaultSchedule(): ScheduleSettings {
  const weekday: WindowId[] = ["morning", "afternoon"];
  return {
    minutes: 15,
    slots: { Mon: [...weekday], Tue: [...weekday], Wed: [...weekday], Thu: [...weekday], Fri: [...weekday], Sat: [], Sun: [] },
  };
}

export function toggleSlot(slots: Slots, day: DayKey, window: WindowId): Slots {
  const current = slots[day];
  const next = current.includes(window) ? current.filter((w) => w !== window) : [...current, window];
  return { ...slots, [day]: timeWindows.map((w) => w.id).filter((id) => next.includes(id)) };
}

export function isOpen(slots: Slots, dayIndex: number, hour: number) {
  const day = weekDays[dayIndex % 7]!;
  return timeWindows.some((w) => slots[day].includes(w.id) && hour >= w.start && hour < w.end);
}

export function formatHour(hour: number) {
  const h = hour > 12 ? hour - 12 : hour;
  return `${h}:00`;
}

/** Friendly label for the next time the child may start, e.g. "4:00" or "Monday at 9:00". */
export function nextOpening(slots: Slots, dayIndex: number, hour: number): { label: string; daysAhead: number; hour: number } | null {
  for (let ahead = 0; ahead < 8; ahead++) {
    const index = (dayIndex + ahead) % 7;
    const day = weekDays[index]!;
    for (const w of timeWindows) {
      if (!slots[day].includes(w.id)) continue;
      if (ahead === 0 && w.start <= hour) continue;
      const when = formatHour(w.start);
      const label = ahead === 0 ? when : ahead === 1 ? `tomorrow at ${when}` : `${weekDayNames[index]} at ${when}`;
      return { label, daysAhead: ahead, hour: w.start };
    }
  }
  return null;
}

export function openDayCount(slots: Slots) {
  return weekDays.filter((d) => slots[d].length > 0).length;
}

/** Minutes each child-facing step takes. A step never starts if it would run past the daily limit. */
export const stepMinutes = { learn: 6, practice: 3, check: 3, review: 2 } as const;

export function canStartStep(minutesUsed: number, stepCost: number, dailyLimit: number) {
  if (minutesUsed === 0) return true;
  return minutesUsed + stepCost <= dailyLimit;
}

export type PlanItem = { day: string; title: string; skill: string; minutes: number; reason: string };
export type PlanResults = { child: string; checkScore: number | null; reviewScore: number | null };

const LESSON_MINUTES = stepMinutes.learn + stepMinutes.practice + stepMinutes.check;

/**
 * Builds the week automatically from the time the parent allows.
 * Less time means fewer or split lessons, never skipped teaching: every lesson keeps its Learn step.
 */
export function buildWeekPlan(settings: ScheduleSettings, results: PlanResults): { items: PlanItem[]; change: string | null } {
  const days = weekDayNames.filter((_, i) => settings.slots[weekDays[i]!].length > 0).slice(0, 5);
  const name = results.child;
  const sessions: Omit<PlanItem, "day" | "minutes">[] = [];
  const lessonSessions = (skill: string, title: string, reason: string) => {
    if (settings.minutes >= LESSON_MINUTES) return [{ skill, title: `${title}: Learn, Practice, Check`, reason }];
    return [
      { skill, title: `${title}: Learn and Practice`, reason },
      { skill, title: `${title}: Check`, reason: `Finishes ${title.toLowerCase()} because the daily time fits the lesson across two days.` },
    ];
  };

  let change: string | null = null;
  const missed = results.checkScore !== null && results.checkScore < 4;
  const passed = results.checkScore !== null && results.checkScore >= 4;

  if (results.reviewScore === null && passed) {
    sessions.push({ skill: FULL_LESSON_SKILL, title: "Review warm-up: comparing unit fractions", reason: `Because ${name} passed the Check ${results.checkScore}/5, and a short Review three days later helps it stick.` });
    change = `Added a Review warm-up because ${name} scored ${results.checkScore}/5 on the Check.`;
  }
  if (missed) {
    sessions.push(...lessonSessions(FULL_LESSON_SKILL, "Comparing unit fractions again, with a new example", `Because ${name} got ${results.checkScore} of 5 on comparing unit fractions.`));
    change = `Moved comparing unit fractions back to the start, re-taught with a new example, because ${name} got ${results.checkScore} of 5.`;
  }
  if (results.checkScore === null) {
    sessions.push(...lessonSessions(FULL_LESSON_SKILL, "Comparing unit fractions", `Because ${name} chose 1/8 as larger than 1/4 in the diagnostic.`));
  }
  sessions.push(
    ...lessonSessions("Fractions on a number line", "Fractions on a number line", `Because it builds directly on comparing unit fractions.`),
    { skill: "Multiply by 3 and 4", title: "Multiply by 3 and 4: practice", reason: `Because ${name} is at 90% and a little more practice makes it automatic.` },
    { skill: "Understand unit fractions", title: "Unit fractions: quick practice", reason: `Because it supports this week’s fraction lessons.` },
    { skill: "Read picture graphs", title: "Picture graphs: practice", reason: `Because it is the next skill ready in measurement and data.` },
  );

  const items = days.map((day, i) => ({ day, minutes: settings.minutes, ...sessions[i]! })).filter((item) => item.skill);
  return { items, change };
}


