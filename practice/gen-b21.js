/* Practice generators — B2.1 Programming fundamentals (variables & types, substrings, exceptions, debugging). */
(function (P) {
  const { py, esc, code: C } = P;
  const opt = (text, ok, why) => ({ text, ok: !!ok, why });

  /* ================= B2.1.1  Variables & data types ================= */
  const TYPES = {
    Boolean: 'only two possible values, True or False (Python bool)',
    char: 'a single character (in Python, a str of length 1)',
    decimal: 'a number with a fractional part (Python float)',
    integer: 'a whole number (Python int)',
    string: 'a sequence of characters (Python str)'
  };
  const ITEMS = [
    ['the letter grade a student receives, e.g. \'B\'', 'char', 'it is exactly one character'],
    ['the number of books a student has borrowed', 'integer', 'it is a whole-number count'],
    ['a student\'s average mark, e.g. 72.5', 'decimal', 'it can have a fractional part'],
    ['whether a student has paid for the school trip', 'Boolean', 'there are only two possible values: paid or not paid'],
    ['a student\'s full name', 'string', 'it is a sequence of characters'],
    ['a phone number such as 07700 900123', 'string', 'it starts with 0, contains a space, and you never do arithmetic with it', { integer: 'An integer would drop the leading 0 and can\'t hold the space — and you never calculate with phone numbers.' }],
    ['the temperature in the science lab, e.g. 21.4 °C', 'decimal', 'it has a fractional part'],
    ['the number of students in a class', 'integer', 'you can\'t have part of a student'],
    ['whether the library is currently open', 'Boolean', 'it is either open (True) or closed (False)'],
    ['the price of a canteen meal, e.g. 3.75', 'decimal', 'prices have a fractional part'],
    ['the title of a library book', 'string', 'it is a sequence of characters'],
    ['the first initial of a student\'s name', 'char', 'it is a single character'],
    ['a locker code such as 0472', 'string', 'the leading 0 must be kept, and the code is never used in calculations', { integer: 'As an integer, 0472 would become 472 — the leading zero would be lost.' }],
    ['the year a student was born', 'integer', 'it is a whole number'],
    ['whether a book is overdue', 'Boolean', 'it is either overdue or not'],
    ['a house initial such as \'R\' for Red', 'char', 'it is one character'],
    ['the distance a student ran, e.g. 3.2 km', 'decimal', 'it has a fractional part'],
    ['a student\'s email address', 'string', 'it is text made of many characters']
  ];
  const ARITH = [
    ['a / b', (a, b) => py.f(a / b), (a, b) => `/ always gives a float: ${a} ÷ ${b} = ${py.f(a / b)}`],
    ['a // b', (a, b) => String(Math.floor(a / b)), (a, b) => `// is integer (floor) division: ${b} goes into ${a} ${Math.floor(a / b)} whole times`],
    ['a % b', (a, b) => String(a % b), (a, b) => `% gives the remainder: ${a} − ${b}×${Math.floor(a / b)} = ${a % b}`],
    ['a ** 2', (a) => String(a * a), (a) => `** is "to the power of": ${a}² = ${a * a}`],
    ['a + b * 2', (a, b) => String(a + b * 2), (a, b) => `* happens before +: ${b} × 2 = ${b * 2}, then ${a} + ${b * 2} = ${a + b * 2}`],
    ['(a + b) * 2', (a, b) => String((a + b) * 2), (a, b) => `brackets first: ${a} + ${b} = ${a + b}, then × 2 = ${(a + b) * 2}`],
    ['a - b * b', (a, b) => String(a - b * b), (a, b) => `** and * before −: ${b} × ${b} = ${b * b}, then ${a} − ${b * b} = ${a - b * b}`]
  ];
  P.add('B2.1.1', [
    { id: 'dt-choose', kind: 'mcq', term: 'Identify', marks: 1, make(R) {
      const [item, type, reason, special] = R.pick(ITEMS);
      const others = R.sample(Object.keys(TYPES).filter(t => t !== type), 3);
      return {
        prompt: `Which data type is most appropriate for storing <strong>${esc(item)}</strong>?`,
        options: [opt(type, true, `Yes — ${reason}. A ${type} holds ${TYPES[type]}.`),
          ...others.map(t => opt(t, false, (special && special[t]) || `A ${t} holds ${TYPES[t]} — that doesn't fit, because ${reason}.`))]
      };
    } },
    { id: 'dt-operators', kind: 'output', term: 'Trace', marks: 2, make(R) {
      // b is 2, 4, 5 or 8 so a / b is a short decimal (long repeating decimals print differently in some Python engines)
      let a, b; do { a = R.int(11, 40); b = R.pick([2, 4, 5, 8]); } while (a % b === 0);
      const ex = R.sample(ARITH, 3);
      return {
        prompt: 'What does this program print?',
        code: `a = ${a}\nb = ${b}\n` + ex.map(e => `print(${e[0]})`).join('\n'),
        answer: ex.map(e => e[1](a, b)).join('\n'),
        explain: P.list(ex.map(e => `${C(e[0])} → ${e[2](a, b)}`))
      };
    } },
    { id: 'dt-division', kind: 'mcq', term: 'State', marks: 1, make(R) {
      let a, b; do { a = R.int(13, 59); b = R.int(3, 9); } while (a % b === 0 || a % b === Math.floor(a / b) || a % b === Math.floor(a / b) + 1);
      const q = Math.floor(a / b), r = a % b, op = R.pick(['//', '%', '/']);
      const opts = {
        '//': [opt(String(q), true, `// is floor division: ${b} goes into ${a} ${q} whole times, and the remainder is thrown away.`),
          opt(py.f(a / b), false, 'That is the result of / (true division), which gives a float.'),
          opt(String(r), false, `That is the remainder, which % gives.`),
          opt(String(q + 1), false, '// rounds down (floors) — it never rounds up.')],
        '%': [opt(String(r), true, `% gives the remainder: ${a} = ${b} × ${q} + ${r}.`),
          opt(String(q), false, 'That is the quotient, which // gives.'),
          opt(py.f(a / b), false, 'That is the result of / (true division).'),
          opt(String(b - r), false, `That is how far ${a} is from the next multiple of ${b}, not the remainder.`)],
        '/': [opt(py.f(a / b), true, `/ is true division and always gives a float: ${a} ÷ ${b} = ${py.f(a / b)}.`),
          opt(String(q), false, 'That is floor division (//), which drops the fractional part.'),
          opt(String(r), false, 'That is the remainder (%).'),
          opt(String(Math.ceil(a / b)), false, '/ doesn\'t round to a whole number — it keeps the fractional part.')]
      }[op];
      return { prompt: `What does <code>print(${a} ${op} ${b})</code> output?`, options: opts, mono: true, check: { code: `print(${a} ${op} ${b})`, expect: opts[0].text } };
    } },
    { id: 'dt-casting', kind: 'mcq', term: 'State', marks: 1, make(R) {
      const x = R.int(2, 9), y = R.int(2, 9), d = R.int(2, 9) + R.pick([0.2, 0.5, 0.8]), m = R.int(2, 6);
      const T = [
        [`int("${x}") + int("${y}")`, String(x + y), [[`'${x}${y}'`, 'int() turns both strings into numbers first, so + adds them.'], [`'${x + y}'`, 'The result is an int, not a string — there are no quotes.'], ['TypeError', 'Both values are ints after int(), so they can be added.']], `int() converts each string to an integer, then + adds them: ${x + y}.`],
        [`str(${x}) + str(${y})`, `'${x}${y}'`, [[String(x + y), 'str() turns the numbers into strings, so + joins them instead of adding.'], [`'${x + y}'`, 'Strings are joined, not added: "' + x + '" + "' + y + '" is "' + x + y + '".'], ['TypeError', 'Both values are strings, so + can join them.']], `str() makes two strings, and + joins strings: '${x}${y}'.`],
        [`int(${d})`, String(Math.floor(d)), [[String(Math.round(d) === Math.floor(d) ? Math.floor(d) + 1 : Math.round(d)), 'int() doesn\'t round — it cuts off the fractional part.'], [String(d), 'int() returns a whole number, so the .' + String(d).split('.')[1] + ' is removed.'], ['ValueError', 'int() can convert a float; it just drops the fractional part.']], `int() truncates: it removes the fractional part of ${d}, giving ${Math.floor(d)}.`],
        [`int("${d}")`, 'ValueError', [[String(Math.floor(d)), `int(${d}) (a float) would give ${Math.floor(d)}, but "${d}" is a string, and int() only accepts strings that look like whole numbers.`], [String(d), 'int() can never return a decimal value.'], [String(Math.floor(d) + 1), 'int() never rounds — and here it can\'t convert the string at all.']], `int() can only convert a string that looks like a whole number. "${d}" has a decimal point, so Python raises ValueError. (Use float("${d}") instead.)`],
        [`float("${x}") * ${m}`, py.f(x * m), [[String(x * m), 'float() makes a float, so the result is shown with .0.'], [`'${String(x).repeat(m)}'`, 'float() converts the string to a number first, so * multiplies.'], ['TypeError', 'A float can be multiplied by an int.']], `float("${x}") is ${py.f(x)}, and ${py.f(x)} × ${m} = ${py.f(x * m)}.`],
        [`"${x}" * ${m}`, `'${String(x).repeat(m)}'`, [[String(x * m), 'The quotes make "' + x + '" a string, and * repeats a string rather than multiplying.'], ['TypeError', 'A string times an int is allowed: it repeats the string.'], [`'${Array(m).fill(x).join(' ')}'`, 'Repetition adds no spaces between the copies.']], `A string times an integer repeats the string ${m} times: '${String(x).repeat(m)}'.`],
        [`"${x}" + ${y}`, 'TypeError', [[`'${x}${y}'`, `Python won't join a str and an int automatically — you'd need str(${y}).`], [String(x + y), `"${x}" is a string, so this isn't arithmetic.`], [`'${x + y}'`, 'Python never converts the types for you here.']], 'You can\'t + a string and an integer: Python raises TypeError. Convert one of them first.'],
        [`type(${x * m} / ${m})`, '<class \'float\'>', [['<class \'int\'>', '/ always gives a float in Python 3, even when it divides exactly.'], [py.f(x), 'type() returns the data type, not the value.'], ['<class \'str\'>', 'Dividing numbers never gives a string.']], `/ always returns a float, so ${x * m} / ${m} is ${py.f(x)} and its type is float.`]
      ];
      const [expr, ok, wrong, why] = R.pick(T);
      return {
        prompt: `What is the result of evaluating <code>${esc(expr)}</code>?`,
        options: [opt(ok, true, why), ...wrong.map(w => opt(w[0], false, w[1]))], mono: true,
        check: { code: `try:\n    print(repr(${expr}))\nexcept Exception as e:\n    print(type(e).__name__)`, expect: ok }
      };
    } },
    { id: 'dt-trace', kind: 'trace', term: 'Trace', marks: 3, make(R) {
      const s = { a: R.int(2, 9), b: R.int(2, 9), c: 0 };
      const OPS = [
        ['c = a + b', s => { s.c = s.a + s.b; }],
        ['a = b * 2', s => { s.a = s.b * 2; }],
        ['b = a - b', s => { s.b = s.a - s.b; }],
        ['c = c + a', s => { s.c = s.c + s.a; }],
        ['a = c // b', s => { s.a = py.fdiv(s.c, s.b); }, s => s.b !== 0],
        ['b = c % a', s => { s.b = py.mod(s.c, s.a); }, s => s.a !== 0],
        ['a = a + 1', s => { s.a += 1; }],
        ['c = b * b', s => { s.c = s.b * s.b; }]
      ];
      const lines = [`a = ${s.a}`, `b = ${s.b}`, 'c = 0'];
      const rows = [[{ v: '1', given: true }, { v: String(s.a), given: true }, { v: '', given: true }, { v: '', given: true }],
        [{ v: '2', given: true }, { v: String(s.a), given: true }, { v: String(s.b), given: true }, { v: '', given: true }],
        [{ v: '3', given: true }, { v: String(s.a), given: true }, { v: String(s.b), given: true }, { v: '0', given: true }]];
      const steps = [];
      if (R.chance(0.35)) {
        ['c = a', 'a = b', 'b = c'].forEach(l => lines.push(l));
        const prev = { ...s };
        [s => { s.c = s.a; }, s => { s.a = s.b; }, s => { s.b = s.c; }].forEach((f, i) => { f(s); rows.push([{ v: String(lines.length - 2 + i), given: true }, { v: String(s.a) }, { v: String(s.b) }, { v: String(s.c) }]); });
        steps.push(`Lines 4–6 swap a and b using c as a temporary store: a becomes ${prev.b} and b becomes ${prev.a}.`);
      } else {
        const chosen = [];
        while (chosen.length < 4) {
          const o = R.pick(OPS);
          if (o[2] && !o[2](s)) continue;
          o[1](s); chosen.push(o[0]); lines.push(o[0]);
          rows.push([{ v: String(lines.length), given: true }, { v: String(s.a) }, { v: String(s.b) }, { v: String(s.c) }]);
          steps.push(`Line ${lines.length}: ${C(o[0])} → a = ${s.a}, b = ${s.b}, c = ${s.c}`);
        }
      }
      return {
        prompt: 'Complete the trace table. Each row shows the values of a, b and c <em>after</em> that line runs.',
        code: lines.join('\n'),
        columns: ['Line', 'a', 'b', 'c'], rows,
        check: { code: lines.join('\n') + '\nprint(a, b, c)', expect: `${s.a} ${s.b} ${s.c}` },
        explain: P.list(steps) + '<p>Only the variable on the left of <code>=</code> changes on each line; the others keep their values.</p>'
      };
    } },
    { id: 'dt-scope', kind: 'output', term: 'Trace', marks: 2, make(R) {
      const A = R.int(5, 20), B = R.int(2, 9), Cc = R.int(21, 40), v = R.int(0, 2);
      if (v === 0) return {
        prompt: 'What does this program print?',
        code: `points = ${A}\n\ndef add_bonus(points):\n    points = points + ${B}\n    print("Inside:", points)\n\nadd_bonus(${Cc})\nprint("Outside:", points)`,
        answer: `Inside: ${Cc + B}\nOutside: ${A}`,
        explain: `<p>The parameter <code>points</code> is a <strong>local</strong> variable: it starts as ${Cc} (the argument), becomes ${Cc + B}, and disappears when the function ends. The <strong>global</strong> <code>points</code> is a different variable and still holds ${A}.</p>`
      };
      if (v === 1) return {
        prompt: 'What does this program print?',
        code: `total = ${A}\n\ndef add_bonus(bonus):\n    global total\n    total = total + bonus\n\nadd_bonus(${B})\nadd_bonus(${Cc})\nprint(total)`,
        answer: String(A + B + Cc),
        explain: `<p><code>global total</code> means the function changes the global variable, so both calls add to it: ${A} + ${B} + ${Cc} = ${A + B + Cc}.</p>`
      };
      return {
        prompt: 'What does this program print?',
        code: `count = ${A}\n\ndef reset():\n    count = 0\n    return count\n\nprint(reset())\nprint(count)`,
        answer: `0\n${A}`,
        explain: `<p>Assigning to <code>count</code> inside <code>reset()</code> creates a new <strong>local</strong> variable, so the function returns 0 but the <strong>global</strong> <code>count</code> is unchanged at ${A}.</p>`
      };
    } },
    { id: 'dt-code', kind: 'code', term: 'Construct', marks: 3, make(R) {
      const v = R.int(0, 3);
      if (v === 0) {
        const [fn, unitA, unitB, k] = R.pick([['split_time', 'minutes', 'hours and minutes', 60], ['split_seconds', 'seconds', 'minutes and seconds', 60], ['split_money', 'cents', 'dollars and cents', 100]]);
        const vals = R.distinct(4, k + 1, k * 9);
        vals.push(R.int(1, k - 1));
        return {
          prompt: `Write a function <code>${fn}(total)</code> that takes a number of ${unitA} and returns the ${unitB} as a pair, e.g. <code>${fn}(${k * 2 + 5})</code> returns <code>(2, 5)</code>. Use <code>//</code> and <code>%</code>.`,
          starter: `def ${fn}(total):\n    # total: int\n    pass\n`,
          solution: `def ${fn}(total):\n    # total: int\n    return (total // ${k}, total % ${k})\n`,
          tests: vals.map(n => P.t(`${fn}(${n}) returns (${Math.floor(n / k)}, ${n % k})`, `${fn}(${n})`, { tuple: [Math.floor(n / k), n % k] })).join('\n'),
          hint: `How many whole ${k}s fit into total? That's total // ${k}. What's left over is total % ${k}.`
        };
      }
      if (v === 1) {
        const sets = Array.from({ length: 4 }, () => R.ints(3, 40, 100));
        return {
          prompt: 'Write a function <code>average_of_three(a, b, c)</code> that returns the mean of three marks as a decimal (float).',
          starter: 'def average_of_three(a, b, c):\n    pass\n',
          solution: 'def average_of_three(a, b, c):\n    return (a + b + c) / 3\n',
          tests: sets.map(([a, b, c]) => P.tf(`average_of_three(${a}, ${b}, ${c}) ≈ ${py.f((a + b + c) / 3)}`, `average_of_three(${a}, ${b}, ${c})`, { f: (a + b + c) / 3 })).join('\n'),
          hint: 'Add the three values first (in brackets), then divide by 3. Without brackets, only c is divided.'
        };
      }
      if (v === 2) {
        const nums = R.distinct(5, 1, 99);
        return {
          prompt: 'Write a function <code>is_even(n)</code> that returns <code>True</code> if <code>n</code> is even and <code>False</code> otherwise.',
          starter: 'def is_even(n):\n    pass\n',
          solution: 'def is_even(n):\n    return n % 2 == 0\n',
          tests: [...nums, 0].map(n => P.t(`is_even(${n}) returns ${py.b(n % 2 === 0)}`, `is_even(${n})`, n % 2 === 0)).join('\n'),
          hint: 'An even number leaves a remainder of 0 when divided by 2. The comparison n % 2 == 0 is already True or False.'
        };
      }
      const temps = R.distinct(4, -10, 40);
      return {
        prompt: 'Write a function <code>to_fahrenheit(celsius)</code> that returns the temperature in °F using <code>F = C × 9 / 5 + 32</code>.',
        starter: 'def to_fahrenheit(celsius):\n    pass\n',
        solution: 'def to_fahrenheit(celsius):\n    return celsius * 9 / 5 + 32\n',
        tests: temps.map(t => P.tf(`to_fahrenheit(${t}) ≈ ${py.f(t * 9 / 5 + 32)}`, `to_fahrenheit(${t})`, { f: t * 9 / 5 + 32 })).join('\n'),
        hint: 'Translate the formula directly: celsius * 9 / 5 + 32, and return it.'
      };
    } }
  ]);

  /* ================= B2.1.2  Substrings ================= */
  const STRS = ['COMPUTER', 'LIBRARY', 'CANTEEN', 'ALGORITHM', 'KEYBOARD', 'NETWORK', 'VARIABLE', 'IB2027-CS', 'STU-4821', 'Library', 'Python', 'Canteen Queue', 'Sports Day'];
  P.add('B2.1.2', [
    { id: 'str-ops', kind: 'output', term: 'Trace', marks: 2, make(R) {
      const s = R.pick(STRS), n = s.length;
      const OPS = [
        () => { const i = R.int(0, n - 1); return [`s[${i}]`, s[i], `index ${i} is the ${i + 1}${['st', 'nd', 'rd'][i] || 'th'} character (indexes start at 0)`]; },
        () => { const k = R.int(1, 3); return [`s[-${k}]`, s[n - k], `negative indexes count from the end: -1 is the last character, so -${k} is ${py.s(s[n - k])}`]; },
        () => { const a = R.int(0, n - 3), b = R.int(a + 2, n); return [`s[${a}:${b}]`, s.slice(a, b), `from index ${a} up to (but not including) index ${b}`]; },
        () => { const k = R.int(2, n - 2); return [`s[:${k}]`, s.slice(0, k), `the first ${k} characters`]; },
        () => { const k = R.int(2, n - 2); return [`s[${k}:]`, s.slice(k), `everything from index ${k} to the end`]; },
        () => ['len(s)', String(n), `${py.s(s)} has ${n} characters`],
        () => s === s.toUpperCase() ? ['s.lower()', s.toLowerCase(), 'converts every letter to lower case'] : ['s.upper()', s.toUpperCase(), 'converts every letter to upper case'],
        () => { const ch = R.pick([...s]); return [`s.find("${ch}")`, String(s.indexOf(ch)), `the index of the first ${py.s(ch)}`]; },
        () => ['s.find("Z")', String(s.indexOf('Z')), s.includes('Z') ? 'the index of the first "Z"' : 'find() returns -1 when the text isn\'t there'],
        () => { const ch = R.pick([...s].filter(c => /[A-Za-z]/.test(c))); const r = s.split(ch).join('*'); return [`s.replace("${ch}", "*")`, r, `replace() changes every ${py.s(ch)} — and returns a new string`]; },
        () => { const ch = R.pick(['A', 'E', 'O', 'R', 'x']); return [`"${ch}" in s`, py.b(s.includes(ch)), `in checks whether ${py.s(ch)} appears in s`]; }
      ];
      const picks = R.sample(OPS, 3).map(f => f());
      return {
        prompt: 'What does this program print?',
        code: `s = "${s}"\n` + picks.map(p => `print(${p[0]})`).join('\n'),
        answer: picks.map(p => p[1]).join('\n'),
        explain: P.list(picks.map(p => `${C(p[0])} → ${esc(p[1])}: ${p[2]}`))
      };
    } },
    { id: 'str-slice', kind: 'mcq', term: 'Identify', marks: 1, make(R) {
      let s, a, b, target, cands;
      for (;;) {
        s = R.pick(STRS.filter(x => x.length >= 7)); const n = s.length;
        a = R.int(1, n - 4); b = R.int(a + 2, Math.min(n - 1, a + 5)); target = s.slice(a, b);
        cands = [
          [`s[${a}:${b - 1}]`, s.slice(a, b - 1), 'it stops one character too early — the end index is not included, so it should be ' + b],
          [`s[${a + 1}:${b + 1}]`, s.slice(a + 1, b + 1), 'this counts positions from 1, but Python indexes start at 0'],
          [`s[${a}:${b + 1}]`, s.slice(a, b + 1), 'it includes one character too many'],
          [`s[${a - 1}:${b}]`, s.slice(a - 1, b), 'it starts one character too early'],
          [`s[${a + 1}:${b}]`, s.slice(a + 1, b), 'it starts one character too late']
        ].filter(c => c[1] !== target);
        if (cands.length >= 3) break;
      }
      return {
        prompt: `<code>s = "${s}"</code>. Which expression gives <code>${py.s(target)}</code>?`,
        options: [opt(`s[${a}:${b}]`, true, `It starts at index ${a} and stops before index ${b}, giving ${py.s(target)}.`),
          ...R.sample(cands, 3).map(c => opt(c[0], false, `This gives ${py.s(c[1])} — ${c[2]}.`))], mono: true,
        check: { code: `s = "${s}"\nprint(repr(s[${a}:${b}]))`, expect: py.s(target) }
      };
    } },
    { id: 'str-immutable', kind: 'mcq', term: 'State', marks: 1, make(R) {
      const name = R.pick(['Ben', 'Mia', 'Dev', 'Kai', 'Lena', 'Sami']), L = R.pick(['K', 'J', 'T', 'R'].filter(c => c !== name[0])), fixed = L + name.slice(1);
      if (R.chance(0.5)) return {
        prompt: 'What happens when this code runs?', code: `name = "${name}"\nname[0] = "${L}"\nprint(name)`,
        options: [opt('A TypeError is raised', true, 'Strings are immutable: you can\'t change one character in place. Build a new string instead.'),
          opt(fixed, false, `Python doesn't let you assign to name[0]. To get ${py.s(fixed)} you'd write name = "${L}" + name[1:].`),
          opt(name, false, 'The error on line 2 stops the program before print runs.'),
          opt(L, false, 'Assigning to an index of a string is not allowed at all.')],
        check: { code: `name = "${name}"\ntry:\n    name[0] = "${L}"\n    print(name)\nexcept TypeError:\n    print("A TypeError is raised")`, expect: 'A TypeError is raised' }
      };
      return {
        prompt: `<code>name = "${name}"</code>. Which line changes <code>name</code> to <code>"${fixed}"</code>?`,
        options: [opt(`name = "${L}" + name[1:]`, true, `name[1:] is ${py.s(name.slice(1))}; joining "${L}" to the front makes a new string, which is assigned back to name.`),
          opt(`name[0] = "${L}"`, false, 'Strings are immutable, so this raises TypeError.'),
          opt(`name.replace("${name[0]}", "${L}")`, false, 'replace() returns a new string, but it isn\'t assigned back, so name doesn\'t change.'),
          opt(`name = name[0] + "${L}"`, false, `This gives ${py.s(name[0] + L)} — the first letter plus "${L}".`)], mono: true,
        check: { code: `name = "${name}"\nname = "${L}" + name[1:]\nprint(name)`, expect: fixed }
      };
    } },
    { id: 'str-loop', kind: 'output', term: 'Trace', marks: 2, make(R) {
      const v = R.int(0, 3), w = R.pick(P.data.words);
      if (v === 0) {
        const r = [...w].filter(c => 'AEIOU'.includes(c)).join('');
        return { prompt: 'What does this program print?', code: `word = "${w}"\nresult = ""\nfor ch in word:\n    if ch in "AEIOU":\n        result = result + ch\nprint(result)\nprint(len(result))`,
          answer: `${r}\n${r.length}`, explain: `<p>The loop visits each character of ${py.s(w)} and keeps only the vowels: ${[...r].join(', ')}. So result is ${py.s(r)}, which has ${r.length} characters.</p>` };
      }
      if (v === 1) {
        const r = [...w].reverse().join('');
        return { prompt: 'What does this program print?', code: `word = "${w}"\nresult = ""\nfor ch in word:\n    result = ch + result\nprint(result)`,
          answer: r, explain: '<p>Each character is added to the <em>front</em> of result, so the word comes out reversed: ' + py.s(r) + '.</p>' };
      }
      if (v === 2) {
        const text = R.pick(['banana bread', 'a cat and a hat', 'data analysis', 'java and lava', 'pasta salad']), ch = 'a', n = [...text].filter(c => c === ch).length;
        return { prompt: 'What does this program print?', code: `text = "${text}"\ncount = 0\nfor ch in text:\n    if ch == "${ch}":\n        count = count + 1\nprint(count)`,
          answer: String(n), explain: `<p>The loop adds 1 for every "a" in ${py.s(text)}: there are ${n}.</p>` };
      }
      const r = [...w].filter((c, i) => i % 2 === 0).join('');
      return { prompt: 'What does this program print?', code: `word = "${w}"\nresult = ""\nfor i in range(0, len(word), 2):\n    result = result + word[i]\nprint(result)`,
        answer: r, explain: `<p>range(0, ${w.length}, 2) gives the even indexes ${[...w].map((c, i) => i).filter(i => i % 2 === 0).join(', ')}, so result keeps the characters at those positions: ${py.s(r)}.</p>` };
    } },
    { id: 'str-code', kind: 'code', term: 'Construct', marks: 4, make(R) {
      const v = R.int(0, 4);
      if (v === 0) {
        const texts = R.sample(['the library is open', 'banana bread', 'computer science', 'stack and queue', 'sports day results', 'mississippi', 'canteen menu'], 4), ch = R.pick(['a', 'e', 's', 'n', 'i']);
        return {
          prompt: `Write <code>count_char(text, ch)</code> that returns how many times the character <code>ch</code> appears in <code>text</code>. <strong>No built-ins:</strong> don't use <code>.count()</code>.`,
          starter: 'def count_char(text, ch):\n    pass\n',
          solution: 'def count_char(text, ch):\n    total = 0\n    for c in text:\n        if c == ch:\n            total = total + 1\n    return total\n',
          tests: texts.map(t => P.t(`count_char(${py.s(t)}, ${py.s(ch)}) returns ${[...t].filter(c => c === ch).length}`, `count_char(${py.s(t)}, ${py.s(ch)})`, [...t].filter(c => c === ch).length)).join('\n') + '\n' + P.t('count_char("", "a") returns 0', 'count_char("", "a")', 0),
          banned: P.ban('count'), hint: 'Start a counter at 0, loop over every character, and add 1 when it matches ch.'
        };
      }
      if (v === 1) {
        const words = R.sample(P.data.words.concat(['level', 'Hana', 'IB2027']), 4);
        return {
          prompt: 'Write <code>reverse_text(text)</code> that returns the text backwards. <strong>No built-ins:</strong> don\'t use <code>[::-1]</code> or <code>reversed()</code>.',
          starter: 'def reverse_text(text):\n    pass\n',
          solution: 'def reverse_text(text):\n    result = ""\n    for ch in text:\n        result = ch + result\n    return result\n',
          tests: words.map(w => P.t(`reverse_text(${py.s(w)}) returns ${py.s([...w].reverse().join(''))}`, `reverse_text(${py.s(w)})`, [...w].reverse().join(''))).join('\n'),
          banned: P.ban('slicerev', 'reversed'), hint: 'Build a new string by adding each character to the front of it.'
        };
      }
      if (v === 2) {
        const people = Array.from({ length: 4 }, () => (R.chance(0.3) ? [R.pick(P.data.names), R.pick(P.data.names), R.pick(P.data.surnames)] : [R.pick(P.data.names), R.pick(P.data.surnames)]).join(' '));
        return {
          prompt: 'Write <code>initials(full_name)</code> that returns the first letter of each word, e.g. <code>initials("Ada Lovelace")</code> returns <code>"AL"</code>.',
          starter: 'def initials(full_name):\n    pass\n',
          solution: 'def initials(full_name):\n    result = ""\n    for word in full_name.split():\n        result = result + word[0]\n    return result\n',
          tests: people.map(p => P.t(`initials(${py.s(p)}) returns ${py.s(p.split(' ').map(w => w[0]).join(''))}`, `initials(${py.s(p)})`, p.split(' ').map(w => w[0]).join(''))).join('\n'),
          hint: 'full_name.split() gives a list of the words. Take word[0] from each.'
        };
      }
      if (v === 3) {
        const pre = R.pick(['LB', 'ST', 'CS', 'RM']), d = R.int(3, 5), digits = k => Array.from({ length: k }, () => R.int(0, 9)).join('');
        const cases = [[pre + digits(d), true], [pre + digits(d), true], [R.pick(['XX', 'AB', 'ZZ']) + digits(d), false], [pre + digits(d - 1), false], [pre + digits(d + 1), false], [pre + digits(d - 1) + 'A', false]];
        return {
          prompt: `A valid library code starts with <code>"${pre}"</code> followed by exactly ${d} digits (e.g. <code>"${pre}${'0123456789'.slice(0, d)}"</code>). Write <code>is_valid_code(code)</code> that returns <code>True</code> or <code>False</code>.`,
          starter: 'def is_valid_code(code):\n    pass\n',
          solution: `def is_valid_code(code):\n    if len(code) != ${2 + d}:\n        return False\n    if code[:2] != "${pre}":\n        return False\n    return code[2:].isdigit()\n`,
          tests: cases.map(([c, ok]) => P.t(`is_valid_code(${py.s(c)}) returns ${py.b(ok)}`, `is_valid_code(${py.s(c)})`, ok)).join('\n'),
          hint: `Check three things: the length is ${2 + d}, code[:2] is "${pre}", and code[2:].isdigit() is True.`
        };
      }
      const k = R.pick([3, 4]);
      const people = Array.from({ length: 4 }, () => [R.pick(P.data.names), R.pick(P.data.surnames), R.int(2007, 2012)]);
      const make = (f, l, y) => (l.slice(0, k) + f[0]).toLowerCase() + String(y).slice(2);
      return {
        prompt: `Usernames are the first ${k} letters of the surname, then the first letter of the first name, then the last two digits of the year, all lower case — e.g. <code>make_username("Ada", "Lovelace", 2009)</code> returns <code>"${make('Ada', 'Lovelace', 2009)}"</code>. Write <code>make_username(first, last, year)</code>.`,
        starter: 'def make_username(first, last, year):\n    pass\n',
        solution: `def make_username(first, last, year):\n    name = last[:${k}] + first[0]\n    return name.lower() + str(year)[2:]\n`,
        tests: people.map(([f, l, y]) => P.t(`make_username(${py.s(f)}, ${py.s(l)}, ${y}) returns ${py.s(make(f, l, y))}`, `make_username(${py.s(f)}, ${py.s(l)}, ${y})`, make(f, l, y))).join('\n'),
        hint: `Use slicing: last[:${k}] and first[0]. Turn the year into a string with str(year) before slicing [2:].`
      };
    } }
  ]);

  /* ================= B2.1.3  Exception handling ================= */
  const EXC = {
    ValueError: 'the value has the right type but is unsuitable, e.g. int("abc")',
    ZeroDivisionError: 'a number is divided by zero',
    IndexError: 'a list or string position doesn\'t exist',
    FileNotFoundError: 'a file opened for reading doesn\'t exist',
    TypeError: 'an operation is used on incompatible types, e.g. "Age: " + 16',
    NameError: 'a variable or function name hasn\'t been defined'
  };
  P.add('B2.1.3', [
    { id: 'ex-flow', kind: 'output', term: 'Trace', marks: 3, make(R) {
      if (R.chance(0.65)) {
        const tot = R.pick([60, 72, 84, 96, 120]), good = R.pick([2, 3, 4, 6]);
        const text = R.pick([String(good), String(good), '0', 'abc', '3.5', 'six']);
        const out = [];
        let n = null;
        if (/^\d+$/.test(text)) { n = +text; out.push(`Number: ${n}`); if (n === 0) out.push('Cannot share between 0 people'); else out.push(`Each gets: ${Math.floor(tot / n)}`); }
        else out.push('Please type a whole number');
        out.push('Done');
        return {
          prompt: `What does this program print when <code>text</code> is <code>"${text}"</code>?`,
          code: `text = "${text}"\ntry:\n    n = int(text)\n    print("Number:", n)\n    print("Each gets:", ${tot} // n)\nexcept ValueError:\n    print("Please type a whole number")\nexcept ZeroDivisionError:\n    print("Cannot share between 0 people")\nfinally:\n    print("Done")`,
          answer: out.join('\n'),
          explain: n === null ? `<p>int("${text}") raises <strong>ValueError</strong> straight away, so the rest of the try block is skipped and the ValueError block runs. <code>finally</code> always runs.</p>`
            : n === 0 ? '<p>int("0") works, so "Number: 0" is printed. Then 72 // 0 raises <strong>ZeroDivisionError</strong>, so that except block runs. <code>finally</code> always runs.</p>'.replace('72', tot)
              : `<p>No exception happens: both prints in the try block run (${tot} // ${n} = ${Math.floor(tot / n)}), no except block runs, and <code>finally</code> runs last.</p>`
        };
      }
      const scores = R.ints(R.int(3, 5), 40, 99), i = R.pick([0, 1, scores.length - 1, scores.length, scores.length + 1]);
      const ok = i < scores.length;
      return {
        prompt: 'What does this program print?',
        code: `scores = ${py.r(scores)}\ni = ${i}\ntry:\n    print("Score:", scores[i])\nexcept IndexError:\n    print("No score at position", i)\nfinally:\n    print("Checked")`,
        answer: (ok ? `Score: ${scores[i]}` : `No score at position ${i}`) + '\nChecked',
        explain: ok ? `<p>scores[${i}] exists (${scores[i]}), so no exception is raised. <code>finally</code> still runs.</p>` : `<p>The list has ${scores.length} items, so the valid indexes are 0–${scores.length - 1}. scores[${i}] raises <strong>IndexError</strong>, the except block runs, then <code>finally</code>.</p>`
      };
    } },
    { id: 'ex-which', kind: 'mcq', term: 'Identify', marks: 1, make(R) {
      const n = R.int(2, 9), name = R.pick(P.data.names), xs = R.ints(3, 1, 9);
      const T = [
        ['ValueError', `age = int("${R.pick(['twelve', 'abc', '12.5', 'n/a'])}")`],
        ['ZeroDivisionError', `count = 0\naverage = ${n * 10} / count`],
        ['IndexError', `marks = ${py.r(xs)}\nprint(marks[3])`],
        ['FileNotFoundError', `f = open("${R.pick(['scores', 'loans', 'menu'])}_backup.txt", "r")`],
        ['TypeError', `message = "Age: " + ${R.int(11, 18)}`],
        ['NameError', `name = "${name}"\nprint(nmae)`]
      ];
      const [exc, snippet] = R.pick(T);
      const others = R.sample(Object.keys(EXC).filter(e => e !== exc), 3);
      return {
        prompt: 'Which exception does this code raise?', code: snippet,
        options: [opt(exc, true, `Correct — ${exc} is raised when ${EXC[exc]}.`), ...others.map(e => opt(e, false, `${e} is raised when ${EXC[e]}, which doesn't happen here.`))], mono: true,
        check: { code: `try:\n${snippet.split('\n').map(l => '    ' + l).join('\n')}\nexcept Exception as e:\n    print(type(e).__name__)`, expect: exc }
      };
    } },
    { id: 'ex-failure', kind: 'mcq', term: 'Identify', marks: 1, make(R) {
      const CATS = {
        'Unexpected input': ['the user or another system supplies data the program wasn\'t designed for', ['A user types "twelve" when asked for their age.', 'A teacher enters a mark of 150 for a test out of 100.', 'A date is entered as 31/02/2027.', 'A barcode scanner sends an empty ISBN.']],
        'Resource unavailability': ['something the program needs (a file, server, device or network) isn\'t available', ['The file scores.txt was deleted before the program opens it.', 'The school server is offline when the register is saved.', 'The printer is out of paper when the report is printed.', 'The Wi-Fi drops while results are uploading.']],
        'Logic error': ['the program runs but the algorithm itself is wrong', ['The average is calculated by dividing by the wrong count.', 'A loop stops one item early, so the last student is never processed.', 'A discount is added to the price instead of subtracted.', 'The highest mark is found using < instead of >.']]
      };
      const cat = R.pick(Object.keys(CATS)), text = R.pick(CATS[cat][1]);
      return {
        prompt: `Which point of failure is this?<blockquote>${esc(text)}</blockquote>`,
        options: Object.keys(CATS).map(c => opt(c, c === cat, c === cat ? `Yes — ${CATS[c][0]}.` : `${c} means ${CATS[c][0]}.`))
      };
    } },
    { id: 'ex-concept', kind: 'mcq', term: 'State', marks: 1, make(R) {
      const QS = [
        ['When does the <code>finally</code> block run?', ['Always — whether or not an exception was raised', 'finally is for clean-up that must always happen, such as closing a file.'],
          [['Only when an exception is raised', 'It also runs when the try block succeeds.'], ['Only when no exception is raised', 'It also runs after an except block.'], ['Only when no except block matches', 'It runs in every case.']]],
        ['Why is <code>except ValueError:</code> better than a bare <code>except:</code>?', ['Only the expected error is handled; other bugs are still reported', 'A bare except hides every error, including real bugs you need to see.'],
          [['It makes the program run faster', 'Speed isn\'t the reason — it\'s about only catching what you expect.'], ['Python requires an exception type after except', 'A bare except: is allowed; it\'s just bad practice.'], ['It stops the finally block running', 'finally always runs.']]],
        ['An exception is raised in a <code>try</code> block and no <code>except</code> matches it. What happens?', ['finally runs, then the program stops with the error', 'Unmatched exceptions still crash the program — finally runs first.'],
          [['The program carries on after the try block', 'Only a matching except block handles the error.'], ['The exception is ignored', 'Exceptions are never silently ignored unless caught.'], ['finally is skipped', 'finally runs even when the program is about to crash.']]],
        ['What is the main purpose of exception handling?', ['To let a program respond to run-time errors without crashing', 'try/except lets the program recover, e.g. by asking for the input again.'],
          [['To find syntax errors before the program runs', 'Syntax errors stop the program before it starts; try/except can\'t catch them in the same file.'], ['To make errors impossible', 'Errors can still happen — handling decides what to do when they do.'], ['To make loops run faster', 'It has nothing to do with speed.']]],
        ['Which statement should go inside the <code>try</code> block?', ['The line that might fail, e.g. <code>n = int(text)</code>', 'Only code that can raise the exception needs protecting.'],
          [['Every line of the program', 'Wrapping everything hides where errors come from.'], ['The print that says "Done"', 'Code that must always run belongs in finally.'], ['The except block', 'except comes after try, not inside it.']]]
      ];
      const [q, ok, wrong] = R.pick(QS);
      return { prompt: q, options: [opt(ok[0], true, ok[1]), ...wrong.map(w => opt(w[0], false, w[1]))] };
    } },
    { id: 'ex-code', kind: 'code', term: 'Construct', marks: 4, make(R) {
      const v = R.int(0, 2), req = [{ label: 'a try block', re: '\\btry\\s*:' }, { label: 'an except block', re: '\\bexcept\\b' }];
      if (v === 0) {
        const good = [String(R.int(1, 99)), String(-R.int(1, 30))], bad = R.sample(['abc', '3.5', '', '12a', 'ten'], 3);
        return {
          prompt: 'Write <code>safe_int(text)</code> that returns <code>text</code> converted to an integer, or <code>None</code> if it isn\'t a whole number. Use <code>try</code> / <code>except ValueError</code>.',
          starter: 'def safe_int(text):\n    pass\n',
          solution: 'def safe_int(text):\n    try:\n        return int(text)\n    except ValueError:\n        return None\n',
          tests: [...good.map(g => P.t(`safe_int(${py.s(g)}) returns ${g}`, `safe_int(${py.s(g)})`, +g)), ...bad.map(b => P.t(`safe_int(${py.s(b)}) returns None`, `safe_int(${py.s(b)})`, null))].join('\n'),
          require: req, hint: 'Put return int(text) inside try. In except ValueError, return None.'
        };
      }
      if (v === 1) {
        const pairs = [[R.int(10, 90), R.int(2, 9)], [R.int(10, 90), R.int(2, 9)], [R.int(10, 90), 0]];
        return {
          prompt: 'Write <code>safe_divide(a, b)</code> that returns <code>a / b</code>, or <code>None</code> if <code>b</code> is 0. Use <code>try</code> / <code>except ZeroDivisionError</code> (not an if statement).',
          starter: 'def safe_divide(a, b):\n    pass\n',
          solution: 'def safe_divide(a, b):\n    try:\n        return a / b\n    except ZeroDivisionError:\n        return None\n',
          tests: pairs.map(([a, b]) => b ? P.tf(`safe_divide(${a}, ${b}) ≈ ${py.f(a / b)}`, `safe_divide(${a}, ${b})`, { f: a / b }) : P.t(`safe_divide(${a}, 0) returns None`, `safe_divide(${a}, 0)`, null)).join('\n'),
          require: req, hint: 'Return a / b inside try; catch ZeroDivisionError and return None.'
        };
      }
      const files = {}, names = R.sample(['menu.txt', 'loans.txt', 'scores.txt', 'notes.txt'], 2);
      names.forEach(n => { files[n] = R.sample(P.data.names, 3).map(x => x + ',' + R.int(40, 99)).join('\n') + '\n'; });
      const missing = R.pick(['missing.txt', 'old_scores.txt', 'backup.txt']);
      return {
        prompt: `Write <code>read_first_line(filename)</code> that returns the first line of the file without its newline, or <code>"File not found"</code> if the file doesn't exist. (The Files tab has ${names.map(n => `<code>${n}</code>`).join(' and ')}.)`,
        starter: 'def read_first_line(filename):\n    pass\n',
        solution: 'def read_first_line(filename):\n    try:\n        f = open(filename, "r")\n        line = f.readline()\n        f.close()\n        return line.strip()\n    except FileNotFoundError:\n        return "File not found"\n',
        files,
        tests: [...names.map(n => P.t(`read_first_line(${py.s(n)}) returns ${py.s(files[n].split('\n')[0])}`, `read_first_line(${py.s(n)})`, files[n].split('\n')[0])), P.t(`read_first_line(${py.s(missing)}) returns "File not found"`, `read_first_line(${py.s(missing)})`, 'File not found')].join('\n'),
        require: req, hint: 'Open and read inside try. Catch FileNotFoundError. Use .strip() to remove the newline.'
      };
    } },
    { id: 'ex-describe', kind: 'written', term: 'Describe', marks: 3, make(R) {
      const sc = R.pick([
        ['a program that asks students to type their age', 'n = int(input("Age: "))', 'ValueError', 'ask again / show "Please type a whole number"'],
        ['a program that opens scores.txt, which may have been deleted', 'f = open("scores.txt", "r")', 'FileNotFoundError', 'show "File missing" / create a new file'],
        ['a calculator that divides by a number the user enters', 'result = total / n', 'ZeroDivisionError', 'show "Can\'t divide by zero" and ask for another number']
      ]);
      return {
        prompt: `Describe how <code>try</code>, <code>except</code> and <code>finally</code> could be used in ${sc[0]}.`,
        markscheme: [`Put the statement that might fail (e.g. <code>${esc(sc[1])}</code>) inside a <code>try</code> block`, `Add an <code>except ${sc[2]}</code> block that handles the error, e.g. ${sc[3]}`, 'Use <code>finally</code> for code that must always run, e.g. closing the file or printing a message', 'The program continues instead of crashing'],
        model: 'Award 1 mark per point, up to 3.'
      };
    } }
  ]);

  /* ================= B2.1.4  Debugging ================= */
  P.add('B2.1.4', [
    { id: 'dbg-trace-max', kind: 'trace', term: 'Trace', marks: 4, make(R) {
      const data = R.distinct(5, 10, 99);
      let best = data[0], pos = 0;
      const rows = [[{ v: '', given: true }, { v: '', given: true }, { v: '', given: true }, { v: String(best), given: true }, { v: '0', given: true }]];
      for (let i = 1; i < data.length; i++) {
        const c = data[i] > best;
        if (c) { best = data[i]; pos = i; }
        rows.push([{ v: String(i), given: true }, { v: String(data[i]) }, { v: py.b(c) }, { v: String(best) }, { v: String(pos) }]);
      }
      const code = `data = ${py.r(data)}\nbest = data[0]\npos = 0\nfor i in range(1, len(data)):\n    if data[i] > best:\n        best = data[i]\n        pos = i\nprint(pos, best)`;
      return {
        prompt: 'Complete the trace table. The first row shows the values before the loop; each other row shows the values at the end of that iteration. The comparison uses <code>best</code> from <em>before</em> the update.',
        code, columns: ['i', 'data[i]', 'data[i] > best', 'best', 'pos'], rows,
        extra: [{ label: 'Output', v: `${pos} ${best}` }], check: { code, expect: `${pos} ${best}` },
        explain: `<p>The algorithm keeps the largest value seen so far in <code>best</code> and its index in <code>pos</code>. The largest value is ${best} at index ${pos}.</p>`
      };
    } },
    { id: 'dbg-trace-count', kind: 'trace', term: 'Trace', marks: 3, make(R) {
      const pm = R.pick([40, 50, 60]), marks = R.ints(5, pm - 20, pm + 25);
      if (!marks.includes(pm) && R.chance(0.5)) marks[R.int(0, 4)] = pm;
      let count = 0, total = 0;
      const rows = [];
      marks.forEach(m => { const c = m >= pm; if (c) { count++; total += m; } rows.push([{ v: String(m), given: true }, { v: py.b(c) }, { v: String(count) }, { v: String(total) }]); });
      const code = `marks = ${py.r(marks)}\ncount = 0\ntotal = 0\nfor m in marks:\n    if m >= ${pm}:\n        count = count + 1\n        total = total + m\nprint(count, total)`;
      return {
        prompt: 'Complete the trace table, one row per iteration of the loop.', code,
        columns: ['m', `m >= ${pm}`, 'count', 'total'], rows,
        extra: [{ label: 'Output', v: `${count} ${total}` }], check: { code, expect: `${count} ${total}` },
        explain: `<p>Only marks of ${pm} or more update count and total${marks.includes(pm) ? ` — note that ${pm} itself counts, because >= includes the boundary` : ''}.</p>`
      };
    } },
    { id: 'dbg-find-bug', kind: 'mcq', term: 'Identify', marks: 2, make(R) {
      const tpl = R.int(0, 3);
      let lines, task, desc, muts;
      if (tpl === 0) {
        const marks = R.ints(R.int(4, 6), 45, 95), n = marks.length;
        lines = [`marks = ${py.r(marks)}`, 'total = 0', 'for m in marks:', '    total = total + m', 'average = total / len(marks)', 'print(average)'];
        task = 'print the average of the marks';
        desc = ['stores the marks', 'starts the running total at 0', 'visits every mark', 'adds each mark to the total', 'divides the total by the number of marks', 'prints the result'];
        muts = [[2, 'total = 1', 'total must start at 0 — starting at 1 adds an extra 1 to the sum'], [4, '    total = m', 'this replaces total with each mark instead of adding to it; it should be total = total + m'],
          [5, `average = total / ${n - 1}`, `it divides by ${n - 1}, but there are ${n} marks; use len(marks)`]];
      } else if (tpl === 1) {
        const pm = R.pick([40, 50, 60]), marks = R.shuffle([pm, pm + R.int(1, 30), ...R.ints(3, pm - 25, pm + 30)]);
        lines = [`marks = ${py.r(marks)}`, 'passes = 0', 'for m in marks:', `    if m >= ${pm}:`, '        passes = passes + 1', 'print(passes)'];
        task = `count the marks of ${pm} or more`;
        desc = ['stores the marks', 'starts the counter at 0', 'visits every mark', `tests for ${pm} or more`, 'adds one to the counter', 'prints the count'];
        muts = [[4, `    if m > ${pm}:`, `> leaves out a mark of exactly ${pm}; "${pm} or more" needs >=`], [2, 'passes = 1', 'the counter must start at 0'], [5, '        passes = 1', 'this sets passes to 1 instead of adding 1 each time']];
      } else if (tpl === 2) {
        const n = R.int(5, 12);
        lines = [`n = ${n}`, 'total = 0', 'for i in range(1, n + 1):', '    total = total + i', 'print(total)'];
        task = `add up the numbers from 1 to ${n}`;
        desc = ['sets n', 'starts the total at 0', 'counts i from 1 to n inclusive', 'adds i to the total', 'prints the total'];
        muts = [[3, 'for i in range(1, n):', 'range() stops before its end value, so n itself is never added; it should be range(1, n + 1)'], [4, '    total = total + n', 'it adds n every time instead of i'], [2, 'total = n', 'the total must start at 0']];
      } else {
        const temps = R.distinct(5, -15, -1);
        lines = [`temps = ${py.r(temps)}`, 'highest = temps[0]', 'for t in temps:', '    if t > highest:', '        highest = t', 'print(highest)'];
        task = 'print the highest winter temperature';
        desc = ['stores the temperatures', 'starts with the first temperature', 'visits every temperature', 'checks for a higher value', 'remembers the new highest', 'prints the result'];
        muts = [[4, '    if t < highest:', '< finds the lowest value; it should be >'], [2, 'highest = 0', 'all the temperatures are below 0, so starting at 0 means no value is ever higher; start with temps[0]']];
      }
      const [ln, bad, why] = R.pick(muts);
      const buggy = lines.slice(); buggy[ln - 1] = bad;
      const others = R.sample(lines.map((l, i) => i + 1).filter(i => i !== ln), 3);
      return {
        prompt: `This program should ${task}, but it gives the wrong result. Which line contains the error?`,
        code: buggy.join('\n'),
        options: [opt(`Line ${ln}`, true, `Line ${ln} is the bug: ${why}.`), ...others.map(i => opt(`Line ${i}`, false, `Line ${i} is correct — it ${desc[i - 1]}.`))],
        check: { code: `import io, contextlib\ndef out(src):\n    b = io.StringIO()\n    with contextlib.redirect_stdout(b):\n        exec(src, {})\n    return b.getvalue()\nprint(out(${py.s(buggy.join('\n'))}) != out(${py.s(lines.join('\n'))}))`, expect: 'True' }
      };
    } },
    { id: 'dbg-technique', kind: 'mcq', term: 'Identify', marks: 1, make(R) {
      const T = {
        'Trace table': ['recording each variable\'s value as the code runs, by hand', ['In the exam, you record each variable\'s value after every line to find where a loop goes wrong.', 'Without a computer, you work out what a short program outputs by tracking every variable on paper.']],
        'Breakpoints': ['pausing the program at a chosen line in the debugger to inspect variables', ['In the IDE you pause the program at line 40, just before it crashes, and inspect the variables.', 'You mark a line so the program stops there every time, then check the values at that point.']],
        'Print statements': ['adding temporary print() calls to show values while the program runs', ['You add a line that displays total inside the loop, to watch it change while the program runs.', 'You temporarily display "reached here" to see whether a function is ever called.']],
        'Step-by-step execution': ['running the program one line at a time in the debugger', ['You run the program one line at a time, watching which branch of the if statement is taken.', 'You advance through the loop one statement at a time to follow the order the code runs in.']]
      };
      const key = R.pick(Object.keys(T)), sc = R.pick(T[key][1]);
      return {
        prompt: `Which debugging technique is being used?<blockquote>${esc(sc)}</blockquote>`,
        options: Object.keys(T).map(k => opt(k, k === key, k === key ? `Yes — this is ${T[k][0]}.` : `${k} means ${T[k][0]}.`))
      };
    } },
    { id: 'dbg-print', kind: 'output', term: 'Trace', marks: 2, make(R) {
      const a = R.int(1, 3), b = a + R.int(3, 4), k = R.int(2, 5);
      let total = 0; const out = [];
      for (let i = a; i < b; i++) { total += i * k; out.push(`i = ${i} total = ${total}`); }
      out.push(`Final: ${total}`);
      return {
        prompt: 'A student added a print statement to debug this loop. What is printed?',
        code: `total = 0\nfor i in range(${a}, ${b}):\n    total = total + i * ${k}\n    print("i =", i, "total =", total)\nprint("Final:", total)`,
        answer: out.join('\n'),
        explain: `<p>range(${a}, ${b}) gives ${Array.from({ length: b - a }, (_, j) => a + j).join(', ')}. Each time round, i × ${k} is added and the debug line shows the new total.</p>`
      };
    } }
  ]);
})(CodeCraft.practice);
