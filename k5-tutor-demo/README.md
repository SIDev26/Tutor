# K-5 Tutor demo

Phone-first demo of **K-5 Tutor**, a parent-supervised math practice app for homeschool families (grades 2–4). It is a frontend-only interview demo: mocked data, no backend, no live AI, no real auth or payments. Family state is kept in `localStorage` under `k5-tutor-demo-v3`.

This copy originated from a classmates’ [Lovable](https://lovable.dev) project named **Screenshot Perfect** (project `89f48b10-c1c2-43fc-b890-7208d0b14495`, commit `3b43a9f120a884f47d86d3cbe7d6c61c83d453db`). The source in this folder is that export, adjusted so it installs and runs outside Lovable. See `OVERVIEW.md` for routes, flows, design tokens, and gating rules.

It lives beside the Beacon Math MVP and does not replace it. Run commands from this directory.

## Run

Node.js 22+ and npm, or [Bun](https://bun.sh).

```sh
cd k5-tutor-demo
npm install
npm run dev
```

`npm install` uses `.npmrc` (`legacy-peer-deps=true`). Without that, npm 10.9.9 crashes while resolving this package’s peer graph (`Cannot read properties of null (reading 'edgesOut')`).

Bun works the same way (`bun install` then `bun run dev`) and matches `bun.lock`. The dev server listens on port **8080** (`http://localhost:8080`).

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm test` | Vitest (answer keys, mastery rules, routing) |
| `npm run build` | Production build (Nitro; Cloudflare module preset by default) |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint |

## Routes

| Path | What you see |
| --- | --- |
| `/` | Landing: hero, Diagnose / Learn / Check, safety, pricing |
| `/pricing` | Pricing |
| `/start` | 3-step parent setup, then the diagnostic |
| `/diagnostic` | 10-question check (needs setup first) |
| `/child` | Learn / Practice / Check / Review for unit fractions |
| `/parent` | Parent home |
| `/parent/progress` | Teaching records and charts |
| `/parent/settings` | Pause, schedule, interests, voice |
| `/parent/profile` | Avatar and interest editor |
| `/parent/how-we-teach` | Teaching principles and sources |

Public pages (`/`, `/pricing`, `/start`) show “Our approach”, “Pricing”, “Explore the demo”, and **Log in** (opens Parent Home). A mock 4-digit PIN (any four digits) is required only when switching from a child profile back to Maria.

The demo clock starts at Thursday, 19 Nov 2026, 4:00 pm. Leo (grade 3) has the full unit-fraction lesson. Sofia (grade 2) has seeded progress.

## Differences from the Lovable original

- The landing hero imports `src/assets/k5-family.png` directly. On Lovable the same file was referenced through `k5-family.png.asset.json` (`/__l5e/assets-v1/...`), which only resolves inside Lovable’s preview proxy. The JSON is kept as the original asset record.
- `package.json` name is `k5-tutor-demo` (the export still used the template name `tanstack_start_ts`).
- Vite still uses the published `@lovable.dev/vite-tanstack-config` package. That package is what wires TanStack Start, React, Tailwind v4, and Nitro for this template. Sandbox-only behavior (forced port, asset proxy, Lovable error diagnostics) stays off unless `LOVABLE_SANDBOX=1`.
- Lovable editor telemetry in `src/lib/lovable-error-reporting.ts` is a no-op here: it only forwards errors when `window.__lovableEvents` exists.
- The shelf line in the unit-fraction teach scene (`TeachFrame`) now has a React key. The export omitted it, which logged “Each child in a list should have a unique key” while scenes 2 and 3 played. The drawing is unchanged.
- `.npmrc` sets `legacy-peer-deps=true` so `npm install` succeeds on npm 10. That flag does not change which ranges `package.json` asks for.
- No other product behavior was intentionally changed. Copy, tokens, routes, and localStorage key match the export.
