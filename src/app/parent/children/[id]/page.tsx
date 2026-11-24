import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DOMAIN_LABEL, DOMAIN_ORDER } from "@/content/skills";
import { confidencePercent, statusLabel } from "@/lib/labels";
import { readParent } from "@/server/auth";
import { childOverview, latestApprovedPlan } from "@/server/learning";

export const dynamic = "force-dynamic";

function pillClass(status: string, inferred: boolean) {
  if (status === "MASTERED" && inferred) return "pill placed";
  if (status === "MASTERED") return "pill mastered";
  if (status === "IN_PROGRESS") return "pill progress";
  return "pill wait";
}

export default async function ChildPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; approved?: string }>;
}) {
  const parent = await readParent();
  if (!parent) redirect("/login");
  const { id } = await params;
  const query = await searchParams;
  const overview = await childOverview(id);
  if (!overview || overview.child.parentId !== parent.sub) notFound();
  const { child, skills, week } = overview;
  const approved = await latestApprovedPlan(id);
  const accuracy = week.answered ? Math.round((week.correct / week.answered) * 100) : 0;
  const unread = child.alerts.filter((alert) => !alert.readAt);

  return (
    <main className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-wide text-[var(--pine)]">Grade {child.grade}</p>
          <h1 className="font-serif text-5xl">{child.nickname}</h1>
        </div>
        <div className="no-print flex flex-wrap gap-2">
          <Link className="btn-quiet" href={`/parent/children/${id}/plan`}>Plan</Link>
          <Link className="btn-quiet" href={`/parent/children/${id}/report`}>Weekly report</Link>
          <Link className="btn-quiet" href={`/parent/children/${id}/record`}>Portfolio</Link>
        </div>
      </div>

      {query.error && <p className="note">{query.error}</p>}
      {query.approved && <p className="note bg-[var(--good)]">The plan is approved. Practice can start.</p>}

      {unread.length > 0 && (
        <section className="card p-5">
          <h2 className="font-serif text-2xl">Alerts</h2>
          <div className="mt-3 grid gap-3">
            {unread.map((alert) => (
              <form key={alert.id} method="post" action={`/api/children/${id}/alerts`} className="note flex flex-wrap items-start justify-between gap-3">
                <p>{alert.message}</p>
                <input type="hidden" name="alertId" value={alert.id} />
                <button className="btn-quiet" type="submit">Mark read</button>
              </form>
            ))}
          </div>
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
        <article className="card p-5">
          <h2 className="font-serif text-2xl">Last 7 days</h2>
          <p className="mt-2 text-lg">
            {week.answered === 0
              ? "No answered questions yet this week."
              : `${week.minutes} minutes · ${week.answered} questions · ${accuracy}% correct`}
          </p>
          <div className="no-print mt-4 flex flex-wrap gap-2">
            <form method="post" action={`/api/children/${id}/sessions`}>
              <input type="hidden" name="kind" value="DIAGNOSTIC" />
              <button className="btn" type="submit">Start diagnostic</button>
            </form>
            {approved ? (
              <form method="post" action={`/api/children/${id}/sessions`}>
                <input type="hidden" name="kind" value="PRACTICE" />
                <button className="btn-clay" type="submit">Start practice</button>
              </form>
            ) : (
              <Link className="btn-clay" href={`/parent/children/${id}/plan`}>Approve a plan first</Link>
            )}
          </div>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Starting a session locks this browser into child mode until you enter your password.
            Diagnostic is about 10 questions. Practice runs {child.dailyMinutes} minutes.
          </p>
        </article>
        <article className="card p-5">
          <h2 className="font-serif text-2xl">Approved plan</h2>
          {approved ? (
            <ul className="mt-2 grid gap-1">
              {(JSON.parse(approved.skillIds) as string[]).map((skillId) => (
                <li key={skillId}>{skills.find((skill) => skill.id === skillId)?.title ?? skillId}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[var(--muted)]">No plan is approved yet, so practice stays locked.</p>
          )}
          {approved?.parentNote && <p className="mt-3 text-sm text-[var(--muted)]">Your note: {approved.parentNote}</p>}
        </article>
      </section>

      {DOMAIN_ORDER.map((domain) => (
        <section key={domain}>
          <h2 className="font-serif text-2xl">{DOMAIN_LABEL[domain]}</h2>
          <div className="mt-3 grid gap-3">
            {skills.filter((skill) => skill.domain === domain).map((skill) => (
              <article key={skill.id} className="card p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg">{skill.title}</h3>
                    <p className="text-sm text-[var(--muted)]">{skill.id} · Grade {skill.grade}</p>
                  </div>
                  <span className={pillClass(skill.status, skill.inferred)}>{statusLabel(skill.status, skill.inferred)}</span>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="meter flex-1" aria-hidden="true">
                    <span style={{ width: `${confidencePercent(skill.pMastery)}%` }} />
                  </div>
                  <span className="text-sm tabular-nums">{confidencePercent(skill.pMastery)}% confidence</span>
                </div>
                <p className="mt-2 text-sm text-[var(--muted)]">{skill.summary}</p>
                {skill.prereqIds.length > 0 && (
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Needs {skill.prereqIds.map((prereq) => skills.find((item) => item.id === prereq)?.title ?? prereq).join(", ")}.
                  </p>
                )}
                {skill.misconceptions.length > 0 && (
                  <p className="mt-2 text-sm">
                    Recurring mix-ups: {skill.misconceptions.map((item) => `${item.label} (${item.count})`).join("; ")}.
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      ))}

      <section className="card no-print p-5">
        <h2 className="font-serif text-2xl">Session length</h2>
        <form className="mt-3 flex flex-wrap items-end gap-3" method="post" action={`/api/children/${id}`}>
          <input type="hidden" name="intent" value="minutes" />
          <label className="field">
            <span>Daily practice</span>
            <select name="dailyMinutes" defaultValue={String(child.dailyMinutes)}>
              <option value="10">10 minutes</option>
              <option value="15">15 minutes</option>
              <option value="20">20 minutes</option>
            </select>
          </label>
          <button className="btn" type="submit">Save</button>
        </form>
      </section>

      <section className="card no-print p-5">
        <h2 className="font-serif text-2xl">Delete this record</h2>
        <p className="mt-2 text-[var(--muted)]">
          This removes {child.nickname}&apos;s profile, attempts, plans, and alerts. It cannot be undone.
        </p>
        <form className="mt-3 flex flex-wrap items-end gap-3" method="post" action={`/api/children/${id}`}>
          <input type="hidden" name="intent" value="delete" />
          <label className="field">
            <span>Type {child.nickname} to confirm</span>
            <input name="confirm" autoComplete="off" />
          </label>
          <button className="btn-clay" type="submit">Delete child record</button>
        </form>
      </section>
    </main>
  );
}
