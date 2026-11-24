import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PrintButton } from "@/components/PrintButton";
import { DOMAIN_LABEL, DOMAIN_ORDER } from "@/content/skills";
import { confidencePercent, statusLabel } from "@/lib/labels";
import { readParent } from "@/server/auth";
import { childOverview, exportRows, weeklyReportFor } from "@/server/learning";

export const dynamic = "force-dynamic";

export default async function RecordPage({ params }: { params: Promise<{ id: string }> }) {
  const parent = await readParent();
  if (!parent) redirect("/login");
  const { id } = await params;
  const overview = await childOverview(id);
  if (!overview || overview.child.parentId !== parent.sub) notFound();
  const report = await weeklyReportFor(id);
  const exported = await exportRows(id);
  const recent = (exported?.rows ?? []).slice(-12).reverse();

  return (
    <main>
      <div className="no-print mb-4 flex flex-wrap gap-2">
        <Link className="btn-quiet" href={`/parent/children/${id}`}>Back</Link>
        <PrintButton />
        <a className="btn-quiet" href={`/api/children/${id}/export?format=csv`}>CSV</a>
        <a className="btn-quiet" href={`/api/children/${id}/export?format=pdf`}>PDF file</a>
      </div>
      <header>
        <p className="text-sm uppercase tracking-wide">Beacon Math portfolio record</p>
        <h1 className="font-serif text-4xl">{overview.child.nickname}</h1>
        <p>Grade {overview.child.grade}. Nickname and grade only. No surname, email, or account for this child.</p>
      </header>
      {report && (
        <section className="mt-4">
          <h2 className="font-serif text-2xl">This week</h2>
          <p className="mt-2">{report.report.headline}</p>
          {report.report.paragraphs.map((paragraph) => (
            <p key={paragraph} className="mt-2">{paragraph}</p>
          ))}
        </section>
      )}
      {DOMAIN_ORDER.map((domain) => (
        <section key={domain} className="mt-6">
          <h2 className="font-serif text-2xl">{DOMAIN_LABEL[domain]}</h2>
          <table className="mt-2 w-full border-collapse text-left text-sm">
            <thead>
              <tr>
                <th className="border-b py-2">Skill</th>
                <th className="border-b py-2">Status</th>
                <th className="border-b py-2">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {overview.skills.filter((skill) => skill.domain === domain).map((skill) => (
                <tr key={skill.id}>
                  <td className="border-b py-2">{skill.title}<div className="text-[var(--muted)]">{skill.id}</div></td>
                  <td className="border-b py-2">{statusLabel(skill.status, skill.inferred)}</td>
                  <td className="border-b py-2">{confidencePercent(skill.pMastery)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
      <section className="mt-6">
        <h2 className="font-serif text-2xl">Recent attempts</h2>
        {recent.length === 0 ? <p className="mt-2">No attempts yet.</p> : (
          <ul className="mt-2 grid gap-2">
            {recent.map((row, index) => (
              <li key={index} className="text-sm">
                {row[0]} · {row[3]} · {row[8] === "yes" ? "correct" : "miss"}{row[9] ? ` · ${row[9]}` : ""}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
