/* "Build it from scratch" notes — B2.1.4 Debugging. Format: see widgets/notes.js. */
CodeCraft.addNotes('B2.1.4', {
  intro: `<p>A <span class="term">bug</span> is a mistake that makes a program crash or give the wrong result. <b>Syntax errors</b> stop it starting; <b>runtime errors</b> crash it while it runs; <b>logic errors</b> are the sneaky ones — it runs, but the answer is wrong.</p>
  <p>Three ways to find a logic error: a <b>trace table</b> (work through the code by hand, writing down each variable as it changes), <b>print-statement debugging</b> (temporary <code>print</code> lines that show values as the program runs), and <b>breakpoints</b> with step-by-step execution (pause before a line and inspect the variables — the trace tables on this site work the same way). The programs below are correct; the "common mistakes" are the bugs these techniques catch.</p>`,
  programs: [
    {
      title: 'Find the lowest mark — with a debug print',
      goal: `<p>Find the lowest mark in a list. While developing it, add a temporary <code>DEBUG</code> line that shows the values each time round the loop, so any logic error is easy to spot.</p>`,
      input: `<code>marks = [64, 81, 47, 90]</code>`,
      output: `four DEBUG lines, then <code>Lowest: 47</code>`,
      think: [
        `This is the minimum pattern: keep the lowest value so far, starting with the first mark.`,
        `Compare each mark with it, and replace it when a smaller one appears.`,
        `Add a print <b>inside</b> the loop, <b>before</b> the comparison, showing <code>m</code> and <code>lowest</code>. Each line of output is then one row of a trace table, made by the computer.`,
        `When the program works, delete the DEBUG line — it isn't part of the answer.`
      ],
      works: `<code>lowest</code> only ever moves down to a value from the list, and every mark is compared with it, so at the end it is the smallest. The DEBUG output lets you check that claim row by row.`,
      vars: [
        ['marks', 'list of int', 'the data'],
        ['lowest', 'int', 'the smallest mark seen so far'],
        ['m', 'int', 'the mark being looked at']
      ],
      code: `marks = [64, 81, 47, 90]
lowest = marks[0]
for m in marks:
    print("DEBUG: m =", m, "lowest =", lowest)
    if m < lowest:
        lowest = m
print("Lowest:", lowest)`,
      out: `DEBUG: m = 64 lowest = 64\nDEBUG: m = 81 lowest = 64\nDEBUG: m = 47 lowest = 64\nDEBUG: m = 90 lowest = 47\nLowest: 47`,
      build: [
        { add: 1, why: `The data.`, missing: `<code>NameError</code> on the next line.` },
        { add: 2, why: `Start with a real value from the list.`, missing: `Starting at 0 instead, nothing is ever lower, so the answer is 0 (see mistake 1). The DEBUG line would show <code>lowest = 0</code> on every row — the clue.` },
        { add: 3, why: `Visit every mark.`, missing: `Only the first mark is considered.` },
        { add: 4, why: `The debug line: it shows the values <b>before</b> the comparison on each pass. Label it so it can't be mistaken for real output.`, missing: `The program still works — but when it doesn't, you have no idea which pass went wrong.` },
        { add: 5, why: `Is this mark lower than the lowest so far?`, missing: `<code>&gt;</code> here would find the highest mark (see mistake 2).` },
        { add: 6, why: `Yes: remember it.`, missing: `<code>==</code> instead of <code>=</code> compares and throws the answer away (see mistake 4).` },
        { add: 7, why: `The real output, after the loop.`, missing: `The answer is never shown.` }
      ],
      trace: {
        cols: ['m', 'lowest'],
        note: `Compare this table with the DEBUG lines in the output: they record the same values. That's why a debug print is like a trace table the computer writes for you.`
      },
      mistakes: [
        { title: 'Starting the minimum at 0', bad: 2, code: `marks = [64, 81, 47, 90]
lowest = 0
for m in marks:
    print("DEBUG: m =", m, "lowest =", lowest)
    if m < lowest:
        lowest = m
print("Lowest:", lowest)`, out: `DEBUG: m = 64 lowest = 0\nDEBUG: m = 81 lowest = 0\nDEBUG: m = 47 lowest = 0\nDEBUG: m = 90 lowest = 0\nLowest: 0`,
          why: `The DEBUG lines show <code>lowest</code> stuck at 0, so the comparison is never <code>True</code>. Line 2 is the bug: start with <code>marks[0]</code>.` },
        { title: 'The comparison the wrong way round', bad: 5, code: `marks = [64, 81, 47, 90]
lowest = marks[0]
for m in marks:
    print("DEBUG: m =", m, "lowest =", lowest)
    if m > lowest:
        lowest = m
print("Lowest:", lowest)`, out: `DEBUG: m = 64 lowest = 64\nDEBUG: m = 81 lowest = 64\nDEBUG: m = 47 lowest = 81\nDEBUG: m = 90 lowest = 81\nLowest: 90`,
          why: `The third DEBUG line shows <code>lowest</code> going <b>up</b> to 81 — impossible for a minimum. So the condition is wrong: it should be <code>m &lt; lowest</code>.` },
        { title: 'Resetting inside the loop', bad: 4, code: `marks = [64, 81, 47, 90]
for m in marks:
    print("DEBUG: m =", m)
    lowest = marks[0]
    if m < lowest:
        lowest = m
print("Lowest:", lowest)`, out: `DEBUG: m = 64\nDEBUG: m = 81\nDEBUG: m = 47\nDEBUG: m = 90\nLowest: 64`,
          why: `<code>lowest</code> is set back to 64 on every pass, so finding 47 is forgotten one pass later. Starting values belong <b>before</b> the loop.` },
        { title: '== where = was meant', bad: 5, code: `marks = [64, 81, 47, 90]
lowest = marks[0]
for m in marks:
    if m < lowest:
        lowest == m
print("Lowest:", lowest)`, out: `Lowest: 64`,
          why: `<code>lowest == m</code> is a comparison: it works out <code>True</code> or <code>False</code> and throws it away. Nothing is stored. A debug print after it would show <code>lowest</code> never changing.` }
      ],
      nobuiltins: {
        title: 'Built-ins: the short version, compared',
        intro: `<p>Our loop is the no-built-ins answer. With Python's <code>min</code> it is one line — but <code>min</code> is often banned, and a one-liner gives you nothing to debug:</p>`,
        code: `marks = [64, 81, 47, 90]
print("Lowest:", min(marks))`,
        out: `Lowest: 47`,
        changes: [
          `<code>min(marks)</code> replaces the starting value, the loop, the comparison and the update.`,
          `There's no DEBUG line: you can't see inside a built-in. That's one reason exams ask you to write the loop.`
        ]
      },
      tip: `"Identify the error" questions usually give one mark for the line number (or the line itself) and one for the correction — write the corrected line in full, e.g. "line 2 should be <code>lowest = marks[0]</code>". Explaining <b>why</b> it was wrong earns marks in "explain" questions.`
    },
    {
      title: 'Add up 1 to n — and find the off-by-one bug',
      goal: `<p>Add up the whole numbers from 1 to n (e.g. 1 + 2 + 3 + 4 = 10). Use a trace table to check that the loop runs exactly the right number of times.</p>`,
      input: `a whole number n, e.g. 4`,
      output: `<code>Sum of 1 to 4 is 10</code>`,
      think: [
        `Use a counter <code>i</code> that goes 1, 2, 3, … n, and a running total.`,
        `Loop while <code>i &lt;= n</code> — <b>less than or equal</b>, because n itself must be added.`,
        `Inside the loop: add <code>i</code> to the total, then move <code>i</code> on by 1.`,
        `Check the boundary with a trace table on a small n: does the last value added equal n?`
      ],
      works: `<code>i</code> takes every value from 1 to n exactly once before the condition fails (when i = n + 1), and each value is added once.`,
      vars: [
        ['n', 'int', 'the last number to add'],
        ['total', 'int', 'running total, starts at 0'],
        ['i', 'int', 'the counter: the next number to add']
      ],
      code: `n = int(input("Add up 1 to: "))
total = 0
i = 1
while i <= n:
    total = total + i
    i = i + 1
print("Sum of 1 to", n, "is", total)`,
      inputs: ['4'],
      out: `Add up 1 to: 4\nSum of 1 to 4 is 10`,
      build: [
        { add: 1, why: `Read n as an int.`, missing: `<code>NameError</code> in the condition.` },
        { add: 2, why: `Running total starts at 0.`, missing: `<code>NameError</code> when adding.` },
        { add: 3, why: `The first number to add is 1.`, missing: `<code>NameError</code> in the condition. (Starting at 0 still works — adding 0 changes nothing — but it does one extra pass.)` },
        { add: 4, expect: 'loops', why: `Keep going while <code>i</code> hasn't passed n. Run this stage: it never ends — nothing changes <code>i</code> yet.`, missing: `Without a loop, only one number is added.` },
        { add: 5, expect: 'loops', why: `Add the current number.`, missing: `The total stays 0.` },
        { add: 6, why: `Move on to the next number. Now the loop can end.`, missing: `An infinite loop (see mistake 3). Before line 5: you add 2 to n + 1 instead of 1 to n (see mistake 4).` },
        { add: 7, why: `After the loop, show the answer.`, missing: `The answer is never shown.` }
      ],
      trace: {
        inputs: ['3'],
        cols: ['n', 'total', 'i'],
        note: `The last condition row is <code>i &lt;= n</code> with i = 4 and n = 3: <code>False</code>. The values added were 1, 2 and 3 — exactly right. Writing this table is how you'd catch mistake 1.`
      },
      mistakes: [
        { title: 'Off by one: < instead of <=', bad: 4, code: `n = int(input("Add up 1 to: "))
total = 0
i = 1
while i < n:
    total = total + i
    i = i + 1
print("Sum of 1 to", n, "is", total)`, out: `Add up 1 to: 4\nSum of 1 to 4 is 6`,
          why: `When <code>i</code> is 4, <code>4 &lt; 4</code> is <code>False</code>, so 4 is never added: 1 + 2 + 3 = 6. A trace table shows the loop stopping one pass early — an <b>off-by-one error</b>.` },
        { title: 'Replacing the total instead of adding to it', bad: 5, code: `n = int(input("Add up 1 to: "))
total = 0
i = 1
while i <= n:
    total = i
    i = i + 1
print("Sum of 1 to", n, "is", total)`, out: `Add up 1 to: 4\nSum of 1 to 4 is 4`,
          why: `<code>total = i</code> overwrites the total each pass, so it ends as the last number. The trace table's total column would read 1, 2, 3, 4 instead of 1, 3, 6, 10.` },
        { title: 'Forgetting to move the counter on', code: `n = int(input("Add up 1 to: "))
total = 0
i = 1
while i <= n:
    total = total + i
print("Sum of 1 to", n, "is", total)`, loops: true,
          why: `<code>i</code> is 1 for ever, so <code>i &lt;= n</code> never becomes <code>False</code>. In a trace table you'd see the <code>i</code> column never change.` },
        { title: 'Updating the counter too early', bad: 5, code: `n = int(input("Add up 1 to: "))
total = 0
i = 1
while i <= n:
    i = i + 1
    total = total + i
print("Sum of 1 to", n, "is", total)`, out: `Add up 1 to: 4\nSum of 1 to 4 is 14`,
          why: `The same two lines in the wrong order: 2 + 3 + 4 + 5 = 14. The first value (1) is skipped and one past n is added.` }
      ],
      nobuiltins: {
        title: 'Built-ins: the short version, compared',
        intro: `<p>With built-ins, <code>sum</code> and <code>range</code> do it in one line:</p>`,
        code: `n = int(input("Add up 1 to: "))
print("Sum of 1 to", n, "is", sum(range(1, n + 1)))`,
        out: `Add up 1 to: 4\nSum of 1 to 4 is 10`,
        changes: [
          `<code>range(1, n + 1)</code> gives 1 to n — the <code>+ 1</code> is needed because a range stops <b>before</b> its end value (the same boundary as <code>&lt;=</code>).`,
          `<code>sum</code> replaces the total and the loop. If <code>sum</code> is banned, write the loop.`
        ]
      },
      tip: `To find an off-by-one error, trace with a tiny input (n = 1, 2 or 3) and check the <b>first</b> and <b>last</b> values the loop uses. In "complete the trace table" questions, add a row every time a variable changes, and show the final condition test that ends the loop.`
    }
  ]
});
