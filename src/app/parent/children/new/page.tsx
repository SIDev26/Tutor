export default async function NewChildPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <main className="max-w-lg">
      <h1 className="font-serif text-4xl">Add a child</h1>
      <p className="mt-2 text-[var(--muted)]">Nickname or first name only. Grade 2, 3, or 4 for this pilot.</p>
      {params.error && <p className="note mt-4">{params.error}</p>}
      <form className="card mt-6 grid gap-4 p-5" method="post" action="/api/children">
        <label className="field">
          <span>Nickname</span>
          <input name="nickname" required maxLength={20} autoComplete="off" />
        </label>
        <label className="field">
          <span>Grade</span>
          <select name="grade" defaultValue="3">
            <option value="2">Grade 2</option>
            <option value="3">Grade 3</option>
            <option value="4">Grade 4</option>
          </select>
        </label>
        <button className="btn" type="submit">Save child</button>
      </form>
    </main>
  );
}
