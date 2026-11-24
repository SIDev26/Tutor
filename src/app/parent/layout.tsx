import { redirect } from "next/navigation";
import { readParent } from "@/server/auth";

export const dynamic = "force-dynamic";

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const parent = await readParent();
  if (!parent) redirect("/login");
  return (
    <div className="shell pb-16">
      <header className="topbar no-print">
        <a className="brand" href="/parent"><span className="mark" aria-hidden="true" /> Beacon</a>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-[var(--muted)]">{parent.name}</span>
          {parent.role === "ADMIN" && <a className="underline" href="/admin">Admin</a>}
          <form method="post" action="/api/auth/logout">
            <button className="btn-quiet" type="submit">Sign out</button>
          </form>
        </div>
      </header>
      {children}
    </div>
  );
}
