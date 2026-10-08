/* "Build it from scratch" notes — B2.3.2 Selection. Format: see widgets/notes.js. */
CodeCraft.addNotes('B2.3.2', {
  intro: `<p><span class="term">Selection</span> lets a program choose which lines to run. <code>if</code> tests a condition; <code>elif</code> ("else if") is only tested when everything above it was <code>False</code>; <code>else</code> catches whatever is left. At most <b>one</b> branch of an if/elif/else chain runs.</p>
  <p>Conditions use the relational operators <code>&lt; &lt;= &gt; &gt;= == !=</code> and can be joined with the Boolean operators <code>and</code>, <code>or</code> and <code>not</code>. Remember: <code>=</code> assigns, <code>==</code> compares.</p>`,
  programs: [
    {
      title: 'Turn a mark into a grade from 1 to 7',
      goal: `<p>A teacher uses these boundaries for a test: 80+ is a 7, 70+ a 6, 60+ a 5, 50+ a 4, 40+ a 3, 25+ a 2, and anything lower a 1. Read a mark and print its grade.</p>`,
      input: `a whole-number mark from 0 to 100, e.g. 64`,
      output: `<code>Grade: 5</code>`,
      think: [
        `Exactly one grade applies to each mark, so use a single if/elif/else chain — once a branch runs, the rest are skipped.`,
        `Test from the <b>highest</b> boundary down. A mark of 64 is also ≥ 25 and ≥ 40, so the first true test must be the most demanding one it passes.`,
        `Use <code>&gt;=</code>: a mark of exactly 80 earns the 7.`,
        `Finish with <code>else</code>, so every possible mark gets a grade.`
      ],
      works: `the tests run top to bottom and stop at the first <code>True</code> one. Because the boundaries are tested from highest to lowest, the first one a mark passes is the highest grade it has earned.`,
      vars: [
        ['mark', 'int', 'the mark typed in, cast to an int so it can be compared with numbers'],
        ['grade', 'int', 'set in exactly one branch']
      ],
      code: `mark = int(input("Mark (0-100): "))
if mark >= 80:
    grade = 7
elif mark >= 70:
    grade = 6
elif mark >= 60:
    grade = 5
elif mark >= 50:
    grade = 4
elif mark >= 40:
    grade = 3
elif mark >= 25:
    grade = 2
else:
    grade = 1
print("Grade:", grade)`,
      inputs: ['64'],
      out: `Mark (0-100): 64\nGrade: 5`,
      build: [
        { add: 1, why: `Read the mark and cast it to an int, so <code>&gt;=</code> compares numbers.`, missing: `As a string, "64" &gt;= 80 is a <code>TypeError</code> in Python 3.` },
        { add: 2, why: `Start with the highest boundary.`, missing: `Starting with a low boundary, almost every mark passes the first test (see mistake 1).` },
        { add: 3, why: `80 or more: grade 7.`, missing: `A mark of 80+ would get no grade from this branch.` },
        { add: 4, why: `<code>elif</code>: only tested if the mark was <b>not</b> ≥ 80, so here we already know it is below 80.`, missing: `Using a separate <code>if</code> instead lets later tests overwrite the grade (see mistake 2).` },
        { add: 5, why: `70–79: grade 6.`, missing: `An <code>elif</code> must have an indented line under it — without one Python won't even start the program (an <code>IndentationError</code>).` },
        { add: 6, why: `The next boundary down.`, missing: `Marks from 60 to 69 would fall through to a lower grade.` },
        { add: 7, why: `60–69: grade 5. A mark of 64 stops here.`, missing: `64 would get a 4.` },
        { add: 8, why: `And so on down the boundaries.`, missing: `50–59 would fall through to a 3.` },
        { add: 9, why: `50–59: grade 4.`, missing: `Written <code>grade == 4</code>, it compares instead of assigning, so <code>grade</code> is never set for these marks.` },
        { add: 10, why: `40 boundary.`, missing: `40–49 would fall through to a 2.` },
        { add: 11, why: `40–49: grade 3.`, missing: `Not indented, it would break the chain: the next <code>elif</code> would have no <code>if</code> to belong to, a <code>SyntaxError</code>.` },
        { add: 12, why: `The lowest boundary with a test.`, missing: `25–39 would get a 1.` },
        { add: 13, why: `25–39: grade 2.`, missing: `With the wrong number here, marks of 25–39 get the wrong grade. Check each line against the boundary table.` },
        { add: 14, why: `<code>else</code> has no condition: it catches every mark that failed all the tests above (below 25).`, missing: `Without <code>else</code>, a mark below 25 never sets <code>grade</code>, and the print crashes (see mistake 4).` },
        { add: 15, why: `Below 25: grade 1.`, missing: `The <code>else</code> would have no body, so the program won't run.` },
        { add: 16, why: `Not indented, so it runs after whichever branch was chosen.`, missing: `Inside one branch, only marks in that range would print anything.` }
      ],
      trace: {
        cols: ['mark', 'grade'],
        note: `The tests stop at the first <code>True</code> one. <code>mark &gt;= 50</code> would also be <code>True</code> for 64, but it is never tested — that is what <code>elif</code> does.`
      },
      mistakes: [
        { title: 'Testing the lowest boundary first', bad: 2, code: `mark = int(input("Mark (0-100): "))
if mark >= 25:
    grade = 2
elif mark >= 40:
    grade = 3
elif mark >= 60:
    grade = 5
elif mark >= 80:
    grade = 7
else:
    grade = 1
print("Grade:", grade)`, out: `Mark (0-100): 64\nGrade: 2`,
          why: `64 ≥ 25 is <code>True</code>, so the first branch runs and the rest are skipped. With <code>&gt;=</code>, test from the highest boundary down.` },
        { title: 'Separate ifs instead of elif', bad: 4, code: `mark = int(input("Mark (0-100): "))
if mark >= 80:
    grade = 7
if mark >= 70:
    grade = 6
if mark >= 60:
    grade = 5
if mark >= 50:
    grade = 4
if mark >= 40:
    grade = 3
if mark >= 25:
    grade = 2
else:
    grade = 1
print("Grade:", grade)`, out: `Mark (0-100): 64\nGrade: 2`,
          why: `Every <code>if</code> is tested. 64 sets the grade to 5, then 4, then 3, then 2 — the last one wins. <code>elif</code> makes the tests one chain where only one branch runs.` },
        { title: '> where the boundary counts', bad: 2, inputs: ['80'], code: `mark = int(input("Mark (0-100): "))
if mark > 80:
    grade = 7
elif mark > 70:
    grade = 6
else:
    grade = 5
print("Grade:", grade)`, out: `Mark (0-100): 80\nGrade: 6`,
          why: `"80 or more" includes 80, but <code>80 &gt; 80</code> is <code>False</code>. Always test a mark that sits exactly on a boundary.` },
        { title: 'No else for the lowest marks', bad: 4, inputs: ['10'], code: `mark = int(input("Mark (0-100): "))
if mark >= 80:
    grade = 7
elif mark >= 25:
    grade = 2
print("Grade:", grade)`, error: 'NameError', errorText: "name 'grade' is not defined",
          why: `A mark of 10 fails every test, so no line ever gives <code>grade</code> a value. An <code>else</code> makes sure every possible input is handled.` }
      ],
      nobuiltins: { none: `Nothing is banned here — selection uses no built-in functions. (One tidy alternative, when the boundaries are in a list, is a loop that checks them in order. But exam questions expect the if/elif/else chain.)` },
      tip: `For "construct" questions with boundaries, marks usually go to: the correct comparisons (watch <code>&gt;=</code> vs <code>&gt;</code>), a sensible order, a branch for every range (an <code>else</code>), and the output. Test your answer mentally with a value exactly on a boundary and one below the lowest.`
    },
    {
      title: 'Can this student join the trip?',
      goal: `<p>A school trip is for students aged 16 and over who have a signed permission form. Read the age and whether the form is signed, and print the right message for each case.</p>`,
      input: `an age and a y/n answer, e.g. <code>17</code> and <code>n</code>`,
      output: `one of three messages, e.g. <code>Bring a signed form</code>`,
      think: [
        `There are two questions: is the student old enough, and is the form signed? That gives three outcomes: join, bring a form, or too young.`,
        `Store the form answer as a <b>Boolean</b>: the comparison <code>answer == "y"</code> is <code>True</code> or <code>False</code>.`,
        `Ask about age first. Only if they are old enough does the form matter — so the form test goes <b>inside</b> the age test: a <b>nested if</b>.`,
        `Each <code>if</code> gets its own <code>else</code>, lined up with it.`
      ],
      works: `the outer if splits students by age; only the 16+ branch contains the inner if, which splits them by form. Every combination of answers reaches exactly one print.`,
      vars: [
        ['age', 'int', 'cast so it can be compared with 16'],
        ['has_form', 'bool', '<code>True</code> only if the answer was exactly "y"']
      ],
      code: `age = int(input("Age: "))
has_form = input("Signed form? (y/n): ") == "y"
if age >= 16:
    if has_form:
        print("You can join the trip")
    else:
        print("Bring a signed form")
else:
    print("Sorry - the trip is for 16 and over")`,
      inputs: ['17', 'n'],
      out: `Age: 17\nSigned form? (y/n): n\nBring a signed form`,
      build: [
        { add: 1, why: `The age, as an int.`, missing: `<code>age &gt;= 16</code> crashes with a <code>NameError</code>.` },
        { add: 2, why: `<code>input(...) == "y"</code> compares the answer with "y" and stores the result: a Boolean.`, missing: `Without <code>== "y"</code>, <code>has_form</code> is the string "n" — and any non-empty string counts as true in an <code>if</code> (see mistake 1).` },
        { add: 3, why: `The first question: old enough?`, missing: `Every student would be treated as old enough.` },
        { add: 4, why: `Nested inside the age test: the form only matters for 16+. A Boolean can be tested directly — no <code>== True</code> needed.`, missing: `Old-enough students would all be allowed, form or not.` },
        { add: 5, why: `Old enough and has the form.`, missing: `Students who meet both rules would get no message.` },
        { add: 6, why: `This <code>else</code> lines up with the <b>inner</b> if: old enough, but no form.`, missing: `Lined up with the outer if instead, it changes meaning completely (see mistake 3).` },
        { add: 7, why: `Tell them what to do.`, missing: `The inner <code>else</code> would have no body, so the program won't run.` },
        { add: 8, why: `This <code>else</code> belongs to the <b>outer</b> if: under 16.`, missing: `Under-16s would get no message at all.` },
        { add: 9, why: `The reason they can't go.`, missing: `The outer <code>else</code> would have no body — the program won't run.` }
      ],
      trace: {
        cols: ['age', 'has_form'],
        note: `Two conditions are tested: the outer one is <code>True</code>, so Python goes inside and tests the inner one, which is <code>False</code> — so the inner <code>else</code> runs.`
      },
      mistakes: [
        { title: 'Testing the raw answer instead of a Boolean', bad: 2, code: `age = int(input("Age: "))
has_form = input("Signed form? (y/n): ")
if age >= 16:
    if has_form:
        print("You can join the trip")
    else:
        print("Bring a signed form")
else:
    print("Sorry - the trip is for 16 and over")`, out: `Age: 17\nSigned form? (y/n): n\nYou can join the trip`,
          why: `<code>has_form</code> is the string "n". In an <code>if</code>, any non-empty string counts as true, so "n" lets the student in. Compare it: <code>== "y"</code>.` },
        { title: 'or where you need and', bad: 3, inputs: ['15', 'y'], code: `age = int(input("Age: "))
has_form = input("Signed form? (y/n): ") == "y"
if age >= 16 or has_form:
    print("You can join the trip")
else:
    print("Sorry, you can't join")`, out: `Age: 15\nSigned form? (y/n): y\nYou can join the trip`,
          why: `<code>or</code> is <code>True</code> if <b>either</b> part is, so a signed form alone lets a 15-year-old in. Both rules must hold: <code>and</code>.` },
        { title: 'An else lined up with the wrong if', bad: 6, code: `age = int(input("Age: "))
has_form = input("Signed form? (y/n): ") == "y"
if age >= 16:
    if has_form:
        print("You can join the trip")
else:
    print("Bring a signed form")`, out: `Age: 17\nSigned form? (y/n): n`,
          why: `Indentation decides which <code>if</code> an <code>else</code> belongs to. Here it belongs to the age test, so a 17-year-old with no form gets no message at all — and an under-16 is told to bring a form.` },
        { title: '= where == was meant', bad: 2, code: `age = int(input("Age: "))
has_form = input("Signed form? (y/n): ") = "y"
print(has_form)`, error: 'SyntaxError', errorText: 'cannot assign to function call',
          why: `<code>=</code> assigns; <code>==</code> compares. Python can't assign "y" to a function call, so the program doesn't even start.` }
      ],
      nobuiltins: {
        title: 'The same decision with and, compared',
        intro: `<p>Instead of nesting, you can join the conditions with <code>and</code> and use an if/elif/else chain. Both are correct; this one is flatter, the nested one makes the "age first" logic easier to see.</p>`,
        code: `age = int(input("Age: "))
has_form = input("Signed form? (y/n): ") == "y"
if age >= 16 and has_form:
    print("You can join the trip")
elif age >= 16 and not has_form:
    print("Bring a signed form")
else:
    print("Sorry - the trip is for 16 and over")`,
        out: `Age: 17\nSigned form? (y/n): n\nBring a signed form`,
        changes: [
          `The outer <code>if age &gt;= 16</code> and inner <code>if has_form</code> become one condition: <code>age &gt;= 16 and has_form</code>.`,
          `The inner <code>else</code> becomes <code>elif age &gt;= 16 and not has_form</code> — <code>not</code> flips <code>False</code> to <code>True</code>. (Plain <code>elif age &gt;= 16</code> would also work, because the first test already failed.)`,
          `The outer <code>else</code> stays the same: it catches everyone under 16.`
        ]
      },
      tip: `Questions that combine conditions are usually marked on the exact logic: <code>and</code> vs <code>or</code>, and <code>&gt;=</code> vs <code>&gt;</code>. A quick check: try one case for each message (e.g. 17 + y, 17 + n, 15 + y) and make sure each gives the right one.`
    }
  ]
});
