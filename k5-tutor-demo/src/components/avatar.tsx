import type { AvatarConfig } from "@/lib/lesson-data";

export function Avatar({
  config,
  size = 48,
  className = "",
  label,
}: {
  config: AvatarConfig;
  size?: number;
  className?: string;
  label?: string;
}) {
  return (
    <svg
      className={`avatar avatar-color-${config.color} avatar-skin-${config.skin} ${className}`}
      style={{ width: size, height: size }}
      viewBox="0 0 72 72"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <circle className="avatar-background" cx="36" cy="36" r="35" />
      <path className="avatar-shirt" d="M12 72 Q14 53 36 52 Q58 53 60 72 Z" />
      {config.hair === "puffs" && (
        <>
          <circle className="avatar-hair" cx="19" cy="20" r="11" />
          <circle className="avatar-hair" cx="53" cy="20" r="11" />
        </>
      )}
      {config.face === "round" && <circle className="avatar-face" cx="36" cy="34" r="23" />}
      {config.face === "oval" && <ellipse className="avatar-face" cx="36" cy="34" rx="20" ry="25" />}
      {config.face === "square" && (
        <rect className="avatar-face" x="15" y="11" width="42" height="47" rx="15" />
      )}
      {config.hair === "short" && (
        <path className="avatar-hair" d="M14 30 Q12 7 36 8 Q60 7 58 30 Q48 17 35 20 Q25 15 14 30 Z" />
      )}
      {config.hair === "curly" && (
        <>
          {[
            [18, 22],
            [23, 13],
            [34, 10],
            [46, 12],
            [54, 21],
          ].map(([cx, cy]) => (
            <circle className="avatar-hair" key={`${cx}-${cy}`} cx={cx} cy={cy} r="10" />
          ))}
        </>
      )}
      {config.hair === "puffs" && <path className="avatar-hair" d="M17 26 Q20 9 36 11 Q52 9 55 26 Q37 15 17 26 Z" />}
      <circle className="avatar-eye" cx="28" cy="35" r="2" />
      <circle className="avatar-eye" cx="44" cy="35" r="2" />
      <path className="avatar-smile" d="M29 44 Q36 50 43 44" />
      {config.accessory === "glasses" && (
        <g className="avatar-accessory">
          <circle cx="28" cy="35" r="7" />
          <circle cx="44" cy="35" r="7" />
          <path d="M35 35 L37 35 M20 33 L15 31 M52 33 L57 31" />
        </g>
      )}
      {config.accessory === "headband" && (
        <path className="avatar-headband" d="M16 25 Q36 12 56 25" />
      )}
      {config.accessory === "star" && (
        <path className="avatar-star" d="M55 10 L57.5 16 L64 16.5 L59 21 L60.5 27.5 L55 24 L49.5 27.5 L51 21 L46 16.5 L52.5 16 Z" />
      )}
    </svg>
  );
}


