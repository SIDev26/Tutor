# Contributing

Work lands on `main` only through a pull request. Jamie ([@SIDev26](https://github.com/SIDev26)) reviews. The hub index is [docs/README.md](docs/README.md).

## Branches

- Update `main`, then branch from it.
- Name the branch `yourname/short-topic`, in lowercase. Examples: `jamie/spanish-placement`, `alex/migration-history`.
- Cloud agents in this repo have used a `cursor/` prefix (`cursor/beacon-math-mvp-c73d`). That prefix is fine for an agent. People use `name/topic`.
- One topic per branch. A pull request that mixes a product change, a rename, and a docs rewrite is too big.

## Pull requests

- Push the branch and open a pull request into `main`. The template is [.github/pull_request_template.md](.github/pull_request_template.md).
- Describe what changed, why, and how you checked it.
- [.github/CODEOWNERS](.github/CODEOWNERS) names `@SIDev26` for the whole repo. With “require review from code owners” enabled, GitHub requests that review. Until branch protection is on, request Jamie yourself.
- The author does not merge their own pull request.
- Do not force-push `main`. Prefer not to rewrite a branch someone else is already reviewing. If you do need to update a branch, say so in a comment.

## Docs stay in the same pull request

Read these before editing:

- [docs/PRODUCT_BRIEF.md](docs/PRODUCT_BRIEF.md)
- [docs/DECISIONS.md](docs/DECISIONS.md)
- [docs/TASKS.md](docs/TASKS.md)

If the change makes or reverses a decision, add a row to `docs/DECISIONS.md`. If it starts or finishes work, move the row in `docs/TASKS.md`. Ship those edits in the same pull request. A follow-up “I’ll update the docs later” leaves the next assistant with a stale map.

Mark a claim the code does not yet implement as **Inferred**.

## Secrets

- Do not commit secrets. That includes `.env`, private keys, API tokens, session cookies, and real customer data.
- Placeholders belong in an example file (`.env.example`), with fake values.
- If a secret lands in a commit, tell Jamie. Rotating the secret matters more than rewriting git history on your own.

## Rules for AI assistants

Assistants (Grok in Cursor, Claude, Claude Code, ChatGPT, Codex, Copilot, and others) follow the same path as a person.

1. Read [AGENTS.md](AGENTS.md) and the docs it lists before changing files.
2. Do the work on a branch. Never push to `main`.
3. Update `docs/DECISIONS.md` and `docs/TASKS.md` in the same pull request when the work changes them.
4. No secrets in commits, pull request text, or logs.
5. Say which assistant produced the work, in the pull request body. Name the product, for example “Grok in Cursor”, “Claude Code”, or “ChatGPT Codex”. A person who edited the result by hand says that too.
6. Leave app code alone when the task is documentation, and leave the hub docs accurate when the task is app code.
7. The K-5 demo folder has its own `AGENTS.md` once pull request #2 is merged. That file governs the demo prototype. It does not waive the rules in this file.
