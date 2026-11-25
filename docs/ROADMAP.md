# Skill Studio — Roadmap

> **Status:** Draft v0.4 · **Last updated:** 2026-11-24
>
> Phases are ordered, not dated. A phase is done when its **exit criteria**
> are met. Feature details live in [SPEC.md](./SPEC.md).

## Phase 0 — Plan (done)

- [x] Draft spec, design principles, roadmap, decisions log, and AI assistant
      instructions.
- [x] Center the spec on the main scenario: too many overlapping skills, and
      mixes to take back control.
- [x] Define the flow: upload → mix → combine → load back, with VS Code first.
- [x] Decide where Skill Studio lives: a local web app (D-006).
- [x] Plan the MVP in build steps (D-015).
- [ ] Answer the other open questions in [SPEC.md §15](./SPEC.md#15-open-questions)
      as later phases need them.

## Phase 1 — MVP: see, find, and compare skills (current)

A local web app that connects to a project folder. Details in
[SPEC.md §14](./SPEC.md#14-first-version-scope).

- [x] **Step 1 — Foundation:** app setup with one start command (`npm start`),
      mixing-desk page layout, and made-up sample data (10 skills with a
      planted duplicate, overlaps, a clash, and a gap).
- [x] **Step 2 — Connect a project:** pick any project folder (browse,
      paste, or recent); show every skill loaded for it, from the project
      **and** the personal skills folders, with duplicates flagged; detect
      which AI agent the project uses.
- [ ] **Step 3 — Upload:** add `.md` files and skill folders by choosing or
      dragging and dropping; plain messages for anything that isn't a valid
      skill. *(Skipped for now; step 4 was built first.)*
- [x] **Step 4 — Search and download:** search your skills plus public
      catalogs (Awesome Copilot and Anthropic's skills); preview with license,
      files, and a scripts warning; download into the project without ever
      overwriting.
- [ ] **Step 5 — Compare and ideal combination:** using the project's own
      agent, after the user approves.
- [ ] **Step 6 — Polish and check:** remaining screen states, keyboard and
      contrast basics, one end-to-end walkthrough.

**Exit criteria:** a non-technical user connects their own project, sees
what's loaded, finds and downloads a skill, and gets an ideal combination
for a task, without help.

## Phase 2 — Combine and load back

- [ ] Overlap map with duplicate, overlap, and clash markers.
- [ ] Mix builder: recommendation from a goal, reasons, "Left out" shelf,
      wins rules, coverage check.
- [ ] Combine into a combined skill or bundle that passes VS Code's format
      rules, with combine preview.
- [ ] Load back into VS Code, park overlapping originals, and restore.
- [ ] Bring in real runs from VS Code and show how each skill shaped the
      outcome.
- [ ] Can't-park, team-warning, and partial-data states.

**Exit criteria:** a tester builds a mix, combines it, and loads it back. The
next VS Code chat uses only the mix, and Restore returns everything exactly
as before.

## Phase 3 — Refine and manage

- [ ] Mix check: did Copilot use only the loaded mix?
- [ ] "Improve this mix" suggestions based on results.
- [ ] Mix versions: re-combine, load back a new version, switch back, compare.
- [ ] Preview a mix with a sample request.
- [ ] Re-upload and update alerts when an original changes.
- [ ] Hide skills and add notes.

**Exit criteria:** a user improves a mix based on a result, loads back the new
version, and can see the difference between versions.

## Phase 4 — Insights and learning

- [ ] Library cleanup suggestions (never used, duplicates, outdated).
- [ ] Patterns across runs.
- [ ] Guided tour with sample data.
- [ ] Share mixes with a team.

**Exit criteria:** a new user learns what skills and mixes are from Skill
Studio alone, and a team can share one mix.

## Later / maybe

- Support for other AI tools and their skill spaces (for example, Copilot CLI
  or Claude).
- Export a run explanation or mix as a shareable page or image.
