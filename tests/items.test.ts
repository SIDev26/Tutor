import { describe, expect, it } from "vitest";
import { GENERATORS, type ItemFacts, type RawItem } from "@/content/generators";
import { SKILLS } from "@/content/skills";
import { assertValidItem, pickTemplateKey } from "@/lib/items";
import { mulberry32 } from "@/lib/rng";

function numeric(text: string): number {
  return Number(text.replace(/,/g, "").replace(/ cents$/, "").replace(/ hours$/, "").replace(/ times$/, ""));
}

function expectCorrect(item: RawItem, expected: string) {
  const correct = item.choices.find((choice) => choice.correct);
  expect(correct?.text).toBe(expected);
}

function expectedText(facts: ItemFacts): string | null {
  switch (facts.kind) {
    case "sum":
      return String(facts.a + facts.b);
    case "diff":
      return String(facts.a - facts.b);
    case "sum-many":
      return String(facts.values.reduce((total, value) => total + value, 0));
    case "place":
      return String(Math.floor(facts.number / facts.place) % 10 * facts.place);
    case "expanded":
      return String(facts.hundreds * 100 + facts.tens * 10 + facts.ones);
    case "money":
      return `${facts.quarters * 25 + facts.dimes * 10 + facts.nickels * 5 + facts.pennies} cents`;
    case "product":
      return String(facts.a * facts.b);
    case "two-step":
      return String(facts.packs * facts.each - facts.give);
    case "round":
      return String(Math.round(facts.n / facts.place) * facts.place);
    case "fraction":
      return `${facts.numerator}/${facts.denominator}`;
    case "equivalent":
      return `${facts.n2}/${facts.d2}`;
    case "elapsed":
      return `${facts.end - facts.start} hours`;
    case "times-as-much":
      return `${facts.factor} times`;
    case "like-den": {
      const sum = facts.a + facts.b;
      return sum === facts.den ? "1" : `${sum}/${facts.den}`;
    }
    default:
      return null;
  }
}

describe("parametric items", () => {
  it("gives every pilot skill at least one template", () => {
    for (const skill of SKILLS) {
      expect(GENERATORS.some((generator) => generator.skillId === skill.id)).toBe(true);
    }
  });

  it("builds four unique tagged choices and an independent correct answer", () => {
    for (const generator of GENERATORS) {
      for (let seed = 1; seed <= 40; seed += 1) {
        const item = generator.generate(mulberry32(seed * 1000 + generator.key.length));
        expect(() => assertValidItem(item), generator.key).not.toThrow();
        const expected = expectedText(item.facts);
        expect(expected, generator.key).toBeTruthy();
        const correct = item.choices.find((choice) => choice.correct)!;
        if ((expected ?? "").includes(",") || Number(expected) >= 1000) {
          expect(numeric(correct.text)).toBe(numeric(expected!));
        } else {
          expectCorrect(item, expected!);
        }
        for (const choice of item.choices.filter((candidate) => !candidate.correct)) {
          expect(numeric(choice.text) === numeric(correct.text) && choice.text === correct.text).toBe(false);
        }
      }
    }
  });

  it("picks an easier template when mastery is low", () => {
    const keys = new Set<string>();
    for (let seed = 1; seed <= 30; seed += 1) {
      keys.add(
        pickTemplateKey(
          "3.OA.C.7",
          [
            { key: "facts-2-5-10", difficulty: 0.35 },
            { key: "facts-3-4", difficulty: 0.58 },
          ],
          0.2,
          mulberry32(seed),
        ),
      );
    }
    expect(keys.has("facts-2-5-10")).toBe(true);
    expect(keys.has("facts-3-4")).toBe(false);
  });
});
