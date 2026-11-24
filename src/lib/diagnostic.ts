import {
  bktUpdate,
  DEFAULT_BKT,
  MASTERY_MIN_ATTEMPTS,
  statusFor,
  type BktParams,
  type MasteryStatus,
} from "@/lib/bkt";
import type { SkillNode } from "@/content/skills";

export type DiagnosticResponse = {
  skillId: string;
  correct: boolean;
};

export type Placement = {
  skillId: string;
  pMastery: number;
  attempts: number;
  status: MasteryStatus;
  inferred: boolean;
};

const DEFAULT_MAX_ITEMS = 10;

function counts(responses: DiagnosticResponse[]) {
  const asked = new Map<string, number>();
  const correct = new Map<string, number>();
  for (const response of responses) {
    asked.set(response.skillId, (asked.get(response.skillId) ?? 0) + 1);
    if (response.correct) {
      correct.set(response.skillId, (correct.get(response.skillId) ?? 0) + 1);
    }
  }
  const passed = (id: string) => {
    const n = asked.get(id) ?? 0;
    const c = correct.get(id) ?? 0;
    return n > 0 && c > n - c;
  };
  const failed = (id: string) => {
    const n = asked.get(id) ?? 0;
    const c = correct.get(id) ?? 0;
    return n > 0 && n - c >= c;
  };
  return { asked, passed, failed };
}

function byDistance(grade: number) {
  return (a: SkillNode, b: SkillNode) =>
    Math.abs(a.grade - grade) - Math.abs(b.grade - grade) ||
    a.grade - b.grade ||
    a.sortOrder - b.sortOrder;
}

/**
 * Short graph-adaptive diagnostic.
 * One item per skill. A miss drops to an unasked prerequisite.
 * A hit prefers another on-grade entry, then a dependent skill whose
 * other prerequisites are already passed.
 */
export function nextDiagnosticSkill(
  skills: SkillNode[],
  responses: DiagnosticResponse[],
  grade: number,
  maxItems = DEFAULT_MAX_ITEMS,
): string | null {
  if (responses.length >= maxItems) return null;
  const { asked, passed, failed } = counts(responses);
  const unseen = (id: string) => (asked.get(id) ?? 0) === 0;

  if (responses.length === 0) {
    const entries = skills
      .filter((skill) => skill.entry && skill.grade === grade)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    return entries[0]?.id ?? skills.find((skill) => skill.prereqIds.length === 0)?.id ?? null;
  }

  const last = responses[responses.length - 1]!;
  if (!last.correct) {
    const skill = skills.find((item) => item.id === last.skillId);
    const prereq = (skill?.prereqIds ?? [])
      .map((id) => skills.find((item) => item.id === id))
      .filter((item): item is SkillNode => Boolean(item))
      .filter((item) => unseen(item.id))
      .sort((a, b) => b.grade - a.grade || a.sortOrder - b.sortOrder);
    if (prereq[0]) return prereq[0].id;
  }

  const entriesLeft = skills
    .filter(
      (skill) =>
        skill.entry &&
        skill.grade === grade &&
        unseen(skill.id) &&
        skill.prereqIds.every((id) => !failed(id)),
    )
    .sort((a, b) => a.sortOrder - b.sortOrder);
  if (entriesLeft[0]) return entriesLeft[0].id;

  if (last.correct) {
    const dependents = skills
      .filter((skill) => skill.prereqIds.includes(last.skillId) && unseen(skill.id))
      .filter((skill) =>
        skill.prereqIds.every((id) => id === last.skillId || passed(id)),
      )
      .filter((skill) => skill.grade <= grade + 1)
      .sort(byDistance(grade));
    if (dependents[0]) return dependents[0].id;
  }

  const assumed = new Set<string>();
  const ancestors = (id: string, seen = new Set<string>()): string[] => {
    const skill = skills.find((item) => item.id === id);
    if (!skill) return [];
    const out: string[] = [];
    for (const prereqId of skill.prereqIds) {
      if (seen.has(prereqId)) continue;
      seen.add(prereqId);
      out.push(prereqId, ...ancestors(prereqId, seen));
    }
    return out;
  };
  for (const skill of skills) {
    if (!passed(skill.id)) continue;
    assumed.add(skill.id);
    for (const ancestorId of ancestors(skill.id)) {
      if (!failed(ancestorId)) assumed.add(ancestorId);
    }
  }

  const probe = skills
    .filter((skill) => unseen(skill.id))
    .filter((skill) => skill.prereqIds.every((id) => assumed.has(id)))
    .filter((skill) => skill.grade <= grade + 1 && skill.grade >= grade - 2)
    .sort(byDistance(grade));
  return probe[0]?.id ?? null;
}

/**
 * Turn diagnostic responses into per-skill mastery.
 * Passing a skill places its unattempted prerequisites as mastered
 * ("placed by diagnostic") unless that prerequisite was itself missed.
 */
export function placeFromDiagnostic(
  skills: SkillNode[],
  responses: DiagnosticResponse[],
  params: BktParams = DEFAULT_BKT,
): Placement[] {
  const grouped = new Map<string, boolean[]>();
  for (const response of responses) {
    const list = grouped.get(response.skillId) ?? [];
    list.push(response.correct);
    grouped.set(response.skillId, list);
  }

  const pMap = new Map<string, number>();
  const attemptMap = new Map<string, number>();
  const inferred = new Map<string, boolean>();

  for (const skill of skills) {
    const outcomes = grouped.get(skill.id) ?? [];
    let p = params.pL0;
    for (const correct of outcomes) p = bktUpdate(p, correct, params);
    pMap.set(skill.id, outcomes.length > 0 ? p : params.pL0);
    attemptMap.set(skill.id, outcomes.length);
    inferred.set(skill.id, false);
  }

  const passed = (id: string) => {
    const outcomes = grouped.get(id) ?? [];
    if (outcomes.length === 0) return false;
    const correct = outcomes.filter(Boolean).length;
    return correct > outcomes.length - correct;
  };
  const failed = (id: string) => {
    const outcomes = grouped.get(id) ?? [];
    if (outcomes.length === 0) return false;
    const correct = outcomes.filter(Boolean).length;
    return outcomes.length - correct >= correct;
  };

  const ancestors = (id: string, seen = new Set<string>()): string[] => {
    const skill = skills.find((item) => item.id === id);
    if (!skill) return [];
    const out: string[] = [];
    for (const prereqId of skill.prereqIds) {
      if (seen.has(prereqId)) continue;
      seen.add(prereqId);
      out.push(prereqId, ...ancestors(prereqId, seen));
    }
    return out;
  };

  for (const skill of skills) {
    if (!passed(skill.id)) continue;
    for (const prereqId of ancestors(skill.id)) {
      if (failed(prereqId)) continue;
      const direct = grouped.get(prereqId) ?? [];
      if (direct.length > 0) {
        pMap.set(prereqId, Math.max(pMap.get(prereqId) ?? 0, 0.9));
        continue;
      }
      pMap.set(prereqId, Math.max(pMap.get(prereqId) ?? 0, 0.96));
      attemptMap.set(
        prereqId,
        Math.max(attemptMap.get(prereqId) ?? 0, MASTERY_MIN_ATTEMPTS),
      );
      inferred.set(prereqId, true);
    }
  }

  return skills.map((skill) => {
    const attempts = attemptMap.get(skill.id) ?? 0;
    const pMastery = pMap.get(skill.id) ?? params.pL0;
    return {
      skillId: skill.id,
      pMastery,
      attempts,
      status: statusFor(pMastery, attempts),
      inferred: inferred.get(skill.id) ?? false,
    };
  });
}
