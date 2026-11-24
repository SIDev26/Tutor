import type { MasteryStatus } from "@/lib/bkt";
import type { SkillNode } from "@/content/skills";

export type SkillMasterySnapshot = {
  skillId: string;
  status: MasteryStatus;
  pMastery: number;
  attempts: number;
  reviewDueAt: Date | null;
};

export function snapshotMap(
  states: SkillMasterySnapshot[],
): Map<string, SkillMasterySnapshot> {
  return new Map(states.map((state) => [state.skillId, state]));
}

export function isMastered(
  states: Map<string, SkillMasterySnapshot>,
  skillId: string,
): boolean {
  return states.get(skillId)?.status === "MASTERED";
}

/**
 * Skills whose prerequisites are mastered and which are not mastered yet.
 * In-progress skills come first, then skills closest to the child's grade.
 */
export function frontierSkills(
  skills: SkillNode[],
  states: Map<string, SkillMasterySnapshot>,
  childGrade: number,
): string[] {
  return skills
    .filter((skill) => !isMastered(states, skill.id))
    .filter((skill) => skill.prereqIds.every((id) => isMastered(states, id)))
    .sort((a, b) => {
      const aProgress = states.get(a.id)?.status === "IN_PROGRESS" ? 0 : 1;
      const bProgress = states.get(b.id)?.status === "IN_PROGRESS" ? 0 : 1;
      if (aProgress !== bProgress) return aProgress - bProgress;
      const aDistance = Math.abs(a.grade - childGrade);
      const bDistance = Math.abs(b.grade - childGrade);
      if (aDistance !== bDistance) return aDistance - bDistance;
      if (a.grade !== b.grade) return a.grade - b.grade;
      return a.sortOrder - b.sortOrder;
    })
    .map((skill) => skill.id);
}

export function reviewDue(
  states: SkillMasterySnapshot[],
  now: Date,
): string[] {
  return states
    .filter(
      (state) =>
        state.status === "MASTERED" &&
        state.reviewDueAt !== null &&
        state.reviewDueAt.getTime() <= now.getTime(),
    )
    .sort(
      (a, b) =>
        (a.reviewDueAt?.getTime() ?? 0) - (b.reviewDueAt?.getTime() ?? 0),
    )
    .map((state) => state.skillId);
}

export type PracticePick = {
  skillId: string;
  reason: "frontier" | "review";
};

/**
 * About one item in three is spaced review when something is due.
 * Frontier practice rotates through the first three frontier skills.
 */
export function nextPracticeSkill(
  frontier: string[],
  dueReviews: string[],
  itemIndex: number,
): PracticePick | null {
  if (frontier.length === 0 && dueReviews.length === 0) return null;
  if (dueReviews.length > 0 && (frontier.length === 0 || itemIndex % 3 === 2)) {
    return {
      skillId: dueReviews[itemIndex % dueReviews.length]!,
      reason: "review",
    };
  }
  const pool = frontier.slice(0, 3);
  return {
    skillId: pool[itemIndex % pool.length]!,
    reason: "frontier",
  };
}

export function unmetPrereqs(
  skill: SkillNode,
  states: Map<string, SkillMasterySnapshot>,
): string[] {
  return skill.prereqIds.filter((id) => !isMastered(states, id));
}
