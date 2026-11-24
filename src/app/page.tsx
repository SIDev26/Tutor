import Link from "next/link";

export default function HomePage() {
  return (
    <main className="shell pb-16">
      <header className="topbar">
        <span className="brand"><span className="mark" aria-hidden="true" /> Beacon Math</span>
        <nav className="flex gap-2">
          <Link className="btn-quiet" href="/login">Sign in</Link>
          <Link className="btn" href="/register">Create parent account</Link>
        </nav>
      </header>
      <section className="grid items-start gap-8 py-6 md:grid-cols-[1.3fr_0.7fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.14em] text-[var(--pine)]">Grades 2–4 · homeschool pilot</p>
          <h1 className="mt-3 max-w-xl font-serif text-5xl leading-tight">A parent decides what gets practiced next.</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--muted)]">
            Beacon places a child on a short Common Core skill map, then gives 15–20 minutes of
            practice on the skills that are actually ready. Mastery comes from the attempts, not from a
            model. Explanations are written ahead of time. Nothing here chats with a child.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="btn" href="/register">Start a household</Link>
            <Link className="btn-quiet" href="/login">I already have an account</Link>
          </div>
        </div>
        <aside className="card p-5">
          <h2 className="font-serif text-2xl">What a week looks like</h2>
          <ol className="mt-3 grid gap-3 text-[var(--muted)]">
            <li>1. You add a child with a nickname and a grade. No child email.</li>
            <li>2. They take a short diagnostic. About ten questions.</li>
            <li>3. You approve or change the plan. Practice waits for that.</li>
            <li>4. Daily work stays on frontier skills, with review mixed in.</li>
            <li>5. You get a plain weekly note, alerts, and a portfolio export.</li>
          </ol>
        </aside>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        <article className="card p-5">
          <h2 className="font-serif text-2xl">The map</h2>
          <p className="mt-2 text-[var(--muted)]">Addition and subtraction with regrouping, place value, multiplication facts, and introductory fractions. About twenty skills, grades 2–4.</p>
        </article>
        <article className="card p-5">
          <h2 className="font-serif text-2xl">The mistake, named</h2>
          <p className="mt-2 text-[var(--muted)]">Wrong answers are tied to a specific mix-up, like skipping a trade of ten or flipping a fraction. The child sees a short written explanation.</p>
        </article>
        <article className="card p-5">
          <h2 className="font-serif text-2xl">The record is yours</h2>
          <p className="mt-2 text-[var(--muted)]">No third-party analytics. Delete a child&apos;s record when you want. Export CSV or a printable PDF for a homeschool portfolio.</p>
        </article>
      </section>
    </main>
  );
}
