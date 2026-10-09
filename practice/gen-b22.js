/* Practice generators — B2.2 Data structures (static vs dynamic, 1D/2D lists, stacks, queues). */
(function (P) {
  const { py, esc, code: C } = P;
  const opt = (text, ok, why) => ({ text, ok: !!ok, why });

  const STACK = 'class Stack:\n    def __init__(self):\n        self.items = []\n    def push(self, x):\n        self.items.append(x)\n    def pop(self):\n        return self.items.pop()\n    def peek(self):\n        return self.items[-1]\n    def isEmpty(self):\n        return len(self.items) == 0';
  const QUEUE = 'class Queue:\n    def __init__(self):\n        self.items = []\n    def enqueue(self, x):\n        self.items.append(x)\n    def dequeue(self):\n        return self.items.pop(0)\n    def front(self):\n        return self.items[0]\n    def isEmpty(self):\n        return len(self.items) == 0';
  const STATIC_STACK = 'class Stack:\n    def __init__(self, size):\n        self.items = [None] * size\n        self.topIndex = -1\n\n    def isEmpty(self):\n        return self.topIndex == -1\n\n    def isFull(self):\n        return self.topIndex == len(self.items) - 1\n\n    def push(self, x):\n        if self.isFull():\n            print("Overflow")\n        else:\n            self.topIndex = self.topIndex + 1\n            self.items[self.topIndex] = x\n\n    def pop(self):\n        if self.isEmpty():\n            print("Underflow")\n            return None\n        x = self.items[self.topIndex]\n        self.topIndex = self.topIndex - 1\n        return x';
  const CIRC = 'class CircularQueue:\n    def __init__(self, size):\n        self.items = [None] * size\n        self.front = 0\n        self.rear = -1\n        self.count = 0\n\n    def enqueue(self, x):\n        if self.count == len(self.items):\n            print("Full")\n        else:\n            self.rear = (self.rear + 1) % len(self.items)\n            self.items[self.rear] = x\n            self.count = self.count + 1\n\n    def dequeue(self):\n        if self.count == 0:\n            print("Empty")\n            return None\n        x = self.items[self.front]\n        self.front = (self.front + 1) % len(self.items)\n        self.count = self.count - 1\n        return x';
  const classNote = (name, src) => `<details class="q-class"><summary>${name} is the class from the lesson — show it</summary>${P.pre(src)}</details>`;

  /* ================= B2.2.1  Static vs dynamic ================= */
  const SD = {
    static: ['Its size is fixed when it is created.', 'Memory for every element is reserved in advance, even if some slots are never used.', 'Adding an element when it is already full causes an overflow error.', 'Elements sit in one block of memory, so access by index is fast and predictable.', 'Example: an array with exactly 7 slots, one for each day of the week.'],
    dynamic: ['It can grow and shrink while the program runs.', 'Memory is allocated as elements are added.', 'It only uses as much memory as it needs (plus a little overhead).', 'Growing it can take extra time while more memory is found.', 'Example: a Python list of club members that students join during the year.']
  };
  const SD_CHOICE = [
    ['the 12 monthly rainfall totals for a year', 'static', 'there are always exactly 12 months'],
    ['every book returned to the library today', 'dynamic', 'the number of returns changes from day to day'],
    ['the 120 desks in the exam hall', 'static', 'the number of desks is fixed'],
    ['messages in a group chat', 'dynamic', 'new messages keep arriving'],
    ['the points total for each of the 4 houses', 'static', 'there are always 4 houses'],
    ['students joining the waiting list for a school trip', 'dynamic', 'the list grows as students sign up'],
    ['the 7 daily temperatures for one week', 'static', 'a week always has 7 days'],
    ['orders placed at the canteen during lunch', 'dynamic', 'you can\'t know in advance how many orders there will be']
  ];
  P.add('B2.2.1', [
    { id: 'sd-classify', kind: 'mcq', term: 'Identify', marks: 1, make(R) {
      const k = R.pick(['static', 'dynamic']), s = R.pick(SD[k]), other = k === 'static' ? 'dynamic' : 'static';
      return {
        prompt: `Does this statement describe a <strong>static</strong> or a <strong>dynamic</strong> data structure?<blockquote>${esc(s)}</blockquote>`,
        options: [opt(`Static data structure`, k === 'static', k === 'static' ? 'Yes — a static structure has a fixed size, with its memory allocated when it is created.' : 'A static structure has a fixed size set when it is created, so it can\'t grow or shrink.'),
          opt(`Dynamic data structure`, k === 'dynamic', k === 'dynamic' ? 'Yes — a dynamic structure allocates memory as it grows and shrinks at run time.' : 'A dynamic structure can change size while the program runs.'),
          opt('Both', false, `This is only true of ${k} structures; a ${other} structure behaves differently.`)],
        steps: ['Ask the one question that separates them: can the size change while the program runs?',
          'Fixed size, memory reserved up front, can overflow when full → static. Grows and shrinks, memory allocated as needed → dynamic.',
          `This statement describes the ${k === 'static' ? 'fixed-size' : 'changing-size'} behaviour, so it is <strong>${k}</strong>.`]
      };
    } },
    { id: 'sd-choose', kind: 'mcq', term: 'Identify', marks: 1, make(R) {
      const [what, k, why] = R.pick(SD_CHOICE);
      return {
        prompt: `Which is more suitable for storing <strong>${esc(what)}</strong>?`,
        options: [opt('A static data structure (fixed-size array)', k === 'static', k === 'static' ? `Yes — ${why}, so a fixed size wastes no memory and can't overflow.` : `No — ${why}, so a fixed size could overflow or waste memory.`),
          opt('A dynamic data structure (e.g. a Python list)', k === 'dynamic', k === 'dynamic' ? `Yes — ${why}, so the structure needs to grow.` : `It would work, but ${why}: a fixed size is enough and uses memory predictably.`),
          opt('A single variable', false, 'One variable can only hold one value; this needs a collection.')],
        steps: ['Ask whether you know exactly how many items there will be before the program runs.',
          `Here ${why}.`,
          k === 'static' ? 'A known, fixed number of items suits a static structure: no wasted space and no risk of it overflowing.' : 'An unknown or changing number of items needs a dynamic structure that can grow.']
      };
    } },
    { id: 'sd-compare', kind: 'written', term: 'Compare', marks: 4, make() {
      return {
        prompt: 'Compare static and dynamic data structures.',
        markscheme: [
          { text: '<strong>Similarity:</strong> both store a collection of elements that can be accessed/traversed', why: '"Compare" means giving similarities as well as differences — this is the similarity.' },
          { text: '<strong>Size:</strong> a static structure has a fixed size; a dynamic one can grow and shrink at run time', why: 'It states the difference for <em>both</em> structures, which is what a comparison point needs.' },
          { text: '<strong>Memory allocation:</strong> static memory is reserved when it is created; dynamic memory is allocated as needed', why: 'It contrasts <em>when</em> memory is allocated for each one.' },
          { text: '<strong>Memory use:</strong> static may waste unused slots; dynamic only uses what it needs (plus overhead)', why: 'It gives a consequence of the allocation difference for each structure.' },
          { text: '<strong>Speed:</strong> static access is fast and predictable; dynamic may be slower when it has to resize', why: 'It compares performance, a key trade-off examiners look for.' },
          { text: '<strong>Overflow:</strong> a static structure can become full; a dynamic one is limited only by available memory', why: 'It compares what happens when you keep adding items.' }],
        model: '"Compare" needs both similarities and differences. 1 mark per valid point, maximum 4.',
        answer: '<p>Both static and dynamic structures store a collection of items that can be accessed and traversed. <span class="mk">[1]</span></p><p>A static structure has a fixed size set when it is created, whereas a dynamic structure can grow and shrink while the program runs. <span class="mk">[1]</span></p><p>A static structure reserves all its memory up front, so unused slots can waste memory, while a dynamic structure allocates memory only as items are added. <span class="mk">[1]</span></p><p>Access to a static structure is fast and predictable, but a dynamic structure may be slower when it has to find more memory to resize. <span class="mk">[1]</span></p>'
      };
    } },
    { id: 'sd-array', kind: 'mcq', term: 'State', marks: 2, make(R) {
      const size = R.int(4, 6), [n1, n2] = R.sample(P.data.names, 2), i = R.int(0, size - 1), j = R.chance(0.5) ? size : R.int(0, size - 1);
      const arr = Array(size).fill(null); arr[i] = n1;
      const bad = j >= size;
      if (!bad) arr[j] = n2;
      const code = `seats = [None] * ${size}\nseats[${i}] = "${n1}"\nseats[${j}] = "${n2}"\nprint(seats)`;
      const grow = Array(size).fill(null); grow[i] = n1; grow.push(n2);
      return {
        prompt: 'This code simulates a static array with a fixed number of seats. What happens when it runs?', code,
        options: bad ? [opt('IndexError: list assignment index out of range', true, `The array has ${size} slots (indexes 0–${size - 1}). Index ${j} doesn't exist, and a static array can't grow.`),
          opt(py.r(grow), false, 'Assigning to an index never adds a new slot — only append() grows a list.'),
          opt(py.r(Array(size).fill(null).map((x, k) => (k === i ? n1 : null))), false, 'The error stops the program before print runs.'),
          opt(`[${py.s(n1)}, ${py.s(n2)}]`, false, '[None] * ' + size + ' creates ' + size + ' slots; the unused ones stay None.')]
          : [opt(py.r(arr), true, `There are ${size} slots; ${n1} goes in index ${i}${i === j ? ', then is replaced by ' + n2 : ' and ' + n2 + ' in index ' + j}. Unused slots stay None.`),
            opt(`[${i === j ? py.s(n2) : py.s(n1) + ', ' + py.s(n2)}]`, false, `[None] * ${size} creates ${size} slots; the unused ones are still there, holding None.`),
            opt('IndexError: list assignment index out of range', false, `Index ${j} is within 0–${size - 1}, so the assignment is fine.`),
            opt(py.r(arr.slice().reverse()), false, 'Each value goes exactly at the index given.')],
        mono: true,
        check: { code: `try:\n${code.split('\n').map(l => '    ' + l).join('\n')}\nexcept IndexError as e:\n    print("IndexError: " + str(e))`, expect: bad ? 'IndexError: list assignment index out of range' : py.r(arr) },
        steps: [`<code>[None] * ${size}</code> makes exactly ${size} slots, indexes 0 to ${size - 1}, all holding None.`,
          `Check each assignment's index is between 0 and ${size - 1}: index ${i}${i !== j ? ` and index ${j}` : ''}.`,
          bad ? `Index ${j} is outside the range, so Python raises IndexError — assigning to an index never makes the list bigger.` : `Both are valid, so the names go into those slots and the other slots stay None: ${py.r(arr)}.`]
      };
    } }
  ]);

  /* ================= B2.2.2  1D and 2D lists ================= */
  function listOps(R) {
    let items = R.sample(P.data.names, R.int(3, 4));
    const start = items.slice(), lines = [`items = ${py.r(items)}`], steps = [], alts = { insAfter: items.slice(), popFirst: items.slice(), none: items.slice() };
    const pool = R.sample(P.data.names.filter(n => !items.includes(n)), 3);
    const ops = R.sample(['append', 'insert', 'remove', 'pop', 'popi', 'set'], R.int(3, 4));
    for (const op of ops) {
      if (op === 'append') { const x = pool.pop() || 'Wen'; items.push(x); alts.insAfter.push(x); alts.popFirst.push(x); lines.push(`items.append("${x}")`); steps.push(`append adds ${x} to the end`); }
      else if (op === 'insert') { const x = pool.pop() || 'Uma', i = R.int(0, items.length - 1); items.splice(i, 0, x); alts.insAfter.splice(Math.min(i + 1, alts.insAfter.length), 0, x); alts.popFirst.splice(Math.min(i, alts.popFirst.length), 0, x); lines.push(`items.insert(${i}, "${x}")`); steps.push(`insert(${i}, ...) puts ${x} <em>at</em> index ${i}, shifting the rest right`); }
      else if (op === 'remove' && items.length > 1) { const x = R.pick(items); items.splice(items.indexOf(x), 1); [alts.insAfter, alts.popFirst].forEach(a => { const k = a.indexOf(x); if (k >= 0) a.splice(k, 1); }); lines.push(`items.remove("${x}")`); steps.push(`remove("${x}") deletes the first ${x} (by value)`); }
      else if (op === 'pop' && items.length > 1) { items.pop(); alts.insAfter.pop(); alts.popFirst.shift(); lines.push('items.pop()'); steps.push('pop() with no index removes the <em>last</em> item'); }
      else if (op === 'popi' && items.length > 2) { const i = R.int(0, items.length - 1); items.splice(i, 1); alts.insAfter.splice(i, 1); alts.popFirst.splice(i, 1); lines.push(`items.pop(${i})`); steps.push(`pop(${i}) removes the item at index ${i}`); }
      else if (op === 'set') { const x = pool.pop() || 'Zane', i = R.int(0, items.length - 1); items[i] = x; alts.insAfter[Math.min(i, alts.insAfter.length - 1)] = x; alts.popFirst[Math.min(i, alts.popFirst.length - 1)] = x; lines.push(`items[${i}] = "${x}"`); steps.push(`items[${i}] = ... replaces the item at index ${i}`); }
    }
    return { items, start, lines, steps, alts };
  }
  P.add('B2.2.2', [
    { id: 'list-ops', kind: 'output', term: 'State', marks: 2, make(R) {
      const t = listOps(R);
      const extra = R.chance(0.5) && t.items.length > 1 ? [`print(items[-1], len(items))`, `${t.items[t.items.length - 1]} ${t.items.length}`] : null;
      return {
        prompt: 'What does this program print?', code: t.lines.join('\n') + '\nprint(items)' + (extra ? '\n' + extra[0] : ''),
        answer: py.r(t.items) + (extra ? '\n' + extra[1] : ''),
        explain: P.list(t.steps) + (extra ? '<p>items[-1] is the last item, and len() counts the items.</p>' : '')
      };
    } },
    { id: 'list-ops-mcq', kind: 'mcq', term: 'State', marks: 2, make(R) {
      let t; do { t = listOps(R); } while (!t.lines.some(l => /insert|pop\(\)/.test(l)));
      return {
        prompt: 'What does <code>print(items)</code> show after this code runs?', code: t.lines.join('\n'),
        options: P.options(opt(py.r(t.items), true, P.list(t.steps)), [
          opt(py.r(t.alts.insAfter), false, 'This treats insert(i, x) as putting x <em>after</em> index i — it goes <em>at</em> index i.'),
          opt(py.r(t.alts.popFirst), false, 'pop() with no index removes the last item, not the first.'),
          opt(py.r(t.start), false, 'List methods change the list in place, so items is different now.'),
          opt(py.r(t.items.slice().reverse()), false, 'The operations don\'t reverse the list — each item stays where the methods put it.'),
          opt(py.r(t.items.slice(0, -1)), false, 'The last item is still in the list — check each operation in order.')]), mono: true,
        check: { code: t.lines.join('\n') + '\nprint(items)', expect: py.r(t.items) },
        steps: ['Write the list out and update it after every line — don\'t try to do it all in your head.', ...t.steps.map((st, k) => `Line ${k + 2}: ${st}.`), `So the list ends as ${esc(py.r(t.items))}.`]
      };
    } },
    { id: 'list-2d', kind: 'output', term: 'Determine', marks: 3, make(R) {
      const rows = 3, cols = R.int(3, 4), grid = Array.from({ length: rows }, () => R.ints(cols, 1, 9)), r = R.int(0, rows - 1), c = R.int(0, cols - 1), c2 = R.int(0, cols - 1);
      const P3 = R.sample([
        [`print(marks[${r}][${c}])`, String(grid[r][c]), `row ${r}, column ${c}`],
        [`print(marks[${r}])`, py.r(grid[r]), `marks[${r}] is the whole row ${r}`],
        ['print(len(marks), len(marks[0]))', `${rows} ${cols}`, `len(marks) counts the rows (${rows}); len(marks[0]) counts the columns in row 0 (${cols})`],
        [`print(marks[-1][-1])`, String(grid[rows - 1][cols - 1]), 'the last item of the last row']
      ], 2);
      const colTotal = grid.reduce((a, row) => a + row[c2], 0);
      return {
        prompt: 'Each row of <code>marks</code> holds one student\'s test marks. What does this program print?',
        code: `marks = [\n${grid.map(g => '    ' + py.r(g)).join(',\n')}\n]\n${P3.map(p => p[0]).join('\n')}\ntotal = 0\nfor row in marks:\n    total = total + row[${c2}]\nprint(total)`,
        answer: P3.map(p => p[1]).join('\n') + '\n' + colTotal,
        explain: P.list(P3.map(p => `${C(p[0])} → ${p[1]}: ${p[2]}`).concat([`The loop adds column ${c2} of every row: ${grid.map(g => g[c2]).join(' + ')} = ${colTotal}`]))
      };
    } },
    { id: 'list-2d-rows', kind: 'trace', term: 'Trace', marks: 3, make(R) {
      const cols = R.int(3, 4), grid = Array.from({ length: R.int(3, 4) }, () => R.ints(cols, 1, 9));
      const code = `scores = ${py.r(grid)}\nfor r in range(len(scores)):\n    total = 0\n    for c in range(len(scores[r])):\n        total = total + scores[r][c]\n    print(r, total)`;
      const totals = grid.map(g => g.reduce((a, b) => a + b, 0));
      return {
        prompt: 'Complete the trace table: one row per iteration of the <strong>outer</strong> loop, showing the row and its total when <code>print</code> runs.', code,
        columns: ['r', 'scores[r]', 'total'], rows: grid.map((g, r) => [{ v: String(r), given: true }, { v: py.r(g), given: r === 0 }, { v: String(totals[r]) }]),
        check: { code, expect: totals.map((t, r) => `${r} ${t}`).join('\n') },
        explain: '<p>The nested loop visits every column of row r. <code>total</code> is reset to 0 at the start of each row, so each printed total is just that row.</p>'
      };
    } },
    { id: 'list-code', kind: 'code', term: 'Construct', marks: 4, make(R) {
      const v = R.int(0, 5), ls = Array.from({ length: 4 }, () => R.ints(R.int(4, 7), -20, 99));
      const sumOf = a => a.reduce((x, y) => x + y, 0);
      if (v === 0) return { prompt: 'Write <code>find_max(nums)</code> that returns the largest number. <strong>No built-ins:</strong> no <code>max()</code>, <code>sorted()</code> or <code>.sort()</code>.',
        starter: 'def find_max(nums):\n    pass\n', solution: 'def find_max(nums):  # nums is a non-empty list of numbers\n    best = nums[0]  # start with the first item, NOT 0 (the list may be all negative)\n    for n in nums:  # look at every number\n        if n > best:  # is it bigger than the biggest so far?\n            best = n  # yes: remember it\n    return best  # after the loop, best is the largest\n',
        think: ['This is the "maximum" pattern: keep the biggest value seen so far and update it when you find a bigger one.', 'Start with the first item — starting at 0 fails when every number is negative.', 'Compare each number with <code>best</code> using <code>&gt;</code>, then return <code>best</code> after the loop.'],
        diagnose: [
          { match: '.', when: 'best\\s*=\\s*0\\s*$', checks: 'a list that may contain only negative numbers', cause: 'You start <code>best</code> at 0, so if every number is negative, 0 is returned. Start with <code>nums[0]</code>.' },
          { match: '.', when: '<\\s*best|best\\s*>', checks: 'finding the largest number', cause: 'Your comparison finds the <em>smallest</em> value. You need <code>if n &gt; best</code>.' },
          { match: '.', checks: 'finding the largest number in a list', cause: 'Check you update <code>best</code> whenever a bigger number appears, and return it after the loop (not inside it).' }],
        tests: ls.map(l => P.t(`find_max(${py.r(l)}) returns ${Math.max(...l)}`, `find_max(${py.r(l)})`, Math.max(...l))).join('\n'), banned: P.ban('max', 'sorted', 'sort'),
        hint: 'Start with the first item, not 0 — the list might be all negative.' };
      if (v === 1) return { prompt: 'Write <code>list_length(items)</code> that returns how many items are in the list. <strong>No built-ins:</strong> don\'t use <code>len()</code>.',
        starter: 'def list_length(items):\n    pass\n', solution: 'def list_length(items):  # any list\n    count = 0  # no items counted yet\n    for x in items:  # the loop runs once per item\n        count = count + 1  # so add one each time round\n    return count  # the number of times the loop ran = the number of items\n',
        think: ['Without <code>len()</code>, count the items yourself.', 'A <code>for</code> loop runs exactly once for each item, so add 1 each time round.', 'An empty list never enters the loop, so the counter stays at 0 — which is correct.'],
        diagnose: [
          { match: 'list_length\\(\\[\\]\\)', checks: 'an empty list', cause: 'For an empty list the loop never runs, so your function must still return 0 — make sure the counter starts at 0 and is returned after the loop.' },
          { match: '.', when: 'count\\s*=\\s*count\\s*\\+\\s*x', checks: 'counting the items in a list', cause: 'You are adding the item\'s <em>value</em>. Add 1 for each item instead: <code>count = count + 1</code>.' },
          { match: '.', checks: 'counting the items in a list', cause: 'Start the counter at 0, add 1 inside the loop, and return it after the loop.' }],
        tests: [...ls.map(l => P.t(`list_length(${py.r(l)}) returns ${l.length}`, `list_length(${py.r(l)})`, l.length)), P.t('list_length([]) returns 0', 'list_length([])', 0)].join('\n'), banned: P.ban('len'),
        hint: 'Count with a loop: add 1 for every item.' };
      if (v === 2) { const words = Array.from({ length: 4 }, () => R.ints(R.int(5, 8), 1, 4).map(i => P.data.houses[i - 1])), tgt = R.pick(P.data.houses);
        return { prompt: `Write <code>count_occurrences(items, target)</code> that returns how many times <code>target</code> appears. <strong>No built-ins:</strong> don't use <code>.count()</code>.`,
          starter: 'def count_occurrences(items, target):\n    pass\n', solution: 'def count_occurrences(items, target):  # the list and the value to look for\n    n = 0  # how many matches so far\n    for x in items:  # check every item\n        if x == target:  # == compares values\n            n = n + 1  # a match: count it\n    return n  # after checking them all\n',
          think: ['This is the "count" pattern with a condition inside the loop.', 'Start a counter at 0 and visit every item.', 'Only add 1 when the item equals <code>target</code>; return the counter after the loop.'],
          diagnose: [
            { match: '.', when: '^\\s{8,}return', checks: 'counting how many times a house name appears', cause: 'Your <code>return</code> is inside the loop, so the function stops after one item. Line it up with <code>for</code>.' },
            { match: '.', checks: 'counting how many times a house name appears', cause: 'Make sure you compare each item with <code>target</code> using <code>==</code> and add 1 only on a match.' }],
          tests: words.map(w => P.t(`count_occurrences(${py.r(w)}, ${py.s(tgt)}) returns ${w.filter(x => x === tgt).length}`, `count_occurrences(${py.r(w)}, ${py.s(tgt)})`, w.filter(x => x === tgt).length)).join('\n'), banned: P.ban('count'),
          hint: 'Compare each item with target and keep a counter.' }; }
      const grids = Array.from({ length: 3 }, () => Array.from({ length: R.int(2, 4) }, () => R.ints(3, 0, 20)));
      if (v === 3) return { prompt: 'Write <code>row_totals(grid)</code> that returns a list with the total of each row. <strong>No built-ins:</strong> don\'t use <code>sum()</code>.',
        starter: 'def row_totals(grid):\n    pass\n', solution: 'def row_totals(grid):  # grid is a list of rows; each row is a list of numbers\n    totals = []  # one total per row will go in here\n    for row in grid:  # outer loop: one row at a time\n        t = 0  # reset the total for EACH new row\n        for x in row:  # inner loop: every number in this row\n            t = t + x  # running total for this row\n        totals.append(t)  # after the inner loop, the row is finished\n    return totals  # e.g. [12, 7, 30]\n',
        think: ['A 2D list is a list of rows, so use a nested loop: the outer loop picks a row, the inner loop adds up that row.', 'Reset the running total to 0 at the start of every row — otherwise each total includes the rows before it.', 'Append the total after the inner loop finishes, and return the list at the end.'],
        diagnose: [
          { match: '.', when: '^\\s{4}t\\s*=\\s*0', checks: 'a grid with several rows', cause: 'You reset the total only once, before the outer loop, so each row total includes the previous rows. Put <code>t = 0</code> inside the outer loop.' },
          { match: '.', when: '^\\s{12,}totals\\.append', checks: 'a grid with several rows', cause: 'You append inside the inner loop, so you get one value per number instead of per row. Append after the inner loop.' },
          { match: '.', checks: 'a grid with several rows', cause: 'For each row: reset the total, add every number in that row, then append the total.' }],
        tests: grids.map(g => P.t(`row_totals(${py.r(g)}) returns ${py.r(g.map(sumOf))}`, `row_totals(${py.r(g)})`, g.map(sumOf))).join('\n'), banned: P.ban('sum'),
        hint: 'Use a nested loop. Reset the row total to 0 for every row, and append it after the inner loop.' };
      if (v === 4) { const c = R.int(0, 2);
        return { prompt: `Write <code>column_total(grid, c)</code> that returns the total of column <code>c</code>. <strong>No built-ins:</strong> don't use <code>sum()</code>.`,
          starter: 'def column_total(grid, c):\n    pass\n', solution: 'def column_total(grid, c):  # c is the column index\n    t = 0  # running total\n    for row in grid:  # one row at a time\n        t = t + row[c]  # take only the item in column c of this row\n    return t  # total of that column\n',
          think: ['A column is the item at the same index <code>c</code> in every row.', 'So you only need one loop, over the rows, adding <code>row[c]</code> each time.', 'Start the total at 0 and return it after the loop.'],
          diagnose: [
            { match: '.', when: 'grid\\[c\\]', checks: 'adding up one column', cause: '<code>grid[c]</code> is a whole <em>row</em>. A column is <code>row[c]</code> taken from every row.' },
            { match: '.', checks: 'adding up one column', cause: 'Loop over the rows and add <code>row[c]</code> to a total that starts at 0.' }],
          tests: grids.map(g => P.t(`column_total(${py.r(g)}, ${c}) returns ${g.reduce((a, r) => a + r[c], 0)}`, `column_total(${py.r(g)}, ${c})`, g.reduce((a, r) => a + r[c], 0))).join('\n'), banned: P.ban('sum'),
          hint: 'Loop over the rows and add row[c] each time.' }; }
      const plan = [R.sample(P.data.names, 3), R.sample(P.data.names, 3), R.sample(P.data.names, 3)];
      const flat = plan.flat(), who = R.pick(flat), r = plan.findIndex(row => row.includes(who)), cc = plan[r].indexOf(who);
      return { prompt: 'A seating plan is a 2D list of names, one list per row. Write <code>seat_of(plan, name)</code> that returns <code>(row, column)</code> of the first match, or <code>None</code> if the name isn\'t there. <strong>No built-ins:</strong> don\'t use <code>.index()</code>.',
        starter: 'def seat_of(plan, name):\n    pass\n', solution: 'def seat_of(plan, name):  # plan is a list of rows of names\n    for r in range(len(plan)):  # r is a row index: we need the index, not just the row\n        for c in range(len(plan[r])):  # c is a column index within row r\n            if plan[r][c] == name:  # [row][column] reaches one seat\n                return (r, c)  # found: return straight away with both indexes\n    return None  # only reached if no seat matched\n',
        think: ['You need the <em>positions</em>, so loop over indexes with <code>range(len(...))</code> rather than over the names themselves.', 'The outer loop picks a row index, the inner loop a column index; <code>plan[r][c]</code> is one seat.', 'Return <code>(r, c)</code> the moment you find the name; only after both loops have finished do you know it isn\'t there, so <code>return None</code> goes at the end.'],
        diagnose: [
          { match: 'Nobody', checks: 'a name that isn\'t in the plan', cause: '<code>return None</code> must come after both loops. If it is inside a loop, the function gives up after checking the first seat or row.' },
          { match: '.', when: 'return\\s*\\(\\s*c\\s*,\\s*r', checks: 'finding a name in the seating plan', cause: 'The pair is the wrong way round. Return <code>(row, column)</code>.' },
          { match: '.', checks: 'finding a name in the seating plan', cause: 'Loop over row indexes and column indexes, compare <code>plan[r][c]</code> with the name, and return <code>(r, c)</code> when they match.' }],
        tests: [P.t(`seat_of(plan, ${py.s(who)}) returns (${r}, ${cc})`, `seat_of(${py.r(plan)}, ${py.s(who)})`, { tuple: [r, cc] }), P.t('seat_of(plan, "Nobody") returns None', `seat_of(${py.r(plan)}, "Nobody")`, null), P.t(`seat_of([["A", "B"], ["C", "D"]], "D") returns (1, 1)`, 'seat_of([["A", "B"], ["C", "D"]], "D")', { tuple: [1, 1] })].join('\n'), banned: P.ban('index'),
        hint: 'Loop over row indexes and column indexes with range(len(...)). Return (r, c) as soon as you match; after both loops, return None.' };
    } }
  ]);

  /* B2.2.2 — corresponding (parallel) lists: item i of one list belongs with item i of the other. */
  const PARALLEL = [
    { a: 'parcel_ids', b: 'weights', what: 'parcel', unit: 'kg', ids: R => R.sample(['P104', 'P211', 'P305', 'P412', 'P520', 'P618', 'P733', 'P849', 'P902'], R.int(5, 6)), vals: (R, n) => R.sample([0.5, 0.75, 1.25, 1.5, 2.0, 2.25, 2.75, 3.5, 4.0, 4.5, 5.25, 6.0, 7.5, 8.25, 9.5], n), heavy: 'heaviest' },
    { a: 'students', b: 'marks', what: 'student', unit: 'marks', ids: R => R.sample(P.data.names, R.int(5, 6)), vals: (R, n) => R.distinct(n, 31, 98), heavy: 'highest-scoring' },
    { a: 'isbns', b: 'loans', what: 'book', unit: 'loans', ids: R => R.sample(['978-0141', '978-0439', '978-0062', '978-1408', '978-0571', '978-0099', '978-1529'], R.int(5, 6)), vals: (R, n) => R.distinct(n, 2, 40), heavy: 'most-borrowed' }
  ];
  P.add('B2.2.2', [
    { id: 'list-parallel', kind: 'output', term: 'Determine', marks: 3, make(R) {
      const c = R.pick(PARALLEL), ids = c.ids(R), vals = c.vals(R, ids.length), isF = c.what === 'parcel';
      const show = v => (isF ? py.f(v) : String(v)), lit = arr => '[' + arr.map(show).join(', ') + ']';
      const v = R.int(0, 2), head = `${c.a} = ${py.r(ids)}\n${c.b} = ${lit(vals)}`;
      if (v === 0) {
        let h = 0; vals.forEach((x, i) => { if (x > vals[h]) h = i; });
        const tot = vals.reduce((x, y) => x + y, 0);
        return { prompt: `The two lists correspond: <code>${c.b}[i]</code> belongs to <code>${c.a}[i]</code>. What does this program print?`,
          code: `${head}\nbest = 0\nfor i in range(len(${c.b})):\n    if ${c.b}[i] > ${c.b}[best]:\n        best = i\nprint(${c.a}[best], ${c.b}[best])\ntotal = 0\nfor x in ${c.b}:\n    total = total + x\nprint(total)`,
          answer: `${ids[h]} ${show(vals[h])}\n${show(tot)}`,
          explain: `<p><code>best</code> stores the <em>index</em> of the ${c.heavy} ${c.what} so far, so the same index can be used in both lists: index ${h} gives ${ids[h]} and ${show(vals[h])}. The running total adds every value: ${vals.map(show).join(' + ')} = ${show(tot)}.</p>` };
      }
      if (v === 1) {
        const lim = isF ? R.pick([2.5, 3.0, 4.0, 5.0]) : vals.slice().sort((x, y) => x - y)[Math.floor(vals.length / 2)];
        const keep = ids.filter((id, i) => vals[i] > lim);
        return { prompt: `The two lists correspond. What does this program print?`,
          code: `${head}\nlimit = ${show(lim)}\ncount = 0\nfor i in range(len(${c.a})):\n    if ${c.b}[i] > limit:\n        print(${c.a}[i])\n        count = count + 1\nprint("Over the limit:", count)`,
          answer: [...keep, `Over the limit: ${keep.length}`].join('\n'),
          explain: `<p>The loop uses one index <code>i</code> for both lists. ${c.what[0].toUpperCase() + c.what.slice(1)}s with a value greater than ${show(lim)}: ${keep.join(', ') || 'none'}. (A value equal to the limit is not printed, because the test is &gt;.)</p>` };
      }
      const k = R.int(0, ids.length - 1), present = R.chance(0.75), target = present ? ids[k] : (isF ? 'P000' : c.what === 'student' ? 'Nobody' : '978-0000');
      const res = present ? show(vals[k]) : '-1';
      return { prompt: `The two lists correspond. What does this program print?`,
        code: `${head}\ntarget = "${target}"\nresult = -1\nfor i in range(len(${c.a})):\n    if ${c.a}[i] == target:\n        result = ${c.b}[i]\nprint(result)`,
        answer: res,
        explain: present ? `<p>${target} is at index ${k} of <code>${c.a}</code>, so the matching value is <code>${c.b}[${k}]</code> = ${res}.</p>` : `<p>${target} isn't in <code>${c.a}</code>, so <code>result</code> keeps its starting value, -1.</p>` };
    } },
    { id: 'list-parallel-trace', kind: 'trace', term: 'Trace', marks: 3, make(R) {
      const ids = R.sample(['P104', 'P211', 'P305', 'P412', 'P520', 'P618'], 5), w = R.distinct(5, 1, 20);
      let h = 0; const rows = [[{ v: '', given: true }, { v: '', given: true }, { v: '', given: true }, { v: '0', given: true }]];
      for (let i = 1; i < w.length; i++) { const cond = w[i] > w[h]; if (cond) h = i; rows.push([{ v: String(i), given: true }, { v: String(w[i]) }, { v: py.b(cond) }, { v: String(h) }]); }
      const code = `parcel_ids = ${py.r(ids)}\nweights = ${py.r(w)}\nheaviest = 0\nfor i in range(1, len(weights)):\n    if weights[i] > weights[heaviest]:\n        heaviest = i\nprint(parcel_ids[heaviest])`;
      return { prompt: 'Complete the trace table. The first row shows the value before the loop; the comparison uses <code>heaviest</code> from <em>before</em> the update.', code,
        columns: ['i', 'weights[i]', 'weights[i] > weights[heaviest]', 'heaviest'], rows,
        extra: [{ label: 'Output', v: ids[h] }], check: { code, expect: ids[h] },
        explain: `<p><code>heaviest</code> holds an <em>index</em>, not a weight, so it can be used in both lists. The heaviest parcel is at index ${h}: ${ids[h]} (${w[h]} kg).</p>` };
    } },
    { id: 'list-parallel-code', kind: 'code', term: 'Construct', marks: 5, make(R) {
      const sets = Array.from({ length: 3 }, () => { const ids = R.sample(['P104', 'P211', 'P305', 'P412', 'P520', 'P618', 'P733', 'P849'], R.int(4, 6)); return [ids, R.distinct(ids.length, 1, 30)]; });
      const v = R.int(0, 2), ban = P.ban('max', 'index', 'sorted', 'sort');
      if (v === 0) return { prompt: 'The lists <code>ids</code> and <code>weights</code> correspond (<code>weights[i]</code> is the weight of parcel <code>ids[i]</code>). Write <code>heaviest_parcel(ids, weights)</code> that returns the <strong>ID</strong> of the heaviest parcel. <strong>No built-ins:</strong> don\'t use <code>max()</code> or <code>.index()</code>.',
        starter: 'def heaviest_parcel(ids, weights):\n    pass\n',
        solution: 'def heaviest_parcel(ids, weights):  # weights[i] belongs to ids[i]\n    best = 0  # the INDEX of the heaviest parcel so far (start with the first)\n    for i in range(len(weights)):  # loop over indexes, so the same i works in both lists\n        if weights[i] > weights[best]:  # heavier than the heaviest so far?\n            best = i  # remember where it is, not just its weight\n    return ids[best]  # use that index in the other list to get the ID\n',
        think: ['In corresponding lists, the same index links the two lists: <code>weights[i]</code> is the weight of <code>ids[i]</code>.', 'So remember the <em>index</em> of the heaviest parcel, not its weight — the index lets you look up the ID afterwards.', 'Loop over indexes with <code>range(len(weights))</code>, update <code>best</code> when you find a heavier one, and return <code>ids[best]</code>.'],
        diagnose: [
          { match: '.', when: 'return\\s+weights', checks: 'returning the ID of the heaviest parcel', cause: 'You return a weight. The question asks for the parcel\'s <strong>ID</strong>: <code>return ids[best]</code>.' },
          { match: '.', when: 'best\\s*=\\s*weights\\[', checks: 'returning the ID of the heaviest parcel', cause: 'You stored the heaviest <em>weight</em>, so you can\'t find its ID any more. Store the index: <code>best = i</code>.' },
          { match: '.', checks: 'returning the ID of the heaviest parcel', cause: 'Keep the index of the heaviest weight so far, compare with <code>&gt;</code>, and return <code>ids</code> at that index.' }],
        tests: sets.map(([ids, w]) => { let h = 0; w.forEach((x, i) => { if (x > w[h]) h = i; }); return P.t(`heaviest_parcel(${py.r(ids)}, ${py.r(w)}) returns ${py.s(ids[h])}`, `heaviest_parcel(${py.r(ids)}, ${py.r(w)})`, ids[h]); }).join('\n'),
        banned: ban, hint: 'Keep the index of the heaviest weight so far, then use that index in ids.' };
      if (v === 1) return { prompt: 'The lists <code>ids</code> and <code>weights</code> correspond. Write <code>weight_of(ids, weights, pid)</code> that returns the weight of parcel <code>pid</code>, or <code>-1</code> if it isn\'t there. <strong>No built-ins:</strong> don\'t use <code>.index()</code>.',
        starter: 'def weight_of(ids, weights, pid):\n    pass\n',
        solution: 'def weight_of(ids, weights, pid):  # pid is the parcel ID to look up\n    for i in range(len(ids)):  # search the IDs by index\n        if ids[i] == pid:  # found the parcel at position i\n            return weights[i]  # the same index in the other list is its weight\n    return -1  # only reached if no ID matched\n',
        think: ['Search one list (the IDs) with an index loop — a linear search.', 'When <code>ids[i]</code> matches, the answer is at the <em>same index</em> in the other list: <code>weights[i]</code>.', 'If the loop finishes without a match, return -1.'],
        diagnose: [
          { match: 'P000', checks: 'an ID that isn\'t in the list', cause: '<code>return -1</code> must come after the loop. Inside the loop (for example in an else), it gives up after checking only the first ID.' },
          { match: '.', checks: 'looking up the weight of a parcel that exists', cause: 'When <code>ids[i] == pid</code>, return <code>weights[i]</code> — the same index in the other list.' }],
        tests: sets.flatMap(([ids, w]) => { const k = R.int(0, ids.length - 1); return [P.t(`weight_of(…, ${py.s(ids[k])}) returns ${w[k]}`, `weight_of(${py.r(ids)}, ${py.r(w)}, ${py.s(ids[k])})`, w[k])]; }).concat([P.t('weight_of(…, "P000") returns -1', `weight_of(${py.r(sets[0][0])}, ${py.r(sets[0][1])}, "P000")`, -1)]).join('\n'),
        banned: ban, hint: 'Search ids with an index loop; when ids[i] matches, return weights[i] — the same index.' };
      const lim = R.int(8, 20);
      return { prompt: `The lists <code>ids</code> and <code>weights</code> correspond. Write <code>over_limit(ids, weights, limit)</code> that returns a list of the IDs of parcels heavier than <code>limit</code>, in their original order.`,
        starter: 'def over_limit(ids, weights, limit):\n    pass\n',
        solution: 'def over_limit(ids, weights, limit):  # return the IDs of parcels heavier than limit\n    result = []  # start with an empty list of IDs\n    for i in range(len(ids)):  # one index for both lists\n        if weights[i] > limit:  # check this parcel\'s weight\n            result.append(ids[i])  # but add its ID, from the other list\n    return result  # IDs in their original order\n',
        think: ['Build a new list, starting empty.', 'Loop over indexes so you can test <code>weights[i]</code> and collect <code>ids[i]</code> with the same <code>i</code>.', '"Heavier than" means <code>&gt;</code>, so a parcel exactly at the limit is left out.'],
        diagnose: [
          { match: '.', when: '>=', checks: 'parcels heavier than the limit', cause: '<code>&gt;=</code> also includes a parcel exactly at the limit. "Heavier than" needs <code>&gt;</code>.' },
          { match: '.', when: 'append\\(\\s*weights', checks: 'parcels heavier than the limit', cause: 'You are adding weights. The question asks for the <strong>IDs</strong>: <code>result.append(ids[i])</code>.' },
          { match: '.', checks: 'parcels heavier than the limit', cause: 'For each index, if the weight is over the limit, append the ID at that index; return the list after the loop.' }],
        tests: sets.map(([ids, w]) => P.t(`over_limit(…, ${lim}) returns ${py.r(ids.filter((x, i) => w[i] > lim))}`, `over_limit(${py.r(ids)}, ${py.r(w)}, ${lim})`, ids.filter((x, i) => w[i] > lim))).join('\n'),
        hint: 'Loop over the indexes; when weights[i] is over the limit, append ids[i] to a new list.' };
    } }
  ]);

  /* ================= B2.2.3  Stacks ================= */
  function stackOps(R, n) {
    const st = [], lines = [], out = [], steps = [];
    const vals = R.distinct(n + 2, 1, 30);
    for (let k = 0; k < n; k++) {
      const canPop = st.length > 0, r = R.next();
      if (!canPop || r < 0.5) { const x = vals.pop(); st.push(x); lines.push(`s.push(${x})`); steps.push(`push(${x}) → ${py.r(st)}`); }
      else if (r < 0.75) { const x = st.pop(); lines.push('print(s.pop())'); out.push(String(x)); steps.push(`pop() removes and returns the top, ${x} → ${py.r(st)}`); }
      else if (r < 0.9) { lines.push('print(s.peek())'); out.push(String(st[st.length - 1])); steps.push(`peek() returns the top, ${st[st.length - 1]}, without removing it`); }
      else { lines.push('print(s.isEmpty())'); out.push(py.b(st.length === 0)); steps.push(`isEmpty() → ${py.b(st.length === 0)}`); }
    }
    return { st, lines, out, steps };
  }
  const APPS = [
    ['the Undo button in a word processor', 'stack', 'the most recent action must be undone first'], ['the Back button in a web browser', 'stack', 'you return to the most recently visited page first'],
    ['checking that brackets in code are matched', 'stack', 'each closing bracket must match the most recently opened one'], ['reversing the letters of a word', 'stack', 'the last letter pushed is the first popped'],
    ['keeping track of function calls while a program runs', 'stack', 'the most recently called function finishes first'],
    ['documents waiting to be printed', 'queue', 'jobs are printed in the order they were sent'], ['students waiting in the canteen line', 'queue', 'the first student to arrive is served first'],
    ['tasks waiting for the CPU in a round-robin scheduler', 'queue', 'tasks get their turn in arrival order'], ['keys typed while the computer is busy (keyboard buffer)', 'queue', 'keys must be processed in the order they were pressed'],
    ['calls waiting for the school office', 'queue', 'callers should be answered in the order they rang']
  ];
  const appsGen = (id, topic) => ({ id, kind: 'mcq', term: 'Identify', marks: 1, make(R) {
    const [what, k, why] = R.pick(R.chance(0.6) ? APPS.filter(a => a[1] === topic) : APPS);
    return {
      prompt: `Which data structure is most suitable for <strong>${esc(what)}</strong>?`,
      options: [opt('Stack (LIFO)', k === 'stack', k === 'stack' ? `Yes — last in, first out: ${why}.` : `A stack is last in, first out — but here ${why}, which is first in, first out.`),
        opt('Queue (FIFO)', k === 'queue', k === 'queue' ? `Yes — first in, first out: ${why}.` : `A queue is first in, first out — but here ${why}, which is last in, first out.`),
        opt('2D list', false, 'A 2D list stores a grid; it doesn\'t give you a "next item" order on its own.')],
      steps: ['Ask which item should be dealt with next: the one that arrived <em>most recently</em>, or the one that has waited <em>longest</em>?',
        'Most recent first → stack (last in, first out). Longest-waiting first → queue (first in, first out).',
        `Here ${why}, so use a <strong>${k === 'stack' ? 'stack' : 'queue'}</strong>.`]
    };
  } });
  P.add('B2.2.3', [
    { id: 'stack-ops', kind: 'output', term: 'Determine', marks: 3, make(R) {
      let t; do { t = stackOps(R, R.int(6, 8)); } while (t.out.length < 2);
      return {
        prompt: 'What does this code print?' + classNote('Stack', STACK), setup: STACK, code: 's = Stack()\n' + t.lines.join('\n'),
        answer: t.out.join('\n'), explain: P.list(t.steps) + '<p>Lists are shown bottom → top.</p>'
      };
    } },
    { id: 'stack-state', kind: 'mcq', term: 'State', marks: 2, make(R) {
      const vals = R.distinct(5, 1, 30), pushes = R.int(3, 5), pops = R.int(1, pushes - 1), lines = [], st = [], q = [];
      let k = 0;
      for (let i = 0; i < pushes; i++) { st.push(vals[i]); q.push(vals[i]); lines.push(`s.push(${vals[i]})`); if (k < pops && i >= 1 && R.chance(0.4)) { st.pop(); q.shift(); lines.push('s.pop()'); k++; } }
      while (k < pops) { st.pop(); q.shift(); lines.push('s.pop()'); k++; }
      const all = vals.slice(0, pushes);
      return {
        prompt: 'After this code runs, what does the stack hold (bottom → top)?' + classNote('Stack', STACK), code: 's = Stack()\n' + lines.join('\n'),
        options: [opt(py.r(st), true, 'Each pop removes the most recently pushed item that is still there — last in, first out.'),
          opt(py.r(q), false, 'This removes the oldest items first — that is how a queue (FIFO) works, not a stack.'),
          opt(py.r(st.slice().reverse()), false, 'These are the right items, but listed top → bottom.'),
          opt(py.r(all), false, 'pop() removes items, so the stack doesn\'t still hold everything that was pushed.')], mono: true,
        check: { code: STACK + '\ns = Stack()\n' + lines.join('\n') + '\nprint(s.items)', expect: py.r(st) },
        steps: (() => {
          const now = [], out = ['Draw the stack and update it after every line (bottom on the left, top on the right).'];
          lines.forEach(l => { const m = l.match(/push\((\d+)\)/); if (m) now.push(+m[1]); else now.pop(); out.push(`<code>${l}</code> → ${esc(py.r(now))}`); });
          out.push('Every <code>pop()</code> removed the item on top — the most recently pushed one still there.');
          return out;
        })()
      };
    } },
    { id: 'stack-static', kind: 'output', term: 'Determine', marks: 3, make(R) {
      const size = R.int(2, 3), vals = R.distinct(6, 1, 9), lines = [], out = [], items = Array(size).fill(null);
      let top = -1;
      const n = R.int(5, 7);
      for (let i = 0; i < n; i++) {
        if (R.chance(0.55)) { const x = vals.pop() || 7; lines.push(`s.push(${x})`); if (top === size - 1) out.push('Overflow'); else { top++; items[top] = x; } }
        else { lines.push('print(s.pop())'); if (top === -1) { out.push('Underflow', 'None'); } else { out.push(String(items[top])); top--; } }
      }
      const showItems = R.chance(0.5);
      lines.push('print(s.topIndex)'); out.push(String(top));
      if (showItems) { lines.push('print(s.items)'); out.push(py.r(items)); }
      if (!out.some(o => /flow/.test(o)) && R.chance(0.6)) return this.make(R);
      return {
        prompt: `This is the textbook's static stack: a fixed-size list plus <code>topIndex</code>. What does the code print?`, setup: STATIC_STACK,
        code: `s = Stack(${size})\n` + lines.join('\n'),
        answer: out.join('\n'),
        explain: `<p>The stack has ${size} slots (indexes 0–${size - 1}). push adds 1 to topIndex then stores the value; pushing when topIndex is ${size - 1} prints Overflow. pop returns items[topIndex] then subtracts 1; popping when topIndex is -1 prints Underflow and returns None.</p>` + (showItems ? '<p>Notice that pop doesn\'t erase the old values from <code>items</code> — it only moves topIndex down, so they are overwritten by the next push.</p>' : '') + P.pre(STATIC_STACK)
      };
    } },
    appsGen('stack-apps', 'stack'),
    { id: 'stack-concept', kind: 'mcq', term: 'State', marks: 1, make(R) {
      const QS = [
        ['Which operation returns the top item <em>without</em> removing it?', 'peek', [['pop', 'pop removes the top item as well as returning it.'], ['push', 'push adds an item to the top.'], ['isEmpty', 'isEmpty returns True or False.']], 'peek looks at the top item and leaves the stack unchanged.'],
        ['What does LIFO mean for a stack?', 'The last item added is the first one removed', [['The first item added is the first one removed', 'That is FIFO — how a queue works.'], ['Items are removed in sorted order', 'A stack never sorts its items.'], ['Any item can be removed at any time', 'Only the top item can be removed.']], 'Items are added to and removed from the same end, the top.'],
        ['What is stack <strong>underflow</strong>?', 'Trying to pop from an empty stack', [['Pushing onto a full static stack', 'That is overflow.'], ['Peeking at the bottom item', 'peek only looks at the top.'], ['A stack using too much memory', 'That isn\'t what underflow means.']], 'With nothing to remove, pop can\'t return an item.'],
        ['What is stack <strong>overflow</strong> in a static (array-based) stack?', 'Pushing when every slot is already full', [['Popping from an empty stack', 'That is underflow.'], ['topIndex becoming -1', 'topIndex -1 just means the stack is empty.'], ['Pushing a value larger than the top one', 'Stacks don\'t compare values.']], 'A static stack has a fixed number of slots, so once topIndex reaches the last index, push fails.'],
        ['What is the time complexity of push and pop on a stack?', 'O(1)', [['O(n)', 'Neither operation loops through the other items.'], ['O(log n)', 'No halving is involved.'], ['O(n²)', 'There are no nested loops.']], 'They only touch the top of the stack, so they take the same time however many items there are.'],
        ['In the textbook\'s static stack, what is <code>topIndex</code> when the stack is empty?', '-1', [['0', '0 is the index of the first item once one has been pushed.'], ['None', 'topIndex is always an integer.'], ['The size of the list', 'That would be past the last slot.']], 'Starting at -1 means the first push moves topIndex to 0, the first slot.']
      ];
      const STEPS = [
        ['Recall the four stack operations and what each does to the top item.', 'push adds, pop removes and returns, isEmpty answers yes/no.', 'Only <strong>peek</strong> returns the top item and leaves it there.'],
        ['Picture a pile of plates: you add and take from the top.', 'The plate put on last is the first one taken off.', 'That is LIFO: <strong>last in, first out</strong>.'],
        ['"Under" means going below the bottom.', 'You can\'t take an item from a stack that has none.', 'So underflow is <strong>popping from an empty stack</strong>.'],
        ['"Over" means going past the top limit.', 'A static stack has a fixed number of slots.', 'So overflow is <strong>pushing when every slot is full</strong>.'],
        ['Ask how many items push or pop has to look at.', 'They only touch the top item, however big the stack is.', 'Work that doesn\'t grow with n is <strong>O(1)</strong>.'],
        ['topIndex holds the index of the top item.', 'The first push must put an item in slot 0, and push adds 1 to topIndex before storing.', 'So an empty stack starts at <strong>-1</strong> (then -1 + 1 = 0).']
      ];
      const k = R.int(0, QS.length - 1), [q, ok, wrong, why] = QS[k];
      return { prompt: q, options: [opt(ok, true, why), ...wrong.map(w => opt(w[0], false, w[1]))], steps: STEPS[k] };
    } },
    { id: 'stack-code', kind: 'code', term: 'Construct', marks: 6, make(R) {
      if (R.chance(0.5)) {
        const size = R.int(2, 4), vals = R.distinct(size + 1, 1, 50);
        const pushes = vals.slice(0, size).map(v => `s.push(${v})`).join('\n');
        return {
          prompt: `Complete the textbook static stack. <code>push</code> returns <code>True</code>, or <code>False</code> if the stack is full. <code>pop</code> and <code>peek</code> return <code>None</code> if the stack is empty. Don't use <code>append</code> or <code>pop</code> on the list — move <code>topIndex</code> instead.`,
          starter: 'class Stack:\n    def __init__(self, size):\n        self.items = [None] * size\n        self.topIndex = -1\n\n    def isEmpty(self):\n        pass\n\n    def isFull(self):\n        pass\n\n    def push(self, x):\n        pass\n\n    def pop(self):\n        pass\n\n    def peek(self):\n        pass\n',
          solution: 'class Stack:  # a static stack: a fixed-size list plus the index of the top item\n    def __init__(self, size):  # size = how many slots the stack has\n        self.items = [None] * size  # all the memory is reserved now; it never grows\n        self.topIndex = -1  # -1 means empty: the first push will use index 0\n\n    def isEmpty(self):  # True when nothing is stored\n        return self.topIndex == -1  # no top item yet\n\n    def isFull(self):  # True when every slot is used\n        return self.topIndex == len(self.items) - 1  # the top is in the last slot\n\n    def push(self, x):  # add x on top\n        if self.isFull():  # check BEFORE changing anything\n            return False  # overflow: refuse and report it\n        self.topIndex = self.topIndex + 1  # move up to the next free slot first...\n        self.items[self.topIndex] = x  # ...then store the item there\n        return True  # it worked\n\n    def pop(self):  # remove and return the top item\n        if self.isEmpty():  # nothing to remove?\n            return None  # underflow: report it instead of crashing\n        x = self.items[self.topIndex]  # read the top item first...\n        self.topIndex = self.topIndex - 1  # ...then move the top down (the old value stays but is now ignored)\n        return x  # give back the item that was on top\n\n    def peek(self):  # look at the top item without removing it\n        if self.isEmpty():  # nothing to look at\n            return None  # same rule as pop\n        return self.items[self.topIndex]  # topIndex doesn\'t change\n',
          tests: [
            P.tblock('a new stack is empty', `s = Stack(${size})\nreturn s.isEmpty()`, true),
            P.tblock(`pushing ${size} items makes it full`, `s = Stack(${size})\n${pushes}\nreturn s.isFull()`, true),
            P.tblock(`push onto a full stack returns False`, `s = Stack(${size})\n${pushes}\nreturn s.push(${vals[size]})`, false),
            P.tblock('pop returns the last item pushed', `s = Stack(${size})\n${pushes}\nreturn s.pop()`, vals[size - 1]),
            P.tblock('peek returns the top without removing it', `s = Stack(${size})\n${pushes}\ns.peek()\nreturn s.peek()`, vals[size - 1]),
            P.tblock('pop on an empty stack returns None', `s = Stack(${size})\nreturn s.pop()`, null),
            P.tblock('pop then push reuses the slot', `s = Stack(${size})\n${pushes}\ns.pop()\ns.push(99)\nreturn s.topIndex`, size - 1)
          ].join('\n'),
          banned: [{ label: 'list.append()', re: '\\.append\\s*\\(' }, { label: 'list.pop()', re: 'items\\.pop\\s*\\(' }],
          hint: 'isEmpty: topIndex == -1. isFull: topIndex == len(self.items) - 1. push: add 1 to topIndex, then store. pop: read items[topIndex], then subtract 1.',
          think: ['A static stack never grows: the list has a fixed number of slots, and <code>topIndex</code> says where the top item is (-1 when empty).',
            'Write the two checks first: empty means <code>topIndex == -1</code>; full means <code>topIndex</code> is the last index, <code>len(self.items) - 1</code>.',
            'push: refuse if full; otherwise move <code>topIndex</code> up by 1, <em>then</em> store the item there. Swapping those two lines overwrites the current top.',
            'pop: refuse if empty; otherwise read the top item, <em>then</em> move <code>topIndex</code> down by 1. peek is pop without moving <code>topIndex</code>.'],
          diagnose: [
            { match: 'a new stack is empty', checks: 'that a brand-new stack reports it is empty', cause: '<code>isEmpty</code> should return <code>self.topIndex == -1</code>, and <code>__init__</code> must start <code>topIndex</code> at -1.' },
            { match: 'makes it full', checks: 'that filling every slot makes <code>isFull()</code> True', cause: 'Full means the top is in the last slot: <code>self.topIndex == len(self.items) - 1</code>. Comparing with <code>len(self.items)</code> is one too many.' },
            { match: 'full stack returns False', checks: 'pushing onto a stack with no free slots (overflow)', cause: 'push must check <code>isFull()</code> first and return False without changing anything.' },
            { match: 'pop returns the last item', when: 'topIndex\\s*=\\s*self\\.topIndex\\s*-\\s*1[\\s\\S]*x\\s*=\\s*self\\.items', checks: 'that pop returns the item pushed last', cause: 'You move <code>topIndex</code> down before reading the item, so you return the one underneath. Read <code>self.items[self.topIndex]</code> first.' },
            { match: 'pop returns the last item|peek returns', checks: 'that the most recently pushed item comes back first (LIFO)', cause: 'Check push moves <code>topIndex</code> up <em>before</em> storing, and that pop/peek read <code>self.items[self.topIndex]</code>.' },
            { match: 'empty stack returns None', checks: 'popping from an empty stack (underflow)', cause: 'pop must check <code>isEmpty()</code> first and return None.' },
            { match: 'reuses the slot', checks: 'that pop frees the top slot so the next push can use it', cause: 'pop must subtract 1 from <code>topIndex</code>, and push must add 1 before storing, so the freed slot is reused.' }
          ]
        };
      }
      const pairs = { '(': ')', '[': ']' }, gen = (n) => { let s = '', st = []; for (let i = 0; i < n; i++) { if (st.length && R.chance(0.45)) s += pairs[st.pop()]; else { const o = R.pick(['(', '[']); st.push(o); s += o; } } while (st.length) s += pairs[st.pop()]; return s; };
      const ok = s => { const st = []; for (const ch of s) { if (ch === '(' || ch === '[') st.push(ch); else if (ch === ')' || ch === ']') { if (!st.length || pairs[st.pop()] !== ch) return false; } } return st.length === 0; };
      const cases = [gen(4), gen(6), gen(3)]; cases.push(cases[0].slice(0, -1), ')' + cases[1].slice(1), cases[2].replace(/\)/, ']').replace(/^\[/, '(') || '(]', '(]');
      const exprs = cases.map(c => R.chance(0.5) ? c : c.split('').join(R.pick(['x', '1', ' '])));
      return {
        prompt: 'Write <code>balanced(text)</code> that returns <code>True</code> if every <code>(</code> and <code>[</code> in <code>text</code> is closed by the matching bracket in the right order. Use a list as a stack. Other characters can be ignored.',
        starter: 'def balanced(text):\n    pass\n',
        solution: 'def balanced(text):  # True if every ( and [ is closed in the right order\n    stack = []  # a Python list used as a stack: append = push, pop() = pop\n    for ch in text:  # read the text left to right\n        if ch == "(" or ch == "[":  # an opening bracket...\n            stack.append(ch)  # ...waits on the stack until it is closed\n        elif ch == ")" or ch == "]":  # a closing bracket must match the most recent opener\n            if len(stack) == 0:  # nothing open to close\n                return False  # e.g. ")(" is unbalanced\n            top = stack.pop()  # the most recently opened bracket (LIFO)\n            if (top == "(" and ch != ")") or (top == "[" and ch != "]"):  # wrong kind of bracket\n                return False  # e.g. "(]"\n    return len(stack) == 0  # anything left open means unbalanced\n',
        tests: [...new Set(exprs)].map(e => P.t(`balanced(${py.s(e)}) returns ${py.b(ok(e))}`, `balanced(${py.s(e)})`, ok(e))).join('\n'),
        hint: 'Push every opening bracket. On a closing bracket, the stack must not be empty and the popped bracket must match. At the end, the stack must be empty.',
        think: ['Brackets must close in the reverse order they opened — the last one opened is the first one closed. That is exactly LIFO, so use a stack.',
          'Push every opening bracket. On a closing bracket, pop the most recent opener and check it is the matching kind.',
          'Two ways to fail early: a closer when the stack is empty, or a mismatched pair.',
          'At the end, the stack must be empty — anything left over was never closed.'],
        diagnose: [
          { match: "\\('[)\\]]", checks: 'text that starts with a closing bracket', cause: 'Before popping, check the stack isn\'t empty — a closer with nothing open means unbalanced (and popping an empty list crashes).' },
          { match: '\\(\\]', checks: 'a bracket closed by the wrong kind, such as "(]"', cause: 'After popping, compare the opener with the closer: "(" must be closed by ")" and "[" by "]".' },
          { match: 'returns False', when: 'return\\s+True\\s*$', checks: 'text that leaves a bracket open', cause: 'At the end you must check the stack is empty: <code>return len(stack) == 0</code>, not just <code>return True</code>.' },
          { match: '.', checks: 'whether a mix of brackets (and other characters) is balanced', cause: 'Push openers, pop and compare on closers, ignore other characters, and check the stack is empty at the end.' }
        ]
      };
    } }
  ]);

  /* ================= B2.2.4  Queues ================= */
  P.add('B2.2.4', [
    { id: 'queue-ops', kind: 'output', term: 'Determine', marks: 3, make(R) {
      const q = [], lines = [], out = [], steps = [], vals = R.sample(P.data.names, 8);
      const n = R.int(6, 8);
      for (let k = 0; k < n; k++) {
        const r = R.next();
        if (!q.length || r < 0.5) { const x = vals.pop(); q.push(x); lines.push(`q.enqueue("${x}")`); steps.push(`enqueue adds ${x} at the back → ${py.r(q)}`); }
        else if (r < 0.8) { const x = q.shift(); lines.push('print(q.dequeue())'); out.push(x); steps.push(`dequeue removes and returns the front, ${x} → ${py.r(q)}`); }
        else { lines.push('print(q.front())'); out.push(q[0]); steps.push(`front() returns ${q[0]} without removing it`); }
      }
      if (out.length < 2) return this.make(R);
      return { prompt: 'Students join the canteen queue. What does this code print?' + classNote('Queue', QUEUE), setup: QUEUE, code: 'q = Queue()\n' + lines.join('\n'),
        answer: out.join('\n'), explain: P.list(steps) + '<p>Lists are shown front → back.</p>' };
    } },
    { id: 'queue-circular', kind: 'output', term: 'Determine', marks: 4, make(R) {
      const size = R.int(3, 4), items = Array(size).fill(null), lines = [], out = [];
      let front = 0, rear = -1, count = 0;
      const vals = R.distinct(8, 1, 9), n = R.int(6, 8);
      for (let i = 0; i < n; i++) {
        if (R.chance(0.6)) { const x = vals.pop(); lines.push(`q.enqueue(${x})`); if (count === size) out.push('Full'); else { rear = (rear + 1) % size; items[rear] = x; count++; } }
        else { lines.push('print(q.dequeue())'); if (count === 0) out.push('Empty', 'None'); else { out.push(String(items[front])); front = (front + 1) % size; count--; } }
      }
      lines.push('print(q.front, q.rear, q.count)'); out.push(`${front} ${rear} ${count}`);
      if (rear < front && count > 0 || R.chance(0.5)) { lines.push('print(q.items)'); out.push(py.r(items)); }
      return {
        prompt: 'This circular queue reuses slots at the start of the list. What does the code print?', setup: CIRC, code: `q = CircularQueue(${size})\n` + lines.join('\n'),
        visual: P.pre(CIRC), answer: out.join('\n'),
        explain: `<p>rear moves forward with (rear + 1) % ${size}, so after index ${size - 1} it wraps round to 0. front moves the same way when an item is dequeued. count tracks how many items are stored, which is how the queue knows it is Full (count == ${size}) or Empty (count == 0).</p>`
      };
    } },
    appsGen('queue-apps', 'queue'),
    { id: 'queue-concept', kind: 'mcq', term: 'State', marks: 1, make(R) {
      const QS = [
        ['What does FIFO mean for a queue?', 'The first item added is the first one removed', [['The last item added is the first removed', 'That is LIFO — how a stack works.'], ['The smallest item is removed first', 'Queues don\'t sort their items.'], ['Items can only be removed when the queue is full', 'You can dequeue whenever the queue isn\'t empty.']], 'Items join at the rear and leave from the front.'],
        ['Why is <code>dequeue</code> slow if it uses <code>items.pop(0)</code> on a Python list?', 'Every remaining item has to shift one place left — O(n)', [['pop(0) has to sort the list first', 'pop doesn\'t sort.'], ['pop(0) searches for the smallest item', 'pop(0) always removes index 0.'], ['It isn\'t slow — it is O(1)', 'Removing from the front of a list moves all the other items.']], 'A circular queue avoids this by moving a front pointer instead of moving the items.'],
        ['What is the advantage of a <strong>circular</strong> queue over a simple array queue?', 'Slots freed at the front can be reused when the rear reaches the end', [['It can hold an unlimited number of items', 'It still has a fixed number of slots.'], ['Items are kept in sorted order', 'Order is still first in, first out.'], ['It doesn\'t need a front pointer', 'It needs both front and rear pointers.']], 'Without wrapping round, a simple array queue can appear full even when the front slots are empty.'],
        ['What is the difference between <code>front()</code> and <code>dequeue()</code>?', 'front() only looks at the first item; dequeue() also removes it', [['They are the same', 'Only dequeue changes the queue.'], ['front() removes the last item', 'front looks at the first item and removes nothing.'], ['dequeue() adds an item', 'enqueue adds; dequeue removes.']], 'Use front() when you want to check the next item without serving it.'],
        ['A queue is empty and <code>dequeue()</code> is called. What should a robust implementation do?', 'Report the problem (e.g. return None or print "Empty") instead of crashing', [['Return the last item', 'There are no items to return.'], ['Add a None item', 'dequeue should never add items.'], ['Sort the queue', 'Sorting is unrelated.']], 'Check isEmpty() first, just as a stack checks for underflow.']
      ];
      const STEPS = [
        ['Picture the canteen line: people join at the back and are served from the front.', 'The first person to join is the first to be served.', 'That is FIFO: <strong>first in, first out</strong>.'],
        ['<code>pop(0)</code> removes the item at the front of a Python list.', 'Every item behind it then has to move one place forward to fill the gap — n items, n moves.', 'So it is <strong>O(n)</strong>; moving a front pointer instead would be O(1).'],
        ['In a plain array queue, the rear pointer only moves forward, so slots freed at the front are never used again.', 'A circular queue lets rear wrap round to index 0 using <code>% size</code>.', 'So freed slots at the start <strong>can be reused</strong>.'],
        ['Ask whether each operation changes the queue.', 'front() only reads the first item; dequeue() reads it <em>and</em> removes it.', 'So front() looks, dequeue() serves.'],
        ['Ask what dequeue should do when there is nothing to remove.', 'Crashing (popping an empty list) is not robust.', 'Check <code>isEmpty()</code> first and <strong>report the problem</strong> (e.g. return None).']
      ];
      const k = R.int(0, QS.length - 1), [q, ok, wrong, why] = QS[k];
      return { prompt: q, options: [opt(ok, true, why), ...wrong.map(w => opt(w[0], false, w[1]))], steps: STEPS[k] };
    } },
    { id: 'queue-code', kind: 'code', term: 'Construct', marks: 5, make(R) {
      const names = R.sample(P.data.names, 4);
      if (R.chance(0.5)) return {
        prompt: 'Complete the <code>Queue</code> class using a Python list. <code>dequeue</code> and <code>front</code> return <code>None</code> if the queue is empty; <code>size</code> returns the number of items.',
        starter: 'class Queue:\n    def __init__(self):\n        self.items = []\n\n    def enqueue(self, x):\n        pass\n\n    def dequeue(self):\n        pass\n\n    def front(self):\n        pass\n\n    def isEmpty(self):\n        pass\n\n    def size(self):\n        pass\n',
        solution: 'class Queue:  # a queue built on a Python list: front of the queue = index 0\n    def __init__(self):  # runs when a Queue is created\n        self.items = []  # starts empty\n\n    def enqueue(self, x):  # join the queue\n        self.items.append(x)  # new items go to the BACK (the end of the list)\n\n    def dequeue(self):  # serve the person at the front\n        if self.isEmpty():  # nobody waiting?\n            return None  # report it instead of crashing\n        return self.items.pop(0)  # remove and return the FRONT item (index 0)\n\n    def front(self):  # look at who is next, without serving them\n        if self.isEmpty():  # nobody waiting\n            return None  # same rule as dequeue\n        return self.items[0]  # read index 0; nothing is removed\n\n    def isEmpty(self):  # True when the queue has no items\n        return len(self.items) == 0  # the comparison is already True or False\n\n    def size(self):  # how many are waiting\n        return len(self.items)  # the number of items in the list\n',
        tests: [
          P.tblock('a new queue is empty', 'q = Queue()\nreturn q.isEmpty()', true),
          P.tblock(`dequeue returns the first name added (${names[0]})`, names.slice(0, 3).map(n => `q.enqueue("${n}")`).join('\n').replace(/^/, 'q = Queue()\n') + '\nreturn q.dequeue()', names[0]),
          P.tblock('front does not remove', `q = Queue()\nq.enqueue("${names[1]}")\nq.front()\nreturn q.size()`, 1),
          P.tblock('order is first in, first out', names.map(n => `q.enqueue("${n}")`).join('\n').replace(/^/, 'q = Queue()\n') + '\nq.dequeue()\nreturn q.dequeue()', names[1]),
          P.tblock('dequeue on an empty queue returns None', 'q = Queue()\nreturn q.dequeue()', null)
        ].join('\n'),
        hint: 'enqueue appends at the back; dequeue takes from index 0. Check isEmpty() before removing.',
        think: ['Decide which end is which: new items join at the back (the end of the list) and leave from the front (index 0).',
          'enqueue appends; dequeue removes and returns index 0; front only reads index 0.',
          'Both dequeue and front must check <code>isEmpty()</code> first and return None, so an empty queue never crashes.'],
        diagnose: [
          { match: 'a new queue is empty', checks: 'that a new queue reports it is empty', cause: '<code>isEmpty</code> should return <code>len(self.items) == 0</code>, and <code>__init__</code> must create an empty list.' },
          { match: 'first name added|first in, first out', when: 'pop\\(\\s*\\)', checks: 'that the first name added is the first one served (FIFO)', cause: '<code>pop()</code> with no index removes the <em>last</em> item — that makes a stack. Use <code>pop(0)</code> to take from the front.' },
          { match: 'first name added|first in, first out', checks: 'that the first name added is the first one served (FIFO)', cause: 'enqueue must add to the end and dequeue must remove from index 0.' },
          { match: 'front does not remove', checks: 'that <code>front()</code> leaves the item in the queue', cause: 'front should <em>read</em> <code>self.items[0]</code>, not pop it.' },
          { match: 'empty queue returns None', checks: 'dequeue on an empty queue', cause: 'Check <code>isEmpty()</code> first and return None — popping an empty list raises an error.' }
        ]
      };
      const size = R.int(3, 4), vals = R.distinct(size + 2, 1, 50);
      return {
        prompt: `Complete <code>enqueue</code> and <code>dequeue</code> for a circular queue. enqueue returns <code>False</code> if the queue is full (otherwise <code>True</code>); dequeue returns <code>None</code> if it is empty. Wrap the pointers round with <code>%</code>.`,
        starter: 'class CircularQueue:\n    def __init__(self, size):\n        self.items = [None] * size\n        self.front = 0\n        self.rear = -1\n        self.count = 0\n\n    def enqueue(self, x):\n        pass\n\n    def dequeue(self):\n        pass\n',
        solution: 'class CircularQueue:  # a fixed-size queue whose pointers wrap round\n    def __init__(self, size):  # size = number of slots\n        self.items = [None] * size  # fixed number of slots, reserved now\n        self.front = 0  # index of the next item to leave\n        self.rear = -1  # index of the last item that joined (-1: none yet)\n        self.count = 0  # how many items are stored right now\n\n    def enqueue(self, x):  # join at the rear\n        if self.count == len(self.items):  # every slot used?\n            return False  # full: refuse\n        self.rear = (self.rear + 1) % len(self.items)  # move rear on; % wraps it back to 0 after the last slot\n        self.items[self.rear] = x  # store in the new rear slot\n        self.count = self.count + 1  # one more item\n        return True  # it worked\n\n    def dequeue(self):  # leave from the front\n        if self.count == 0:  # nothing stored?\n            return None  # empty: report it\n        x = self.items[self.front]  # read the front item first\n        self.front = (self.front + 1) % len(self.items)  # move front on, wrapping the same way\n        self.count = self.count - 1  # one fewer item\n        return x  # give back the item that was at the front\n',
        tests: [
          P.tblock('dequeue returns items in FIFO order', `q = CircularQueue(${size})\nq.enqueue(${vals[0]})\nq.enqueue(${vals[1]})\nreturn [q.dequeue(), q.dequeue()]`, [vals[0], vals[1]]),
          P.tblock('enqueue on a full queue returns False', `q = CircularQueue(${size})\n${vals.slice(0, size).map(v => `q.enqueue(${v})`).join('\n')}\nreturn q.enqueue(${vals[size]})`, false),
          P.tblock('rear wraps round to index 0', `q = CircularQueue(${size})\n${vals.slice(0, size).map(v => `q.enqueue(${v})`).join('\n')}\nq.dequeue()\nq.enqueue(${vals[size + 1]})\nreturn q.rear`, 0),
          P.tblock('the wrapped item comes out last', `q = CircularQueue(${size})\n${vals.slice(0, size).map(v => `q.enqueue(${v})`).join('\n')}\nq.dequeue()\nq.enqueue(${vals[size + 1]})\nout = []\nfor i in range(${size}):\n    out.append(q.dequeue())\nreturn out`, [...vals.slice(1, size), vals[size + 1]]),
          P.tblock('dequeue on an empty queue returns None', `q = CircularQueue(${size})\nreturn q.dequeue()`, null)
        ].join('\n'),
        hint: 'Full means count == len(self.items). Move rear with (rear + 1) % len(self.items) before storing; move front the same way after reading.',
        think: ['A circular queue keeps the items in place and moves two pointers instead: <code>front</code> (next to leave) and <code>rear</code> (last to join).',
          '<code>count</code> tells you whether it is full (<code>count == len(self.items)</code>) or empty (<code>count == 0</code>).',
          'Moving a pointer uses <code>(pointer + 1) % size</code>: after the last index it wraps round to 0, so freed slots at the start get reused.',
          'enqueue: check full, move rear, store, add 1. dequeue: check empty, read front, move front, subtract 1.'],
        diagnose: [
          { match: 'FIFO order', checks: 'that items come out in the order they went in', cause: 'dequeue must read <code>self.items[self.front]</code> and then move <code>front</code> on by one.' },
          { match: 'full queue returns False', checks: 'adding to a queue with every slot used', cause: 'Check <code>self.count == len(self.items)</code> before storing, and return False without changing anything.' },
          { match: 'wraps round', when: '\\+\\s*1\\s*$', checks: 'that rear goes back to index 0 after the last slot', cause: 'Without <code>%</code>, rear runs off the end of the list. Use <code>(self.rear + 1) % len(self.items)</code>.' },
          { match: 'wraps round|comes out last', checks: 'that rear goes back to index 0 after the last slot, reusing the freed slot', cause: 'Both pointers must wrap with <code>% len(self.items)</code>, and count must go up and down so a freed slot can be used again.' },
          { match: 'empty queue returns None', checks: 'dequeue on an empty queue', cause: 'Check <code>self.count == 0</code> first and return None.' }
        ]
      };
    } }
  ]);

  /* ===== Lesson tabs (Try it / Trace it): static arrays for B2.2.1 ===== */
  P.add('B2.2.1', [
    { id: 'sarr-code', kind: 'code', term: 'Construct', marks: 3, make(R) {
      const v = R.int(0, 2), vals = R.ints(4, 10, 99);
      if (v === 0) return {
        prompt: 'A static array <code>arr</code> has a fixed number of slots, and <code>count</code> slots are in use (slots 0 to count − 1). Write <code>store(arr, count, value)</code>: if there is a free slot, put <code>value</code> in the next one and return the new count; if the array is full, change nothing and return <code>count</code>.',
        starter: 'def store(arr, count, value):\n    pass\n',
        solution: 'def store(arr, count, value):  # a static array, the slots in use, and a new value\n    if count < len(arr):  # a free slot? The last index is len(arr) - 1\n        arr[count] = value  # count is also the index of the next free slot\n        count = count + 1  # one more slot in use\n    return count  # the new count — unchanged if the array was full\n',
        think: ['Slots 0 … count − 1 are full, so the next free slot is index <code>count</code>.', 'The array is full when <code>count</code> equals its length — then a static array can\'t grow, so change nothing.', 'Return the count so the caller can keep track of it.'],
        diagnose: [
          { match: 'full', checks: 'a full array', cause: 'Check <code>count &lt; len(arr)</code> before storing; if it is full, return count without changing arr.' },
          { match: '.', when: 'append', checks: 'storing in a fixed slot', cause: 'A static array never grows — store with <code>arr[count] = value</code>, not <code>append</code>.' },
          { match: '.', checks: 'storing in the next free slot', cause: 'Put the value at index <code>count</code>, then return <code>count + 1</code>.' }],
        tests: [P.tblock(`storing ${vals[0]} then ${vals[1]} in 3 empty slots`, `arr = [None] * 3\nc = 0\nc = store(arr, c, ${vals[0]})\nc = store(arr, c, ${vals[1]})\nreturn [arr, c]`, [[vals[0], vals[1], null], 2]),
          P.tblock('storing in a full array changes nothing', `arr = [${vals[2]}, ${vals[3]}]\nc = store(arr, 2, 5)\nreturn [arr, c]`, [[vals[2], vals[3]], 2])].join('\n'),
        banned: [{ label: 'append()', re: '\\.append\\s*\\(' }], hint: 'if count < len(arr): arr[count] = value …'
      };
      if (v === 1) return {
        prompt: 'A static array can\'t grow, so a dynamic structure makes a new, bigger array and copies the items across. Write <code>grow(arr)</code> that returns a new array <b>twice as long</b>, with the items of <code>arr</code> in the same positions and <code>None</code> in the new slots. Don\'t use <code>append</code>.',
        starter: 'def grow(arr):\n    pass\n',
        solution: 'def grow(arr):  # a full static array\n    bigger = [None] * (len(arr) * 2)  # allocate a new block twice the size\n    for i in range(len(arr)):  # every slot of the old array\n        bigger[i] = arr[i]  # copy it to the same index\n    return bigger  # the caller uses the new array from now on\n',
        think: ['Make the new array first, full-size: <code>[None] * (len(arr) * 2)</code>.', 'Copy index by index, so every item keeps its position.', 'Return the new array — the old one is left unchanged. This copying is the hidden cost of resizing.'],
        diagnose: [
          { match: 'unchanged', checks: 'that the original array is not changed', cause: 'Build and return a <b>new</b> array; don\'t modify <code>arr</code>.' },
          { match: '.', when: '\\[None\\s*\\*', checks: 'making the new array', cause: '<code>[None] * n</code> repeats a one-item list; <code>[None * n]</code> multiplies None, which fails.' },
          { match: '.', checks: 'the new array\'s contents', cause: 'Make <code>[None] * (len(arr) * 2)</code>, copy <code>arr[i]</code> into the same index for every i, and return it.' }],
        tests: [P.t(`grow([${vals[0]}, ${vals[1]}]) is [${vals[0]}, ${vals[1]}, None, None]`, `grow([${vals[0]}, ${vals[1]}])`, [vals[0], vals[1], null, null]),
          P.t('grow(["a"]) is ["a", None]', 'grow(["a"])', ['a', null]),
          P.tblock('the original array is unchanged', `a = [${vals[2]}, ${vals[3]}, ${vals[0]}]\nb = grow(a)\nreturn [a, len(b)]`, [[vals[2], vals[3], vals[0]], 6])].join('\n'),
        banned: [{ label: 'append()', re: '\\.append\\s*\\(' }, { label: 'extend()', re: '\\.extend\\s*\\(' }], hint: 'bigger = [None] * (len(arr) * 2), then copy each item.'
      };
      const arrs = [[vals[0], vals[1], null, null], [null, null, null], [vals[2], vals[3], vals[0], vals[1], null]], used = a => a.filter(x => x !== null).length;
      return {
        prompt: 'In a static array, empty slots hold <code>None</code>. Write <code>used(arr)</code> that returns how many slots hold a value. <b>No built-ins:</b> don\'t use <code>len</code>, <code>sum</code> or <code>count</code>.',
        starter: 'def used(arr):\n    pass\n',
        solution: 'def used(arr):  # a static array; None marks an empty slot\n    total = 0  # no used slots found yet\n    for x in arr:  # every slot, used or not\n        if x is not None:  # a real value is stored here\n            total = total + 1  # count it\n    return total  # how many slots are in use\n',
        think: ['A static array always has the same number of slots, so its length doesn\'t tell you how many are in use.', 'Visit every slot and count the ones that aren\'t <code>None</code> — the count pattern.', '<code>x is not None</code> is the usual test for "this slot holds something".'],
        diagnose: [
          { match: 'None, None, None\\]\\)', checks: 'an array with no values', cause: 'Count only slots that are not None; an empty array gives 0.' },
          { match: '.', checks: 'the number of used slots', cause: 'Start at 0 and add 1 for each slot where <code>x is not None</code>.' }],
        tests: arrs.map(a => P.t(`used(${py.r(a)}) is ${used(a)}`, `used(${py.r(a)})`, used(a))).join('\n'),
        banned: P.ban('len', 'sum').concat([{ label: '.count()', re: '\\.count\\s*\\(' }]), hint: 'for x in arr: if x is not None: …'
      };
    } },
    { id: 'sarr-output', kind: 'output', term: 'Determine', marks: 3, make(R) {
      const size = R.int(3, 4), values = R.ints(size + R.int(1, 2), 10, 99), arr = Array(size).fill(null), out = [], story = [];
      let count = 0;
      for (const v of values) {
        if (count < size) { arr[count] = v; story.push(`${v} goes in slot ${count}`); count++; }
        else { out.push(`Full: ${v}`); story.push(`count is ${size}, so ${v} is refused`); }
      }
      out.push(py.r(arr), String(count));
      return {
        prompt: 'What does this program print?',
        code: `SIZE = ${size}\narr = [None] * SIZE\ncount = 0\nfor v in ${py.r(values)}:\n    if count < SIZE:\n        arr[count] = v\n        count = count + 1\n    else:\n        print("Full:", v)\nprint(arr)\nprint(count)`,
        answer: out.join('\n'),
        explain: P.list(story) + `<p>The array was made with ${size} slots and never grows — that is what makes it a <b>static</b> structure — so the extra values can't be stored.</p>`
      };
    } }
  ]);

})(CodeCraft.practice);
