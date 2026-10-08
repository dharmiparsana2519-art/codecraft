/* "Build it from scratch" notes — B2.4.1 Big O. Format: see widgets/notes.js. */
CodeCraft.addNotes('B2.4.1', {
  intro: `<p><span class="term">Big O</span> describes how the work an algorithm does grows as the size of its input, <em>n</em>, grows. It ignores small details and keeps the shape: <b>O(1)</b> constant (the same work for any n), <b>O(log n)</b> logarithmic (n is halved each step), <b>O(n)</b> linear (one pass through the data), <b>O(n²)</b> quadratic (a loop over the data inside another).</p>
  <p><b>Time complexity</b> is about the number of steps; <b>space complexity</b> is about the extra memory. The way to see them is to <b>count operations</b> — so that's what the programs below do.</p>`,
  programs: [
    {
      title: 'Count the steps as n grows',
      goal: `<p>Write three functions that count how many times their innermost line runs for an input of size n: one with a single loop, one with a loop inside a loop, and one that halves n each time. Print the counts for n = 8, 16 and 32 and compare how they grow.</p>`,
      input: `n = 8, 16, 32 (each double the last)`,
      output: `a table: <code>8 3 8 64</code>, <code>16 4 16 256</code>, <code>32 5 32 1024</code>`,
      think: [
        `Each function keeps a counter, <code>steps</code>, and adds 1 every time its loop body runs — that is "counting operations".`,
        `One loop from 0 to n − 1 runs n times: O(n).`,
        `A loop of n inside a loop of n runs n × n times: O(n²).`,
        `Halving n until it reaches 1 takes about log₂ n steps: O(log n).`,
        `Doubling n each row shows the pattern: O(n) doubles, O(n²) quadruples, O(log n) goes up by just 1.`
      ],
      works: `the counter is increased exactly once per run of the innermost line, so <code>steps</code> is exactly the number of operations — the thing Big O describes.`,
      vars: [
        ['n', 'int', 'the input size (in <code>halving_steps</code> it is halved, so it changes)'],
        ['steps', 'int', 'local counter in each function'],
        ['i, j', 'int', 'loop counters — only used to repeat']
      ],
      code: `def linear_steps(n):
    steps = 0
    for i in range(n):
        steps = steps + 1
    return steps


def nested_steps(n):
    steps = 0
    for i in range(n):
        for j in range(n):
            steps = steps + 1
    return steps


def halving_steps(n):
    steps = 0
    while n > 1:
        n = n // 2
        steps = steps + 1
    return steps


print("n | O(log n) | O(n) | O(n²)")
for n in [8, 16, 32]:
    print(n, halving_steps(n), linear_steps(n), nested_steps(n))`,
      out: `n | O(log n) | O(n) | O(n²)\n8 3 8 64\n16 4 16 256\n32 5 32 1024`,
      build: [
        { add: 1, why: `A function that counts the work done by one loop over n items.`, missing: `<code>linear_steps(n)</code> crashes with a <code>NameError</code>.` },
        { add: 2, why: `The counter starts at 0.`, missing: `<code>steps + 1</code> crashes with an <code>UnboundLocalError</code>.` },
        { add: 3, why: `One pass: i = 0 … n − 1, so the body runs n times.`, missing: `Nothing is counted.` },
        { add: 4, why: `This line stands for "one operation" — count it.`, missing: `The count stays 0.` },
        { add: 5, why: `Return the count, after the loop.`, missing: `The function returns <code>None</code>.` },
        { add: 8, why: `A second function: a loop inside a loop.`, missing: `<code>nested_steps(n)</code> crashes with a <code>NameError</code>.` },
        { add: 9, why: `Its own counter.`, missing: `<code>steps + 1</code> crashes.` },
        { add: 10, why: `The outer loop runs n times…`, missing: `Only one pass of the inner loop: n steps, not n².` },
        { add: 11, why: `…and for <b>each</b> of those, the inner loop runs n times.`, missing: `It would be a single loop: O(n).` },
        { add: 12, why: `Count inside the <b>inner</b> loop, so it runs n × n times.`, missing: `Indented only under the outer loop, it runs n times (see mistake 3).` },
        { add: 13, why: `Return after both loops.`, missing: `Returns <code>None</code>.` },
        { add: 16, why: `A third function: halving.`, missing: `<code>halving_steps(n)</code> crashes with a <code>NameError</code>.` },
        { add: 17, why: `Its counter.`, missing: `<code>steps + 1</code> crashes.` },
        { add: 18, why: `Keep going while there is more than one item left.`, missing: `Nothing would be halved.` },
        { add: 19, why: `Halve n (integer division). 8 → 4 → 2 → 1.`, missing: `Without it, an infinite loop. Taking 2 away instead makes it O(n) (see mistake 1).` },
        { add: 20, why: `Count each halving.`, missing: `The count stays 0.` },
        { add: 21, why: `Return the count.`, missing: `Returns <code>None</code>.` },
        { add: 24, why: `A heading for the table of results.`, missing: `The numbers would be harder to read.` },
        { add: 25, why: `Try n = 8, then double it twice.`, missing: `Nothing is tested.` },
        { add: 26, why: `One row per n. Compare down each column: +1 each time; ×2 each time; ×4 each time.`, missing: `The functions would never be called.` }
      ],
      trace: {
        code: `def halving_steps(n):
    steps = 0
    while n > 1:
        n = n // 2
        steps = steps + 1
    return steps


print(halving_steps(16))`,
        cols: ['n', 'steps'],
        note: `16 → 8 → 4 → 2 → 1 takes 4 steps, and 2⁴ = 16. That is what log₂ 16 = 4 means: how many times you can halve before reaching 1.`
      },
      mistakes: [
        { title: 'Taking 2 away instead of halving', bad: 4, code: `def halving_steps(n):
    steps = 0
    while n > 1:
        n = n - 2
        steps = steps + 1
    return steps


for n in [8, 16, 32]:
    print(n, halving_steps(n))`, out: `8 4\n16 8\n32 16`,
          why: `Subtracting removes a fixed amount each time, so the steps grow in proportion to n: O(n). Only <b>dividing</b> the problem size each step gives O(log n).` },
        { title: 'Assuming every nested loop is O(n²)', bad: 4, code: `def steps(n):
    count = 0
    for i in range(n):
        for j in range(3):
            count = count + 1
    return count


for n in [8, 16, 32]:
    print(n, steps(n))`, out: `8 24\n16 48\n32 96`,
          why: `The inner loop always runs 3 times, whatever n is, so the total is 3n — it doubles when n doubles: O(n). It's only O(n²) when <b>both</b> loops depend on n.` },
        { title: 'Counting in the outer loop', bad: 6, code: `def nested_steps(n):
    steps = 0
    for i in range(n):
        for j in range(n):
            pass
        steps = steps + 1
    return steps


print(nested_steps(8))`, out: `8`,
          why: `The counter is indented under the outer loop only, so it counts n passes, not the n × n inner steps. The work still happened — the count just doesn't measure it. Count where the work is.` },
        { title: 'Loops one after another are not nested', code: `def steps(n):
    count = 0
    for i in range(n):
        count = count + 1
    for j in range(n):
        count = count + 1
    return count


for n in [8, 16, 32]:
    print(n, steps(n))`, out: `8 16\n16 32\n32 64`,
          why: `Two loops in <b>sequence</b> add: n + n = 2n, which is still O(n) — Big O ignores the constant 2. Only loops <b>inside</b> each other multiply.` }
      ],
      nobuiltins: { none: `Nothing to change: counting steps only needs loops and arithmetic.` },
      tip: `To state a Big O from code: find the loops, ask how many times each runs <b>in terms of n</b>, multiply nested ones and add ones in sequence, then keep only the fastest-growing term and drop constants (3n + 5 → O(n)). In an "explain" answer, give the reason, e.g. "a nested loop over the n items, so about n × n comparisons".`
    },
    {
      title: 'Same answer, different Big O: adding 1 to n',
      goal: `<p>Add up 1 + 2 + … + n in two ways: with a loop, and with the formula n(n + 1) ÷ 2. Show they agree, and compare how much work each does.</p>`,
      input: `n = 10, 100, 1000`,
      output: `<code>10 55 55</code>, <code>100 5050 5050</code>, <code>1000 500500 500500</code>`,
      think: [
        `The loop version adds each number in turn: n additions, so O(n) time.`,
        `The formula version does one multiplication, one addition and one division, whatever n is: O(1) time.`,
        `Both only need a couple of variables, whatever n is: O(1) space. (Building a list of all n numbers first would need O(n) space.)`,
        `Use <code>//</code> in the formula: n(n + 1) is always even, so the answer is a whole number, and <code>//</code> keeps it an int.`
      ],
      works: `pairing the numbers — 1 + n, 2 + (n − 1), … — gives n/2 pairs that each add to n + 1, so the total is n(n + 1)/2. The loop gets the same total by brute force.`,
      vars: [
        ['n', 'int', 'how many numbers to add'],
        ['total', 'int', 'running total in the loop version'],
        ['i', 'int', 'the number being added: 1 to n']
      ],
      code: `def sum_loop(n):
    total = 0
    for i in range(1, n + 1):
        total = total + i
    return total


def sum_formula(n):
    return n * (n + 1) // 2


for n in [10, 100, 1000]:
    print(n, sum_loop(n), sum_formula(n))`,
      out: `10 55 55\n100 5050 5050\n1000 500500 500500`,
      build: [
        { add: 1, why: `The loop version.`, missing: `<code>sum_loop(n)</code> crashes with a <code>NameError</code>.` },
        { add: 2, why: `Running total.`, missing: `<code>total + i</code> crashes.` },
        { add: 3, why: `1 to n: <code>range</code> stops <b>before</b> its end, so the end is n + 1.`, missing: `<code>range(1, n)</code> leaves out n (see mistake 2).` },
        { add: 4, why: `n additions in total — this line is why the loop version is O(n).`, missing: `The total stays 0.` },
        { add: 5, why: `Return after the loop.`, missing: `Inside the loop, it returns after adding just 1 (see mistake 4).` },
        { add: 8, why: `The formula version.`, missing: `<code>sum_formula(n)</code> crashes with a <code>NameError</code>.` },
        { add: 9, why: `One calculation, the same for every n: O(1). The brackets make Python add 1 to n before multiplying.`, missing: `Without brackets, <code>n * n + 1 // 2</code> means n² + 0 (see mistake 3). With <code>/</code>, the answer is a float (see mistake 1).` },
        { add: 12, why: `Try sizes 10, 100 and 1000.`, missing: `Nothing is tested.` },
        { add: 13, why: `Both columns agree — but the loop did 1000 additions for the last row, the formula still did one calculation.`, missing: `The functions would never be called.` }
      ],
      trace: {
        code: `def sum_loop(n):
    total = 0
    for i in range(1, n + 1):
        total = total + i
    return total


def sum_formula(n):
    return n * (n + 1) // 2


print(sum_loop(4), sum_formula(4))`,
        cols: ['n', 'i', 'total'],
        note: `<code>sum_loop(4)</code> needs a row for every value of i; <code>sum_formula(4)</code> needs only line 9. Make n bigger and the loop's table gets longer, while the formula's stays the same.`
      },
      mistakes: [
        { title: '/ instead of //', bad: 2, code: `def sum_formula(n):
    return n * (n + 1) / 2


print(sum_formula(10))`, out: `55.0`,
          why: `<code>/</code> always gives a float. The value is right, but it prints as 55.0. Use <code>//</code> when the answer must be a whole number.` },
        { title: 'Stopping one short', bad: 3, code: `def sum_loop(n):
    total = 0
    for i in range(1, n):
        total = total + i
    return total


print(sum_loop(10))`, out: `45`,
          why: `<code>range(1, 10)</code> is 1 to 9 — the end value is never included. That's 10 short. Use <code>range(1, n + 1)</code>.` },
        { title: 'Missing brackets in the formula', bad: 2, code: `def sum_formula(n):
    return n * n + 1 // 2


print(sum_formula(10))`, out: `100`,
          why: `Python does <code>*</code> and <code>//</code> before <code>+</code>, so this is n × n + (1 // 2) = 100 + 0. Brackets force <code>n + 1</code> to be worked out first.` },
        { title: 'Returning inside the loop', bad: 5, code: `def sum_loop(n):
    total = 0
    for i in range(1, n + 1):
        total = total + i
        return total


print(sum_loop(10))`, out: `1`,
          why: `<code>return</code> ends the function on the first pass, after adding 1. Line it up with the <code>for</code>.` }
      ],
      nobuiltins: {
        title: 'Built-ins: the short version, compared',
        intro: `<p>Python's <code>sum</code> can add a range in one line. It looks as short as the formula — but it is still O(n), because <code>sum</code> adds every number inside:</p>`,
        code: `def sum_builtin(n):
    return sum(range(1, n + 1))


for n in [10, 100, 1000]:
    print(n, sum_builtin(n))`,
        out: `10 55\n100 5050\n1000 500500`,
        changes: [
          `<code>sum(range(1, n + 1))</code> replaces the loop and the running total.`,
          `Fewer lines is <b>not</b> the same as fewer operations: this does n additions, like the loop. Only the formula is O(1).`,
          `If <code>sum</code> is banned, write the loop.`
        ]
      },
      tip: `"Compare the efficiency of two algorithms" answers usually earn marks for stating each Big O, saying <b>why</b> (n additions vs a fixed number of operations), and what that means as n grows (the loop takes 10 times as long for 10 times the data; the formula takes the same time). Mention space too if the question says "efficiency" — both here are O(1) space.`
    }
  ]
});
