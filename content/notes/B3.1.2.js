/* "Build it from scratch" notes — B3.1.2 Designing classes and UML. Format: see widgets/notes.js. */
(function () {
  const uml = (name, attrs, methods) => `<div class="uml" role="img" aria-label="UML class diagram for ${name}"><div class="uml-name">${name}</div><div class="uml-sec">${attrs.map(a => `<div>${a}</div>`).join('')}</div><div class="uml-sec">${methods.map(m => `<div>${m}</div>`).join('')}</div></div>`;
  CodeCraft.addNotes('B3.1.2', {
    intro: `<p>A <span class="term">UML class diagram</span> plans a class before you code it. It is a box with three sections: the <b>class name</b>; the <b>attributes</b> with their data types (<code>title: str</code>); and the <b>methods</b> with their parameters and return types (<code>borrow(): bool</code>). A <b>−</b> in front means <b>private</b> (only the class's own methods may use it); a <b>+</b> means <b>public</b>.</p>
    <p>Usually attributes are private and methods are public, so other code changes an object only through its methods. In Python, a private attribute's name starts with two underscores: <code>self.__title</code>.</p>`,
    programs: [
      {
        title: 'From a UML diagram to code',
        goal: `<p>Turn this UML diagram for a library <code>Book</code> into a Python class. A book is "long" if it has more than 300 pages; it can't be borrowed while on loan.</p>${uml('Book', ['− title: str', '− author: str', '− pages: int', '− onLoan: bool'], ['+ getTitle(): str', '+ borrow(): bool', '+ giveBack()', '+ isLong(): bool'])}`,
        input: `the UML diagram above; then a test book: "Dune" by Frank Herbert, 412 pages`,
        output: `<code>Dune True</code>, then <code>True False</code> (borrowed, then refused), then <code>True</code> after it is given back`,
        think: [
          `Top section → <code>class Book:</code>.`,
          `Middle section → attributes set in <code>__init__</code>. All four are −, so each gets two underscores. Three come from parameters; <code>onLoan</code> starts as False.`,
          `Bottom section → one method each, with <code>self</code> first and any parameters shown in the brackets. A return type means the method must <code>return</code> a value of that type; no type means it returns nothing.`,
          `Keep the names exactly as in the diagram, so the code matches the design.`
        ],
        works: `every box in the diagram becomes exactly one piece of code, so the class has the attributes and methods the design promised — and other code can only reach the private data through the public methods.`,
        vars: [
          ['self.__title, self.__author', 'str', 'private attributes (− in UML)'],
          ['self.__pages', 'int', 'private'],
          ['self.__onLoan', 'bool', 'private; starts False'],
          ['b', 'Book', 'a test object']
        ],
        code: `class Book:
    def __init__(self, title, author, pages):
        self.__title = title
        self.__author = author
        self.__pages = pages
        self.__onLoan = False

    def getTitle(self):
        return self.__title

    def borrow(self):
        if self.__onLoan:
            return False
        self.__onLoan = True
        return True

    def giveBack(self):
        self.__onLoan = False

    def isLong(self):
        return self.__pages > 300


b = Book("Dune", "Frank Herbert", 412)
print(b.getTitle(), b.isLong())
print(b.borrow(), b.borrow())
b.giveBack()
print(b.borrow())`,
        out: `Dune True\nTrue False\nTrue`,
        build: [
          { add: 1, why: `The name from the top section.`, missing: `<code>Book(...)</code> crashes with a <code>NameError</code>.` },
          { add: 2, why: `The constructor takes the three values the diagram's attributes need from outside. <code>onLoan</code> isn't a parameter: every new book starts not on loan.`, missing: `<code>Book("Dune", …)</code> crashes with a <code>TypeError</code>.` },
          { add: 3, why: `<code>− title: str</code> → a private attribute, two underscores.`, missing: `<code>getTitle</code> crashes with an <code>AttributeError</code>. With no underscores it would be public, which doesn't match the − (see mistake 1).` },
          { add: 4, why: `<code>− author: str</code>.`, missing: `The author would be lost.` },
          { add: 5, why: `<code>− pages: int</code>.`, missing: `<code>isLong</code> crashes with an <code>AttributeError</code>.` },
          { add: 6, why: `<code>− onLoan: bool</code>, starting False.`, missing: `<code>borrow</code> crashes with an <code>AttributeError</code>.` },
          { add: 24, why: `Create a test book straight away. Run it: no output, but the constructor works.`, missing: `Nothing to test.` },
          { add: 8, why: `<code>+ getTitle(): str</code> → a public method that returns a string.`, missing: `<code>b.getTitle()</code> crashes with an <code>AttributeError</code>.` },
          { add: 9, why: `A <b>getter</b>: the only way for outside code to read the private title.`, missing: `Without <code>return</code>, it gives <code>None</code> (see mistake 3).` },
          { add: 20, why: `<code>+ isLong(): bool</code>.`, missing: `<code>b.isLong()</code> crashes with an <code>AttributeError</code>.` },
          { add: 21, why: `"More than 300" is <code>&gt;</code>; the comparison is already a bool.`, missing: `<code>&gt;=</code> would call a 300-page book long (see mistake 4).` },
          { add: 25, why: `Test the first two methods: Dune True.`, missing: `They'd go untested.` },
          { add: 11, why: `<code>+ borrow(): bool</code>.`, missing: `<code>b.borrow()</code> crashes with an <code>AttributeError</code>.` },
          { add: 12, why: `Already on loan?`, missing: `A book could be borrowed twice.` },
          { add: 13, why: `Refuse.`, missing: `The <code>if</code> would have no body.` },
          { add: 14, why: `Mark it as on loan…`, missing: `The book never goes on loan.` },
          { add: 15, why: `…and report success.`, missing: `It returns <code>None</code>, not a bool as the diagram promises.` },
          { add: 26, why: `Borrow twice: True, then False.`, missing: `The refusal goes untested.` },
          { add: 17, why: `<code>+ giveBack()</code> — no return type, so it returns nothing.`, missing: `<code>b.giveBack()</code> crashes with an <code>AttributeError</code>.` },
          { add: 18, why: `The book is back on the shelf.`, missing: `The method would have no body.` },
          { add: 27, why: `Return it…`, missing: `The book stays on loan, so the next borrow prints False.` },
          { add: 28, why: `…and it can be borrowed again: True.`, missing: `<code>giveBack</code> would go untested.` }
        ],
        trace: {
          cols: ['b.__onLoan'],
          note: `The tracer can show the private attribute because it looks inside the object; your own code outside the class can't (try <code>print(b.__onLoan)</code> — it's an <code>AttributeError</code>).`
        },
        mistakes: [
          { title: 'One underscore is not private', bad: 3, code: `class Book:
    def __init__(self, title):
        self._title = title


b = Book("Dune")
b._title = "Not Dune"
print(b._title)`, out: `Not Dune`,
            why: `A single underscore is only a hint to programmers; Python still lets outside code read and change it. The UML's − means private: use <b>two</b> underscores, <code>self.__title</code>.` },
          { title: 'Reading a private attribute from outside', bad: 7, code: `class Book:
    def __init__(self, title):
        self.__title = title


b = Book("Dune")
print(b.__title)`, error: 'AttributeError', errorText: "'Book' object has no attribute '__title'",
            why: `That's encapsulation working: private attributes can't be reached from outside the class. Add a public getter (<code>getTitle()</code>) and use that.` },
          { title: 'A getter that doesn\'t return', bad: 6, code: `class Book:
    def __init__(self, title):
        self.__title = title

    def getTitle(self):
        self.__title


b = Book("Dune")
print(b.getTitle())`, out: `None`,
            why: `The line just mentions the attribute and throws it away. The diagram says <code>getTitle(): str</code>, so it must <code>return self.__title</code>.` },
          { title: '>= where the rule says "more than"', bad: 6, code: `class Book:
    def __init__(self, pages):
        self.__pages = pages

    def isLong(self):
        return self.__pages >= 300


print(Book(300).isLong())`, out: `True`,
            why: `"More than 300 pages" doesn't include 300. Check boundary values against the exact wording of the requirements.` }
        ],
        nobuiltins: { none: `Nothing to change — no built-ins are used.` },
        tip: `"Construct the code for the class from the UML diagram" answers usually get marks for: the class header, a constructor that sets every attribute (private ones with <code>__</code>), each method with the right parameters, and the right <code>return</code>s. Use the diagram's exact names.`
      },
      {
        title: 'Design a class from requirements, then code it',
        goal: `<p>Requirements: "The school has numbered lockers. A locker can be assigned to one student at a time, and released when they leave. Staff need to see whether a locker is free and who owns it." Design a UML class, then code it and test it with three lockers.</p>`,
        input: `three lockers, and three assignment attempts`,
        output: `<code>True</code>, <code>False</code> (already taken), <code>True</code>, then each locker's owner or "free"`,
        think: [
          `<b>Nouns</b> suggest the class and its attributes: a <em>locker</em> (class), its <em>number</em> and its <em>owner</em> (attributes).`,
          `<b>Verbs</b> suggest methods: <em>assign</em>, <em>release</em>, see whether it is <em>free</em>, see who <em>owns</em> it.`,
          `Choose types: number is an int, owner is a str (empty "" when free). Make the attributes private and the methods public.`,
          `Draw the box, then code it exactly as designed.`
        ],
        works: `the only way to change an owner is through <code>assign</code> and <code>release</code>, and <code>assign</code> checks the locker is free first — so a locker can never have two owners.`,
        vars: [
          ['self.__number', 'int', 'private'],
          ['self.__owner', 'str', 'private; "" means free'],
          ['lockers', 'list of Locker', 'the test objects'],
          ['locker', 'Locker', 'loop variable']
        ],
        code: `class Locker:
    def __init__(self, number):
        self.__number = number
        self.__owner = ""

    def isFree(self):
        return self.__owner == ""

    def assign(self, name):
        if not self.isFree():
            return False
        self.__owner = name
        return True

    def release(self):
        self.__owner = ""

    def getOwner(self):
        return self.__owner


lockers = [Locker(1), Locker(2), Locker(3)]
print(lockers[0].assign("Aiko"))
print(lockers[0].assign("Ben"))
print(lockers[1].assign("Ben"))
for locker in lockers:
    if locker.isFree():
        print("free")
    else:
        print(locker.getOwner())`,
        out: `True\nFalse\nTrue\nAiko\nBen\nfree`,
        build: [
          { add: 1, why: `The class, named after the main noun. Here is the design:${uml('Locker', ['− number: int', '− owner: str'], ['+ isFree(): bool', '+ assign(name: str): bool', '+ release()', '+ getOwner(): str'])}`, missing: `<code>Locker(1)</code> crashes with a <code>NameError</code>.` },
          { add: 2, why: `A new locker only needs its number.`, missing: `<code>Locker(1)</code> crashes with a <code>TypeError</code>.` },
          { add: 3, why: `<code>− number: int</code>.`, missing: `The locker wouldn't know its own number.` },
          { add: 4, why: `<code>− owner: str</code>, starting as "" — free.`, missing: `<code>isFree</code> crashes with an <code>AttributeError</code>.` },
          { add: 22, why: `Three lockers to test with.`, missing: `Nothing to test.` },
          { add: 6, why: `<code>+ isFree(): bool</code>.`, missing: `<code>assign</code> can't check.` },
          { add: 7, why: `Free means no owner. Using the same "empty" value everywhere matters (see mistake 2).`, missing: `Without <code>return</code>, <code>isFree()</code> gives <code>None</code>, and every locker looks taken (see mistake 4).` },
          { add: 9, why: `<code>+ assign(name: str): bool</code>.`, missing: `<code>assign(...)</code> crashes with an <code>AttributeError</code>.` },
          { add: 10, why: `A method can call another method of the same object with <code>self.</code>.`, missing: `A taken locker would be reassigned (see mistake 1).` },
          { add: 11, why: `Taken: refuse.`, missing: `The <code>if</code> would have no body.` },
          { add: 12, why: `Free: set the owner.`, missing: `Nobody is ever assigned.` },
          { add: 13, why: `Report success.`, missing: `It returns <code>None</code>, not a bool.` },
          { add: 23, why: `Aiko gets locker 1: True.`, missing: `Nothing is assigned.` },
          { add: 24, why: `Ben can't have locker 1: False.`, missing: `The refusal goes untested.` },
          { add: 25, why: `Ben gets locker 2 instead: True.`, missing: `Locker 2 stays free.` },
          { add: 15, why: `<code>+ release()</code>.`, missing: `A locker could never be freed.` },
          { add: 16, why: `Back to "".`, missing: `The method would have no body.` },
          { add: 18, why: `<code>+ getOwner(): str</code> — the getter for the private owner.`, missing: `Outside code can't read the owner at all.` },
          { add: 19, why: `Return it.`, missing: `It returns <code>None</code>.` },
          { add: 26, why: `Report on every locker.`, missing: `You'd need a line per locker.` },
          { add: 27, why: `Use the public method, not the private attribute.`, missing: `<code>locker.__owner</code> from out here is an <code>AttributeError</code>.` },
          { add: 28, why: `Free.`, missing: `The <code>if</code> would have no body.` },
          { add: 29, why: `Otherwise…`, missing: `Taken lockers would print nothing.` },
          { add: 30, why: `…the owner, through the getter.`, missing: `The <code>else</code> would have no body.` }
        ],
        trace: {
          cols: ['locker.__number', 'locker.__owner'],
          note: `Each pass of the loop looks at a different Locker object, each with its own private number and owner.`
        },
        mistakes: [
          { title: 'Assigning without checking', bad: 7, code: `class Locker:
    def __init__(self, number):
        self.__number = number
        self.__owner = ""

    def assign(self, name):
        self.__owner = name
        return True

    def getOwner(self):
        return self.__owner


locker = Locker(1)
print(locker.assign("Aiko"))
print(locker.assign("Ben"))
print(locker.getOwner())`, out: `True\nTrue\nBen`,
            why: `Ben silently takes Aiko's locker. The requirement "one student at a time" has to be checked inside <code>assign</code> — it's the class's job to protect its own data.` },
          { title: 'Two different "empty" values', bad: 4, code: `class Locker:
    def __init__(self, number):
        self.__number = number
        self.__owner = None

    def isFree(self):
        return self.__owner == ""

    def assign(self, name):
        if not self.isFree():
            return False
        self.__owner = name
        return True


print(Locker(1).assign("Aiko"))`, out: `False`,
            why: `The constructor uses <code>None</code> for "free" but <code>isFree</code> tests for "", so a brand-new locker looks taken. Pick one value and use it everywhere — the design's type (str) suggests "".` },
          { title: 'A method name that doesn\'t match the design', bad: 12, code: `class Locker:
    def __init__(self, number):
        self.__number = number
        self.__owner = ""

    def assign(self, name):
        self.__owner = name
        return True


locker = Locker(1)
print(locker.Assign("Aiko"))`, error: 'AttributeError', errorText: "'Locker' object has no attribute 'Assign'",
            why: `Python names are case-sensitive: <code>Assign</code> isn't <code>assign</code>. Code written from a design must use its exact names, or other parts of the program can't find the methods.` },
          { title: 'isFree that returns nothing', bad: 7, code: `class Locker:
    def __init__(self, number):
        self.__number = number
        self.__owner = ""

    def isFree(self):
        self.__owner == ""

    def assign(self, name):
        if not self.isFree():
            return False
        self.__owner = name
        return True


print(Locker(1).assign("Aiko"))`, out: `False`,
            why: `Without <code>return</code>, <code>isFree()</code> gives <code>None</code>, and <code>not None</code> is True — so every locker is refused. A method with a return type in the UML must return a value.` }
        ],
        nobuiltins: { none: `Nothing to change — no built-ins are used.` },
        tip: `"Construct a UML class diagram" questions usually give marks for: the class name; relevant attributes with data types; correct visibility (− private for attributes); and relevant public methods with parameters and return types. Take the attributes and methods from the scenario's nouns and verbs.`
      }
    ]
  });
})();
