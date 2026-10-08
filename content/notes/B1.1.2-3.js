/* "Build it from scratch" notes — B1.1.2–3 Computational thinking. Format: see widgets/notes.js. */
CodeCraft.addNotes('B1.1.2-3', {
  intro: `<p>Computational thinking is a set of ways to approach a problem before writing code. <b>Decomposition</b>: break the problem into smaller parts that can be solved separately. <b>Pattern recognition</b>: notice steps that repeat, so one solution can be reused. <b>Abstraction</b>: keep only the details that matter for the problem and leave out the rest. <b>Algorithmic design</b>: write precise steps, in order, to solve each part.</p>
  <p>The program below is planned with all four, and each step of the build says which one it comes from.</p>`,
  programs: [
    {
      title: 'A report card, planned with the four concepts',
      goal: `<p>For each student in a class list, print their name, their average mark (to 1 decimal place) and a band: A for 70 or more, B for 50 or more, otherwise C.</p>`,
      input: `a list of students, each with a name and a list of marks`,
      output: `<code>Aiko 72.7 A</code>, <code>Ben 45.0 C</code>, <code>Carla 90.7 A</code>`,
      think: [
        `<b>Decomposition</b>: the task splits into (1) average a list of marks, (2) turn an average into a band, (3) do both for every student and print the result. Parts 1 and 2 become functions.`,
        `<b>Abstraction</b>: a real student record has a date of birth, a form group, an address… For this task only the name and marks matter, so each record is just <code>[name, marks]</code>.`,
        `<b>Pattern recognition</b>: every student needs exactly the same steps, so write them once and repeat them in a loop; and averaging is the same running-total pattern used everywhere.`,
        `<b>Algorithmic design</b>: write each part as precise, ordered steps — e.g. "total = 0; add each mark; divide by how many" — then put them together.`
      ],
      works: `each part is solved once, on its own, and tested independently; the loop then applies the same solved parts to every student, so if the parts are right, every line of the report is right.`,
      vars: [
        ['marks', 'list of int', 'parameter of <code>average</code>'],
        ['avg', 'float', 'parameter of <code>band</code>; also the result for one student'],
        ['students', 'list of [str, list]', 'the abstraction: only name and marks'],
        ['record', 'list', 'one student: <code>record[0]</code> is the name, <code>record[1]</code> the marks']
      ],
      code: `def average(marks):
    total = 0
    for m in marks:
        total = total + m
    return total / len(marks)


def band(avg):
    if avg >= 70:
        return "A"
    elif avg >= 50:
        return "B"
    return "C"


students = [["Aiko", [72, 81, 65]], ["Ben", [45, 52, 38]], ["Carla", [90, 88, 94]]]
for record in students:
    name = record[0]
    avg = average(record[1])
    print(name, round(avg, 1), band(avg))`,
      out: `Aiko 72.7 A\nBen 45.0 C\nCarla 90.7 A`,
      build: [
        { add: 16, why: `<b>Abstraction</b>: each student is reduced to the two details this task needs — a name and a list of marks.`, missing: `There's no data to report on.` },
        { add: 1, why: `<b>Decomposition</b>: sub-problem 1, "average a list", becomes its own function.`, missing: `<code>average(...)</code> crashes with a <code>NameError</code>.` },
        { add: 2, why: `<b>Algorithmic design</b>, step 1: a running total starts at 0.`, missing: `<code>total + m</code> crashes.` },
        { add: 3, why: `Step 2: visit every mark.`, missing: `Only one mark could be added.` },
        { add: 4, why: `<b>Pattern recognition</b>: the running-total pattern, reused from countless other programs.`, missing: `The total stays 0.` },
        { add: 5, why: `Step 3: divide by how many marks there are. This part can now be tested on its own, e.g. <code>average([72, 81, 65])</code>.`, missing: `The function returns <code>None</code>.` },
        { add: 8, why: `<b>Decomposition</b>: sub-problem 2, "turn an average into a band", is a second function.`, missing: `<code>band(...)</code> crashes with a <code>NameError</code>.` },
        { add: 9, why: `<b>Algorithmic design</b>: test the highest boundary first.`, missing: `With the lower test first, every average of 50+ would get a B.` },
        { add: 10, why: `70 or more: A.`, missing: `The <code>if</code> would have no body.` },
        { add: 11, why: `Only reached if the average is below 70.`, missing: `Averages of 50–69 would get a C.` },
        { add: 12, why: `50–69: B.`, missing: `The <code>elif</code> would have no body.` },
        { add: 13, why: `Anything else: C. (No <code>else</code> needed — the returns above end the function early.)`, missing: `Averages below 50 return <code>None</code>.` },
        { add: 17, why: `<b>Pattern recognition</b>: the same steps for every student, so one loop handles them all.`, missing: `You'd copy the same lines once per student.` },
        { add: 18, why: `Take the name out of the record.`, missing: `<code>name</code> crashes with a <code>NameError</code> in the print.` },
        { add: 19, why: `Use the first solved part on this student's marks.`, missing: `<code>avg</code> doesn't exist.` },
        { add: 20, why: `Put the parts together: name, average rounded to 1 decimal place, and the second part's band.`, missing: `The loop would have no output.` }
      ],
      trace: {
        cols: ['record', 'avg'],
        note: `The loop runs the same two parts for each record. Only the data changes from pass to pass — that is pattern recognition turned into code.`
      },
      mistakes: [
        { title: 'Not decomposing: everything in one block', code: `students = [["Aiko", [72, 81, 65]], ["Ben", [45, 52, 38]]]
total = 0
for record in students:
    for m in record[1]:
        total = total + m
    avg = total / len(record[1])
    print(record[0], round(avg, 1))`, out: `Aiko 72.7\nBen 117.7`,
          why: `With all the steps in one place, the running total was never reset for the second student, so Ben's "average" includes Aiko's marks. A separate <code>average</code> function starts a fresh total every time it is called — one benefit of decomposing.` },
        { title: 'Too much abstraction: a detail that mattered is gone', code: `students = [["Aiko", 72.7], ["Ben", 45.0]]
for record in students:
    print(record[0], record[1], "- best mark?")
print("Aiko's best:", max(students[0][1]))`, error: 'TypeError', errorText: "'float' object is not iterable",
          why: `Storing only each student's average throws the individual marks away — fine for a report, but a later question like "what was Aiko's best mark?" can't be answered. Abstraction keeps what the problem needs; check the requirements before removing data.` },
        { title: 'Boundaries in the wrong order', bad: 2, code: `def band(avg):
    if avg >= 50:
        return "B"
    elif avg >= 70:
        return "A"
    return "C"


print(band(90.7))`, out: `B`,
          why: `90.7 passes the first test, so the second is never reached. Algorithmic design means getting the <b>order</b> of steps right, not just the steps.` }
      ],
      nobuiltins: {
        ban: ['len', 'sum'],
        intro: `<p>If <code>len</code> is banned, count the marks in the same loop as the total — only the <code>average</code> part changes, because the problem was decomposed:</p>`,
        code: `def average(marks):
    total = 0
    count = 0
    for m in marks:
        total = total + m
        count = count + 1
    return total / count


def band(avg):
    if avg >= 70:
        return "A"
    elif avg >= 50:
        return "B"
    return "C"


students = [["Aiko", [72, 81, 65]], ["Ben", [45, 52, 38]], ["Carla", [90, 88, 94]]]
for record in students:
    name = record[0]
    avg = average(record[1])
    print(name, round(avg, 1), band(avg))`,
        out: `Aiko 72.7 A\nBen 45.0 C\nCarla 90.7 A`,
        changes: [
          `A counter, <code>count</code>, starts at 0 next to the total.`,
          `It goes up by 1 for every mark, inside the loop.`,
          `<code>total / len(marks)</code> becomes <code>total / count</code>.`,
          `Nothing else in the program changes — a direct benefit of decomposition.`
        ]
      },
      tip: `"Explain how [concept] could be used in [field]" questions usually want the concept defined <b>and applied</b> to the example — e.g. "decomposition: the report is split into averaging, banding and printing, which can be written and tested separately". A definition on its own rarely gets full marks.`
    }
  ]
});
