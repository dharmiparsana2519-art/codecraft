/* practice/ui.js — renders one practice question, marks the answer and shows the reasoning.
   CodeCraft.practiceUI.render(host, question, onResult, opts) → { destroy() }
   onResult({ ok, score, max, ans }) is called once, when the question has been answered;
   `ans` is a small record of what the student answered, so the question can be reviewed later.
   opts.replay = a saved `ans`: the card replays that answer and shows the marking (review mode).
   opts.banner = HTML shown at the top of the card.
   RULE (CLAUDE.md "Always teach the reasoning"): every question shows a Reasoning panel after answering,
   right or wrong — steps for multiple choice, a line-by-line run for output/trace questions, test diagnoses and an
   annotated model solution for code, and "why this earns the mark" plus a model answer for written questions. */
window.CodeCraft = window.CodeCraft || {};

(function (CC) {
  const P = CC.practice;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ICON = (n, cls = '') => `<svg class="ic ${cls}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
  const KIND = { mcq: 'Multiple choice', output: 'Predict the output', trace: 'Trace table', code: 'Write code', written: 'Written answer' };

  /* ---------- code display ---------- */
  function highlight(src) {
    if (!(window.CodeMirror && CodeMirror.runMode)) return esc(src);
    let html = '';
    CodeMirror.runMode(src, { name: 'python', version: 3 }, (text, style) => {
      html += style ? `<span class="${style.split(' ').map(s => 'cm-' + s).join(' ')}">${esc(text)}</span>` : esc(text);
    });
    return html;
  }
  function codeBlock(src, cls = '') {
    return `<pre class="q-code cm-s-default ${cls}">${highlight(src).split('\n').map(l => `<span class="l">${l || ' '}</span>`).join('')}</pre>`;
  }
  // A model solution whose lines end in "  # note": shown as code on the left, the note on the right.
  function annotated(src) {
    const rows = src.replace(/\n+$/, '').split('\n').map((l, i) => {
      const k = l.lastIndexOf('  # '), code = k >= 0 ? l.slice(0, k) : l, note = k >= 0 ? l.slice(k + 4) : '';
      return `<div class="ann-row${code.trim() ? '' : ' blank'}"><span class="ann-n">${i + 1}</span><code class="ann-code cm-s-default">${highlight(code) || ' '}</code><span class="ann-note">${esc(note)}</span></div>`;
    });
    return `<div class="ann" role="table" aria-label="Model solution, explained line by line">${rows.join('')}</div>`;
  }
  const stripNotes = src => src.split('\n').map(l => { const k = l.lastIndexOf('  # '); return k >= 0 ? l.slice(0, k).replace(/\s+$/, '') : l; }).join('\n');
  const filesBlock = files => !files ? '' : `<div class="q-files">${Object.keys(files).map(n => `<figure class="q-file"><figcaption>${ICON('file')}${esc(n)}</figcaption><pre>${esc(files[n])}</pre></figure>`).join('')}</div>`;
  const normOut = s => String(s).replace(/\r/g, '').split('\n').map(l => l.replace(/\s+$/, '')).join('\n').replace(/\n+$/, '');
  const normCell = s => String(s).trim().replace(/^["']|["']$/g, '').replace(/\s+/g, '').toLowerCase();
  const panel = (title, html, open = true) => `<details class="q-why"${open ? ' open' : ''}><summary>${ICON('bulb')}<b>Reasoning</b> — ${title}</summary><div class="q-why-body">${html}</div></details>`;

  /* ---------- line-by-line run (shared with the lesson notes) ----------
     traceView(el, src, { files, inputs, offset }) → Promise<{ rows, trace }>.
     offset = number of hidden setup lines at the top of src (e.g. a Stack class); they're labelled "class". */
  function describeRow(r, names) {
    const bits = [];
    if (r.note) bits.push(`<span class="tv-note">${esc(r.note)}</span>`);
    if (r.cond === true) bits.push(`<span class="tv-cond t">True</span>${r.synthetic ? ' — go round again' : ' — run the indented block'}`);
    if (r.cond === false) bits.push(`<span class="tv-cond f">False</span>${r.synthetic ? ' — loop ends' : ' — skip the indented block'}`);
    if (r.next) bits.push('next value:');
    if (r.done) bits.push('no more values — loop ends');
    r.changes.forEach(([k, v]) => bits.push(`<span class="tv-chg"><b>${esc(k)}</b> = ${esc(v)}</span>`));
    return bits.join(' ');
  }
  async function traceView(el, src, o = {}) {
    if (!CC.runner || !CC.runner.trace) { el.innerHTML = ''; return null; }
    el.innerHTML = '<p class="t-run">Running it line by line…</p>';
    const t = await CC.runner.trace(src, { files: o.files || {}, inputs: o.inputs || [] });
    const rows = CC.runner.traceRows(t, src), lines = src.split('\n'), off = o.offset || 0;
    const label = n => (n <= off ? 'class' : String(n - off));
    const tr = (r, i) => `<tr class="${r.synthetic ? 'syn' : ''} d${Math.min(r.depth, 3)}" data-line="${r.line - off}">
        <td class="tv-i">${i + 1}</td><td class="tv-l">${label(r.line)}</td>
        <td class="tv-code"><code class="cm-s-default" style="padding-left:${(lines[r.line - 1] || '').match(/^\s*/)[0].length * 0.5}em">${highlight((lines[r.line - 1] || '').trim())}</code></td>
        <td class="tv-what">${describeRow(r)}</td><td class="tv-out">${r.printed ? `<pre>${esc(r.printed.replace(/\n$/, ''))}</pre>` : ''}</td></tr>`;
    const LIMIT = 70;
    const body = rows.length > LIMIT ? rows.slice(0, 55).map(tr).join('') + `<tr class="tv-more"><td colspan="5"><button class="btn sm" data-more>Show all ${rows.length} steps</button></td></tr>` + rows.slice(-10).map((r, k) => tr(r, rows.length - 10 + k)).join('') : rows.map(tr).join('');
    el.innerHTML = `<p class="tv-help">Each row is one step, in the order Python runs them. <b>What happens</b> shows the variables that line changes${off ? ' (lines marked <em>class</em> are inside the class)' : ''}.</p>
      <div class="tv-wrap"><table class="tv"><thead><tr><th>Step</th><th>Line</th><th>Code</th><th>What happens</th><th>Output</th></tr></thead><tbody>${body}</tbody></table></div>
      ${t.error ? `<p class="t-err">${ICON('x')}Line ${label(t.error.line || 0)} stops the program: ${esc(t.error.type)}: ${esc(t.error.message)}</p>` : ''}
      ${t.truncated ? '<p class="tv-help">The program ran for a long time, so only the first steps are shown.</p>' : ''}`;
    const more = el.querySelector('[data-more]');
    if (more) more.addEventListener('click', () => { el.querySelector('tbody').innerHTML = rows.map(tr).join(''); });
    // Clicking a step highlights that line in the question's code (if it is shown).
    el.addEventListener('click', e => {
      const row = e.target.closest('tr[data-line]'); if (!row || !o.codeEl) return;
      o.codeEl.querySelectorAll('.l').forEach((l, i) => l.classList.toggle('hl', i + 1 === +row.dataset.line));
    });
    return { rows, trace: t };
  }

  /* Where a wrong "predict the output" answer first differs, and which line printed that part. */
  function outputDiff(user, correct, rows, src, off) {
    const u = normOut(user).split('\n'), c = normOut(correct).split('\n');
    let i = 0;
    while (i < Math.max(u.length, c.length) && (u[i] || '') === (c[i] || '')) i++;
    const table = `<div class="tv-wrap"><table class="diff"><thead><tr><th>Line</th><th>Your answer</th><th>Python prints</th></tr></thead><tbody>${Array.from({ length: Math.max(u.length, c.length) }, (_, k) => `<tr class="${k === i ? 'first' : (u[k] || '') !== (c[k] || '') ? 'differ' : ''}"><td>${k + 1}</td><td><code>${esc(u[k] ?? '')}</code></td><td><code>${esc(c[k] ?? '')}</code></td></tr>`).join('')}</tbody></table></div>`;
    let cause = '';
    if (rows && i < c.length) {
      let count = 0, at = -1;
      for (let r = 0; r < rows.length; r++) { const n = (rows[r].printed.match(/\n/g) || []).length; if (count + n > i) { at = r; break; } count += n; }
      if (at >= 0) {
        const row = rows[at], code = (src.split('\n')[row.line - 1] || '').trim();
        const ids = [...new Set((code.match(/[A-Za-z_]\w*/g) || []).filter(n => n in row.vars))];
        const facts = ids.map(n => {
          let set = null;
          for (let r = at; r >= 0; r--) if (rows[r].changes.some(([k]) => k === n)) { set = rows[r].line; break; }
          return `<code>${esc(n)}</code> was <code>${esc(row.vars[n])}</code>${set ? ` (last changed on line ${set - off}: <code>${esc((src.split('\n')[set - 1] || '').trim())}</code>)` : ''}`;
        });
        cause = `<p>Output line ${i + 1} is printed by <b>line ${row.line - off}</b>: <code>${esc(code)}</code>.${facts.length ? ` At that moment ${facts.join('; ')}.` : ''}</p>`;
      }
    } else if (i >= c.length) cause = `<p>Python prints only ${c.length} line${c.length === 1 ? '' : 's'}; your answer has extra lines from line ${i + 1}.</p>`;
    return `<p class="q-sub">Where your answer first differs — line ${i + 1}</p>${table}${cause}`;
  }
  /* Which line of the program a trace-table column comes from. */
  function lineFor(col, src) {
    const lines = src.split('\n'), name = col.replace(/\s*\?$/, '').trim(), norm = s => s.replace(/\s+/g, '');
    let k = lines.findIndex(l => new RegExp('^\\s*' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*[-+*/]?=[^=]').test(l));
    if (k < 0) k = lines.findIndex(l => norm(l).includes(norm(name)));
    return k;
  }

  function render(host, q, onResult, opts = {}) {
    let done = false, extraCleanup = null, ans = null;
    const replay = opts.replay || null;
    const card = document.createElement('article');
    card.className = 'card q-card';
    card.innerHTML = `${opts.banner ? `<div class="q-banner">${opts.banner}</div>` : ''}
      <header class="q-meta">
        <span class="tag tag-ref">${esc(q.topicRef || q.topic)}</span>
        <span class="q-term">${esc(q.term)}</span>
        <span class="q-marks">[${q.marks} mark${q.marks === 1 ? '' : 's'}]</span>
        <span class="q-kind">${KIND[q.kind]}</span>
      </header>
      <div class="q-prompt">${q.prompt}</div>
      ${filesBlock(q.files && q.kind !== 'code' ? q.files : null)}
      ${q.visual ? `<div class="q-visual">${q.visual}</div>` : ''}
      ${q.code && q.kind !== 'code' ? codeBlock(q.code) : ''}
      <div class="q-body"></div>
      <div class="q-feedback" hidden></div>
      <footer class="q-actions"></footer>`;
    host.appendChild(card);
    const body = card.querySelector('.q-body'), fb = card.querySelector('.q-feedback'), actions = card.querySelector('.q-actions');
    const codeEl = card.querySelector('.q-prompt ~ .q-code');

    const finish = (ok, score, max) => {
      if (done) return;
      done = true;
      card.classList.add('answered', ok ? 'is-right' : 'is-wrong');
      onResult({ ok, score, max, ans });
    };
    const feedback = (ok, html) => {
      fb.hidden = false;
      fb.className = 'q-feedback ' + (ok === true ? 'ok' : ok === false ? 'bad' : 'info');
      fb.innerHTML = (ok === true ? `<p class="q-verdict">${ICON('check')}Correct</p>` : ok === false ? `<p class="q-verdict">${ICON('x')}Not quite</p>` : '') + html;
    };
    // The program to run line by line: `run` (e.g. a flowchart's Python), a trace question's check program,
    // or the shown code with any hidden setup (e.g. the Stack class) in front of it.
    const program = () => {
      if (q.run) return { src: q.run, offset: 0 };
      if (q.kind === 'trace' && q.check && q.check.code) return { src: q.check.code, offset: 0 };
      const setup = q.setup ? q.setup + '\n' : '';
      return { src: setup + (q.code || ''), offset: setup ? setup.split('\n').length - 1 : 0 };
    };

    /* ---------- multiple choice ---------- */
    if (q.kind === 'mcq') {
      body.innerHTML = `<ol class="opts">${q.options.map((o, i) => `
        <li><button class="opt${q.mono ? ' mono' : ''}" data-i="${i}"><span class="opt-k">${'ABCDEF'[i]}</span><span class="opt-t">${q.mono ? `<code>${esc(o.text)}</code>` : esc(o.text)}</span>${ICON('check', 'i-ok')}${ICON('x', 'i-no')}</button>
        <p class="why">${o.why}</p></li>`).join('')}</ol>`;
      const choose = i => {
        if (done) return;
        const lis = [...body.querySelectorAll('li')];
        lis.forEach((li, k) => { li.classList.toggle('right', !!q.options[k].ok); li.classList.toggle('picked', k === i); });
        body.querySelector('.opts').classList.add('show');
        body.querySelectorAll('.opt').forEach(b => { b.disabled = true; });
        const ok = !!q.options[i].ok;
        ans = { pick: i, text: String(q.options[i].text).slice(0, 300) };
        feedback(ok, panel('how to work it out', `<ol class="q-steps-n">${(q.steps || []).map(s => `<li>${s}</li>`).join('')}</ol><p class="tv-help">Each option above also says why it is right or wrong.</p>`));
        finish(ok, ok ? q.marks : 0, q.marks);
      };
      body.querySelectorAll('.opt').forEach(b => b.addEventListener('click', () => choose(+b.dataset.i)));
      const keys = e => {
        if (done || e.ctrlKey || e.metaKey || e.altKey || (e.target.closest && e.target.closest('input, textarea, .CodeMirror'))) return;
        const k = 'abcdef'.indexOf(e.key.toLowerCase()), n = '123456'.indexOf(e.key), i = k >= 0 ? k : n;
        if (i >= 0 && i < q.options.length) { e.preventDefault(); choose(i); }
      };
      document.addEventListener('keydown', keys);
      extraCleanup = () => document.removeEventListener('keydown', keys);
      if (replay && replay.pick >= 0 && replay.pick < q.options.length) choose(replay.pick);
    }

    /* ---------- predict the output ---------- */
    if (q.kind === 'output') {
      const lines = Math.max(2, String(q.answer).split('\n').length);
      body.innerHTML = `<label class="q-label" for="out-${q.seed}">Your answer — type the output exactly as Python would print it</label>
        <textarea class="q-out" id="out-${q.seed}" rows="${Math.min(lines + 1, 10)}" spellcheck="false" autocapitalize="off" autocomplete="off"></textarea>`;
      actions.innerHTML = `<button class="btn primary" data-check>${ICON('check')}Check</button><button class="btn" data-give>Show answer</button>`;
      const ta = body.querySelector('textarea');
      const check = give => {
        if (done) return;
        const ok = !give && normOut(ta.value) === normOut(q.answer);
        ans = { text: ta.value.slice(0, 2000), gave: !!give };
        ta.readOnly = true;
        feedback(give ? null : ok, (ok ? '' : `<p class="q-sub">Python prints</p><pre class="q-expected">${esc(q.answer) || '<em>(nothing is printed)</em>'}</pre>`)
          + panel('watch it run line by line', `<div class="q-diff"></div>${q.explain || ''}<div class="tv-host"></div>`));
        actions.querySelectorAll('[data-check], [data-give]').forEach(b => b.remove());
        finish(ok, ok ? q.marks : 0, q.marks);
        const pr = program();
        traceView(fb.querySelector('.tv-host'), pr.src, { files: q.files, offset: pr.offset, codeEl }).then(res => {
          if (!ok && !give && res) fb.querySelector('.q-diff').innerHTML = outputDiff(ta.value, q.answer, res.rows, pr.src, pr.offset);
        });
      };
      actions.querySelector('[data-check]').addEventListener('click', () => check(false));
      actions.querySelector('[data-give]').addEventListener('click', () => check(true));
      ta.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); check(false); } });
      if (replay) { ta.value = replay.text || ''; check(!!replay.gave); }
    }

    /* ---------- trace table ---------- */
    if (q.kind === 'trace') {
      let n = 0;
      body.innerHTML = `<div class="tt-wrap"><table class="tt"><thead><tr>${q.columns.map(c => `<th scope="col">${esc(c)}</th>`).join('')}</tr></thead><tbody>
        ${q.rows.map((r, ri) => `<tr>${r.map((c, ci) => c.given ? `<td class="given">${esc(c.v)}</td>` : `<td><input data-cell="${n++}" data-r="${ri}" data-c="${ci}" data-v="${esc(c.v)}" aria-label="${esc(q.columns[ci])}, row ${ri + 1}" autocomplete="off" spellcheck="false"></td>`).join('')}</tr>`).join('')}
        </tbody></table></div>
        ${(q.extra || []).map((x, i) => `<label class="tt-extra">${esc(x.label)} <input data-extra="${i}" data-v="${esc(x.v)}" autocomplete="off" spellcheck="false"></label>`).join('')}`;
      actions.innerHTML = `<button class="btn primary" data-check>${ICON('check')}Check table</button><button class="btn" data-give>Show answer</button>`;
      const inputs = [...body.querySelectorAll('input')];
      const check = give => {
        if (done) return;
        let right = 0, first = null;
        ans = { cells: inputs.map(i => i.value.slice(0, 120)), gave: !!give };
        inputs.forEach(inp => {
          const ok = !give && normCell(inp.value) === normCell(inp.dataset.v);
          if (ok) right++; else if (!first) first = inp;
          inp.readOnly = true;
          inp.classList.add(ok ? 'ok' : 'bad');
          if (!ok) { const s = document.createElement('span'); s.className = 'tt-fix'; s.textContent = inp.dataset.v; inp.after(s); }
        });
        const ok = right === inputs.length, pr = program(), shown = q.code || pr.src;
        let diff = '';
        if (!ok && !give && first) {
          const col = first.dataset.extra !== undefined ? q.extra[+first.dataset.extra].label : q.columns[+first.dataset.c];
          const k = /^output$/i.test(col) ? shown.split('\n').findIndex(l => /\bprint\s*\(/.test(l)) : lineFor(col, shown);
          diff = `<p class="q-sub">Where your table first differs</p><p>${first.dataset.r !== undefined ? `Row ${+first.dataset.r + 1}, column <b>${esc(col)}</b>` : `<b>${esc(col)}</b>`}: you wrote <code>${esc(first.value || '(blank)')}</code>, the correct value is <code>${esc(first.dataset.v)}</code>.${k >= 0 ? ` This value comes from <b>line ${k + 1}</b>: <code>${esc(shown.split('\n')[k].trim())}</code>. Follow that line in the run below.` : ''}</p>`;
        }
        feedback(give ? null : ok, (ok || give ? '' : `<p class="q-sub">${right} of ${inputs.length} cells correct — the right values are shown under each cell.</p>`)
          + panel('watch it run line by line', diff + (q.explain || '') + '<div class="tv-host"></div>'));
        actions.querySelectorAll('[data-check], [data-give]').forEach(b => b.remove());
        finish(ok, ok ? q.marks : Math.floor(q.marks * right / inputs.length), q.marks);
        traceView(fb.querySelector('.tv-host'), pr.src, { files: q.files, offset: pr.offset, codeEl });
      };
      actions.querySelector('[data-check]').addEventListener('click', () => check(false));
      actions.querySelector('[data-give]').addEventListener('click', () => check(true));
      inputs.forEach((inp, i) => inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); if (inputs[i + 1]) inputs[i + 1].focus(); else check(false); } }));
      if (replay) { inputs.forEach((inp, i) => { inp.value = (replay.cells || [])[i] || ''; }); check(!!replay.gave); }
    }

    /* ---------- write code (auto-graded) ---------- */
    if (q.kind === 'code') {
      let attempts = 0, revealed = false, cm = null, ta = null, last = { passed: 0, total: 0 };
      const banned = (q.banned || []).map(b => b.label);
      body.innerHTML = `
        ${banned.length ? `<p class="q-ban"><span class="badge-nb">No built-ins</span> Not allowed: ${banned.map(b => `<code>${esc(b)}</code>`).join(', ')}</p>` : ''}
        ${filesBlock(q.files)}
        <div class="q-editor"></div>
        <div class="q-tests" hidden></div>
        <div class="q-hint" hidden><strong>Hint:</strong> ${q.hint || ''}</div>
        <div class="q-solution" hidden></div>`;
      actions.innerHTML = `<button class="btn primary" data-test>${ICON('play')}Run tests</button><button class="btn" data-hint>${ICON('bulb')}Hint</button><button class="btn" data-sol disabled>${ICON('lock')}<span>Solution after 2 attempts</span></button>`;
      const ed = body.querySelector('.q-editor');
      if (window.CodeMirror) {
        cm = CodeMirror(ed, { value: q.starter, mode: { name: 'python', version: 3 }, lineNumbers: true, indentUnit: 4, tabSize: 4, indentWithTabs: false, matchBrackets: true,
          extraKeys: { Tab: c => c.somethingSelected() ? c.indentSelection('add') : c.replaceSelection('    ', 'end'), 'Shift-Tab': c => c.indentSelection('subtract'), 'Ctrl-Enter': () => test(), 'Cmd-Enter': () => test() } });
        setTimeout(() => cm.refresh(), 0);
      } else {
        ta = document.createElement('textarea'); ta.className = 'q-out'; ta.rows = 10; ta.value = q.starter; ta.spellcheck = false; ed.appendChild(ta);
        ta.addEventListener('keydown', e => { if (e.key === 'Tab') { e.preventDefault(); ta.setRangeText('    ', ta.selectionStart, ta.selectionEnd, 'end'); } });
      }
      const getCode = () => (cm ? cm.getValue() : ta.value);
      const tests = body.querySelector('.q-tests'), solBtn = actions.querySelector('[data-sol]');
      // The likely cause of a failing test: an entry whose `when` pattern matches the student's code wins,
      // otherwise the first entry whose `match` pattern matches the test's name.
      const diagnoseFor = (name, code) => {
        const list = q.diagnose || [], m = d => new RegExp(d.match).test(name);
        return list.find(d => m(d) && d.when && new RegExp(d.when, 'm').test(code)) || list.find(d => m(d) && !d.when);
      };
      const reasoning = () => panel('how to think about it', `<ol class="q-steps-n">${(q.think || []).map(s => `<li>${s}</li>`).join('')}</ol>
        <p class="q-sub">Model solution, explained line by line</p>${annotated(q.solution)}`);
      async function test() {
        const code = getCode(), stripped = code.replace(/#.*$/gm, '');
        tests.hidden = false;
        const ban = (q.banned || []).find(b => new RegExp(b.re).test(stripped));
        const req = (q.require || []).find(r => !new RegExp(r.re).test(stripped));
        if (ban || req) { tests.innerHTML = `<p class="t-err">${ICON('x')}${ban ? `Your code uses <code>${esc(ban.label)}</code>, which this question doesn't allow.` : `Your answer needs to use ${esc(req.label)}.`}</p>`; return; }
        attempts++;
        tests.innerHTML = '<p class="t-run">Running the hidden tests…</p>';
        let out = '';
        const res = await CC.runner.run(code + '\n' + P.HARNESS + '\n' + q.tests, { onOutput: t => { out += t; }, files: q.files || {}, onInput: () => Promise.resolve(''), execLimit: 5000 });
        const lines = out.split('\n'), marks = lines.filter(l => l.startsWith('@@')), printed = lines.filter(l => !l.startsWith('@@')).join('\n').trim();
        const items = marks.map(l => { const [s, name, detail] = l.split('|'); return { pass: s === '@@PASS', name, detail }; });
        const passed = items.filter(i => i.pass).length;
        let html = items.length ? `<h4>Tests <span>${passed} / ${items.length} passed</span></h4><ul>${items.map(i => {
          const d = i.pass ? null : diagnoseFor(i.name, code);
          return `<li class="${i.pass ? 'pass' : 'fail'}">${ICON(i.pass ? 'check' : 'x')}<span>${esc(i.name)}${i.pass ? '' : `<small>${esc(i.detail || '')}</small>`}
            ${d ? `<span class="t-diag"><b>What this test checks:</b> ${d.checks}<br><b>Most likely bug in your code:</b> ${d.cause}</span>` : ''}</span></li>`;
        }).join('')}</ul>` : '';
        if (!res.ok) {
          const studentLines = code.split('\n').length, inStudent = res.error.line && res.error.line <= studentLines, f = CC.runner.explain(res.error, code);
          html += `<p class="t-err">${ICON('x')}${esc(res.error.type)}: ${esc(res.error.message)}${inStudent ? ` — line ${res.error.line}` : ''}</p>${f ? `<p class="t-friendly">${f.text}</p>` : ''}`;
        }
        if (printed) html += `<p class="q-sub">Your program also printed</p><pre class="q-run-out">${esc(printed)}</pre>`;
        tests.innerHTML = html;
        const ok = res.ok && items.length > 0 && passed === items.length;
        last = { passed, total: items.length };
        if (ok && !revealed) { ans = { code: code.slice(0, 4000), passed, total: items.length }; feedback(true, `<p>All ${items.length} tests pass${attempts > 1 ? ` (attempt ${attempts})` : ' first time'}.</p>` + reasoning()); finish(true, q.marks, q.marks); lockSolution(); }
        else if (attempts >= 2) { solBtn.disabled = false; solBtn.innerHTML = `${ICON('book')}<span>Show solution</span>`; }
      }
      function lockSolution() { actions.querySelectorAll('[data-sol], [data-hint]').forEach(b => b.remove()); }
      actions.querySelector('[data-test]').addEventListener('click', test);
      actions.querySelector('[data-hint]').addEventListener('click', () => { body.querySelector('.q-hint').hidden = false; });
      const reveal = () => {
        revealed = true;
        const s = body.querySelector('.q-solution'); s.hidden = false;
        s.innerHTML = reasoning() + `<details class="q-model"><summary>Copy the solution without the notes</summary>${codeBlock(stripNotes(q.solution))}</details>`;
        solBtn.remove();
        if (!done) { ans = { code: getCode().slice(0, 4000), revealed: true, ...last }; finish(false, 0, q.marks); }
      };
      solBtn.addEventListener('click', reveal);
      extraCleanup = () => { if (!done && attempts > 0) { ans = { code: getCode().slice(0, 4000), ...last }; finish(false, 0, q.marks); } };
      if (replay) {
        if (cm) cm.setValue(replay.code || q.starter); else ta.value = replay.code || q.starter;
        done = true; // reviewing: nothing is recorded
        test().then(() => { if (body.querySelector('.q-solution').hidden && solBtn.isConnected) reveal(); });
      }
    }

    /* ---------- written (self-marked against a mark scheme) ---------- */
    if (q.kind === 'written') {
      body.innerHTML = `<label class="q-label" for="w-${q.seed}">Your answer (written answers are self-marked against the mark scheme)</label>
        <textarea class="q-written" id="w-${q.seed}" rows="6" placeholder="Write your answer as you would in the exam…"></textarea>
        <div class="q-ms" hidden></div>`;
      actions.innerHTML = `<button class="btn primary" data-ms>${ICON('book')}Show mark scheme</button>`;
      actions.querySelector('[data-ms]').addEventListener('click', () => {
        const ms = body.querySelector('.q-ms'); ms.hidden = false;
        ms.innerHTML = `<p class="q-sub">Mark scheme — tick each point your answer makes</p>
          <ul class="ms-list">${q.markscheme.map((m, i) => { const pt = typeof m === 'string' ? { text: m } : m; return `<li><label><input type="checkbox" data-pt="${i}"><span>${pt.text}${pt.why ? `<small class="ms-why"><b>Why this earns the mark:</b> ${pt.why}</small>` : ''}</span></label></li>`; }).join('')}</ul>
          ${q.model ? `<div class="q-model-note">${q.model}</div>` : ''}`;
        actions.innerHTML = `<button class="btn primary" data-save>${ICON('check')}Save my mark</button><span class="ms-score">0 / ${q.marks}</span>`;
        const boxes = [...ms.querySelectorAll('input')], score = () => Math.min(q.marks, boxes.filter(b => b.checked).length);
        boxes.forEach(b => b.addEventListener('change', () => { actions.querySelector('.ms-score').textContent = `${score()} / ${q.marks}`; }));
        actions.querySelector('[data-save]').addEventListener('click', () => {
          const s = score();
          ans = { text: body.querySelector('textarea').value.slice(0, 2000), ticks: boxes.map((b, i) => (b.checked ? i : -1)).filter(i => i >= 0) };
          boxes.forEach(b => { b.disabled = true; });
          actions.querySelector('[data-save]').remove();
          feedback(s === q.marks ? true : null, `<p>You gave yourself <strong>${s} / ${q.marks}</strong>.</p>` + panel('a full-mark answer', `<p class="tv-help">The marks in brackets show where each mark is earned.</p><div class="model-ans">${q.answer || ''}</div>`));
          finish(s === q.marks, s, q.marks);
        });
      });
    }

    if (replay && q.kind === 'written') {
      body.querySelector('textarea').value = replay.text || '';
      body.querySelector('textarea').readOnly = true;
      actions.querySelector('[data-ms]').click();
      body.querySelectorAll('.ms-list input').forEach((b, i) => { b.checked = (replay.ticks || []).includes(i); b.dispatchEvent(new Event('change')); });
      actions.querySelector('[data-save]').click();
    }

    return { el: card, destroy() { if (extraCleanup) extraCleanup(); card.remove(); }, get done() { return done; } };
  }

  CC.practiceUI = { render, codeBlock, annotated, traceView, highlight };
})(window.CodeCraft);
