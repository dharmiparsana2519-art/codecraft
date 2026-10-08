"""Runs every code block in the "Build it from scratch" notes in real Python 3 and checks it does what the notes say.

    osascript -l JavaScript tools/notes_export.js "$PWD" /tmp/notes.json && python3 tools/notes_check.py /tmp/notes.json

- finished programs, every stage of the line-by-line build, trace programs, mistakes and no-built-ins versions
  are all run, with the typed inputs fed to input() (echoed like the site's console: prompt + answer + newline)
- expected output must match exactly; an expected error must be raised; an "infinite loop" must not finish
- no-built-ins versions must not use the banned built-ins
- every program has all eight parts, and its build covers every line of the finished program exactly once
"""
import json, os, re, subprocess, sys, tempfile

SHIM = r'''
import builtins, os, sys
_inputs = %r
def _input(prompt=""):
    if not _inputs:
        raise EOFError("the notes ran out of typed inputs")
    v = _inputs.pop(0)
    sys.stdout.write(str(prompt) + v + "\n")
    return v
builtins.input = _input
class _Cap:
    def __init__(self, s):
        self.s, self.n = s, 0
    def write(self, t):
        self.n += len(t)
        if self.n > 200000:
            self.s.flush()
            os._exit(99)
        return self.s.write(t)
    def flush(self):
        self.s.flush()
sys.stdout = _Cap(sys.stdout)
exec(compile(%r, "<notes>", "exec"), {"__name__": "__main__"})
'''


def run(code, inputs):
    with tempfile.TemporaryDirectory() as d:
        path = os.path.join(d, "prog.py")
        with open(path, "w") as f:
            f.write(SHIM % (list(inputs), code))
        try:
            r = subprocess.run([sys.executable, "-I", path], cwd=d, capture_output=True, text=True, timeout=3)
        except subprocess.TimeoutExpired:
            return {"loops": True}
        if r.returncode == 99:
            return {"loops": True}
        err = None
        if r.returncode != 0:
            last = r.stderr.strip().splitlines()[-1] if r.stderr.strip() else "error"
            err = last.split(":")[0]
        return {"out": r.stdout, "error": err}


def norm(s):
    return "\n".join(l.rstrip() for l in s.replace("\r", "").split("\n")).rstrip("\n")


data = json.load(open(sys.argv[1]))
problems, runs = [], 0
for lesson, info in data.items():
    for pi, p in enumerate(info["programs"]):
        tag = f"{lesson} program {pi + 1}"
        lines = p["code"].rstrip("\n").split("\n")
        want = [i + 1 for i, l in enumerate(lines) if l.strip()]
        got = sorted(n for add in p["build"] for n in ([add] if isinstance(add, int) else add))
        if got != want:
            problems.append(f"{tag}: the line-by-line build doesn't cover each line once (missing {sorted(set(want) - set(got))}, extra {[n for n in got if got.count(n) > 1 or n not in want]})")
        parts = p["parts"]
        for k in ("goal", "works", "trace", "nobuiltins", "tip", "whys"):
            if not parts[k]:
                problems.append(f"{tag}: missing part '{k}'")
        if not 3 <= parts["think"] <= 6:
            problems.append(f"{tag}: 'think before coding' needs 3-6 steps (has {parts['think']})")
        if not 3 <= parts["mistakes"] <= 4:
            problems.append(f"{tag}: needs 3-4 common mistakes (has {parts['mistakes']})")
        if not parts["vars"]:
            problems.append(f"{tag}: no variables table")
    for b in info["blocks"]:
        res, exp = run(b["code"], b.get("inputs", [])), b["expect"]
        runs += 1
        where = f"{lesson} {b['where']}"
        if exp.get("loops"):
            if not res.get("loops"):
                problems.append(f"{where}: should loop for ever but finished ({res.get('error') or 'no error'})")
        elif res.get("loops"):
            problems.append(f"{where}: never finished")
        elif "error" in exp:
            if res["error"] != exp["error"]:
                problems.append(f"{where}: expected {exp['error']}, got {res['error'] or 'no error'}")
        elif res["error"]:
            problems.append(f"{where}: crashed with {res['error']}")
        elif "out" in exp and norm(res["out"]) != norm(exp["out"]):
            problems.append(f"{where}: expected {exp['out']!r}, printed {res['out']!r}")
        for name in b.get("banned", []):
            if re.search(r"(\.|\b)" + re.escape(name) + r"\s*\(", re.sub(r"#.*", "", b["code"])):
                problems.append(f"{where}: uses the banned built-in {name}()")

print(f"{runs} code blocks run from {sum(len(i['programs']) for i in data.values())} programs in {len(data)} lesson(s)")
if problems:
    print(f"\n{len(problems)} problem(s):")
    for p in problems:
        print("  ✗", p)
    sys.exit(1)
print("All notes verified ✓")
