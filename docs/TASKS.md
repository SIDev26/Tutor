# Tasks

A short board. Move a row when the work moves. Put the owner in the last column. Jamie ([@SIDev26](https://github.com/SIDev26)) owns decisions and review. “Open” means a teammate can take it.

Update this file in the same pull request that starts or finishes the work.

## Now

| Task | Notes | Owner |
| --- | --- | --- |
| Review the team-hub pull request and start using it as the source of truth. | Docs, contributing rules, assistant entry points, pull request template, code owners. | Jamie |
| Review Beacon Math ([#1](https://github.com/SIDev26/Tutor/pull/1)) and the K-5 Tutor demo ([#2](https://github.com/SIDev26/Tutor/pull/2)). | Both target `main` and do not contain each other. Merge order is a decision. | Jamie |
| Choose the product name, or explicitly keep working names for now. | SnugMath is the top pick. See [DECISIONS.md](DECISIONS.md). | Jamie |
| Turn on branch protection for `main`: pull request required, one approval. | Manual path, if the API cannot do it: Settings → Rules. See the hub pull request for the exact API result. | Jamie |

## Next

| Task | Notes | Owner |
| --- | --- | --- |
| Decide which surface is the product and which stays a demo. | Beacon Math has accounts and Postgres. The demo has the phone-first lesson, narration, and portfolio layout. | Jamie |
| Align the price list with the proposed tiers. | Demo UI: $59 / month, $149 / quarter, $399 / year per child. Proposed: free check, Plus $24 / month or $199 / year, Mastery (ESA) $399, Microschool $120 / seat. Proposed rows are marked inferred in [PRODUCT_BRIEF.md](PRODUCT_BRIEF.md). | Jamie |
| Replace `prisma db push` with a reviewed migration history. | Before any real family data. Beacon Math README. | Open |
| Teacher pass on every child-facing explanation. | Beacon Math README. Required before a real pilot. | Open |
| Widen the skill map past the grade 2–4 slice. | About twenty skills today (operations, base ten, fractions, a little measurement). K–5 coverage is inferred in the brief and is not built. | Open |
| Email verification, password reset, and a deletion audit. | Beacon Math README. Deletion today removes the rows and does not write a log. | Open |
| Install the Claude GitHub App and the ChatGPT Codex Connector on this repo, limited to the people who will use them. | Needs a repo admin. Steps in [TEAM_ONBOARDING.md](TEAM_ONBOARDING.md). Do this in its own pull request if it adds workflow files. No API keys in git. | Jamie |

## Later

| Task | Notes | Owner |
| --- | --- | --- |
| Bilingual English and Spanish. | **Inferred.** No language toggle or Spanish copy in either app. | Open |
| Florida ESA packaging and microschool seats. | **Inferred.** The demo portfolio mentions Florida home education evaluation s. 1002.41 only. | Jamie |
| A fuller diagnostic: two items on borderline skills, stop when the frontier is stable. | Beacon Math README. | Open |
| Parent-configurable review load, and a way to send a stalled skill back to its prerequisite from the alert. | Beacon Math README. | Open |
| Optional read-aloud that speaks the same pre-written strings. | Beacon Math README. The demo already has a narration voice picker on mocked audio. | Open |
| Calibrate item difficulty on real attempts. | The Elo nudge in Beacon Math does not drive mastery. | Open |
| Production headers, backup, and a screen-reader pass on the child player. | Beacon Math README. | Open |
