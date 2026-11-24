export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <main className="shell max-w-lg py-10">
      <a className="brand" href="/"><span className="mark" aria-hidden="true" /> Beacon Math</a>
      <h1 className="mt-8 font-serif text-4xl">Create the parent account</h1>
      <p className="mt-2 text-[var(--muted)]">This login is yours. You will add each child as a profile with a nickname and grade only.</p>
      {params.error && <p className="note mt-4">{params.error}</p>}
      <form className="card mt-6 grid gap-4 p-5" method="post" action="/api/auth/register">
        <label className="field">
          <span>Your name</span>
          <input name="name" autoComplete="name" required />
        </label>
        <label className="field">
          <span>Email</span>
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label className="field">
          <span>Password</span>
          <input name="password" type="password" autoComplete="new-password" minLength={8} required />
        </label>
        <button className="btn" type="submit">Create account</button>
      </form>
    </main>
  );
}
