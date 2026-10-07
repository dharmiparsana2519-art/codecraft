// Generates many questions from every practice generator and saves them as JSON, so tools/verify.py can check them
// against real Python 3. Runs with macOS's built-in JavaScript engine:
//   osascript -l JavaScript tools/export.js <project folder> <questions per generator> <output.json>
ObjC.import('Foundation');

function read(path) {
  return $.NSString.stringWithContentsOfFileEncodingError(path, $.NSUTF8StringEncoding, null).js;
}

function run(argv) {
  const root = argv[0], per = parseInt(argv[1] || '25', 10), out = argv[2];
  const names = ObjC.deepUnwrap($.NSFileManager.defaultManager.contentsOfDirectoryAtPathError(root + '/practice', null))
    .filter(n => /^gen-.*\.js$/.test(n)).sort();
  (0, eval)(read(root + '/practice/core.js'));
  names.forEach(n => (0, eval)(read(root + '/practice/' + n)));
  const P = CodeCraft.practice, questions = [], errors = [];
  Object.keys(P.gens).forEach(topic => P.gens[topic].forEach(gen => {
    for (let i = 0; i < per; i++) {
      const seed = (Math.imul(i + 1, 2654435761) + 977) >>> 0;
      try { questions.push(P.generate(gen, seed)); }
      catch (e) { errors.push({ topic, gen: gen.id, seed, error: String(e) + (e.line ? ' (line ' + e.line + ')' : '') }); }
    }
  }));
  const counts = {};
  Object.keys(P.gens).forEach(t => { counts[t] = P.gens[t].length; });
  $(JSON.stringify({ harness: P.HARNESS, counts, errors, questions })).writeToFileAtomicallyEncodingError(out, true, $.NSUTF8StringEncoding, null);
  return `exported ${questions.length} questions from ${names.length} files; ${errors.length} generator errors`;
}
