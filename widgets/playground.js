/* widgets/playground.js — reusable code playground: editor, Run/Stop, console with in-console input(),
   Files panel and friendly error messages.
   const pg = CodeCraft.Playground(hostElement, {
     code, starter,            current code and the code Reset goes back to
     files,                    { name: text } virtual files the program starts with
     filename,                 label on the editor tab (default "main.py")
     onCodeChange(code),       called (debounced) while typing — use it to save drafts
     onRun(result)             called after every run with { ok, error, files, ms }
   });
   pg.getCode(), pg.setCode(code), pg.setFiles(files), pg.run(), pg.destroy() */
window.CodeCraft = window.CodeCraft || {};

(function () {
  const ICON = name => `<svg class="ic" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const lineCount = t => (t ? t.replace(/\n$/, '').split('\n').length : 0);

  CodeCraft.Playground = function (host, opts = {}) {
    const starter = opts.starter != null ? opts.starter : (opts.code || '');
    let startFiles = Object.assign({}, opts.files || {});
    let files = Object.assign({}, startFiles);
    let changed = new Set();
    let openFile = Object.keys(files)[0] || null;
    let running = false;
    let errLine = null;

    const root = document.createElement('div');
    root.className = 'card playground';
    root.innerHTML = `
      <div class="pg-head">
        <div class="pg-tabs" role="tablist" aria-label="Editor views">
          <button class="pg-tab on" data-view="code" role="tab" aria-selected="true">${ICON('file')}<span>${esc(opts.filename || 'main.py')}</span></button>
          <button class="pg-tab" data-view="files" role="tab" aria-selected="false">Files <span class="count" data-files-count>0</span></button>
        </div>
        <div class="pg-actions">
          <button class="btn sm" data-act="reset" title="Go back to the starting code (Ctrl+Z undoes this)">${ICON('reset')}Reset</button>
          <button class="btn sm primary" data-act="run" title="Run (Ctrl+Enter)">${ICON('play')}<span>Run</span></button>
        </div>
      </div>
      <div class="pg-views">
        <div class="pg-editor"></div>
        <div class="pg-files" hidden></div>
      </div>
      <div class="pg-console">
        <div class="con-head">Console
          <button class="con-clear" data-act="clear">Clear</button>
          <span class="status"><i></i><span>Ready</span></span>
        </div>
        <div class="con-body" aria-live="polite"><div class="con-hint">Press <kbd>Run</kbd> or <kbd>Ctrl</kbd>+<kbd>Enter</kbd>. When the program asks a question, type your answer here.</div></div>
      </div>`;
    host.appendChild(root);

    const $ = s => root.querySelector(s);
    const editorEl = $('.pg-editor'), filesEl = $('.pg-files'), con = $('.con-body'), statusEl = $('.status');
    const runBtn = $('[data-act=run]');

    /* ---------- editor (CodeMirror 5, or a textarea if the CDN is unreachable) ---------- */
    let cm = null, ta = null, saveTimer = null;
    const changedCode = () => {
      clearErrLine();
      if (!opts.onCodeChange) return;
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => opts.onCodeChange(getCode()), 400);
    };
    if (window.CodeMirror) {
      cm = CodeMirror(editorEl, {
        value: opts.code != null ? opts.code : starter,
        mode: { name: 'python', version: 3 },
        lineNumbers: true, indentUnit: 4, tabSize: 4, indentWithTabs: false, matchBrackets: true,
        lineWrapping: false, viewportMargin: 50,
        extraKeys: {
          Tab: c => c.somethingSelected() ? c.indentSelection('add') : c.replaceSelection('    ', 'end'),
          'Shift-Tab': c => c.indentSelection('subtract'),
          'Ctrl-Enter': () => run(), 'Cmd-Enter': () => run()
        }
      });
      cm.on('change', changedCode);
    } else {
      ta = document.createElement('textarea');
      ta.className = 'pg-textarea'; ta.spellcheck = false; ta.setAttribute('aria-label', 'Python code');
      ta.value = opts.code != null ? opts.code : starter;
      ta.addEventListener('keydown', e => {
        if (e.key === 'Tab') {
          e.preventDefault();
          const s = ta.selectionStart;
          ta.setRangeText('    ', s, ta.selectionEnd, 'end');
          changedCode();
        } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); run(); }
      });
      ta.addEventListener('input', changedCode);
      editorEl.appendChild(ta);
    }
    function getCode() { return cm ? cm.getValue() : ta.value; }
    function setCode(code) {
      if (cm) cm.replaceRange(code, { line: 0, ch: 0 }, { line: cm.lastLine(), ch: cm.getLine(cm.lastLine()).length });
      else { ta.value = code; }
      changedCode();
    }
    function markErrLine(n) {
      clearErrLine();
      if (!cm || !n) return;
      errLine = cm.addLineClass(n - 1, 'background', 'cm-errline');
    }
    function clearErrLine() { if (cm && errLine) { cm.removeLineClass(errLine, 'background', 'cm-errline'); errLine = null; } }
    function goToLine(n) {
      showView('code');
      if (cm) { cm.setCursor({ line: n - 1, ch: 0 }); cm.focus(); cm.scrollIntoView({ line: n - 1, ch: 0 }, 60); }
      else {
        const lines = ta.value.split('\n'); let pos = 0;
        for (let i = 0; i < n - 1 && i < lines.length; i++) pos += lines[i].length + 1;
        ta.focus(); ta.setSelectionRange(pos, pos + (lines[n - 1] || '').length);
      }
    }

    /* ---------- views: code / files ---------- */
    function showView(v) {
      root.querySelectorAll('.pg-tab').forEach(t => { const on = t.dataset.view === v; t.classList.toggle('on', on); t.setAttribute('aria-selected', on); });
      editorEl.hidden = v !== 'code';
      filesEl.hidden = v !== 'files';
      if (v === 'code' && cm) cm.refresh();
      if (v === 'files') renderFiles();
    }
    root.querySelectorAll('.pg-tab').forEach(t => t.addEventListener('click', () => showView(t.dataset.view)));

    function renderFiles() {
      const names = Object.keys(files);
      $('[data-files-count]').textContent = names.length;
      if (!names.length) {
        filesEl.innerHTML = `<div class="files-empty">No files yet. A program that runs <code>open("notes.txt", "w")</code> will create one here.</div>`;
        return;
      }
      if (!openFile || !(openFile in files)) openFile = names[0];
      filesEl.innerHTML = `
        <div class="files-top"><span>Virtual files — they live in this page only.</span><button class="btn sm" data-act="reset-files">${ICON('reset')}Reset files</button></div>
        <ul class="file-list">${names.map(n => `
          <li><button class="file${n === openFile ? ' on' : ''}" data-file="${esc(n)}">${ICON('file')}<span>${esc(n)}</span>
            ${changed.has(n) ? `<em class="file-badge">${n in startFiles ? 'changed' : 'new'}</em>` : ''}
            <small>${lineCount(files[n])} line${lineCount(files[n]) === 1 ? '' : 's'}</small></button></li>`).join('')}
        </ul>
        <pre class="file-pre" aria-label="Contents of ${esc(openFile)}">${esc(files[openFile]) || '<span class="muted">(empty file)</span>'}</pre>`;
      filesEl.querySelectorAll('[data-file]').forEach(b => b.addEventListener('click', () => { openFile = b.dataset.file; renderFiles(); }));
      filesEl.querySelector('[data-act=reset-files]').addEventListener('click', () => { files = Object.assign({}, startFiles); changed = new Set(); renderFiles(); setStatus('', 'Files reset'); });
    }

    /* ---------- console ---------- */
    let outEl = null;
    function clearConsole() { con.innerHTML = ''; outEl = null; }
    function write(text) {
      if (!outEl) { outEl = document.createElement('div'); outEl.className = 'con-out'; con.appendChild(outEl); }
      outEl.appendChild(document.createTextNode(text));
      con.scrollTop = con.scrollHeight;
    }
    function askInput(prompt) {
      if (prompt) write(String(prompt));
      setStatus('wait', 'Waiting for input…');
      return new Promise(resolve => {
        if (!outEl) write('');
        const inp = document.createElement('input');
        inp.className = 'con-input'; inp.autocomplete = 'off'; inp.spellcheck = false;
        inp.setAttribute('aria-label', prompt ? 'Answer: ' + prompt : 'Program input');
        outEl.appendChild(inp);
        inp.focus({ preventScroll: true });
        con.scrollTop = con.scrollHeight;
        inp.addEventListener('keydown', e => {
          if (e.key !== 'Enter') return;
          e.preventDefault();
          const v = inp.value;
          const echo = document.createElement('span'); echo.className = 'con-echo'; echo.textContent = v;
          inp.replaceWith(echo); write('\n');
          setStatus('run', 'Running…');
          resolve(v);
        });
      });
    }
    function setStatus(kind, text) { statusEl.className = 'status' + (kind ? ' ' + kind : ''); statusEl.lastElementChild.textContent = text; }
    function setRunning(on) {
      running = on;
      root.classList.toggle('is-running', on);
      runBtn.innerHTML = on ? `${ICON('stop')}<span>Stop</span>` : `${ICON('play')}<span>Run</span>`;
      runBtn.title = on ? 'Stop the program' : 'Run (Ctrl+Enter)';
    }
    function showError(err) {
      con.querySelectorAll('.con-input').forEach(i => { i.disabled = true; i.placeholder = '—'; });
      if (err.type === 'Stopped') { setStatus('err', 'Stopped'); write(''); con.insertAdjacentHTML('beforeend', '<div class="con-note">Program stopped.</div>'); return; }
      setStatus('err', err.type);
      const where = err.line ? ` <button class="con-line-link" data-line="${err.line}">line ${err.line}</button>` : '';
      con.insertAdjacentHTML('beforeend', `<div class="con-err">${esc(err.type)}: ${esc(err.message)}${err.line ? ' —' : ''}${where}</div>`);
      const f = CodeCraft.runner.explain(err, getCode());
      if (f) {
        let link = '';
        if (f.link && CodeCraft.findLesson) {
          const l = CodeCraft.findLesson(f.link);
          const notes = CodeCraft.lessons && CodeCraft.lessons[f.link] && CodeCraft.lessons[f.link].learn;
          const practice = CodeCraft.practice && CodeCraft.practice.gens[f.link] && CodeCraft.practice.gens[f.link].length;
          // Until a lesson has notes, send the student to its practice questions (which have explanations) instead.
          if (l && notes) link = ` <a class="friendly-link" href="#/lesson/${encodeURIComponent(l.id)}">Revise ${esc(CodeCraft.lessonLabel(l))} →</a>`;
          else if (l && practice) link = ` <a class="friendly-link" href="#/practice/${encodeURIComponent(l.id)}">Practise ${esc(CodeCraft.lessonLabel(l))} →</a>`;
        }
        con.insertAdjacentHTML('beforeend', `<div class="friendly"><b>What does this mean?</b> ${f.text}${link}</div>`);
      }
      const b = con.querySelector('.con-line-link:last-of-type');
      if (b) b.addEventListener('click', () => goToLine(+b.dataset.line));
      markErrLine(err.line);
      con.scrollTop = con.scrollHeight;
    }

    /* ---------- run ---------- */
    async function run() {
      if (running) { CodeCraft.runner.stop(); return; }
      if (CodeCraft.runner.running) CodeCraft.runner.stop(); // another playground is mid-run
      showView('code');
      clearConsole(); clearErrLine();
      setRunning(true); setStatus('run', 'Running…');
      const before = Object.assign({}, files);
      const res = await CodeCraft.runner.run(getCode(), { onOutput: write, onInput: askInput, files });
      setRunning(false);
      files = res.files || files;
      Object.keys(files).forEach(n => { if (before[n] !== files[n]) changed.add(n); });
      renderFiles();
      if (res.ok) {
        if (!con.textContent.trim()) con.insertAdjacentHTML('beforeend', '<div class="con-note">The program finished without printing anything.</div>');
        setStatus('ok', `Finished · ${(res.ms / 1000).toFixed(2)} s`);
      } else {
        showError(res.error);
      }
      if (opts.onRun) opts.onRun(res);
    }

    runBtn.addEventListener('click', run);
    $('[data-act=reset]').addEventListener('click', () => { setCode(starter); setStatus('', 'Code reset — Ctrl+Z to undo'); if (cm) cm.focus(); });
    $('[data-act=clear]').addEventListener('click', () => { if (!running) { clearConsole(); setStatus('', 'Ready'); } });
    renderFiles();

    return {
      el: root, run, getCode, setCode,
      // Replace the virtual files (e.g. when the notes load a program that reads scores.txt); Reset files returns to these.
      setFiles(f) { startFiles = Object.assign({}, f || {}); files = Object.assign({}, startFiles); changed = new Set(); openFile = Object.keys(files)[0] || null; renderFiles(); },
      refresh() { if (cm) cm.refresh(); },
      destroy() { if (running) CodeCraft.runner.stop(); clearTimeout(saveTimer); if (opts.onCodeChange) opts.onCodeChange(getCode()); root.remove(); }
    };
  };
})();
