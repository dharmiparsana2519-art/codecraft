/* runner.js — runs Python in the browser with Skulpt 1.2.0.
   CodeCraft.runner.run(code, opts) → Promise<{ ok, error, files, ms }>
     opts.onOutput(text)        console output (print)
     opts.onInput(prompt)       must return a Promise<string> (in-console input box, or scripted input)
     opts.files                 { name: text } pre-loaded into the virtual file system
     opts.execLimit             ms of run time before TimeLimitError (default 3000)
   CodeCraft.runner.stop()         stops the current run
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

  async function run(code, opts = {}) {
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
      yieldLimit: 100
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

  CodeCraft.runner = { run, stop, explain, get running() { return !!current; } };
})();
