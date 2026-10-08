/* "Build it from scratch" notes — B1.1.4 Tracing flowcharts. Format: see widgets/notes.js. */
(function () {
  // The flowchart is drawn by the practice section's drawer (practice/gen-b1.js), which the site loads first.
  const chart = (nodes, edges) => (CodeCraft.practice && CodeCraft.practice.flowchart ? `<div class="nt-chart">${CodeCraft.practice.flowchart(nodes, edges)}</div>` : '');
  const avgChart = chart([
    { id: 's', type: 'term', text: 'Start', c: 0, r: 0 }, { id: 't', type: 'proc', text: 'total = 0', c: 0, r: 1 }, { id: 'n', type: 'proc', text: 'count = 0', c: 0, r: 2 },
    { id: 'i1', type: 'io', text: 'INPUT mark', c: 0, r: 3 }, { id: 'd', type: 'dec', text: 'mark >= 0 ?', c: 0, r: 4 },
    { id: 'b1', type: 'proc', text: 'total = total + mark', c: 0, r: 5 }, { id: 'b2', type: 'proc', text: 'count = count + 1', c: 0, r: 6 },
    { id: 'i2', type: 'io', text: 'INPUT mark', c: 0, r: 7 }, { id: 'o', type: 'io', text: 'OUTPUT total / count', c: 0, r: 8 }, { id: 'e', type: 'term', text: 'End', c: 0, r: 9 }
  ], [
    { a: 's', b: 't' }, { a: 't', b: 'n' }, { a: 'n', b: 'i1' }, { a: 'i1', b: 'd' }, { a: 'd', b: 'b1', label: 'Yes' }, { a: 'b1', b: 'b2' }, { a: 'b2', b: 'i2' },
    { a: 'i2', b: 'd', from: 'left', to: 'left', via: [[-0.82, 7], [-0.82, 4]] },
    { a: 'd', b: 'o', from: 'right', to: 'right', label: 'No', via: [[0.82, 4], [0.82, 8]] }, { a: 'o', b: 'e' }
  ]);
  CodeCraft.addNotes('B1.1.4', {
    intro: `<p>A <span class="term">flowchart</span> shows an algorithm as symbols joined by arrows (<b>flowlines</b>): rounded <b>Start/End</b> terminals, rectangles for <b>processes</b> (calculations and assignments), parallelograms for <b>input/output</b>, and diamonds for <b>decisions</b>, which have two exits labelled Yes and No. A <b>connector</b> joins flowlines that would otherwise cross or continue elsewhere.</p>
    <p>To <b>trace</b> a flowchart, follow the arrows from Start, writing each variable's new value in a trace table and taking the Yes or No exit at every decision. An arrow that goes back <b>up</b> to a decision is a loop. Below, a flowchart is turned into Python one symbol at a time.</p>`,
    programs: [
      {
        title: 'Turn a loop flowchart into Python',
        goal: `<p>This flowchart reads marks until a negative "stop" value is entered, then outputs their average. Translate it into Python and check it gives the same result as tracing the chart.</p>${avgChart}`,
        input: `marks typed one at a time: 60, 75, 90, then -1 to stop`,
        output: `<code>75.0</code> — the average of 60, 75 and 90`,
        inputs: ['60', '75', '90', '-1'],
        think: [
          `Follow the arrows from Start: each symbol becomes a line of Python, in the same order.`,
          `Processes become assignments; INPUT becomes <code>int(input(...))</code>; OUTPUT becomes <code>print</code>.`,
          `The decision has an arrow coming back <b>up</b> to it from below, so it's a loop: "Yes" means keep going round, so it becomes <code>while mark &gt;= 0:</code>.`,
          `The symbols on the Yes path, up to the arrow that goes back, become the indented loop body. The No exit leads to what comes after the loop.`,
          `There are two INPUT symbols: one before the decision (so it has a mark to test) and one at the end of the loop (the next mark). Keep both.`
        ],
        works: `the Python follows exactly the same path through the steps as the arrows do, so it produces the same values: every non-negative mark is added and counted, and the stop value -1 isn't, because the decision is tested straight after each input.`,
        vars: [
          ['total', 'int', 'the process box "total = 0"'],
          ['count', 'int', 'the process box "count = 0"'],
          ['mark', 'int', 'the value from each INPUT symbol']
        ],
        code: `total = 0
count = 0
mark = int(input("Mark (-1 to stop): "))
while mark >= 0:
    total = total + mark
    count = count + 1
    mark = int(input("Mark (-1 to stop): "))
print(total / count)`,
        out: `Mark (-1 to stop): 60\nMark (-1 to stop): 75\nMark (-1 to stop): 90\nMark (-1 to stop): -1\n75.0`,
        build: [
          { add: 1, why: `Process box 1: <code>total = 0</code>.`, missing: `<code>total + mark</code> crashes with a <code>NameError</code>.` },
          { add: 2, why: `Process box 2: <code>count = 0</code>.`, missing: `<code>count + 1</code> crashes with a <code>NameError</code>.` },
          { add: 3, why: `The first INPUT symbol, before the decision: it gives the decision a mark to test.`, missing: `The <code>while</code> line crashes with a <code>NameError</code> (see mistake 1).` },
          { add: 4, expect: 'loops', why: `The decision diamond. Because an arrow comes back up to it, it's a loop: repeat while the answer is Yes. Run this stage with 60: it never ends — nothing inside the loop changes <code>mark</code> yet.`, missing: `Written as <code>if</code>, the steps would happen only once.` },
          { add: 5, expect: 'loops', why: `First box on the Yes path: add the mark. Indented, because it's inside the loop.`, missing: `The total stays 0.` },
          { add: 6, expect: 'loops', why: `Next box: count it.`, missing: `<code>count</code> stays 0, and the average divides by zero.` },
          { add: 7, why: `The second INPUT symbol, the last one before the arrow goes back up: read the next mark. Now the loop can end, when -1 is typed.`, missing: `Missing: an infinite loop (see mistake 2). Moved to the top of the loop body: the stop value gets added (see mistake 4).` },
          { add: 8, why: `The No exit leads to the OUTPUT symbol, after the loop — so it isn't indented.`, missing: `Indented, it outputs a running average after every mark (see mistake 3).` }
        ],
        trace: {
          inputs: ['60', '75', '-1'],
          cols: ['mark', 'total', 'count'],
          note: `This is the trace table you would write for the flowchart itself: each row is one symbol, and the decision row shows which exit was taken. With -1 the decision is <code>False</code> (No), so the output symbol runs: 135 / 2 = 67.5.`
        },
        mistakes: [
          { title: 'Missing the first INPUT', bad: 3, code: `total = 0
count = 0
while mark >= 0:
    total = total + mark
    count = count + 1
    mark = int(input("Mark (-1 to stop): "))
print(total / count)`, error: 'NameError', errorText: "name 'mark' is not defined",
            why: `The flowchart has an INPUT <b>before</b> the decision for a reason: the decision needs a value to test. Every symbol on the path must be translated.` },
          { title: 'Missing the INPUT inside the loop', code: `total = 0
count = 0
mark = int(input("Mark (-1 to stop): "))
while mark >= 0:
    total = total + mark
    count = count + 1
print(total / count)`, loops: true,
            why: `Without the second INPUT, <code>mark</code> is 60 for ever, so the decision always says Yes: an infinite loop. In the flowchart, that INPUT is what lets the No exit ever be taken.` },
          { title: 'OUTPUT inside the loop', bad: 7, code: `total = 0
count = 0
mark = int(input("Mark (-1 to stop): "))
while mark >= 0:
    total = total + mark
    count = count + 1
    print(total / count)
    mark = int(input("Mark (-1 to stop): "))`, out: `Mark (-1 to stop): 60\n60.0\nMark (-1 to stop): 75\n67.5\nMark (-1 to stop): 90\n75.0\nMark (-1 to stop): -1`,
            why: `In the flowchart, OUTPUT is on the <b>No</b> path, reached only once the loop is finished. Indenting it puts it on the Yes path, so it runs every time round.` },
          { title: 'Reading before adding inside the loop', bad: 5, code: `total = 0
count = 0
mark = int(input("Mark (-1 to stop): "))
while mark >= 0:
    mark = int(input("Mark (-1 to stop): "))
    total = total + mark
    count = count + 1
print(total / count)`, out: `Mark (-1 to stop): 60\nMark (-1 to stop): 75\nMark (-1 to stop): 90\nMark (-1 to stop): -1\n54.666666666666664`,
            why: `The same symbols in a different order: the first mark (60) is never added, and the stop value -1 is added and counted. Follow the arrows exactly — the order of the boxes is part of the algorithm.` }
        ],
        nobuiltins: { none: `Nothing to change: flowcharts use only basic operations. (<code>int</code> and <code>input</code> stand for the INPUT symbol and are never banned.)` },
        tip: `Flowchart questions usually ask you to <b>trace</b> (a table with a column for each variable and one for output — plus a row each time a value changes) or to state the output for given inputs. Write down which exit each decision takes. If asked to convert to code, translate symbol by symbol and keep the order.`
      }
    ]
  });
})();
