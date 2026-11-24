import { describe, expect, it } from "vitest";
import { emptyProfile, homeInsight, lessonContent, masteryFromResults, plainContent, profileA, profileB, profileContexts } from "../lib/interest-content";

const strip = (items: { options: string[]; answer: string; model?: [number, number] }[]) => items.map((i) => ({ options: i.options, answer: i.answer, model: i.model }));
const names = { soccer: "Soccer", space: "Space" };

describe("Interest content model", () => {
  for (const [label, p] of [["A", profileA()], ["B", profileB()]] as const) {
    const c = lessonContent(p);
    const plain = plainContent();
    it(`profile ${label}: every answer is among its options`, () => [...c.guided, ...c.practice, ...c.check, ...c.review].forEach((i) => expect(i.options).toContain(i.answer)));
    it(`profile ${label}: same math as the plain twin in every part`, () => {
      expect(strip(c.guided)).toEqual(strip(plain.guided));
      expect(strip(c.practice)).toEqual(strip(plain.practice));
      expect(strip(c.check)).toEqual(strip(plain.check));
      expect(strip(c.review)).toEqual(strip(plain.review));
    });
    it(`profile ${label}: Check has three themed and two plain items`, () => {
      expect(c.check.filter((i) => i.context === "themed")).toHaveLength(3);
      expect(c.check.filter((i) => i.context === "plain")).toHaveLength(2);
    });
    it(`profile ${label}: Review uses only plain or unchosen-world contexts`, () => expect(c.review.every((i) => i.context !== "themed")).toBe(true));
    it(`profile ${label}: themed prompts are no longer than plain ones plus a few words`, () => {
      [...c.practice, ...c.check].forEach((item, i) => {
        const twin = [...plain.practice, ...plain.check][i]!;
        expect(item.prompt.split(" ").length).toBeLessThanOrEqual(twin.prompt.split(" ").length + 3);
      });
    });
  }
  it("rotates Leo's contexts across his worlds and sub-interests", () => expect(profileContexts(profileA()).map((c) => c.id)).toEqual(["goalkeeping", "rockets", "tournaments"]));
  it("uses the astronaut context for the second demo profile", () => expect(profileContexts(profileB())[0]?.id).toBe("astronauts"));
  it("gives profile B a Review item in a world it did not choose", () => expect(lessonContent(profileB()).review[1]?.context).toBe("new-world"));
  it("falls back to plain contexts with no working world", () => expect(profileContexts({ ...emptyProfile(), worlds: ["music"] })[0]?.id).toBe("plain"));
  it("shows Leo's Soccer-week insight", () => expect(homeInsight(profileA(), "Leo", names)).toBe("Leo finishes more sessions in Soccer week."));
});

describe("Mastery rule with plain items", () => {
  it("needs teaching below 4 of 5", () => expect(masteryFromResults(3, 2, null)).toBe("Needs teaching"));
  it("practicing after 4 of 5 before Review", () => expect(masteryFromResults(4, 1, null)).toBe("Practicing"));
  it("mastered with 4 of 5, a plain item right and 3 of 3 Review", () => expect(masteryFromResults(4, 1, 3)).toBe("Mastered"));
  it("not mastered when both plain Check items were missed", () => expect(masteryFromResults(4, 0, 3)).toBe("Practicing"));
});


