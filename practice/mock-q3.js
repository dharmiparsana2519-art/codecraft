/* practice/mock-q3.js — Question 3 of the timed Paper 2 mock (review-2): a class with private attributes, a class
   (static) counter and getters, as in the learner's school half-yearly Paper 2 — UML [2], create an object [3],
   a method [4], instance vs class variables [2], the counter [3], the purpose of __ [1] and a list of objects [5]
   (20 marks). All questions are original. Every part carries its full reasoning (CLAUDE.md). */
(function (P) {
  const { py, esc } = P;
  const M = P.mock = P.mock || {};
  const W = (prompt, points, answer, model) => ({ prompt, markscheme: points.map(([text, why]) => ({ text, why })), answer, model: model || 'Award [1] for each valid point, up to the marks shown.' });
  const mk = '<span class="mk">[1]</span>';
  const cap = s => s[0].toUpperCase() + s.slice(1);

  // The class from the question. With notes, every line ends in "  # why" (model solutions explain every line).
  function classSrc(S, notes) {
    const L = [
      [`class ${S.cls}:`, 'the class: a blueprint for objects'],
      [`    ${S.count} = 0`, 'class (static) variable: one copy shared by every object'],
      ['', ''],
      [`    def __init__(self, ${S.attrs.join(', ')}):`, 'the constructor runs once for each new object'],
      ...S.attrs.map(a => [`        self.__${a} = ${a}`, 'private instance variable: each object has its own']),
      [`        ${S.cls}.${S.count} = ${S.cls}.${S.count} + 1`, 'one more object has been created'],
      ...S.attrs.flatMap(a => [['', ''], [`    def get${cap(a)}(self):`, `getter: outside code reads the private ${a} through it`], [`        return self.__${a}`, `this object's ${a}`]])
    ];
    return L.map(([c, n]) => (c && notes ? `${c}  # ${n}` : c)).join('\n');
  }
  const make = (S, args) => `${S.cls}(${args.map(py.r).join(', ')})`;

  function q3(v) {
    const A = v === 'A';
    const S = A
      ? { cls: 'Booking', count: 'totalBookings', attrs: ['name', 'hall', 'hours'], types: ['String', 'String', 'Integer'], kinds: ['Main', 'Studio'], unit: 'hour', what: 'booking', who: 'name' }
      : { cls: 'Rental', count: 'totalRentals', attrs: ['student', 'size', 'days'], types: ['String', 'String', 'Integer'], kinds: ['small', 'large'], unit: 'day', what: 'rental', who: 'student' };
    const [a0, a1, a2] = S.attrs, g = a => `get${cap(a)}`;
    const uml = { name: S.cls, attrs: [...S.attrs.map((a, i) => ['-', a, S.types[i]]), ['+', `<u>${S.count}</u>`, 'Integer']],
      methods: [['+', `${S.cls}(${S.attrs.join(', ')})`, ''], ...S.attrs.map((a, i) => ['+', `${g(a)}()`, S.types[i]])] };
    return {
      title: A ? 'Hall bookings' : 'Locker rentals',
      context(R) {
        const rates = A ? [R.pick([40, 45, 50, 60]), R.pick([20, 25, 30])] : [R.pick([2, 3, 4]), R.pick([5, 6, 7])];
        return { rates, long: A ? R.pick([3, 4, 5]) : R.pick([20, 25, 30]), off: R.pick([10, 15, 20]), who: R.pick(P.data.names), kind: R.pick(S.kinds), n: A ? R.int(1, 6) : R.int(5, 40) };
      },
      intro: ctx => `<p>${A ? `A school lets clubs book its halls. The <b>Main</b> hall costs ${ctx.rates[0]} per hour and the <b>Studio</b> costs ${ctx.rates[1]} per hour. A booking of ${ctx.long} hours or more gets ${ctx.off} off its total cost.`
        : `Students can rent a locker. A <b>small</b> locker costs ${ctx.rates[0]} per day and a <b>large</b> one costs ${ctx.rates[1]} per day. A rental of ${ctx.long} days or more gets ${ctx.off} off its total cost.`} Each ${S.what} is an object of this class:</p><pre class="q-pre">${esc(classSrc(S, false))}</pre>`,
      parts: [
        { label: 'a', kind: 'written', term: 'Construct', marks: 2, make: () => W(`Construct a UML class diagram for the <code>${S.cls}</code> class.`,
          [[`The class name, and the attributes with <b>−</b> (private) and their data types: − ${S.attrs.map((a, i) => `${a}: ${S.types[i]}`).join(', − ')} (and ${S.count}: Integer, underlined because it is static)`,
            'Attributes go in the middle section. The <code>__</code> in the code makes them private, which UML shows with −.'],
          [`The methods with <b>+</b> (public) and return types: + ${S.cls}(${S.attrs.join(', ')}), ${S.attrs.map((a, i) => `+ ${g(a)}(): ${S.types[i]}`).join(', ')}`,
            'Methods go in the bottom section; the getters are public so outside code can use them, and each returns one attribute\'s type.']],
          `<div class="q-visual">${P.uml(uml)}</div><p>Name and private attributes (−) with their types ${mk} Public methods (+) with their return types ${mk}</p>`,
          'Award [1] for the attributes section and [1] for the methods section. Accept the constructor written as __init__.') },
        { label: 'b', kind: 'code', term: 'Construct', marks: 3, make(R, ctx) {
          const args = [ctx.who, ctx.kind, ctx.n];
          return {
            prompt: `Construct code that creates a <code>${S.cls}</code> object called <code>b</code> for <b>${esc(ctx.who)}</b>, ${A ? `who has booked the ${ctx.kind} hall for ${ctx.n} hours` : `who has rented a ${ctx.kind} locker for ${ctx.n} days`}, and then outputs the ${S.who} and the number of ${S.unit}s using its getter methods.`,
            starter: classSrc(S, false) + '\n\n\n# Create b here, then output its details\n',
            solution: classSrc(S, true) + `\n\n\nb = ${make(S, args)}  # the constructor: arguments in the same order as __init__\nprint(b.${g(a0)}(), b.${g(a2)}())  # private attributes are read through the getters\n`,
            think: [`An object is created by calling the class like a function: <code>${S.cls}(…)</code>. The arguments go in the order of <code>__init__</code>'s parameters (after <code>self</code>).`,
              `${cap(a2)} is a whole number, so it is passed without quotes.`,
              `The attributes are private, so the output must use the getters: <code>b.${g(a0)}()</code> and <code>b.${g(a2)}()</code>.`],
            diagnose: [
              { match: 'object', checks: `that b is created from the ${S.cls} class`, cause: `Create it by calling the class: <code>b = ${S.cls}(…)</code>.` },
              { match: '.', when: `${S.cls}\\([^)]*"\\d+"`, checks: `the number of ${S.unit}s`, cause: `The ${S.unit}s are a whole number: pass ${ctx.n}, not "${ctx.n}".` },
              { match: '.', checks: 'the arguments', cause: `Pass the values in the same order as <code>__init__</code>: ${S.attrs.join(', ')} — strings in quotes, spelt exactly as in the question.` }],
            tests: [P.t(`b is a ${S.cls} object`, `isinstance(b, ${S.cls})`, true),
              P.t(`b has the right ${a0} and ${a1}`, `(b.${g(a0)}(), b.${g(a1)}())`, { tuple: [ctx.who, ctx.kind] }),
              P.t(`b has the right number of ${S.unit}s`, `b.${g(a2)}()`, ctx.n)].join('\n'),
            require: [{ label: `print() with b.${g(a0)}()`, re: `print\\s*\\([^\\n]*\\.${g(a0)}\\s*\\(` }, { label: `b.${g(a2)}()`, re: `\\.${g(a2)}\\s*\\(` }],
            hint: `b = ${S.cls}(…), then print(b.${g(a0)}(), …)`
          };
        } },
        { label: 'c', kind: 'code', term: 'Construct', marks: 4, make(R, ctx) {
          const [r0, r1] = ctx.rates, cost = (k, n) => n * (k === S.kinds[0] ? r0 : r1) - (n >= ctx.long ? ctx.off : 0);
          const lo = A ? R.int(1, ctx.long - 1) : R.int(3, ctx.long - 1), hi = ctx.long + R.int(1, A ? 3 : 10);
          const cases = [[S.kinds[0], lo, 'short'], [S.kinds[1], lo, 'short'], [S.kinds[0], ctx.long, 'exactly'], [S.kinds[1], hi, 'long']];
          return {
            prompt: `Construct a method <code>getCost(self)</code> for the class that returns the total cost of the ${S.what}, using the prices and the discount described above.`,
            starter: classSrc(S, false) + '\n\n    def getCost(self):\n        pass\n',
            solution: classSrc(S, true) + `\n\n    def getCost(self):  # a method, so it can use the private attributes\n        if self.__${a1} == "${S.kinds[0]}":  # choose the price by ${a1}\n            cost = self.__${a2} * ${r0}  # ${S.kinds[0]}: ${r0} per ${S.unit}\n        else:  # the only other ${a1} is ${S.kinds[1]}\n            cost = self.__${a2} * ${r1}  # ${S.kinds[1]}: ${r1} per ${S.unit}\n        if self.__${a2} >= ${ctx.long}:  # "${ctx.long} ${S.unit}s or more" includes ${ctx.long}\n            cost = cost - ${ctx.off}  # the discount\n        return cost  # the total for this ${S.what}\n`,
            think: [`Inside the class, a method can read the private attributes directly as <code>self.__${a1}</code> and <code>self.__${a2}</code>.`,
              `First the price: ${S.unit}s × the price per ${S.unit}, which depends on the ${a1} — an <code>if</code>/<code>else</code>.`,
              `Then the discount, as a <b>separate</b> <code>if</code>: it applies to either ${a1}. "Or more" means <code>&gt;=</code>.`,
              'Return the cost; the method is indented inside the class.'],
            diagnose: [
              { match: 'exactly', when: `__${a2}\\s*>\\s*${ctx.long}\\b`, checks: `a ${S.what} of exactly ${ctx.long} ${S.unit}s`, cause: `"${ctx.long} ${S.unit}s or more" includes ${ctx.long} itself: use <code>&gt;=</code>.` },
              { match: 'exactly|long', checks: `the discount for ${S.what}s of ${ctx.long} ${S.unit}s or more`, cause: `After working out the cost, subtract ${ctx.off} when the ${S.unit}s are ${ctx.long} or more — for either ${a1}.` },
              { match: '.', when: `def getCost\\(self\\):\\s*\\n\\s*return\\s+\\d`, checks: 'the cost', cause: 'The method must work out the cost from this object\'s own attributes, not return a fixed number.' },
              { match: '.', checks: `the price for each ${a1}`, cause: `Compare <code>self.__${a1}</code> with "${S.kinds[0]}" (exact spelling) and multiply the ${S.unit}s by the matching price.` }],
            tests: cases.map(([k, n, tag]) => P.t(`${tag === 'exactly' ? 'exactly ' : ''}${n} ${S.unit}s, ${k}${tag === 'long' ? ' (long)' : ''}: costs ${cost(k, n)}`, `${make(S, ['X', k, n])}.getCost()`, cost(k, n))).join('\n'),
            hint: `if self.__${a1} == "${S.kinds[0]}": … then a separate if for the discount.`
          };
        } },
        { label: 'd', kind: 'written', term: 'Identify', marks: 2, make: () => W(`Identify <b>one</b> instance variable and <b>one</b> class (static) variable in the <code>${S.cls}</code> class.`,
          [[`Instance variable: any one of <code>__${a0}</code>, <code>__${a1}</code>, <code>__${a2}</code>`, 'Each object gets its own copy, set through <code>self</code> in the constructor.'],
            [`Class variable: <code>${S.count}</code>`, 'It is defined in the class body, outside any method, so there is one copy shared by all objects.']],
          `<p>Instance variable: <code>__${a0}</code> ${mk} Class variable: <code>${S.count}</code> ${mk}</p>`) },
        { label: 'e', kind: 'written', term: 'Describe', marks: 3, make: () => W(`Describe how the value of <code>${S.count}</code> changes as the program creates ${S.cls} objects.`,
          [[`It starts at 0 when the class is defined`, 'The first state of the variable — before any object exists.'],
            [`Each time an object is created, the constructor (__init__) adds 1 to it`, 'This is the step that changes it, and when it happens.'],
            [`It is shared by all objects, so it holds the total number of ${S.cls} objects created (e.g. 3 after three objects)`, 'One copy for the whole class is why it can count every object.']],
          `<p><code>${S.count}</code> is a class variable that starts at 0. ${mk} Every time a new ${S.cls} object is created, <code>__init__</code> runs and adds 1 to it. ${mk} Because there is only one copy, shared by every object, it always holds the number of objects created so far. ${mk}</p>`) },
        { label: 'f', kind: 'written', term: 'State', marks: 1, make: () => W(`State the purpose of the <code>__</code> (two underscores) in front of the attribute names.`,
          [['It makes the attributes private (information hiding / encapsulation), so they cannot be accessed directly from outside the class — only through methods such as the getters',
            'This is what the exam wants: the double underscore hides the attribute and forces access through the class\'s methods. (Python does it by renaming the attribute — name mangling — so it is a strong convention rather than a lock, but the exam answer is "private".)'],
            ['Accept: so the values can only be changed in a controlled way, through the class\'s own methods', 'The same idea, described by its effect.']],
          `<p>It makes the attribute <b>private</b>, so code outside the class cannot read or change it directly — only the class's methods can. ${mk}</p>`) },
        { label: 'g', kind: 'code', term: 'Construct', marks: 5, make(R, ctx) {
          const list = (k, lo, hi) => Array.from({ length: k }, () => [R.pick(P.data.names), R.pick(S.kinds), R.int(lo, hi)]);
          const lit = l => '[' + l.map(x => make(S, x)).join(', ') + ']';
          if (A) {
            const tot = l => [S.kinds[0], S.kinds[1]].map(k => l.filter(x => x[1] === k).reduce((s, x) => s + x[2], 0));
            const l1 = list(5, 1, 6), l2 = list(3, 1, 6);
            return {
              prompt: `The bookings for one week are stored in a list of <code>Booking</code> objects. Construct a function <code>hall_hours(bookings)</code> that returns a list of the total hours booked for each hall: <code>[Main hours, Studio hours]</code>.`,
              starter: classSrc(S, false) + '\n\n\ndef hall_hours(bookings):\n    pass\n',
              solution: classSrc(S, true) + `\n\n\ndef hall_hours(bookings):  # a list of Booking objects\n    main = 0  # total hours for the Main hall\n    studio = 0  # total hours for the Studio\n    for b in bookings:  # each object in the list\n        if b.getHall() == "Main":  # outside the class: use the getters\n            main = main + b.getHours()  # add this booking's hours\n        else:  # it is a Studio booking\n            studio = studio + b.getHours()  # add to the Studio total\n    return [main, studio]  # both totals, Main first\n`,
              think: ['Two running totals, both 0 before the loop.', 'Loop over the list: each item is a whole <code>Booking</code> object.',
                'The function is outside the class, so the private attributes must be read with the getters — <code>b.getHall()</code>, <code>b.getHours()</code>.', 'Return both totals in a list after the loop.'],
              diagnose: [
                { match: '.', when: '\\.__(hours|hall|name)', checks: 'reading each booking', cause: 'Outside the class the attributes are private, so <code>b.__hours</code> raises an AttributeError. Use <code>b.getHours()</code> and <code>b.getHall()</code>.' },
                { match: 'no bookings', checks: 'an empty list', cause: 'Set both totals to 0 before the loop, so an empty list gives [0, 0].' },
                { match: '.', checks: 'the hours for each hall', cause: 'Add each booking\'s hours to the total for its hall, then return [main, studio] after the loop.' }],
              tests: [P.t(`hall_hours(5 bookings) is ${py.r(tot(l1))}`, `hall_hours(${lit(l1)})`, tot(l1)), P.t(`hall_hours(3 bookings) is ${py.r(tot(l2))}`, `hall_hours(${lit(l2)})`, tot(l2)),
                P.t('hall_hours(no bookings) is [0, 0]', 'hall_hours([])', [0, 0])].join('\n'),
              hint: 'main = 0; studio = 0; for b in bookings: if b.getHall() == "Main": …'
            };
          }
          const best = l => l.reduce((b, x) => (x[2] > b[2] ? x : b))[0];
          const l1 = list(5, 5, 60), l2 = list(4, 5, 60), tie = [['Aiko', 'small', 30], ['Ben', 'large', 30], ['Carla', 'small', 12]];
          return {
            prompt: 'The rentals for one term are stored in a list of <code>Rental</code> objects. Construct a function <code>longest(rentals)</code> that returns the name of the student with the longest rental (the first one, if there is a tie). Do not use <code>max()</code> or sorting.',
            starter: classSrc(S, false) + '\n\n\ndef longest(rentals):\n    pass\n',
            solution: classSrc(S, true) + '\n\n\ndef longest(rentals):  # a list of Rental objects\n    best = rentals[0]  # start with the first rental\n    for r in rentals:  # compare every rental\n        if r.getDays() > best.getDays():  # longer than the best so far? (> keeps the first on a tie)\n            best = r  # remember this object\n    return best.getStudent()  # the name, read through its getter\n',
            think: ['The maximum pattern, on objects: keep the <b>object</b> with the most days so far, starting with the first.',
              'The function is outside the class, so compare with the getters: <code>r.getDays()</code>.', 'Use <code>&gt;</code>, so a tie keeps the first.', 'Return the student\'s name — <code>best.getStudent()</code> — not the object.'],
            diagnose: [
              { match: '.', when: '\\.__(days|student|size)', checks: 'reading each rental', cause: 'Outside the class the attributes are private, so <code>r.__days</code> raises an AttributeError. Use <code>r.getDays()</code>.' },
              { match: 'tie', when: '>=', checks: 'a tie', cause: '<code>&gt;=</code> replaces the best with a later rental of the same length. Use <code>&gt;</code> to keep the first.' },
              { match: '.', when: 'return\\s+best\\s*$', checks: 'returning the name', cause: 'You return the object; return <code>best.getStudent()</code>.' },
              { match: '.', checks: 'the student with the longest rental', cause: 'Keep the rental with the most days so far, then return its student\'s name.' }],
            tests: [P.t(`longest(5 rentals) is ${py.s(best(l1))}`, `longest(${lit(l1)})`, best(l1)), P.t(`longest(4 rentals) is ${py.s(best(l2))}`, `longest(${lit(l2)})`, best(l2)),
              P.t("longest(a tie) is 'Aiko'", `longest(${lit(tie)})`, 'Aiko')].join('\n'),
            banned: P.ban('max', 'sorted', 'sort'), hint: 'best = rentals[0]; for r in rentals: if r.getDays() > best.getDays(): …'
          };
        } }
      ]
    };
  }
  M.q3a = q3('A');
  M.q3b = q3('B');
  M.classSrc = classSrc;
})(CodeCraft.practice);
