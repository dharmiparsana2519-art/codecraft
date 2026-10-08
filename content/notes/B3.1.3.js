/* "Build it from scratch" notes — B3.1.3 Static vs non-static. Format: see widgets/notes.js. */
CodeCraft.addNotes('B3.1.3', {
  intro: `<p>An <span class="term">instance variable</span> (<code>self.name</code>) belongs to one object: every object has its own copy. A <span class="term">class (static) variable</span> is written directly in the class body and belongs to the class: there is <b>one copy, shared</b> by every object — use it for a value that is the same for all of them, or a running count of objects. Read and change it through the class name, e.g. <code>Student.count</code>.</p>
  <p>Likewise, an ordinary method works on one object (<code>self</code>), while a <span class="term">static method</span>, marked <code>@staticmethod</code>, has no <code>self</code>: it belongs with the class but doesn't need any object's data, and can be called on the class without creating an object.</p>`,
  programs: [
    {
      title: 'A shared count and a shared school name',
      goal: `<p>Every Student has their own name, but they all share one school name, and the class keeps count of how many Student objects have been created. Show that the shared values really are shared.</p>`,
      input: `two students, Aiko and Ben; then the school's name changes`,
      output: `<code>2 2</code> for the count, and both students showing the new school name`,
      think: [
        `Which data belongs to <b>each</b> student? The name → instance variable, set with <code>self.</code> in <code>__init__</code>.`,
        `Which data is the <b>same for all</b>? The school name and the count → class variables, written in the class body, outside any method.`,
        `Each new object runs <code>__init__</code> once, so that's where to add 1 to the count — through the class name: <code>Student.count</code>.`,
        `Change a class variable through the class, and every object sees the new value.`
      ],
      works: `there is exactly one <code>count</code> and one <code>school</code>, stored on the class. Objects that don't have their own attribute with that name read the class's copy, so they all agree.`,
      vars: [
        ['Student.school', 'str', 'class variable: one copy for every student'],
        ['Student.count', 'int', 'class variable: how many Student objects exist'],
        ['self.name', 'str', 'instance variable: each object\'s own'],
        ['a, b', 'Student', 'two objects']
      ],
      code: `class Student:
    school = "Hillside"
    count = 0

    def __init__(self, name):
        self.name = name
        Student.count = Student.count + 1


a = Student("Aiko")
b = Student("Ben")
print(a.name, b.name)
print(Student.count, a.count)
print(a.school, b.school)
Student.school = "Hillside International"
print(a.school, b.school)`,
      out: `Aiko Ben\n2 2\nHillside Hillside\nHillside International Hillside International`,
      build: [
        { add: 1, why: `The class.`, missing: `<code>Student(...)</code> crashes with a <code>NameError</code>.` },
        { add: 2, why: `A <b>class variable</b>: written in the class body, not inside a method, with no <code>self.</code>. One copy for all students.`, missing: `<code>a.school</code> crashes with an <code>AttributeError</code>.` },
        { add: 3, why: `Another class variable: the count starts at 0 before any student exists.`, missing: `<code>Student.count + 1</code> crashes with an <code>AttributeError</code>.` },
        { add: 5, why: `The constructor runs once for every new object.`, missing: `<code>Student("Aiko")</code> crashes with a <code>TypeError</code>.` },
        { add: 6, why: `An <b>instance variable</b>: each student's own name.`, missing: `<code>a.name</code> crashes with an <code>AttributeError</code>.` },
        { add: 10, why: `The first object.`, missing: `No students exist.` },
        { add: 11, why: `A second object, with its own name.`, missing: `Only one student.` },
        { add: 12, why: `Instance variables differ: Aiko, Ben.`, missing: `You couldn't see that each object has its own name.` },
        { add: 7, why: `Add 1 to the <b>shared</b> count, through the class name.`, missing: `The count stays 0. Using <code>self.count</code> instead creates a separate copy on each object (see mistake 1).` },
        { add: 13, why: `<code>Student.count</code> is 2, and <code>a.count</code> reads the same shared value: 2.`, missing: `You couldn't see that the count is shared.` },
        { add: 14, why: `Both read the one shared school name.`, missing: `You couldn't see the "before" value, so the change on the next lines would prove nothing.` },
        { add: 15, why: `Change the class variable, through the class.`, missing: `Changing it through one object instead gives only that object a new value (see mistake 3).` },
        { add: 16, why: `Both objects see the change — there was only ever one copy.`, missing: `You couldn't see that the change applies to every object.` }
      ],
      trace: {
        cols: ['a.name', 'b.name', 'a.count', 'b.count'],
        note: `The tracer shows each object's own attributes. <code>count</code> doesn't appear inside a or b — it lives on the class — which is why <code>a.count</code> reads the shared value.`
      },
      mistakes: [
        { title: 'Counting with self instead of the class', bad: 6, code: `class Student:
    count = 0

    def __init__(self, name):
        self.name = name
        self.count = self.count + 1


a = Student("Aiko")
b = Student("Ben")
print(Student.count, a.count, b.count)`, out: `0 1 1`,
          why: `<code>self.count = …</code> creates an <b>instance</b> variable on that one object (0 + 1), and the class's count is never changed. To update the shared value, assign through the class: <code>Student.count = Student.count + 1</code>.` },
        { title: 'Leaving out the class name', bad: 6, code: `class Student:
    count = 0

    def __init__(self, name):
        self.name = name
        count = count + 1


a = Student("Aiko")`, error: 'UnboundLocalError', errorText: "cannot access local variable 'count' where it is not associated with a value",
          why: `Inside a method, a plain <code>count</code> is a local variable, not the class variable — and it has no value yet. Class variables are reached as <code>Student.count</code>.` },
        { title: 'Changing a class variable through one object', bad: 10, code: `class Student:
    school = "Hillside"

    def __init__(self, name):
        self.name = name


a = Student("Aiko")
b = Student("Ben")
a.school = "Riverside"
print(a.school, b.school, Student.school)`, out: `Riverside Hillside Hillside`,
          why: `Assigning through <code>a</code> gives <code>a</code> its own instance variable called <code>school</code>, which hides the shared one for that object only. Change shared values through the class.` },
        { title: 'Resetting the count per object', bad: 6, code: `class Student:
    count = 0

    def __init__(self, name):
        self.name = name
        self.count = 0
        Student.count = Student.count + 1


a = Student("Aiko")
b = Student("Ben")
print(Student.count, a.count)`, out: `2 0`,
          why: `The class's count is right (2), but <code>self.count = 0</code> gave every object its own count of 0, which hides the shared one. Don't create an instance variable with the same name as a class variable.` }
      ],
      nobuiltins: { none: `Nothing to change — no built-ins are used.` },
      tip: `"Distinguish between instance and class (static) variables" answers usually get marks for: an instance variable has one copy per object (set with <code>self.</code>), a class variable has one copy shared by all objects (declared in the class body), plus an example of when each is appropriate — e.g. a student's name vs the school name or a count of students.`
    },
    {
      title: 'A class constant and a static method',
      goal: `<p>A library <code>Member</code> may borrow at most 3 books — the same limit for every member, so it's a class constant. A <b>static method</b> checks whether a membership ID is valid (exactly 6 digits) — a job that needs no member's data.</p>`,
      input: `two IDs to check, then one member trying to borrow four books`,
      output: `<code>True False</code>, then <code>True True True False</code>, then <code>Aiko has 3 books</code>`,
      think: [
        `The loan limit is the same for everyone, so it's a class variable: <code>MAX_LOANS = 3</code> (capitals: a constant).`,
        `Each member's number of loans is their own: an instance variable, <code>self.loans</code>.`,
        `Checking an ID only looks at the ID passed in, not at any member's data, so it can be a <code>@staticmethod</code> with no <code>self</code>. It can then be used before a Member object even exists — e.g. while someone is signing up.`,
        `<code>borrow</code> compares this member's loans with the shared limit.`
      ],
      works: `the limit lives in one place, so changing it changes it for every member; and <code>valid_id</code> needs no object, so <code>Member.valid_id("204517")</code> works on the class directly.`,
      vars: [
        ['Member.MAX_LOANS', 'int', 'class constant, shared'],
        ['self.name', 'str', 'instance variable'],
        ['self.loans', 'int', 'instance variable: this member\'s books'],
        ['member_id', 'str', 'parameter of the static method (an ID is text: it could start with 0)'],
        ['m', 'Member', 'a test object']
      ],
      code: `class Member:
    MAX_LOANS = 3

    def __init__(self, name):
        self.name = name
        self.loans = 0

    def borrow(self):
        if self.loans >= Member.MAX_LOANS:
            return False
        self.loans = self.loans + 1
        return True

    @staticmethod
    def valid_id(member_id):
        return len(member_id) == 6 and member_id.isdigit()


print(Member.valid_id("204517"), Member.valid_id("20451A"))
m = Member("Aiko")
print(m.borrow(), m.borrow(), m.borrow(), m.borrow())
print(m.name, "has", m.loans, "books")`,
      out: `True False\nTrue True True False\nAiko has 3 books`,
      build: [
        { add: 1, why: `The class.`, missing: `<code>Member...</code> crashes with a <code>NameError</code>.` },
        { add: [14, 15], why: `<code>@staticmethod</code> goes on the line above the method it applies to (so they are added together). Note: no <code>self</code> parameter.`, missing: `Without the decorator, calling it on an object passes the object in as an extra argument (see mistake 2). With <code>self</code> as well, it expects one argument too many (see mistake 1).` },
        { add: 16, why: `Valid if exactly 6 characters <b>and</b> all digits. It only uses its parameter.`, missing: `The method would have no body.` },
        { add: 19, why: `Called on the <b>class</b> — no Member object exists yet. True, then False ("A" isn't a digit).`, missing: `The static method goes untested.` },
        { add: 2, why: `The shared limit, as a class constant.`, missing: `<code>Member.MAX_LOANS</code> crashes with an <code>AttributeError</code>.` },
        { add: 4, why: `The constructor.`, missing: `<code>Member("Aiko")</code> crashes with a <code>TypeError</code>.` },
        { add: 5, why: `Each member's own name.`, missing: `<code>m.name</code> crashes with an <code>AttributeError</code>.` },
        { add: 6, why: `Each member's own loan count, starting at 0.`, missing: `<code>self.loans</code> crashes with an <code>AttributeError</code>.` },
        { add: 20, why: `A member object.`, missing: `No member exists to borrow.` },
        { add: 8, why: `An ordinary (instance) method: it needs <code>self</code>, because it uses this member's loans.`, missing: `<code>m.borrow()</code> crashes with an <code>AttributeError</code>.` },
        { add: 9, why: `At the limit already? Compare this member's loans with the <b>shared</b> limit.`, missing: `<code>&gt;</code> instead of <code>&gt;=</code> lets a member borrow a 4th book (see mistake 4).` },
        { add: 10, why: `Refuse.`, missing: `The <code>if</code> would have no body.` },
        { add: 11, why: `One more loan for this member only.`, missing: `The count never goes up, so the limit is never reached.` },
        { add: 12, why: `Report success.`, missing: `It returns <code>None</code>.` },
        { add: 21, why: `Four attempts: the 4th is refused. Arguments are worked out left to right.`, missing: `The limit goes untested.` },
        { add: 22, why: `The member's own data.`, missing: `You couldn't check the final count.` }
      ],
      trace: {
        cols: ['m.loans'],
        note: `<code>loans</code> goes 1, 2, 3 and then stays at 3: on the 4th call the condition <code>self.loans &gt;= Member.MAX_LOANS</code> is <code>True</code>. <code>MAX_LOANS</code> never appears inside <code>m</code> — it is the class's.`
      },
      mistakes: [
        { title: 'self in a static method', bad: 3, code: `class Member:
    @staticmethod
    def valid_id(self, member_id):
        return len(member_id) == 6 and member_id.isdigit()


print(Member.valid_id("204517"))`, error: 'TypeError', errorText: "valid_id() missing 1 required positional argument: 'member_id'",
          why: `A static method is never given an object, so "204517" goes into <code>self</code> and <code>member_id</code> gets nothing. Static methods have no <code>self</code> parameter.` },
        { title: 'Forgetting @staticmethod', bad: 5, code: `class Member:
    def __init__(self, name):
        self.name = name

    def valid_id(member_id):
        return len(member_id) == 6 and member_id.isdigit()


m = Member("Aiko")
print(m.valid_id("204517"))`, error: 'TypeError', errorText: 'valid_id() takes 1 positional argument but 2 were given',
          why: `Without the decorator it's an ordinary method, so calling it on an object passes the object as an extra first argument. <code>@staticmethod</code> tells Python not to.` },
        { title: 'Using self inside a static method', bad: 6, code: `class Member:
    MAX_LOANS = 3

    @staticmethod
    def limit_message():
        return "Limit: " + str(self.MAX_LOANS)


print(Member.limit_message())`, error: 'NameError', errorText: "name 'self' is not defined",
          why: `A static method has no object, so there is no <code>self</code>. It can still reach class variables through the class name: <code>Member.MAX_LOANS</code>.` },
        { title: '> where the limit is included', bad: 9, code: `class Member:
    MAX_LOANS = 3

    def __init__(self, name):
        self.name = name
        self.loans = 0

    def borrow(self):
        if self.loans > Member.MAX_LOANS:
            return False
        self.loans = self.loans + 1
        return True


m = Member("Aiko")
print(m.borrow(), m.borrow(), m.borrow(), m.borrow())`, out: `True True True True`,
          why: `With 3 loans, <code>3 &gt; 3</code> is False, so a 4th book is allowed. "At most 3" means refuse when loans are already 3 or more: <code>&gt;=</code>.` }
      ],
      nobuiltins: { none: `Nothing to change for exams: <code>len</code> and <code>isdigit</code> here only check the ID's format. (If <code>len</code> were banned, count the characters with a loop.)` },
      tip: `"When should a method be static?" — when it doesn't use any instance variables (no <code>self</code> data), such as a validation or conversion helper related to the class. "When should a variable be static?" — when one value is shared by every object, such as a limit, a rate or a count of objects.`
    }
  ]
});
