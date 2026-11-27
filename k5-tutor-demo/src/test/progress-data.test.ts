import { describe, expect, it } from "vitest";
import { calendarStats, levelFor, practiceCalendar, progressFor, summarySentence } from "../lib/progress-data";
import { createLesson } from "../lib/lesson-data";
import { defaultSchedule } from "../lib/schedule";

const fresh = createLesson();
describe("Progress page data", () => {
  it("sums Leo up in one sentence", () => expect(summarySentence("Leo", fresh, false)).toBe("Leo has mastered 4 new skills in 6 weeks and is catching up in fractions."));
  it("shows Sofia on track everywhere", () => expect(progressFor("Sofia", fresh).rows.every((r) => r.level !== "Catching up")).toBe(true));
  it("puts the area needing most attention first", () => expect(progressFor("Leo", fresh).sorted[0]?.name).toBe("Fractions"));
  it("gives fractions Leo's biggest move", () => {
    const rows = progressFor("Leo", fresh).rows;
    const move = (n: string) => rows.find((r) => r.name === n)!.now - rows.find((r) => r.name === n)!.then;
    expect(rows.every((r) => r.name === "Fractions" || move(r.name) < move("Fractions"))).toBe(true);
  });
  it("ends the mastered-by-week chart at the skill map's mastered count", () => {
    const p = progressFor("Leo", fresh);
    expect(p.weekly).toEqual([8, 9, 9, 10, 11, 12]);
    expect(p.totalMastered).toBe(12);
  });
  it("adds the lesson skill once the Check and Review are passed", () => {
    const done = { ...fresh, checkScore: 4, reviewScore: 3, reviewDate: "Nov 22, 2026" };
    expect(progressFor("Leo", done).weekly.at(-1)).toBe(13);
  });
  it("never shows catching up as anything other than below the expected zone", () => {
    expect(levelFor(1.5)).toBe("Catching up");
    expect(levelFor(2)).toBe("On track");
    expect(levelFor(3.5)).toBe("Ahead");
  });
  it("counts weekends outside time slots as off days, not missed", () => {
    const days = practiceCalendar("Leo", defaultSchedule().slots, 0);
    expect(days[5]?.kind).toBe("off");
    expect(days.filter((d) => d.kind === "missed")).toHaveLength(2);
  });
  it("this week's calendar minutes match Home's 42 minutes", () => {
    const days = practiceCalendar("Leo", defaultSchedule().slots, 0);
    expect(days.slice(35, 38).reduce((n, d) => n + (d.minutes ?? 0), 0)).toBe(42);
    expect(calendarStats(days).plannedWeek).toBe(5);
  });
});


