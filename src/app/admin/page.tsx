import { redirect } from "next/navigation";
import { prisma } from "@/server/db";
import { readParent } from "@/server/auth";
import { SKILLS } from "@/content/skills";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const parent = await readParent();
  if (!parent) redirect("/login");
  if (parent.role !== "ADMIN") redirect("/parent");
  const [parents, children, attempts, sessions] = await Promise.all([
    prisma.user.count({ where: { role: "PARENT" } }),
    prisma.child.count(),
    prisma.attempt.count({ where: { answeredAt: { not: null } } }),
    prisma.learningSession.count(),
  ]);
  const households = await prisma.user.findMany({
    where: { role: "PARENT" },
    include: { children: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <main className="shell py-8">
      <a className="brand" href="/admin"><span className="mark" aria-hidden="true" /> Beacon admin</a>
      <h1 className="mt-6 font-serif text-4xl">Pilot snapshot</h1>
      <p className="mt-2 text-[var(--muted)]">Counts only. This view does not open a child session or export a portfolio.</p>
      <dl className="mt-6 grid gap-3 sm:grid-cols-4">
        {[
          ["Parents", parents],
          ["Children", children],
          ["Answered items", attempts],
          ["Sessions", sessions],
        ].map(([label, value]) => (
          <div key={String(label)} className="card p-4">
            <dt className="text-sm text-[var(--muted)]">{label}</dt>
            <dd className="font-serif text-3xl">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-sm text-[var(--muted)]">{SKILLS.length} skills in the current map.</p>
      <div className="mt-6 grid gap-3">
        {households.map((household) => (
          <article key={household.id} className="card p-4">
            <h2 className="text-lg">{household.name}</h2>
            <p className="text-sm text-[var(--muted)]">{household.email}</p>
            <ul className="mt-2">
              {household.children.map((child) => (
                <li key={child.id}>{child.nickname} · grade {child.grade}</li>
              ))}
              {household.children.length === 0 && <li>No children</li>}
            </ul>
          </article>
        ))}
      </div>
      <form className="mt-6" method="post" action="/api/auth/logout">
        <button className="btn-quiet" type="submit">Sign out</button>
      </form>
    </main>
  );
}
