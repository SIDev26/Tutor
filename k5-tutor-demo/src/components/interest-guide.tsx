import { interestOptions, type InterestId } from "@/lib/lesson-data";

export function InterestGuide({
  interest,
  size = 72,
  className = "",
}: {
  interest: InterestId;
  size?: number;
  className?: string;
}) {
  const option = interestOptions.find((item) => item.id === interest) ?? interestOptions[0]!;
  return (
    <svg
      className={`interest-guide guide-${interest} ${className}`}
      style={{ width: size, height: size }}
      viewBox="0 0 80 80"
      role="img"
      aria-label={`${option.guideName}, the original ${option.name} guide`}
    >
      <circle className="guide-background" cx="40" cy="40" r="39" />
      <path className="guide-body" d="M19 75 Q20 54 40 53 Q60 54 61 75 Z" />
      {interest === "space" && <path className="guide-detail" d="M17 34 Q16 8 40 7 Q64 8 63 34 L57 34 Q56 16 40 15 Q24 16 23 34 Z" />}
      {interest === "soccer" && <path className="guide-detail" d="M19 23 L28 11 L40 18 L52 11 L61 23 L53 20 L40 26 L27 20 Z" />}
      {interest === "animals" && <><circle className="guide-detail" cx="21" cy="19" r="10" /><circle className="guide-detail" cx="59" cy="19" r="10" /></>}
      {interest === "dinosaurs" && <path className="guide-detail" d="M18 27 L14 10 L29 20 L35 5 L44 20 L58 8 L59 29 Z" />}
      {interest === "cooking" && <path className="guide-detail" d="M18 26 Q9 13 24 11 Q29 0 40 9 Q53 1 57 13 Q72 18 60 28 Z" />}
      {interest === "music" && <path className="guide-detail" d="M22 23 Q38 2 58 18 L58 30 L51 30 L51 20 Q37 12 28 29 L22 29 Z M58 18 L66 18 L66 42" />}
      {interest === "building" && <><rect className="guide-detail" x="15" y="13" width="50" height="17" rx="5" /><path className="guide-detail" d="M40 13 L40 3 M35 3 L45 3" /></>}
      {interest === "ocean" && <path className="guide-detail" d="M14 26 Q22 8 34 20 Q43 1 51 19 Q66 9 66 29 Q51 20 40 27 Q27 18 14 26 Z" />}
      {interest === "art" && <path className="guide-detail" d="M15 25 Q24 2 52 10 L64 23 Q42 15 15 25 Z M53 10 L62 4" />}
      {interest === "castles" && <path className="guide-detail" d="M17 27 L17 9 L26 14 L32 5 L40 14 L48 5 L54 14 L63 9 L63 27 Z" />}
      {interest === "cars" && <path className="guide-detail" d="M14 28 L20 12 L29 12 L33 4 L47 4 L51 12 L60 12 L66 28 Z" />}
      <rect className="guide-face" x="19" y="20" width="42" height="40" rx={interest === "building" ? 8 : 19} />
      <circle className="guide-eye" cx="32" cy="38" r="2.3" />
      <circle className="guide-eye" cx="48" cy="38" r="2.3" />
      <path className="guide-smile" d="M33 47 Q40 53 47 47" />
      {interest === "space" && <path className="guide-symbol" d="M40 29 L42 34 L47 34 L43 38 L44 43 L40 40 L36 43 L37 38 L33 34 L38 34 Z" />}
      {interest === "soccer" && <path className="guide-symbol" d="M36 29 L44 29 L48 36 L44 43 L36 43 L32 36 Z" />}
    </svg>
  );
}


