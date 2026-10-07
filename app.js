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
  const isDone = id => { const r = P.lessons[id]; return !!r && SECTIONS.every(s => r.sec && r.sec[s.key]); };
  function status(id) {
    if (isDone(id)) return 'done';
    const r = P.lessons[id];
    return r && (r.seen || Object.keys(r.sec || {}).some(k => r.sec[k])) ? 'started' : 'new';
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
    sb.innerHTML = treeHTML(activeId, 'sb') + `
      <div class="card side-note"><b>About CodeCraft</b>IB DP Computer Science SL, Theme B, in Python — following the Hodder textbook's order.</div>`;
    wireTree(sb);
  }

  /* Drawer (course menu on lesson pages and on phones) */
  const drawer = $('#drawer'), menuBtn = $('#menuBtn');
  function openDrawer() {
    const body = $('#drawerBody');
    body.innerHTML = treeHTML(route.lessonId, 'dr');
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

  /* Light / dark */
  function setMode(mode) {
    document.documentElement.dataset.mode = mode;
    $('#modeBtn').setAttribute('aria-label', mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }
  $('#modeBtn').addEventListener('click', () => {
    P.mode = document.documentElement.dataset.mode === 'dark' ? 'light' : 'dark';
    setMode(P.mode); save();
  });
  setMode(P.mode || 'light');

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
    const next = nextLesson(), s = streak(), fresh = !P.last && done === 0;
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
          </div>
        </div>
        <div class="ring" id="ring">${ring(pct, 164, 12, 70)}<div class="ring-c"><b>${pct}%</b><span>${done} of ${total} lessons</span></div></div>
      </section>

      <section class="stats" aria-label="Your stats">
        <div class="card stat">${ICON('book')}<span class="stat-v">${done}<small> / ${total}</small></span><span class="stat-l">Lessons complete</span></div>
        <div class="card stat">${ICON('quiz')}<span class="stat-v">${P.quiz && P.quiz.answered ? Math.round(P.quiz.correct / P.quiz.answered * 100) + '<small>%</small>' : '–'}</span><span class="stat-l">Quiz average</span></div>
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
            <p>Once you've answered some Check questions, the topics with your lowest quiz scores show up here.</p>
            <div class="anno">nothing to fix yet</div>
          </div>
          <div class="card mini">
            <h3>${ICON('bolt')}Paper 2 sprint</h3>
            <p>10 random questions from every module, against the clock. Part of the Review module.</p>
            <a class="btn sm" href="${href('review-2')}">${ICON('arrow')}Open</a>
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
      const beyond = l.module.beyond && l.module.lessons[l.module.lessons.length - 1].id === l.id
        ? `<div class="card beyond"><b>Beyond SL.</b> ${esc(l.module.beyond)}</div>` : '';
      return `<div class="card prose">
          <p class="soon-k">Notes coming soon</p>
          <h3>In this lesson</h3>
          <ul class="must">${l.must.map(m => `<li>${esc(m)}</li>`).join('')}</ul>
          <div class="anno">meanwhile, try the editor</div>
        </div>${beyond}`;
    }
    const cards = {
      try: ['Exercises coming soon', 'Auto-graded exercises',
        `<p>2–4 coding exercises with starter code and hints. Hidden tests mark your code as soon as you run it, and the model solution unlocks after 2 attempts.</p>${nob ? '<p>Includes a <strong>No built-ins</strong> version, because exam questions can ban <code>sort</code>, <code>pop</code>, <code>len</code>, <code>max</code> and <code>min</code>.</p>' : ''}`],
      trace: ['Trace table coming soon', 'Trace the code',
        '<p>Work through a program line by line, filling in each variable\'s value in a trace table. Each row is checked as you go.</p>'],
      check: ['Quiz coming soon', 'Five-question check',
        '<p>Every option comes with an explanation — why the right answer is right, and why each wrong one is wrong.</p>']
    }[key];
    return `<div class="card soon"><p class="soon-k">${cards[0]}</p><h3>${cards[1]}</h3>${cards[2]}</div>`;
  }

  function stepsNav(l) {
    const r = P.lessons[l.id] || { sec: {} };
    return `<nav class="steps" aria-label="Lesson sections">${SECTIONS.map((s, i) => {
      const d = r.sec && r.sec[s.key];
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
              <button class="btn sm mark${r.sec[s.key] ? ' done' : ''}" data-mark="${s.key}" aria-pressed="${!!r.sec[s.key]}">${r.sec[s.key] ? ICON('check') + 'Done' : 'Mark as done'}</button></header>
            ${placeholder(s.key, l)}
          </section>`).join('')}
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
  const route = { lessonId: null };
  function go(first) {
    const m = location.hash.match(/^#\/lesson\/(.+)$/);
    closeDrawer();
    if (m) {
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
