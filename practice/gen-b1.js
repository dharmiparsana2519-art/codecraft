/* Practice generators — Getting started and B1.1 Approaches to computational thinking. */
(function (P) {
  const { py, esc, code: C } = P;

  /* ================= start-2  Your first program ================= */
  P.add('start-2', [
    { id: 'print-basics', kind: 'output', term: 'State', marks: 2, make(R) {
      const name = R.pick(P.data.names), a = R.int(2, 9), b = R.int(2, 9), n = R.int(3, 12);
      const pool = R.shuffle([
        { line: `print("Hello", "${name}")`, out: `Hello ${name}`, why: 'Commas in <code>print()</code> put a space between the items.' },
        { line: `print("Score:", ${a * 10})`, out: `Score: ${a * 10}`, why: 'A comma separates a string and a number, with a space between them.' },
        { line: `print(${a} + ${b})`, out: String(a + b), why: `Without quotes, <code>${a} + ${b}</code> is arithmetic, so Python prints ${a + b}.` },
        { line: `print("${a}" + "${b}")`, out: `${a}${b}`, why: `With quotes these are strings, and <code>+</code> joins strings with no space: ${a}${b}.` },
        { line: `print(${n}, "books")`, out: `${n} books`, why: 'Items separated by commas are printed with one space between them.' },
        { line: `print("Lunch" + "time")`, out: 'Lunchtime', why: '<code>+</code> joins two strings exactly as they are — no space is added.' },
        { line: `print(${a}, "x", ${b}, "=", ${a * b})`, out: `${a} x ${b} = ${a * b}`, why: 'Each comma adds a single space between the printed items.' }
      ]);
      const chosen = pool.slice(0, 3);
      const comment = { line: `# print("${name} is here")`, out: null, why: 'Lines starting with <code>#</code> are comments — Python ignores them completely.' };
      chosen.splice(R.int(0, 3), 0, comment);
      return {
        prompt: 'What does this program print? Type the output exactly, one line per <code>print</code>.',
        code: chosen.map(x => x.line).join('\n'),
        answer: chosen.filter(x => x.out !== null).map(x => x.out).join('\n'),
        explain: P.list(chosen.map(x => `${C(x.line)} — ${x.why}`))
      };
    } },
    { id: 'first-concepts', kind: 'mcq', term: 'Identify', marks: 1, derived: true, make(R) {
      const qs = [
        { prompt: 'Why can you write <code>total = 0</code> in Python without saying that <code>total</code> is an integer first?',
          ok: ['Python works out the data type from the value that is assigned', 'Python is dynamically typed: the variable takes the type of the value it holds.'],
          wrong: [['Python has no data types', 'Python does have data types (int, float, str, bool) — it just doesn\'t make you declare them.'],
                  ['Every variable in Python is a string', '<code>0</code> is stored as an int, not a string — try <code>type(total)</code>.'],
                  ['The type must be given in a comment instead', 'Comments are ignored by Python. Writing the type in a comment is a good exam habit, but Python doesn\'t need it.']] },
        { prompt: 'What does Python do with a line that starts with <code>#</code>?',
          ok: ['Ignores it — it is a comment for people reading the code', 'Comments explain code to humans; Python skips them.'],
          wrong: [['Prints it to the console', 'Only <code>print()</code> displays text. A comment is never printed.'],
                  ['Treats it as a heading for the next block', 'Python has no headings; indentation, not comments, defines blocks.'],
                  ['Raises a SyntaxError', '<code>#</code> is valid anywhere on a line — everything after it is ignored.']] },
        { prompt: 'In an exam answer, why is it a good idea to write <code># score: int</code> above <code>score = 0</code>?',
          ok: ['It tells the examiner which data type you intend the variable to have', 'Python doesn\'t declare types, so naming the type in a comment shows your design clearly.'],
          wrong: [['Python needs it to create the variable', 'Python creates the variable when you assign to it; the comment is ignored.'],
                  ['It stops the variable changing type later', 'Comments have no effect on how the program runs.'],
                  ['It makes the program run faster', 'Comments are skipped, so they don\'t change speed.']] }
      ];
      const q = R.pick(qs);
      return { prompt: q.prompt, options: [{ text: q.ok[0], ok: true, why: q.ok[1] }, ...q.wrong.map(w => ({ text: w[0], why: w[1] }))] };
    } }
  ]);

  /* ================= B1.1.1  Problem specifications ================= */
  const PARTS = {
    problem: ['Problem statement', 'describes the issue that needs solving and why it matters'],
    constraint: ['Constraints and limitations', 'states the restrictions the solution must work within, such as budget, hardware, time or law'],
    objective: ['Objectives and goals', 'says what the solution should achieve'],
    input: ['Input specifications', 'defines what data goes into the system and in what form'],
    output: ['Output specifications', 'defines what the system produces and in what form'],
    evaluation: ['Evaluation criteria', 'gives measurable tests used to judge whether the solution succeeded']
  };
  const SPECS = [
    { name: 'a canteen pre-order app', problem: 'Lunch queues are so long that some students miss the start of afternoon lessons.', constraint: 'The app must run on the school\'s existing tablets and cost nothing to licence.', objective: 'Let students pre-order lunch so food is ready when they arrive.', input: 'The student ID (6 digits) and up to three menu item codes.', output: 'An order confirmation showing the items, the total cost and a collection number.', evaluation: 'At least 90% of pre-orders are ready at collection time during a two-week trial.' },
    { name: 'a library loans tracker', problem: 'Librarians cannot tell who has an overdue book because loans are written on paper cards.', constraint: 'Data must be stored only on the school\'s own server to follow data-protection rules.', objective: 'Record every loan and return, and list overdue books automatically.', input: 'The book\'s 13-digit ISBN scanned from its barcode and the borrower\'s student ID.', output: 'A daily list of overdue books, sorted by how many days overdue they are.', evaluation: 'A librarian can find who has any book in under 10 seconds.' },
    { name: 'a sports day results system', problem: 'Race times are recorded by hand, so results take days to publish.', constraint: 'It must work outdoors without Wi-Fi on a single laptop.', objective: 'Produce ranked results for each race as soon as it finishes.', input: 'Each runner\'s lane number and finishing time in seconds, to 2 decimal places.', output: 'A results table for each race, fastest first, with the house points awarded.', evaluation: 'Results for every race are published within 5 minutes of it finishing.' },
    { name: 'a digital attendance register', problem: 'Teachers spend the first 10 minutes of each lesson taking attendance on paper.', constraint: 'It must work on teachers\' phones and follow the school\'s privacy policy.', objective: 'Let teachers mark attendance in under a minute and alert the office about absences.', input: 'The class code and, for each student, present, late or absent.', output: 'An absence alert sent to the office listing absent students by class.', evaluation: 'The average time to take a register is below 60 seconds over a one-month trial.' },
    { name: 'a locker booking system', problem: 'Students argue over lockers because nobody records who owns which one.', constraint: 'There are only 240 lockers and the budget is $200.', objective: 'Give every student who asks a locker and keep a record of each owner.', input: 'The student\'s name, year group and preferred floor.', output: 'A confirmation showing the locker number and its code.', evaluation: 'No locker is assigned to two students at any point during the term.' },
    { name: 'a revision planner', problem: 'Students start revising too late because they can\'t see how much work each subject needs.', constraint: 'It must be finished before the mock exams, six weeks from now.', objective: 'Create a day-by-day revision timetable for each student\'s subjects.', input: 'The exam date for each subject and the hours available to revise each day.', output: 'A printable weekly timetable showing which subject to revise each day.', evaluation: '90% of trial users say the timetable covered all their subjects before their first exam.' },
    { name: 'a school bus tracker', problem: 'Families don\'t know when the late bus will arrive, so students wait outside in the cold.', constraint: 'It must use the GPS units already fitted to the buses.', objective: 'Show the live position and expected arrival time of each bus.', input: 'GPS coordinates sent by each bus every 30 seconds.', output: 'A map and the expected arrival time at each stop, updated every minute.', evaluation: 'Predicted arrival times are within 3 minutes of the real time for 95% of stops.' },
    { name: 'a smart recycling bin monitor', problem: 'Recycling bins overflow because they are emptied on a fixed schedule rather than when they are full.', constraint: 'Each bin\'s sensor must run on one battery for a whole school year.', objective: 'Tell the caretaker which bins need emptying each day.', input: 'The fill level (0–100%) reported by each bin\'s sensor every hour.', output: 'A morning list of bins that are more than 80% full, with their locations.', evaluation: 'No bin is reported overflowing during a full term.' }
  ];
  const VAGUE = ['The system should be easy to use.', 'Users should be happy with it.', 'It should work well.', 'It should be faster than the old way.', 'The design should look modern.'];
  P.add('B1.1.1', [
    { id: 'spec-classify', kind: 'mcq', term: 'Identify', marks: 1, derived: true, make(R) {
      const s = R.pick(SPECS), key = R.pick(Object.keys(PARTS));
      const others = R.sample(Object.keys(PARTS).filter(k => k !== key), 3);
      return {
        prompt: `A team is writing the problem specification for ${s.name}. Which part of the specification is this statement?<blockquote>${esc(s[key])}</blockquote>`,
        options: [{ text: PARTS[key][0], ok: true, why: `Yes — this ${PARTS[key][1]}.` },
          ...others.map(k => ({ text: PARTS[k][0], why: `The ${PARTS[k][0].toLowerCase()} ${PARTS[k][1]}. This statement ${PARTS[key][1]} instead, so it is the ${PARTS[key][0].toLowerCase()}.` }))]
      };
    } },
    { id: 'spec-which', kind: 'mcq', term: 'Identify', marks: 1, derived: true, make(R) {
      const s = R.pick(SPECS), key = R.pick(Object.keys(PARTS));
      const others = R.sample(Object.keys(PARTS).filter(k => k !== key), 3);
      return {
        prompt: `Which statement belongs in the <strong>${PARTS[key][0].toLowerCase()}</strong> of the specification for ${s.name}?`,
        options: [{ text: s[key], ok: true, why: `Correct — the ${PARTS[key][0].toLowerCase()} ${PARTS[key][1]}.` },
          ...others.map(k => ({ text: s[k], why: `This is the ${PARTS[k][0].toLowerCase()}: it ${PARTS[k][1]}.` }))]
      };
    } },
    { id: 'spec-measurable', kind: 'mcq', term: 'Identify', marks: 1, derived: true, make(R) {
      const s = R.pick(SPECS), vague = R.sample(VAGUE, 2);
      return {
        prompt: `Which is the most suitable <strong>evaluation criterion</strong> for ${s.name}?`,
        options: [
          { text: s.evaluation, ok: true, why: 'It is measurable: you can test the finished system against it and get a clear pass or fail.' },
          ...vague.map(v => ({ text: v, why: 'Too vague to measure — there\'s no way to test it objectively, so it can\'t show whether the solution succeeded.' })),
          { text: s.objective, why: 'This is an objective (what the system should do), not a measurable test of whether it succeeded.' }
        ]
      };
    } },
    { id: 'spec-construct', kind: 'written', term: 'Construct', marks: 6, derived: true, make(R) {
      const s = R.pick(SPECS);
      return {
        prompt: `Construct a problem specification for <strong>${s.name}</strong>. Include all six parts.`,
        markscheme: Object.keys(PARTS).map(k => `<strong>${PARTS[k][0]}</strong> — e.g. ${esc(s[k])}`),
        model: 'Award 1 mark for each part that is present and relevant to this scenario. Evaluation criteria only earn the mark if they are measurable.'
      };
    } }
  ]);

  /* ================= B1.1.2–3  The four concepts ================= */
  const CONCEPTS = {
    abstraction: ['Abstraction', 'removing unnecessary detail so you can focus on what matters'],
    decomposition: ['Decomposition', 'breaking a problem into smaller sub-problems that can be solved separately'],
    pattern: ['Pattern recognition', 'spotting similarities or repeated features so a solution can be reused'],
    algorithm: ['Algorithmic design', 'creating a precise, step-by-step sequence of instructions to solve the problem']
  };
  const PHRASES = {
    abstraction: ['Hiding or ignoring details that are not needed to solve the problem.', 'Creating a simplified model that keeps only the relevant features.'],
    decomposition: ['Splitting a large problem into smaller, more manageable parts.', 'Dividing a system into modules that can be developed and tested separately.'],
    pattern: ['Identifying similarities between problems or within data.', 'Noticing that the same steps repeat, so one solution can be reused.'],
    algorithm: ['Developing a clear set of ordered steps that solves the problem.', 'Planning the exact instructions, decisions and loops a solution needs.']
  };
  const CT_SCENARIOS = [
    ['abstraction', 'A school map app shows only buildings and paths, not trees or benches.'],
    ['abstraction', 'A model of the canteen queue records only arrival and serving times, ignoring what students order.'],
    ['abstraction', 'The library database stores each book\'s title, author and ISBN, but not its cover colour.'],
    ['abstraction', 'A spam filter represents each email only as a count of how often each word appears.'],
    ['abstraction', 'A network diagram shows devices as simple icons joined by lines, hiding their internal hardware.'],
    ['abstraction', 'A firewall rule looks only at each packet\'s source address, destination port and protocol.'],
    ['decomposition', 'Building the school website is split into separate tasks: timetable page, news page and login system.'],
    ['decomposition', 'Analysing exam results is broken into cleaning the data, calculating averages per subject, then drawing graphs.'],
    ['decomposition', 'A face-recognition system is split into detecting faces, extracting features and matching them.'],
    ['decomposition', 'The library database is designed by separating it into Books, Members and Loans tables.'],
    ['decomposition', 'A security audit is divided into checking passwords, firewall settings and software updates.'],
    ['decomposition', 'Planning sports day is split into scheduling races, recording times and calculating house points.'],
    ['pattern', 'A developer notices the sign-up, login and reset-password pages all check an email address the same way, so writes one function for it.'],
    ['pattern', 'An analyst notices that attendance drops every Friday afternoon in every year group.'],
    ['pattern', 'A model learns that emails containing "urgent" and a link are often phishing.'],
    ['pattern', 'A designer notices students, teachers and visitors all have a name, ID and contact details, so uses one structure for all three.'],
    ['pattern', 'An intrusion detection system flags many failed logins from the same address within a minute.'],
    ['pattern', 'A student sees that every question on a worksheet uses the same formula with different numbers.'],
    ['algorithm', 'Writing the exact steps for borrowing a book: scan card, scan book, check the loan limit, record the loan.'],
    ['algorithm', 'Writing the steps to calculate each student\'s average and flag anyone below 50%.'],
    ['algorithm', 'Specifying the steps a model follows to adjust itself after each wrong prediction.'],
    ['algorithm', 'Writing the sequence for adding a member: check the ID is unique, then insert the record.'],
    ['algorithm', 'Defining the exact steps for locking an account after three failed login attempts.'],
    ['algorithm', 'Drawing a flowchart showing how the vending machine works out the change to give.']
  ];
  const FIELDS = {
    'software development': {
      abstraction: ['Hide implementation details behind functions or classes so they can be used without knowing how they work', 'Model only the features users need (e.g. a booking app stores the date and room, not the room\'s paint colour)', 'Simpler models make the program easier to design, test and maintain'],
      decomposition: ['Break the system into modules or functions (e.g. login, timetable, messaging)', 'Each module can be written and tested separately, or by different team members', 'Smaller parts are easier to debug and to reuse'],
      pattern: ['Spot tasks that repeat in the code (e.g. validating input on several forms)', 'Write one reusable function or class instead of duplicating code', 'Less duplication means fewer errors and faster development'],
      algorithm: ['Plan the exact sequence of steps (e.g. with a flowchart) before coding', 'Include the decisions and loops needed to handle every case', 'A clear algorithm can be traced and tested before it is implemented'] },
    'data analysis': {
      abstraction: ['Keep only the variables relevant to the question (e.g. score and subject, not home address)', 'Summarise the data with averages or totals instead of every raw value', 'This makes trends easier to see and the analysis quicker'],
      decomposition: ['Split the analysis into stages: collect, clean, analyse, visualise', 'Each stage can be checked before moving on to the next', 'A large dataset can be split into subsets (e.g. by year group)'],
      pattern: ['Identify trends or correlations (e.g. attendance falls on Fridays)', 'Spot outliers or anomalies in the data', 'Patterns support predictions and decisions'],
      algorithm: ['Define precise steps for cleaning data (e.g. remove duplicates, handle missing values)', 'Specify the calculations (e.g. mean per subject) so results can be reproduced', 'The same algorithm can be rerun on new data'] },
    'machine learning': {
      abstraction: ['Represent each example by selected features only (e.g. word counts for an email)', 'Ignore irrelevant details so the model generalises to new data', 'Simpler inputs reduce training time'],
      decomposition: ['Split the task into data collection, feature extraction, training and evaluation', 'Break a complex task into sub-tasks (find a face, then recognise it)', 'Each stage can be improved independently'],
      pattern: ['The model learns patterns from labelled training data', 'It recognises the same patterns in new, unseen data to classify or predict', 'e.g. spam emails share common words or link types'],
      algorithm: ['Design the training steps: how the model is adjusted after each error', 'Define how a prediction is made from the inputs', 'Include clear evaluation steps (e.g. measure accuracy on unseen test data)'] },
    'database design': {
      abstraction: ['Store only the attributes that are needed (e.g. a book\'s title, ISBN and author)', 'Model real-world things as entities or tables', 'Users work with views of the data without seeing how it is stored'],
      decomposition: ['Split the data into separate tables (e.g. Students, Books, Loans)', 'Each table holds one type of entity, reducing duplication', 'Relationships link the tables back together'],
      pattern: ['Spot data that repeats across records and move it into its own table', 'Recognise entities with the same attributes so they can share one structure', 'Spot common queries so the design can support them efficiently'],
      algorithm: ['Define step-by-step processes for adding, updating and deleting records', 'Include validation steps (e.g. check an ID is unique before inserting)', 'Plan the order of operations so the data stays consistent'] },
    'network security': {
      abstraction: ['Model the network as devices and connections, ignoring hardware details', 'Firewall rules use only key packet details (address, port, protocol)', 'Focus on the assets and threats that matter most'],
      decomposition: ['Split security into areas: authentication, firewalls, encryption, updates', 'Audit each part of the network separately', 'Assign responsibility for each sub-problem'],
      pattern: ['Detect suspicious patterns (e.g. many failed logins from one address)', 'Recognise the signatures of known attacks or malware', 'Compare current traffic with normal patterns to spot unusual activity'],
      algorithm: ['Define exact procedures, e.g. lock an account after 3 failed attempts', 'Specify the steps for responding to an incident', 'Design the step-by-step checks used for authentication or encryption'] }
  };
  P.add('B1.1.2-3', [
    { id: 'ct-identify', kind: 'mcq', term: 'Identify', marks: 1, derived: true, make(R) {
      const [key, text] = R.pick(CT_SCENARIOS);
      return {
        prompt: `Which computational thinking concept is being applied?<blockquote>${esc(text)}</blockquote>`,
        options: Object.keys(CONCEPTS).map(k => k === key
          ? { text: CONCEPTS[k][0], ok: true, why: `Yes — ${CONCEPTS[k][0].toLowerCase()} is ${CONCEPTS[k][1]}.` }
          : { text: CONCEPTS[k][0], why: `${CONCEPTS[k][0]} is ${CONCEPTS[k][1]}. That isn't the main idea here — this is ${CONCEPTS[key][0].toLowerCase()}: ${CONCEPTS[key][1]}.` })
      };
    } },
    { id: 'ct-define', kind: 'mcq', term: 'Identify', marks: 1, derived: true, make(R) {
      const key = R.pick(Object.keys(CONCEPTS)), phrase = R.pick(PHRASES[key]);
      return {
        prompt: `Which concept matches this description?<blockquote>${esc(phrase)}</blockquote>`,
        options: Object.keys(CONCEPTS).map(k => k === key
          ? { text: CONCEPTS[k][0], ok: true, why: `Correct — ${CONCEPTS[k][1]}.` }
          : { text: CONCEPTS[k][0], why: `${CONCEPTS[k][0]} means ${CONCEPTS[k][1]}.` })
      };
    } },
    { id: 'ct-field', kind: 'written', term: 'Explain', marks: 3, derived: true, make(R) {
      const field = R.pick(Object.keys(FIELDS)), key = R.pick(Object.keys(CONCEPTS));
      return {
        prompt: `Explain how <strong>${CONCEPTS[key][0].toLowerCase()}</strong> can be used to solve problems in <strong>${field}</strong>.`,
        markscheme: FIELDS[field][key],
        model: `1 mark per relevant point, up to 3. Your answer must apply ${CONCEPTS[key][0].toLowerCase()} to ${field}, not just define it.`
      };
    } }
  ]);

  /* ================= B1.1.4  Tracing flowcharts ================= */
  // Draws a flowchart as SVG from nodes on a grid and orthogonal edges.
  const CW = 230, RH = 78;
  function nodeBox(n) {
    const lines = String(n.text).split('\n'), len = Math.max(...lines.map(l => l.length));
    const tw = len * 7.9;
    const w = n.type === 'dec' ? Math.max(130, tw + 76) : Math.max(n.type === 'term' ? 96 : 116, tw + (n.type === 'io' ? 52 : 34));
    const h = n.type === 'dec' ? 62 : 38 + (lines.length - 1) * 17;
    return { x: n.c * CW, y: n.r * RH, w, h, lines };
  }
  function anchor(b, side) {
    return side === 'top' ? [b.x, b.y - b.h / 2] : side === 'bottom' ? [b.x, b.y + b.h / 2] : side === 'left' ? [b.x - b.w / 2 + (b.io ? 8 : 0), b.y] : [b.x + b.w / 2 - (b.io ? 8 : 0), b.y];
  }
  P.flowchart = function (nodes, edges) {
    const box = {};
    nodes.forEach(n => { box[n.id] = Object.assign(nodeBox(n), { io: n.type === 'io' }); });
    const parts = [], pts = [];
    edges.forEach(e => {
      const a = anchor(box[e.a], e.from || 'bottom'), b = anchor(box[e.b], e.to || 'top');
      const path = [a, ...(e.via || []).map(([c, r]) => [c * CW, r * RH]), b];
      pts.push(...path);
      parts.push(`<polyline class="fc-line" points="${path.map(p => p.join(',')).join(' ')}" marker-end="url(#fcArrow)"/>`);
      if (e.label) {
        const [x, y] = a, dx = (e.from === 'right' ? 10 : 6), dy = (e.from === 'right' ? -7 : 15);
        parts.push(`<text class="fc-label" x="${x + dx}" y="${y + dy}">${e.label}</text>`);
      }
    });
    nodes.forEach(n => {
      const b = box[n.id], { x, y, w, h } = b, l = x - w / 2, t = y - h / 2;
      pts.push([l, t], [l + w, t + h]);
      let shape;
      if (n.type === 'term') shape = `<rect class="fc-term" x="${l}" y="${t}" width="${w}" height="${h}" rx="${h / 2}"/>`;
      else if (n.type === 'proc') shape = `<rect class="fc-proc" x="${l}" y="${t}" width="${w}" height="${h}" rx="3"/>`;
      else if (n.type === 'io') shape = `<polygon class="fc-io" points="${l + 14},${t} ${l + w},${t} ${l + w - 14},${t + h} ${l},${t + h}"/>`;
      else shape = `<polygon class="fc-dec" points="${x},${t} ${l + w},${y} ${x},${t + h} ${l},${y}"/>`;
      const ty = y - (b.lines.length - 1) * 8.5 + 4.5;
      parts.push(shape + `<text class="fc-text" x="${x}" y="${ty}">${b.lines.map((ln, i) => `<tspan x="${x}" dy="${i ? 17 : 0}">${esc(ln)}</tspan>`).join('')}</text>`);
    });
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    const minX = Math.min(...xs) - 24, minY = Math.min(...ys) - 12, W = Math.max(...xs) - minX + 24, H = Math.max(...ys) - minY + 12;
    return `<svg class="flowchart" viewBox="${minX} ${minY} ${W} ${H}" width="${W}" role="img" aria-label="Flowchart"><defs><marker id="fcArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="fc-head"/></marker></defs>${parts.join('')}</svg>`;
  };
  // A while-loop flowchart: init lines, a decision, body lines, then an output.
  function loopChart(init, cond, body, out) {
    const nodes = [{ id: 's', type: 'term', text: 'Start', c: 0, r: 0 }];
    let r = 1;
    init.forEach((t, i) => nodes.push({ id: 'i' + i, type: /^INPUT/.test(t) ? 'io' : 'proc', text: t, c: 0, r: r++ }));
    const dr = r++;
    nodes.push({ id: 'd', type: 'dec', text: cond, c: 0, r: dr });
    body.forEach((t, i) => nodes.push({ id: 'b' + i, type: 'proc', text: t, c: 0, r: r++ }));
    const or = r++;
    nodes.push({ id: 'o', type: 'io', text: out, c: 0, r: or }, { id: 'e', type: 'term', text: 'End', c: 0, r: r });
    const chain = ['s', ...init.map((t, i) => 'i' + i), 'd'];
    const edges = chain.slice(1).map((id, i) => ({ a: chain[i], b: id }));
    edges.push({ a: 'd', b: 'b0', label: 'Yes' });
    body.slice(1).forEach((t, i) => edges.push({ a: 'b' + i, b: 'b' + (i + 1) }));
    const last = 'b' + (body.length - 1);
    edges.push({ a: last, b: 'd', from: 'left', to: 'left', via: [[-0.82, dr + body.length], [-0.82, dr]] });
    edges.push({ a: 'd', b: 'o', from: 'right', to: 'right', label: 'No', via: [[0.82, dr], [0.82, or]] });
    edges.push({ a: 'o', b: 'e' });
    return P.flowchart(nodes, edges);
  }
  function loopTemplate(R) {
    const t = R.int(0, 2);
    if (t === 0) { // add up a stepped sequence
      const a = R.int(1, 5), s = R.int(2, 4), b = a + s * R.int(2, 4) + R.int(0, s - 1);
      const rows = []; let x = a, total = 0;
      rows.push({ x, total, cond: x <= b });
      while (x <= b) { total += x; x += s; rows.push({ x, total, cond: x <= b }); }
      return { chart: loopChart([`x = ${a}`, 'total = 0'], `x <= ${b} ?`, ['total = total + x', `x = x + ${s}`], 'OUTPUT total'),
        py: `x = ${a}\ntotal = 0\nwhile x <= ${b}:\n    total = total + x\n    x = x + ${s}\nprint(total)`,
        answer: String(total), vars: ['x', 'total'], cond: `x <= ${b}`, rows, input: null,
        story: `x takes the values ${rows.filter(r => r.cond).map(r => r.x).join(', ')} while x <= ${b}, so total = ${rows.filter(r => r.cond).map(r => r.x).join(' + ')} = ${total}. When x becomes ${x} the condition is false and total is output.` };
    }
    if (t === 1) { // halve until small
      const n0 = R.pick([40, 48, 56, 60, 64, 72, 80, 96, 100, 120]), lim = R.pick([3, 4, 5, 6]);
      const rows = []; let n = n0, count = 0;
      rows.push({ n, count, cond: n > lim });
      while (n > lim) { n = Math.floor(n / 2); count += 1; rows.push({ n, count, cond: n > lim }); }
      return { chart: loopChart(['INPUT n', 'count = 0'], `n > ${lim} ?`, ['n = n // 2', 'count = count + 1'], 'OUTPUT count'),
        py: `n = ${n0}  # the value that was input\ncount = 0\nwhile n > ${lim}:\n    n = n // 2\n    count = count + 1\nprint(count)`,
        answer: String(count), vars: ['n', 'count'], cond: `n > ${lim}`, rows, input: n0,
        story: `n goes ${rows.map(r => r.n).join(' → ')} (// halves and rounds down). The loop body ran ${count} times before n > ${lim} became false, so ${count} is output.` };
    }
    const a = R.int(1, 6), b = a + R.int(12, 20), p = R.int(2, 4), q = R.int(1, 3);
    const rows = []; let x = a, y = b;
    rows.push({ x, y, cond: x < y });
    while (x < y) { x += p; y -= q; rows.push({ x, y, cond: x < y }); }
    return { chart: loopChart([`x = ${a}`, `y = ${b}`], 'x < y ?', [`x = x + ${p}`, `y = y - ${q}`], 'OUTPUT x, y'),
      py: `x = ${a}\ny = ${b}\nwhile x < y:\n    x = x + ${p}\n    y = y - ${q}\nprint(x, y)`,
      answer: `${x} ${y}`, vars: ['x', 'y'], cond: 'x < y', rows, input: null,
      story: `Each time round, x goes up by ${p} and y goes down by ${q}: ${rows.map(r => `(${r.x}, ${r.y})`).join(' → ')}. The loop stops when x is no longer less than y, so the output is ${x} ${y}.` };
  }
  function selectChart(R) {
    if (R.chance(0.5)) {
      const price = R.int(5, 12), age = R.int(6, 18), lim = R.int(10, 16), d = R.int(1, 4);
      const nodes = [{ id: 's', type: 'term', text: 'Start', c: 0, r: 0 }, { id: 'p', type: 'proc', text: `price = ${price}`, c: 0, r: 1 }, { id: 'i', type: 'io', text: 'INPUT age', c: 0, r: 2 },
        { id: 'd', type: 'dec', text: `age < ${lim} ?`, c: 0, r: 3 }, { id: 'x', type: 'proc', text: `price = price - ${d}`, c: 0, r: 4 }, { id: 'o', type: 'io', text: 'OUTPUT price', c: 0, r: 5 }, { id: 'e', type: 'term', text: 'End', c: 0, r: 6 }];
      const edges = [{ a: 's', b: 'p' }, { a: 'p', b: 'i' }, { a: 'i', b: 'd' }, { a: 'd', b: 'x', label: 'Yes' }, { a: 'x', b: 'o' }, { a: 'd', b: 'o', from: 'right', to: 'right', label: 'No', via: [[0.82, 3], [0.82, 5]] }, { a: 'o', b: 'e' }];
      const out = age < lim ? price - d : price;
      return { chart: P.flowchart(nodes, edges), input: `age = ${age}`, answer: String(out),
        py: `price = ${price}\nage = ${age}  # the value that was input\nif age < ${lim}:\n    price = price - ${d}\nprint(price)`,
        story: `${age} < ${lim} is ${py.b(age < lim)}, so ${age < lim ? `the Yes branch subtracts ${d}: ${price} − ${d} = ${out}` : `the No branch skips the subtraction and price stays ${price}`}.` };
    }
    const pass = R.int(40, 60), mark = R.chance(0.3) ? pass : R.int(pass - 15, pass + 15);
    const nodes = [{ id: 's', type: 'term', text: 'Start', c: 0, r: 0 }, { id: 'i', type: 'io', text: 'INPUT mark', c: 0, r: 1 }, { id: 'd', type: 'dec', text: `mark >= ${pass} ?`, c: 0, r: 2 },
      { id: 'y', type: 'io', text: 'OUTPUT "Pass"', c: 0, r: 3 }, { id: 'n', type: 'io', text: 'OUTPUT "Retake"', c: 1, r: 3 }, { id: 'e', type: 'term', text: 'End', c: 0, r: 4 }];
    const edges = [{ a: 's', b: 'i' }, { a: 'i', b: 'd' }, { a: 'd', b: 'y', label: 'Yes' }, { a: 'd', b: 'n', from: 'right', to: 'top', label: 'No', via: [[1, 2]] }, { a: 'y', b: 'e' }, { a: 'n', b: 'e', from: 'bottom', to: 'right', via: [[1, 4]] }];
    const out = mark >= pass ? 'Pass' : 'Retake';
    return { chart: P.flowchart(nodes, edges), input: `mark = ${mark}`, answer: out,
      py: `mark = ${mark}  # the value that was input\nif mark >= ${pass}:\n    print("Pass")\nelse:\n    print("Retake")`,
      story: `${mark} >= ${pass} is ${py.b(mark >= pass)}${mark === pass ? ' — >= includes the boundary itself' : ''}, so the ${mark >= pass ? 'Yes' : 'No'} branch outputs ${out}.` };
  }
  const SYMBOLS = {
    term: ['Terminal (rounded rectangle)', 'shows where the algorithm starts or ends', ['Start', 'End']],
    proc: ['Process (rectangle)', 'shows a calculation or assignment', ['total = total + mark', 'count = 0', 'x = x * 2']],
    io: ['Input/output (parallelogram)', 'shows data being input or output', ['INPUT age', 'OUTPUT total', 'INPUT password']],
    dec: ['Decision (diamond)', 'asks a yes/no question and has two branches', ['age >= 18 ?', 'x < 10 ?', 'found = True ?']],
    conn: ['Connector (small circle)', 'joins parts of a flowchart that are drawn apart, e.g. across pages', []],
    line: ['Flowline (arrow)', 'shows the order in which the steps happen', []]
  };
  P.add('B1.1.4', [
    { id: 'fc-symbol', kind: 'mcq', term: 'Identify', marks: 1, derived: true, make(R) {
      const key = R.pick(['term', 'proc', 'io', 'dec']), ex = R.pick(SYMBOLS[key][2]);
      const others = R.sample(Object.keys(SYMBOLS).filter(k => k !== key), 3);
      const asExample = R.chance(0.6);
      return {
        prompt: asExample ? `Which flowchart symbol should contain <code>${esc(ex)}</code>?` : `Which flowchart symbol ${SYMBOLS[key][1]}?`,
        options: [{ text: SYMBOLS[key][0], ok: true, why: `Yes — this symbol ${SYMBOLS[key][1]}.` }, ...others.map(k => ({ text: SYMBOLS[k][0], why: `This symbol ${SYMBOLS[k][1]}.` }))]
      };
    } },
    { id: 'fc-trace-loop', kind: 'output', term: 'Trace', marks: 2, make(R) {
      const t = loopTemplate(R);
      return {
        prompt: `Trace the flowchart${t.input != null ? ` when the input is <code>${t.input}</code>` : ''}. What is output?${/x, y/.test(t.answer) || t.vars[1] === 'y' ? ' (Write the values on one line, separated by a space.)' : ''}`,
        visual: t.chart, run: t.py, answer: t.answer,
        explain: `<p>${t.story}</p><p>The same algorithm in Python:</p>` + P.pre(t.py)
      };
    } },
    { id: 'fc-trace-select', kind: 'output', term: 'State', marks: 1, make(R) {
      const t = selectChart(R);
      return {
        prompt: `Trace the flowchart when <code>${t.input}</code> is input. What is output?`,
        visual: t.chart, run: t.py, answer: t.answer,
        explain: `<p>${t.story}</p><p>The same algorithm in Python:</p>` + P.pre(t.py)
      };
    } },
    { id: 'fc-trace-table', kind: 'trace', term: 'Trace', marks: 3, make(R) {
      let t; do { t = loopTemplate(R); } while (t.rows.length > 6);
      const [v1, v2] = t.vars;
      return {
        prompt: `Complete the trace table for the flowchart${t.input != null ? ` with input <code>${t.input}</code>` : ''}. Each row shows the values each time the decision <code>${esc(t.cond)} ?</code> is checked.`,
        visual: t.chart,
        columns: [v1, v2, t.cond + ' ?'],
        rows: t.rows.map((r, i) => [{ v: String(r[v1]), given: i === 0 }, { v: String(r[v2]), given: i === 0 }, { v: py.b(r.cond), given: false }]),
        extra: [{ label: 'Output', v: t.answer }],
        check: { code: t.py, expect: t.answer },
        explain: `<p>${t.story}</p>` + P.pre(t.py)
      };
    } }
  ]);


  /* ===== Lesson tabs (Try it / Trace it): code and output questions for the start and B1 lessons ===== */
  P.add('start-2', [
    { id: 'first-code', kind: 'code', term: 'Construct', marks: 2, make(R) {
      const v = R.int(0, 2);
      if (v === 0) {
        const school = R.pick(['Hillside', 'Riverside', 'Lakeview', 'Northgate']), year = R.int(2026, 2029);
        return {
          prompt: `Create two variables: <code>school</code>, holding the text "${school}", and <code>year</code>, holding the whole number ${year}.`,
          starter: '# Create the two variables here\n',
          solution: `school = "${school}"  # text goes in quotes: a string\nyear = ${year}  # no quotes: a whole number, an int\n`,
          think: ['A variable is created by <b>assignment</b>: the name, then <code>=</code>, then the value.', `Text needs quotes, so <code>"${school}"</code> is a string. A number has no quotes — <code>"${year}"</code> in quotes would be a string, not an int.`],
          diagnose: [
            { match: '^school', checks: `that school holds the text "${school}"`, cause: `Write <code>school = "${school}"</code> — check the spelling, the capital letter and the quotes.` },
            { match: 'is the int', when: `year\\s*=\\s*["']`, checks: `that year holds the number ${year}`, cause: `With quotes, year is the string "${year}". Leave the quotes off a number.` },
            { match: '.', checks: `that year holds the whole number ${year}`, cause: `Write <code>year = ${year}</code>.` }],
          tests: [P.t(`school holds "${school}"`, 'school', school), P.t(`year is the int ${year}`, '[type(year).__name__, year]', ['int', year])].join('\n'),
          hint: 'Text goes in quotes; numbers don\'t.'
        };
      }
      if (v === 1) {
        const item = R.pick(['sandwich', 'juice', 'muffin', 'salad']), price = R.int(2, 6), qty = R.int(2, 5);
        return {
          prompt: `The canteen sells a ${item} for $${price}. Add one line that creates <code>total</code>, the cost of <code>quantity</code> ${item}s. Use the two variables, not the numbers.`,
          starter: `price = ${price}\nquantity = ${qty}\n# create total here\n`,
          solution: `price = ${price}  # the cost of one ${item}\nquantity = ${qty}  # how many are bought\ntotal = price * quantity  # * multiplies; using the variables means it works for any price or quantity\n`,
          think: ['The cost of several items is price × quantity. In Python, multiply with <code>*</code>.', 'Write it with the variable names, so the line still gives the right total if the price or quantity changes.'],
          diagnose: [
            { match: 'is an int', when: '/', checks: 'that total is a whole number', cause: 'You only need <code>*</code> here — dividing gives a float.' },
            { match: '.', when: 'total\\s*=\\s*price\\s*\\+', checks: `that total is ${price} × ${qty}`, cause: '<code>+</code> adds; to find the cost of several items, multiply with <code>*</code>.' },
            { match: '.', checks: `that total is ${price * qty}`, cause: 'Write <code>total = price * quantity</code>.' }],
          tests: [P.t(`total is ${price * qty}`, 'total', price * qty), P.t('total is an int', 'type(total).__name__', 'int')].join('\n'),
          hint: 'total = price * quantity'
        };
      }
      const name = R.pick(P.data.names);
      return {
        prompt: `<code>name</code> holds "${name}". Create <code>message</code>, holding <code>Hello, ${name}!</code>, by joining strings with <code>+</code> (use the variable <code>name</code>).`,
        starter: `name = "${name}"\n# create message here\n`,
        solution: `name = "${name}"  # a string\nmessage = "Hello, " + name + "!"  # + joins strings exactly, so the comma, space and ! must be in the quotes\n`,
        think: ['<code>+</code> between strings joins them with nothing in between, so every space and punctuation mark has to be written inside the quotes.', 'Use the variable, not the text "' + name + '", so the line works for any name.'],
        diagnose: [
          { match: '.', when: 'message\\s*=\\s*"Hello,"\\s*\\+', checks: 'the exact text, including the space', cause: 'There is no space after the comma: <code>+</code> adds nothing between strings. Write <code>"Hello, "</code> with the space inside the quotes.' },
          { match: '.', when: '"name"', checks: 'that the variable is used', cause: 'With quotes, <code>"name"</code> is the word name, not the variable. Leave the quotes off.' },
          { match: '.', checks: `that message is "Hello, ${name}!"`, cause: 'Write <code>message = "Hello, " + name + "!"</code>.' }],
        tests: [P.t(`message is "Hello, ${name}!"`, 'message', `Hello, ${name}!`), P.t('message ends with "!"', 'message[-1]', '!')].join('\n'),
        hint: 'message = "Hello, " + name + "!"'
      };
    } }
  ]);

  P.add('start-2', [
    { id: 'start-mcq', kind: 'mcq', term: 'State', marks: 1, make(R) {
      const n = R.pick(P.data.names), a = R.int(2, 9), b = R.int(2, 9);
      const QS = [
        [`What does <code>print("${n}", ${a})</code> show?`, `${n} ${a}`, [[`${n}${a}`, 'Commas in print add a space between the items.'], [`"${n}", ${a}`, 'print shows the values, not the quotes and commas you typed.'], [`${n}, ${a}`, 'The comma separates the items in the code; it isn\'t printed.']], 'Commas in print separate the items, and print puts one space between them.',
          ['print shows each item\'s value — no quotes, no commas.', 'Items separated by commas get one space between them.']],
        [`What does <code>print("${a}" + "${b}")</code> show?`, `${a}${b}`, [[String(a + b), 'With quotes these are strings, so + joins them — it doesn\'t add.'], [`${a} ${b}`, '+ joins strings with no space between them.'], ['An error', 'Joining two strings with + is allowed.']], `In quotes, "${a}" and "${b}" are strings; + joins strings exactly as they are.`,
          ['Look at the quotes: both values are strings.', '+ between strings joins them with nothing added in between.']],
        ['Which line is a <b>comment</b>?', '# total of the marks', [['print("# total")', 'The # is inside a string, so it\'s printed — it doesn\'t start a comment.'], ['total = 0', 'That is an assignment.'], ['"total of the marks"', 'A string on its own is a value, not a comment.']], 'A comment starts with # outside any string; Python ignores the rest of the line.',
          ['A comment starts with <code>#</code>…', '…but only when the # isn\'t inside quotes.']],
        [`What is the data type of <code>x</code> after <code>x = input("Age: ")</code>, if the user types ${a + 10}?`, 'str (a string)', [['int', 'input() always returns text, even if the user types digits.'], ['float', 'input() never converts — you must cast with float().'], ['bool', 'input() returns the text that was typed.']], 'input() always gives a string; use int() or float() to turn it into a number.',
          ['input() returns exactly what was typed, as text.', `So "${a + 10}" is a string until you cast it with <code>int()</code>.`]],
        ['Why does <code>Print("Hi")</code> crash with a NameError?', 'Python is case-sensitive, and only lower-case print exists', [['print needs single quotes', 'Single and double quotes both work.'], ['The brackets should be square', 'Function calls use round brackets.'], ['"Hi" must be a variable', 'Printing a string is fine.']], 'Print and print are different names; only print is built in.',
          ['A NameError means Python doesn\'t know a name.', 'Capital letters make a different name — <code>Print</code> isn\'t defined.']],
        [`What is the type of <code>${a}.5</code>?`, 'float', [['int', 'It has a decimal point, so it is not a whole number.'], ['str', 'There are no quotes around it.'], ['bool', 'Booleans are only True and False.']], 'A number with a decimal point is a float (IB: decimal).',
          ['No quotes, so it is a number, not a string.', 'It has a decimal point, so it is a float.']],
        ['Where does the output of <code>print</code> appear in CodeCraft?', 'In the console under the editor', [['In the Files tab', 'Files shows the virtual files, not printed output.'], ['In a pop-up window', 'Output goes to the console.'], ['Nowhere until the program is saved', 'Output appears as soon as you press Run.']], 'Run sends the program to Python; everything it prints appears in the console.',
          ['Press Run (or Ctrl+Enter).', 'Printed lines, input boxes and error messages all appear in the console.']],
        [`Which line stores the whole number ${a * 100} so it can be used in arithmetic?`, `pupils = ${a * 100}`, [[`pupils = "${a * 100}"`, 'The quotes make it a string.'], [`${a * 100} = pupils`, 'The variable name must be on the left of =.'], [`int pupils = ${a * 100}`, 'Python doesn\'t declare types like this.']], 'Assignment puts the name on the left and the value on the right; no quotes for a number.',
          ['In an assignment the variable name goes on the left of <code>=</code>.', 'A number without quotes is an int, ready for arithmetic.']]
      ];
      const [q, ok, wrong, why, steps] = R.pick(QS);
      return { prompt: q, options: [{ text: ok, ok: true, why }, ...wrong.map(w => ({ text: w[0], why: w[1] }))], steps };
    } }
  ]);

  P.add('B1.1.1', [
    { id: 'spec-code', kind: 'code', term: 'Construct', marks: 4, make(R) {
      const prices = [R.int(3, 6), R.int(3, 7), R.int(2, 5)], cost = l => { let t = 0, c = 0; for (const d of l) if (d >= 1 && d <= 3 && c < 3) { t += prices[d - 1]; c++; } return t; };
      const valid = [R.int(1, 3), R.int(1, 3)], bad = [R.int(1, 3), R.pick([0, 4, 7, 9]), R.pick([-1, 5, 6]), R.int(1, 3)], lim = [R.int(1, 3), R.int(1, 3), R.int(1, 3), R.int(1, 3), R.int(1, 3)];
      const cases = [['a valid order', valid], ['invalid dish numbers are ignored', bad], ['only the first 3 dishes count', lim], ['an empty order', []]];
      return {
        prompt: `<p>Specification for the canteen pre-order system:</p><ul><li><b>Constraint:</b> dishes 1, 2 and 3 cost $${prices[0]}, $${prices[1]} and $${prices[2]}; an order counts at most 3 dishes.</li><li><b>Input:</b> a list of dish numbers. <b>Output:</b> the total price.</li><li><b>Evaluation criteria:</b> (1) the total is correct; (2) numbers other than 1–3 are ignored; (3) only the first 3 valid dishes count.</li></ul><p>Write <code>order_total(dishes)</code> to meet it. <code>PRICES</code> is given.</p>`,
        starter: `PRICES = [${prices.join(', ')}]\n\ndef order_total(dishes):\n    pass\n`,
        solution: `PRICES = [${prices.join(', ')}]  # constraint: prices of dishes 1, 2 and 3\n\ndef order_total(dishes):  # input: a list of dish numbers\n    total = 0  # running total of the price\n    count = 0  # how many dishes have been accepted\n    for d in dishes:  # look at each dish number in order\n        if d >= 1 and d <= 3 and count < 3:  # criterion 2 (a real dish) and criterion 3 (the limit)\n            total = total + PRICES[d - 1]  # dish 1 is at index 0, so subtract 1\n            count = count + 1  # one more dish accepted\n    return total  # output: the total price\n`,
        think: ['Each evaluation criterion is a test your function must pass — read them as a checklist.', 'Loop over the dish numbers, keeping a running total and a count of dishes accepted.', 'Accept a dish only if it is 1–3 <b>and</b> fewer than 3 dishes have been accepted.', 'Prices are in a list starting at index 0, so dish d costs <code>PRICES[d - 1]</code>.'],
        diagnose: [
          { match: '.', when: 'PRICES\\[d\\]', checks: 'the price of each dish', cause: 'Dish 1 is at index 0, so use <code>PRICES[d - 1]</code>.' },
          { match: 'invalid', checks: 'that numbers other than 1–3 are ignored (criterion 2)', cause: 'Only add a dish when <code>d &gt;= 1 and d &lt;= 3</code>. Without that check, 0 or 4 either crash or pick the wrong price.' },
          { match: 'first 3', checks: 'that only the first 3 valid dishes count (criterion 3)', cause: 'Keep a count of dishes accepted and only add while <code>count &lt; 3</code>.' },
          { match: 'empty', checks: 'that an empty order costs 0', cause: 'Start the total at 0 and return it after the loop.' },
          { match: '.', checks: 'the total of a valid order (criterion 1)', cause: 'Add <code>PRICES[d - 1]</code> for each valid dish, and return the total after the loop.' }],
        tests: cases.map(([label, l]) => P.t(`${label}: order_total(${py.r(l)}) is ${cost(l)}`, `order_total(${py.r(l)})`, cost(l))).join('\n'),
        hint: 'Loop over the dishes; add PRICES[d - 1] only for 1–3, and stop counting after 3.'
      };
    } },
    { id: 'spec-output', kind: 'output', term: 'Determine', marks: 3, make(R) {
      const prices = [R.int(3, 6), R.int(3, 7), R.int(2, 5)];
      const orders = R.shuffle([R.int(1, 3), R.int(1, 3), R.pick([0, 4, 5, 7]), R.int(1, 3), R.int(1, 3)]);
      let total = 0, count = 0; const out = [], story = [];
      for (const d of orders) {
        if (d < 1 || d > 3) { out.push(`Rejected ${d}`); story.push(`${d} isn't a dish: rejected`); }
        else if (count === 3) { out.push('Limit reached'); story.push(`${d} is valid but 3 dishes are already in the order`); }
        else { total += prices[d - 1]; count++; story.push(`dish ${d} adds $${prices[d - 1]} (total ${total}, count ${count})`); }
      }
      out.push(`${count} ${total}`);
      return {
        prompt: 'This program implements the canteen specification (prices, at most 3 dishes, invalid numbers rejected). What does it print?',
        code: `PRICES = [${prices.join(', ')}]\nMAX = 3\norders = ${py.r(orders)}\ntotal = 0\ncount = 0\nfor d in orders:\n    if d < 1 or d > 3:\n        print("Rejected", d)\n    elif count == MAX:\n        print("Limit reached")\n    else:\n        total = total + PRICES[d - 1]\n        count = count + 1\nprint(count, total)`,
        answer: out.join('\n'),
        explain: P.list(story) + `<p>Finally it prints the count and the total: ${count} ${total}. Each branch matches a part of the specification — that's how a trace table shows the evaluation criteria are met.</p>`
      };
    } }
  ]);

  P.add('B1.1.2-3', [
    { id: 'ct-code', kind: 'code', term: 'Construct', marks: 3, make(R) {
      const hi = R.pick([70, 75, 80]), mid = R.pick([50, 55, 60]), v = R.int(0, 1);
      const band = a => (a >= hi ? 'A' : a >= mid ? 'B' : 'C');
      const BAND = `def band(avg):  # already written: turns an average into A, B or C\n    if avg >= ${hi}:  # highest boundary first\n        return "A"  # top band\n    elif avg >= ${mid}:  # only tested if below ${hi}\n        return "B"  # middle band\n    return "C"  # everything else\n`;
      if (v === 0) {
        const avgs = [R.int(85, 99), R.int(mid, hi - 1), R.int(20, mid - 1), hi, mid];
        return {
          prompt: `A report program has been <b>decomposed</b> into parts. Write the part <code>band(avg)</code>: return "A" for an average of ${hi} or more, "B" for ${mid} or more, otherwise "C".`,
          starter: 'def band(avg):\n    pass\n',
          solution: BAND,
          think: ['Decomposition gives this part one clear job: input an average, output a letter.', 'Test the highest boundary first, so the first true test is the right band.', '<code>&gt;=</code> because the boundary value itself belongs to the higher band.'],
          diagnose: [
            { match: `band\\(${hi}\\)|band\\(${mid}\\)`, checks: 'a value exactly on a boundary', cause: 'The boundary belongs to the higher band: use <code>&gt;=</code>, not <code>&gt;</code>.' },
            { match: '.', when: `avg\\s*>=\\s*${mid}\\s*:[\\s\\S]*avg\\s*>=\\s*${hi}`, checks: 'the order of the tests', cause: `Test ${hi} before ${mid}, or every average of ${mid}+ gets a B.` },
            { match: '.', checks: 'the band for each average', cause: `Return "A" when avg &gt;= ${hi}, "B" when avg &gt;= ${mid}, otherwise "C".` }],
          tests: avgs.map(a => P.t(`band(${a}) is "${band(a)}"`, `band(${a})`, band(a))).join('\n'),
          hint: `if avg >= ${hi}: return "A" … elif avg >= ${mid}: return "B" … return "C"`
        };
      }
      const lists = [Array.from({ length: 5 }, () => R.int(30, 99)), Array.from({ length: 4 }, () => R.int(30, 99))], letter = R.pick(['A', 'B', 'C']);
      const cnt = (l, x) => l.filter(a => band(a) === x).length;
      return {
        prompt: `<b>Pattern recognition:</b> the same "band" step is needed for every student, and <code>band(avg)</code> is already written. Write <code>count_band(avgs, letter)</code> that returns how many averages in the list are in that band — by <b>calling</b> <code>band</code>, not copying its code.`,
        starter: BAND.replace(/  # [^\n]*/g, '') + '\n\ndef count_band(avgs, letter):\n    pass\n',
        solution: BAND + `\n\ndef count_band(avgs, letter):  # a list of averages and a band letter\n    count = 0  # none counted yet\n    for a in avgs:  # the same step for every average\n        if band(a) == letter:  # reuse the solved part instead of repeating its code\n            count = count + 1  # this average is in the band\n    return count  # after checking them all\n`,
        think: ['The work for one average is already solved by <code>band</code>; this part just repeats it for every average and counts.', 'Call <code>band(a)</code> inside the loop and compare its result with <code>letter</code>.', 'This is the count pattern: start at 0, add 1 on a match, return after the loop.'],
        diagnose: [
          { match: '.', when: '^\\s{8,}return\\s+count', checks: 'counting every average', cause: 'Your <code>return</code> is inside the loop, so only the first average is checked.' },
          { match: '.', when: '(?<![\\s\\S])(?![\\s\\S]*band\\(a\\)|[\\s\\S]*band\\(\\w+\\)\\s*==)', checks: 'that band is reused', cause: 'Call <code>band(a)</code> for each average and compare the letter it returns.' },
          { match: '.', checks: 'the number of averages in the band', cause: 'Start at 0, add 1 when <code>band(a) == letter</code>, and return the count after the loop.' }],
        tests: lists.map(l => P.t(`count_band(${py.r(l)}, "${letter}") is ${cnt(l, letter)}`, `count_band(${py.r(l)}, "${letter}")`, cnt(l, letter))).concat([P.t(`count_band([], "${letter}") is 0`, `count_band([], "${letter}")`, 0)]).join('\n'),
        hint: 'Loop over avgs, call band(a), count the matches.'
      };
    } },
    { id: 'ct-output', kind: 'output', term: 'Determine', marks: 3, make(R) {
      const hi = R.pick([70, 75]), mid = R.pick([50, 55]);
      const names = R.sample(P.data.names, 3);
      const recs = names.map(n => { const m = [R.int(40, 99), R.int(40, 99)]; let last = R.int(40, 99); last -= (m[0] + m[1] + last) % 3; return [n, [m[0], m[1], last]]; });
      const avg = l => (l[0] + l[1] + l[2]) / 3, band = a => (a >= hi ? 'A' : a >= mid ? 'B' : 'C');
      const out = recs.map(([n, l]) => `${n} ${py.f(avg(l))} ${band(avg(l))}`);
      return {
        prompt: 'This program was <b>decomposed</b> into two functions, then a loop applies them to every student (<b>pattern recognition</b>). What does it print?',
        code: `def average(marks):\n    total = 0\n    for m in marks:\n        total = total + m\n    return total / len(marks)\n\n\ndef band(avg):\n    if avg >= ${hi}:\n        return "A"\n    elif avg >= ${mid}:\n        return "B"\n    return "C"\n\n\nstudents = ${py.r(recs)}\nfor record in students:\n    avg = average(record[1])\n    print(record[0], avg, band(avg))`,
        answer: out.join('\n'),
        explain: P.list(recs.map(([n, l]) => `${n}: (${l.join(' + ')}) / 3 = ${py.f(avg(l))} → ${band(avg(l))}`)) + '<p><code>/</code> always gives a float, so each average prints with <code>.0</code>.</p>'
      };
    } }
  ]);

  P.add('B1.1.4', [
    { id: 'fc-code', kind: 'code', term: 'Construct', marks: 3, make(R) {
      if (R.chance(0.5)) {
        const price = R.int(8, 14), lim = R.int(12, 16), d = R.int(2, 5);
        const nodes = [{ id: 's', type: 'term', text: 'Start', c: 0, r: 0 }, { id: 'p', type: 'proc', text: `price = ${price}`, c: 0, r: 1 }, { id: 'i', type: 'io', text: 'INPUT age', c: 0, r: 2 },
          { id: 'd', type: 'dec', text: `age < ${lim} ?`, c: 0, r: 3 }, { id: 'x', type: 'proc', text: `price = price - ${d}`, c: 0, r: 4 }, { id: 'o', type: 'io', text: 'OUTPUT price', c: 0, r: 5 }, { id: 'e', type: 'term', text: 'End', c: 0, r: 6 }];
        const edges = [{ a: 's', b: 'p' }, { a: 'p', b: 'i' }, { a: 'i', b: 'd' }, { a: 'd', b: 'x', label: 'Yes' }, { a: 'x', b: 'o' }, { a: 'd', b: 'o', from: 'right', to: 'right', label: 'No', via: [[0.82, 3], [0.82, 5]] }, { a: 'o', b: 'e' }];
        const f = a => (a < lim ? price - d : price), ages = [lim - R.int(1, 5), lim, lim + R.int(1, 9), R.int(5, 9)];
        return {
          prompt: `Write <code>ticket_price(age)</code> so that it does what this flowchart does. The INPUT becomes the parameter and the OUTPUT becomes the value you <b>return</b>.`,
          visual: P.flowchart(nodes, edges),
          starter: 'def ticket_price(age):\n    pass\n',
          solution: `def ticket_price(age):  # INPUT age becomes the parameter\n    price = ${price}  # process box: price = ${price}\n    if age < ${lim}:  # decision diamond; Yes leads to the discount box\n        price = price - ${d}  # process box on the Yes path\n    return price  # OUTPUT price — the No path skips straight here\n`,
          think: ['Follow the arrows from Start and turn each symbol into one line, in the same order.', 'The decision becomes an <code>if</code>. Its Yes path holds the discount box; the No path goes straight to OUTPUT, so there is no <code>else</code>.', 'OUTPUT becomes <code>return</code>, after the <code>if</code>, because both paths reach it.'],
          diagnose: [
            { match: `ticket_price\\(${lim}\\)`, checks: `an age of exactly ${lim}`, cause: `The diamond asks <code>age &lt; ${lim}</code>; ${lim} itself takes the No path. Use <code>&lt;</code>, not <code>&lt;=</code>.` },
            { match: '.', when: '^\\s{8,}return', checks: 'both paths reaching OUTPUT', cause: 'The OUTPUT box is reached from both paths, so <code>return price</code> goes after the <code>if</code>, not inside it.' },
            { match: '.', checks: 'the price for each age', cause: `Start with price = ${price}; subtract ${d} only if age &lt; ${lim}; then return price.` }],
          tests: ages.map(a => P.t(`ticket_price(${a}) is ${f(a)}`, `ticket_price(${a})`, f(a))).join('\n'),
          hint: `price = ${price}; if age < ${lim}: price = price - ${d}; return price`
        };
      }
      const s = R.int(1, 3), f = n => { let t = 0, c = 1; while (c <= n) { t += c; c += s; } return t; }, ns = [R.int(4, 9), R.int(10, 15), 1, 0];
      return {
        prompt: `Write <code>flow_total(n)</code> so that it does what this flowchart does. The INPUT becomes the parameter; return the value that is OUTPUT.`,
        visual: loopChart(['INPUT n', 'total = 0', 'count = 1'], 'count <= n ?', ['total = total + count', `count = count + ${s}`], 'OUTPUT total'),
        starter: 'def flow_total(n):\n    pass\n',
        solution: `def flow_total(n):  # INPUT n becomes the parameter\n    total = 0  # process box: total = 0\n    count = 1  # process box: count = 1\n    while count <= n:  # the diamond has an arrow back up to it, so it is a loop\n        total = total + count  # first box on the Yes path\n        count = count + ${s}  # last box before the arrow goes back up\n    return total  # the No exit leads to OUTPUT total\n`,
        think: ['An arrow that goes back <b>up</b> to a decision means a loop: <code>while</code> the answer is Yes.', 'The boxes on the Yes path become the indented loop body, in the order the arrows go.', 'The No exit leads to OUTPUT, after the loop.'],
        diagnose: [
          { match: 'flow_total\\(0\\)', checks: 'n = 0, where the loop never runs', cause: 'With n = 0 the diamond says No straight away, so the output is the starting total, 0.' },
          { match: '.', when: 'count\\s*<\\s*n', checks: 'the loop condition', cause: 'The diamond asks <code>count &lt;= n</code> — the last value is included.' },
          { match: '.', when: '^\\s{8,}return', checks: 'the output after the loop', cause: '<code>return total</code> belongs after the loop (the No exit), not inside it.' },
          { match: '.', checks: 'the total the flowchart outputs', cause: `Set total = 0 and count = 1; while count &lt;= n, add count to total then add ${s} to count; return total.` }],
        tests: ns.map(n => P.t(`flow_total(${n}) is ${f(n)}`, `flow_total(${n})`, f(n))).join('\n'),
        hint: 'while count <= n: total = total + count; count = count + …'
      };
    } }
  ]);

})(CodeCraft.practice);
