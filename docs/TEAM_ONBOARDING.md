# Joining the team

Plain steps for a teammate. Jamie ([@SIDev26](https://github.com/SIDev26)) owns the GitHub repo [SIDev26/Tutor](https://github.com/SIDev26/Tutor). It is a public repository on a personal account, not a GitHub organization.

You can use Cursor (Grok), Claude, or ChatGPT. The git rules are the same either way: branch, open a pull request, and wait for Jamie’s review. [CONTRIBUTING.md](../CONTRIBUTING.md) is the short version of those rules.

## 1. Accept the GitHub invite

Jamie adds you from the repo’s **Settings → Collaborators**. GitHub sends an email and shows an invitation in your notifications. Open the invitation and accept it.

You need write access so you can push a branch. Write access is not permission to push to `main`.

## 2. Get the code

```sh
git clone https://github.com/SIDev26/Tutor.git
cd Tutor
git checkout main
git pull
```

Read [docs/README.md](README.md) before you change anything.

The apps are not on `main` yet.

- Beacon Math is pull request [#1](https://github.com/SIDev26/Tutor/pull/1), branch `cursor/beacon-math-mvp-c73d`. Its README on that branch explains how to run it.
- The K-5 Tutor demo is pull request [#2](https://github.com/SIDev26/Tutor/pull/2), branch `cursor/k5-tutor-demo-761a`, folder `k5-tutor-demo/`.

Start new work from an up-to-date `main` unless Jamie asks you to continue one of those branches.

## 3. Connect the assistant you use

Connect only your own account. Grant this repository, not every repo you own, when the screen lets you choose. Do not paste tokens, API keys, or passwords into the repo or into a pull request.

### Cursor (Grok)

Open this repo in Cursor after GitHub is connected on your Cursor account. A cloud agent, or the agent in the editor, should work on a new branch and open a pull request as you. In the pull request, say that Grok in Cursor did the work.

Cursor’s own GitHub connection screen moves. Use Cursor’s account settings if the repo is missing from the agent. This guide does not describe a separate “Grok Bot” GitHub App.

### Claude

These are two different connections.

**Read the repo in claude.ai.** Claude’s GitHub connector can add a repository to a chat or a project so Claude can read files. Anthropic’s connector doc is [claude.com/docs/connectors/github](https://claude.com/docs/connectors/github). Connect GitHub there, then add `SIDev26/Tutor`. That connector reads file names and contents. Anthropic’s doc says it does not see commit history, pull requests, or issues, and it does not by itself edit the repo or open a pull request.

**Change code and open pull requests with Claude Code.** The Claude GitHub App is [github.com/apps/claude](https://github.com/apps/claude). Installing it on this repository needs an admin (Jamie). After it is installed, Claude Code can respond on pull requests and issues. From a local clone, Claude Code’s documented quick setup is the `/install-github-app` command, which can add GitHub Actions workflow files and a repository secret. Put that setup in its own pull request. Never commit the key. You can also use Claude Code only on your machine: it edits a branch, and you open the pull request yourself.

Claude Code reads [CLAUDE.md](../CLAUDE.md), which points at [AGENTS.md](../AGENTS.md).

### ChatGPT and Codex

These are also two different connections.

**Read the repo in ChatGPT.** OpenAI’s help article [Connecting GitHub to ChatGPT](https://help.openai.com/en/articles/11145903-connecting-github-to-chatgpt) says to open **Settings → Plugins**, choose GitHub, and authorize the ChatGPT app for the repositories it may read. The same article says this GitHub app reads code so ChatGPT can answer questions. It does not push commits or open pull requests. Use Codex for that.

**Edit and open pull requests with Codex.** In ChatGPT, open Codex and connect GitHub. GitHub asks you to install the ChatGPT Codex Connector and to pick repositories. Limit it to `SIDev26/Tutor` if you can. Codex cloud tasks can then work on a branch and open a pull request. A pull request comment `@codex review` asks Codex to review, after code review is turned on for the repo. OpenAI’s current write-up is [Review GitHub pull requests with Codex](https://learn.chatgpt.com/docs/third-party/github). Public pages list that review on ChatGPT Plus, Pro, Business, Enterprise, and Edu. Menu names differ between the current Codex settings and the older Codex Cloud environments screen. If a control is missing, follow the OpenAI page above rather than guessing.

Codex reads [AGENTS.md](../AGENTS.md).

## 4. Open a pull request

```sh
git checkout main
git pull
git checkout -b yourname/short-topic
# edit, then:
git status
git add -p
git commit
git push -u origin yourname/short-topic
```

Open the pull request against `main` on GitHub, or with `gh pr create`. The template in `.github/pull_request_template.md` loads by itself. Fill it in, including which assistant produced the work. GitHub requests Jamie as a reviewer when code owners are turned on. Until then, request `@SIDev26` yourself.

Leave the pull request for review. The author does not merge it.

## 5. Keep the docs in step with the work

Before you edit, read [PRODUCT_BRIEF.md](PRODUCT_BRIEF.md), [DECISIONS.md](DECISIONS.md), and [TASKS.md](TASKS.md).

- A new or changed decision gets a row at the top of `DECISIONS.md`, with the date and the reason.
- Starting or finishing work moves a row in `TASKS.md`.
- Do both in the same pull request as the change they describe.

If you are unsure whether a product claim is true in the code, mark it **Inferred** the way the product brief does.

## 6. Secrets

Do not commit `.env` files, tokens, API keys, or real passwords. Beacon Math’s `.env.example` on its branch uses placeholders. The seeded demo passwords in that app’s README are for local development only. Do not copy them into a new file, and do not reuse them anywhere real.
