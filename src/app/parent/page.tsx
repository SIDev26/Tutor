import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db";
import { readParent } from "@/server/auth";
export const dynamic = "force-dynamic";

export default async function HouseholdPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string }>;
}) {
  const parent = await readParent();
  if (!parent) redirect("/login");
  const params = await searchParams;
  const children = await prisma.child.findMany({
    where: { parentId: parent.sub },
    include: { states: true, alerts: { where: { readAt: null } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <main>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-4xl">Household</h1>
          <p className="mt-1 text-[var(--muted)]">Each child has a nickname, a grade, and a skill map. Nothing else is stored about them.</p>
        </div>
        <Link className="btn" href="/parent/children/new">Add a child</Link>
      </div>
      {params.deleted && <p className="note mt-4">That child&apos;s record was deleted.</p>}
      {children.length === 0 ? (
        <section className="card mt-6 p-6">
          <h2 className="font-serif text-2xl">No children yet</h2>
          <p className="mt-2 text-[var(--muted)]">Add a nickname and grade 2, 3, or 4. Then start the diagnostic.</p>
        </section>
      ) : (
        <div className="mt-6 grid gap-4">
          {children.map((child) => {
            const mastered = child.states.filter((state) => state.status === "MASTERED").length;
            const progress = child.states.filter((state) => state.status === "IN_PROGRESS").length;
            return (
              <article key={child.id} className="card flex flex-wrap items-center justify-between gap-4 p-5">
                <div>
                  <h2 className="font-serif text-3xl">
                    <Link href={`/parent/children/${child.id}`}>{child.nickname}</Link>
                  </h2>
                  <p className="text-[var(--muted)]">Grade {child.grade} · {child.dailyMinutes} min sessions</p>
                  <p className="mt-2 flex flex-wrap gap-2">
                    <span className="pill mastered">{mastered} mastered</span>
                    <span className="pill progress">{progress} in progress</span>
                    {child.alerts.length > 0 && <span className="pill">{child.alerts.length} alert{child.alerts.length === 1 ? "" : "s"}</span>}
                  </p>
                </div>
                <Link className="btn" href={`/parent/children/${child.id}`}>Open map</Link>
              </article>
            );
          })}
        </div>
      )}
      <p className="mt-8 text-sm text-[var(--muted)]">
        Beacon keeps this record on your account. It is not sent to an analytics service.
      </p>
    </main>
  );
}
