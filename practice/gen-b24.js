/* Practice generators — B2.4 Programming algorithms (Big O, linear & binary search, bubble & selection sort). */
(function (P) {
  const { py, esc, code: C } = P;
  const opt = (text, ok, why) => ({ text, ok: !!ok, why });
  const BIGO = {
    'O(1)': 'constant time — the same number of steps however big the input is',
    'O(log n)': 'logarithmic — the problem is halved each step, so doubling n adds only one step',
    'O(n)': 'linear — the work grows in proportion to n (one pass through the data)',
    'O(n²)': 'quadratic — a loop inside a loop over the data, so doubling n quadruples the work'
  };
  const bigoOptions = (ok, why) => Object.keys(BIGO).map(k => opt(k, k === ok, k === ok ? `Correct — ${why}` : `${k} is ${BIGO[k]}.`));

  /* ================= B2.4.1  Big O ================= */
  const SNIPPETS = {
    'O(1)': [['def first_item(items):\n    return items[0]', 'it reads one item by index — no loop, so the time doesn\'t depend on the list length.'],
      ['def middle(items):\n    return items[len(items) // 2]', 'indexing a list takes the same time whatever its length, and there is no loop.'],
      ['def is_empty(stack):\n    return len(stack) == 0', 'it does one check, with no loop.']],
    'O(n)': [['def total(marks):\n    t = 0\n    for m in marks:\n        t = t + m\n    return t', 'the loop visits each of the n marks once.'],
      ['def contains(items, target):\n    for x in items:\n        if x == target:\n            return True\n    return False', 'in the worst case the loop checks all n items once.'],
      ['def count_late(times, limit):\n    n = 0\n    for t in times:\n        if t > limit:\n            n = n + 1\n    return n', 'one loop through the n times.']],
    'O(n²)': [['def has_duplicate(items):\n    for i in range(len(items)):\n        for j in range(len(items)):\n            if i != j and items[i] == items[j]:\n                return True\n    return False', 'for each of the n items, the inner loop runs n times: n × n comparisons.'],
      ['def all_pairs(names):\n    for a in names:\n        for b in names:\n            print(a, b)', 'a nested loop over the same list prints n × n pairs.'],
      ['def bubble_pass_all(items):\n    n = len(items)\n    for i in range(n - 1):\n        for j in range(n - 1 - i):\n            if items[j] > items[j + 1]:\n                items[j], items[j + 1] = items[j + 1], items[j]', 'bubble sort\'s nested loops make about n²/2 comparisons, which is O(n²).']],
    'O(log n)': [['def halvings(n):\n    steps = 0\n    while n > 1:\n        n = n // 2\n        steps = steps + 1\n    return steps', 'n is halved each time round, so the loop runs about log₂ n times.'],
      ['def binary_search(items, target):\n    low = 0\n    high = len(items) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if items[mid] == target:\n            return mid\n        elif items[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1', 'each comparison halves the part of the list still being searched.']]
  };
  P.add('B2.4.1', [
    { id: 'bigo-code', kind: 'mcq', term: 'Describe', marks: 1, make(R) {
      const k = R.pick(Object.keys(SNIPPETS)), [code, why] = R.pick(SNIPPETS[k]);
      return { prompt: 'What is the time complexity of this function, where <em>n</em> is the size of the input?', code, options: bigoOptions(k, why) };
    } },
    { id: 'bigo-count', kind: 'output', term: 'Calculate', marks: 2, make(R) {
      const v = R.int(0, 4), n = v === 4 ? R.pick([16, 32, 64, 128]) : R.int(4, 9);
      const T = [
        [`for i in range(n):\n    for j in range(n):\n        print("*")`, n * n, `the inner loop runs ${n} times for each of the ${n} outer iterations: ${n} × ${n} = ${n * n}. That is why nested loops are O(n²).`],
        [`for i in range(n):\n    for j in range(i):\n        print("*")`, n * (n - 1) / 2, `the inner loop runs 0, 1, 2, … ${n - 1} times: ${Array.from({ length: n }, (_, i) => i).join(' + ')} = ${n * (n - 1) / 2}. That's n(n − 1)/2, still O(n²).`],
        [`for i in range(n):\n    for j in range(3):\n        print("*")`, 3 * n, `the inner loop always runs 3 times, so the total is 3 × ${n} = ${3 * n}. A constant inner loop keeps it O(n).`],
        [`for i in range(n):\n    print("*")\nfor j in range(n):\n    print("*")`, 2 * n, `two separate loops of ${n}: ${n} + ${n} = ${2 * n}. Loops one after another add (O(n)); only nested loops multiply.`],
        [`while n > 1:\n    n = n // 2\n    print("*")`, Math.log2(n), `n halves each time: ${Array.from({ length: Math.log2(n) + 1 }, (_, i) => n / 2 ** i).join(' → ')}. That is log₂ ${n} = ${Math.log2(n)} prints — O(log n).`]
      ];
      const [code, count, why] = T[v];
      return {
        prompt: `How many times is <code>print("*")</code> executed when <code>n = ${n}</code>? (Type just the number.)`,
        code: `n = ${n}\n` + code, answer: String(count),
        run: `n = ${n}\nc = 0\n` + code.replace(/print\("\*"\)/g, 'c = c + 1') + '\nprint(c)',
        explain: `<p>${why}</p>`
      };
    } },
    { id: 'bigo-growth', kind: 'mcq', term: 'Calculate', marks: 1, make(R) {
      const t = R.int(2, 5), n = R.pick([1000, 2000, 5000]), k = R.int(2, 4), cls = R.pick(['O(n)', 'O(n²)', 'O(1)']);
      const val = { 'O(1)': t, 'O(n)': t * k, 'O(n²)': t * k * k }[cls];
      const fmt = x => `about ${x} seconds`;
      return {
        prompt: `An ${cls} algorithm takes ${t} seconds to process ${n.toLocaleString('en')} items. Roughly how long will it take for ${(n * k).toLocaleString('en')} items?`,
        options: P.options(opt(fmt(val), true, cls === 'O(1)' ? 'Constant time doesn\'t depend on n at all.' : cls === 'O(n)' ? `Linear: ${k} times the data takes ${k} times as long: ${t} × ${k} = ${t * k}.` : `Quadratic: ${k} times the data takes ${k}² = ${k * k} times as long: ${t} × ${k * k} = ${t * k * k}.`), [
          opt(fmt(t * k), false, `${k} times as long would be linear (O(n)) growth.`),
          opt(fmt(t * k * k), false, `${k * k} times as long would be quadratic (O(n²)) growth.`),
          opt(fmt(t), false, 'Staying the same would be constant (O(1)) time.'),
          opt(fmt(t * k * k * k), false, `${k}³ times as long would be cubic growth — not this algorithm.`)])
      };
    } },
    { id: 'bigo-algos', kind: 'mcq', term: 'State', marks: 1, make(R) {
      const T = [
        ['the worst-case time of a linear search', 'O(n)', 'in the worst case every item is checked once.'],
        ['the worst-case time of a binary search', 'O(log n)', 'each comparison halves the remaining items.'],
        ['the worst-case time of bubble sort', 'O(n²)', 'nested loops compare pairs about n²/2 times.'],
        ['the time of selection sort (best or worst case)', 'O(n²)', 'it always scans the rest of the list for every position, even if the list is already sorted.'],
        ['reading items[i] from a list', 'O(1)', 'an index takes you straight to the item.'],
        ['push or pop on a stack', 'O(1)', 'only the top of the stack is touched.'],
        ['early-exit bubble sort on a list that is already sorted (best case)', 'O(n)', 'one pass with no swaps proves the list is sorted, and the algorithm stops.'],
        ['dequeue using items.pop(0) on a Python list', 'O(n)', 'every remaining item shifts one place left.'],
        ['the extra memory (space complexity) bubble sort needs', 'O(1)', 'it sorts in place, needing only a temporary variable for swaps.'],
        ['the extra memory needed to make a copy of a list of n items', 'O(n)', 'the copy holds n new items.']
      ];
      const [what, ok, why] = R.pick(T);
      return { prompt: `What is the Big O of <strong>${esc(what)}</strong>?`, options: bigoOptions(ok, why) };
    } },
    { id: 'bigo-written', kind: 'written', term: 'Explain', marks: 3, make(R) {
      return R.pick([
        { prompt: 'Explain why binary search is more scalable than linear search for a large, sorted list.', markscheme: ['Linear search may check every item: O(n)', 'Binary search halves the search space with each comparison: O(log n)', 'e.g. 1,000,000 items: up to 1,000,000 comparisons vs about 20', 'As n grows, the gap widens, so binary search scales much better (but the list must be sorted)'], model: '1 mark per point, up to 3.' },
        { prompt: 'Explain the difference between time complexity and space complexity.', markscheme: ['Time complexity describes how the number of steps/run time grows as the input size n grows', 'Space complexity describes how the extra memory needed grows as n grows', 'e.g. bubble sort is O(n²) time but O(1) space, because it sorts in place', 'An algorithm can be efficient in one and not the other — a trade-off'], model: '1 mark per point, up to 3.' },
        { prompt: 'Describe what it means for an algorithm to be O(n²), and why that matters for large datasets.', markscheme: ['The number of steps grows with the square of the input size', 'Typically caused by a loop nested inside another loop over the data', 'Doubling n roughly quadruples the time', 'So it becomes very slow for large n; an O(n log n) or O(n) method may be needed'], model: '1 mark per point, up to 3.' }
      ]);
    } }
  ]);

  /* ================= B2.4.2  Linear & binary search ================= */
  const BS_CODE = 'def binary_search(items, target):\n    low = 0\n    high = len(items) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if items[mid] == target:\n            return mid\n        elif items[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1';
  function bsTrace(items, target) {
    let low = 0, high = items.length - 1; const rows = [];
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      rows.push([low, high, mid, items[mid]]);
      if (items[mid] === target) return { rows, result: mid };
      if (items[mid] < target) low = mid + 1; else high = mid - 1;
    }
    return { rows, result: -1, end: [low, high] };
  }
  const sortedList = R => R.distinct(R.int(7, 11), 2, 99).sort((a, b) => a - b);
  P.add('B2.4.2', [
    { id: 'bs-trace', kind: 'trace', term: 'Trace', marks: 4, make(R) {
      const items = sortedList(R), present = R.chance(0.7);
      let target = present ? R.pick(items) : R.int(3, 98);
      while (!present && items.includes(target)) target++;
      const t = bsTrace(items, target);
      const code = `${BS_CODE}\n\nitems = ${py.r(items)}\nprint(binary_search(items, ${target}))`;
      return {
        prompt: `Trace <code>binary_search</code> for target <code>${target}</code>. Add one row for each time round the loop.`, code,
        columns: ['low', 'high', 'mid', 'items[mid]'], rows: t.rows.map((r, i) => r.map((v, j) => ({ v: String(v), given: i === 0 && j < 2 }))),
        extra: [{ label: 'Value returned', v: String(t.result) }], check: { code, expect: String(t.result) },
        explain: `<p>${t.rows.map(([l, h, m, v]) => `low ${l}, high ${h} → mid = (${l} + ${h}) // 2 = ${m}, items[${m}] = ${v}${v === target ? ' — found' : v < target ? ' < target, so low = ' + (m + 1) : ' > target, so high = ' + (m - 1)}`).join('; ')}.${t.result === -1 ? ` Now low (${t.end[0]}) > high (${t.end[1]}), so the loop ends and -1 is returned: ${target} isn't in the list.` : ''}</p>`
      };
    } },
    { id: 'search-count', kind: 'mcq', term: 'Calculate', marks: 1, make(R) {
      const items = sortedList(R);
      if (R.chance(0.5)) {
        const present = R.chance(0.7), target = present ? R.pick(items) : items[items.length - 1] + R.int(1, 5), n = present ? items.indexOf(target) + 1 : items.length;
        return {
          prompt: `A linear search checks <code>${py.r(items)}</code> from the start for <code>${target}</code>. How many items does it compare before it stops?`,
          options: P.options(opt(String(n), true, present ? `${target} is at index ${n - 1}, so items 0 to ${n - 1} are checked: ${n} comparisons.` : `${target} isn't there, so all ${items.length} items are checked before returning -1.`),
            [opt(String(n - 1), false, 'The comparison with the target itself also counts.'), opt(String(n + 1), false, 'The search stops as soon as it finds the target.'), opt(String(Math.ceil(Math.log2(items.length + 1))), false, 'That would be a binary search; a linear search goes one item at a time.'), opt('1', false, 'Only the first item is checked if the target is first.')])
        };
      }
      const target = R.pick(items), t = bsTrace(items, target);
      return {
        prompt: `How many items does <code>binary_search</code> compare with the target when searching <code>${py.r(items)}</code> for <code>${target}</code>?`, code: BS_CODE,
        options: P.options(opt(String(t.rows.length), true, `The mids checked are ${t.rows.map(r => r[3]).join(', ')} — ${t.rows.length} comparison${t.rows.length > 1 ? 's' : ''}.`),
          [opt(String(items.indexOf(target) + 1), false, 'That is how many a linear search would need.'), opt(String(t.rows.length + 1), false, 'Count the values of mid that are actually checked.'), opt(String(items.length), false, 'Binary search never checks every item.'), opt(String(Math.max(1, t.rows.length - 1)), false, 'The comparison that finds the target counts too.')]),
        check: { code: `${BS_CODE.replace('mid = (low + high) // 2', 'mid = (low + high) // 2\n        c.append(mid)')}\nc = []\nbinary_search(${py.r(items)}, ${target})\nprint(len(c))`, expect: String(t.rows.length) }
      };
    } },
    { id: 'search-concept', kind: 'mcq', term: 'State', marks: 1, make(R) {
      const QS = [
        ['What must be true of a list before binary search can be used?', 'It must be sorted', [['It must have an even number of items', 'Any length works; mid is rounded down with //.'], ['It must contain no negative numbers', 'Values can be anything that can be compared.'], ['It must be shorter than 1,000 items', 'Binary search is most useful for long lists.']], 'Binary search decides which half to discard by comparing with the middle item — that only works if the items are in order.'],
        ['When is a linear search a better choice than binary search?', 'When the list is unsorted (or very small)', [['When the list is sorted and very large', 'That is when binary search shines.'], ['When the target is in the middle', 'Position doesn\'t make linear search better in general.'], ['Never — binary search is always better', 'Binary search needs sorted data; sorting first can cost more than one linear search.']], 'Linear search works on any order of data and has no setup cost.'],
        ['About how many comparisons does binary search need, at most, for 1,000 sorted items?', 'About 10', [['About 500', 'That is the average for linear search.'], ['About 1,000', 'That is the worst case for linear search.'], ['About 100', 'Each comparison halves the list: 2¹⁰ = 1,024.']], '1,000 → 500 → 250 → … → 1 takes about log₂ 1000 ≈ 10 halvings.'],
        ['A phone book is sorted by name. Which search finds the owner of a given <strong>phone number</strong>?', 'Linear search, because the book isn\'t sorted by number', [['Binary search, because the book is sorted', 'It is sorted by name, not by number.'], ['Binary search on the names', 'You don\'t know the name — that\'s what you\'re looking for.'], ['Neither can do it', 'A linear search checks every entry, so it will find it.']], 'Binary search needs data sorted by the thing you search for.'],
        ['A phone book is sorted by name. Which search finds a given <strong>name</strong> most efficiently?', 'Binary search', [['Linear search', 'It works, but checks names one by one — O(n).'], ['Bubble sort', 'That is a sorting algorithm, not a search.'], ['Selection sort', 'That is a sorting algorithm, not a search.']], 'The data is already sorted by name, so each comparison can halve the search.']
      ];
      const [q, ok, wrong, why] = R.pick(QS);
      return { prompt: q, options: [opt(ok, true, why), ...wrong.map(w => opt(w[0], false, w[1]))] };
    } },
    { id: 'search-code', kind: 'code', term: 'Construct', marks: 5, make(R) {
      const lists = Array.from({ length: 3 }, () => sortedList(R));
      const cases = lists.flatMap(l => [[l, R.pick(l)], [l, l[l.length - 1] + R.int(1, 9)]]).concat([[lists[0], lists[0][0]]]);
      if (R.chance(0.5)) return {
        prompt: 'Write <code>linear_search(items, target)</code> that returns the index of the first match, or <code>-1</code> if <code>target</code> isn\'t there. <strong>No built-ins:</strong> don\'t use <code>.index()</code> or <code>.find()</code>.',
        starter: 'def linear_search(items, target):\n    pass\n',
        solution: 'def linear_search(items, target):\n    for i in range(len(items)):\n        if items[i] == target:\n            return i\n    return -1\n',
        tests: cases.map(([l, t]) => P.t(`linear_search(…, ${t}) returns ${l.indexOf(t)}`, `linear_search(${py.r(l)}, ${t})`, l.indexOf(t))).join('\n'),
        banned: P.ban('index', 'find'), hint: 'Loop over the indexes with range(len(items)). Return i when items[i] == target; after the loop, return -1.'
      };
      return {
        prompt: 'Write <code>binary_search(items, target)</code> for a sorted list. Return the index of <code>target</code>, or <code>-1</code> if it isn\'t there. Use <code>low</code>, <code>high</code> and <code>mid = (low + high) // 2</code>.',
        starter: 'def binary_search(items, target):\n    low = 0\n    high = len(items) - 1\n    # your loop here\n    return -1\n',
        solution: BS_CODE + '\n',
        tests: cases.map(([l, t]) => P.t(`binary_search(…, ${t}) returns ${l.indexOf(t)}`, `binary_search(${py.r(l)}, ${t})`, l.indexOf(t))).join('\n'),
        banned: P.ban('index', 'find'), hint: 'Loop while low <= high. If items[mid] is too small, move low to mid + 1; if too big, move high to mid - 1.'
      };
    } }
  ]);

  /* ================= B2.4.3  Bubble & selection sort ================= */
  const BUBBLE = 'def bubble_sort(items):\n    n = len(items)\n    for i in range(n - 1):\n        for j in range(n - 1 - i):\n            if items[j] > items[j + 1]:\n                items[j], items[j + 1] = items[j + 1], items[j]';
  const SELECT = 'def selection_sort(items):\n    n = len(items)\n    for i in range(n - 1):\n        smallest = i\n        for j in range(i + 1, n):\n            if items[j] < items[smallest]:\n                smallest = j\n        items[i], items[smallest] = items[smallest], items[i]';
  const bubblePasses = a => { a = a.slice(); const out = []; const n = a.length; for (let i = 0; i < n - 1; i++) { for (let j = 0; j < n - 1 - i; j++) if (a[j] > a[j + 1]) [a[j], a[j + 1]] = [a[j + 1], a[j]]; out.push(a.slice()); } return out; };
  const selectPasses = a => { a = a.slice(); const out = []; const n = a.length; for (let i = 0; i < n - 1; i++) { let s = i; for (let j = i + 1; j < n; j++) if (a[j] < a[s]) s = j; [a[i], a[s]] = [a[s], a[i]]; out.push(a.slice()); } return out; };
  const unsorted = R => { let a; do { a = R.distinct(R.int(5, 6), 1, 50); } while (a.every((x, i) => i === 0 || a[i - 1] < x)); return a; };
  const passTrace = (name, src, passes) => (R) => {
    const a = unsorted(R), k = R.int(2, 3), ps = passes(a).slice(0, k);
    const fn = name === 'bubble' ? 'bubble_sort' : 'selection_sort';
    return {
      prompt: `Trace the first ${k} passes of <strong>${name} sort</strong> on <code>${py.r(a)}</code>. Write the list after each pass (one pass = one run of the outer loop).`,
      code: src, columns: ['Pass', 'List after the pass'], rows: ps.map((p, i) => [{ v: String(i + 1), given: true }, { v: py.r(p) }]),
      check: { code: src.replace(/def \w+\(items\):/, `def ${fn}(items, k):`).replace('for i in range(n - 1):', 'for i in range(min(k, n - 1)):') + `\n\nitems = ${py.r(a)}\n${fn}(items, ${k})\nprint(items)`, expect: py.r(ps[k - 1]) },
      explain: name === 'bubble' ? `<p>Each pass compares neighbours and swaps them if they are in the wrong order, so the largest remaining value "bubbles" to the end. After pass ${k}, the last ${k} items are in their final places.</p>` : `<p>Each pass finds the smallest value in the unsorted part and swaps it into position i. After pass ${k}, the first ${k} items are in their final places.</p>`
    };
  };
  P.add('B2.4.3', [
    { id: 'bubble-pass', kind: 'trace', term: 'Trace', marks: 3, make: passTrace('bubble', BUBBLE, bubblePasses) },
    { id: 'selection-pass', kind: 'trace', term: 'Trace', marks: 3, make: passTrace('selection', SELECT, selectPasses) },
    { id: 'sort-identify', kind: 'mcq', term: 'Identify', marks: 2, make(R) {
      let a, b1, s1;
      do { a = unsorted(R); b1 = bubblePasses(a)[0]; s1 = selectPasses(a)[0]; } while (py.r(b1) === py.r(s1));
      const isB = R.chance(0.5), after = isB ? b1 : s1;
      return {
        prompt: `After <strong>one pass</strong>, the list <code>${py.r(a)}</code> becomes <code>${py.r(after)}</code>. Which algorithm was used?`,
        options: [opt('Bubble sort', isB, isB ? `Neighbouring pairs were swapped along the list, carrying the largest value (${Math.max(...a)}) to the end.` : `Bubble sort's first pass would give ${py.r(b1)}: the largest value moves to the end.`),
          opt('Selection sort', !isB, !isB ? `The smallest value (${Math.min(...a)}) was found and swapped into index 0; nothing else moved.` : `Selection sort's first pass would give ${py.r(s1)}: only the smallest value is swapped to the front.`),
          opt('Binary search', false, 'Binary search finds an item; it never changes the list.')], fixedOrder: true
      };
    } },
    { id: 'sort-count', kind: 'output', term: 'Calculate', marks: 1, make(R) {
      const v = R.int(0, 2);
      if (v === 0) { const n = R.int(5, 12);
        return { prompt: `Bubble sort (code below, no early exit) sorts a list of <strong>${n}</strong> items. How many comparisons does it make <strong>in total</strong>?`, code: BUBBLE, answer: String(n * (n - 1) / 2),
          run: `items = list(range(${n}, 0, -1))\nc = 0\nn = len(items)\nfor i in range(n - 1):\n    for j in range(n - 1 - i):\n        c = c + 1\nprint(c)`,
          explain: `<p>Pass 1 makes ${n - 1} comparisons, pass 2 makes ${n - 2}, … down to 1: ${n - 1} + ${n - 2} + … + 1 = n(n − 1)/2 = ${n * (n - 1) / 2}. It is the same for any order of data, because this version never stops early.</p>` }; }
      const a = unsorted(R);
      if (v === 1) { let sw = 0; const b = a.slice(); for (let j = 0; j < b.length - 1; j++) if (b[j] > b[j + 1]) { [b[j], b[j + 1]] = [b[j + 1], b[j]]; sw++; }
        return { prompt: `How many <strong>swaps</strong> does the first pass of bubble sort make on <code>${py.r(a)}</code>?`, code: BUBBLE, answer: String(sw),
          run: `items = ${py.r(a)}\nc = 0\nfor j in range(len(items) - 1):\n    if items[j] > items[j + 1]:\n        items[j], items[j + 1] = items[j + 1], items[j]\n        c = c + 1\nprint(c)`,
          explain: `<p>Walk along comparing neighbours, swapping when the left one is bigger. The list after the pass is ${py.r(b)}, after ${sw} swap${sw === 1 ? '' : 's'}.</p>` }; }
      const n = a.length;
      return { prompt: `Selection sort sorts <code>${py.r(a)}</code>. How many comparisons does it make in total?`, code: SELECT, answer: String(n * (n - 1) / 2),
        run: `items = ${py.r(a)}\nc = 0\nn = len(items)\nfor i in range(n - 1):\n    for j in range(i + 1, n):\n        c = c + 1\nprint(c)`,
        explain: `<p>For ${n} items selection sort always compares ${n - 1} + ${n - 2} + … + 1 = ${n * (n - 1) / 2} times — it scans the rest of the list on every pass, however the data is ordered.</p>` };
    } },
    { id: 'sort-concept', kind: 'mcq', term: 'State', marks: 1, make(R) {
      const QS = [
        ['After pass <em>k</em> of bubble sort (ascending), what is guaranteed?', 'The k largest items are in their final places at the end', [['The k smallest items are in place at the start', 'That is what selection sort guarantees.'], ['The whole list is sorted', 'Only after enough passes, or an early exit.'], ['Nothing until the final pass', 'Each pass fixes at least one more item at the end.']], 'Each pass carries the largest remaining value to the end of the unsorted part.'],
        ['After pass <em>k</em> of selection sort (ascending), what is guaranteed?', 'The k smallest items are in their final places at the start', [['The k largest items are in place at the end', 'That is what bubble sort guarantees.'], ['The list is sorted', 'Not until n − 1 passes are done.'], ['k swaps of neighbouring items happened', 'Selection sort swaps the smallest item into place, not neighbours.']], 'Each pass selects the smallest remaining value and swaps it into position.'],
        ['How can bubble sort be made faster on a nearly sorted list?', 'Stop early if a whole pass makes no swaps', [['Start the inner loop at the end', 'That doesn\'t reduce the number of passes.'], ['Swap items that are already in order', 'That would un-sort the list.'], ['Use a larger list', 'The list size is given by the data.']], 'If a pass makes no swaps, the list is already sorted — best case O(n).'],
        ['What is the space complexity of bubble sort and selection sort?', 'O(1) — they sort in place', [['O(n) — they make a copy', 'Both rearrange the original list.'], ['O(n²)', 'That is their time complexity.'], ['O(log n)', 'Neither uses halving.']], 'Only a few extra variables (indexes and a temporary value for swaps) are needed.'],
        ['What is the most swaps selection sort makes on a list of n items?', 'n − 1', [['n²', 'It makes at most one swap per pass.'], ['n(n − 1)/2', 'That is its number of comparisons.'], ['0', 'It swaps whenever the smallest item isn\'t already in place.']], 'There are n − 1 passes, with at most one swap each — useful when writing to memory is expensive.'],
        ['Which statement about the worst-case time of bubble sort and selection sort is true?', 'Both are O(n²)', [['Bubble sort is O(n), selection sort is O(n²)', 'Bubble sort is only O(n) in its best case, with an early exit.'], ['Both are O(n log n)', 'Neither halves the problem.'], ['Both are O(n)', 'They use nested loops.']], 'Both use nested loops over the list.']
      ];
      const [q, ok, wrong, why] = R.pick(QS);
      return { prompt: q, options: [opt(ok, true, why), ...wrong.map(w => opt(w[0], false, w[1]))] };
    } },
    { id: 'sort-code', kind: 'code', term: 'Construct', marks: 6, make(R) {
      const alg = R.pick(['bubble', 'selection', 'early']), desc = R.chance(0.35) && alg !== 'early';
      const lists = [R.ints(R.int(5, 8), -20, 60), R.ints(6, 1, 9), [3, 1, 2], [1, 2, 3, 4], [5]];
      const ban = P.ban('sort', 'sorted', 'min', 'max');
      if (alg === 'early') {
        const passes = a => { a = a.slice(); let p = 0; for (let i = 0; i < a.length - 1; i++) { let sw = false; p++; for (let j = 0; j < a.length - 1 - i; j++) if (a[j] > a[j + 1]) { [a[j], a[j + 1]] = [a[j + 1], a[j]]; sw = true; } if (!sw) break; } return p; };
        return {
          prompt: 'Write <code>bubble_passes(items)</code>: an <strong>early-exit</strong> bubble sort that sorts the list in place and returns how many passes it made, stopping after the first pass that makes no swaps. (A list of 0 or 1 items needs 0 passes.)',
          starter: 'def bubble_passes(items):\n    pass\n',
          solution: 'def bubble_passes(items):\n    n = len(items)\n    passes = 0\n    for i in range(n - 1):\n        swapped = False\n        passes = passes + 1\n        for j in range(n - 1 - i):\n            if items[j] > items[j + 1]:\n                items[j], items[j + 1] = items[j + 1], items[j]\n                swapped = True\n        if not swapped:\n            break\n    return passes\n',
          tests: lists.map(l => P.t(`bubble_passes(${py.r(l)}) returns ${passes(l)}`, `bubble_passes(${py.r(l)})`, passes(l))).join('\n') + '\n' + P.tblock('the list ends up sorted', `a = ${py.r(lists[0])}\nbubble_passes(a)\nreturn a`, lists[0].slice().sort((x, y) => x - y)),
          banned: ban, hint: 'Use a swapped flag set to False at the start of each pass. If it is still False after the inner loop, break.'
        };
      }
      const fn = alg === 'bubble' ? 'bubble_sort' : 'selection_sort';
      const sortFn = l => l.slice().sort((x, y) => (desc ? y - x : x - y));
      const sol = (alg === 'bubble' ? BUBBLE : SELECT).replace(desc ? (alg === 'bubble' ? 'items[j] > items[j + 1]' : 'items[j] < items[smallest]') : '@@', desc ? (alg === 'bubble' ? 'items[j] < items[j + 1]' : 'items[j] > items[smallest]') : '@@') + '\n    return items\n';
      return {
        prompt: `Write <code>${fn}(items)</code> using <strong>${alg} sort</strong> to sort the list into <strong>${desc ? 'descending' : 'ascending'}</strong> order, in place, and return it.`,
        starter: `def ${fn}(items):\n    pass\n`, solution: sol,
        tests: lists.map(l => P.t(`${fn}(${py.r(l)}) returns ${py.r(sortFn(l))}`, `${fn}(${py.r(l)})`, sortFn(l))).join('\n'),
        banned: ban, hint: alg === 'bubble' ? `Two nested loops: compare items[j] with items[j + 1] and swap them if they are in the wrong order for ${desc ? 'descending' : 'ascending'}.` : `For each position i, find the index of the ${desc ? 'largest' : 'smallest'} item from i onwards, then swap it into position i.`
      };
    } }
  ]);
})(CodeCraft.practice);
