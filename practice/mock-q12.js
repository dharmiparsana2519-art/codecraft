/* practice/mock-q12.js — Questions 1 and 2 of the timed Paper 2 mock (review-2), modelled on the structure of the
   learner's school half-yearly Paper 2: Q1 = flowchart → Python, Big O, a file algorithm and a trace table (14 marks);
   Q2 = parallel arrays and a 2D list (16 marks). All questions are original. Each part is a practice question with its
   full reasoning (CLAUDE.md "Always teach the reasoning"). A part's make(R, ctx) gets the question's shared context. */
(function (P) {
  const { py, esc } = P;
  const M = P.mock = P.mock || {};
  const W = (prompt, points, answer, model) => ({ prompt, markscheme: points.map(([text, why]) => ({ text, why })), answer, model: model || 'Award [1] for each valid point, up to the marks shown.' });
  const mk = '<span class="mk">[1]</span>';

  /* ---------- Q1, version A: average loans (flowchart), Big O, counter, file algorithm, queue trace ---------- */
  M.q1a = {
    title: 'Library loans',
    context(R) {
      const books = R.sample(P.data.books, 4), names = R.sample(P.data.names, 4), k = names.map(() => R.int(1, 5));
      const limit = k[0] + k[1] + R.int(1, Math.max(1, k[2] - 1));
      return { names, k, limit, books };
    },
    intro: () => '<p>A school library uses an array <code>LOANS</code> of <code>N</code> whole numbers: the number of times each book has been borrowed this term.</p>',
    parts: [
      { label: 'a', kind: 'code', term: 'Construct', marks: 3, make(R) {
        const ls = [R.ints(5, 0, 40), R.ints(4, 0, 40), R.ints(7, 0, 40)], avg = l => l.reduce((a, b) => a + b, 0) / l.length;
        return {
          prompt: 'The flowchart works on the array <code>LOANS</code> of N items. With reference to it, construct a Python function <code>average_loans(LOANS)</code> that <b>returns</b> the value the flowchart outputs.',
          visual: P.flowchart([{ id: 's', type: 'term', text: 'Start', c: 0, r: 0 }, { id: 'a', type: 'proc', text: 'TOTAL = 0', c: 0, r: 1 }, { id: 'b', type: 'proc', text: 'I = 0', c: 0, r: 2 },
            { id: 'd', type: 'dec', text: 'I < N ?', c: 0, r: 3 }, { id: 'x', type: 'proc', text: 'TOTAL = TOTAL + LOANS[I]', c: 0, r: 4 }, { id: 'y', type: 'proc', text: 'I = I + 1', c: 0, r: 5 },
            { id: 'o', type: 'io', text: 'OUTPUT TOTAL / N', c: 0, r: 6 }, { id: 'e', type: 'term', text: 'End', c: 0, r: 7 }],
          [{ a: 's', b: 'a' }, { a: 'a', b: 'b' }, { a: 'b', b: 'd' }, { a: 'd', b: 'x', label: 'Yes' }, { a: 'x', b: 'y' }, { a: 'y', b: 'd', from: 'left', to: 'left', via: [[-0.82, 5], [-0.82, 3]] },
            { a: 'd', b: 'o', from: 'right', to: 'right', label: 'No', via: [[0.82, 3], [0.82, 6]] }, { a: 'o', b: 'e' }]),
          starter: 'def average_loans(LOANS):\n    pass\n',
          solution: 'def average_loans(LOANS):  # the array from the flowchart\n    TOTAL = 0  # process box: TOTAL = 0\n    I = 0  # process box: I = 0\n    while I < len(LOANS):  # the decision I < N, with an arrow back up to it: a loop\n        TOTAL = TOTAL + LOANS[I]  # first box on the Yes path\n        I = I + 1  # then move to the next item\n    return TOTAL / len(LOANS)  # the No exit: OUTPUT TOTAL / N\n',
          think: ['Translate the flowchart symbol by symbol: the two process boxes become assignments.', 'The decision has an arrow coming back up to it, so it is a loop: <code>while I &lt; N</code> (N is <code>len(LOANS)</code>).', 'The No exit leads to the output, after the loop — the function returns it.'],
          diagnose: [
            { match: '.', when: '//', checks: 'the average as a float', cause: 'The flowchart divides with /, which gives a float. <code>//</code> throws away the decimal part.' },
            { match: '.', when: '^\\s{8,}return', checks: 'the output after the loop', cause: 'The OUTPUT box is on the No path, after the loop — return after it, not inside it.' },
            { match: '.', checks: 'the value the flowchart outputs', cause: 'Add every item to TOTAL in the loop, then return TOTAL / N.' }],
          tests: ls.map(l => P.tf(`average_loans(${py.r(l)}) ≈ ${py.f(avg(l))}`, `average_loans(${py.r(l)})`, { f: avg(l) })).join('\n'),
          hint: 'while I < len(LOANS): …'
        };
      } },
      { label: 'b', kind: 'written', term: 'State', marks: 1, make: () => W('State the Big O notation of the algorithm in the flowchart.',
        [['O(n)', 'The loop visits each of the n items exactly once, so the steps grow in proportion to n.'], ['Accept: linear time', 'The same answer in words.']],
        `<p>O(n) ${mk} — one pass through the N items.</p>`) },
      { label: 'c', kind: 'written', term: 'Identify', marks: 1, make: () => W('Identify the variable that the flowchart uses as a counter.',
        [['I', 'It starts at 0 and goes up by 1 each time round, counting through the positions.'], ['Accept: the index I', 'The same variable, described by its job.']],
        `<p>I ${mk}</p>`) },
      { label: 'd', kind: 'written', term: 'Describe', marks: 4, make: () => W('The text file <code>loans.txt</code> has one book per line, as <code>title,loans</code>. Describe the steps an algorithm would follow to output the title of the book with the most loans.',
        [['Open loans.txt for reading and read it line by line', 'The first step of any file algorithm: the right mode and a loop over the lines.'],
          ['Split each line at the comma into the title and the number of loans, converting the number to an integer', 'Each line is text — it must be split and converted before comparing.'],
          ['Compare each number with the highest so far (starting with the first line / a very low value), keeping the title that goes with it', 'This is the maximum pattern, and it keeps the title, not just the number.'],
          ['After the last line, output the title with the most loans (and close the file)', 'The answer is only known after every line has been checked.']],
        `<p>Open <code>loans.txt</code> in read mode and read it one line at a time. ${mk} Split each line at the comma into a title and a number, and convert the number with int(). ${mk} Keep the highest number found so far and its title, replacing both whenever a line has more loans. ${mk} When the end of the file is reached, close it and output the title kept. ${mk}</p>`) },
      { label: 'e', kind: 'trace', term: 'Trace', marks: 5, make(R, ctx) {
        const q = ctx.names.map((n, i) => [n, ctx.k[i]]), rows = [];
        let total = 0, count = 0;
        const left = q.slice();
        while (left.length && total < ctx.limit) { const it = left.shift(); total += it[1]; count++; rows.push([{ v: py.s(it[0]) }, { v: String(total) }, { v: String(count) }]); }
        rows[0][0].given = true;
        const code = `queue = ${py.r(q)}\nLIMIT = ${ctx.limit}\ntotal = 0\ncount = 0\nwhile len(queue) > 0 and total < LIMIT:\n    item = queue.pop(0)\n    total = total + item[1]\n    count = count + 1\nprint(count, total)`;
        return {
          prompt: 'A reservations queue holds each student\'s name and how many books they want. Copy and complete the trace table: one row each time round the loop.',
          code, columns: ['item[0]', 'total', 'count'], rows, extra: [{ label: 'Output', v: `${count} ${total}` }], check: { code, expect: `${count} ${total}` },
          explain: `<p><code>pop(0)</code> removes from the <b>front</b> — first in, first out. ${rows.map(r => `${r[0].v} adds to make ${r[1].v}`).join('; ')}. Then ${total < ctx.limit ? 'the queue is empty' : `total (${total}) is no longer below ${ctx.limit}`}, so the loop ends and <code>${count} ${total}</code> is printed.</p>`
        };
      } }
    ]
  };

  /* ---------- Q1, version B: halving rounds (flowchart), Big O, an output, file algorithm, stack trace ---------- */
  const halvChart = () => P.flowchart([{ id: 's', type: 'term', text: 'Start', c: 0, r: 0 }, { id: 'i', type: 'io', text: 'INPUT N', c: 0, r: 1 }, { id: 'a', type: 'proc', text: 'ROUNDS = 0', c: 0, r: 2 },
    { id: 'd', type: 'dec', text: 'N > 1 ?', c: 0, r: 3 }, { id: 'x', type: 'proc', text: 'N = N // 2', c: 0, r: 4 }, { id: 'y', type: 'proc', text: 'ROUNDS = ROUNDS + 1', c: 0, r: 5 },
    { id: 'o', type: 'io', text: 'OUTPUT ROUNDS', c: 0, r: 6 }, { id: 'e', type: 'term', text: 'End', c: 0, r: 7 }],
  [{ a: 's', b: 'i' }, { a: 'i', b: 'a' }, { a: 'a', b: 'd' }, { a: 'd', b: 'x', label: 'Yes' }, { a: 'x', b: 'y' }, { a: 'y', b: 'd', from: 'left', to: 'left', via: [[-0.82, 5], [-0.82, 3]] },
    { a: 'd', b: 'o', from: 'right', to: 'right', label: 'No', via: [[0.82, 3], [0.82, 6]] }, { a: 'o', b: 'e' }]);
  const rounds = n => { let r = 0; while (n > 1) { n = Math.floor(n / 2); r++; } return r; };
  M.q1b = {
    title: 'Sports day knockout',
    context(R) { return { n: R.int(20, 90), word: R.pick(['LAPS', 'RELAY', 'SPRINT', 'TRACK', 'MEDAL']) }; },
    intro: () => '<p>In a knockout race, half of the runners (rounded down) go through after each round. The flowchart works out how many rounds are needed for N runners.</p>',
    parts: [
      { label: 'a', kind: 'code', term: 'Construct', marks: 3, make(R) {
        const ns = [R.int(5, 40), R.int(60, 200), 1, 2];
        return {
          prompt: 'With reference to the flowchart, construct a Python function <code>rounds(N)</code> that <b>returns</b> the value it outputs.',
          visual: halvChart(), starter: 'def rounds(N):\n    pass\n',
          solution: 'def rounds(N):  # INPUT N becomes the parameter\n    ROUNDS = 0  # process box: ROUNDS = 0\n    while N > 1:  # the decision, with an arrow back up to it: a loop\n        N = N // 2  # halve, rounding down\n        ROUNDS = ROUNDS + 1  # count this round\n    return ROUNDS  # the No exit: OUTPUT ROUNDS\n',
          think: ['INPUT becomes the parameter; OUTPUT becomes the return value.', 'The decision has an arrow coming back up to it from below, so it is a <code>while</code> loop that repeats while N &gt; 1.', 'Halve with <code>//</code> so N stays a whole number.'],
          diagnose: [
            { match: 'rounds\\(1\\)', checks: 'N = 1, where no rounds are needed', cause: 'With N = 1 the decision is No straight away, so the output is 0.' },
            { match: '.', when: 'N\\s*=\\s*N\\s*/\\s*2', checks: 'halving with whole numbers', cause: 'Use <code>//</code>: <code>/</code> gives floats such as 1.5, which is still above 1, so an extra round is counted.' },
            { match: '.', checks: 'the number of rounds', cause: 'while N &gt; 1: N = N // 2; ROUNDS = ROUNDS + 1. Return ROUNDS after the loop.' }],
          tests: ns.map(n => P.t(`rounds(${n}) is ${rounds(n)}`, `rounds(${n})`, rounds(n))).join('\n'),
          hint: 'while N > 1: …'
        };
      } },
      { label: 'b', kind: 'written', term: 'State', marks: 1, make: () => W('State the Big O notation of the algorithm in the flowchart.',
        [['O(log n)', 'N is halved every time round, so doubling N adds only one more round.'], ['Accept: logarithmic time', 'The same answer in words.']],
        `<p>O(log n) ${mk} — N is halved each time round.</p>`) },
      { label: 'c', kind: 'output', term: 'State', marks: 1, make(R, ctx) {
        return {
          prompt: `State the output of the flowchart when the input is <code>N = ${ctx.n}</code>.`, visual: halvChart(),
          run: `N = ${ctx.n}\nROUNDS = 0\nwhile N > 1:\n    N = N // 2\n    ROUNDS = ROUNDS + 1\nprint(ROUNDS)`, answer: String(rounds(ctx.n)),
          explain: `<p>Halving and rounding down: ${(() => { const s = []; let n = ctx.n; while (n > 1) { s.push(n); n = Math.floor(n / 2); } s.push(n); return s.join(' → '); })()}. That is ${rounds(ctx.n)} rounds.</p>`
        };
      } },
      { label: 'd', kind: 'written', term: 'Describe', marks: 4, make: () => W('The text file <code>results.txt</code> has one runner per line, as <code>name,house,time</code>. Describe the steps an algorithm would follow to output how many runners from Red house finished in under 13 seconds.',
        [['Open results.txt for reading and read it line by line', 'The right mode, and a loop over every line.'],
          ['Split each line at the commas into name, house and time, converting the time to a number', 'The fields must be separated, and the time converted before it can be compared.'],
          ['Check whether the house is Red AND the time is less than 13, adding 1 to a counter (set to 0 at the start) if so', 'Both conditions must hold; the counter is the count pattern.'],
          ['After the last line, output the counter (and close the file)', 'The count is only complete after every line.']],
        `<p>Set a counter to 0 and open <code>results.txt</code> for reading, going through it line by line. ${mk} Split each line at the commas and convert the time to a float. ${mk} If the house is "Red" and the time is below 13, add 1 to the counter. ${mk} At the end of the file, close it and output the counter. ${mk}</p>`) },
      { label: 'e', kind: 'trace', term: 'Trace', marks: 5, make(R, ctx) {
        const w = ctx.word, stack = w.split(''), rows = [];
        let result = '';
        while (stack.length) { const ch = stack.pop(); result += ch; rows.push([{ v: py.s(ch) }, { v: py.s(result) }, { v: String(stack.length) }]); }
        rows[0][0].given = true;
        const code = `word = "${w}"\nstack = []\nfor ch in word:\n    stack.append(ch)\nresult = ""\nwhile len(stack) > 0:\n    ch = stack.pop()\n    result = result + ch\nprint(result)`;
        return {
          prompt: 'This program uses a stack (a Python list, where <code>append</code> pushes and <code>pop</code> pops). Copy and complete the trace table for the <code>while</code> loop: one row each time round.',
          code, columns: ['ch', 'result', 'len(stack)'], rows, extra: [{ label: 'Output', v: result }], check: { code, expect: result },
          explain: `<p>The <code>for</code> loop pushes ${w.split('').map(c => `"${c}"`).join(', ')}, so "${w[w.length - 1]}" is on top. A stack is LIFO, so popping gives the letters in reverse: the output is ${result}.</p>`
        };
      } }
    ]
  };

  /* ---------- Q2: parallel arrays and a 2D list (two versions) ---------- */
  function q2(v) {
    const A = v === 'A';
    const S = A ? { what: 'book', N: 'TITLES', V: 'LOANS', vw: 'loans', G: 'MONTHLY', cw: 'month', pool: () => P.data.books, lo: 0, hi: 40 }
      : { what: 'runner', N: 'RUNNERS', V: 'JUMPS', vw: 'best jump in cm', G: 'ATTEMPTS', cw: 'attempt', pool: () => P.data.names, lo: 300, hi: 560 };
    return {
      title: A ? 'Library loans, by title and by month' : 'Long jump results',
      context(R) {
        const names = R.sample(S.pool(), 8), vals = names.map(() => R.int(S.lo, S.hi)), grid = names.map(() => [R.int(S.lo, S.hi), R.int(S.lo, S.hi), R.int(S.lo, S.hi)]);
        return { names, vals, grid, k: R.int(1, 7), mark: A ? 15 : 450 };
      },
      intro: ctx => `<p>Two parallel arrays hold ${A ? 'each book\'s title and its number of loans this term' : 'each runner\'s name and their best long jump in cm'}:</p><pre class="q-pre">${S.N} = ${esc(py.r(ctx.names))}\n${S.V} = ${py.r(ctx.vals)}</pre><p>The 2D list <code>${S.G}</code> has one row per ${S.what} (in the same order) and one column per ${S.cw} (3 ${S.cw}s):</p><pre class="q-pre">${S.G} = [\n${ctx.grid.map(r => '    ' + py.r(r)).join(',\n')}\n]</pre>`,
      parts: [
        { label: 'a', kind: 'output', term: 'State', marks: 1, make: (R, ctx) => ({
          prompt: 'State the output of this line.', setup: `${S.N} = ${py.r(ctx.names)}\n${S.V} = ${py.r(ctx.vals)}`, code: `print(${S.N}[${ctx.k}], ${S.V}[${ctx.k}])`,
          answer: `${ctx.names[ctx.k]} ${ctx.vals[ctx.k]}`, explain: `<p>Index ${ctx.k} is the <b>${ctx.k + 1}${['st', 'nd', 'rd'][ctx.k] || 'th'}</b> item, because indexes start at 0. Parallel arrays use the same index for the same ${S.what}.</p>`
        }) },
        { label: 'b', kind: 'code', term: 'Construct', marks: 3, make(R, ctx) {
          const ls = [ctx.vals, R.ints(5, S.lo, S.hi), R.ints(3, S.lo, S.hi)];
          if (A) return {
            prompt: `Construct a function <code>total_loans(${S.V})</code> that returns the total number of loans. Do not use <code>sum()</code>.`,
            starter: `def total_loans(${S.V}):\n    pass\n`,
            solution: `def total_loans(${S.V}):  # the array of loans\n    total = 0  # running total starts at 0\n    for n in ${S.V}:  # every item\n        total = total + n  # add it on\n    return total  # after the loop\n`,
            think: ['A running total: start at 0 before the loop and add each item inside it.', 'Return the total after the loop.'],
            diagnose: [{ match: '.', when: 'total\\s*=\\s*n\\s*$', checks: 'adding up every item', cause: '<code>total = n</code> replaces the total; add to it.' }, { match: '.', checks: 'the total of the array', cause: 'Start at 0, add each item in the loop, return after it.' }],
            tests: ls.map(l => P.t(`total_loans(${py.r(l)}) is ${l.reduce((a, b) => a + b, 0)}`, `total_loans(${py.r(l)})`, l.reduce((a, b) => a + b, 0))).join('\n'),
            banned: P.ban('sum'), hint: 'total = 0; for n in LOANS: total = total + n'
          };
          return {
            prompt: `Construct a function <code>best(${S.V})</code> that returns the longest jump. Do not use <code>max()</code> or sorting.`,
            starter: `def best(${S.V}):\n    pass\n`,
            solution: `def best(${S.V}):  # the array of jumps\n    top = ${S.V}[0]  # start with the first jump, not 0\n    for j in ${S.V}:  # compare every jump\n        if j > top:  # longer than the best so far?\n            top = j  # remember it\n    return top  # the longest jump\n`,
            think: ['The maximum pattern: keep the best so far, starting with the first item.', 'Replace it whenever a bigger value appears; return after the loop.'],
            diagnose: [{ match: '.', when: 'j\\s*<\\s*top', checks: 'finding the longest', cause: '<code>&lt;</code> finds the shortest. Use <code>&gt;</code>.' }, { match: '.', checks: 'the longest jump', cause: 'Start with the first jump and replace it when j &gt; top.' }],
            tests: ls.map(l => P.t(`best(${py.r(l)}) is ${Math.max(...l)}`, `best(${py.r(l)})`, Math.max(...l))).join('\n'),
            banned: P.ban('max', 'sorted', 'sort'), hint: 'top = JUMPS[0], then compare.'
          };
        } },
        { label: 'c', kind: 'code', term: 'Construct', marks: 4, make(R, ctx) {
          if (A) {
            const other = R.sample(P.data.books, 4), ov = other.map(() => R.int(0, 40)), top = (n, v) => n[v.indexOf(Math.max(...v))];
            return {
              prompt: `Construct a function <code>most_borrowed(${S.N}, ${S.V})</code> that returns the title of the book with the most loans (the first one, if there is a tie). Do not use <code>max()</code> or <code>index()</code>.`,
              starter: `def most_borrowed(${S.N}, ${S.V}):\n    pass\n`,
              solution: `def most_borrowed(${S.N}, ${S.V}):  # parallel arrays\n    best = 0  # index of the most-borrowed book so far\n    for i in range(len(${S.V})):  # every index\n        if ${S.V}[i] > ${S.V}[best]:  # more loans than the best so far? (> keeps the first on a tie)\n            best = i  # remember its index\n    return ${S.N}[best]  # the same index in the other array gives the title\n`,
              think: ['Keep the <b>index</b> of the best so far, because the title is in the other array at the same index.', 'Compare <code>LOANS[i]</code> with <code>LOANS[best]</code>; use <code>&gt;</code> so a tie keeps the first.', 'Return <code>TITLES[best]</code> after the loop.'],
              diagnose: [{ match: '.', when: 'return\\s+LOANS', checks: 'returning the title', cause: 'You return the number of loans; return the title at the same index.' }, { match: '.', checks: 'the title with the most loans', cause: 'Keep the index of the largest number, then return TITLES[best].' }],
              tests: [P.t(`most_borrowed(the term's arrays) is ${py.s(top(ctx.names, ctx.vals))}`, `most_borrowed(${py.r(ctx.names)}, ${py.r(ctx.vals)})`, top(ctx.names, ctx.vals)),
                P.t(`most_borrowed(${py.r(other)}, ${py.r(ov)}) is ${py.s(top(other, ov))}`, `most_borrowed(${py.r(other)}, ${py.r(ov)})`, top(other, ov))].join('\n'),
              banned: P.ban('max', 'index'), hint: 'Track the index of the biggest value.'
            };
          }
          const cnt = (l, m) => l.filter(x => x >= m).length, other = R.ints(6, S.lo, S.hi);
          return {
            prompt: `To qualify for the final, a jump must be at least <code>mark</code> cm. Construct a function <code>count_qualifiers(${S.V}, mark)</code> that returns how many runners qualify.`,
            starter: `def count_qualifiers(${S.V}, mark):\n    pass\n`,
            solution: `def count_qualifiers(${S.V}, mark):  # the jumps and the qualifying mark\n    count = 0  # no qualifiers yet\n    for j in ${S.V}:  # every runner's jump\n        if j >= mark:  # "at least" includes the mark itself\n            count = count + 1  # this runner qualifies\n    return count  # after checking them all\n`,
            think: ['The count pattern: start at 0, add 1 for every item that passes the test.', '"At least" means <code>&gt;=</code>.', 'Return the count after the loop.'],
            diagnose: [{ match: '.', when: 'j\\s*>\\s*mark', checks: 'a jump exactly on the mark', cause: '"At least" includes the mark: use <code>&gt;=</code>.' }, { match: '.', checks: 'the number of qualifiers', cause: 'Count the jumps where j &gt;= mark; return after the loop.' }],
            tests: [P.t(`count_qualifiers(JUMPS, ${ctx.mark}) is ${cnt(ctx.vals, ctx.mark)}`, `count_qualifiers(${py.r(ctx.vals)}, ${ctx.mark})`, cnt(ctx.vals, ctx.mark)),
              P.t(`count_qualifiers(${py.r(other)}, ${other[2]}) is ${cnt(other, other[2])}`, `count_qualifiers(${py.r(other)}, ${other[2]})`, cnt(other, other[2]))].join('\n'),
            hint: 'count = 0; for j in JUMPS: if j >= mark: …'
          };
        } },
        { label: 'd', kind: 'written', term: 'State', marks: 1, make: (R, ctx) => W(`State the code that gives the value for the ${S.what} <b>${esc(ctx.names[2])}</b> in the <b>second</b> ${S.cw}.`,
          [[`<code>${S.G}[2][1]</code>`, `${ctx.names[2]} is row 2 (the third ${S.what}); the second ${S.cw} is column 1, because columns start at 0 too.`], [`Accept: <code>print(${S.G}[2][1])</code>`, 'The same expression, printed.']],
          `<p><code>${S.G}[2][1]</code> ${mk}</p>`) },
        { label: 'e', kind: 'code', term: 'Construct', marks: 5, make(R, ctx) {
          const g2 = [[1, 2, 3], [4, 5, 6]];
          if (A) {
            const ct = g => [0, 1, 2].map(c => g.reduce((s, r) => s + r[c], 0));
            return {
              prompt: `Construct a function <code>month_totals(${S.G})</code> that returns a list of the total loans in each ${S.cw}: <code>[month 1 total, month 2 total, month 3 total]</code>.`,
              starter: `def month_totals(${S.G}):\n    pass\n`,
              solution: `def month_totals(${S.G}):  # one row per book, one column per month\n    totals = []  # one total per month\n    for c in range(3):  # outer loop over the columns (months)\n        total = 0  # reset for each month\n        for r in range(len(${S.G})):  # inner loop down the rows (books)\n            total = total + ${S.G}[r][c]  # row first, then column\n        totals.append(total)  # this month is finished\n    return totals  # e.g. [m1, m2, m3]\n`,
              think: ['Column totals: the outer loop goes across the columns, the inner loop goes down the rows.', 'Reset the total at the start of each column.', 'Index with <code>[row][column]</code>, and add each finished total to the result list.'],
              diagnose: [{ match: '.', when: 'total\\s*=\\s*0[^\\n]*\\n(?:(?!for)[\\s\\S])*?$', checks: 'a separate total for each month', cause: 'Reset the total inside the outer loop, once per month.' }, { match: '.', checks: 'the three monthly totals', cause: 'For each column c, add MONTHLY[r][c] for every row r, then append the total.' }],
              tests: [P.t('month_totals(MONTHLY) is ' + py.r(ct(ctx.grid)), `month_totals(${py.r(ctx.grid)})`, ct(ctx.grid)), P.t('month_totals([[1, 2, 3], [4, 5, 6]]) is [5, 7, 9]', 'month_totals([[1, 2, 3], [4, 5, 6]])', [5, 7, 9])].join('\n'),
              banned: P.ban('sum'), hint: 'for c in range(3): total = 0; for r in range(len(MONTHLY)): …'
            };
          }
          const rb = g => g.map(r => Math.max(...r));
          return {
            prompt: `Construct a function <code>best_each(${S.G})</code> that returns a list of each runner's best ${S.cw}, in order. Do not use <code>max()</code>.`,
            starter: `def best_each(${S.G}):\n    pass\n`,
            solution: `def best_each(${S.G}):  # one row per runner, one column per attempt\n    result = []  # one best per runner\n    for row in ${S.G}:  # each runner's attempts\n        top = row[0]  # start with their first attempt\n        for j in row:  # compare every attempt\n            if j > top:  # longer?\n                top = j  # remember it\n        result.append(top)  # this runner's best\n    return result  # in the same order as the runners\n`,
            think: ['Each row is one runner, so loop over the rows.', 'Inside, use the maximum pattern on that row, starting with its first value.', 'Append each row\'s best to the result list, after the inner loop.'],
            diagnose: [{ match: '.', when: '^\\s{12,}result\\.append', checks: 'one best per runner', cause: 'The append is inside the inner loop; line it up with the inner <code>for</code>.' }, { match: '.', checks: 'each runner\'s best attempt', cause: 'For each row, find its largest value and append it.' }],
            tests: [P.t('best_each(ATTEMPTS) is ' + py.r(rb(ctx.grid)), `best_each(${py.r(ctx.grid)})`, rb(ctx.grid)), P.t('best_each([[1, 2, 3], [4, 6, 5]]) is [3, 6]', 'best_each([[1, 2, 3], [4, 6, 5]])', [3, 6])].join('\n'),
            banned: P.ban('max', 'sorted', 'sort'), hint: 'for row in ATTEMPTS: top = row[0] …'
          };
        } },
        { label: 'f', kind: 'written', term: 'State', marks: 2, make: (R, ctx) => A
          ? W(`The following code operates on <code>${S.G}</code>:<pre class="q-pre">m = ${S.G}[0][0]\nfor row in range(8):\n    for col in range(3):\n        if ${S.G}[row][col] < m:\n            m = ${S.G}[row][col]\nprint(m)</pre>State the operation performed by this code.`,
            [['It finds (and outputs) the smallest value', 'It is the minimum pattern: m only changes when a smaller value is found.'], ['…across the whole 2D list / every book in every month', 'Both loops cover every row and every column.']],
            `<p>It finds the <b>smallest</b> number of loans ${mk} of any book in any month — it checks every cell of the whole 2D list. ${mk}</p>`)
          : W(`The following code operates on <code>${S.G}</code>:<pre class="q-pre">t = 0\nfor row in range(8):\n    t = t + ${S.G}[row][0]\nprint(t / 8)</pre>State the operation performed by this code.`,
            [['It calculates (and outputs) the average / mean', 'It adds up values and divides by how many there are.'], ['…of the first attempt of every runner (column 0)', 'Only column 0 is used, for all 8 rows.']],
            `<p>It outputs the <b>average</b> ${mk} of every runner's <b>first</b> attempt — column 0 of each row. ${mk}</p>`) }
      ]
    };
  }
  M.q2a = q2('A');
  M.q2b = q2('B');
})(CodeCraft.practice);
