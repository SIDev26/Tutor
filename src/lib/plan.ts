import type { SkillNode } from "@/content/skills";
import {
  frontierSkills,
  reviewDue,
  unmetPrereqs,
  type SkillMasterySnapshot,
} from "@/lib/selection";

export type PlanProposal = {
  skillIds: string[];
  note: string;
};

export function proposePlan(
  skills: SkillNode[],
  states: SkillMasterySnapshot[],
  childGrade: number,
  now: Date,
  titles: Map<string, string>,
): PlanProposal {
  const stateMap = new Map(states.map((state) => [state.skillId, state]));
  const frontier = frontierSkills(skills, stateMap, childGrade);
  const due = reviewDue(states, now);
  const focus = frontier.slice(0, 3);
  if (due[0] && !focus.includes(due[0])) focus.push(due[0]);

  const names = focus.map((id) => titles.get(id) ?? id);
  let note =
    "These are the next skills whose earlier skills are already in place.";
  if (names.length === 1) {
    note = `${names[0]} is ready to practice. The skills that come before it are in place.`;
  } else if (names.length > 1) {
    note = `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]} are ready to practice. Earlier skills are in place.`;
  }
  if (due[0]) {
    note += " One mastered skill is also due for a short review.";
  }
  if (focus.length === 0) {
    note = "Every skill in this slice is mastered. Keep the review schedule, or widen the skill map.";
  }
  return { skillIds: focus, note };
}

export type PlanIssue = { skillId: string; message: string };

export function validatePlanSelection(
  skills: SkillNode[],
  states: SkillMasterySnapshot[],
  selectedIds: string[],
): PlanIssue[] {
  const stateMap = new Map(states.map((state) => [state.skillId, state]));
  const issues: PlanIssue[] = [];
  const seen = new Set<string>();
  for (const skillId of selectedIds) {
    if (seen.has(skillId)) continue;
    seen.add(skillId);
    const skill = skills.find((item) => item.id === skillId);
    if (!skill) {
      issues.push({ skillId, message: "Unknown skill." });
      continue;
    }
    if (stateMap.get(skillId)?.status === "MASTERED") continue;
    const unmet = unmetPrereqs(skill, stateMap);
    if (unmet.length > 0) {
      issues.push({
        skillId,
        message: "Earlier skills still need to be mastered before this one is assigned.",
      });
    }
  }
  return issues;
}
