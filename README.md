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

Skill Studio opens in your browser at `http://localhost:5317`. Connect a
project folder to see every skill loaded for it, including the ones from your
personal skills folder, or explore the made-up sample skills. Press `Ctrl+C`
in the terminal to stop it.

You can also search for public skills (from Awesome Copilot and Anthropic)
and download one into your project. Downloads never replace a skill you
already have.

You can ask your project's own AI agent (for example GitHub Copilot) to
compare two skills or suggest the best mix of skills for a task. Skill Studio
always shows what it will send and asks first.

Skill Studio runs on your computer. It only goes online to fetch public
skills from GitHub when you search or download them, and to ask your AI
agent when you approve it. It remembers your
recent projects and a saved list of online skills in `~/.skill-studio/`.

Optional: add `GITHUB_TOKEN=...` to a local `.env` file to raise GitHub's
request limit. `.env` files are never committed.

## Local configuration

Keep secrets in local `.env` files, not in source code. These files are
excluded from Git, along with macOS `.DS_Store` files.
