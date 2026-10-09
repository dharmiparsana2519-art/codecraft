/* "Build it from scratch" notes — B2.2.3 Stacks (LIFO). Format: see widgets/notes.js. */
CodeCraft.addNotes('B2.2.3', {
  viz: ['stack'],
  intro: `<p>A <span class="term">stack</span> is a <b>LIFO</b> structure — <b>L</b>ast <b>I</b>n, <b>F</b>irst <b>O</b>ut — like a pile of trays in the canteen: you can only add to the top or take from the top. The operations IB uses are <b>push</b> (add to the top), <b>pop</b> (remove and return the top item), <b>peek</b> (look at the top item without removing it) and <b>isEmpty</b>. The fixed-size version also has <b>isFull</b>.</p>
  <p>Pushing onto a full stack is a <b>stack overflow</b>; popping from an empty one is a <b>stack underflow</b>. Stacks are behind a browser's Back button, "undo" in an editor, and checking that brackets match. The textbook builds a stack from a <b>fixed-size array</b> with a <code>topIndex</code>, so that comes first; the Python-list version follows.</p>`,
  programs: [
    {
      title: 'A stack class with a fixed-size array',
      goal: `<p>Build a <code>Stack</code> class for a browser's Back button. It stores at most a fixed number of pages in an array, and keeps <code>topIndex</code>: the index of the top item, or -1 when the stack is empty. It must refuse to push onto a full stack (overflow) or pop from an empty one (underflow).</p>`,
      input: `the pages visited, pushed one at a time: <code>"home"</code>, <code>"news"</code>, <code>"sport"</code>, <code>"weather"</code> — into a stack with room for 3`,
      output: `an overflow message for the 4th push, then the page we leave (the top) and the page we are back on`,
      think: [
        `Make the array the full size at the start: <code>[None] * size</code>. A static structure never grows or shrinks.`,
        `Keep <code>topIndex</code>, the index of the top item. Start it at -1: "no top yet", so empty.`,
        `<b>push</b>: if the stack is full, report overflow; otherwise move <code>topIndex</code> up by 1 <em>first</em>, then store the item there.`,
        `<b>pop</b>: if the stack is empty, report underflow; otherwise read the item at <code>topIndex</code>, move <code>topIndex</code> down by 1, and return the item.`,
        `<b>isEmpty</b> is <code>topIndex == -1</code>; <b>isFull</b> is <code>topIndex == size - 1</code> (the last index); <b>peek</b> returns the top item without moving <code>topIndex</code>.`
      ],
      works: `<code>topIndex</code> always points at the most recent item that is still on the stack. Push moves it up before storing, pop reads before moving it down, so the last item in is always the first one out — LIFO.`,
      vars: [
        ['items', 'list (fixed size)', 'the array that holds the stack; empty slots hold <code>None</code>'],
        ['topIndex', 'int', 'index of the top item; -1 means empty'],
        ['size', 'int', 'the maximum number of items, used by <code>isFull</code>'],
        ['item', 'str here (any type)', 'the value being pushed, or the one being popped'],
        ['history', 'Stack', 'the object we test the class with']
      ],
      code: `class Stack:
    def __init__(self, size):
        self.items = [None] * size
        self.topIndex = -1
        self.size = size

    def isEmpty(self):
        return self.topIndex == -1

    def isFull(self):
        return self.topIndex == self.size - 1

    def push(self, item):
        if self.isFull():
            print("Stack overflow")
        else:
            self.topIndex = self.topIndex + 1
            self.items[self.topIndex] = item

    def pop(self):
        if self.isEmpty():
            print("Stack underflow")
            return None
        item = self.items[self.topIndex]
        self.topIndex = self.topIndex - 1
        return item

    def peek(self):
        if self.isEmpty():
            return None
        return self.items[self.topIndex]


history = Stack(3)
history.push("home")
history.push("news")
history.push("sport")
history.push("weather")
print("Leaving", history.pop())
print("Now on", history.peek())`,
      out: `Stack overflow\nLeaving sport\nNow on news`,
      build: [
        { add: 1, why: `A class is the blueprint for stack objects.`, missing: `<code>Stack(3)</code> later crashes with a <code>NameError</code>.` },
        { add: 2, why: `The constructor runs when a stack is created. <code>size</code> says how many items it can hold.`, missing: `<code>Stack(3)</code> fails with a <code>TypeError</code>: there is nowhere for the 3 to go.` },
        { add: 3, why: `Make the whole array now: <code>[None] * 3</code> is <code>[None, None, None]</code>. This is what makes it a <b>static</b> structure — its size is fixed when it is created.`, missing: `Every push crashes with an <code>AttributeError</code> — there is no array to store into.` },
        { add: 4, why: `-1 means "no top item yet". The first push moves it to 0, the first index.`, missing: `Starting at 0 makes a new stack look like it has one item (see mistake 4).` },
        { add: 5, why: `Remember the size, so <code>isFull</code> can compare with it without calling <code>len</code>.`, missing: `<code>isFull</code> crashes with an <code>AttributeError</code>.` },
        { add: 34, why: `Make a stack to test with as soon as the constructor exists. Running this stage proves the class works so far — no output yet, but no error either.`, missing: `Nothing ever uses the class, so mistakes stay hidden.` },
        { add: 7, why: `A method that answers "is the stack empty?" with <code>True</code> or <code>False</code>.`, missing: `<code>pop</code> and <code>peek</code> can't check for underflow.` },
        { add: 8, why: `Empty exactly when there is no top item: <code>topIndex == -1</code>. The comparison is already a bool, so return it.`, missing: `Testing <code>== 0</code> instead is wrong: index 0 holds the first item (see mistake 4).` },
        { add: 10, why: `"Is the stack full?" — needed before every push.`, missing: `Nothing would stop a push past the end of the array.` },
        { add: 11, why: `Full when the top item is in the last slot. The last index of an array of <code>size</code> items is <code>size - 1</code>.`, missing: `With <code>== self.size</code> the stack is never "full", and the push after that crashes (see mistake 2).` },
        { add: 13, why: `push takes the item to add.`, missing: `<code>history.push("home")</code> crashes with an <code>AttributeError</code>.` },
        { add: 14, why: `Check for overflow <b>before</b> changing anything.`, missing: `Checking after storing is too late — the array has already overflowed.` },
        { add: 15, why: `Full: report a stack overflow and store nothing.`, missing: `The full case would silently do nothing, and the user wouldn't know the item was lost.` },
        { add: 16, why: `Otherwise there is room, so push.`, missing: `Without <code>else</code>, the next two lines would run even when the stack is full.` },
        { add: 17, why: `Move the top up <b>first</b>: from -1 to 0 on the first push.`, missing: `Storing before moving writes to <code>items[-1]</code> — the <em>last</em> slot of the array (see mistake 1).` },
        { add: 18, why: `Store the item in the new top slot.`, missing: `<code>topIndex</code> would move but the item would never be stored.` },
        { add: 35, why: `Test push. Nothing is printed yet, but the item is now in <code>items[0]</code>.`, missing: `If the pushes came after the pop, the pop would find an empty stack and report an underflow.` },
        { add: 36, why: `A second page goes on top of the first: <code>items[1]</code>.`, missing: `With one push fewer the stack never fills up, so "weather" would be stored and the overflow would never be tested.` },
        { add: 37, why: `The stack is now full: <code>topIndex</code> is 2 = size − 1.`, missing: `The same: the stack must hold 3 items before the 4th push can test overflow.` },
        { add: 38, why: `Test overflow: a 4th push into a stack of 3. Run this stage — it prints <code>Stack overflow</code>.`, missing: `Without a test like this, you never find out whether <code>isFull</code> works.` },
        { add: 20, why: `pop takes no item — it always removes the top one.`, missing: `<code>history.pop()</code> crashes with an <code>AttributeError</code>.` },
        { add: 21, why: `Check for underflow before reading anything.`, missing: `Popping an empty stack reads <code>items[-1]</code> and moves <code>topIndex</code> to -2, which breaks every later operation.` },
        { add: 22, why: `Empty: report a stack underflow…`, missing: `The caller wouldn't know why they got nothing back.` },
        { add: 23, why: `…and return <code>None</code>, so nothing below runs.`, missing: `Without it, the method carries on and reads <code>items[-1]</code>.` },
        { add: 24, why: `Read the top item into a variable <b>before</b> moving <code>topIndex</code>.`, missing: `If <code>topIndex</code> moved first, you would read the item <em>under</em> the top.` },
        { add: 25, why: `Move the top down. The old value is still in the array, but it is above the top now, so it no longer counts — the next push overwrites it.`, missing: `Without it pop only <em>looks</em> at the top: it works like peek and returns the same item again and again (see mistake 3).` },
        { add: 26, why: `Hand the popped item back to the caller.`, missing: `pop would return <code>None</code>, and the program would print <code>Leaving None</code>.` },
        { add: 39, why: `Test pop: "sport" was the last page stored, so it comes off first — LIFO.`, missing: `Put before the pushes, it pops an empty stack: <code>Stack underflow</code>, then <code>Leaving None</code>.` },
        { add: 28, why: `peek: look at the top without removing it.`, missing: `<code>history.peek()</code> crashes with an <code>AttributeError</code>.` },
        { add: 29, why: `An empty stack has no top item to look at.`, missing: `On an empty stack, <code>items[-1]</code> would return whatever is in the last slot — a wrong answer with no error.` },
        { add: 30, why: `So return <code>None</code>.`, missing: `Without it the method carries on to the next line and returns <code>items[-1]</code> — the last slot, which may hold an old value.` },
        { add: 31, why: `Return the top item, and leave <code>topIndex</code> alone.`, missing: `Changing <code>topIndex</code> here would turn peek into pop.` },
        { add: 40, why: `After popping "sport", the top is "news". The output is now complete.`, missing: `Put before the pop, it shows "sport" — peek shows whatever is on top at the moment it is called.` }
      ],
      trace: {
        cols: ['history.topIndex', 'history.items'],
        note: `Watch the 4th push: <code>isFull()</code> is <code>True</code>, so nothing changes. And after the pop, <code>items</code> still shows "sport" — but <code>topIndex</code> is 1, so "sport" is no longer part of the stack.`
      },
      mistakes: [
        { title: 'Storing before moving topIndex', bad: 7, code: `class Stack:
    def __init__(self, size):
        self.items = [None] * size
        self.topIndex = -1

    def push(self, item):
        self.items[self.topIndex] = item
        self.topIndex = self.topIndex + 1

    def pop(self):
        item = self.items[self.topIndex]
        self.topIndex = self.topIndex - 1
        return item


history = Stack(3)
history.push("home")
history.push("news")
print("Leaving", history.pop())`, out: `Leaving None`,
          why: `The first push stores "home" in <code>items[-1]</code> — Python's last slot, index 2 — then moves the top to 0. "news" goes in slot 0 and the top moves to 1, an empty slot, so pop returns <code>None</code>. Move the top first, then store. (The full/empty checks are left out of these short versions.)` },
        { title: 'isFull one too high', bad: 8, code: `class Stack:
    def __init__(self, size):
        self.items = [None] * size
        self.topIndex = -1
        self.size = size

    def isFull(self):
        return self.topIndex == self.size

    def push(self, item):
        if self.isFull():
            print("Stack overflow")
        else:
            self.topIndex = self.topIndex + 1
            self.items[self.topIndex] = item


history = Stack(3)
for page in ["home", "news", "sport", "weather"]:
    history.push(page)`, error: 'IndexError', errorText: 'list assignment index out of range',
          why: `With 3 slots the indexes are 0, 1, 2, so the stack is full when <code>topIndex</code> is 2 — <code>size - 1</code>. Testing <code>== size</code> lets the 4th push move to index 3, which doesn't exist.` },
        { title: 'pop that never moves topIndex', bad: 11, code: `class Stack:
    def __init__(self, size):
        self.items = [None] * size
        self.topIndex = -1

    def push(self, item):
        self.topIndex = self.topIndex + 1
        self.items[self.topIndex] = item

    def pop(self):
        return self.items[self.topIndex]


history = Stack(3)
history.push("home")
history.push("news")
print(history.pop())
print(history.pop())`, out: `news\nnews`,
          why: `This "pop" only reads the top — it is really peek. The top never moves down, so the same item comes back every time.` },
        { title: 'Testing for empty with 0', bad: 7, code: `class Stack:
    def __init__(self, size):
        self.items = [None] * size
        self.topIndex = -1

    def isEmpty(self):
        return self.topIndex == 0

    def push(self, item):
        self.topIndex = self.topIndex + 1
        self.items[self.topIndex] = item


history = Stack(3)
print(history.isEmpty())
history.push("home")
print(history.isEmpty())`, out: `False\nTrue`,
          why: `Exactly backwards: the new stack says it isn't empty, and after one push it says it is. <code>topIndex</code> 0 means one item, in slot 0; <b>empty is -1</b>.` }
      ],
      nobuiltins: {
        title: 'Built-ins: the Python-list version, compared',
        intro: `<p>Our class is already the no-built-ins version: no <code>append</code>, <code>pop</code> or <code>len</code>. Here is the same stack using Python's built-in list methods, which is shorter — but exams can ban exactly these methods, and it can never overflow:</p>`,
        code: `class Stack:
    def __init__(self):
        self.items = []

    def isEmpty(self):
        return len(self.items) == 0

    def push(self, item):
        self.items.append(item)

    def pop(self):
        if self.isEmpty():
            print("Stack underflow")
            return None
        return self.items.pop()

    def peek(self):
        if self.isEmpty():
            return None
        return self.items[-1]


history = Stack()
history.push("home")
history.push("news")
history.push("sport")
history.push("weather")
print("Leaving", history.pop())
print("Now on", history.peek())`,
        out: `Leaving weather\nNow on sport`,
        changes: [
          `<code>[None] * size</code>, <code>topIndex</code> and <code>size</code> become just <code>self.items = []</code>. A Python list is <b>dynamic</b>: it grows and shrinks, and the top is always its last item.`,
          `<code>isEmpty</code>: <code>topIndex == -1</code> becomes <code>len(self.items) == 0</code> (uses <code>len</code>).`,
          `<code>isFull</code> disappears, and so does overflow — so "weather" is accepted and the output changes.`,
          `<code>push</code>: "move the top up, then store" becomes <code>self.items.append(item)</code>.`,
          `<code>pop</code>: "read the top, then move it down" becomes <code>self.items.pop()</code>, which removes and returns the last item.`,
          `<code>peek</code>: <code>items[topIndex]</code> becomes <code>items[-1]</code>, the last item.`
        ]
      },
      tip: `When asked to construct push or pop, marks usually go to: checking full (push) or empty (pop) <b>first</b>; changing <code>topIndex</code> in the right direction; using <code>items[topIndex]</code> in the right order (move then store for push, read then move for pop); and returning the item from pop. Also be ready to <b>define</b> overflow and underflow — and to explain why the array version needs <code>isFull</code> but the list version doesn't.`
    },
    {
      title: 'Checking that brackets match',
      goal: `<p>Write a function <code>balanced(text)</code> that returns <code>True</code> if every <code>(</code> in the text has a matching <code>)</code> after it, in the right order, and <code>False</code> otherwise. Code editors and calculators use this check.</p>`,
      input: `a string such as <code>"(a + b) * (c - d)"</code>`,
      output: `<code>True</code> or <code>False</code>`,
      think: [
        `Read the text one character at a time with a <code>for</code> loop.`,
        `When we meet <code>(</code>, push it: it is waiting for its partner.`,
        `When we meet <code>)</code>, it closes the <b>most recent</b> unmatched <code>(</code> — the one on top. So pop it. If the stack is empty, this <code>)</code> has no partner: return <code>False</code> straight away.`,
        `At the end, any <code>(</code> still on the stack was never closed, so the text is balanced only if the stack is empty.`
      ],
      works: `a closing bracket always matches the most recently opened one that is still open — last in, first out. The stack holds exactly the brackets that are still open, in order, so it is the right structure for the job.`,
      vars: [
        ['text', 'str', 'the parameter: the text to check'],
        ['stack', 'list', 'the open brackets still waiting for a partner'],
        ['ch', 'str', 'the loop variable: one character at a time']
      ],
      code: `def balanced(text):
    stack = []
    for ch in text:
        if ch == "(":
            stack.append(ch)
        elif ch == ")":
            if len(stack) == 0:
                return False
            stack.pop()
    return len(stack) == 0


print(balanced("(a + b) * (c - d)"))
print(balanced("(a + b))"))
print(balanced("((a + b)"))`,
      out: `True\nFalse\nFalse`,
      build: [
        { add: 1, why: `A function, so the check can be used on any text.`, missing: `The calls below crash with a <code>NameError</code>.` },
        { add: 13, why: `Call it straight away with a balanced example. Run this stage: it prints <code>None</code>, because the function doesn't return anything yet.`, missing: `You can't see whether the function works.` },
        { add: 2, why: `An empty Python list to use as the stack. A new one is made every time the function is called.`, missing: `<code>stack.append</code> crashes with a <code>NameError</code>.` },
        { add: 3, why: `Look at each character in turn — a counted loop over the string.`, missing: `Without a loop, only one character could be checked.` },
        { add: 4, why: `An opening bracket?`, missing: `Every character would be treated the same way.` },
        { add: 5, why: `Push it: it waits on the stack for its partner.`, missing: `Nothing is ever pushed, so the first <code>)</code> finds an empty stack.` },
        { add: 6, why: `A closing bracket? (<code>elif</code>, because a character can't be both.) Letters and spaces match neither, so they are ignored.`, missing: `Closing brackets would never be dealt with.` },
        { add: 9, why: `Pop the most recent <code>(</code> — this <code>)</code> closes it.`, missing: `The stack would only ever grow, so any text with a bracket in it would be "unbalanced".` },
        { add: 10, why: `After the loop, balanced means nothing is left open. Run this stage: <code>True</code>.`, missing: `Returning <code>True</code> here instead would miss brackets that were never closed (see mistake 2).` },
        { add: 14, expect: 'IndexError', why: `Test text with one <code>)</code> too many. Run this stage: it crashes with an <code>IndexError</code>, because it pops from an empty stack — a stack <b>underflow</b>. The next two lines fix it.`, missing: `Without testing this case, the bug stays hidden (see mistake 4).` },
        { add: 7, expect: 'IndexError', why: `Before popping, check whether there is anything to pop. (The <code>pass</code> means nothing happens yet, so it still crashes.)`, missing: `Popping an empty list crashes.` },
        { add: 8, why: `Nothing to pop means this <code>)</code> has no partner, so the text can't be balanced — return <code>False</code> at once. Now the second test prints <code>False</code>.`, missing: `With only the <code>if</code> line, the placeholder <code>pass</code> does nothing and the pop still crashes.` },
        { add: 15, why: `Test one <code>(</code> too many: it is left on the stack, so the final check gives <code>False</code>.`, missing: `Without this test, forgetting the final check (mistake 2) would go unnoticed: the first two tests give the right answers either way.` }
      ],
      trace: {
        code: `def balanced(text):
    stack = []
    for ch in text:
        if ch == "(":
            stack.append(ch)
        elif ch == ")":
            if len(stack) == 0:
                return False
            stack.pop()
    return len(stack) == 0


print(balanced("(()"))`,
        cols: ['ch', 'stack'],
        note: `The stack grows to two open brackets, the <code>)</code> closes one, and the loop ends with one still open — so <code>len(stack) == 0</code> is <code>False</code>.`
      },
      mistakes: [
        { title: 'Returning inside the loop', bad: 10, code: `def balanced(text):
    stack = []
    for ch in text:
        if ch == "(":
            stack.append(ch)
        elif ch == ")":
            if len(stack) == 0:
                return False
            stack.pop()
        return len(stack) == 0


print(balanced("(a + b) * (c - d)"))
print(balanced("(a + b))"))
print(balanced("((a + b)"))`, out: `False\nFalse\nFalse`,
          why: `The last <code>return</code> is indented inside the <code>for</code>, so the function returns after the <b>first</b> character. After <code>(</code> the stack isn't empty, so every test gives <code>False</code>.` },
        { title: 'Forgetting the final check', bad: 10, code: `def balanced(text):
    stack = []
    for ch in text:
        if ch == "(":
            stack.append(ch)
        elif ch == ")":
            if len(stack) == 0:
                return False
            stack.pop()
    return True


print(balanced("(a + b) * (c - d)"))
print(balanced("(a + b))"))
print(balanced("((a + b)"))`, out: `True\nFalse\nTrue`,
          why: `<code>"((a + b)"</code> leaves one <code>(</code> on the stack that was never closed, but the function says <code>True</code>. The text is only balanced if the stack is empty at the end.` },
        { title: 'Counting brackets instead of using a stack', bad: 2, code: `def balanced(text):
    return text.count("(") == text.count(")")


print(balanced("(a + b)"))
print(balanced(")a + b("))`, out: `True\nTrue`,
          why: `The counts match, but in <code>")a + b("</code> each bracket is closed before it is opened. Order matters, and only a stack (or a check that the "open" count never goes below 0) notices.` },
        { title: 'Popping without checking for empty', bad: 7, code: `def balanced(text):
    stack = []
    for ch in text:
        if ch == "(":
            stack.append(ch)
        elif ch == ")":
            stack.pop()
    return len(stack) == 0


print(balanced("(a + b))"))`, error: 'IndexError', errorText: 'pop from empty list',
          why: `The second <code>)</code> tries to pop from an empty stack — an <b>underflow</b> — and the program crashes. Always check that a stack isn't empty before popping.` }
      ],
      nobuiltins: {
        ban: ['append', 'pop', 'len'],
        intro: `<p>If <code>append</code>, <code>pop</code> and <code>len</code> are banned, use a fixed-size array and a top index, exactly like the Stack class in program 1:</p>`,
        code: `def balanced(text):
    stack = [None] * 50
    top = -1
    for ch in text:
        if ch == "(":
            top = top + 1
            stack[top] = ch
        elif ch == ")":
            if top == -1:
                return False
            top = top - 1
    return top == -1


print(balanced("(a + b) * (c - d)"))
print(balanced("(a + b))"))
print(balanced("((a + b)"))`,
        out: `True\nFalse\nFalse`,
        changes: [
          `<code>stack = []</code> becomes a fixed array, <code>[None] * 50</code>, plus <code>top = -1</code> for "empty".`,
          `<code>stack.append(ch)</code> becomes two lines: <code>top = top + 1</code>, <b>then</b> <code>stack[top] = ch</code>.`,
          `<code>len(stack) == 0</code> becomes <code>top == -1</code> — in both places.`,
          `<code>stack.pop()</code> becomes <code>top = top - 1</code>. We never need the popped value here, so moving the top down is enough.`,
          `The cost of a static array: text with more than 50 open brackets would overflow. A full answer would check <code>top == 49</code> before pushing.`
        ]
      },
      tip: `"Explain how a stack can be used to…" questions usually reward: push on an opening bracket, pop on a closing one, check the stack isn't empty before popping (a closing bracket with no partner), and check the stack is empty at the end. Name the LIFO property and say <b>why</b> it fits: a closing bracket matches the most recently opened one.`
    }
  ]
});
