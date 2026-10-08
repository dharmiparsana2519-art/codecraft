/* "Build it from scratch" notes — B2.1.2 Substrings. Format: see widgets/notes.js. */
CodeCraft.addNotes('B2.1.2', {
  intro: `<p>A string is a sequence of characters, each with an <span class="term">index</span>: 0 for the first, 1 for the second… and -1 for the last, -2 for the one before. A <b>substring</b> is part of a string, taken with a <b>slice</b>: <code>s[a:b]</code> gives the characters from index a up to, but <b>not including</b>, index b. Leave out a to start at the beginning, or b to go to the end.</p>
  <p>Strings are <b>immutable</b>: methods like <code>.upper()</code>, <code>.strip()</code> and <code>.replace()</code> never change the string — they return a new one, which you must store. Exams often ban the shortcuts, so the second program does its work with a loop.</p>`,
  programs: [
    {
      title: 'Make a username from a full name',
      goal: `<p>A school makes usernames from a student's full name: the first initial, the first four letters of the surname, and the last two digits of the year, all in lower case. "Aiko Tanaka" in 2027 becomes <code>atana27</code>.</p>`,
      input: `a full name with one space, possibly with extra spaces round it, e.g. <code>"  Aiko Tanaka"</code>`,
      output: `the first name, the last name and the username`,
      think: [
        `Remove any spaces at the ends with <code>.strip()</code>, so the only space left is the one between the names.`,
        `Find where that space is with <code>.find(" ")</code>. It returns the space's index.`,
        `The first name is everything <b>before</b> the space: <code>[:space]</code>. The last name starts one <b>after</b> it: <code>[space + 1:]</code>.`,
        `Build the username from pieces: <code>first[0]</code>, <code>last[:4]</code> and the last two characters of the year, <code>year[-2:]</code>. Make it lower case.`,
        `Store every result — string methods return new strings rather than changing the old one.`
      ],
      works: `slices use the space's index as the boundary: <code>[:space]</code> stops just before it and <code>[space + 1:]</code> starts just after it, so neither name contains the space, whatever the names' lengths.`,
      vars: [
        ['full_name', 'str', 'the name as typed, with the ends stripped'],
        ['space', 'int', 'the index of the space, from <code>.find()</code>'],
        ['first', 'str', 'the substring before the space'],
        ['last', 'str', 'the substring after the space'],
        ['year', 'str', 'a string, so we can slice its last two characters'],
        ['username', 'str', 'built up from the pieces']
      ],
      code: `full_name = input("Full name: ").strip()
space = full_name.find(" ")
first = full_name[:space]
last = full_name[space + 1:]
username = (first[0] + last[:4]).lower()
year = "2027"
username = username + year[-2:]
print("First name:", first)
print("Last name:", last)
print("Username:", username)`,
      inputs: ['  Aiko Tanaka'],
      out: `Full name:   Aiko Tanaka\nFirst name: Aiko\nLast name: Tanaka\nUsername: atana27`,
      build: [
        { add: 1, why: `Read the name and strip spaces off both ends in one go. <code>.strip()</code> returns a new string, which is what gets stored.`, missing: `Without <code>.strip()</code>, a leading space is found first, the first name is empty, and <code>first[0]</code> crashes (see mistake 2).` },
        { add: 2, why: `<code>.find(" ")</code> gives the index of the first space: 4 in "Aiko Tanaka". (It gives -1 if there is no space.)`, missing: `The slices on the next lines would have no boundary to use.` },
        { add: 3, why: `<code>[:4]</code> is indexes 0–3: "Aiko". The end index is <b>not</b> included, so the space isn't either.`, missing: `<code>[:space + 1]</code> would include the space: "Aiko ".` },
        { add: 4, why: `Start one past the space and go to the end: "Tanaka".`, missing: `<code>[space:]</code> includes the space: " Tanaka" (see mistake 1).` },
        { add: 5, why: `Join the first initial and the first 4 letters of the surname ("A" + "Tana"), then <code>.lower()</code> the result: "atana". The brackets make <code>.lower()</code> apply to the whole joined string.`, missing: `Calling <code>username.lower()</code> on a line of its own changes nothing — strings are immutable (see mistake 3).` },
        { add: 6, why: `The year as a <b>string</b>, so it can be sliced.`, missing: `As an int (<code>2027</code>), <code>year[-2:]</code> crashes with a <code>TypeError</code>: numbers can't be sliced.` },
        { add: 7, why: `<code>[-2:]</code> is the last two characters: "27". Negative indexes count from the end.`, missing: `<code>year[-2]</code> (an index, not a slice) gives just "2", the second-last character — see mistake 4.` },
        { add: 8, why: `Show the first name…`, missing: `The program would work it out but never show it.` },
        { add: 9, why: `…the last name…`, missing: `The same.` },
        { add: 10, why: `…and the finished username.`, missing: `The same — and the username is the whole point of the program.` }
      ],
      trace: {
        cols: ['space', 'first', 'last', 'year', 'username'],
        note: `<code>space</code> is a number (an index); everything else is a string. <code>username</code> changes twice: first "atana", then "atana27".`
      },
      mistakes: [
        { title: 'Starting the slice at the space', bad: 4, code: `full_name = "Aiko Tanaka"
space = full_name.find(" ")
first = full_name[:space]
last = full_name[space:]
username = (first[0] + last[:4]).lower()
print("[" + last + "]")
print(username)`, out: `[ Tanaka]\na tan`,
          why: `<code>[space:]</code> starts <b>at</b> the space, so the surname begins with it (the brackets show it), and the username gets a space too. Start at <code>space + 1</code>.` },
        { title: 'Not stripping the input', bad: 1, code: `full_name = input("Full name: ")
space = full_name.find(" ")
first = full_name[:space]
print(first[0])`, error: 'IndexError', errorText: 'string index out of range',
          why: `With "  Aiko Tanaka", the first space is at index 0, so <code>first</code> is the empty string "" and it has no index 0. Strip input before searching it.` },
        { title: 'Expecting a method to change the string', bad: 4, code: `first = "Aiko"
last = "Tanaka"
username = first[0] + last[:4]
username.lower()
print(username)`, out: `ATana`,
          why: `<code>.lower()</code> returns a new lower-case string, which is thrown away here. Strings are immutable: write <code>username = username.lower()</code>.` },
        { title: 'An index where a slice was needed', bad: 3, code: `username = "atana"
year = "2027"
username = username + year[-2]
print(username)`, out: `atana2`,
          why: `<code>year[-2]</code> is <b>one</b> character, the second from the end: "2". The slice <code>year[-2:]</code> is the last two, "27".` }
      ],
      nobuiltins: {
        ban: ['find', 'index'],
        intro: `<p>If <code>.find()</code> is banned, search for the space yourself with a loop. Keep a counter for the index, and remember the first index where the character is a space:</p>`,
        code: `full_name = input("Full name: ").strip()
space = -1
i = 0
for ch in full_name:
    if ch == " " and space == -1:
        space = i
    i = i + 1
first = full_name[:space]
last = full_name[space + 1:]
username = (first[0] + last[:4]).lower()
year = "2027"
username = username + year[-2:]
print("First name:", first)
print("Last name:", last)
print("Username:", username)`,
        out: `Full name:   Aiko Tanaka\nFirst name: Aiko\nLast name: Tanaka\nUsername: atana27`,
        changes: [
          `<code>space = full_name.find(" ")</code> becomes <code>space = -1</code>: "not found yet", just like <code>find</code>'s answer when there is no space.`,
          `A counter <code>i</code> keeps the index of the character the loop is looking at.`,
          `<code>if ch == " " and space == -1</code>: store the index only for the <b>first</b> space (later spaces don't replace it).`,
          `<code>i = i + 1</code> at the end of the loop body, so <code>i</code> matches <code>ch</code>'s position. Everything after the loop is unchanged.`
        ]
      },
      tip: `Slicing questions are marked on exact results, so check both ends: the start index is included, the end index isn't. If a question says "do not use built-in string methods", loop over the characters with an index counter, as above.`
    },
    {
      title: 'Reverse a word and count a letter — with a loop',
      goal: `<p>Read a word and a letter. Without any shortcuts, build the word backwards, count how many times the letter appears, and say whether the word is a palindrome (the same backwards, like "level").</p>`,
      input: `a word and a letter, e.g. <code>Level</code> and <code>e</code>`,
      output: `<code>Backwards: level</code>, <code>e appears 2 times</code>, <code>Palindrome? True</code>`,
      think: [
        `Lower-case both inputs first, so "L" and "l" count as the same letter.`,
        `A <code>for</code> loop over a string gives one character at a time, from the first to the last.`,
        `To reverse, put each new character in <b>front</b> of what you have so far: "l", then "el", then "vel"…`,
        `To count, use the count pattern: start at 0 and add 1 whenever the character equals the letter.`,
        `After the loop, the word is a palindrome if it equals its reverse: <code>word == backwards</code> is a Boolean.`
      ],
      works: `after the loop has read k characters, <code>backwards</code> holds those k characters in reverse order, so after the last one it is the whole word reversed. The counter is increased exactly once for each matching character.`,
      vars: [
        ['word', 'str', 'the word, in lower case'],
        ['letter', 'str', 'the letter to count (a "char")'],
        ['backwards', 'str', 'built up one character at a time; starts as the empty string ""'],
        ['count', 'int', 'how many matches so far; starts at 0'],
        ['ch', 'str', 'the loop variable: one character of the word']
      ],
      code: `word = input("Word: ").lower()
letter = input("Letter to count: ").lower()
backwards = ""
count = 0
for ch in word:
    backwards = ch + backwards
    if ch == letter:
        count = count + 1
print("Backwards:", backwards)
print(letter, "appears", count, "times")
print("Palindrome?", word == backwards)`,
      inputs: ['Level', 'e'],
      out: `Word: Level\nLetter to count: e\nBackwards: level\ne appears 2 times\nPalindrome? True`,
      build: [
        { add: 1, why: `Read the word and lower-case it straight away.`, missing: `Without <code>.lower()</code>, "Level" reversed is "leveL", which isn't equal — so a real palindrome fails (see mistake 2).` },
        { add: 2, why: `The letter to count, lower-cased for the same reason.`, missing: `<code>letter</code> doesn't exist, so the comparison crashes with a <code>NameError</code>.` },
        { add: 3, why: `The reverse starts as the empty string, "", ready to have characters added.`, missing: `<code>ch + backwards</code> crashes with a <code>NameError</code>. Set inside the loop instead, it is wiped every time (see mistake 4).` },
        { add: 4, why: `The counter starts at 0, before the loop.`, missing: `<code>count + 1</code> crashes with a <code>NameError</code>.` },
        { add: 5, why: `Visit each character of the word in turn.`, missing: `Without a loop you could only look at a fixed number of characters.` },
        { add: 6, why: `New character <b>in front</b>: after "l", "e", "v" it is "vel". This is what reverses the order.`, missing: `<code>backwards + ch</code> adds it at the end, which just copies the word (see mistake 1).` },
        { add: 7, why: `Does this character match the letter? <code>==</code> compares; it doesn't assign.`, missing: `Comparing with <code>"letter"</code> in quotes compares with the six-letter word "letter" (see mistake 3).` },
        { add: 8, why: `It matches: count it. Indented under the <code>if</code>.`, missing: `Indented only under the <code>for</code>, it counts every character, giving the word's length.` },
        { add: 9, why: `After the loop the reverse is complete, so show it.`, missing: `Inside the loop it would print five times, once per character.` },
        { add: 10, why: `Show the count.`, missing: `The count would be worked out but never shown.` },
        { add: 11, why: `<code>word == backwards</code> is a Boolean expression, printed as <code>True</code> or <code>False</code>.`, missing: `<code>word = backwards</code> (one =) is not a comparison — inside <code>print</code> it is an error.` }
      ],
      trace: {
        inputs: ['Anna', 'n'],
        cols: ['ch', 'backwards', 'count'],
        note: `Each row adds one character to the <b>front</b> of <code>backwards</code>: "a", "na", "nna", "anna". The count goes up only on the rows where the condition is <code>True</code>.`
      },
      mistakes: [
        { title: 'Adding to the end instead of the front', bad: 6, inputs: ['Banana', 'a'], code: `word = input("Word: ").lower()
letter = input("Letter to count: ").lower()
backwards = ""
count = 0
for ch in word:
    backwards = backwards + ch
    if ch == letter:
        count = count + 1
print("Backwards:", backwards)
print(letter, "appears", count, "times")
print("Palindrome?", word == backwards)`, out: `Word: Banana\nLetter to count: a\nBackwards: banana\na appears 3 times\nPalindrome? True`,
          why: `<code>backwards + ch</code> rebuilds the word in its original order, so every word looks like a palindrome. Test with a word that <em>isn't</em> one, like "banana", to catch this.` },
        { title: 'Not lower-casing the word', bad: 1, code: `word = input("Word: ")
letter = input("Letter to count: ").lower()
backwards = ""
count = 0
for ch in word:
    backwards = ch + backwards
    if ch == letter:
        count = count + 1
print("Backwards:", backwards)
print(letter, "appears", count, "times")
print("Palindrome?", word == backwards)`, out: `Word: Level\nLetter to count: e\nBackwards: leveL\ne appears 2 times\nPalindrome? False`,
          why: `"L" and "l" are different characters, so "Level" and "leveL" aren't equal. Convert both to the same case before comparing.` },
        { title: 'Comparing with the word "letter"', bad: 5, code: `word = input("Word: ").lower()
letter = input("Letter to count: ").lower()
count = 0
for ch in word:
    if ch == "letter":
        count = count + 1
print(letter, "appears", count, "times")`, out: `Word: Level\nLetter to count: e\ne appears 0 times`,
          why: `With quotes, <code>"letter"</code> is a string literal, not the variable. One character can never equal a six-character string, so the count stays 0.` },
        { title: 'Resetting the result inside the loop', bad: 4, code: `word = input("Word: ").lower()
letter = input("Letter to count: ").lower()
for ch in word:
    backwards = ""
    backwards = ch + backwards
print("Backwards:", backwards)
print("Palindrome?", word == backwards)`, out: `Word: Level\nLetter to count: e\nBackwards: l\nPalindrome? False`,
          why: `<code>backwards = ""</code> runs every time round, so only the last character survives. Start values go <b>before</b> the loop.` }
      ],
      nobuiltins: {
        title: 'Built-ins: the short version, compared',
        intro: `<p>Our program already uses no shortcuts. With them, two lines do the loop's work — but exams often ban exactly these, and you need to know what they do inside:</p>`,
        code: `word = input("Word: ").lower()
letter = input("Letter to count: ").lower()
backwards = word[::-1]
count = word.count(letter)
print("Backwards:", backwards)
print(letter, "appears", count, "times")
print("Palindrome?", word == backwards)`,
        out: `Word: Level\nLetter to count: e\nBackwards: level\ne appears 2 times\nPalindrome? True`,
        changes: [
          `<code>word[::-1]</code> is a slice with a step of -1: it walks the string from the end to the start. It replaces the empty string and the <code>ch + backwards</code> line.`,
          `<code>word.count(letter)</code> counts the matches. It replaces the counter and the <code>if</code>.`,
          `So the whole loop disappears. If a question says "without using built-in functions", write the loop version.`
        ]
      },
      tip: `"Construct an algorithm to reverse a string / count a character" questions usually give marks for: an empty result string (or a counter at 0) before the loop, a loop over every character, building the result in the right order (or a correct comparison), and output after the loop. Using <code>[::-1]</code> or <code>.count()</code> when they are banned usually scores nothing for that part.`
    }
  ]
});
