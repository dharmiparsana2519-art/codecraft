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
      const LOOK = { 'O(1)': 'There is no loop: the function does one fixed piece of work, whatever the size of the input.',
        'O(n)': 'There is one loop, and it goes through the n items once.',
        'O(n²)': 'There is a loop inside a loop, and both depend on n — so the inner work happens about n × n times.',
        'O(log n)': 'There is a loop, but each time round it halves what is left (n // 2, or the low–high range).' };
      return { prompt: 'What is the time complexity of this function, where <em>n</em> is the size of the input?', code, options: bigoOptions(k, why),
        steps: ['Look for the loops, and ask how many times each one runs as <em>n</em> grows.', LOOK[k], `So the function is <strong>${k}</strong>: ${why}`] };
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
          opt(fmt(t * k * k * k), false, `${k}³ times as long would be cubic growth — not this algorithm.`)]),
        steps: [`Work out how much bigger the input is: ${(n * k).toLocaleString('en')} ÷ ${n.toLocaleString('en')} = ${k} times as many items.`,
          'Apply the growth rule: O(1) time stays the same; O(n) time is multiplied by the same factor; O(n²) time is multiplied by the factor squared.',
          cls === 'O(1)' ? `O(1): the time stays at ${t} seconds.` : cls === 'O(n)' ? `O(n): ${t} × ${k} = ${t * k} seconds.` : `O(n²): ${t} × ${k}² = ${t} × ${k * k} = ${t * k * k} seconds.`]
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
      return { prompt: `What is the Big O of <strong>${esc(what)}</strong>?`, options: bigoOptions(ok, why),
        steps: ['Picture how the operation works on n items, step by step.', 'Ask: if n doubled, would the work stay the same (O(1)), add one step (O(log n)), double (O(n)) or quadruple (O(n²))?', `Here ${why} So it is <strong>${ok}</strong>.`] };
    } },
    { id: 'bigo-written', kind: 'written', term: 'Explain', marks: 3, make(R) {
      return R.pick([
        { prompt: 'Explain why binary search is more scalable than linear search for a large, sorted list.',
          markscheme: [{ text: 'Linear search may check every item: O(n)', why: 'It states how linear search behaves and gives its Big O.' },
            { text: 'Binary search halves the search space with each comparison: O(log n)', why: 'It explains the mechanism (halving) that makes binary search fast.' },
            { text: 'e.g. 1,000,000 items: up to 1,000,000 comparisons vs about 20', why: 'A worked number shows the size of the difference, which supports "explain".' },
            { text: 'As n grows, the gap widens, so binary search scales much better (but the list must be sorted)', why: 'It answers the actual question — scalability — and notes the condition.' }],
          model: '1 mark per point, up to 3.',
          answer: '<p>A linear search may have to check every item, so its worst case is O(n). <span class="mk">[1]</span> A binary search compares with the middle item and discards half of the list each time, so it is O(log n). <span class="mk">[1]</span> For 1,000,000 items that is up to 1,000,000 comparisons against about 20, and the gap keeps widening as the list grows, so binary search scales far better. <span class="mk">[1]</span></p>' },
        { prompt: 'Explain the difference between time complexity and space complexity.',
          markscheme: [{ text: 'Time complexity describes how the number of steps/run time grows as the input size n grows', why: 'A correct definition of the first term.' },
            { text: 'Space complexity describes how the extra memory needed grows as n grows', why: 'A correct definition of the second term — the difference is now clear.' },
            { text: 'e.g. bubble sort is O(n²) time but O(1) space, because it sorts in place', why: 'An example showing the two can differ for one algorithm.' },
            { text: 'An algorithm can be efficient in one and not the other — a trade-off', why: 'It draws the comparison together, which "explain" rewards.' }],
          model: '1 mark per point, up to 3.',
          answer: '<p>Time complexity describes how the number of steps an algorithm takes grows as the input size n grows. <span class="mk">[1]</span> Space complexity describes how the extra memory it needs grows as n grows. <span class="mk">[1]</span> For example, bubble sort is O(n²) in time but only O(1) in space, because it sorts the list in place. <span class="mk">[1]</span></p>' },
        { prompt: 'Describe what it means for an algorithm to be O(n²), and why that matters for large datasets.',
          markscheme: [{ text: 'The number of steps grows with the square of the input size', why: 'It defines O(n²) correctly.' },
            { text: 'Typically caused by a loop nested inside another loop over the data', why: 'It links the Big O to what you would see in the code.' },
            { text: 'Doubling n roughly quadruples the time', why: 'It shows the growth with a concrete effect.' },
            { text: 'So it becomes very slow for large n; an O(n log n) or O(n) method may be needed', why: 'It answers the "why that matters" part.' }],
          model: '1 mark per point, up to 3.',
          answer: '<p>O(n²) means the number of steps grows with the square of the input size, usually because a loop over the data is nested inside another loop. <span class="mk">[1]</span> Doubling n roughly quadruples the time. <span class="mk">[1]</span> So for large datasets the algorithm becomes very slow, and a faster method such as an O(n) one may be needed. <span class="mk">[1]</span></p>' }
      ]);
    } }
  ]);

  /* ================= B2.4.2  Linear & binary search ================= */
  const BS_CODE = 'def binary_search(items, target):\n    low = 0\n    high = len(items) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if items[mid] == target:\n            return mid\n        elif items[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1';
  const BS_NOTED = 'def binary_search(items, target):  # items must be sorted\n    low = 0  # first index still in play\n    high = len(items) - 1  # last index still in play\n    while low <= high:  # <= because when low == high one item is left to check\n        mid = (low + high) // 2  # middle index; // keeps it a whole number\n        if items[mid] == target:  # found it\n            return mid  # return the index, not the value\n        elif items[mid] < target:  # middle is too small, so the target is to the right\n            low = mid + 1  # + 1: mid itself has been checked\n        else:  # middle is too big, so the target is to the left\n            high = mid - 1  # - 1: mid itself has been checked\n    return -1  # low passed high: nothing left, so it isn\'t there\n';
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
            [opt(String(n - 1), false, 'The comparison with the target itself also counts.'), opt(String(n + 1), false, 'The search stops as soon as it finds the target.'), opt(String(Math.ceil(Math.log2(items.length + 1))), false, 'That would be a binary search; a linear search goes one item at a time.'), opt('1', false, 'Only the first item is checked if the target is first.')]),
          steps: ['A linear search compares items one at a time from index 0, and stops as soon as it finds the target.',
            present ? `Count along: ${items.slice(0, n).join(', ')} — ${target} is reached at index ${n - 1}.` : `${target} isn't in the list, so the search has to compare every item before it gives up.`,
            `That is <strong>${n}</strong> comparison${n === 1 ? '' : 's'}.`]
        };
      }
      const target = R.pick(items), t = bsTrace(items, target);
      return {
        prompt: `How many items does <code>binary_search</code> compare with the target when searching <code>${py.r(items)}</code> for <code>${target}</code>?`, code: BS_CODE,
        options: P.options(opt(String(t.rows.length), true, `The mids checked are ${t.rows.map(r => r[3]).join(', ')} — ${t.rows.length} comparison${t.rows.length > 1 ? 's' : ''}.`),
          [opt(String(items.indexOf(target) + 1), false, 'That is how many a linear search would need.'), opt(String(t.rows.length + 1), false, 'Count the values of mid that are actually checked.'), opt(String(items.length), false, 'Binary search never checks every item.'), opt(String(Math.max(1, t.rows.length - 1)), false, 'The comparison that finds the target counts too.')]),
        steps: [`Start with low = 0 and high = ${items.length - 1}. Each time round, mid = (low + high) // 2 and items[mid] is compared with ${target}.`,
          ...t.rows.map(([l, h, m, v]) => `low ${l}, high ${h} → mid ${m}, items[${m}] = ${v}: ${v === target ? '<b>found</b>' : v < target ? `too small, so low = ${m + 1}` : `too big, so high = ${m - 1}`}.`),
          `${t.rows.length} value${t.rows.length === 1 ? ' was' : 's were'} compared, so the answer is <strong>${t.rows.length}</strong>.`],
        check: { code: `${BS_CODE.replace('mid = (low + high) // 2', 'mid = (low + high) // 2\n        c.append(mid)')}\nc = []\nbinary_search(${py.r(items)}, ${target})\nprint(len(c))`, expect: String(t.rows.length) }
      };
    } },
    { id: 'search-concept', kind: 'mcq', term: 'State', marks: 1, make(R) {
      const QS = [
        ['What must be true of a list before binary search can be used?', 'It must be sorted', [['It must have an even number of items', 'Any length works; mid is rounded down with //.'], ['It must contain no negative numbers', 'Values can be anything that can be compared.'], ['It must be shorter than 1,000 items', 'Binary search is most useful for long lists.']], 'Binary search decides which half to discard by comparing with the middle item — that only works if the items are in order.',
          ['Recall how binary search decides where to look next: it compares the target with the middle item.', 'If the target is bigger, it throws away the left half. That is only safe if everything on the left is smaller — the list must be in order.']],
        ['When is a linear search a better choice than binary search?', 'When the list is unsorted (or very small)', [['When the list is sorted and very large', 'That is when binary search shines.'], ['When the target is in the middle', 'Position doesn\'t make linear search better in general.'], ['Never — binary search is always better', 'Binary search needs sorted data; sorting first can cost more than one linear search.']], 'Linear search works on any order of data and has no setup cost.',
          ['List what each search needs: binary search needs sorted data; linear search needs nothing.', 'So when the data is unsorted (and sorting it would cost more than searching once), or the list is tiny, linear search is the better choice.']],
        ['About how many comparisons does binary search need, at most, for 1,000 sorted items?', 'About 10', [['About 500', 'That is the average for linear search.'], ['About 1,000', 'That is the worst case for linear search.'], ['About 100', 'Each comparison halves the list: 2¹⁰ = 1,024.']], '1,000 → 500 → 250 → … → 1 takes about log₂ 1000 ≈ 10 halvings.',
          ['Each comparison halves the items left: 1,000 → 500 → 250 → 125 → 63 → 32 → 16 → 8 → 4 → 2 → 1.', 'That is about 10 halvings (2¹⁰ = 1,024), so about 10 comparisons.']],
        ['A phone book is sorted by name. Which search finds the owner of a given <strong>phone number</strong>?', 'Linear search, because the book isn\'t sorted by number', [['Binary search, because the book is sorted', 'It is sorted by name, not by number.'], ['Binary search on the names', 'You don\'t know the name — that\'s what you\'re looking for.'], ['Neither can do it', 'A linear search checks every entry, so it will find it.']], 'Binary search needs data sorted by the thing you search for.',
          ['Ask: what are we searching by? A phone number.', 'Is the book sorted by phone number? No — only by name. So binary search can\'t be used; a linear search checks every entry.']],
        ['A phone book is sorted by name. Which search finds a given <strong>name</strong> most efficiently?', 'Binary search', [['Linear search', 'It works, but checks names one by one — O(n).'], ['Bubble sort', 'That is a sorting algorithm, not a search.'], ['Selection sort', 'That is a sorting algorithm, not a search.']], 'The data is already sorted by name, so each comparison can halve the search.',
          ['Rule out the sorting algorithms — the question asks for a search.', 'We search by name and the book is sorted by name, so binary search can halve the search each time: O(log n) beats linear search\'s O(n).']]
      ];
      const [q, ok, wrong, why, steps] = R.pick(QS);
      return { prompt: q, options: [opt(ok, true, why), ...wrong.map(w => opt(w[0], false, w[1]))], steps };
    } },
    { id: 'search-code', kind: 'code', term: 'Construct', marks: 5, make(R) {
      const lists = Array.from({ length: 3 }, () => sortedList(R));
      const cases = lists.flatMap(l => [[l, R.pick(l)], [l, l[l.length - 1] + R.int(1, 9)]]).concat([[lists[0], lists[0][0]]]);
      if (R.chance(0.5)) return {
        prompt: 'Write <code>linear_search(items, target)</code> that returns the index of the first match, or <code>-1</code> if <code>target</code> isn\'t there. <strong>No built-ins:</strong> don\'t use <code>.index()</code> or <code>.find()</code>.',
        starter: 'def linear_search(items, target):\n    pass\n',
        solution: 'def linear_search(items, target):  # items can be in any order\n    for i in range(len(items)):  # i = 0, 1, … n − 1: we need the index, not just the value\n        if items[i] == target:  # compare the item at index i\n            return i  # found: return its index straight away (the first match)\n    return -1  # the loop finished without finding it\n',
        think: ['We need the <b>index</b>, so loop over <code>range(len(items))</code> rather than over the values.', 'Compare each item with the target. As soon as one matches, return its index — that also makes it the first match.', 'Only when the loop has checked <b>every</b> item can we say it isn\'t there, so <code>return -1</code> goes after the loop.'],
        diagnose: [
          { match: '.', when: '^\\s{8,}return\\s*-\\s*1', checks: 'finding a target that is not the first item', cause: 'Your <code>return -1</code> is inside the loop (probably in an <code>else</code>), so the search gives up after the first item. Move it after the loop.' },
          { match: 'returns -1$', checks: 'a target that is not in the list', cause: 'After the loop has checked every item without a match, <code>return -1</code>.' },
          { match: 'returns 0$', checks: 'a target that is the first item (index 0)', cause: 'Start from index 0: use <code>range(len(items))</code>, not <code>range(1, …)</code>.' },
          { match: '.', checks: 'the index of the target', cause: 'Return the <b>index</b> <code>i</code>, not the value <code>items[i]</code>.' }],
        tests: cases.map(([l, t]) => P.t(`linear_search(…, ${t}) returns ${l.indexOf(t)}`, `linear_search(${py.r(l)}, ${t})`, l.indexOf(t))).join('\n'),
        banned: P.ban('index', 'find'), hint: 'Loop over the indexes with range(len(items)). Return i when items[i] == target; after the loop, return -1.'
      };
      return {
        prompt: 'Write <code>binary_search(items, target)</code> for a sorted list. Return the index of <code>target</code>, or <code>-1</code> if it isn\'t there. Use <code>low</code>, <code>high</code> and <code>mid = (low + high) // 2</code>.',
        starter: 'def binary_search(items, target):\n    low = 0\n    high = len(items) - 1\n    # your loop here\n    return -1\n',
        solution: BS_NOTED,
        think: ['Keep two indexes, <code>low</code> and <code>high</code>, marking the part of the list that could still hold the target.', 'Look at the middle item. If it is the target, return its index. If it is too small, the target can only be to the right, so move <code>low</code> past <code>mid</code>; if too big, move <code>high</code> below <code>mid</code>.', 'Each step halves the part left. When <code>low</code> passes <code>high</code> nothing is left, so return -1.', 'Use <code>mid + 1</code> and <code>mid - 1</code>: mid has already been checked, and without the ±1 the range can stop shrinking and loop forever.'],
        diagnose: [
          { match: '.', when: 'while\\s*\\(?\\s*low\\s*<\\s*high', checks: 'finding every target, including the last one left', cause: 'Use <code>while low &lt;= high</code>. When <code>low == high</code> there is still one item to check.' },
          { match: '.', when: '^\\s*(low|high)\\s*=\\s*mid\\s*$', checks: 'narrowing the search each time round', cause: '<code>low = mid</code> or <code>high = mid</code> can stop the range shrinking. Use <code>mid + 1</code> and <code>mid - 1</code>.' },
          { match: '.', when: 'items\\[mid\\]\\s*>\\s*target\\s*:\\s*\\n\\s*low', checks: 'moving the right way', cause: 'If <code>items[mid]</code> is too big, the target is to the <b>left</b>, so change <code>high</code>, not <code>low</code>.' },
          { match: 'returns -1$', checks: 'a target that is not in the list', cause: 'When the loop ends (low &gt; high), <code>return -1</code>.' },
          { match: '.', checks: 'the index of the target in a sorted list', cause: 'Compare <code>items[mid]</code> with the target: equal → return mid; smaller → <code>low = mid + 1</code>; bigger → <code>high = mid - 1</code>.' }],
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
          opt('Binary search', false, 'Binary search finds an item; it never changes the list.')], fixedOrder: true,
        steps: ['Rule out binary search: it never changes a list.', `Bubble sort's first pass swaps neighbours along the list, so the largest value (${Math.max(...a)}) ends up at the end: ${py.r(b1)}.`, `Selection sort's first pass swaps only the smallest value (${Math.min(...a)}) into index 0: ${py.r(s1)}.`, `The list became ${py.r(after)}, which matches <strong>${isB ? 'bubble' : 'selection'} sort</strong>.`]
      };
    } },
    { id: 'sort-count', kind: 'output', term: 'Determine', marks: 1, make(R) {
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
        ['After pass <em>k</em> of bubble sort (ascending), what is guaranteed?', 'The k largest items are in their final places at the end', [['The k smallest items are in place at the start', 'That is what selection sort guarantees.'], ['The whole list is sorted', 'Only after enough passes, or an early exit.'], ['Nothing until the final pass', 'Each pass fixes at least one more item at the end.']], 'Each pass carries the largest remaining value to the end of the unsorted part.',
          ['Picture one pass: neighbours are compared and swapped, so the largest value keeps moving right until it reaches the end.', 'So pass 1 fixes the largest item at the end, pass 2 the second largest, and after k passes the k largest are in place.']],
        ['After pass <em>k</em> of selection sort (ascending), what is guaranteed?', 'The k smallest items are in their final places at the start', [['The k largest items are in place at the end', 'That is what bubble sort guarantees.'], ['The list is sorted', 'Not until n − 1 passes are done.'], ['k swaps of neighbouring items happened', 'Selection sort swaps the smallest item into place, not neighbours.']], 'Each pass selects the smallest remaining value and swaps it into position.',
          ['Picture one pass: find the smallest value in the unsorted part and swap it into the next position at the front.', 'So after k passes the k smallest items are in their final places at the start.']],
        ['How can bubble sort be made faster on a nearly sorted list?', 'Stop early if a whole pass makes no swaps', [['Start the inner loop at the end', 'That doesn\'t reduce the number of passes.'], ['Swap items that are already in order', 'That would un-sort the list.'], ['Use a larger list', 'The list size is given by the data.']], 'If a pass makes no swaps, the list is already sorted — best case O(n).',
          ['Ask what a pass with no swaps tells you: every neighbour pair is already in order.', 'So the list is sorted and the remaining passes would do nothing — stop early with a swapped flag.']],
        ['What is the space complexity of bubble sort and selection sort?', 'O(1) — they sort in place', [['O(n) — they make a copy', 'Both rearrange the original list.'], ['O(n²)', 'That is their time complexity.'], ['O(log n)', 'Neither uses halving.']], 'Only a few extra variables (indexes and a temporary value for swaps) are needed.',
          ['Space complexity counts the <b>extra</b> memory used, not the list itself.', 'Both sorts swap items inside the same list and only need a few extra variables, whatever n is — O(1).']],
        ['What is the most swaps selection sort makes on a list of n items?', 'n − 1', [['n²', 'It makes at most one swap per pass.'], ['n(n − 1)/2', 'That is its number of comparisons.'], ['0', 'It swaps whenever the smallest item isn\'t already in place.']], 'There are n − 1 passes, with at most one swap each — useful when writing to memory is expensive.',
          ['Selection sort makes at most one swap per pass (the smallest item into place).', 'There are n − 1 passes, so at most n − 1 swaps.']],
        ['Which statement about the worst-case time of bubble sort and selection sort is true?', 'Both are O(n²)', [['Bubble sort is O(n), selection sort is O(n²)', 'Bubble sort is only O(n) in its best case, with an early exit.'], ['Both are O(n log n)', 'Neither halves the problem.'], ['Both are O(n)', 'They use nested loops.']], 'Both use nested loops over the list.',
          ['Both sorts have a loop nested inside another loop over the list.', 'Nested loops over n items give about n × n steps in the worst case, so both are O(n²).']]
      ];
      const [q, ok, wrong, why, steps] = R.pick(QS);
      return { prompt: q, options: [opt(ok, true, why), ...wrong.map(w => opt(w[0], false, w[1]))], steps };
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
          solution: 'def bubble_passes(items):  # sorts items in place\n    n = len(items)  # how many items (len is allowed; only sort/min/max are banned)\n    passes = 0  # no passes made yet\n    for i in range(n - 1):  # at most n − 1 passes; 0 or 1 items means no passes\n        swapped = False  # reset at the START of every pass\n        passes = passes + 1  # count this pass\n        for j in range(n - 1 - i):  # the last i items are already in place\n            if items[j] > items[j + 1]:  # neighbours in the wrong order?\n                items[j], items[j + 1] = items[j + 1], items[j]  # swap both at once\n                swapped = True  # remember that this pass changed something\n        if not swapped:  # a whole pass with no swaps: the list is sorted\n            break  # stop early (best case O(n))\n    return passes  # how many passes were needed\n',
          think: ['Start from normal bubble sort: an outer loop for the passes and an inner loop comparing neighbours <code>items[j]</code> and <code>items[j + 1]</code>.', 'Add a flag. Set <code>swapped = False</code> at the start of each pass, and to True whenever a swap happens.', 'After the inner loop, if <code>swapped</code> is still False the list is sorted, so <code>break</code>.', 'Count each pass as it starts, so the pass that discovers "no swaps" is counted too.'],
          diagnose: [
            { match: '.', when: '^\\s{0,4}swapped\\s*=\\s*False', checks: 'the number of passes', cause: 'Reset <code>swapped = False</code> at the start of <b>every</b> pass (inside the outer loop), not once before it.' },
            { match: '\\[5\\]\\) returns 0', checks: 'a list with one item, which needs 0 passes', cause: 'With one item, <code>range(n - 1)</code> is empty, so no pass is counted. Count passes inside the outer loop.' },
            { match: '\\[1, 2, 3, 4\\]\\) returns 1', checks: 'a list that is already sorted, which needs exactly 1 pass', cause: 'The first pass makes no swaps, so you should <code>break</code> straight after it — and that pass still counts as 1.' },
            { match: 'ends up sorted', checks: 'that the list itself is sorted afterwards', cause: 'Swap the items inside <code>items</code> (in place) with <code>items[j], items[j + 1] = items[j + 1], items[j]</code>.' },
            { match: '.', checks: 'the number of passes an early-exit bubble sort makes', cause: 'Count 1 each time the outer loop starts, and break after the first pass with no swaps.' }],
          tests: lists.map(l => P.t(`bubble_passes(${py.r(l)}) returns ${passes(l)}`, `bubble_passes(${py.r(l)})`, passes(l))).join('\n') + '\n' + P.tblock('the list ends up sorted', `a = ${py.r(lists[0])}\nbubble_passes(a)\nreturn a`, lists[0].slice().sort((x, y) => x - y)),
          banned: ban, hint: 'Use a swapped flag set to False at the start of each pass. If it is still False after the inner loop, break.'
        };
      }
      const fn = alg === 'bubble' ? 'bubble_sort' : 'selection_sort';
      const sortFn = l => l.slice().sort((x, y) => (desc ? y - x : x - y));
      const big = desc ? 'smaller' : 'bigger', cmp = desc ? '<' : '>';
      const sol = alg === 'bubble'
        ? `def bubble_sort(items):  # sorts items in place\n    n = len(items)  # number of items\n    for i in range(n - 1):  # n − 1 passes are always enough\n        for j in range(n - 1 - i):  # after pass i, the last i items are in place; also stops items[j + 1] going off the end\n            if items[j] ${cmp} items[j + 1]:  # left neighbour ${big}? Then they are in the wrong order for ${desc ? 'descending' : 'ascending'}\n                items[j], items[j + 1] = items[j + 1], items[j]  # swap both at once, so no value is lost\n    return items  # the same list, now sorted\n`
        : `def selection_sort(items):  # sorts items in place\n    n = len(items)  # number of items\n    for i in range(n - 1):  # fill positions 0 … n − 2; the last item is then in place\n        ${desc ? 'largest' : 'smallest'} = i  # index of the ${desc ? 'largest' : 'smallest'} item found so far\n        for j in range(i + 1, n):  # scan the unsorted part after i\n            if items[j] ${desc ? '>' : '<'} items[${desc ? 'largest' : 'smallest'}]:  # ${desc ? 'bigger' : 'smaller'} than the best so far?\n                ${desc ? 'largest' : 'smallest'} = j  # remember its index (not its value)\n        items[i], items[${desc ? 'largest' : 'smallest'}] = items[${desc ? 'largest' : 'smallest'}], items[i]  # one swap per pass, AFTER the scan\n    return items  # the same list, now sorted\n`;
      const think = alg === 'bubble'
        ? ['Bubble sort compares <b>neighbours</b>: <code>items[j]</code> and <code>items[j + 1]</code>, swapping them when they are in the wrong order.', `For ${desc ? 'descending' : 'ascending'} order, "wrong order" means the left one is ${big}, so the test is <code>items[j] ${cmp} items[j + 1]</code>.`, 'An outer loop repeats the pass n − 1 times; the inner loop stops at <code>n - 1 - i</code> so <code>j + 1</code> never goes past the end.', 'Swap with a tuple assignment (or a temporary variable) so neither value is lost, then return the list.']
        : [`Selection sort fills one position per pass: position i gets the ${desc ? 'largest' : 'smallest'} item from i onwards.`, `Find it by remembering an <b>index</b>: start with i, and update it whenever <code>items[j]</code> is ${desc ? 'bigger' : 'smaller'}.`, 'Only after the inner loop has scanned the whole unsorted part, swap that item into position i — one swap per pass.', 'Return the list at the end.'];
      const nm = desc ? 'largest' : 'smallest';
      const diagnose = alg === 'bubble' ? [
        { match: '.', when: 'for\\s+j\\s+in\\s+range\\(\\s*(n|len\\(items\\))\\s*\\)', checks: 'sorting without going past the end of the list', cause: 'When j reaches the last index, <code>items[j + 1]</code> is out of range. Make the inner loop <code>range(n - 1 - i)</code>.' },
        { match: '.', when: '^\\s*items\\[j\\]\\s*=\\s*items\\[j\\s*\\+\\s*1\\]\\s*\\n\\s*items\\[j\\s*\\+\\s*1\\]\\s*=\\s*items\\[j\\]\\s*$', checks: 'swapping two items', cause: 'After <code>items[j] = items[j + 1]</code> the old value is gone, so both end up the same. Swap both at once: <code>items[j], items[j + 1] = items[j + 1], items[j]</code>.' },
        { match: '.', when: desc ? 'items\\[j\\]\\s*>\\s*items\\[j\\s*\\+\\s*1\\]' : 'items\\[j\\]\\s*<\\s*items\\[j\\s*\\+\\s*1\\]', checks: `${desc ? 'descending' : 'ascending'} order`, cause: `Your comparison sorts the other way. For ${desc ? 'descending' : 'ascending'} order, swap when <code>items[j] ${cmp} items[j + 1]</code>.` },
        { match: '.', when: '(?<![\\s\\S])(?![\\s\\S]*\\breturn\\b)', checks: 'the list the function returns', cause: 'Sort in place, then <code>return items</code> at the end.' },
        { match: '.', checks: `sorting into ${desc ? 'descending' : 'ascending'} order`, cause: 'Use two nested loops: repeat the pass n − 1 times, comparing and swapping neighbours each pass.' }] : [
        { match: '.', when: '^\\s{12,}items\\[i\\]\\s*,', checks: 'one swap per pass', cause: 'Your swap is inside the inner loop, so it happens before the scan is finished. Move it out to line up with the inner <code>for</code>.' },
        { match: '.', when: `${nm}\\s*=\\s*items\\[`, checks: `remembering where the ${nm} item is`, cause: `Store the <b>index</b>: <code>${nm} = i</code> and <code>${nm} = j</code>, not the value <code>items[j]</code>, so you know which positions to swap.` },
        { match: '.', when: '(?<![\\s\\S])(?![\\s\\S]*\\breturn\\b)', checks: 'the list the function returns', cause: 'Sort in place, then <code>return items</code> at the end.' },
        { match: '.', checks: `sorting into ${desc ? 'descending' : 'ascending'} order`, cause: `For each i, find the index of the ${nm} item from i onwards (compare with <code>${desc ? '&gt;' : '&lt;'}</code>), then swap it into position i after the scan.` }];
      return {
        prompt: `Write <code>${fn}(items)</code> using <strong>${alg} sort</strong> to sort the list into <strong>${desc ? 'descending' : 'ascending'}</strong> order, in place, and return it.`,
        starter: `def ${fn}(items):\n    pass\n`, solution: sol, think, diagnose,
        tests: lists.map(l => P.t(`${fn}(${py.r(l)}) returns ${py.r(sortFn(l))}`, `${fn}(${py.r(l)})`, sortFn(l))).join('\n'),
        banned: ban, hint: alg === 'bubble' ? `Two nested loops: compare items[j] with items[j + 1] and swap them if they are in the wrong order for ${desc ? 'descending' : 'ascending'}.` : `For each position i, find the index of the ${desc ? 'largest' : 'smallest'} item from i onwards, then swap it into position i.`
      };
    } }
  ]);
})(CodeCraft.practice);
