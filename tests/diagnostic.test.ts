import { describe, expect, it } from "vitest";
import { skillNodes, SKILLS } from "@/content/skills";
import { MASTERY_THRESHOLD } from "@/lib/bkt";
import { nextDiagnosticSkill, placeFromDiagnostic } from "@/lib/diagnostic";

const nodes = skillNodes();

function run(grade: number, answer: (skillId: string) => boolean) {
  const responses: { skillId: string; correct: boolean }[] = [];
  for (let i = 0; i < 12; i += 1) {
    const next = nextDiagnosticSkill(nodes, responses, grade);
    if (!next) break;
    responses.push({ skillId: next, correct: answer(next) });
  }
  return responses;
}

describe("diagnostic", () => {
  it("opens on a grade-level entry skill and never repeats a skill", () => {
    for (const grade of [2, 3, 4]) {
      const responses = run(grade, () => true);
      const entry = SKILLS.find((skill) => skill.entry && skill.grade === grade);
      expect(responses[0]?.skillId).toBe(entry?.id);
      expect(responses.length).toBeLessThanOrEqual(10);
      expect(new Set(responses.map((item) => item.skillId)).size).toBe(responses.length);
    }
  });

  it("drops to a prerequisite after a miss", () => {
    const first = nextDiagnosticSkill(nodes, [], 4);
    expect(first).toBe("4.NBT.B.4");
    const next = nextDiagnosticSkill(nodes, [{ skillId: "4.NBT.B.4", correct: false }], 4);
    expect(next).toBe("3.NBT.A.2");
  });

  it("does not assign a skill whose prerequisite was just missed", () => {
    const responses = run(2, (skillId) => skillId !== "2.OA.B.2");
    const failedAt = responses.findIndex((item) => item.skillId === "2.OA.B.2");
    expect(failedAt).toBeGreaterThanOrEqual(0);
    const later = responses.slice(failedAt + 1);
    for (const item of later) {
      const skill = SKILLS.find((candidate) => candidate.id === item.skillId);
      expect(skill?.prereqIds.includes("2.OA.B.2")).toBe(false);
    }
  });

  it("places unattempted prerequisites as mastered when a harder skill is passed", () => {
    const placement = placeFromDiagnostic(nodes, [
      { skillId: "3.OA.C.7", correct: true },
    ]);
    const byId = new Map(placement.map((item) => [item.skillId, item]));
    expect(byId.get("3.OA.A.1")?.status).toBe("MASTERED");
    expect(byId.get("3.OA.A.1")?.inferred).toBe(true);
    expect(byId.get("2.OA.B.2")?.status).toBe("MASTERED");
    expect(byId.get("3.OA.C.7")?.status).not.toBe("MASTERED");
    expect(byId.get("3.OA.C.7")?.pMastery).toBeLessThan(MASTERY_THRESHOLD);
  });

  it("does not erase a prerequisite the child actually missed", () => {
    const placement = placeFromDiagnostic(nodes, [
      { skillId: "2.NBT.B.5", correct: true },
      { skillId: "2.OA.B.2", correct: false },
    ]);
    const byId = new Map(placement.map((item) => [item.skillId, item]));
    expect(byId.get("2.OA.B.2")?.inferred).toBe(false);
    expect(byId.get("2.OA.B.2")?.status).not.toBe("MASTERED");
    expect(byId.get("2.NBT.A.1")?.status).toBe("MASTERED");
    expect(byId.get("2.NBT.A.1")?.inferred).toBe(true);
  });

  it("leaves untouched skills not started", () => {
    const placement = placeFromDiagnostic(nodes, [{ skillId: "2.OA.B.2", correct: false }]);
    const fractions = placement.find((item) => item.skillId === "3.NF.A.1");
    expect(fractions?.status).toBe("NOT_STARTED");
    expect(fractions?.attempts).toBe(0);
  });
});
