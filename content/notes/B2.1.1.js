/* "Build it from scratch" notes — B2.1.1 Variables & data types. Format: see widgets/notes.js. */
CodeCraft.addNotes('B2.1.1', {
  intro: `<p>A <span class="term">variable</span> is a name that refers to a value. You create it by <b>assignment</b>: <code>age = 17</code>. Python works out the data type from the value, so you never declare it — but you still need to know it, because the type decides what you can do with the value.</p>
  <p>IB uses five basic types. In Python: <b>integer</b> → <code>int</code> (17), <b>decimal</b> → <code>float</code> (78.5), <b>string</b> → <code>str</code> ("Aiko"), <b>Boolean</b> → <code>bool</code> (True/False), and <b>char</b> — Python has no separate char type, so a single character is a <code>str</code> of length 1. <code>input()</code> always gives a string, so <b>casting</b> with <code>int()</code>, <code>float()</code> and <code>str()</code> is something almost every program needs.</p>`,
  programs: [
    {
      title: 'Minutes into hours and minutes',
      goal: `<p>A student types how many minutes they revised this week. Show it as hours and minutes, and as a percentage of a 600-minute weekly goal.</p>`,
      input: `a whole number of minutes, typed at the keyboard, e.g. 135`,
      output: `<code>135 minutes is 2 h 15 min</code> and <code>That is 22.5 % of the weekly goal</code>`,
      think: [
        `<code>input()</code> gives text, e.g. "135". We need to do arithmetic, so cast it to an <code>int</code> straight away.`,
        `Whole hours = how many complete 60s fit in the minutes: integer division, <code>//</code>.`,
        `Minutes left over = the <b>remainder</b> after dividing by 60: modulus, <code>%</code>.`,
        `The percentage = minutes × 100 ÷ goal. Ordinary division <code>/</code> gives a float, which can have a decimal part.`
      ],
      works: `for any whole number n, <code>n // 60</code> counts the complete hours and <code>n % 60</code> is what is left, so 60 × hours + minutes always equals n.`,
      vars: [
        ['total_minutes', 'int', 'the minutes typed — cast with <code>int()</code> so we can do arithmetic'],
        ['hours', 'int', '<code>//</code> of two ints is an int'],
        ['minutes', 'int', '<code>%</code> of two ints is an int, always 0–59 here'],
        ['goal', 'int', 'the weekly target, 600 minutes'],
        ['percent', 'float', '<code>/</code> always gives a float, e.g. 22.5']
      ],
      code: `total_minutes = int(input("Minutes spent revising: "))
hours = total_minutes // 60
minutes = total_minutes % 60
goal = 600
percent = total_minutes * 100 / goal
print(total_minutes, "minutes is", hours, "h", minutes, "min")
print("That is", percent, "% of the weekly goal")`,
      inputs: ['135'],
      out: `Minutes spent revising: 135\n135 minutes is 2 h 15 min\nThat is 22.5 % of the weekly goal`,
      build: [
        { add: 1, why: `Ask for the minutes and cast the answer to an int in the same line. <code>input()</code> runs first, then <code>int()</code> converts its text.`, missing: `Without <code>int()</code>, <code>total_minutes</code> is the string "135" and the next line crashes with a <code>TypeError</code> (see mistake 1).` },
        { add: 2, why: `<code>135 // 60</code> is 2: integer division keeps only the whole number of hours.`, missing: `With <code>/</code> instead you get 2.25 hours, which is not "2 h" (see mistake 2).` },
        { add: 3, why: `<code>135 % 60</code> is 15: the remainder once the 2 complete hours (120 minutes) are taken away.`, missing: `Written the other way round, <code>60 % total_minutes</code>, it gives the wrong remainder (see mistake 3).` },
        { add: 4, why: `Store the goal in a variable rather than typing 600 inside the formula: the code says what the number means, and it is easy to change.`, missing: `The next line crashes with a <code>NameError</code>.` },
        { add: 5, why: `Multiply first, then divide: 135 × 100 = 13500, ÷ 600 = 22.5. <code>/</code> gives a float.`, missing: `With <code>//</code> the answer is 22 — the .5 is thrown away.` },
        { add: 6, why: `<code>print</code> with commas joins values of any type, putting a space between each.`, missing: `Nothing is shown.` },
        { add: 7, why: `Show the percentage. Commas again, so the float doesn't need converting.`, missing: `Joining with <code>+</code> instead needs <code>str(percent)</code>, or it crashes (see mistake 4).` }
      ],
      trace: {
        cols: ['total_minutes', 'hours', 'minutes', 'goal', 'percent'],
        note: `Each line gives one variable its value, top to bottom — this is a <b>sequence</b>. Notice that <code>hours</code> and <code>minutes</code> are ints but <code>percent</code> is a float.`
      },
      mistakes: [
        { title: 'Forgetting to cast the input', bad: 1, code: `total_minutes = input("Minutes spent revising: ")
hours = total_minutes // 60
print(hours)`, error: 'TypeError', errorText: "unsupported operand type(s) for //: 'str' and 'int'",
          why: `<code>input()</code> always returns a <code>str</code>. You can't divide text, so cast it: <code>int(input(...))</code>.` },
        { title: 'Using / for whole hours', bad: 2, code: `total_minutes = int(input("Minutes spent revising: "))
hours = total_minutes / 60
minutes = total_minutes % 60
print(total_minutes, "minutes is", hours, "h", minutes, "min")`, out: `Minutes spent revising: 135\n135 minutes is 2.25 h 15 min`,
          why: `<code>/</code> is ordinary division and always gives a float: 2.25. Integer division <code>//</code> gives the 2 complete hours.` },
        { title: 'Modulus the wrong way round', bad: 3, code: `total_minutes = int(input("Minutes spent revising: "))
hours = total_minutes // 60
minutes = 60 % total_minutes
print(total_minutes, "minutes is", hours, "h", minutes, "min")`, out: `Minutes spent revising: 135\n135 minutes is 2 h 60 min`,
          why: `<code>a % b</code> is the remainder when a is divided by b. <code>60 % 135</code> divides 60 by 135, leaving 60. You want <code>total_minutes % 60</code>.` },
        { title: 'Joining a number to a string with +', bad: 3, code: `total_minutes = int(input("Minutes spent revising: "))
percent = total_minutes * 100 / 600
print("That is " + percent + " % of the weekly goal")`, error: 'TypeError', errorText: 'can only concatenate str (not "float") to str',
          why: `<code>+</code> between two strings joins them, but between a string and a float it is an error. Cast first: <code>str(percent)</code>, or use commas in <code>print</code>.` }
      ],
      nobuiltins: { none: `Nothing to change: <code>int</code>, <code>input</code> and <code>print</code> are never banned. (If an exam bans <code>//</code> or <code>%</code>, you can subtract 60 in a loop, counting the hours — but that is rare.)` },
      tip: `"State the data type" questions want the IB name — integer, decimal/float, string, Boolean or char. In construct questions, a mark is often given for converting input correctly (<code>int(input(...))</code>), and Paper 2 questions about <code>//</code> and <code>%</code> usually test an example where the remainder isn't 0, like 135.`
    },
    {
      title: 'One record, five data types',
      goal: `<p>Read a student's name, age and average mark, then show each value with its data type. Work out the first initial, whether they are an adult, and their age next year.</p>`,
      input: `a name, an age and an average mark, e.g. <code>Aiko</code>, <code>17</code>, <code>78.5</code>`,
      output: `each value with <code>type()</code>, then <code>Next year Aiko will be 18</code>`,
      think: [
        `Decide the type each value needs: a name is a string, an age is a whole number (int), an average can have decimals (float).`,
        `Cast each input to the type it needs: leave the name as it is, use <code>int()</code> for the age and <code>float()</code> for the mark.`,
        `The initial is one character: index 0 of the name. Python stores it as a <code>str</code> of length 1 — IB's "char".`,
        `"Is an adult" is a yes/no fact, so store it as a Boolean: the comparison <code>age &gt;= 18</code> is already <code>True</code> or <code>False</code>.`,
        `To join the age into a sentence with <code>+</code>, turn it back into a string with <code>str()</code>.`
      ],
      works: `every value is stored in the type that matches what it means, so each operation (arithmetic on the age, comparing it, joining text) is allowed. <code>type()</code> lets us check.`,
      vars: [
        ['name', 'str', 'text: no cast needed, <code>input()</code> already gives a string'],
        ['age', 'int', 'a whole number, so we can add 1 and compare it'],
        ['average', 'float', 'a mark like 78.5 has a decimal part'],
        ['initial', 'str (a "char")', 'one character, <code>name[0]</code>'],
        ['is_adult', 'bool', 'True or False — the result of a comparison']
      ],
      code: `name = input("Name: ")
age = int(input("Age: "))
average = float(input("Average mark: "))
initial = name[0]
is_adult = age >= 18
print(initial, type(initial))
print(age, type(age))
print(average, type(average))
print(is_adult, type(is_adult))
print("Next year " + name + " will be " + str(age + 1))`,
      inputs: ['Aiko', '17', '78.5'],
      out: `Name: Aiko\nAge: 17\nAverage mark: 78.5\nA <class 'str'>\n17 <class 'int'>\n78.5 <class 'float'>\nFalse <class 'bool'>\nNext year Aiko will be 18`,
      build: [
        { add: 1, why: `A name is text, and <code>input()</code> already returns a string, so no cast.`, missing: `Later lines that use <code>name</code> crash with a <code>NameError</code>.` },
        { add: 2, why: `An age is a whole number, so cast to <code>int</code>.`, missing: `Without the cast, <code>age</code> is "17" and <code>age + 1</code> crashes (see mistake 1).` },
        { add: 3, why: `78.5 has a decimal part, so cast to <code>float</code>.`, missing: `<code>int("78.5")</code> crashes with a <code>ValueError</code> — <code>int()</code> only accepts whole-number text (see mistake 2).` },
        { add: 4, why: `Index 0 is the first character. Indexes start at 0, not 1.`, missing: `<code>name[1]</code> would give "i", the second letter (see mistake 4).` },
        { add: 5, why: `A comparison is a Boolean expression: it is worked out to <code>True</code> or <code>False</code> and stored.`, missing: `Putting it in quotes stores the text "age &gt;= 18" instead of a Boolean (see mistake 3).` },
        { add: 6, why: `<code>type()</code> tells you the type of a value. A single character is still a <code>str</code>.`, missing: `Above line 4 it crashes with a <code>NameError</code>: a variable must be given a value before it is used.` },
        { add: 7, why: `The cast worked: <code>int</code>.`, missing: `You'd lose a quick check. <code>print(type(x))</code> is the fastest way to find out why a calculation fails.` },
        { add: 8, why: `And <code>float</code>.`, missing: `If line 3 had no cast, this would show <code>&lt;class 'str'&gt;</code> — the clue that a cast is missing.` },
        { add: 9, why: `17 &gt;= 18 is <code>False</code>, of type <code>bool</code>.`, missing: `You wouldn't see that a comparison gives a Boolean value, not the text "False".` },
        { add: 10, why: `<code>age + 1</code> is arithmetic (18), then <code>str()</code> turns it into "18" so <code>+</code> can join it to the other strings.`, missing: `Without <code>str()</code>: a <code>TypeError</code>, because you can't join a string and an int with <code>+</code>.` }
      ],
      trace: {
        cols: ['name', 'age', 'average', 'initial', 'is_adult'],
        note: `Look at how each value is written: strings in quotes (<code>'Aiko'</code>), numbers without, and <code>False</code> as a Boolean — not the string "False".`
      },
      mistakes: [
        { title: 'Doing arithmetic on the text from input()', bad: 2, code: `name = input("Name: ")
age = input("Age: ")
print("Next year " + name + " will be " + str(age + 1))`, error: 'TypeError', errorText: 'can only concatenate str (not "int") to str',
          why: `<code>age</code> is the string "17", so <code>age + 1</code> tries to join text and a number. Cast when you read it: <code>int(input(...))</code>.` },
        { title: 'Casting a decimal with int()', bad: 1, inputs: ['78.5'], code: `average = int(input("Average mark: "))
print(average)`, error: 'ValueError', errorText: "invalid literal for int() with base 10: '78.5'",
          why: `<code>int()</code> can't read "78.5" — the text isn't a whole number. Use <code>float()</code> for values that can have decimals.` },
        { title: 'Storing a condition as text', bad: 2, inputs: ['17'], code: `age = int(input("Age: "))
is_adult = "age >= 18"
print(is_adult, type(is_adult))`, out: `Age: 17\nage >= 18 <class 'str'>`,
          why: `The quotes make it a string, so Python never works out the comparison. Without quotes, <code>age &gt;= 18</code> is a Boolean expression.` },
        { title: 'Counting indexes from 1', bad: 2, inputs: ['Aiko'], code: `name = input("Name: ")
initial = name[1]
print(initial)`, out: `Name: Aiko\ni`,
          why: `The first character is at index 0. <code>name[1]</code> is the <em>second</em> character.` }
      ],
      nobuiltins: { none: `Nothing to change: <code>int</code>, <code>float</code>, <code>str</code>, <code>input</code> and <code>type</code> aren't banned in exams.` },
      tip: `Questions often show a line like <code>x = "5"</code> and ask for the data type (string — the quotes decide it) or ask what <code>x + 1</code> does (an error). For "construct" answers, cast input as you read it, and use <code>str()</code> or commas when printing numbers with text.`
    }
  ]
});
