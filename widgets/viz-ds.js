/* widgets/viz-ds.js — stack and queue visualizers (B2.2.3, B2.2.4): the textbook's fixed-size array versions.
   CodeCraft.viz.stack(host, { load(code) }) and CodeCraft.viz.queue(host, { load(code) }).
   You type your own values; every operation says what it checks and what it changes (overflow and underflow
   included), and the operations so far can be run in the editor as real Python using the same classes as the notes. */
window.CodeCraft = window.CodeCraft || {};

(function (CC) {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ICON = n => `<svg class="ic" aria-hidden="true"><use href="#i-${n}"/></svg>`;
  // A typed value as Python: a number stays a number, anything else becomes a string.
  const pyVal = v => (/^-?\d+(\.\d+)?$/.test(v) ? v : JSON.stringify(v));
  const show = v => (v === null ? 'None' : /^-?\d+(\.\d+)?$/.test(v) ? v : `"${v}"`);
  const B = x => (x ? 'True' : 'False');
  CC.viz = CC.viz || {};

  const STACK_PY = `class Stack:
    def __init__(self, size):
        self.items = [None] * size
        self.topIndex = -1
        self.size = size

    def isEmpty(self):
        return self.topIndex == -1

    def isFull(self):
        return self.topIndex == self.size - 1

    def push(self, item):
        if self.isFull():
            print("Stack overflow")
        else:
            self.topIndex = self.topIndex + 1
            self.items[self.topIndex] = item

    def pop(self):
        if self.isEmpty():
            print("Stack underflow")
            return None
        item = self.items[self.topIndex]
        self.topIndex = self.topIndex - 1
        return item

    def peek(self):
        if self.isEmpty():
            return None
        return self.items[self.topIndex]
`;

  function frame(host, cls, title, help, controls) {
    host.innerHTML = `<section class="viz ${cls}" aria-label="${esc(title)}">
      <header class="viz-head"><span class="viz-tag">${ICON('target')}Visualizer</span><h4>${title}</h4><p>${help}</p></header>
      <div class="viz-controls">${controls}</div>
      <div class="viz-stage"></div>
      <p class="viz-say" aria-live="polite"></p>
      <details class="viz-code"><summary>Your operations as Python</summary><pre class="q-code viz-py"></pre>
        <button class="btn sm" type="button" data-run>${ICON('play')}Run them in the editor</button></details>
    </section>`;
    return host.querySelector('.viz');
  }

  /* ---------------- stack ---------------- */
  CC.viz.stack = function (host, opts = {}) {
    const root = frame(host, 'viz-stack', 'Stack: a fixed-size array with topIndex', 'Type a value and push it, then pop, peek and test the stack. The array never changes size — only <code>topIndex</code> moves.',
      `<label class="viz-field">Size <input type="number" min="2" max="10" value="5" data-size aria-label="Stack size"></label>
       <button class="btn sm" type="button" data-new>${ICON('reset')}New stack</button>
       <label class="viz-field">Value <input type="text" maxlength="10" value="" placeholder="e.g. home" data-val aria-label="Value to push"></label>
       <button class="btn sm primary" type="button" data-op="push">push</button>
       <button class="btn sm" type="button" data-op="pop">pop</button>
       <button class="btn sm" type="button" data-op="peek">peek</button>
       <button class="btn sm" type="button" data-op="isEmpty">isEmpty</button>
       <button class="btn sm" type="button" data-op="isFull">isFull</button>`);
    const $ = s => root.querySelector(s);
    let size, items, top, py, last;
    const reset = () => {
      size = Math.max(2, Math.min(10, +$('[data-size]').value || 5));
      items = Array(size).fill(null); top = -1; last = null;
      py = [`s = Stack(${size})`];
      say(`A new stack: <code>items = [None] * ${size}</code> and <code>topIndex = -1</code>, which means empty.`);
    };
    let sayHtml = '';
    const say = h => { sayHtml = h; draw(); };
    function draw() {
      const slots = [];
      for (let i = size - 1; i >= 0; i--) {
        const live = i <= top, ghost = !live && items[i] !== null;
        slots.push(`<div class="viz-slot${live ? ' live' : ''}${ghost ? ' ghost' : ''}${i === top ? ' top' : ''}${last === i ? ' flash' : ''}">
          <span class="viz-idx">[${i}]</span><span class="viz-val">${items[i] === null ? '' : esc(show(items[i]))}</span>
          ${i === top ? '<span class="viz-ptr">← topIndex</span>' : ''}</div>`);
      }
      $('.viz-stage').innerHTML = `<div class="stack-col">${slots.join('')}</div>
        <div class="viz-state"><div><b>topIndex</b> = ${top}${top === -1 ? ' (empty)' : ''}</div><div><b>size</b> = ${size}</div>
        <div class="viz-legend"><span class="lg live"></span>in the stack <span class="lg ghost"></span>still in the array, but above the top</div></div>`;
      $('.viz-say').innerHTML = sayHtml;
      $('.viz-py').textContent = py.join('\n');
      last = null;
    }
    const isFull = () => top === size - 1, isEmpty = () => top === -1;
    function op(name) {
      const v = $('[data-val]').value.trim();
      if (name === 'push') {
        if (!v) { say('Type a value to push first.'); return; }
        py.push(`s.push(${pyVal(v)})`);
        if (isFull()) { say(`<b>push(${esc(show(v))})</b>: <code>isFull()</code> is True — topIndex is ${top} = size − 1. <b class="viz-bad">Stack overflow</b>: nothing is stored.`); return; }
        top++; items[top] = v; last = top;
        say(`<b>push(${esc(show(v))})</b>: isFull() is False, so topIndex moves up to ${top} <b>first</b>, then <code>items[${top}] = ${esc(show(v))}</code>.`);
        $('[data-val]').value = '';
      } else if (name === 'pop') {
        py.push('print(s.pop())');
        if (isEmpty()) { say('<b>pop()</b>: <code>isEmpty()</code> is True — topIndex is -1. <b class="viz-bad">Stack underflow</b>: it returns None.'); return; }
        const item = items[top]; top--;
        say(`<b>pop()</b> returns ${esc(show(item))}: it reads <code>items[${top + 1}]</code> <b>first</b>, then moves topIndex down to ${top}. The value stays in the array (faded) but is above the top, so it no longer counts — the next push overwrites it.`);
      } else if (name === 'peek') {
        py.push('print(s.peek())');
        say(isEmpty() ? '<b>peek()</b>: the stack is empty, so it returns None.' : `<b>peek()</b> returns ${esc(show(items[top]))} — the item at <code>items[${top}]</code> — and changes nothing.`);
      } else if (name === 'isEmpty') {
        py.push('print(s.isEmpty())');
        say(`<b>isEmpty()</b> is ${B(isEmpty())}: topIndex is ${top}${isEmpty() ? ' = -1' : ', not -1'}.`);
      } else if (name === 'isFull') {
        py.push('print(s.isFull())');
        say(`<b>isFull()</b> is ${B(isFull())}: topIndex is ${top}, ${isFull() ? 'which is' : 'not'} size − 1 = ${size - 1}.`);
      }
    }
    root.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.op) op(b.dataset.op);
      else if ('new' in b.dataset) reset();
      else if ('run' in b.dataset && opts.load) opts.load(STACK_PY + '\n\n' + py.join('\n') + '\n');
    });
    $('[data-val]').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); op('push'); } });
    if (!opts.load) $('[data-run]').remove();
    reset();
    return { state: () => ({ size, items: items.slice(), top }), op, reset };
  };

  /* ---------------- queue ---------------- */
  const QUEUE_PY = {
    linear: `class Queue:
    def __init__(self, size):
        self.items = [None] * size
        self.frontIndex = 0
        self.rearIndex = -1
        self.size = size

    def isEmpty(self):
        return self.rearIndex < self.frontIndex

    def isFull(self):
        return self.rearIndex == self.size - 1

    def enqueue(self, item):
        if self.isFull():
            print("Queue full")
        else:
            self.rearIndex = self.rearIndex + 1
            self.items[self.rearIndex] = item

    def dequeue(self):
        if self.isEmpty():
            print("Queue empty")
            return None
        item = self.items[self.frontIndex]
        self.frontIndex = self.frontIndex + 1
        return item

    def front(self):
        if self.isEmpty():
            return None
        return self.items[self.frontIndex]
`,
    circular: `class Queue:
    def __init__(self, size):
        self.items = [None] * size
        self.frontIndex = 0
        self.rearIndex = -1
        self.count = 0
        self.size = size

    def isEmpty(self):
        return self.count == 0

    def isFull(self):
        return self.count == self.size

    def enqueue(self, item):
        if self.isFull():
            print("Queue full")
        else:
            self.rearIndex = (self.rearIndex + 1) % self.size
            self.items[self.rearIndex] = item
            self.count = self.count + 1

    def dequeue(self):
        if self.isEmpty():
            print("Queue empty")
            return None
        item = self.items[self.frontIndex]
        self.frontIndex = (self.frontIndex + 1) % self.size
        self.count = self.count - 1
        return item

    def front(self):
        if self.isEmpty():
            return None
        return self.items[self.frontIndex]
`
  };

  CC.viz.queue = function (host, opts = {}) {
    const root = frame(host, 'viz-queue', 'Queue: an array with front and rear pointers', 'Enqueue at the rear, dequeue from the front. Try filling the <b>linear</b> queue, dequeuing once, then enqueuing again — then do the same with the <b>circular</b> one.',
      `<label class="viz-field">Kind <select data-kind aria-label="Kind of queue"><option value="linear">Linear</option><option value="circular">Circular</option></select></label>
       <label class="viz-field">Size <input type="number" min="2" max="10" value="4" data-size aria-label="Queue size"></label>
       <button class="btn sm" type="button" data-new>${ICON('reset')}New queue</button>
       <label class="viz-field">Value <input type="text" maxlength="10" placeholder="e.g. Aiko" data-val aria-label="Value to enqueue"></label>
       <button class="btn sm primary" type="button" data-op="enqueue">enqueue</button>
       <button class="btn sm" type="button" data-op="dequeue">dequeue</button>
       <button class="btn sm" type="button" data-op="front">front</button>
       <button class="btn sm" type="button" data-op="isEmpty">isEmpty</button>
       <button class="btn sm" type="button" data-op="isFull">isFull</button>`);
    const $ = s => root.querySelector(s);
    let kind, size, items, front, rear, count, py, last, sayHtml = '';
    const circ = () => kind === 'circular';
    const reset = () => {
      kind = $('[data-kind]').value;
      size = Math.max(2, Math.min(10, +$('[data-size]').value || 4));
      items = Array(size).fill(null); front = 0; rear = -1; count = 0; last = null;
      py = [`q = Queue(${size})`];
      say(`A new ${kind} queue: <code>frontIndex = 0</code>, <code>rearIndex = -1</code>${circ() ? ', <code>count = 0</code>' : ''}.${circ() ? ' The pointers wrap round with <code>% size</code>.' : ' The pointers only ever move forward.'}`);
    };
    const say = h => { sayHtml = h; draw(); };
    const isEmpty = () => (circ() ? count === 0 : rear < front), isFull = () => (circ() ? count === size : rear === size - 1);
    const inQueue = i => {
      if (isEmpty()) return false;
      if (!circ()) return i >= front && i <= rear;
      for (let k = 0, p = front; k < count; k++, p = (p + 1) % size) if (p === i) return true;
      return false;
    };
    function draw() {
      const cells = items.map((v, i) => {
        const live = inQueue(i), ghost = !live && v !== null;
        const marks = [i === front ? 'front' : '', i === rear ? 'rear' : ''].filter(Boolean);
        return `<div class="viz-cell${live ? ' live' : ''}${ghost ? ' ghost' : ''}${last === i ? ' flash' : ''}">
          <span class="viz-val">${v === null ? '' : esc(show(v))}</span><span class="viz-idx">[${i}]</span>
          <span class="viz-marks">${marks.map(m => `<b class="viz-mk ${m}">${m === 'front' ? 'F' : 'R'}</b>`).join('')}</span></div>`;
      }).join('');
      $('.viz-stage').innerHTML = `<div class="queue-row">${cells}</div>
        <div class="viz-state"><div><b class="viz-mk front">F</b> frontIndex = ${front}</div><div><b class="viz-mk rear">R</b> rearIndex = ${rear}${rear === -1 ? ' (nothing enqueued yet)' : ''}</div>${circ() ? `<div><b>count</b> = ${count}</div>` : ''}
        <div class="viz-legend"><span class="lg live"></span>in the queue <span class="lg ghost"></span>already served: still in the array, not in the queue</div></div>`;
      $('.viz-say').innerHTML = sayHtml;
      $('.viz-py').textContent = py.join('\n');
      last = null;
    }
    function op(name) {
      const v = $('[data-val]').value.trim();
      if (name === 'enqueue') {
        if (!v) { say('Type a value to enqueue first.'); return; }
        py.push(`q.enqueue(${pyVal(v)})`);
        if (isFull()) {
          const free = !circ() && front > 0;
          say(`<b>enqueue(${esc(show(v))})</b>: <code>isFull()</code> is True${circ() ? ` — count is ${count} = size` : ` — rearIndex is ${rear} = size − 1`}. <b class="viz-bad">Queue full</b>.${free ? ` But slot${front > 1 ? 's' : ''} 0${front > 1 ? `–${front - 1}` : ''} ${front > 1 ? 'are' : 'is'} free! In a linear queue the pointers never move back, so served slots are wasted. Try the <b>circular</b> queue.` : ''}`);
          return;
        }
        const old = rear;
        rear = circ() ? (rear + 1) % size : rear + 1;
        items[rear] = v; last = rear; if (circ()) count++;
        say(`<b>enqueue(${esc(show(v))})</b>: ${circ() ? `rearIndex = (${old} + 1) % ${size} = ${rear}${old + 1 === size ? ' — it <b>wrapped round</b> to the start' : ''}` : `rearIndex moves up to ${rear}`}, then <code>items[${rear}] = ${esc(show(v))}</code>${circ() ? `, count = ${count}` : ''}.`);
        $('[data-val]').value = '';
      } else if (name === 'dequeue') {
        py.push('print(q.dequeue())');
        if (isEmpty()) { say(`<b>dequeue()</b>: <code>isEmpty()</code> is True${circ() ? ' — count is 0' : ` — rearIndex (${rear}) is behind frontIndex (${front})`}. <b class="viz-bad">Queue empty</b>: it returns None.`); return; }
        const item = items[front], old = front;
        front = circ() ? (front + 1) % size : front + 1;
        if (circ()) count--;
        say(`<b>dequeue()</b> returns ${esc(show(item))} from <code>items[${old}]</code> — first in, first out — then ${circ() ? `frontIndex = (${old} + 1) % ${size} = ${front}, count = ${count}` : `frontIndex moves up to ${front}`}.`);
      } else if (name === 'front') {
        py.push('print(q.front())');
        say(isEmpty() ? '<b>front()</b>: the queue is empty, so it returns None.' : `<b>front()</b> returns ${esc(show(items[front]))} — <code>items[${front}]</code> — without removing it.`);
      } else if (name === 'isEmpty') {
        py.push('print(q.isEmpty())');
        say(`<b>isEmpty()</b> is ${B(isEmpty())}: ${circ() ? `count is ${count}` : `rearIndex is ${rear} and frontIndex is ${front}`}.`);
      } else if (name === 'isFull') {
        py.push('print(q.isFull())');
        say(`<b>isFull()</b> is ${B(isFull())}: ${circ() ? `count is ${count}, size is ${size}` : `rearIndex is ${rear}; the last index is ${size - 1}`}.`);
      }
    }
    root.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.op) op(b.dataset.op);
      else if ('new' in b.dataset) reset();
      else if ('run' in b.dataset && opts.load) opts.load(QUEUE_PY[kind] + '\n\n' + py.join('\n') + '\n');
    });
    $('[data-kind]').addEventListener('change', reset);
    $('[data-val]').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); op('enqueue'); } });
    if (!opts.load) $('[data-run]').remove();
    reset();
    return { state: () => ({ kind, size, items: items.slice(), front, rear, count }), op, reset, setKind(k) { $('[data-kind]').value = k; reset(); } };
  };
  CC.viz.STACK_PY = STACK_PY;
  CC.viz.QUEUE_PY = QUEUE_PY;
})(window.CodeCraft);
