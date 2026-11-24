/** Logistic chance of a correct answer from mastery and item difficulty (0 easy, 1 hard). */
export function expectedCorrect(pMastery: number, difficulty: number): number {
  const ability = (pMastery - 0.5) * 2;
  const hardness = (difficulty - 0.5) * 2;
  const logit = 1.4 * (ability - hardness);
  const p = 1 / (1 + Math.exp(-logit));
  return Math.min(0.98, Math.max(0.02, p));
}

/**
 * Nudge template difficulty. A correct answer that was unlikely makes the
 * item easier; a miss that was unlikely makes it harder.
 */
export function updateDifficulty(
  difficulty: number,
  correct: boolean,
  expected: number,
  k = 0.04,
): number {
  const score = correct ? 1 : 0;
  const next = difficulty + k * (expected - score);
  return Math.min(0.95, Math.max(0.05, next));
}

/** Easier items when mastery is low, so early practice sits near ~75% success. */
export function targetDifficulty(pMastery: number): number {
  return Math.min(0.85, Math.max(0.12, 0.12 + pMastery * 0.7));
}
