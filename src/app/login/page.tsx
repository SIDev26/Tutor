export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <main className="shell max-w-lg py-10">
      <a className="brand" href="/"><span className="mark" aria-hidden="true" /> Beacon Math</a>
      <h1 className="mt-8 font-serif text-4xl">Parent sign in</h1>
      <p className="mt-2 text-[var(--muted)]">Children do not have passwords. You start their session, then unlock the device when they are done.</p>
      {params.error && <p className="note mt-4">{params.error}</p>}
      <form className="card mt-6 grid gap-4 p-5" method="post" action="/api/auth/login">
        <label className="field">
          <span>Email</span>
          <input name="email" type="email" autoComplete="username" required />
        </label>
        <label className="field">
          <span>Password</span>
          <input name="password" type="password" autoComplete="current-password" required />
        </label>
        <button className="btn" type="submit">Sign in</button>
      </form>
      <p className="mt-4 text-sm text-[var(--muted)]">
        New household? <a className="underline" href="/register">Create a parent account</a>.
        A local demo is seeded as parent@example.com / homeschool-demo.
      </p>
    </main>
  );
}
