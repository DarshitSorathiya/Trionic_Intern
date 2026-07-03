# Intern Onboarding Guide

**Read this end-to-end on Day 1. Save it as a bookmark.**

You'll be coding alongside 32 others over 6 weeks. The faster you get comfortable with the Git/GitHub workflow below, the easier everything else gets.

If you've never used Git seriously, don't worry — this guide assumes zero prior experience. Just follow it step by step.

---

## Table of contents

1. [Before you start: accept the invite](#1-before-you-start-accept-the-invite)
2. [One-time setup on your laptop](#2-one-time-setup-on-your-laptop)
3. [Clone the repo](#3-clone-the-repo)
4. [Find your Week-1 task](#4-find-your-week-1-task)
5. [The daily workflow (branch → code → commit → PR)](#5-the-daily-workflow-branch--code--commit--pr)
6. [Code review etiquette](#6-code-review-etiquette)
7. [Weekly progress reports](#7-weekly-progress-reports)
8. [Friday Demo Day](#8-friday-demo-day)
9. [Final project submission (Week 6)](#9-final-project-submission-week-6)
10. [Common problems & fixes](#10-common-problems--fixes)
11. [Where to ask for help](#11-where-to-ask-for-help)

---

## 1. Before you start: accept the invite

1. Open the email **"Trionic-Interns has invited you to..."** in the inbox you gave us.
2. Click the **"Join @Trionic-Interns"** button.
3. Sign in to GitHub if asked. **Use the same GitHub account whose handle you submitted in the form.**
4. Accept the invite.

You should now see the org listed at `https://github.com/Trionic-Interns`.

**If you can't find the email:** check spam. Still nothing? Tell the repo managers in the cohort chat and they'll re-send.

---

## 2. One-time setup on your laptop

You only do these things once. Time budget: ~20 minutes.

### 2.1 Install the tools

| Tool | Why | How |
|---|---|---|
| **Git** | The version-control system | macOS: `brew install git`. Windows: install [Git for Windows](https://git-scm.com/download/win). Ubuntu: `sudo apt install git` |
| **Node.js 20** | Required for the project. Use `nvm` to manage versions | macOS/Linux: install [nvm](https://github.com/nvm-sh/nvm), then `nvm install 20`. Windows: [nvm-windows](https://github.com/coreybutler/nvm-windows) |
| **pnpm 9** | Our package manager | `npm install -g pnpm@9` |
| **VS Code** | The editor we recommend | [code.visualstudio.com](https://code.visualstudio.com) |
| **GitHub CLI** (optional but recommended) | Makes opening PRs and accepting reviews much easier | `brew install gh` / [other installers](https://cli.github.com) |

Check each install:

```bash
git --version           # should print 2.x or higher
node --version          # should print v20.x.x
pnpm --version          # should print 9.x.x
```

### 2.2 Set your Git identity (so commits have your name)

Run these once with your real name and the email tied to your GitHub account:

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

Verify:

```bash
git config --global --get user.name
git config --global --get user.email
```

### 2.3 Authenticate with GitHub

This lets your laptop push/pull to private repos. **The easiest way** is with the GitHub CLI:

```bash
gh auth login
```

Pick:
- **GitHub.com**
- **HTTPS** (easier than SSH for beginners)
- **Login with a web browser**

Follow the prompts. You'll paste a one-time code into your browser. Done.

> **No GitHub CLI?** You can also create a [Personal Access Token](https://github.com/settings/tokens) with `repo` scope, and use it as your password when Git asks. Or set up SSH keys (more advanced — search "GitHub SSH key" if you want to go that route).

### 2.4 Editor settings (highly recommended)

Open VS Code → install these extensions:

- **ESLint** (linting feedback)
- **Prettier** (auto-format on save)
- **GitLens** (Git history in editor)
- **GitHub Pull Requests and Issues** (review PRs without leaving VS Code)

In VS Code settings, turn on **Format On Save**.

---

## 3. Clone the repo

"Cloning" means downloading the repo to your laptop.

```bash
# Pick a folder where you keep code, then:
cd ~/code            # or wherever — adjust path
gh repo clone Trionic-Interns/trionic-ai-adalat
cd trionic-ai-adalat
```

(If you didn't install `gh`, use: `git clone https://github.com/Trionic-Interns/trionic-ai-adalat.git`)

Install dependencies:

```bash
pnpm install
```

Open it in VS Code:

```bash
code .
```

Read these three files first:

- [`README.md`](../README.md) — overview
- [`PROJECT_BRIEF.md`](../PROJECT_BRIEF.md) — the full scope
- [`CONTRIBUTING.md`](../CONTRIBUTING.md) — the rules

---

## 4. Find your Week-1 task

Every intern has a personalized Week-1 issue. Find yours:

1. Go to **https://github.com/Trionic-Interns/trionic-ai-adalat/issues**
2. Filter by `milestone:"Week 1"` and `good first task`
3. Look for an issue where the body starts with `**Assignee:** @your-github-handle`

That's your task for the week.

**On Monday of Week 1**, comment `ack` on the issue. This is your acknowledgement to repo managers that you've seen it and are starting.

---

## 5. The daily workflow (branch → code → commit → PR)

This is the loop you'll repeat dozens of times. Memorize it.

### Step 1 — Always start by syncing `main`

```bash
git checkout main
git pull origin main
```

This pulls the latest changes everyone else has merged.

### Step 2 — Create a new branch for your work

Name it `<your-team>/<short-slug>`. Examples:

- `frontend/citation-drawer`
- `agents/citator-rfc`
- `pageindex/contract-act-spike`

```bash
git checkout -b agents/citator-rfc
```

### Step 3 — Make your changes

Edit files in VS Code. Save them. You can save and edit as much as you want — nothing is "real" until you commit.

### Step 4 — Check what you changed

```bash
git status            # which files are modified?
git diff              # what changed in those files?
```

### Step 5 — Stage and commit

"Staging" means picking which changes go into the next commit.

```bash
git add .                                 # stage all changes
# or stage specific files:
git add docs/RFC-citator-gatekeeper.md
```

Commit with a **Conventional Commit** message (see [CONTRIBUTING.md](../CONTRIBUTING.md#commit-messages)):

```bash
git commit -m "docs(agents): first draft of citator-gatekeeper RFC"
```

You can commit as often as you like. Small commits > one big commit.

### Step 6 — Push your branch to GitHub

```bash
git push -u origin agents/citator-rfc
```

The `-u origin` part you only need on the first push for that branch. After that, just `git push`.

### Step 7 — Open a Pull Request (PR)

The simplest way:

```bash
gh pr create --fill
```

This opens a PR with your commit message as the title. You can edit it.

**Or** click the link GitHub prints in your terminal after `git push`. **Or** go to the repo on github.com → it'll show a yellow banner offering to create a PR from your branch.

**Fill in the PR template properly.** Reviewers need:

- **What** — what changed
- **Why** — why it's needed (link the issue: `Closes #42`)
- **How to test** — commands or a Loom

### Step 8 — Wait for review, address feedback

A teammate or repo manager will leave comments. To respond:

1. Read the comment.
2. Push another commit fixing it.
3. Mark the conversation resolved (or let the reviewer do it).

When you get an **approval** + CI is green, you (or the reviewer) can merge.

> **Don't merge your own PR.** Wait for someone else to do it. This catches mistakes.

### Step 9 — After merge, clean up

```bash
git checkout main
git pull origin main
git branch -d agents/citator-rfc     # delete your local branch
```

That's one full cycle. Repeat for every piece of work.

---

## 6. Code review etiquette

**When someone reviews your PR:**

- Don't take feedback personally. Code review is about the code, not you.
- If you disagree, say so politely and explain why. Reviewers are not always right.
- If you change something based on the comment, push the change and reply "done" so the reviewer knows to re-check.

**When you review someone else's PR:**

- **Read the issue first** so you know what it's trying to do.
- Be specific: "This will fail when input is empty" beats "this looks weird".
- Use GitHub's **suggestion blocks** (the `±` icon) for line edits — it lets the author accept your fix in one click.
- Don't leave PRs without a verdict. Either **Approve** or **Request changes** within 24 hours of being asked.

---

## 7. Weekly progress reports

**This is the most important non-code thing you'll do.** Your institute internship report is built from these.

### Every Friday by 6 PM IST

Create a file at:

```
reports/<your-github-handle>/week-N.md
```

Replace `<your-github-handle>` with **exactly** your GitHub username (case matters). Replace `N` with the week number.

**Start from the template:**

```bash
mkdir -p reports/<your-github-handle>
cp reports/_template/week-N.md reports/<your-github-handle>/week-1.md
```

Then open `reports/<your-github-handle>/week-1.md` in your editor and fill it in.

### What "good" looks like

A good weekly report has:

- A **named, specific deliverable** ("Merged PR #42 for the citation drawer component")
- **PR/commit links** so reviewers can see your code
- A **30-second demo** (Loom screen recording, or screenshot if the work isn't visual)
- At least **one metric** if you can produce one (latency, % accuracy, tokens, count of items processed)
- **Honest blockers** ("I'm stuck on X because Y" — this is helpful, not weak)
- A **concrete plan** for next week — not "continue working on X"

A weak report has: "Worked on frontend. Will continue." Reviewers will push back.

### Committing your report

Same as any other change — branch, commit, push, PR:

```bash
git checkout main
git pull origin main
git checkout -b reports/<your-github-handle>-week-1
git add reports/<your-github-handle>/week-1.md
git commit -m "docs(reports): <your-handle> week 1"
git push -u origin reports/<your-github-handle>-week-1
gh pr create --fill
```

The repo managers will review and merge — they'll also add a 1-line written feedback at the bottom of your report. That feedback becomes your **mentor evaluation evidence** for your institute report.

---

## 8. Friday Demo Day

**Every Friday at 5 PM IST**, the whole cohort meets (video) for Demo Day.

- **Every intern gets 60 seconds** to show what they shipped this week.
- It's **recorded** — the recording goes into your weekly report.
- If you can't make it live, post in the cohort chat **at least 24 hours in advance** with a Loom of what you would have shown.

**Tips for a good demo:**

- Prepare. 60 seconds is short — practice once.
- Show, don't tell. Open a browser, run a command, point at a number that moved.
- "Here's what I built. Here's how it works. Here's what's next." Done.

---

## 9. Final project submission (Week 6)

In your last week, in addition to your final weekly report, you'll produce a **1-page contribution writeup**.

### The contribution writeup

Create:

```
reports/<your-github-handle>/final.md
```

It should answer:

1. **What I owned** — the named module, agent, or feature
2. **What I shipped** — bullet list of merged PRs with links
3. **What I learned** — technical + non-technical (one paragraph each)
4. **Metrics** — what numbers improved because of your work (citation validity went from X to Y, latency dropped from A to B, etc.)
5. **What I'd do differently** — short, honest

### What you'll have at the end (everything you can show your college)

| Artifact | Where |
|---|---|
| Your commits & merged PRs | github.com/Trionic-Interns/trionic-ai-adalat/pulls?q=author:your-handle |
| Six weekly reports | `reports/<your-handle>/week-1.md` … `week-6.md` |
| Final contribution writeup | `reports/<your-handle>/final.md` |
| Demo Day recordings (with you in them) | Linked from your weekly reports |
| Mentor feedback lines | Bottom of each weekly report |
| **Trionic Internship Certificate** | Generated and emailed in the final week |

**All of this is yours to use** in your institute internship report, viva, LinkedIn, future job interviews. The repo stays accessible to you after the program (read-only for non-Trionic work).

---

## 10. Common problems & fixes

### "I forgot to create a branch and committed to main"

Don't push yet. Move your commit to a new branch:

```bash
git branch agents/my-feature      # save the commit as a new branch
git reset --hard origin/main      # reset your main back to where it was
git checkout agents/my-feature
```

Now push your branch and open a PR.

### "Git says my branch is behind main"

Other people merged changes while you were working. Pull them in:

```bash
git checkout main
git pull origin main
git checkout your-branch
git merge main
# resolve any conflicts, then:
git push
```

### "Merge conflict!"

VS Code is great for this. Open the conflicted file — you'll see `<<<<<<<`, `=======`, `>>>>>>>` markers. Pick which version to keep (or combine both), delete the markers, save, then:

```bash
git add <the-file>
git commit -m "fix: resolve merge conflict"
git push
```

### "Permission denied" when pushing

Your auth probably expired. Run:

```bash
gh auth status
gh auth refresh
```

### "I accidentally committed a secret / API key"

**Stop. Do not push.** Tell the repo managers immediately. They'll help you scrub the history. Once a secret is pushed publicly it's effectively leaked.

If you already pushed: rotate the key (regenerate it) **before** doing anything else.

### "My CI is red and I don't know why"

Click the failing check on your PR → "Details" → scroll to the red step. The error message is usually exact ("test foo failed", "type error at file:line").

If you genuinely don't understand, paste the error in cohort chat. Don't merge a red PR.

### "I'm assigned to two teams"

That's fine — Sohil is too (Team A + repo managers). You belong to all teams you've been added to.

---

## 11. Where to ask for help

| Question | Where |
|---|---|
| Quick "how do I…" | Cohort chat (Discord / WhatsApp — link in invite) |
| Stuck on your task | Comment on your Week-N issue, tag your team lead |
| Don't know who your team lead is | See [`PROJECT_BRIEF.md` § 9](../PROJECT_BRIEF.md#9-team--module-ownership-final) |
| Bug in another team's package | Open an issue with `type:bug` label, tag the package owner |
| Unsure about scope of your work | Tag Dhruv Lokadiya or Sohil Kareliya (repo managers) |
| Something is on fire | Tag the repo managers, label the issue `priority:p0` |

---

## Final note

Six weeks is short. The first week feels slow because everyone is reading docs and writing RFCs — that's normal. By Week 3, real things will be shipping every day. Trust the process, ship small, commit often.

Welcome to Trionic. Let's build something good.
