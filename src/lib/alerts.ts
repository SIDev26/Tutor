export type AttemptPoint = {
  correct: boolean;
  pMasteryBefore: number;
  pMasteryAfter: number;
};

/**
 * A skill is stalling when the last six tries are mostly misses
 * and mastery barely moved.
 */
export function isStalling(recent: AttemptPoint[]): boolean {
  if (recent.length < 6) return false;
  const window = recent.slice(-6);
  const accuracy = window.filter((item) => item.correct).length / window.length;
  const gain =
    window[window.length - 1]!.pMasteryAfter - window[0]!.pMasteryBefore;
  return accuracy <= 0.5 && gain < 0.08;
}

export type AlertDraft = {
  type: "STALL" | "READY";
  skillId: string;
  message: string;
};

export function stallAlert(nickname: string, skillTitle: string, skillId: string): AlertDraft {
  return {
    type: "STALL",
    skillId,
    message: `${nickname} is stuck on ${skillTitle}. Recent tries are mostly misses, and the skill is not getting steadier. A shorter focus, or a return to the skill just before it, may help.`,
  };
}

export function readyAlert(nickname: string, skillTitle: string, skillId: string): AlertDraft {
  return {
    type: "READY",
    skillId,
    message: `${nickname} is ready for ${skillTitle}. The skills that come before it are in place.`,
  };
}

export function masteredAlert(nickname: string, skillTitle: string, skillId: string): AlertDraft {
  return {
    type: "READY",
    skillId,
    message: `${nickname} mastered ${skillTitle}. It will come back as a short review.`,
  };
}
