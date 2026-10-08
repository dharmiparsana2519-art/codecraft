"""Lists every content/notes/*.js file in index.html and tools/check.html, so a new notes file is picked up.

    python3 tools/sync_notes.py

In index.html the tags carry the same ?v= number as the other local scripts; check.html uses ?fresh.
"""
import os, re

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
names = sorted(n for n in os.listdir(os.path.join(root, "content", "notes")) if n.endswith(".js"))

def sync(path, prefix, suffix):
    text = open(path).read()
    tags = "".join(f'<script src="{prefix}content/notes/{n}{suffix}"></script>\n' for n in names)
    new, count = re.subn(r'(<script src="[^"]*widgets/notes\.js[^"]*"></script>\n)(?:<script src="[^"]*content/notes/[^"]*"></script>\n)*', lambda m: m.group(1) + tags, text)
    assert count == 1, f"widgets/notes.js tag not found in {path}"
    open(path, "w").write(new)

index = os.path.join(root, "index.html")
v = re.search(r'widgets/notes\.js(\?v=\d+)', open(index).read()).group(1)
sync(index, "", v)
sync(os.path.join(root, "tools", "check.html"), "../", "?fresh")
print(f"{len(names)} notes files listed: {', '.join(n[:-3] for n in names)}")
