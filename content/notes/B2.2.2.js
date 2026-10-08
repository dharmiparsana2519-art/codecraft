/* "Build it from scratch" notes — B2.2.2 1D and 2D lists. Format: see widgets/notes.js. */
CodeCraft.addNotes('B2.2.2', {
  intro: `<p>A <span class="term">list</span> stores many values under one name, each at an index from 0. A <b>1D list</b> is one row of values; a <b>2D list</b> is a list of lists — a grid, where <code>grid[r][c]</code> is row r, column c (a seating plan, a table of marks).</p>
  <p>The list methods you need: <code>append(x)</code> adds to the end, <code>insert(i, x)</code> puts x at index i, <code>remove(x)</code> deletes the first x, <code>pop(i)</code> removes and returns the item at index i (the last one if you give no index). To <b>traverse</b> a list is to visit every item with a loop.</p>`,
  programs: [
    {
      title: 'A waiting list for the cooking club',
      goal: `<p>The cooking club keeps a waiting list. Add and remove students as described below, serve the first one, then show the list with each student's position.</p>`,
      input: `the list <code>["Aiko", "Ben"]</code>, then: Carla joins the end; Dev is given priority (front); Ben leaves; the first student is served`,
      output: `who was served, who is still waiting, and their positions`,
      think: [
        `Each change is one list method: joining the end is <code>append</code>, going to the front is <code>insert(0, …)</code>, leaving is <code>remove</code>, serving the first is <code>pop(0)</code>.`,
        `Each method changes the list itself (lists are mutable — unlike strings). <code>pop</code> also <b>returns</b> the item it removed, so store it.`,
        `Index 0 is the front and index -1 is the end.`,
        `To show positions, traverse with indexes: <code>for i in range(len(waiting))</code>.`
      ],
      works: `each method updates the same list in place, so after each line the list is exactly the queue described so far. The indexes then give each student's position.`,
      vars: [
        ['waiting', 'list of str', 'the waiting list; changed in place by each method'],
        ['served', 'str', 'the student <code>pop(0)</code> removed and returned'],
        ['i', 'int', 'an index, used to show positions']
      ],
      code: `waiting = ["Aiko", "Ben"]
waiting.append("Carla")
waiting.insert(0, "Dev")
waiting.remove("Ben")
served = waiting.pop(0)
print("Served:", served)
print("Still waiting:", waiting)
print("Next:", waiting[0], "- Last:", waiting[-1])
for i in range(len(waiting)):
    print(i, waiting[i])`,
      out: `Served: Dev\nStill waiting: ['Aiko', 'Carla']\nNext: Aiko - Last: Carla\n0 Aiko\n1 Carla`,
      build: [
        { add: 1, why: `A list literal: square brackets, items separated by commas.`, missing: `Every later line crashes with a <code>NameError</code>.` },
        { add: 2, why: `Carla joins the <b>end</b>: <code>['Aiko', 'Ben', 'Carla']</code>.`, missing: `Carla never joins.` },
        { add: 3, why: `Dev goes to index 0, the front. Everyone else moves up one: <code>['Dev', 'Aiko', 'Ben', 'Carla']</code>.`, missing: `With <code>insert(1, …)</code> Dev would be second, not first (see mistake 3).` },
        { add: 4, why: `Remove Ben by <b>value</b> — you don't need to know his index.`, missing: `<code>remove</code> of a name that isn't in the list crashes with a <code>ValueError</code> (see mistake 1).` },
        { add: 5, why: `<code>pop(0)</code> removes the first student <b>and</b> returns them, so we store who was served.`, missing: `<code>pop()</code> with no index removes the <b>last</b> student (see mistake 2).` },
        { add: 6, why: `Who was served.`, missing: `The returned value is stored but never shown.` },
        { add: 7, why: `Printing a list shows it with brackets and quotes.`, missing: `You couldn't see the list.` },
        { add: 8, why: `Index 0 is the front; index -1 is always the last item, whatever the length.`, missing: `<code>waiting[len(waiting)]</code> for the last item is one past the end (see mistake 4).` },
        { add: 9, why: `Traverse by index: <code>range(len(waiting))</code> is 0, 1.`, missing: `Without the loop you'd need one print per student.` },
        { add: 10, why: `Show each index with its student.`, missing: `The loop would have no body.` }
      ],
      trace: {
        cols: ['waiting', 'served', 'i'],
        note: `<code>waiting</code> changes on every one of lines 2–5, without being reassigned: the methods change the list itself.`
      },
      mistakes: [
        { title: 'Removing someone who isn\'t there', bad: 2, code: `waiting = ["Aiko", "Carla"]
waiting.remove("Ben")
print(waiting)`, error: 'ValueError', errorText: 'list.remove(x): x not in list',
          why: `<code>remove</code> crashes if the value isn't in the list. Check first: <code>if "Ben" in waiting:</code>.` },
        { title: 'pop() with no index', bad: 5, code: `waiting = ["Aiko", "Ben"]
waiting.append("Carla")
waiting.insert(0, "Dev")
waiting.remove("Ben")
served = waiting.pop()
print("Served:", served)`, out: `Served: Carla`,
          why: `<code>pop()</code> takes from the <b>end</b>. To serve the first in line, use <code>pop(0)</code>.` },
        { title: 'Inserting at the wrong index', bad: 3, code: `waiting = ["Aiko", "Ben"]
waiting.append("Carla")
waiting.insert(1, "Dev")
waiting.remove("Ben")
served = waiting.pop(0)
print("Served:", served)
print("Still waiting:", waiting)`, out: `Served: Aiko\nStill waiting: ['Dev', 'Carla']`,
          why: `Indexes start at 0, so index 1 is the <b>second</b> place. The front is <code>insert(0, …)</code>.` },
        { title: 'Using the length as the last index', bad: 2, code: `waiting = ["Aiko", "Carla"]
print(waiting[len(waiting)])`, error: 'IndexError', errorText: 'list index out of range',
          why: `A list of 2 items has indexes 0 and 1. <code>len(waiting)</code> is 2, one past the end. The last item is <code>waiting[len(waiting) - 1]</code>, or simply <code>waiting[-1]</code>.` }
      ],
      nobuiltins: {
        ban: ['len'],
        intro: `<p>If <code>len</code> is banned, traverse with a <code>for</code> loop over the items and count the position yourself:</p>`,
        code: `waiting = ["Aiko", "Ben"]
waiting.append("Carla")
waiting.insert(0, "Dev")
waiting.remove("Ben")
served = waiting.pop(0)
print("Served:", served)
print("Still waiting:", waiting)
print("Next:", waiting[0], "- Last:", waiting[-1])
i = 0
for name in waiting:
    print(i, name)
    i = i + 1`,
        out: `Served: Dev\nStill waiting: ['Aiko', 'Carla']\nNext: Aiko - Last: Carla\n0 Aiko\n1 Carla`,
        changes: [
          `<code>for i in range(len(waiting))</code> becomes <code>for name in waiting</code>: visit the items directly.`,
          `A counter <code>i = 0</code> before the loop and <code>i = i + 1</code> at the end of it keeps the position.`,
          `<code>waiting[i]</code> becomes <code>name</code>.`
        ]
      },
      tip: `Paper 2 often asks what a list holds after a series of operations. Write the list out after <b>every</b> line, like a trace table, and remember: <code>insert</code> shifts later items up, <code>remove</code> deletes the first match only, and <code>pop</code> returns the item it removes.`
    },
    {
      title: 'Row and column totals in a marks table',
      goal: `<p>A 2D list holds three students' marks on three tests: one row per student, one column per test. Print each student's total (row totals) and each test's total (column totals).</p>`,
      input: `<code>marks = [[72, 65, 80], [58, 91, 77], [64, 70, 85]]</code> and the names`,
      output: `three row totals, then three column totals`,
      think: [
        `<code>marks[r]</code> is one student's row (a list); <code>marks[r][c]</code> is one mark.`,
        `Row totals: an outer loop over the rows, and inside it a running total over that row's columns — a <b>nested loop</b>.`,
        `Reset the total to 0 <b>for each row</b> (inside the outer loop), and print it after the inner loop.`,
        `Column totals: swap the loops — outer over the columns, inner over the rows — still reading <code>marks[r][c]</code>.`
      ],
      works: `the inner loop visits every mark in one row (or column) exactly once while the outer loop holds r (or c) still, so each total covers exactly one row (or column).`,
      vars: [
        ['names', 'list of str', 'the student in each row'],
        ['marks', '2D list of int', 'a list of rows; each row is a list of marks'],
        ['r', 'int', 'row index (which student)'],
        ['c', 'int', 'column index (which test)'],
        ['total', 'int', 'the running total for one row or column']
      ],
      code: `names = ["Aiko", "Ben", "Carla"]
marks = [[72, 65, 80], [58, 91, 77], [64, 70, 85]]
for r in range(len(marks)):
    total = 0
    for c in range(len(marks[r])):
        total = total + marks[r][c]
    print(names[r], "total:", total)
for c in range(len(marks[0])):
    total = 0
    for r in range(len(marks)):
        total = total + marks[r][c]
    print("Test", c + 1, "total:", total)`,
      out: `Aiko total: 217\nBen total: 226\nCarla total: 219\nTest 1 total: 194\nTest 2 total: 226\nTest 3 total: 242`,
      build: [
        { add: 1, why: `Who each row belongs to.`, missing: `<code>names[r]</code> crashes with a <code>NameError</code>.` },
        { add: 2, why: `The 2D list: three rows of three marks. <code>marks[1]</code> is Ben's row, <code>[58, 91, 77]</code>.`, missing: `Nothing to add up.` },
        { add: 3, why: `Outer loop: one pass per row (student). <code>len(marks)</code> is the number of rows.`, missing: `Only one student's total could be worked out.` },
        { add: 4, why: `Each row gets its own total, so reset it at the start of every row.`, missing: `Above the outer loop, totals pile up from row to row (see mistake 1).` },
        { add: 5, why: `Inner loop: one pass per column in this row.`, missing: `Only one mark per row would be added.` },
        { add: 6, why: `Row r, column c. The row comes first.`, missing: `<code>marks[c][r]</code> reads down a column instead (see mistake 2).` },
        { add: 7, why: `After the inner loop, this row's total is finished. Indented under the <b>outer</b> loop only.`, missing: `One level deeper, it prints after every single mark.` },
        { add: 8, why: `Now the columns: <code>len(marks[0])</code> is the length of a row = the number of columns.`, missing: `No column totals.` },
        { add: 9, why: `Reset for each column.`, missing: `The column totals would carry on from the last row total.` },
        { add: 10, why: `Inner loop over the rows, so we move <b>down</b> the column.`, missing: `Only one mark per column would be added.` },
        { add: 11, why: `Still <code>marks[r][c]</code> — row first — but now c stays fixed while r changes.`, missing: `The total stays 0.` },
        { add: 12, why: `<code>c + 1</code> so the tests are numbered from 1 for people, while the indexes start at 0.`, missing: `Column totals are never shown.` }
      ],
      trace: {
        code: `names = ["Aiko", "Ben"]
marks = [[72, 65], [58, 91]]
for r in range(len(marks)):
    total = 0
    for c in range(len(marks[r])):
        total = total + marks[r][c]
    print(names[r], "total:", total)`,
        cols: ['r', 'c', 'total'],
        note: `A smaller 2 × 2 table so the rows fit: for each value of <code>r</code>, <code>c</code> runs through 0 and 1 before <code>r</code> moves on. The inner loop finishes completely on every pass of the outer loop.`
      },
      mistakes: [
        { title: 'Resetting the total in the wrong place', bad: 3, code: `names = ["Aiko", "Ben", "Carla"]
marks = [[72, 65, 80], [58, 91, 77], [64, 70, 85]]
total = 0
for r in range(len(marks)):
    for c in range(len(marks[r])):
        total = total + marks[r][c]
    print(names[r], "total:", total)`, out: `Aiko total: 217\nBen total: 443\nCarla total: 662`,
          why: `The total is set to 0 once, before all the rows, so each student's total includes everyone before them. Reset it at the start of each row.` },
        { title: 'Row and column swapped', bad: 6, code: `names = ["Aiko", "Ben", "Carla"]
marks = [[72, 65, 80], [58, 91, 77], [64, 70, 85]]
for r in range(len(marks)):
    total = 0
    for c in range(len(marks[r])):
        total = total + marks[c][r]
    print(names[r], "total:", total)`, out: `Aiko total: 194\nBen total: 226\nCarla total: 242`,
          why: `<code>marks[c][r]</code> reads row c, column r — down a column. On a square table it runs without an error, but these are the <b>test</b> totals. The first index is always the row.` },
        { title: 'Indexing with a comma', bad: 2, code: `marks = [[72, 65, 80], [58, 91, 77], [64, 70, 85]]
print(marks[1, 2])`, error: 'TypeError', errorText: 'list indices must be integers or slices, not tuple',
          why: `<code>marks[1, 2]</code> is not how Python indexes a 2D list. Use two sets of brackets: <code>marks[1][2]</code> — first the row, then the item in that row.` },
        { title: 'Printing inside the inner loop', bad: 7, code: `names = ["Aiko", "Ben"]
marks = [[72, 65], [58, 91]]
for r in range(len(marks)):
    total = 0
    for c in range(len(marks[r])):
        total = total + marks[r][c]
        print(names[r], "total:", total)`, out: `Aiko total: 72\nAiko total: 137\nBen total: 58\nBen total: 149`,
          why: `Indented under the inner loop, the print runs after every mark, showing totals that aren't finished yet. Line it up with the inner <code>for</code>.` }
      ],
      nobuiltins: {
        ban: ['len', 'sum'],
        intro: `<p>We never used <code>sum</code> (with it, a row total is <code>sum(marks[r])</code>). If <code>len</code> is banned too, loop over the rows and marks directly, and use the table's known size for the columns:</p>`,
        code: `names = ["Aiko", "Ben", "Carla"]
marks = [[72, 65, 80], [58, 91, 77], [64, 70, 85]]
TESTS = 3
r = 0
for row in marks:
    total = 0
    for m in row:
        total = total + m
    print(names[r], "total:", total)
    r = r + 1
for c in range(TESTS):
    total = 0
    for row in marks:
        total = total + row[c]
    print("Test", c + 1, "total:", total)`,
        out: `Aiko total: 217\nBen total: 226\nCarla total: 219\nTest 1 total: 194\nTest 2 total: 226\nTest 3 total: 242`,
        changes: [
          `<code>for r in range(len(marks))</code> becomes <code>for row in marks</code>: each pass gets a whole row (a list).`,
          `<code>for c in range(len(marks[r]))</code> becomes <code>for m in row</code>, and <code>marks[r][c]</code> becomes <code>m</code>.`,
          `A counter <code>r</code> (start 0, add 1 at the end of each row) still finds the student's name.`,
          `For the columns, the number of tests is stored as a constant, <code>TESTS = 3</code> — exam questions that ban <code>len</code> usually tell you the size. Then <code>row[c]</code> is the mark in column c.`
        ]
      },
      tip: `2D-list construct questions usually give marks for: nested loops with the right ranges, resetting the total in the right place, correct indexing <code>[row][col]</code>, and output in the right place. Say which index is the row in your answer if the question doesn't — then stay consistent.`
    }
  ]
});
