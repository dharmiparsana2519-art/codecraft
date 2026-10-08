/* "Build it from scratch" notes — B3.1.1 OOP fundamentals. Format: see widgets/notes.js. */
CodeCraft.addNotes('B3.1.1', {
  intro: `<p>In <span class="term">object-oriented programming</span> (OOP), a <b>class</b> is a blueprint and an <b>object</b> is one thing built from it — an <b>instance</b>. A Student class describes what every student has (<b>attributes</b>, such as a name) and can do (<b>methods</b>, such as being awarded points); each Student object holds its own values. Creating an object is <b>instantiation</b>.</p>
  <p>OOP bundles each thing's data with the code that works on it, which models the real world closely and makes code easier to reuse, test and change. The cost: more planning, and more code than a tiny program needs. Program 2 puts the two approaches side by side.</p>`,
  programs: [
    {
      title: 'One class, several objects',
      goal: `<p>Write a <code>Student</code> class for house points. Every student has a name, a house and a points total starting at 0, and can be awarded points. Create two students, award points, and show that each object keeps its own data.</p>`,
      input: `two students, Aiko (Red) and Ben (Blue), and some awards`,
      output: `<code>Aiko Red 7</code> and <code>Ben Blue 3</code> — then 17, after Aiko is given 10 more under a second name`,
      think: [
        `The class lists what <b>every</b> student has. The constructor, <code>__init__</code>, runs when an object is created and gives it its starting attribute values, stored with <code>self.</code>.`,
        `<code>self</code> is the particular object being created or used — so <code>self.points</code> is <em>this</em> student's points.`,
        `<code>award(n)</code> is a method: a function inside the class that changes this object's points.`,
        `Each call <code>Student(...)</code> creates a new, separate object. Assigning an object to a second variable does <b>not</b> copy it — both names refer to the same object.`
      ],
      works: `every object has its own copy of the attributes, and a method changes only the object it was called on (its <code>self</code>), so awarding Aiko never touches Ben.`,
      vars: [
        ['self.name, self.house', 'str', 'attributes: each object\'s own values'],
        ['self.points', 'int', 'attribute: starts at 0 for every new student'],
        ['n', 'int', 'parameter of <code>award</code>'],
        ['aiko, ben', 'Student', 'two separate objects'],
        ['captain', 'Student', 'a second name for the <b>same</b> object as <code>aiko</code>']
      ],
      code: `class Student:
    def __init__(self, name, house):
        self.name = name
        self.house = house
        self.points = 0

    def award(self, n):
        self.points = self.points + n


aiko = Student("Aiko", "Red")
ben = Student("Ben", "Blue")
aiko.award(5)
ben.award(3)
aiko.award(2)
print(aiko.name, aiko.house, aiko.points)
print(ben.name, ben.house, ben.points)
captain = aiko
captain.award(10)
print(aiko.points)`,
      out: `Aiko Red 7\nBen Blue 3\n17`,
      build: [
        { add: 1, why: `The blueprint. Class names start with a capital letter by convention.`, missing: `<code>Student(...)</code> crashes with a <code>NameError</code>.` },
        { add: 2, why: `The constructor: it runs automatically for every new object. <code>self</code> is the new object; name and house are passed in.`, missing: `<code>Student("Aiko", "Red")</code> crashes with a <code>TypeError</code>: there's nowhere for the arguments to go.` },
        { add: 3, why: `Store the name <b>on the object</b>.`, missing: `Written <code>name = name</code> (no <code>self.</code>), it's a local variable that vanishes when <code>__init__</code> ends.` },
        { add: 4, why: `The house, too.`, missing: `<code>aiko.house</code> crashes with an <code>AttributeError</code>.` },
        { add: 5, why: `Every student starts with 0 points — not passed in, just set.`, missing: `<code>self.points + n</code> crashes with an <code>AttributeError</code> (see mistake 1).` },
        { add: 11, why: `Instantiation: create a Student object. Run this stage — it works, silently.`, missing: `There's no object to use.` },
        { add: 12, why: `A second, separate object built from the same blueprint.`, missing: `Only one student.` },
        { add: 7, why: `A method: like a function, but defined in the class, with <code>self</code> first.`, missing: `<code>aiko.award(5)</code> crashes with an <code>AttributeError</code>. Without <code>self</code> in the brackets: a <code>TypeError</code> (see mistake 2).` },
        { add: 8, why: `Change <b>this</b> object's points.`, missing: `The method would have no body.` },
        { add: 13, why: `Call the method on Aiko: inside it, <code>self</code> is <code>aiko</code> and n is 5.`, missing: `Aiko gets 5 points fewer.` },
        { add: 14, why: `Called on Ben, so only Ben's points change.`, missing: `Ben stays on 0.` },
        { add: 15, why: `Aiko again: 5 + 2 = 7.`, missing: `Aiko ends on 5.` },
        { add: 16, why: `Read Aiko's attributes with dot notation.`, missing: `Nothing is shown.` },
        { add: 17, why: `Ben's attributes are completely separate: Blue, 3.`, missing: `You couldn't see that the objects are independent.` },
        { add: 18, why: `<code>captain</code> is a second name for the <b>same</b> object — no new Student is made.`, missing: `<code>captain.award(10)</code> crashes with a <code>NameError</code>.` },
        { add: 19, why: `Award through the second name…`, missing: `Aiko stays on 7.` },
        { add: 20, why: `…and Aiko's points change: 17. Two variables, one object.`, missing: `You couldn't see that <code>captain</code> and <code>aiko</code> are the same object (compare mistake 4).` }
      ],
      trace: {
        cols: ['aiko.points', 'ben.points', 'captain.points'],
        note: `Aiko's and Ben's points change independently. After <code>captain = aiko</code>, an award through <code>captain</code> appears in Aiko's column too — they are one object.`
      },
      mistakes: [
        { title: 'Forgetting self. in the constructor', bad: 5, code: `class Student:
    def __init__(self, name, house):
        self.name = name
        self.house = house
        points = 0

    def award(self, n):
        self.points = self.points + n


aiko = Student("Aiko", "Red")
aiko.award(5)`, error: 'AttributeError', errorText: "'Student' object has no attribute 'points'",
          why: `<code>points = 0</code> makes a local variable inside <code>__init__</code>, which disappears when it ends. The object never gets a <code>points</code> attribute. Attributes always need <code>self.</code>.` },
        { title: 'A method without self', bad: 6, code: `class Student:
    def __init__(self, name):
        self.name = name
        self.points = 0

    def award(n):
        self.points = self.points + n


aiko = Student("Aiko")
aiko.award(5)`, error: 'TypeError', errorText: 'award() takes 1 positional argument but 2 were given',
          why: `Python passes the object itself as the first argument, so <code>aiko.award(5)</code> sends two values: aiko and 5. Every method needs <code>self</code> as its first parameter.` },
        { title: 'Calling a method on the class', bad: 10, code: `class Student:
    def __init__(self, name):
        self.name = name
        self.points = 0

    def award(self, n):
        self.points = self.points + n


Student.award(5)`, error: 'TypeError', errorText: "award() missing 1 required positional argument: 'n'",
          why: `The class is only the blueprint. Points belong to a particular student, so create an object and call the method on it: <code>aiko.award(5)</code>.` },
        { title: 'Making a new object instead of a second name', bad: 12, code: `class Student:
    def __init__(self, name, house):
        self.name = name
        self.house = house
        self.points = 0

    def award(self, n):
        self.points = self.points + n


aiko = Student("Aiko", "Red")
captain = Student("Aiko", "Red")
captain.award(10)
print(aiko.points)`, out: `0`,
          why: `Each <code>Student(...)</code> call creates a <b>new</b> object, even with the same values. <code>captain</code> is a different student who happens to share Aiko's details, so Aiko's points don't change.` }
      ],
      nobuiltins: { none: `Nothing to change — classes don't use banned built-ins.` },
      tip: `"Distinguish between a class and an object" answers usually earn marks for: a class is a template/blueprint defining attributes and methods; an object is an instance with its own attribute values; many objects can be created from one class. An example from the question's context earns the "outline/explain" marks.`
    },
    {
      title: 'Why OOP? Library books with and without a class',
      goal: `<p>Store three library books, each with a title, a page count and whether it is on loan. A book can only be borrowed if it isn't already on loan. Write it with a <code>Book</code> class, then compare it with the same program written without one.</p>`,
      input: `three books, and two attempts to borrow "Holes"`,
      output: `<code>True</code>, then <code>False</code> (already on loan), then each book's status`,
      think: [
        `Each book is a "thing" with its own data, so it fits a class: attributes <code>title</code>, <code>pages</code>, <code>on_loan</code>.`,
        `Borrowing is something a book does with its <b>own</b> data, so it's a method: refuse (False) if on loan, otherwise mark it and return True.`,
        `Keep the objects in a list, so we can loop over them.`,
        `<code>books[1].borrow()</code>: index the list to get an object, then call its method.`
      ],
      works: `each Book object carries its own data and the code that changes it, so <code>borrow</code> can't accidentally use another book's loan status — the data and its methods are bundled together (encapsulation).`,
      vars: [
        ['self.title', 'str', 'attribute'],
        ['self.pages', 'int', 'attribute'],
        ['self.on_loan', 'bool', 'attribute: starts False'],
        ['books', 'list of Book', 'three objects in a list'],
        ['b', 'Book', 'loop variable: one book at a time']
      ],
      code: `class Book:
    def __init__(self, title, pages):
        self.title = title
        self.pages = pages
        self.on_loan = False

    def borrow(self):
        if self.on_loan:
            return False
        self.on_loan = True
        return True


books = [Book("Dune", 412), Book("Holes", 233), Book("Wonder", 310)]
print(books[1].borrow())
print(books[1].borrow())
for b in books:
    if b.on_loan:
        print(b.title, "is on loan")
    else:
        print(b.title, "is available")`,
      out: `True\nFalse\nDune is available\nHoles is on loan\nWonder is available`,
      build: [
        { add: 1, why: `The blueprint for every book.`, missing: `<code>Book(...)</code> crashes with a <code>NameError</code>.` },
        { add: 2, why: `A new book needs a title and a page count.`, missing: `<code>Book("Dune", 412)</code> crashes with a <code>TypeError</code>.` },
        { add: 3, why: `This book's title.`, missing: `<code>b.title</code> crashes with an <code>AttributeError</code>.` },
        { add: 4, why: `This book's pages.`, missing: `The page count is lost.` },
        { add: 5, why: `A new book isn't on loan. A Boolean attribute.`, missing: `<code>borrow</code> crashes with an <code>AttributeError</code>.` },
        { add: 14, why: `Three objects, created inside a list. Run this stage: no output, no error.`, missing: `Nothing to borrow.` },
        { add: 7, why: `A method that changes this book's state.`, missing: `<code>books[1].borrow()</code> crashes with an <code>AttributeError</code>.` },
        { add: 8, why: `Already on loan? A Boolean can be tested directly.`, missing: `Without the check, a book can be borrowed twice (see mistake 1).` },
        { add: 9, why: `Refuse.`, missing: `The <code>if</code> would have no body.` },
        { add: 10, why: `Mark it as on loan…`, missing: `The book is never marked, so it can be borrowed again and again.` },
        { add: 11, why: `…and report success.`, missing: `<code>borrow()</code> returns <code>None</code> when it succeeds.` },
        { add: 15, why: `Borrow "Holes" (index 1): True.`, missing: `Nothing is borrowed.` },
        { add: 16, why: `Try again: it's on loan now, so False.`, missing: `The refusal is never tested.` },
        { add: 17, why: `Loop over the objects themselves.`, missing: `You'd need a print for each book.` },
        { add: 18, why: `Ask each book about its own state.`, missing: `Every book would print the same message.` },
        { add: 19, why: `On loan.`, missing: `The <code>if</code> would have no body.` },
        { add: 20, why: `Otherwise…`, missing: `Available books would print nothing.` },
        { add: 21, why: `…available.`, missing: `The <code>else</code> would have no body.` }
      ],
      trace: {
        cols: ['b.title', 'b.on_loan'],
        note: `In the loop, <code>b</code> refers to each Book object in turn, and only "Holes" has <code>on_loan</code> True — the state was stored inside that one object by its own method.`
      },
      mistakes: [
        { title: 'Not checking the state first', bad: 7, code: `class Book:
    def __init__(self, title):
        self.title = title
        self.on_loan = False

    def borrow(self):
        self.on_loan = True
        return True


holes = Book("Holes")
print(holes.borrow())
print(holes.borrow())`, out: `True\nTrue`,
          why: `The method never looks at the object's current state, so the same copy is "borrowed" twice. A method should protect the object's data from changes that don't make sense.` },
        { title: 'Comparing a Boolean with a string', bad: 7, code: `class Book:
    def __init__(self, title):
        self.title = title
        self.on_loan = False

    def borrow(self):
        if self.on_loan == "True":
            return False
        self.on_loan = True
        return True


holes = Book("Holes")
print(holes.borrow())
print(holes.borrow())`, out: `True\nTrue`,
          why: `<code>self.on_loan</code> is the Boolean <code>True</code>, not the string "True", so they are never equal and the check never refuses. Test the Boolean directly: <code>if self.on_loan:</code>.` },
        { title: 'Leaving out a constructor argument', bad: 8, code: `class Book:
    def __init__(self, title, pages):
        self.title = title
        self.pages = pages
        self.on_loan = False


dune = Book("Dune")`, error: 'TypeError', errorText: "__init__() missing 1 required positional argument: 'pages'",
          why: `The constructor has two parameters after <code>self</code>, so creating a Book needs two arguments: <code>Book("Dune", 412)</code>.` }
      ],
      nobuiltins: {
        title: 'Without a class: parallel lists, compared',
        intro: `<p>Here is the same program with no class: three parallel lists and a function that works on an <b>index</b>. It works — and that's the point of the comparison:</p>`,
        code: `titles = ["Dune", "Holes", "Wonder"]
pages = [412, 233, 310]
on_loan = [False, False, False]


def borrow(i):
    if on_loan[i]:
        return False
    on_loan[i] = True
    return True


print(borrow(1))
print(borrow(1))
for i in range(len(titles)):
    if on_loan[i]:
        print(titles[i], "is on loan")
    else:
        print(titles[i], "is available")`,
        out: `True\nFalse\nDune is available\nHoles is on loan\nWonder is available`,
        changes: [
          `Each book's data is split across three lists, which must be kept in step: add or delete a book and you must change all three in the same position.`,
          `<code>borrow</code> works on global lists through an index. Any other code can change <code>on_loan</code> directly — nothing protects it (OOP's encapsulation does).`,
          `Adding a new kind of data (an author, a due date) means another list everywhere; in the class it's one more attribute.`,
          `<b>But</b> for a program this small, the list version is shorter and needs no design — that's the main disadvantage of OOP.`
        ]
      },
      tip: `"Evaluate the use of OOP for …" questions need both sides and a conclusion: advantages (models real objects, reuse — many objects from one class, encapsulation protects data, easier maintenance and teamwork) and disadvantages (more planning, more code, can be slower or use more memory for small tasks), then a justified judgement for <b>this</b> scenario.`
    }
  ]
});
