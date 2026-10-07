/* practice/ui.js — renders one practice question and marks the answer.
   CodeCraft.practiceUI.render(host, question, onResult) → { destroy() }
   onResult({ ok, score, max }) is called once, when the question has been answered. */
window.CodeCraft = window.CodeCraft || {};

(function (CC) {
  const P = CC.practice;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ICON = (n, cls = '') => `<svg class="ic ${cls}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
  const KIND = { mcq: 'Multiple choice', output: 'Predict the output', trace: 'Trace table', code: 'Write code', written: 'Written answer' };

  /* Read-only Python with syntax colouring and line numbers. */
  function codeBlock(src, cls = '') {
    let html = esc(src);
    if (window.CodeMirror && CodeMirror.runMode) {
      html = '';
      CodeMirror.runMode(src, { name: 'python', version: 3 }, (text, style) => {
        html += style ? `<span class="${style.split(' ').map(s => 'cm-' + s).join(' ')}">${esc(text)}</span>` : esc(text);
      });
    }
    return `<pre class="q-code cm-s-default ${cls}">${html.split('\n').map(l => `<span class="l">${l || ' '}</span>`).join('')}</pre>`;
  }
  const filesBlock = files => !files ? '' : `<div class="q-files">${Object.keys(files).map(n => `<figure class="q-file"><figcaption>${ICON('file')}${esc(n)}</figcaption><pre>${esc(files[n])}</pre></figure>`).join('')}</div>`;
  const normOut = s => String(s).replace(/\r/g, '').split('\n').map(l => l.replace(/\s+$/, '')).join('\n').replace(/\n+$/, '');
  const normCell = s => String(s).trim().replace(/^["']|["']$/g, '').replace(/\s+/g, '').toLowerCase();

  function render(host, q, onResult) {
    let done = false, extraCleanup = null;
    const card = document.createElement('article');
    card.className = 'card q-card';
    card.innerHTML = `
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

    const finish = (ok, score, max) => {
      if (done) return;
      done = true;
      card.classList.add('answered', ok ? 'is-right' : 'is-wrong');
      onResult({ ok, score, max });
    };
    const feedback = (ok, html) => {
      fb.hidden = false;
      fb.className = 'q-feedback ' + (ok === true ? 'ok' : ok === false ? 'bad' : 'info');
      fb.innerHTML = (ok === true ? `<p class="q-verdict">${ICON('check')}Correct</p>` : ok === false ? `<p class="q-verdict">${ICON('x')}Not quite</p>` : '') + html;
    };
    const runIt = () => {
      const src = q.run || ((q.setup ? q.setup + '\n' : '') + (q.code || ''));
      if (!src.trim() || !CC.runner) return '';
      return `<div class="q-run"><button class="btn sm" data-run>${ICON('play')}Run it to check</button><pre class="q-run-out" hidden></pre></div>`;
    };
    const wireRun = () => {
      const b = fb.querySelector('[data-run]');
      if (!b) return;
      b.addEventListener('click', async () => {
        const out = fb.querySelector('.q-run-out'); let text = '';
        b.disabled = true; out.hidden = false; out.textContent = 'Running…';
        const res = await CC.runner.run(q.run || ((q.setup ? q.setup + '\n' : '') + q.code), { onOutput: t => { text += t; }, files: q.files || {}, onInput: () => Promise.resolve('') });
        out.textContent = text + (res.ok ? '' : `${res.error.type}: ${res.error.message}`);
        b.disabled = false;
      });
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
        feedback(ok, '');
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
        ta.readOnly = true;
        feedback(give ? null : ok, (ok ? '' : `<p class="q-sub">Expected output</p><pre class="q-expected">${esc(q.answer) || '<em>(nothing is printed)</em>'}</pre>`) + (q.explain || '') + runIt());
        wireRun();
        actions.querySelectorAll('[data-check], [data-give]').forEach(b => b.remove());
        finish(ok, ok ? q.marks : 0, q.marks);
      };
      actions.querySelector('[data-check]').addEventListener('click', () => check(false));
      actions.querySelector('[data-give]').addEventListener('click', () => check(true));
      ta.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); check(false); } });
    }

    /* ---------- trace table ---------- */
    if (q.kind === 'trace') {
      let n = 0;
      body.innerHTML = `<div class="tt-wrap"><table class="tt"><thead><tr>${q.columns.map(c => `<th scope="col">${esc(c)}</th>`).join('')}</tr></thead><tbody>
        ${q.rows.map((r, ri) => `<tr>${r.map((c, ci) => c.given ? `<td class="given">${esc(c.v)}</td>` : `<td><input data-cell="${n++}" data-v="${esc(c.v)}" aria-label="${esc(q.columns[ci])}, row ${ri + 1}" autocomplete="off" spellcheck="false"></td>`).join('')}</tr>`).join('')}
        </tbody></table></div>
        ${(q.extra || []).map((x, i) => `<label class="tt-extra">${esc(x.label)} <input data-extra="${i}" data-v="${esc(x.v)}" autocomplete="off" spellcheck="false"></label>`).join('')}`;
      actions.innerHTML = `<button class="btn primary" data-check>${ICON('check')}Check table</button><button class="btn" data-give>Show answer</button>`;
      const inputs = [...body.querySelectorAll('input')];
      const check = give => {
        if (done) return;
        let right = 0;
        inputs.forEach(inp => {
          const ok = !give && normCell(inp.value) === normCell(inp.dataset.v);
          if (ok) right++;
          inp.readOnly = true;
          inp.classList.add(ok ? 'ok' : 'bad');
          if (!ok) { const s = document.createElement('span'); s.className = 'tt-fix'; s.textContent = inp.dataset.v; inp.after(s); }
        });
        const ok = right === inputs.length;
        feedback(give ? null : ok, (ok || give ? '' : `<p class="q-sub">${right} of ${inputs.length} cells correct — the right values are shown under each cell.</p>`) + (q.explain || '') + runIt());
        wireRun();
        actions.querySelectorAll('[data-check], [data-give]').forEach(b => b.remove());
        finish(ok, ok ? q.marks : Math.floor(q.marks * right / inputs.length), q.marks);
      };
      actions.querySelector('[data-check]').addEventListener('click', () => check(false));
      actions.querySelector('[data-give]').addEventListener('click', () => check(true));
      inputs.forEach((inp, i) => inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); if (inputs[i + 1]) inputs[i + 1].focus(); else check(false); } }));
    }

    /* ---------- write code (auto-graded) ---------- */
    if (q.kind === 'code') {
      let attempts = 0, revealed = false, cm = null, ta = null;
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
        let html = items.length ? `<h4>Tests <span>${passed} / ${items.length} passed</span></h4><ul>${items.map(i => `<li class="${i.pass ? 'pass' : 'fail'}">${ICON(i.pass ? 'check' : 'x')}<span>${esc(i.name)}${i.pass ? '' : `<small>${esc(i.detail || '')}</small>`}</span></li>`).join('')}</ul>` : '';
        if (!res.ok) {
          const studentLines = code.split('\n').length, inStudent = res.error.line && res.error.line <= studentLines, f = CC.runner.explain(res.error, code);
          html += `<p class="t-err">${ICON('x')}${esc(res.error.type)}: ${esc(res.error.message)}${inStudent ? ` — line ${res.error.line}` : ''}</p>${f ? `<p class="t-friendly">${f.text}</p>` : ''}`;
        }
        if (printed) html += `<p class="q-sub">Your program also printed</p><pre class="q-run-out">${esc(printed)}</pre>`;
        tests.innerHTML = html;
        const ok = res.ok && items.length > 0 && passed === items.length;
        if (ok && !revealed) { feedback(true, `<p>All ${items.length} tests pass${attempts > 1 ? ` (attempt ${attempts})` : ' first time'}.</p><details class="q-model"><summary>Compare with a model solution</summary>${codeBlock(q.solution)}</details>`); finish(true, q.marks, q.marks); lockSolution(); }
        else if (attempts >= 2) { solBtn.disabled = false; solBtn.innerHTML = `${ICON('book')}<span>Show solution</span>`; }
      }
      function lockSolution() { actions.querySelectorAll('[data-sol], [data-hint]').forEach(b => b.remove()); }
      actions.querySelector('[data-test]').addEventListener('click', test);
      actions.querySelector('[data-hint]').addEventListener('click', () => { body.querySelector('.q-hint').hidden = false; });
      solBtn.addEventListener('click', () => {
        revealed = true;
        const s = body.querySelector('.q-solution'); s.hidden = false;
        s.innerHTML = `<p class="q-sub">Model solution</p>${codeBlock(q.solution)}`;
        solBtn.remove();
        if (!done) finish(false, 0, q.marks);
      });
      extraCleanup = () => { if (!done && attempts > 0) finish(false, 0, q.marks); };
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
          <ul class="ms-list">${q.markscheme.map((m, i) => `<li><label><input type="checkbox" data-pt="${i}"><span>${m}</span></label></li>`).join('')}</ul>
          ${q.model ? `<div class="q-model-note">${q.model}</div>` : ''}`;
        actions.innerHTML = `<button class="btn primary" data-save>${ICON('check')}Save my mark</button><span class="ms-score">0 / ${q.marks}</span>`;
        const boxes = [...ms.querySelectorAll('input')], score = () => Math.min(q.marks, boxes.filter(b => b.checked).length);
        boxes.forEach(b => b.addEventListener('change', () => { actions.querySelector('.ms-score').textContent = `${score()} / ${q.marks}`; }));
        actions.querySelector('[data-save]').addEventListener('click', () => {
          const s = score();
          boxes.forEach(b => { b.disabled = true; });
          actions.querySelector('[data-save]').remove();
          feedback(s === q.marks ? true : null, `<p>You gave yourself <strong>${s} / ${q.marks}</strong>.</p>`);
          finish(s === q.marks, s, q.marks);
        });
      });
    }

    return { el: card, destroy() { if (extraCleanup) extraCleanup(); card.remove(); }, get done() { return done; } };
  }

  CC.practiceUI = { render, codeBlock };
})(window.CodeCraft);
