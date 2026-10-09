/* "Build it from scratch" notes — B2.4.3 Bubble sort and selection sort. Format: see widgets/notes.js. */
CodeCraft.addNotes('B2.4.3', {
  viz: ['sort'],
  intro: `<p>A <span class="term">bubble sort</span> walks along the list comparing <b>neighbours</b> and swapping any pair in the wrong order; each pass carries the largest remaining value to the end, like a bubble rising. A <span class="term">selection sort</span> finds the <b>smallest</b> remaining value and swaps it into the next position at the front, one position per pass.</p>
  <p>Both use a loop inside a loop, so both are <b>O(n²)</b> time; both sort <b>in place</b>, needing only a temporary variable for swaps, so <b>O(1)</b> space. Bubble sort can stop early when a pass makes no swaps — on nearly sorted data that's a big saving. Exams usually ban <code>sort()</code> and <code>sorted()</code>, so you must be able to write both.</p>`,
  programs: [
    {
      title: 'Bubble sort that stops early',
      goal: `<p>Sort a list of lap times into ascending order with a bubble sort that stops as soon as a pass makes no swaps. Return how many passes it made, and compare a random list with a nearly sorted one.</p>`,
      input: `<code>[12.4, 11.9, 12.8, 11.7, 12.1]</code> and the nearly sorted <code>[11.7, 11.9, 12.1, 12.8, 12.4]</code>`,
      output: `<code>Passes: 4</code> for the random list, <code>Passes: 2</code> for the nearly sorted one`,
      think: [
        `One <b>pass</b>: compare <code>items[j]</code> with <code>items[j + 1]</code> for every neighbouring pair, swapping if the left one is bigger.`,
        `After pass 1 the largest value is at the end; after pass 2 the two largest are in place. So pass i only needs to go up to <code>n - 1 - i</code>, and at most n − 1 passes are needed.`,
        `Swap with a temporary variable, so neither value is lost.`,
        `Keep a flag, <code>swapped</code>: False at the start of each pass, True if any swap happens. A pass with no swaps means the list is sorted — <code>break</code>.`
      ],
      works: `each pass moves the largest unsorted value to its final place, so after n − 1 passes everything is in place. If a pass makes no swaps, every neighbouring pair is already in order — which means the whole list is sorted — so stopping early is safe.`,
      vars: [
        ['items', 'list', 'the list being sorted (in place)'],
        ['n', 'int', 'its length'],
        ['passes', 'int', 'how many passes were made'],
        ['swapped', 'bool', 'did this pass swap anything?'],
        ['i, j', 'int', 'pass number and position of the left item in each pair'],
        ['temp', 'float', 'holds one value during a swap']
      ],
      code: `def bubble_sort(items):
    n = len(items)
    passes = 0
    for i in range(n - 1):
        swapped = False
        passes = passes + 1
        for j in range(n - 1 - i):
            if items[j] > items[j + 1]:
                temp = items[j]
                items[j] = items[j + 1]
                items[j + 1] = temp
                swapped = True
        if not swapped:
            break
    return passes


times = [12.4, 11.9, 12.8, 11.7, 12.1]
print("Passes:", bubble_sort(times), times)
nearly = [11.7, 11.9, 12.1, 12.8, 12.4]
print("Passes:", bubble_sort(nearly), nearly)`,
      out: `Passes: 4 [11.7, 11.9, 12.1, 12.4, 12.8]\nPasses: 2 [11.7, 11.9, 12.1, 12.4, 12.8]`,
      build: [
        { add: 1, why: `The list to sort is the parameter. The function changes it in place.`, missing: `<code>bubble_sort(...)</code> crashes with a <code>NameError</code>.` },
        { add: 18, why: `A random list to test with.`, missing: `Nothing to sort.` },
        { add: 19, why: `Call it and show the result. For now it prints <code>Passes: None</code> and the unsorted list.`, missing: `The function is never used.` },
        { add: 2, why: `How many items there are.`, missing: `The loop ranges can't be worked out.` },
        { add: 3, why: `Count the passes, to compare random and nearly sorted data.`, missing: `<code>passes + 1</code> crashes.` },
        { add: 4, why: `At most n − 1 passes: once n − 1 values are in place, the last one must be too.`, missing: `Only one pass would be made — the largest value moves to the end, but the rest stay unsorted.` },
        { add: 5, why: `Reset the flag at the <b>start of every pass</b>.`, missing: `Set once before the outer loop, it stays True after the first swap and the sort never stops early (see mistake 2).` },
        { add: 6, why: `Count this pass.`, missing: `The count stays 0.` },
        { add: 7, why: `Compare pairs j and j + 1, for j = 0 … n − 2 − i. The last i values are already in place, and the end value stops <code>j + 1</code> going off the end.`, missing: `<code>range(n)</code> makes <code>items[j + 1]</code> run off the end (see mistake 1).` },
        { add: 8, why: `Wrong order (for ascending)? The left one is bigger.`, missing: `<code>&lt;</code> here sorts into descending order (see mistake 4).` },
        { add: 9, why: `Save the left value…`, missing: `Without a temporary copy, one value is lost in the swap (see mistake 3).` },
        { add: 10, why: `…copy the right value into the left slot…`, missing: `The swap is incomplete.` },
        { add: 11, why: `…and put the saved value in the right slot. Run this stage: the list is now sorted.`, missing: `The left value is duplicated and the right one lost.` },
        { add: 12, why: `Remember that this pass changed something.`, missing: `<code>swapped</code> stays False, so the sort stops after the first pass, unsorted.` },
        { add: 13, why: `After the inner loop: did the whole pass go by without a swap?`, missing: `The early exit never happens — always n − 1 passes.` },
        { add: 14, why: `Then the list is sorted: leave the outer loop now.`, missing: `The <code>if</code> would have no body.` },
        { add: 15, why: `Return the number of passes. The list itself was sorted in place.`, missing: `The function returns <code>None</code>.` },
        { add: 20, why: `Nearly sorted: only 12.8 and 12.4 are swapped.`, missing: `No comparison of the two kinds of data.` },
        { add: 21, why: `Pass 1 swaps them; pass 2 makes no swaps, so it stops: 2 passes instead of 4. On nearly sorted data, early-exit bubble sort is close to O(n).`, missing: `The early exit would never be seen working.` }
      ],
      trace: {
        code: `def bubble_sort(items):
    n = len(items)
    passes = 0
    for i in range(n - 1):
        swapped = False
        passes = passes + 1
        for j in range(n - 1 - i):
            if items[j] > items[j + 1]:
                temp = items[j]
                items[j] = items[j + 1]
                items[j + 1] = temp
                swapped = True
        if not swapped:
            break
    return passes


print(bubble_sort([3, 1, 2]))`,
        cols: ['i', 'j', 'items', 'swapped', 'passes'],
        note: `Pass 1 (i = 0) swaps twice and moves 3 to the end. Pass 2 (i = 1) only compares j = 0: 1 and 2 are in order, so no swap, <code>not swapped</code> is <code>True</code>, and the loop breaks.`
      },
      mistakes: [
        { title: 'Comparing past the end', bad: 4, code: `def bubble_sort(items):
    n = len(items)
    for i in range(n - 1):
        for j in range(n):
            if items[j] > items[j + 1]:
                temp = items[j]
                items[j] = items[j + 1]
                items[j + 1] = temp


times = [12.4, 11.9, 12.8]
bubble_sort(times)
print(times)`, error: 'IndexError', errorText: 'list index out of range',
          why: `When j is the last index, <code>items[j + 1]</code> doesn't exist. The left item of the last pair is at n − 2, so the inner loop is <code>range(n - 1)</code> — or <code>range(n - 1 - i)</code>, which skips the sorted end too.` },
        { title: 'Resetting the flag only once', bad: 4, code: `def bubble_sort(items):
    n = len(items)
    passes = 0
    swapped = False
    for i in range(n - 1):
        passes = passes + 1
        for j in range(n - 1 - i):
            if items[j] > items[j + 1]:
                temp = items[j]
                items[j] = items[j + 1]
                items[j + 1] = temp
                swapped = True
        if not swapped:
            break
    return passes


nearly = [11.7, 11.9, 12.1, 12.8, 12.4]
print("Passes:", bubble_sort(nearly), nearly)`, out: `Passes: 4 [11.7, 11.9, 12.1, 12.4, 12.8]`,
          why: `The list is sorted after pass 1, but <code>swapped</code> became True then and is never set back to False, so the early exit never fires. Reset it at the start of every pass.` },
        { title: 'Swapping without a temporary variable', bad: 6, code: `def bubble_sort(items):
    n = len(items)
    for i in range(n - 1):
        for j in range(n - 1 - i):
            if items[j] > items[j + 1]:
                items[j] = items[j + 1]
                items[j + 1] = items[j]


times = [12.4, 11.9, 12.8, 11.7, 12.1]
bubble_sort(times)
print(times)`, out: `[11.7, 11.7, 11.7, 11.7, 12.1]`,
          why: `After <code>items[j] = items[j + 1]</code>, the left value is gone, so the next line copies the same value back. Values get duplicated and others disappear. Save one in <code>temp</code> first.` },
        { title: 'The comparison the wrong way round', bad: 5, code: `def bubble_sort(items):
    n = len(items)
    for i in range(n - 1):
        for j in range(n - 1 - i):
            if items[j] < items[j + 1]:
                temp = items[j]
                items[j] = items[j + 1]
                items[j + 1] = temp


times = [12.4, 11.9, 12.8, 11.7, 12.1]
bubble_sort(times)
print(times)`, out: `[12.8, 12.4, 12.1, 11.9, 11.7]`,
          why: `Swapping when the left one is <b>smaller</b> pushes small values to the end: descending order. Read the question — ascending needs <code>&gt;</code>.` }
      ],
      nobuiltins: {
        title: 'Built-ins: sort() and sorted(), compared',
        intro: `<p>Our function is the no-built-ins answer. Python can do the same in one line — which is exactly why exams ban it:</p>`,
        code: `times = [12.4, 11.9, 12.8, 11.7, 12.1]
print(sorted(times))
print(times)
times.sort()
print(times)`,
        out: `[11.7, 11.9, 12.1, 12.4, 12.8]\n[12.4, 11.9, 12.8, 11.7, 12.1]\n[11.7, 11.9, 12.1, 12.4, 12.8]`,
        changes: [
          `<code>sorted(times)</code> returns a <b>new</b> sorted list and leaves <code>times</code> unchanged (line 2 of the output).`,
          `<code>times.sort()</code> sorts in place, like our bubble sort — and returns <code>None</code>.`,
          `Python's built-in sort is a different, faster algorithm (O(n log n)), but in an exam that bans it, using it scores nothing.`
        ]
      },
      tip: `Bubble sort construct questions usually give marks for: the outer loop, the inner loop with a correct range, the comparison of neighbours, a correct three-line swap, and (if asked) the early-exit flag reset each pass. For "trace", write the list after each pass — not after every comparison — unless the table asks for more.`
    },
    {
      title: 'Selection sort, one position per pass',
      goal: `<p>Sort a list of marks into ascending order with a selection sort, printing the list after each pass to see it being built from the left.</p>`,
      input: `<code>marks = [64, 47, 90, 38, 72]</code>`,
      output: `the list after each of the 4 passes, ending <code>[38, 47, 64, 72, 90]</code>`,
      think: [
        `Pass i fills position i: find the <b>smallest</b> value in <code>items[i:]</code> and swap it into position i.`,
        `To find the smallest, use the minimum pattern — but remember its <b>index</b>, not its value, because we need to know where to swap from.`,
        `Start by assuming position i itself is the smallest, then check every later position.`,
        `Swap only once per pass, <b>after</b> the inner loop has looked at everything.`
      ],
      works: `after pass i, positions 0 … i hold the i + 1 smallest values in order, because each pass picks the smallest of what's left. After n − 1 passes, the last value must be the largest, so the list is sorted.`,
      vars: [
        ['items', 'list of int', 'sorted in place'],
        ['n', 'int', 'its length'],
        ['i', 'int', 'the position being filled this pass'],
        ['smallest', 'int', 'the <b>index</b> of the smallest value found so far'],
        ['j', 'int', 'index of the value being checked'],
        ['temp', 'int', 'holds one value during the swap']
      ],
      code: `def selection_sort(items):
    n = len(items)
    for i in range(n - 1):
        smallest = i
        for j in range(i + 1, n):
            if items[j] < items[smallest]:
                smallest = j
        temp = items[i]
        items[i] = items[smallest]
        items[smallest] = temp
        print("Pass", i + 1, items)


marks = [64, 47, 90, 38, 72]
selection_sort(marks)`,
      out: `Pass 1 [38, 47, 90, 64, 72]\nPass 2 [38, 47, 90, 64, 72]\nPass 3 [38, 47, 64, 90, 72]\nPass 4 [38, 47, 64, 72, 90]`,
      build: [
        { add: 1, why: `Sorts the list it is given, in place.`, missing: `<code>selection_sort(...)</code> crashes with a <code>NameError</code>.` },
        { add: 14, why: `Data to test with.`, missing: `Nothing to sort.` },
        { add: 15, why: `Call it. Nothing happens yet — the body is only <code>pass</code>.`, missing: `The function is never used.` },
        { add: 2, why: `How many items.`, missing: `The loop ranges can't be worked out.` },
        { add: 3, why: `Positions 0 to n − 2 need filling; the last value ends up in place by itself.`, missing: `Nothing is sorted.` },
        { add: 4, why: `Assume the value at position i is the smallest so far — store its <b>index</b>.`, missing: `Storing <code>items[i]</code> (the value) instead breaks the comparison and the swap (see mistake 1). Starting at 0 instead of i drags sorted values back in (see mistake 3).` },
        { add: 5, why: `Check every position after i.`, missing: `The smallest would never be searched for.` },
        { add: 6, why: `Smaller than the smallest so far?`, missing: `<code>&gt;</code> would select the largest — descending order.` },
        { add: 7, why: `Remember where it is.`, missing: `<code>smallest</code> never changes, so nothing moves.` },
        { add: 11, why: `Print the list after each pass. Run this stage: the list doesn't change yet — nothing is swapped.`, missing: `You couldn't see each pass.` },
        { add: 8, why: `The swap starts <b>after</b> the inner loop — lined up with it, not inside it.`, missing: `Inside the inner loop, it swaps before the smallest has been found (see mistake 2).` },
        { add: 9, why: `Put the smallest value into position i…`, missing: `The swap is incomplete.` },
        { add: 10, why: `…and the old value where the smallest was. Now the list sorts. (In pass 2, 47 is already in place, so it swaps with itself — harmless.)`, missing: `The old value at position i is lost, and the smallest value appears twice (see mistake 4).` }
      ],
      trace: {
        code: `def selection_sort(items):
    n = len(items)
    for i in range(n - 1):
        smallest = i
        for j in range(i + 1, n):
            if items[j] < items[smallest]:
                smallest = j
        temp = items[i]
        items[i] = items[smallest]
        items[smallest] = temp


marks = [64, 47, 38]
selection_sort(marks)
print(marks)`,
        cols: ['i', 'j', 'smallest', 'items'],
        note: `<code>smallest</code> moves to index 1 (47), then index 2 (38); only then, after the inner loop, is one swap made. Selection sort makes at most n − 1 swaps — useful when swapping is slow.`
      },
      mistakes: [
        { title: 'Remembering the value, not the index', bad: 4, code: `def selection_sort(items):
    n = len(items)
    for i in range(n - 1):
        smallest = items[i]
        for j in range(i + 1, n):
            if items[j] < items[smallest]:
                smallest = j
        temp = items[i]
        items[i] = items[smallest]
        items[smallest] = temp


marks = [64, 47, 90, 38, 72]
selection_sort(marks)
print(marks)`, error: 'IndexError', errorText: 'list index out of range',
          why: `<code>smallest</code> is 64 — a mark, not a position — so <code>items[64]</code> doesn't exist. Store the index: <code>smallest = i</code>.` },
        { title: 'Swapping inside the inner loop', bad: 8, code: `def selection_sort(items):
    n = len(items)
    for i in range(n - 1):
        smallest = i
        for j in range(i + 1, n):
            if items[j] < items[smallest]:
                smallest = j
            temp = items[i]
            items[i] = items[smallest]
            items[smallest] = temp


marks = [64, 47, 90, 38, 72]
selection_sort(marks)
print(marks)`, out: `[64, 47, 72, 38, 90]`,
          why: `The swap runs on every comparison, while <code>smallest</code> still points at a position whose value has just been swapped away. Find the smallest first; swap once, after the inner loop.` },
        { title: 'Searching from the start every pass', bad: 4, code: `def selection_sort(items):
    n = len(items)
    for i in range(n - 1):
        smallest = 0
        for j in range(i + 1, n):
            if items[j] < items[smallest]:
                smallest = j
        temp = items[i]
        items[i] = items[smallest]
        items[smallest] = temp


marks = [64, 47, 90, 38, 72]
selection_sort(marks)
print(marks)`, out: `[90, 38, 47, 72, 64]`,
          why: `Starting at index 0 compares with values already sorted into place, and can swap them back out. The search for pass i must cover only <code>items[i:]</code>, starting with <code>smallest = i</code>.` },
        { title: 'Swap without the temporary variable', bad: 8, code: `def selection_sort(items):
    n = len(items)
    for i in range(n - 1):
        smallest = i
        for j in range(i + 1, n):
            if items[j] < items[smallest]:
                smallest = j
        items[i] = items[smallest]
        items[smallest] = items[i]


marks = [64, 47, 90, 38, 72]
selection_sort(marks)
print(marks)`, out: `[38, 38, 38, 38, 72]`,
          why: `<code>items[i] = items[smallest]</code> overwrites the value at i before it is saved, so the second line copies the smallest back. Each pass duplicates a value and loses another.` }
      ],
      nobuiltins: {
        title: 'Built-ins: min and index, compared',
        intro: `<p>Our inner loop is the no-built-ins way to find the smallest. With built-ins, <code>min</code> finds the value and <code>.index</code> finds where it is — both are usually banned:</p>`,
        code: `def selection_sort(items):
    n = len(items)
    for i in range(n - 1):
        rest = items[i:]
        smallest = i + rest.index(min(rest))
        temp = items[i]
        items[i] = items[smallest]
        items[smallest] = temp


marks = [64, 47, 90, 38, 72]
selection_sort(marks)
print(marks)`,
        out: `[38, 47, 64, 72, 90]`,
        changes: [
          `<code>rest = items[i:]</code> is the unsorted part.`,
          `<code>min(rest)</code> replaces the inner loop's search for the smallest value…`,
          `…and <code>rest.index(...)</code> finds its position within <code>rest</code>; adding <code>i</code> turns that into a position in the whole list.`,
          `It is still O(n²): <code>min</code> and <code>index</code> each scan the rest of the list, just out of sight.`
        ]
      },
      tip: `Selection sort traces are usually marked on the list after each pass. Remember: one swap per pass, the front fills up from the left, and the number of comparisons is always n(n − 1)/2 — even for sorted data, because there's no early exit. Bubble sort is the one that can stop early.`
    }
  ]
});
