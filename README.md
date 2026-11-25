# Skill Studio

A space for non-technical people to take control of AI skills collected from
many sources: upload them, mix them into a recommended combination for a
goal, combine the mix, and load it back into VS Code. Then see visually how
each skill shaped the result.

## Project documents

- [Product spec](docs/SPEC.md): what we're building and for whom
- [Design principles](docs/DESIGN.md): look, feel, and wording
- [Roadmap](docs/ROADMAP.md): phases and milestones
- [Decisions log](docs/DECISIONS.md): key decisions and why
- [AI assistant instructions](AGENTS.md): rules for AI coding assistants
- [Skills log](skills.md): AI skills used to build this project

## Getting started

You need [Node.js](https://nodejs.org) version 22.18 or newer.

1. Open a terminal in this folder.
2. Run `npm install` (first time only).
3. Run `npm start`.

Skill Studio opens in your browser at `http://localhost:5317`. For now it
shows made-up sample skills; connecting your own project comes in the next
step. Press `Ctrl+C` in the terminal to stop it.

Skill Studio runs only on your computer and doesn't change any files.

## Local configuration

Keep secrets in local `.env` files, not in source code. These files are
excluded from Git, along with macOS `.DS_Store` files.
