# Skill Studio — Product Spec

> **Status:** Draft v0.3 · **Owner:** Product design · **Last updated:** 2026-11-24
>
> This is a working draft. Items marked **❓ Open** still need a decision. When
> one is decided, record it in [DECISIONS.md](./DECISIONS.md) and update this
> file.

## Contents

1. [Summary](#1-summary)
2. [Main scenario](#2-main-scenario)
3. [The problem](#3-the-problem)
4. [Who it's for](#4-who-its-for)
5. [Key concepts (glossary)](#5-key-concepts-glossary)
6. [Goals and non-goals](#6-goals-and-non-goals)
7. [How Skill Studio works](#7-how-skill-studio-works)
8. [User journeys](#8-user-journeys)
9. [Features](#9-features)
10. [Visualizations](#10-visualizations)
11. [VS Code first](#11-vs-code-first)
12. [Privacy and trust](#12-privacy-and-trust)
13. [How we'll know it works](#13-how-well-know-it-works)
14. [First version scope](#14-first-version-scope)
15. [Open questions](#15-open-questions)

## 1. Summary

Skill Studio helps **non-technical people take control of their AI skills**.

People collect skills from many places, and many of them do the same job,
overlap, or contradict each other. With Skill Studio, the user:

1. **Uploads** their skills into the studio.
2. **Mixes** them: the studio shows overlaps and recommends a combination of
   skills for a goal, and the user has the final say.
3. **Combines** the mix into one ready-to-use result.
4. **Loads it back** into the space the skills came from. Overlapping
   originals are safely **parked**, so the AI uses only the mix.

After the AI runs, Skill Studio shows **visually** how each skill shaped the
result, so the user can trust it and improve the mix.

**First supported tool: VS Code** (GitHub Copilot in VS Code).

> **Analogy:** a skill library is like a giant music collection pulled from
> many albums and friends, full of duplicates and different versions of the
> same song. Skill Studio lets you bring the collection in, build the right
> **playlist** for the occasion, and put it back on your player. The songs you
> didn't pick are set aside, not deleted.

## 2. Main scenario

### The story

*Maya (a made-up example user) is a product designer who uses GitHub Copilot
in VS Code every day.*

Over a few months she has collected skills from several places:

- Her **team's** project: "Team PRD Writer" and "Brand Voice."
- An **official** plugin: "Document Writer" and "Slide Maker."
- A **community** collection someone recommended: "PRD Pro," "Deck Builder,"
  and "Concise Writing."
- One she **made herself**: "My Spec Template."

She asks Copilot to "write a spec for the new onboarding flow." The result
works but surprises her: it uses a format she didn't expect, the tone is off,
and the next day the same request gives a different format.

What actually happened is invisible to her:

- **Three skills do the same job** (Team PRD Writer, PRD Pro, My Spec
  Template), and Copilot picked a different one each time.
- **Two skills clash:** Brand Voice says "warm and friendly," Concise Writing
  says "short and neutral."
- **One skill exists twice**: Document Writer is installed in both her project
  and her personal space, in slightly different versions.

### What Maya does with Skill Studio

1. **Upload:** She uploads her skills from VS Code. Skill Studio shows **all 9
   in one place**, labeled by where they came from. Her originals stay where
   they are.
2. **Spot overlaps:** An **overlap map** groups the three spec-writing skills,
   marks the **clash** between Brand Voice and Concise Writing, and flags the
   **duplicate** Document Writer.
3. **Mix:** She types her goal: *"Write product specs in my team's style."*
   Skill Studio **recommends a mix**: Team PRD Writer + Brand Voice + Document
   Writer (newest version). Every pick and every skill left out has a short
   reason. She sets a **wins rule**: Brand Voice wins over Concise Writing on
   tone. She saves the mix as **"Team specs."**
4. **Combine:** Because these skills overlap heavily, Skill Studio suggests
   merging them into **one combined skill**. She previews it. Each part is
   colored by the original it came from, and the tone clash is settled.
5. **Load back:** A preview shows what will change in VS Code. The combined
   "team-specs" skill will be **added**, five overlapping skills will be
   **parked**, and Slide Maker and Deck Builder stay **untouched**. She
   confirms.
6. **See what happened:** After her next spec, Skill Studio shows **which
   parts each skill shaped** and confirms Copilot **used only the mix**.

The same request now gives the same kind of result every time. Maya knows
why. If she changes her mind, **Restore** puts everything back exactly as it
was.

## 3. The problem

Skills are easy to collect and hard to keep under control.

| What happens | What the user experiences |
| --- | --- |
| **Overload:** skills pile up from many sources. | "I don't know what I have anymore." |
| **Overlap:** several skills do the same job in different ways. | "Why is the result different every time?" |
| **Clashes:** skills give contradicting instructions. | "The result feels inconsistent or off." |
| **Duplicates:** the same skill exists in several places or versions. | "Which one is it even using?" |
| **Gaps:** no skill covers part of the job. | "Why didn't it do that part well?" |
| **Invisible choices:** the AI quietly decides which skills to use. | "I can't control or trust the result." |

Today, sorting this out means reading raw skill files, moving folders by hand,
and digging through technical activity logs. Non-technical users can't do
that, so they either live with unpredictable results or rely on someone
technical.

## 4. Who it's for

| Persona | Who they are | What they need |
| --- | --- | --- |
| **The skill collector** (primary) | Designer, PM, writer, or analyst who uses AI in VS Code, doesn't code much, and has picked up skills from many places. | Fewer surprises: a clear, trustworthy combination of skills for each kind of work. |
| **The skill owner** | Someone who writes or shares skills for a team, with little coding experience. | Know whether their skill overlaps with others, and whether it's chosen and helpful. |
| **The team lead / educator** (secondary) | Someone who sets up or teaches AI workflows for others. | Recommended mixes they can share and explain visually. |

**Not the main audience:** engineers who are comfortable editing skill files
and reading logs. They're welcome to use it, but we don't design around them.

## 5. Key concepts (glossary)

Use these words consistently in the product, in code, and in these docs.

### Skills and where they live

| Term | Plain meaning | Analogy |
| --- | --- | --- |
| **Skill** | A reusable instruction pack the AI can pick up for a specific job. In VS Code, it's a folder with a main instruction file (`SKILL.md`) and sometimes templates or examples. | A component in a design system. |
| **Space** | A place where an AI tool looks for skills. VS Code has a **project space** (skills saved inside one project, shared with anyone who has that project) and a **personal space** (skills on your own computer, used in all your projects). | A shared team library versus your personal local components. |
| **Source** | Who a skill originally came from: made by you, your team, official, community, or unknown. | The album a song came from. |
| **Library** | All the skills uploaded into Skill Studio, from every space and source. | Your whole music collection. |
| **Job** | The kind of task a skill helps with (for example, "Writing specs," "Making slides," "Tone of voice"). | A playlist category or genre. |

### How skills relate to each other

| Term | Plain meaning |
| --- | --- |
| **Duplicate** | The same skill, present more than once (possibly in different spaces or versions). |
| **Overlap** | Different skills that do the same job in different ways. |
| **Clash** | Skills whose instructions contradict each other when used together. |
| **Complement** | Skills that do different jobs and work well together. |
| **Gap** | A job the goal needs that no skill in the mix covers. |

### The flow: upload → mix → combine → load back

| Term | Plain meaning | Analogy |
| --- | --- | --- |
| **Upload** | Bring copies of skills into Skill Studio. The originals stay where they are. | Importing assets into a design file. |
| **Goal** | What the user wants to get done, in their own words. | The occasion for a playlist. |
| **Mix** | A saved selection of skills for a goal, plus any wins rules. ❓ Open: final name, see §15. | A playlist. |
| **Recommendation** | Skill Studio's suggested mix, with a reason for every pick and every skill left out. | A suggested playlist you can edit. |
| **Wins rule** | The user's choice of which skill to follow when two skills in a mix clash. | Deciding which style overrides another. |
| **Combine** | Turn a mix into something the AI tool can use. There are two forms, chosen per mix: a combined skill or a bundle. | Getting a design ready for handoff. |
| **Combined skill** | One new skill that merges the picked skills' instructions, with clashes settled. | Flattening several layers into one. |
| **Bundle** | The picked skills kept separate, but cleaned up and packaged together, with clashes settled. | Grouping layers without flattening them. |
| **Load back** | Put the combined result into the space the skills came from, in VS Code. | Publishing a library update. |
| **Park** | Move an original skill into Skill Studio's safe backup so the AI tool stops seeing it. Its contents are never changed. | Moving a layer to a hidden archive page instead of deleting it. |
| **Restore** | Put parked skills back exactly as they were. | Moving the layer back from the archive page. |
| **Loaded mix** | The mix whose combined result is currently in VS Code. | The playlist that's playing. |

### Results

| Term | Plain meaning |
| --- | --- |
| **Run** | One complete request-and-response with the AI: what you asked, what it did, what it produced. |
| **Outcome** | The final result of a run (an answer, a file, a design, etc.). |
| **Step** | A single action the AI took during a run (read a file, use a tool, write text). |
| **Contribution** | The part of the outcome a skill shaped, and how strongly. |

## 6. Goals and non-goals

### Goals

1. **Control:** Let users decide exactly which skills the AI uses for a goal,
   by uploading, mixing, combining, and loading back, without touching files.
2. **Clarity:** Show every skill, where it lives, and how skills overlap or
   clash, in plain language.
3. **Guidance:** Recommend a good mix and the right way to combine it, and
   explain why, so users don't have to be experts.
4. **Safety:** Never lose or alter a user's original skills. Everything
   loaded back can be undone.
5. **Trust:** Show how each skill shaped a result, and whether the AI used
   only the mix.
6. **Visual first:** Answer each of the above with a visual, with text as
   support.

### Non-goals (for now)

- **Running the AI itself.** Skill Studio prepares which skills the AI gets
  and explains what happened. VS Code and Copilot do the work.
- **Editing original skills.** Originals are uploaded as copies, and parking
  only moves them. Their contents never change. (See
  [DECISIONS.md](./DECISIONS.md) D-009 and D-013.)
- **Choosing for the user without asking.** Recommendations are suggestions.
  Nothing is loaded back or parked until the user confirms. (See D-008.)
- **AI tools other than VS Code** in the first version. (See D-010.)
- A marketplace for buying or selling skills.
- Code-level editing of skill scripts.
- Team admin dashboards.

## 7. How Skill Studio works

The product follows one loop. Each stage has its own screen and visual.

```text
  Upload ─▶ Understand ─▶ Spot overlaps ─▶ Mix ─▶ Combine ─▶ Load back ─▶ See what happened
                                            ▲                                     │
                                            └──────────── Refine ◀────────────────┘
```

| Stage | User question | What Skill Studio does |
| --- | --- | --- |
| **Upload** | "What do I have?" | Brings copies of skills from VS Code into one library. |
| **Understand** | "What does each one do?" | Gives every skill a plain-language summary. |
| **Spot overlaps** | "Which ones do the same thing or fight?" | Groups skills by job and marks duplicates, overlaps, and clashes. |
| **Mix** | "Which ones should I use for this?" | Recommends a mix for a goal, explains each choice, and lets the user adjust. |
| **Combine** | "Turn my picks into one thing I can use." | Builds a combined skill or a bundle, with clashes settled, and previews it. |
| **Load back** | "Put it in VS Code and stop the others getting in the way." | Adds the result to the original space, parks overlapping originals, and offers one-click restore. |
| **See what happened** | "Did it work, and why?" | Shows how each skill shaped the outcome and whether only the mix was used. |
| **Refine** | "How do I make it better?" | Suggests changes, then re-combines and loads back a new version. |

## 8. User journeys

### Journey A — "Upload my skills" (P0)

1. The user connects a project folder, or drops in skill folders.
2. Skill Studio automatically checks **both** the project's skills **and**
   the user's personal skills folder, because personal skills load in every
   project. It shows one library with every skill as a card, labeled by
   space and source.
3. Duplicates are flagged right away. Anything that isn't a valid skill is
   explained in plain words.

**Success:** the user can say how many skills they have, where each one
lives, and where it came from.

### Journey B — "Show me what overlaps" (P0)

1. The user opens the **overlap map**.
2. Skills are grouped by job. Duplicates, overlaps, and clashes are clearly
   marked.
3. The user picks two similar skills and compares them side by side in plain
   language.

**Success:** the user can find every duplicate and clash in their library and
explain how two overlapping skills differ.

### Journey C — "Recommend a mix for my goal" (P0) — the core journey

1. The user describes a goal in their own words, or picks a starting
   template.
2. Skill Studio recommends a mix: one best skill per job, plus useful
   complements. Each pick and each skill left out has a reason.
3. A **coverage check** shows which jobs are covered and any gaps.
4. The user swaps, adds, or removes skills. Skill Studio warns right away if
   a change creates an overlap, clash, or gap.
5. If the user keeps two clashing skills, they set a **wins rule**.
6. The user names and saves the mix.

**Success:** from a goal, the user gets a mix they understand and agree with,
without opening any skill files.

### Journey D — "Combine and load back" (P0)

1. The user chooses how to combine: **combined skill** or **bundle**.
   Skill Studio recommends one and explains why.
2. A **combine preview** shows the result in plain language. Each part is
   colored by the original it came from, and settled clashes are marked.
3. The user clicks **Load back**. A **load-back preview** shows what will
   change in VS Code: **added**, **parked**, and **untouched** skills. The
   user can change which skills get parked.
4. The user confirms. Skill Studio loads the result back, parks the chosen
   originals, and reminds the user to start a new chat in VS Code.
5. **Restore** is always one click away, for one skill or everything.

**Success:** in a new VS Code chat, Copilot sees the combined result and none
of the parked originals. Restore brings everything back exactly as before.

### Journey E — "What happened in this result?" (P0)

1. The user brings in a run from VS Code.
2. Skill Studio shows the outcome first, then a **run map** of request →
   skills used → steps → outcome.
3. The user taps part of the outcome to see which skill shaped it.
4. A **mix check** shows whether Copilot used only the loaded mix (P1).

**Success:** the user can explain, in their own words, which skills produced
the result.

### Journey F — "Make my mix better" (P1)

1. From a result, the user taps **Improve this mix**.
2. Skill Studio suggests a change, such as swapping a skill, adding a wins
   rule, or switching from bundle to combined skill, and explains why.
3. The user re-combines and loads back a new version. The previous version
   is kept so they can switch back and compare results.

## 9. Features

Priority: **P0** = needed for the first usable version · **P1** = soon after ·
**P2** = later.

### 9.1 Upload skills — P0

- **From VS Code:** when the user connects a project folder, Skill Studio
  reads the project's skills **and automatically the personal skills
  folders** on the computer (see §11). Personal skills load in every project,
  so they count as loaded for this one.
  - The summary splits the total ("23 skills · 9 in this project · 14 from
    your personal folder").
  - Personal skill cards say "Loads in all your projects."
  - Each personal folder is matched to the agent that reads it; skills the
    connected agent wouldn't load are marked "Not loaded by [agent]" and not
    counted.
  - Only skill folders are read in the home folder, and nothing is changed.
- Users can also drop in skill folders directly. ❓ Open: the exact upload
  experience depends on where Skill Studio lives (see §15).
- **Copies only:** uploading never moves or changes the originals.
- Each skill card shows:
  - name and a one-line purpose
  - **space label:** Project · Personal · Plugin · Extension · Built-in
  - **source label:** Made by you · Your team · Official · Community · Unknown
  - when it was last updated
  - how often it's been used recently (once run data exists)
- **Plain-language checks:** if something isn't a valid skill (for example,
  the main instruction file is missing), say so and explain what to do.
- **Duplicates:** automatically flag the same skill found in more than one
  space.
- **Re-upload (P1):** notice when an original changed in VS Code since it was
  uploaded, and offer to refresh it.

**Done when:** a user uploads skills from both their project and personal
spaces, sees them all in one library labeled by space and source, and
duplicates are flagged.

### 9.2 Understand each skill — P0

- A plain-language summary for every skill:
  - **What it does**
  - **When it kicks in**
  - **What it changes** about how the AI works or writes
  - **What it can access** (files, internet, other apps)
- Raw content is available behind "Show details."
- ❓ Open: are summaries written by AI on the fly, by skill owners, or both?
  (Affects cost, accuracy, and privacy.)

### 9.3 Spot overlaps — P0

- Group every skill under one or more **jobs**.
- Mark how skills relate: **Duplicate**, **Overlap**, **Clash**, **Complement**.
- **Side-by-side compare** for two or more similar skills: purpose, approach,
  key differences in plain words, space, source, freshness, and past results.
- For clashes, show the exact instructions that contradict, in plain words
  (for example, "Brand Voice says *warm and friendly*; Concise Writing says
  *short and neutral*").
- Show confidence. Overlap and clash detection are estimates. Label them
  **certain** or **likely**.

**Done when:** in a sample library with planted overlaps, a user can find
every duplicate and clash within 2 minutes.

### 9.4 Build a mix (recommended combination) — P0 · the heart of the product

- **Start from a goal:** the user types what they want to do, or picks a
  template (for example, "Writing specs," "Making slides").
- **Recommendation:** Skill Studio suggests:
  - one best skill per job the goal needs
  - helpful complements
  - no duplicates, and no clashes unless a wins rule settles them
- **Reasons for everything:**
  - for each pick: "Chosen over *PRD Pro* because it's from your team and was
    updated last week"
  - for each skill left out: "Left out because it does the same job as *Team
    PRD Writer*"
- **How picks are ranked**, in plain terms:
  1. fit with the goal
  2. source trust (yours and your team's first, then official, then community)
  3. freshness
  4. past results, when run data exists
  5. the user's earlier choices
  - ❓ Open: confirm this order and whether users can change it.
- **Edit freely:** swap, add, or remove skills. Live warnings appear when a
  change creates an overlap, clash, or gap.
- **Wins rules:** when two kept skills clash, the user picks which one to
  follow for that topic.
- **Coverage check:** a checklist of the jobs the goal needs, each marked
  covered or missing.
- **Save and reuse:** name mixes, duplicate them, and keep several mixes for
  different kinds of work.

**Done when:** from a goal, a user gets a recommended mix with reasons in one
step, adjusts it, and saves it, without reading any skill files.

### 9.5 Combine — P0

The user chooses **per mix** how to combine it. Skill Studio recommends one
form with a reason (for example, "These skills overlap a lot, so one combined
skill will behave most predictably").

| | **Combined skill** | **Bundle** |
| --- | --- | --- |
| **What it is** | One new skill with the picked skills' instructions merged | The picked skills, kept separate, tidied and packaged together |
| **Best when** | Picked skills overlap heavily or clash; you want one predictable behavior | Picked skills do different jobs and work well side by side |
| **Control** | Highest: one skill, one set of instructions | High: only the picked skills, with clashes settled |
| **Closeness to originals** | Rewritten into one | Kept almost as-is |
| **How the AI uses it** | Reads the whole combined skill whenever it's needed | Reads each skill only when it's relevant |

**Combined skill:**

- Merges the picked skills' instructions into one, removes repetition, and
  applies wins rules.
- Keeps the supporting files the originals rely on (templates, examples,
  scripts).
- Records a **"Made from"** list, so every part can be traced to its original.

**Bundle:**

- Copies each picked skill and applies wins rules to the **copies**, never the
  originals.
- ❓ Open: how wins rules are written into a bundle (small edits to the copies,
  or a short shared "house rules" skill added to the bundle).

**Both forms:**

- **Combine preview** (see §10.6): read the result in plain language, colored
  by original, with settled clashes marked. Edit its name and description.
- **Ready for VS Code:** the result automatically follows VS Code's skill
  format rules (see §11), so it always loads.
- **The user reviews before anything leaves the studio.**
- ❓ Open: merging is likely written by AI. Confirm cost, quality checks, and
  privacy (see §12).

**Done when:** a user turns a saved mix into a combined skill or a bundle,
previews it with every part traced to its original, and the result passes
VS Code's format checks.

### 9.6 Load back — P0

- **Destination:** the space the skills came from. If a mix draws from both
  the project and personal spaces, Skill Studio asks which to use. It
  suggests **personal** for individual use and **project** for sharing with a
  team.
- **Load-back preview** (see §10.7): a before-and-after of the VS Code space,
  grouped into:
  - **Added:** the combined skill or bundle
  - **Parked:** originals now covered by the mix, plus overlapping skills
    that were left out
  - **Untouched:** unrelated skills
  - The user can change which skills get parked before confirming.
- **Park, don't delete:** parked originals move to Skill Studio's backup
  with contents unchanged. They're always listed on a **Parked** shelf.
- **Restore:** one click restores a single skill or undoes the whole load
  back.
- **Team caution:** parking a skill from a shared project space can remove it
  for teammates once project changes are shared. Show a clear warning first.
  ❓ Open: see §15.
- **Skills Skill Studio can't park** (from plugins, extensions, built-in, or
  MCP servers; see §11): show them in the preview, and explain in plain words
  how to turn them off in VS Code if they overlap.
- **After loading back:** remind the user to start a new chat in VS Code so
  Copilot picks up the change. Show the **loaded mix** on the home screen.

**Done when:** after loading back, a new VS Code chat sees the combined result
and none of the parked originals, and Restore brings everything back exactly
as before.

### 9.7 See what happened — P0

- Bring in a run from VS Code (❓ Open: how, see §11).
- Show the outcome first, in plain language.
- **Run map:** request → skills used → steps → outcome (see §10.8).
- **Contribution highlight and summary:** which skill shaped which part, and
  how much (see §10.9–10.10). For a combined skill, trace each part back to
  the original it came from, using the "Made from" list.
- Be honest about certainty: **certain** (the skill directly produced it)
  versus **likely** (inferred).
- **Mix check (P1):** did Copilot use only the loaded mix? Flag skills
  outside the mix that kicked in, and mix skills that never did.

**Done when:** a user can click any part of an outcome and see the skill(s)
behind it, or a clear "no skill involved" label.

### 9.8 Refine a mix — P1

- **Improve this mix:** suggestions based on results, such as swapping a
  skill, adding a wins rule, filling a gap, or switching between combined
  skill and bundle.
- Re-combine and load back a **new version**. The previous version is kept,
  and switching back is one click.
- Compare runs from two mixes, or two versions of one mix, side by side.

### 9.9 Preview a mix — P1

- Type a sample request and see which skills would likely kick in, before
  loading back.
- ❓ Open: a prediction only, or a real test run? A real run uses AI quota.

### 9.10 Manage the library and parked skills — P1

- **Parked shelf:** every parked skill, where it came from, why it was
  parked, and a Restore button.
- Hide skills the user never wants to see recommended.
- Add personal notes or friendly names (stored in Skill Studio, not in the
  original files).
- **Update alerts:** when an original changes after it went into a combined
  result, show what changed in plain words and offer to re-combine.

### 9.11 Insights and learning — P2

- Library cleanup suggestions: never-used skills, duplicates, outdated
  versions.
- Patterns across runs: most-used skills, skills that often appear together,
  skills that kick in when they shouldn't.
- Guided tour with sample data that teaches what skills and mixes are.
- Shareable mixes for teams (see §15).

## 10. Visualizations

Visualization is the heart of the product, not decoration. Each view answers
one clear question, used as its title. Visual rules live in
[DESIGN.md](./DESIGN.md).

| # | View | Question it answers | Stage | Priority |
| --- | --- | --- | --- | --- |
| 10.1 | Library overview | What do I have, and where does it live? | Upload | P0 |
| 10.2 | Overlap map | Which skills do the same job or clash? | Spot overlaps | P0 |
| 10.3 | Side-by-side compare | How are these similar skills different? | Spot overlaps | P0 |
| 10.4 | Mix builder | What's in my mix, and why? | Mix | P0 |
| 10.5 | Coverage check | Does my mix cover everything my goal needs? | Mix | P0 |
| 10.6 | Combine preview | What's inside the result, and where did each part come from? | Combine | P0 |
| 10.7 | Load-back preview | What will change in VS Code? | Load back | P0 |
| 10.8 | Run map | What happened, in order? | See what happened | P0 |
| 10.9 | Contribution highlight | Which skill made this part? | See what happened | P0 |
| 10.10 | Contribution summary | How much did each skill matter? | See what happened | P0 |
| 10.11 | Mix check | Did Copilot use only my mix? | See what happened | P1 |
| 10.12 | Mix compare | How did two mixes change the result? | Refine | P1 |

### 10.1 Library overview

Skill cards grouped by job, each with a **space badge** and a **source
badge**. A summary strip at the top shows total skills, spaces, and how many
duplicates and clashes were found, as a call to action.

### 10.2 Overlap map

Skills clustered by job. Inside a cluster, overlapping skills sit together.
Relationship markers:

- **Duplicate:** stacked cards
- **Overlap:** shared cluster
- **Clash:** a clearly marked connecting line with a warning icon
- **Complement:** a soft connecting line

Clicking any marker opens a plain-language explanation.

### 10.3 Side-by-side compare

Two to four skills in columns. Rows: purpose, approach, key differences
(highlighted), space, source, last updated, past results. A one-line takeaway
at the top, such as "Similar purpose; *Team PRD Writer* follows your team's
template."

### 10.4 Mix builder

A board with one **slot per job** the goal needs. Each slot holds the chosen
skill, with alternatives tucked behind it to swap in. A **"Left out" shelf**
lists skills that weren't picked, each with its reason. Warnings appear
inline as the user edits. Wins rules show as a small "follows X for tone"
label on the slot.

### 10.5 Coverage check

A checklist beside the mix builder: each job the goal needs, marked
**covered**, **covered twice** (overlap), or **missing** (gap).

### 10.6 Combine preview

The combined result shown as a readable document.

- **Combined skill:** each section has a colored band for the original it
  came from, and settled clashes are marked "Brand Voice wins on tone."
- **Bundle:** the packaged skills shown as a stack, each expandable.

A short summary sits at the top, such as "Made from 3 skills · 1 clash
settled · 2 templates kept."

### 10.7 Load-back preview

A before-and-after view of the VS Code space, split into **Project** and
**Personal**. Each skill sits in one of three groups: **Added**, **Parked**,
or **Untouched**. Skills that can't be parked are marked with a note. Each
parked skill has a toggle to keep it instead. One clear confirm button and a
reminder that everything can be restored.

### 10.8 Run map

A left-to-right flow: **Request → Skills used → Steps → Outcome**. Steps are
grouped under the skill that caused them, and long sections collapse.

### 10.9 Contribution highlight

The outcome with soft color highlights per skill, like tracked changes in a
document. Hovering shows the skill name and a one-line reason.

### 10.10 Contribution summary

Simple bars showing each skill's share, sorted largest first.

### 10.11 Mix check

Three groups: **used as planned**, **in the mix but didn't kick in**, and
**outside the mix but kicked in**, each with a plain reason.

### 10.12 Mix compare

Two outcomes side by side, each with its mix and contribution summary, and
differences highlighted.

## 11. VS Code first

The first version uploads from, and loads back into, **GitHub Copilot in VS
Code**. (See [DECISIONS.md](./DECISIONS.md) D-010.) The details below come
from VS Code's documentation, [Use Agent Skills in VS
Code](https://code.visualstudio.com/docs/agent-customization/agent-skills)
(checked 2026-11-24). Re-check them before building, because VS Code changes
often.

### Where VS Code skills live, and what Skill Studio can do with them

| Where the skill lives | Example location | Upload | Park and load back |
| --- | --- | --- | --- |
| **Project space** | `.github/skills/` in the project (VS Code also reads `.claude/skills/` and `.agents/skills/`) | Yes | Yes, with a team warning (see §9.6) |
| **Personal space** | `~/.copilot/skills/` in the user's home folder (also `~/.claude/skills/` and `~/.agents/skills/`) | Yes | Yes |
| **Installed from VS Code's marketplace** | Saved into a project or personal space | Yes | Yes, like other skills in that space |
| **Inside a plugin** | Managed by the plugin | Yes, as a copy | No. Explain how to turn off the plugin. ❓ Verify. |
| **Inside an extension** | Managed by the extension | Yes, as a copy | No. Explain how to turn off the extension. |
| **Built-in or from MCP servers** | Provided by VS Code or a connected service | ❓ Verify | No |

Notes:

- Personal skills load in **every** project, so Skill Studio always checks
  the personal folders when a project is connected.
- Each agent reads different skill folders. Skill Studio counts a skill as
  loaded only if the project's agent reads its folder; others are shown as
  "Not loaded by [agent]":

  | Agent | Project folders | Personal folders |
  | --- | --- | --- |
  | GitHub Copilot | `.github/skills/`, `.claude/skills/`, `.agents/skills/` | `~/.copilot/skills/`, `~/.agents/skills/` |
  | Claude Code | `.claude/skills/` | `~/.claude/skills/` |
  | Codex | `.agents/skills/` | `~/.agents/skills/` |

  This table lives in the code (`server/agents.ts`) and wins if they
  disagree. Re-check each agent's documentation when building new steps.
- If two skills with the same name sit in different spaces, VS Code shows
  both. Skill Studio flags these as **duplicates**.
- VS Code picks up skill changes in a **new chat**, so Skill Studio reminds
  users to start one after loading back.

### Rules a combined result must follow so VS Code loads it

Skill Studio handles these automatically. Users never need to know them, but
the builders do.

- Each skill is a **folder** containing a file named `SKILL.md`.
- The skill's **name** uses only lowercase letters, numbers, and hyphens
  (for example, `team-specs`), is at most 64 characters, and **matches the
  folder name**. Otherwise VS Code silently ignores the skill.
- The **description** says what the skill does and when to use it, in at most
  1024 characters. This is what Copilot reads to decide when to use it.
- Supporting files (templates, examples, scripts) live inside the folder and
  are linked with paths relative to `SKILL.md`.

### What data comes in

| Input | What it is | Priority |
| --- | --- | --- |
| **Uploaded skills** | Copies of skill folders from VS Code spaces, or folders the user drops in. | P0 |
| **Run records** | The record of what Copilot did in a run: request, steps, skills used, outcome. | P0 |
| **Sample data** | A made-up library with planted duplicates, overlaps, and clashes, plus sample runs, for demos, testing, and learning. | P0 |

❓ **Open:** how to get run records out of VS Code. One candidate is VS Code's
option to export a chat as a file. Verify that it includes which skills were
used.

## 12. Privacy and trust

Skills and run records can contain private content: team documents,
messages, and personal data.

- **Local by default:** keep uploaded skills, mixes, parked skills, and run
  records on the user's device unless they choose otherwise. (❓ Open:
  confirm, see [DECISIONS.md](./DECISIONS.md) D-004. If Skill Studio becomes
  a web app, uploading would send skills off the device, so this must be
  decided together with the app type.)
- **Use the project's own agent.** Summaries, overlap detection,
  recommendations, and merging into a combined skill are done by whatever AI
  agent the connected project already uses (for example GitHub Copilot,
  Claude Code, or Codex), detected by Skill Studio. There's no separate AI
  service, account, or key. Before every AI action, show what will be sent,
  to which agent, and that it uses the user's own allowance, and wait for the
  user to approve. The agent runs read-only: it can't edit files or run
  commands. (See [DECISIONS.md](./DECISIONS.md) D-014.)
- **Where Skill Studio keeps its own data:** a private folder on the user's
  computer, `~/.skill-studio/`. It holds `settings.json` (recent project
  locations and the agent chosen per project) and `catalog.json` (the saved
  list of public online skills, refreshed at most once a day).
- **What goes online:** only when the user searches online skills or
  downloads one, Skill Studio asks GitHub for public files from the
  catalogs. Nothing about the user's projects or skills is sent. An optional
  `GITHUB_TOKEN` in a local `.env` file raises GitHub's request limit.
- **Downloads never overwrite.** A downloaded skill goes into the folder the
  project's agent reads (for example `.github/skills/`). If the name is
  taken, the user picks a new one; the existing skill is never touched.
  Skills that include scripts show a warning first.
- **Never alter originals.** Uploads are copies. Parking moves a skill
  without changing its contents. Mixes, notes, and wins rules are stored
  separately.
- **Never delete without asking.** Parked skills stay on the Parked shelf
  until the user restores or removes them.
- **Ask before changing VS Code.** Loading back always shows a preview and can
  be undone.
- **Never store secrets.** Hide passwords, keys, and tokens found in skills or
  run records.
- **Flag unknown sources.** Skills from unknown or community sources are
  clearly labeled, and Skill Studio shows what each one can access. A
  combined skill inherits the access of every skill it's made from, so the
  combine preview lists that too.
- Sample data must be fully made up: no real names, emails, or documents.

## 13. How we'll know it works

| Signal | Target (first version) |
| --- | --- |
| Testers find every planted duplicate and clash in the sample library. | 4 out of 5 testers |
| Time from typing a goal to a saved mix they're happy with. | Under 5 minutes |
| Testers who accept the recommended mix with few or no changes. | Majority |
| Time from a saved mix to a loaded-back result in VS Code. | Under 2 minutes |
| New VS Code chats after loading back that use only the mix. | 9 out of 10 runs |
| Restore returns every parked skill exactly as it was. | Every time |
| Testers who can explain which skills shaped a sample outcome. | 4 out of 5 testers |
| Testers who say they feel more in control of AI results. | Majority |
| Testers who need "Show details" (raw data) to understand anything. | Few or none |

## 14. First version scope

The first version (MVP) is a **local web app**: it runs on the user's
computer and opens in the browser (see [DECISIONS.md](./DECISIONS.md) D-006
and D-015). Build steps are in [ROADMAP.md](./ROADMAP.md) Phase 1.

**In the MVP:**

- Connect any project folder; show every skill loaded for it, from the
  project **and** the personal skills folders, with a count and a short
  summary of each
- Detect which AI agent the project uses
- Upload `.md` files and skill folders by choosing or dragging and dropping
- Search your own skills plus public catalogs, and download a skill into the
  project after a preview (never overwriting)
- Compare two skills, and get the ideal combination of skills for a task,
  using the project's own agent after the user approves
- Made-up sample data to explore before connecting a project

**Next (Phase 2):** overlap map, mix builder, combine, load back with park
and restore, and run views.

**Later:** re-upload and update alerts, mix check, preview a mix, refine
suggestions, mix versions and compare, insights, guided tour, team sharing,
and AI tools other than VS Code.

## 15. Open questions

### Product and platform

1. ✅ Decided: Skill Studio is a local web app that runs on the user's
   computer and opens in the browser. (D-006)
2. ❓ Single user first, or teams sharing mixes from day one?

### Combine and load back

3. ❓ Which skills get parked by default: only the originals that went into
   the result, or also overlapping skills that were left out? (This draft
   parks both, and the user can change it.)
4. ❓ Where do parked skills live, and are they ever cleaned up?
5. ❓ Project skills are shared with a team. Should parking them affect only
   this computer, or everyone?
6. ❓ If a mix draws from both project and personal spaces, where does the
   result go by default?
7. ❓ How are wins rules written into a bundle?
8. ❓ What happens when an original changes after it went into a combined
   result?
9. ❓ Can more than one mix be loaded at once (for example, one per project)?
10. ❓ Confirm the ranking order for recommendations (§9.4), and whether users
    can change it.
11. ❓ Is "preview a mix" (§9.9) a prediction, or a real test run that uses AI
    quota?
12. ❓ How do we help users turn off overlapping skills that Skill Studio
    can't park (plugins, extensions, built-in)?

### Understanding and accuracy

13. ❓ How do we detect overlaps and clashes reliably: AI reading the skills,
    simple matching, or both? This affects cost and privacy.
14. ❓ How do we check that a combined skill is faithful to its originals and
    doesn't lose important instructions?
15. ❓ How do we measure contribution honestly when the AI doesn't say exactly
    which skill produced which words?
16. ❓ Who writes plain-language summaries: AI, skill owners, or both?
17. ❓ How do we get run records out of VS Code (§11)?

### Naming

18. ❓ What do we call a combination: **Mix**, **Kit**, **Set**, **Recipe**, or
    **Playlist**? And are **Combined skill**, **Bundle**, **Load back**, and
    **Park** the right words? (This draft uses them.)
19. ❓ Keep the product name "Skill Studio"?

## Related documents

- [AGENTS.md](../AGENTS.md) — how AI coding assistants should work on this project
- [DESIGN.md](./DESIGN.md) — look, feel, and UX principles
- [ROADMAP.md](./ROADMAP.md) — phases and milestones
- [DECISIONS.md](./DECISIONS.md) — key decisions and why
