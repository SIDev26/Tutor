import { homeInsight } from "@/lib/interest-content";
import { interestOptions } from "@/lib/lesson-data";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { CalendarDays, Check, Clock3, Lightbulb, Moon, RefreshCw, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/avatar";
import { LessonProgress } from "@/components/lesson-progress";
import { ParentLayout, PageHeading } from "@/components/app-shell";
import { demoDateLabel, useDemo } from "@/components/demo-provider";
import { FULL_LESSON_SKILL } from "@/lib/lesson-data";
import { buildWeekPlan, openDayCount } from "@/lib/schedule";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/parent/")({
  head: () =>
    pageMeta(
      "How is my child doing?",
      "This week’s time, what your child learned, what comes next, and the latest Check result. No action needed.",
    ),
  component: ParentHome,
});

function ParentHome() {
  const { state, update } = useDemo();
  const leo = state.child === "Leo";
  const lesson = state.lesson;
  const plan = useMemo(
    () => buildWeekPlan(state.settings, { child: state.child, checkScore: leo ? lesson.checkScore : 4, reviewScore: leo ? lesson.reviewScore : 3 }),
    [state.settings, state.child, leo, lesson.checkScore, lesson.reviewScore],
  );
  const planned = state.settings.minutes * Math.min(5, openDayCount(state.settings.slots));
  const done = leo ? state.weekMinutes : 38;
  const showTip = leo && !state.tipDismissed && lesson.reviewScore !== 3;

  return (
    <ParentLayout>
      <PageHeading title="Good afternoon, Maria." subtitle={`How ${state.child} is doing in math · ${demoDateLabel(state.today)}`}>
        <select className="form-control w-40" aria-label="Switch child" value={state.child} onChange={(e) => update({ child: e.target.value as "Leo" | "Sofia" })}>
          <option value="Leo">Leo · Grade 3</option>
          <option value="Sofia">Sofia · Grade 2</option>
        </select>
      </PageHeading>
      {homeInsight(state.profiles[state.child], state.child, Object.fromEntries(interestOptions.map((o) => [o.id, o.name]))) && <p className="story-line mb-6">{homeInsight(state.profiles[state.child], state.child, Object.fromEntries(interestOptions.map((o) => [o.id, o.name])))}</p>}

      {state.paused && (
        <p className="bg-coral-soft rounded-md p-4 text-sm mb-6 flex gap-2 items-center" role="status"><Moon size={16} className="text-coral" />Paused. Child activity is stopped until you switch it back on in Settings.</p>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <section className="panel">
          <p className="eyebrow text-primary"><Clock3 size={14} />This week</p>
          <p className="text-4xl font-bold font-display mt-3">{done}<span className="text-lg text-muted-foreground"> of {planned} min</span></p>
          <div className="progress-track mt-4"><progress max={planned || 1} value={Math.min(done, planned)} /></div>
          <p className="text-xs text-muted-foreground mt-3">{state.settings.minutes} minutes a day · {openDayCount(state.settings.slots)} days allowed</p>
        </section>
        <section className="panel">
          <p className="eyebrow text-primary"><Check size={14} />Latest Check</p>
          {leo && lesson.checkScore !== null ? (
            <>
              <p className="text-4xl font-bold font-display mt-3">{lesson.checkScore}/5<span className="text-lg text-muted-foreground"> · unit fractions</span></p>
              <p className="text-sm text-muted-foreground mt-3 leading-6">
                {lesson.checkScore < 4
                  ? "Below 4/5, so K-5 Tutor is re-teaching it with a new example."
                  : lesson.reviewScore === 3 && (lesson.checkPlainCorrect ?? 1) >= 1
                    ? "Mastered: 4/5 or better with a plain problem right, then 3/3 on the Review warm-up."
                    : lesson.reviewScore === 3
                    ? "Still practicing: both plain problems were missed, so mastery waits for a plain problem right."
                    : lesson.reviewScore !== null
                      ? `Review warm-up ${lesson.reviewScore}/3. Still practicing.`
                      : "Practicing. A short Review warm-up comes in three days."}
              </p>
              <p className="text-sm mt-2">In favorite topics: {lesson.checkScore - (lesson.checkPlainCorrect ?? 0)} of 3 · In plain problems: {lesson.checkPlainCorrect ?? 0} of 2</p>
            </>
          ) : leo ? (
            <p className="text-sm text-muted-foreground mt-3 leading-6">No Check yet. The first one comes right after {state.child}’s first lesson.</p>
          ) : (
            <><p className="text-4xl font-bold font-display mt-3">5/5<span className="text-lg text-muted-foreground"> · adding within 100</span></p><p className="text-sm text-muted-foreground mt-3">Nov 17 · Practicing, Review warm-up passed.</p></>
          )}
        </section>
      </div>

      <section className="panel current-lesson-panel mb-6">
        <div className="flex gap-4 items-center mb-5">
          <Avatar config={state.avatars[state.child]} size={58} />
          <div>
            <p className="eyebrow text-primary">What {state.child} is learning</p>
            <h2 className="text-xl font-bold mt-2">{leo ? FULL_LESSON_SKILL : "Add within 100"}</h2>
            {leo && lesson.retaught && lesson.reviewScore !== 3 && <p className="text-xs text-muted-foreground mt-2 flex gap-1 items-center"><RefreshCw size={12} />Re-taught automatically with a different example.</p>}
          </div>
        </div>
        {leo && <LessonProgress stage={lesson.stage} />}
        <div className="mt-5 text-sm space-y-2">
          <p><span className="font-semibold text-leaf">Learned recently:</span> multiplying by 2, 5, and 10; reading picture graphs.</p>
          <p><span className="font-semibold text-primary">Up next:</span> {plan.items[0]?.title ?? "Nothing scheduled. Allow at least one day in Settings."}</p>
        </div>
      </section>

      {showTip && (
        <details className="panel mb-6 tip-card">
          <summary className="flex justify-between items-center gap-3 cursor-pointer">
            <span className="flex gap-2 items-center font-semibold"><Lightbulb size={18} className="text-coral" />Want to help? A 2-minute tip.</span>
            <Button variant="ghost" size="icon" aria-label="Dismiss tip" onClick={(e) => { e.preventDefault(); update({ tipDismissed: true }); }}><X /></Button>
          </summary>
          <ol className="text-sm leading-7 mt-3 list-decimal pl-5">
            <li>Fold two same-sized paper strips into 4 and 8 equal parts.</li>
            <li>Shade one part of each and ask which takes more space.</li>
            <li>Say: “Same whole. More pieces means each piece is smaller.”</li>
          </ol>
          <p className="text-xs text-muted-foreground mt-3">Optional. K-5 Tutor already re-teaches this on its own.</p>
        </details>
      )}

      <section className="panel mb-6" aria-labelledby="week-title">
        <div className="flex flex-wrap justify-between gap-3 items-center">
          <h2 id="week-title" className="text-lg font-bold flex gap-2 items-center"><CalendarDays size={18} className="text-primary" />This week’s plan</h2>
          <span className="text-xs text-muted-foreground">Built automatically from {state.child}’s results and your time settings</span>
        </div>
        {plan.change && leo && <p className="bg-blue-soft rounded-md p-3 text-sm mt-4" role="status"><strong>Changed:</strong> {plan.change}</p>}
        <ul className="mt-4 divide-y">
          {plan.items.map((item) => (
            <li key={item.day} className="py-3 grid sm:grid-cols-[110px_1fr_auto] gap-1 sm:gap-4">
              <span className="text-sm font-semibold">{item.day}</span>
              <span><span className="text-sm font-medium block">{item.title}</span><small className="text-muted-foreground block">{item.reason}</small>{/Learn/.test(item.title) && <small className="text-primary font-semibold">Animated lesson, about 3 minutes</small>}</span>
              <span className="text-xs text-muted-foreground">{item.minutes} min</span>
            </li>
          ))}
        </ul>
        {plan.items.length === 0 && <p className="text-sm text-muted-foreground mt-4">No days allowed yet. Add time slots in Settings.</p>}
      </section>

      <details className="demo-guide mb-6">
        <summary>Guided interview path · landing page to Review warm-up</summary>
        <ol>
          <li><Link to="/">Landing page</Link> → “Start the free check” → one sign-up screen with consent → accept the default time → Start.</li>
          <li>Leo taps an avatar and interests, then Start, and answers the 10-question diagnostic.</li>
          <li><Link to="/child">Child view</Link>: Start → Learn, Practice, Check. Get a question wrong twice to see automatic re-teaching.</li>
          <li>Use “Skip ahead 3 days” and Start again: the Review warm-up appears on its own.</li>
          <li>Back here: plan changes and the Check result appear without any action. See <Link to="/parent/progress">Progress</Link>; try Pause and time slots in <Link to="/parent/settings">Settings</Link>.</li>
        </ol>
      </details>
      <p className="text-xs text-muted-foreground flex gap-2 items-center"><Sparkles size={13} />Pre-written demo plan and results. Nothing here needs your action. <Link to="/parent/how-we-teach" className="underline">How we teach</Link></p>
    </ParentLayout>
  );
}


