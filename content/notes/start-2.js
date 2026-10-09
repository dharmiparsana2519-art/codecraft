/* "Build it from scratch" notes — start-2 Your first program. Format: see widgets/notes.js. */
CodeCraft.addNotes('start-2', {
  intro: `<p><code>print()</code> shows values in the console. Separate several values with commas and Python puts one space between them. A <span class="term">comment</span> starts with <code>#</code>: Python ignores everything after it on that line, so it is for people reading the code.</p>
  <p>Python doesn't make you <b>declare</b> a variable or its type before using it: <code>students = 640</code> creates the variable, and Python works out from the value that it is an integer. Many other languages make you write the type first — so in IB exam answers it is good practice to <b>state the data type in a comment</b>, as the program below does.</p>`,
  programs: [
    {
      title: 'A school information card',
      goal: `<p>Store four facts about a school — its name, number of students, average mark and whether it is open today — each in a variable of the right type, and print them on separate lines.</p>`,
      input: `none: the values are written in the program`,
      output: `four labelled lines, e.g. <code>Students: 640</code>`,
      think: [
        `Choose a type for each fact: text is a string (in quotes), a whole number is an int, a number with a decimal point is a float, and yes/no is a Boolean (<code>True</code> or <code>False</code>, no quotes).`,
        `Create each variable by assignment — no declaration needed — and note its type in a comment.`,
        `Print each one with a label, using commas so Python adds the space.`
      ],
      works: `each value is stored with the type that matches what it means, and print converts every type to text for you when values are separated by commas.`,
      vars: [
        ['school', 'str', 'text — needs quotes'],
        ['students', 'int', 'a whole number'],
        ['average', 'float', 'a number with a decimal point'],
        ['open_today', 'bool', 'True or False, written without quotes']
      ],
      code: `# A short program about our school
school = "Hillside"  # str
students = 640  # int
average = 72.5  # float
open_today = True  # bool
print("School:", school)
print("Students:", students)
print("Average mark:", average)
print("Open today?", open_today)`,
      out: `School: Hillside\nStudents: 640\nAverage mark: 72.5\nOpen today? True`,
      build: [
        { add: 1, why: `A comment saying what the program is for. Python skips it.`, missing: `The program works the same — but the next reader has to work out what it does.` },
        { add: 2, why: `Text in quotes: a string. The comment states the type.`, missing: `Without quotes, Python looks for a variable called Hillside and crashes with a <code>NameError</code> (see mistake 1).` },
        { add: 3, why: `A whole number: an int. No quotes — with them it would be the text "640".`, missing: `<code>students</code> crashes the print with a <code>NameError</code>.` },
        { add: 4, why: `A decimal number: a float.`, missing: `<code>average</code> crashes the print with a <code>NameError</code>.` },
        { add: 5, why: `A Boolean: <code>True</code> with a capital T and no quotes.`, missing: `<code>true</code> in lower case is a <code>NameError</code> — Python is case-sensitive.` },
        { add: 6, why: `A label and a value, separated by a comma: Python adds the space.`, missing: `The school name is stored but never shown.` },
        { add: 7, why: `print can show an int directly when it is separated by a comma.`, missing: `Joining with <code>+</code> instead fails, because you can't add text and a number (see mistake 3).` },
        { add: 8, why: `Floats print with their decimal point.`, missing: `The average is never shown.` },
        { add: 9, why: `A Boolean prints as True or False.`, missing: `The last fact is never shown.` }
      ],
      trace: {
        cols: ['school', 'students', 'average', 'open_today'],
        note: `Look at how each value is written in the table: the string in quotes, the numbers without, and True as a Boolean — that's how you can tell their types apart.`
      },
      mistakes: [
        { title: 'Text without quotes', bad: 1, code: `school = Hillside
print("School:", school)`, error: 'NameError', errorText: "name 'Hillside' is not defined",
          why: `Without quotes, <code>Hillside</code> is treated as a variable name, and no such variable exists. Text values always need quotes.` },
        { title: 'Print with a capital P', bad: 2, code: `students = 640
Print("Students:", students)`, error: 'NameError', errorText: "name 'Print' is not defined",
          why: `Python is case-sensitive: <code>print</code> and <code>Print</code> are different names, and only the lower-case one exists.` },
        { title: 'Joining a number to text with +', bad: 2, code: `students = 640
print("Students: " + students)`, error: 'TypeError', errorText: 'can only concatenate str (not "int") to str',
          why: `<code>+</code> can join two strings, but not a string and an int. Use a comma — <code>print("Students:", students)</code> — or convert with <code>str(students)</code>.` },
        { title: 'Quotes around a number', bad: 1, code: `students = "640"
print(students + 1)`, error: 'TypeError', errorText: 'can only concatenate str (not "int") to str',
          why: `In quotes, "640" is a string, so you can't do arithmetic with it. The type comes from how the value is written.` }
      ],
      nobuiltins: { none: `Nothing to change — <code>print</code> is never banned.` },
      tip: `If a question asks you to state the data type of a variable, use the IB names — string, integer, float (decimal), Boolean, char. When you write code in an exam, a short comment like <code># int</code> after an assignment shows the examiner you know the type, even though Python doesn't need it.`
    }
  ]
});
