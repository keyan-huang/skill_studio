# Instructions for AI coding assistants

These rules apply to any AI assistant (for example, GitHub Copilot) working in
this repository.

## What this project is

**Skill Studio** helps non-technical people take control of AI skills they've
collected from many sources. Users **upload** skills, **mix** them (Skill
Studio shows overlaps and clashes and recommends a combination for a goal),
**combine** the mix into one result, and **load it back** into VS Code, where
overlapping originals are safely parked. It then visually explains how each
skill shaped the result. **VS Code first.** Main scenario:
[docs/SPEC.md §2](./docs/SPEC.md#2-main-scenario).

Before making changes, read:

1. [docs/SPEC.md](./docs/SPEC.md) — what we're building and for whom
2. [docs/DESIGN.md](./docs/DESIGN.md) — look, feel, and wording rules
3. [docs/ROADMAP.md](./docs/ROADMAP.md) — current phase and what's in scope
4. [docs/DECISIONS.md](./docs/DECISIONS.md) — decisions already made

**Current phase:** Phase 1 (MVP), step 1 done. See
[docs/ROADMAP.md](./docs/ROADMAP.md) for the next step.

**How it's built:** a local web app (D-006). React + TypeScript + Vite for the
page in `src/`, and a small Node helper in `server/` that reads skill folders
and only accepts requests from this computer. Node runs the helper's `.ts`
files directly; there's no separate build step.

- Start: `npm start` (opens the browser; set `SKILL_STUDIO_NO_OPEN=1` to skip
  opening it).
- Check types: `npm run typecheck`.
- Made-up sample skills live in `sample-data/`; keep them made up.

## Who you're working with

The project owner is a **product designer, not an engineer**.

- Explain things in plain, designer-friendly language. Describe what a change
  does for the user, not how the code works.
- Lead with the outcome, then only the details that matter.
- If a technical term is unavoidable, explain it in one sentence.
- Say plainly what's assumed, blocked, or unverified.

## How to build

- **Stay in scope.** Build what the current roadmap phase asks for. Don't add
  unrequested features.
- **Functionality first.** Make it work as described before polishing.
- **Follow [DESIGN.md](./docs/DESIGN.md)** for wording, colors, certainty
  styling, accessibility, and screen states.
- **Use the glossary** in [SPEC.md §5](./docs/SPEC.md#5-key-concepts-glossary)
  for names in the interface and in code.
- **Use the design skills for UI work.** For any screen, layout, color,
  typography, chart, or accessibility work, use the **frontend-design** and
  **ui-ux-pro-max** skills, together with DESIGN.md (DESIGN.md wins if they
  disagree). Skills used are listed in [skills.md](./skills.md); add a
  change-log line there when a skill is used for a build step.
- **Code wins over docs.** If code and docs disagree, the code is the source of
  truth; point out the mismatch and update the docs.
- **Ask before big choices** that change the design, scope, or are hard to
  undo (for example, choosing a framework or data storage).

## Keeping docs in sync

- When a decision is made, add or update an entry in
  [docs/DECISIONS.md](./docs/DECISIONS.md).
- When a feature is finished, tick it off in
  [docs/ROADMAP.md](./docs/ROADMAP.md).
- When behavior changes, update [docs/SPEC.md](./docs/SPEC.md).

## Testing

Keep testing to the minimum needed to show a change works. The owner prefers
speed over exhaustive checks.

**Do:**

- Check that the feature works once, in the simplest way that proves it.
- Run only the tests affected by the change while working.
- Run the full test suite **at most once**, at the end of a task.
- Prefer updating an existing test over adding a new one.

**Don't:**

- Don't test documentation-only or wording-only changes.
- Don't re-run tests that already passed unless the code they cover changed.
- Don't run the same check in more than one way (for example, both a test
  and a manual check of the same thing).
- Don't write new tests unless the owner asks or the change is risky (see
  below).
- Don't write tests for visual styling, copy, colors, layout, constants, or
  simple pass-through code.
- Don't copy the same test into several files.
- Don't make repeated live checks that use paid AI services or limited
  quotas. Use sample data instead.

**Worth testing in this project (risky because mistakes can lose or break a
user's skills):**

- Load back, park, and restore: originals are never altered or lost, and
  restore returns everything exactly as it was.
- Combined results follow VS Code's skill format rules
  ([SPEC.md §11](./docs/SPEC.md#11-vs-code-first)), since VS Code silently
  ignores skills that break them.

When reporting back, say briefly what was checked and what wasn't.

## Privacy and security

- Never put secrets, tokens, or real personal information in code, tests,
  sample data, commits, or chat. Use made-up placeholder data.
- Keep secrets in local `.env` files, which are excluded from Git.
- Follow the privacy rules in [SPEC.md §12](./docs/SPEC.md#12-privacy-and-trust):
  local by default, never change the contents of original skill files (park
  them instead), and tell the user before anything is sent to an outside
  service.
- Anything that writes into VS Code's skill folders must show a preview
  first and be fully restorable. Follow the VS Code skill format rules in
  [SPEC.md §11](./docs/SPEC.md#11-vs-code-first), and re-check VS Code's
  documentation because it changes often.

## Actions that need permission

Don't commit, push, deploy, change secrets, or use paid or limited services
unless the owner asks. Before doing any of these, explain in plain words what
will change. Before committing, check whether the repository is public and
what's being committed.
