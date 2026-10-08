/* "Build it from scratch" notes — B2.3.1 Sequence. Format: see widgets/notes.js. */
CodeCraft.addNotes('B2.3.1', {
  intro: `<p><span class="term">Sequence</span> means instructions run one after another, top to bottom, in exactly the order you write them. Change the order and you can change the result — or get a program that never stops.</p>
  <p>The two programs below show the classic order bugs: a <b>swap</b> that loses a value, and a loop that never ends (an <b>infinite loop</b>). A related idea you only need as a concept is <b>deadlock</b>: two processes each wait for something the other one holds, so neither can ever continue — like two cars meeting on a one-lane bridge.</p>`,
  programs: [
    {
      title: 'Swap two values',
      goal: `<p>The sports-day results were typed the wrong way round: <code>gold</code> holds "Ben" and <code>silver</code> holds "Aiko". Swap them, so each variable ends up with the other's value.</p>`,
      input: `<code>gold = "Ben"</code>, <code>silver = "Aiko"</code>`,
      output: `<code>Before: Ben Aiko</code> then <code>After: Aiko Ben</code>`,
      think: [
        `A variable holds one value. As soon as you assign a new value, the old one is gone.`,
        `So before overwriting <code>gold</code>, save its value somewhere safe: a temporary variable, <code>temp</code>.`,
        `Now <code>gold</code> can take <code>silver</code>'s value…`,
        `…and <code>silver</code> takes the saved value from <code>temp</code>.`
      ],
      works: `at every moment one copy of each name exists somewhere: "Ben" is in <code>temp</code> while <code>gold</code> is overwritten, so nothing is lost.`,
      vars: [
        ['gold', 'str', 'first place'],
        ['silver', 'str', 'second place'],
        ['temp', 'str', 'a temporary copy that stops a value being lost']
      ],
      code: `gold = "Ben"
silver = "Aiko"
print("Before:", gold, silver)
temp = gold
gold = silver
silver = temp
print("After:", gold, silver)`,
      out: `Before: Ben Aiko\nAfter: Aiko Ben`,
      build: [
        { add: 1, why: `The value typed in by mistake for first place.`, missing: `<code>NameError</code> on the next lines.` },
        { add: 2, why: `And for second place.`, missing: `<code>NameError</code> on the next lines.` },
        { add: 3, why: `Show the values before the swap, so we can see the change.`, missing: `Placed after the swap, it would show the swapped values, so you couldn't see what changed.` },
        { add: 4, why: `Save gold's value <b>before</b> anything overwrites it.`, missing: `Without it, "Ben" is lost the moment line 5 runs (see mistake 1). After line 5, it saves the wrong value (see mistake 2).` },
        { add: 5, why: `Gold gets silver's value. "Ben" is now only in <code>temp</code>.`, missing: `Gold stays "Ben" and both variables end as "Ben".` },
        { add: 6, why: `Silver gets the saved value. Swap complete.`, missing: `<code>silver = gold</code> instead copies the new gold back, so both end as "Aiko".` },
        { add: 7, why: `Show the result.`, missing: `You couldn't see that the swap worked.` }
      ],
      trace: {
        cols: ['gold', 'silver', 'temp'],
        note: `Follow "Ben": it starts in <code>gold</code>, is copied to <code>temp</code>, and finally lands in <code>silver</code>. That's why the order of lines 4, 5 and 6 matters.`
      },
      mistakes: [
        { title: 'Swapping without a temporary variable', bad: 3, code: `gold = "Ben"
silver = "Aiko"
gold = silver
silver = gold
print("After:", gold, silver)`, out: `After: Aiko Aiko`,
          why: `After <code>gold = silver</code>, "Ben" no longer exists anywhere. <code>silver = gold</code> then copies "Aiko" straight back. A value that is overwritten is lost.` },
        { title: 'Saving the value too late', bad: 4, code: `gold = "Ben"
silver = "Aiko"
gold = silver
temp = gold
silver = temp
print("After:", gold, silver)`, out: `After: Aiko Aiko`,
          why: `The right three lines in the wrong order. By the time <code>temp = gold</code> runs, gold already holds "Aiko". Save first, then overwrite.` },
        { title: 'Overwriting in the wrong order', bad: 4, code: `gold = "Ben"
silver = "Aiko"
temp = gold
silver = temp
gold = silver
print("After:", gold, silver)`, out: `After: Ben Ben`,
          why: `<code>silver = temp</code> runs before silver's own value ("Aiko") has been used, so "Aiko" is lost. Each variable must be read before it is overwritten.` }
      ],
      nobuiltins: {
        title: 'The Python shortcut, compared',
        intro: `<p>Python can swap in one line, with a <b>tuple assignment</b>. Both values on the right are read first, then both are assigned:</p>`,
        code: `gold = "Ben"
silver = "Aiko"
print("Before:", gold, silver)
gold, silver = silver, gold
print("After:", gold, silver)`,
        out: `Before: Ben Aiko\nAfter: Aiko Ben`,
        changes: [
          `Lines 4–6 (<code>temp</code>) become one line: <code>gold, silver = silver, gold</code>.`,
          `It works because Python evaluates the whole right-hand side — ("Aiko", "Ben") — before changing either variable.`,
          `IB pseudocode and many exam answers still use the <code>temp</code> version, and it is the one you must be able to trace. Know both.`
        ]
      },
      tip: `"Explain why the output is incorrect" questions on sequence usually want two things: <b>which</b> line runs at the wrong time (or is missing), and <b>what value</b> is lost or wrong as a result. A trace table is the quickest way to show it.`
    },
    {
      title: 'A countdown that stops',
      goal: `<p>For the science-fair rocket launch, count down from a number the user types, then print "Lift off!". The program must always stop.</p>`,
      input: `a whole number, e.g. 5`,
      output: `5, 4, 3, 2, 1 on separate lines, then <code>Lift off!</code>`,
      think: [
        `We repeat "print the number, then make it one smaller" until it reaches 0 — a <code>while</code> loop.`,
        `The loop condition must be able to become <code>False</code>: <code>count &gt; 0</code>.`,
        `Inside the loop, something must move <code>count</code> towards 0, or the loop never ends.`,
        `The order inside the loop decides the output: print first, then subtract, so the first number shown is the start number.`
      ],
      works: `<code>count</code> starts at a whole number and goes down by exactly 1 each time round, so it must reach 0, where <code>count &gt; 0</code> becomes <code>False</code> and the loop ends.`,
      vars: [
        ['count', 'int', 'the number to show; it changes every time round, which is what lets the loop end']
      ],
      code: `count = int(input("Count down from: "))
while count > 0:
    print(count)
    count = count - 1
print("Lift off!")`,
      inputs: ['5'],
      out: `Count down from: 5\n5\n4\n3\n2\n1\nLift off!`,
      build: [
        { add: 1, why: `The starting number, cast to an int.`, missing: `<code>count &gt; 0</code> crashes with a <code>NameError</code>.` },
        { add: 2, expect: 'loops', why: `Repeat while there is still something to count. Run this stage: it never ends, because nothing changes <code>count</code> yet.`, missing: `Without a loop you'd need one <code>print</code> per number.` },
        { add: 3, expect: 'loops', why: `Show the current number. (Still an infinite loop: it prints 5 for ever.)`, missing: `Nothing would be shown before "Lift off!".` },
        { add: 4, why: `Move one step closer to the end. This is the line that lets the condition become <code>False</code> — now the program stops.`, missing: `Missing: an infinite loop (see mistake 1). Before the <code>print</code>: the countdown shows 4 down to 0 (see mistake 2).` },
        { add: 5, why: `Not indented, so it runs once, after the loop has finished.`, missing: `Indented, it would print after every number.` }
      ],
      trace: {
        inputs: ['3'],
        cols: ['count'],
        note: `The condition is tested before each time round. After count reaches 0, <code>0 &gt; 0</code> is <code>False</code> and the program moves on to "Lift off!".`
      },
      mistakes: [
        { title: 'Nothing changes the condition', code: `count = int(input("Count down from: "))
while count > 0:
    print(count)
print("Lift off!")`, loops: true,
          why: `<code>count</code> is 5 for ever, so <code>count &gt; 0</code> is always <code>True</code>: an <b>infinite loop</b>. Every conditional loop needs a line that moves towards making its condition <code>False</code>.` },
        { title: 'Lines in the wrong order', bad: 3, code: `count = int(input("Count down from: "))
while count > 0:
    count = count - 1
    print(count)
print("Lift off!")`, out: `Count down from: 5\n4\n3\n2\n1\n0\nLift off!`,
          why: `The same two lines, swapped. Subtracting before printing means 5 is never shown and 0 is. Sequence matters even inside a loop.` },
        { title: 'Moving the wrong way', bad: 4, code: `count = int(input("Count down from: "))
while count > 0:
    print(count)
    count = count + 1
print("Lift off!")`, loops: true,
          why: `<code>count</code> gets bigger, so it never gets to 0 — another infinite loop. The update must move <b>towards</b> the stopping condition.` },
        { title: 'Stepping over the stopping value', bad: 2, code: `count = 5
while count != 0:
    print(count)
    count = count - 2`, loops: true,
          why: `5, 3, 1, -1, -3… <code>count</code> jumps straight past 0, so <code>count != 0</code> stays <code>True</code>. Conditions like <code>count &gt; 0</code> are safer than <code>!=</code>.` }
      ],
      nobuiltins: { none: `Nothing is banned here. (A counted loop, <code>for count in range(start, 0, -1)</code>, can't become infinite at all — a good choice when you know how many times to repeat.)` },
      tip: `For "explain why this loop never ends" questions, name the variable in the condition and say why it never makes the condition false (it never changes, or changes the wrong way). For "suggest a fix", give the exact corrected line.`
    }
  ]
});
