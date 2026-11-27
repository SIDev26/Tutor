# Team hub

This repository is the shared place for a small founding team. Each person may use a different assistant (Grok in Cursor, Claude / Claude Code, ChatGPT / Codex). Work arrives as a branch and a pull request. Jamie ([@SIDev26](https://github.com/SIDev26)) reviews it before it reaches `main`.

`main` currently holds this hub. The two apps live on open pull requests that both target `main` and do not contain each other.

| What | Where | Pull request |
| --- | --- | --- |
| Beacon Math MVP. Parent accounts, diagnostic, mastery practice, dashboard, export. Next.js, Prisma, Postgres. | Branch `cursor/beacon-math-mvp-c73d` | [#1](https://github.com/SIDev26/Tutor/pull/1) |
| K-5 Tutor demo. Phone-first replica of the Lovable prototype. Mocked data, no backend. TanStack Start. | `k5-tutor-demo/` on branch `cursor/k5-tutor-demo-761a` | [#2](https://github.com/SIDev26/Tutor/pull/2) |

## Read these first

| Doc | What it is |
| --- | --- |
| [PRODUCT_BRIEF.md](PRODUCT_BRIEF.md) | Who it is for, what it does, and which parts are still a proposal. |
| [DECISIONS.md](DECISIONS.md) | Decisions we have already made, with the date and the reason. |
| [TASKS.md](TASKS.md) | Now / Next / Later, with an owner. |
| [TEAM_ONBOARDING.md](TEAM_ONBOARDING.md) | How to join the repo and connect an assistant. |
| [../CONTRIBUTING.md](../CONTRIBUTING.md) | Branch, pull request, and assistant rules. |
| [../AGENTS.md](../AGENTS.md) | The same rules, loaded automatically by assistants. |

## How a change moves

1. Read the docs above.
2. Branch from an up-to-date `main`. Name it `yourname/short-topic`.
3. Keep the pull request small. If a decision changed, or a task moved, update `DECISIONS.md` and `TASKS.md` in that same pull request.
4. Open the pull request against `main`. The template asks which assistant did the work.
5. Jamie reviews. Someone with write access merges after approval.

Do not push commits straight to `main`.
