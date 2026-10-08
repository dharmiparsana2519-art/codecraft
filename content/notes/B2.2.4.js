/* "Build it from scratch" notes — B2.2.4 Queues (FIFO). Format: see widgets/notes.js. */
CodeCraft.addNotes('B2.2.4', {
  intro: `<p>A <span class="term">queue</span> is a <b>FIFO</b> structure — <b>F</b>irst <b>I</b>n, <b>F</b>irst <b>O</b>ut — like the canteen line: people join at the <b>rear</b> and are served from the <b>front</b>. IB's operations are <b>enqueue</b> (add at the rear), <b>dequeue</b> (remove and return the front item), <b>front</b> (look at the front item without removing it) and <b>isEmpty</b>; the fixed-size version also has <b>isFull</b>.</p>
  <p>Queues are used for print queues, task scheduling and anything served in arrival order. The array version keeps two indexes, <code>frontIndex</code> and <code>rearIndex</code>. Program 1 shows its weakness; program 2, the <b>circular queue</b>, fixes it.</p>`,
  programs: [
    {
      title: 'A queue in a fixed-size array',
      goal: `<p>Build a <code>Queue</code> class for the canteen line, using an array of fixed size with a front pointer and a rear pointer. It must refuse to enqueue when full and to dequeue when empty.</p>`,
      input: `Aiko, Ben and Carla join a queue with room for 3; one person is served; then Dev tries to join`,
      output: `<code>Served Aiko</code>, <code>Next: Ben</code> — and then <code>Queue full</code>, even though a slot is free`,
      think: [
        `Make the array full-size at the start, and keep two indexes: <code>frontIndex</code> (the next to be served, starting at 0) and <code>rearIndex</code> (the last to join, starting at -1: nobody yet).`,
        `<b>enqueue</b>: if full, report it; otherwise move <code>rearIndex</code> up by 1, then store the item there.`,
        `<b>dequeue</b>: if empty, report it; otherwise read the item at <code>frontIndex</code>, then move <code>frontIndex</code> up by 1.`,
        `The queue is empty when the rear is behind the front (<code>rearIndex &lt; frontIndex</code>), and full when the rear has reached the last index.`,
        `<b>front</b> returns the item at <code>frontIndex</code> without moving anything.`
      ],
      works: `both indexes only ever move forward, so items leave in the same order they arrived — FIFO. The items between <code>frontIndex</code> and <code>rearIndex</code> are exactly the people still waiting.`,
      vars: [
        ['items', 'list (fixed size)', 'the array; <code>None</code> means an unused slot'],
        ['frontIndex', 'int', 'index of the next item to dequeue'],
        ['rearIndex', 'int', 'index of the last item enqueued; -1 at the start'],
        ['size', 'int', 'capacity, used by <code>isFull</code>'],
        ['item', 'str here', 'the value being added or removed']
      ],
      code: `class Queue:
    def __init__(self, size):
        self.items = [None] * size
        self.frontIndex = 0
        self.rearIndex = -1
        self.size = size

    def isEmpty(self):
        return self.rearIndex < self.frontIndex

    def isFull(self):
        return self.rearIndex == self.size - 1

    def enqueue(self, item):
        if self.isFull():
            print("Queue full")
        else:
            self.rearIndex = self.rearIndex + 1
            self.items[self.rearIndex] = item

    def dequeue(self):
        if self.isEmpty():
            print("Queue empty")
            return None
        item = self.items[self.frontIndex]
        self.frontIndex = self.frontIndex + 1
        return item

    def front(self):
        if self.isEmpty():
            return None
        return self.items[self.frontIndex]


canteen = Queue(3)
canteen.enqueue("Aiko")
canteen.enqueue("Ben")
canteen.enqueue("Carla")
print("Served", canteen.dequeue())
print("Next:", canteen.front())
canteen.enqueue("Dev")`,
      out: `Served Aiko\nNext: Ben\nQueue full`,
      build: [
        { add: 1, why: `The blueprint for queue objects.`, missing: `<code>Queue(3)</code> crashes with a <code>NameError</code>.` },
        { add: 2, why: `The constructor takes the capacity.`, missing: `<code>Queue(3)</code> crashes with a <code>TypeError</code>.` },
        { add: 3, why: `Allocate every slot now — a static array.`, missing: `There is nowhere to store the queue.` },
        { add: 4, why: `The first person served will be in slot 0.`, missing: `<code>dequeue</code> crashes with an <code>AttributeError</code>.` },
        { add: 5, why: `-1: nobody has joined yet. The first enqueue moves it to 0.`, missing: `Starting at 0 would leave slot 0 empty and the queue would look one person longer.` },
        { add: 6, why: `Remember the capacity for <code>isFull</code>.`, missing: `<code>isFull</code> crashes with an <code>AttributeError</code>.` },
        { add: 35, why: `Make a queue straight away to test the constructor.`, missing: `Nothing uses the class, so bugs stay hidden.` },
        { add: 8, why: `"Is the queue empty?"`, missing: `<code>dequeue</code> and <code>front</code> can't check for an empty queue.` },
        { add: 9, why: `Empty when the rear is behind the front: at the start (-1 &lt; 0), and again once everyone who joined has been served.`, missing: `Testing <code>rearIndex == -1</code> is only right at the very start (see mistake 2).` },
        { add: 11, why: `"Is the queue full?"`, missing: `Nothing would stop an enqueue past the end of the array.` },
        { add: 12, why: `Full once the rear has reached the last index, size − 1.`, missing: `With <code>== self.size</code>, the enqueue after that crashes with an <code>IndexError</code>.` },
        { add: 14, why: `enqueue takes the item that is joining.`, missing: `<code>canteen.enqueue(...)</code> crashes with an <code>AttributeError</code>.` },
        { add: 15, why: `Check before changing anything.`, missing: `A full queue would overflow.` },
        { add: 16, why: `Full: refuse.`, missing: `The person would silently not join.` },
        { add: 17, why: `Otherwise there's room at the rear.`, missing: `The next lines would run even when full.` },
        { add: 18, why: `Move the rear up <b>first</b>…`, missing: `Storing first writes to <code>items[-1]</code>, the last slot (see mistake 4).` },
        { add: 19, why: `…then store the item at the new rear.`, missing: `The rear moves but nobody is stored.` },
        { add: 36, why: `Aiko joins: slot 0.`, missing: `With one person fewer, the queue never fills, and Dev's line wouldn't show the problem.` },
        { add: 37, why: `Ben: slot 1.`, missing: `The same.` },
        { add: 38, why: `Carla: slot 2. The queue is now full.`, missing: `The same.` },
        { add: 21, why: `dequeue removes the front item, so it takes no parameter.`, missing: `<code>canteen.dequeue()</code> crashes with an <code>AttributeError</code>.` },
        { add: 22, why: `Check for an empty queue first.`, missing: `An empty queue would hand back an old or missing item.` },
        { add: 23, why: `Empty: say so…`, missing: `The caller wouldn't know why nothing came back.` },
        { add: 24, why: `…and return <code>None</code>.`, missing: `The method would carry on and read a slot that isn't in the queue.` },
        { add: 25, why: `Read the front item before moving the pointer.`, missing: `Reading <code>items[rearIndex]</code> instead serves the <b>last</b> to arrive — that's a stack (see mistake 1).` },
        { add: 26, why: `Move the front along. The served item stays in the array, but it's no longer part of the queue.`, missing: `The same person is served again and again (see mistake 3).` },
        { add: 27, why: `Hand the item back.`, missing: `The caller gets <code>None</code>.` },
        { add: 39, why: `Aiko was first in, so she is first out — FIFO.`, missing: `You couldn't see who was served.` },
        { add: 29, why: `front: look without removing.`, missing: `<code>canteen.front()</code> crashes with an <code>AttributeError</code>.` },
        { add: 30, why: `Nothing to look at if the queue is empty…`, missing: `An empty queue would return an old value with no warning.` },
        { add: 31, why: `…so return <code>None</code>.`, missing: `The method would carry on and read a slot outside the queue.` },
        { add: 32, why: `The item at <code>frontIndex</code>, without moving it.`, missing: `Moving <code>frontIndex</code> here would turn front into dequeue.` },
        { add: 40, why: `Ben is next.`, missing: `You couldn't check that front works.` },
        { add: 41, why: `Dev tries to join. <code>rearIndex</code> is 2 = size − 1, so the queue says it is full — even though slot 0 is free again. The pointers only move forward, so served slots are never reused. Program 2 fixes this.`, missing: `The weakness of this design would stay hidden.` }
      ],
      trace: {
        cols: ['canteen.frontIndex', 'canteen.rearIndex', 'canteen.items'],
        note: `After the dequeue, <code>frontIndex</code> is 1 but "Aiko" is still in slot 0 — it just isn't part of the queue any more. That slot can never be used again, which is why Dev is refused.`
      },
      mistakes: [
        { title: 'Dequeuing from the rear', bad: 12, code: `class Queue:
    def __init__(self, size):
        self.items = [None] * size
        self.frontIndex = 0
        self.rearIndex = -1

    def enqueue(self, item):
        self.rearIndex = self.rearIndex + 1
        self.items[self.rearIndex] = item

    def dequeue(self):
        item = self.items[self.rearIndex]
        self.rearIndex = self.rearIndex - 1
        return item


canteen = Queue(3)
canteen.enqueue("Aiko")
canteen.enqueue("Ben")
canteen.enqueue("Carla")
print("Served", canteen.dequeue())`, out: `Served Carla`,
          why: `Taking from the rear gives last in, first out — a stack, not a queue. A queue always removes from the front. (The checks are left out of these short versions.)` },
        { title: 'isEmpty that only works at the start', bad: 8, code: `class Queue:
    def __init__(self, size):
        self.items = [None] * size
        self.frontIndex = 0
        self.rearIndex = -1

    def isEmpty(self):
        return self.rearIndex == -1

    def enqueue(self, item):
        self.rearIndex = self.rearIndex + 1
        self.items[self.rearIndex] = item

    def dequeue(self):
        if self.isEmpty():
            print("Queue empty")
            return None
        item = self.items[self.frontIndex]
        self.frontIndex = self.frontIndex + 1
        return item


canteen = Queue(3)
canteen.enqueue("Aiko")
print("Served", canteen.dequeue())
print("Served", canteen.dequeue())`, out: `Served Aiko\nServed None`,
          why: `After Aiko is served the queue is empty, but <code>rearIndex</code> is still 0, so the test says it isn't. The second dequeue reads an unused slot. Empty means the rear is behind the front.` },
        { title: 'Forgetting to move the front', code: `class Queue:
    def __init__(self, size):
        self.items = [None] * size
        self.frontIndex = 0
        self.rearIndex = -1

    def enqueue(self, item):
        self.rearIndex = self.rearIndex + 1
        self.items[self.rearIndex] = item

    def dequeue(self):
        item = self.items[self.frontIndex]
        return item


canteen = Queue(3)
canteen.enqueue("Aiko")
canteen.enqueue("Ben")
print("Served", canteen.dequeue())
print("Served", canteen.dequeue())`, out: `Served Aiko\nServed Aiko`,
          why: `Without <code>self.frontIndex = self.frontIndex + 1</code>, "dequeue" never removes anyone — it behaves like front. Aiko is served for ever.` },
        { title: 'Storing before moving the rear', bad: 8, code: `class Queue:
    def __init__(self, size):
        self.items = [None] * size
        self.frontIndex = 0
        self.rearIndex = -1

    def enqueue(self, item):
        self.items[self.rearIndex] = item
        self.rearIndex = self.rearIndex + 1

    def dequeue(self):
        item = self.items[self.frontIndex]
        self.frontIndex = self.frontIndex + 1
        return item


canteen = Queue(3)
canteen.enqueue("Aiko")
canteen.enqueue("Ben")
print("Served", canteen.dequeue())`, out: `Served Ben`,
          why: `The first enqueue writes to <code>items[-1]</code> — Python's last slot — so Aiko ends up at the back of the array and Ben in slot 0. Move the rear first, then store.` }
      ],
      nobuiltins: {
        title: 'Built-ins: the Python-list version, compared',
        intro: `<p>Our class uses no built-ins. With a Python list, <code>append</code> and <code>pop(0)</code> do the work — shorter, never full, but often banned, and <code>pop(0)</code> has a hidden cost:</p>`,
        code: `class Queue:
    def __init__(self):
        self.items = []

    def isEmpty(self):
        return len(self.items) == 0

    def enqueue(self, item):
        self.items.append(item)

    def dequeue(self):
        if self.isEmpty():
            print("Queue empty")
            return None
        return self.items.pop(0)

    def front(self):
        if self.isEmpty():
            return None
        return self.items[0]


canteen = Queue()
canteen.enqueue("Aiko")
canteen.enqueue("Ben")
canteen.enqueue("Carla")
print("Served", canteen.dequeue())
print("Next:", canteen.front())
canteen.enqueue("Dev")
print(canteen.items)`,
        out: `Served Aiko\nNext: Ben\n['Ben', 'Carla', 'Dev']`,
        changes: [
          `The array and both pointers become <code>self.items = []</code>: the front is always index 0, the rear always the end.`,
          `<code>isEmpty</code> uses <code>len</code>; <code>isFull</code> disappears, so Dev is let in.`,
          `<code>enqueue</code>: "move the rear, then store" becomes <code>append(item)</code>.`,
          `<code>dequeue</code>: "read the front, then move it" becomes <code>pop(0)</code>. But removing index 0 makes Python <b>shift every other item</b> one place left — O(n) work per dequeue. The array version just moves a pointer: O(1).`
        ]
      },
      tip: `For "construct enqueue/dequeue" questions, marks usually go to: checking full/empty first, updating the right pointer (rear for enqueue, front for dequeue) in the right order, storing or reading the item, and returning it from dequeue. Be ready to explain why a linear array queue can report "full" when it has free slots.`
    },
    {
      title: 'A circular queue that reuses free slots',
      goal: `<p>Fix program 1's weakness: when a pointer reaches the end of the array, it <b>wraps round</b> to index 0, so slots freed by dequeue are reused. Keep a <code>count</code> of items to tell full from empty.</p>`,
      input: `the same canteen line: Aiko, Ben and Carla join a queue of size 3; one is served; Dev joins`,
      output: `<code>Served Aiko</code>, <code>Next: Ben</code>, and the array <code>['Dev', 'Ben', 'Carla']</code> — Dev reused slot 0`,
      think: [
        `Move pointers with <code>(index + 1) % size</code>. For size 3: 0 → 1 → 2 → 0 → 1… The remainder wraps the index back to 0 after the last slot.`,
        `With wrapping, the rear can be <em>behind</em> the front, so comparing the pointers no longer tells full from empty. Keep a <code>count</code> instead: empty is 0, full is <code>size</code>.`,
        `enqueue: if not full, move the rear (wrapping), store, add 1 to count.`,
        `dequeue: if not empty, read the front, move the front (wrapping), take 1 from count, return the item.`
      ],
      works: `the modulus keeps every index between 0 and size − 1, so no pointer can run off the end, and <code>count</code> limits the queue to <code>size</code> items, so the rear can never overwrite an item that hasn't been served.`,
      vars: [
        ['items', 'list (fixed size)', 'the array, used in a circle'],
        ['frontIndex', 'int', 'next to dequeue; wraps with %'],
        ['rearIndex', 'int', 'last enqueued; wraps with %'],
        ['count', 'int', 'how many items are in the queue'],
        ['size', 'int', 'capacity: the number to take the remainder by']
      ],
      code: `class CircularQueue:
    def __init__(self, size):
        self.items = [None] * size
        self.frontIndex = 0
        self.rearIndex = -1
        self.count = 0
        self.size = size

    def isEmpty(self):
        return self.count == 0

    def isFull(self):
        return self.count == self.size

    def enqueue(self, item):
        if self.isFull():
            print("Queue full")
        else:
            self.rearIndex = (self.rearIndex + 1) % self.size
            self.items[self.rearIndex] = item
            self.count = self.count + 1

    def dequeue(self):
        if self.isEmpty():
            print("Queue empty")
            return None
        item = self.items[self.frontIndex]
        self.frontIndex = (self.frontIndex + 1) % self.size
        self.count = self.count - 1
        return item

    def front(self):
        if self.isEmpty():
            return None
        return self.items[self.frontIndex]


canteen = CircularQueue(3)
canteen.enqueue("Aiko")
canteen.enqueue("Ben")
canteen.enqueue("Carla")
print("Served", canteen.dequeue())
canteen.enqueue("Dev")
print("Next:", canteen.front())
print(canteen.items)`,
      out: `Served Aiko\nNext: Ben\n['Dev', 'Ben', 'Carla']`,
      build: [
        { add: 1, why: `A new class name — the behaviour is different from program 1.`, missing: `<code>CircularQueue(3)</code> crashes with a <code>NameError</code>.` },
        { add: 2, why: `The constructor takes the capacity.`, missing: `<code>CircularQueue(3)</code> crashes with a <code>TypeError</code>.` },
        { add: 3, why: `The fixed-size array.`, missing: `There is nowhere to store the queue.` },
        { add: 4, why: `The first item will be served from slot 0.`, missing: `<code>dequeue</code> crashes with an <code>AttributeError</code>.` },
        { add: 5, why: `-1 so that the first enqueue wraps to (−1 + 1) % 3 = 0.`, missing: `<code>enqueue</code> crashes with an <code>AttributeError</code>.` },
        { add: 6, why: `The number of items. It's what tells full from empty now.`, missing: `<code>isEmpty</code> and <code>isFull</code> crash with an <code>AttributeError</code>.` },
        { add: 7, why: `The capacity, for the modulus and <code>isFull</code>.`, missing: `<code>% self.size</code> crashes with an <code>AttributeError</code>.` },
        { add: 38, why: `Create a queue to test with.`, missing: `Nothing uses the class.` },
        { add: 9, why: `"Is the queue empty?"`, missing: `<code>dequeue</code> and <code>front</code> can't check.` },
        { add: 10, why: `Empty means no items, whatever the pointers say.`, missing: `Comparing pointers fails here: after wrapping, the rear can be behind the front even when the queue is full.` },
        { add: 12, why: `"Is the queue full?"`, missing: `Nothing would stop the rear overwriting an item that hasn't been served.` },
        { add: 13, why: `Full means <code>size</code> items.`, missing: `Using program 1's test, <code>rearIndex == size - 1</code>, refuses Dev again (see mistake 2).` },
        { add: 15, why: `enqueue, as before.`, missing: `<code>canteen.enqueue(...)</code> crashes with an <code>AttributeError</code>.` },
        { add: 16, why: `Check first.`, missing: `A full queue would overwrite the front item.` },
        { add: 17, why: `Full: refuse.`, missing: `The item would silently not join.` },
        { add: 18, why: `There is room.`, missing: `The next lines would run even when full.` },
        { add: 19, why: `Move the rear one place, wrapping from the last index back to 0. The brackets matter: add first, then take the remainder.`, missing: `Without <code>% self.size</code> the rear runs off the end of the array (see mistake 1).` },
        { add: 20, why: `Store the item at the new rear.`, missing: `The rear moves but nothing is stored.` },
        { add: 21, why: `One more item.`, missing: `<code>count</code> stays 0, so the queue always looks empty (see mistake 4).` },
        { add: 39, why: `Aiko: slot 0.`, missing: `With one person fewer the queue never fills, and the wrap-round would never be needed.` },
        { add: 40, why: `Ben: slot 1.`, missing: `The same.` },
        { add: 41, why: `Carla: slot 2. Full: count is 3.`, missing: `The same.` },
        { add: 23, why: `dequeue, as before.`, missing: `<code>canteen.dequeue()</code> crashes with an <code>AttributeError</code>.` },
        { add: 24, why: `Check for empty.`, missing: `An empty queue would hand back an old item.` },
        { add: 25, why: `Empty: say so…`, missing: `The caller wouldn't know why nothing came back.` },
        { add: 26, why: `…and return <code>None</code>.`, missing: `The method would carry on and read an old slot.` },
        { add: 27, why: `Read the front item.`, missing: `There's nothing to return.` },
        { add: 28, why: `Move the front one place, wrapping the same way.`, missing: `Written <code>self.frontIndex + 1 % self.size</code>, Python works out <code>1 % 3</code> first, so it never wraps (see mistake 3).` },
        { add: 29, why: `One fewer item.`, missing: `The queue would stay "full" after people are served.` },
        { add: 30, why: `Return the served item.`, missing: `The caller gets <code>None</code>.` },
        { add: 42, why: `Aiko, first in, is first out. Slot 0 is now free.`, missing: `You couldn't see who was served.` },
        { add: 43, why: `Dev joins: the rear wraps from 2 to (2 + 1) % 3 = 0, the slot Aiko left. In program 1, this was "Queue full".`, missing: `The wrap-round would never be tested.` },
        { add: 32, why: `front: look without removing.`, missing: `<code>canteen.front()</code> crashes with an <code>AttributeError</code>.` },
        { add: 33, why: `Nothing to look at if empty…`, missing: `An empty queue would return an old item.` },
        { add: 34, why: `…so return <code>None</code>.`, missing: `The method would carry on and read an old slot.` },
        { add: 35, why: `The item at the front.`, missing: `<code>front</code> would return <code>None</code> every time.` },
        { add: 44, why: `Ben is next.`, missing: `You couldn't check front.` },
        { add: 45, why: `The raw array: Dev is in slot 0, <b>before</b> Ben and Carla, even though he joined last. The pointers, not the slot order, decide who is next.`, missing: `You couldn't see the wrap-round.` }
      ],
      trace: {
        cols: ['canteen.frontIndex', 'canteen.rearIndex', 'canteen.count', 'canteen.items'],
        note: `Watch <code>rearIndex</code> go 0, 1, 2 and then back to 0 for Dev. After that the rear (0) is behind the front (1), which is why <code>count</code> is needed to know the queue is full.`
      },
      mistakes: [
        { title: 'No wrap-round', bad: 9, code: `class CircularQueue:
    def __init__(self, size):
        self.items = [None] * size
        self.rearIndex = -1
        self.count = 0
        self.size = size

    def enqueue(self, item):
        self.rearIndex = self.rearIndex + 1
        self.items[self.rearIndex] = item
        self.count = self.count + 1


canteen = CircularQueue(3)
for name in ["Aiko", "Ben", "Carla", "Dev"]:
    canteen.enqueue(name)`, error: 'IndexError', errorText: 'list assignment index out of range',
          why: `Without <code>% self.size</code>, the rear goes 0, 1, 2, 3 — and there is no slot 3. The modulus is what bends the array into a circle. (Checks are left out of these short versions.)` },
        { title: 'Program 1\'s full test', bad: 10, code: `class CircularQueue:
    def __init__(self, size):
        self.items = [None] * size
        self.frontIndex = 0
        self.rearIndex = -1
        self.count = 0
        self.size = size

    def isFull(self):
        return self.rearIndex == self.size - 1

    def enqueue(self, item):
        if self.isFull():
            print("Queue full")
        else:
            self.rearIndex = (self.rearIndex + 1) % self.size
            self.items[self.rearIndex] = item
            self.count = self.count + 1

    def dequeue(self):
        item = self.items[self.frontIndex]
        self.frontIndex = (self.frontIndex + 1) % self.size
        self.count = self.count - 1
        return item


canteen = CircularQueue(3)
for name in ["Aiko", "Ben", "Carla"]:
    canteen.enqueue(name)
print("Served", canteen.dequeue())
canteen.enqueue("Dev")`, out: `Served Aiko\nQueue full`,
          why: `Wrapping only helps if the queue <b>lets</b> the rear wrap. "Rear at the last index" no longer means full; <code>count == size</code> does.` },
        { title: 'Brackets missing in the modulus', bad: 14, code: `class CircularQueue:
    def __init__(self, size):
        self.items = [None] * size
        self.frontIndex = 0
        self.rearIndex = -1
        self.size = size

    def enqueue(self, item):
        self.rearIndex = (self.rearIndex + 1) % self.size
        self.items[self.rearIndex] = item

    def dequeue(self):
        item = self.items[self.frontIndex]
        self.frontIndex = self.frontIndex + 1 % self.size
        return item


canteen = CircularQueue(3)
for name in ["Aiko", "Ben", "Carla"]:
    canteen.enqueue(name)
for i in range(3):
    print("Served", canteen.dequeue())
canteen.enqueue("Dev")
print("Served", canteen.dequeue())`, error: 'IndexError', errorText: 'list index out of range',
          why: `<code>%</code> is worked out before <code>+</code>, so <code>self.frontIndex + 1 % self.size</code> means <code>self.frontIndex + (1 % 3)</code>: the front never wraps, and the 4th dequeue reads index 3. Write <code>(self.frontIndex + 1) % self.size</code>.` },
        { title: 'Not counting items in', code: `class CircularQueue:
    def __init__(self, size):
        self.items = [None] * size
        self.frontIndex = 0
        self.rearIndex = -1
        self.count = 0
        self.size = size

    def enqueue(self, item):
        self.rearIndex = (self.rearIndex + 1) % self.size
        self.items[self.rearIndex] = item

    def dequeue(self):
        if self.count == 0:
            print("Queue empty")
            return None
        item = self.items[self.frontIndex]
        self.frontIndex = (self.frontIndex + 1) % self.size
        self.count = self.count - 1
        return item


canteen = CircularQueue(3)
canteen.enqueue("Aiko")
print("Served", canteen.dequeue())`, out: `Queue empty\nServed None`,
          why: `enqueue never adds to <code>count</code>, so the queue always looks empty and Aiko can't be served. Every operation that changes the queue must keep <code>count</code> up to date.` }
      ],
      nobuiltins: { none: `Nothing to change — the circular queue uses no built-ins at all. <code>%</code> is an operator, so it is allowed even when built-in functions are banned.` },
      tip: `Questions on circular queues often ask you to trace the pointers after a series of operations, or to construct enqueue/dequeue. Show the wrap with the modulus (or an <code>if</code>: "if the pointer equals size, set it to 0" earns the same marks). And explain the benefit: freed slots are reused, so the queue only reports full when it really is.`
    }
  ]
});
