/* Practice generators — B2.3 Programming constructs (sequence, selection, loops, functions). */
(function (P) {
  const { py, esc, code: C } = P;
  const opt = (text, ok, why) => ({ text, ok: !!ok, why });
  const range = (a, b, s = 1) => { const r = []; if (s > 0) for (let i = a; i < b; i += s) r.push(i); else for (let i = a; i > b; i += s) r.push(i); return r; };

  /* ================= B2.3.1  Sequence ================= */
  P.add('B2.3.1', [
    { id: 'seq-swap-trace', kind: 'output', term: 'Trace', marks: 1, make(R) {
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
        check: { code: `x = 1\ny = 2\n${tuple ? 'x, y = y, x' : 'temp = x\nx = y\ny = temp'}\nprint(x, y)`, expect: '2 1' }
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
        check: { code: `import io, contextlib\nwith contextlib.redirect_stdout(io.StringIO()):\n    exec(${py.s(T.join('\n'))})\nprint("ok")`, expect: 'ok' }
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
        options: [opt(inf[0], true, inf[1]), ...fine.map(f => opt(f[0], false, f[1]))], mono: true
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
        options: Object.keys(CATS).map(c => opt(c, c === cat, c === cat ? `Yes — this is ${CATS[c][0]}.` : `${c} means ${CATS[c][0]}.`))
      };
    } },
    { id: 'seq-output', kind: 'output', term: 'Trace', marks: 2, make(R) {
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
    { id: 'sel-grade', kind: 'output', term: 'Trace', marks: 2, make(R) {
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
        check: { code: `score = ${hi}\nif score >= ${b[2]}:\n    grade = 4\nelif score >= ${b[1]}:\n    grade = 5\nelse:\n    grade = 3\nprint(grade != ${intended(hi)})`, expect: 'True' }
      };
    } },
    { id: 'sel-bool', kind: 'output', term: 'Trace', marks: 2, make(R) {
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
    { id: 'sel-nested', kind: 'output', term: 'Trace', marks: 2, make(R) {
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
          opt(`${v} <= ${lo} and ${v} >= ${hi}`, false, `No number can be <= ${lo} and >= ${hi} at the same time, so this is always False.`)], mono: true
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
          solution: `def ticket_price(age):\n    if age < ${c}:\n        return ${p1}\n    elif age >= ${s}:\n        return ${p3}\n    else:\n        return ${p2}\n`,
          tests: ages.map(a => P.t(`ticket_price(${a}) returns ${f(a)}`, `ticket_price(${a})`, f(a))).join('\n'),
          hint: `Use if / elif / else. Check the boundary ages ${c} and ${s} carefully: "under ${c}" means < ${c}, and "${s} or over" means >= ${s}.`
        };
      }
      if (v === 1) {
        const x = R.int(8, 14), y = x + R.int(8, 14), f = t => (t < x ? 'Cold' : t < y ? 'Mild' : 'Hot');
        const ts = [x - 1, x, y - 1, y, R.int(-5, x - 2), R.int(y + 1, 38)];
        return {
          prompt: `Write <code>temperature_label(t)</code> that returns <code>"Cold"</code> below ${x}°C, <code>"Hot"</code> at ${y}°C or above, and <code>"Mild"</code> otherwise.`,
          starter: 'def temperature_label(t):\n    pass\n',
          solution: `def temperature_label(t):\n    if t < ${x}:\n        return "Cold"\n    elif t < ${y}:\n        return "Mild"\n    else:\n        return "Hot"\n`,
          tests: ts.map(t => P.t(`temperature_label(${t}) returns ${py.s(f(t))}`, `temperature_label(${t})`, f(t))).join('\n'),
          hint: `Test the boundaries: ${x} should be "Mild" and ${y} should be "Hot".`
        };
      }
      if (v === 2) {
        const lim = R.int(3, 6), cases = [[0, false], [lim - 1, false], [lim, false], [lim - 1, true], [R.int(0, lim - 2), true], [lim + 1, false]];
        const f = (n, fine) => n < lim && !fine;
        return {
          prompt: `A student can borrow another book if they have fewer than ${lim} books out <strong>and</strong> no unpaid fine. Write <code>can_borrow(books_out, has_fine)</code> that returns <code>True</code> or <code>False</code>.`,
          starter: 'def can_borrow(books_out, has_fine):\n    pass\n',
          solution: `def can_borrow(books_out, has_fine):\n    return books_out < ${lim} and not has_fine\n`,
          tests: cases.map(([n, fine]) => P.t(`can_borrow(${n}, ${py.b(fine)}) returns ${py.b(f(n, fine))}`, `can_borrow(${n}, ${py.b(fine)})`, f(n, fine))).join('\n'),
          hint: 'Combine two conditions with and. "No fine" is not has_fine.'
        };
      }
      const b = bounds(R), ps = [...b, b[0] + R.int(1, 9), b[3] - R.int(1, 9), R.int(b[2], b[1] - 1)];
      return {
        prompt: `Using these example boundaries — 7 at ${b[0]}+, 6 at ${b[1]}+, 5 at ${b[2]}+, 4 at ${b[3]}+, otherwise 3 — write <code>grade_for(percent)</code> that returns the grade.`,
        starter: 'def grade_for(percent):\n    pass\n',
        solution: `def grade_for(percent):\n    if percent >= ${b[0]}:\n        return 7\n    elif percent >= ${b[1]}:\n        return 6\n    elif percent >= ${b[2]}:\n        return 5\n    elif percent >= ${b[3]}:\n        return 4\n    else:\n        return 3\n`,
        tests: ps.map(p => P.t(`grade_for(${p}) returns ${gradeOf(p, b)}`, `grade_for(${p})`, gradeOf(p, b))).join('\n'),
        hint: 'Start with the highest boundary and work down with elif, using >= so the boundary values count.'
      };
    } }
  ]);

  /* ================= B2.3.3  Loops ================= */
  P.add('B2.3.3', [
    { id: 'loop-range', kind: 'output', term: 'Trace', marks: 2, make(R) {
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
        check: { code: code.replace(/print\("Hello"\)|n = n - (\d+)/, (m, d) => d ? m + '\n    c += 1' : 'c += 1').replace(/^/, 'c = 0\n') + '\nprint(c)', expect: String(n) }
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
        options: Object.keys(T).map(k => opt(k, k === key, k === key ? `Yes — use this when ${T[k][0]}.` : `Use this when ${T[k][0]}.`))
      };
    } },
    { id: 'loop-patterns', kind: 'output', term: 'Trace', marks: 2, make(R) {
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
    { id: 'loop-validation', kind: 'output', term: 'Trace', marks: 2, make(R) {
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
          solution: 'def count_above(marks, threshold):\n    count = 0\n    for m in marks:\n        if m > threshold:\n            count = count + 1\n    return count\n',
          tests: [...lists.map(l => P.t(`count_above(${py.r(l)}, ${t}) returns ${l.filter(m => m > t).length}`, `count_above(${py.r(l)}, ${t})`, l.filter(m => m > t).length)), P.t(`count_above([${t}, ${t}], ${t}) returns 0`, `count_above([${t}, ${t}], ${t})`, 0)].join('\n'),
          hint: 'Start a counter at 0 and add 1 for each mark that passes the test. "Greater than" is >.' };
      }
      if (v === 1) return { prompt: 'Write <code>total_marks(marks)</code> that returns the sum of the list. <strong>No built-ins:</strong> don\'t use <code>sum()</code>.',
        starter: 'def total_marks(marks):\n    pass\n',
        solution: 'def total_marks(marks):\n    total = 0\n    for m in marks:\n        total = total + m\n    return total\n',
        tests: [...lists.map(l => P.t(`total_marks(${py.r(l)}) returns ${l.reduce((a, b) => a + b, 0)}`, `total_marks(${py.r(l)})`, l.reduce((a, b) => a + b, 0))), P.t('total_marks([]) returns 0', 'total_marks([])', 0)].join('\n'),
        banned: P.ban('sum'), hint: 'A running total: start at 0 and add each mark inside the loop.' };
      if (v === 2) return { prompt: 'Write <code>highest(marks)</code> that returns the largest mark. <strong>No built-ins:</strong> don\'t use <code>max()</code> or sorting.',
        starter: 'def highest(marks):\n    pass\n',
        solution: 'def highest(marks):\n    best = marks[0]\n    for m in marks:\n        if m > best:\n            best = m\n    return best\n',
        tests: [...lists.map(l => P.t(`highest(${py.r(l)}) returns ${Math.max(...l)}`, `highest(${py.r(l)})`, Math.max(...l))), P.t('highest([-4, -9, -2]) returns -2', 'highest([-4, -9, -2])', -2)].join('\n'),
        banned: P.ban('max', 'sorted', 'sort'), hint: 'Start with best = marks[0] (not 0 — the marks might be negative) and replace it whenever you find something bigger.' };
      if (v === 3) {
        const pm = R.pick([40, 50]);
        const f = l => { const i = l.findIndex(m => m < pm); return i; };
        const ls = [...lists, [pm, pm + 5, pm + 10]];
        return { prompt: `Write <code>first_fail(marks)</code> that returns the <strong>index</strong> of the first mark below ${pm}, or <code>-1</code> if there isn't one. <strong>No built-ins:</strong> don't use <code>.index()</code>.`,
          starter: 'def first_fail(marks):\n    pass\n',
          solution: `def first_fail(marks):\n    for i in range(len(marks)):\n        if marks[i] < ${pm}:\n            return i\n    return -1\n`,
          tests: ls.map(l => P.t(`first_fail(${py.r(l)}) returns ${f(l)}`, `first_fail(${py.r(l)})`, f(l))).join('\n'),
          banned: P.ban('index'), hint: 'Loop over the indexes with range(len(marks)). Return i as soon as you find a fail; after the loop, return -1.' };
      }
      const cases = [[R.int(15, 40), R.pick([3, 4, 5])], [R.int(15, 40), R.pick([3, 4, 5])], [R.int(41, 90), R.pick([6, 7])]];
      const f = (lim, k) => range(k, lim, k).reduce((a, b) => a + b, 0);
      return { prompt: 'Write <code>sum_of_multiples(limit, k)</code> that returns the total of all the multiples of <code>k</code> that are less than <code>limit</code>, e.g. <code>sum_of_multiples(10, 3)</code> is 3 + 6 + 9 = 18.',
        starter: 'def sum_of_multiples(limit, k):\n    pass\n',
        solution: 'def sum_of_multiples(limit, k):\n    total = 0\n    for n in range(k, limit, k):\n        total = total + n\n    return total\n',
        tests: [P.t('sum_of_multiples(10, 3) returns 18', 'sum_of_multiples(10, 3)', 18), ...cases.map(([l, k]) => P.t(`sum_of_multiples(${l}, ${k}) returns ${f(l, k)}`, `sum_of_multiples(${l}, ${k})`, f(l, k)))].join('\n'),
        hint: 'range(k, limit, k) gives exactly the multiples of k below limit.' };
    } }
  ]);

  /* ================= B2.3.4  Functions & modularization ================= */
  P.add('B2.3.4', [
    { id: 'fn-return-print', kind: 'output', term: 'Trace', marks: 2, make(R) {
      const v = R.int(0, 2), A = R.int(3, 25), B = R.int(3, 25);
      if (v === 0) return { prompt: 'What does this program print?', code: `def double(x):\n    print(x * 2)\n\nresult = double(${A})\nprint(result)`, answer: `${A * 2}\nNone`,
        explain: `<p><code>double</code> <em>prints</em> ${A * 2} but has no <code>return</code>, so it gives back <code>None</code>. That's what <code>result</code> holds, and what the second print shows.</p>` };
      if (v === 1) { const vat = x => x + Math.floor(x / 5);
        return { prompt: 'What does this program print?', code: `def add_tax(price):\n    return price + price // 5\n\ntotal = add_tax(${A * 5}) + add_tax(${B * 5})\nprint(total)`, answer: String(vat(A * 5) + vat(B * 5)),
          explain: `<p>Each call <em>returns</em> a value: add_tax(${A * 5}) = ${vat(A * 5)} and add_tax(${B * 5}) = ${vat(B * 5)}. The returned values are added: ${vat(A * 5) + vat(B * 5)}.</p>` }; }
      return { prompt: 'What does this program print?', code: `def bonus(points):\n    print("Calculating...")\n    return points + 10\n\nprint(bonus(${A}))\nprint(bonus(bonus(${B})))`, answer: `Calculating...\n${A + 10}\nCalculating...\nCalculating...\n${B + 20}`,
        explain: `<p>Every call prints "Calculating..." before returning. <code>bonus(bonus(${B}))</code> calls the function twice — the inner call returns ${B + 10}, the outer returns ${B + 20} — so the message appears twice before ${B + 20}.</p>` };
    } },
    { id: 'fn-scope', kind: 'output', term: 'Trace', marks: 2, make(R) {
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
        options: R.sample(Object.keys(T).filter(k => k !== ask[1]), 3).concat([ask[1]]).map(k => opt(k, k === ask[1], k === ask[1] ? `Yes — ${k.toLowerCase()} are ${T[k]}.` : `${k} are ${T[k]}.`))
      };
    } },
    { id: 'fn-written', kind: 'written', term: 'Outline', marks: 4, make(R) {
      return R.chance(0.6) ? {
        prompt: 'Outline <strong>two</strong> benefits of modularization (splitting a program into functions).',
        markscheme: ['<strong>Reuse:</strong> a function is written once and called many times, avoiding duplicated code', '<strong>Easier testing and debugging:</strong> each function can be tested on its own', '<strong>Teamwork:</strong> different programmers can write different modules at the same time', '<strong>Readability/maintenance:</strong> smaller named parts are easier to understand and change', '<strong>Abstraction:</strong> a caller only needs to know what a function does, not how'],
        model: '2 marks per benefit: 1 for identifying it, 1 for outlining how it helps. Maximum 4.'
      } : {
        prompt: 'Outline <strong>two</strong> reasons why programmers avoid using the <code>global</code> keyword.',
        markscheme: ['Any function can change a global variable, so bugs are hard to trace to one place', 'Functions that depend on globals can\'t easily be reused in another program', 'Functions become harder to test on their own, because their result depends on outside state', 'Using parameters and return values makes the data flow clear'],
        model: '2 marks per reason: 1 for the reason, 1 for the explanation. Maximum 4.'
      };
    } },
    { id: 'fn-code', kind: 'code', term: 'Construct', marks: 4, make(R) {
      const v = R.int(0, 3);
      if (v === 0) {
        const F = R.pick([10, 20, 25, 50]), MAX = F * R.int(8, 15), f = d => (d <= 0 ? 0 : Math.min(d * F, MAX));
        const ds = [0, -2, R.int(1, 5), MAX / F, MAX / F + R.int(1, 10), R.int(1, MAX / F - 1)];
        return { prompt: `The library charges ${F} cents per day late, up to a maximum of ${MAX} cents. Write <code>late_fee(days_late)</code> that returns the fee in cents (0 if the book isn't late).`,
          starter: 'def late_fee(days_late):\n    pass\n',
          solution: `def late_fee(days_late):\n    if days_late <= 0:\n        return 0\n    fee = days_late * ${F}\n    if fee > ${MAX}:\n        fee = ${MAX}\n    return fee\n`,
          tests: ds.map(d => P.t(`late_fee(${d}) returns ${f(d)}`, `late_fee(${d})`, f(d))).join('\n'),
          hint: 'Handle "not late" first. Then work out days × rate, and cap it at the maximum.' };
      }
      if (v === 1) {
        const ls = Array.from({ length: 4 }, () => R.ints(R.int(3, 6), 30, 100));
        return { prompt: 'Write <code>average(marks)</code> that returns the mean of a list of marks as a float.',
          starter: 'def average(marks):\n    pass\n',
          solution: 'def average(marks):\n    total = 0\n    for m in marks:\n        total = total + m\n    return total / len(marks)\n',
          tests: ls.map(l => P.tf(`average(${py.r(l)}) ≈ ${py.f(l.reduce((a, b) => a + b, 0) / l.length)}`, `average(${py.r(l)})`, { f: l.reduce((a, b) => a + b, 0) / l.length })).join('\n'),
          hint: 'Add up the marks, then divide by how many there are with /.' };
      }
      if (v === 2) {
        const ws = R.sample(P.data.words.concat(['queue', 'Stack', 'aeiou', 'rhythm']), 5), f = w => [...w.toLowerCase()].filter(c => 'aeiou'.includes(c)).length;
        return { prompt: 'Write <code>count_vowels(word)</code> that returns how many vowels (a, e, i, o, u — upper or lower case) are in <code>word</code>.',
          starter: 'def count_vowels(word):\n    pass\n',
          solution: 'def count_vowels(word):\n    count = 0\n    for ch in word.lower():\n        if ch in "aeiou":\n            count = count + 1\n    return count\n',
          tests: ws.map(w => P.t(`count_vowels(${py.s(w)}) returns ${f(w)}`, `count_vowels(${py.s(w)})`, f(w))).join('\n'),
          hint: 'Convert the word to lower case first, then test each character with in "aeiou".' };
      }
      const people = R.sample(P.data.names, 4).map(n => [n, R.int(30, 100)]);
      return { prompt: 'A program repeats <code>print(name + " scored " + str(score))</code> in many places. Write a function <code>describe(name, score)</code> that <strong>returns</strong> that sentence, e.g. <code>describe("Aiko", 78)</code> returns <code>"Aiko scored 78"</code>.',
        starter: 'def describe(name, score):\n    pass\n',
        solution: 'def describe(name, score):\n    return name + " scored " + str(score)\n',
        tests: people.map(([n, s]) => P.t(`describe(${py.s(n)}, ${s}) returns ${py.s(n + ' scored ' + s)}`, `describe(${py.s(n)}, ${s})`, `${n} scored ${s}`)).join('\n'),
        hint: 'Return the string — don\'t print it. Convert the score with str() before joining.' };
    } }
  ]);
})(CodeCraft.practice);
