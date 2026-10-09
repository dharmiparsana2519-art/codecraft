/* runner.js — runs Python in the browser with Skulpt 1.2.0.
   CodeCraft.runner.run(code, opts) → Promise<{ ok, error, files, ms }>
     opts.onOutput(text)        console output (print)
     opts.onInput(prompt)       must return a Promise<string> (in-console input box, or scripted input)
     opts.files                 { name: text } pre-loaded into the virtual file system
     opts.execLimit             ms of run time before TimeLimitError (default 3000)
   CodeCraft.runner.stop()         stops the current run
   Runs and traces never overlap: a call waits until the one before it has finished (see exclusive below).
   CodeCraft.runner.explain(err)   beginner-friendly explanation for an error object from run() */
window.CodeCraft = window.CodeCraft || {};

(function () {
  let current = null; // { stopped, rejectInput }

  /* Make floats behave like real Python 3 (CPython).
     Skulpt prints floats with only 16 significant digits (0.1 + 0.2 shows as 0.3) and rounds with
     Math.round(x * 10**n), which gets cases like round(2.675, 2) wrong. Exam questions test exactly these. */
  function floatRepr(x) { // CPython's repr(): shortest digits that round-trip, exponent outside 1e-4 … 1e16
    if (x === 0) return Object.is(x, -0) ? '-0.0' : '0.0';
    const [m, e] = x.toExponential().split('e'); // no argument = shortest round-trip digits
    const exp = parseInt(e, 10), neg = m[0] === '-', digits = m.replace('-', '').replace('.', '');
    let s;
    if (exp >= -4 && exp < 16) {
      if (exp >= 0) s = digits.length > exp + 1 ? digits.slice(0, exp + 1) + '.' + digits.slice(exp + 1) : digits + '0'.repeat(exp + 1 - digits.length) + '.0';
      else s = '0.' + '0'.repeat(-exp - 1) + digits;
    } else {
      s = (digits.length > 1 ? digits[0] + '.' + digits.slice(1) : digits) + 'e' + (exp < 0 ? '-' : '+') + String(Math.abs(exp)).padStart(2, '0');
    }
    return (neg ? '-' : '') + s;
  }
  const nativeToFixed = Number.prototype.toFixed;
  // Skulpt formats "%.2f" and f"{x:.2f}" with JS toFixed, which rounds exact halves up (0.125 → "0.13").
  // Python rounds exact halves to even ("0.12"). Only exact ties differ, so everything else stays native.
  function pyToFixed(d) {
    const x = Number(this), s = nativeToFixed.call(x, d), n = d === undefined ? 0 : d;
    if (!isFinite(x) || Math.abs(x) >= 1e21 || n > 99) return s;
    const [ip, fp] = nativeToFixed.call(Math.abs(x), 100).split('.');
    const rest = fp.slice(n);
    if (rest[0] !== '5' || /[1-9]/.test(rest.slice(1))) return s; // not an exact tie
    let head = ip + fp.slice(0, n);
    if (+head[head.length - 1] % 2 === 1) head = (BigInt(head) + 1n).toString().padStart(head.length, '0');
    return (x < 0 ? '-' : '') + (head.slice(0, head.length - n) || '0') + (n ? '.' + head.slice(head.length - n) : '');
  }
  function roundHalfEven(x) {
    const f = Math.floor(x), d = x - f;
    return d > 0.5 ? f + 1 : d < 0.5 ? f : (f % 2 === 0 ? f : f + 1);
  }
  function roundDigits(x, n) { // CPython's round(x, n): correctly rounded from the exact binary value, ties to even
    if (!isFinite(x) || x === 0 || n > 22 || Math.abs(x) >= 1e21) return x;
    if (n < 0) { const p = Math.pow(10, -n); return roundHalfEven(x / p) * p; }
    const [ip, fp] = nativeToFixed.call(Math.abs(x), 100).split('.'); // exact decimal expansion
    let head = ip + fp.slice(0, n);
    const rest = fp.slice(n), tie = rest[0] === '5' && !/[1-9]/.test(rest.slice(1));
    if (rest[0] > '5' || (rest[0] === '5' && !tie) || (tie && +head[head.length - 1] % 2 === 1)) {
      head = (BigInt(head) + 1n).toString().padStart(head.length, '0');
    }
    const whole = head.slice(0, head.length - n) || '0', frac = head.slice(head.length - n);
    return parseFloat((x < 0 ? '-' : '') + whole + (n ? '.' + frac : ''));
  }
  function patchFloats() {
    const proto = Sk.builtin.float_.prototype, origStr = proto.str$;
    proto.str$ = function (base, sign) {
      if (base !== undefined && base !== 10) return origStr.call(this, base, sign);
      const v = this.v;
      if (isNaN(v)) return 'nan';
      if (v === Infinity || v === -Infinity) return v < 0 && sign !== false ? '-inf' : 'inf';
      return floatRepr(sign === false ? Math.abs(v) : v);
    };
    proto.round$ = function (nd) {
      const x = Sk.builtin.asnum$(this);
      if (nd === undefined || Sk.builtin.checkNone(nd)) {
        if (isNaN(x)) throw new Sk.builtin.ValueError('cannot convert float NaN to integer');
        if (!isFinite(x)) throw new Sk.builtin.OverflowError('cannot convert float infinity to integer');
        return new Sk.builtin.int_(roundHalfEven(x));
      }
      return new Sk.builtin.float_(roundDigits(x, Sk.misceval.asIndexSized(nd)));
    };
  }
  if (typeof Sk !== 'undefined') patchFloats();

  function readModule(name) {
    if (Sk.builtinFiles === undefined || Sk.builtinFiles.files[name] === undefined) {
      throw "File not found: '" + name + "'";
    }
    return Sk.builtinFiles.files[name];
  }

  function toJsFiles(pyDict) {
    try { return Sk.ffi.remapToJs(pyDict) || {}; } catch (e) { return {}; }
  }

  function parseError(e) {
    if (e && e.codecraftStopped) return { type: 'Stopped', message: 'You stopped the program.', line: null };
    if (!(e instanceof Sk.builtin.BaseException)) {
      return { type: 'Error', message: String(e && e.message ? e.message : e), line: null };
    }
    const type = e.tp$name || 'Error';
    let message = '';
    try {
      const a = e.args && e.args.v && e.args.v[0];
      message = a ? String(a.v !== undefined ? a.v : Sk.misceval.objectRepr(a)) : '';
    } catch (_) { /* fall back to toString below */ }
    const text = String(e.toString());
    if (!message) message = text.replace(/^\w+:\s*/, '').replace(/ on line \d+$/, '');
    // Innermost frame that belongs to the student's code (not the file-system preamble).
    let line = null;
    if (Array.isArray(e.traceback)) {
      const frame = e.traceback.find(t => t && /<stdin>/.test(t.filename || '')) || null;
      if (frame) line = frame.lineno;
    }
    if (line == null) { const m = text.match(/on line (\d+)/); if (m) line = +m[1]; }
    return { type, message, line };
  }

  async function runNow(code, opts = {}) {
    if (typeof Sk === 'undefined') {
      return { ok: false, error: { type: 'Offline', message: 'The Python engine (Skulpt) did not load. Check your internet connection and reload the page.', line: null }, files: opts.files || {}, ms: 0 };
    }
    const job = { stopped: false, rejectInput: null, waited: 0 };
    current = job;
    const onOutput = opts.onOutput || (() => {});
    const onInput = opts.onInput || (() => Promise.resolve(''));

    Sk.configure({
      output: text => { if (!job.stopped) onOutput(text); },
      read: readModule,
      inputfun: prompt => new Promise((resolve, reject) => {
        if (job.stopped) { reject(stopError()); return; }
        const waitStart = Date.now();
        job.rejectInput = reject;
        Promise.resolve(onInput(prompt)).then(value => {
          job.rejectInput = null;
          // Time spent waiting for the user doesn't count towards the run-time limit.
          const waited = Date.now() - waitStart;
          job.waited += waited;
          if (Sk.execStart) Sk.execStart = new Date(+Sk.execStart + waited);
          resolve(value);
        }, reject);
      }),
      inputfunTakesPrompt: true,
      __future__: Sk.python3,
      execLimit: opts.execLimit || 3000,
      // No time-slicing (yieldLimit): Skulpt 1.2.0 loses a function's work when it yields inside a call — a function
      // running longer than the yield interval comes back with the wrong value or skips the line that called it
      // (e.g. x = f() leaves x undefined). execLimit still stops infinite loops with a TimeLimitError.
      yieldLimit: null
    });

    const t0 = performance.now();
    let preDict = null;
    Number.prototype.toFixed = pyToFixed; // Python's rounding for formatted floats, only while Python runs
    const stopCheck = { '*': () => { if (job.stopped) throw stopError(); } };
    try {
      // 1. The virtual file system, run as its own module so the student's line numbers stay correct.
      const pre = await Sk.misceval.asyncToPromise(() => Sk.importMainWithBody('_pre', false, CodeCraft.VFS_PREAMBLE, true));
      preDict = pre.$d;
      for (const [name, text] of Object.entries(opts.files || {})) {
        preDict._FS.mp$ass_subscript(new Sk.builtin.str(name), new Sk.builtin.str(text));
      }
      Sk.builtins.open = preDict.open;
      Sk.builtins.FileNotFoundError = preDict.FileNotFoundError;
      // 2. The student's program.
      await Sk.misceval.asyncToPromise(() => Sk.importMainWithBody('<stdin>', false, code, true), stopCheck);
      return { ok: true, error: null, files: toJsFiles(preDict._FS), ms: performance.now() - t0 - job.waited };
    } catch (e) {
      return { ok: false, error: parseError(job.stopped ? stopError() : e), files: preDict ? toJsFiles(preDict._FS) : (opts.files || {}), ms: performance.now() - t0 - job.waited };
    } finally {
      Number.prototype.toFixed = nativeToFixed;
      if (current === job) current = null;
    }
  }

  /* ---------- line-by-line tracer ----------
     CodeCraft.runner.trace(code, { files, inputs, lineOffset }) runs a program with Skulpt's debugger switched on,
     pausing before every line of the student's program and recording the line and the variables in scope.
     Returns { ok, error, output, steps: [{ line, depth, func, vars, out }], final, truncated }.
     `vars` is the state BEFORE the line runs; traceRows() turns that into "what each line changed". */
  const SKIP = new Set(['__name__', '__doc__', '__package__', '__file__', '__builtins__', '__loader__', '__spec__']);
  function show(v, depth = 0) {
    try {
      if (v === undefined || v === null) return undefined;
      if (v instanceof Sk.builtin.func || v instanceof Sk.builtin.type || v instanceof Sk.builtin.module || (Sk.builtin.method && v instanceof Sk.builtin.method)) return undefined;
      const tp = v.ob$type, isUser = tp && tp.sk$klass && v.$d instanceof Sk.builtin.dict;
      if (isUser && tp.prototype.tp$name === '_VFile') { // the virtual file system's file object
        const g = k => Sk.ffi.remapToJs(v.$d.mp$subscript(new Sk.builtin.str(k)));
        return `<file ${py(g('name'))}, mode ${py(g('mode'))}>`;
      }
      if (isUser) { // an object of the student's own class: show its attributes
        if (depth > 1) return tp.prototype.tp$name + '(…)';
        const parts = [];
        const keys = Sk.ffi.remapToJs(new Sk.builtin.list(Sk.misceval.arrayFromIterable(v.$d)));
        keys.forEach(k => parts.push(String(k).replace(/^_[A-Za-z]\w*?(__\w+)$/, '$1') + '=' + show(v.$d.mp$subscript(new Sk.builtin.str(k)), depth + 1)));
        return tp.prototype.tp$name + '(' + parts.join(', ') + ')';
      }
      return String(Sk.misceval.objectRepr(v));
    } catch (e) { return '…'; }
  }
  const py = x => "'" + String(x) + "'";
  function frameVars(f, depth) {
    const out = {};
    if (depth === 1) {
      for (const k of Object.keys(f.$loc || {})) { if (SKIP.has(k) || k.startsWith('$')) continue; const s = show(f.$loc[k]); if (s !== undefined) out[k] = s; }
    } else {
      for (const k of Object.keys(f.$tmps || {})) { if (k.startsWith('$')) continue; const s = show(f.$tmps[k]); if (s !== undefined) out[k] = s; }
    }
    return out;
  }
  async function traceNow(code, opts = {}) {
    if (typeof Sk === 'undefined') return { ok: false, error: { type: 'Offline', message: 'Python engine not loaded', line: null }, output: '', steps: [], final: {} };
    const job = { stopped: false, rejectInput: null, waited: 0 };
    current = job;
    const steps = [], maxSteps = opts.maxSteps || 600, inputs = (opts.inputs || []).map(String);
    let out = '', truncated = false, preDict = null;
    Sk.configure({
      output: t => { out += t; }, read: readModule,
      inputfun: prompt => { const v = inputs.length ? inputs.shift() : ''; out += (prompt || '') + v + '\n'; return v; },
      inputfunTakesPrompt: true, __future__: Sk.python3, execLimit: opts.execLimit || 6000, yieldLimit: null,
      debugging: true, breakpoints: f => f === '<stdin>.py'
    });
    Number.prototype.toFixed = pyToFixed;
    const handler = { 'Sk.debug': susp => {
      if (job.stopped) throw stopError();
      if (steps.length < maxSteps) {
        const frames = []; let s = susp;
        while (s) { if (s.$lineno !== undefined && s.$filename === '<stdin>.py') frames.push(s); s = s.child; }
        const f = frames[frames.length - 1];
        if (f) {
          const fn = frames.length > 1 && f.$tmps && f.$tmps.self ? 'method' : frames.length > 1 ? 'function' : '';
          steps.push({ line: f.$lineno, depth: frames.length, func: fn, vars: frameVars(f, frames.length), out: out.length });
        }
      } else truncated = true;
      return Promise.resolve(susp.resume());
    } };
    try {
      const pre = await Sk.misceval.asyncToPromise(() => Sk.importMainWithBody('_pre', false, CodeCraft.VFS_PREAMBLE, true), handler);
      preDict = pre.$d;
      for (const [name, text] of Object.entries(opts.files || {})) preDict._FS.mp$ass_subscript(new Sk.builtin.str(name), new Sk.builtin.str(text));
      Sk.builtins.open = preDict.open;
      Sk.builtins.FileNotFoundError = preDict.FileNotFoundError;
      const mod = await Sk.misceval.asyncToPromise(() => Sk.importMainWithBody('<stdin>', false, code, true), handler);
      return { ok: true, error: null, output: out, steps, final: frameVars({ $loc: mod.$d }, 1), truncated };
    } catch (e) {
      return { ok: false, error: parseError(job.stopped ? stopError() : e), output: out, steps, final: null, truncated };
    } finally {
      Number.prototype.toFixed = nativeToFixed;
      Sk.configure({ debugging: false, breakpoints: () => true, output: () => {} });
      if (current === job) current = null;
    }
  }
  /* From trace steps to rows: each row is one line that ran, with the variables it changed (in its own frame)
     and anything it printed. A line that calls a function shows its changes once the call has returned. */
  // Block structure from indentation: for each line, its header kind and the last line of its body.
  function blocks(code) {
    const lines = code.split('\n'), info = {};
    const ind = l => l.match(/^\s*/)[0].length, blank = l => !l.trim() || /^\s*#/.test(l);
    lines.forEach((l, i) => {
      const m = l.match(/^\s*(for|while|if|elif|else|def|class|with|try|except|finally)\b(.*?):\s*(#.*)?$/);
      if (!m) return;
      let end = i;
      for (let k = i + 1; k < lines.length; k++) { if (blank(lines[k])) continue; if (ind(lines[k]) <= ind(l)) break; end = k; }
      const target = m[1] === 'for' ? (m[2].match(/^\s*(.+?)\s+in\s/) || [])[1] : null;
      info[i + 1] = { kind: m[1], start: i + 2, end: end + 1, vars: target ? target.split(',').map(v => v.trim()) : [], name: m[1] === 'def' || m[1] === 'class' ? (m[2].match(/^\s*(\w+)/) || [])[1] : null };
    });
    return { info, lines, loops: Object.keys(info).map(Number).filter(h => info[h].kind === 'for' || info[h].kind === 'while') };
  }
  function traceRows(t, code) {
    const rows = [], s = t.steps, B = code ? blocks(code) : { info: {}, loops: [] };
    const inBody = (h, line) => line >= B.info[h].start && line <= B.info[h].end;
    for (let i = 0; i < s.length; i++) {
      const cur = s[i];
      let j = i + 1;
      while (j < s.length && s[j].depth > cur.depth) j++;
      let after = null;
      if (j < s.length) after = s[j].depth === cur.depth ? s[j].vars : null;
      else if (cur.depth === 1 && t.final) after = t.final;
      let changes = after ? Object.keys(after).filter(k => after[k] !== cur.vars[k]).map(k => [k, after[k]]) : [];
      const nextOut = i + 1 < s.length ? s[i + 1].out : t.output.length;
      let printed = t.output.slice(cur.out, nextOut);
      // Leaving a function: anything printed before the caller's next line was printed by the line that made the
      // call (e.g. print(f(x)) prints after f returns) — unless the function's last line prints something itself.
      const backTo = i + 1 < s.length ? s[i + 1].depth : 1;
      if (backTo < cur.depth && printed && B.lines && !/\b(print|input)\s*\(/.test(B.lines[cur.line - 1] || '')) {
        const caller = rows.slice().reverse().find(r => r.depth === backTo && !r.synthetic);
        if (caller) { caller.printed += printed; printed = ''; }
      }
      const row = { line: cur.line, depth: cur.depth, func: cur.func, changes, vars: after || cur.vars, printed };
      const h = B.info[cur.line], next = j < s.length && s[j].depth === cur.depth ? s[j].line : null;
      if (h && (h.kind === 'if' || h.kind === 'elif' || h.kind === 'while')) row.cond = next !== null && inBody(cur.line, next);
      if (h && (h.kind === 'def' || h.kind === 'class')) row.note = h.kind === 'def' ? `defines ${h.name}()` : `defines class ${h.name}`;
      rows.push(row);
      // Loops: Skulpt only pauses on a loop's header the first time, so add the "go round again" / "loop ends" steps.
      if (next === null) {
        if (j >= s.length && cur.depth === 1) { // end of the program: close any loops it finished inside
          B.loops.filter(L => inBody(L, cur.line)).sort((a, b) => B.info[b].start - B.info[a].start).forEach(L => {
            rows.push({ line: L, depth: 1, func: '', changes: [], vars: row.vars, printed: '', synthetic: true, ...(B.info[L].kind === 'while' ? { cond: false } : { done: true }) });
          });
        }
        continue;
      }
      const around = B.loops.filter(L => inBody(L, cur.line)).sort((a, b) => B.info[b].start - B.info[a].start); // innermost first
      for (const L of around) {
        const info = B.info[L];
        if (inBody(L, next) && next <= cur.line) { // same loop goes round again
          const moved = info.kind === 'for' ? row.changes.filter(([k]) => info.vars.includes(k)) : [];
          row.changes = row.changes.filter(([k]) => !moved.some(([m]) => m === k));
          rows.push({ line: L, depth: cur.depth, func: cur.func, changes: moved, vars: row.vars, printed: '', synthetic: true, ...(info.kind === 'while' ? { cond: true } : { next: true }) });
          break;
        }
        if (inBody(L, next)) break; // still inside this loop's body
        // leaving the loop (or restarting it from the top, which Skulpt shows as a fresh pause on the header)
        if (info.kind === 'while') rows.push({ line: L, depth: cur.depth, func: cur.func, changes: [], vars: row.vars, printed: '', synthetic: true, cond: false });
        else rows.push({ line: L, depth: cur.depth, func: cur.func, changes: [], vars: row.vars, printed: '', synthetic: true, done: true });
      }
    }
    return rows;
  }

  /* One program at a time. Skulpt's configuration (output, input, debugger) is global, and run/trace await between
     configuring it and running the student's program — so overlapping calls (e.g. several question cards replaying
     saved answers at once) would send one program's output to another's collector. Calls queue up instead. */
  let queue = Promise.resolve();
  const exclusive = fn => { const p = queue.then(fn, fn); queue = p.then(() => {}, () => {}); return p; };
  const run = (code, opts) => exclusive(() => runNow(code, opts));
  const trace = (code, opts) => exclusive(() => traceNow(code, opts));

  function stopError() { const e = new Error('stopped'); e.codecraftStopped = true; return e; }

  function stop() {
    if (!current) return;
    current.stopped = true;
    if (current.rejectInput) { current.rejectInput(stopError()); current.rejectInput = null; }
  }

  /* Beginner-friendly explanations. `link` points at the lesson that teaches the fix. */
  const FRIENDLY = {
    NameError: (m) => {
      const n = (m.match(/'([^']+)'/) || [])[1];
      return { text: `Python doesn't know the name ${n ? '<code>' + esc(n) + '</code>' : 'you used'}. Check the spelling and capital letters, and make sure the variable is given a value <em>before</em> the line that uses it.`, link: 'B2.1.1' };
    },
    TypeError: () => ({ text: 'You used a value of the wrong type — for example adding a string to an integer (<code>"Age: " + 16</code>). Convert it first with <code>str()</code>, <code>int()</code> or <code>float()</code>.', link: 'B2.1.1' }),
    ValueError: () => ({ text: 'The value has the right type but the wrong content — for example <code>int("abc")</code>. Use <code>try</code> / <code>except ValueError</code> to ask again instead of crashing.', link: 'B2.1.3' }),
    ZeroDivisionError: () => ({ text: 'You divided by zero (Skulpt calls it "integer division or modulo by zero"). Check the divisor isn\'t 0 before dividing, or catch the <code>ZeroDivisionError</code>.', link: 'B2.1.3' }),
    IndexError: () => ({ text: 'You asked for a position that doesn\'t exist. Indexes start at 0, so the last item of a list of length n is at index <code>n - 1</code>.', link: 'B2.2.2' }),
    KeyError: () => ({ text: 'That key isn\'t in the dictionary. Check the spelling, or test with <code>in</code> before using it.', link: null }),
    IndentationError: () => ({ text: 'The indentation (spaces at the start of a line) is wrong. Every line inside an <code>if</code>, loop or function must be indented by the same amount — CodeCraft uses 4 spaces.', link: 'B2.3.2' }),
    SyntaxError: () => ({ text: 'Python can\'t read this line. Look for a missing colon <code>:</code> at the end of an <code>if</code>/<code>for</code>/<code>def</code> line, an unclosed bracket or quote, or <code>=</code> where you meant <code>==</code>.', link: null }),
    TimeLimitError: () => ({ text: 'Your program ran for more than 3 seconds, so CodeCraft stopped it. That is almost always an <strong>infinite loop</strong>: check that the loop condition can become False and that the loop variable changes each time round.', link: 'B2.3.1' }),
    FileNotFoundError: () => ({ text: 'There\'s no file with that name. Open the <strong>Files</strong> tab to see which files exist, and check the spelling and extension.', link: 'B2.5.1' }),
    AttributeError: (m) => ({ text: /__/.test(m) ? 'That attribute is private (its name starts with <code>__</code>), so it can\'t be reached from outside the class. Use a getter method instead.' : 'That object doesn\'t have the attribute or method you asked for. Check the spelling, and that it was set in <code>__init__</code>.', link: /__/.test(m) ? 'B3.1.5' : 'B3.1.4' }),
    IOError: () => ({ text: 'The file is open in the wrong mode — you can only <code>read</code> a file opened with <code>"r"</code> and only <code>write</code> to one opened with <code>"w"</code> or <code>"a"</code>.', link: 'B2.5.1' }),
    Offline: () => ({ text: 'CodeCraft needs an internet connection the first time it loads, to download the Python engine.', link: null })
  };
  function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
  function explain(err, code) {
    if (!err) return null;
    let type = err.type;
    // Skulpt reports a missing indent as "SyntaxError: bad input" — spot it from the code itself.
    if (type === 'SyntaxError' && code && err.line) {
      const lines = code.split('\n');
      const cur = lines[err.line - 1] || '';
      let p = err.line - 2;
      while (p >= 0 && !lines[p].trim()) p--;
      const prev = p >= 0 ? lines[p] : '';
      const indent = t => t.match(/^\s*/)[0].length;
      if (/:\s*(#.*)?$/.test(prev) && cur.trim() && indent(cur) <= indent(prev)) type = 'IndentationError';
      else if (/^\s/.test(cur) && !/:\s*(#.*)?$/.test(prev) && indent(cur) > indent(prev)) type = 'IndentationError';
    }
    const f = FRIENDLY[type];
    return f ? f(err.message || '') : null;
  }

  CodeCraft.runner = { run, trace, traceRows, stop, explain, get running() { return !!current; } };
})();
