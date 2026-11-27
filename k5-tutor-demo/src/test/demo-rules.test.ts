import { describe, expect, it } from "vitest";
import {
  priceForChildren,
  childMayStart,
  validPin,
  allowedGrades,
  allowedMinutes,
  nextDiagnosticQuestion,
  guidedQuantities,
  lessonSkillStatus,
  checkNeedsCoaching,
  toggleInterest,
} from "../lib/demo-rules";
import { interestOptions, problemsForInterest } from "../lib/lesson-data";

describe("Demo product rules", () => {
  it("charges $399 annually for one child", () => expect(priceForChildren(1, "annual")).toBe(399));
  it("charges $149 quarterly", () => expect(priceForChildren(1, "quarterly")).toBe(149));
  it("charges $59 monthly", () => expect(priceForChildren(1, "monthly")).toBe(59));
  it("discounts each additional child by 30%", () => expect(priceForChildren(2, "annual")).toBe(678));
  it("lets a consented child start with no parent approval", () => expect(childMayStart(true, false, true, 0, 15)).toBe(true));
  it("blocks the child without consent", () => expect(childMayStart(false, false, true, 0, 15)).toBe(false));
  it("blocks all child activity while paused", () => expect(childMayStart(true, true, true, 0, 15)).toBe(false));
  it("blocks the child outside a time slot", () => expect(childMayStart(true, false, false, 0, 15)).toBe(false));
  it("ends the day once the daily minutes are used", () => expect(childMayStart(true, false, true, 15, 15)).toBe(false));
  it("accepts any four digits for the mock parent gate", () => {
    expect(validPin("1234")).toBe(true);
    expect(validPin("123")).toBe(false);
    expect(validPin("abcd")).toBe(false);
  });
  it("limits launch grades to 2 to 4", () => expect(allowedGrades).toEqual([2, 3, 4]));
  it("offers 10, 15, or 20 minute settings", () => expect(allowedMinutes).toEqual([10, 15, 20]));
  it("makes the next fractions question easier after an error", () => expect(nextDiagnosticQuestion(5, "1/8")).toBe("Which is one half of a whole?"));
  it("builds the space interest into groups of 4 and 8 astronauts", () => {
    expect(guidedQuantities("space").prompt).toContain("4 astronauts");
    expect(guidedQuantities("space").prompt).toContain("8");
    expect(guidedQuantities("space").answer).toBe("The group of 4");
  });
  it("uses soccer players and the same mathematical quantities", () => {
    expect(guidedQuantities("soccer").prompt).toContain("4 players");
    expect(guidedQuantities("soccer").answer).toBe("The group of 4");
  });
  it("keeps a skill in its prior state before a Check", () => expect(lessonSkillStatus(null, null, "Needs teaching")).toBe("Needs teaching"));
  it("moves a 4 of 5 Check to Practicing", () => expect(lessonSkillStatus(4, null)).toBe("Practicing"));
  it("moves a 5 of 5 Check to Practicing before Review", () => expect(lessonSkillStatus(5, null)).toBe("Practicing"));
  it("requires a passing Check before Review can produce mastery", () => expect(lessonSkillStatus(3, 3)).toBe("Needs teaching"));
  it("moves 4 of 5 plus 3 of 3 Review to Mastered", () => expect(lessonSkillStatus(4, 3)).toBe("Mastered"));
  it("does not master after an incomplete Review pass", () => expect(lessonSkillStatus(5, 2)).toBe("Practicing"));
  it("creates coaching below 4 of 5 but not at the threshold", () => {
    expect(checkNeedsCoaching(3)).toBe(true);
    expect(checkNeedsCoaching(4)).toBe(false);
  });
  it("limits interest selections to three and allows clearing", () => {
    expect(toggleInterest(["space", "soccer", "art"], "ocean")).toEqual(["space", "soccer", "art"]);
    expect(toggleInterest(["space", "soccer"], "space")).toEqual(["soccer"]);
    expect(toggleInterest([], "ocean")).toEqual(["ocean"]);
  });
});

describe("Leo unit-fraction answer keys", () => {
  it.each(interestOptions.map((item) => item.id))("includes every answer among its options for %s", (interest) => {
    const problems = problemsForInterest(interest);
    [...problems.guided, ...problems.practice, ...problems.check, ...problems.review].forEach((problem) => {
      expect(problem.options).toContain(problem.answer);
    });
  });
  it("has five Check and three Review questions", () => {
    const problems = problemsForInterest("space");
    expect(problems.check).toHaveLength(5);
    expect(problems.review).toHaveLength(3);
  });
  it("checks the target misconception with 1/4 greater than 1/8", () => expect(problemsForInterest("space").check[0]?.answer).toBe("1/4"));
  it("uses the smaller sharing group for a bigger unit fraction", () => expect(problemsForInterest("space").check[1]?.answer).toBe("The group of 3"));
  it("defines the denominator as the count of equal pieces", () => expect(problemsForInterest("space").check[2]?.answer).toBe("The whole has 5 equal pieces"));
  it("identifies sixths as smaller than halves and thirds", () => expect(problemsForInterest("space").check[3]?.answer).toBe("1/6"));
  it("identifies the effect of making more equal pieces", () => expect(problemsForInterest("space").check[4]?.answer).toBe("Each piece gets smaller"));
  it("checks all three delayed Review answers", () => {
    expect(problemsForInterest("soccer").review.map((problem) => problem.answer)).toEqual(["1/3", "The group of 2", "1/7"]);
  });
});


