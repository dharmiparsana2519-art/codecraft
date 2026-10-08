/* "Build it from scratch" notes — B2.3.3 Loops. Format: see widgets/notes.js. */
CodeCraft.addNotes('B2.3.3', {
  intro: `<p>A <span class="term">loop</span> repeats lines of code. IB calls a <code>for</code> loop a <b>counted loop</b>: it runs a known number of times, or once for each item in a list. A <code>while</code> loop is a <b>conditional loop</b>: it keeps going for as long as its condition is <code>True</code>, so you use it when you can't know in advance how many times it will run.</p>
  <p>Most exam loop questions are built from a few patterns: a <b>running total</b>, a <b>count</b>, the <b>largest</b> (or smallest) value, and an <b>input validation loop</b>. The three programs below build each pattern from nothing, one line at a time.</p>`,
  programs: [
    {
      title: 'Total, average and number of passes',
      goal: `<p>A teacher has a class's test marks in a list. Work out the total, the average, and how many students passed (a pass is <b>50 or more</b>).</p>`,
      input: `a list of whole-number marks, e.g. <code>[72, 45, 91, 58, 38]</code>`,
      output: `the total, the average and the number of passes`,
      think: [
        `The list has a fixed number of items and we need to look at <b>every</b> one, so this is a job for a <b>counted loop</b>: <code>for m in marks</code>.`,
        `Keep a <b>running total</b>: a variable that starts at 0 <em>before</em> the loop, and has each mark added to it <em>inside</em> the loop.`,
        `Keep a <b>count</b> of passes the same way: start at 0, and add 1 only when the mark passes — a condition inside the loop.`,
        `Only <em>after</em> the loop is the total complete, so work out the average and print the results there.`
      ],
      works: `the loop visits each mark exactly once, so every mark is added to the total once and tested for a pass once. Starting both variables at 0 means an empty list gives sensible answers too.`,
      vars: [
        ['marks', 'list of int', 'the data we are given'],
        ['total', 'int', 'the running total — must start at 0'],
        ['passed', 'int', 'counts the passes — also starts at 0'],
        ['m', 'int', 'the loop variable: holds one mark at a time'],
        ['average', 'float', '<code>/</code> always gives a float, e.g. 60.8']
      ],
      code: `marks = [72, 45, 91, 58, 38]
total = 0
passed = 0
for m in marks:
    total = total + m
    if m >= 50:
        passed = passed + 1
average = total / len(marks)
print("Total:", total)
print("Average:", average)
print("Passed:", passed)`,
      out: `Total: 304\nAverage: 60.8\nPassed: 3`,
      build: [
        { add: 1, why: `The data. Everything else works on this list.`, missing: `Every later line that uses <code>marks</code> crashes with a <code>NameError</code>.` },
        { add: 2, why: `The running total has to exist, and be 0, <em>before</em> the loop starts adding to it.`, missing: `Missing: <code>total = total + m</code> crashes with a <code>NameError</code>, because there is no total to add to. Inside the loop: it is reset to 0 every time round, so only the last mark survives (see mistake 1).` },
        { add: 4, why: `A counted loop: <code>m</code> takes each mark in turn — 72, then 45, and so on. The <code>pass</code> after it just holds the place until we write the body.`, missing: `Without a loop you would need one line per mark, and the program would only work for exactly five marks.` },
        { add: 5, why: `Add this mark to the total so far. The new total is the old total plus <code>m</code>.`, missing: `Written <code>total = m</code>, the total is replaced each time instead of growing. Not indented, it runs once, after the loop, and adds only the last mark.` },
        { add: 9, why: `Print the total. It is <b>not indented</b>, so it runs once, after the loop has finished. Run this stage: it prints <code>Total: 304</code>.`, missing: `Indented, it becomes part of the loop and prints a running total five times (see mistake 2).` },
        { add: 3, why: `A second counter, for passes. Like the total, it starts at 0 before the loop.`, missing: `<code>passed = passed + 1</code> would crash with a <code>NameError</code> the first time a mark passes.` },
        { add: 6, why: `A condition inside the loop tests each mark as it goes past. <code>&gt;=</code> because a mark of exactly 50 is a pass.`, missing: `Using <code>&gt;</code> instead, a mark of exactly 50 isn't counted (see mistake 4).` },
        { add: 7, why: `Count this pass. It is indented under the <code>if</code>, so it only runs when the mark is 50 or more.`, missing: `Indented only as far as the <code>if</code> line (not under it), it runs for every mark and <code>passed</code> becomes 5.` },
        { add: 11, why: `Print the count after the loop, when every mark has been checked.`, missing: `Without it, all the counting is done but never shown.` },
        { add: 8, why: `The average: total ÷ number of marks. <code>len(marks)</code> is 5. It goes after the loop because the total isn't finished until then. <code>/</code> gives a float.`, missing: `Before the loop, <code>total</code> is still 0, so the average is 0.0. With <code>//</code> you lose the decimal part: 60 instead of 60.8.` },
        { add: 10, why: `Show the average. Now the output is complete.`, missing: `The average would be worked out but never printed.` }
      ],
      trace: {
        code: `marks = [72, 45, 91]
total = 0
passed = 0
for m in marks:
    total = total + m
    if m >= 50:
        passed = passed + 1
average = total / len(marks)
print("Total:", total)
print("Average:", average)
print("Passed:", passed)`,
        cols: ['m', 'total', 'passed', 'average'],
        note: `Notice the rhythm of a counted loop: <code>m</code> gets the next mark, the total grows, the condition is tested — then round again. When there are no more marks the loop ends, and only then do the last four lines run.`
      },
      mistakes: [
        { title: 'Starting the total inside the loop', bad: 4, code: `marks = [72, 45, 91, 58, 38]
passed = 0
for m in marks:
    total = 0
    total = total + m
    if m >= 50:
        passed = passed + 1
print("Total:", total)
print("Passed:", passed)`, out: `Total: 38\nPassed: 3`,
          why: `<code>total = 0</code> runs every time round, wiping out what was added before. At the end it only holds the last mark, 38. Set starting values <b>before</b> the loop.` },
        { title: 'Printing inside the loop', bad: 5, code: `marks = [72, 45, 91, 58, 38]
total = 0
for m in marks:
    total = total + m
    print("Total:", total)`, out: `Total: 72\nTotal: 117\nTotal: 208\nTotal: 266\nTotal: 304`,
          why: `The <code>print</code> is indented, so it is part of the loop body and runs five times, showing the total at each stage. Indentation decides what is inside the loop.` },
        { title: 'Looping over the indexes but adding the index', bad: 4, code: `marks = [72, 45, 91, 58, 38]
total = 0
for m in range(len(marks)):
    total = total + m
print("Total:", total)`, out: `Total: 10`,
          why: `<code>range(len(marks))</code> gives the <em>indexes</em> 0, 1, 2, 3, 4 — not the marks. This adds 0 + 1 + 2 + 3 + 4 = 10. Either loop over the list itself (<code>for m in marks</code>) or use the index: <code>total = total + marks[m]</code>.` },
        { title: 'Using > when the boundary counts', bad: 4, code: `marks = [72, 50, 91, 58, 38]
passed = 0
for m in marks:
    if m > 50:
        passed = passed + 1
print("Passed:", passed)`, out: `Passed: 3`,
          why: `Four students passed — 50 is a pass — but <code>50 &gt; 50</code> is <code>False</code>. When the question says "50 or more", use <code>&gt;=</code>. Always test a value that sits exactly on the boundary.` }
      ],
      nobuiltins: {
        ban: ['sum', 'len'],
        intro: `<p>An exam may say "do not use built-in functions such as <code>sum</code> or <code>len</code>". We never used <code>sum</code> — the loop builds the total itself — but we did use <code>len</code>. Count the marks yourself instead:</p>`,
        code: `marks = [72, 45, 91, 58, 38]
total = 0
count = 0
passed = 0
for m in marks:
    total = total + m
    count = count + 1
    if m >= 50:
        passed = passed + 1
average = total / count
print("Total:", total)
print("Average:", average)
print("Passed:", passed)`,
        out: `Total: 304\nAverage: 60.8\nPassed: 3`,
        changes: [
          `<code>sum(marks)</code> would do the work of the running total. The loop with <code>total = total + m</code> is the no-built-ins way, so it stays.`,
          `New line <code>count = 0</code> before the loop: a counter for how many marks there are, replacing <code>len(marks)</code>.`,
          `New line <code>count = count + 1</code> inside the loop, <b>not</b> under the <code>if</code>: every mark adds 1, whether it passed or not.`,
          `<code>total / len(marks)</code> becomes <code>total / count</code>.`
        ]
      },
      tip: `In a "construct" question about a loop, marks are usually given for separate parts: setting the starting values <b>before</b> the loop, a loop that visits every item, the correct update (and condition) <b>inside</b> the loop, and the output or return <b>after</b> it. Write the start values even when they seem obvious — they are often a mark of their own.`
    },
    {
      title: 'The highest mark, and who scored it',
      goal: `<p>Two lists hold the students' names and their marks, in the same order (<b>parallel lists</b>). Find the highest mark and the name of the student who scored it.</p>`,
      input: `<code>names = ["Aiko", "Ben", "Carla", "Dev"]</code> and <code>marks = [64, 81, 77, 59]</code>`,
      output: `<code>Highest: 81 by Ben</code>`,
      think: [
        `This is the <b>maximum</b> pattern: remember the biggest value seen <em>so far</em>, and replace it whenever a bigger one comes along.`,
        `Start "the best so far" as the <b>first</b> mark — a real value from the list — not 0.`,
        `We also need the name, which sits at the <b>same index</b> in <code>names</code>. So loop over the indexes, <code>i</code>, and use <code>marks[i]</code> and <code>names[i]</code>.`,
        `Index 0 is already the starting best, so the loop can start at 1: <code>range(1, len(marks))</code>.`,
        `When a mark beats the best, update the mark <b>and</b> the name together. Print after the loop.`
      ],
      works: `after the loop has looked at index i, <code>best</code> is the largest of marks[0] … marks[i]. That is true at the start (only marks[0] seen) and stays true each time round, so at the end it is the largest of the whole list.`,
      vars: [
        ['names', 'list of str', 'who each mark belongs to'],
        ['marks', 'list of int', 'the marks, in the same order as the names'],
        ['best', 'int', 'the highest mark found so far'],
        ['best_name', 'str', 'the name that goes with <code>best</code>'],
        ['i', 'int', 'the index: we need the position to find the matching name']
      ],
      code: `names = ["Aiko", "Ben", "Carla", "Dev"]
marks = [64, 81, 77, 59]
best = marks[0]
best_name = names[0]
for i in range(1, len(marks)):
    if marks[i] > best:
        best = marks[i]
        best_name = names[i]
print("Highest:", best, "by", best_name)`,
      out: `Highest: 81 by Ben`,
      build: [
        { add: 1, why: `The names, in order.`, missing: `<code>names[0]</code> and <code>names[i]</code> crash with a <code>NameError</code>.` },
        { add: 2, why: `The marks. <code>marks[i]</code> belongs to <code>names[i]</code>.`, missing: `Nothing to search.` },
        { add: 3, why: `The best so far starts as the first mark. It is a real value from the list, so it works whatever the marks are.`, missing: `Starting at 0 instead breaks if every value is negative, e.g. temperatures (see mistake 1). Missing altogether, the comparison crashes with a <code>NameError</code>.` },
        { add: 4, why: `If the first student turns out to be the best, the loop never changes the name — so it must already be set to theirs.`, missing: `If Aiko had the top mark, the print would crash with a <code>NameError</code>.` },
        { add: 5, why: `Loop over the indexes 1, 2, 3. We need the index (not just the mark) to find the matching name. Index 0 is already the starting best.`, missing: `<code>range(len(marks))</code> also works — it just compares marks[0] with itself first. But <code>range(1, len(marks) + 1)</code> goes one past the end: <code>IndexError</code> (see mistake 3).` },
        { add: 6, why: `Is this mark bigger than the best so far? <code>&gt;</code> keeps the <em>first</em> student if two marks tie.`, missing: `<code>&lt;</code> would find the lowest mark. <code>&gt;=</code> would give a tie to the later student.` },
        { add: 7, why: `Yes: this is the new best mark.`, missing: `<code>best</code> stays 64, so every mark above 64 "wins" and the name ends up as the last of them.` },
        { add: 8, why: `Update the name at the <b>same index</b>, so the name and mark stay together. Indented under the <code>if</code>: only when there is a new best.`, missing: `Missing: the name stays "Aiko" (see mistake 2). Indented only under the <code>for</code>: the name changes every time round (see mistake 4).` },
        { add: 9, why: `After the loop every mark has been compared, so <code>best</code> really is the highest.`, missing: `Indented inside the loop, it prints a line for every index, most of them wrong.` }
      ],
      trace: {
        cols: ['i', 'best', 'best_name'],
        note: `<code>best</code> only changes when the condition is <code>True</code>. 77 is less than 81, so on the next row Carla doesn't replace Ben.`
      },
      mistakes: [
        { title: 'Starting the best at 0', bad: 2, code: `temps = [-4, -9, -2, -7]
best = 0
for t in temps:
    if t > best:
        best = t
print("Warmest:", best)`, out: `Warmest: 0`,
          why: `0 isn't in the list, but it is bigger than every value, so nothing ever replaces it. Starting with <code>temps[0]</code> gives the right answer, -2.` },
        { title: 'Updating the mark but not the name', bad: 7, code: `names = ["Aiko", "Ben", "Carla", "Dev"]
marks = [64, 81, 77, 59]
best = marks[0]
best_name = names[0]
for i in range(1, len(marks)):
    if marks[i] > best:
        best = marks[i]
print("Highest:", best, "by", best_name)`, out: `Highest: 81 by Aiko`,
          why: `The mark is right but the name was never updated, so it is still the first student's. Whenever you keep two pieces of data about "the best", update both at once.` },
        { title: 'Going one past the end', bad: 5, code: `names = ["Aiko", "Ben", "Carla", "Dev"]
marks = [64, 81, 77, 59]
best = marks[0]
best_name = names[0]
for i in range(1, len(marks) + 1):
    if marks[i] > best:
        best = marks[i]
        best_name = names[i]
print("Highest:", best, "by", best_name)`, error: 'IndexError', errorText: 'list index out of range',
          why: `The last index of a 4-item list is 3. <code>range(1, 5)</code> goes up to 4, and <code>marks[4]</code> doesn't exist. <code>range(a, b)</code> stops <b>before</b> b, so <code>range(1, len(marks))</code> is already right.` },
        { title: 'Updating the name outside the if', bad: 8, code: `names = ["Aiko", "Ben", "Carla", "Dev"]
marks = [64, 81, 77, 59]
best = marks[0]
best_name = names[0]
for i in range(1, len(marks)):
    if marks[i] > best:
        best = marks[i]
    best_name = names[i]
print("Highest:", best, "by", best_name)`, out: `Highest: 81 by Dev`,
          why: `<code>best_name = names[i]</code> is only indented under the <code>for</code>, so it runs every time round and ends as the last name. It must be inside the <code>if</code>, with the line that updates the mark.` }
      ],
      nobuiltins: {
        ban: ['max', 'len', 'index'],
        intro: `<p>With built-ins, this could be <code>best = max(marks)</code> and <code>best_name = names[marks.index(best)]</code>. Exams often ban <code>max</code> — our loop already does its job. If <code>len</code> is banned too, loop over the marks themselves and keep track of the position yourself:</p>`,
        code: `names = ["Aiko", "Ben", "Carla", "Dev"]
marks = [64, 81, 77, 59]
best = marks[0]
best_name = names[0]
i = 0
for m in marks:
    if m > best:
        best = m
        best_name = names[i]
    i = i + 1
print("Highest:", best, "by", best_name)`,
        out: `Highest: 81 by Ben`,
        changes: [
          `<code>max(marks)</code> is replaced by the loop and the <code>if m &gt; best</code> test — the maximum pattern.`,
          `<code>marks.index(best)</code> is replaced by remembering the name at the moment the best changes: <code>best_name = names[i]</code>.`,
          `<code>range(1, len(marks))</code> uses <code>len</code>, so instead loop over the marks with <code>for m in marks</code>…`,
          `…and count the position yourself: <code>i = 0</code> before the loop, <code>i = i + 1</code> at the <b>end</b> of the body. It must come after the <code>if</code>, so that <code>i</code> is still the position of <code>m</code> when the name is looked up.`
        ]
      },
      tip: `For a "find the largest/smallest" question, marks usually go to: starting with the first element (not 0), looping through every element, comparing and replacing correctly, keeping the matching name or index, and outputting <b>after</b> the loop. If the question bans <code>max</code> or <code>min</code>, using them usually scores nothing for that part.`
    },
    {
      title: 'Keep asking until the mark is valid',
      goal: `<p>A program asks a teacher to type a test mark. The mark must be a whole number from 0 to 100. If it isn't, show a message and ask again — as many times as it takes. At the end, say how many tries it took.</p>`,
      input: `marks typed at the keyboard, e.g. 150, then -5, then 72`,
      output: `a message for each invalid mark, then <code>Mark 72 accepted after 3 tries</code>`,
      think: [
        `We can't know how many tries it will take, so a counted loop won't do. This is a <b>conditional loop</b>: <code>while</code> the mark is invalid, ask again.`,
        `Ask once <b>before</b> the loop, so the condition has a mark to test (this first <code>input</code> is called a <em>priming read</em>).`,
        `Write the condition for an <b>invalid</b> mark: below 0 <b>or</b> above 100. The loop repeats while that is <code>True</code>.`,
        `Inside the loop, ask again. This line is what makes the condition able to become <code>False</code> — without it the loop never ends.`,
        `Count the tries as you go, and print once the loop has finished.`
      ],
      works: `the loop only ends when its condition is <code>False</code>, which means the mark is <b>not</b> below 0 and <b>not</b> above 100. So any mark that gets past the loop is valid — whatever the user typed before.`,
      vars: [
        ['mark', 'int', 'the latest mark typed; <code>int()</code> turns the typed text into a number'],
        ['tries', 'int', 'how many marks have been typed, starting at 1 for the first']
      ],
      code: `mark = int(input("Enter a mark (0-100): "))
tries = 1
while mark < 0 or mark > 100:
    print("Not valid - try again.")
    mark = int(input("Enter a mark (0-100): "))
    tries = tries + 1
print("Mark", mark, "accepted after", tries, "tries")`,
      inputs: ['150', '-5', '72'],
      out: `Enter a mark (0-100): 150\nNot valid - try again.\nEnter a mark (0-100): -5\nNot valid - try again.\nEnter a mark (0-100): 72\nMark 72 accepted after 3 tries`,
      build: [
        { add: 1, why: `The priming read: get a first mark so the loop has something to test. <code>input</code> always gives text, so <code>int()</code> converts it.`, missing: `The <code>while</code> line crashes with a <code>NameError</code>: <code>mark</code> doesn't exist yet (see mistake 3).` },
        { add: 2, why: `One mark has been typed so far, so the count starts at 1.`, missing: `<code>tries = tries + 1</code> crashes with a <code>NameError</code>. Starting at 0 instead, the count is one too low.` },
        { add: 3, expect: 'loops', why: `Repeat <b>while</b> the mark is invalid. Run this stage and type 150: it never stops, because nothing inside the loop changes <code>mark</code> yet. That's what line 5 will fix.`, missing: `With <code>and</code> instead of <code>or</code>, the condition can never be True (no number is both below 0 and above 100), so every mark is accepted (see mistake 2).` },
        { add: 4, expect: 'loops', why: `Tell the user what went wrong. It's indented, so it only runs when the mark is invalid. (Still an infinite loop — run it with 150 and watch the message repeat.)`, missing: `The user would be asked again with no idea why.` },
        { add: 5, why: `Ask again <b>inside</b> the loop. This is the line that can make the condition <code>False</code> and end the loop. Now this stage finishes.`, missing: `Missing: an infinite loop (see mistake 1). Put before the <code>print</code>, the message would come after the new question, which reads oddly.` },
        { add: 6, why: `Another mark has been typed: add 1 to the count.`, missing: `Every run reports "1 tries".` },
        { add: 7, why: `Not indented, so it runs once, after the loop. By then the mark must be valid.`, missing: `Indented, it would only run for invalid marks — and claim they were accepted.` }
      ],
      trace: {
        inputs: ['150', '72'],
        cols: ['mark', 'tries'],
        note: `The condition is tested before every pass of the loop. With 150 it is <code>True</code>, so the body runs; after 72 is typed it is <code>False</code>, and the program jumps to the last line.`
      },
      mistakes: [
        { title: 'Not asking again inside the loop', inputs: ['150'], code: `mark = int(input("Enter a mark (0-100): "))
tries = 1
while mark < 0 or mark > 100:
    print("Not valid - try again.")
    tries = tries + 1
print("Mark", mark, "accepted after", tries, "tries")`, loops: true,
          why: `Nothing in the loop body changes <code>mark</code>, so <code>mark &gt; 100</code> stays <code>True</code> for ever. A conditional loop must change something its condition depends on.` },
        { title: 'Joining the conditions with and', bad: 3, inputs: ['150'], code: `mark = int(input("Enter a mark (0-100): "))
tries = 1
while mark < 0 and mark > 100:
    print("Not valid - try again.")
    mark = int(input("Enter a mark (0-100): "))
    tries = tries + 1
print("Mark", mark, "accepted after", tries, "tries")`, out: `Enter a mark (0-100): 150\nMark 150 accepted after 1 tries`,
          why: `No number is below 0 <b>and</b> above 100 at the same time, so the condition is always <code>False</code> and the loop never runs. An invalid value fails <em>either</em> test, so use <code>or</code>.` },
        { title: 'No priming read before the loop', bad: 2, inputs: ['150', '72'], code: `tries = 0
while mark < 0 or mark > 100:
    mark = int(input("Enter a mark (0-100): "))
    tries = tries + 1
print("Mark", mark, "accepted after", tries, "tries")`, error: 'NameError', errorText: "name 'mark' is not defined",
          why: `The <code>while</code> condition is tested <b>before</b> the body ever runs, and at that point <code>mark</code> has no value. Ask once before the loop.` },
        { title: 'Using if instead of while', bad: 3, inputs: ['150', '-5'], code: `mark = int(input("Enter a mark (0-100): "))
tries = 1
if mark < 0 or mark > 100:
    print("Not valid - try again.")
    mark = int(input("Enter a mark (0-100): "))
    tries = tries + 1
print("Mark", mark, "accepted after", tries, "tries")`, out: `Enter a mark (0-100): 150\nNot valid - try again.\nEnter a mark (0-100): -5\nMark -5 accepted after 2 tries`,
          why: `An <code>if</code> checks only once. The second answer, -5, is never checked, so an invalid mark gets through. Validation needs a loop.` }
      ],
      nobuiltins: { none: `Nothing to change here: the only built-ins are <code>input</code>, <code>int</code> and <code>print</code>, which exam questions don't ban.` },
      tip: `For an input validation loop, marks are usually given for: an input before the loop, a correct <code>while</code> condition for <em>invalid</em> data (joined with <code>or</code>), a new input inside the loop, and accepting/outputting after the loop. You may also be asked to <b>justify</b> the loop type: "a conditional loop, because the number of attempts isn't known in advance".`
    }
  ]
});
