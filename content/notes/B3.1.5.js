/* "Build it from scratch" notes — B3.1.5 Encapsulation. Format: see widgets/notes.js. */
CodeCraft.addNotes('B3.1.5', {
  intro: `<p><span class="term">Encapsulation</span> means bundling an object's data with the methods that use it, and restricting direct access to that data. <b>Information hiding</b> is the idea behind it: other code only sees what an object can <em>do</em> (its public methods), not how it stores its data.</p>
  <p>In Python, an attribute whose name starts with two underscores, like <code>self.__balance</code>, is <b>private</b>: code outside the class can't reach it. Outside code uses public methods instead — a <b>getter</b> to read the value and a <b>setter</b> (or methods like <code>deposit</code>) to change it. Because every change goes through a method, the method can <b>validate</b> it, so the object's state always stays sensible.</p>
  <p>Python makes an attribute private by <b>name mangling</b>: inside the class, <code>self.__balance</code> is quietly renamed <code>_BankAccount__balance</code>, so <code>account.__balance</code> fails from outside but <code>account._BankAccount__balance</code> still works — privacy in Python is a strong convention rather than a lock. The exam point about encapsulation is the same: keep the data private and give access only through public methods.</p>`,
  programs: [
    {
      title: 'A bank account that protects its balance',
      goal: `<p>Write a <code>BankAccount</code> class whose balance is private. Money can only go in or out through <code>deposit</code> and <code>withdraw</code>, which refuse amounts that aren't positive and withdrawals bigger than the balance. A getter lets other code read the balance.</p>`,
      input: `deposits of $50 and -$20, then withdrawals of $80 and $30`,
      output: `<code>True False</code>, <code>False True</code>, then <code>20</code>`,
      think: [
        `Make the balance private (<code>self.__balance</code>) so no outside code can set it to any value it likes.`,
        `Provide a getter, <code>get_balance()</code>, so it can still be read.`,
        `<code>deposit(amount)</code>: refuse (False) unless the amount is positive; otherwise add it and return True.`,
        `<code>withdraw(amount)</code>: refuse unless the amount is positive <b>and</b> no more than the balance; otherwise subtract and return True.`,
        `Validate <b>before</b> changing the balance, so a refused request changes nothing.`
      ],
      works: `the balance can only change inside <code>deposit</code> and <code>withdraw</code>, and both check the amount first, so the balance can never become negative — whatever the rest of the program does.`,
      vars: [
        ['self.__owner', 'str', 'private'],
        ['self.__balance', 'int', 'private: starts at 0'],
        ['amount', 'int', 'parameter of deposit/withdraw'],
        ['acc', 'BankAccount', 'the test object']
      ],
      code: `class BankAccount:
    def __init__(self, owner):
        self.__owner = owner
        self.__balance = 0

    def get_balance(self):
        return self.__balance

    def deposit(self, amount):
        if amount <= 0:
            return False
        self.__balance = self.__balance + amount
        return True

    def withdraw(self, amount):
        if amount <= 0 or amount > self.__balance:
            return False
        self.__balance = self.__balance - amount
        return True


acc = BankAccount("Aiko")
print(acc.deposit(50), acc.deposit(-20))
print(acc.withdraw(80), acc.withdraw(30))
print(acc.get_balance())`,
      out: `True False\nFalse True\n20`,
      build: [
        { add: 1, why: `The class.`, missing: `<code>BankAccount(...)</code> crashes with a <code>NameError</code>.` },
        { add: 2, why: `A new account only needs its owner.`, missing: `<code>BankAccount("Aiko")</code> crashes with a <code>TypeError</code>.` },
        { add: 3, why: `Private: two underscores.`, missing: `The owner is lost.` },
        { add: 4, why: `Private, starting at 0. From now on only the class's own methods can touch it.`, missing: `Every method crashes with an <code>AttributeError</code>. Made public instead, any code could set it to -500 (see mistake 2).` },
        { add: 22, why: `An account to test with.`, missing: `Nothing to test.` },
        { add: 6, why: `The getter: public read access.`, missing: `Outside code could not see the balance at all — <code>acc.__balance</code> is an <code>AttributeError</code> (see mistake 1).` },
        { add: 7, why: `Return the private value.`, missing: `It returns <code>None</code>.` },
        { add: 25, why: `Read through the getter: 0.`, missing: `You couldn't check the balance.` },
        { add: 9, why: `A controlled way to change the balance.`, missing: `<code>acc.deposit(...)</code> crashes with an <code>AttributeError</code>.` },
        { add: 10, why: `Validate first: a deposit must be positive.`, missing: `A "deposit" of -20 would take money out.` },
        { add: 11, why: `Refuse — and change nothing.`, missing: `The <code>if</code> would have no body.` },
        { add: 12, why: `Valid: add it.`, missing: `Deposits would do nothing.` },
        { add: 13, why: `Report success.`, missing: `It returns <code>None</code>.` },
        { add: 23, why: `$50 accepted, -$20 refused.`, missing: `Deposits go untested.` },
        { add: 15, why: `The other controlled change.`, missing: `<code>acc.withdraw(...)</code> crashes with an <code>AttributeError</code>.` },
        { add: 16, why: `Refuse if the amount isn't positive <b>or</b> is more than the balance — either one is enough to refuse.`, missing: `With <code>and</code>, an amount would have to be both at once, which never happens, so every withdrawal is allowed (see mistake 3).` },
        { add: 17, why: `Refuse.`, missing: `The <code>if</code> would have no body.` },
        { add: 18, why: `Valid: take it off.`, missing: `Withdrawals would do nothing.` },
        { add: 19, why: `Report success.`, missing: `It returns <code>None</code>.` },
        { add: 24, why: `$80 is more than $50: refused. $30 is fine. The balance is now 20.`, missing: `Withdrawals go untested.` }
      ],
      trace: {
        cols: ['acc.__balance'],
        note: `The balance changes only twice: +50 and −30. The three refused requests leave it untouched, because each method checks before it changes anything.`
      },
      mistakes: [
        { title: 'Reaching for the private attribute', bad: 8, code: `class BankAccount:
    def __init__(self, owner):
        self.__owner = owner
        self.__balance = 0


acc = BankAccount("Aiko")
print(acc.__balance)`, error: 'AttributeError', errorText: "'BankAccount' object has no attribute '__balance'",
          why: `That's the protection working: private attributes can't be read from outside the class. Use the public getter, <code>acc.get_balance()</code>.` },
        { title: 'A public balance', bad: 4, code: `class BankAccount:
    def __init__(self, owner):
        self.owner = owner
        self.balance = 0

    def deposit(self, amount):
        if amount <= 0:
            return False
        self.balance = self.balance + amount
        return True


acc = BankAccount("Aiko")
acc.deposit(50)
acc.balance = -500
print(acc.balance)`, out: `-500`,
          why: `The deposit method validates carefully — but with a public attribute, any code can skip it and set the balance directly. Encapsulation only works if the data is private.` },
        { title: 'and where or is needed', bad: 6, code: `class BankAccount:
    def __init__(self, owner):
        self.__balance = 50

    def withdraw(self, amount):
        if amount <= 0 and amount > self.__balance:
            return False
        self.__balance = self.__balance - amount
        return True

    def get_balance(self):
        return self.__balance


acc = BankAccount("Aiko")
print(acc.withdraw(80), acc.get_balance())`, out: `True -30`,
          why: `No amount is both ≤ 0 <b>and</b> more than the balance, so the check never refuses and the account goes overdrawn. Each condition on its own is a reason to refuse: join them with <code>or</code>.` },
        { title: 'Changing first, checking after', bad: 6, code: `class BankAccount:
    def __init__(self, owner):
        self.__balance = 50

    def withdraw(self, amount):
        self.__balance = self.__balance - amount
        if self.__balance < 0:
            return False
        return True

    def get_balance(self):
        return self.__balance


acc = BankAccount("Aiko")
print(acc.withdraw(80), acc.get_balance())`, out: `False -30`,
          why: `The method reports failure, but the money has already gone. Validation must happen <b>before</b> the private data is changed.` }
      ],
      nobuiltins: { none: `Nothing to change — no built-ins are used.` },
      tip: `"Explain how encapsulation protects …" answers usually earn marks for: making the attribute private, providing public methods (getter/setter) as the only access, validating in the setter before storing, and the result — the object's state can't become invalid. Use the question's example rule (e.g. "balance can't be negative") in your answer.`
    },
    {
      title: 'A student grade with a getter and a validating setter',
      goal: `<p>A <code>Student</code> has a private name and a private grade from 1 to 7. <code>set_grade(g)</code> stores g only if it is a valid IB grade and returns True or False; getters return the name and grade.</p>`,
      input: `attempts to set Ben's grade to 6, 9, 0 and 7`,
      output: `<code>6 True</code>, <code>9 False</code>, <code>0 False</code>, <code>7 True</code>, then <code>Ben has grade 7</code>`,
      think: [
        `Both attributes are private. The grade starts at 1, a valid value.`,
        `Getters: one per value other code may read.`,
        `The setter checks <code>g &gt;= 1 and g &lt;= 7</code> — both must hold — before storing.`,
        `It returns True if it stored the grade and False if it refused, so the caller knows what happened.`
      ],
      works: `the grade can only change inside <code>set_grade</code>, which only stores values from 1 to 7 — so <code>get_grade()</code> can never return an invalid grade.`,
      vars: [
        ['self.__name', 'str', 'private'],
        ['self.__grade', 'int', 'private: always 1–7'],
        ['g', 'int', 'the proposed new grade (parameter)'],
        ['s', 'Student', 'the test object']
      ],
      code: `class Student:
    def __init__(self, name):
        self.__name = name
        self.__grade = 1

    def get_name(self):
        return self.__name

    def get_grade(self):
        return self.__grade

    def set_grade(self, g):
        if g >= 1 and g <= 7:
            self.__grade = g
            return True
        return False


s = Student("Ben")
for g in [6, 9, 0, 7]:
    print(g, s.set_grade(g))
print(s.get_name(), "has grade", s.get_grade())`,
      out: `6 True\n9 False\n0 False\n7 True\nBen has grade 7`,
      build: [
        { add: 1, why: `The class.`, missing: `<code>Student(...)</code> crashes with a <code>NameError</code>.` },
        { add: 2, why: `A new student needs a name.`, missing: `<code>Student("Ben")</code> crashes with a <code>TypeError</code>.` },
        { add: 3, why: `Private name.`, missing: `<code>get_name</code> crashes with an <code>AttributeError</code>.` },
        { add: 4, why: `Private grade, starting at a valid value.`, missing: `<code>get_grade</code> crashes if called before a grade is set.` },
        { add: 19, why: `A student to test with.`, missing: `Nothing to test.` },
        { add: 6, why: `Getter for the name.`, missing: `Outside code can't read the name.` },
        { add: 7, why: `Return it.`, missing: `It returns <code>None</code>.` },
        { add: 9, why: `Getter for the grade.`, missing: `Outside code can't read the grade.` },
        { add: 10, why: `Return it.`, missing: `It returns <code>None</code>.` },
        { add: 12, why: `The setter: the only way to change the grade.`, missing: `The grade could never change.` },
        { add: 13, why: `Valid only if both: at least 1 <b>and</b> at most 7.`, missing: `Without the check, 9 and 0 are stored (see mistake 1). With <code>or</code>, every number passes (see mistake 2).` },
        { add: 14, why: `Valid: store it.`, missing: `Valid grades are never stored.` },
        { add: 15, why: `Tell the caller it worked.`, missing: `Accepted grades report nothing (see mistake 3).` },
        { add: 16, why: `Reached only if the check failed: refuse.`, missing: `Refused grades return <code>None</code> instead of False.` },
        { add: 20, why: `Try four grades.`, missing: `The setter goes untested.` },
        { add: 21, why: `Show each attempt and the answer.`, missing: `The loop would have no body.` },
        { add: 22, why: `The final grade is the last <b>valid</b> one: 7.`, missing: `You couldn't check the invalid grades were refused.` }
      ],
      trace: {
        cols: ['g', 's.__grade'],
        note: `The grade only changes on the rows where the condition is <code>True</code> (6 and 7). For 9 and 0 the setter returns False and the private grade is untouched.`
      },
      mistakes: [
        { title: 'A setter with no validation', bad: 10, code: `class Student:
    def __init__(self, name):
        self.__name = name
        self.__grade = 1

    def get_grade(self):
        return self.__grade

    def set_grade(self, g):
        self.__grade = g
        return True


s = Student("Ben")
s.set_grade(9)
print(s.get_grade())`, out: `9`,
          why: `The attribute is private, but the setter lets any value in, so the protection is pointless. The point of a setter is to check the value before storing it.` },
        { title: 'or instead of and', bad: 6, code: `class Student:
    def __init__(self, name):
        self.__grade = 1

    def set_grade(self, g):
        if g >= 1 or g <= 7:
            self.__grade = g
            return True
        return False


s = Student("Ben")
print(s.set_grade(9), s.set_grade(0))`, out: `True True`,
          why: `Every number is either ≥ 1 or ≤ 7, so the condition is always True. A value is valid only if it meets <b>both</b> limits: <code>and</code>.` },
        { title: 'Forgetting to return True', bad: 7, code: `class Student:
    def __init__(self, name):
        self.__grade = 1

    def set_grade(self, g):
        if g >= 1 and g <= 7:
            self.__grade = g
        return False


s = Student("Ben")
print(s.set_grade(6))`, out: `False`,
          why: `The grade was stored, but the method still reports failure, so the caller thinks it didn't work. Return True straight after a successful change.` }
      ],
      nobuiltins: { none: `Nothing to change — no built-ins are used.` },
      tip: `Encapsulation construct questions usually give marks for: private attributes (<code>__</code>), a getter that returns the value, a setter that validates before assigning, and a sensible response to invalid data (return False, or leave the value unchanged). "Outline one advantage of encapsulation": data can't be changed into an invalid state by other code, and the class's internals can change without affecting code that uses it.`
    }
  ]
});
