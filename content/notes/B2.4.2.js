/* "Build it from scratch" notes — B2.4.2 Linear and binary search. Format: see widgets/notes.js. */
CodeCraft.addNotes('B2.4.2', {
  intro: `<p>A <span class="term">linear search</span> checks items one by one from the start until it finds the target or runs out. It works on <b>any</b> list, sorted or not, and takes up to n comparisons: O(n).</p>
  <p>A <span class="term">binary search</span> needs a <b>sorted</b> list. It looks at the middle item and throws away the half that can't contain the target, again and again — so it takes about log₂ n comparisons: O(log n). Think of a phone book: it's sorted by name, so you can find a <b>name</b> by opening it in the middle, but to find who owns a <b>number</b> you'd have to read every entry.</p>`,
  programs: [
    {
      title: 'Who owns this phone number? (linear search)',
      goal: `<p>Two parallel lists hold phone numbers and their owners, in no particular order. Write <code>linear_search(items, target)</code>, which returns the index of the target or -1, and use it to find whose number "0912" is.</p>`,
      input: `<code>numbers = ["0471", "0233", "0912", "0350"]</code>, the matching names, and a number to look for`,
      output: `<code>0912 belongs to Carla</code>, and -1 for a number that isn't there`,
      think: [
        `The numbers aren't sorted, so binary search can't be used: check them one at a time from index 0 — a linear search.`,
        `We need the <b>index</b> (to look up the name in the parallel list), so loop over the indexes.`,
        `As soon as an item matches, return its index — no need to look further.`,
        `Only after checking <b>every</b> item can we say it isn't there: <code>return -1</code> goes after the loop.`
      ],
      works: `every index from 0 to n − 1 is checked in turn, so if the target is in the list it will be reached, and the first match is returned. -1 can never be a real index, so it safely means "not found".`,
      vars: [
        ['items', 'list of str', 'the list to search (parameter)'],
        ['target', 'str', "what we're looking for (parameter)"],
        ['i', 'int', 'the index being checked'],
        ['pos', 'int', 'the index returned, or -1']
      ],
      code: `def linear_search(items, target):
    for i in range(len(items)):
        if items[i] == target:
            return i
    return -1


numbers = ["0471", "0233", "0912", "0350"]
names = ["Aiko", "Ben", "Carla", "Dev"]
pos = linear_search(numbers, "0912")
if pos == -1:
    print("Not found")
else:
    print("0912 belongs to", names[pos])
print(linear_search(numbers, "0555"))`,
      out: `0912 belongs to Carla\n-1`,
      build: [
        { add: 1, why: `Two parameters: the list and the target.`, missing: `<code>linear_search(...)</code> crashes with a <code>NameError</code>.` },
        { add: 2, why: `Visit every index, 0 to n − 1.`, missing: `Only one item could be checked. Starting at 1 misses the first item (see mistake 3).` },
        { add: 3, why: `Does this item match?`, missing: `Every item would be treated as a match.` },
        { add: 4, why: `Found: return the <b>index</b> straight away.`, missing: `Returning <code>items[i]</code> gives the number itself, which can't be used to look up the name (see mistake 2).` },
        { add: 5, why: `After the loop: every item was checked and none matched.`, missing: `Without it the function returns <code>None</code> (see mistake 4). Inside the loop (in an <code>else</code>), it gives up after the first item (see mistake 1).` },
        { add: 8, why: `The phone numbers — as strings, because a leading 0 matters.`, missing: `Nothing to search.` },
        { add: 9, why: `The owners, in the same order.`, missing: `<code>names[pos]</code> crashes with a <code>NameError</code>.` },
        { add: 10, why: `Search, and keep the index.`, missing: `The function is never used.` },
        { add: 11, why: `Check for "not found" before using the index — <code>names[-1]</code> would quietly give the last name!`, missing: `A missing number would print the wrong owner.` },
        { add: 12, why: `Not found.`, missing: `The <code>if</code> would have no body.` },
        { add: 13, why: `Otherwise…`, missing: `The owner would be printed even when not found.` },
        { add: 14, why: `…the same index in the parallel list gives the owner.`, missing: `The answer is never shown.` },
        { add: 15, why: `A number that isn't in the list returns -1.`, missing: `The "not found" case would go untested.` }
      ],
      trace: {
        cols: ['i', 'pos'],
        note: `The search for "0912" makes three comparisons (indexes 0, 1, 2) and stops. The search for "0555" has to check all four before returning -1 — the worst case for a linear search.`
      },
      mistakes: [
        { title: 'Giving up after the first item', bad: 6, code: `def linear_search(items, target):
    for i in range(len(items)):
        if items[i] == target:
            return i
        else:
            return -1


numbers = ["0471", "0233", "0912", "0350"]
print(linear_search(numbers, "0912"))`, out: `-1`,
          why: `The <code>else</code> returns on the very first item that doesn't match. "Not found" can only be decided after the loop has checked everything.` },
        { title: 'Returning the item instead of its index', bad: 4, code: `def linear_search(items, target):
    for i in range(len(items)):
        if items[i] == target:
            return items[i]
    return -1


numbers = ["0471", "0233", "0912", "0350"]
names = ["Aiko", "Ben", "Carla", "Dev"]
pos = linear_search(numbers, "0912")
print(names[pos])`, error: 'TypeError', errorText: 'list indices must be integers or slices, not str',
          why: `The function returns "0912", and <code>names["0912"]</code> isn't a valid index. Return <code>i</code>, the position.` },
        { title: 'Starting the search at index 1', bad: 2, code: `def linear_search(items, target):
    for i in range(1, len(items)):
        if items[i] == target:
            return i
    return -1


numbers = ["0471", "0233", "0912", "0350"]
print(linear_search(numbers, "0471"))`, out: `-1`,
          why: `The first item is at index 0. <code>range(1, …)</code> never checks it, so a number in the first position is "not found".` },
        { title: 'No return for "not found"', code: `def linear_search(items, target):
    for i in range(len(items)):
        if items[i] == target:
            return i


numbers = ["0471", "0233", "0912", "0350"]
print(linear_search(numbers, "0555"))`, out: `None`,
          why: `When nothing matches, the function reaches its end and returns <code>None</code>. Code that checks <code>pos == -1</code> then fails. Always return a value on every path.` }
      ],
      nobuiltins: {
        ban: ['len', 'index'],
        intro: `<p>Exams often ban <code>in</code>, <code>.index()</code> and sometimes <code>len</code>. Our search never used the first two; if <code>len</code> is banned too, loop over the items and count the index yourself:</p>`,
        code: `def linear_search(items, target):
    i = 0
    for item in items:
        if item == target:
            return i
        i = i + 1
    return -1


numbers = ["0471", "0233", "0912", "0350"]
names = ["Aiko", "Ben", "Carla", "Dev"]
pos = linear_search(numbers, "0912")
if pos == -1:
    print("Not found")
else:
    print("0912 belongs to", names[pos])
print(linear_search(numbers, "0555"))`,
        out: `0912 belongs to Carla\n-1`,
        changes: [
          `<code>for i in range(len(items))</code> becomes <code>for item in items</code>, with a counter <code>i = 0</code> before the loop.`,
          `<code>items[i] == target</code> becomes <code>item == target</code>.`,
          `<code>i = i + 1</code> goes at the end of the loop body, <b>after</b> the check, so <code>i</code> is the index of <code>item</code> when it is returned.`
        ]
      },
      tip: `Linear search construct questions usually give marks for: looping through every element, comparing with the target, returning (or outputting) the index when found, and handling "not found" <b>after</b> the loop. Using <code>in</code> or <code>.index()</code> when the question bans built-ins scores nothing for the search.`
    },
    {
      title: 'Find a name in a sorted phone book (binary search)',
      goal: `<p>A phone book's names are in alphabetical order. Write <code>binary_search(items, target)</code> that returns the index of the target or -1, printing each name it checks, so you can count the comparisons.</p>`,
      input: `11 names in alphabetical order, and a name to look for`,
      output: `the names checked, then the index — e.g. 2 checks to find "Ivan" at index 8`,
      think: [
        `Keep two indexes, <code>low</code> and <code>high</code>, marking the part of the list that could still hold the target. At the start, that's the whole list.`,
        `Look at the middle: <code>mid = (low + high) // 2</code>. <code>//</code> keeps it a whole number, so it's a valid index.`,
        `If the middle item is the target, return <code>mid</code>. If it comes <b>before</b> the target alphabetically, the target can only be to the right: <code>low = mid + 1</code>. Otherwise it's to the left: <code>high = mid - 1</code>.`,
        `Repeat while <code>low &lt;= high</code>. When low passes high, nothing is left to search: return -1.`
      ],
      works: `because the list is sorted, everything left of a too-small middle item is too small as well, so throwing that half away never loses the target. Each comparison halves what's left, which is why it takes about log₂ n steps.`,
      vars: [
        ['low', 'int', 'first index still in play'],
        ['high', 'int', 'last index still in play'],
        ['mid', 'int', 'the middle index; <code>//</code> keeps it whole'],
        ['book', 'list of str', 'the names, which <b>must</b> be sorted']
      ],
      code: `def binary_search(items, target):
    low = 0
    high = len(items) - 1
    while low <= high:
        mid = (low + high) // 2
        print("Checking", items[mid])
        if items[mid] == target:
            return mid
        elif items[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1


book = ["Aiko", "Ben", "Carla", "Dev", "Ema", "Femi", "Gus", "Hana", "Ivan", "Jun", "Kofi"]
print("Found at", binary_search(book, "Ivan"))
print("Found at", binary_search(book, "Zed"))`,
      out: `Checking Femi\nChecking Ivan\nFound at 8\nChecking Femi\nChecking Ivan\nChecking Jun\nChecking Kofi\nFound at -1`,
      build: [
        { add: 1, why: `The same interface as linear search: a list and a target.`, missing: `<code>binary_search(...)</code> crashes with a <code>NameError</code>.` },
        { add: 16, why: `The names, sorted alphabetically. Binary search <b>only</b> works on sorted data.`, missing: `Unsorted names give wrong answers (see mistake 3).` },
        { add: 17, why: `Call the function straight away, so every stage below can be run. For now it prints <code>Found at None</code>.`, missing: `The function is never used.` },
        { add: 2, why: `The search area starts at index 0…`, missing: `<code>mid</code> can't be worked out.` },
        { add: 3, why: `…and ends at the last index, n − 1.`, missing: `<code>high = len(items)</code> is one past the end, so a search can read off the end of the list.` },
        { add: 4, expect: 'loops', why: `Keep going while there is at least one item left. Run this stage: it never ends — nothing changes low or high yet.`, missing: `<code>low &lt; high</code> stops one step early, when exactly one item is left (see mistake 1).` },
        { add: 5, expect: 'loops', why: `The middle of the area still in play: (0 + 10) // 2 = 5.`, missing: `With <code>/</code> instead of <code>//</code>, <code>mid</code> is a float and can't be an index (see mistake 4).` },
        { add: 6, expect: 'loops', why: `Show each comparison, so we can count them. (Run it: "Checking Femi" for ever.)`, missing: `The search works the same, but you can't see how few comparisons it makes.` },
        { add: 7, expect: 'loops', why: `Is the middle item the target?`, missing: `The search could never succeed.` },
        { add: 8, expect: 'loops', why: `Found: return its index. (Still loops — the middle is Femi every time, because the area never shrinks.)`, missing: `The search would carry on after finding the target.` },
        { add: 9, expect: 'loops', why: `Strings compare alphabetically: "Femi" &lt; "Ivan" is <code>True</code>.`, missing: `The search couldn't tell which half to throw away.` },
        { add: 10, why: `Too small: the target is to the right. <code>+ 1</code> because mid has already been checked. Run this stage: Femi, then Ivan — found at 8 in 2 checks.`, missing: `<code>low = mid</code> can stop the area shrinking, so the loop never ends (see mistake 2).` },
        { add: 18, why: `Now search for a name that isn't there. The area shrinks to nothing and the loop ends — but there's no <code>return</code> after it yet, so this prints <code>Found at None</code>.`, missing: `The "not found" case goes untested.` },
        { add: 11, why: `Otherwise the middle item is too big…`, missing: `Names in the left half could never be found.` },
        { add: 12, why: `…so the target is to the left.`, missing: `A search for an early name like "Ben" would never shrink the area from the right, and would loop for ever.` },
        { add: 13, why: `Low has passed high: nothing left to search. "Zed" took 4 checks to rule out — a linear search would check all 11.`, missing: `The function returns <code>None</code> when the target isn't there.` }
      ],
      trace: {
        code: `def binary_search(items, target):
    low = 0
    high = len(items) - 1
    while low <= high:
        mid = (low + high) // 2
        print("Checking", items[mid])
        if items[mid] == target:
            return mid
        elif items[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1


book = ["Aiko", "Ben", "Carla", "Dev", "Ema", "Femi", "Gus", "Hana", "Ivan", "Jun", "Kofi"]
print("Found at", binary_search(book, "Ben"))`,
        cols: ['low', 'high', 'mid'],
        note: `Searching for "Ben": the area goes from indexes 0–10 to 0–4 to 0–1, and Ben is found at index 1 after 3 checks. This is the classic exam trace table: low, high, mid for each pass.`
      },
      mistakes: [
        { title: 'Stopping when one item is left', bad: 4, code: `def binary_search(items, target):
    low = 0
    high = len(items) - 1
    while low < high:
        mid = (low + high) // 2
        if items[mid] == target:
            return mid
        elif items[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1


book = ["Aiko", "Ben", "Carla", "Dev", "Ema", "Femi", "Gus", "Hana", "Ivan", "Jun", "Kofi"]
print(binary_search(book, "Kofi"))`, out: `-1`,
          why: `The area shrinks to just Kofi (low = high = 10), but <code>10 &lt; 10</code> is <code>False</code>, so the loop ends without checking it. Use <code>low &lt;= high</code>.` },
        { title: 'Moving low to mid instead of past it', bad: 10, code: `def binary_search(items, target):
    low = 0
    high = len(items) - 1
    while low <= high:
        mid = (low + high) // 2
        print("Checking", items[mid])
        if items[mid] == target:
            return mid
        elif items[mid] < target:
            low = mid
        else:
            high = mid - 1
    return -1


book = ["Aiko", "Ben", "Carla", "Dev", "Ema", "Femi", "Gus", "Hana", "Ivan", "Jun", "Kofi"]
print(binary_search(book, "Kofi"))`, loops: true,
          why: `When low is 9 and high is 10, mid is 9 again and again: <code>low = mid</code> doesn't move it. mid has already been checked, so skip past it: <code>mid + 1</code>.` },
        { title: 'Searching an unsorted list', bad: 15, code: `def binary_search(items, target):
    low = 0
    high = len(items) - 1
    while low <= high:
        mid = (low + high) // 2
        if items[mid] == target:
            return mid
        elif items[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1


book = ["Jun", "Aiko", "Kofi", "Dev", "Ben", "Femi", "Carla"]
print(binary_search(book, "Jun"))`, out: `-1`,
          why: `The middle is "Dev", which comes before "Jun", so the left half is thrown away — with "Jun" in it. The halving logic only holds for sorted data.` },
        { title: 'Dividing with / for the middle', bad: 5, code: `def binary_search(items, target):
    low = 0
    high = len(items) - 1
    while low <= high:
        mid = (low + high) / 2
        if items[mid] == target:
            return mid
        elif items[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1


book = ["Aiko", "Ben", "Carla", "Dev", "Ema"]
print(binary_search(book, "Dev"))`, error: 'TypeError', errorText: 'list indices must be integers or slices, not float',
          why: `<code>/</code> always gives a float (2.0), and a list index must be an int. <code>//</code> divides and rounds down to a whole number.` }
      ],
      nobuiltins: {
        title: 'Built-ins compared: in and .index() are linear',
        intro: `<p>Python's <code>in</code> and <code>.index()</code> look like one step, but inside they are <b>linear</b> searches — they check from the start, even on a sorted list:</p>`,
        code: `book = ["Aiko", "Ben", "Carla", "Dev", "Ema", "Femi", "Gus", "Hana", "Ivan", "Jun", "Kofi"]
print("Ivan" in book)
print(book.index("Ivan"))`,
        out: `True\n8`,
        changes: [
          `<code>"Ivan" in book</code> answers "is it there?" (True/False) with a linear search: O(n).`,
          `<code>book.index("Ivan")</code> returns the index — also linear, and it <b>crashes</b> with a <code>ValueError</code> if the item isn't there, instead of returning -1.`,
          `Our <code>binary_search</code> uses no built-ins except <code>len</code> (to set <code>high</code>); if that's banned, the question will give you the list's size.`
        ]
      },
      tip: `Binary search traces are a Paper 2 favourite: draw columns for low, high, mid and items[mid], one row per pass, and show the final row where low &gt; high for "not found". In "compare" questions, say binary search is O(log n) but needs sorted data; linear search is O(n) but works on any data.`
    }
  ]
});
