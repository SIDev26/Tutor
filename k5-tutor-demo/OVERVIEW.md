# Screenshot Perfect (K-5 Tutor) — export overview

Read-only export of Jamie's classmates' Lovable project so it can be replicated in another repo.

| Field | Value |
| --- | --- |
| Lovable project name | Screenshot Perfect |
| App name in UI | **K-5 Tutor** |
| Project ID | `89f48b10-c1c2-43fc-b890-7208d0b14495` |
| Commit | `3b43a9f120a884f47d86d3cbe7d6c61c83d453db` |
| Preview | https://id-preview--89f48b10-c1c2-43fc-b890-7208d0b14495.lovable.app |
| Template | `tanstack_start_ts_current` (`.lovable/project.json`) |
| Last known state | Unpublished phone-first demo with mocked data, last edited around 19 Nov 2026 |

This is a **frontend-only interview demo**. There is no backend, real auth, payments, or live AI. State lives in a React context (`DemoProvider`) and is persisted to `localStorage` under `k5-tutor-demo-v3`.

## Stack

- **Framework:** TanStack Start + TanStack Router (file routes in `src/routes/`) + React 19 + TypeScript
- **Bundler / SSR:** Vite 8 via `@lovable.dev/vite-tanstack-config`, Nitro, Cloudflare as the default deploy target
- **Styling:** Tailwind CSS v4 in `src/styles.css` (no `tailwind.config.js`, no PostCSS config, no root `index.html`)
- **UI kit:** shadcn/ui (New York-style) + Radix primitives in `src/components/ui/*`, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`
- **Charts / forms:** Recharts, react-hook-form, zod, date-fns, sonner, vaul, embla-carousel
- **Data:** `@tanstack/react-query` is wired in the root route but the demo itself is local mocked state
- **Tests:** Vitest + Testing Library + jsdom (`src/test/*`). Roadmap claims 41 tests covering answer keys and mastery rules.
- **Package manager:** Bun (`bun.lock`, `bunfig.toml`). `package.json` name is still the template default `tanstack_start_ts`.
- **Fonts:** Google Fonts loaded in `src/routes/__root.tsx` — **Bricolage Grotesque** (display / headings) and **DM Sans** (body / sans)

There is no `index.html` in the repo; TanStack Start provides the HTML shell from `src/routes/__root.tsx` (`RootShell`). Favicon is `public/favicon.ico`.

## Design system

Defined in `src/styles.css` `@theme inline` plus `:root` / `.dark` oklch tokens.

**Type**

- `--font-sans`: "DM Sans", sans-serif
- `--font-display`: "Bricolage Grotesque", sans-serif (used for large numbers and display figures)

**Radius:** `--radius: 0.5rem` with stepped `sm`–`4xl` utilities. Cards and flow screens use generous rounding; hero and child CTAs feel playful.

**Brand / semantic colors (light)**

- Background: warm near-white `oklch(0.995 0.002 95)`
- Foreground: indigo-ink `oklch(0.25 0.02 260)`
- Primary (indigo): `oklch(0.52 0.22 263)` — links, main buttons, eyebrows
- Sunshine / sunshine-soft: yellow highlight (`oklch(0.88 0.17 91)` / `oklch(0.975 0.035 91)`)
- Amber / amber-soft / amber-ink: secondary warm accent
- Coral / coral-soft: pause / warning (`oklch(0.65 0.2 28)`)
- Leaf / leaf-soft: safety, success, trust (`oklch(0.53 0.13 151)`)
- Blue-soft: selected tiles, info wash (`oklch(0.965 0.02 263)`)
- Avatar skin tones: `--skin-light`, `--skin-medium`, `--skin-deep`

A `.dark` token set exists, but the demo is designed as a light, colorful, child-friendly UI. Custom CSS covers the phone-first hero, step grids, safety band, lesson player, fraction-strip drag/drop, teach-scene animations, progress print layout, and reduced-motion fallbacks. Layouts were verified at **390px**.

**Imagery**

- Hero photo: `src/assets/k5-family.png` (mother and son with fraction strips). In Lovable this is referenced via `src/assets/k5-family.png.asset.json` (`family.url`). The PNG itself (2,361,601 bytes) was downloaded from the preview asset URL and saved next to the JSON.
- Avatars are **drawn, not photographed** — 8 presets plus a builder (`avatar.tsx`, `avatar-picker.tsx`, `avatar-builder.tsx`).
- Teach scenes use inline SVG / CSS animation (space and soccer unit-fraction lessons), not video.

**Tone:** plain-language parent copy, short child copy, no open chat, “You set the time. K-5 Tutor does the teaching. You see everything.”

## Routes

TanStack file routes (`src/routeTree.gen.ts` is generated; keep it, do not hand-edit unless regenerating):

| Path | File | Audience | Purpose |
| --- | --- | --- | --- |
| `/` | `src/routes/index.tsx` | Public | Marketing landing: hero, Diagnose/Learn/Check, safety band, pricing, CTA |
| `/pricing` | `src/routes/pricing.tsx` | Public | Same pricing section as the landing page |
| `/start` | `src/routes/start.tsx` | Parent | 3-step family consent / setup, then navigates to diagnostic |
| `/diagnostic` | `src/routes/diagnostic.tsx` | Child (after setup) | 10-question adaptive-ish check, then `/child` |
| `/child` | `src/routes/child.tsx` | Child | Renders `ChildLesson` — the daily guided practice |
| `/parent` | `src/routes/parent.tsx` | Parent | Layout `Outlet` only |
| `/parent/` | `src/routes/parent.index.tsx` | Parent | Home / “How is my child doing?” weekly snapshot |
| `/parent/progress` | `src/routes/parent.progress.tsx` | Parent | Teaching records: skill map, charts, portfolio export |
| `/parent/settings` | `src/routes/parent.settings.tsx` | Parent | Pause, schedule, interests, voice, privacy |
| `/parent/profile` | `src/routes/parent.profile.tsx` | Parent | Selected child’s avatar + interest editor |
| `/parent/how-we-teach` | `src/routes/parent.how-we-teach.tsx` | Parent | Evidence-based teaching principles + sources |

Public header (`/`, `/pricing`, `/start`) shows “Our approach”, “Pricing”, “Explore the demo”, and **Log in** (opens Parent Home). Parent/Child switching and the avatar menu appear only after entering the app — never on public pages. Switching from a child profile to Maria (parent) requires a mock **4-digit PIN** (any 4 digits; `validPin` in `src/lib/demo-rules.ts`).

Parent nav (sidebar): **Home**, **Progress**, **Settings**. Child switcher on parent screens: Leo (Grade 3) and Sofia (Grade 2).

## Demo household

Fictional only — forms say “Please don’t enter real personal information.”

- Parent: **Maria**, email `maria@example.com` (read-only)
- Child: **Leo**, Grade 3 (primary walkthrough; unit-fractions lesson is fully built)
- Child: **Sofia**, Grade 2 (seeded progress; adding within 100, animals interest)
- Demo clock defaults to Thursday, 19 Nov 2026, 4:00 pm; Settings can jump the clock to other slots

## User flows

### 1. Family consent journey (`/` → `/start` → `/diagnostic`)

1. Landing CTA: “Start the free 10-minute check.”
2. **Step 1 — Consent:** parent email (demo), child first name (Leo, read-only), grade 2–4, plain-language data notice, required guardian consent checkbox, optional third-party sharing checkbox (no sharing occurs in the demo).
3. **Step 2 — Time:** `ScheduleEditor` — daily cap 10 / 15 / 20 minutes and weekly time slots (defaults pre-filled).
4. **Step 3 — Child profile:** `ProfileGame` — tap-only “About me” interest game plus avatar choice (no free text, photos, or real names/places). Worlds include Space and Soccer (fully themed) and others such as animals.
5. On finish, demo state records consent, schedule, avatar, interest profile, and a fresh lesson, then routes to `/diagnostic`.
6. If someone opens `/diagnostic` or `/child` before setup, `child-gate` / setup guards send them back: “Grown-up first, please.”

### 2. Guided practice (`/diagnostic` then `/child`)

**Diagnostic:** ten multiple-choice questions from `src/lib/demo-data.ts`. A simple branch at question 6 can swap in an easier prompt (`nextDiagnosticQuestion`). Child-friendly encouragement only; then “You did it, Leo!” and a large **Start** button to `/child`.

**Daily lesson** (`ChildLesson` + `LessonPlayer` + `TeachScene`):

- Stages: `teach` → `guided` → `practice` → `check` → `review` (after a 3-day delay) → `complete`.
- **Learn:** 8-scene animated, narrated unit-fraction lesson (Space or Soccer theme; captions-only fallback; `VoicePicker` in Settings). Drag-and-drop fraction strips (`fraction-manipulative.tsx`) and flip vocabulary cards.
- **Practice:** guided examples then practice; hints never give the answer (`demo-rules.ts`).
- **Check:** five no-hint, no-retry questions (3 themed + 2 plain). If score &lt; 4/5, the lesson is auto re-taught with a new example.
- **Review:** a short warm-up appears on its own three days later.
- **Mastery rule (pilot / north star):** Check passed **4/5** and delayed Review passed **3/3**, and at least one plain (unthemed) Check item correct. Themes must never change the math — `interest-content.ts` generates themed copies of shared skeletons; tests assert identical options/answers across profiles.

**Child gates** (`child-gate.tsx` + `schedule.ts`): no consent; parent **pause**; outside allowed time slots (“Come back at …”); daily minute cap (“See you tomorrow”). Demo-only buttons can skip the clock forward.

The fully built skill is **“Compare unit fractions”**. Other skills may show “Lesson preview coming soon” in parent views only.

### 3. Teaching records (parent dashboard)

- **Home (`/parent/`):** read-only “This week” plan with reasons (`buildWeekPlan`), minutes used vs planned, latest Check result, optional tip, plan change line. **No plan approval or lesson-approve step** (removed in a later brief; parent controls are time, slots, and pause only).
- **Progress (`/parent/progress`):** plain-language summary; Day 1 vs Week 6 toggle; level bars (“is my child where they should be?”); then-and-now (“is it working?”); skills mastered; skill path / skill map; “can now” cards; practice calendar; evidence sheet. Data from `progress-data.ts` + live Leo lesson state.
- **Portfolio (`portfolio-view.tsx`):** same charts, print/PDF via the browser (“Save as PDF”); black-and-white friendly print CSS. No server-side document service.
- **Settings:** pause switch, per-child interest editor, schedule, demo clock, narration voice, optional parent avatar, privacy recap, link to How we teach.
- **How we teach:** five sourced design principles from `teachingSources` in `lesson-data.ts`. The demo is explicitly not a validated curriculum.

## Key app components (non-shadcn)

`app-shell.tsx` (header, footer, parent layout, PIN dialog), `demo-provider.tsx`, `child-gate.tsx`, `child-lesson.tsx`, `lesson-player.tsx`, `teach-scene.tsx`, `lesson-progress.tsx`, `fraction-manipulative.tsx`, `vocabulary-cards.tsx`, `profile-game.tsx`, `interest-guide.tsx`, `interest-profile-editor.tsx`, `avatar*.tsx`, `schedule-editor.tsx`, `voice-picker.tsx`, `skill-map-view.tsx`, `progress-charts.tsx`, `portfolio-view.tsx`, `pricing-section.tsx`.

## Pricing (as coded)

From `priceForChildren` / `PricingSection`:

- Annual **$399** / child / year (best value)
- Quarterly **$149** / child / quarter
- Monthly **$59** / child / month
- **30% off each additional child** (implemented as `rate * (1 + (n-1)*0.7)`)

Included copy: narrated teaching, checks and spaced reviews, daily limits / slots / pause, evaluation-ready portfolio. Start is a free 10-minute check; no credit card in the demo.

## Export notes for a coding agent

- Restore `src/assets/k5-family.png` and keep the `.asset.json`. When not on Lovable, import the PNG directly (or map `family.url` to the local file) so the landing hero works.
- `@lovable.dev/vite-tanstack-config` already injects TanStack Start, React, Tailwind, path aliases, and Nitro. Do not add those plugins again. Outside Lovable you may need an equivalent Vite/TanStack Start config.
- `bun.lock` was truncated by the first MCP `read_file` result and later restored from a complete 168,116-byte copy (603 integrity hashes). If install fails, regenerate with `bun install` from `package.json`.
- `src/styles.css` was similarly truncated in the first MCP result and restored to the full 52,805-byte / 1,751-line source (includes all tokens and component CSS).
- Lovable `get_project_knowledge` was empty; see `PROJECT_KNOWLEDGE.md`.
- No `node_modules`. No root `index.html` or `tailwind.config.*` existed in the project at this commit.
- Do not modify the Lovable project when using this export; this tree is a snapshot only.
