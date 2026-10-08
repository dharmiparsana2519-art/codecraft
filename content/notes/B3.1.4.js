/* "Build it from scratch" notes — B3.1.4 Classes and constructors. Format: see widgets/notes.js. */
CodeCraft.addNotes('B3.1.4', {
  intro: `<p>A class is written with <code>class Name:</code>. Its <span class="term">constructor</span>, <code>__init__</code>, runs automatically each time an object is created with <code>Name(...)</code>; it receives the arguments and sets the object's starting attributes. Every method's first parameter is <code>self</code> — the object it was called on — and Python fills it in for you: <code>card.buy(4)</code> runs <code>buy</code> with <code>self</code> = card and <code>price</code> = 4.</p>
  <p>The special method <code>__str__</code> returns the text to show when the object is printed. Without it, <code>print</code> shows something like <code>&lt;__main__.CanteenCard object at 0x…&gt;</code>.</p>`,
  programs: [
    {
      title: 'A canteen card with a constructor and __str__',
      goal: `<p>Write a <code>CanteenCard</code> class. A card has an owner and a balance. You can top it up, and buy something only if the balance covers the price. Printing a card shows "Owner: $balance".</p>`,
      input: `a card for Aiko with $5; a $10 top-up; a $4 purchase and a $20 purchase`,
      output: `<code>True</code>, <code>False</code>, then <code>Aiko: $11</code>`,
      think: [
        `The constructor takes the owner and the starting balance and stores both as attributes with <code>self.</code>.`,
        `<code>top_up(amount)</code> adds to this card's balance.`,
        `<code>buy(price)</code> checks first: if the price is more than the balance, return False and change nothing; otherwise subtract and return True.`,
        `<code>__str__</code> must <b>return</b> a string — build it with <code>+</code>, converting the number with <code>str()</code>.`
      ],
      works: `every change to the balance goes through a method that keeps it sensible: top-ups add, and a purchase only happens if it's affordable, so the balance can never go below 0.`,
      vars: [
        ['self.owner', 'str', 'attribute set by the constructor'],
        ['self.balance', 'int', 'attribute: dollars on the card'],
        ['amount, price', 'int', 'parameters of the methods'],
        ['card', 'CanteenCard', 'the object']
      ],
      code: `class CanteenCard:
    def __init__(self, owner, balance):
        self.owner = owner
        self.balance = balance

    def top_up(self, amount):
        self.balance = self.balance + amount

    def buy(self, price):
        if price > self.balance:
            return False
        self.balance = self.balance - price
        return True

    def __str__(self):
        return self.owner + ": $" + str(self.balance)


card = CanteenCard("Aiko", 5)
card.top_up(10)
print(card.buy(4))
print(card.buy(20))
print(card)`,
      out: `True\nFalse\nAiko: $11`,
      build: [
        { add: 1, why: `The class.`, missing: `<code>CanteenCard(...)</code> crashes with a <code>NameError</code>.` },
        { add: 2, why: `The constructor: two underscores each side. <code>self</code> is the new card; owner and balance are the arguments.`, missing: `Misspelled (e.g. <code>__int__</code>), Python doesn't recognise it as the constructor (see mistake 1).` },
        { add: 3, why: `Store the owner on the object.`, missing: `<code>self.owner</code> crashes with an <code>AttributeError</code> in <code>__str__</code>.` },
        { add: 4, why: `Store the starting balance.`, missing: `Every method that uses the balance crashes.` },
        { add: 19, why: `Create a card: this calls <code>__init__</code> with owner = "Aiko", balance = 5.`, missing: `There's no card to use.` },
        { add: 6, why: `A method with one parameter after <code>self</code>.`, missing: `<code>card.top_up(10)</code> crashes with an <code>AttributeError</code>.` },
        { add: 7, why: `Add to <b>this</b> card's balance.`, missing: `The method would have no body.` },
        { add: 20, why: `Top up: the balance becomes 15.`, missing: `The balance stays 5, and the $4 purchase would leave $1.` },
        { add: 9, why: `<code>buy</code> takes the price.`, missing: `<code>card.buy(4)</code> crashes with an <code>AttributeError</code>.` },
        { add: 10, why: `Check <b>before</b> changing anything.`, missing: `Subtracting first can leave the balance negative (see mistake 3).` },
        { add: 11, why: `Not enough money: refuse, and leave the balance alone.`, missing: `The <code>if</code> would have no body.` },
        { add: 12, why: `Enough: take the price off.`, missing: `Purchases would be free.` },
        { add: 13, why: `Report success.`, missing: `It returns <code>None</code>.` },
        { add: 21, why: `$4 from $15: True, leaving $11.`, missing: `The purchase goes untested.` },
        { add: 22, why: `$20 is more than $11: False, and the balance stays $11.`, missing: `The refusal goes untested.` },
        { add: 23, why: `Print the object. Run this stage: you get something like <code>&lt;__main__.CanteenCard object at 0x…&gt;</code> — not useful yet.`, missing: `You couldn't see the final state of the card.` },
        { add: 15, expect: 'TypeError', why: `<code>__str__</code>: Python calls it when the object is printed. Run this stage: a <code>TypeError</code>, because a method whose body is only <code>pass</code> returns <code>None</code>, and <code>__str__</code> must return a string.`, missing: `<code>print(card)</code> shows the unhelpful default text.` },
        { add: 16, why: `<b>Return</b> the text. The balance is an int, so <code>str()</code> converts it before joining.`, missing: `Without <code>str()</code>: a <code>TypeError</code> (see mistake 4). Printing instead of returning: also an error (see mistake 2).` }
      ],
      trace: {
        cols: ['card.balance'],
        note: `The balance changes on the top-up (15) and the first purchase (11). The second purchase changes nothing — the condition <code>price &gt; self.balance</code> was <code>True</code>, so the method returned straight away.`
      },
      mistakes: [
        { title: 'A misspelled constructor', bad: 2, code: `class CanteenCard:
    def __int__(self, owner, balance):
        self.owner = owner
        self.balance = balance


card = CanteenCard("Aiko", 5)`, error: 'TypeError', errorText: 'CanteenCard() takes no arguments',
          why: `<code>__int__</code> is not <code>__init__</code>, so the class has no constructor that accepts arguments. The name must be exactly <code>__init__</code>, with two underscores on each side.` },
        { title: 'Joining a number in __str__ without str()', bad: 7, code: `class CanteenCard:
    def __init__(self, owner, balance):
        self.owner = owner
        self.balance = balance

    def __str__(self):
        return self.owner + ": $" + self.balance


print(CanteenCard("Aiko", 5))`, error: 'TypeError', errorText: 'can only concatenate str (not "int") to str',
          why: `<code>self.balance</code> is an int, and <code>+</code> can't join a string and a number. Convert it: <code>str(self.balance)</code>.` },
        { title: 'Subtracting before checking', bad: 7, code: `class CanteenCard:
    def __init__(self, owner, balance):
        self.owner = owner
        self.balance = balance

    def buy(self, price):
        self.balance = self.balance - price
        if self.balance < 0:
            return False
        return True

    def __str__(self):
        return self.owner + ": $" + str(self.balance)


card = CanteenCard("Aiko", 15)
print(card.buy(20))
print(card)`, out: `False\nAiko: $-5`,
          why: `The method says the purchase failed, but the money was already taken: the card is left at -5. Check first, then change the data.` },
        { title: 'Forgetting self. in a method', bad: 7, code: `class CanteenCard:
    def __init__(self, owner, balance):
        self.owner = owner
        self.balance = balance

    def top_up(self, amount):
        balance = self.balance + amount


card = CanteenCard("Aiko", 5)
card.top_up(10)
print(card.balance)`, out: `5`,
          why: `<code>balance = …</code> creates a local variable that vanishes when the method ends, so the card is unchanged. To change the object, assign to <code>self.balance</code>.` }
      ],
      nobuiltins: { none: `Nothing to change — only <code>str()</code> is used, which is never banned.` },
      tip: `Construct-a-class questions usually give marks for: the class header; a constructor with the right parameters that sets every attribute with <code>self.</code>; each method with <code>self</code> first; correct logic (check before change); and returning values where asked. For "outline the purpose of the constructor": it runs automatically when an object is created and initialises its attributes.`
    },
    {
      title: 'A shelf of Book objects',
      goal: `<p>Keep three <code>Book</code> objects in a list. Record how many pages have been read of two of them, print each book's progress as a percentage, and find the longest book.</p>`,
      input: `three books (Dune 412 pages, Holes 233, Wonder 310); 103 pages read of Dune and 300 "read" of Holes`,
      output: `<code>Dune 25 %</code>, <code>Holes 100 %</code>, <code>Wonder 0 %</code>, <code>Longest: Dune</code>`,
      think: [
        `Each book has a title, a page count, and pages read so far (starting at 0) — three attributes set in the constructor.`,
        `<code>read_pages(n)</code> adds n to this book's pages read, but never beyond the book's length.`,
        `<code>progress()</code> returns read × 100 // pages: a whole-number percentage.`,
        `A list can hold objects: loop over it and call each object's methods.`,
        `To find the longest, use the maximum pattern on an attribute — and remember the whole object, not just its page count.`
      ],
      works: `each object keeps its own reading progress, and the loops call the same methods on every object; the maximum loop compares <code>pages</code> attributes and keeps the object with the biggest.`,
      vars: [
        ['self.title, self.pages', 'str, int', 'set from the arguments'],
        ['self.read', 'int', 'pages read so far: starts at 0'],
        ['shelf', 'list of Book', 'three objects'],
        ['book', 'Book', 'loop variable'],
        ['longest', 'Book', 'the longest book found so far — an object']
      ],
      code: `class Book:
    def __init__(self, title, pages):
        self.title = title
        self.pages = pages
        self.read = 0

    def read_pages(self, n):
        self.read = self.read + n
        if self.read > self.pages:
            self.read = self.pages

    def progress(self):
        return self.read * 100 // self.pages


shelf = [Book("Dune", 412), Book("Holes", 233), Book("Wonder", 310)]
shelf[0].read_pages(103)
shelf[1].read_pages(300)
for book in shelf:
    print(book.title, book.progress(), "%")
longest = shelf[0]
for book in shelf:
    if book.pages > longest.pages:
        longest = book
print("Longest:", longest.title)`,
      out: `Dune 25 %\nHoles 100 %\nWonder 0 %\nLongest: Dune`,
      build: [
        { add: 1, why: `The class.`, missing: `<code>Book(...)</code> crashes with a <code>NameError</code>.` },
        { add: 2, why: `Two values come in from outside.`, missing: `<code>Book("Dune", 412)</code> crashes with a <code>TypeError</code>.` },
        { add: 3, why: `The title.`, missing: `<code>book.title</code> crashes with an <code>AttributeError</code>.` },
        { add: 4, why: `The page count.`, missing: `<code>progress</code> crashes with an <code>AttributeError</code>.` },
        { add: 5, why: `Not passed in: every new book starts with 0 pages read.`, missing: `<code>self.read</code> crashes with an <code>AttributeError</code> (see mistake 1).` },
        { add: 16, why: `Three objects in one list. Each <code>Book(...)</code> runs the constructor.`, missing: `No books.` },
        { add: 12, why: `A method that calculates and returns a value.`, missing: `<code>book.progress()</code> crashes with an <code>AttributeError</code>.` },
        { add: 13, why: `<code>//</code> keeps it a whole number: 103 × 100 // 412 = 25.`, missing: `With <code>/</code>, the percentages are floats like 25.0 (see mistake 2).` },
        { add: 19, why: `Loop over the objects.`, missing: `You'd need one print per book.` },
        { add: 20, why: `Call each object's own method. Run this stage: 0 % for every book — nothing has been read yet.`, missing: `Nothing is shown.` },
        { add: 7, why: `A method that changes this book's data.`, missing: `<code>shelf[0].read_pages(103)</code> crashes with an <code>AttributeError</code>.` },
        { add: 8, why: `Add the pages to <b>this</b> book's total.`, missing: `Without <code>self.</code>, the change is lost when the method ends (see mistake 4).` },
        { add: 17, why: `<code>shelf[0]</code> is the Dune object; call its method.`, missing: `Dune stays at 0 %.` },
        { add: 18, why: `300 pages of a 233-page book. Run this stage: Holes shows 128 % — impossible.`, missing: `The cap below would go untested.` },
        { add: 9, why: `Read more than the book has?`, missing: `Progress can go over 100 %.` },
        { add: 10, why: `Cap it at the book's length. Now Holes shows 100 %.`, missing: `The <code>if</code> would have no body.` },
        { add: 21, why: `The maximum pattern: start with the first <b>object</b>.`, missing: `Starting with 0 breaks <code>longest.pages</code> (see mistake 3).` },
        { add: 22, why: `Compare every book.`, missing: `Only the first book is considered.` },
        { add: 23, why: `Compare the attributes of two objects.`, missing: `<code>&lt;</code> would find the shortest.` },
        { add: 24, why: `Remember the whole object, so we still have its title.`, missing: `<code>longest</code> never changes.` },
        { add: 25, why: `The title of the longest book.`, missing: `The answer is never shown.` }
      ],
      trace: {
        cols: ['book.title', 'book.read', 'longest.title'],
        note: `<code>book</code> refers to a different object on each pass, while <code>longest</code> keeps pointing at Dune because no other book has more pages.`
      },
      mistakes: [
        { title: 'An attribute that is never created', code: `class Book:
    def __init__(self, title, pages):
        self.title = title
        self.pages = pages

    def read_pages(self, n):
        self.read = self.read + n


b = Book("Dune", 412)
b.read_pages(103)`, error: 'AttributeError', errorText: "'Book' object has no attribute 'read'",
          why: `<code>self.read + n</code> needs <code>self.read</code> to exist already. Give every attribute a starting value in the constructor, even ones not passed in.` },
        { title: '/ for the percentage', bad: 8, code: `class Book:
    def __init__(self, title, pages):
        self.title = title
        self.pages = pages
        self.read = 103

    def progress(self):
        return self.read * 100 / self.pages


print(Book("Dune", 412).progress(), "%")`, out: `25.0 %`,
          why: `<code>/</code> always gives a float. For a whole-number percentage, use <code>//</code>.` },
        { title: 'Starting the longest at 0', bad: 8, code: `class Book:
    def __init__(self, title, pages):
        self.title = title
        self.pages = pages


shelf = [Book("Dune", 412), Book("Holes", 233)]
longest = 0
for book in shelf:
    if book.pages > longest.pages:
        longest = book
print("Longest:", longest.title)`, error: 'AttributeError', errorText: "'int' object has no attribute 'pages'",
          why: `<code>longest</code> is the int 0, which has no <code>pages</code> attribute. Start with a real Book object: <code>longest = shelf[0]</code>.` },
        { title: 'Changing a local instead of the attribute', bad: 8, code: `class Book:
    def __init__(self, title, pages):
        self.title = title
        self.pages = pages
        self.read = 0

    def read_pages(self, n):
        read = self.read + n


b = Book("Dune", 412)
b.read_pages(103)
print(b.read)`, out: `0`,
          why: `<code>read = …</code> without <code>self.</code> is a local variable, thrown away when the method returns. The object's attribute is still 0.` }
      ],
      nobuiltins: { none: `Nothing to change: the longest book is already found with a loop rather than <code>max()</code>.` },
      tip: `Questions with a list of objects often ask you to "construct code that outputs …" for every object, or find one with the largest/smallest attribute. Marks usually go to: looping through the list, calling methods or reading attributes with the right dot notation, and the comparison logic. Keep the whole object if you need more than one of its attributes later.`
    }
  ]
});
