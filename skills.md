# Skill Studio — Skills Log

Skills are reusable instruction packs that teach the AI agent how to do a task.
This file records every skill used in this project.

## Development skills (installed locally)

Installed in `~/.copilot/skills/` on the developer's computer. Not stored in this repo.
They're the same skills used in the Jobpot project.

| Skill | Source | License | Used for |
| --- | --- | --- | --- |
| frontend-design | [anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/frontend-design) | Apache 2.0 | Visual direction, typography, non-generic UI |
| ui-ux-pro-max | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | MIT | Palettes, font pairings, UX rules, charts, design tokens (community skill) |

To install one: copy its folder (the one containing `SKILL.md`) into `~/.copilot/skills/`.

## Skill Studio skills (stored in this repo)

None yet. When added, they go in `.github/skills/`, where GitHub Copilot finds
them automatically.

## Change log

- 2026-11-24: Added frontend-design and ui-ux-pro-max as development skills
  (already installed locally; same setup as Jobpot).
- 2026-11-24: Phase 1, step 1 (foundation): used frontend-design and
  ui-ux-pro-max for the mixing-desk look (palette, Archivo type, channel
  strips with tape labels, accessibility basics), and typescript-setup for
  the TypeScript settings.
