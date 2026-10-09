/* Practice generators — B2.3 Programming constructs (sequence, selection, loops, functions). */
(function (P) {
  const { py, esc, code: C } = P;
  const opt = (text, ok, why) => ({ text, ok: !!ok, why });
  const range = (a, b, s = 1) => { const r = []; if (s > 0) for (let i = a; i < b; i += s) r.push(i); else for (let i = a; i > b; i += s) r.push(i); return r; };

  /* ================= B2.3.1  Sequence ================= */
  P.add('B2.3.1', [
    { id: 'seq-swap-trace', kind: 'output', term: 'State', marks: 1, make(R) {
      const [x, y] = R.distinct(2, 2, 40), [p, q] = R.pick([['a', 'b'], ['first', 'second'], ['left', 'right']]);
      return {
        prompt: 'This code is meant to swap the two values. What does it actually print?',
        code: `${p} = ${x}\n${q} = ${y}\n${p} = ${q}\n${q} = ${p}\nprint(${p}, ${q})`, answer: `${y} ${y}`,
        explain: `<p>Line 3 overwrites ${p} with ${y} — the original ${x} is lost. Line 4 then copies ${p} (now ${y}) into ${q}. Both end up as ${y}. Instruction order matters: you need a temporary variable to keep ${x}.</p>`
      };
    } },
    { id: 'seq-swap-fix', kind: 'mcq', term: 'Identify', marks: 2, make(R) {
      const tuple = R.chance(0.3);
      return {
        prompt: 'Which code correctly swaps the values of <code>x</code> and <code>y</code>?',
        options: [
          opt(tuple ? 'x, y = y, x' : 'temp = x\nx = y\ny = temp', true, tuple ? 'Python evaluates the right-hand side first, then assigns both at once, so the values swap.' : 'temp keeps x\'s original value safe before x is overwritten, so y can be given it afterwards.'),
          opt('x = y\ny = x', false, 'x is overwritten before its value is copied, so both end up holding y\'s value.'),
          opt('temp = x\nx = y\ny = x', false, 'y is given x, but x already holds y\'s value — the last line should be y = temp.'),
          opt('temp = y\nx = temp\ny = x', false, 'Both variables end up with y\'s original value; x\'s value is never saved.'),
          opt('x, y = x, y', false, 'This gives each variable its own value back, so nothing changes.')
        ], mono: true,
        check: { code: `x = 1\ny = 2\n${tuple ? 'x, y = y, x' : 'temp = x\nx = y\ny = temp'}\nprint(x, y)`, expect: '2 1' },
        steps: ['Test each option with simple values, e.g. x = 1 and y = 2. A correct swap must end with x = 2 and y = 1.',
          'Watch for the trap: as soon as one variable is overwritten, its old value is gone unless it was saved first.',
          tuple ? '<code>x, y = y, x</code> works out both values on the right first, then assigns them together, so nothing is lost.' : '<code>temp = x</code> saves x\'s value before <code>x = y</code> overwrites it; then <code>y = temp</code> gives y the saved value.']
      };
    } },
    { id: 'seq-order', kind: 'mcq', term: 'Identify', marks: 2, make(R) {
      const s = R.int(30, 48), pr = R.pick([3.5, 4.0, 4.5]), mins = R.int(70, 250), w = R.int(5, 12), nm = R.pick(P.data.names);
      const T = R.pick([
        [`score = ${s}`, 'percent = score / 50 * 100', 'passed = percent >= 60', 'print(passed)'],
        [`price = ${pr}`, 'discounted = price * 0.75', 'change = 5 - discounted', 'print(change)'],
        [`minutes = ${mins}`, 'hours = minutes // 60', 'left = minutes - hours * 60', 'print(hours, left)'],
        [`width = ${w}`, 'area = width * width', 'tiles = area // 4', 'print(tiles)'],
        [`name = "${nm}"`, 'initial = name[0]', 'badge = initial + "-" + str(len(name))', 'print(badge)']
      ]);
      const letters = ['A', 'B', 'C', 'D'], shown = R.shuffle([0, 1, 2, 3]); // shown[k] = index of the line labelled letters[k]
      const label = i => letters[shown.indexOf(i)];
      const vars = T.map(l => (l.match(/^(\w+) =/) || [])[1]);
      const firstError = order => {
        const have = new Set();
        for (const i of order) {
          const used = vars.filter((v, j) => v && j !== i && new RegExp('\\b' + v + '\\b').test(T[i].replace(/^\w+ =/, '')));
          const missing = used.find(v => !have.has(v));
          if (missing) return `line ${label(i)} uses ${C(missing)} before it has been given a value, which raises NameError`;
          if (vars[i]) have.add(vars[i]);
        }
        return null;
      };
      const correct = [0, 1, 2, 3].map(label).join(', ');
      const wrongs = [];
      while (wrongs.length < 3) {
        const perm = R.shuffle([0, 1, 2, 3]), txt = perm.map(label).join(', ');
        if (txt !== correct && !wrongs.some(w => w[0] === txt)) wrongs.push([txt, firstError(perm)]);
      }
      return {
        prompt: 'These four lines are in the wrong order. In which order must they run for the program to work?<div class="q-lines">' + letters.map((L, k) => `<div><b>${L}</b><code>${esc(T[shown[k]])}</code></div>`).join('') + '</div>',
        options: [opt(correct, true, 'Each line only uses variables that earlier lines have already assigned.'), ...wrongs.map(([t, e]) => opt(t, false, `In this order ${e}.`))],
        check: { code: `import io, contextlib\nwith contextlib.redirect_stdout(io.StringIO()):\n    exec(${py.s(T.join('\n'))})\nprint("ok")`, expect: 'ok' },
        steps: ['A line can only use a variable after another line has given it a value.',
          'Find the line that uses no other variables — it must go first. Then find the line that only needs that one, and so on.',
          `Following the chain gives ${correct}: ${T.map((l, i) => `${label(i)} <code>${esc(l)}</code>`).join(' → ')}.`]
      };
    } },
    { id: 'seq-infinite', kind: 'mcq', term: 'Identify', marks: 2, make(R) {
      const N = R.int(4, 9), odd = 2 * R.int(3, 7) + 1, even = 2 * R.int(3, 7), big = R.pick([40, 64, 100, 90]), T = R.pick([22, 31, 43]);
      const inf = R.pick([
        [`i = 0\nwhile i < ${N}:\n    print(i)`, 'i never changes inside the loop, so i < ' + N + ' is always True.'],
        [`n = ${odd}\nwhile n != 0:\n    n = n - 2`, `n is odd, so subtracting 2 jumps from 1 to -1 and never equals 0.`],
        ['x = 1\nwhile x > 0:\n    x = x + 1', 'x only ever increases, so x > 0 is always True.']
      ]);
      let k = 0, x = big; while (x > 1) { x = Math.floor(x / 2); k++; }
      const fine = R.sample([
        [`i = 0\nwhile i < ${N}:\n    i = i + 1`, `i increases by 1 each time, so it stops after ${N} iterations.`],
        [`n = ${even}\nwhile n != 0:\n    n = n - 2`, `n is even, so it reaches 0 after ${even / 2} iterations.`],
        [`for i in range(${N}):\n    print(i)`, `A counted loop always ends: it runs exactly ${N} times.`],
        [`x = ${big}\nwhile x > 1:\n    x = x // 2`, `x halves each time and reaches 1 after ${k} iterations.`],
        [`total = 0\nwhile total < ${T}:\n    total = total + 5`, `total grows by 5 each time and passes ${T} after ${Math.ceil(T / 5)} iterations.`]
      ], 3);
      return {
        prompt: 'Which of these loops never ends?',
        options: [opt(inf[0], true, inf[1]), ...fine.map(f => opt(f[0], false, f[1]))], mono: true,
        steps: ['For each while loop, find the variable in its condition and ask: does the loop body change it?',
          'If it changes, ask whether it moves <em>towards</em> making the condition False — and whether it can jump past the stopping value (e.g. counting down by 2 from an odd number never hits 0).',
          'A for loop over range() always ends. The loop whose condition can never become False runs forever.']
      };
    } },
    { id: 'seq-issue', kind: 'mcq', term: 'Identify', marks: 1, make(R) {
      const CATS = {
        'Infinite loop': ['a loop whose condition never becomes false, so the program never moves on', ['A countdown starts at 9, subtracts 2 each time and stops only when it equals 0.', 'A loop checks attempts < 3 but never adds 1 to attempts.', 'A validation loop asks for input again but keeps testing the old value.']],
        'Deadlock': ['two or more processes each wait for a resource the other holds, so none can continue', ['Two programs each lock one file, then each waits for the file the other has locked.', 'Process A holds the printer and waits for the scanner, while process B holds the scanner and waits for the printer.', 'Two students each hold one of the two lab keys and won\'t hand theirs over until they get the other.']],
        'Incorrect output': ['the program finishes, but the steps are in the wrong order or the logic is wrong, so the result is wrong', ['The program prints a grade before calculating it, so it shows the previous student\'s grade.', 'A swap overwrites one value before copying it, so both variables end up equal.', 'An average is divided by 10 when there are 12 marks.']]
      };
      const cat = R.pick(Object.keys(CATS)), text = R.pick(CATS[cat][1]);
      return {
        prompt: `Which problem does this describe?<blockquote>${esc(text)}</blockquote>`,
        options: Object.keys(CATS).map(c => opt(c, c === cat, c === cat ? `Yes — this is ${CATS[c][0]}.` : `${c} means ${CATS[c][0]}.`)),
        steps: ['Ask whether the program finishes.',
          'If it never finishes because a loop condition stays True → infinite loop. If it gets stuck because two processes each wait for something the other holds → deadlock. If it finishes but the answer is wrong → incorrect output.',
          `Here: ${CATS[cat][0]} — <strong>${cat.toLowerCase()}</strong>.`]
      };
    } },
    { id: 'seq-output', kind: 'output', term: 'State', marks: 2, make(R) {
      const A = R.int(6, 20) * 10, B = R.int(2, 9) * 5, before = R.chance(0.5);
      const fee = before ? Math.floor(A / 10) : Math.floor((A - B) / 10), end = A - B - fee;
      const lines = before ? ['fee = balance // 10', `balance = balance - ${B}`] : [`balance = balance - ${B}`, 'fee = balance // 10'];
      return {
        prompt: 'What does this program print?',
        code: `balance = ${A}\nprint("Start:", balance)\n${lines.join('\n')}\nbalance = balance - fee\nprint("End:", balance, "Fee:", fee)`,
        answer: `Start: ${A}\nEnd: ${end} Fee: ${fee}`,
        explain: `<p>The fee is worked out ${before ? `<strong>before</strong> ${B} is taken off: ${A} // 10 = ${fee}` : `<strong>after</strong> ${B} is taken off: ${A - B} // 10 = ${fee}`}. Then balance = ${A} − ${B} − ${fee} = ${end}. Swapping those two lines would change the fee — instruction order matters.</p>`
      };
    } }
  ]);

  /* ================= B2.3.2  Selection ================= */
  const bounds = R => { const b4 = R.int(35, 45), b5 = b4 + R.int(8, 12), b6 = b5 + R.int(8, 12), b7 = b6 + R.int(8, 12); return [b7, b6, b5, b4]; };
  const gradeOf = (s, b) => (s >= b[0] ? 7 : s >= b[1] ? 6 : s >= b[2] ? 5 : s >= b[3] ? 4 : 3);
  P.add('B2.3.2', [
    { id: 'sel-grade', kind: 'output', term: 'State', marks: 2, make(R) {
      const b = bounds(R), score = R.chance(0.4) ? R.pick(b) : R.int(b[3] - 8, b[0] + 10), g = gradeOf(score, b);
      const which = [0, 1, 2, 3].find(i => score >= b[i]);
      return {
        prompt: 'What does this program print?',
        code: `# example boundaries\nscore = ${score}\nif score >= ${b[0]}:\n    grade = 7\nelif score >= ${b[1]}:\n    grade = 6\nelif score >= ${b[2]}:\n    grade = 5\nelif score >= ${b[3]}:\n    grade = 4\nelse:\n    grade = 3\nprint("Grade:", grade)`,
        answer: `Grade: ${g}`,
        explain: which === undefined ? `<p>${score} is below every boundary, so every condition is False and the <code>else</code> branch sets grade to 3.</p>`
          : `<p>Python tests the conditions from the top. ${which > 0 ? `${score} >= ${b.slice(0, which).join(', ')} ${which > 1 ? 'are' : 'is'} False; ` : ''}${score} >= ${b[which]} is True${score === b[which] ? ' (>= includes the boundary)' : ''}, so grade = ${g} and the remaining branches are skipped.</p>`
      };
    } },
    { id: 'sel-order-bug', kind: 'mcq', term: 'Identify', marks: 2, make(R) {
      const b = bounds(R).slice(1); // [b6, b5, b4]
      const hi = R.int(b[0], b[0] + 25), lows = [R.int(b[2] - 15, b[2] - 1), R.int(b[2], b[1] - 1), R.int(5, b[2] - 16)];
      const intended = s => (s >= b[0] ? 6 : s >= b[1] ? 5 : s >= b[2] ? 4 : 3);
      const actual = s => (s >= b[2] ? 4 : s >= b[1] ? 5 : s >= b[0] ? 6 : 3);
      return {
        prompt: 'This code puts the conditions in the wrong order. For which score does it give the <strong>wrong</strong> grade?',
        code: `if score >= ${b[2]}:\n    grade = 4\nelif score >= ${b[1]}:\n    grade = 5\nelif score >= ${b[0]}:\n    grade = 6\nelse:\n    grade = 3`,
        options: [opt(String(hi), true, `${hi} >= ${b[2]} is True on the first line, so it gets 4 instead of ${intended(hi)}. The later elif branches can never run — test the highest boundary first.`),
          ...lows.filter(s => actual(s) === intended(s)).map(s => opt(String(s), false, `${s} correctly gets ${actual(s)}.`))],
        check: { code: `score = ${hi}\nif score >= ${b[2]}:\n    grade = 4\nelif score >= ${b[1]}:\n    grade = 5\nelse:\n    grade = 3\nprint(grade != ${intended(hi)})`, expect: 'True' },
        steps: ['In an if/elif chain Python stops at the <em>first</em> True condition, so the order of the tests matters.',
          `The first test is <code>score >= ${b[2]}</code> — the lowest boundary. Any score of ${b[2]} or more makes it True and gets grade 4.`,
          `So a high score such as ${hi} never reaches the later branches and should have got ${intended(hi)}. Scores below ${b[2]} are unaffected. The fix is to test the highest boundary first.`]
      };
    } },
    { id: 'sel-bool', kind: 'output', term: 'State', marks: 2, make(R) {
      const a = R.int(1, 20), b = R.int(1, 20), flag = R.chance(0.5), X = R.int(5, 15), Y = R.int(5, 15);
      const E = R.sample([
        [`a > ${X} and b < ${Y}`, (a > X) && (b < Y), `${py.b(a > X)} and ${py.b(b < Y)} → and needs both to be True`],
        [`a > ${X} or b < ${Y}`, (a > X) || (b < Y), `${py.b(a > X)} or ${py.b(b < Y)} → or needs at least one True`],
        [`not a > ${X}`, !(a > X), `a > ${X} is ${py.b(a > X)}, and not flips it`],
        [`a > ${X} and b < ${Y} or flag`, ((a > X) && (b < Y)) || flag, `and is evaluated before or: (${py.b(a > X)} and ${py.b(b < Y)}) or ${py.b(flag)}`],
        ['not flag and a == b', !flag && a === b, `not flag is ${py.b(!flag)}; a == b is ${py.b(a === b)}`],
        ['a != b and not flag', a !== b && !flag, `a != b is ${py.b(a !== b)}; not flag is ${py.b(!flag)}`],
        [`a >= ${X} or b >= ${Y} and flag`, (a >= X) || ((b >= Y) && flag), `and first: ${py.b(b >= Y)} and ${py.b(flag)} = ${py.b((b >= Y) && flag)}, then ${py.b(a >= X)} or that`]
      ], 3);
      return {
        prompt: 'What does this program print?',
        code: `a = ${a}\nb = ${b}\nflag = ${py.b(flag)}\n` + E.map(e => `print(${e[0]})`).join('\n'),
        answer: E.map(e => py.b(e[1])).join('\n'),
        explain: P.list(E.map(e => `${C(e[0])}: ${e[2]} → <strong>${py.b(e[1])}</strong>`)) + '<p>Order of evaluation: <code>not</code>, then <code>and</code>, then <code>or</code>.</p>'
      };
    } },
    { id: 'sel-nested', kind: 'output', term: 'State', marks: 2, make(R) {
      const age = R.int(10, 19), mem = R.chance(0.5), price = R.int(5, 9), lim = R.int(13, 17), d1 = R.int(2, 3), d2 = 1, d3 = R.int(1, 2);
      const out = age < lim ? (mem ? price - d1 : price - d2) : (mem ? price - d3 : price);
      return {
        prompt: 'What does this program print?',
        code: `age = ${age}\nis_member = ${py.b(mem)}\nprice = ${price}\nif age < ${lim}:\n    if is_member:\n        price = price - ${d1}\n    else:\n        price = price - ${d2}\nelif is_member:\n    price = price - ${d3}\nprint("Price:", price)`,
        answer: `Price: ${out}`,
        explain: `<p>age < ${lim} is ${py.b(age < lim)}, so ${age < lim ? `the nested if runs: is_member is ${py.b(mem)}, so ${mem ? d1 : d2} is taken off` : `Python checks the elif: is_member is ${py.b(mem)}, so ${mem ? `${d3} is taken off` : 'nothing changes'}`}. Price = ${out}.</p>`
      };
    } },
    { id: 'sel-range', kind: 'mcq', term: 'Identify', marks: 1, make(R) {
      const [what, v, lo, hi] = R.pick([['a valid percentage', 'mark', 0, 100], ['the junior club age range', 'age', 11, 14], ['the canteen opening hours', 'hour', 8, 15], ['a valid house-points score', 'points', 1, 20], ['the years in Middle School', 'year', 6, 10]]);
      return {
        prompt: `Which condition checks that <code>${v}</code> is in ${what}, <strong>${lo} to ${hi} inclusive</strong>?`,
        options: [opt(`${v} >= ${lo} and ${v} <= ${hi}`, true, `Both limits use >= / <=, so ${lo} and ${hi} themselves are included, and and requires both to be True.`),
          opt(`${v} > ${lo} and ${v} < ${hi}`, false, `> and < leave out ${lo} and ${hi} themselves.`),
          opt(`${v} >= ${lo} or ${v} <= ${hi}`, false, `With or, every number passes: any ${v} is either >= ${lo} or <= ${hi}.`),
          opt(`${v} <= ${lo} and ${v} >= ${hi}`, false, `No number can be <= ${lo} and >= ${hi} at the same time, so this is always False.`)], mono: true,
        steps: [`"Inclusive" means ${lo} and ${hi} themselves count, so you need <code>&gt;=</code> and <code>&lt;=</code>, not <code>&gt;</code> and <code>&lt;</code>.`,
          'The value must pass <em>both</em> limits at once, so join them with <code>and</code> (with <code>or</code>, every number passes).',
          `Test the edges: ${lo} and ${hi} should be True, ${lo - 1} and ${hi + 1} should be False — only <code>${v} >= ${lo} and ${v} <= ${hi}</code> does that.`]
      };
    } },
    { id: 'sel-code', kind: 'code', term: 'Construct', marks: 4, make(R) {
      const v = R.int(0, 3);
      if (v === 0) {
        const c = R.int(5, 12), s = R.int(60, 67), [p1, p2, p3] = [R.int(2, 4), R.int(7, 10), R.int(4, 6)];
        const f = a => (a < c ? p1 : a < s ? p2 : p3);
        const ages = [c - 1, c, s - 1, s, R.int(c + 1, s - 2), R.int(s + 1, 85)];
        return {
          prompt: `The school play charges $${p1} for children under ${c}, $${p3} for anyone ${s} or over, and $${p2} for everyone else. Write <code>ticket_price(age)</code> that returns the price.`,
          starter: 'def ticket_price(age):\n    pass\n',
          solution: `def ticket_price(age):  # age is a whole number of years\n    if age < ${c}:  # "under ${c}" — ${c} itself is NOT included\n        return ${p1}  # child price\n    elif age >= ${s}:  # "${s} or over" — ${s} IS included\n        return ${p3}  # older adult price\n    else:  # everyone else: ${c} up to ${s - 1}\n        return ${p2}  # standard price\n`,
          tests: ages.map(a => P.t(`ticket_price(${a}) returns ${f(a)}`, `ticket_price(${a})`, f(a))).join('\n'),
          hint: `Use if / elif / else. Check the boundary ages ${c} and ${s} carefully: "under ${c}" means < ${c}, and "${s} or over" means >= ${s}.`,
          think: ['There are three groups, so use if / elif / else — exactly one branch runs.', `Turn the words into operators carefully: "under ${c}" is <code>age &lt; ${c}</code>; "${s} or over" is <code>age &gt;= ${s}</code>.`, 'Everyone else falls into the else branch, so it needs no condition.', `Check the boundary ages ${c - 1}, ${c}, ${s - 1} and ${s} in your head before running the tests.`],
          diagnose: [
            { match: `ticket_price\\(${c}\\)`, checks: `a ${c}-year-old, who is NOT "under ${c}"`, cause: `You probably used <code>&lt;=</code> instead of <code>&lt;</code>. "Under ${c}" means <code>age &lt; ${c}</code>.` },
            { match: `ticket_price\\(${s}\\)`, checks: `a ${s}-year-old, who IS "${s} or over"`, cause: `"${s} or over" includes ${s}, so use <code>age &gt;= ${s}</code>, not <code>&gt;</code>.` },
            { match: `ticket_price\\(${c - 1}\\)`, checks: `a ${c - 1}-year-old (a child)`, cause: `Children under ${c} pay ${p1}. Check the first condition and its price.` },
            { match: '.', checks: 'an age in one of the three groups', cause: 'Check each branch returns the right price for its group, and that you return rather than print.' }
          ]
        };
      }
      if (v === 1) {
        const x = R.int(8, 14), y = x + R.int(8, 14), f = t => (t < x ? 'Cold' : t < y ? 'Mild' : 'Hot');
        const ts = [x - 1, x, y - 1, y, R.int(-5, x - 2), R.int(y + 1, 38)];
        return {
          prompt: `Write <code>temperature_label(t)</code> that returns <code>"Cold"</code> below ${x}°C, <code>"Hot"</code> at ${y}°C or above, and <code>"Mild"</code> otherwise.`,
          starter: 'def temperature_label(t):\n    pass\n',
          solution: `def temperature_label(t):  # t is the temperature in °C\n    if t < ${x}:  # below ${x}\n        return "Cold"  # the coldest band\n    elif t < ${y}:  # only reached when t >= ${x}, so this means ${x} up to ${y - 1}\n        return "Mild"  # the middle band\n    else:  # ${y} or above\n        return "Hot"  # everything left is hot\n`,
          tests: ts.map(t => P.t(`temperature_label(${t}) returns ${py.s(f(t))}`, `temperature_label(${t})`, f(t))).join('\n'),
          hint: `Test the boundaries: ${x} should be "Mild" and ${y} should be "Hot".`,
          think: ['Three bands → if / elif / else.', `Work from the bottom: below ${x} is Cold. An elif is only checked when the first test was False, so <code>elif t &lt; ${y}</code> already means "${x} or more, but below ${y}".`, `Whatever is left (${y} or above) is Hot.`, `The boundaries are the risky values: ${x} is Mild and ${y} is Hot.`],
          diagnose: [
            { match: `\\(${x}\\)`, checks: `exactly ${x}°C, which should be "Mild"`, cause: `"Cold" is <em>below</em> ${x}, so the first test must be <code>t &lt; ${x}</code>, not <code>&lt;=</code>.` },
            { match: `\\(${y}\\)`, checks: `exactly ${y}°C, which should be "Hot"`, cause: `"Hot" starts at ${y}, so the Mild band must stop below it: <code>t &lt; ${y}</code>.` },
            { match: '.', checks: 'a temperature in one of the three bands', cause: 'Check the order of the tests and that each returns exactly "Cold", "Mild" or "Hot" (capital letter, no spaces).' }
          ]
        };
      }
      if (v === 2) {
        const lim = R.int(3, 6), cases = [[0, false], [lim - 1, false], [lim, false], [lim - 1, true], [R.int(0, lim - 2), true], [lim + 1, false]];
        const f = (n, fine) => n < lim && !fine;
        return {
          prompt: `A student can borrow another book if they have fewer than ${lim} books out <strong>and</strong> no unpaid fine. Write <code>can_borrow(books_out, has_fine)</code> that returns <code>True</code> or <code>False</code>.`,
          starter: 'def can_borrow(books_out, has_fine):\n    pass\n',
          solution: `def can_borrow(books_out, has_fine):  # a whole number and a Boolean\n    return books_out < ${lim} and not has_fine  # BOTH must be true; the expression is already True or False\n`,
          tests: cases.map(([n, fine]) => P.t(`can_borrow(${n}, ${py.b(fine)}) returns ${py.b(f(n, fine))}`, `can_borrow(${n}, ${py.b(fine)})`, f(n, fine))).join('\n'),
          hint: 'Combine two conditions with and. "No fine" is not has_fine.',
          think: ['Two conditions must <em>both</em> hold, so join them with <code>and</code>.', `"Fewer than ${lim}" is <code>books_out &lt; ${lim}</code>; "no unpaid fine" is <code>not has_fine</code>.`, 'The whole expression is already True or False, so return it directly.'],
          diagnose: [
            { match: 'True\\) returns False', checks: 'a student who has an unpaid fine', cause: 'A fine must block borrowing. Use <code>not has_fine</code> and join the conditions with <code>and</code>, not <code>or</code>.' },
            { match: `can_borrow\\(${lim}, False\\)`, checks: `a student with exactly ${lim} books out`, cause: `"Fewer than ${lim}" excludes ${lim} itself: use <code>&lt;</code>, not <code>&lt;=</code>.` },
            { match: '.', checks: 'whether a student may borrow another book', cause: `Return <code>books_out &lt; ${lim} and not has_fine</code>.` }
          ]
        };
      }
      const b = bounds(R), ps = [...b, b[0] + R.int(1, 9), b[3] - R.int(1, 9), R.int(b[2], b[1] - 1)];
      return {
        prompt: `Using these example boundaries — 7 at ${b[0]}+, 6 at ${b[1]}+, 5 at ${b[2]}+, 4 at ${b[3]}+, otherwise 3 — write <code>grade_for(percent)</code> that returns the grade.`,
        starter: 'def grade_for(percent):\n    pass\n',
        solution: `def grade_for(percent):  # percent is the exam percentage\n    if percent >= ${b[0]}:  # test the HIGHEST boundary first\n        return 7  # top grade\n    elif percent >= ${b[1]}:  # only reached if below ${b[0]}\n        return 6  # between ${b[1]} and ${b[0] - 1}\n    elif percent >= ${b[2]}:  # only reached if below ${b[1]}\n        return 5  # between ${b[2]} and ${b[1] - 1}\n    elif percent >= ${b[3]}:  # only reached if below ${b[2]}\n        return 4  # between ${b[3]} and ${b[2] - 1}\n    else:  # below every boundary\n        return 3  # the lowest grade in this example\n`,
        tests: ps.map(p => P.t(`grade_for(${p}) returns ${gradeOf(p, b)}`, `grade_for(${p})`, gradeOf(p, b))).join('\n'),
        hint: 'Start with the highest boundary and work down with elif, using >= so the boundary values count.',
        think: ['Python stops at the first True condition, so start with the highest boundary and work down.', 'Use <code>&gt;=</code> so a score exactly on a boundary gets the higher grade.', 'Each elif only runs when every test above it was False, so you never need to write an upper limit.', 'The final else catches everything below the lowest boundary.'],
        diagnose: [
          { match: '.', when: `percent\\s*>=\\s*${b[3]}\\s*:[\\s\\S]*percent\\s*>=\\s*${b[0]}`, checks: 'a score that should get a high grade', cause: `Your tests start with the lowest boundary (${b[3]}), so every score above it stops there. Test ${b[0]} first.` },
          { match: `\\((${b.join('|')})\\)`, checks: 'a score exactly on a grade boundary', cause: 'A score on the boundary earns that grade, so use <code>&gt;=</code>, not <code>&gt;</code>.' },
          { match: '.', checks: 'a score in one of the grade bands', cause: 'Check each boundary and the grade it returns, from 7 down to 3.' }
        ]
      };
    } }
  ]);

  /* ================= B2.3.3  Loops ================= */
  P.add('B2.3.3', [
    { id: 'loop-range', kind: 'output', term: 'State', marks: 2, make(R) {
      const v = R.int(0, 3);
      if (v === 0) { const a = R.int(0, 5), s = R.int(2, 4), b = a + s * R.int(2, 4) + R.int(0, 2), xs = range(a, b, s);
        return { prompt: 'What does this program print?', code: `for i in range(${a}, ${b}, ${s}):\n    print(i)`, answer: xs.join('\n'),
          explain: `<p>range(${a}, ${b}, ${s}) starts at ${a}, goes up in steps of ${s}, and stops <em>before</em> reaching ${b}: ${xs.join(', ')}.</p>` }; }
      if (v === 1) { const a = R.int(8, 15), s = R.int(2, 3), b = R.int(0, 3), xs = range(a, b, -s);
        return { prompt: 'What does this program print?', code: `for i in range(${a}, ${b}, -${s}):\n    print(i)`, answer: xs.join('\n'),
          explain: `<p>A negative step counts down: from ${a} in steps of ${s}, stopping before ${b}: ${xs.join(', ')}.</p>` }; }
      if (v === 2) { const a = R.int(1, 5), b = a + R.int(3, 6), xs = range(a, b), t = xs.reduce((p, c) => p + c, 0);
        return { prompt: 'What does this program print?', code: `total = 0\nfor i in range(${a}, ${b}):\n    total = total + i\nprint(total)`, answer: String(t),
          explain: `<p>i takes the values ${xs.join(', ')} (not ${b}), so total = ${xs.join(' + ')} = ${t}. The print is not indented, so it runs once, after the loop.</p>` }; }
      const n = R.int(3, 5), k = R.int(2, 6), xs = range(0, n).map(i => i * k);
      return { prompt: 'What does this program print?', code: `for i in range(${n}):\n    print(i * ${k})`, answer: xs.join('\n'),
        explain: `<p>range(${n}) gives 0 to ${n - 1}, so the loop prints ${xs.join(', ')}.</p>` };
    } },
    { id: 'loop-count', kind: 'mcq', term: 'State', marks: 1, make(R) {
      let code, n, why;
      if (R.chance(0.5)) {
        const a = R.int(0, 6), s = R.int(1, 3), b = a + s * R.int(3, 7) + R.int(0, s - 1); n = range(a, b, s).length;
        code = `for i in range(${a}, ${b}${s > 1 ? ', ' + s : ''}):\n    print("Hello")`;
        why = `range(${a}, ${b}${s > 1 ? ', ' + s : ''}) produces ${range(a, b, s).join(', ')} — ${n} values. The end value ${b} is never included.`;
      } else {
        const N = R.int(15, 40), d = R.int(3, 7); n = Math.ceil(N / d);
        code = `n = ${N}\nwhile n > 0:\n    n = n - ${d}`;
        const seq = []; for (let x = N; x > 0; x -= d) seq.push(x);
        why = `n goes ${seq.join(' → ')} → ${N - n * d}. The body runs ${n} times before n > 0 becomes False.`;
      }
      const ws = [n + 1, n - 1, n + 2].filter(x => x > 0 && x !== n).slice(0, 3);
      return {
        prompt: 'How many times does the loop body run?', code,
        options: [opt(String(n), true, why), ...ws.map(x => opt(String(x), false, x > n ? 'That counts one or more extra iterations — check where the loop stops.' : 'That misses an iteration — check the first and last values.'))],
        check: { code: code.replace(/print\("Hello"\)|n = n - (\d+)/, (m, d) => d ? m + '\n    c += 1' : 'c += 1').replace(/^/, 'c = 0\n') + '\nprint(c)', expect: String(n) },
        steps: /^for/.test(code)
          ? ['List the values the loop variable takes — don\'t try to use a formula until you are sure.', 'range(start, stop, step) starts at start and keeps adding step, but stops <em>before</em> reaching stop.', why]
          : ['Write down the value of n each time the condition is checked.', 'The body runs once for every check that is True; the loop ends at the first False.', why]
      };
    } },
    { id: 'loop-while-trace', kind: 'trace', term: 'Trace', marks: 3, make(R) {
      const halve = R.chance(0.5), N = halve ? R.pick([48, 56, 60, 72, 80, 96]) : R.int(20, 40), L = halve ? R.int(4, 8) : R.int(3, 8), D = R.int(4, 7);
      let n = N, steps = 0; const rows = [[{ v: String(n), given: true }, { v: '0', given: true }, { v: py.b(n > L) }]];
      while (n > L) { n = halve ? Math.floor(n / 2) : n - D; steps++; rows.push([{ v: String(n) }, { v: String(steps) }, { v: py.b(n > L) }]); }
      const code = `n = ${N}\nsteps = 0\nwhile n > ${L}:\n    n = ${halve ? 'n // 2' : 'n - ' + D}\n    steps = steps + 1\nprint(steps)`;
      return {
        prompt: `Complete the trace table. Each row shows the values each time the condition <code>n > ${L}</code> is checked.`, code,
        columns: ['n', 'steps', `n > ${L}`], rows, extra: [{ label: 'Output', v: String(steps) }], check: { code, expect: String(steps) },
        explain: `<p>n goes ${rows.map(r => r[0].v).join(' → ')}. When n is ${n}, n > ${L} is False, the loop ends and steps (${steps}) is printed.</p>`
      };
    } },
    { id: 'loop-choose', kind: 'mcq', term: 'Identify', marks: 1, make(R) {
      const T = {
        'Counted loop (for)': ['the number of repetitions is known before the loop starts', ['Print the names of all 28 students in a class list.', 'Add up the marks for exactly 5 tests.', 'Draw 10 rows of seats in a seating plan.', 'Process every book in a list of loans.']],
        'Conditional loop (while)': ['you repeat until a condition changes, and don\'t know in advance how many times', ['Keep asking for a PIN until the correct one is entered.', 'Keep serving the canteen queue until it is empty.', 'Read numbers until the user types -1.', 'Double a savings balance each year until it passes $1000.']],
        'Selection (if) — no loop needed': ['the action happens at most once, depending on a condition', ['Show "Overdue" if a book is more than 14 days late.', 'Give a discount if the customer is a member.', 'Print "Pass" if a mark is 50 or more.']]
      };
      const key = R.pick(Object.keys(T).slice(0, 2).concat(R.chance(0.2) ? ['Selection (if) — no loop needed'] : [])), text = R.pick(T[key][1]);
      return {
        prompt: `Which construct is most appropriate?<blockquote>${esc(text)}</blockquote>`,
        options: Object.keys(T).map(k => opt(k, k === key, k === key ? `Yes — use this when ${T[k][0]}.` : `Use this when ${T[k][0]}.`)),
        steps: ['Ask: does the action repeat, or happen at most once? If it happens at most once, it is selection, not a loop.',
          'If it repeats: do you know how many times <em>before</em> the loop starts (a list, a number of tests)? Then use a counted loop (for).',
          'If it repeats until something changes (correct input, an empty queue, a target reached), use a conditional loop (while).',
          `Here ${T[key][0]}, so: <strong>${key}</strong>.`]
      };
    } },
    { id: 'loop-patterns', kind: 'output', term: 'State', marks: 2, make(R) {
      const P2 = R.pick([40, 50, 60]), marks = R.ints(R.int(5, 7), P2 - 25, P2 + 35);
      marks[marks.length - 1] -= marks.reduce((x, y) => x + y, 0) % marks.length; // whole-number mean, so the float prints the same everywhere
      const count = marks.filter(m => m >= P2).length, best = Math.max(...marks), tot = marks.reduce((a, b) => a + b, 0);
      if (R.chance(0.5)) return {
        prompt: 'What does this program print?',
        code: `marks = ${py.r(marks)}\ncount = 0\nbest = marks[0]\nfor m in marks:\n    if m >= ${P2}:\n        count = count + 1\n    if m > best:\n        best = m\nprint(count, best)`,
        answer: `${count} ${best}`,
        explain: `<p><strong>Count</strong>: ${count} marks are ${P2} or more (${marks.filter(m => m >= P2).join(', ') || 'none'}). <strong>Maximum</strong>: best starts at the first mark and is replaced whenever a bigger mark appears, ending at ${best}.</p>`
      };
      return {
        prompt: 'What does this program print?',
        code: `marks = ${py.r(marks)}\ntotal = 0\nfor m in marks:\n    total = total + m\nprint(total)\nprint(total / len(marks))`,
        answer: `${tot}\n${py.f(tot / marks.length)}`,
        explain: `<p>A <strong>running total</strong> adds each mark: ${marks.join(' + ')} = ${tot}. Dividing by the ${marks.length} marks with / gives a float: ${py.f(tot / marks.length)}.</p>`
      };
    } },
    { id: 'loop-validation', kind: 'output', term: 'State', marks: 2, make(R) {
      const bad = R.sample([120, -5, 101, -1, 150, 200, -20], R.int(1, 3)), good = R.int(0, 100), all = [...bad, good];
      return {
        prompt: 'This input-validation loop uses a list to stand in for what the user types. What does it print?',
        code: `typed = ${py.r(all)}  # the values the user types, in order\ni = 0\nscore = typed[i]\nwhile score < 0 or score > 100:\n    print("Invalid:", score)\n    i = i + 1\n    score = typed[i]\nprint("Saved", score)`,
        answer: bad.map(b => `Invalid: ${b}`).join('\n') + `\nSaved ${good}`,
        explain: `<p>The loop repeats while the score is outside 0–100. ${bad.join(', ')} ${bad.length > 1 ? 'are' : 'is'} rejected; ${good} is valid, so the condition becomes False and the score is saved.</p>`
      };
    } },
    { id: 'loop-code', kind: 'code', term: 'Construct', marks: 4, make(R) {
      const v = R.int(0, 4), lists = Array.from({ length: 4 }, () => R.ints(R.int(4, 7), 20, 99));
      if (v === 0) {
        const t = R.pick([50, 60, 70]);
        return { prompt: `Write <code>count_above(marks, threshold)</code> that returns how many marks are <strong>greater than</strong> <code>threshold</code>.`,
          starter: 'def count_above(marks, threshold):\n    pass\n',
          solution: 'def count_above(marks, threshold):  # a list of marks and the number to beat\n    count = 0  # no marks counted yet\n    for m in marks:  # look at each mark once\n        if m > threshold:  # "greater than": the threshold itself does not count\n            count = count + 1  # this mark passes the test\n    return count  # after every mark has been checked\n',
          think: ['This is the "count" pattern: start a counter at 0 and add 1 whenever the condition is True.', '"Greater than" means <code>&gt;</code> — a mark equal to the threshold must not be counted.', 'Return the counter after the loop, not inside it.'],
          diagnose: [
            { match: `\\[${t}, ${t}\\]`, checks: `a list where every mark equals ${t} exactly`, cause: `"Greater than" doesn't include ${t} itself. Use <code>&gt;</code>, not <code>&gt;=</code>.` },
            { match: '.', when: '^\\s{8,}return', checks: 'counting the marks above the threshold', cause: 'Your <code>return</code> is inside the loop, so the function stops after the first mark. Line it up with <code>for</code>.' },
            { match: '.', checks: 'counting the marks above the threshold', cause: 'Start the counter at 0 before the loop, add 1 only when <code>m &gt; threshold</code>, and return it after the loop.' }],
          tests: [...lists.map(l => P.t(`count_above(${py.r(l)}, ${t}) returns ${l.filter(m => m > t).length}`, `count_above(${py.r(l)}, ${t})`, l.filter(m => m > t).length)), P.t(`count_above([${t}, ${t}], ${t}) returns 0`, `count_above([${t}, ${t}], ${t})`, 0)].join('\n'),
          hint: 'Start a counter at 0 and add 1 for each mark that passes the test. "Greater than" is >.' };
      }
      if (v === 1) return { prompt: 'Write <code>total_marks(marks)</code> that returns the sum of the list. <strong>No built-ins:</strong> don\'t use <code>sum()</code>.',
        starter: 'def total_marks(marks):\n    pass\n',
        solution: 'def total_marks(marks):  # a list of marks\n    total = 0  # the running total starts at 0\n    for m in marks:  # take each mark in turn\n        total = total + m  # add it to what we have so far\n    return total  # the sum of every mark (0 for an empty list)\n',
        think: ['This is the "running total" pattern: a variable that starts at 0 and has each value added to it.', 'Use a for loop to visit every mark once.', 'Return the total after the loop. An empty list never enters the loop, so it correctly returns 0.'],
        diagnose: [
          { match: 'total_marks\\(\\[\\]\\)', checks: 'an empty list, whose total is 0', cause: 'The total must start at 0 and be returned after the loop, so an empty list gives 0.' },
          { match: '.', when: 'total\\s*=\\s*m\\s*$', checks: 'adding up a list of marks', cause: '<code>total = m</code> replaces the total each time. Add to it: <code>total = total + m</code>.' },
          { match: '.', checks: 'adding up a list of marks', cause: 'Start at 0, add every mark inside the loop, and return after the loop (not inside it).' }],
        tests: [...lists.map(l => P.t(`total_marks(${py.r(l)}) returns ${l.reduce((a, b) => a + b, 0)}`, `total_marks(${py.r(l)})`, l.reduce((a, b) => a + b, 0))), P.t('total_marks([]) returns 0', 'total_marks([])', 0)].join('\n'),
        banned: P.ban('sum'), hint: 'A running total: start at 0 and add each mark inside the loop.' };
      if (v === 2) return { prompt: 'Write <code>highest(marks)</code> that returns the largest mark. <strong>No built-ins:</strong> don\'t use <code>max()</code> or sorting.',
        starter: 'def highest(marks):\n    pass\n',
        solution: 'def highest(marks):  # a non-empty list of marks\n    best = marks[0]  # start with the first mark, not 0\n    for m in marks:  # compare every mark\n        if m > best:  # bigger than the biggest so far?\n            best = m  # remember the new biggest\n    return best  # the largest mark\n',
        think: ['This is the "maximum" pattern: keep the biggest value seen so far.', 'Start with the first mark, not 0 — if every value is negative, 0 would be wrong.', 'Replace <code>best</code> whenever a bigger value appears, and return it after the loop.'],
        diagnose: [
          { match: '-4, -9, -2', checks: 'a list where every value is negative', cause: 'You start <code>best</code> at 0, which is bigger than every value here. Start with <code>marks[0]</code>.' },
          { match: '.', when: 'm\\s*<\\s*best', checks: 'finding the largest mark', cause: '<code>m &lt; best</code> finds the smallest mark. Use <code>&gt;</code>.' },
          { match: '.', checks: 'finding the largest mark', cause: 'Update <code>best</code> only when <code>m &gt; best</code>, and return it after the loop.' }],
        tests: [...lists.map(l => P.t(`highest(${py.r(l)}) returns ${Math.max(...l)}`, `highest(${py.r(l)})`, Math.max(...l))), P.t('highest([-4, -9, -2]) returns -2', 'highest([-4, -9, -2])', -2)].join('\n'),
        banned: P.ban('max', 'sorted', 'sort'), hint: 'Start with best = marks[0] (not 0 — the marks might be negative) and replace it whenever you find something bigger.' };
      if (v === 3) {
        const pm = R.pick([40, 50]);
        const f = l => { const i = l.findIndex(m => m < pm); return i; };
        const ls = [...lists, [pm, pm + 5, pm + 10]];
        return { prompt: `Write <code>first_fail(marks)</code> that returns the <strong>index</strong> of the first mark below ${pm}, or <code>-1</code> if there isn't one. <strong>No built-ins:</strong> don't use <code>.index()</code>.`,
          starter: 'def first_fail(marks):\n    pass\n',
          solution: `def first_fail(marks):  # a list of marks\n    for i in range(len(marks)):  # we need the INDEX, so loop over 0, 1, 2, …\n        if marks[i] < ${pm}:  # below ${pm} is a fail\n            return i  # the first one found: return straight away\n    return -1  # only reached if no mark failed\n`,
          think: ['The question asks for a <em>position</em>, so loop over indexes with <code>range(len(marks))</code>.', 'Return the index as soon as you find a fail — that makes it the first one.', 'Only after the loop has finished do you know there was no fail, so <code>return -1</code> goes after the loop.'],
          diagnose: [
            { match: `\\[${pm}, ${pm + 5}, ${pm + 10}\\]`, checks: `a list with no fails at all (${pm} itself is a pass)`, cause: `<code>return -1</code> must come after the loop, and a mark of exactly ${pm} is not a fail — use <code>&lt;</code>, not <code>&lt;=</code>.` },
            { match: '.', when: 'return\\s+marks\\[', checks: 'finding where the first fail is', cause: 'You return the mark itself. The question asks for its <strong>index</strong>: <code>return i</code>.' },
            { match: '.', checks: 'finding where the first fail is', cause: 'Loop over indexes, return <code>i</code> at the first mark below the pass mark, and return -1 after the loop.' }],
          tests: ls.map(l => P.t(`first_fail(${py.r(l)}) returns ${f(l)}`, `first_fail(${py.r(l)})`, f(l))).join('\n'),
          banned: P.ban('index'), hint: 'Loop over the indexes with range(len(marks)). Return i as soon as you find a fail; after the loop, return -1.' };
      }
      const cases = [[R.int(15, 40), R.pick([3, 4, 5])], [R.int(15, 40), R.pick([3, 4, 5])], [R.int(41, 90), R.pick([6, 7])]];
      const f = (lim, k) => range(k, lim, k).reduce((a, b) => a + b, 0);
      return { prompt: 'Write <code>sum_of_multiples(limit, k)</code> that returns the total of all the multiples of <code>k</code> that are less than <code>limit</code>, e.g. <code>sum_of_multiples(10, 3)</code> is 3 + 6 + 9 = 18.',
        starter: 'def sum_of_multiples(limit, k):\n    pass\n',
        solution: 'def sum_of_multiples(limit, k):  # add up k, 2k, 3k, … below limit\n    total = 0  # running total\n    for n in range(k, limit, k):  # starts at k, steps by k, stops BEFORE limit\n        total = total + n  # each n is a multiple of k\n    return total  # e.g. 3 + 6 + 9 = 18 for (10, 3)\n',
        think: ['The multiples of k are k, 2k, 3k, … — a counted loop can produce exactly those with <code>range(k, limit, k)</code>.', 'range stops before <code>limit</code>, which matches "less than limit".', 'Add each one to a running total and return it.'],
        diagnose: [
          { match: '.', when: 'limit\\s*\\+\\s*1', checks: 'adding the multiples of k below the limit', cause: '"Less than limit" means the limit itself is excluded — <code>range(k, limit, k)</code> already stops before it.' },
          { match: '.', when: 'range\\(\\s*0\\s*,|range\\(\\s*1\\s*,', checks: 'adding the multiples of k below the limit', cause: 'If you loop over every number, you must test <code>n % k == 0</code>; easier is <code>range(k, limit, k)</code>, which only gives multiples.' },
          { match: '.', checks: 'adding the multiples of k below the limit', cause: 'Start the total at 0, loop over <code>range(k, limit, k)</code>, and add each value.' }],
        tests: [P.t('sum_of_multiples(10, 3) returns 18', 'sum_of_multiples(10, 3)', 18), ...cases.map(([l, k]) => P.t(`sum_of_multiples(${l}, ${k}) returns ${f(l, k)}`, `sum_of_multiples(${l}, ${k})`, f(l, k)))].join('\n'),
        hint: 'range(k, limit, k) gives exactly the multiples of k below limit.' };
    } }
  ]);

  /* ================= B2.3.4  Functions & modularization ================= */
  P.add('B2.3.4', [
    { id: 'fn-return-print', kind: 'output', term: 'State', marks: 2, make(R) {
      const v = R.int(0, 2), A = R.int(3, 25), B = R.int(3, 25);
      if (v === 0) return { prompt: 'What does this program print?', code: `def double(x):\n    print(x * 2)\n\nresult = double(${A})\nprint(result)`, answer: `${A * 2}\nNone`,
        explain: `<p><code>double</code> <em>prints</em> ${A * 2} but has no <code>return</code>, so it gives back <code>None</code>. That's what <code>result</code> holds, and what the second print shows.</p>` };
      if (v === 1) { const vat = x => x + Math.floor(x / 5);
        return { prompt: 'What does this program print?', code: `def add_tax(price):\n    return price + price // 5\n\ntotal = add_tax(${A * 5}) + add_tax(${B * 5})\nprint(total)`, answer: String(vat(A * 5) + vat(B * 5)),
          explain: `<p>Each call <em>returns</em> a value: add_tax(${A * 5}) = ${vat(A * 5)} and add_tax(${B * 5}) = ${vat(B * 5)}. The returned values are added: ${vat(A * 5) + vat(B * 5)}.</p>` }; }
      return { prompt: 'What does this program print?', code: `def bonus(points):\n    print("Calculating...")\n    return points + 10\n\nprint(bonus(${A}))\nprint(bonus(bonus(${B})))`, answer: `Calculating...\n${A + 10}\nCalculating...\nCalculating...\n${B + 20}`,
        explain: `<p>Every call prints "Calculating..." before returning. <code>bonus(bonus(${B}))</code> calls the function twice — the inner call returns ${B + 10}, the outer returns ${B + 20} — so the message appears twice before ${B + 20}.</p>` };
    } },
    { id: 'fn-scope', kind: 'output', term: 'State', marks: 2, make(R) {
      const A = R.int(2, 9), B = R.int(2, 5), Cc = R.int(2, 9), D = R.int(2, 9);
      if (R.chance(0.5)) return { prompt: 'What does this program print?',
        code: `rate = ${A}\n\ndef price_after(cost):\n    rate = ${B}\n    return cost * rate\n\nprint(price_after(${Cc}))\nprint(rate)`, answer: `${Cc * B}\n${A}`,
        explain: `<p>Inside the function, <code>rate = ${B}</code> creates a <strong>local</strong> variable, so the function returns ${Cc} × ${B} = ${Cc * B}. The <strong>global</strong> rate is untouched and still ${A}.</p>` };
      const f = x => x + A, g = x => f(x) * B;
      return { prompt: 'What does this program print?',
        code: `def f(x):\n    return x + ${A}\n\ndef g(x):\n    return f(x) * ${B}\n\nprint(g(${Cc}))\nprint(f(g(${D})))`, answer: `${g(Cc)}\n${f(g(D))}`,
        explain: `<p>g(${Cc}) calls f(${Cc}) = ${f(Cc)}, then multiplies by ${B}: ${g(Cc)}. For f(g(${D})), the inner call runs first: g(${D}) = ${g(D)}, then f(${g(D)}) = ${f(g(D))}.</p>` };
    } },
    { id: 'fn-terms', kind: 'mcq', term: 'Identify', marks: 1, make(R) {
      const [fn, p1, p2, expr] = R.pick([['area', 'length', 'width', 'length * width'], ['total_cost', 'price', 'quantity', 'price * quantity'], ['average_two', 'first', 'second', '(first + second) / 2']]);
      const [a1, a2] = R.distinct(2, 2, 12);
      const T = {
        'Parameters': 'the names in the function definition that receive the values',
        'Arguments': 'the actual values passed in when the function is called',
        'Local variables': 'variables created inside the function, which exist only while it runs',
        'Global variables': 'variables created outside any function, at the top level of the program',
        'Return values': 'the values a function sends back to the code that called it'
      };
      const ask = R.pick([[`<code>${p1}</code> and <code>${p2}</code>`, 'Parameters'], [`<code>${a1}</code> and <code>${a2}</code>`, 'Arguments'], ['<code>result</code>', 'Local variables']]);
      return {
        prompt: `In this code, what are ${ask[0]}?`,
        code: `def ${fn}(${p1}, ${p2}):\n    result = ${expr}\n    return result\n\nprint(${fn}(${a1}, ${a2}))`,
        options: R.sample(Object.keys(T).filter(k => k !== ask[1]), 3).concat([ask[1]]).map(k => opt(k, k === ask[1], k === ask[1] ? `Yes — ${k.toLowerCase()} are ${T[k]}.` : `${k} are ${T[k]}.`)),
        steps: ['Sort out where things can appear: names in the <code>def</code> line are <b>parameters</b>; values written in the call are <b>arguments</b>; variables first assigned inside the function body are <b>local</b>.',
          `Now find ${ask[0]}: ${({ Parameters: `they are in the brackets of <code>def ${fn}(${p1}, ${p2}):</code>`, Arguments: `they are in the brackets of the call <code>${fn}(${a1}, ${a2})</code>`, 'Local variables': `it is assigned inside the body (<code>result = ${expr}</code>), so it only exists while <code>${fn}</code> runs` })[ask[1]]}.`,
          `So the answer is <strong>${ask[1]}</strong>.`]
      };
    } },
    { id: 'fn-written', kind: 'written', term: 'Outline', marks: 4, make(R) {
      return R.chance(0.6) ? {
        prompt: 'Outline <strong>two</strong> benefits of modularization (splitting a program into functions).',
        markscheme: [
          { text: '<strong>Reuse:</strong> a function is written once and called many times, avoiding duplicated code', why: 'It names a benefit and says how it helps (less repeated code) — the two parts of an "outline" point.' },
          { text: '<strong>Easier testing and debugging:</strong> each function can be tested on its own', why: 'It explains <em>why</em> testing is easier: a small part can be checked in isolation.' },
          { text: '<strong>Teamwork:</strong> different programmers can write different modules at the same time', why: 'It links modules to dividing the work between people.' },
          { text: '<strong>Readability/maintenance:</strong> smaller named parts are easier to understand and change', why: 'It gives the effect on reading and changing the code later.' },
          { text: '<strong>Abstraction:</strong> a caller only needs to know what a function does, not how', why: 'It connects modularization to hiding detail, a key computational-thinking idea.' }],
        model: '2 marks per benefit: 1 for identifying it, 1 for outlining how it helps. Maximum 4.',
        answer: '<p><b>Reuse:</b> a function such as <code>average(marks)</code> is written once <span class="mk">[1]</span> and can be called wherever it is needed, so the same code isn\'t copied into several places. <span class="mk">[1]</span></p><p><b>Easier testing:</b> each function can be tested on its own with known inputs <span class="mk">[1]</span>, so when a bug appears it can be traced to one small part of the program. <span class="mk">[1]</span></p>'
      } : {
        prompt: 'Outline <strong>two</strong> reasons why programmers avoid using the <code>global</code> keyword.',
        markscheme: [
          { text: 'Any function can change a global variable, so bugs are hard to trace to one place', why: 'It gives the reason and its consequence — exactly what "outline" asks for.' },
          { text: 'Functions that depend on globals can\'t easily be reused in another program', why: 'It explains a cost to reuse, one of the main benefits of functions.' },
          { text: 'Functions become harder to test on their own, because their result depends on outside state', why: 'It explains why testing becomes harder.' },
          { text: 'Using parameters and return values makes the data flow clear', why: 'It shows the better alternative, which supports the reason.' }],
        model: '2 marks per reason: 1 for the reason, 1 for the explanation. Maximum 4.',
        answer: '<p>A global variable can be changed by any function <span class="mk">[1]</span>, so if it ends up with a wrong value it is hard to find which function caused the bug. <span class="mk">[1]</span></p><p>A function that relies on a global can\'t be tested on its own <span class="mk">[1]</span>, because its result depends on a value outside it; passing parameters and returning values keeps it self-contained. <span class="mk">[1]</span></p>'
      };
    } },
    { id: 'fn-code', kind: 'code', term: 'Construct', marks: 4, make(R) {
      const v = R.int(0, 3);
      if (v === 0) {
        const F = R.pick([10, 20, 25, 50]), MAX = F * R.int(8, 15), f = d => (d <= 0 ? 0 : Math.min(d * F, MAX));
        const ds = [0, -2, R.int(1, 5), MAX / F, MAX / F + R.int(1, 10), R.int(1, MAX / F - 1)];
        return { prompt: `The library charges ${F} cents per day late, up to a maximum of ${MAX} cents. Write <code>late_fee(days_late)</code> that returns the fee in cents (0 if the book isn't late).`,
          starter: 'def late_fee(days_late):\n    pass\n',
          solution: `def late_fee(days_late):  # days_late can be 0 or negative if returned on time\n    if days_late <= 0:  # not late at all\n        return 0  # no fee, and stop here\n    fee = days_late * ${F}  # ${F} cents for each day late\n    if fee > ${MAX}:  # more than the maximum?\n        fee = ${MAX}  # cap it at the maximum\n    return fee  # the fee in cents\n`,
          think: ['Deal with the special case first: 0 or fewer days late means a fee of 0.', `Otherwise the fee is days × ${F}.`, `Then apply the cap: if the fee is over ${MAX}, it becomes ${MAX}.`, '<b>Return</b> the fee — the question says "returns", so don\'t print it.'],
          diagnose: [
            { match: '.', when: '^\\s*print\\s*\\(', checks: 'the value the function returns', cause: 'Your function prints the fee instead of returning it, so the caller gets <code>None</code>. Use <code>return</code>.' },
            { match: 'late_fee\\(-2\\)', checks: 'a negative number of days (the book came back early)', cause: 'A book that isn\'t late has no fee. Test <code>days_late &lt;= 0</code>, not <code>== 0</code>.' },
            { match: 'late_fee\\(0\\)', checks: 'a book returned exactly on time', cause: '0 days late means a fee of 0. Handle it before working out the fee.' },
            { match: `returns ${MAX}$`, checks: `a fee that reaches or passes the ${MAX}-cent maximum`, cause: `Cap the fee: if it is more than ${MAX}, set it to ${MAX}.` },
            { match: '.', checks: `the fee for a few days late (${F} cents per day)`, cause: `Multiply the days by ${F}: <code>fee = days_late * ${F}</code>.` }],
          tests: ds.map(d => P.t(`late_fee(${d}) returns ${f(d)}`, `late_fee(${d})`, f(d))).join('\n'),
          hint: 'Handle "not late" first. Then work out days × rate, and cap it at the maximum.' };
      }
      if (v === 1) {
        const ls = Array.from({ length: 4 }, () => R.ints(R.int(3, 6), 30, 100));
        return { prompt: 'Write <code>average(marks)</code> that returns the mean of a list of marks as a float.',
          starter: 'def average(marks):\n    pass\n',
          solution: 'def average(marks):  # a non-empty list of marks\n    total = 0  # running total starts at 0\n    for m in marks:  # visit every mark once\n        total = total + m  # add it on\n    return total / len(marks)  # / always gives a float; divide after the loop\n',
          think: ['The mean is the total divided by how many values there are.', 'Build the total with a running-total loop (or <code>sum</code> — it isn\'t banned here).', 'Divide with <code>/</code>, which always gives a float. <code>//</code> would throw away the decimal part.', 'Divide <b>after</b> the loop, once the total is complete.'],
          diagnose: [
            { match: '.', when: '//', checks: 'the mean of the marks as a float', cause: '<code>//</code> is integer division and drops the decimal part. Use <code>/</code>.' },
            { match: '.', when: '^\\s{8,}return', checks: 'the mean of the marks as a float', cause: 'Your <code>return</code> is inside the loop, so it returns after the first mark. Line it up with <code>for</code>.' },
            { match: '.', when: '^\\s*print\\s*\\(', checks: 'the value the function returns', cause: 'Return the mean instead of printing it.' },
            { match: '.', checks: 'the mean of the marks as a float', cause: 'Add every mark to a total that starts at 0, then return <code>total / len(marks)</code> after the loop.' }],
          tests: ls.map(l => P.tf(`average(${py.r(l)}) ≈ ${py.f(l.reduce((a, b) => a + b, 0) / l.length)}`, `average(${py.r(l)})`, { f: l.reduce((a, b) => a + b, 0) / l.length })).join('\n'),
          hint: 'Add up the marks, then divide by how many there are with /.' };
      }
      if (v === 2) {
        const ws = R.sample(P.data.words.concat(['queue', 'Stack', 'aeiou', 'rhythm']), 5), f = w => [...w.toLowerCase()].filter(c => 'aeiou'.includes(c)).length;
        return { prompt: 'Write <code>count_vowels(word)</code> that returns how many vowels (a, e, i, o, u — upper or lower case) are in <code>word</code>.',
          starter: 'def count_vowels(word):\n    pass\n',
          solution: 'def count_vowels(word):  # any string\n    count = 0  # no vowels found yet\n    for ch in word.lower():  # lower() so "A" and "a" are treated the same\n        if ch in "aeiou":  # is this character one of the five vowels?\n            count = count + 1  # yes: count it\n    return count  # after checking every character\n',
          think: ['This is the "count" pattern again, applied to the characters of a string.', 'A for loop over a string gives one character at a time.', 'Upper-case vowels count too, so convert with <code>.lower()</code> first (or test against "aeiouAEIOU").', '<code>ch in "aeiou"</code> is True when <code>ch</code> is one of those letters.'],
          diagnose: [
            { match: '[A-Z]', when: '(?<![\\s\\S])(?![\\s\\S]*(lower|upper|AEIOU))', checks: 'a word containing a capital letter', cause: 'Capital vowels count too. Use <code>word.lower()</code> before the loop, or check against "aeiouAEIOU".' },
            { match: "'rhythm'", checks: 'a word with no vowels at all, which should give 0', cause: 'Start the count at 0 and only add 1 when the character is a vowel.' },
            { match: '.', when: '^\\s{8,}return', checks: 'counting the vowels', cause: 'Your <code>return</code> is inside the loop, so only the first character is checked.' },
            { match: '.', checks: 'counting the vowels', cause: 'Loop over each character, add 1 when <code>ch in "aeiou"</code>, and return the count after the loop.' }],
          tests: ws.map(w => P.t(`count_vowels(${py.s(w)}) returns ${f(w)}`, `count_vowels(${py.s(w)})`, f(w))).join('\n'),
          hint: 'Convert the word to lower case first, then test each character with in "aeiou".' };
      }
      const people = R.sample(P.data.names, 4).map(n => [n, R.int(30, 100)]);
      return { prompt: 'A program repeats <code>print(name + " scored " + str(score))</code> in many places. Write a function <code>describe(name, score)</code> that <strong>returns</strong> that sentence, e.g. <code>describe("Aiko", 78)</code> returns <code>"Aiko scored 78"</code>.',
        starter: 'def describe(name, score):\n    pass\n',
        solution: 'def describe(name, score):  # name is a str, score is an int\n    return name + " scored " + str(score)  # str() is needed: you can\'t join a str and an int with +\n',
        think: ['The function must <b>return</b> the sentence, so the caller can print it, store it or test it.', 'Joining with <code>+</code> only works between strings, so the int score needs <code>str(score)</code>.', 'Note the spaces inside <code>" scored "</code> — without them the words run together.'],
        diagnose: [
          { match: '.', when: '^\\s*print\\s*\\(', checks: 'the string the function returns', cause: 'Your function prints the sentence, so it returns <code>None</code>. Use <code>return</code> instead of <code>print</code>.' },
          { match: '.', when: '"scored"', checks: 'the exact sentence, including spaces', cause: 'You need a space on both sides: <code>" scored "</code>.' },
          { match: '.', checks: 'the exact sentence, e.g. "Aiko scored 78"', cause: 'Return <code>name + " scored " + str(score)</code> — check the spaces and the str() conversion.' }],
        tests: people.map(([n, s]) => P.t(`describe(${py.s(n)}, ${s}) returns ${py.s(n + ' scored ' + s)}`, `describe(${py.s(n)}, ${s})`, `${n} scored ${s}`)).join('\n'),
        hint: 'Return the string — don\'t print it. Convert the score with str() before joining.' };
    } }
  ]);

  /* ===== Lesson tabs (Try it): sequence code questions for B2.3.1 ===== */
  P.add('B2.3.1', [
    { id: 'seq-code', kind: 'code', term: 'Construct', marks: 3, make(R) {
      const v = R.int(0, 2), names = R.sample(P.data.names, 5);
      if (v === 0) {
        const ls = [names.slice(0, 3), names.slice(1, 5), [names[0]]], f = l => (l.length === 1 ? l.slice() : [l[l.length - 1], ...l.slice(1, -1), l[0]]);
        return {
          prompt: 'Write <code>swap_ends(items)</code> that swaps the first and last items of the list, in place, and returns the list. Use a temporary variable.',
          starter: 'def swap_ends(items):\n    pass\n',
          solution: 'def swap_ends(items):  # a list with at least one item\n    temp = items[0]  # save the first item before it is overwritten\n    items[0] = items[-1]  # the last item moves to the front\n    items[-1] = temp  # the saved first item goes to the end\n    return items  # the same list, changed in place\n',
          think: ['Overwriting <code>items[0]</code> loses its value, so save it in <code>temp</code> first.', 'Then copy the last item to the front, and the saved value to the end.', 'The order of these three lines is the whole algorithm — swap any two and a value is lost.'],
          diagnose: [
            { match: '.', when: '^\\s*items\\[0\\]\\s*=\\s*items\\[-1\\]\\s*\\n\\s*items\\[-1\\]\\s*=\\s*items\\[0\\]', checks: 'swapping without losing a value', cause: 'After <code>items[0] = items[-1]</code> the first item is gone, so both ends end up the same. Save it in <code>temp</code> first.' },
            { match: '.', checks: 'the first and last items swapped', cause: 'temp = items[0]; items[0] = items[-1]; items[-1] = temp; return items.' }],
          tests: ls.map(l => P.t(`swap_ends(${py.r(l)}) is ${py.r(f(l))}`, `swap_ends(${py.r(l)})`, f(l))).join('\n'),
          hint: 'Save, overwrite, restore.'
        };
      }
      if (v === 1) {
        const ls = [names.slice(0, 3), names.slice(2, 5)], f = l => [l[1], l[2], l[0]];
        return {
          prompt: 'Write <code>rotate_left(items)</code> for a list of 3 items: every item moves one place to the left and the first goes to the end, so <code>["A", "B", "C"]</code> becomes <code>["B", "C", "A"]</code>. Do it in place with a temporary variable (no slicing).',
          starter: 'def rotate_left(items):\n    pass\n',
          solution: 'def rotate_left(items):  # a list of exactly 3 items\n    temp = items[0]  # save the first item\n    items[0] = items[1]  # each item moves one place left…\n    items[1] = items[2]  # …in this order, so each value is copied before its slot is overwritten\n    items[2] = temp  # the saved first item goes to the end\n    return items  # the rotated list\n',
          think: ['The first item will be overwritten, so save it first.', 'Move the items left starting from the front: copy item 1 into slot 0, then item 2 into slot 1. Going the other way would overwrite a value before it has moved.', 'Finally put the saved item in the last slot.'],
          diagnose: [
            { match: '.', when: 'items\\[1\\]\\s*=\\s*items\\[2\\][\\s\\S]*items\\[0\\]\\s*=\\s*items\\[1\\]', checks: 'the order of the moves', cause: 'Moving item 2 first overwrites item 1 before it has been copied. Move from the front: slot 0 first, then slot 1.' },
            { match: '.', checks: 'every item moved one place left', cause: 'temp = items[0]; items[0] = items[1]; items[1] = items[2]; items[2] = temp.' }],
          tests: ls.map(l => P.t(`rotate_left(${py.r(l)}) is ${py.r(f(l))}`, `rotate_left(${py.r(l)})`, f(l))).join('\n'),
          banned: [{ label: 'slicing', re: '\\[\\s*-?\\d*\\s*:' }], hint: 'Save items[0], shift left, put temp last.'
        };
      }
      const ns = [3, 1, 0, R.int(4, 7)], f = n => Array.from({ length: Math.max(0, n) }, (_, i) => n - i);
      return {
        prompt: 'Write <code>countdown(n)</code> that returns a list counting down from n to 1, e.g. <code>countdown(3)</code> is <code>[3, 2, 1]</code>. Use a <code>while</code> loop, and make sure it always stops.',
        starter: 'def countdown(n):\n    pass\n',
        solution: 'def countdown(n):  # count down from n\n    result = []  # the numbers so far\n    while n > 0:  # stops, because n gets smaller every time round\n        result.append(n)  # record the current number…\n        n = n - 1  # …then move towards 0 — this order makes n the first number\n    return result  # e.g. [3, 2, 1]\n',
        think: ['Repeat "record the number, then make it one smaller" while it is above 0.', 'The loop condition must be able to become False: <code>n &gt; 0</code>, with <code>n</code> going down each time.', 'The order of the two lines in the loop decides whether n or n − 1 comes first.'],
        diagnose: [
          { match: 'countdown\\(0\\)', checks: 'n = 0, which gives an empty list', cause: 'With <code>while n &gt; 0</code>, the loop doesn\'t run at all for 0, so return the empty list.' },
          { match: '.', when: 'n\\s*=\\s*n\\s*\\+\\s*1', checks: 'that the loop ends', cause: '<code>n = n + 1</code> moves away from 0, so the loop never ends. Subtract 1.' },
          { match: '.', checks: 'the countdown list', cause: 'Append n, then subtract 1, while n &gt; 0. If the list starts at n − 1, swap those two lines.' }],
        tests: ns.map(n => P.t(`countdown(${n}) is ${py.r(f(n))}`, `countdown(${n})`, f(n))).join('\n'),
        hint: 'while n > 0: append, then subtract.'
      };
    } }
  ]);

})(CodeCraft.practice);
