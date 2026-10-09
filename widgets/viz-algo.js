/* widgets/viz-algo.js — binary search (B2.4.2) and bubble / selection sort (B2.4.3) visualizers.
   CodeCraft.viz.bsearch(host) and CodeCraft.viz.sort(host). Both take your own list, are worked out in advance as a
   list of frames, and play them with Back / Step / Play, a speed slider and live counters — every frame says what was
   compared and why the algorithm did what it did. */
window.CodeCraft = window.CodeCraft || {};

(function (CC) {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ICON = n => `<svg class="ic" aria-hidden="true"><use href="#i-${n}"/></svg>`;
  CC.viz = CC.viz || {};

  // Your list: numbers if every item is a number, otherwise strings.
  function parseList(text) {
    const parts = String(text).split(',').map(s => s.trim()).filter(Boolean);
    const nums = parts.length && parts.every(p => /^-?\d+(\.\d+)?$/.test(p));
    return nums ? parts.map(Number) : parts;
  }
  const show = v => (typeof v === 'string' ? `"${v}"` : String(v));
  const isSorted = a => a.every((v, i) => i === 0 || a[i - 1] <= v);

  // Back / Step / Play / speed for a list of frames.
  function player(root, onFrame) {
    let frames = [], i = 0, timer = null;
    const $ = s => root.querySelector(s);
    const stop = () => { clearInterval(timer); timer = null; $('[data-play]').innerHTML = `${ICON('play')}Play`; };
    const go = k => { i = Math.max(0, Math.min(frames.length - 1, k)); onFrame(frames[i], i, frames); $('[data-back]').disabled = i === 0; $('[data-step]').disabled = i >= frames.length - 1; if (i >= frames.length - 1) stop(); };
    const delay = () => 1700 - 15 * (+$('[data-speed]').value || 50);
    root.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b) return;
      if ('back' in b.dataset) { stop(); go(i - 1); }
      else if ('step' in b.dataset) { stop(); go(i + 1); }
      else if ('play' in b.dataset) {
        if (timer) { stop(); return; }
        if (i >= frames.length - 1) go(0);
        b.innerHTML = `${ICON('stop')}Pause`;
        timer = setInterval(() => go(i + 1), delay());
      }
    });
    $('[data-speed]').addEventListener('input', () => { if (timer) { clearInterval(timer); timer = setInterval(() => go(i + 1), delay()); } });
    return { load(f) { stop(); frames = f; go(0); }, last() { go(frames.length - 1); }, get frames() { return frames; }, get index() { return i; } };
  }
  const PLAYER = `<div class="viz-player" role="group" aria-label="Playback">
      <button class="btn sm" type="button" data-back>${ICON('left')}Back</button>
      <button class="btn sm primary" type="button" data-step>Step${ICON('arrow')}</button>
      <button class="btn sm" type="button" data-play>${ICON('play')}Play</button>
      <label class="viz-field viz-speed">Speed <input type="range" min="0" max="100" value="50" data-speed aria-label="Speed"></label>
    </div>`;

  /* ---------------- binary search ---------------- */
  function searchFrames(a, target) {
    const frames = [], rows = [];
    let low = 0, high = a.length - 1, checks = 0;
    frames.push({ low, high, mid: null, rows: [], checks, say: `Start: <code>low = 0</code> and <code>high = ${high}</code> — the whole list could hold ${show(target)}.` });
    while (low <= high) {
      const mid = Math.floor((low + high) / 2), v = a[mid];
      checks++;
      const cmp = v === target ? '=' : v < target ? '<' : '>';
      rows.push([low, high, mid, show(v), cmp === '=' ? 'found' : cmp === '<' ? `< ${show(target)}` : `> ${show(target)}`]);
      let say = `<code>mid = (${low} + ${high}) // 2 = ${mid}</code>; <code>items[${mid}]</code> is ${esc(show(v))}. `;
      if (cmp === '=') {
        frames.push({ low, high, mid, found: mid, rows: rows.slice(), checks, say: say + `That's the target: <b>found at index ${mid}</b> after ${checks} comparison${checks > 1 ? 's' : ''}. A linear search would have needed ${mid + 1}.` });
        return frames;
      }
      say += cmp === '<' ? `${esc(show(v))} &lt; ${esc(show(target))}, so the target can only be to the <b>right</b>: <code>low = ${mid + 1}</code>.` : `${esc(show(v))} &gt; ${esc(show(target))}, so the target can only be to the <b>left</b>: <code>high = ${mid - 1}</code>.`;
      frames.push({ low, high, mid, rows: rows.slice(), checks, say });
      if (cmp === '<') low = mid + 1; else high = mid - 1;
    }
    frames.push({ low, high, mid: null, notFound: true, rows: rows.slice(), checks, say: `Now <code>low</code> (${low}) is greater than <code>high</code> (${high}): nothing is left to search, so it returns <b>-1</b> — ${esc(show(target))} isn't in the list. ${checks} comparison${checks === 1 ? '' : 's'}; a linear search would have checked all ${a.length}.` });
    return frames;
  }

  CC.viz.bsearch = function (host) {
    host.innerHTML = `<section class="viz viz-bsearch" aria-label="Binary search visualizer">
      <header class="viz-head"><span class="viz-tag">${ICON('target')}Visualizer</span><h4>Binary search: low, mid and high</h4><p>Enter a <b>sorted</b> list and a target. Each step looks at the middle item and throws away the half that can't contain the target.</p></header>
      <div class="viz-controls">
        <label class="viz-field viz-wide">List <input type="text" data-list value="3, 8, 15, 21, 27, 34, 42, 56, 63, 71, 88" aria-label="Sorted list, separated by commas"></label>
        <label class="viz-field">Target <input type="text" data-target value="56" size="6" aria-label="Target"></label>
        <button class="btn sm" type="button" data-apply>${ICON('reset')}Search</button>
      </div>
      ${PLAYER}
      <div class="viz-stage"></div>
      <p class="viz-say" aria-live="polite"></p>
      <div class="viz-counters"></div>
      <div class="tv-wrap"><table class="tv viz-table"><thead><tr><th>low</th><th>high</th><th>mid</th><th>items[mid]</th><th>compared</th></tr></thead><tbody></tbody></table></div>
    </section>`;
    const root = host.querySelector('.viz'), $ = s => root.querySelector(s);
    let a = [];
    const p = player(root, f => {
      $('.viz-stage').innerHTML = `<div class="bs-row">${a.map((v, i) => {
        const out = i < f.low || i > f.high, cls = [out ? 'out' : 'in', i === f.mid ? 'mid' : '', i === f.found ? 'found' : ''].join(' ');
        const lab = [i === f.low && !out ? 'low' : '', i === f.mid ? 'mid' : '', i === f.high && !out ? 'high' : ''].filter(Boolean).join(' ');
        return `<div class="viz-cell ${cls}"><span class="viz-val">${esc(show(v))}</span><span class="viz-idx">[${i}]</span><span class="viz-marks">${lab ? `<b class="viz-mk ${lab.split(' ')[0]}">${lab}</b>` : ''}</span></div>`;
      }).join('')}</div>`;
      $('.viz-say').innerHTML = f.say;
      $('.viz-counters').innerHTML = `<span class="viz-count"><b>${f.checks}</b> comparison${f.checks === 1 ? '' : 's'}</span><span class="viz-count">low = <b>${f.low}</b></span><span class="viz-count">high = <b>${f.high}</b></span>`;
      $('.viz-table tbody').innerHTML = f.rows.map(r => `<tr>${r.map(c => `<td><code>${esc(String(c))}</code></td>`).join('')}</tr>`).join('');
    });
    const apply = () => {
      a = parseList($('[data-list]').value);
      const raw = $('[data-target]').value.trim(), target = typeof a[0] === 'number' && /^-?\d+(\.\d+)?$/.test(raw) ? Number(raw) : raw;
      if (a.length < 2 || !raw) { $('.viz-say').innerHTML = 'Enter at least two items and a target.'; return; }
      if (a.length > 20) a = a.slice(0, 20);
      if (!isSorted(a)) {
        $('.viz-stage').innerHTML = '';
        $('.viz-say').innerHTML = `This list isn't sorted, and binary search only works on sorted data — it would throw away the wrong half. <button class="link-btn" type="button" data-sortit>Sort it for me</button>`;
        return;
      }
      p.load(searchFrames(a, target));
    };
    root.addEventListener('click', e => {
      if (e.target.closest('[data-apply]')) apply();
      if (e.target.closest('[data-sortit]')) { const s = parseList($('[data-list]').value).sort((x, y) => (x < y ? -1 : x > y ? 1 : 0)); $('[data-list]').value = s.join(', '); apply(); }
    });
    root.querySelectorAll('[data-list], [data-target]').forEach(i => i.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); apply(); } }));
    apply();
    return { apply, player: p, frames: (list, t) => searchFrames(list, t) };
  };

  /* ---------------- bubble and selection sort ---------------- */
  function sortFrames(input, alg) {
    const a = input.slice(), n = a.length, frames = [], done = new Set();
    let comps = 0, swaps = 0, passes = 0;
    const push = (o, say) => frames.push(Object.assign({ arr: a.slice(), done: new Set(done), comps, swaps, passes, say }, o));
    push({}, `The list to sort: ${n} items. ${alg === 'selection' ? 'Each pass finds the smallest remaining item and swaps it to the front.' : 'Each pass compares neighbours and swaps any pair in the wrong order.'}`);
    if (alg === 'selection') {
      for (let i = 0; i < n - 1; i++) {
        passes++;
        let s = i;
        push({ cur: i, min: s }, `<b>Pass ${passes}</b>: find the smallest item from index ${i} on. Start with <code>smallest = ${i}</code> (${a[i]}).`);
        for (let j = i + 1; j < n; j++) {
          comps++;
          const smaller = a[j] < a[s];
          push({ cur: i, min: s, cmp: [j, s] }, `Compare <code>items[${j}]</code> = ${a[j]} with the smallest so far, ${a[s]}: ${smaller ? `${a[j]} is smaller, so <code>smallest = ${j}</code>.` : 'not smaller.'}`);
          if (smaller) s = j;
        }
        if (s !== i) { swaps++; [a[i], a[s]] = [a[s], a[i]]; }
        done.add(i);
        push({ cur: i, swap: s !== i ? [i, s] : null }, s !== i ? `Swap the smallest (${a[i]}) into position ${i}. One swap per pass.` : `The smallest is already at position ${i}, so no swap is needed.`);
      }
      for (let k = 0; k < n; k++) done.add(k);
      push({}, `<b>Sorted.</b> ${comps} comparisons — always n(n − 1)/2 = ${n * (n - 1) / 2} for selection sort, however the data starts — and ${swaps} swap${swaps === 1 ? '' : 's'}.`);
      return frames;
    }
    for (let i = 0; i < n - 1; i++) {
      passes++;
      let swapped = false;
      push({}, `<b>Pass ${passes}</b>: compare neighbours from index 0 to ${n - 2 - i}${i ? ` (the last ${i} item${i > 1 ? 's are' : ' is'} already in place)` : ''}.`);
      for (let j = 0; j < n - 1 - i; j++) {
        comps++;
        const wrong = a[j] > a[j + 1];
        push({ cmp: [j, j + 1] }, `Compare <code>items[${j}]</code> = ${a[j]} and <code>items[${j + 1}]</code> = ${a[j + 1]}: ${wrong ? `${a[j]} &gt; ${a[j + 1]}, the wrong order — swap them.` : 'in order — leave them.'}`);
        if (wrong) { swaps++; swapped = true; [a[j], a[j + 1]] = [a[j + 1], a[j]]; push({ swap: [j, j + 1] }, `Swapped: now ${a[j]}, ${a[j + 1]}.`); }
      }
      done.add(n - 1 - i);
      if (alg === 'early' && !swapped) {
        for (let k = 0; k < n; k++) done.add(k);
        push({}, `<b>No swaps in pass ${passes}</b>, so every pair is in order: the list is sorted — stop early. ${comps} comparisons instead of ${n * (n - 1) / 2}.`);
        return frames;
      }
      push({}, `End of pass ${passes}: the largest remaining item, ${a[n - 1 - i]}, has bubbled to position ${n - 1 - i}.`);
    }
    for (let k = 0; k < n; k++) done.add(k);
    push({}, `<b>Sorted.</b> ${comps} comparisons and ${swaps} swap${swaps === 1 ? '' : 's'} in ${passes} pass${passes === 1 ? '' : 'es'}.`);
    return frames;
  }

  CC.viz.sort = function (host) {
    host.innerHTML = `<section class="viz viz-sort" aria-label="Sorting visualizer">
      <header class="viz-head"><span class="viz-tag">${ICON('target')}Visualizer</span><h4>Bubble and selection sort, step by step</h4><p>Use your own numbers (up to 14), choose an algorithm, and step or play through it. Try a nearly sorted list with early-exit bubble sort.</p></header>
      <div class="viz-controls">
        <label class="viz-field viz-wide">Numbers <input type="text" data-list value="34, 12, 45, 7, 23, 56, 18" aria-label="Numbers to sort, separated by commas"></label>
        <label class="viz-field">Algorithm <select data-alg aria-label="Algorithm"><option value="bubble">Bubble sort</option><option value="early">Bubble sort (early exit)</option><option value="selection">Selection sort</option></select></label>
        <button class="btn sm" type="button" data-random>Random</button>
        <button class="btn sm" type="button" data-apply>${ICON('reset')}Start</button>
      </div>
      ${PLAYER}
      <div class="viz-counters"></div>
      <div class="viz-stage"></div>
      <p class="viz-say" aria-live="polite"></p>
    </section>`;
    const root = host.querySelector('.viz'), $ = s => root.querySelector(s);
    const p = player(root, f => {
      const max = Math.max(...f.arr.map(Math.abs), 1);
      $('.viz-stage').innerHTML = `<div class="sort-bars">${f.arr.map((v, i) => {
        const cls = [f.done.has(i) ? 'done' : '', f.cmp && f.cmp.includes(i) ? 'cmp' : '', f.swap && f.swap.includes(i) ? 'swap' : '', f.min === i ? 'min' : ''].join(' ');
        return `<div class="sort-bar ${cls}"><span class="sort-fill" style="height:${Math.max(6, Math.round(Math.abs(v) / max * 100))}%"></span><span class="sort-v">${esc(String(v))}</span><span class="viz-idx">[${i}]</span></div>`;
      }).join('')}</div><div class="viz-legend"><span class="lg cmp"></span>compared <span class="lg swap"></span>swapped <span class="lg done"></span>in its final place${$('[data-alg]').value === 'selection' ? ' <span class="lg min"></span>smallest so far' : ''}</div>`;
      $('.viz-say').innerHTML = f.say;
      $('.viz-counters').innerHTML = `<span class="viz-count"><b>${f.comps}</b> comparison${f.comps === 1 ? '' : 's'}</span><span class="viz-count"><b>${f.swaps}</b> swap${f.swaps === 1 ? '' : 's'}</span><span class="viz-count">pass <b>${f.passes}</b></span>`;
    });
    const apply = () => {
      const a = parseList($('[data-list]').value).filter(v => typeof v === 'number').slice(0, 14);
      if (a.length < 2) { $('.viz-say').innerHTML = 'Enter at least two numbers, separated by commas.'; return; }
      p.load(sortFrames(a, $('[data-alg]').value));
    };
    root.addEventListener('click', e => {
      if (e.target.closest('[data-apply]')) apply();
      if (e.target.closest('[data-random]')) { $('[data-list]').value = Array.from({ length: 8 }, () => 5 + Math.floor(Math.random() * 90)).join(', '); apply(); }
    });
    $('[data-alg]').addEventListener('change', apply);
    $('[data-list]').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); apply(); } });
    apply();
    return { apply, player: p, frames: (list, alg) => sortFrames(list, alg) };
  };
})(window.CodeCraft);
