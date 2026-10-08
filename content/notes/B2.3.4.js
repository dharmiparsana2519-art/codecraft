/* "Build it from scratch" notes — B2.3.4 Functions & modularization. Format: see widgets/notes.js. */
CodeCraft.addNotes('B2.3.4', {
  intro: `<p>A <span class="term">function</span> is a named block of code that does one job. <code>def</code> defines it; calling it by name runs it. Values go <b>in</b> through <b>parameters</b> (the names in the <code>def</code> line) — the values you pass in a call are the <b>arguments</b> — and a result comes <b>out</b> with <code>return</code>.</p>
  <p>Variables created inside a function are <b>local</b>: they exist only while it runs. Variables created outside any function are <b>global</b>. Splitting a program into functions is <b>modularization</b>: each part can be written, tested and reused on its own. Passing values in and returning them out is safer than changing global variables with the <code>global</code> keyword, because each function's effect is then clear from its call.</p>`,
  programs: [
    {
      title: 'Report results with two small functions',
      goal: `<p>For each student, work out the average of their marks and turn it into a result: Distinction (70+), Pass (50+) or Fail. Do each job in its own function, so it can be reused for any student.</p>`,
      input: `a list of marks for each student, e.g. <code>[72, 81, 65]</code>`,
      output: `<code>Aiko: Distinction</code> and <code>Ben: Fail</code>`,
      think: [
        `<b>Decompose</b> the task: (1) average a list of marks; (2) turn an average into a result word. Each becomes a function.`,
        `<code>average(marks)</code> takes a list and <b>returns</b> a number — it doesn't print, so the caller can use the number.`,
        `<code>result(avg)</code> takes a number and returns a string, using if/elif/else.`,
        `The main program calls them for each student. <code>result(average(aiko))</code> runs the inner call first, and its return value becomes the outer call's argument.`
      ],
      works: `each function only uses its parameter and its own local variables, so it gives the right answer for <b>any</b> list or average it is given — that's what makes it reusable.`,
      vars: [
        ['marks', 'list of int', 'parameter of <code>average</code>: the list passed in'],
        ['total', 'int', 'local to <code>average</code>: the running total'],
        ['m', 'int', 'local loop variable'],
        ['avg', 'float', 'parameter of <code>result</code>'],
        ['aiko, ben', 'list of int', 'global: the data in the main program']
      ],
      code: `def average(marks):
    total = 0
    for m in marks:
        total = total + m
    return total / len(marks)


def result(avg):
    if avg >= 70:
        return "Distinction"
    elif avg >= 50:
        return "Pass"
    else:
        return "Fail"


aiko = [72, 81, 65]
ben = [45, 52, 38]
print("Aiko:", result(average(aiko)))
print("Ben:", result(average(ben)))`,
      out: `Aiko: Distinction\nBen: Fail`,
      build: [
        { add: 1, why: `<code>def</code>, the function's name, and one parameter, <code>marks</code>, which will hold whatever list is passed in.`, missing: `Calling <code>average(...)</code> crashes with a <code>NameError</code>.` },
        { add: 2, why: `A local running total, created fresh every time the function is called.`, missing: `<code>total + m</code> crashes with an <code>UnboundLocalError</code>.` },
        { add: 3, why: `Visit every mark in the list that was passed in.`, missing: `Only one mark could be added.` },
        { add: 4, why: `The running total pattern.`, missing: `The total stays 0, so every average is 0.0.` },
        { add: 5, why: `<b>Return</b> the mean to whoever called the function. It's after the loop, lined up with <code>for</code>.`, missing: `Missing: the function returns <code>None</code>. Indented inside the loop: it returns after the first mark (see mistake 2). <code>print</code> instead of <code>return</code>: the caller gets <code>None</code> (see mistake 1).` },
        { add: 17, why: `Some data to test with. The function isn't called yet, so this stage prints nothing.`, missing: `There would be nothing to pass to the functions.` },
        { add: 8, why: `The second function: takes an average, returns a word.`, missing: `<code>result(...)</code> crashes with a <code>NameError</code>.` },
        { add: 9, why: `Highest boundary first.`, missing: `Distinction would never be returned.` },
        { add: 10, why: `<code>return</code> ends the function straight away with this value — so no <code>elif</code> below is tested.`, missing: `The <code>if</code> would have no body: the program won't run.` },
        { add: 11, why: `Only tested when the average is below 70.`, missing: `Averages from 50 to 69 would be "Fail".` },
        { add: 12, why: `50–69 is a Pass.`, missing: `The <code>elif</code> would have no body: the program won't run.` },
        { add: 13, why: `Everything else.`, missing: `An average below 50 returns nothing — <code>None</code> — and prints as "None".` },
        { add: 14, why: `Below 50 is a Fail.`, missing: `The <code>else</code> would have no body: the program won't run.` },
        { add: 19, why: `<code>average(aiko)</code> runs first and returns 72.666…; that value is passed to <code>result</code>, which returns "Distinction". Run this stage to see it.`, missing: `Put above the two <code>def</code>s, it crashes with a <code>NameError</code>: a function must be defined before it is called (see mistake 4).` },
        { add: 18, why: `A second student — the same functions work for any list.`, missing: `Ben's line would crash with a <code>NameError</code>.` },
        { add: 20, why: `Reuse: one line per student, no code copied.`, missing: `Without functions you'd copy the loop and the if/elif/else for every student.` }
      ],
      trace: {
        code: `def average(marks):
    total = 0
    for m in marks:
        total = total + m
    return total / len(marks)


def result(avg):
    if avg >= 70:
        return "Distinction"
    elif avg >= 50:
        return "Pass"
    else:
        return "Fail"


aiko = [72, 81, 65]
print("Aiko:", result(average(aiko)))`,
        cols: ['m', 'total', 'avg'],
        note: `The rows for lines 2–5 happen inside <code>average</code>; line 9 happens inside <code>result</code>. Line 18 is listed last because its print only happens once both calls have returned.`
      },
      mistakes: [
        { title: 'Printing instead of returning', bad: 5, code: `def average(marks):
    total = 0
    for m in marks:
        total = total + m
    print(total / len(marks))


def result(avg):
    if avg >= 70:
        return "Distinction"
    else:
        return "Not yet"


print("Aiko:", result(average([72, 81, 65])))`, error: 'TypeError', errorText: "'>=' not supported between instances of 'NoneType' and 'int'",
          why: `<code>print</code> shows the average on screen, but the function still returns <code>None</code>. <code>result(None)</code> then tries <code>None &gt;= 70</code>. A function whose value is needed must <code>return</code> it.` },
        { title: 'Returning from inside the loop', bad: 5, code: `def average(marks):
    total = 0
    for m in marks:
        total = total + m
        return total / len(marks)


print(average([72, 81, 65]))`, out: `24.0`,
          why: `<code>return</code> ends the function immediately — here after the first mark: 72 ÷ 3 = 24.0. Line it up with the <code>for</code>.` },
        { title: 'Using a local variable outside its function', bad: 9, code: `def average(marks):
    total = 0
    for m in marks:
        total = total + m
    return total / len(marks)


avg = average([72, 81, 65])
print("Total was", total)`, error: 'NameError', errorText: "name 'total' is not defined",
          why: `<code>total</code> is <b>local</b> to <code>average</code>: it disappears when the function returns. To use a value outside, return it.` },
        { title: 'Calling a function before defining it', bad: 1, code: `print(average([72, 81, 65]))


def average(marks):
    total = 0
    for m in marks:
        total = total + m
    return total / len(marks)`, error: 'NameError', errorText: "name 'average' is not defined",
          why: `Python runs top to bottom, and <code>def</code> is just another line. Until it has run, the name <code>average</code> doesn't exist. Put function definitions first.` }
      ],
      nobuiltins: {
        ban: ['len', 'sum'],
        intro: `<p>If <code>len</code> is banned, count the marks inside the same loop:</p>`,
        code: `def average(marks):
    total = 0
    count = 0
    for m in marks:
        total = total + m
        count = count + 1
    return total / count


def result(avg):
    if avg >= 70:
        return "Distinction"
    elif avg >= 50:
        return "Pass"
    else:
        return "Fail"


aiko = [72, 81, 65]
ben = [45, 52, 38]
print("Aiko:", result(average(aiko)))
print("Ben:", result(average(ben)))`,
        out: `Aiko: Distinction\nBen: Fail`,
        changes: [
          `New local variable <code>count = 0</code>, next to <code>total</code>.`,
          `<code>count = count + 1</code> inside the loop: one per mark.`,
          `<code>total / len(marks)</code> becomes <code>total / count</code>.`,
          `Nothing outside <code>average</code> changes — a benefit of modular code: you can change how a function works without touching the code that calls it.`
        ]
      },
      tip: `"Construct a function" questions usually give marks for: a correct header with the right parameter(s), the working body, and <b>returning</b> (not printing) the result when the question says "returns". If it says "outputs", print instead. Read the command carefully.`
    },
    {
      title: 'Library fines with a constant and local variables',
      goal: `<p>The library charges 20 cents per day late, up to a maximum of 300 cents per book. Write <code>late_fee(days)</code>, then use it to work out the fee for several books and the total.</p>`,
      input: `days late for each book: <code>[3, 0, 20]</code>`,
      output: `each book's fee, then <code>Total: 360 cents</code>`,
      think: [
        `The rate and the maximum never change, so store them as <b>constants</b> at the top (capital names by convention). Functions can read global values like these.`,
        `<code>late_fee(days)</code>: work out days × rate in a <b>local</b> variable, cap it at the maximum, return it.`,
        `The main program loops over the books, calls the function for each, and keeps a running total.`,
        `The total lives in the main program and is updated there with the returned value — the function never changes it.`
      ],
      works: `<code>late_fee</code> depends only on its parameter and the constants, so it gives the same answer every time for the same days — easy to test on its own (e.g. 0 days → 0, 20 days → 300).`,
      vars: [
        ['RATE, MAX_FEE', 'int', 'global constants: read, never changed'],
        ['days', 'int', 'the parameter (and, in the main program, the loop variable)'],
        ['fee', 'int', 'local to <code>late_fee</code>'],
        ['charge', 'int', 'global: the value returned for one book'],
        ['total', 'int', 'global running total']
      ],
      code: `RATE = 20
MAX_FEE = 300


def late_fee(days):
    fee = days * RATE
    if fee > MAX_FEE:
        fee = MAX_FEE
    return fee


total = 0
for days in [3, 0, 20]:
    charge = late_fee(days)
    print(days, "days late:", charge, "cents")
    total = total + charge
print("Total:", total, "cents")`,
      out: `3 days late: 60 cents\n0 days late: 0 cents\n20 days late: 300 cents\nTotal: 360 cents`,
      build: [
        { add: 1, why: `The rate as a named constant. If it changes, you change one line.`, missing: `<code>days * RATE</code> crashes with a <code>NameError</code>.` },
        { add: 2, why: `The maximum fee, also a constant.`, missing: `The cap can't be checked.` },
        { add: 5, why: `One parameter: how many days late.`, missing: `Calling <code>late_fee</code> crashes with a <code>NameError</code>.` },
        { add: 6, why: `A <b>local</b> variable: it only exists while this call runs.`, missing: `There's nothing to return.` },
        { add: 7, why: `Is it over the maximum?`, missing: `20 days would cost 400 cents, more than the maximum.` },
        { add: 8, why: `Cap it.`, missing: `Fees above the maximum aren't capped: 20 days would cost 400 cents.` },
        { add: 9, why: `Send the fee back to the caller.`, missing: `The function returns <code>None</code>, and <code>total + charge</code> crashes (see mistake 3).` },
        { add: 12, why: `The running total, in the main program.`, missing: `<code>total + charge</code> crashes with a <code>NameError</code>.` },
        { add: 13, why: `One book at a time.`, missing: `Only one book could be charged.` },
        { add: 14, why: `Call the function and store what it returns. <code>days</code> here is passed as the argument.`, missing: `Without storing it, the returned fee is lost.` },
        { add: 15, why: `Show each book's fee.`, missing: `You'd only see the total, which is harder to check.` },
        { add: 16, why: `Add this book's fee — in the main program, where <code>total</code> lives.`, missing: `Trying to do this inside the function causes an error (see mistake 1).` },
        { add: 17, why: `After the loop, the total is complete.`, missing: `The total is never shown.` }
      ],
      trace: {
        cols: ['days', 'fee', 'charge', 'total'],
        note: `<code>fee</code> appears only on rows inside <code>late_fee</code> (lines 6–9); the main program never sees it. It only sees what is returned, as <code>charge</code>.`
      },
      mistakes: [
        { title: 'Changing a global inside a function', bad: 5, code: `total = 0


def add_fee(days):
    total = total + days * 20


add_fee(3)
print(total)`, error: 'UnboundLocalError', errorText: "cannot access local variable 'total' where it is not associated with a value",
          why: `Assigning to <code>total</code> inside the function makes it a new <b>local</b> variable, which has no value yet when <code>total + …</code> is worked out. <code>global total</code> would "fix" it, but the better design is to return the fee and add it in the main program.` },
        { title: 'Reading a local variable from outside', bad: 9, code: `def late_fee(days):
    fee = days * 20
    if fee > 300:
        fee = 300
    return fee


late_fee(3)
print(fee)`, error: 'NameError', errorText: "name 'fee' is not defined",
          why: `<code>fee</code> only existed inside the call. The returned value was thrown away because it wasn't stored: write <code>fee = late_fee(3)</code>.` },
        { title: 'Forgetting to return', code: `def late_fee(days):
    fee = days * 20
    if fee > 300:
        fee = 300


total = 0
total = total + late_fee(3)
print(total)`, error: 'TypeError', errorText: "unsupported operand type(s) for +: 'int' and 'NoneType'",
          why: `A function with no <code>return</code> returns <code>None</code>. The fee was worked out and then lost when the function ended.` },
        { title: 'Overwriting the parameter', bad: 2, code: `def late_fee(days):
    days = 5
    fee = days * 20
    return fee


for d in [3, 0, 20]:
    print(late_fee(d))`, out: `100\n100\n100`,
          why: `<code>days = 5</code> replaces the argument that was passed in, so every call works out the fee for 5 days. Use the parameter's value — don't reassign it.` }
      ],
      nobuiltins: {
        title: 'Built-ins: the short version, compared',
        intro: `<p>Our function uses no built-ins. With Python's <code>min</code>, the cap is one expression — but <code>min</code> is often banned:</p>`,
        code: `RATE = 20
MAX_FEE = 300


def late_fee(days):
    return min(days * RATE, MAX_FEE)


total = 0
for days in [3, 0, 20]:
    charge = late_fee(days)
    print(days, "days late:", charge, "cents")
    total = total + charge
print("Total:", total, "cents")`,
        out: `3 days late: 60 cents\n0 days late: 0 cents\n20 days late: 300 cents\nTotal: 360 cents`,
        changes: [
          `<code>min(a, b)</code> returns the smaller value, so <code>min(days * RATE, MAX_FEE)</code> is the fee, capped.`,
          `It replaces the local <code>fee</code>, the <code>if</code> and the cap — the main program is unchanged, because the function still returns the same values.`
        ]
      },
      tip: `Questions on scope often show a function that changes a variable and ask what is printed afterwards — trace which variables are local. For "explain why the global keyword should be avoided", say: any function could change the value, which makes bugs hard to trace and the function hard to reuse or test on its own.`
    }
  ]
});
