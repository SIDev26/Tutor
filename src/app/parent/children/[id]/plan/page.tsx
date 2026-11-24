import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { skillNodes } from "@/content/skills";
import { readParent } from "@/server/auth";
import { childOverview, latestApprovedPlan, toSnapshot } from "@/server/learning";
import { frontierSkills, unmetPrereqs } from "@/lib/selection";
import { statusLabel } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function PlanPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const parent = await readParent();
  if (!parent) redirect("/login");
  const { id } = await params;
  const query = await searchParams;
  const overview = await childOverview(id);
  if (!overview || overview.child.parentId !== parent.sub) notFound();
  const { child, skills } = overview;
  const nodes = skillNodes();
  const states = child.states.map(toSnapshot);
  const stateMap = new Map(states.map((state) => [state.skillId, state]));
  const frontier = new Set(frontierSkills(nodes, stateMap, child.grade));
  const proposed = child.plans.find((plan) => plan.status === "PROPOSED");
  const approved = await latestApprovedPlan(id);
  const selected = new Set<string>(proposed ? (JSON.parse(proposed.skillIds) as string[]) : []);

  return (
    <main>
      <Link className="text-sm text-[var(--muted)]" href={`/parent/children/${id}`}>Back to {child.nickname}</Link>
      <h1 className="mt-2 font-serif text-4xl">Plan for {child.nickname}</h1>
      <p className="mt-2 text-[var(--muted)]">
        Practice follows an approved plan only. You can take skills off, add skills that are ready, or keep a mastered skill on the list for review.
      </p>
      {query.error && <p className="note mt-4">{query.error}</p>}

      {approved && (
        <section className="card mt-4 p-5">
          <h2 className="font-serif text-2xl">Currently in use</h2>
          <ul className="mt-2 list-disc pl-5">
            {(JSON.parse(approved.skillIds) as string[]).map((skillId) => (
              <li key={skillId}>{skills.find((skill) => skill.id === skillId)?.title ?? skillId}</li>
            ))}
          </ul>
          <p className="mt-2 text-sm text-[var(--muted)]">Approving the form below replaces this list.</p>
        </section>
      )}

      <form className="card mt-4 grid gap-4 p-5" method="post" action={`/api/children/${id}/plan`}>
        <p>{proposed?.note ?? "Suggest a plan from the current skill map, then approve it."}</p>
        <div className="grid gap-2">
          {skills.map((skill) => {
            const state = stateMap.get(skill.id);
            const mastered = state?.status === "MASTERED";
            const locked = !mastered && unmetPrereqs(
              nodes.find((node) => node.id === skill.id)!,
              stateMap,
            ).length > 0;
            return (
              <label key={skill.id} className="flex items-start gap-3 rounded-xl border border-[var(--line)] p-3">
                <input
                  type="checkbox"
                  name="skillIds"
                  value={skill.id}
                  defaultChecked={selected.has(skill.id)}
                  disabled={locked}
                />
                <span>
                  <span className="block">{skill.title}</span>
                  <span className="text-sm text-[var(--muted)]">
                    {statusLabel(skill.status, skill.inferred)}
                    {frontier.has(skill.id) ? " · ready now" : ""}
                    {mastered ? " · can be reviewed" : ""}
                    {locked ? " · waiting on an earlier skill" : ""}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
        <label className="field">
          <span>Minutes per day</span>
          <select name="dailyMinutes" defaultValue={String(child.dailyMinutes)}>
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="20">20</option>
          </select>
        </label>
        <label className="field">
          <span>Note to yourself (optional)</span>
          <textarea name="parentNote" rows={3} defaultValue={proposed?.parentNote ?? ""} />
        </label>
        <div className="flex flex-wrap gap-2">
          <button className="btn" type="submit" name="intent" value="approve">Approve plan</button>
          <button className="btn-quiet" type="submit" name="intent" value="propose">Suggest from today&apos;s map</button>
        </div>
      </form>
    </main>
  );
}
