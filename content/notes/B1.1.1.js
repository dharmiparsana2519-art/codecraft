/* "Build it from scratch" notes — B1.1.1 Problem specifications. Format: see widgets/notes.js. */
CodeCraft.addNotes('B1.1.1', {
  intro: `<p>Before building a solution, a team writes a <span class="term">problem specification</span>: an agreed description of what is needed. It has six parts: the <b>problem statement</b> (what is wrong now), <b>constraints and limitations</b> (what the solution must work within), <b>objectives and goals</b> (what the solution must achieve), <b>input specifications</b> and <b>output specifications</b> (what goes in and what comes out), and <b>evaluation criteria</b> — measurable tests that show whether the finished solution succeeded.</p>
  <p>Below, a small specification for a canteen pre-order system is turned into a program, and each line of the program is traced back to the part of the specification it satisfies.</p>`,
  programs: [
    {
      title: 'From a specification to a working program',
      goal: `<p>Build the program described by this specification.</p>
      <div class="tv-wrap"><table class="tv nt-spec"><tbody>
        <tr><th>Problem statement</th><td>Lunch queues are so long that students miss the start of afternoon lessons.</td></tr>
        <tr><th>Constraints</th><td>The menu has 3 dishes: Pasta $4, Curry $5, Salad $3. An order may contain at most 3 dishes.</td></tr>
        <tr><th>Objectives</th><td>Let a student build an order before lunch and see its total, so it can be ready when they arrive.</td></tr>
        <tr><th>Inputs</th><td>Dish numbers 1–3, one at a time; 0 to finish the order.</td></tr>
        <tr><th>Outputs</th><td>A confirmation for each dish added, a message for an invalid number, and the number of dishes and total price at the end.</td></tr>
        <tr><th>Evaluation criteria</th><td>(1) The total is correct for every valid order. (2) Any number other than 0–3 is rejected with a message. (3) An order never has more than 3 dishes.</td></tr>
      </tbody></table></div>`,
      input: `dish numbers typed one at a time, e.g. 2, 5, 1, then 0`,
      output: `<code>Added Curry</code>, <code>No such dish</code>, <code>Added Pasta</code>, then <code>Dishes: 2 Total: $9</code>`,
      inputs: ['2', '5', '1', '0'],
      think: [
        `The <b>constraints</b> give fixed data: the menu and prices (two parallel lists) and the limit of 3 — store it as a constant.`,
        `The <b>input specification</b> says dishes come one at a time until 0 is typed, and the limit stops the order at 3: a loop that asks each time round and stops on 0 or at the limit.`,
        `The <b>output specification</b> lists three kinds of message; each becomes a <code>print</code> in the right branch.`,
        `Each <b>evaluation criterion</b> must be checked by a test: a valid order (total), an invalid number (rejected), and four dishes in a row (stops at 3).`
      ],
      works: `every input is either 0 (finish), a valid dish (added, counted and priced) or anything else (rejected), and the loop condition stops at the limit — so each evaluation criterion holds for any sequence of inputs.`,
      vars: [
        ['MENU, PRICES', 'list of str, list of int', 'the constraint data: parallel lists'],
        ['MAX_DISHES', 'int', 'the constraint "at most 3 dishes"'],
        ['total, count', 'int', 'running total and number of dishes'],
        ['choice', 'int', 'the dish number typed']
      ],
      code: `MENU = ["Pasta", "Curry", "Salad"]
PRICES = [4, 5, 3]
MAX_DISHES = 3
total = 0
count = 0
while count < MAX_DISHES:
    choice = int(input("Dish (1-3, 0 to finish): "))
    if choice == 0:
        break
    if choice >= 1 and choice <= 3:
        total = total + PRICES[choice - 1]
        count = count + 1
        print("Added", MENU[choice - 1])
    else:
        print("No such dish")
print("Dishes:", count, "Total: $" + str(total))`,
      out: `Dish (1-3, 0 to finish): 2\nAdded Curry\nDish (1-3, 0 to finish): 5\nNo such dish\nDish (1-3, 0 to finish): 1\nAdded Pasta\nDish (1-3, 0 to finish): 0\nDishes: 2 Total: $9`,
      build: [
        { add: 1, why: `<b>Constraint</b>: the three dishes, in menu order.`, missing: `The confirmation message can't name the dish.` },
        { add: 2, why: `<b>Constraint</b>: their prices, in the same order (parallel lists).`, missing: `The total can't be worked out.` },
        { add: 3, why: `<b>Constraint</b>: at most 3 dishes, stored once as a named constant.`, missing: `The loop has no limit to check.` },
        { add: 4, why: `<b>Output</b> needs a total, so keep a running total.`, missing: `<code>total + …</code> crashes with a <code>NameError</code>.` },
        { add: 5, why: `<b>Output</b> and <b>constraint</b>: count the dishes.`, missing: `The limit can never be reached.` },
        { add: 16, why: `<b>Output</b>: the summary line. Run this stage: <code>Dishes: 0 Total: $0</code>.`, missing: `The student never sees the total — the main <b>objective</b> fails.` },
        { add: 6, expect: 'loops', why: `<b>Input</b>: keep taking dishes while the order is under the limit. Run this stage: it never stops yet — nothing inside changes <code>count</code>.`, missing: `Only one dish could be ordered.` },
        { add: [7, 8, 9], why: `<b>Input</b>: read one dish number each time round, and since the input specification says 0 means "finish", <code>break</code> out of the loop at once. These three lines belong together: without the <code>break</code>, typing 0 would never end the order. Run this stage: type 0 and it finishes.`, missing: `Without them nothing is ever read, and there's no way to finish an order with fewer than 3 dishes.` },
        { add: 10, why: `<b>Evaluation criterion 2</b>: only 1–3 are dishes.`, missing: `A number like 5 crashes the program with an <code>IndexError</code> (see mistake 2).` },
        { add: 11, why: `<b>Criterion 1</b>: add the right price. Dish 1 is at index 0, so subtract 1.`, missing: `<code>PRICES[choice]</code> charges the wrong dish's price (see mistake 1).` },
        { add: 12, why: `<b>Criterion 3</b>: count it, so the loop stops at 3.`, missing: `<code>count</code> never reaches 3, so an order could be any size (see mistake 3).` },
        { add: 13, why: `<b>Output</b>: confirm the dish.`, missing: `The student can't see what was added.` },
        { add: 14, why: `Anything else…`, missing: `Invalid numbers would be ignored silently.` },
        { add: 15, why: `…<b>output</b>: reject it with a message (criterion 2).`, missing: `The <code>else</code> would have no body.` }
      ],
      trace: {
        inputs: ['2', '3', '1', '2'],
        cols: ['choice', 'count', 'total'],
        note: `Testing <b>criterion 3</b>: four dishes are offered, but after the third, <code>count &lt; MAX_DISHES</code> is <code>False</code> and the 4th input is never asked for. A trace table like this is evidence that a criterion is met.`
      },
      mistakes: [
        { title: 'Forgetting that indexes start at 0', bad: 11, inputs: ['1', '0'], code: `MENU = ["Pasta", "Curry", "Salad"]
PRICES = [4, 5, 3]
MAX_DISHES = 3
total = 0
count = 0
while count < MAX_DISHES:
    choice = int(input("Dish (1-3, 0 to finish): "))
    if choice == 0:
        break
    if choice >= 1 and choice <= 3:
        total = total + PRICES[choice]
        count = count + 1
        print("Added", MENU[choice])
    else:
        print("No such dish")
print("Dishes:", count, "Total: $" + str(total))`, out: `Dish (1-3, 0 to finish): 1\nAdded Curry\nDish (1-3, 0 to finish): 0\nDishes: 1 Total: $5`,
          why: `Dish 1 is Pasta, at index 0, but <code>PRICES[1]</code> is Curry's price. The program runs, but fails <b>evaluation criterion 1</b> — which is why every criterion needs a test.` },
        { title: 'No validation', inputs: ['5'], code: `MENU = ["Pasta", "Curry", "Salad"]
PRICES = [4, 5, 3]
total = 0
choice = int(input("Dish (1-3, 0 to finish): "))
total = total + PRICES[choice - 1]
print("Added", MENU[choice - 1])`, error: 'IndexError', errorText: 'list index out of range',
          why: `Dish 5 doesn't exist, so <code>PRICES[4]</code> crashes the program — failing <b>criterion 2</b>. Check the input is in range before using it.` },
        { title: 'Not counting, so no limit', bad: 6, inputs: ['1', '2', '3', '1', '0'], code: `MENU = ["Pasta", "Curry", "Salad"]
PRICES = [4, 5, 3]
MAX_DISHES = 3
total = 0
count = 0
while count < MAX_DISHES:
    choice = int(input("Dish (1-3, 0 to finish): "))
    if choice == 0:
        break
    total = total + PRICES[choice - 1]
    print("Added", MENU[choice - 1])
print("Total: $" + str(total))`, out: `Dish (1-3, 0 to finish): 1\nAdded Pasta\nDish (1-3, 0 to finish): 2\nAdded Curry\nDish (1-3, 0 to finish): 3\nAdded Salad\nDish (1-3, 0 to finish): 1\nAdded Pasta\nDish (1-3, 0 to finish): 0\nTotal: $16`,
          why: `<code>count</code> is never increased, so the loop's limit never applies: a 4-dish order is accepted, breaking the <b>constraint</b> and <b>criterion 3</b>.` },
        { title: 'A vague criterion can\'t be tested', code: `criteria = ["The app should be easy to use", "Any number other than 0-3 is rejected"]
for c in criteria:
    if "0-3" in c:
        print("Testable:", c)
    else:
        print("Not measurable:", c)`, out: `Not measurable: The app should be easy to use\nTestable: Any number other than 0-3 is rejected`,
          why: `"Easy to use" can't be checked with a test that passes or fails. A good evaluation criterion is <b>measurable</b> — it states exactly what to try and what should happen.` }
      ],
      nobuiltins: { none: `Nothing to change: the program uses only <code>input</code>, <code>int</code> and <code>str</code>, which are never banned.` },
      tip: `"Construct a problem specification" questions usually give one mark per part that is present <b>and</b> relevant to the scenario: problem statement, constraints, objectives, inputs, outputs, evaluation criteria. Evaluation criteria only earn their mark if they are measurable — say what will be tested and what result counts as success.`
    }
  ]
});
