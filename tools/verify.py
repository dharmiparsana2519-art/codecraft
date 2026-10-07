"""Checks every exported practice question against real Python 3.

    osascript -l JavaScript tools/export.js . 25 /tmp/q.json && python3 tools/verify.py /tmp/q.json

- output questions: running the program must print exactly the expected answer
- trace / mcq questions with a `check`: the check program must print the expected value
- code questions: the model solution must pass every hidden test, the starter code must fail at least one,
  and the solution must not use any banned built-in
- mcq: exactly one correct option, no duplicate options, every option has an explanation
"""
import contextlib, io, json, os, re, sys, tempfile, traceback
from collections import Counter, defaultdict

data = json.load(open(sys.argv[1]))
HARNESS = data["harness"]
problems = defaultdict(list)
kinds = Counter()


def run(code, files=None):
    """Run code in a fresh namespace inside a temp folder; return (stdout, error or None)."""
    old = os.getcwd()
    buf = io.StringIO()
    with tempfile.TemporaryDirectory() as d:
        os.chdir(d)
        try:
            for name, text in (files or {}).items():
                with open(name, "w") as f:
                    f.write(text)
            with contextlib.redirect_stdout(buf):
                exec(compile(code, "<question>", "exec"), {"__name__": "__main__"})
            err = None
        except Exception as e:  # noqa: BLE001 — we want every failure reported
            err = f"{type(e).__name__}: {e}"
        finally:
            os.chdir(old)
    return buf.getvalue(), err


def norm(s):
    lines = [l.rstrip() for l in s.replace("\r", "").split("\n")]
    while lines and lines[-1] == "":
        lines.pop()
    return "\n".join(lines)


def program(q):
    if q.get("run"):
        return q["run"]
    return (q.get("setup", "") + "\n" + q.get("code", "")).strip("\n")


for q in data["questions"]:
    key = f'{q["topic"]} / {q["gen"]}'
    kinds[q["kind"]] += 1
    blob = json.dumps(q)
    for bad in ("undefined", "NaN", "[object Object]"):
        if bad in blob:
            problems[key].append(f'contains "{bad}" (seed {q["seed"]})')
    try:
        if q.get("check"):
            out, err = run(q["check"]["code"], q.get("files"))
            if err or norm(out) != norm(q["check"]["expect"]):
                problems[key].append(f'check failed (seed {q["seed"]}): expected {q["check"]["expect"]!r}, got {out!r} {err or ""}')
        k = q["kind"]
        if k == "mcq":
            opts = q["options"]
            texts = [o["text"].strip() for o in opts]
            if sum(1 for o in opts if o.get("ok")) != 1:
                problems[key].append(f'{sum(1 for o in opts if o.get("ok"))} correct options (seed {q["seed"]})')
            if len(set(texts)) != len(texts):
                problems[key].append(f"duplicate options {texts} (seed {q['seed']})")
            if len(opts) < 3 or any(not o.get("why") for o in opts):
                problems[key].append(f"too few options or missing explanation (seed {q['seed']})")
        elif k == "output":
            out, err = run(program(q), q.get("files"))
            if err:
                problems[key].append(f'program raised {err} (seed {q["seed"]})')
            elif norm(out) != norm(q["answer"]):
                problems[key].append(f'expected {q["answer"]!r} but Python printed {out!r} (seed {q["seed"]})')
        elif k == "trace":
            cols = len(q["columns"])
            if any(len(r) != cols for r in q["rows"]):
                problems[key].append(f"row width mismatch (seed {q['seed']})")
            if not any(not c.get("given") for r in q["rows"] for c in r) and not q.get("extra"):
                problems[key].append(f"nothing to fill in (seed {q['seed']})")
        elif k == "code":
            sol = q["solution"] + "\n" + HARNESS + "\n" + q["tests"]
            out, err = run(sol, q.get("files"))
            marks = [l for l in out.split("\n") if l.startswith("@@")]
            fails = [l for l in marks if l.startswith("@@FAIL")]
            if err or fails or len(marks) < 2:
                problems[key].append(f'solution failed (seed {q["seed"]}): {err or fails or "fewer than 2 tests"}')
            sout, serr = run(q["starter"] + "\n" + HARNESS + "\n" + q["tests"], q.get("files"))
            if not serr and not any(l.startswith("@@FAIL") for l in sout.split("\n")):
                problems[key].append(f"starter code already passes (seed {q['seed']})")
            for b in q.get("banned", []):
                if re.search(b["re"], q["solution"]):
                    problems[key].append(f'solution uses banned {b["label"]} (seed {q["seed"]})')
            for r_ in q.get("require", []):
                if not re.search(r_["re"], q["solution"]):
                    problems[key].append(f'solution lacks required {r_["label"]} (seed {q["seed"]})')
        elif k == "written":
            if len(q.get("markscheme", [])) < 2:
                problems[key].append("mark scheme too short")
    except Exception:  # noqa: BLE001
        problems[key].append("verifier crashed: " + traceback.format_exc(limit=1))

print(f'{len(data["questions"])} questions checked ({dict(kinds)}) from {sum(data["counts"].values())} generators in {len(data["counts"])} topics')
for e in data["errors"]:
    print("GENERATOR ERROR", e)
for key, ps in sorted(problems.items()):
    print(f"\n✗ {key}: {len(ps)} problem(s)")
    for p in ps[:3]:
        print("   ", p[:400])
if not problems and not data["errors"]:
    print("All questions verified ✓")
sys.exit(1 if problems or data["errors"] else 0)
