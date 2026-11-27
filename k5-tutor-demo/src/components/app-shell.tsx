import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from "react";
import {
  ArrowRight,
  BookOpen,
  ChartNoAxesCombined,
  Check,
  ChevronDown,
  Home,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useDemo } from "./demo-provider";
import { Avatar } from "./avatar";
import { validPin } from "@/lib/demo-rules";
type ParentDestination = "/parent" | "/parent/progress" | "/parent/settings" | "/parent/profile";

export function Brand() {
  return (
    <Link to="/" className="brand">
      <span className="brand-symbol">
        <BookOpen size={21} strokeWidth={2.5} />
      </span>
      K-5 Tutor<span className="text-primary">.</span>
    </Link>
  );
}
export function AppHeader() {
  const { state, update, reset } = useDemo();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [gate, setGate] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [parentDestination, setParentDestination] = useState<ParentDestination>("/parent");
  const [profileOpen, setProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const profileTriggerRef = useRef<HTMLButtonElement>(null);
  const isPublic = ["/", "/pricing", "/start"].includes(path);
  const activeName = state.mode === "parent" ? "Maria" : state.child;
  const activeAvatar = state.mode === "parent" ? state.parentAvatar : state.avatars[state.child];

  useEffect(() => {
    if (!profileOpen) return;
    function closeOnOutsideClick(event: PointerEvent) {
      if (!profileMenuRef.current?.contains(event.target as Node)) setProfileOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setProfileOpen(false);
        profileTriggerRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [profileOpen]);

  function handleMenuKeys(event: ReactKeyboardEvent<HTMLDivElement>) {
    const items = Array.from(
      profileMenuRef.current?.querySelectorAll<HTMLButtonElement>('[role^="menuitem"]') ?? [],
    );
    const current = items.indexOf(document.activeElement as HTMLButtonElement);
    let next: number | undefined;
    if (event.key === "ArrowDown") next = (current + 1 + items.length) % items.length;
    if (event.key === "ArrowUp") next = (current - 1 + items.length) % items.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = items.length - 1;
    if (next !== undefined) {
      event.preventDefault();
      items[next]?.focus();
    }
  }

  function openParentPage(destination: ParentDestination) {
    setProfileOpen(false);
    if (state.mode === "child") {
      setParentDestination(destination);
      setGate(true);
      setPin("");
      setError("");
      return;
    }
    update({ mode: "parent" });
    navigate({ to: destination });
  }

  function openChildProfile(child: "Leo" | "Sofia") {
    setProfileOpen(false);
    update({ mode: "child", child });
    navigate({ to: "/child" });
  }
  return (
    <>
      <header className="app-header no-print">
        <div className="header-inner">
          <Brand />
          {isPublic && (
            <nav className="header-links">
              <Link to="/">Our approach</Link>
              <Link to="/pricing">Pricing</Link>
              <Link to="/parent" onClick={() => update({ mode: "parent" })}>
                Explore the demo <ArrowRight size={12} className="inline ml-1" />
              </Link>
            </nav>
          )}
          <div className="header-actions">
            {!isPublic && (
              <div className="profile-menu-wrap" ref={profileMenuRef}>
                <button
                  ref={profileTriggerRef}
                  type="button"
                  className="profile-menu-trigger"
                  aria-label={`Open ${activeName} profile menu`}
                  aria-expanded={profileOpen}
                  aria-controls="profile-switch-menu"
                  aria-haspopup="menu"
                  title="Switch profile"
                  onClick={() => setProfileOpen((open) => !open)}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowDown") {
                      event.preventDefault();
                      setProfileOpen(true);
                      window.setTimeout(() => {
                        profileMenuRef.current?.querySelector<HTMLButtonElement>('[role="menuitemradio"]')?.focus();
                      }, 0);
                    }
                  }}
                >
                  <Avatar config={activeAvatar} size={36} />
                  <ChevronDown size={15} strokeWidth={2.5} aria-hidden="true" />
                </button>
                {profileOpen && (
                  <div
                    id="profile-switch-menu"
                    className="profile-menu"
                    role="menu"
                    aria-label="Switch profile"
                    onKeyDown={handleMenuKeys}
                  >
                    <p className="profile-menu-label">Switch profile</p>
                    <button
                      type="button"
                      role="menuitemradio"
                      aria-checked={state.mode === "parent"}
                      className="profile-menu-profile"
                      onClick={() => openParentPage("/parent")}
                    >
                      <Avatar config={state.parentAvatar} size={32} />
                      <span>Maria<small>Adult</small></span>
                      {state.mode === "parent" && <Check size={16} aria-hidden="true" />}
                    </button>
                    {(["Leo", "Sofia"] as const).map((child) => (
                      <button
                        key={child}
                        type="button"
                        role="menuitemradio"
                        aria-checked={state.mode === "child" && state.child === child}
                        className="profile-menu-profile"
                        onClick={() => openChildProfile(child)}
                      >
                        <Avatar config={state.avatars[child]} size={32} />
                        <span>{child}<small>Child</small></span>
                        {state.mode === "child" && state.child === child && <Check size={16} aria-hidden="true" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {isPublic && (
              <Button variant="ghost" className="header-login" asChild>
                <Link to="/parent" onClick={() => update({ mode: "parent" })}>Log in</Link>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              title="Reset demo"
              aria-label="Reset demo"
              onClick={() => {
                if (window.confirm("Reset all demo progress and start fresh?")) {
                  reset();
                  navigate({ to: "/" });
                }
              }}
            >
              <RotateCcw />
            </Button>
          </div>
        </div>
      </header>
      <Dialog open={gate} onOpenChange={setGate}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LockKeyhole className="text-primary" />
              For your grown-up
            </DialogTitle>
            <DialogDescription>
              Enter any 4 digits. This is a mock parent PIN, not real security.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!validPin(pin)) {
                setError("Please enter four digits.");
                return;
              }
              update({ mode: "parent" });
              setGate(false);
              navigate({ to: parentDestination });
            }}
          >
            <input
              className="form-control text-center text-2xl"
              aria-label="Parent PIN"
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              autoFocus
            />
            {error && <p className="text-sm text-destructive mt-2">{error}</p>}
            <Button className="w-full mt-5" type="submit">
              Open parent view <ArrowRight />
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
export function AppFooter() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  if (!["/", "/pricing"].includes(path)) return null;
  return (
    <footer className="footer">
      <div className="footer-inner">
        <Brand />
        <p className="text-xs text-muted-foreground">
          You set the time. K-5 Tutor does the teaching. You see everything.
        </p>
        <div className="flex gap-5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <ShieldCheck size={14} />
            No open chat. Math only.
          </span>
          <span>© 2026 K-5 Tutor</span>
        </div>
      </div>
    </footer>
  );
}
export function ParentLayout({ children }: { children: ReactNode }) {
  const { state, update } = useDemo();
  return (
    <div className="app-layout">
      <aside className="sidebar no-print">
        <div className="sidebar-profile mb-6">
          <span className="eyebrow text-muted-foreground">Your homeschool</span>
          <div className="flex justify-center mt-4">
            <Avatar config={state.avatars[state.child]} size={64} label={`${state.child}’s avatar`} />
          </div>
          <label className="block mt-3">
            <select
              className="form-control"
              aria-label="Choose child in parent view"
              value={state.child}
              onChange={(e) => update({ child: e.target.value as "Leo" | "Sofia" })}
            >
              <option value="Leo">Leo · Grade 3</option>
              <option value="Sofia">Sofia · Grade 2</option>
            </select>
          </label>
        </div>
        <nav aria-label="Parent" className="contents">
          <Link to="/parent" activeOptions={{ exact: true }}>
            <Home size={17} />
            Home
          </Link>
          <Link to="/parent/progress">
            <ChartNoAxesCombined size={17} />
            Progress
          </Link>
          <Link to="/parent/settings">
            <Settings size={17} />
            Settings
          </Link>
        </nav>
        <div className="sidebar-profile mt-auto pt-16 text-xs text-muted-foreground leading-6">
          <ShieldCheck size={19} className="text-leaf mb-2" />
          You set the time. K-5 Tutor does the teaching. You see everything.
          {state.paused && <p className="text-coral font-semibold mt-2">Paused · child activity is stopped</p>}
        </div>
      </aside>
      <main className="workspace fade-in">{children}</main>
    </div>
  );
}
export function PageHeading({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}


