/* "Build it from scratch" notes — start-1 How CodeCraft works. Format: see widgets/notes.js. */
CodeCraft.addNotes('start-1', {
  intro: `<p>Every lesson has the <span class="term">editor</span> on the right (below the notes on a phone). Press <b>Run</b> or <kbd>Ctrl</kbd>+<kbd>Enter</kbd> and the program's output appears in the <b>console</b> underneath. When a program calls <code>input()</code>, a box appears in the console: type your answer and press <kbd>Enter</kbd>. Files that programs read or write live in the <b>Files</b> tab — they are kept in the page, not on your computer.</p>
  <p>Every code block in these notes has a <b>Run</b> button that loads it into the editor. The Try it tab's questions are marked by <b>hidden tests</b>, and program 2 shows exactly how that works.</p>`,
  programs: [
    {
      title: 'A program that talks to you and keeps a log',
      goal: `<p>Ask the user's name, greet them, read the first line of a file, and add their name to a visit log — using the console, <code>input()</code> and the Files tab.</p>`,
      input: `your name, typed into the console, and the file <code>scores.txt</code>`,
      output: `a greeting, the file's first line, and a confirmation; <code>visits.txt</code> appears in the Files tab`,
      files: { 'scores.txt': 'Aiko,78\nBen,64\nCarla,91\n' },
      inputs: ['Dev'],
      think: [
        `<code>input()</code> pauses the program and shows a box in the console; whatever you type comes back as a string.`,
        `<code>print</code> writes a line to the console.`,
        `Opening a file reads it from the Files tab; opening one in "a" (append) mode creates it if it isn't there yet.`,
        `Run it, then open the Files tab to see <code>visits.txt</code>. Run it again and your name is added a second time.`
      ],
      works: `the program runs top to bottom: each line finishes before the next starts, so the greeting appears before the file is read, and the log is written last.`,
      vars: [
        ['name', 'str', 'what you typed — input() always gives a string'],
        ['f', 'file', 'scores.txt, opened for reading'],
        ['first', 'str', 'its first line, without the newline'],
        ['log', 'file', 'visits.txt, opened for appending']
      ],
      code: `name = input("What's your name? ")
print("Hi", name + "!")
with open("scores.txt") as f:
    first = f.readline().strip()
print("First line of scores.txt:", first)
log = open("visits.txt", "a")
log.write(name + "\\n")
log.close()
print("Saved your visit to visits.txt")`,
      out: `What's your name? Dev\nHi Dev!\nFirst line of scores.txt: Aiko,78\nSaved your visit to visits.txt`,
      build: [
        { add: 1, why: `Ask a question. In the editor, a box appears in the console — type your name and press Enter.`, missing: `<code>name</code> doesn't exist, so the next line crashes with a <code>NameError</code>.` },
        { add: 2, why: `Greet them. Commas in <code>print</code> add a space; <code>+</code> joins with no space, so the ! sits right after the name.`, missing: `The program would ask and then say nothing.` },
        { add: 3, why: `Open <code>scores.txt</code> from the Files tab. <code>with</code> closes it again at the end of the block.`, missing: `Nothing can be read. If the file name were misspelled, you'd get a <code>FileNotFoundError</code> (see mistake 2).` },
        { add: 4, why: `Read one line and strip off its newline.`, missing: `The <code>with</code> block would have no body.` },
        { add: 5, why: `Show what was read.`, missing: `The line would be read but never shown.` },
        { add: 6, why: `Open <code>visits.txt</code> to <b>append</b>. It doesn't exist yet, so this creates it — look in the Files tab after running.`, missing: `With <code>"r"</code> instead, a missing file is an error (see mistake 3).` },
        { add: 7, why: `Write the name and a newline.`, missing: `Nothing is saved.` },
        { add: 8, why: `Close the file so the writing is finished.`, missing: `In ordinary Python, unwritten data might not reach the file.` },
        { add: 9, why: `Confirm it worked.`, missing: `The program would finish silently.` }
      ],
      trace: {
        inputs: ['Dev'],
        cols: ['name', 'first'],
        note: `The tracer can't type for you, so it uses "Dev" as the answer to <code>input()</code>. In the editor, the program waits for you instead.`
      },
      mistakes: [
        { title: 'Forgetting the brackets on print', bad: 2, inputs: ['Dev'], code: `name = input("What's your name? ")
print "Hi", name`, error: 'SyntaxError', errorText: 'Missing parentheses in call to print',
          why: `In Python 3, <code>print</code> is a function, so it needs brackets: <code>print("Hi", name)</code>. A syntax error stops the program before it starts — the console says which line to look at.` },
        { title: 'A file name that doesn\'t exist', bad: 1, code: `with open("score.txt") as f:
    print(f.readline())`, error: 'FileNotFoundError', errorText: "No such file or directory: 'score.txt'",
          why: `The file is <code>scores.txt</code>, with an s. Check the Files tab for the exact name.` },
        { title: 'Reading a file before it exists', bad: 1, files: {}, code: `log = open("visits.txt", "r")
print(log.read())`, error: 'FileNotFoundError', errorText: "No such file or directory: 'visits.txt'",
          why: `Mode "r" only reads files that already exist. Only "w" and "a" create a new file.` }
      ],
      nobuiltins: { none: `Nothing to change — this program only uses <code>input</code>, <code>print</code> and file operations.` },
      tip: `When the console shows an error, read its last line first: the error type (e.g. <code>NameError</code>) and the line number tell you where to look. CodeCraft adds a plain-English explanation underneath — and exam questions often ask you to <b>identify</b> an error in exactly this way.`
    },
    {
      title: 'How the Try it questions mark your code',
      goal: `<p>Each Try it question runs your code, then adds hidden <b>tests</b>: lines that call your function with known inputs and compare the result with the right answer. Here is a small version of that, written out in full, so you can see what "PASS" and "FAIL" mean.</p>`,
      input: `a function <code>double(n)</code> and three tests`,
      output: `<code>PASS</code> or <code>FAIL</code> for each test`,
      think: [
        `A test needs three things: a name (what it checks), the value your code actually gives, and the value it should give.`,
        `If they are equal the test passes; otherwise it fails, and showing the value you got helps you find the bug.`,
        `Good tests include ordinary values and edge cases like 0 and negatives — the Try it tests do this too.`
      ],
      works: `a test only compares results, so it works however the function was written — that's why your own solution can pass even if it isn't the same as the model answer.`,
      vars: [
        ['n', 'int', 'the parameter of double'],
        ['name', 'str', 'what the test checks'],
        ['got, expected', 'int', 'the actual and the correct result']
      ],
      code: `def double(n):
    return n * 2


def check(name, got, expected):
    if got == expected:
        print("PASS", name)
    else:
        print("FAIL", name, "- got", got)


check("double(3) is 6", double(3), 6)
check("double(0) is 0", double(0), 0)
check("double(-2) is -4", double(-2), -4)`,
      out: `PASS double(3) is 6\nPASS double(0) is 0\nPASS double(-2) is -4`,
      build: [
        { add: 1, why: `The function being tested — in a Try it question, this is the part you write.`, missing: `Every test crashes with a <code>NameError</code>.` },
        { add: 2, why: `Its answer: twice n.`, missing: `It returns <code>None</code>, and every test fails.` },
        { add: 5, why: `A checking function with three parameters: the test's name, the value we got, the value we expected.`, missing: `There would be no way to mark the function.` },
        { add: 6, why: `Do the results match?`, missing: `Every test would print the same thing.` },
        { add: 7, why: `Yes: the test passes.`, missing: `The <code>if</code> would have no body.` },
        { add: 8, why: `Otherwise…`, missing: `A wrong answer would print nothing.` },
        { add: 9, why: `…it fails, and showing the value we got points to the bug.`, missing: `The <code>else</code> would have no body.` },
        { add: 12, why: `An ordinary case.`, missing: `One fewer check.` },
        { add: 13, why: `An edge case: 0.`, missing: `A bug that only shows up for 0 would be missed.` },
        { add: 14, why: `Another edge case: a negative number.`, missing: `A bug that only shows up for negatives would be missed.` }
      ],
      trace: {
        cols: ['n', 'got', 'expected'],
        note: `Each test row calls <code>double</code> first, then passes the result into <code>check</code> as <code>got</code>.`
      },
      mistakes: [
        { title: 'A function that adds instead of doubling', bad: 2, code: `def double(n):
    return n + 2


def check(name, got, expected):
    if got == expected:
        print("PASS", name)
    else:
        print("FAIL", name, "- got", got)


check("double(3) is 6", double(3), 6)
check("double(2) is 4", double(2), 4)`, out: `FAIL double(3) is 6 - got 5\nPASS double(2) is 4`,
          why: `2 + 2 and 2 × 2 are both 4, so one test passes by luck. That's why a set of tests uses several different values — one passing test proves very little.` },
        { title: 'Printing instead of returning', bad: 2, code: `def double(n):
    print(n * 2)


def check(name, got, expected):
    if got == expected:
        print("PASS", name)
    else:
        print("FAIL", name, "- got", got)


check("double(3) is 6", double(3), 6)`, out: `6\nFAIL double(3) is 6 - got None`,
          why: `The 6 appears on screen, but the function gives back <code>None</code>, so the test fails. Tests check what a function <b>returns</b> — the most common reason for a Try it test to fail.` },
        { title: 'A test with the wrong expected value', bad: 12, code: `def double(n):
    return n * 2


def check(name, got, expected):
    if got == expected:
        print("PASS", name)
    else:
        print("FAIL", name, "- got", got)


check("double(3) is 5", double(3), 5)`, out: `FAIL double(3) is 5 - got 6`,
          why: `Here the function is right and the test is wrong. When you write your own tests, work out the expected value by hand first.` }
      ],
      nobuiltins: { none: `Nothing to change — no built-ins are used.` },
      tip: `In Try it, a failing test shows what it checks and the most likely bug; the model solution unlocks when you ask for it. In exams, nobody runs your code — so practise reading your answer as a test would: try a normal value and an edge case by hand.`
    }
  ]
});
