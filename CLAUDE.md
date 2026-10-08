# CodeCraft — IB Computer Science SL (Python) learning site

## What this project is
A self-study website for learning to code in **Python** for **IB DP Computer Science SL (first assessment 2027)**.
The learner is an IB DP2 student. Content must follow the official guide and the Hodder textbook
(Baumgarten, Ganea, Turland, 2025). The full topic map is in `BUILD_PLAN.md`; follow it.

## Hard rules
- **Syllabus scope = SL only.** Cover B1.1, B2.1–B2.5, B3.1 and nothing else. The learner takes SL, so never add
  HL-only content (recursion B2.4.4–B2.4.5, B3.2, B4) in any form — no "Beyond SL" or "HL" notes, boxes or questions.
- **Use IB terminology exactly as the guide does**: "construct", "trace", "push / pop / peek / isEmpty",
  "enqueue / dequeue / front / isEmpty", "counted loop" vs "conditional loop", "static vs dynamic data structure",
  "trace table", "Big O", "encapsulation", "information hiding", "instance vs static (class) variables".
- Exams show code in Python and sometimes **prohibit built-ins** (sort, pop, len, max, min). Every algorithm
  lesson must have a "No built-ins" exercise variant.
- Textbook implements stacks/queues as **static arrays with a top index (`topIndex = -1`) and `isFull()`**.
  Teach that version first, then the Python-list version, and compare them (B2.2.1).
- Every quiz explains **why the right answer is right AND why each wrong option is wrong**.
- Use real IB-style contexts (school records, exam scores, library books, queues at a canteen), never lorem ipsum.

## Tech stack (decided — don't change without asking)
- Plain **HTML + CSS + vanilla JS**, no build step. Opens by double-clicking `index.html`; deployable to GitHub Pages.
- Python runs in the browser with **Skulpt 1.2.0** (load `skulpt.min.js` + `skulpt-stdlib.js` from
  `https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/`). Pyodide was rejected: it's heavy and needs extra network fetches.
- Code editor: **CodeMirror 5** (cdnjs) with Python mode, or a plain `<textarea>` with tab handling if that's simpler.
- Progress saved in `localStorage` (wrap every read/write in try/catch).
- Content lives in data files (`content/*.js`), one per syllabus section, so lessons are easy to add without touching app code.

## Skulpt facts (already tested — trust these)
- Works: f-strings, slicing, string methods, try/except/finally, `except ValueError as e`, classes, `__init__`,
  `__str__`, `@staticmethod`, name-mangled `self.__name` (raises AttributeError from outside), 2D lists,
  `global`, `input()`, `list.pop(0)`, `range` with step.
- Configure: `Sk.configure({ output, read, inputfun, inputfunTakesPrompt: true, __future__: Sk.python3, execLimit: 3000, yieldLimit: 100 })`
  and run with `Sk.misceval.asyncToPromise(() => Sk.importMainWithBody("<stdin>", false, code, true))`.
  `execLimit` turns infinite loops into a `TimeLimitError` instead of freezing the tab — show a friendly message
  that links to B2.3.1 ("ways to avoid infinite loops").
- **Missing in Skulpt:** writing files (`open(..., "w")` throws) and `FileNotFoundError`.
  Fix: `runtime/vfs_preamble.py` (tested) defines an in-memory file system. Before each run, execute it as module
  `_pre`, then copy `m.$d.open` and `m.$d.FileNotFoundError` into `Sk.builtins`. Pre-load lesson files by setting
  keys on `m.$d._FS`. This keeps user line numbers correct. Show the virtual files in a "Files" panel.
- `input()`: make `inputfun` return a Promise that shows an input box inside the console, so it feels like a real terminal.
  For auto-graded exercises, feed scripted inputs instead.
- Error text differs slightly from CPython (e.g. "integer division or modulo by zero"). Map common errors to
  beginner-friendly explanations: NameError, TypeError, IndexError, ValueError, ZeroDivisionError, IndentationError, TimeLimitError.

## Auto-grading exercises
Append hidden test code after the student's code in the same run (so line numbers stay right), e.g.
`_check("returns 5 for [1,5,3]", find_max([1,5,3]) == 5)`. `_check` prints a marker line like `@@PASS|name` /
`@@FAIL|name`; the JS strips markers from the console and shows a pass/fail checklist. For "no built-ins"
exercises, scan the student's code with a regex for banned names and fail with a clear message.

## Design (approved 2026-10-07 — reference mock: `design/options.html#theme=note&palette=python&mode=light`)
- **Theme: "Notebook"** — squared-paper background (24px faint blue grid), white paper cards with a red margin
  line on lesson notes, yellow **highlighter** on key terms, handwritten margin notes in Caveat, washi-tape strips on
  feature cards. Fonts: Bricolage Grotesque (headings), Atkinson Hyperlegible (body), JetBrains Mono (code, with
  ligatures OFF so `>=` never renders as `≥`), Caveat (annotations).
- **Colours: "Python" palette** — blue `#3B82F6` (ink `#1D4ED8` on light), yellow `#FFD43B`, violet `#8B5CF6`,
  highlighter `#FFE45C`. Tokens live as CSS variables in `styles.css`.
- **Mode: follows the device's light/dark setting.** The top-bar toggle overrides it (saved in localStorage);
  toggling back to the device's own mode returns to following the device.
- **Layouts:** Home = **sidebar layout** (course tree on the left, dashboard on the right).
  Lesson = **split IDE layout** (lesson on the left, editor + console pinned on the right; course tree in a drawer;
  stacks on phones). Must work at phone width with visible keyboard focus.

## Unlimited practice (`#/practice`)
- `practice/core.js` is the engine; `practice/gen-*.js` hold the generators for each syllabus section; `practice/ui.js`
  renders a question card and marks it. Every topic lesson has a practice page (`#/practice/<lesson id>`), plus
  `#/practice/mix` (all topics) and `#/practice/weak` (lowest accuracy, needs ≥3 answers per topic).
- A generator is `{ id, kind, term, marks, make(R) }`. `R` is a **seeded** random helper, so a seed always gives the same
  question. Kinds: `mcq` (every option has a `why`), `output` (type the exact output), `trace` (trace table),
  `code` (hidden tests via `P.HARNESS` + `P.t / P.tf / P.tblock`, optional `banned` / `require`), `written`
  (self-marked against `markscheme`). `term` is the IB command term (Identify, State, Trace, Construct, Describe,
  Explain, Compare, Evaluate, Distinguish, Calculate, Outline).
- Use IB-style contexts and the shared pools in `P.data`.
- Floats: `runner.js` patches Skulpt so float printing, `round()` and `%`/f-string formatting match CPython exactly
  (Skulpt on its own prints `0.1 + 0.2` as `0.3` and `round(2.675, 2)` as `2.68`). `tools/check.html` re-checks
  ~6,000 float results against real Python (`tools/floatfuzz.py` → `floatfuzz.out`); regenerate the `.out` with
  `python3 tools/floatfuzz.py > tools/floatfuzz.out` if you change the `.py`.
- Command terms: "State" for 1–2 mark predict-the-output questions, "Determine" for 3+ marks, "Trace" only for trace
  tables and flowcharts.
- **Verify after every change to a generator** — both must pass:
  1. CPython: `osascript -l JavaScript tools/export.js "$PWD" 100 /tmp/q.json && python3 tools/verify.py /tmp/q.json`
  2. Skulpt (what the site runs): `python3 tools/serve.py`, open `http://localhost:8765/tools/check.html?n=25`.
- Stats live in localStorage under `practice[topic] = { n, c, s, m }` (answered, correct, marks scored, marks possible).
- **My questions (`#/review`)**: every practice answer is saved in localStorage key `codecraft.history.v1` as
  `{ topic, gen, seed, kind, term, marks, preview, attempts: [{ t, ok, score, max, ans }] }`. The seed rebuilds the exact
  question, so **never change what an existing generator produces for a given seed without giving it a new `id`** —
  otherwise old history entries show a different question. `ans` is replayed by `practiceUI.render(..., { replay })`.
  Routes: `#/review?topic=&status=wrong|right&kind=`, `#/review/q/<topic|gen|seed>`, `#/review/redo?topic=`.

## Deployment
- Live at **https://dharmiparsana2519-art.github.io/codecraft/** — GitHub repo `dharmiparsana2519-art/codecraft`,
  GitHub Pages serving the `main` branch root. It runs without Claude: static files + CDNs.
- `_config.yml` keeps development files (`tools/`, `design/`, the kit `.md` files) off the live site. The repository
  itself is public, so they are still visible on GitHub.
- To update the live site: commit and push to `main` (git needs GitHub sign-in — use the gh CLI as a credential helper: `git -c credential.helper="!gh auth git-credential" push`). Pages rebuilds in about a minute.
- Bump the `?v=N` on every local script/stylesheet URL in `index.html` when deploying, so browsers don't keep old files.
- Local preview with caching off: `python3 tools/serve.py` (port 8765).

## Working style
- Build in the phases in `PROMPTS.md`. After each phase, open the site in a browser and check it works before moving on.
- Lessons: "Mark as done" only appears on sections that have real content, and only those sections count towards
  progress. Error-help links go to the lesson once it has notes, otherwise to its practice page.
- Keep files small: `app.js` (routing, progress), `runner.js` (Skulpt), `widgets/*.js` (trace table, visualizers), `content/*.js`.
- Before saying a lesson is done, run every example and every exercise solution through the runner and confirm the tests pass.
