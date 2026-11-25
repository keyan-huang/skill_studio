# Skill Studio — Decisions Log

A short record of important decisions and why we made them, so we don't
re-argue them later. Newest at the bottom.

## How to add a decision

Copy this block, give it the next number, and fill it in:

```markdown
### D-000 — Short title

- **Date:** YYYY-MM-DD
- **Status:** Proposed | Accepted | Replaced by D-000
- **Decision:** What we decided, in one or two sentences.
- **Why:** The main reason.
- **Trade-off:** What we give up.
```

Statuses:

- **Proposed** — suggested, not yet agreed.
- **Accepted** — agreed; build to this.
- **Replaced** — no longer true; points to the newer decision.

---

### D-001 — Write the spec before building

- **Date:** 2026-11-24
- **Status:** Accepted
- **Decision:** Plan the product in [SPEC.md](./SPEC.md), [DESIGN.md](./DESIGN.md),
  and [ROADMAP.md](./ROADMAP.md) before choosing technology or writing code.
- **Why:** The audience and visual experience matter more than the
  technology; getting them right first avoids rework.
- **Trade-off:** Nothing to click yet.

### D-002 — Design for non-technical users first

- **Date:** 2026-11-24
- **Status:** Accepted
- **Decision:** The primary user is someone who uses AI assistants but
  doesn't code. Engineers are welcome but not the design target.
- **Why:** Engineers can already read raw logs; non-technical users have no
  good way to understand skills today.
- **Trade-off:** Some advanced detail is hidden by default.

### D-003 — Visualization is the core of the product

- **Date:** 2026-11-24
- **Status:** Accepted
- **Decision:** Every main question (what happened, which skill made this,
  how much did it matter) is answered with a visual first.
- **Why:** Visuals make cause and effect easier to grasp than text logs.
- **Trade-off:** More design and build effort per feature.

### D-004 — Keep user data on the user's device by default

- **Date:** 2026-11-24
- **Status:** Proposed
- **Decision:** Store skills and run records locally. Only send data to an
  outside service (for example, an AI service for summaries) after telling the
  user and getting their OK.
- **Why:** Run records can contain private documents and personal data.
- **Trade-off:** Harder to share across devices or with a team.

### D-005 — Start with sample data, then one real AI tool

- **Date:** 2026-11-24
- **Status:** Accepted. The first real tool is VS Code (see D-010).
- **Decision:** Build the prototype on made-up sample data, then support one
  AI tool before adding others.
- **Why:** Each AI tool records runs differently; focusing on one keeps scope
  small and lets us test the experience sooner.
- **Trade-off:** Early users of other AI tools can't use their own data yet.

### D-006 — Local web app, built with React, TypeScript, and Vite

- **Date:** 2026-11-24
- **Status:** Accepted
- **Decision:** Skill Studio is a **local web app**: a small helper runs on the
  user's computer and the page opens in their browser. Built with React,
  TypeScript, and Vite (the same building blocks as Jobpot). Start it with
  `npm start`.
- **Why:** Easy drag and drop in the browser, and skills never leave the
  computer. The helper only accepts requests from the same computer.
- **Trade-off:** Users need Node.js installed and must start the app from a
  terminal (a double-click app icon could come later).

### D-007 — Main scenario: too many overlapping skills, solved by mixes

- **Date:** 2026-11-24
- **Status:** Accepted
- **Decision:** The product centers on users who have collected many skills
  from different sources, often overlapping or clashing. Skill Studio helps
  them build a **mix** (a chosen combination of skills) so results are more
  in their control. Explaining results supports this; it isn't the whole
  product.
- **Why:** Overload and overlap are the root cause of unpredictable results.
  Giving users a controlled combination fixes the cause, not just the
  symptom.
- **Trade-off:** Skill Studio must change which skills the AI tool uses,
  instead of only reading what happened. This adds work and needs careful
  permission and undo.

### D-008 — Recommend, don't decide

- **Date:** 2026-11-24
- **Status:** Proposed
- **Decision:** Skill Studio recommends a mix and explains every choice, but
  never loads back, parks, or changes VS Code without the user's
  confirmation.
- **Why:** The goal is to give users control. Silent automatic choices would
  repeat today's problem.
- **Trade-off:** One extra confirmation step.

### D-009 — Never change the contents of original skills

- **Date:** 2026-11-24
- **Status:** Accepted
- **Decision:** Skills are uploaded as copies. Mixes, wins rules, notes, and
  friendly names are stored by Skill Studio as a layer on top. When an
  original needs to get out of the way, it's **parked** (moved), never edited
  (see D-013).
- **Why:** Skills come from teams and other people. Editing them could break
  them for others and makes updates messy. (Analogy: using component
  overrides instead of detaching a component.)
- **Trade-off:** Users who want to permanently fix a skill still need to edit
  it at its source.

### D-010 — VS Code first

- **Date:** 2026-11-24
- **Status:** Accepted
- **Decision:** The first version uploads skills from, and loads results back
  into, GitHub Copilot in VS Code.
- **Why:** It's where our target users already use skills, and it has
  documented places where skills live and clear format rules.
- **Trade-off:** Users of other AI tools have to wait.

### D-011 — The flow is upload → mix → combine → load back

- **Date:** 2026-11-24
- **Status:** Accepted
- **Decision:** Users upload skills into Skill Studio and mix them. Skill
  Studio combines the mix into one ready-to-use result and loads it back into
  the space the skills came from.
- **Why:** Users get full control in the studio, and the AI tool ends up with
  only what they chose, without the user touching files.
- **Trade-off:** Skill Studio must write into VS Code's skill spaces, so it
  needs clear previews, permission, and restore.

### D-012 — The user chooses per mix: combined skill or bundle

- **Date:** 2026-11-24
- **Status:** Accepted
- **Decision:** Each mix can become either a **combined skill** (one merged
  skill) or a **bundle** (picked skills kept separate and packaged together).
  Skill Studio recommends one and explains why. The user decides.
- **Why:** Heavily overlapping skills behave most predictably when merged.
  Skills that do different jobs work best kept separate.
- **Trade-off:** Two forms to design, build, and explain.

### D-013 — Park originals instead of editing or leaving them

- **Date:** 2026-11-24
- **Status:** Accepted
- **Decision:** When a result is loaded back, overlapping originals are moved
  into Skill Studio's backup so VS Code no longer sees them. Their contents
  stay unchanged, and one click restores them. The user can choose which
  skills get parked.
- **Why:** If the originals stayed active, the AI could still pick them and
  the mix would lose its control. Moving them is safer than editing them.
- **Trade-off:** Parking a skill from a shared project can affect teammates
  (open question in [SPEC.md §15](./SPEC.md#15-open-questions)). Skills from
  plugins, extensions, and built-in sources can't be parked this way.

### D-014 — AI features use the connected project's own agent

- **Date:** 2026-11-24
- **Status:** Accepted
- **Decision:** When the user connects a project folder, Skill Studio detects
  which AI agent that project uses (for example GitHub Copilot, Claude Code,
  or Codex) and uses it for analysis: comparing skills, recommending
  combinations, and similar. The user approves before each use, and the
  agent runs read-only.
- **Why:** No extra AI account, key, or bill. The analysis comes from the
  same agent that will actually use the skills, and skill text only goes to a
  service the user already uses.
- **Trade-off:** Uses the user's own allowance. Skill Studio must support
  several agents. AI features don't work until an agent is found and signed
  in; everything else still does.

### D-015 — MVP scope: see, find, and compare skills

- **Date:** 2026-11-24
- **Status:** Accepted
- **Decision:** The first version connects to a project folder, shows every
  loaded skill (project and personal), lets users upload, search, and
  download skills, and compares skills or recommends a combination for a
  task. Combine, load back, and park come next (Phase 2).
- **Why:** Seeing and understanding skills is the first need, and it's
  useful on its own. It lets us test the experience before anything writes
  into VS Code's skill folders, except downloads, which never overwrite.
- **Trade-off:** The recommended combination is advice only in the MVP;
  users can't load it back yet.

### D-016 — Visual direction: mixing desk

- **Date:** 2026-11-24
- **Status:** Accepted
- **Decision:** Skill Studio looks like a sound engineer's mixing desk: a
  dark blue-graphite console, each skill a vertical channel strip with a
  colored channel band for its job and its name on a masking-tape label.
  Details in [DESIGN.md §3](./DESIGN.md#3-visual-language).
- **Why:** It matches the "mix" idea (like building a playlist) and gives the
  product a distinct identity.
- **Trade-off:** Dark first; a light theme would need its own checks.
