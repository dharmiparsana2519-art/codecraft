/* widgets/notes.js — "Build it from scratch" notes (CLAUDE.md: "RULE: Always teach the reasoning").
   A lesson's notes file, content/notes/<lesson id>.js, calls CodeCraft.addNotes(id, notes) and the notes become
   that lesson's Learn section.

   notes = { intro: html, programs: [program, …] }
   program = {
     title, goal: html, input: html, output: html,        1. the goal in plain English
     think: [html], works: html,                           2. think before coding, and why the approach works
     vars: [[name, type, why]],                            3. variables and data types
     code, inputs: [typed values], out,                    the finished program, what to type, what it prints
     files: { name: text },                                virtual files the programs start with (optional)
     build: [{ add: n | [n, …], why, missing,              4. write it line by line: lines of `code` (1-based) in the
               inputs?, expect? }],                           order you write them; expect 'loops' or 'Error' if
                                                              that stage on its own never ends / crashes
     trace: { cols: [names], note, code?, inputs? },       5. a trace table, built live by the site's tracer;
                                                              a column 'obj.attr' follows one attribute of an object
     mistakes: [{ title, code, bad: line, out | error |    6. common mistakes: wrong code, what happens, why
                  loops: true, inputs?, why }],
     nobuiltins: { title?, intro, code, out, inputs?,      7. the no-built-ins version and each change
                   changes, ban } | { none: html }            (or why nothing needs to change)
     tip: html                                             8. exam tip
   }
   Every code block here runs in the site's editor; tools/notes_check.py (CPython) and tools/check.html (Skulpt)
   run every one of them, including every stage of the line-by-line build, and compare the results.

   CodeCraft.notes.blocks(id)   → every runnable block with what it should do (for the checkers)
   CodeCraft.notes.hydrate(el, getPlayground) wires up Run buttons, the line-by-line steppers and trace tables. */
window.CodeCraft = window.CodeCraft || {};

(function (CC) {
  const NOTES = {}, RUN = {};
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ICON = (n, cls = '') => `<svg class="ic ${cls}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
  const hi = src => (CC.practiceUI ? CC.practiceUI.highlight(src) : esc(src));
  const ind = l => l.match(/^\s*/)[0].length;
  const isHeader = l => /:\s*(#[^"']*)?$/.test(l) && /^\s*(for|while|if|elif|else|def|class|with|try|except|finally)\b/.test(l);
  const trimEnd = s => s.replace(/\n+$/, '');

  /* The program as it stands after the first `upto` build steps: the lines written so far, in their final order,
     with `pass` standing in for any block whose body hasn't been written yet. `map` gives each line's number in the
     finished program (0 for a stand-in). */
  function stage(p, upto) {
    const lines = trimEnd(p.code).split('\n'), shown = new Set();
    p.build.slice(0, upto).forEach(b => [].concat(b.add).forEach(n => shown.add(n)));
    const idx = [...shown].sort((a, b) => a - b), out = [], map = [];
    idx.forEach((n, k) => {
      const l = lines[n - 1];
      out.push(l); map.push(n);
      const nx = idx[k + 1];
      if (isHeader(l) && (!nx || ind(lines[nx - 1]) <= ind(l))) { out.push(' '.repeat(ind(l) + 4) + 'pass  # the body comes next'); map.push(0); }
    });
    return { code: out.join('\n') + '\n', map };
  }

  /* Every runnable block in a lesson's notes, with what it should do: { out } exact output, { error: 'Type' },
     { loops: true } never ends, or { runs: true } just runs without an error. */
  function blocks(id) {
    const N = NOTES[id], list = [];
    if (!N) return list;
    N.programs.forEach((p, pi) => {
      const tag = `program ${pi + 1}`;
      const files = p.files || {};
      list.push({ where: `${tag}: finished program`, code: p.code, inputs: p.inputs || [], files, expect: { out: p.out } });
      p.build.forEach((b, bi) => {
        const s = stage(p, bi + 1);
        const expect = b.expect === 'loops' ? { loops: true } : b.expect ? { error: b.expect } : bi === p.build.length - 1 ? { out: p.out } : { runs: true };
        list.push({ where: `${tag}: line-by-line step ${bi + 1}`, code: s.code, inputs: b.inputs || p.inputs || [], files, expect });
      });
      if (p.trace) list.push({ where: `${tag}: trace`, code: p.trace.code || p.code, inputs: p.trace.inputs || p.inputs || [], files, expect: { runs: true }, trace: p.trace.cols });
      (p.mistakes || []).forEach((m, mi) => list.push({ where: `${tag}: mistake ${mi + 1}`, code: m.code, inputs: m.inputs || p.inputs || [], files: m.files || files,
        expect: m.loops ? { loops: true } : m.error ? { error: m.error } : { out: m.out } }));
      if (p.nobuiltins && p.nobuiltins.code) list.push({ where: `${tag}: no built-ins`, code: p.nobuiltins.code, inputs: p.nobuiltins.inputs || p.inputs || [], files, expect: { out: p.nobuiltins.out }, banned: p.nobuiltins.ban || [] });
    });
    return list;
  }

  /* ---------- rendering ---------- */
  let runId = 0;
  let curFiles = null; // the files of the program being rendered
  const runBtn = (code, inputs, label = 'Run in the editor', files = curFiles) => {
    const k = 'r' + (++runId);
    RUN[k] = { code: trimEnd(code) + '\n', inputs: inputs || [], files };
    return `<button class="btn sm nt-run" data-run="${k}" type="button">${ICON('play')}${label}</button>`;
  };
  // Code with line numbers; `marks` maps a line number to a class (new / bad / dim).
  const block = (src, marks = {}) => `<pre class="q-code cm-s-default nt-code">${hi(trimEnd(src)).split('\n').map((l, i) => `<span class="l${marks[i + 1] ? ' ' + marks[i + 1] : ''}">${l || ' '}</span>`).join('')}</pre>`;
  const typed = inputs => (inputs && inputs.length ? `<p class="nt-typed">Typed into the console: ${inputs.map(v => `<kbd>${esc(v)}</kbd>`).join(' ')}</p>` : '');
  const result = m => m.loops
    ? `<div class="nt-res loops">${ICON('x')}<span><b>Never finishes</b> — an infinite loop. In the editor, CodeCraft stops it after 3 seconds.</span></div>`
    : m.error ? `<div class="nt-res err">${ICON('x')}<span><b>Crashes with ${esc(m.error)}</b>${m.errorText ? ` — ${esc(m.errorText)}` : ''}</span></div>`
      : `<div class="nt-res out"><span class="nt-res-k">Output</span><pre>${esc(trimEnd(m.out)) || '<i>(nothing)</i>'}</pre></div>`;
  const H4 = (n, title) => `<h4 class="nt-h"><span class="nt-hn">${n}</span>${title}</h4>`;

  function buildStepper(p) {
    const n = p.build.length;
    const steps = p.build.map((b, i) => {
      const s = stage(p, i + 1), add = new Set([].concat(b.add)), marks = {};
      s.map.forEach((fin, k) => { marks[k + 1] = add.has(fin) ? 'new' : fin === 0 ? 'dim' : ''; });
      const added = [].concat(b.add).map(x => trimEnd(p.code).split('\n')[x - 1].trim());
      return `<li class="nt-bstep" data-i="${i}"${i ? ' hidden' : ''}>
        <p class="nt-bk">Step ${i + 1} of ${n} · add <code>${esc(added.join('  ⏎  '))}</code></p>
        ${block(s.code, marks)}
        <div class="nt-bwhy"><p><b>Why this line?</b> ${b.why}</p><p class="nt-miss"><b>If it's missing or in the wrong place:</b> ${b.missing}</p></div>
        ${runBtn(s.code, b.inputs || p.inputs, 'Run the program so far')}
      </li>`;
    }).join('');
    return `<div class="nt-build" data-n="${n}">
      <div class="nt-bnav" role="group" aria-label="Line-by-line steps">
        <button class="btn sm" data-bstep="prev" type="button" disabled>${ICON('left')}Back</button>
        <span class="nt-bpos" aria-live="polite">Step 1 of ${n}</span>
        <button class="btn sm primary" data-bstep="next" type="button">Next line${ICON('arrow')}</button>
        <button class="btn sm nt-ball" data-bstep="all" type="button" aria-pressed="false">Show all steps</button>
      </div>
      <ol class="nt-bsteps">${steps}</ol>
    </div>`;
  }

  const filesBox = files => (files && Object.keys(files).length ? `<div class="q-files nt-files">${Object.keys(files).map(n => `<figure class="q-file"><figcaption>${ICON('file')}${esc(n)}</figcaption><pre>${esc(files[n])}</pre></figure>`).join('')}</div>` : '');
  function renderProgram(p, pi, id) {
    const num = pi + 1;
    curFiles = p.files || null;
    const vars = `<div class="tv-wrap"><table class="tv nt-vars"><thead><tr><th>Variable</th><th>Type</th><th>Why we need it</th></tr></thead><tbody>${p.vars.map(v => `<tr><td><code>${esc(v[0])}</code></td><td>${esc(v[1])}</td><td>${v[2]}</td></tr>`).join('')}</tbody></table></div>`;
    const tr = p.trace;
    return `<section class="nt-prog" id="nt-${esc(id)}-${num}" aria-labelledby="nt-h-${num}">
      <h3 class="nt-title" id="nt-h-${num}"><span class="nt-pn">Program ${num}</span>${p.title}</h3>
      ${H4(1, 'The goal')}
      ${p.goal}
      <dl class="nt-io"><div><dt>In</dt><dd>${p.input}</dd></div><div><dt>Out</dt><dd>${p.output}</dd></div></dl>
      ${p.files ? `<p class="nt-help">The program reads ${Object.keys(p.files).length === 1 ? 'this file' : 'these files'} — the Run buttons load ${Object.keys(p.files).length === 1 ? 'it' : 'them'} into the editor's Files tab too.</p>${filesBox(p.files)}` : ''}
      ${H4(2, 'Think before coding')}
      <ol class="nt-think">${p.think.map(t => `<li>${t}</li>`).join('')}</ol>
      <p class="nt-works"><b>Why this works:</b> ${p.works}</p>
      ${H4(3, 'Variables and data types')}
      ${vars}
      ${H4(4, 'Write it line by line')}
      <p class="nt-help">Press <b>Next line</b> to grow the program one line at a time. A grey <code>pass</code> holds the place of a block you haven't written yet, so every stage still runs.</p>
      ${buildStepper(p)}
      <details class="nt-final"><summary>The finished program</summary>${block(p.code)}${typed(p.inputs)}${result({ out: p.out })}${runBtn(p.code, p.inputs)}</details>
      ${tr ? `${H4(5, 'Trace it')}
      ${tr.intro || ''}
      <div class="nt-tracebox">${block(tr.code || p.code)}${typed(tr.inputs || p.inputs)}
      <div class="nt-trace" data-trace="${esc(id)}|${pi}"><p class="nt-help">Building the trace table…</p></div></div>
      ${tr.note ? `<p class="nt-tnote">${tr.note}</p>` : ''}` : ''}
      ${H4(6, 'Common mistakes')}
      <div class="nt-mistakes">${(p.mistakes || []).map(m => `<div class="nt-mis">
        <h5>${ICON('x', 'i-no')}${m.title}</h5>
        ${block(m.code, m.bad ? { [m.bad]: 'bad' } : {})}${typed(m.inputs)}
        ${result(m)}
        <p><b>Why:</b> ${m.why}</p>
        ${runBtn(m.code, m.inputs || p.inputs, 'Run it and see', m.files || curFiles)}
      </div>`).join('')}</div>
      ${p.nobuiltins && p.nobuiltins.none ? `${H4(7, 'No built-ins version')}<p>${p.nobuiltins.none}</p>` : ''}
      ${p.nobuiltins && p.nobuiltins.code ? `${H4(7, p.nobuiltins.title || 'No built-ins version')}
      ${p.nobuiltins.intro}
      ${block(p.nobuiltins.code)}${typed(p.nobuiltins.inputs)}
      ${result({ out: p.nobuiltins.out })}
      <ol class="nt-changes">${p.nobuiltins.changes.map(c => `<li>${c}</li>`).join('')}</ol>
      ${runBtn(p.nobuiltins.code, p.nobuiltins.inputs || p.inputs)}` : ''}
      ${H4(p.nobuiltins ? 8 : 7, 'Exam tip')}
      <aside class="nt-tip">${ICON('bulb')}<div>${p.tip}</div></aside>
    </section>`;
  }

  function render(id) {
    const N = NOTES[id];
    const toc = `<nav class="nt-toc" aria-label="Programs in these notes"><p class="nt-help">Build it from scratch — ${N.programs.length} programs, each written one line at a time:</p><ol>${N.programs.map((p, i) => `<li><a href="#nt-${esc(id)}-${i + 1}" data-nt-jump>${p.title}</a></li>`).join('')}</ol></nav>`;
    return `<div class="notes">${N.intro || ''}${toc}${N.programs.map((p, i) => renderProgram(p, i, id)).join('')}</div>`;
  }

  /* ---------- trace tables, built live from the tracer (runner.trace + traceRows) ---------- */
  // One attribute from the tracer's picture of an object, e.g. attrOf("Stack(items=[1, None], topIndex=0)", "topIndex") → "0".
  function attrOf(repr, name) {
    const open = repr.indexOf('(');
    if (open < 0) return undefined;
    const parts = [];
    let depth = 0, q = null, start = open + 1;
    for (let k = open + 1; k < repr.length; k++) {
      const c = repr[k];
      if (q) { if (c === '\\') k++; else if (c === q) q = null; continue; }
      if (c === '"' || c === "'") q = c;
      else if ('([{'.includes(c)) depth++;
      else if (')]}'.includes(c)) { if (!depth) { parts.push(repr.slice(start, k)); break; } depth--; }
      else if (c === ',' && !depth) { parts.push(repr.slice(start, k)); start = k + 1; }
    }
    for (const p of parts) { const m = p.trim().match(/^(\w+)=([\s\S]*)$/); if (m && m[1] === name) return m[2]; }
    return undefined;
  }
  async function traceTable(host, p) {
    const tr = p.trace, src = tr.code || p.code, cols = tr.cols, lines = src.split('\n');
    const t = await CC.runner.trace(src, { inputs: tr.inputs || p.inputs || [], files: p.files || {} });
    if (!t.ok && !t.steps.length) { host.innerHTML = `<p class="nt-help">The trace table needs the Python engine, which didn't load. Run the program in the editor instead.</p>`; return; }
    const out = [], last = {};
    // A line that calls a function finishes after the function's own lines, so list it after them.
    const rows = [], wait = [], all = CC.runner.traceRows(t, src);
    all.forEach((r, k) => {
      while (wait.length && wait[wait.length - 1].depth >= r.depth) rows.push(wait.pop());
      if (all[k + 1] && all[k + 1].depth > r.depth) wait.push(r); else rows.push(r);
    });
    while (wait.length) rows.push(wait.pop());
    const condOf = l => (l.match(/^\s*(?:while|if|elif)\s+(.*?):\s*(#.*)?$/) || [])[1];
    for (const r of rows) {
      const ch = new Map(r.changes);
      // A cell shows a value only on the row where it changes, as in an exam trace table.
      const cells = cols.map(c => {
        const [base, attr] = c.split('.');
        if (!ch.has(base)) return '';
        const v = attr ? attrOf(ch.get(base), attr) : ch.get(base);
        if (v === undefined || (attr && last[c] === v)) return '';
        last[c] = v;
        return v;
      });
      const cond = r.cond !== undefined && condOf(lines[r.line - 1]) ? { text: condOf(lines[r.line - 1]), v: r.cond } : r.done ? { done: true } : null;
      const printed = trimEnd(r.printed || '');
      if (cells.every(c => c === '') && !cond && !printed) continue;
      out.push({ line: r.line, cells, cond, printed });
    }
    const hasCond = out.some(r => r.cond);
    host.innerHTML = `<p class="nt-help">One row each time a variable changes, a condition is tested or something is printed — the way an IB trace table is set out. Click a row to see its line.</p>
      <div class="tv-wrap"><table class="tv nt-ttable"><thead><tr><th>Line</th>${cols.map(c => `<th>${esc(c.split('.').pop())}</th>`).join('')}${hasCond ? '<th>Condition</th>' : ''}<th>Output</th></tr></thead><tbody>${out.map(r => `<tr data-line="${r.line}">
        <td class="tv-l">${r.line}</td>${r.cells.map(c => `<td class="nt-cell">${c === '' ? '' : `<code>${esc(c)}</code>`}</td>`).join('')}
        ${hasCond ? `<td>${!r.cond ? '' : r.cond.done ? '<span class="tv-note">no more items: loop ends</span>' : `<code>${esc(r.cond.text)}</code> <span class="tv-cond ${r.cond.v ? 't' : 'f'}">${r.cond.v ? 'True' : 'False'}</span>`}</td>` : ''}
        <td class="tv-out">${r.printed ? `<pre>${esc(r.printed)}</pre>` : ''}</td></tr>`).join('')}</tbody></table></div>`;
    const codeEl = host.closest('.nt-tracebox').querySelector('.nt-code');
    host.querySelectorAll('tr[data-line]').forEach(tr2 => tr2.addEventListener('click', () => {
      if (!codeEl) return;
      codeEl.querySelectorAll('.l').forEach((l, i) => l.classList.toggle('hl', i + 1 === +tr2.dataset.line));
      host.querySelectorAll('tr.on').forEach(x => x.classList.remove('on'));
      tr2.classList.add('on');
    }));
  }

  function hydrate(el, getPlayground) {
    if (!el) return;
    el.addEventListener('click', e => {
      const run = e.target.closest('[data-run]');
      if (run) {
        const pg = getPlayground(), r = RUN[run.dataset.run];
        if (!pg || !r) return;
        if (r.files && pg.setFiles) pg.setFiles(r.files);
        pg.setCode(r.code);
        pg.run();
        const dock = document.getElementById('dock');
        if (dock) { const b = dock.getBoundingClientRect(); if (b.top > innerHeight || b.bottom < 0) dock.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
        return;
      }
      const nav = e.target.closest('[data-bstep]');
      if (nav) {
        const box = nav.closest('.nt-build'), items = [...box.querySelectorAll('.nt-bstep')], n = items.length;
        if (nav.dataset.bstep === 'all') {
          const all = !box.classList.contains('all');
          box.classList.toggle('all', all);
          nav.setAttribute('aria-pressed', String(all));
          nav.textContent = all ? 'One step at a time' : 'Show all steps';
          items.forEach((it, i) => { it.hidden = all ? false : i !== +(box.dataset.at || 0); });
          return;
        }
        const at = Math.max(0, Math.min(n - 1, +(box.dataset.at || 0) + (nav.dataset.bstep === 'next' ? 1 : -1)));
        box.dataset.at = at;
        items.forEach((it, i) => { it.hidden = i !== at; });
        box.querySelector('.nt-bpos').textContent = `Step ${at + 1} of ${n}`;
        box.querySelector('[data-bstep=prev]').disabled = at === 0;
        box.querySelector('[data-bstep=next]').disabled = at === n - 1;
        return;
      }
      const jump = e.target.closest('[data-nt-jump]');
      if (jump) { e.preventDefault(); const t = document.querySelector(jump.getAttribute('href')); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
    // Trace tables one at a time (the Python engine runs one program at a time).
    (async () => {
      for (const host of el.querySelectorAll('[data-trace]')) {
        const [id, pi] = host.dataset.trace.split('|');
        try { await traceTable(host, NOTES[id].programs[+pi]); } catch (err) { host.innerHTML = '<p class="nt-help">The trace table could not be built here — run the program in the editor instead.</p>'; }
      }
    })();
  }

  CC.addNotes = function (id, notes) {
    NOTES[id] = notes;
    CC.lessons = CC.lessons || {};
    const lesson = CC.lessons[id] = CC.lessons[id] || {};
    let html = null;
    Object.defineProperty(lesson, 'learn', { get: () => html || (html = render(id)), enumerable: true, configurable: true });
  };
  CC.notes = { blocks, stage, hydrate, traceTable, get all() { return NOTES; } };
})(window.CodeCraft);
