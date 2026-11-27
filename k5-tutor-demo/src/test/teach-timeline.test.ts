import { describe, expect, it } from "vitest";
import { ACTION_SECONDS, STRIP, TOTAL_SECONDS, beatAt, beats, pieceRect, sceneBeats, teachThemes } from "../lib/teach-timeline";

describe("Teach lesson timeline", () => {
  it("has eight scenes in order", () => expect([...new Set(beats.map((b) => b.scene))]).toEqual([0, 1, 2, 3, 4, 5, 6, 7]));
  it("runs 2 to 3 minutes", () => { expect(TOTAL_SECONDS).toBeGreaterThanOrEqual(120); expect(TOTAL_SECONDS).toBeLessThanOrEqual(180); });
  it("holds every beat for a beat after its ~1 second action", () => expect(beats.every((b) => b.dur >= ACTION_SECONDS + 1.5)).toBe(true));
  it("waits for the child's prediction only in scene 7", () => expect(beats.filter((b) => b.waitForChoice).map((b) => b.scene)).toEqual([6]));
  it("finds the right beat for a time", () => { expect(beatAt(0).index).toBe(0); expect(beatAt(TOTAL_SECONDS - 0.01).index).toBe(beats.length - 1); });
  it("uses the same beats for Space and Soccer", () => {
    expect(beats.map((b) => b.text(teachThemes.space, null).length > 0)).toEqual(beats.map((b) => b.text(teachThemes.soccer, null).length > 0));
    expect(sceneBeats(2)).toHaveLength(6);
  });
  it("draws exactly equal parts that fill the same whole", () => {
    for (const parts of [2, 3, 4, 6, 8]) {
      const widths = Array.from({ length: parts }, (_, i) => pieceRect(parts, i).w);
      expect(new Set(widths).size).toBe(1);
      const last = pieceRect(parts, parts - 1);
      expect(last.x + last.w).toBeCloseTo(STRIP.x + STRIP.length, 9);
    }
  });
  it("draws piece lengths true to their fractions", () => {
    expect(pieceRect(4, 0).w).toBe(2 * pieceRect(8, 0).w);
    expect(pieceRect(3, 0).w).toBe(2 * pieceRect(6, 0).w);
    expect(pieceRect(2, 0).w).toBe(STRIP.length / 2);
  });
  it("tells the correct answer whatever the child predicts", () => {
    const reveal = beats.filter((b) => b.scene === 6).at(-1)!;
    expect(reveal.text(teachThemes.space, "1/3")).toContain("One third is longer");
    expect(reveal.text(teachThemes.space, "1/6")).toContain("One third is longer");
  });
});


