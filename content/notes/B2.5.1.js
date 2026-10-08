/* "Build it from scratch" notes — B2.5.1 Text files. Format: see widgets/notes.js. */
CodeCraft.addNotes('B2.5.1', {
  intro: `<p>Variables disappear when a program ends; a <span class="term">file</span> keeps data for next time. <code>open(name, mode)</code> opens a file: <b>"r"</b> reads (the file must exist), <b>"w"</b> writes (it <b>empties</b> the file first, or creates it), <b>"a"</b> appends (adds to the end, or creates it).</p>
  <p>Reading: <code>read()</code> gives the whole file as one string, <code>readline()</code> the next line, <code>readlines()</code> a list of lines, and <code>for line in f</code> loops over the lines one at a time. Every line read keeps its <code>"\\n"</code> at the end — <code>.strip()</code> removes it. Writing: <code>write(text)</code> writes exactly what you give it — add <code>"\\n"</code> yourself. Close the file when done, or use <code>with</code>, which closes it for you. On this site the files are virtual: open the editor's <b>Files</b> tab to see them.</p>`,
  programs: [
    {
      title: 'Average and top score from a CSV file',
      goal: `<p><code>scores.txt</code> has one student per line, as <code>name,score</code>. Read it, print the average score and the student with the highest score, and print a clear message if the file is missing.</p>`,
      input: `the file <code>scores.txt</code>`,
      output: `<code>Average: 72.0</code> and <code>Top: Carla 91</code>`,
      files: { 'scores.txt': 'Aiko,78\nBen,64\nCarla,91\nDev,55\n' },
      think: [
        `Loop over the file's lines with <code>for line in f</code>.`,
        `Each line is text like "Aiko,78\\n": <code>.strip()</code> removes the newline, <code>.split(",")</code> cuts it at the comma into <code>["Aiko", "78"]</code>, and the two parts go into two variables.`,
        `The score is still text, so convert it with <code>int()</code> before adding or comparing.`,
        `Inside the same loop, keep a running total, a count, and the best score with its name (the maximum pattern).`,
        `Put it all in <code>try</code> with <code>except FileNotFoundError</code>, because a missing file is a point of failure.`
      ],
      works: `every line is read exactly once and split into the same two fields, so each score is added to the total and compared with the best exactly once — the same patterns as with a list, but the data comes from the file.`,
      vars: [
        ['total, count', 'int', 'for the average'],
        ['best, best_name', 'int, str', 'the highest score so far and whose it is'],
        ['f', 'file', 'the open file (closed automatically by <code>with</code>)'],
        ['line', 'str', 'one line, e.g. "Aiko,78\\n"'],
        ['name, score', 'str, then int', 'the two fields; <code>score</code> is converted to an int']
      ],
      code: `total = 0
count = 0
best_name = ""
best = -1
try:
    with open("scores.txt", "r") as f:
        for line in f:
            name, score = line.strip().split(",")
            score = int(score)
            total = total + score
            count = count + 1
            if score > best:
                best = score
                best_name = name
    print("Average:", total / count)
    print("Top:", best_name, best)
except FileNotFoundError:
    print("scores.txt not found")`,
      out: `Average: 72.0\nTop: Carla 91`,
      build: [
        { add: 1, why: `Running total of the scores.`, missing: `<code>total + score</code> crashes with a <code>NameError</code>.` },
        { add: 2, why: `How many lines (students) were read.`, missing: `<code>count + 1</code> crashes.` },
        { add: [5, 17], why: `<code>try</code> with its <code>except FileNotFoundError</code>, written together.`, missing: `A missing file stops the program with an error (try it: delete the file in the Files tab and run).` },
        { add: 6, why: `Open for reading. <code>with</code> closes the file for us when the block ends.`, missing: `There's nothing to read.` },
        { add: 7, why: `One line at a time.`, missing: `Only the first line (or none) would be used.` },
        { add: 8, why: `"Aiko,78\\n" → strip → "Aiko,78" → split at "," → ["Aiko", "78"] → name = "Aiko", score = "78".`, missing: `Without <code>.split(",")</code> there is only one value to unpack into two variables (see mistake 2). Splitting on the wrong character fails too (see mistake 4).` },
        { add: 9, why: `"78" is text; <code>int()</code> makes it the number 78.`, missing: `<code>total + score</code> tries to add text to a number: <code>TypeError</code> (see mistake 1).` },
        { add: 10, why: `Add it to the total.`, missing: `The total stays 0.` },
        { add: 11, why: `Count the line.`, missing: `<code>count</code> stays 0 and the average divides by zero.` },
        { add: 15, why: `After the <code>with</code> block (file read and closed), print the average. Run this stage: 72.0.`, missing: `Inside the loop it would print after every line.` },
        { add: 3, why: `The name that goes with the best score.`, missing: `<code>best_name</code> is undefined if no line is read.` },
        { add: 4, why: `Lower than any real score, so the first student always becomes the best.`, missing: `<code>score &gt; best</code> crashes with a <code>NameError</code>.` },
        { add: 12, why: `The maximum pattern, inside the same loop.`, missing: `The top student can't be found.` },
        { add: 13, why: `A new highest score…`, missing: `<code>best</code> stays -1.` },
        { add: 14, why: `…and whose it is.`, missing: `The name stays "".` },
        { add: 16, why: `Show the top student.`, missing: `The best is found but never shown.` },
        { add: 18, why: `The message if the file isn't there.`, missing: `The <code>except</code> would have no body.` }
      ],
      trace: {
        cols: ['line', 'name', 'score', 'total', 'best'],
        note: `<code>line</code> is shown with its <code>\\n</code>, and <code>score</code> changes twice per line: first to the string '78', then to the int 78. Watch the quotes disappear.`
      },
      mistakes: [
        { title: 'Adding the score while it\'s still text', bad: 5, code: `total = 0
with open("scores.txt", "r") as f:
    for line in f:
        name, score = line.strip().split(",")
        total = total + score
print(total)`, error: 'TypeError', errorText: "unsupported operand type(s) for +: 'int' and 'str'",
          why: `Everything read from a text file is a string. <code>score</code> is "78", so it must be converted with <code>int()</code> before any arithmetic.` },
        { title: 'Forgetting to split the line', bad: 4, code: `total = 0
with open("scores.txt", "r") as f:
    for line in f:
        name, score = line.strip()
        total = total + int(score)
print(total)`, error: 'ValueError', errorText: 'too many values to unpack (expected 2)',
          why: `<code>line.strip()</code> is one string, "Aiko,78". Unpacking a string into two variables takes it character by character — far too many. <code>.split(",")</code> makes the two-item list.` },
        { title: 'Reading the file twice', bad: 3, code: `count = 0
with open("scores.txt", "r") as f:
    print(f.read())
    for line in f:
        count = count + 1
print("Lines counted:", count)`, out: `Aiko,78\nBen,64\nCarla,91\nDev,55\n\nLines counted: 0`,
          why: `<code>read()</code> reads to the end of the file, and the file remembers its position, so the <code>for</code> loop finds nothing left. Read once — or open the file again. (The blank line is the file's last "\\n" plus print's own.)` },
        { title: 'Splitting on the wrong character', bad: 4, code: `total = 0
with open("scores.txt", "r") as f:
    for line in f:
        name, score = line.strip().split(" ")
        total = total + int(score)
print(total)`, error: 'ValueError', errorText: 'not enough values to unpack (expected 2, got 1)',
          why: `The fields are separated by commas, not spaces, so <code>split(" ")</code> returns the whole line as one item. Split on the separator the file actually uses.` }
      ],
      nobuiltins: { none: `Nothing to change: the loop already finds the top score without <code>max()</code>, and the average without <code>sum()</code> or <code>len()</code>. File methods like <code>open</code>, <code>strip</code> and <code>split</code> are needed to read the data.` },
      tip: `File-processing construct questions usually give marks for: opening in the right mode, looping over the lines, splitting each line and converting the numbers, the processing (total, count, maximum…), closing the file (or using <code>with</code>), and output. Name the separator you split on and convert before comparing.`
    },
    {
      title: 'Append to a visit log, then read it back',
      goal: `<p>Each time the program runs, it asks for a name, <b>adds</b> it to the end of <code>visits.txt</code> without deleting the earlier visits, then reads the file back and numbers every visit.</p>`,
      input: `a name, e.g. Carla — and <code>visits.txt</code>, which already has Aiko and Ben`,
      output: `the numbered list of visits and <code>Visits so far: 3</code>`,
      files: { 'visits.txt': 'Aiko\nBen\n' },
      inputs: ['Carla'],
      think: [
        `Keep the old visits: open in <b>append</b> mode, <code>"a"</code>. (Mode "w" would empty the file first.)`,
        `<code>write()</code> doesn't add a new line, so write <code>name + "\\n"</code> — one visit per line.`,
        `Close the file after writing, so the data is saved before we read it.`,
        `Open it again in "r" mode and loop over the lines, counting as we go.`
      ],
      works: `append mode always writes after the existing contents, and every name ends with a newline, so the file is always one visit per line; reading it back gives every visit, oldest first.`,
      vars: [
        ['name', 'str', 'the name typed'],
        ['log', 'file', 'the file opened for appending'],
        ['count', 'int', 'numbers the visits'],
        ['line', 'str', 'one line of the file']
      ],
      code: `name = input("Your name: ")
log = open("visits.txt", "a")
log.write(name + "\\n")
log.close()
count = 0
with open("visits.txt", "r") as f:
    for line in f:
        count = count + 1
        print(count, line.strip())
print("Visits so far:", count)`,
      out: `Your name: Carla\n1 Aiko\n2 Ben\n3 Carla\nVisits so far: 3`,
      build: [
        { add: 1, why: `The name to log.`, missing: `<code>name + "\\n"</code> crashes with a <code>NameError</code>.` },
        { add: 2, why: `<code>"a"</code>: add to the end, keeping what's there. (If the file didn't exist, "a" would create it.)`, missing: `With <code>"w"</code>, the file is emptied first and only the newest visit survives (see mistake 1).` },
        { add: 3, why: `Write the name and a newline, so the next visit starts on its own line. Open the Files tab after running to see it.`, missing: `Without <code>"\\n"</code>, the next name is joined onto this one (see mistake 2). Passing two arguments, <code>write(name, "\\n")</code>, is an error (see mistake 4).` },
        { add: 4, why: `Close the file: this makes sure everything is saved.`, missing: `In real Python, unsaved data may not be in the file yet when you read it. <code>with</code> avoids having to remember.` },
        { add: 5, why: `A counter for numbering the visits.`, missing: `<code>count + 1</code> crashes.` },
        { add: 6, why: `Open the same file again, this time to read it.`, missing: `The log is written but never shown.` },
        { add: 7, why: `One visit per line.`, missing: `Only one line could be shown.` },
        { add: 8, why: `Count this visit.`, missing: `Every visit would be numbered 0.` },
        { add: 9, why: `<code>.strip()</code> removes the line's own newline, so <code>print</code> doesn't add a blank line after each name.`, missing: `Without <code>.strip()</code>, the output is double-spaced.` },
        { add: 10, why: `After the loop: the total.`, missing: `The total is never shown.` }
      ],
      trace: {
        cols: ['count', 'line'],
        note: `The file now has three lines: the two it started with, plus Carla added at the end by append mode.`
      },
      mistakes: [
        { title: '"w" where "a" was needed', bad: 2, code: `name = input("Your name: ")
log = open("visits.txt", "w")
log.write(name + "\\n")
log.close()
with open("visits.txt", "r") as f:
    print(f.read())`, out: `Your name: Carla\nCarla`,
          why: `Opening with "w" empties the file straight away, so Aiko's and Ben's visits are lost. To add to a file, use "a".` },
        { title: 'Forgetting the newline', bad: 2, code: `log = open("visits.txt", "a")
log.write("Carla")
log.write("Dev")
log.close()
with open("visits.txt", "r") as f:
    print(f.read())`, out: `Aiko\nBen\nCarlaDev`,
          why: `<code>write</code> writes exactly what it's given — no newline is added. Carla and Dev end up on one line, as one "visit". Write <code>name + "\\n"</code>.` },
        { title: 'Reading a file that doesn\'t exist yet', bad: 1, files: {}, code: `with open("visits.txt", "r") as f:
    print(f.read())`, error: 'FileNotFoundError', errorText: "No such file or directory: 'visits.txt'",
          why: `Mode "r" needs the file to exist already; only "w" and "a" create a missing file. Use try/except FileNotFoundError when a file might be missing.` },
        { title: 'Giving write() two arguments', bad: 3, code: `name = input("Your name: ")
log = open("visits.txt", "a")
log.write(name, "\\n")
log.close()`, error: 'TypeError', errorText: 'write() takes exactly one argument (2 given)',
          why: `Unlike <code>print</code>, <code>write</code> takes one string. Join the pieces first: <code>log.write(name + "\\n")</code>.` }
      ],
      nobuiltins: { none: `Nothing to change: file operations are never banned, and the counter already replaces <code>len(f.readlines())</code>.` },
      tip: `"Describe the difference between modes" answers usually want the effect on existing data: "w" deletes it, "a" keeps it and adds to the end, "r" only reads (and fails if the file is missing). In code questions, remember the <code>"\\n"</code> when writing and <code>.strip()</code> when reading.`
    }
  ]
});
