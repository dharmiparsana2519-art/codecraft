# Prompts to paste into Claude Code

Setup: make an empty folder (e.g. `pypath`), copy `CLAUDE.md`, `BUILD_PLAN.md`, this file and the `runtime/` folder
into it, open the folder in Claude Code, then paste the prompts below **one phase at a time**.
Check the site in your browser after each phase before moving on. Start Phase 1 in **plan mode** so you can approve the plan first.

---

## Phase 1 — Skeleton and Python runner
```
Read CLAUDE.md and BUILD_PLAN.md. Build the app skeleton: index.html, styles.css, app.js, runner.js.
- Sidebar listing all modules and lessons from BUILD_PLAN.md (lessons can be empty placeholders for now).
- A lesson page layout with the Learn / Try it / Trace it / Check sections.
- A reusable code playground component: editor, Run button, console with in-console input() support,
  Files panel, friendly error messages. Use Skulpt and runtime/vfs_preamble.py exactly as CLAUDE.md describes.
- Progress saved in localStorage.
Make a plan first and show it to me before writing code.
```

## Phase 2 — Exercise grading and widgets
```
Add the auto-graded exercise system described in CLAUDE.md (_check markers, pass/fail checklist,
hints, model solution unlocked after 2 failed attempts, "no built-ins" regex check).
Add a quiz widget where every option has its own explanation, and a trace-table widget
where I fill in cells and get each row checked. Build one demo lesson (B2.3.2 Selection, IB grade boundaries)
that uses all of them so I can test.
```

## Phase 3 — Content, one module per prompt
Repeat for each module, in order:
```
Write the full content for Module <N> from BUILD_PLAN.md into content/<file>.js.
Follow every "Must include" item and use the syllabus terminology. For each lesson: explanation,
1–3 runnable examples, 2–4 graded exercises (one "no built-ins" where it applies), one trace-table task,
and a 5-question quiz with explanations for every option. Then run every example and every model
solution through the runner and show me the test results.
```

## Phase 4 — Visualizers
```
Build the visualizers listed in BUILD_PLAN.md: stack, queue (array version with pointers), binary search
(low/mid/high), and bubble + selection sort with step, play, speed and a comparison/swap counter.
Each should accept my own data. Add them to their lessons.
```

## Phase 5 — Review mode, polish, deploy
```
Build Module 9 (mixed practice, timed Paper 2 sprint, progress dashboard). Then check dark mode,
phone width, and keyboard access, fix what's broken, and walk me through putting the site on GitHub Pages.
```

---

## Useful follow-ups
- "Run every exercise solution and list any that fail."
- "Add 5 more trace-table questions to B2.1.4, harder than the existing ones."
- "Turn textbook page <N> into a lesson section" (attach the page as a screenshot).
- "Explain the code you just wrote for runner.js like I'm sitting a CS exam." Use this to actually learn from the build.
