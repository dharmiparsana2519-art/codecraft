# CodeCraft

Learn Python for **IB DP Computer Science SL** (first assessment 2027): lessons that follow the syllabus
(B1.1, B2.1–B2.5, B3.1) in the Hodder textbook's order, with a Python editor that runs right in the browser.

**Live site:** https://dharmiparsana2519-art.github.io/codecraft/

## Unlimited practice
Every SL topic has a practice page with an endless supply of exam-style questions — multiple choice, predict the
output, trace tables, write-the-code (auto-marked by hidden tests, with "No built-ins" variants) and written answers
self-marked against a mark scheme. Questions are generated fresh from randomised IB-style contexts, and every answer
comes with an explanation. All generators are checked against real Python 3 (`tools/verify.py`) and against the
in-browser engine (`tools/check.html`).

## How it works
- Plain HTML, CSS and JavaScript — no build step, no server, no account.
- Python runs in the browser with [Skulpt](https://skulpt.org) 1.2.0; the editor is CodeMirror 5.
- `input()` is answered inside the console, and `open()` reads and writes virtual files shown in the Files panel.
- Progress is saved in your browser (localStorage), so it stays on the device you use.

To run it locally, open `index.html` in a browser (an internet connection is needed the first time, to load
the Python engine, the editor and the fonts).

## Project files
| File | What it does |
|---|---|
| `index.html`, `styles.css` | Page shell and the "Notebook" theme |
| `app.js` | Routing, progress, home dashboard, lesson pages |
| `runner.js` | Runs Python with Skulpt, friendly error explanations |
| `widgets/playground.js` | Editor + console + Files panel |
| `content/course.js` | Every module and lesson in the course |
| `practice/` | Unlimited practice: engine, question generators per syllabus section, question cards |
| `tools/` | Question checkers (`export.js` + `verify.py`, `check.html`) and a local preview server |
| `runtime/vfs_preamble.py` / `.js` | In-memory file system for `open()` |
| `CLAUDE.md`, `BUILD_PLAN.md`, `PROMPTS.md` | Build spec and plan |
