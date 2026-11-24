import { useEffect, useId, useState } from "react";
import { CheckCircle2, Circle, CircleDashed, MapPin, Sprout, Star, TrendingUp } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { SkillStatus } from "@/lib/demo-data";
import {
  EXPECTED_ZONE, LEVEL_MAX, WEEK_LABELS, evidenceFor,
  type CalendarDay, type Child, type DomainRow, type Level,
} from "@/lib/progress-data";
import type { LessonProgress } from "@/lib/lesson-data";

/** Draw-in animation plays only the first time charts appear in this browser session. */
let drawnOnce = false;
export function useFirstDraw() {
  const [animate] = useState(() => !drawnOnce);
  useEffect(() => { drawnOnce = true; }, []);
  return animate ? "chart-draw" : "";
}

const W = 320;
const x = (v: number) => (Math.max(0, Math.min(LEVEL_MAX, v)) / LEVEL_MAX) * W;
const levelColor: Record<Level, string> = { "Catching up": "var(--amber)", "On track": "var(--primary)", Ahead: "var(--leaf)" };
const levelIcon = { "Catching up": TrendingUp, "On track": CheckCircle2, Ahead: Star } as const;

export function LevelChip({ level }: { level: Level }) {
  const Icon = levelIcon[level];
  const cls = level === "Catching up" ? "level-catching" : level === "Ahead" ? "level-ahead" : "level-on";
  return <span className={`level-chip ${cls}`}><Icon size={13} aria-hidden />{level}</span>;
}

function ZonePattern({ id }: { id: string }) {
  return (
    <defs>
      <pattern id={id} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="6" height="6" fill="var(--blue-soft)" />
        <line x1="0" y1="0" x2="0" y2="6" stroke="var(--primary)" strokeOpacity="0.35" strokeWidth="2" data-print-ink />
      </pattern>
    </defs>
  );
}

export function LevelBars({ rows, grade, onPick, useThen = false }: { rows: DomainRow[]; grade: number; onPick?: (r: DomainRow) => void; useThen?: boolean }) {
  const pid = useId().replace(/:/g, "");
  const draw = useFirstDraw();
  return (
    <div className={draw}>
      <ul className="space-y-1">
        {rows.map((r) => {
          const pos = useThen ? r.then : r.now;
          const level = useThen ? r.thenLevel : r.level;
          return (
            <li key={r.name}>
              <button type="button" className="chart-row" onClick={() => onPick?.(r)} aria-label={`${r.name}: ${level}. Open evidence.`}>
                <span className="flex flex-wrap justify-between items-center gap-2 mb-2"><span className="font-semibold text-sm">{r.name}</span><LevelChip level={level} /></span>
                <svg viewBox={`-8 0 ${W + 16} 30`} className="chart-svg" aria-hidden>
                  <ZonePattern id={`${pid}z`} />
                  <rect x="0" y="10" width={W} height="10" rx="5" fill="var(--muted)" />
                  <rect x={x(EXPECTED_ZONE.from)} y="6" width={x(EXPECTED_ZONE.to) - x(EXPECTED_ZONE.from)} height="18" rx="4" fill={`url(#${pid}z)`} stroke="var(--primary)" strokeOpacity="0.5" strokeDasharray="3 2" data-print-ink />
                  <rect className="draw-bar" x="0" y="12" width={Math.max(x(pos), 6)} height="6" rx="3" fill={levelColor[level]} opacity="0.85" />
                  <g className="draw-pop" style={{ transformOrigin: `${x(pos)}px 15px` }}>
                    <circle cx={x(pos)} cy="15" r="8" fill="var(--background)" stroke={levelColor[level]} strokeWidth="3" data-print-ink />
                    <circle cx={x(pos)} cy="15" r="3" fill={levelColor[level]} />
                  </g>
                </svg>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="flex justify-between text-xs text-muted-foreground px-2 mt-1"><span>Start of grade {grade}</span><span>End of grade {grade}</span></div>
      <div className="legend-row mt-3 px-2">
        <span><svg width="22" height="12" aria-hidden><ZonePattern id={`${pid}l`} /><rect x="1" y="1" width="20" height="10" rx="3" fill={`url(#${pid}l)`} stroke="var(--primary)" strokeOpacity="0.5" strokeDasharray="3 2" /></svg>Where grade {grade} expects a child by November</span>
        <span><svg width="14" height="14" aria-hidden><circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" strokeWidth="2.5" /></svg>Where {useThen ? "they started" : "they are now"}</span>
      </div>
    </div>
  );
}

export function ThenNow({ rows, onPick }: { rows: DomainRow[]; onPick?: (r: DomainRow) => void }) {
  const draw = useFirstDraw();
  const id = useId().replace(/:/g, "");
  return (
    <div className={draw}>
      <svg width="0" height="0" aria-hidden className="absolute"><defs><marker id={`${id}a`} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="10" markerHeight="10" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 10 5 0 10z" fill="var(--leaf)" /></marker></defs></svg>
      <ul className="space-y-1">
        {rows.map((r) => {
          const moved = r.now - r.then;
          return (
            <li key={r.name}>
              <button type="button" className="chart-row" onClick={() => onPick?.(r)} aria-label={`${r.name}: moved from ${r.thenLevel} to ${r.level}. Open evidence.`}>
                <span className="flex flex-wrap justify-between gap-2 text-sm mb-1"><span className="font-semibold">{r.name}</span><span className="text-xs text-muted-foreground">{r.thenLevel === r.level ? r.level : `${r.thenLevel} → ${r.level}`}</span></span>
                <svg viewBox={`-10 0 ${W + 20} 26`} className="chart-svg" aria-hidden>
                  <line x1="0" x2={W} y1="13" y2="13" stroke="var(--border)" strokeWidth="2" />
                  <rect x={x(EXPECTED_ZONE.from)} y="7" width={x(EXPECTED_ZONE.to) - x(EXPECTED_ZONE.from)} height="12" rx="3" fill="var(--blue-soft)" stroke="var(--primary)" strokeOpacity="0.4" strokeDasharray="3 2" />
                  {moved > 0 && <line className="draw-line" pathLength={1} x1={x(r.then)} x2={x(r.now) - 9} y1="13" y2="13" stroke="var(--leaf)" strokeWidth={moved >= 1.25 ? 4 : 2.5} markerEnd={`url(#${id}a)`} data-print-ink />}
                  <circle cx={x(r.then)} cy="13" r="6" fill="var(--background)" stroke="var(--muted-foreground)" strokeWidth="2.5" strokeDasharray="2 2" />
                  <circle className="draw-pop" style={{ transformOrigin: `${x(r.now)}px 13px` }} cx={x(r.now)} cy="13" r="7" fill="var(--leaf)" stroke="var(--background)" strokeWidth="2" />
                </svg>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="legend-row mt-3 px-2">
        <span><svg width="14" height="14" aria-hidden><circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="2 2" /></svg>Starting check, Oct 12</span>
        <span><svg width="14" height="14" aria-hidden><circle cx="7" cy="7" r="6" fill="var(--leaf)" /></svg>Today</span>
      </div>
    </div>
  );
}

export function MasteredSteps({ weekly }: { weekly: number[] }) {
  const draw = useFirstDraw();
  const lo = Math.min(...weekly) - 1;
  const hi = Math.max(...weekly) + 1;
  const H = 120, top = 18, colW = W / weekly.length;
  const y = (v: number) => top + (1 - (v - lo) / (hi - lo)) * (H - top);
  let d = `M0 ${y(weekly[0]!)}`;
  weekly.forEach((v, i) => { d += ` H${i * colW} V${y(v)} H${(i + 1) * colW}`; });
  return (
    <svg viewBox={`-6 0 ${W + 12} ${H + 26}`} className={`chart-svg ${draw}`} style={{ maxWidth: 460 }} aria-hidden>
      <line x1="0" x2={W} y1={H} y2={H} stroke="var(--border)" />
      <path className="draw-line" pathLength={1} d={d} fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinejoin="round" data-print-ink />
      {weekly.map((v, i) => (
        <g key={i}>
          <text x={(i + 0.5) * colW} y={y(v) - 6} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--foreground)">{v}</text>
          <text x={(i + 0.5) * colW} y={H + 16} textAnchor="middle" fontSize="10" fill="var(--muted-foreground)">{WEEK_LABELS[i]}</text>
        </g>
      ))}
    </svg>
  );
}

export function SkillTrail({ skills, statuses, onPick }: { skills: string[]; statuses: SkillStatus[]; onPick?: (skill: string, status: SkillStatus) => void }) {
  const here = statuses.findIndex((s) => s !== "Mastered");
  return (
    <div className="skill-trail">
      <div className="trail-line" aria-hidden />
      {skills.map((skill, i) => {
        const st = statuses[i] === "Mastered" ? "Mastered" : i === here ? "Learning now" : "Up next";
        const Icon = st === "Mastered" ? CheckCircle2 : st === "Learning now" ? Sprout : CircleDashed;
        const color = st === "Mastered" ? "text-leaf" : st === "Learning now" ? "text-primary" : "text-muted-foreground";
        return (
          <button type="button" key={skill} className="trail-stop" onClick={() => onPick?.(skill, statuses[i]!)} aria-label={`${skill}: ${st}${i === here ? ", you are here" : ""}. Open evidence.`}>
            <span className={`trail-dot ${color}`}><Icon size={20} aria-hidden /></span>
            {i === here ? <span className="here-tag"><MapPin size={10} className="inline -mt-0.5" aria-hidden /> You are here</span> : <span className={`text-[0.7rem] font-semibold ${color}`}>{st}</span>}
            <span className="font-medium">{skill}</span>
          </button>
        );
      })}
    </div>
  );
}

export function PracticeCalendar({ days, limit }: { days: CalendarDay[]; limit: number }) {
  const draw = useFirstDraw();
  const pid = useId().replace(/:/g, "");
  const C = 42, G = 4;
  return (
    <div className={draw}>
      <svg viewBox={`0 0 ${7 * (C + G)} ${6 * (C + G) + 18}`} className="chart-svg" style={{ maxWidth: 420 }} aria-hidden>
        <defs><pattern id={`${pid}o`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="var(--muted)" /><line x1="0" y1="0" x2="0" y2="6" stroke="var(--border)" strokeWidth="2" /></pattern></defs>
        {["M", "T", "W", "T", "F", "S", "S"].map((l, i) => <text key={i} x={i * (C + G) + C / 2} y="11" textAnchor="middle" fontSize="10" fill="var(--muted-foreground)">{l}</text>)}
        {days.map((d, i) => {
          const cx = (i % 7) * (C + G), cy = 18 + Math.floor(i / 7) * (C + G);
          const fill = d.minutes ? Math.min(1, d.minutes / limit) : 0;
          return (
            <g key={d.date}>
              <rect x={cx} y={cy} width={C} height={C} rx="7" fill={d.kind === "off" ? `url(#${pid}o)` : "var(--background)"} stroke={d.kind === "today" ? "var(--primary)" : "var(--border)"} strokeWidth={d.kind === "today" ? 2.5 : 1} strokeDasharray={d.kind === "missed" ? "3 3" : undefined} data-print-ink />
              {fill > 0 && <rect className="draw-bar" style={{ transformOrigin: "bottom", transformBox: "fill-box" }} x={cx + 3} y={cy + C - 3 - (C - 18) * fill} width={C - 6} height={(C - 18) * fill} rx="4" fill="var(--leaf)" opacity="0.8" />}
              <text x={cx + 5} y={cy + 12} fontSize="9" fill="var(--muted-foreground)">{d.date.split(" ")[1]}</text>
              {d.minutes ? <text x={cx + C / 2} y={cy + C - 8} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--foreground)">{d.minutes}</text> : null}
              {d.kind === "off" && <text x={cx + C / 2} y={cy + C - 9} textAnchor="middle" fontSize="9" fill="var(--muted-foreground)">off</text>}
            </g>
          );
        })}
      </svg>
      <div className="legend-row mt-3">
        <span><svg width="14" height="14" aria-hidden><rect x="1" y="4" width="12" height="9" rx="2" fill="var(--leaf)" opacity=".8" /></svg>Minutes done (full = {limit} min)</span>
        <span><svg width="14" height="14" aria-hidden><rect x="1" y="1" width="12" height="12" rx="2" fill="none" stroke="currentColor" strokeDasharray="3 2" /></svg>No session</span>
        <span><svg width="14" height="14" aria-hidden><rect x="1" y="1" width="12" height="12" rx="2" fill="var(--muted)" stroke="currentColor" strokeOpacity=".4" /></svg>Off day (outside your time slots)</span>
        <span><Circle size={12} className="text-primary" aria-hidden />Today</span>
      </div>
    </div>
  );
}

export type PickedSkill = { name: string; domain: string; status: SkillStatus };
export function EvidenceSheet({ child, picked, lesson, onClose }: { child: Child; picked: PickedSkill | null; lesson: LessonProgress; onClose: () => void }) {
  const ev = picked ? evidenceFor(child, picked.name, picked.status, lesson) : null;
  return (
    <Sheet open={!!picked} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent className="overflow-y-auto p-7">
        <SheetHeader>
          <SheetDescription>{picked?.domain}</SheetDescription>
          <SheetTitle className="text-2xl leading-snug">{picked?.name}</SheetTitle>
        </SheetHeader>
        {ev && picked && (
          <div className="mt-5">
            <span className={`status ${picked.status === "Mastered" ? "status-mastered" : picked.status === "Practicing" ? "status-practicing" : picked.status === "Needs teaching" ? "status-needs" : "status-not"}`}>{picked.status}</span>
            <h3 className="font-bold mt-8 mb-3">Evidence</h3>
            <dl className="evidence-list text-sm space-y-3">
              {([["Lesson watched", ev.watched], ["Practice accuracy", ev.practice], ["Check result", ev.check], ["Review result", ev.review]] as const).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b pb-3"><dt className="text-muted-foreground">{k}</dt><dd className="font-semibold text-right">{v}</dd></div>
              ))}
            </dl>
            <p className="text-xs text-muted-foreground mt-6 leading-6">Mastery rule in our pilot: 4 of 5 on the Check, then 3 of 3 on the Review a few days later. K-5 Tutor schedules the next step automatically.</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

export function CanNowCards({ masteries, onPick }: { masteries: { skill: string; date: string; problem: string; answer: string }[]; onPick?: (m: { skill: string; date: string; problem: string; answer: string }) => void }) {
  return (
    <div className="cannow-grid">
      {masteries.map((m) => (
        <button type="button" key={m.skill} className="cannow-card" onClick={() => onPick?.(m)} aria-label={`${m.skill}. Open evidence.`}>
          <span className="flex gap-2 items-center text-leaf text-xs font-bold"><CheckCircle2 size={14} aria-hidden />Mastered {m.date}</span>
          <span className="block font-bold mt-2">{m.skill}</span>
          <span className="block text-sm text-muted-foreground mt-3">{m.problem}</span>
          <span className="block text-sm mt-2">Answered: <strong>{m.answer}</strong></span>
        </button>
      ))}
    </div>
  );
}


