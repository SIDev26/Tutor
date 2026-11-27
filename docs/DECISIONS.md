# Decision log

Newest first. Add a row in the same pull request that makes or changes the decision. Keep the reason to a few sentences.

| Date | Decision | Why |
| --- | --- | --- |
| 2026-11-27 | The product name is undecided. **SnugMath** is the top pick. Beacon Math and K-5 Tutor stay as the names already compiled into the two apps. | The repo, the MVP, and the demo were built under different labels. Renaming the UI before the team agrees would churn both pull requests. Record the pick here, and change user-facing strings only after a later decision names the product. |
| 2026-11-27 | This repository is the founding team’s hub. Changes reach `main` as small pull requests. Jamie ([@SIDev26](https://github.com/SIDev26)) is the reviewer. Assistants read `docs/` first and update this file and [TASKS.md](TASKS.md) in the same pull request. | The team uses different assistants (Grok in Cursor, Claude / Claude Code, ChatGPT / Codex). One review path and one set of docs keep those tools from diverging. |
| 2026-11-24 | Beacon Math is a Next.js (App Router) and TypeScript app, with Prisma and Postgres. Local Postgres may be Docker or a Neon dev branch. The hosted target is Vercel with the Neon integration (`DATABASE_URL` pooled, `DATABASE_URL_UNPOOLED` direct). | Recorded in Beacon Math’s README and `package.json` on pull request [#1](https://github.com/SIDev26/Tutor/pull/1). Auth is an httpOnly JWT cookie. Mastery, selection, the diagnostic, and the weekly note are plain TypeScript with Vitest, so those tests do not need a database. |
| 2026-11-24 | The K-5 Tutor demo stays a separate frontend in `k5-tutor-demo/`, on TanStack Start, React 19, Vite, and Tailwind v4. It uses mocked data in `localStorage` (`k5-tutor-demo-v3`). It has no backend and no live model calls. | Pull request [#2](https://github.com/SIDev26/Tutor/pull/2) copies the Lovable export and sits beside Beacon Math. The demo is for showing the parent and child flows. It does not become the system of record. |
| 2026-11-24 | A child session does not chat and does not show model-written text. Explanations are written ahead of time. In Beacon Math the parent approves the practice plan. | Both apps state this. It keeps the child experience deterministic and leaves the parent in charge of what is practiced. |

When you reverse a row, add a new row. Leave the old one in place so the history stays readable.
