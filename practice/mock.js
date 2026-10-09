/* practice/mock.js — the timed Paper 2 mock (review-2): two papers of three structured questions, 50 marks each,
   1 hour 15 minutes, in the structure of the learner's school half-yearly Paper 2 (no recursion: SL only).
   Questions are built by mock-q12.js and mock-q3.js. Every part is also registered as a practice generator under the
   topic 'mock' (not a lesson id, so it never appears in practice pages or lesson tabs), which means tools/verify.py
   and tools/check.html check every part like any other question.
   CodeCraft.practice.mock.build(paperId, seed) → { paper, seed, title, total, questions: [{ n, title, intro, marks, parts }] } */
(function (P) {
  const M = P.mock;
  M.MINUTES = 75;
  M.PAPERS = {
    A: { id: 'A', title: 'Paper A', theme: 'Library loans and hall bookings', qs: [M.q1a, M.q2a, M.q3a] },
    B: { id: 'B', title: 'Paper B', theme: 'Sports day and locker rentals', qs: [M.q1b, M.q2b, M.q3b] }
  };
  const genId = (paper, qi, part) => `mock-${paper.toLowerCase()}${qi + 1}${part.label}`;
  // A part's generator builds its question's shared context first, from the same seeded R, so every part of a
  // question built with the same seed sees the same data (the same arrays, the same class prices, …).
  const gens = {};
  Object.values(M.PAPERS).forEach(paper => paper.qs.forEach((Q, qi) => Q.parts.forEach(part => {
    const g = { id: genId(paper.id, qi, part), kind: part.kind, term: part.term, marks: part.marks, make(R) { return part.make(R, Q.context(R)); } };
    gens[g.id] = g;
  })));
  P.add('mock', Object.values(gens));
  M.gen = id => (P.gens.mock || []).find(g => g.id === id);

  const qSeed = (seed, qi) => (seed + Math.imul(qi + 1, 7919)) >>> 0;
  M.build = function (paperId, seed) {
    const paper = M.PAPERS[paperId];
    const questions = paper.qs.map((Q, qi) => {
      const s = qSeed(seed, qi), ctx = Q.context(P.rng(s));
      const parts = Q.parts.map(part => Object.assign(P.generate(M.gen(genId(paper.id, qi, part)), s), {
        label: part.label, key: `${qi + 1}${part.label}`, topicRef: `Question ${qi + 1}(${part.label})`
      }));
      return { n: qi + 1, title: Q.title, intro: Q.intro(ctx), marks: parts.reduce((a, p) => a + p.marks, 0), parts };
    });
    return { paper: paperId, seed, title: paper.title, theme: paper.theme, total: questions.reduce((a, q) => a + q.marks, 0), questions };
  };
})(CodeCraft.practice);
