import { describe, expect, it } from "vitest";
import {
  bktReplay,
  bktUpdate,
  DEFAULT_BKT,
  MASTERY_MIN_ATTEMPTS,
  MASTERY_THRESHOLD,
  statusFor,
} from "@/lib/bkt";

describe("Bayesian Knowledge Tracing", () => {
  it("moves up after a correct answer and down after a miss", () => {
    const up = bktUpdate(0.4, true);
    const down = bktUpdate(0.4, false);
    expect(up).toBeGreaterThan(0.4);
    expect(down).toBeLessThan(0.4);
  });

  it("stays inside (0, 1) so later evidence can still move it", () => {
    let p = 0.5;
    for (let i = 0; i < 30; i += 1) p = bktUpdate(p, true);
    expect(p).toBeGreaterThan(MASTERY_THRESHOLD);
    expect(p).toBeLessThan(1);
    for (let i = 0; i < 30; i += 1) p = bktUpdate(p, false);
    expect(p).toBeGreaterThan(0);
    expect(p).toBeLessThan(0.5);
  });

  it("does not treat a lucky first guess as mastery", () => {
    const once = bktUpdate(DEFAULT_BKT.pL0, true);
    expect(once).toBeLessThan(MASTERY_THRESHOLD);
    expect(statusFor(once, 1)).toBe("IN_PROGRESS");
  });

  it("masters after enough correct practice", () => {
    const outcomes = Array.from({ length: MASTERY_MIN_ATTEMPTS }, () => true);
    const p = bktReplay(outcomes);
    expect(p).toBeGreaterThanOrEqual(MASTERY_THRESHOLD);
    expect(statusFor(p, outcomes.length)).toBe("MASTERED");
  });

  it("keeps an untouched skill not started", () => {
    expect(statusFor(DEFAULT_BKT.pL0, 0)).toBe("NOT_STARTED");
  });

  it("a long miss streak does not reach mastery from the learning parameter alone", () => {
    const p = bktReplay(Array.from({ length: 8 }, () => false));
    expect(statusFor(p, 8)).toBe("IN_PROGRESS");
    expect(p).toBeLessThan(0.6);
  });
});
