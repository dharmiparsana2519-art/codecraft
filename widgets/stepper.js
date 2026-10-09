/* widgets/stepper.js — Step mode for the editor (B2.1.4: breakpoints and step-by-step execution).
   The program is run once by the tracer (runner.trace), which records every line before it runs and the variables
   at that moment; Step mode then lets you move through that recording: Next / Back, Continue to the next breakpoint,
   the next line highlighted in the editor, the variables in a live table, and the output so far in the console.
   CodeCraft.stepper.start(ctx) — ctx comes from the playground:
     { panel, cm, getCode, getFiles, consoleEl, setStatus, breakpoints() → Set of line numbers, onExit() } */
window.CodeCraft = window.CodeCraft || {};

(function (CC) {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ICON = n => `<svg class="ic" aria-hidden="true"><use href="#i-${n}"/></svg>`;

  function start(ctx) {
    const code = ctx.getCode(), lines = code.split('\n'), panel = ctx.panel;
    let t = null, pos = 0, marks = [], keyHandler = null;

    const clearMarks = () => { if (ctx.cm) marks.forEach(m => ctx.cm.removeLineClass(m.h, 'background', m.cls)); marks = []; };
    const mark = (line, cls) => { if (ctx.cm && line) marks.push({ h: ctx.cm.addLineClass(line - 1, 'background', cls), cls }); };
    const lineText = n => (lines[n - 1] || '').trim();

    function exit() {
      clearMarks();
      if (keyHandler) document.removeEventListener('keydown', keyHandler);
      panel.hidden = true;
      panel.innerHTML = '';
      ctx.onExit();
    }

    function askInputs() {
      panel.hidden = false;
      panel.innerHTML = `<div class="step-intro">
        <p><b>This program uses <code>input()</code>.</b> Type the answers it should get, one per line, before stepping through it.</p>
        <textarea class="step-inputs" rows="3" aria-label="Answers for input(), one per line" spellcheck="false"></textarea>
        <div class="step-bar"><button class="btn sm primary" type="button" data-step="go">${ICON('play')}Start stepping</button><button class="btn sm" type="button" data-step="exit">Cancel</button></div>
      </div>`;
      panel.querySelector('textarea').focus();
    }

    async function go(inputs) {
      panel.hidden = false;
      panel.innerHTML = '<p class="step-say">Preparing the steps…</p>';
      ctx.setStatus('run', 'Recording steps…');
      await new Promise(r => setTimeout(r, 30));
      t = await CC.runner.trace(code, { files: ctx.getFiles(), inputs, maxSteps: 3000, execLimit: 8000 });
      if (!t.steps.length) {
        ctx.setStatus('err', t.error ? t.error.type : 'No steps');
        panel.innerHTML = `<p class="step-say">${t.error ? `The program can't start: <b>${esc(t.error.type)}</b>: ${esc(t.error.message)}${t.error.line ? ` (line ${t.error.line})` : ''}. Fix it, then press Step again.` : 'There is nothing to step through.'}</p><div class="step-bar"><button class="btn sm" type="button" data-step="exit">Close</button></div>`;
        return;
      }
      ctx.setStatus('run', 'Step mode');
      build();
      pos = 0;
      render();
      keyHandler = e => {
        if (e.target.closest && e.target.closest('input, textarea, .CodeMirror')) return;
        if (e.key === 'ArrowRight') { e.preventDefault(); move(1); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1); }
      };
      document.addEventListener('keydown', keyHandler);
    }

    /* The steps come from traceRows (the same rows as the site's trace tables), so a loop going round again and
       every if/while test are steps too. A line that calls a function is split in two: "calls a function" before the
       function's own lines, and "the call returned" after them. */
    let seq = [];
    function build() {
      const rows = CC.runner.traceRows(t, code), wait = [];
      let lastVars = {};
      for (let k = 0; k < rows.length;) {
        const r = rows[k];
        let e = k + 1;
        while (e < rows.length && rows[e].synthetic && rows[e].depth === r.depth) e++;
        const group = rows.slice(k, e);
        while (wait.length && wait[wait.length - 1][0].depth >= r.depth) wait.pop().forEach((g, i) => seq.push(i ? g : Object.assign({}, g, { returned: true })));
        if (!r.synthetic && rows[e] && rows[e].depth > r.depth) {
          const prev = [...seq].reverse().find(x => x.depth === r.depth);
          seq.push({ line: r.line, depth: r.depth, func: r.func, call: true, changes: [], printed: '', vars: prev ? prev.vars : lastVars });
          wait.push(group);
        } else seq.push(...group);
        lastVars = r.vars;
        k = e;
      }
      while (wait.length) wait.pop().forEach((g, i) => seq.push(i ? g : Object.assign({}, g, { returned: true })));
      // The variables to show after each step: the frame's previous values plus this step's own changes. (The
      // recorder's snapshot is taken at the next pause, so inside a loop it would already show the next item.)
      const frames = [];
      seq.forEach(x => {
        if (frames.length < x.depth) x.show = Object.assign({}, x.vars);
        else { frames.length = x.depth; x.show = Object.assign({}, frames[x.depth - 1] || {}); x.changes.forEach(([k, v]) => { x.show[k] = v; }); }
        frames[x.depth - 1] = x.show;
      });
    }
    const N = () => seq.length; // positions 0 … N: position p is "after the first p steps"

    function move(d) {
      pos = Math.max(0, Math.min(N(), pos + d));
      render();
    }
    function cont() {
      const bp = ctx.breakpoints();
      do { pos++; } while (pos < N() && !bp.has(seq[pos].line));
      pos = Math.min(pos, N());
      render();
    }

    function describe(r) {
      const L = `line ${r.line}: <code>${esc(lineText(r.line))}</code>`;
      if (r.call) return `<span class="step-k">Ran</span> ${L} — it <b>calls a function</b>, so the next steps are inside it`;
      let s = `<span class="step-k">Ran</span> ${r.returned ? `line ${r.line} again — the function <b>returned</b>, so this line can finish` : L}`;
      if (r.next) s += ' — the loop goes round again';
      if (r.done) s += ' — no more items, so the loop ends';
      if (r.cond !== undefined && !r.next && !r.done) s += ` — the condition is <b class="step-${r.cond ? 't' : 'f'}">${r.cond ? 'True' : 'False'}</b>`;
      if (r.note) s += ` — ${esc(r.note)}`;
      if (r.changes.length) s += ' — ' + r.changes.map(([k, v]) => `<code>${esc(k)}</code> = <code>${esc(v)}</code>`).join(', ');
      if (r.printed) s += ` — printed <code>${esc(r.printed.replace(/\n$/, ''))}</code>`;
      return s;
    }

    function render() {
      const finished = pos >= N(), last = pos > 0 ? seq[pos - 1] : null, next = finished ? null : seq[pos];
      clearMarks();
      if (last) mark(last.line, 'cm-stepran');
      if (next) mark(next.line, 'cm-stepnext');
      if (ctx.cm && next) ctx.cm.scrollIntoView({ line: next.line - 1, ch: 0 }, 60);

      let said = last ? `<p class="step-ran">${describe(last)}</p>` : '<p class="step-ran"><span class="step-k">Start</span> Nothing has run yet.</p>';
      if (finished) {
        said += t.ok
          ? `<p class="step-next done"><span class="step-k">Finished</span> The program has ended${t.truncated ? ' (the recording stopped after 3,000 steps — probably a long or infinite loop)' : ''}.</p>`
          : `<p class="step-next err"><span class="step-k">Error</span> ${t.error.line ? `Line ${t.error.line} raised` : 'The program raised'} <b>${esc(t.error.type)}</b>: ${esc(t.error.message)}${t.error.type === 'TimeLimitError' ? ' — an infinite loop?' : ''}</p>`;
      } else {
        said += `<p class="step-next"><span class="step-k">Next</span> line ${next.line}: <code>${esc(lineText(next.line))}</code>${next.depth > 1 ? ` <span class="step-frame">inside ${next.func === 'method' ? 'a method' : 'a function'}</span>` : ''}</p>`;
      }

      // Variables after the last step, in the frame it ran in (the main program, or the function being run).
      const vars = last ? last.show : {}, names = Object.keys(vars), changed = new Set(last ? last.changes.map(c => c[0]) : []);
      const table = names.length
        ? `<table class="step-vars"><thead><tr><th>Variable</th><th>Value</th></tr></thead><tbody>${names.map(k => `<tr class="${changed.has(k) ? 'chg' : ''}"><td><code>${esc(k)}</code></td><td><code>${esc(vars[k])}</code></td></tr>`).join('')}</tbody></table>`
        : '<p class="step-none">No variables yet.</p>';
      let out = '';
      for (let i = 0; i < pos; i++) out += seq[i].printed || '';

      panel.hidden = false;
      panel.innerHTML = `<div class="step-bar" role="group" aria-label="Step controls">
          <button class="btn sm" type="button" data-step="back" ${pos === 0 ? 'disabled' : ''} title="Back (←)">${ICON('left')}Back</button>
          <button class="btn sm primary" type="button" data-step="next" ${finished ? 'disabled' : ''} title="Next (→)">Next${ICON('arrow')}</button>
          <button class="btn sm" type="button" data-step="cont" ${finished ? 'disabled' : ''} title="Run on to the next breakpoint">${ICON('play')}${ctx.breakpoints().size ? 'Continue' : 'Run to end'}</button>
          <span class="step-pos">${pos === 0 ? 'Start' : `Step ${pos} of ${N()}`}</span>
          <button class="btn sm step-exit" type="button" data-step="exit">${ICON('x')}Exit</button>
        </div>
        <div class="step-say" aria-live="polite">${said}</div>
        <div class="step-frame-label">${last && last.depth > 1 && !last.returned ? 'Local variables of the function' : 'Variables'}</div>
        ${table}
        <p class="step-help">Click a line number to set a <b>breakpoint</b> (a red dot); <b>Continue</b> runs on until that line is next. Use ← and → to step.</p>`;

      // The console shows the output up to this moment.
      ctx.consoleEl.innerHTML = '';
      if (out) { const d = document.createElement('div'); d.className = 'con-out'; d.textContent = out; ctx.consoleEl.appendChild(d); }
      else ctx.consoleEl.innerHTML = '<div class="con-note">Nothing printed yet.</div>';
    }

    panel.onclick = e => {
      const b = e.target.closest('[data-step]');
      if (!b) return;
      const a = b.dataset.step;
      if (a === 'go') go(panel.querySelector('.step-inputs').value.split('\n').filter((l, i, all) => i < all.length - 1 || l !== ''));
      else if (a === 'exit') exit();
      else if (a === 'next') move(1);
      else if (a === 'back') move(-1);
      else if (a === 'cont') cont();
    };

    if (/\binput\s*\(/.test(code)) askInputs(); else go([]);
    return { exit };
  }

  CC.stepper = { start };
})(window.CodeCraft);
