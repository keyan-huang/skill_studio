# Skill Studio — Design Principles

> **Status:** Draft v0.4 · **Last updated:** 2026-11-24
>
> How Skill Studio should look, feel, and speak. Product scope lives in
> [SPEC.md](./SPEC.md).

## 1. Design principles

1. **Outcome first, details on demand.** Start every screen with the answer
   ("This report was shaped mostly by 2 skills"). Put raw detail one click
   away behind "Show details," never in the default view.
2. **Show, then tell.** Lead with a visual; use text to support it. If a
   visual needs a paragraph to explain, simplify the visual.
3. **One view, one question.** Each visualization answers a single question,
   written as its title (for example, "Which skill made this part?").
4. **Honest about certainty.** Clearly separate what we **know** from what we
   **infer**. Never make a guess look like a fact.
5. **Plain language everywhere.** No technical terms in the main interface.
   If one is unavoidable, explain it inline in one sentence.
6. **Safe to explore.** Viewing, uploading, mixing, and combining never
   change anything in VS Code. Only **Load back** does, and it always shows a
   preview first and can be restored in one click.
7. **Recommend, don't decide.** Skill Studio suggests; the user chooses. Every
   recommendation shows its reason and is easy to change.
8. **Calm the overload.** Users arrive with too many skills. Lead with a short
   summary ("23 skills, 4 clashes") and group by job, instead of showing
   everything at once.
9. **Show the journey's progress.** Upload → Mix → Combine → Load back is a
   clear, visible path, so users always know where they are and what comes
   next.

## 2. Voice and tone

- **Friendly, clear, calm.** Like a helpful colleague explaining a recording.
- **Short sentences.** One idea per sentence.
- **Use the glossary words** from [SPEC.md §5](./SPEC.md#5-key-concepts-glossary)
  (for example: skill, space, source, job, overlap, clash, mix, wins rule,
  combined skill, bundle, load back, park, restore, run, outcome). Don't
  invent synonyms.

| Instead of | Say |
| --- | --- |
| "Moved 5 directories to backup" | "Parked 5 skills. They're safe in Skill Studio. Restore them any time." |
| "Invalid SKILL.md frontmatter" | "This folder isn't a skill yet. It's missing its main instruction file." |
| "Write to `.github/skills/` succeeded" | "*team-specs* is now in your project. Start a new chat in VS Code to use it." |
| "Semantic similarity 0.91 between skills" | "These two skills do almost the same job" |
| "Conflicting directives detected" | "These two skills give opposite advice about tone" |
| "Skill excluded by ranking" | "Left out because *Team PRD Writer* already covers this" |
| "Tool call `read_file` executed" | "Read the file *Budget.xlsx*" |
| "Skill invoked via description match" | "Picked because your request mentioned *statements*" |
| "Token attribution: 0.62" | "Shaped about two-thirds of this section" |
| "Error: ENOENT" | "Couldn't find that file. It may have been moved or renamed." |

## 3. Visual language

### Direction: mixing desk

Skill Studio looks like a sound engineer's mixing desk (see
[DECISIONS.md](./DECISIONS.md) D-016). Each skill is a **channel strip**: a
colored band at the top for its job, a short description, who made it, and
its name on a **masking-tape label** at the bottom, like engineers label
channels. The tape label is the one bold element; everything around it stays
quiet.

| Token | Value | Use |
| --- | --- | --- |
| Console | `#1C2027` | Page background |
| Console edge | `#171A20` | Header |
| Bank | `#242A33` | Groups of strips, details panel |
| Strip | `#2D3440` | Channel strips, chips |
| Hairline | `#3B4452` | Borders and dividers |
| Ink / soft / faint | `#EEF0F3` / `#B3BAC6` / `#9AA3B2` | Text, all at least 4.5:1 on strips |
| Tape / tape ink | `#EAE3CF` / `#23262B` | Skill name labels, main buttons |
| Focus | `#9CC2FF` | Keyboard focus ring |
| Warning | `#FF8F7A` | Problems and clashes, always with an icon |
| Channel colors | `#7DB3FF` `#F4B860` `#74D3AE` `#E59BD8` `#C3A6FF` `#6FD6E6` `#D9C38A` `#FF9C85` | One per job, always shown with the job name |

- **Type:** one family, **Archivo** (bundled with the app, no online font
  service). Its width changes with the role: wide for the wordmark and page
  headline, normal for reading, narrow on tape labels, like printed console
  markings. Body text is 16px.
- **Shapes:** banks 14px corners, strips and controls 8px. No drop shadows.
- **Avoid:** all-caps labels, decorative sliders or knobs that don't mean
  anything yet, and a single neon accent color.
- Tokens live in `src/styles.css`.

### Color roles

Libraries can hold dozens of skills, too many for one color each. Color
therefore changes role by context:

| Where | What color means |
| --- | --- |
| **Library and overlap map** | Color = **job** (for example, all "Writing specs" skills share a color). |
| **Mix, combine, run, and contribution views** | Color = **skill**. A mix is small, so each skill in it gets its own color, kept the same across the mix builder, combine preview, run map, highlights, and charts. |
| **Load-back preview** | Color = **what will happen**: added, parked, or untouched. |
| **Everywhere** | Reserved colors for status: a warning color for **clash**, a neutral gray for **not in the mix / no skill involved**. |

- Use a palette of about 8 distinct, accessible colors.
- **Never rely on color alone.** Always pair color with a name, an icon, or a
  pattern.

### Space and source badges

Every skill shows two small badges:

- **Space** (where it lives in VS Code): **Project**, **Personal**,
  **Plugin**, **Extension**, or **Built-in**.
- **Source** (who made it): **Made by you**, **Your team**, **Official**,
  **Community**, or **Unknown**.

Use the same icons and wording everywhere. **Unknown** gets extra attention,
because users should check what it can access. Skills that can't be parked
(plugin, extension, built-in) show a small lock.

### Relationship markers

| Relationship | Marker |
| --- | --- |
| **Duplicate** | Stacked cards with a count ("×2") |
| **Overlap** | Grouped together in the same cluster |
| **Clash** | Connecting line in the warning color, with a warning icon |
| **Complement** | Soft, neutral connecting line |
| **Gap** | Empty slot with a dashed outline |

### Certainty styling

| Meaning | Style |
| --- | --- |
| **Certain** (directly produced by the skill) | Solid fill or solid line |
| **Likely** (inferred) | Lighter fill or dashed line, plus a "likely" label |
| **No skill involved** | Neutral gray |

### Layout

- Calm, spacious layout with plenty of white space; data is the focus.
- Side panel for details, so users never lose their place in the main view.
- Dark console theme first (D-016). ❓ Open: add a light theme later?

## 4. Visualization guidelines

Full list of views and priorities: [SPEC.md §10](./SPEC.md#10-visualizations).

| View | Purpose | Do | Avoid |
| --- | --- | --- | --- |
| **Library overview** | What I have and where it lives | Group by job, space and source badges, summary strip of totals and problems | One long flat list |
| **Overlap map** | Which skills do the same job or clash | Clusters by job, clear clash markers, click for explanation | Dense "hairball" network diagrams |
| **Side-by-side compare** | How similar skills differ | Columns per skill, highlight only the differences, one-line takeaway | Dumping full skill text |
| **Mix builder** | What's in my mix and why | One slot per job, alternatives behind each slot, "Left out" shelf with reasons, inline warnings | Hidden reasons, auto-applying changes |
| **Coverage check** | Does my mix cover my goal | Simple checklist: covered, covered twice, missing | Percentage scores |
| **Combine preview** | What's inside and where each part came from | Readable document with colored bands per original, "Made from" summary, settled clashes marked | Showing the raw instruction file first |
| **Load-back preview** | What will change in VS Code | Before and after, grouped into added, parked, untouched; toggle per parked skill; restore reminder | Lists of file paths |
| **Run map** | What happened, in order | Left-to-right flow, group steps under skills, collapse long sections | Showing every tiny step by default |
| **Contribution highlight** | Which skill made this part | Soft highlights like tracked changes, hover for reason | Heavy overlapping colors |
| **Contribution summary** | How much each skill mattered | Simple bars, sorted largest first | Pie charts with many slices, 3D charts |
| **Mix check** | Did the AI stick to my mix | Three groups: used as planned, didn't kick in, outside the mix | Technical matching scores |

General rules:

- Every chart has a **question as its title** and a **one-line takeaway**.
- Label things directly instead of relying on legends where possible.
- Keep animations short and purposeful (for example, tracing a path from a
  skill to the part of the outcome it shaped).

## 5. Key screens (first version)

Screens follow the loop in [SPEC.md §7](./SPEC.md#7-how-skill-studio-works).

1. **Home**: progress path (Upload → Mix → Combine → Load back), library
   summary ("23 skills from 2 spaces · 3 duplicates · 2 clashes"), loaded
   mix, saved mixes, recent runs, and a "Try with sample data" button.
2. **Connect a project**: recent projects, paste a folder location, an
   in-app folder browser (folders that look like projects are marked), and
   "Explore sample skills." Opens the last project automatically. Once a
   project is open, a **Project** dropdown in the header lists the user's
   projects (every project folder next to the open one and next to recent
   ones, such as everything in ~/Documents/Projects), plus "Sample skills"
   and "Another folder…" for quick switching.
3. **Search and download**: one search box above the banks with filters
   (All, This project, Your personal folder, Online). Online skills appear
   as a "crate" of dashed rows, since they aren't on the desk yet. Picking
   one opens a preview with its source, license, files, a scripts warning,
   and a **Download** button placed above the file list.
4. **Upload**: drop in skill files or folders; plain results ("Found 23
   skills · 1 folder isn't a skill yet").
5. **Library**: skill cards grouped by job, with space and source badges and
   search.
6. **Overlap map**: clusters by job with duplicate, overlap, and clash
   markers, plus a side-by-side compare.
7. **Skill detail**: plain summary, space, source, what it can access,
   related skills, and example runs.
8. **Mix builder**: goal at the top, job slots, "Left out" shelf, coverage
   check, wins rules, and **Save** / **Combine**.
9. **Combine**: choose combined skill or bundle (with the recommendation and
   reason), then the combine preview, name, and description.
10. **Load-back preview**: before and after of the VS Code space, parked-skill
   toggles, team warning when relevant, and **Load back**.
11. **Parked shelf**: every parked skill, why it was parked, and **Restore**.
12. **Run view**: outcome summary at the top, run map below, contribution
    highlight and summary side by side, details panel on the right.

## 6. States to design

Every screen needs these states, not just the "happy path":

- **Empty:** no runs or skills yet → show sample data and a clear first step.
- **Overloaded:** many skills → lead with the summary and groups, and point
  to the biggest problems first.
- **No overlaps found:** say so as good news, not as an empty screen.
- **Not a skill:** an uploaded folder isn't a valid skill → explain what's
  missing and skip it without blocking the rest.
- **Can't park:** a skill comes from a plugin, extension, or built-in source →
  show the lock and explain how to turn it off in VS Code.
- **Team warning:** parking a shared project skill → explain who it affects
  before confirming.
- **Loaded:** after loading back → confirm what changed and remind the user
  to start a new chat in VS Code.
- **Loading:** show progress for anything slower than about a second.
- **Partial data:** some steps or contributions are unknown → say so plainly.
- **Error:** explain what happened and what to do next, in plain language.
- **Private content hidden:** show that something was hidden for privacy, not
  that it's missing.

## 7. Accessibility

- Meet **WCAG 2.2 AA** (the standard accessibility checklist for color
  contrast, keyboard use, and screen readers).
- Every visualization has a text alternative (for example, a list or table
  version).
- Everything works with a keyboard.
- Respect "reduce motion" settings.

## 8. Open design questions

1. ❓ How do we show contribution when it's spread across the whole outcome
   (for example, a tone-of-voice skill)?
2. ❓ How many skills can a run map show before it needs grouping?
3. ❓ How does the overlap map stay readable with 50+ skills?
4. ❓ Where does the loaded mix live in the interface so it's always visible
   but not in the way?
5. ❓ How do we show a combined skill's colored bands clearly when one
   section blends several originals?
6. ❓ Add a light theme later? (Dark comes first, D-016.)
7. ❓ Do we need a brand identity now, or use a neutral style for the
   prototype?
8. ❓ If Skill Studio lives inside VS Code, should it follow VS Code's look
   or have its own?
