export const dynamic = "force-dynamic";

export default function ChildLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="child-shell">
      <div className="shell max-w-2xl py-6">
        <p className="brand mb-6"><span className="mark" aria-hidden="true" /> Beacon</p>
        {children}
      </div>
    </div>
  );
}
