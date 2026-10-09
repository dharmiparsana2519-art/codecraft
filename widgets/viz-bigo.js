/* widgets/viz-bigo.js — Big O growth chart (B2.4.1). CodeCraft.viz.bigo(host).
   Steps against n for O(1), O(log n), O(n) and O(n²), up to an n you choose; zoom in to compare the slow-growing
   ones; hover (or use ← →) for the values at any n; and a table for your own n that shows what doubling it does.
   Colours: validated categorical slots 1–4 (blue, orange, aqua, yellow) for light and dark surfaces; light-mode aqua
   and yellow sit below 3:1, so every line is also direct-labelled and the values are in a table. */
window.CodeCraft = window.CodeCraft || {};

(function (CC) {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ICON = n => `<svg class="ic" aria-hidden="true"><use href="#i-${n}"/></svg>`;
  CC.viz = CC.viz || {};
  const SERIES = [
    { key: 'c', label: 'O(1)', f: () => 1, why: 'the same number of steps for any n' },
    { key: 'log', label: 'O(log n)', f: n => Math.log2(Math.max(1, n)), why: 'halving: doubling n adds one step' },
    { key: 'n', label: 'O(n)', f: n => n, why: 'one pass: doubling n doubles the steps' },
    { key: 'sq', label: 'O(n²)', f: n => n * n, why: 'a loop inside a loop: doubling n quadruples the steps' }
  ];
  const fmt = v => (v >= 1e6 ? v.toExponential(2).replace('e+', ' × 10^') : Number.isInteger(v) ? v.toLocaleString('en') : v.toFixed(2));
  const niceMax = v => { const p = Math.pow(10, Math.floor(Math.log10(v))); return [1, 2, 2.5, 5, 10].map(m => m * p).find(x => x >= v); };

  CC.viz.bigo = function (host) {
    host.innerHTML = `<section class="viz viz-bigo" aria-label="Big O growth chart">
      <header class="viz-head"><span class="viz-tag">${ICON('target')}Visualizer</span><h4>How the number of steps grows with n</h4><p>Drag the slider to make the input bigger. Zoom in to compare the slow-growing classes, and hover over the chart to read the values.</p></header>
      <div class="viz-controls">
        <label class="viz-field">n up to <input type="range" min="5" max="60" value="20" data-max aria-label="Largest n on the chart"> <b data-maxv>20</b></label>
        <label class="viz-check"><input type="checkbox" data-zoom> Zoom in (y-axis up to n)</label>
        <span class="viz-toggles">${SERIES.map((s, i) => `<label class="viz-check"><input type="checkbox" data-s="${i}" checked> <span class="viz-swatch s${i + 1}"></span>${s.label}</label>`).join('')}</span>
      </div>
      <div class="bigo-chart" tabindex="0" aria-label="Line chart of steps against n. Use the left and right arrow keys to read values."></div>
      <div class="bigo-legend">${SERIES.map((s, i) => `<span><span class="viz-swatch s${i + 1}"></span><b>${s.label}</b> — ${s.why}</span>`).join('')}</div>
      <div class="viz-controls"><label class="viz-field">Your n <input type="number" min="1" max="10000000" value="1000" data-n aria-label="Your own n"></label></div>
      <div class="tv-wrap"><table class="tv bigo-table"><thead><tr><th>Big O</th><th>steps for n</th><th>steps for 2n</th><th>doubling n multiplies the steps by</th></tr></thead><tbody></tbody></table></div>
    </section>`;
    const root = host.querySelector('.viz'), $ = s => root.querySelector(s), chart = $('.bigo-chart');
    // Drawn at the container's real width, so the text stays readable in a narrow column.
    let W = 640, H = 300, PW, PH;
    const M = { l: 46, r: 78, t: 14, b: 38 };
    let N = 20, zoom = false, on = SERIES.map(() => true), hoverN = null;

    function draw() {
      W = Math.max(300, Math.round(chart.clientWidth || 640)); H = Math.round(Math.max(220, Math.min(340, W * 0.58)));
      PW = W - M.l - M.r; PH = H - M.t - M.b;
      const yMax = zoom ? N : niceMax(N * N), ny = Math.max(2, N);
      const x = n => M.l + ((n - 1) / (ny - 1)) * PW, y = v => M.t + PH - (Math.min(v, yMax) / yMax) * PH;
      const yt = [0, 0.25, 0.5, 0.75, 1].map(f => f * yMax), xt = [1, ...[0.25, 0.5, 0.75].map(f => Math.round(1 + f * (ny - 1))), ny];
      const lines = SERIES.map((s, i) => {
        if (!on[i]) return '';
        const pts = []; for (let n = 1; n <= ny; n++) pts.push(`${x(n).toFixed(1)},${y(s.f(n)).toFixed(1)}`);
        return `<polyline class="bigo-line s${i + 1}" points="${pts.join(' ')}"/>`;
      }).join('');
      // Direct labels at the right end, pushed apart so they never collide.
      const labs = SERIES.map((s, i) => ({ i, s, v: s.f(ny), yy: y(s.f(ny)) })).filter(l => on[l.i]).sort((a, b) => a.yy - b.yy);
      for (let k = 1; k < labs.length; k++) if (labs[k].yy - labs[k - 1].yy < 14) labs[k].yy = labs[k - 1].yy + 14;
      const limit = M.t + PH + 4;
      if (labs.length && labs[labs.length - 1].yy > limit) { labs[labs.length - 1].yy = limit; for (let k = labs.length - 2; k >= 0; k--) labs[k].yy = Math.min(labs[k].yy, labs[k + 1].yy - 14); }
      const labels = labs.map(l => `<text class="bigo-lab" x="${x(ny) + 8}" y="${l.yy + 4}">${l.s.label}${l.v > yMax ? ' ↑' : ''}</text>`).join('');
      let hover = '';
      if (hoverN) {
        const hx = x(hoverN);
        hover = `<line class="bigo-cross" x1="${hx}" x2="${hx}" y1="${M.t}" y2="${M.t + PH}"/>` + SERIES.map((s, i) => (on[i] && s.f(hoverN) <= yMax ? `<circle class="bigo-dot s${i + 1}" cx="${hx}" cy="${y(s.f(hoverN))}" r="4.5"/>` : '')).join('');
      }
      chart.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Steps against n for ${SERIES.filter((s, i) => on[i]).map(s => s.label).join(', ')}">
        <defs><clipPath id="bigoClip"><rect x="${M.l}" y="${M.t - 2}" width="${PW + 2}" height="${PH + 4}"/></clipPath></defs>
        ${yt.map(v => `<line class="bigo-grid" x1="${M.l}" x2="${M.l + PW}" y1="${y(v)}" y2="${y(v)}"/><text class="bigo-tick" x="${M.l - 8}" y="${y(v) + 4}" text-anchor="end">${fmt(Math.round(v))}</text>`).join('')}
        ${xt.map(n => `<text class="bigo-tick" x="${x(n)}" y="${M.t + PH + 18}" text-anchor="middle">${n}</text>`).join('')}
        <text class="bigo-axis" x="${M.l + PW / 2}" y="${H - 4}" text-anchor="middle">n (size of the input)</text>
        <text class="bigo-axis" x="14" y="${M.t + PH / 2}" text-anchor="middle" transform="rotate(-90 14 ${M.t + PH / 2})">steps</text>
        <g clip-path="url(#bigoClip)">${lines}</g>${labels}${hover}
        <rect class="bigo-hit" x="${M.l}" y="${M.t}" width="${PW}" height="${PH}"/>
      </svg>${hoverN ? `<div class="bigo-tip" style="left:${(x(hoverN) / W) * 100}%"><b>n = ${hoverN}</b>${SERIES.map((s, i) => (on[i] ? `<span><span class="viz-swatch s${i + 1}"></span>${s.label}: ${fmt(Math.round(s.f(hoverN) * 100) / 100)}</span>` : '')).join('')}</div>` : ''}`;
      chart.querySelector('.bigo-hit').addEventListener('mousemove', e => {
        const r = e.currentTarget.getBoundingClientRect(), f = (e.clientX - r.left) / r.width;
        const n = Math.max(1, Math.min(ny, Math.round(1 + f * (ny - 1))));
        if (n !== hoverN) { hoverN = n; draw(); }
      });
      chart.querySelector('.bigo-hit').addEventListener('mouseleave', () => { hoverN = null; draw(); });
    }
    function table() {
      const n = Math.max(1, Math.min(1e7, Math.floor(+$('[data-n]').value || 1)));
      $('.bigo-table tbody').innerHTML = SERIES.map((s, i) => {
        const a = s.f(n), b = s.f(2 * n), k = b / a;
        return `<tr><td><span class="viz-swatch s${i + 1}"></span><b>${s.label}</b></td><td>${fmt(Math.round(a * 100) / 100)}</td><td>${fmt(Math.round(b * 100) / 100)}</td><td>×${k === 1 ? '1 (no change)' : fmt(Math.round(k * 100) / 100)}${i === 1 ? ' (just one more step)' : ''}</td></tr>`;
      }).join('');
    }
    $('[data-max]').addEventListener('input', e => { N = +e.target.value; $('[data-maxv]').textContent = N; hoverN = null; draw(); });
    $('[data-zoom]').addEventListener('change', e => { zoom = e.target.checked; draw(); });
    root.querySelectorAll('[data-s]').forEach(c => c.addEventListener('change', () => { on[+c.dataset.s] = c.checked; draw(); }));
    $('[data-n]').addEventListener('input', table);
    chart.addEventListener('keydown', e => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      hoverN = Math.max(1, Math.min(N, (hoverN || 1) + (e.key === 'ArrowRight' ? 1 : -1)));
      draw();
    });
    draw(); table();
    if (window.ResizeObserver) { let lastW = 0; new ResizeObserver(() => { const w = Math.round(chart.clientWidth); if (Math.abs(w - lastW) > 4) { lastW = w; draw(); } }).observe(chart); }
    return { draw, table, SERIES };
  };
})(window.CodeCraft);
