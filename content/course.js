/* Course map — every module and lesson from BUILD_PLAN.md, in the textbook's teaching order.
   Lesson bodies (notes, examples, exercises, trace tables, quizzes) are added by the other content/*.js files
   through CodeCraft.addLessons({...}); this file only says what exists and what each lesson must cover. */
window.CodeCraft = window.CodeCraft || {};

CodeCraft.course = {
  modules: [
    {
      id: 'm0', num: 0, ref: 'Start', title: 'Getting started', page: null,
      lessons: [
        { id: 'start-1', ref: 'Start', title: 'How CodeCraft works',
          blurb: 'Run code, answer input() prompts in the console, read files and see how tests are marked.',
          must: ['The Run button and the console', 'Answering input() inside the console', 'The Files panel', 'How auto-graded tests are marked'] },
        { id: 'start-2', ref: 'Start', title: 'Your first program',
          blurb: 'print(), comments, and why Python never makes you declare a variable.',
          must: ['print()', 'Comments', "Why Python doesn't declare variables", 'Exam tip: name the data type in a comment'] }
      ]
    },
    {
      id: 'm1', num: 1, ref: 'B1.1', title: 'Computational thinking', page: 282,
      lessons: [
        { id: 'B1.1.1', ref: 'B1.1.1', title: 'Problem specifications',
          blurb: 'Pin down exactly what a program must do before writing any of it.',
          must: ['Problem statement', 'Constraints and limitations', 'Objectives and goals', 'Input and output specifications', 'Evaluation criteria', 'Write a spec for a canteen order system'] },
        { id: 'B1.1.2-3', ref: 'B1.1.2–3', title: 'The four concepts',
          blurb: 'Abstraction, algorithmic design, decomposition and pattern recognition — and where each is used.',
          must: ['Abstraction', 'Algorithmic design', 'Decomposition', 'Pattern recognition', 'Uses in software development, data analysis, machine learning, database design and network security'] },
        { id: 'B1.1.4', ref: 'B1.1.4', title: 'Tracing flowcharts',
          blurb: 'Read the standard flowchart symbols, predict the output, then see the same algorithm in Python.',
          must: ['Start/End, Process, Input/Output, Decision, Flowline and Connector symbols', 'Trace a flowchart and predict its output', 'The same algorithm in Python'] }
      ]
    },
    {
      id: 'm2', num: 2, ref: 'B2.1', title: 'Fundamentals · part 1', page: 296,
      lessons: [
        { id: 'B2.1.1', ref: 'B2.1.1', title: 'Variables & data types',
          blurb: 'Boolean, char, decimal, integer and string — plus casting and the arithmetic operators.',
          must: ['Boolean, char, decimal (float), integer, string', 'Assignment and type()', 'Casting with int(), float(), str()', 'Global vs local variables (preview)', 'Operators + - * / // % **'] },
        { id: 'B2.1.2', ref: 'B2.1.2', title: 'Substrings',
          blurb: 'Index, slice and search strings — then do it again without the built-ins.',
          must: ['Indexing and negative indexes', 'Slicing s[a:b]', 'len() and concatenation', '.upper() .lower() .replace() .find() .split() .strip()', 'The in operator', 'No built-ins: reverse a string, count a character'] }
      ]
    },
    {
      id: 'm3', num: 3, ref: 'B2.3', title: 'Programming constructs', page: null,
      lessons: [
        { id: 'B2.3.1', ref: 'B2.3.1', title: 'Sequence',
          blurb: 'Why the order of instructions matters, and how programs get stuck.',
          must: ['Instruction order changes the result (the swap bug)', 'Avoiding infinite loops', 'Deadlock (concept)', 'Incorrect output'] },
        { id: 'B2.3.2', ref: 'B2.3.2', title: 'Selection',
          blurb: 'Make a program choose with if, elif and else — then turn exam scores into IB grades.',
          must: ['if / elif / else and nested ifs', 'Relational operators < <= > >= == !=', 'Boolean operators and, or, not', 'Example: IB grade boundaries 1–7'] },
        { id: 'B2.3.3', ref: 'B2.3.3', title: 'Loops',
          blurb: 'Counted loops vs conditional loops, and the patterns every exam asks for.',
          must: ['Counted (for … in range) vs conditional (while) loops', 'Choosing the right loop', 'Conditions inside loops', 'Input validation loop', 'Running total, count and maximum'] },
        { id: 'B2.3.4', ref: 'B2.3.4', title: 'Functions & modularization',
          blurb: 'Split a program into functions with parameters and return values.',
          must: ['def, parameters and return', 'Local vs global scope', 'The global keyword and why to avoid it', 'Benefits of modular code', 'Refactor a long program into functions'] }
      ]
    },
    {
      id: 'm4', num: 4, ref: 'B2.1', title: 'Fundamentals · part 2', page: 333,
      lessons: [
        { id: 'B2.1.3', ref: 'B2.1.3', title: 'Exception handling',
          blurb: 'Stop bad input and missing files from crashing your program.',
          must: ['Points of failure: unexpected input, missing resources, logic errors', 'try / except / finally', 'ValueError, ZeroDivisionError, FileNotFoundError, IndexError', 'A robust number-input function'] },
        { id: 'B2.1.4', ref: 'B2.1.4', title: 'Debugging',
          blurb: 'Trace tables, print debugging and stepping through code line by line.',
          must: ['Trace tables', 'Print-statement debugging', 'Breakpoints and step-by-step execution', 'Find-the-bug exercises'] }
      ]
    },
    {
      id: 'm5', num: 5, ref: 'B2.2', title: 'Data structures', page: 342,
      lessons: [
        { id: 'B2.2.1', ref: 'B2.2.1', title: 'Static vs dynamic',
          blurb: 'Fixed-size arrays vs lists that grow, and the trade-offs between them.',
          must: ['Memory allocation and resizing', 'Speed, memory and flexibility trade-offs', 'Python lists are dynamic', 'Simulating a static array with [None] * size'] },
        { id: 'B2.2.2', ref: 'B2.2.2', title: '1D and 2D lists',
          blurb: 'Store, change and loop through lists — including grids like a seating plan.',
          must: ['Create, index, append, insert, remove, pop', 'Traverse with loops', '2D lists as grids (seating plan, marks table)', 'Row and column totals', 'No built-ins: max, min, sum, length'] },
        { id: 'B2.2.3', ref: 'B2.2.3', title: 'Stacks (LIFO)',
          blurb: 'push, pop, peek and isEmpty — first as a fixed array with topIndex, then as a list.',
          must: ['push, pop, peek, isEmpty (+ isFull)', 'Static array with topIndex = -1', 'Overflow and underflow', 'Python-list version', 'Uses: undo, back button, bracket matching'] },
        { id: 'B2.2.4', ref: 'B2.2.4', title: 'Queues (FIFO)',
          blurb: 'enqueue, dequeue and front — with front/rear pointers and circular queues.',
          must: ['enqueue, dequeue, front, isEmpty', 'Array version with front and rear pointers', 'Why a circular queue helps', 'List version and why pop(0) is slow', 'Uses: print queue, canteen line, task scheduling'] }
      ]
    },
    {
      id: 'm6', num: 6, ref: 'B2.4', title: 'Algorithms', page: 358,
      lessons: [
        { id: 'B2.4.1', ref: 'B2.4.1', title: 'Big O',
          blurb: 'Measure how an algorithm slows down as the data grows.',
          must: ['O(1), O(log n), O(n), O(n²)', 'Time vs space complexity', 'Counting operations', 'Choosing algorithms that scale'] },
        { id: 'B2.4.2', ref: 'B2.4.2', title: 'Linear & binary search',
          blurb: 'Two ways to find an item, traced step by step with low, mid and high.',
          must: ['Linear and binary search, implemented and traced', 'Binary search needs sorted data', 'Efficiency comparison', 'Phone-book example'] },
        { id: 'B2.4.3', ref: 'B2.4.3', title: 'Bubble & selection sort',
          blurb: 'Sort a list pass by pass — with no built-ins allowed.',
          must: ['Bubble and selection sort, traced pass by pass', 'Time O(n²), space O(1)', 'Early-exit bubble sort', 'Nearly-sorted vs random data', 'No built-ins'] }
      ]
    },
    {
      id: 'm7', num: 7, ref: 'B2.5', title: 'File processing', page: 378,
      lessons: [
        { id: 'B2.5.1', ref: 'B2.5.1', title: 'Text files',
          blurb: 'Read, write and append text files, and parse CSV-style lines.',
          must: ['open() modes r, w, a', 'read(), readline(), readlines() and looping over lines', 'write(), close() and with', 'Parse CSV-style lines with split(",")', 'Handle a missing file with try / except'] }
      ]
    },
    {
      id: 'm8', num: 8, ref: 'B3.1', title: 'OOP · a single class', page: 394,
      lessons: [
        { id: 'B3.1.1', ref: 'B3.1.1', title: 'OOP fundamentals',
          blurb: 'Classes, objects and the big ideas of object-oriented programming.',
          must: ['Classes and objects', 'Inheritance, encapsulation and polymorphism (concept level)', 'Advantages and disadvantages of OOP'] },
        { id: 'B3.1.2', ref: 'B3.1.2', title: 'Designing classes & UML',
          blurb: 'Draw a UML class diagram, then turn it into Python.',
          must: ['UML class diagram: name, attributes, methods', '- private and + public', 'Design a Book class, then code it'] },
        { id: 'B3.1.3', ref: 'B3.1.3', title: 'Static vs non-static',
          blurb: 'Instance variables, class variables and static methods.',
          must: ['Instance variables (self.x) vs class variables (Student.count)', '@staticmethod', 'When to use each'] },
        { id: 'B3.1.4', ref: 'B3.1.4', title: 'Classes & constructors',
          blurb: 'Write a class with __init__, create objects and call their methods.',
          must: ['class, __init__ and self', 'Creating objects and calling methods', '__str__'] },
        { id: 'B3.1.5', ref: 'B3.1.5', title: 'Encapsulation',
          blurb: 'Private attributes, getters and setters, and why information hiding matters.',
          must: ['Private attributes with __name', 'Getters and setters with validation', 'Why limiting access protects an object\'s state'] }
      ]
    },
    {
      id: 'm9', num: 9, ref: 'Review', title: 'Review', page: null,
      lessons: [
        { id: 'review-1', ref: 'Review', title: 'Mixed exam practice',
          blurb: 'Ten exam-style questions from every SL topic — multiple choice, trace tables, construct and written answers — each marked with its reasoning.',
          must: ['Trace tables', '"Construct a program" questions', '"Describe" and "state" questions', 'Mark-scheme-style feedback'] },
        { id: 'review-2', ref: 'Review', title: 'Paper 2 mock',
          blurb: 'A timed Paper 2: three structured questions, 50 marks, 1 hour 15 minutes — then marked part by part.',
          must: ['Three structured questions: algorithms, arrays, a class', '1 hour 15 minutes, 50 marks', 'Marked against a mark scheme'] },
        { id: 'review-3', ref: 'Review', title: 'Progress dashboard',
          blurb: 'Your completion per module, accuracy per topic and per type of question, weakest topics and mock results.',
          must: ['Percent complete per module', 'Weakest topics', 'Quiz scores'] }
      ]
    }
  ]
};

/* Lookups used across the app. */
CodeCraft.allLessons = function () {
  return CodeCraft.course.modules.flatMap(m => m.lessons.map(l => Object.assign({ module: m }, l)));
};
CodeCraft.findLesson = function (id) {
  return CodeCraft.allLessons().find(l => l.id === id) || null;
};
/* "B2.3.2 Selection", or just "How CodeCraft works" for lessons without a syllabus ref. */
CodeCraft.lessonLabel = function (l) {
  return /^B\d/.test(l.ref) ? l.ref + ' ' + l.title : l.title;
};

/* Lesson bodies get registered here by content files. */
CodeCraft.lessons = CodeCraft.lessons || {};
CodeCraft.addLessons = function (map) { Object.assign(CodeCraft.lessons, map); };
