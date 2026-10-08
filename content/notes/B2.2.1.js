/* "Build it from scratch" notes — B2.2.1 Static vs dynamic data structures. Format: see widgets/notes.js. */
CodeCraft.addNotes('B2.2.1', {
  intro: `<p>A <span class="term">static</span> data structure has a <b>fixed size</b>, set when it is created: its memory is allocated once and never changes. It can't grow, so it can become full — but it is simple and fast, and you know exactly how much memory it uses. A <span class="term">dynamic</span> structure can <b>grow and shrink</b> while the program runs, using only the memory it needs — more flexible, but resizing takes extra work.</p>
  <p>Python's lists are dynamic. To show how a static array behaves, we make a list of a fixed length with <code>[None] * size</code> and never add to it — we only change the values in its slots.</p>`,
  programs: [
    {
      title: 'A static array of lap times',
      goal: `<p>Store runners' lap times in a <b>static array</b> with room for exactly 5. Fill the slots in order; when the array is full, report each time that can't be stored.</p>`,
      input: `six lap times: <code>12.4, 11.9, 12.1, 12.8, 11.7, 12.0</code>`,
      output: `a "full" message for the 6th time, the array, and <code>Stored 5 of 5</code>`,
      think: [
        `Create the whole array at the start: 5 slots, each holding <code>None</code> ("empty").`,
        `Keep a <code>count</code> of how many slots are used. It is also the index of the next free slot.`,
        `For each time: if there is room (<code>count &lt; SIZE</code>), store it at index <code>count</code> and add 1 to the count.`,
        `Otherwise the array is full — a static structure can't grow, so report it.`
      ],
      works: `slots 0 to count − 1 are always the ones in use, so storing at index <code>count</code> fills the next empty slot, and the check <code>count &lt; SIZE</code> stops us before we pass the last index, SIZE − 1.`,
      vars: [
        ['SIZE', 'int', 'the fixed capacity — a constant'],
        ['times', 'list (fixed size)', 'the array: 5 slots, made once'],
        ['count', 'int', 'slots used = index of the next free slot'],
        ['t', 'float', 'the lap time being stored']
      ],
      code: `SIZE = 5
times = [None] * SIZE
count = 0
for t in [12.4, 11.9, 12.1, 12.8, 11.7, 12.0]:
    if count < SIZE:
        times[count] = t
        count = count + 1
    else:
        print("Array full - can't store", t)
print(times)
print("Stored", count, "of", SIZE)`,
      out: `Array full - can't store 12.0\n[12.4, 11.9, 12.1, 12.8, 11.7]\nStored 5 of 5`,
      build: [
        { add: 1, why: `The capacity as a named constant.`, missing: `<code>NameError</code> on the next line.` },
        { add: 2, why: `Allocate all 5 slots now: <code>[None] * 5</code> is <code>[None, None, None, None, None]</code>. The size never changes after this — that's what makes it static.`, missing: `With <code>times = []</code> there are no slots to store into: <code>IndexError</code> (see mistake 3).` },
        { add: 3, why: `No slots used yet, so the next free slot is index 0.`, missing: `<code>NameError</code> in the loop.` },
        { add: 10, why: `Print the array early, to watch it fill up. Run this stage: five <code>None</code>s.`, missing: `You can't see the contents.` },
        { add: 4, why: `Go through the times to be stored.`, missing: `Nothing is stored.` },
        { add: 5, why: `Is there a free slot? The last index is SIZE − 1 = 4, so <code>count</code> must be below 5.`, missing: `Without the check, the 6th time is written to index 5, which doesn't exist (see mistake 1).` },
        { add: 6, why: `Store the time in the next free slot.`, missing: `The array stays empty.` },
        { add: 7, why: `One more slot is used, so the next free slot moves on.`, missing: `Every time overwrites slot 0 (see mistake 2).` },
        { add: 8, why: `No room left.`, missing: `A time that doesn't fit would be silently lost.` },
        { add: 9, why: `Report what couldn't be stored. A static structure can't grow to make room.`, missing: `The <code>else</code> would have no body: the program won't run.` },
        { add: 11, why: `How full is it?`, missing: `You'd have to count the slots yourself.` }
      ],
      trace: {
        code: `SIZE = 3
times = [None] * SIZE
count = 0
for t in [12.4, 11.9, 12.1, 12.8]:
    if count < SIZE:
        times[count] = t
        count = count + 1
    else:
        print("Array full - can't store", t)
print(times)
print("Stored", count, "of", SIZE)`,
        cols: ['times', 'count'],
        note: `The array has 3 slots from the very first row, and it never gets longer — only the values in the slots change. When <code>count</code> reaches 3, the condition is <code>False</code> and 12.8 is refused.`
      },
      mistakes: [
        { title: 'No check for a full array', bad: 5, code: `SIZE = 5
times = [None] * SIZE
count = 0
for t in [12.4, 11.9, 12.1, 12.8, 11.7, 12.0]:
    times[count] = t
    count = count + 1
print(times)`, error: 'IndexError', errorText: 'list assignment index out of range',
          why: `The 6th time goes to index 5, but the slots are 0–4. Writing past the end of a static array is an overflow — check <code>count &lt; SIZE</code> first.` },
        { title: 'Never moving to the next slot', bad: 6, code: `SIZE = 5
times = [None] * SIZE
count = 0
for t in [12.4, 11.9, 12.1, 12.8, 11.7, 12.0]:
    if count < SIZE:
        times[count] = t
print(times)`, out: `[12.0, None, None, None, None]`,
          why: `<code>count</code> stays 0, so every time is written into slot 0, replacing the one before. Only the last time survives.` },
        { title: 'Starting with an empty list', bad: 2, code: `SIZE = 5
times = []
count = 0
for t in [12.4, 11.9, 12.1]:
    if count < SIZE:
        times[count] = t
        count = count + 1
print(times)`, error: 'IndexError', errorText: 'list assignment index out of range',
          why: `<code>[]</code> has no slots at all, so <code>times[0] = …</code> fails. A static array must be created full-size: <code>[None] * SIZE</code>.` },
        { title: 'The None inside the brackets', bad: 2, code: `SIZE = 5
times = [None * SIZE]
print(times)`, error: 'TypeError', errorText: "unsupported operand type(s) for *: 'NoneType' and 'int'",
          why: `<code>[None] * 5</code> repeats a one-item list 5 times. <code>None * 5</code> tries to multiply <code>None</code> itself, which isn't possible.` }
      ],
      nobuiltins: {
        title: 'The dynamic version, compared',
        intro: `<p>Our static version uses no built-ins. A Python list is dynamic, so with <code>append</code> and <code>len</code> it simply grows to fit every time — no capacity, no "full":</p>`,
        code: `times = []
for t in [12.4, 11.9, 12.1, 12.8, 11.7, 12.0]:
    times.append(t)
print(times)
print("Stored", len(times))`,
        out: `[12.4, 11.9, 12.1, 12.8, 11.7, 12.0]\nStored 6`,
        changes: [
          `<code>[None] * SIZE</code> becomes <code>[]</code>: no memory is set aside in advance.`,
          `<code>times[count] = t</code> plus <code>count = count + 1</code> becomes <code>times.append(t)</code>, which adds a new slot each time.`,
          `The full check disappears — all 6 times are stored. <code>len(times)</code> replaces <code>count</code>.`,
          `The trade-off: flexibility, but Python must sometimes find a bigger block of memory and copy the list into it (program 2 shows how).`
        ]
      },
      tip: `"Compare static and dynamic data structures" answers usually earn marks for points on <b>both</b> sides: size fixed vs can change; memory allocated once (may be wasted, or run out) vs allocated as needed; static is simpler and has predictable memory use, dynamic is more flexible but resizing costs time. A comparison needs a "whereas" in each point.`
    },
    {
      title: 'How a dynamic list grows',
      goal: `<p>Show what a dynamic structure does behind the scenes. Start with an array of 2 slots. Whenever it is full, make a new array <b>twice as big</b>, copy the items across, and carry on.</p>`,
      input: `five names: <code>Aiko, Ben, Carla, Dev, Ema</code>`,
      output: `a message each time the array is resized, then the final array`,
      think: [
        `Keep the array, its <code>capacity</code> and the <code>count</code> of items stored.`,
        `Before storing a name, check whether the array is full (<code>count == capacity</code>).`,
        `If it is: double the capacity, make a new array that size, copy every stored item into the same index of the new array, and use the new array from now on.`,
        `Then store the name in the next free slot, as in program 1.`
      ],
      works: `whenever we store, <code>count &lt; capacity</code> is guaranteed — either it already was, or we just made the array bigger — so the store never goes past the end. Copying index by index keeps every item in its place.`,
      vars: [
        ['capacity', 'int', 'how many slots the current array has'],
        ['items', 'list (fixed size)', 'the current array'],
        ['count', 'int', 'items stored = next free index'],
        ['bigger', 'list (fixed size)', 'the new, larger array'],
        ['i', 'int', 'index used while copying']
      ],
      code: `capacity = 2
items = [None] * capacity
count = 0
for name in ["Aiko", "Ben", "Carla", "Dev", "Ema"]:
    if count == capacity:
        capacity = capacity * 2
        bigger = [None] * capacity
        for i in range(count):
            bigger[i] = items[i]
        items = bigger
        print("Full: copied", count, "items into a new array of", capacity)
    items[count] = name
    count = count + 1
print(items)`,
      out: `Full: copied 2 items into a new array of 4\nFull: copied 4 items into a new array of 8\n['Aiko', 'Ben', 'Carla', 'Dev', 'Ema', None, None, None]`,
      build: [
        { add: 1, why: `Start small: 2 slots.`, missing: `<code>NameError</code> on the next line.` },
        { add: 2, why: `The first array, made full-size.`, missing: `There is nowhere to store anything.` },
        { add: 3, why: `Nothing stored yet.`, missing: `<code>NameError</code> in the loop.` },
        { add: 14, why: `Show the array at the end.`, missing: `You can't see the result.` },
        { add: 4, why: `Store each name in turn.`, missing: `Nothing is stored.` },
        { add: 12, why: `Store in the next free slot. <code>count</code> doesn't change yet, so run this stage and every name lands in slot 0: only "Ema" survives.`, missing: `Nothing is stored.` },
        { add: 13, expect: 'IndexError', why: `Move on to the next slot. Run this stage: it crashes at Carla. The array only has 2 slots and Carla needs a third — exactly what happens to a static array. The next lines fix it.`, missing: `Every name overwrites slot 0.` },
        { add: 5, expect: 'IndexError', why: `Before storing: is the array full?`, missing: `There's no way to know when to resize.` },
        { add: 6, expect: 'IndexError', why: `Double the capacity. Doubling means resizes happen rarely: 2 → 4 → 8 → 16…`, missing: `Adding 1 instead works but resizes every time (see mistake 4).` },
        { add: 7, expect: 'IndexError', why: `A new, bigger array. It's empty for now.`, missing: `There's nowhere to copy into.` },
        { add: 8, expect: 'IndexError', why: `Go through every item stored so far: indexes 0 to count − 1.`, missing: `Without copying, the old names are lost (see mistake 1).` },
        { add: 9, expect: 'IndexError', why: `Copy each item to the same index in the new array.`, missing: `<code>range(capacity)</code> here would read past the end of the old array (see mistake 2).` },
        { add: 10, why: `From now on, use the new array. The old one is no longer needed. Now the program runs to the end.`, missing: `The program keeps writing to the old, full array: <code>IndexError</code> (see mistake 3).` },
        { add: 11, why: `Report each resize, to see how often it happens.`, missing: `The resizing is invisible — which is exactly what Python's lists do for you.` }
      ],
      trace: {
        cols: ['name', 'count', 'capacity'],
        note: `<code>capacity</code> changes only twice for five names. Each change means copying every item stored so far — the hidden cost of a dynamic structure.`
      },
      mistakes: [
        { title: 'Making a bigger array but not copying', bad: 7, code: `capacity = 2
items = [None] * capacity
count = 0
for name in ["Aiko", "Ben", "Carla", "Dev", "Ema"]:
    if count == capacity:
        capacity = capacity * 2
        items = [None] * capacity
    items[count] = name
    count = count + 1
print(items)`, out: `[None, None, None, None, 'Ema', None, None, None]`,
          why: `Each resize throws the old array away with everything in it. Only names stored after the last resize survive. The items must be copied across.` },
        { title: 'Copying too many items', bad: 8, code: `capacity = 2
items = [None] * capacity
count = 0
for name in ["Aiko", "Ben", "Carla", "Dev", "Ema"]:
    if count == capacity:
        capacity = capacity * 2
        bigger = [None] * capacity
        for i in range(capacity):
            bigger[i] = items[i]
        items = bigger
    items[count] = name
    count = count + 1
print(items)`, error: 'IndexError', errorText: 'list index out of range',
          why: `By this line <code>capacity</code> is already 4, but the old array only has 2 slots, so <code>items[2]</code> doesn't exist. Copy the <code>count</code> items you actually have.` },
        { title: 'Forgetting to switch to the new array', bad: 9, code: `capacity = 2
items = [None] * capacity
count = 0
for name in ["Aiko", "Ben", "Carla", "Dev", "Ema"]:
    if count == capacity:
        capacity = capacity * 2
        bigger = [None] * capacity
        for i in range(count):
            bigger[i] = items[i]
    items[count] = name
    count = count + 1
print(items)`, error: 'IndexError', errorText: 'list assignment index out of range',
          why: `The copy is made, but <code>items</code> still refers to the old 2-slot array, so storing Carla at index 2 fails. Add <code>items = bigger</code>.` },
        { title: 'Growing by one slot at a time', bad: 6, code: `capacity = 2
items = [None] * capacity
count = 0
for name in ["Aiko", "Ben", "Carla", "Dev", "Ema"]:
    if count == capacity:
        capacity = capacity + 1
        bigger = [None] * capacity
        for i in range(count):
            bigger[i] = items[i]
        items = bigger
        print("Full: copied", count, "items into a new array of", capacity)
    items[count] = name
    count = count + 1
print(items)`, out: `Full: copied 2 items into a new array of 3\nFull: copied 3 items into a new array of 4\nFull: copied 4 items into a new array of 5\n['Aiko', 'Ben', 'Carla', 'Dev', 'Ema']`,
          why: `It works, and wastes no memory — but it resizes and copies on <b>every</b> new name. With thousands of items that is a lot of copying. Doubling trades a little spare memory for far fewer copies.` }
      ],
      nobuiltins: {
        title: 'What Python\'s list does for you',
        intro: `<p>Our program uses no list methods. A real Python list does all of this automatically inside <code>append</code>:</p>`,
        code: `items = []
for name in ["Aiko", "Ben", "Carla", "Dev", "Ema"]:
    items.append(name)
print(items)`,
        out: `['Aiko', 'Ben', 'Carla', 'Dev', 'Ema']`,
        changes: [
          `<code>capacity</code>, <code>count</code>, the full check, the new array and the copying loop all happen inside <code>append</code>, out of sight.`,
          `The list never shows spare <code>None</code> slots — Python hides them — but it does keep some spare room, so most appends don't need a copy.`
        ]
      },
      tip: `If asked how a dynamic structure grows or what resizing costs, describe the steps: allocate a larger block of memory, copy the existing items across, then free the old block. Then link it to the trade-off: flexibility, at the cost of the time spent copying.`
    }
  ]
});
