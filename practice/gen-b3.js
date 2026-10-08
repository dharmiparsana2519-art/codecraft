/* Practice generators — B2.5 File processing and B3.1 Object-oriented programming for a single class. */
(function (P) {
  const { py, esc, code: C } = P;
  const opt = (text, ok, why) => ({ text, ok: !!ok, why });
  const scoresFile = (R, n) => R.sample(P.data.names, n).map(x => [x, R.int(35, 98)]);
  const csv = rows => rows.map(r => r.join(',')).join('\n') + '\n';

  /* ================= B2.5.1  Text files ================= */
  P.add('B2.5.1', [
    { id: 'file-read', kind: 'output', term: 'Determine', marks: 3, make(R) {
      const rows = scoresFile(R, R.int(4, 5)), files = { 'scores.txt': csv(rows) }, v = R.int(0, 3);
      if (v === 0) {
        const pm = R.pick([50, 60, 70].filter(p => rows.some(r => r[1] >= p))) || 35, keep = rows.filter(r => r[1] >= pm);
        return { prompt: 'The file <code>scores.txt</code> is shown above the code. What does the program print?', files,
          code: `with open("scores.txt", "r") as f:\n    for line in f:\n        name, score = line.strip().split(",")\n        if int(score) >= ${pm}:\n            print(name)`,
          answer: keep.map(r => r[0]).join('\n') || '', explain: `<p>Each line is stripped of its newline and split at the comma into a name and a score. The score is a <em>string</em>, so int() converts it before comparing with ${pm}. Names printed: ${keep.map(r => r[0]).join(', ') || 'none'}.</p>` };
      }
      if (v === 1) {
        const k = R.int(0, rows.length - 1);
        return { prompt: 'What does this program print?', files,
          code: `f = open("scores.txt", "r")\nlines = f.readlines()\nf.close()\nprint(len(lines))\nprint(lines[${k}].strip())`,
          answer: `${rows.length}\n${rows[k].join(',')}`, explain: `<p>readlines() returns a list with one string per line (each still ending in \\n), so len(lines) is ${rows.length}. lines[${k}] is line ${k + 1} of the file; strip() removes the newline.</p>` };
      }
      if (v === 2) {
        return { prompt: 'What does this program print?', files,
          code: 'f = open("scores.txt", "r")\nfirst = f.readline()\nsecond = f.readline()\nf.close()\nprint(first.strip() + " | " + second.strip())\nprint(len(first))',
          answer: `${rows[0].join(',')} | ${rows[1].join(',')}\n${rows[0].join(',').length + 1}`,
          explain: `<p>Each readline() call reads the <em>next</em> line. Before strip(), first still ends with a newline character, so len(first) is ${rows[0].join(',').length} characters + 1 = ${rows[0].join(',').length + 1}.</p>` };
      }
      rows[rows.length - 1][1] -= rows.reduce((a, r) => a + r[1], 0) % rows.length; // whole-number mean
      files['scores.txt'] = csv(rows);
      const tot = rows.reduce((a, r) => a + r[1], 0);
      return { prompt: 'What does this program print?', files,
        code: 'total = 0\ncount = 0\nwith open("scores.txt", "r") as f:\n    for line in f:\n        parts = line.strip().split(",")\n        total = total + int(parts[1])\n        count = count + 1\nprint(count, total)\nprint(total / count)',
        answer: `${rows.length} ${tot}\n${py.f(tot / rows.length)}`, explain: `<p>parts[1] is the score on each line. Adding them gives ${rows.map(r => r[1]).join(' + ')} = ${tot} from ${rows.length} lines; / gives the mean as a float.</p>` };
    } },
    { id: 'file-modes', kind: 'output', term: 'Determine', marks: 3, make(R) {
      const names = R.sample(P.data.names, 8), steps = [], lines = [];
      let content = [], ptr = 0;
      const n = R.int(3, 4);
      for (let i = 0; i < n; i++) {
        const k = R.chance(0.4) ? 2 : 1, mode = i === 0 ? 'w' : R.pick(['a', 'a', 'w']), add = names.slice(ptr, ptr + k);
        ptr += k;
        if (mode === 'w') content = [];
        content.push(...add);
        lines.push(`f = open("log.txt", "${mode}")`, ...add.map(x => `f.write("${x}\\n")`), 'f.close()');
        steps.push(mode === 'w' ? `"w" wipes the file, then writes ${add.join(', ')}` : `"a" adds ${add.join(', ')} to the end`);
      }
      lines.push('f = open("log.txt", "r")', 'for line in f:', '    print(line.strip())', 'f.close()');
      return { prompt: 'What does this program print?', code: lines.join('\n'), answer: content.join('\n'),
        explain: P.list(steps) + `<p>So the file ends up holding ${content.join(', ')}.</p>` };
    } },
    { id: 'file-concept', kind: 'mcq', term: 'State', marks: 1, make(R) {
      const QS = [
        ['What happens when <code>open("notes.txt", "r")</code> runs and the file doesn\'t exist?', 'A FileNotFoundError is raised', [['An empty file is created', 'Only "w" and "a" create a missing file.'], ['It returns None', 'open() never returns None — it raises an error.'], ['The program waits until the file appears', 'It fails straight away.']], 'Reading needs an existing file; wrap open() in try/except FileNotFoundError to handle it.'],
        ['Which mode adds new lines to the end of a file without deleting what is already there?', '"a" (append)', [['"w" (write)', '"w" empties the file first.'], ['"r" (read)', '"r" only reads; writing raises an error.'], ['"x"', 'Not part of this course — use "a".']], 'Append keeps the existing contents and writes after them.'],
        ['What happens to the existing contents of a file opened with mode <code>"w"</code>?', 'They are deleted as soon as the file is opened', [['They are kept, and new text goes at the end', 'That is what "a" does.'], ['They are kept until close() is called', 'The file is emptied immediately on opening.'], ['Nothing — "w" is read-only', '"w" is for writing.']], '"w" creates the file if needed and truncates it to empty.'],
        ['Why is <code>with open(...) as f:</code> often better than calling <code>f.close()</code> yourself?', 'The file is closed automatically, even if an error happens', [['It reads the file faster', 'Speed is the same.'], ['It lets you open a file that doesn\'t exist', 'It still raises FileNotFoundError.'], ['It stops other programs reading the file', 'That isn\'t what with does.']], 'Leaving files open can lose written data or lock the file.'],
        ['What does <code>f.readlines()</code> return?', 'A list of strings, one per line, each ending in "\\n"', [['One string holding the whole file', 'That is f.read().'], ['Only the next line', 'That is f.readline().'], ['A list of numbers', 'Files are read as text; convert with int() yourself.']], 'Use .strip() on each line to remove the newline.'],
        ['A line read from a file is <code>"Aiko,78\\n"</code>. Which code gets the score as an integer?', 'int(line.strip().split(",")[1])', [['int(line[1])', 'line[1] is the character "i".'], ['line.split(",")[1]', 'That is the string "78\\n", not an integer.'], ['int(line.split(",")[0])', 'Index 0 is the name, "Aiko".']], 'strip() removes the newline, split(",") gives ["Aiko", "78"], [1] picks "78", int() converts it.']
      ];
      const [q, ok, wrong, why] = R.pick(QS);
      return { prompt: q, options: [opt(ok, true, why), ...wrong.map(w => opt(w[0], false, w[1]))] };
    } },
    { id: 'file-code', kind: 'code', term: 'Construct', marks: 5, make(R) {
      const v = R.int(0, 4);
      const f1 = scoresFile(R, R.int(3, 5)), f2 = scoresFile(R, R.int(3, 5));
      const files = { 'class_a.txt': csv(f1), 'class_b.txt': csv(f2) }, sets = [['class_a.txt', f1], ['class_b.txt', f2]];
      const note = ' The Files tab has <code>class_a.txt</code> and <code>class_b.txt</code>; each line is <code>name,score</code>.';
      if (v === 0) return { prompt: 'Write <code>count_lines(filename)</code> that returns how many lines the file has.' + note, files,
        starter: 'def count_lines(filename):\n    pass\n', solution: 'def count_lines(filename):\n    count = 0\n    with open(filename, "r") as f:\n        for line in f:\n            count = count + 1\n    return count\n',
        tests: sets.map(([n, r]) => P.t(`count_lines(${py.s(n)}) returns ${r.length}`, `count_lines(${py.s(n)})`, r.length)).join('\n'), hint: 'Open the file, loop over its lines and count them.' };
      if (v === 1) return { prompt: 'Write <code>average_score(filename)</code> that returns the mean score as a float.' + note, files,
        starter: 'def average_score(filename):\n    pass\n', solution: 'def average_score(filename):\n    total = 0\n    count = 0\n    with open(filename, "r") as f:\n        for line in f:\n            name, score = line.strip().split(",")\n            total = total + int(score)\n            count = count + 1\n    return total / count\n',
        tests: sets.map(([n, r]) => { const a = r.reduce((s, x) => s + x[1], 0) / r.length; return P.tf(`average_score(${py.s(n)}) ≈ ${py.f(a)}`, `average_score(${py.s(n)})`, { f: a }); }).join('\n'), hint: 'strip() then split(",") each line; convert the score with int() before adding.' };
      if (v === 2) return { prompt: 'Write <code>top_student(filename)</code> that returns the name with the highest score. <strong>No built-ins:</strong> don\'t use <code>max()</code>.' + note, files,
        starter: 'def top_student(filename):\n    pass\n', solution: 'def top_student(filename):\n    best_name = ""\n    best = -1\n    with open(filename, "r") as f:\n        for line in f:\n            name, score = line.strip().split(",")\n            if int(score) > best:\n                best = int(score)\n                best_name = name\n    return best_name\n',
        tests: sets.map(([n, r]) => { const b = r.reduce((m, x) => (x[1] > m[1] ? x : m), r[0]); return P.t(`top_student(${py.s(n)}) returns ${py.s(b[0])}`, `top_student(${py.s(n)})`, b[0]); }).join('\n'), banned: P.ban('max'), hint: 'Keep track of the best score so far and the name that goes with it.' };
      if (v === 3) { const names = R.sample(P.data.names, R.int(2, 4));
        return { prompt: 'Write <code>save_names(filename, names)</code> that writes each name in the list on its own line, replacing anything already in the file.',
          starter: 'def save_names(filename, names):\n    pass\n', solution: 'def save_names(filename, names):\n    f = open(filename, "w")\n    for name in names:\n        f.write(name + "\\n")\n    f.close()\n',
          tests: [P.tblock(`after save_names("team.txt", ${py.r(names)}) the file reads correctly`, `save_names("team.txt", ${py.r(names)})\nf = open("team.txt", "r")\ntext = f.read()\nf.close()\nreturn text`, names.join('\n') + '\n'),
            P.tblock('a second call replaces the old contents', `save_names("team.txt", ["Old"])\nsave_names("team.txt", ${py.r(names.slice(0, 1))})\nf = open("team.txt", "r")\ntext = f.read()\nf.close()\nreturn text`, names[0] + '\n')].join('\n'),
          hint: 'Open with "w" (which empties the file), write name + "\\n" for each name, then close.' }; }
      const books = R.sample(P.data.books.map((b, i) => [b, P.data.authors[i]]), 4), bf = { 'books.txt': csv(books) }, pick = R.pick(books);
      return { prompt: 'Write <code>find_author(filename, title)</code> that returns the author of the book, or <code>"Not found"</code>. Each line of <code>books.txt</code> is <code>title,author</code>.', files: bf,
        starter: 'def find_author(filename, title):\n    pass\n', solution: 'def find_author(filename, title):\n    with open(filename, "r") as f:\n        for line in f:\n            t, a = line.strip().split(",")\n            if t == title:\n                return a\n    return "Not found"\n',
        tests: [P.t(`find_author("books.txt", ${py.s(pick[0])}) returns ${py.s(pick[1])}`, `find_author("books.txt", ${py.s(pick[0])})`, pick[1]), P.t(`find_author("books.txt", ${py.s(books[0][0])}) returns ${py.s(books[0][1])}`, `find_author("books.txt", ${py.s(books[0][0])})`, books[0][1]), P.t('find_author("books.txt", "Missing") returns "Not found"', 'find_author("books.txt", "Missing")', 'Not found')].join('\n'),
        hint: 'Split each line into title and author; return the author when the title matches. Only return "Not found" after the loop.' };
    } }
  ]);

  /* ================= B3.1.1  OOP fundamentals ================= */
  const TERMS = {
    Class: 'a template or blueprint that defines the attributes and methods its objects will have',
    Object: 'an instance of a class, with its own values for the attributes',
    Attribute: 'a variable that belongs to an object and stores part of its state',
    Method: 'a function defined inside a class that describes what an object can do',
    Constructor: 'the special method (__init__ in Python) that runs when an object is created and sets its starting attribute values',
    Instantiation: 'creating a new object from a class',
    Encapsulation: 'bundling data and the methods that act on it into one class, and restricting direct access to the data',
    Inheritance: 'a class taking on the attributes and methods of another (parent) class',
    Polymorphism: 'the same method name behaving differently depending on the object\'s class'
  };
  const BOOK = 'class Book:\n    def __init__(self, title):\n        self.title = title';
  P.add('B3.1.1', [
    { id: 'oop-terms', kind: 'mcq', term: 'Identify', marks: 1, make(R) {
      const k = R.pick(Object.keys(TERMS)), others = R.sample(Object.keys(TERMS).filter(t => t !== k), 3);
      return { prompt: `Which OOP term matches this description?<blockquote>${esc(TERMS[k][0].toUpperCase() + TERMS[k].slice(1))}.</blockquote>`,
        options: [opt(k, true, `Yes — ${k.toLowerCase()} means ${TERMS[k]}.`), ...others.map(t => opt(t, false, `${t} means ${TERMS[t]}.`))] };
    } },
    { id: 'oop-objects', kind: 'mcq', term: 'State', marks: 1, make(R) {
      const titles = R.sample(P.data.books, 5), made = R.int(2, 4), ordered = [], created = [];
      let left = R.int(1, 2);
      for (let i = 0; i < made; i++) {
        ordered.push(`${'abcd'[i]} = Book("${titles[i]}")`); created.push('abcd'[i]);
        if (left && R.chance(0.5)) { ordered.push(`${'xy'[2 - left]} = ${R.pick(created)}`); left--; }
      }
      while (left) { ordered.push(`${'xy'[2 - left]} = ${R.pick(created)}`); left--; }
      const nAlias = ordered.filter(l => /^\w = \w$/.test(l)).length;
      return { prompt: 'How many <code>Book</code> objects are created by this code?', code: BOOK + '\n\n' + ordered.join('\n'),
        options: P.options(opt(String(made), true, `Each call to Book(...) instantiates one new object, so ${made} are created. A line like ${C(ordered.find(l => /^\w = \w$/.test(l)))} makes a second variable that refers to an <em>existing</em> object.`),
          [opt(String(made + nAlias), false, 'Assigning one variable to another doesn\'t create an object — both names refer to the same one.'), opt('1', false, 'Every Book(...) call creates a separate object.'), opt('0', false, 'A class is only a blueprint, but each Book(...) call does create an object.'), opt(String(made - 1), false, 'Count every Book(...) call.')]),
        check: { code: 'class Book:\n    made = 0\n    def __init__(self, title):\n        self.title = title\n        Book.made = Book.made + 1\n\n' + ordered.join('\n') + '\nprint(Book.made)', expect: String(made) } };
    } },
    { id: 'oop-advdis', kind: 'mcq', term: 'Identify', marks: 1, make(R) {
      const A = ['Many objects can be created from one class, so code is reused.', 'Encapsulation protects an object\'s data from accidental changes.', 'Programs model real-world things (students, books), so they are easier to understand.', 'Classes can be written and tested separately by different team members.', 'Changing how a class works inside doesn\'t affect code that uses its methods.'];
      const D = ['For a small program, classes can make the code longer and more complex than needed.', 'Designing good classes takes extra planning time.', 'Objects can use more memory than simple variables.', 'Extra method calls can make a program run a little slower.', 'It can be harder for beginners to follow the flow of an OOP program.'];
      const adv = R.chance(0.5), s = R.pick(adv ? A : D);
      return { prompt: `Is this an advantage or a disadvantage of object-oriented programming?<blockquote>${esc(s)}</blockquote>`,
        options: [opt('Advantage', adv, adv ? 'Yes — this is a benefit of OOP.' : 'This is a cost of using OOP, not a benefit.'), opt('Disadvantage', !adv, !adv ? 'Yes — this is a drawback of OOP.' : 'This is a benefit of OOP.'), opt('Neither — it isn\'t related to OOP', false, 'It is a recognised point about OOP.')], fixedOrder: true };
    } },
    { id: 'oop-evaluate', kind: 'written', term: 'Evaluate', marks: 4, make(R) {
      const sc = R.pick(['a school library system', 'a canteen ordering app', 'a sports day results system', 'a student timetable app']);
      return { prompt: `Evaluate the use of object-oriented programming to develop ${sc}.`,
        markscheme: ['<strong>Advantage:</strong> real things (e.g. Book, Student, Order) map naturally onto classes, making the design easier to understand', '<strong>Advantage:</strong> one class can create many objects, so code is reused', '<strong>Advantage:</strong> encapsulation protects data (e.g. a balance can only change through methods with validation)', '<strong>Disadvantage:</strong> more planning/design time and possibly more code than a small procedural program', '<strong>Disadvantage:</strong> can use more memory / be slightly slower', '<strong>Conclusion:</strong> a justified judgement, e.g. OOP suits this system because it has many objects of a few types'],
        model: '"Evaluate" needs both sides and a conclusion. 1 mark per point; maximum 4, and at most 3 if there is no conclusion.' };
    } }
  ]);

  /* ================= B3.1.2  Designing classes & UML ================= */
  const UML_CLASSES = [
    { name: 'Book', attrs: [['-', 'title', 'str'], ['-', 'author', 'str'], ['-', 'pages', 'int'], ['-', 'onLoan', 'bool']], methods: [['+', 'getTitle()', 'str'], ['+', 'borrow()', ''], ['+', 'isLong()', 'bool'], ['+', 'getPages()', 'int']] },
    { name: 'Student', attrs: [['-', 'name', 'str'], ['-', 'studentID', 'int'], ['+', 'house', 'str'], ['-', 'grades', 'list']], methods: [['+', 'getName()', 'str'], ['+', 'addGrade(g: int)', ''], ['+', 'average()', 'float'], ['-', 'checkGrade(g: int)', 'bool']] },
    { name: 'Locker', attrs: [['-', 'number', 'int'], ['-', 'code', 'str'], ['-', 'owner', 'str']], methods: [['+', 'assign(name: str)', 'bool'], ['+', 'release()', ''], ['+', 'isFree()', 'bool'], ['-', 'newCode()', 'str']] },
    { name: 'CanteenCard', attrs: [['-', 'owner', 'str'], ['-', 'balance', 'float'], ['+', 'cardID', 'int']], methods: [['+', 'topUp(amount: float)', ''], ['+', 'buy(price: float)', 'bool'], ['+', 'getBalance()', 'float']] }
  ];
  P.uml = c => `<div class="uml" role="img" aria-label="UML class diagram for ${c.name}"><div class="uml-name">${c.name}</div><div class="uml-sec">${c.attrs.map(a => `<div>${a[0]} ${a[1]}: ${a[2]}</div>`).join('')}</div><div class="uml-sec">${c.methods.map(m => `<div>${m[0]} ${esc(m[1])}${m[2] ? ': ' + m[2] : ''}</div>`).join('')}</div></div>`;
  P.add('B3.1.2', [
    { id: 'uml-read', kind: 'mcq', term: 'Identify', marks: 1, make(R) {
      const c = R.pick(UML_CLASSES), v = R.int(0, 3), members = [...c.attrs.map(a => [a[0], a[1]]), ...c.methods.map(m => [m[0], m[1]])];
      if (v === 0) { const n = c.attrs.filter(a => a[0] === '-').length;
        return { prompt: `How many <strong>private attributes</strong> does this class have?`, visual: P.uml(c),
          options: P.options(opt(String(n), true, `Attributes are in the middle section; ${n} of them start with −, which means private.`), [opt(String(c.attrs.length), false, 'Not every attribute is private — check the + and − symbols.'), opt(String(members.filter(m => m[0] === '-').length), false, 'That counts private methods too; methods are in the bottom section.'), opt(String(n + 1), false, 'Count only the middle section\'s − entries.'), opt('0', false, '− marks a private member.')]) }; }
      if (v === 1) { const pub = R.pick(members.filter(m => m[0] === '+')), priv = R.sample(members.filter(m => m[0] === '-'), 3);
        return { prompt: 'Which member can be used from <strong>outside</strong> the class?', visual: P.uml(c),
          options: [opt(pub[1], true, `It is marked +, so it is public.`), ...priv.map(p => opt(p[1], false, `${p[1]} is marked −, so it is private: only the class's own methods can use it.`))], mono: true }; }
      if (v === 2) return { prompt: 'In a UML class diagram, what does the <strong>−</strong> symbol before a member mean?', visual: P.uml(c),
        options: [opt('Private — only code inside the class can access it', true, 'UML uses − for private and + for public.'), opt('Public — any code can access it', false, 'Public is shown with +.'), opt('The member is static (shared by all objects)', false, 'Static members are shown underlined.'), opt('The attribute can be negative', false, 'The symbol shows visibility, not the value.')] };
      const m = R.pick(c.methods.filter(x => x[2])), others = R.sample(['str', 'int', 'float', 'bool', 'list'].filter(t => t !== m[2]), 3);
      return { prompt: `What type of value does <code>${esc(m[1])}</code> return?`, visual: P.uml(c),
        options: [opt(m[2], true, `The type after the colon at the end of the method line is its return type: ${m[2]}.`), ...others.map(t => opt(t, false, `Look at the type after the colon following ${m[1]}.`))], mono: true };
    } },
    { id: 'uml-to-code', kind: 'mcq', term: 'Identify', marks: 2, make(R) {
      const c = R.pick(UML_CLASSES), attrs = c.attrs.slice(0, 3), params = attrs.map(a => a[1]).join(', ');
      const line = (a, style) => style === 'ok' ? `        self.${a[0] === '-' ? '__' : ''}${a[1]} = ${a[1]}` : style === 'pub' ? `        self.${a[1]} = ${a[1]}` : style === 'allpriv' ? `        self.__${a[1]} = ${a[1]}` : `        ${a[1]} = ${a[1]}`;
      const mk = style => `class ${c.name}:\n    def __init__(self, ${params}):\n` + attrs.map(a => line(a, style)).join('\n');
      const mixed = attrs.some(a => a[0] === '+');
      return { prompt: 'Which constructor matches the visibility of the attributes in this UML diagram?', visual: P.uml(Object.assign({}, c, { attrs, methods: c.methods.slice(0, 1) })),
        options: P.options(opt(mk('ok'), true, 'Private (−) attributes use a double underscore, e.g. self.__' + attrs.find(a => a[0] === '-')[1] + (mixed ? '; the public (+) one has no underscore.' : '.')),
          [opt(mk('pub'), false, 'These are all public. The − attributes should be private: self.__name.'), ...(mixed ? [opt(mk('allpriv'), false, 'The + attribute in the diagram is public, so it shouldn\'t have underscores.')] : []), opt(mk('local'), false, 'Without self., these are local variables that disappear when __init__ ends — the object gets no attributes.')]), mono: true };
    } },
    { id: 'uml-design', kind: 'written', term: 'Construct', marks: 4, make(R) {
      const [sc, cls, attrs, meths] = R.pick([
        ['a sports day system that records each runner\'s name, house and race time', 'Runner', '- name: str, - house: str, - time: float', '+ getTime(): float, + setTime(t: float): bool, + getHouse(): str'],
        ['a library that tracks each member\'s name, ID and the books they have borrowed', 'Member', '- name: str, - memberID: int, - borrowed: list', '+ borrow(title: str): bool, + returnBook(title: str), + countBorrowed(): int'],
        ['a canteen that tracks orders with a list of items and a total price', 'Order', '- orderID: int, - items: list, - total: float', '+ addItem(name: str, price: float), + getTotal(): float, + itemCount(): int'],
        ['a school bus with a route number, capacity and number of passengers on board', 'Bus', '- route: int, - capacity: int, - passengers: int', '+ board(): bool, + leave(), + isFull(): bool']
      ]);
      return { prompt: `Construct a UML class diagram for ${sc}.`,
        markscheme: [`Class name in the top section, e.g. <strong>${cls}</strong>`, `At least three relevant attributes with data types, e.g. ${esc(attrs)}`, `Attributes marked private (−) to encapsulate the data`, `At least two relevant public (+) methods with parameters and return types, e.g. ${esc(meths)}`],
        model: `<div class="uml"><div class="uml-name">${cls}</div><div class="uml-sec">${attrs.split(', ').map(a => `<div>${esc(a)}</div>`).join('')}</div><div class="uml-sec">${meths.split(', + ').map((m, i) => `<div>${i ? '+ ' : ''}${esc(m)}</div>`).join('')}</div></div>` };
    } },
    { id: 'uml-code', kind: 'code', term: 'Construct', marks: 6, make(R) {
      if (R.chance(0.5)) {
        const owner = R.pick(P.data.names), bal = R.int(5, 20), top = R.int(2, 10), price = R.int(2, Math.min(8, bal));
        const c = { name: 'CanteenCard', attrs: [['-', 'owner', 'str'], ['-', 'balance', 'int']], methods: [['+', 'getBalance()', 'int'], ['+', 'topUp(amount: int)', ''], ['+', 'buy(price: int)', 'bool']] };
        return { prompt: `Write the <code>CanteenCard</code> class from this UML. The constructor takes <code>owner</code> and <code>balance</code>. <code>topUp</code> adds to the balance. <code>buy</code> takes the price off and returns <code>True</code> only if the balance is enough; otherwise it changes nothing and returns <code>False</code>.`, visual: P.uml(c),
          starter: 'class CanteenCard:\n    def __init__(self, owner, balance):\n        pass\n',
          solution: 'class CanteenCard:\n    def __init__(self, owner, balance):\n        self.__owner = owner\n        self.__balance = balance\n\n    def getBalance(self):\n        return self.__balance\n\n    def topUp(self, amount):\n        self.__balance = self.__balance + amount\n\n    def buy(self, price):\n        if price > self.__balance:\n            return False\n        self.__balance = self.__balance - price\n        return True\n',
          tests: [P.tblock('getBalance returns the starting balance', `c = CanteenCard("${owner}", ${bal})\nreturn c.getBalance()`, bal),
            P.tblock(`topUp(${top}) adds to the balance`, `c = CanteenCard("${owner}", ${bal})\nc.topUp(${top})\nreturn c.getBalance()`, bal + top),
            P.tblock(`buy(${price}) succeeds`, `c = CanteenCard("${owner}", ${bal})\nreturn [c.buy(${price}), c.getBalance()]`, [true, bal - price]),
            P.tblock('buy fails when the balance is too low', `c = CanteenCard("${owner}", ${bal})\nreturn [c.buy(${bal + 1}), c.getBalance()]`, [false, bal]),
            P.tblock('balance is private', `c = CanteenCard("${owner}", ${bal})\nreturn hasattr(c, "balance") or hasattr(c, "__balance")`, false)].join('\n'),
          hint: 'Store the attributes as self.__owner and self.__balance (double underscore = private). buy checks the balance before changing it.' };
      }
      const title = R.pick(P.data.books), pages = R.int(120, 600), lim = R.pick([250, 300, 350]);
      const c = { name: 'Book', attrs: [['-', 'title', 'str'], ['-', 'pages', 'int']], methods: [['+', 'getTitle()', 'str'], ['+', 'getPages()', 'int'], ['+', 'isLong()', 'bool']] };
      return { prompt: `Write the <code>Book</code> class from this UML. The constructor takes <code>title</code> and <code>pages</code>. <code>isLong()</code> returns <code>True</code> if the book has more than ${lim} pages.`, visual: P.uml(c),
        starter: 'class Book:\n    def __init__(self, title, pages):\n        pass\n',
        solution: `class Book:\n    def __init__(self, title, pages):\n        self.__title = title\n        self.__pages = pages\n\n    def getTitle(self):\n        return self.__title\n\n    def getPages(self):\n        return self.__pages\n\n    def isLong(self):\n        return self.__pages > ${lim}\n`,
        tests: [P.tblock('getTitle returns the title', `b = Book("${title}", ${pages})\nreturn b.getTitle()`, title), P.tblock('getPages returns the pages', `b = Book("${title}", ${pages})\nreturn b.getPages()`, pages),
          P.tblock(`isLong() for ${pages} pages`, `b = Book("${title}", ${pages})\nreturn b.isLong()`, pages > lim), P.tblock(`isLong() for exactly ${lim} pages is False`, `b = Book("X", ${lim})\nreturn b.isLong()`, false),
          P.tblock('title is private', `b = Book("${title}", ${pages})\nreturn hasattr(b, "title") or hasattr(b, "__title")`, false)].join('\n'),
        hint: 'Private attributes: self.__title and self.__pages. Each getter just returns one of them.' };
    } }
  ]);

  /* ================= B3.1.3  Static vs non-static ================= */
  P.add('B3.1.3', [
    { id: 'static-count', kind: 'output', term: 'State', marks: 2, make(R) {
      const names = R.sample(P.data.names, 5), n1 = R.int(2, 3), extra = R.int(1, 2), school = R.pick(['Hillside', 'Riverside', 'Lakeview']);
      const lines = names.slice(0, n1).map((n, i) => `s${i + 1} = Student("${n}")`);
      lines.push('print(Student.count)', `t = s1`);
      for (let i = 0; i < extra; i++) lines.push(`s${n1 + i + 1} = Student("${names[n1 + i]}")`);
      lines.push('print(Student.count, s1.count)', 'print(s2.school)');
      const total = n1 + extra;
      return { prompt: 'What does this program print?',
        code: `class Student:\n    count = 0\n    school = "${school}"\n\n    def __init__(self, name):\n        self.name = name\n        Student.count = Student.count + 1\n\n` + lines.join('\n'),
        answer: `${n1}\n${total} ${total}\n${school}`,
        explain: `<p><code>count</code> and <code>school</code> are <strong>class (static) variables</strong>: one copy shared by every Student. Each <code>Student(...)</code> call runs the constructor and adds 1. <code>t = s1</code> creates no new object, so it doesn't change the count. Reading <code>s1.count</code> gives the shared value, ${total}.</p>` };
    } },
    { id: 'static-classify', kind: 'mcq', term: 'Identify', marks: 1, make(R) {
      const S = [['the school name, the same for every Student object', true], ['the total number of Book objects created so far', true], ['the VAT rate used by every CanteenOrder', true], ['the maximum number of books any member may borrow', true],
        ['each student\'s date of birth', false], ['a locker\'s code', false], ['the list of items in one canteen order', false], ['the title of a particular book', false]];
      const [what, stat] = R.pick(S);
      return { prompt: `Should <strong>${esc(what)}</strong> be stored as a static (class) variable or an instance variable?`,
        options: [opt('Static (class) variable', stat, stat ? 'Yes — the value is shared by every object, so one copy belongs to the class.' : 'Each object needs its own value here, so it must be an instance variable.'),
          opt('Instance variable (self.…)', !stat, !stat ? 'Yes — every object has its own value, stored with self.' : 'Every object would hold its own copy, wasting memory and risking them getting out of step.'),
          opt('Local variable in a method', false, 'A local variable disappears when the method ends, so it can\'t store the object\'s data.')], fixedOrder: true };
    } },
    { id: 'static-concept', kind: 'mcq', term: 'Distinguish', marks: 1, make(R) {
      const QS = [
        ['What is true of a method marked <code>@staticmethod</code>?', 'It can be called on the class without creating an object, and has no self parameter', [['It can only be called once', 'It can be called any number of times.'], ['It changes every object\'s attributes', 'Without self it can\'t reach any object\'s attributes.'], ['It runs automatically when an object is created', 'That is the constructor, __init__.']], 'Use it for a utility that belongs with the class but doesn\'t need an object\'s data.'],
        ['Which method is the best candidate to be static in a <code>Student</code> class?', 'is_valid_id(id), which only checks the format of an ID', [['get_name(), which returns this student\'s name', 'It needs this object\'s data, so it needs self.'], ['add_grade(g), which adds to this student\'s grades', 'It changes this object\'s data.'], ['__init__, the constructor', 'The constructor sets up a particular object.']], 'It uses only its parameter, not any one student\'s attributes.'],
        ['A class variable is changed with <code>Student.count = 10</code>. What do existing objects see?', 'All of them see 10, because there is one shared copy', [['Only objects created afterwards see 10', 'Existing objects read the same shared variable.'], ['None of them — each has its own copy', 'That is how instance variables behave.'], ['A NameError is raised', 'Assigning to a class variable through the class is allowed.']], 'Class (static) variables belong to the class, not to each object.'],
        ['How is an instance variable different from a class (static) variable?', 'Each object has its own copy of an instance variable; a class variable is shared', [['Instance variables are shared; class variables are per object', 'It is the other way round.'], ['Instance variables can\'t change', 'Both can change.'], ['Class variables are created in __init__ with self.', 'self. creates instance variables.']], 'Instance variables are set with self.name in the constructor; class variables are written directly inside the class body.']
      ];
      const [q, ok, wrong, why] = R.pick(QS);
      return { prompt: q, options: [opt(ok, true, why), ...wrong.map(w => opt(w[0], false, w[1]))] };
    } },
    { id: 'static-code', kind: 'code', term: 'Construct', marks: 5, make(R) {
      const k = R.int(2, 4), names = R.sample(P.data.names, k), len = R.int(3, 4);
      return { prompt: `Write a class <code>Member</code> with a class variable <code>count</code> (starting at 0) that the constructor increases by 1 for every new member, an instance variable <code>name</code>, and a <code>@staticmethod</code> <code>valid_code(code)</code> that returns <code>True</code> if the code is exactly ${len} characters long and all digits.`,
        starter: 'class Member:\n    pass\n',
        solution: `class Member:\n    count = 0\n\n    def __init__(self, name):\n        self.name = name\n        Member.count = Member.count + 1\n\n    @staticmethod\n    def valid_code(code):\n        return len(code) == ${len} and code.isdigit()\n`,
        tests: [P.tblock(`creating ${k} members makes count ${k}`, `Member.count = 0\n${names.map(n => `Member("${n}")`).join('\n')}\nreturn Member.count`, k),
          P.tblock('each member keeps its own name', `a = Member("${names[0]}")\nb = Member("${names[1]}")\nreturn [a.name, b.name]`, [names[0], names[1]]),
          P.t(`Member.valid_code("${'1234'.slice(0, len)}") returns True (no object needed)`, `Member.valid_code("${'1234'.slice(0, len)}")`, true),
          P.t(`Member.valid_code("12a${len === 4 ? '4' : ''}") returns False`, `Member.valid_code("12a${len === 4 ? '4' : ''}")`, false),
          P.t('Member.valid_code("12") returns False', 'Member.valid_code("12")', false)].join('\n'),
        require: [{ label: '@staticmethod', re: '@staticmethod' }],
        hint: 'Put count = 0 directly in the class body. In __init__, use Member.count (not self.count) to update the shared value.' };
    } }
  ]);

  /* ================= B3.1.4  Classes & constructors ================= */
  P.add('B3.1.4', [
    { id: 'cls-output', kind: 'output', term: 'Determine', marks: 3, make(R) {
      if (R.chance(0.5)) {
        const owner = R.pick(P.data.names), bal = R.int(4, 12), top = R.int(2, 8), p1 = R.int(3, 9), p2 = R.int(5, 15);
        let b = bal + top; const out = [];
        const r1 = p1 <= b; if (r1) b -= p1; out.push(py.b(r1));
        const r2 = p2 <= b; if (r2) b -= p2; out.push(py.b(r2));
        out.push(`${owner}: $${b}`);
        return { prompt: 'What does this program print?',
          code: `class CanteenCard:\n    def __init__(self, owner, balance):\n        self.owner = owner\n        self.balance = balance\n\n    def top_up(self, amount):\n        self.balance = self.balance + amount\n\n    def buy(self, price):\n        if price > self.balance:\n            return False\n        self.balance = self.balance - price\n        return True\n\n    def __str__(self):\n        return self.owner + ": $" + str(self.balance)\n\ncard = CanteenCard("${owner}", ${bal})\ncard.top_up(${top})\nprint(card.buy(${p1}))\nprint(card.buy(${p2}))\nprint(card)`,
          answer: out.join('\n'), explain: `<p>The constructor sets balance to ${bal}; top_up makes it ${bal + top}. buy(${p1}) ${r1 ? `succeeds, leaving ${bal + top - p1}` : 'fails — not enough money'}; buy(${p2}) ${r2 ? 'succeeds' : 'fails and changes nothing'}. <code>print(card)</code> calls <code>__str__</code>, giving "${owner}: $${b}".</p>` };
      }
      const t1 = R.pick(P.data.books), pages = R.int(150, 400), r1 = R.int(20, 60), r2 = R.int(20, 60);
      const pct = n => Math.floor(n * 100 / pages);
      return { prompt: 'What does this program print?',
        code: `class Book:\n    def __init__(self, title, pages):\n        self.title = title\n        self.pages = pages\n        self.read = 0\n\n    def read_pages(self, n):\n        self.read = self.read + n\n\n    def progress(self):\n        return self.read * 100 // self.pages\n\nb = Book("${t1}", ${pages})\nc = b\nb.read_pages(${r1})\nc.read_pages(${r2})\nprint(b.read, c.read)\nprint(b.progress())`,
        answer: `${r1 + r2} ${r1 + r2}\n${pct(r1 + r2)}`,
        explain: `<p><code>c = b</code> doesn't copy the book: b and c refer to the <em>same</em> object, so both calls add to the same <code>read</code> attribute: ${r1} + ${r2} = ${r1 + r2}. progress() is ${r1 + r2} × 100 // ${pages} = ${pct(r1 + r2)}.</p>` };
    } },
    { id: 'cls-concept', kind: 'mcq', term: 'State', marks: 1, make(R) {
      const QS = [
        ['What is the purpose of <code>__init__</code>?', 'It is the constructor: it runs when an object is created and sets its starting attributes', [['It deletes an object', 'Python removes unused objects automatically.'], ['It prints the object', 'That is __str__.'], ['It must be called by hand after creating an object', 'It runs automatically when you write ClassName(...).']], 'Book("Dune", 412) calls __init__ with those arguments.'],
        ['What does <code>self</code> refer to inside a method?', 'The particular object the method was called on', [['The class itself', 'self is the object (instance), not the class.'], ['The first argument passed by the caller', 'Python passes the object as self automatically; the caller\'s first argument goes in the next parameter.'], ['A global variable', 'It is a parameter, local to the method.']], 'In card.buy(5), self is card and price is 5.'],
        ['A method is written as <code>def get_name():</code> (no <code>self</code>). What happens when <code>s.get_name()</code> is called?', 'A TypeError, because Python passes the object but the method takes no parameters', [['It returns None', 'It never runs — the call fails.'], ['It works normally', 'Every instance method needs self as its first parameter.'], ['A SyntaxError when the class is defined', 'The definition is valid; the error happens at the call.']], 'Python always passes the object as the first argument to an instance method.'],
        ['What does <code>print(book)</code> show if the <code>Book</code> class has no <code>__str__</code> method?', 'Something like &lt;__main__.Book object at 0x...&gt;', [['The book\'s title', 'Python doesn\'t know which attribute to show without __str__.'], ['Nothing', 'print always shows something.'], ['An AttributeError', 'Every object has a default text form.']], 'Define __str__ to return a readable string.'],
        ['Which line <strong>instantiates</strong> an object?', 'locker = Locker(14)', [['class Locker:', 'That defines the class (the blueprint).'], ['def __init__(self, number):', 'That defines the constructor.'], ['locker.release()', 'That calls a method on an existing object.']], 'Calling the class like a function creates a new object.']
      ];
      const [q, ok, wrong, why] = R.pick(QS);
      return { prompt: q, options: [opt(ok, true, why), ...wrong.map(w => opt(w[0], false, w[1]))] };
    } },
    { id: 'cls-code', kind: 'code', term: 'Construct', marks: 5, make(R) {
      const num = R.int(1, 240), [a, b] = R.sample(P.data.names, 2);
      if (R.chance(0.5)) return { prompt: 'Write a class <code>Locker</code>. The constructor takes the locker <code>number</code> and sets <code>owner</code> to <code>None</code>. <code>is_free()</code> returns <code>True</code> when there is no owner. <code>assign(name)</code> sets the owner and returns <code>True</code>, but returns <code>False</code> (and changes nothing) if the locker is taken. <code>release()</code> makes it free again.',
        starter: 'class Locker:\n    def __init__(self, number):\n        pass\n',
        solution: 'class Locker:\n    def __init__(self, number):\n        self.number = number\n        self.owner = None\n\n    def is_free(self):\n        return self.owner is None\n\n    def assign(self, name):\n        if not self.is_free():\n            return False\n        self.owner = name\n        return True\n\n    def release(self):\n        self.owner = None\n',
        tests: [P.tblock('a new locker is free', `l = Locker(${num})\nreturn [l.number, l.is_free()]`, [num, true]), P.tblock(`assign("${a}") works`, `l = Locker(${num})\nreturn [l.assign("${a}"), l.owner]`, [true, a]),
          P.tblock('a taken locker can\'t be assigned', `l = Locker(${num})\nl.assign("${a}")\nreturn [l.assign("${b}"), l.owner]`, [false, a]), P.tblock('release makes it free', `l = Locker(${num})\nl.assign("${a}")\nl.release()\nreturn l.is_free()`, true)].join('\n'),
        hint: 'Set self.owner = None in __init__. is_free returns self.owner is None.' };
      const sizes = [R.int(2, 4)], titles = R.sample(P.data.books, 6);
      return { prompt: `Write a class <code>Member</code> for the library. The constructor takes <code>name</code> and <code>limit</code> and starts with an empty list <code>books</code>. <code>borrow(title)</code> adds the title and returns <code>True</code>, or returns <code>False</code> if the member already has <code>limit</code> books. <code>count()</code> returns how many books they have.`,
        starter: 'class Member:\n    def __init__(self, name, limit):\n        pass\n',
        solution: 'class Member:\n    def __init__(self, name, limit):\n        self.name = name\n        self.limit = limit\n        self.books = []\n\n    def borrow(self, title):\n        if len(self.books) >= self.limit:\n            return False\n        self.books.append(title)\n        return True\n\n    def count(self):\n        return len(self.books)\n',
        tests: [P.tblock('a new member has no books', `m = Member("${a}", ${sizes[0]})\nreturn m.count()`, 0),
          P.tblock(`borrowing up to the limit of ${sizes[0]}`, `m = Member("${a}", ${sizes[0]})\nr = []\n${titles.slice(0, sizes[0] + 1).map(t => `r.append(m.borrow("${t}"))`).join('\n')}\nreturn r`, [...Array(sizes[0]).fill(true), false]),
          P.tblock('each member has their own list', `m1 = Member("${a}", 3)\nm2 = Member("${b}", 3)\nm1.borrow("${titles[0]}")\nreturn [m1.count(), m2.count()]`, [1, 0])].join('\n'),
        hint: 'Create self.books = [] inside __init__, so every member gets their own list.' };
    } }
  ]);

  /* ================= B3.1.5  Encapsulation ================= */
  P.add('B3.1.5', [
    { id: 'enc-access', kind: 'mcq', term: 'State', marks: 1, make(R) {
      const owner = R.pick(P.data.names), bal = R.int(10, 90), via = R.chance(0.5);
      const code = `class Account:\n    def __init__(self, owner, balance):\n        self.owner = owner\n        self.__balance = balance\n\n    def get_balance(self):\n        return self.__balance\n\na = Account("${owner}", ${bal})\nprint(${via ? 'a.get_balance()' : 'a.__balance'})`;
      return { prompt: 'What happens when this program runs?', code,
        options: via ? [opt(String(bal), true, 'get_balance is a public method inside the class, so it can read the private attribute and return it.'), opt('AttributeError', false, 'Only code outside the class is blocked; the getter is inside the class.'), opt('None', false, 'get_balance returns the stored value.'), opt('__balance', false, 'The method returns the value, not the name.')]
          : [opt('AttributeError', true, '__balance is private: Python hides it from code outside the class, so it must be read through get_balance().'), opt(String(bal), false, 'The double underscore makes the attribute private, so it can\'t be read directly from outside.'), opt('None', false, 'Python raises an error rather than returning None.'), opt(owner, false, 'That is the public owner attribute.')],
        check: { code: `try:\n${code.split('\n').map(l => '    ' + l).join('\n')}\nexcept AttributeError:\n    print("AttributeError")`, expect: via ? String(bal) : 'AttributeError' } };
    } },
    { id: 'enc-setter', kind: 'output', term: 'Determine', marks: 3, make(R) {
      const name = R.pick(P.data.names), lo = 0, hi = 100, vals = R.shuffle([R.int(40, 99), R.pick([120, 105, 150]), R.pick([-5, -1]), R.int(20, 90)]).slice(0, R.int(3, 4));
      let score = 0; const out = vals.map(v => { const ok = v >= lo && v <= hi; if (ok) score = v; return py.b(ok); });
      out.push(String(score));
      return { prompt: 'What does this program print?',
        code: `class Student:\n    def __init__(self, name):\n        self.__name = name\n        self.__score = 0\n\n    def set_score(self, s):\n        if s >= ${lo} and s <= ${hi}:\n            self.__score = s\n            return True\n        return False\n\n    def get_score(self):\n        return self.__score\n\nst = Student("${name}")\n` + vals.map(v => `print(st.set_score(${v}))`).join('\n') + '\nprint(st.get_score())',
        answer: out.join('\n'), explain: `<p>The setter only accepts scores from ${lo} to ${hi}. ${vals.map(v => `${v} is ${v >= lo && v <= hi ? 'accepted' : 'rejected'}`).join('; ')}. Rejected values never reach the private attribute, so the final score is ${score}. This is how encapsulation protects an object's state.</p>` };
    } },
    { id: 'enc-concept', kind: 'mcq', term: 'Explain', marks: 1, make(R) {
      const QS = [
        ['What is <strong>information hiding</strong>?', 'Keeping an object\'s internal data private, so other code can only use its public methods', [['Encrypting data in a file', 'That is encryption, not an OOP concept.'], ['Deleting attributes that are no longer needed', 'Data is hidden, not deleted.'], ['Giving variables short names', 'Naming has nothing to do with it.']], 'Callers see what an object can do, not how it stores its data.'],
        ['Why make an attribute such as <code>balance</code> private?', 'So it can only change through methods that check the new value', [['To make the program run faster', 'Privacy is about protection, not speed.'], ['So no code at all can ever read it', 'The class\'s own methods (e.g. a getter) can still read it.'], ['Because Python requires all attributes to be private', 'Python allows public attributes.']], 'A setter can reject invalid values, e.g. a negative balance.'],
        ['How is an attribute made private in Python?', 'Start its name with two underscores, e.g. self.__balance', [['Write private before it', 'That is Java syntax, not Python.'], ['Start it with a capital letter', 'Capitals don\'t change access.'], ['Define it outside the class', 'That makes it a global variable.']], 'Python name-mangles __names so they can\'t be reached directly from outside the class.'],
        ['Which pair of methods is typically used to give controlled access to a private attribute?', 'A getter and a setter', [['A constructor and a destructor', 'They create and remove objects.'], ['push and pop', 'Those are stack operations.'], ['A static and a class method', 'Neither is specifically for access control.']], 'The getter returns the value; the setter validates before changing it.'],
        ['What is <strong>encapsulation</strong>?', 'Bundling data with the methods that act on it in a class, and restricting direct access to that data', [['Splitting a program into many files', 'That is closer to modularization.'], ['A class inheriting from another class', 'That is inheritance.'], ['One method name behaving differently in different classes', 'That is polymorphism.']], 'It protects an object\'s state and hides implementation details.']
      ];
      const [q, ok, wrong, why] = R.pick(QS);
      return { prompt: q, options: [opt(ok, true, why), ...wrong.map(w => opt(w[0], false, w[1]))] };
    } },
    { id: 'enc-code', kind: 'code', term: 'Construct', marks: 5, make(R) {
      const lo = R.int(15, 18), hi = R.int(24, 28), start = R.int(lo + 1, hi - 1), good = R.int(lo, hi), bad = [lo - R.int(1, 5), hi + R.int(1, 5)];
      return { prompt: `Write a class <code>Thermostat</code> with a <strong>private</strong> attribute for the temperature, set by the constructor. <code>get_temp()</code> returns it. <code>set_temp(t)</code> changes it and returns <code>True</code> only if <code>t</code> is between ${lo} and ${hi} inclusive; otherwise it leaves the temperature unchanged and returns <code>False</code>.`,
        starter: 'class Thermostat:\n    def __init__(self, temp):\n        pass\n',
        solution: `class Thermostat:\n    def __init__(self, temp):\n        self.__temp = temp\n\n    def get_temp(self):\n        return self.__temp\n\n    def set_temp(self, t):\n        if t >= ${lo} and t <= ${hi}:\n            self.__temp = t\n            return True\n        return False\n`,
        tests: [P.tblock('get_temp returns the starting value', `h = Thermostat(${start})\nreturn h.get_temp()`, start), P.tblock(`set_temp(${good}) is accepted`, `h = Thermostat(${start})\nreturn [h.set_temp(${good}), h.get_temp()]`, [true, good]),
          ...bad.map(b => P.tblock(`set_temp(${b}) is rejected`, `h = Thermostat(${start})\nreturn [h.set_temp(${b}), h.get_temp()]`, [false, start])),
          P.tblock(`the boundary ${hi} is accepted`, `h = Thermostat(${start})\nreturn h.set_temp(${hi})`, true),
          P.tblock('the temperature is private', `h = Thermostat(${start})\nreturn hasattr(h, "temp") or hasattr(h, "__temp")`, false)].join('\n'),
        hint: 'Use self.__temp. In set_temp, check the range first and only assign if it passes.' };
    } },
    { id: 'enc-written', kind: 'written', term: 'Explain', marks: 3, make(R) {
      const [cls, attr, rule] = R.pick([['BankAccount', 'balance', 'the balance must never go below 0'], ['Student', 'grade', 'grades must be from 1 to 7'], ['Locker', 'code', 'the code must be exactly 4 digits']]);
      return { prompt: `Explain how encapsulation protects the <code>${attr}</code> of a <code>${cls}</code> object, where ${rule}.`,
        markscheme: [`Make <code>${attr}</code> private (e.g. <code>self.__${attr}</code>) so code outside the class can't change it directly`, `Provide a public setter that validates the new value (${rule}) before storing it`, 'Provide a getter so other code can still read the value', 'Invalid values are rejected, so the object\'s state always stays valid'],
        model: '1 mark per point, up to 3.' };
    } }
  ]);
})(CodeCraft.practice);
