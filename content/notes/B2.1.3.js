/* "Build it from scratch" notes — B2.1.3 Exception handling. Format: see widgets/notes.js. */
CodeCraft.addNotes('B2.1.3', {
  intro: `<p>An <span class="term">exception</span> is an error that happens while a program runs — for example <code>int("seventy")</code> raises a <b>ValueError</b>. Unhandled, it stops the program. Programs fail at predictable <b>points of failure</b>: unexpected input, missing resources such as files, and impossible calculations like dividing by zero.</p>
  <p><code>try</code> runs code that might fail. If an exception happens, Python jumps to the first <code>except</code> that names that type of error. <code>finally</code> runs at the end <b>whatever happened</b> — useful for tidying up. Name the specific exception you expect (<code>ValueError</code>, <code>ZeroDivisionError</code>, <code>FileNotFoundError</code>, <code>IndexError</code>) rather than catching everything.</p>`,
  programs: [
    {
      title: 'A mark-entry function that never crashes',
      goal: `<p>Write <code>get_mark()</code>: it keeps asking until the user types a whole number from 0 to 100, and returns it. Text such as "seventy" must not crash the program.</p>`,
      input: `answers typed at the keyboard, e.g. <code>seventy</code>, then <code>150</code>, then <code>72</code>`,
      output: `a helpful message after each bad answer, then <code>Saved mark: 72</code>`,
      think: [
        `Two things can be wrong: the text isn't a whole number (<code>int()</code> raises a <code>ValueError</code>), or it is a number but out of range.`,
        `Put the risky line, <code>int(input(...))</code>, inside <code>try</code>, and catch <code>ValueError</code> in an <code>except</code>.`,
        `We don't know how many attempts it will take, so loop: <code>while True</code> repeats for ever…`,
        `…until a valid mark is <code>return</code>ed. <code>return</code> ends the function, and with it the loop.`
      ],
      works: `the only way out of the loop is the <code>return</code>, and it is only reached after <code>int()</code> succeeded and the range check passed — so the function can only ever return a valid mark.`,
      vars: [
        ['mark', 'int', 'local: only set if <code>int()</code> succeeds'],
        ['m', 'int', 'global: the value the function returns']
      ],
      code: `def get_mark():
    while True:
        try:
            mark = int(input("Mark (0-100): "))
            if mark >= 0 and mark <= 100:
                return mark
            print("Out of range - try again.")
        except ValueError:
            print("Whole numbers only - try again.")


m = get_mark()
print("Saved mark:", m)`,
      inputs: ['seventy', '150', '72'],
      out: `Mark (0-100): seventy\nWhole numbers only - try again.\nMark (0-100): 150\nOut of range - try again.\nMark (0-100): 72\nSaved mark: 72`,
      build: [
        { add: 1, why: `A function, so any part of a program can get a safe mark with one call.`, missing: `<code>get_mark()</code> crashes with a <code>NameError</code>.` },
        { add: 12, why: `Call it and keep the result. For now the function body is only <code>pass</code>, so it returns <code>None</code>.`, missing: `The function would never run.` },
        { add: 13, why: `Show what came back. Run this stage: <code>Saved mark: None</code>.`, missing: `You couldn't see the result.` },
        { add: [3, 8], why: `<code>try</code> and its <code>except ValueError</code> are written together — a <code>try</code> can't stand on its own.`, missing: `Without them, "seventy" crashes the program (see mistake 1).` },
        { add: 4, why: `The risky line. If the text isn't a whole number, <code>int()</code> raises a <code>ValueError</code> and Python jumps straight to the <code>except</code>.`, missing: `There's nothing to check. Outside the <code>try</code>, its error wouldn't be caught.` },
        { add: 5, why: `Only reached if <code>int()</code> worked. Now check the range.`, missing: `150 would be accepted (see mistake 4).` },
        { add: 6, why: `Valid: return it. This ends the function.`, missing: `A valid mark would never be handed back.` },
        { add: 9, why: `The <code>except</code> body: explain the problem. Run this stage with "seventy": the message appears, but the function then ends and returns <code>None</code> — the user gets only one try (see mistake 3).`, missing: `The user wouldn't know why their answer was refused.` },
        { add: 2, why: `<code>while True</code> wraps the <code>try</code>, so after a bad answer Python goes round and asks again. The only way out is the <code>return</code>, which ends the function <b>and</b> the loop.`, missing: `One try only (see mistake 3).` },
        { add: 7, why: `Out of range? We only get here if the <code>return</code> didn't happen, so no <code>else</code> is needed.`, missing: `The user wouldn't be told why 150 was refused — they'd just be asked again.` }
      ],
      trace: {
        inputs: ['seventy', '72'],
        cols: ['mark', 'm'],
        note: `After "seventy", there is no row that gives <code>mark</code> a value: <code>int()</code> failed, so Python jumped from line 4 straight to the <code>except</code> on line 8.`
      },
      mistakes: [
        { title: 'No try at all', bad: 2, code: `def get_mark():
    mark = int(input("Mark (0-100): "))
    return mark


m = get_mark()
print("Saved mark:", m)`, error: 'ValueError', errorText: "invalid literal for int() with base 10: 'seventy'",
          why: `Unhandled, the <code>ValueError</code> stops the whole program. Anything a user types is a point of failure — wrap the conversion in <code>try</code>.` },
        { title: 'Catching the wrong exception', bad: 6, code: `def get_mark():
    while True:
        try:
            mark = int(input("Mark (0-100): "))
            return mark
        except ZeroDivisionError:
            print("Whole numbers only - try again.")


m = get_mark()
print("Saved mark:", m)`, error: 'ValueError', errorText: "invalid literal for int() with base 10: 'seventy'",
          why: `An <code>except</code> only catches the type it names. <code>int("seventy")</code> raises a <code>ValueError</code>, which isn't caught, so the program still crashes.` },
        { title: 'Handling the error but not retrying', bad: 2, code: `def get_mark():
    try:
        mark = int(input("Mark (0-100): "))
        return mark
    except ValueError:
        print("Whole numbers only.")


m = get_mark()
print("Saved mark:", m)`, out: `Mark (0-100): seventy\nWhole numbers only.\nSaved mark: None`,
          why: `The error is caught, but the function then ends without returning anything, so the program carries on with <code>None</code>. A loop keeps asking until the input is valid.` },
        { title: 'Forgetting the range check', bad: 4, inputs: ['150'], code: `def get_mark():
    while True:
        try:
            mark = int(input("Mark (0-100): "))
            return mark
        except ValueError:
            print("Whole numbers only - try again.")


m = get_mark()
print("Saved mark:", m)`, out: `Mark (0-100): 150\nSaved mark: 150`,
          why: `<code>try</code>/<code>except</code> only deals with errors Python raises. 150 is a perfectly good int, so checking it is a valid mark is your job.` }
      ],
      nobuiltins: { none: `Nothing to change: <code>int</code> and <code>input</code> are never banned.` },
      tip: `"Describe how a program could handle invalid input" answers usually earn marks for: naming the exception (<code>ValueError</code>), saying what goes in the <code>try</code>, what the <code>except</code> does (a message), and that the input is requested again in a loop. Range checks (validation) are a separate mark from exception handling.`
    },
    {
      title: 'Average a file of scores safely',
      goal: `<p>Read the whole-number scores in <code>scores.txt</code>, one per line, and print their average. Handle three problems with a clear message each: the file is missing, a line isn't a whole number, or the file is empty. Always finish with "Finished checking".</p>`,
      input: `the file <code>scores.txt</code>`,
      output: `<code>Average: 75.66666666666667</code>, then <code>Finished checking scores.txt</code>`,
      files: { 'scores.txt': '72\n65\n90\n' },
      think: [
        `List the points of failure: <code>open</code> fails if the file is missing (<code>FileNotFoundError</code>), <code>int</code> fails on a bad line (<code>ValueError</code>), and the average divides by the count, which is 0 for an empty file (<code>ZeroDivisionError</code>).`,
        `Put all the risky work inside one <code>try</code>.`,
        `Add one <code>except</code> per exception, each with its own message, so the user knows exactly what went wrong.`,
        `Add <code>finally</code> for the line that must always run.`
      ],
      works: `whichever line fails, Python jumps from it to the matching <code>except</code>, skipping the rest of the <code>try</code>; and <code>finally</code> runs on every route — success or any of the three failures.`,
      vars: [
        ['total', 'int', 'running total of the scores'],
        ['count', 'int', 'how many lines were read'],
        ['f', 'file', 'the open file'],
        ['line', 'str', 'one line of the file, e.g. "72\\n" — text, so it must be converted']
      ],
      code: `total = 0
count = 0
try:
    f = open("scores.txt", "r")
    for line in f:
        total = total + int(line.strip())
        count = count + 1
    f.close()
    print("Average:", total / count)
except FileNotFoundError:
    print("scores.txt is missing")
except ValueError:
    print("A line in scores.txt isn't a whole number")
except ZeroDivisionError:
    print("scores.txt is empty")
finally:
    print("Finished checking scores.txt")`,
      out: `Average: 75.66666666666667\nFinished checking scores.txt`,
      build: [
        { add: 1, why: `Running total, before the <code>try</code> so it exists whatever happens.`, missing: `<code>total + …</code> crashes with a <code>NameError</code>.` },
        { add: 2, why: `How many scores have been read.`, missing: `<code>count + 1</code> crashes with a <code>NameError</code>.` },
        { add: [3, 10], why: `<code>try</code> with its first <code>except</code>: the file might be missing. (They have to be added together.)`, missing: `A missing file stops the program with an error message the user may not understand (see mistake 1).` },
        { add: 4, why: `The first risky line: opening the file.`, missing: `There's no file to read.` },
        { add: 5, why: `Loop over the lines of the file.`, missing: `Only one score could be read.` },
        { add: 6, why: `Each line is text like "72\\n". <code>.strip()</code> removes the newline and <code>int()</code> converts it — the second risky line.`, missing: `<code>total + line</code> without <code>int()</code> is a <code>TypeError</code>: you can't add text to a number.` },
        { add: 7, why: `Count the line.`, missing: `<code>count</code> stays 0, so the average divides by zero.` },
        { add: 8, why: `Close the file when you've finished with it.`, missing: `The file stays open until the program ends.` },
        { add: 9, why: `The third risky line: dividing by <code>count</code>, which is 0 for an empty file. It must be <b>inside</b> the <code>try</code>.`, missing: `Outside the <code>try</code>, an empty file crashes the program (see mistake 4).` },
        { add: 11, why: `Message for a missing file.`, missing: `The <code>except</code> would have no body: the program won't run.` },
        { add: 12, why: `A second <code>except</code>, for a line that isn't a number.`, missing: `A bad line crashes the program (see mistake 2).` },
        { add: 13, why: `Its message.`, missing: `The <code>except</code> would have no body.` },
        { add: 14, why: `A third, for an empty file.`, missing: `An empty file crashes with <code>ZeroDivisionError</code>.` },
        { add: 15, why: `Its message.`, missing: `The <code>except</code> would have no body.` },
        { add: 16, why: `<code>finally</code> runs last, on every route through the code.`, missing: `The closing message would only appear when there was no error — unless you copied it into every branch.` },
        { add: 17, why: `The line that must always run.`, missing: `<code>finally</code> would have no body.` }
      ],
      trace: {
        cols: ['line', 'total', 'count'],
        note: `<code>line</code> is shown as <code>'72\\n'</code>: text, with the newline still on the end. Only after <code>int(line.strip())</code> does it become the number 72.`
      },
      mistakes: [
        { title: 'No try around the file', files: {}, code: `f = open("scores.txt", "r")
print(f.read())
f.close()`, error: 'FileNotFoundError', errorText: "No such file or directory: 'scores.txt'",
          why: `The file doesn't exist here, so <code>open</code> raises <code>FileNotFoundError</code> and the program stops. Any line that uses an outside resource is a point of failure.` },
        { title: 'An except for a different error', bad: 7, files: { 'scores.txt': '72\nseventy\n90\n' }, code: `total = 0
try:
    f = open("scores.txt", "r")
    for line in f:
        total = total + int(line.strip())
    f.close()
except FileNotFoundError:
    print("scores.txt is missing")
print(total)`, error: 'ValueError', errorText: "invalid literal for int() with base 10: 'seventy'",
          why: `The file exists, but its second line is "seventy". Only <code>FileNotFoundError</code> is caught, so the <code>ValueError</code> still crashes the program.` },
        { title: 'Catching everything with one except', bad: 9, files: { 'scores.txt': '' }, code: `total = 0
count = 0
try:
    f = open("scores.txt", "r")
    for line in f:
        total = total + int(line.strip())
        count = count + 1
    print("Average:", total / count)
except:
    print("Something went wrong")`, out: `Something went wrong`,
          why: `A bare <code>except</code> catches every error, so the program doesn't crash — but the message doesn't say what went wrong (here, an empty file). Name each exception you expect.` },
        { title: 'Dividing outside the try', bad: 10, files: { 'scores.txt': '' }, code: `total = 0
count = 0
try:
    f = open("scores.txt", "r")
    for line in f:
        total = total + int(line.strip())
        count = count + 1
    f.close()
except FileNotFoundError:
    print("scores.txt is missing")
print("Average:", total / count)`, error: 'ZeroDivisionError', errorText: 'division by zero',
          why: `The file is empty, so <code>count</code> is 0. The division is outside the <code>try</code>, so nothing can catch the <code>ZeroDivisionError</code>.` }
      ],
      nobuiltins: { none: `Nothing to change: <code>open</code>, <code>int</code> and the file methods are never banned.` },
      tip: `For "identify a point of failure and explain how to handle it", name the exact line, the exception it can raise and why (e.g. "line 4 raises FileNotFoundError if the file doesn't exist"), then describe the <code>try</code>/<code>except</code> that handles it. Know what <code>finally</code> is for: code that must run whether or not an error happened.`
    }
  ]
});
