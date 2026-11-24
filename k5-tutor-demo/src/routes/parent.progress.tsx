import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { ParentLayout } from "@/components/app-shell";
import { SkillMapView } from "@/components/skill-map-view";
import { PortfolioView } from "@/components/portfolio-view";
import { useDemo } from "@/components/demo-provider";
import { CanNowCards, EvidenceSheet, LevelBars, MasteredSteps, PracticeCalendar, SkillTrail, ThenNow, type PickedSkill } from "@/components/progress-charts";
import { domains } from "@/lib/demo-data";
import { calendarStats, childGrade, plainDomain, practiceCalendar, progressFor, summarySentence, type Child, type DomainRow } from "@/lib/progress-data";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/parent/progress")({
  head: () => pageMeta("Progress at a glance", "See in seconds whether your child is on track, whether it is working, what they can do now, and whether they are doing the work."),
  component: Progress,
});

function Section({ question, takeaway, children }: { question: string; takeaway: string; children: React.ReactNode }) {
  return (
    <section className="progress-section">
      <p className="progress-question">{question}</p>
      <h2 className="progress-takeaway">{takeaway}</h2>
      <div className="mt-5 max-w-2xl">{children}</div>
    </section>
  );
}

function Progress() {
  const { state, update } = useDemo();
  const [dayOne, setDayOne] = useState(false);
  const [picked, setPicked] = useState<PickedSkill | null>(null);
  const child = state.child as Child;
  const p = progressFor(child, state.lesson);
  const grade = childGrade[child];
  const first = p.sorted[0]!;
  const dayOneSorted = [...p.rows].sort((a, b) => a.then - b.then || a.index - b.index);
  const focus = dayOne ? dayOneSorted[0]! : first;
  const pickDomain = (r: DomainRow) => {
    const i = r.statuses.findIndex((s) => s !== "Mastered");
    const s = i === -1 ? r.statuses.length - 1 : i;
    setPicked({ name: domains[r.index]!.skills[s]!, domain: r.name, status: r.statuses[s]! });
  };
  const days = practiceCalendar(child, state.settings.slots, state.minutesToday);
  const stats = calendarStats(days);
  const biggest = [...p.rows].sort((a, b) => b.now - b.then - (a.now - a.then))[0]!;
  const weakWeek = p.weekly.findIndex((v, i) => i > 0 && v === p.weekly[i - 1]);
  const behind = p.sorted.filter((r) => r.level === "Catching up");
  const summary = summarySentence(child, state.lesson, dayOne);
  const trail = dayOne ? focus.statuses.map((_, i) => (i < Math.floor(focus.then) ? "Mastered" : i === Math.floor(focus.then) ? "Practicing" : "Not started") as typeof focus.statuses[number]) : focus.statuses;
  const focusMastered = trail.filter((s) => s === "Mastered").length;
  const learning = trail.findIndex((s) => s !== "Mastered");
  const pronoun = child === "Leo" ? "he" : "she";

  return (
    <ParentLayout>
      <div className="no-print">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
          <div className="day-toggle" role="group" aria-label="Child">
            {(["Leo", "Sofia"] as Child[]).map((c) => <button key={c} type="button" aria-pressed={child === c} onClick={() => update({ child: c })}>{c} · grade {childGrade[c]}</button>)}
          </div>
          <div className="day-toggle" role="group" aria-label="Demo time">
            <button type="button" aria-pressed={dayOne} onClick={() => setDayOne(true)}>Day 1</button>
            <button type="button" aria-pressed={!dayOne} onClick={() => setDayOne(false)}>Week 6</button>
          </div>
        </div>
        <p className="eyebrow text-muted-foreground">{child}’s progress · {dayOne ? "Oct 12, 2026" : "Oct 12 – Nov 19, 2026"}</p>
        <p className="progress-summary mt-3" role="status">{summary}</p>

        <Section question="Is my child where they should be?" takeaway={dayOne
          ? `${plainDomain(focus.name)[0]!.toUpperCase()}${plainDomain(focus.name).slice(1)} is where K-5 Tutor starts. Here is where ${child} began in each area.`
          : behind.length ? `${behind.map((r) => r.name).join(" and ")} need${behind.length === 1 ? "s" : ""} the most attention. The other areas are on track or ahead.` : `${child} is on track or ahead in all six areas.`}>
          <p className="sr-only">{summary}</p>
          <LevelBars rows={dayOne ? dayOneSorted : p.sorted} grade={grade} onPick={pickDomain} useThen={dayOne} />
          <p className="text-xs text-muted-foreground mt-4">Based on K-5 Tutor’s skill map, not a standardized test score.</p>
        </Section>

        <Section question="Is it working?" takeaway={dayOne ? "This is the starting line. Movement will show here after the first week." : `Every area moved forward. ${biggest.name} moved the most.`}>
          {dayOne ? <div className="placeholder-box">Your first week will appear here. Each area will show a line from this starting point to where {child} is now.</div> : <>
            <p className="sr-only">Every area moved forward. {biggest.name} moved the most.</p>
            <ThenNow rows={p.rows} onPick={pickDomain} />
            <h3 className="font-bold mt-8">From {p.weekly[0]} to {p.weekly.at(-1)} skills mastered{weakWeek > 0 ? `, with a slower week of ${WEEKS[weakWeek]}` : ""}.</h3>
            <p className="sr-only">Skills mastered by week: {p.weekly.join(", ")}.</p>
            <div className="mt-3"><MasteredSteps weekly={p.weekly} /></div>
          </>}
        </Section>

        <Section question={`What can ${pronoun} do now?`} takeaway={`In ${plainDomain(focus.name)}, ${child} ${dayOne ? "starts with" : "has mastered"} ${focusMastered} of 4 skills${dayOne ? " mastered" : ""}${learning >= 0 ? ` and ${dayOne ? "begins with" : "is learning"} “${domains[focus.index]!.skills[learning]}”${dayOne ? "" : " now"}` : ""}.`}>
          <SkillTrail skills={domains[focus.index]!.skills} statuses={trail} onPick={(name, status) => setPicked({ name, status, domain: focus.name })} />
          <h3 className="font-bold mt-8 mb-3">{child} can now</h3>
          {dayOne ? <div className="placeholder-box">Your first week will appear here: each new skill with a real problem {child} answered correctly.</div> : <CanNowCards masteries={p.masteries} onPick={(m) => setPicked({ name: m.skill, domain: domains.find((d) => d.skills.includes(m.skill))?.name ?? "", status: "Mastered" })} />}
          <details className="mt-6 group">
            <summary className="cursor-pointer min-h-11 inline-flex items-center gap-2 font-semibold text-primary"><ChevronDown size={16} className="group-open:rotate-180 transition-transform" />See all skills</summary>
            <div className="mt-4"><SkillMapView onPick={setPicked} /></div>
          </details>
        </Section>

        <Section question={`Is ${pronoun} doing the work?`} takeaway={dayOne ? "Practice days will fill in here." : `${child} practiced on ${stats.pastDone} of ${stats.pastPlanned} planned days in 6 weeks.`}>
          {dayOne ? <div className="placeholder-box">Your first week will appear here, day by day, against your {state.settings.minutes}-minute setting. Days outside your time slots show as off days.</div> : <>
            <p className="sr-only">{child} practiced on {stats.pastDone} of {stats.pastPlanned} planned days in 6 weeks.</p>
            <PracticeCalendar days={days} limit={state.settings.minutes} />
            <p className="font-semibold mt-4">{stats.doneWeek} of {stats.plannedWeek} planned days this week{stats.toCome ? ` · ${stats.toCome} still to come` : ""}.</p>
          </>}
        </Section>
        <p className="text-xs text-muted-foreground mt-10 flex gap-2 items-center"><Sparkles size={14} />Fictional demo records. Tap any area, stop, or card to see its evidence.</p>
      </div>
      <EvidenceSheet child={child} picked={picked} lesson={state.lesson} onClose={() => setPicked(null)} />
      <PortfolioView />
    </ParentLayout>
  );
}

const WEEKS = ["Oct 12", "Oct 19", "Oct 26", "Nov 2", "Nov 9", "Nov 16"];


