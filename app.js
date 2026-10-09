/* app.js — routing (#/ and #/lesson/<id>), progress in localStorage, home dashboard, lesson pages. */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ICON = (name, cls = '') => `<svg class="ic ${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const href = id => '#/lesson/' + encodeURIComponent(id);

  const COURSE = CodeCraft.course;
  const LESSONS = CodeCraft.allLessons();
  const SECTIONS = [
    { key: 'learn', title: 'Learn' },
    { key: 'try', title: 'Try it' },
    { key: 'trace', title: 'Trace it' },
    { key: 'check', title: 'Check' }
  ];

  /* The editor's starting program until a lesson's content file provides its own. */
  const DEFAULT_STARTER = `# Welcome to the CodeCraft editor. Press Run (or Ctrl+Enter).
# name: str — you type it into the console below
name = input("What's your name? ")
print("Hi", name + "!")

# scores.txt is a virtual file — open the Files tab to see it
total = 0
count = 0
with open("scores.txt") as f:
    for line in f:
        student, score = line.strip().split(",")
        total = total + int(score)
        count = count + 1
        print(student, "scored", score)

print("Class average:", total / count)

# Writing ("a" = append) adds visits.txt to the Files tab
log = open("visits.txt", "a")
log.write(name + "\\n")
log.close()
`;
  const DEFAULT_FILES = { 'scores.txt': 'Aiko,78\nBen,64\nCarla,91\nDev,55\n' };

  /* ================= PROGRESS (localStorage) ================= */
  const KEY = 'codecraft.v1';
  const P = (() => {
    let d = {};
    // 'pypath.v1' is the key from before the site was renamed CodeCraft.
    try { d = JSON.parse(localStorage.getItem(KEY) || localStorage.getItem('pypath.v1') || '{}') || {}; } catch (e) { d = {}; }
    return Object.assign({ v: 1, mode: null, last: null, lessons: {}, days: [], code: {} }, d);
  })();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (e) { /* private mode: progress lasts this visit only */ } }
  const rec = id => (P.lessons[id] = P.lessons[id] || { sec: {} });
  // A section counts only once it has real content; "coming soon" sections can't be ticked or counted.
  const hasSection = (id, key) => !!(CodeCraft.lessons[id] && CodeCraft.lessons[id][key]);
  const liveSections = id => SECTIONS.filter(s => hasSection(id, s.key));
  const isDone = id => { const r = P.lessons[id], live = liveSections(id); return !!r && live.length > 0 && live.every(s => r.sec && r.sec[s.key]); };
  function status(id) {
    if (isDone(id)) return 'done';
    const r = P.lessons[id];
    return r && (r.seen || liveSections(id).some(s => r.sec && r.sec[s.key])) ? 'started' : 'new';
  }
  const doneCount = () => LESSONS.filter(l => isDone(l.id)).length;
  const modDone = m => m.lessons.filter(l => isDone(l.id)).length;
  function modState(m) {
    const d = modDone(m);
    if (d === m.lessons.length) return 'done';
    return d > 0 || m.lessons.some(l => status(l.id) !== 'new') ? 'cur' : 'new';
  }
  function nextLesson() {
    if (P.last && !isDone(P.last) && CodeCraft.findLesson(P.last)) return CodeCraft.findLesson(P.last);
    return LESSONS.find(l => !isDone(l.id)) || LESSONS[LESSONS.length - 1];
  }
  /* Practice stats: P.practice[topic] = { n: answered, c: correct, s: marks scored, m: marks possible } */
  const PR = () => (P.practice = P.practice || {});
  const topicStat = id => PR()[id] || { n: 0, c: 0, s: 0, m: 0 };
  const hasPractice = id => !!(CodeCraft.practice && CodeCraft.practice.gens[id] && CodeCraft.practice.gens[id].length);
  const practiceTopics = () => (CodeCraft.practice ? CodeCraft.practice.topics() : []);
  function practiceTotals() {
    const t = { n: 0, c: 0, s: 0, m: 0, topics: 0 };
    Object.values(PR()).forEach(x => { t.n += x.n; t.c += x.c; t.s += x.s; t.m += x.m; if (x.n) t.topics++; });
    return t;
  }
  const pc = (a, b) => (b ? Math.round(a / b * 100) : 0);
  function weakestTopics(k) {
    return Object.keys(PR()).filter(id => PR()[id].n >= 3 && hasPractice(id))
      .sort((a, b) => PR()[a].c / PR()[a].n - PR()[b].c / PR()[b].n).slice(0, k);
  }
  /* Question history ("My questions"). Each question is stored by topic + generator + seed, which is enough to
     rebuild it exactly, plus what was answered on each attempt. Kept under its own key so it can grow. */
  const HKEY = 'codecraft.history.v1';
  const H = (() => {
    let d = null;
    try { d = JSON.parse(localStorage.getItem(HKEY) || 'null'); } catch (e) { d = null; }
    return d && d.items && Array.isArray(d.order) ? d : { items: {}, order: [] };
  })();
  function saveHistory() {
    for (let i = 0; i < 6; i++) {
      try { localStorage.setItem(HKEY, JSON.stringify(H)); return; }
      catch (e) { const drop = H.order.splice(0, 50); drop.forEach(id => delete H.items[id]); if (!drop.length) return; } // storage full: forget the oldest
    }
  }
  const qid = q => `${q.topic}|${q.gen}|${q.seed}`;
  function previewOf(q) {
    const text = String(q.prompt).replace(/<details[\s\S]*?<\/details>/g, '').replace(/<blockquote>([\s\S]*?)<\/blockquote>/g, ' “$1”').replace(/<[^>]+>/g, ' ')
      .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
    const line = q.code ? q.code.split('\n').find(l => l.trim() && !/^\s*#/.test(l)) : '';
    return (text.length > 150 ? text.slice(0, 147) + '…' : text) + (line ? ' ⟶ ' + line.trim().slice(0, 60) : '');
  }
  function recordAttempt(q, res) {
    const id = qid(q);
    let it = H.items[id];
    if (!it) it = H.items[id] = { topic: q.topic, gen: q.gen, seed: q.seed, kind: q.kind, term: q.term, marks: q.marks, preview: previewOf(q), attempts: [] };
    else H.order.splice(H.order.indexOf(id), 1);
    H.order.push(id);
    it.attempts.push({ t: Date.now(), ok: !!res.ok, score: res.score, max: res.max, ans: res.ans || null });
    if (it.attempts.length > 6) it.attempts.splice(1, it.attempts.length - 6); // keep the first attempt and the latest ones
    if (H.order.length > 800) H.order.splice(0, H.order.length - 800).forEach(x => delete H.items[x]);
    saveHistory();
  }
  function itemStatus(it) {
    const last = it.attempts[it.attempts.length - 1];
    if (last.ok) return it.attempts.some(a => !a.ok) ? 'fixed' : 'right';
    return last.score > 0 ? 'part' : 'wrong';
  }
  const isMistake = it => !it.attempts[it.attempts.length - 1].ok;
  // Every practice answer goes through here: topic stats, trace count, streak and history.
  function recordResult(q, res) {
    const s = PR()[q.topic] = PR()[q.topic] || { n: 0, c: 0, s: 0, m: 0 };
    s.n++; s.s += res.score; s.m += res.max; if (res.ok) s.c++;
    if (res.ok && q.kind === 'trace') P.traces = (P.traces || 0) + 1;
    recordAttempt(q, res);
    touchDay(); save(); renderChips();
  }
  const dayKey = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  function touchDay() {
    const k = dayKey(new Date());
    if (!P.days.includes(k)) { P.days.push(k); P.days = P.days.slice(-400); save(); renderChips(); }
  }
  function streak() {
    const set = new Set(P.days), d = new Date();
    if (!set.has(dayKey(d))) d.setDate(d.getDate() - 1);
    let n = 0;
    while (set.has(dayKey(d))) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }

  /* ================= SHARED UI ================= */
  function renderChips() {
    const s = streak(), pct = Math.round(doneCount() / LESSONS.length * 100);
    $('#streakChip').innerHTML = `${ICON('flame')}${s}<span class="streak-l">&nbsp;day${s === 1 ? '' : 's'}</span>`;
    $('#progressChip').innerHTML = `${pct}%<span class="xpbar"><i style="width:${pct}%"></i></span>`;
  }

  function ring(pct, size, stroke, r) {
    const c = 2 * Math.PI * r;
    return `<svg viewBox="0 0 ${size} ${size}" aria-hidden="true">
      <circle class="track" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--border-2)" stroke-width="${stroke}"/>
      <circle class="val" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--ink)" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${(c * (1 - pct / 100)).toFixed(1)}" data-c="${c.toFixed(1)}" data-pct="${pct}"/></svg>`;
  }

  const openMods = new Set();
  function treeHTML(activeId, pre) {
    const done = doneCount(), pct = Math.round(done / LESSONS.length * 100);
    return `
      <div class="card side-prog"><div class="mini-ring">${ring(pct, 46, 4, 19)}<em>${pct}%</em></div>
        <div><b>Course progress</b><span>${done} of ${LESSONS.length} lessons</span></div></div>
      <div class="side-label">Modules</div>
      <ul class="modnav">${COURSE.modules.map(m => {
        const open = openMods.has(m.id);
        return `<li class="mod ${modState(m)}">
          <button class="mod-h" data-mod="${m.id}" aria-expanded="${open}" aria-controls="${pre}-les-${m.id}">
            <span class="mod-n">${m.num}</span>
            <span class="mod-t">${esc(m.title)}<small>${esc(m.ref)}${m.page ? ' · p.' + m.page : ''}</small></span>
            <span class="mod-c">${modDone(m)}/${m.lessons.length}</span>${ICON('chev', 'chev')}
          </button>
          <ul class="les" id="${pre}-les-${m.id}"${open ? '' : ' hidden'}>${m.lessons.map(l => {
            const st = status(l.id);
            return `<li><a href="${href(l.id)}" class="${st}${l.id === activeId ? ' active' : ''}"${l.id === activeId ? ' aria-current="page"' : ''}>${st === 'done' ? ICON('check') : '<span class="dot"></span>'}${esc(CodeCraft.lessonLabel(l))}</a></li>`;
          }).join('')}</ul></li>`;
      }).join('')}</ul>`;
  }
  function wireTree(root) {
    $$('.mod-h', root).forEach(b => b.addEventListener('click', () => {
      const id = b.dataset.mod, list = $('#' + b.getAttribute('aria-controls'), root);
      const open = list.hidden;
      list.hidden = !open; b.setAttribute('aria-expanded', open);
      open ? openMods.add(id) : openMods.delete(id);
    }));
  }
  function renderSidebar(activeId) {
    const sb = $('#sidebar');
    if (document.body.dataset.screen === 'practice') { sb.innerHTML = practiceTreeHTML(route.practice); return; }
    sb.innerHTML = treeHTML(activeId, 'sb') + `
      <div class="card side-note"><b>About CodeCraft</b>IB DP Computer Science SL, Theme B, in Python — following the Hodder textbook's order.</div>`;
    wireTree(sb);
  }

  /* Drawer (course menu on lesson pages and on phones) */
  const drawer = $('#drawer'), menuBtn = $('#menuBtn');
  function openDrawer() {
    const body = $('#drawerBody');
    body.innerHTML = document.body.dataset.screen === 'practice' ? practiceTreeHTML(route.practice) : treeHTML(route.lessonId, 'dr');
    wireTree(body);
    drawer.hidden = false; menuBtn.setAttribute('aria-expanded', 'true');
    const active = $('.les a.active', body) || $('a, button', body);
    if (active) active.focus();
  }
  function closeDrawer() {
    if (drawer.hidden) return;
    drawer.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.focus({ preventScroll: true });
  }
  menuBtn.addEventListener('click', openDrawer);
  drawer.addEventListener('click', e => { if (e.target.closest('[data-close]') || e.target.closest('a')) closeDrawer(); });
  addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });

  /* Light / dark: follows the device setting until the toggle is used. Choosing the device's own mode again
     goes back to following the device. */
  const darkQuery = matchMedia('(prefers-color-scheme: dark)');
  const deviceMode = () => (darkQuery.matches ? 'dark' : 'light');
  function setMode(mode) {
    document.documentElement.dataset.mode = mode;
    $('#modeBtn').setAttribute('aria-label', mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }
  $('#modeBtn').addEventListener('click', () => {
    const next = document.documentElement.dataset.mode === 'dark' ? 'light' : 'dark';
    P.mode = next === deviceMode() ? null : next;
    setMode(next); save();
  });
  darkQuery.addEventListener('change', () => { if (!P.mode) setMode(deviceMode()); });
  setMode(P.mode || deviceMode());

  /* Toast + confetti */
  let toastTimer;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
  }
  function confetti(from) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = from.getBoundingClientRect(), cols = ['#3B82F6', '#FFD43B', '#8B5CF6', '#22C55E', '#FF6B6B'];
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('i'); p.className = 'cf';
      p.style.left = (r.left + r.width / 2) + 'px'; p.style.top = (r.top + r.height / 2) + 'px'; p.style.background = cols[i % cols.length];
      document.body.appendChild(p);
      const a = Math.random() * Math.PI * 2, d = 60 + Math.random() * 130;
      p.animate([{ transform: 'translate(0,0) rotate(0)', opacity: 1 }, { transform: `translate(${Math.cos(a) * d}px,${Math.sin(a) * d + 90}px) rotate(${Math.random() * 720}deg)`, opacity: 0 }],
        { duration: 900 + Math.random() * 600, easing: 'cubic-bezier(.2,.7,.3,1)' }).onfinish = () => p.remove();
    }
  }

  /* ================= HOME ================= */
  function renderHome() {
    const done = doneCount(), total = LESSONS.length, pct = Math.round(done / total * 100);
    const next = nextLesson(), s = streak(), fresh = !P.last && done === 0, tot = practiceTotals(), weak = weakestTopics(3);
    $('#main').innerHTML = `
      <section class="card home-hero tape">
        <div>
          <p class="eyebrow">IB Computer Science · SL · first exams 2027</p>
          ${fresh
            ? `<h1 class="home-title">Learn Python for <em>IB Computer Science.</em></h1>
               <p class="sub">Every SL programming topic in the textbook's order, with code you can run right here. Start by finding out how the editor works.</p>`
            : `<h1 class="home-title">Welcome back — <em>${s > 0 ? 'keep the streak going.' : 'pick up where you left off.'}</em></h1>
               <p class="sub">You're ${pct}% through the SL programming course. Up next: ${esc(CodeCraft.lessonLabel(next))}.</p>`}
          <div class="hero-actions">
            <a class="btn primary" href="${href(next.id)}">${ICON('play')}${fresh ? 'Start' : 'Continue'}: ${esc(CodeCraft.lessonLabel(next))}</a>
            <a class="btn" href="#/practice">${ICON('infinity')}Practice questions</a>
          </div>
        </div>
        <div class="ring" id="ring">${ring(pct, 164, 12, 70)}<div class="ring-c"><b>${pct}%</b><span>${done} of ${total} lessons</span></div></div>
      </section>

      <section class="stats" aria-label="Your stats">
        <div class="card stat">${ICON('book')}<span class="stat-v">${done}<small> / ${total}</small></span><span class="stat-l">Lessons complete</span></div>
        <div class="card stat">${ICON('quiz')}<span class="stat-v">${tot.n ? pc(tot.c, tot.n) + '<small>%</small>' : '–'}</span><span class="stat-l">Practice accuracy${tot.n ? ` · ${tot.n} answered` : ''}</span></div>
        <div class="card stat">${ICON('flame')}<span class="stat-v">${s}<small> day${s === 1 ? '' : 's'}</small></span><span class="stat-l">Current streak</span></div>
        <div class="card stat">${ICON('table')}<span class="stat-v">${P.traces || 0}</span><span class="stat-l">Trace tables solved</span></div>
      </section>

      <div class="home-grid">
        <section aria-labelledby="mapTitle">
          <h2 class="h2" id="mapTitle">Course map <span>Theme B · SL</span></h2>
          <ol class="mods">${COURSE.modules.map(m => {
            const st = modState(m), d = modDone(m), n = m.lessons.length;
            const target = m.lessons.find(l => !isDone(l.id)) || m.lessons[0];
            return `<li><a class="card mcard ${st}" href="${href(target.id)}">
              <div class="m-top"><span class="m-node">${m.num}</span><span class="m-code">${esc(m.ref)}</span><span class="m-state">${st === 'done' ? 'Done' : st === 'cur' ? 'In progress' : 'Not started'}</span></div>
              <div class="m-title">${esc(m.title)}</div>
              <div class="m-bar"><i style="width:${Math.round(d / n * 100)}%"></i></div>
              <div class="m-meta">${d} / ${n} lesson${n === 1 ? '' : 's'}</div></a></li>`;
          }).join('')}</ol>
        </section>
        <aside class="side-col">
          <div class="card mini">
            <h3>${ICON('target')}Weakest topics</h3>
            ${weak.length ? `<ul class="weak">${weak.map(id => { const l = CodeCraft.findLesson(id), st = topicStat(id); return `<li><a href="#/practice/${encodeURIComponent(id)}"><div><span><code>${esc(l.ref)}</code>${esc(l.title)}</span><span>${pc(st.c, st.n)}%</span></div><div class="m-bar"><i style="width:${pc(st.c, st.n)}%"></i></div></a></li>`; }).join('')}</ul>
               <a class="btn sm" href="#/practice/weak">${ICON('target')}Practise these</a>`
              : `<p>Answer at least 3 practice questions on a topic and your lowest-scoring topics show up here.</p><div class="anno">nothing to fix yet</div>`}
          </div>
          <div class="card mini">
            <h3>${ICON('infinity')}Unlimited practice</h3>
            <p>Fresh exam-style questions for every SL topic, marked instantly, with an explanation for every answer.</p>
            <div class="hero-actions"><a class="btn sm primary" href="#/practice/mix">${ICON('bolt')}Mixed practice</a><a class="btn sm" href="#/practice">Choose a topic</a></div>
            ${H.order.length ? (() => { const m = H.order.filter(id => isMistake(H.items[id])).length; return `<a class="mini-link" href="#/review${m ? '?status=wrong' : ''}">${ICON('history')}${m ? `${m} question${m === 1 ? '' : 's'} to review again` : `Review your ${H.order.length} answered questions`} →</a>`; })() : ''}
          </div>
        </aside>
      </div>`;
    // Animate the ring from 0.
    const v = $('#ring .val');
    if (v) { const c = +v.dataset.c; v.style.transition = 'none'; v.style.strokeDashoffset = c; v.getBoundingClientRect(); v.style.transition = ''; v.style.strokeDashoffset = c * (1 - pct / 100); }
  }

  /* ================= LESSON ================= */
  let playground = null, stepObserver = null;

  function placeholder(key, l) {
    const nob = /No built-ins/i.test(l.must.join(' ')) || ['m5', 'm6'].includes(l.module.id);
    if (key === 'learn') {
      return `<div class="card prose">
          <p class="soon-k">Notes coming soon</p>
          <h3>In this lesson</h3>
          <ul class="must">${l.must.map(m => `<li>${esc(m)}</li>`).join('')}</ul>
          <div class="anno">meanwhile, try the editor</div>
        </div>`;
    }
    const cards = {
      try: ['Exercises coming soon', 'Auto-graded exercises',
        `<p>2–4 coding exercises with starter code and hints. Hidden tests mark your code as soon as you run it, and the model solution unlocks after 2 attempts.</p>${nob ? '<p>Includes a <strong>No built-ins</strong> version, because exam questions can ban <code>sort</code>, <code>pop</code>, <code>len</code>, <code>max</code> and <code>min</code>.</p>' : ''}`],
      trace: ['Trace table coming soon', 'Trace the code',
        '<p>Work through a program line by line, filling in each variable\'s value in a trace table. Each row is checked as you go.</p>'],
      check: ['Quiz coming soon', 'Five-question check',
        `<p>Every option comes with an explanation — why the right answer is right, and why each wrong one is wrong.</p>${hasPractice(l.id) ? `<p>Until then, <a href="#/practice/${encodeURIComponent(l.id)}">practise this topic</a> with unlimited questions.</p>` : ''}`]
    }[key];
    return `<div class="card soon"><p class="soon-k">${cards[0]}</p><h3>${cards[1]}</h3>${cards[2]}</div>`;
  }

  function stepsNav(l) {
    const r = P.lessons[l.id] || { sec: {} };
    return `<nav class="steps" aria-label="Lesson sections">${SECTIONS.map((s, i) => {
      const d = hasSection(l.id, s.key) && r.sec && r.sec[s.key];
      return `<button class="st${i === 0 ? ' on' : ''}${d ? ' done' : ''}" data-go="${s.key}"><span class="st-n">${d ? ICON('check') : i + 1}</span><span class="st-l">${s.title}</span></button>`;
    }).join('')}</nav>`;
  }

  function renderLesson(id) {
    const l = CodeCraft.findLesson(id);
    if (!l) {
      $('#main').innerHTML = `<div class="card missing"><h1 class="lesson-title">Lesson not found</h1><p class="lede" style="margin:0 auto 18px">There's no lesson called "${esc(id)}".</p><a class="btn primary" href="#/">${ICON('home')}Back to home</a></div>`;
      return;
    }
    const content = CodeCraft.lessons[id] || {};
    const m = l.module, idx = LESSONS.findIndex(x => x.id === id);
    const prev = LESSONS[idx - 1], next = LESSONS[idx + 1];
    const r = rec(id); r.seen = Date.now(); P.last = id; save();
    openMods.add(m.id);

    $('#crumbs').innerHTML = `<button class="crumb-mod" id="crumbMod" aria-label="Open course menu"><span class="crumb-mod-t">Module ${m.num} · ${esc(m.ref)}</span>${ICON('down')}</button>${ICON('chev')}<span class="crumb-les">${esc(CodeCraft.lessonLabel(l))}</span>`;
    $('#crumbMod').addEventListener('click', openDrawer);

    $('#main').innerHTML = `
      <article class="lesson" aria-labelledby="lessonTitle">
        <header class="lesson-head">
          <div class="tags">
            ${/^B\d/.test(l.ref) ? `<span class="tag tag-ref">${esc(l.ref)}</span>` : ''}
            <span class="tag">${ICON('book')}Textbook · ${m.page ? 'from p.' + m.page : esc(m.ref === 'Start' || m.ref === 'Review' ? 'Theme B' : 'Chapter ' + m.ref)}</span>
            <span class="tag tag-sl">SL</span>
          </div>
          <h1 class="lesson-title" id="lessonTitle"><em>${esc(content.title || l.title)}</em></h1>
          <p class="lede">${esc(content.blurb || l.blurb)}</p>
          <ol class="lpath" aria-label="Lessons in this module">${m.lessons.map(x => {
            const st = status(x.id);
            return `<li class="${x.id === id ? 'cur' : st === 'done' ? 'done' : ''}"><a href="${href(x.id)}"${x.id === id ? ' aria-current="page"' : ''}><i></i>${esc(CodeCraft.lessonLabel(x))}</a></li>`;
          }).join('')}</ol>
        </header>
        ${stepsNav(l)}
        ${SECTIONS.map((s, i) => `
          <section class="step" id="step-${s.key}" data-step="${s.key}" aria-labelledby="h-${s.key}">
            <header class="sec-head"><span class="sec-k">${i + 1}</span><h2 id="h-${s.key}">${s.title}</h2>
              ${hasSection(id, s.key) ? `<button class="btn sm mark${r.sec[s.key] ? ' done' : ''}" data-mark="${s.key}" aria-pressed="${!!r.sec[s.key]}">${r.sec[s.key] ? ICON('check') + 'Done' : 'Mark as done'}</button>` : ''}</header>
            ${!hasSection(id, s.key) ? placeholder(s.key, l) : content[s.key].lq ? `<div class="lq-host" data-lq="${s.key}"></div>` : `<div class="card prose">${content[s.key]}</div>`}
          </section>`).join('')}
        ${hasPractice(id) ? (() => { const st = topicStat(id); return `
        <section class="card practice-cta tape" aria-label="Practice">
          <div>
            <p class="eyebrow">${ICON('infinity')}Unlimited practice</p>
            <h3>Practise ${esc(CodeCraft.lessonLabel(l))} — as many questions as you like</h3>
            <p>Exam-style questions generated fresh every time, marked instantly, with an explanation for every answer.${st.n ? ` You've answered ${st.n} so far (${pc(st.c, st.n)}% correct).` : ''}</p>
          </div>
          <a class="btn primary" href="#/practice/${encodeURIComponent(id)}">${ICON('infinity')}Practise this topic</a>
        </section>`; })() : ''}
        <nav class="lesson-nav" aria-label="Previous and next lesson">
          ${prev ? `<a class="card prev" href="${href(prev.id)}"><span>${ICON('left')}Previous</span><b>${esc(CodeCraft.lessonLabel(prev))}</b></a>` : ''}
          ${next ? `<a class="card next" href="${href(next.id)}"><span>Next${ICON('arrow')}</span><b>${esc(CodeCraft.lessonLabel(next))}</b></a>` : ''}
        </nav>
      </article>`;

    // Section buttons
    $$('.st').forEach(b => b.addEventListener('click', () => {
      const target = $('#step-' + b.dataset.go);
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      $$('.st').forEach(x => x.classList.toggle('on', x === b));
    }));
    $$('[data-mark]').forEach(b => b.addEventListener('click', () => toggleSection(l, b.dataset.mark, b)));
    watchSteps();

    // Playground in the dock
    if (playground) playground.destroy();
    const starter = content.starter || DEFAULT_STARTER;
    playground = CodeCraft.Playground($('#dock'), {
      starter,
      code: P.code[id] != null ? P.code[id] : starter,
      files: content.files || DEFAULT_FILES,
      filename: content.filename || 'main.py',
      onCodeChange: code => { if (code === starter) delete P.code[id]; else P.code[id] = code; save(); },
      onRun: () => touchDay()
    });
    // "Build it from scratch" notes: Run buttons, line-by-line steppers and live trace tables.
    if (CodeCraft.notes && CodeCraft.notes.all[id]) CodeCraft.notes.hydrate($('#step-learn'), () => playground);
    // Try it / Trace it / Check: question sets from the practice generators, recorded like any practice answer.
    $$('.lq-host').forEach(host => CodeCraft.lessonQs.mount(host, id, host.dataset.lq, {
      onResult: (q, res) => recordResult(q, res),
      lastAnswer: q => { const it = H.items[qid(q)]; return it ? it.attempts[it.attempts.length - 1] : null; }
    }));
  }

  function toggleSection(l, key, btn) {
    const r = rec(l.id), wasDone = isDone(l.id);
    r.sec[key] = !r.sec[key];
    if (r.sec[key]) touchDay();
    save();
    btn.classList.toggle('done', r.sec[key]);
    btn.setAttribute('aria-pressed', r.sec[key]);
    btn.innerHTML = r.sec[key] ? ICON('check') + 'Done' : 'Mark as done';
    const st = $(`.st[data-go="${key}"]`);
    st.classList.toggle('done', r.sec[key]);
    $('.st-n', st).innerHTML = r.sec[key] ? ICON('check') : SECTIONS.findIndex(s => s.key === key) + 1;
    renderChips();
    if (!wasDone && isDone(l.id)) { confetti(btn); toast(`${CodeCraft.lessonLabel(l)} complete — nice work!`); }
  }

  function watchSteps() {
    if (stepObserver) stepObserver.disconnect();
    const main = $('#main');
    const scroller = getComputedStyle(main).overflowY === 'auto' ? main : null;
    stepObserver = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const key = e.target.dataset.step;
        $$('.st').forEach(x => x.classList.toggle('on', x.dataset.go === key));
      });
    }, { root: scroller, rootMargin: '-20% 0px -65% 0px' });
    $$('.step').forEach(s => stepObserver.observe(s));
  }

  /* ================= PRACTICE ================= */
  const pHref = id => '#/practice/' + encodeURIComponent(id);
  function practiceTreeHTML(activeId) {
    const tot = practiceTotals(), mods = COURSE.modules.map(m => [m, m.lessons.filter(l => hasPractice(l.id))]).filter(x => x[1].length);
    return `
      <div class="card side-prog"><div class="mini-ring">${ring(pc(tot.c, tot.n), 46, 4, 19)}<em>${tot.n ? pc(tot.c, tot.n) + '%' : '–'}</em></div>
        <div><b>Practice</b><span>${tot.n} answered · ${tot.topics} topic${tot.topics === 1 ? '' : 's'}</span></div></div>
      <nav class="ptree" aria-label="Practice topics">
        <a class="pt-link pt-mix${activeId === 'review' ? ' active' : ''}" href="#/review">${ICON('history')}<span>My questions</span>${H.order.length ? `<em class="pt-acc ${H.order.some(id => isMistake(H.items[id])) ? 'low' : 'good'}">${H.order.filter(id => isMistake(H.items[id])).length} to fix</em>` : ''}</a>
        <a class="pt-link pt-mix${activeId === 'mix' ? ' active' : ''}" href="${pHref('mix')}">${ICON('bolt')}Mixed — all topics</a>
        <a class="pt-link pt-mix${activeId === 'weak' ? ' active' : ''}" href="${pHref('weak')}">${ICON('target')}My weakest topics</a>
        ${mods.map(([m, ls]) => `<div class="side-label">${m.num} · ${esc(m.title)}</div>${ls.map(l => { const st = topicStat(l.id); return `<a class="pt-link${l.id === activeId ? ' active' : ''}" href="${pHref(l.id)}"${l.id === activeId ? ' aria-current="page"' : ''}><span>${esc(CodeCraft.lessonLabel(l))}</span>${st.n ? `<em class="pt-acc ${pc(st.c, st.n) >= 70 ? 'good' : pc(st.c, st.n) >= 40 ? 'mid' : 'low'}">${pc(st.c, st.n)}%</em>` : ''}</a>`; }).join('')}`).join('')}
      </nav>`;
  }

  function renderPracticeHub() {
    const tot = practiceTotals(), mods = COURSE.modules.map(m => [m, m.lessons.filter(l => hasPractice(l.id))]).filter(x => x[1].length);
    const nGens = practiceTopics().reduce((a, id) => a + CodeCraft.practice.gens[id].length, 0);
    $('#main').innerHTML = `
      <section class="card home-hero tape">
        <div>
          <p class="eyebrow">${ICON('infinity')}Unlimited practice · ${practiceTopics().length} topics</p>
          <h1 class="home-title">Practise until it <em>sticks.</em></h1>
          <p class="sub">Every question is generated fresh, so you never run out. Each topic mixes the IB's command terms — identify, trace, construct, describe, compare, evaluate — and every answer comes with an explanation.</p>
          <div class="hero-actions">
            <a class="btn primary" href="${pHref('mix')}">${ICON('bolt')}Mixed practice</a>
            <a class="btn" href="${pHref('weak')}">${ICON('target')}My weakest topics</a>
            <a class="btn" href="#/review">${ICON('history')}My questions${H.order.length ? ` (${H.order.length})` : ''}</a>
          </div>
        </div>
        <div class="ring" id="ring">${ring(pc(tot.c, tot.n), 164, 12, 70)}<div class="ring-c"><b>${tot.n ? pc(tot.c, tot.n) + '%' : '–'}</b><span>${tot.n} answered</span></div></div>
      </section>
      <section class="stats" aria-label="Practice stats">
        <div class="card stat">${ICON('quiz')}<span class="stat-v">${tot.n}</span><span class="stat-l">Questions answered</span></div>
        <div class="card stat">${ICON('check')}<span class="stat-v">${tot.c}</span><span class="stat-l">Fully correct</span></div>
        <div class="card stat">${ICON('target')}<span class="stat-v">${tot.s}<small> / ${tot.m}</small></span><span class="stat-l">Marks earned</span></div>
        <div class="card stat">${ICON('table')}<span class="stat-v">${P.traces || 0}</span><span class="stat-l">Trace tables solved</span></div>
      </section>
      ${mods.map(([m, ls]) => `
        <section class="pmod" aria-labelledby="pm-${m.id}">
          <h2 class="h2" id="pm-${m.id}">${esc(m.title)} <span>${esc(m.ref)}</span></h2>
          <ol class="mods">${ls.map(l => { const st = topicStat(l.id), p = pc(st.c, st.n), g = CodeCraft.practice.gens[l.id];
            const kinds = [...new Set(g.map(x => ({ mcq: 'multiple choice', output: 'output', trace: 'trace tables', code: 'coding', written: 'written' })[x.kind]))];
            return `<li><a class="card mcard pcard ${st.n ? (p >= 70 ? 'done' : 'cur') : ''}" href="${pHref(l.id)}">
              <div class="m-top"><span class="m-code">${esc(l.ref)}</span><span class="m-state">${st.n ? `${p}% · ${st.n}` : 'New'}</span></div>
              <div class="m-title">${esc(l.title)}</div>
              <div class="m-bar"><i style="width:${p}%"></i></div>
              <div class="m-meta">${g.length} question types: ${kinds.join(', ')}</div></a></li>`; }).join('')}</ol>
        </section>`).join('')}
      <p class="pnote">${nGens} question generators across ${practiceTopics().length} topics. Questions are built from each subtopic's syllabus statement in the IB Computer Science guide (first assessment 2027), and every code answer has been checked by running it in Python.</p>`;
    const v = $('#ring .val');
    if (v) { const c = +v.dataset.c; v.style.transition = 'none'; v.style.strokeDashoffset = c; v.getBoundingClientRect(); v.style.transition = ''; v.style.strokeDashoffset = c * (1 - (+v.dataset.pct) / 100); }
  }

  let current = null, session = null;
  function renderPracticeTopic(id) {
    const all = practiceTopics();
    const single = hasPractice(id), l = single ? CodeCraft.findLesson(id) : null;
    if (!single && id !== 'mix' && id !== 'weak') { location.hash = '#/practice'; return; }
    session = { n: 0, c: 0, run: 0 };
    let pool = single ? [id] : id === 'weak' ? weakestTopics(5) : all;
    const weakEmpty = id === 'weak' && !pool.length;
    if (weakEmpty) pool = all;
    const title = single ? l.title : id === 'mix' ? 'Mixed practice' : 'My weakest topics';
    $('#main').innerHTML = `
      <div class="pr-wrap">
        <header class="pr-head">
          <div class="tags">
            <a class="tag" href="#/practice">${ICON('left')}All topics</a>
            ${single ? `<span class="tag tag-ref">${esc(l.ref)}</span>` : ''}
            <span class="tag">${ICON('infinity')}Unlimited</span>
          </div>
          <h1 class="lesson-title"><em>${esc(title)}</em></h1>
          <p class="lede">${single ? esc(l.blurb) : id === 'mix' ? 'Questions from every SL topic, one after another.' : weakEmpty ? 'Answer at least 3 questions on a topic first — until then, this mixes every topic.' : 'Questions from the topics where your accuracy is lowest: ' + pool.map(t => esc(CodeCraft.findLesson(t).ref)).join(', ') + '.'}</p>
          <div class="pr-session" id="prSession"></div>
        </header>
        <div id="qHost"></div>
        <div class="pr-next">
          <button class="btn primary" id="nextQ">${ICON('arrow')}<span>Skip</span></button>
          ${single ? `<a class="btn" href="${href(id)}">${ICON('book')}Back to the lesson</a>` : ''}
          <a class="btn" href="#/review${single ? '?topic=' + encodeURIComponent(id) : ''}">${ICON('history')}Review my answers</a>
        </div>
      </div>`;
    const sessionChips = () => {
      const st = single ? topicStat(id) : practiceTotals();
      $('#prSession').innerHTML = `<span class="chip-stat">This session: ${session.c} / ${session.n} correct</span>${session.run > 1 ? `<span class="chip-stat">${ICON('flame')}${session.run} in a row</span>` : ''}<span class="chip-stat">${single ? 'This topic' : 'Overall'}: ${st.n ? `${pc(st.c, st.n)}% of ${st.n} answered` : 'no answers yet'}</span>`;
    };
    const nextBtn = $('#nextQ');
    const next = () => {
      if (current) current.destroy();
      const topic = pool[Math.floor(Math.random() * pool.length)];
      const q = CodeCraft.practice.next(topic);
      q.topicRef = CodeCraft.findLesson(topic).ref;
      nextBtn.querySelector('span').textContent = 'Skip';
      nextBtn.classList.remove('primary');
      current = CodeCraft.practiceUI.render($('#qHost'), q, res => {
        recordResult(q, res);
        session.n++; if (res.ok) { session.c++; session.run++; } else session.run = 0;
        sessionChips();
        renderSidebar(id);
        nextBtn.querySelector('span').textContent = 'Next question';
        nextBtn.classList.add('primary');
        if (res.ok && session.run > 0 && session.run % 5 === 0) { confetti(nextBtn); toast(`${session.run} in a row — brilliant!`); }
        setTimeout(() => nextBtn.focus({ preventScroll: true }), 50);
      });
      window.scrollTo({ top: 0 });
    };
    nextBtn.addEventListener('click', next);
    sessionChips();
    next();
  }
  /* ================= MY QUESTIONS (review) ================= */
  const KINDS = { mcq: 'Multiple choice', output: 'Predict the output', trace: 'Trace table', code: 'Write code', written: 'Written answer' };
  const STATUS = { wrong: ['Wrong', 'x'], part: ['Part marks', 'x'], right: ['Correct', 'check'], fixed: ['Fixed', 'check'] };
  const fmtDate = t => new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const fmtTime = t => new Date(t).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  const qsOf = obj => new URLSearchParams(Object.entries(obj).filter(([, v]) => v && v !== 'all')).toString();
  const withQs = (path, obj) => { const qs = qsOf(obj); return path + (qs ? '?' + qs : ''); };
  let reviewFilter = {}; // remembered so "back" returns to the same filtered list
  function reviewItems(f) {
    return H.order.slice().reverse().map(id => [id, H.items[id]]).filter(([, it]) => it
      && (!f.topic || f.topic === 'all' || it.topic === f.topic)
      && (!f.kind || f.kind === 'all' || it.kind === f.kind)
      && (!f.status || f.status === 'all' || (f.status === 'wrong' ? isMistake(it) : !isMistake(it))));
  }
  const genFor = it => (CodeCraft.practice.gens[it.topic] || []).find(g => g.id === it.gen);
  function rebuild(it) {
    const gen = genFor(it), l = CodeCraft.findLesson(it.topic);
    if (!gen || !l) return null;
    const q = CodeCraft.practice.generate(gen, it.seed);
    q.topicRef = l.ref;
    return q;
  }

  function renderReview(f) {
    reviewFilter = f;
    const base = { topic: f.topic, kind: f.kind };
    const inScope = reviewItems(base), list = reviewItems(f);
    const nWrong = inScope.filter(([, it]) => isMistake(it)).length, nFixed = inScope.filter(([, it]) => itemStatus(it) === 'fixed').length;
    const topics = LESSONS.filter(l => H.order.some(id => H.items[id] && H.items[id].topic === l.id));
    const count = t => H.order.filter(id => H.items[id] && H.items[id].topic === t).length;
    const kinds = Object.keys(KINDS).filter(k => H.order.some(id => H.items[id] && H.items[id].kind === k));
    const status = f.status || 'all';
    if (!H.order.length) {
      $('#main').innerHTML = `<section class="card home-hero tape"><div><p class="eyebrow">${ICON('history')}My questions</p><h1 class="home-title">Nothing to review <em>yet.</em></h1>
        <p class="sub">Every practice question you answer is saved here — right or wrong — so you can look back at your answers, read the explanations again and retry your mistakes.</p>
        <div class="hero-actions"><a class="btn primary" href="#/practice">${ICON('infinity')}Start practising</a></div></div></section>`;
      return;
    }
    $('#main').innerHTML = `
      <section class="card home-hero tape">
        <div>
          <p class="eyebrow">${ICON('history')}My questions</p>
          <h1 class="home-title">Learn from your <em>mistakes.</em></h1>
          <p class="sub">Every practice question you've answered, with your answer, the right answer and the explanation. Open one to review it and try it again, or redo all your mistakes in one go.</p>
          <div class="hero-actions">
            ${nWrong ? `<a class="btn primary" href="${withQs('#/review/redo', base)}">${ICON('reset')}Redo ${nWrong} mistake${nWrong === 1 ? '' : 's'}</a>` : ''}
            <a class="btn" href="${f.topic && f.topic !== 'all' ? pHref(f.topic) : '#/practice'}">${ICON('infinity')}New questions</a>
          </div>
        </div>
      </section>
      <section class="stats" aria-label="Summary">
        <div class="card stat">${ICON('quiz')}<span class="stat-v">${inScope.length}</span><span class="stat-l">Questions answered</span></div>
        <div class="card stat">${ICON('check')}<span class="stat-v">${inScope.length - nWrong}</span><span class="stat-l">Correct now</span></div>
        <div class="card stat">${ICON('x')}<span class="stat-v">${nWrong}</span><span class="stat-l">Still to fix</span></div>
        <div class="card stat">${ICON('reset')}<span class="stat-v">${nFixed}</span><span class="stat-l">Wrong, then fixed</span></div>
      </section>
      <div class="card rv-tools">
        <label class="rv-field">Topic
          <select id="rvTopic"><option value="all">All topics (${H.order.length})</option>${topics.map(l => `<option value="${esc(l.id)}"${f.topic === l.id ? ' selected' : ''}>${esc(CodeCraft.lessonLabel(l))} (${count(l.id)})</option>`).join('')}</select></label>
        <label class="rv-field">Type
          <select id="rvKind"><option value="all">All types</option>${kinds.map(k => `<option value="${k}"${f.kind === k ? ' selected' : ''}>${KINDS[k]}</option>`).join('')}</select></label>
        <nav class="seg" aria-label="Filter by result">
          <a class="seg-b${status === 'all' ? ' on' : ''}" href="${withQs('#/review', { ...base })}"${status === 'all' ? ' aria-current="true"' : ''}>All <b>${inScope.length}</b></a>
          <a class="seg-b bad${status === 'wrong' ? ' on' : ''}" href="${withQs('#/review', { ...base, status: 'wrong' })}"${status === 'wrong' ? ' aria-current="true"' : ''}>${ICON('x')}Mistakes <b>${nWrong}</b></a>
          <a class="seg-b ok${status === 'right' ? ' on' : ''}" href="${withQs('#/review', { ...base, status: 'right' })}"${status === 'right' ? ' aria-current="true"' : ''}>${ICON('check')}Correct <b>${inScope.length - nWrong}</b></a>
        </nav>
      </div>
      ${list.length ? '<ol class="rv-list" id="rvList"></ol><div class="rv-more"></div>' : `<div class="card rv-empty">${status === 'wrong' ? 'No mistakes here — everything in this list is correct now.' : 'No questions match these filters.'}</div>`}`;
    $('#rvTopic').addEventListener('change', e => { location.hash = withQs('#/review', { ...f, topic: e.target.value }); });
    $('#rvKind').addEventListener('change', e => { location.hash = withQs('#/review', { ...f, kind: e.target.value }); });
    const row = ([id, it]) => {
      const st = itemStatus(it), last = it.attempts[it.attempts.length - 1], l = CodeCraft.findLesson(it.topic);
      return `<li><a class="card rv-item st-${st}" href="#/review/q/${encodeURIComponent(id)}">
        <span class="rv-st" title="${STATUS[st][0]}">${ICON(STATUS[st][1])}</span>
        <span class="rv-main"><span class="rv-top"><code>${esc(l ? l.ref : it.topic)}</code><span>${esc(l ? l.title : '')}</span><span class="rv-kind">${esc(it.term)} · ${KINDS[it.kind]}</span></span>
          <span class="rv-prev">${esc(it.preview)}</span></span>
        <span class="rv-side"><b>${last.score} / ${last.max}</b><small>${STATUS[st][0]}${it.attempts.length > 1 ? ` · ${it.attempts.length} tries` : ''}</small><small>${fmtDate(last.t)}</small></span></a></li>`;
    };
    let shown = 0;
    const more = () => {
      const ol = $('#rvList'), next = list.slice(shown, shown + 40);
      ol.insertAdjacentHTML('beforeend', next.map(row).join(''));
      shown += next.length;
      $('.rv-more').innerHTML = shown < list.length ? `<button class="btn">Show more (${list.length - shown} left)</button>` : '';
      const b = $('.rv-more button'); if (b) b.addEventListener('click', more);
    };
    if (list.length) more();
  }

  function renderReviewItem(id) {
    const it = H.items[id], back = withQs('#/review', reviewFilter);
    const q = it && rebuild(it);
    if (!it || !q) {
      $('#main').innerHTML = `<div class="card missing"><h1 class="lesson-title">Question not found</h1><p class="lede" style="margin:0 auto 18px">${it ? 'This question type has changed since you answered it, so it can\'t be rebuilt.' : 'It may have been removed from your history.'}</p><a class="btn primary" href="${back}">${ICON('left')}Back to My questions</a></div>`;
      return;
    }
    const l = CodeCraft.findLesson(it.topic), listIds = reviewItems(reviewFilter).map(x => x[0]);
    const after = listIds.slice(listIds.indexOf(id) + 1).concat(listIds.slice(0, listIds.indexOf(id)));
    const nextMistake = after.find(x => H.items[x] && isMistake(H.items[x]));
    $('#main').innerHTML = `
      <div class="pr-wrap">
        <header class="pr-head">
          <div class="tags"><a class="tag" href="${back}">${ICON('left')}My questions</a><span class="tag tag-ref">${esc(l.ref)}</span><span class="tag rv-badge" id="rvBadge"></span></div>
          <h1 class="lesson-title"><em>${esc(l.title)}</em></h1>
          <ol class="rv-attempts" id="rvAttempts" aria-label="Your attempts"></ol>
        </header>
        <div id="qHost"></div>
        <div class="pr-next">
          <button class="btn primary" id="retryQ">${ICON('reset')}<span>Try it again</span></button>
          <button class="btn" id="showQ" hidden>${ICON('history')}<span>Show my last answer</span></button>
          ${nextMistake ? `<a class="btn" href="#/review/q/${encodeURIComponent(nextMistake)}">${ICON('arrow')}Next mistake</a>` : ''}
          <a class="btn" href="${pHref(it.topic)}">${ICON('infinity')}New questions on this topic</a>
        </div>
      </div>`;
    const head = () => {
      const st = itemStatus(it);
      $('#rvBadge').className = 'tag rv-badge st-' + st;
      $('#rvBadge').innerHTML = ICON(STATUS[st][1]) + STATUS[st][0];
      $('#rvAttempts').innerHTML = it.attempts.map((a, i) => `<li class="${a.ok ? 'ok' : 'bad'}">${ICON(a.ok ? 'check' : 'x')}<span>${i === it.attempts.length - 1 && i ? 'Latest' : 'Try ' + (i + 1)} · ${a.score}/${a.max} · ${fmtTime(a.t)}</span></li>`).join('');
    };
    const showLast = () => {
      if (current) current.destroy();
      const last = it.attempts[it.attempts.length - 1];
      current = CodeCraft.practiceUI.render($('#qHost'), rebuild(it), () => {}, last.ans
        ? { replay: last.ans, banner: `${ICON('history')}Your ${it.attempts.length > 1 ? 'latest ' : ''}answer from ${fmtTime(last.t)} — ${last.ok ? 'correct' : `${last.score} / ${last.max} mark${last.max === 1 ? '' : 's'}`}` }
        : { banner: `${ICON('history')}Your answer to this one wasn't saved, but you can read the question and try it again.` });
      $('#retryQ').hidden = false; $('#showQ').hidden = true;
    };
    $('#retryQ').addEventListener('click', () => {
      if (current) current.destroy();
      const was = itemStatus(it), fresh = rebuild(it);
      current = CodeCraft.practiceUI.render($('#qHost'), fresh, res => {
        recordResult(fresh, res); head(); renderSidebar('review');
        toast(res.ok ? (was === 'right' || was === 'fixed' ? 'Correct again!' : 'Fixed — nice work!') : 'Not yet — read the explanation and try once more.');
        if (res.ok && was !== 'right' && was !== 'fixed') confetti($('#retryQ'));
        $('#retryQ').hidden = false; $('#retryQ span').textContent = 'Try it again';
      }, { banner: `${ICON('reset')}New attempt — your answer will be marked and saved` });
      $('#retryQ').hidden = true; $('#showQ').hidden = false;
      window.scrollTo({ top: 0 });
    });
    $('#showQ').addEventListener('click', showLast);
    head(); showLast();
  }

  function renderRedo(f) {
    const ids = reviewItems({ ...f, status: 'wrong' }).map(x => x[0]).reverse(); // oldest mistakes first
    const back = withQs('#/review', f), l = f.topic && f.topic !== 'all' ? CodeCraft.findLesson(f.topic) : null;
    if (!ids.length) {
      $('#main').innerHTML = `<div class="card missing"><h1 class="lesson-title">No mistakes to redo</h1><p class="lede" style="margin:0 auto 18px">Everything ${l ? 'in ' + esc(l.title) + ' ' : ''}is correct now.</p><a class="btn primary" href="${back}">${ICON('left')}Back to My questions</a></div>`;
      return;
    }
    let i = 0, fixedN = 0, answered = false;
    $('#main').innerHTML = `
      <div class="pr-wrap">
        <header class="pr-head">
          <div class="tags"><a class="tag" href="${back}">${ICON('left')}My questions</a>${l ? `<span class="tag tag-ref">${esc(l.ref)}</span>` : ''}</div>
          <h1 class="lesson-title"><em>Redo my mistakes</em></h1>
          <p class="lede">${ids.length} question${ids.length === 1 ? '' : 's'} you didn't get fully right${l ? ' in ' + esc(l.title) : ''}, oldest first.</p>
          <div class="rd-prog" aria-hidden="true"><i id="rdBar"></i></div>
          <div class="pr-session"><span class="chip-stat" id="rdCount"></span><span class="chip-stat" id="rdFixed"></span></div>
        </header>
        <div id="qHost"></div>
        <div class="pr-next"><button class="btn primary" id="nextQ">${ICON('arrow')}<span>Skip</span></button></div>
      </div>`;
    const nextBtn = $('#nextQ');
    const status = () => {
      $('#rdCount').textContent = `Question ${Math.min(i + 1, ids.length)} of ${ids.length}`;
      $('#rdFixed').textContent = `Fixed so far: ${fixedN}`;
      $('#rdBar').style.width = `${Math.round(i / ids.length * 100)}%`;
    };
    const show = () => {
      if (current) { current.destroy(); current = null; }
      if (i >= ids.length) {
        $('#rdBar').style.width = '100%';
        $('#qHost').innerHTML = `<div class="card rd-done tape"><h2 class="h2">You fixed ${fixedN} of ${ids.length}</h2><p>${fixedN === ids.length ? 'Every mistake is now correct — brilliant.' : 'The ones you missed stay in your Mistakes list, so you can come back to them.'}</p><div class="hero-actions"><a class="btn primary" href="${back}">${ICON('history')}Back to My questions</a><a class="btn" href="${l ? pHref(l.id) : '#/practice'}">${ICON('infinity')}New questions</a></div></div>`;
        nextBtn.hidden = true; $('#rdCount').textContent = 'Finished';
        if (fixedN) confetti($('.rd-done h2'));
        return;
      }
      const it = H.items[ids[i]], q = it && rebuild(it);
      if (!q) { i++; show(); return; }
      answered = false; status();
      nextBtn.querySelector('span').textContent = 'Skip'; nextBtn.classList.remove('primary');
      current = CodeCraft.practiceUI.render($('#qHost'), q, res => {
        answered = true; recordResult(q, res); renderSidebar('review');
        if (res.ok) fixedN++;
        status();
        nextBtn.querySelector('span').textContent = i + 1 < ids.length ? 'Next mistake' : 'Finish';
        nextBtn.classList.add('primary');
        setTimeout(() => nextBtn.focus({ preventScroll: true }), 50);
      }, { banner: `${ICON('reset')}You got this wrong before — have another go` });
      window.scrollTo({ top: 0 });
    };
    nextBtn.addEventListener('click', () => { i++; show(); });
    show();
  }

  addEventListener('keydown', e => {
    if (document.body.dataset.screen !== 'practice' || e.ctrlKey || e.metaKey || e.altKey || (e.target.closest && e.target.closest('input, textarea, .CodeMirror, select'))) return;
    if ((e.key === 'n' || e.key === 'N') && $('#nextQ')) { e.preventDefault(); $('#nextQ').click(); }
  });

  /* Phones: the editor sits below the lesson, so a floating button jumps between the two. */
  const fab = $('#fabEditor');
  let dockInView = false;
  new IntersectionObserver(([e]) => {
    dockInView = e.isIntersecting;
    fab.innerHTML = dockInView ? `${ICON('left', 'up')}Lesson` : `${ICON('code')}Editor`;
  }, { threshold: 0.3 }).observe($('#dock'));
  fab.addEventListener('click', () => {
    if (dockInView) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    $('#dock').scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (playground) setTimeout(() => playground.refresh(), 400);
  });

  /* ================= ROUTER ================= */
  const route = { lessonId: null, practice: null };
  function go(first) {
    const m = location.hash.match(/^#\/lesson\/(.+)$/), pm = location.hash.match(/^#\/practice(?:\/(.+))?$/);
    const rv = location.hash.match(/^#\/review(?:\/(q|redo))?(?:\/([^?]+))?(?:\?(.*))?$/);
    closeDrawer();
    if (current) { current.destroy(); current = null; }
    route.practice = null;
    document.body.dataset.sub = rv ? 'review' : '';
    if (rv) {
      route.lessonId = null;
      if (playground) { playground.destroy(); playground = null; }
      if (stepObserver) stepObserver.disconnect();
      document.body.dataset.screen = 'practice';
      $('#crumbs').innerHTML = '';
      route.practice = 'review';
      const f = Object.fromEntries(new URLSearchParams(rv[3] || ''));
      if (rv[1] === 'q') renderReviewItem(decodeURIComponent(rv[2] || ''));
      else if (rv[1] === 'redo') renderRedo(f);
      else renderReview(f);
      document.title = 'My questions · CodeCraft';
    } else if (pm) {
      route.lessonId = null;
      if (playground) { playground.destroy(); playground = null; }
      if (stepObserver) stepObserver.disconnect();
      document.body.dataset.screen = 'practice';
      $('#crumbs').innerHTML = '';
      const id = pm[1] ? decodeURIComponent(pm[1]) : null;
      route.practice = id || 'hub';
      if (id) renderPracticeTopic(id); else renderPracticeHub();
      const l = id && CodeCraft.findLesson(id);
      document.title = (l ? 'Practice: ' + CodeCraft.lessonLabel(l) : 'Practice') + ' · CodeCraft';
    } else if (m) {
      const id = decodeURIComponent(m[1]);
      route.lessonId = id;
      document.body.dataset.screen = 'lesson';
      renderLesson(id);
      $('#main').scrollTop = 0;
      const l = CodeCraft.findLesson(id);
      document.title = (l ? CodeCraft.lessonLabel(l) + ' · ' : '') + 'CodeCraft';
    } else {
      route.lessonId = null;
      if (playground) { playground.destroy(); playground = null; }
      if (stepObserver) stepObserver.disconnect();
      document.body.dataset.screen = 'home';
      $('#crumbs').innerHTML = '';
      const n = nextLesson(); if (n) openMods.add(n.module.id);
      renderHome();
      document.title = 'CodeCraft — IB Computer Science SL in Python';
    }
    renderSidebar(route.lessonId);
    renderChips();
    window.scrollTo(0, 0);
    if (!first) $('#main').focus({ preventScroll: true });
  }
  addEventListener('hashchange', () => go(false));
  go(true);
})();
