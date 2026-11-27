# Product brief

Working names: **SnugMath** (top pick) and **Beacon Math**. The name is not decided. See [DECISIONS.md](DECISIONS.md).

Two apps exist, on separate open pull requests. Beacon Math ([pull request #1](https://github.com/SIDev26/Tutor/pull/1)) is a local full-stack MVP. The K-5 Tutor demo ([pull request #2](https://github.com/SIDev26/Tutor/pull/2)) is a frontend replica of a classmates’ Lovable project (“Screenshot Perfect”) and does not replace Beacon Math. Sentences marked **Inferred** are a founding proposal. They are not implemented in either app.

## Problem

Parents teaching elementary math at home need a next step they can trust, a short daily practice, and a record they can keep. The Beacon Math home page states the product rule in one line: a parent decides what gets practiced next. The K-5 Tutor landing page says the same idea as “You set the time. K-5 Tutor does the teaching. You see everything.”

Both apps refuse an open chat with the child. Beacon Math shows only pre-written explanations tied to a tagged mix-up. The demo copy says the child never types free text to an AI.

The demo landing page cites NCES NAEP 2024: 24% of U.S. 4th graders score below Basic in math. That sentence is marketing copy inside the demo. This brief does not re-check the statistic.

## Who it is for

**In the code.** Homeschool parents, for a grades 2–4 pilot. Beacon Math’s README times that pilot to early 2027. A child is a nickname and a grade. There is no child email. The demo household is fictional (Maria, Leo in grade 3, Sofia in grade 2) and the forms say not to enter real personal information.

The demo’s printable portfolio says it is “Designed to support Florida’s annual home education evaluation (s. 1002.41)” and tells the parent to confirm with their evaluator. The same block says the records are a fictional demonstration, not a formal assessment.

**Inferred.** The audience includes parents of K–5 children, Florida ESA families, and later a microschool buying seats. The demo’s product name is “K-5 Tutor.” The grade band implemented in both apps is grades 2–4. Neither app mentions ESA or microschools.

**Inferred.** The product is bilingual, English and Spanish. Neither app has Spanish copy or a language control. Beacon Math’s README lists optional read-aloud as future work, using the same pre-written English strings.

## What the product does

### Placement check

Beacon Math runs a short diagnostic of about ten questions, one item per skill, walking a prerequisite graph. Passing a harder skill can place its unattempted prerequisites as mastered and labels them “Placed by diagnostic.” A single correct diagnostic item does not by itself master that skill. The child session is timed (12 minutes for a diagnostic).

The demo calls this a free 10-minute check. Setup is a short parent flow, then a 10-question check. No credit card is collected. The demo states that no payment information is collected at all.

### Mastery practice

Beacon Math keeps daily work on frontier skills: every prerequisite is mastered, and the skill itself is not. The parent approves or edits the plan before practice starts. Sessions are 10, 15, or 20 minutes. About one item in three is a due review. Review spacing is 1, 3, 7, 16, then 35 days. Mastery is Bayesian Knowledge Tracing (prior 0.15, learn 0.12, guess 0.25, slip 0.10), reached at probability at least 0.95 and at least 5 attempts. The seeded map is about twenty Common Core skills in grades 2–4: operations and algebraic thinking, base ten, fractions, and a little measurement. Item text is parametric and written ahead of time.

The demo teaches one full lesson (unit fractions, eight scenes, with a space theme and a soccer re-theme). Mastery there is a Check of 4 out of 5, including at least one plain unthemed item, then a delayed Review of 3 out of 3. Other skills show “Lesson preview coming soon” in the parent view. Interests may change the story and the quantities. Tests require the math itself to stay the same.

### Parent dashboard

Beacon Math shows each child, skill status (mastered, in progress, not started), confidence, recurring mix-ups, alerts when a skill stalls or a next skill is ready, a template weekly note filled from logged attempts, and CSV plus PDF export. Deleting a child removes that profile and its attempts, plans, sessions, and alerts. An admin can see counts and nicknames and cannot start practice or export a record.

The demo parent home shows a weekly snapshot. Progress holds the skill map, charts, and a print-to-PDF portfolio. Settings hold pause, a daily time limit, weekly time slots, interests, and a narration voice. A mock 4-digit PIN (any four digits) sits between a child profile and the parent.

## Proposed tiers

**Inferred** as a commercial menu. Nothing charges a card. The demo’s on-screen prices are a different menu, labeled “Demo pricing only”: $399 per child per year, $149 per child per quarter, $59 per child per month, and 30% off each additional child.

| Tier | Price | What we mean by it | Where it stands |
| --- | --- | --- | --- |
| Placement check | Free | The diagnostic, before any paid plan. | The demo ships a free 10-minute check. Beacon Math includes a diagnostic inside the parent account and shows no price. |
| Plus | $24 / month or $199 / year | **Inferred.** Ongoing practice for a family. | Not in either codebase. |
| Mastery (ESA) | $399 | **Inferred.** A record a Florida ESA family could use. | Not named in the code. The demo’s annual price is also $399 per child per year, packaged as the single family plan above. |
| Microschool | $120 / seat | **Inferred.** Per-seat price for a small school. | Not in either codebase. |

## Safety choices already in the apps

- No open chat and no model-written text in the child session.
- Beacon Math does not call a third-party analytics service. The demo copy says child data is not used to train models and is not sold. The demo has no backend, so that line is a promise in the UI, not a server control.
- Beacon Math stores a nickname and a grade, and the parent can delete the child record.
- Practice in Beacon Math waits until the parent approves the plan.

## What is explicitly still ahead

Beacon Math’s README lists the next product work: a real migration history before family data, email verification and password reset, a wider map than grades 2–4, a fuller diagnostic, teacher review of every explanation, and an accessibility pass. Those items are tracked in [TASKS.md](TASKS.md).
