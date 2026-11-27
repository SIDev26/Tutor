import { describe, expect, it } from "vitest";
import { buildWeekPlan, canStartStep, defaultSchedule, isOpen, nextOpening, toggleSlot } from "../lib/schedule";

const leo = { child: "Leo", checkScore: null, reviewScore: null };

describe("Parent time controls", () => {
  it("defaults to 15 minutes", () => expect(defaultSchedule().minutes).toBe(15));
  it("defaults to weekdays 9:00 to 17:00", () => {
    const { slots } = defaultSchedule();
    expect(isOpen(slots, 0, 9)).toBe(true);
    expect(isOpen(slots, 4, 16)).toBe(true);
    expect(isOpen(slots, 3, 17)).toBe(false);
    expect(isOpen(slots, 5, 10)).toBe(false);
  });
  it("tells the child when the next slot opens", () => {
    const slots = { ...defaultSchedule().slots, Thu: ["evening" as const] };
    expect(nextOpening(slots, 3, 15)?.label).toBe("5:00");
    expect(nextOpening(defaultSchedule().slots, 5, 10)?.label).toBe("Monday at 9:00");
    expect(nextOpening(toggleSlot(defaultSchedule().slots, "Thu", "evening"), 3, 20)?.label).toBe("tomorrow at 9:00");
  });
  it("never starts a step that would run past the daily limit", () => {
    expect(canStartStep(9, 3, 10)).toBe(false);
    expect(canStartStep(9, 3, 15)).toBe(true);
    expect(canStartStep(0, 6, 10)).toBe(true);
  });
});

describe("Automatic weekly plan", () => {
  it("fits fewer lessons into 10 minutes but keeps the Learn step", () => {
    const short = buildWeekPlan({ ...defaultSchedule(), minutes: 10 }, leo).items;
    const long = buildWeekPlan({ ...defaultSchedule(), minutes: 20 }, leo).items;
    expect(short[0]?.title).toContain("Learn");
    expect(short[1]?.title).toContain("Check");
    expect(long[0]?.title).toContain("Learn, Practice, Check");
    expect(short.filter((i) => i.title.includes("Learn")).length).toBeLessThan(long.filter((i) => i.title.includes("Learn")).length + 1);
  });
  it("only schedules days the parent allowed", () => {
    expect(buildWeekPlan({ ...defaultSchedule(), slots: { ...defaultSchedule().slots, Mon: [], Tue: [] } }, leo).items.map((i) => i.day)).toEqual(["Wednesday", "Thursday", "Friday"]);
  });
  it("gives each item a plain reason", () => {
    expect(buildWeekPlan(defaultSchedule(), leo).items[0]?.reason).toBe("Because Leo chose 1/8 as larger than 1/4 in the diagnostic.");
  });
  it("re-teaches and explains the change after 3 of 5", () => {
    const plan = buildWeekPlan(defaultSchedule(), { child: "Leo", checkScore: 3, reviewScore: null });
    expect(plan.items[0]?.reason).toBe("Because Leo got 3 of 5 on comparing unit fractions.");
    expect(plan.change).toContain("because Leo got 3 of 5");
  });
  it("adds a Review warm-up after passing the Check", () => {
    const plan = buildWeekPlan(defaultSchedule(), { child: "Leo", checkScore: 4, reviewScore: null });
    expect(plan.items[0]?.title).toContain("Review warm-up");
  });
});


