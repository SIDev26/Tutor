# Agent instructions

Shared context for every assistant that opens this repo: Grok in Cursor, Claude, Claude Code, ChatGPT, Codex, and GitHub Copilot. [CLAUDE.md](CLAUDE.md) and [.github/copilot-instructions.md](.github/copilot-instructions.md) point here. If a tool loads only one of those files, follow that pointer and read this file.

## What this repo is

A founding-team hub for a K–5 bilingual math tutor. Working names: **SnugMath** (top pick, not decided) and **Beacon Math**. The name decision is in [docs/DECISIONS.md](docs/DECISIONS.md).

`main` holds the hub docs. The apps are open pull requests:

- Beacon Math MVP, Next.js + Prisma + Postgres/Neon on Vercel: [pull request #1](https://github.com/SIDev26/Tutor/pull/1), branch `cursor/beacon-math-mvp-c73d`.
- K-5 Tutor demo, TanStack Start, mocked data, no backend: [pull request #2](https://github.com/SIDev26/Tutor/pull/2), branch `cursor/k5-tutor-demo-761a`, folder `k5-tutor-demo/`.

Read [docs/README.md](docs/README.md) and then the product brief, the decision log, and the task board before you edit.

## Hard rules

- Never push to `main`. Branch from an up-to-date `main` unless the task is to continue one of the pull requests above.
- Branch names: `name/short-topic` for a person. Agent branches may use the `cursor/` prefix this repo already uses.
- Small pull requests. Use [.github/pull_request_template.md](.github/pull_request_template.md).
- Jamie ([@SIDev26](https://github.com/SIDev26)) reviews. [.github/CODEOWNERS](.github/CODEOWNERS) lists that owner for every file.
- In the pull request body, name the assistant that produced the work.
- Update [docs/DECISIONS.md](docs/DECISIONS.md) and [docs/TASKS.md](docs/TASKS.md) in the same pull request when a decision or a task changes.
- No secrets in commits or in the pull request. Do not add `.env` files. Do not invent API keys.
- Do not change application code for a docs-only task.
- Mark anything the code does not implement as **Inferred**. The proposed prices (Plus $24/month or $199/year, Mastery (ESA) $399, Microschool $120/seat) and bilingual English/Spanish are inferred. The grades 2–4 pilot, the placement check, mastery practice, and the parent dashboard are in the apps.

## Product facts that are easy to get wrong

- Beacon Math does not show model-written text to a child and has no chat. Mastery is Bayesian Knowledge Tracing over logged attempts. The parent approves the plan before practice.
- The demo is a prototype. `localStorage` key `k5-tutor-demo-v3`. Do not add a backend, real auth, or live model calls to it unless a decision says so.
- The demo’s on-screen prices ($59 / month, $149 / quarter, $399 / year per child) are demo copy. They are not the proposed tier list in the product brief.

Fuller detail, including what is inferred: [docs/PRODUCT_BRIEF.md](docs/PRODUCT_BRIEF.md). The human-facing workflow: [CONTRIBUTING.md](CONTRIBUTING.md). Teammate setup: [docs/TEAM_ONBOARDING.md](docs/TEAM_ONBOARDING.md).
