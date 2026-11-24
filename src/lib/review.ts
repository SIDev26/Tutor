/** Days until the next review after a successful review streak of this length. */
export const REVIEW_INTERVALS_DAYS = [1, 3, 7, 16, 35] as const;

export function nextIntervalDays(reviewStreak: number): number {
  const index = Math.min(
    Math.max(reviewStreak, 1),
    REVIEW_INTERVALS_DAYS.length,
  ) - 1;
  return REVIEW_INTERVALS_DAYS[index];
}

export function addDays(from: Date, days: number): Date {
  const next = new Date(from.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function initialReviewDue(from: Date): Date {
  return addDays(from, REVIEW_INTERVALS_DAYS[0]);
}
