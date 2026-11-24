export type BktParams = {
  /** Prior probability the skill is already known. */
  pL0: number;
  /** Probability of learning the skill between two opportunities. */
  pT: number;
  /** Probability of guessing correctly when the skill is not known. */
  pG: number;
  /** Probability of slipping when the skill is known. */
  pS: number;
};

export const DEFAULT_BKT: BktParams = {
  pL0: 0.15,
  pT: 0.12,
  pG: 0.25,
  pS: 0.1,
};

export const MASTERY_THRESHOLD = 0.95;
export const MASTERY_MIN_ATTEMPTS = 5;

export type MasteryStatus = "NOT_STARTED" | "IN_PROGRESS" | "MASTERED";

export function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0.5;
  return Math.min(0.999, Math.max(0.001, value));
}

/**
 * One Bayesian Knowledge Tracing update.
 * Returns the probability the skill is known at the next opportunity,
 * after incorporating the observation and a chance of learning.
 */
export function bktUpdate(
  pKnown: number,
  correct: boolean,
  params: BktParams = DEFAULT_BKT,
): number {
  const pL = clamp01(pKnown);
  const pObsGivenKnown = correct ? 1 - params.pS : params.pS;
  const pObsGivenUnknown = correct ? params.pG : 1 - params.pG;
  const numer = pL * pObsGivenKnown;
  const denom = numer + (1 - pL) * pObsGivenUnknown;
  const posterior = denom === 0 ? pL : numer / denom;
  const withLearning = posterior + (1 - posterior) * params.pT;
  return clamp01(withLearning);
}

export function bktReplay(
  outcomes: boolean[],
  params: BktParams = DEFAULT_BKT,
): number {
  return outcomes.reduce((p, correct) => bktUpdate(p, correct, params), params.pL0);
}

export function statusFor(pMastery: number, attempts: number): MasteryStatus {
  if (attempts <= 0) return "NOT_STARTED";
  if (pMastery >= MASTERY_THRESHOLD && attempts >= MASTERY_MIN_ATTEMPTS) {
    return "MASTERED";
  }
  return "IN_PROGRESS";
}
