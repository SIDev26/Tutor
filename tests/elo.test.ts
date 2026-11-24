import { describe, expect, it } from "vitest";
import { expectedCorrect, targetDifficulty, updateDifficulty } from "@/lib/elo";

describe("item difficulty", () => {
  it("expects more success from a stronger student on the same item", () => {
    const item = 0.45;
    expect(expectedCorrect(0.85, item)).toBeGreaterThan(expectedCorrect(0.25, item));
  });

  it("lowers difficulty when a hard-looking item is answered correctly", () => {
    const expected = expectedCorrect(0.3, 0.8);
    const next = updateDifficulty(0.8, true, expected);
    expect(next).toBeLessThan(0.8);
  });

  it("raises difficulty when an easy-looking item is missed", () => {
    const expected = expectedCorrect(0.9, 0.2);
    const next = updateDifficulty(0.2, false, expected);
    expect(next).toBeGreaterThan(0.2);
  });

  it("gives struggling students an easier target", () => {
    expect(targetDifficulty(0.2)).toBeLessThan(targetDifficulty(0.85));
  });
});
