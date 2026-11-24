import { describe, expect, it } from "vitest";
import { skillNodes, SKILLS } from "@/content/skills";
import type { SkillMasterySnapshot } from "@/lib/selection";
import { frontierSkills, nextPracticeSkill, reviewDue } from "@/lib/selection";

const nodes = skillNodes();

function state(
  skillId: string,
  status: SkillMasterySnapshot["status"],
  extra: Partial<SkillMasterySnapshot> = {},
): SkillMasterySnapshot {
  return {
    skillId,
    status,
    pMastery: status === "MASTERED" ? 0.97 : status === "IN_PROGRESS" ? 0.5 : 0.15,
    attempts: status === "NOT_STARTED" ? 0 : 6,
    reviewDueAt: null,
    ...extra,
  };
}

describe("frontier selection", () => {
  it("starts a new child on skills that have no prerequisites", () => {
    const frontier = frontierSkills(nodes, new Map(), 2);
    expect(frontier).toContain("2.OA.B.2");
    expect(frontier).toContain("2.NBT.A.1");
    expect(frontier).not.toContain("2.NBT.B.5");
    expect(frontier).not.toContain("3.OA.C.7");
  });

  it("hides a skill until every prerequisite is mastered", () => {
    const states = new Map([
      ["2.OA.B.2", state("2.OA.B.2", "MASTERED")],
    ]);
    const frontier = frontierSkills(nodes, states, 2);
    expect(frontier).not.toContain("2.NBT.B.5");
    expect(frontier).toContain("3.OA.A.1");
    expect(frontier).toContain("3.NF.A.1");
  });

  it("puts in-progress frontier skills ahead of untouched ones", () => {
    const states = new Map([
      ["2.OA.B.2", state("2.OA.B.2", "MASTERED")],
      ["2.NBT.A.1", state("2.NBT.A.1", "MASTERED")],
      ["2.NBT.B.5", state("2.NBT.B.5", "IN_PROGRESS")],
    ]);
    const frontier = frontierSkills(nodes, states, 3);
    expect(frontier[0]).toBe("2.NBT.B.5");
    expect(frontier).not.toContain("2.OA.B.2");
  });

  it("mixes due review into practice without dropping the frontier", () => {
    const due = new Date("2026-04-01T00:00:00Z");
    const now = new Date("2026-04-02T00:00:00Z");
    const reviews = reviewDue(
      [state("2.OA.B.2", "MASTERED", { reviewDueAt: due })],
      now,
    );
    expect(reviews).toEqual(["2.OA.B.2"]);
    const picks = [0, 1, 2, 3].map((index) =>
      nextPracticeSkill(["2.NBT.B.5", "2.NBT.B.6"], reviews, index),
    );
    expect(picks.map((pick) => pick?.reason)).toEqual([
      "frontier",
      "frontier",
      "review",
      "frontier",
    ]);
    expect(picks[2]?.skillId).toBe("2.OA.B.2");
  });

  it("does not review a mastered skill before it is due", () => {
    const later = new Date("2026-05-01T00:00:00Z");
    const now = new Date("2026-04-02T00:00:00Z");
    expect(reviewDue([state("2.OA.B.2", "MASTERED", { reviewDueAt: later })], now)).toEqual([]);
  });

  it("covers the grade 2-4 slice the pilot practices", () => {
    expect(SKILLS.length).toBeGreaterThanOrEqual(20);
    expect(SKILLS.length).toBeLessThanOrEqual(25);
    for (const grade of [2, 3, 4]) {
      expect(SKILLS.some((skill) => skill.grade === grade && skill.entry)).toBe(true);
    }
  });
});
