import { describe, expect, it } from "vitest";
import { skillById, skillNodes } from "@/content/skills";
import { isStalling, readyAlert, stallAlert } from "@/lib/alerts";
import { proposePlan, validatePlanSelection } from "@/lib/plan";
import { renderWeeklyReport } from "@/lib/report";
import { addDays, initialReviewDue, nextIntervalDays } from "@/lib/review";
import type { SkillMasterySnapshot } from "@/lib/selection";
import { textPdf } from "@/lib/simplePdf";

const nodes = skillNodes();

function mastered(skillId: string): SkillMasterySnapshot {
  return {
    skillId,
    status: "MASTERED",
    pMastery: 0.97,
    attempts: 6,
    reviewDueAt: null,
  };
}

describe("plans", () => {
  it("proposes frontier skills and refuses a locked skill", () => {
    const states = [mastered("2.OA.B.2"), mastered("2.NBT.A.1")];
    const titles = new Map(nodes.map((skill) => [skill.id, skillById(skill.id)!.title]));
    const plan = proposePlan(nodes, states, 2, new Date("2026-04-02T00:00:00Z"), titles);
    expect(plan.skillIds).toContain("2.NBT.B.5");
    expect(plan.skillIds).not.toContain("4.NBT.B.4");
    expect(plan.note.length).toBeGreaterThan(10);

    const issues = validatePlanSelection(nodes, states, ["4.NBT.B.4"]);
    expect(issues).toHaveLength(1);
    expect(validatePlanSelection(nodes, states, ["2.NBT.B.5"])).toEqual([]);
  });
});

describe("alerts", () => {
  it("flags a flat run of misses and ignores a short sample", () => {
    const flat = Array.from({ length: 6 }, () => ({
      correct: false,
      pMasteryBefore: 0.22,
      pMasteryAfter: 0.23,
    }));
    expect(isStalling(flat)).toBe(true);
    expect(isStalling(flat.slice(0, 5))).toBe(false);
    const learning = flat.map((item, index) => ({
      ...item,
      correct: index > 2,
      pMasteryBefore: 0.2 + index * 0.08,
      pMasteryAfter: 0.28 + index * 0.08,
    }));
    expect(isStalling(learning)).toBe(false);
  });

  it("writes parent-facing stall and ready copy", () => {
    expect(stallAlert("Sam", "Parts of a whole", "3.NF.A.1").message).toMatch(/Sam/);
    expect(readyAlert("Sam", "Equal groups", "3.OA.A.1").message).toMatch(/ready for Equal groups/);
  });
});

describe("weekly report", () => {
  it("uses the logged numbers and names hard misconceptions", () => {
    const report = renderWeeklyReport({
      nickname: "Riley",
      fromLabel: "Apr 1",
      toLabel: "Apr 7",
      minutes: 48,
      answered: 20,
      correct: 14,
      improved: [
        { title: "Multiplication facts", fromP: 0.4, toP: 0.7, mastered: false },
      ],
      hard: [
        {
          title: "Parts of a whole",
          accuracy: 0.33,
          attempts: 6,
          topMisconception: "inverted-fraction",
        },
      ],
      recommendations: [
        {
          title: "Fractions on a line",
          reason: "Parts of a whole is not mastered yet, so this waits.",
        },
      ],
      masteredCount: 4,
      inProgressCount: 2,
    });
    expect(report.headline).toMatch(/48 minutes/);
    expect(report.headline).toMatch(/70% correct/);
    expect(report.paragraphs.join(" ")).toMatch(/Multiplication facts/);
    expect(report.paragraphs.join(" ")).toMatch(/numerator and the denominator/i);
    expect(report.nextSteps[0]).toMatch(/Fractions on a line/);
  });

  it("stays useful when the week is empty", () => {
    const report = renderWeeklyReport({
      nickname: "Ada",
      fromLabel: "Apr 1",
      toLabel: "Apr 7",
      minutes: 0,
      answered: 0,
      correct: 0,
      improved: [],
      hard: [],
      recommendations: [],
      masteredCount: 0,
      inProgressCount: 0,
    });
    expect(report.headline).toMatch(/no practice/i);
    expect(report.paragraphs[0]).toMatch(/diagnostic/i);
  });
});

describe("review spacing", () => {
  it("spaces successful reviews further apart", () => {
    expect(nextIntervalDays(1)).toBe(1);
    expect(nextIntervalDays(2)).toBe(3);
    expect(nextIntervalDays(5)).toBe(35);
    const from = new Date("2026-04-01T12:00:00Z");
    expect(initialReviewDue(from).toISOString().slice(0, 10)).toBe("2026-04-02");
    expect(addDays(from, 16).toISOString().slice(0, 10)).toBe("2026-04-17");
  });
});

describe("pdf export", () => {
  it("produces a PDF document", () => {
    const bytes = textPdf(["Beacon Math record", "Child: Sam", "Grade: 2"]);
    const text = new TextDecoder().decode(bytes);
    expect(text.startsWith("%PDF-1.4")).toBe(true);
    expect(text).toContain("Beacon Math record");
    expect(text.trimEnd().endsWith("%%EOF")).toBe(true);
  });
});
