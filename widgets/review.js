/* widgets/review.js — the Review module's three pages (module 9), rendered by app.js instead of a normal lesson.
   review-1  Mixed exam practice: 10 questions from every SL topic (2 multiple choice, 3 trace/output, 3 code,
             2 written), marked by practice/ui.js with its Reasoning panel and recorded like any practice answer.
   review-2  Paper 2 mock: 1 hour 15 minutes, 50 marks, three structured questions (practice/mock.js). Answers are
             written into a booklet with no Run button; afterwards code is marked by its hidden tests, outputs and
             trace tables are checked, and written answers are self-marked against the mark scheme.
             Saved in localStorage 'codecraft.mock.v1' = { cur, attempts: [...] }.
   review-3  Progress dashboard: completion per module, accuracy per topic and per question type, weakest topics,
             mock results.
   CodeCraft.review.has(id) · CodeCraft.review.render(id, host, ctx) → { destroy() }
   ctx (from app.js): modules, isDone, status, sectionsDone, topicStat, practiceTotals, weakestTopics, history,
   recordResult, lastAnswer, markDone, href. */
window.CodeCraft = window.CodeCraft || {};

(function (CC) {
  const P = CC.practice;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ICON = (n, cls = '') => `<svg class="ic ${cls}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
  const IDS = ['review-1', 'review-2', 'review-3'];
  const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const pc = (a, b) => (b ? Math.round(a / b * 100) : 0);
  const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
  const when = t => new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const mins = ms => (ms < 60000 ? 'under a minute' : `${Math.round(ms / 60000)} min`);

  // Each review page counts as one section, so the module (and the course) can reach 100%.
  CC.lessons = CC.lessons || {};
  IDS.forEach(id => { CC.lessons[id] = CC.lessons[id] || {}; if (!CC.lessons[id].learn) CC.lessons[id].learn = { review: true }; });

  /* ================= review-1: mixed exam practice ================= */
  const MIX = [{ kinds: ['mcq'], n: 2 }, { kinds: ['trace', 'output'], n: 3 }, { kinds: ['code'], n: 3 }, { kinds: ['written'], n: 2 }];
  // One round's 10 questions: each slot takes the generator from the least-used topic, so a set spreads over the course.
  function mixedSet(r) {
    const topics = P.topics().filter(t => !/^start-/.test(t)), R = P.rng(hash(`review-1|${r}`)), use = {}, used = new Set(), out = [];
    MIX.forEach(({ kinds, n }, b) => {
      const pool = R.shuffle(topics.flatMap(t => P.gens[t].filter(g => kinds.includes(g.kind))));
      for (let k = 0; k < n; k++) {
        const free = pool.filter(g => !used.has(g.id));
        if (!free.length) break;
        const least = Math.min(...free.map(g => use[g.topic] || 0)), g = free.find(x => (use[x.topic] || 0) === least);
        use[g.topic] = (use[g.topic] || 0) + 1; used.add(g.id);
        const q = P.generate(g, hash(`review-1|${r}|${b}|${k}`)), l = CC.findLesson(g.topic);
        q.topicRef = l ? l.ref : g.topic;
        out.push(q);
      }
    });
    return out;
  }
  function mixedPage(host, ctx) {
    host.innerHTML = `<section class="card rv-intro">
        <p>Ten exam-style questions from across the SL course, easiest kind first: 2 multiple choice, 3 trace tables or outputs, 3 <b>construct</b> questions and 2 written answers marked against a mark scheme. Every answer shows its Reasoning panel and counts towards your topic accuracy.</p>
      </section><div class="rv-set"></div>`;
    CC.lessonQs.mount(host.querySelector('.rv-set'), 'review-1', 'exam', {
      tab: { n: 10, help: 'Answer them in any order. When you have answered all ten, <b>New set</b> gives ten more.' },
      questions: mixedSet, newLabel: 'New set', marks: true,
      more: `<a class="mini-link" href="#/practice/mix">${ICON('infinity')}Want more? Unlimited mixed practice →</a>`,
      onResult: (q, res) => ctx.recordResult(q, res), lastAnswer: q => ctx.lastAnswer(q),
      onProgress: (a, n) => { if (a === n) ctx.markDone('review-1'); }
    });
    return { destroy() {} };
  }

  /* ================= review-2: the Paper 2 mock ================= */
  const MKEY = 'codecraft.mock.v1';
  const loadMock = () => { let d = null; try { d = JSON.parse(localStorage.getItem(MKEY) || 'null'); } catch (e) { d = null; } return d && Array.isArray(d.attempts) ? d : { cur: null, attempts: [] }; };
  const saveMock = S => { try { localStorage.setItem(MKEY, JSON.stringify(S)); return true; } catch (e) { return false; } };
  const clock = ms => { const s = Math.max(0, Math.ceil(ms / 1000)), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60); return `${h}:${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };
  const stripComments = code => code.split('\n').map(l => l.replace(/#.*$/, '')).join('\n');
  const isBlank = (q, a) => a == null || (typeof a === 'string' ? !a.trim() || (q.kind === 'code' && a.trim() === q.starter.trim()) : !(a.cells || []).some(v => String(v).trim()));
  // The values a trace table's inputs expect, in the order the inputs appear (table cells, then the extras).
  const traceExpect = q => [...q.rows.flatMap(r => r.filter(c => !c.given).map(c => c.v)), ...(q.extra || []).map(x => x.v)];

  // Totals for an attempt: auto marks + self-marked written answers (null while still to mark).
  function tally(att, paper) {
    const per = paper.questions.map(Q => Q.parts.reduce((t, p) => {
      const a = p.kind === 'written' ? att.written[p.key] : att.auto[p.key];
      if (a) t.got += a.score; else t.todo++;
      return t;
    }, { got: 0, todo: 0, max: Q.marks }));
    return { per, got: per.reduce((a, x) => a + x.got, 0), todo: per.reduce((a, x) => a + x.todo, 0), max: paper.total };
  }

  async function autoMark(q, a) {
    if (isBlank(q, a)) return { score: 0, max: q.marks, note: 'Not answered.' };
    const UI = CC.practiceUI;
    if (q.kind === 'output') { const ok = UI.normOut(a) === UI.normOut(q.answer); return { score: ok ? q.marks : 0, max: q.marks, note: ok ? 'Exactly right.' : 'Not the exact output.' }; }
    if (q.kind === 'trace') {
      const want = traceExpect(q), cells = a.cells || [], right = want.filter((v, i) => UI.normCell(cells[i] || '') === UI.normCell(v)).length;
      return { score: right === want.length ? q.marks : Math.floor(q.marks * right / want.length), max: q.marks, note: `${right} of ${want.length} cells right.` };
    }
    // code: the hidden tests decide; every test passing earns full marks, otherwise marks in proportion.
    let out = '';
    const res = await CC.runner.run(a + '\n' + P.HARNESS + '\n' + q.tests, { onOutput: t => { out += t; }, files: q.files || {}, onInput: () => Promise.resolve(''), execLimit: 5000 });
    const marks = out.split('\n').filter(l => l.startsWith('@@')), passed = marks.filter(l => l.startsWith('@@PASS')).length, total = marks.length;
    let score = total ? (passed === total ? q.marks : Math.floor(q.marks * passed / total)) : 0;
    const notes = [total ? `${passed} of ${total} tests pass.` : `The code stops before the tests run${res.error ? ` (${res.error.type})` : ''}.`];
    const code = stripComments(a), ban = (q.banned || []).find(b => new RegExp(b.re).test(code)), req = (q.require || []).find(r => !new RegExp(r.re).test(code));
    if (ban && score) { score--; notes.push(`−1: uses ${ban.label}, which the question does not allow.`); }
    if (req && score) { score--; notes.push(`−1: does not use ${req.label}.`); }
    return { score, max: q.marks, note: notes.join(' '), passed, total };
  }

  function mockPage(host, ctx) {
    const M = P.mock, UI = CC.practiceUI;
    let S = loadMock(), tick = null, saveT = null, editors = [], cards = [], gone = false;
    const save = () => saveMock(S);
    const cleanup = () => { clearInterval(tick); tick = null; clearTimeout(saveT); editors = []; cards.forEach(c => c.destroy && c.destroy()); cards = []; };
    const left = () => (S.cur.since ? S.cur.left - (Date.now() - S.cur.since) : S.cur.left);

    /* ---------- start page and past attempts ---------- */
    function home() {
      cleanup();
      const rows = S.attempts.slice().reverse().map(att => {
        const paper = M.build(att.paper, att.seed), t = tally(att, paper);
        return `<tr><td>${when(att.finished)}</td><td>${esc(paper.title)}</td>${t.per.map(x => `<td>${x.got}${x.todo ? '+' : ''} <small>/ ${x.max}</small></td>`).join('')}
          <td><b>${t.got}${t.todo ? '+' : ''}</b> <small>/ ${t.max}</small></td><td>${mins(att.used)}</td>
          <td><button class="btn sm" type="button" data-open="${att.id}">${t.todo ? 'Finish marking' : 'Review'}</button></td></tr>`;
      }).join('');
      host.innerHTML = `<section class="card rv-intro mk-start">
          <div class="mk-facts"><span>${ICON('clock')}<b>1 hour 15 minutes</b></span><span>${ICON('target')}<b>50 marks</b></span><span>${ICON('book')}<b>3 questions</b> — answer them all</span></div>
          <p>A full Paper 2 in the structure of your half-yearly exam. <b>Question 1</b> [14]: a flowchart to code, Big O, a file algorithm and a trace table. <b>Question 2</b> [16]: parallel arrays and a 2D list. <b>Question 3</b> [20]: a class — UML, objects, a method, instance and class variables, encapsulation and a list of objects.</p>
          <p>As in the exam, you can't run your code while the clock runs. When you finish, code is marked by hidden tests, outputs and trace tables are checked, and you mark your written answers against the mark scheme. Every part then shows its Reasoning panel.</p>
          <div class="mk-papers">${Object.values(M.PAPERS).map(p => `<div class="mk-paper-card"><b>${esc(p.title)}</b><span>${esc(p.theme)}</span><button class="btn primary" type="button" data-start="${p.id}">${ICON('play')}Start ${esc(p.title)}</button></div>`).join('')}</div>
          <p class="tv-help">Each start gives the paper new names and numbers, so you can sit it again. The clock pauses if you leave this page.</p>
        </section>
        <section class="card mk-hist"><h3>${ICON('history')}Your mock results</h3>
          ${rows ? `<div class="tv-wrap"><table class="tv mk-table"><thead><tr><th>Date</th><th>Paper</th><th>Q1</th><th>Q2</th><th>Q3</th><th>Total</th><th>Time</th><th></th></tr></thead><tbody>${rows}</tbody></table></div><p class="tv-help">A + means some written answers still need marking.</p>`
            : '<p>No mocks yet. Your results will be listed here.</p>'}
        </section>`;
      host.querySelectorAll('[data-start]').forEach(b => b.addEventListener('click', () => {
        S.cur = { id: Date.now(), paper: b.dataset.start, seed: (Math.random() * 2 ** 32) >>> 0, started: Date.now(), left: M.MINUTES * 60000, since: Date.now(), answers: {} };
        save(); exam(); host.scrollIntoView({ block: 'start' });
      }));
      host.querySelectorAll('[data-open]').forEach(b => b.addEventListener('click', () => { results(S.attempts.find(a => String(a.id) === b.dataset.open)); host.scrollIntoView({ block: 'start' }); }));
    }

    /* ---------- the exam: an answer booklet and a clock ---------- */
    function answerArea(q) {
      const a = S.cur.answers[q.key];
      if (q.kind === 'code') return `${(q.banned || []).length ? `<p class="q-ban"><span class="badge-nb">No built-ins</span> Not allowed: ${q.banned.map(b => `<code>${esc(b.label)}</code>`).join(', ')}</p>` : ''}<div class="mk-ed" data-key="${q.key}"></div>`;
      if (q.kind === 'trace') {
        let n = 0;
        const cells = (a && a.cells) || [];
        return `<div class="tt-wrap"><table class="tt"><thead><tr>${q.columns.map(c => `<th scope="col">${esc(c)}</th>`).join('')}</tr></thead><tbody>
          ${q.rows.map((r, ri) => `<tr>${r.map((c, ci) => (c.given ? `<td class="given">${esc(c.v)}</td>` : `<td><input data-key="${q.key}" data-i="${n}" value="${esc(cells[n++] || '')}" aria-label="${esc(q.columns[ci])}, row ${ri + 1}" autocomplete="off" spellcheck="false"></td>`)).join('')}</tr>`).join('')}
          </tbody></table></div>${(q.extra || []).map(x => `<label class="tt-extra">${esc(x.label)} <input data-key="${q.key}" data-i="${n}" value="${esc(cells[n++] || '')}" autocomplete="off" spellcheck="false"></label>`).join('')}`;
      }
      const rows = q.kind === 'output' ? Math.max(2, String(q.answer).split('\n').length + 1) : Math.max(3, q.marks * 2);
      return `<textarea class="${q.kind === 'output' ? 'q-out' : 'q-written'} mk-in" data-key="${q.key}" rows="${Math.min(rows, 10)}" spellcheck="${q.kind === 'written'}" aria-label="Your answer to ${esc(q.topicRef)}">${esc(a || '')}</textarea>`;
    }
    function partHTML(q, booklet) {
      return `<div class="mk-part" data-part="${q.key}">
        <div class="mk-ph"><span class="mk-label">(${q.label})</span><div class="mk-prompt">${q.prompt}</div><span class="mk-m">[${q.marks}]</span></div>
        ${q.visual ? `<div class="q-visual">${q.visual}</div>` : ''}${q.code && q.kind !== 'code' ? UI.codeBlock(q.code) : ''}
        ${booklet ? answerArea(q) : '<div class="mk-card"></div>'}</div>`;
    }
    const questionHead = Q => `<header class="mk-qh"><h3>Question ${Q.n} <span>${esc(Q.title)}</span></h3><span class="mk-m">[${Q.marks} marks]</span></header><div class="mk-intro">${Q.intro}</div>`;

    function exam() {
      cleanup();
      const paper = M.build(S.cur.paper, S.cur.seed);
      host.innerHTML = `<div class="mk-bar" role="region" aria-label="Exam clock">
          <span class="mk-time"><b data-clock>${clock(left())}</b> left</span>
          <nav class="mk-jump" aria-label="Questions">${paper.questions.map(Q => `<a href="#mkq${Q.n}" data-jump="${Q.n}">Q${Q.n}</a>`).join('')}</nav>
          <span class="mk-saved" data-saved aria-live="polite"></span>
          <span class="mk-acts"><button class="btn sm" type="button" data-pause>${ICON('pause')}Pause</button><button class="btn sm primary" type="button" data-finish>${ICON('check')}Finish</button></span>
          <span class="mk-sr" aria-live="assertive" data-alert></span>
        </div>
        <div class="card mk-paused" hidden><h3>Paused</h3><p>The paper is hidden while the clock is stopped.</p><button class="btn primary" type="button" data-resume>${ICON('play')}Resume — <span data-clock2></span> left</button></div>
        <div class="mk-paperbody">
          <header class="card mk-cover"><p class="eyebrow">Computer Science · SL · Paper 2 mock</p><h2>${esc(paper.title)} — ${esc(paper.theme)}</h2>
            <p>1 hour 15 minutes · 50 marks. Answer <b>all</b> questions. Write your code in Python. The number of marks for each part is shown in brackets.</p></header>
          ${paper.questions.map(Q => `<section class="card mk-q" id="mkq${Q.n}">${questionHead(Q)}${Q.parts.map(q => partHTML(q, true)).join('')}</section>`).join('')}
          <div class="mk-end"><button class="btn primary" type="button" data-finish>${ICON('check')}Finish and mark my paper</button></div>
        </div>`;
      const bar = host.querySelector('.mk-bar'), saved = host.querySelector('[data-saved]');
      const store = (key, v) => {
        S.cur.answers[key] = v;
        clearTimeout(saveT);
        saved.textContent = '';
        saveT = setTimeout(() => { saved.textContent = save() ? 'Saved' : 'Not saved: storage is full'; }, 400);
      };
      // Code answers in an editor without a Run button.
      paper.questions.forEach(Q => Q.parts.filter(q => q.kind === 'code').forEach(q => {
        const el = host.querySelector(`.mk-ed[data-key="${q.key}"]`), v = S.cur.answers[q.key] != null ? S.cur.answers[q.key] : q.starter;
        if (window.CodeMirror) {
          const cm = CodeMirror(el, { value: v, mode: { name: 'python', version: 3 }, lineNumbers: true, indentUnit: 4, tabSize: 4, indentWithTabs: false, matchBrackets: true, viewportMargin: Infinity,
            extraKeys: { Tab: c => (c.somethingSelected() ? c.indentSelection('add') : c.replaceSelection('    ', 'end')), 'Shift-Tab': c => c.indentSelection('subtract') } });
          cm.on('change', () => store(q.key, cm.getValue()));
          editors.push(cm);
        } else {
          const ta = document.createElement('textarea'); ta.className = 'q-out'; ta.rows = 12; ta.value = v; ta.spellcheck = false; el.appendChild(ta);
          ta.addEventListener('input', () => store(q.key, ta.value));
        }
      }));
      host.querySelectorAll('textarea.mk-in').forEach(t => t.addEventListener('input', () => store(t.dataset.key, t.value)));
      host.querySelectorAll('input[data-key]').forEach(inp => inp.addEventListener('input', () => {
        const key = inp.dataset.key, cells = [...host.querySelectorAll(`input[data-key="${key}"]`)].map(i => i.value);
        store(key, { cells });
      }));
      host.querySelectorAll('[data-jump]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); host.querySelector('#mkq' + a.dataset.jump).scrollIntoView({ behavior: 'smooth', block: 'start' }); }));

      const alertEl = host.querySelector('[data-alert]'), warned = new Set();
      const paint = () => {
        const ms = left(), t = clock(ms);
        host.querySelector('[data-clock]').textContent = t;
        host.querySelector('[data-clock2]').textContent = t;
        bar.classList.toggle('warn', ms <= 10 * 60000);
        bar.classList.toggle('last', ms <= 5 * 60000);
        [10, 5, 1].forEach(m => { if (ms <= m * 60000 && ms > (m - 1) * 60000 && !warned.has(m) && S.cur.since) { warned.add(m); alertEl.textContent = `${plural(m, 'minute')} left`; } });
        if (ms <= 0) finish(true);
      };
      const paused = on => {
        host.querySelector('.mk-paused').hidden = !on;
        host.querySelector('.mk-paperbody').hidden = on;
        host.querySelector('[data-pause]').hidden = on;
        bar.classList.toggle('is-paused', on);
      };
      host.querySelector('[data-pause]').addEventListener('click', () => { S.cur.left = left(); S.cur.since = null; save(); paused(true); paint(); });
      host.querySelector('[data-resume]').addEventListener('click', () => { S.cur.since = Date.now(); save(); paused(false); editors.forEach(cm => cm.refresh()); paint(); });
      host.querySelectorAll('[data-finish]').forEach(b => b.addEventListener('click', () => confirmFinish(b)));
      paused(!S.cur.since);
      paint();
      tick = setInterval(paint, 1000);
      setTimeout(() => editors.forEach(cm => cm.refresh()), 0);
    }
    function confirmFinish(btn) {
      const box = document.createElement('span');
      box.className = 'mk-confirm';
      box.innerHTML = `<span>Finish? You can't change your answers afterwards.</span><button class="btn sm primary" type="button" data-yes>Yes, mark it</button><button class="btn sm" type="button" data-no>Keep going</button>`;
      btn.replaceWith(box);
      box.querySelector('[data-yes]').addEventListener('click', () => finish(false));
      box.querySelector('[data-no]').addEventListener('click', () => box.replaceWith(btn));
      box.querySelector('[data-yes]').focus();
    }
    async function finish(timeUp) {
      if (!S.cur) return;
      const remaining = Math.max(0, left()), cur = S.cur;
      const att = { id: cur.id, paper: cur.paper, seed: cur.seed, started: cur.started, finished: Date.now(), used: M.MINUTES * 60000 - remaining, timeUp: !!timeUp, answers: cur.answers, auto: {}, written: {} };
      S.attempts.push(att);
      if (S.attempts.length > 30) S.attempts.splice(0, S.attempts.length - 30);
      S.cur = null;
      save();
      cleanup();
      const paper = M.build(att.paper, att.seed), parts = paper.questions.flatMap(Q => Q.parts);
      host.innerHTML = `<section class="card rv-intro"><h3>${timeUp ? 'Time is up — ' : ''}Marking your paper…</h3><p data-prog aria-live="polite"></p></section>`;
      for (const q of parts) {
        if (gone) return;
        const a = att.answers[q.key], prog = host.querySelector('[data-prog]');
        if (prog) prog.textContent = `Question ${q.key.slice(0, 1)}(${q.label})`;
        if (q.kind === 'written') { if (isBlank(q, a)) att.written[q.key] = { score: 0, ticks: [], blank: true }; continue; }
        att.auto[q.key] = await autoMark(q, a);
        save();
      }
      save();
      if (!gone) { results(att); host.scrollIntoView({ block: 'start' }); }
    }

    /* ---------- results: totals, then every part marked with its Reasoning panel ---------- */
    function results(att) {
      cleanup();
      const paper = M.build(att.paper, att.seed);
      host.innerHTML = `<section class="card mk-result" aria-live="polite"></section>
        <div class="mk-paperbody">${paper.questions.map(Q => `<section class="card mk-q" id="mkq${Q.n}">${questionHead(Q)}${Q.parts.map(q => partHTML(q, false)).join('')}</section>`).join('')}</div>
        <div class="mk-end"><button class="btn" type="button" data-home>${ICON('left')}All mocks</button></div>`;
      const summary = () => {
        const t = tally(att, paper), box = host.querySelector('.mk-result');
        box.innerHTML = `<div class="mk-score"><b>${t.got}</b><span>/ ${t.max}</span></div>
          <div class="mk-res-text"><h3>${esc(paper.title)} — ${esc(paper.theme)}</h3>
            <p>${when(att.finished)} · time used ${mins(att.used)}${att.timeUp ? ' (time ran out)' : ''} · ${pc(t.got, t.max)}%</p>
            ${t.todo ? `<p class="mk-todo">${ICON('book')}<b>${plural(t.todo, 'written answer')} to mark.</b> Open each one below, press <b>Show mark scheme</b>, tick the points your answer makes and save.</p>` : '<p>All parts marked.</p>'}
            <ul class="mk-per">${t.per.map((x, i) => `<li><a href="#mkq${i + 1}" data-jump="${i + 1}">Question ${i + 1}</a><span class="mk-perbar" aria-hidden="true"><i style="width:${pc(x.got, x.max)}%"></i></span><b>${x.got}${x.todo ? '+' : ''} / ${x.max}</b></li>`).join('')}</ul>
            <div class="hero-actions"><button class="btn sm" type="button" data-home>${ICON('left')}All mocks</button>${t.todo ? `<button class="btn sm primary" type="button" data-next-todo>${ICON('arrow')}Next answer to mark</button>` : ''}</div></div>`;
        box.querySelectorAll('[data-home]').forEach(b => b.addEventListener('click', () => { home(); host.scrollIntoView({ block: 'start' }); }));
        box.querySelectorAll('[data-jump]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); host.querySelector('#mkq' + a.dataset.jump).scrollIntoView({ behavior: 'smooth', block: 'start' }); }));
        const nx = box.querySelector('[data-next-todo]');
        if (nx) nx.addEventListener('click', () => { const p = parts.find(q => q.kind === 'written' && !att.written[q.key]); if (p) host.querySelector(`[data-part="${p.key}"]`).scrollIntoView({ behavior: 'smooth', block: 'start' }); });
        if (!t.todo) ctx.markDone('review-2');
      };
      const parts = paper.questions.flatMap(Q => Q.parts);
      parts.forEach(q => {
        const el = host.querySelector(`[data-part="${q.key}"] .mk-card`), a = att.answers[q.key];
        if (q.kind === 'written') {
          const w = att.written[q.key], text = a || '';
          if (w) { cards.push(UI.render(el, q, () => {}, { replay: { text, ticks: w.ticks }, banner: `${ICON('check')}<span>${w.blank ? 'Not answered' : 'Self-marked'}: <b>${w.score} / ${q.marks}</b></span>` })); return; }
          const card = UI.render(el, q, res => { att.written[q.key] = { score: res.score, ticks: (res.ans && res.ans.ticks) || [] }; save(); summary(); }, { banner: `${ICON('book')}<span>Mark this answer yourself: press <b>Show mark scheme</b>, tick each point your answer makes, then <b>Save my mark</b>.</span>` });
          const ta = card.el.querySelector('textarea.q-written');
          ta.value = text; ta.readOnly = true;
          cards.push(card);
          return;
        }
        const m = att.auto[q.key] || { score: 0, note: '' };
        const replay = q.kind === 'code' ? { code: isBlank(q, a) ? q.starter : a } : q.kind === 'output' ? { text: a || '', gave: false } : { cells: (a && a.cells) || [], gave: false };
        cards.push(UI.render(el, q, () => {}, { replay, banner: `${ICON('check')}<span>Marked: <b>${m.score} / ${q.marks}</b>${m.note ? ` — ${esc(m.note)}` : ''}</span>` }));
      });
      host.querySelectorAll('.mk-end [data-home]').forEach(b => b.addEventListener('click', () => { home(); host.scrollIntoView({ block: 'start' }); }));
      summary();
    }

    if (S.cur) exam(); else home();
    return {
      destroy() {
        gone = true;
        if (S.cur && S.cur.since) { S.cur.left = left(); S.cur.since = null; save(); } // leaving the page pauses the clock
        cleanup();
      }
    };
  }

  /* ================= review-3: progress dashboard ================= */
  const KINDS = [['mcq', 'Multiple choice'], ['output', 'Predict the output'], ['trace', 'Trace tables'], ['code', 'Write code'], ['written', 'Written answers']];
  const barRow = (name, pct, value, cls = '') => `<li class="db-row ${cls}"><span class="db-name">${name}</span><span class="db-bar" aria-hidden="true"><i style="width:${Math.max(0, Math.min(100, pct))}%"></i></span><span class="db-val">${value}</span></li>`;
  function dashboard(host, ctx) {
    const lessons = ctx.modules.flatMap(m => m.lessons), done = lessons.filter(l => ctx.isDone(l.id)).length, tot = ctx.practiceTotals();
    const S = loadMock(), mocks = S.attempts.map(att => { const p = P.mock.build(att.paper, att.seed); return { att, p, t: tally(att, p) }; });
    const best = mocks.length ? Math.max(...mocks.map(x => x.t.got)) : null;
    // Question types, from every attempt in "My questions".
    const byKind = {};
    Object.values(ctx.history.items).forEach(it => it.attempts.forEach(a => { const k = byKind[it.kind] = byKind[it.kind] || { n: 0, c: 0, s: 0, m: 0 }; k.n++; if (a.ok) k.c++; k.s += a.score || 0; k.m += a.max || 0; }));
    const topics = lessons.filter(l => P.gens[l.id] && P.gens[l.id].length && !/^start-/.test(l.id));
    const tried = topics.filter(l => ctx.topicStat(l.id).n), untried = topics.filter(l => !ctx.topicStat(l.id).n);
    const weak = ctx.weakestTopics(3), mcq = byKind.mcq || { n: 0, c: 0 };
    host.innerHTML = `
      <section class="stats" aria-label="Summary">
        <div class="card stat">${ICON('book')}<span class="stat-v">${done}<small> / ${lessons.length}</small></span><span class="stat-l">Lessons complete</span></div>
        <div class="card stat">${ICON('quiz')}<span class="stat-v">${tot.n ? pc(tot.c, tot.n) + '<small>%</small>' : '–'}</span><span class="stat-l">Practice accuracy${tot.n ? ` · ${tot.n} answered` : ''}</span></div>
        <div class="card stat">${ICON('check')}<span class="stat-v">${mcq.n ? pc(mcq.c, mcq.n) + '<small>%</small>' : '–'}</span><span class="stat-l">Multiple choice${mcq.n ? ` · ${mcq.n} answered` : ''}</span></div>
        <div class="card stat">${ICON('target')}<span class="stat-v">${best != null ? best + '<small> / 50</small>' : '–'}</span><span class="stat-l">Best Paper 2 mock</span></div>
      </section>
      <section class="card db-card"><h3>${ICON('book')}Completion by module</h3>
          <ul class="db-list">${ctx.modules.map(m => { const d = m.lessons.filter(l => ctx.isDone(l.id)).length; return barRow(`<a href="${ctx.href((m.lessons.find(l => !ctx.isDone(l.id)) || m.lessons[0]).id)}"><b>${m.num}</b> ${esc(m.title)}</a>`, pc(d, m.lessons.length), `${d} / ${m.lessons.length} lesson${m.lessons.length === 1 ? '' : 's'}`, d === m.lessons.length ? 'full' : ''); }).join('')}</ul>
          <p class="tv-help">A lesson is complete when every section that has content is marked as done.</p>
        </section>
      <div class="db-grid">
        <section class="card db-card"><h3>${ICON('target')}Weakest topics</h3>
          ${weak.length ? `<ol class="db-weak">${weak.map(id => { const l = CC.findLesson(id), st = ctx.topicStat(id); return `<li><div><code>${esc(l.ref)}</code> <b>${esc(l.title)}</b><span>${pc(st.c, st.n)}% correct · ${st.c} of ${st.n}</span></div><div class="db-acts"><a class="btn sm primary" href="#/practice/${encodeURIComponent(id)}">${ICON('infinity')}Practise</a><a class="btn sm" href="${ctx.href(id)}">${ICON('book')}Notes</a></div></li>`; }).join('')}</ol>
            <a class="mini-link" href="#/practice/weak">${ICON('target')}Mixed practice on your weakest topics →</a>`
            : '<p>Answer at least 3 questions on a topic and your lowest-scoring topics appear here, with links to practise them.</p>'}
        </section>
        <section class="card db-card"><h3>${ICON('table')}By type of question</h3>
          <ul class="db-list">${KINDS.map(([k, name]) => { const s = byKind[k]; return barRow(esc(name), s ? pc(s.c, s.n) : 0, s ? `<b>${pc(s.c, s.n)}%</b> · ${s.c} / ${s.n}` : 'none yet', s ? '' : 'none'); }).join('')}</ul>
          <p class="tv-help">Every attempt counts, including second tries from My questions.</p>
        </section>
      </div>
      <section class="card db-card"><h3>${ICON('quiz')}Accuracy by topic</h3>
        ${tried.length ? `<ul class="db-list db-wide">${tried.map(l => { const st = ctx.topicStat(l.id); return barRow(`<a href="#/practice/${encodeURIComponent(l.id)}"><code>${esc(l.ref)}</code> ${esc(l.title)}</a>`, pc(st.c, st.n), `<b>${pc(st.c, st.n)}%</b> · ${st.c} / ${st.n} correct · ${st.s} / ${st.m} marks`); }).join('')}</ul>
          <p class="tv-help">Correct = full marks on a question. Bars show the percentage of questions answered fully correctly.</p>` : '<p>No practice answers yet — every lesson\'s Try it, Trace it and Check tabs and the practice pages count here.</p>'}
        ${untried.length ? `<p class="db-untried"><b>Not practised yet:</b> ${untried.map(l => `<a href="#/practice/${encodeURIComponent(l.id)}"><code>${esc(l.ref)}</code></a>`).join(' ')}</p>` : ''}
      </section>
      <section class="card db-card"><h3>${ICON('clock')}Paper 2 mocks</h3>
          ${mocks.length ? `<ul class="db-list db-wide">${mocks.slice(-6).reverse().map(({ att, p, t }) => barRow(`${when(att.finished)} · ${esc(p.title)}`, pc(t.got, t.max), `<b>${t.got}${t.todo ? '+' : ''} / ${t.max}</b> · Q1 ${t.per[0].got}, Q2 ${t.per[1].got}, Q3 ${t.per[2].got}`)).join('')}</ul>` : '<p>No mocks yet.</p>'}
          <a class="mini-link" href="${ctx.href('review-2')}">${ICON('arrow')}${mocks.length ? 'Sit another mock' : 'Sit a Paper 2 mock'} →</a>
        </section>`;
    ctx.markDone('review-3');
    return { destroy() {} };
  }

  const PAGES = { 'review-1': mixedPage, 'review-2': mockPage, 'review-3': dashboard };
  CC.review = { has: id => !!PAGES[id], render: (id, host, ctx) => PAGES[id](host, ctx), mixedSet, autoMark, tally, traceExpect };
})(window.CodeCraft);
