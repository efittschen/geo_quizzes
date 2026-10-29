// A round's run: what is asked, what an answer does, the score. No page and no clock of its own: the time comes from
// now(), and a review's grade by the clock from the Game (grade).
//
//   const r = makeRound({ play, items, retry, review, look: { map, back }, t0 }, { quiz, random, now })
//   r.asked()                 the question now: { id, pos, group (Type code: the codes asked with it) }, null at the end
//   r.answer(input, grade)    an answer, one of:
//                               { area }   a tap on the map (on every area of the item, where the kind asks all)
//                               { picks }  the areas picked, checked (pickAll)
//                               { text }   a name or codes typed or picked from the list
//                               { option } one of the four to pick ({ word, id }: the item it is the word of)
//                               { point }  map play: a tap anywhere
//                               { drawn }  Draw: the share the drawing has in common with the place (0 to 1)
//                             -> an outcome (below). grade(missed) -> a review's result: 0 known, 1 unsure, 3 missed
//   r.board(), r.match(question, tile, grade)   Pairs: the next board; a pair picked (tile: { name, owner })
//   r.reveal()                the answer shown without a try (a review's time run out): the player still gives it
//   r.giveUp(grade)           Type code: the codes shown, the question missed
//   r.state                   { i, score, streak, best, points, res } for the panel; r.queue, r.items, r.play
//   r.result()                { items, queue, res, score, n, points, best, ms, complete, missed }
//   r.again(id)               an item asked once more at the end (a review's card missed)
//
// An outcome: { kind, id, … }
//   kind 'right'   the question answered: result (0 first try, 1, 2, 3 missed), members (the items answered: a code
//                  group several), wrongs and given (its wrong tries, and what they gave: items, or '"text')
//   kind 'more'    a right part of it, the rest to come: found (an area), left; or a code's got and need
//   kind 'wrong'   counted (a try less; not once the answer is shown), left (tries), revealed, rest (the areas still
//                  to find, shown), given
//   kind 'note'    Type code: a code used over these areas but not one of them; no try
// Results by tries: 0 first try, 1 second, 2 third, 3 missed (answered once shown). A review shows the answer after
// one wrong try. Results of 1 or more are missed (Retry missed).

import { askText, distance, PASS, board as pairBoard, PAIRS } from './checks.js';

export const MAX_TRIES = 3;
const PLAIN_MAPS = ['street', 'bare', 'sat'];

export function makeRound(def, { quiz, random, now }) {
  const P = def.play, K = P.kind, single = quiz.single || null;
  const shuffle = list => { const a = list.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  let queue = single ? def.items.slice() : shuffle(def.items);
  const code = P.code || null;
  if (code) queue = queue.map((id, n) => [id, n]).sort((a, b) => code.depth(a[0]) - code.depth(b[0]) || a[1] - b[1]).map(x => x[0]);
  const S = { i: 0, score: 0, streak: 0, best: 0, points: 0, res: [] }, t0 = def.t0 ?? now();
  // the question now: its tries, whether its answer is shown, the areas found and picked, its wrong tries and what they
  // gave, a code group and the codes typed of it
  let q = null;
  const needAll = id => K.clickAll && !PLAIN_MAPS.includes(def.look.map) && K.areas[id].length > 1;
  const rest = id => K.areas[id].filter(a => !q.found.has(a));

  function begin() {
    const id = queue[S.i];
    q = { id, tries: 0, revealed: false, found: new Set(), wrongs: 0, given: [], group: null, got: [] };
    if (code && id !== undefined) {
      // the round's codes still to come with exactly its areas are asked with it
      const later = queue.slice(S.i + 1).filter((x, n, a) => x !== id && code.same(id).includes(x) && a.indexOf(x) === n);
      for (const x of later) queue.splice(queue.indexOf(x, S.i + 1), 1);
      queue.splice(S.i + 1, 0, ...later);
      q.group = [id, ...later];
    }
  }
  begin();

  function done(result, more = {}) {
    const members = q.group || [q.id];
    for (const m of members) {
      S.res[S.i] = result;
      if (result === 0) { S.score++; S.streak++; S.best = Math.max(S.best, S.streak); } else S.streak = 0;
      S.i++;
    }
    const out = { kind: 'right', id: q.id, result, members, revealed: q.revealed, wrongs: q.wrongs, given: q.given.filter(x => x != null && x !== q.id), ...more };
    begin();
    return out;
  }
  const settle = (grade, missed) => (def.review && grade ? grade(missed) : q.revealed ? MAX_TRIES : q.tries);

  function wrong(given, more = {}) {
    if (q.revealed) return { kind: 'wrong', id: q.id, counted: false, revealed: true, ...more };
    q.wrongs++; q.given.push(...[].concat(given ?? []));
    q.tries++; S.streak = 0;
    const left = def.review ? 0 : MAX_TRIES - q.tries;
    if (left <= 0) q.revealed = true;
    return { kind: 'wrong', id: q.id, counted: true, first: q.wrongs === 1, left: Math.max(0, left), revealed: q.revealed, rest: q.revealed ? rest(q.id) : null, given, ...more };
  }

  function answer(input, grade) {
    const id = q.id;
    if (id === undefined) return null;
    if ('area' in input) {
      if (!K.areas[id].includes(input.area)) return wrong(K.primary(input.area), { area: input.area });
      if (needAll(id)) {
        const fresh = !q.found.has(input.area);
        q.found.add(input.area);
        const left = rest(id).length;
        if (left > 0) return { kind: 'more', id, found: input.area, fresh, left };
      }
      return done(settle(grade, q.tries > 0 || q.revealed));
    }
    if ('picks' in input) {
      const want = K.areas[id], picks = new Set(input.picks);
      if (q.revealed || (picks.size === want.length && want.every(a => picks.has(a)))) return done(settle(grade, q.tries > 0 || q.revealed));
      const extra = [...picks].filter(a => !want.includes(a)), kept = [...picks].filter(a => want.includes(a));
      for (const a of kept) q.found.add(a);
      return wrong(extra.map(a => K.primary(a)), { extra, kept, missing: want.filter(a => !picks.has(a)).length });
    }
    if ('text' in input) {
      if (code) return codeAnswer(input.text, grade);
      if (P.typed(id, input.text)) return done(settle(grade, q.tries > 0 || q.revealed));
      const other = K.ids.find(x => x !== id && P.typed(x, input.text));
      return wrong(other ?? '"' + input.text, { other, text: input.text });
    }
    if ('option' in input) {
      const right = P.back ? askText(K, id) : P.answerName(id);
      if (input.option.word === right) return done(settle(grade, q.tries > 0 || q.revealed));
      return wrong(input.option.id, { option: input.option });
    }
    if ('point' in input) {
      const p = input.point;
      const [km, scored] = quiz.free.measure(p, id), s = single && single.points(km, p, id, S.i);
      const d = distance(scored, quiz.free.span), pts = s ? s.pts : d.points, cls = s ? single.cls(s.base) : d.cls;
      S.points += pts;
      return done(def.review && grade ? grade(pts < 4000) : cls, { km, points: pts, single: s, cls });
    }
    if ('drawn' in input) {
      const pct = Math.round(input.drawn * 100), ok = pct >= PASS && !q.revealed;
      return done(def.review && grade ? grade(!ok) : ok ? 0 : MAX_TRIES, { pct });
    }
    return null;
  }

  /* ---------- Type code ---------- */
  function codeAnswer(text, grade) {
    const id = q.id, same = code.same(id), here = new Set(K.areas[id]), wrongs = [], notes = [];
    for (const t of code.tokens(text)) {
      const x = code.codeOf(t);
      if (x && same.includes(x)) { if (!q.got.includes(x)) q.got.push(x); continue; }
      const over = x ? K.areas[x].filter(a => here.has(a)).length : 0;
      if (over) notes.push({ id: x, whole: over === here.size, part: K.areas[x].length === over });
      else wrongs.push(t);
    }
    const need = q.group.length, filled = q.got.length >= need;
    if (filled && (!wrongs.length || q.revealed)) return codeDone(grade);
    if (wrongs.length) {
      const out = wrong(wrongs.map(t => code.codeOf(t) || '"' + t), { text: wrongs.join(', '), got: q.got.slice(), need, notes });
      return filled ? codeDone(grade, out) : out;
    }
    return { kind: notes.length ? 'note' : 'more', id, got: q.got.slice(), need, notes };
  }
  function codeDone(grade, before) {
    const got = q.got.slice();
    return done(settle(grade, q.tries > 0 || q.revealed), { got, before });
  }
  function giveUp(grade) {
    if (!code || q.id === undefined) return null;
    const first = !q.revealed;
    if (first) { q.revealed = true; q.tries = MAX_TRIES; S.streak = 0; }
    for (const x of [...q.group, ...code.same(q.id)]) if (q.got.length < q.group.length && !q.got.includes(x)) q.got.push(x);
    return { ...codeDone(grade), gaveUp: first };
  }

  /* ---------- Pairs ---------- */
  // A board: the next questions; each matched counts at its place in the queue, with its wrong pairs as its tries.
  let pairs = null;
  function board() {
    const questions = queue.slice(S.i, S.i + PAIRS);
    if (!questions.length) return null;
    pairs = { from: S.i, left: new Set(questions), wrongs: new Map(questions.map(x => [x, 0])), given: new Map(questions.map(x => [x, []])) };
    return pairBoard(P, questions, def.items, random);
  }
  function match(question, { name, owner }, grade) {
    if (!pairs || !pairs.left.has(question)) return null;
    if (P.answerName(question) !== name) {
      // against both questions (a name of none: against the question alone); what each was paired with, for the log
      for (const x of owner != null ? [question, owner] : [question]) pairs.wrongs.set(x, (pairs.wrongs.get(x) || 0) + 1);
      const named = owner ?? K.ids.find(x => P.answerName(x) === name);
      pairs.given.get(question).push(named);
      if (owner != null) pairs.given.get(owner).push(question);
      S.streak = 0;
      return { kind: 'wrong', id: question, counted: true, owner, name, given: named };
    }
    const pos = pairs.from + queue.slice(pairs.from).indexOf(question), wrongs = pairs.wrongs.get(question);
    const result = def.review && grade ? grade(wrongs > 0) : Math.min(wrongs, MAX_TRIES);
    S.res[pos] = result;
    if (result === 0) { S.score++; S.streak++; S.best = Math.max(S.best, S.streak); } else S.streak = 0;
    pairs.left.delete(question);
    const given = pairs.given.get(question).filter(x => x !== question), cleared = !pairs.left.size;
    if (cleared) { S.i = pairs.from + pairs.wrongs.size; pairs = null; begin(); }
    return { kind: 'right', id: question, result, members: [question], wrongs, given, cleared };
  }

  function result() {
    const n = S.res.filter(t => t !== undefined).length;
    const missed = queue.map((id, i) => [id, S.res[i]]).filter(([, t]) => t > 0).sort((a, b) => K.ids.indexOf(a[0]) - K.ids.indexOf(b[0])).map(([id]) => id);
    return { items: def.items, queue: queue.slice(), res: S.res.slice(), score: S.score, n, points: S.points, best: S.best, ms: now() - t0, complete: n === def.items.length, missed };
  }

  return {
    play: P, items: def.items, get queue() { return queue; }, state: S, t0,
    asked: () => (q.id === undefined ? null : { id: q.id, pos: S.i, group: q.group, revealed: q.revealed, tries: q.tries, found: [...q.found] }),
    rest: () => (q.id === undefined ? [] : rest(q.id)),
    needAll: () => q.id !== undefined && needAll(q.id),
    answer, board, match, giveUp, result,
    again(id) { queue.push(id); if (q.id === undefined) begin(); }, // (a review: a card missed comes back at the end)
    reveal() { if (q.id === undefined || q.revealed) return null; q.revealed = true; return { kind: 'shown', id: q.id, rest: rest(q.id) }; },
  };
}
