/* practice/core.js — the question engine behind unlimited practice.
   Each topic registers generators: CodeCraft.practice.add('B2.3.3', [{ id, kind, term, marks, make(R) }]).
   make(R) receives a seeded random helper and returns a fresh question, so every topic has an endless supply.
   Question kinds:
     mcq     { prompt, code?, options: [{ text, ok, why }], mono }
     output  { prompt, code, answer, explain }                 type the exact output
     trace   { prompt, code, columns, rows: [[cell]], extra?, explain }   cell = { v, given }
     code    { prompt, starter, solution, tests, banned?, require?, files?, hint, explain }
     written { prompt, markscheme: [points], model? }           self-marked against a mark scheme
   This file has no DOM code, so the generators can also be run outside the browser to verify them. */
var CodeCraft = (typeof window !== 'undefined' ? (window.CodeCraft = window.CodeCraft || {}) : (this.CodeCraft = this.CodeCraft || {}));

(function (CC) {
  const P = CC.practice = CC.practice || { gens: {} };
  P.gens = P.gens || {};
  P.add = function (topic, list) {
    (P.gens[topic] = P.gens[topic] || []).push(...list.map(g => Object.assign({ topic }, g)));
  };

  /* ---------- seeded random numbers (mulberry32) ---------- */
  P.rng = function (seed) {
    let a = seed >>> 0;
    const next = () => {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const R = {
      next,
      int: (lo, hi) => lo + Math.floor(next() * (hi - lo + 1)),
      pick: arr => arr[Math.floor(next() * arr.length)],
      chance: p => next() < p,
      shuffle(arr) { const a2 = arr.slice(); for (let i = a2.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [a2[i], a2[j]] = [a2[j], a2[i]]; } return a2; },
      sample: (arr, k) => R.shuffle(arr).slice(0, k),
      ints: (n, lo, hi) => Array.from({ length: n }, () => R.int(lo, hi)),
      distinct(n, lo, hi) { const s = new Set(); while (s.size < n) s.add(R.int(lo, hi)); return [...s]; }
    };
    return R;
  };

  /* ---------- Python-style formatting, so expected answers match real Python output ---------- */
  const py = P.py = {
    f(x) { // repr of a float
      if (!isFinite(x)) return String(x);
      if (Number.isInteger(x)) return x.toFixed(1);
      return String(x);
    },
    s(str) { // repr of a str
      const q = str.includes("'") && !str.includes('"') ? '"' : "'";
      return q + str.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(new RegExp(q, 'g'), '\\' + q) + q;
    },
    b: v => (v ? 'True' : 'False'),
    // repr of a value: ints are numbers, floats are { f: x }, strings, booleans, null → None, arrays → lists
    r(v) {
      if (v === null || v === undefined) return 'None';
      if (typeof v === 'boolean') return py.b(v);
      if (typeof v === 'number') return String(v);
      if (typeof v === 'string') return py.s(v);
      if (Array.isArray(v)) return '[' + v.map(py.r).join(', ') + ']';
      if (v && typeof v.f === 'number') return py.f(v.f);
      if (v && v.tuple) return '(' + v.tuple.map(py.r).join(', ') + (v.tuple.length === 1 ? ',' : '') + ')';
      return String(v);
    },
    str: v => (typeof v === 'string' ? v : py.r(v)), // what print() shows
    print: (...args) => args.map(py.str).join(' '),
    mod: (a, b) => ((a % b) + b) % b,
    fdiv: (a, b) => Math.floor(a / b)
  };
  P.esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  P.code = s => '<code>' + P.esc(s) + '</code>';

  /* ---------- shared, IB-style context data ---------- */
  P.data = {
    names: ['Aiko', 'Ben', 'Carla', 'Dev', 'Elif', 'Farah', 'Gabriel', 'Hana', 'Ivan', 'Jia', 'Kofi', 'Lena', 'Mateo', 'Nia', 'Omar', 'Priya', 'Quinn', 'Rosa', 'Sami', 'Tomas', 'Uma', 'Viktor', 'Wen', 'Yara', 'Zane'],
    surnames: ['Okafor', 'Silva', 'Nakamura', 'Patel', 'Kowalski', 'Haddad', 'Moreau', 'Lindqvist', 'Mensah', 'Rossi', 'Chen', 'Garcia', 'Novak', 'Ibrahim', 'Schmidt'],
    subjects: ['Maths', 'Biology', 'History', 'Physics', 'English', 'Chemistry', 'Economics', 'Art', 'Geography', 'Music'],
    books: ['Dune', 'Matilda', 'Holes', 'Wonder', 'Coraline', 'Hatchet', 'Emma', 'Beloved', 'Persepolis', 'Frankenstein'],
    authors: ['Herbert', 'Dahl', 'Sachar', 'Palacio', 'Gaiman', 'Paulsen', 'Austen', 'Morrison', 'Satrapi', 'Shelley'],
    foods: ['pasta', 'salad', 'wrap', 'curry', 'soup', 'pizza', 'noodles', 'burger', 'falafel', 'rice'],
    words: ['COMPUTER', 'PYTHON', 'LIBRARY', 'CANTEEN', 'STUDENT', 'ALGORITHM', 'KEYBOARD', 'NETWORK', 'BINARY', 'VARIABLE', 'TEACHER', 'LOCKER'],
    houses: ['Red', 'Blue', 'Green', 'Yellow']
  };

  /* ---------- small helpers for generators ---------- */
  P.lines = s => s.replace(/^\n/, '').replace(/\n\s*$/, '');
  // An MCQ option list: the correct option plus up to k distinct wrong ones (in the order given).
  P.options = (ok, wrongs, k = 3) => {
    const seen = new Set([String(ok.text).trim()]), out = [Object.assign({ ok: true }, ok)];
    for (const w of wrongs) { const t = String(w.text).trim(); if (!seen.has(t) && out.length <= k) { seen.add(t); out.push(w); } }
    return out;
  };
  P.pre = s => '<pre class="q-pre">' + P.esc(s) + '</pre>';
  P.list = arr => '<ul class="q-steps">' + arr.map(x => '<li>' + x + '</li>').join('') + '</ul>';

  /* ---------- auto-marking for "code" questions ----------
     The student's code runs first, then this harness and the hidden tests, in one program (so line numbers stay right).
     Each test prints @@PASS|name or @@FAIL|name|detail; the page turns those into a checklist. */
  P.HARNESS = [
    'def _report(_name, _ok, _detail):',
    '    print(("@@PASS|" if _ok else "@@FAIL|") + _name + ("" if _ok else "|" + _detail))',
    'def _check(_name, _fn, _expected):',
    '    try:',
    '        _got = _fn()',
    '    except Exception as _e:',
    '        _report(_name, False, "raised " + type(_e).__name__ + ": " + str(_e))',
    '        return',
    '    _report(_name, _got == _expected, "returned " + repr(_got))',
    'def _checkf(_name, _fn, _expected):',
    '    try:',
    '        _got = _fn()',
    '    except Exception as _e:',
    '        _report(_name, False, "raised " + type(_e).__name__ + ": " + str(_e))',
    '        return',
    '    _ok = isinstance(_got, (int, float)) and not isinstance(_got, bool) and abs(_got - _expected) < 0.000001',
    '    _report(_name, _ok, "returned " + repr(_got))'
  ].join('\n');
  P.t = (name, expr, expected) => `_check(${py.s(name)}, lambda: ${expr}, ${py.r(expected)})`;
  P.tf = (name, expr, expected) => `_checkf(${py.s(name)}, lambda: ${expr}, ${py.r(expected)})`;
  let tfn = 0;
  P.tblock = (name, body, expected) => {
    const f = '_t' + (++tfn);
    return `def ${f}():\n` + body.split('\n').map(l => '    ' + l).join('\n') + `\n_check(${py.s(name)}, ${f}, ${py.r(expected)})`;
  };
  // Banned built-ins for "No built-ins" questions: [label, regex source]
  P.BAN = {
    max: ['max()', '\\bmax\\s*\\('], min: ['min()', '\\bmin\\s*\\('], sum: ['sum()', '\\bsum\\s*\\('], len: ['len()', '\\blen\\s*\\('],
    sorted: ['sorted()', '\\bsorted\\s*\\('], sort: ['.sort()', '\\.sort\\s*\\('], index: ['.index()', '\\.index\\s*\\('],
    count: ['.count()', '\\.count\\s*\\('], reversed: ['reversed()', '\\breversed\\s*\\('], slicerev: ['[::-1]', '\\[\\s*:\\s*:\\s*-\\s*1\\s*\\]'],
    find: ['.find()', '\\.find\\s*\\('], pop: ['.pop()', '\\.pop\\s*\\(']
  };
  P.ban = (...keys) => keys.map(k => ({ label: P.BAN[k][0], re: P.BAN[k][1] }));

  /* ---------- picking questions ---------- */
  const bags = {}, recent = {};
  P.topics = function () {
    const order = CC.allLessons ? CC.allLessons().map(l => l.id) : Object.keys(P.gens);
    return order.filter(id => P.gens[id] && P.gens[id].length);
  };
  P.generate = function (gen, seed) {
    const R = P.rng(seed);
    const q = gen.make(R);
    if (q.options) { // drop any wrong option that happens to read the same as another option
      const okText = (q.options.find(o => o.ok) || {}).text, seen = new Set([String(okText).trim()]);
      q.options = q.options.filter(o => o.ok || (!seen.has(String(o.text).trim()) && seen.add(String(o.text).trim())));
      if (!q.fixedOrder) q.options = R.shuffle(q.options);
    }
    return Object.assign({ topic: gen.topic, gen: gen.id, kind: gen.kind, term: gen.term || 'Answer', marks: gen.marks || 1, seed }, q);
  };
  // Next question for a topic: cycles through every generator in a shuffled order, avoiding recent repeats.
  P.next = function (topic) {
    const gens = P.gens[topic];
    if (!gens || !gens.length) return null;
    if (!bags[topic] || !bags[topic].length) bags[topic] = P.rng((Math.random() * 2 ** 32) >>> 0).shuffle(gens.map((g, i) => i));
    const gen = gens[bags[topic].pop()];
    const seen = recent[topic] = recent[topic] || [];
    let q;
    for (let tries = 0; tries < 8; tries++) {
      q = P.generate(gen, (Math.random() * 2 ** 32) >>> 0);
      const sig = gen.id + '|' + (q.prompt || '') + '|' + (q.code || '');
      if (!seen.includes(sig)) { seen.push(sig); if (seen.length > 40) seen.shift(); break; }
    }
    return q;
  };
})(CodeCraft);
