import { FileDown, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/components/demo-provider";
import { LevelBars, PracticeCalendar, ThenNow } from "@/components/progress-charts";
import { domains } from "@/lib/demo-data";
import { calendarStats, childGrade, practiceCalendar, progressFor, summarySentence, type Child } from "@/lib/progress-data";

/** Evaluation portfolio: the same visuals as the Progress page, laid out for print. */
export function PortfolioView() {
  const { state } = useDemo();
  const child = state.child as Child;
  const [printView, setPrintView] = useState(false);
  const p = progressFor(child, state.lesson);
  const days = practiceCalendar(child, state.settings.slots, state.minutesToday);
  const stats = calendarStats(days);
  const startSkills = p.rows.flatMap((r) => r.statuses.map((s, i) => ({ s, name: domains[r.index]!.skills[i]! }))).filter((x) => x.s === "Mastered" && !p.masteries.some((m) => m.skill === x.name));
  return (
    <section aria-labelledby="portfolio-title" className="progress-section progress-print">
      <div className="no-print flex flex-wrap justify-between items-start gap-4 mb-6">
        <div><h2 id="portfolio-title" className="text-2xl font-bold">Evaluation portfolio</h2><p className="text-sm text-muted-foreground mt-2">The same charts, laid out for your evaluator. Black-and-white friendly.</p></div>
        <Button onClick={() => setPrintView(true)}><FileDown />Export PDF</Button>
      </div>
      {printView && (
        <div className="approval-banner print-banner mb-6 no-print" role="status">
          <p className="text-sm">Print-ready report. Choose “Save as PDF” in your print window.</p>
          <div className="flex gap-2"><Button onClick={() => window.print()}><FileDown />Print / Save PDF</Button><Button variant="ghost" onClick={() => setPrintView(false)}>Close</Button></div>
        </div>
      )}
      <article className="print-report panel max-w-3xl">
        <div className="flex justify-between gap-4 border-b pb-6">
          <div>
            <p className="eyebrow text-primary">K-5 Tutor · Home education</p>
            <h2 className="text-3xl font-bold mt-3">Math learning portfolio</h2>
            <p className="text-sm text-muted-foreground mt-3">{child} · Grade {childGrade[child]} · Parent educator: Maria · Oct 12 – Nov 19, 2026</p>
            <p className="font-semibold mt-3">{summarySentence(child, state.lesson, false)}</p>
          </div>
        </div>
        <section className="py-6 border-b"><h3 className="text-lg font-bold mb-3">Level in each area</h3><LevelBars rows={p.sorted} grade={childGrade[child]} /><p className="text-xs text-muted-foreground mt-2">Based on K-5 Tutor’s skill map, not a standardized test score.</p></section>
        <section className="py-6 border-b"><h3 className="text-lg font-bold mb-3">Then and now</h3><ThenNow rows={p.rows} /></section>
        <section className="py-6 border-b">
          <h3 className="text-lg font-bold mb-3">Skills mastered · {p.totalMastered} in total</h3>
          <div className="grid sm:grid-cols-2 gap-2 text-sm">
            {p.masteries.map((m) => <p className="flex gap-2 items-center" key={m.skill}><ShieldCheck size={15} className="text-leaf" />{m.skill} · <strong>{m.date}, 2026</strong></p>)}
            {startSkills.map((x) => <p className="flex gap-2 items-center text-muted-foreground" key={x.name}><ShieldCheck size={15} />{x.name} · starting check, Oct 12</p>)}
          </div>
        </section>
        <section className="py-6 border-b"><h3 className="text-lg font-bold mb-3">Practice calendar · {stats.pastDone} of {stats.pastPlanned} planned days</h3><PracticeCalendar days={days} limit={state.settings.minutes} /></section>
        <section className="py-6 border-b">
          <h3 className="text-lg font-bold mb-4">Work samples</h3>
          <table className="report-table">
            <thead><tr><th>Problem</th><th>{child}’s answer</th><th>Date</th></tr></thead>
            <tbody>{p.masteries.map((m) => <tr key={m.skill}><td>{m.problem}</td><td>{m.answer} (correct)</td><td>{m.date}</td></tr>)}</tbody>
          </table>
          {child === "Leo" && state.lesson.checkScore !== null && <p className="text-sm mt-4">{state.lesson.skill}: Check {state.lesson.checkScore}/5 · {state.lesson.checkDate}{state.lesson.reviewScore !== null ? ` · Review ${state.lesson.reviewScore}/3 · ${state.lesson.reviewDate}` : ""}{state.lesson.retaught ? " · re-taught with a new example" : ""}</p>}
        </section>
        <div className="bg-muted p-4 rounded text-xs text-muted-foreground leading-6 mt-6">
          Designed to support Florida’s annual home education evaluation (s. 1002.41). Confirm with your evaluator.<br />Fictional demonstration records. This is not a formal educational assessment.
        </div>
      </article>
    </section>
  );
}


