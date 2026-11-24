import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/server/db";
import { readParent } from "@/server/auth";
import { weeklyReportFor } from "@/server/learning";

export const dynamic = "force-dynamic";

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const parent = await readParent();
  if (!parent) redirect("/login");
  const { id } = await params;
  const child = await prisma.child.findFirst({ where: { id, parentId: parent.sub } });
  if (!child) notFound();
  const report = await weeklyReportFor(id);
  if (!report) notFound();

  return (
    <main className="max-w-3xl">
      <Link className="no-print text-sm text-[var(--muted)]" href={`/parent/children/${id}`}>Back to {report.child.nickname}</Link>
      <p className="mt-3 text-sm uppercase tracking-wide text-[var(--pine)]">Last 7 days</p>
      <h1 className="mt-1 font-serif text-4xl">Weekly note</h1>
      <article className="card mt-4 p-6">
        <p className="text-xl leading-relaxed">{report.report.headline}</p>
        {report.report.paragraphs.map((paragraph) => (
          <p key={paragraph} className="mt-3 leading-relaxed">{paragraph}</p>
        ))}
        <h2 className="mt-6 font-serif text-2xl">Suggested next</h2>
        <ul className="mt-2 list-disc pl-5">
          {report.report.nextSteps.map((step) => (
            <li key={step} className="mt-1">{step}</li>
          ))}
        </ul>
      </article>
      <div className="no-print mt-4 flex flex-wrap gap-2">
        <a className="btn" href={`/api/children/${id}/export?format=csv`}>Download CSV</a>
        <a className="btn-quiet" href={`/api/children/${id}/export?format=pdf`}>Download PDF</a>
        <Link className="btn-quiet" href={`/parent/children/${id}/record`}>Printable record</Link>
      </div>
    </main>
  );
}
