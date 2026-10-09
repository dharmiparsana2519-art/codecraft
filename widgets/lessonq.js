/* widgets/lessonq.js — a lesson's Try it / Trace it / Check tabs, filled from the practice generators.
   Try it = 3 code questions, Trace it = 2 trace or predict-the-output questions, Check = 5 multiple-choice questions,
   all marked by practice/ui.js with its Reasoning panel.
   A set is fixed by (lesson, tab, round): the same questions come back on a later visit, already marked if you
   answered them; "New questions" moves to the next round.
   CodeCraft.lessonQs.config(id)                      → { try, trace, check } for lessons that have questions
   CodeCraft.lessonQs.mount(el, id, key, { onResult(q, res), lastAnswer(q) })   renders one tab's set into el */
window.CodeCraft = window.CodeCraft || {};

(function (CC) {
  const P = CC.practice;
  const ICON = (n, cls = '') => `<svg class="ic ${cls}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
  const TABS = {
    try: { kinds: ['code'], n: 3, label: 'code questions', help: 'Write the code, then press <b>Run tests</b> — hidden tests mark it, and the Reasoning panel explains every test.' },
    trace: { kinds: ['trace', 'output'], n: 2, label: 'trace questions', help: 'Work out what the program does before you answer. Afterwards the Reasoning panel runs it line by line.' },
    check: { kinds: ['mcq'], n: 5, label: 'multiple-choice questions', help: 'Each answer shows why it is right or wrong, and how to work it out.' }
  };
  // Lessons whose questions come from another topic's generators.
  const POOL = { 'start-1': 'start-2' };
  const KEY = 'codecraft.lessonq.v1';
  let rounds = {};
  try { rounds = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { rounds = {}; }
  const saveRounds = () => { try { localStorage.setItem(KEY, JSON.stringify(rounds)); } catch (e) { /* private mode */ } };
  const round = (id, key) => (rounds[id] && rounds[id][key]) || 0;

  // A small string hash (FNV-1a) for seeds.
  const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const gensFor = (id, key) => ((P && P.gens[POOL[id] || id]) || []).filter(g => TABS[key].kinds.includes(g.kind));

  function config(id) {
    const out = {};
    Object.keys(TABS).forEach(k => { if (gensFor(id, k).length) out[k] = TABS[k]; });
    return Object.keys(out).length ? out : null;
  }

  // The questions for one tab: spread over the tab's generators, no repeats.
  function questions(id, key, r) {
    const gens = gensFor(id, key), n = TABS[key].n, R = P.rng(hash(`${id}|${key}|${r}`)), order = R.shuffle(gens.slice());
    const lesson = CC.findLesson(id), out = [], strict = new Set(), loose = new Set();
    // Pass 1: different questions only. Pass 2 (for topics with few kinds of question): the same kind of question may
    // come again, as long as its data — and so its tests or answer — differ.
    [0, 1].forEach(pass => {
      for (let i = 0; out.length < n && i < n * 8; i++) {
        const g = order[i % order.length], q = P.generate(g, hash(`${id}|${key}|${r}|${pass}|${i}`));
        const s = g.id + '|' + [q.prompt, q.code || '', q.starter || ''].join('|'), l = g.id + '|' + [q.prompt, q.code || '', q.tests || '', q.answer || ''].join('|');
        if (loose.has(l) || (!pass && strict.has(s))) continue;
        strict.add(s); loose.add(l);
        q.topicRef = lesson ? lesson.ref : q.topic;
        out.push(q);
      }
    });
    return out;
  }

  function mount(el, id, key, opts = {}) {
    if (!el || !TABS[key]) return;
    const tab = TABS[key];
    let cards = [];
    const draw = () => {
      cards.forEach(c => c.destroy && c.destroy());
      cards = [];
      const qs = questions(id, key, round(id, key)), answered = new Set();
      el.innerHTML = `<div class="lq">
        <div class="lq-head">
          <p class="lq-help">${tab.help}</p>
          <div class="lq-bar"><span class="lq-score" aria-live="polite"></span>
            <button class="btn sm" type="button" data-lq-new>${ICON('reset')}New questions</button></div>
        </div>
        <ol class="lq-list">${qs.map((q, i) => `<li class="lq-item" data-i="${i}"><div class="lq-num">Question ${i + 1} of ${qs.length}</div><div class="lq-card"></div></li>`).join('')}</ol>
        <p class="lq-more"><a class="mini-link" href="#/practice/${encodeURIComponent(POOL[id] || id)}">${ICON('infinity')}Want more? Unlimited practice on this topic →</a></p>
      </div>`;
      const score = el.querySelector('.lq-score'), right = new Set();
      const showScore = () => { score.textContent = `${answered.size} of ${qs.length} answered${answered.size ? ` · ${right.size} correct` : ''}`; };
      const renderCard = (i, fresh) => {
        const q = qs[i], host = el.querySelector(`.lq-item[data-i="${i}"] .lq-card`);
        if (cards[i]) cards[i].destroy();
        host.innerHTML = '';
        const last = !fresh && opts.lastAnswer ? opts.lastAnswer(q) : null;
        if (last && last.ans) {
          // Replaying a saved answer marks the card again — that must not be recorded a second time.
          cards[i] = CC.practiceUI.render(host, q, () => {}, { replay: last.ans, banner: `${ICON('history')}Your answer from before — ${last.ok ? 'correct' : `${last.score} / ${last.max}`}. <button class="link-btn" type="button" data-lq-retry="${i}">Try it again</button>` });
          answered.add(i); if (last.ok) right.add(i); else right.delete(i);
        } else {
          cards[i] = CC.practiceUI.render(host, q, res => {
            answered.add(i); if (res.ok) right.add(i); else right.delete(i);
            showScore();
            if (opts.onResult) opts.onResult(q, res);
          });
        }
        showScore();
      };
      qs.forEach((q, i) => renderCard(i, false));
      el.onclick = e => {
        const retry = e.target.closest('[data-lq-retry]');
        if (retry) { renderCard(+retry.dataset.lqRetry, true); return; }
        if (e.target.closest('[data-lq-new]')) {
          rounds[id] = rounds[id] || {};
          rounds[id][key] = round(id, key) + 1;
          saveRounds();
          draw();
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      };
    };
    draw();
  }

  // Register the tabs as lesson sections (an object, so the lesson page knows to mount questions, not prose).
  CC.lessons = CC.lessons || {};
  (CC.allLessons ? CC.allLessons() : []).forEach(l => {
    const cfg = config(l.id);
    if (!cfg) return;
    const lesson = CC.lessons[l.id] = CC.lessons[l.id] || {};
    Object.keys(cfg).forEach(k => { if (!lesson[k]) lesson[k] = { lq: k }; });
  });

  CC.lessonQs = { config, questions, mount, TABS };
})(window.CodeCraft);
