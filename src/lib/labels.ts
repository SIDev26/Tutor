export function statusLabel(status: string, inferred = false): string {
  if (status === "MASTERED" && inferred) return "Placed by diagnostic";
  if (status === "MASTERED") return "Mastered";
  if (status === "IN_PROGRESS") return "In progress";
  return "Not started";
}

export function confidencePercent(pMastery: number): number {
  return Math.round(pMastery * 100);
}

export function formatMinutes(totalSeconds: number): number {
  return Math.max(0, Math.round(totalSeconds / 60));
}

export function formatWhen(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function clock(seconds: number): string {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const rest = safe % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}
