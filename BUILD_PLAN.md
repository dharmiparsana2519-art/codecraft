# Build plan — topic map and lesson specs

Source: IB Computer Science Guide (first assessment 2027), Theme B, SL hours: B1 = 5h, B2 = 40h, B3 = 7h.
Lessons follow the **textbook's order** (it teaches B2.3 between the two halves of B2.1). Page numbers = Hodder textbook.

Each lesson page has the same parts:
1. **Learn** — short explanation with key terms highlighted, plus 1–3 runnable examples.
2. **Try it** — 2–4 auto-graded coding exercises (starter code, hints, model solution unlocked after 2 attempts).
3. **Trace it** — a trace-table exercise where the learner fills in variable values row by row (auto-checked).
4. **Check** — 5-question quiz with explanations for every option.
5. Syllabus tag (e.g. `B2.2.3`) and textbook page link shown at the top.

---

## Module 0 — Getting started
- How the site works: run button, console, `input()`, Files panel, how tests are marked.
- First program: `print`, comments, why Python doesn't declare variables (textbook tip: name the data type in a comment for exams).

## Module 1 — B1.1 Approaches to computational thinking (textbook p.282)
| Ref | Lesson | Must include |
|---|---|---|
| B1.1.1 | Problem specifications | Problem statement, constraints/limitations, objectives/goals, input spec, output spec, evaluation criteria. Exercise: fill a spec for "canteen order system". |
| B1.1.2–3 | The four concepts | Abstraction, algorithmic design, decomposition, pattern recognition. Real-world examples: software dev, data analysis, ML, database design, network security. Drag-and-match quiz. |
| B1.1.4 | Tracing flowcharts | Standard symbols: Start/End, Process, Input/Output, Decision, Flowline, Connector. Interactive SVG flowcharts; learner traces and predicts output, then sees the same algorithm in Python. |

## Module 2 — B2.1 Programming fundamentals, part 1 (p.296)
| B2.1.1 | Variables & data types | Boolean, char (a 1-length `str` in Python), decimal (`float`), integer, string. Assignment, `type()`, casting with `int()`/`float()`/`str()`, global vs local variables (preview; full scope in B2.3.4). Operators: `+ - * / // % **`. |
| B2.1.2 | Substrings | Indexing, negative indexes, slicing `s[a:b]`, `len`, concatenation, `.upper() .lower() .replace() .find() .split() .strip()`, `in`. "No built-ins" variant: reverse a string or count a character with a loop. |

## Module 3 — B2.3 Programming constructs
| B2.3.1 | Sequence | Instruction order changes the result (swap two variables bug). Avoiding infinite loops, deadlock (concept only), incorrect output. |
| B2.3.2 | Selection | `if / elif / else`, nested ifs, relational `< <= > >= == !=`, Boolean `and or not`. Example: IB grade boundaries 1–7. |
| B2.3.3 | Loops | Counted (`for ... in range`) vs conditional (`while`); choosing the right one; conditions inside loops; input validation loop; running total, count, max. |
| B2.3.4 | Functions & modularization | `def`, parameters, `return`, local vs global scope, the `global` keyword and why to avoid it, benefits of modular code. Exercise: refactor a long program into functions. |

## Module 4 — B2.1 Programming fundamentals, part 2 (p.333)
| B2.1.3 | Exception handling | Points of failure: unexpected input, resource unavailable (missing file), logic errors. `try / except / finally`, catching `ValueError`, `ZeroDivisionError`, `FileNotFoundError`, `IndexError`. Robust number-input function. |
| B2.1.4 | Debugging | Trace tables (main skill — several trace exercises), print-statement debugging, breakpoints and step-by-step execution (build a "step" mode that highlights each line and shows variables, or explain with an animated walkthrough). "Find the bug" exercises. |

## Module 5 — B2.2 Data structures (p.342)
| B2.2.1 | Static vs dynamic | Memory allocation and resizing; speed, memory, flexibility trade-offs. Python lists are dynamic; simulate a static array with `[None] * size`. Comparison table quiz. |
| B2.2.2 | 1D and 2D lists | Create, index, add (`append`, `insert`), remove (`remove`, `pop`), traverse with loops; 2D lists as grids (seating plan, marks table), nested loops, row/column totals. "No built-ins" variants for max, min, sum, length. |
| B2.2.3 | Stacks (LIFO) | push, pop, peek, isEmpty (+ isFull for the array version). Textbook version: fixed array + `topIndex = -1`, overflow/underflow. Then list version. Uses: undo, back button, bracket matching. Performance and memory notes. **Animated stack visualizer.** |
| B2.2.4 | Queues (FIFO) | enqueue, dequeue, front, isEmpty. Array version with front/rear pointers (and why a circular queue helps), list version and why `pop(0)` is slow. Uses: print queue, canteen line, task scheduling. **Animated queue visualizer.** |

## Module 6 — B2.4 Programming algorithms (p.358)
| B2.4.1 | Big O | O(1), O(log n), O(n), O(n²); time vs space complexity; counting operations; choosing algorithms for scalability. Interactive chart of growth rates. |
| B2.4.2 | Linear & binary search | Both implemented and traced; binary search needs sorted data; efficiency comparison; phone-book example from the guide (search by name in sorted list vs by number). **Step-through visualizer** showing low/mid/high. |
| B2.4.3 | Bubble & selection sort | Both implemented and traced pass by pass; time O(n²), space O(1); early-exit bubble sort; pros/cons on nearly-sorted vs random data. **Sorting visualizer** with step, play, comparison counter. "No built-ins" always on here. |
| (HL) | Recursion | "Beyond SL" box only. |

## Module 7 — B2.5 File processing (p.378)
| B2.5.1 | Text files | `open()` modes `r`, `w`, `a`; `read()`, `readline()`, `readlines()`, iterating lines, `write()`, `close()`, `with`. Parse CSV-style lines with `split(",")`. Handle a missing file with try/except. Exercises use pre-loaded virtual files (e.g. `scores.txt`, `library.txt`). |

## Module 8 — B3.1 OOP for a single class (p.394)
| B3.1.1 | OOP fundamentals | Classes, objects, inheritance, encapsulation, polymorphism (concept level at SL); advantages and disadvantages of OOP. |
| B3.1.2 | Designing classes & UML | UML class diagram: name / attributes / methods, `-` private and `+` public. Exercise: design a `Book` class from requirements, then code it. Render UML boxes in HTML. |
| B3.1.3 | Static vs non-static | Instance variables (`self.x`) vs class variables (`Student.count`); `@staticmethod`; when to use each. |
| B3.1.4 | Classes & constructors | `class`, `__init__`, `self`, creating objects, calling methods, `__str__`. |
| B3.1.5 | Encapsulation | Private attributes with `__name`, getters/setters with validation, why limiting access protects an object's state. |

## Module 9 — Review
- Mixed exam-style practice: trace tables, "construct a program", "describe", "compare". Mark-scheme-style feedback.
- A "Paper 2 sprint" mode: 10 random questions across all modules, timed.
- Progress dashboard: percent complete per module, weakest topics, quiz scores.
