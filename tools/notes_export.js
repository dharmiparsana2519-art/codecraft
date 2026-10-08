// Lists every runnable code block in the "Build it from scratch" notes (content/notes/*.js) as JSON, so
// tools/notes_check.py can run each one in real Python 3. Runs with macOS's built-in JavaScript engine:
//   osascript -l JavaScript tools/notes_export.js <project folder> <output.json>
ObjC.import('Foundation');

function read(path) {
  return $.NSString.stringWithContentsOfFileEncodingError(path, $.NSUTF8StringEncoding, null).js;
}

function run(argv) {
  const root = argv[0], out = argv[1];
  globalThis.window = globalThis;
  const names = ObjC.deepUnwrap($.NSFileManager.defaultManager.contentsOfDirectoryAtPathError(root + '/content/notes', null))
    .filter(n => /\.js$/.test(n)).sort();
  (0, eval)(read(root + '/widgets/notes.js'));
  names.forEach(n => (0, eval)(read(root + '/content/notes/' + n)));
  const N = CodeCraft.notes, lessons = {};
  Object.keys(N.all).forEach(id => {
    lessons[id] = {
      blocks: N.blocks(id),
      programs: N.all[id].programs.map(p => ({ title: p.title, code: p.code, build: p.build.map(b => b.add),
        dash: p.build.some(b => /^\s*[—-]?\s*$/.test(b.why || '') || /^\s*[—-]?\s*$/.test(b.missing || '')),
        bads: (p.mistakes || []).map(m => (m.bad ? { bad: m.bad, lines: m.code.split('\n') } : null)), parts: {
        think: (p.think || []).length, vars: (p.vars || []).length, mistakes: (p.mistakes || []).length,
        trace: !!p.trace, nobuiltins: !!p.nobuiltins, tip: !!p.tip, goal: !!p.goal, works: !!p.works,
        whys: p.build.every(b => b.why && b.missing) } }))
    };
  });
  $(JSON.stringify(lessons)).writeToFileAtomicallyEncodingError(out, true, $.NSUTF8StringEncoding, null);
  return `exported notes for ${Object.keys(lessons).length} lesson(s): ${Object.keys(lessons).join(', ')}`;
}
