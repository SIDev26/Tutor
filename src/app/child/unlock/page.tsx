export const dynamic = "force-dynamic";

export default async function UnlockPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <main className="card p-6">
      <h1 className="font-serif text-4xl">Grown-up unlock</h1>
      <p className="mt-2 text-lg">Enter the parent password to leave practice.</p>
      {params.error && <p className="note mt-4">{params.error}</p>}
      <form className="mt-5 grid gap-4" method="post" action="/api/child-session/unlock">
        <label className="field">
          <span>Password</span>
          <input name="password" type="password" autoComplete="current-password" required />
        </label>
        <button className="btn" type="submit">Unlock</button>
      </form>
      <a className="mt-4 inline-block text-sm underline" href="/child">Back to the session</a>
    </main>
  );
}
