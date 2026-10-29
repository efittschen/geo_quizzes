// The review's rules. A round played perfectly puts its questions on the page's stack as cards of the map it was
// played on, '<play's cards>@<look>|<item>' (look: the map, '+<background>' where a city quiz had one). A review asks
// them, each the way the last perfect round with it was played, and grades each answer by the clock:
//   INSTANT (easy)  right on the first try within the "easy" time (never a replay: a card asked again after a miss)
//   KNOWN   (good)  right on the first try within the "known" time
//   UNSURE  (hard)  right on the first try, slower
//   MISSED  (again) a wrong try (a review shows the answer after one), or the time limit run out
// A replay answered right is rated by hand. Ordinary rounds count too, for cards on the stack. srs.js keeps the cards
// and their schedule (storage.schedule()), and today also chooses them (SRS.pick, SRS.stretch: PLAN step 8).
//
//   const review = makeReview(quiz, kinds, rounds, results)
//   review.cardKey(play, id, look), review.lookOf({ map, back }), review.parse(key)
//   review.times(play, id, ask, opts)              a question's three times in ms: easy, known, limit (ask: { all, group },
//                                                  see play.time; opts: SRS.opts())
//   review.grade({ ms, wrong, late, easy, known }) -> MISSED, UNSURE, KNOWN or INSTANT; CLASS[g]: the result it shows as
//   review.stack(srs, storage, how)                this page's cards, kept tidy: { deck, items: card -> [play key, id] }
//   review.plan(srs, keys, items, deck, how)       a review's rounds, cards asked alike together: [{ play, ids, way }]
//                                                  (how: { chosen: the map and background picked, asked: [[play key,
//                                                  ids]] picked on the setup screen besides the rounds })

import { MAPS } from './results.js';

export const MISSED = 0, UNSURE = 1, KNOWN = 2, INSTANT = 3;
export const CLASS = [3, 1, 0, 0];
export const LEAD = 1500, RATE_TIME = 4000;

export function makeReview(quiz, kinds, rounds, results) {
  const lookOf = ({ map, back }) => map + (back && back !== 'quiz' ? '+' + back : '');
  const cardKey = (P, id, look) => P.cards + '@' + look + '|' + id;
  const parse = key => {
    const bar = key.indexOf('|'), at = key.indexOf('@'), has = at >= 0 && at < bar;
    return { family: key.slice(0, has ? at : bar), look: has ? key.slice(at + 1, bar) : null, id: key.slice(bar + 1) };
  };
  const wayOfLook = look => { const [map, back] = look.split('+'); return { map, back: back || 'quiz', look }; };
  const easiest = MAPS.filter(m => quiz.maps.includes(m));

  // An item of several areas to tap (or pick) gets half the time again for each more; a way of answering its own.
  function times(P, id, ask, o) {
    const k = P.time(id, ask);
    return { easy: o.easy * 1000 * k, known: o.fast * 1000 * k, limit: P.mode === 'pairs' ? Infinity : o.limit * 1000 * k };
  }
  const grade = ({ ms, wrong, late, easy, known }) => (wrong || late ? MISSED : ms <= easy ? INSTANT : ms <= known ? KNOWN : UNSURE);

  // What a card is called on the review page: the question as asked (a code, a word read, a place named, a picture's
  // answer), and the first word of what the results say of it, where that adds something.
  function cardName(K, id) {
    try {
      const plain = s => String(s ?? '').replace(/\s+/g, ' ').trim(), first = s => plain(s).split(' · ')[0];
      const prompt = K.prompt || 'dial';
      const ask = prompt === 'text' && K.text ? plain(K.text(id).text) : prompt === 'photo' ? first(K.name(id)) : plain(K.chip(id));
      const more = prompt === 'photo' ? '' : first(K.chipTitle && K.chipTitle(id)).split(', ')[0];
      return more && !ask.includes(more) ? [ask, more] : [ask];
    } catch (err) { return [String(id)]; }
  }

  // The map a card is asked on where it doesn't say one it can be (a look this page doesn't offer): the map of a
  // perfect result with its item, the hardest of several; else of any perfect result of its family, the easiest;
  // else the map chosen on the setup screen.
  function wayFor(how) {
    let perfect = null;
    return (P, id, card) => {
      if (easiest.includes(card.m)) return { map: card.m, back: quiz.backs.includes(card.b) ? card.b : 'quiz' };
      const p = (perfect ||= results.perfect(how.asked))[P.cards], own = p && p.on[id];
      return { map: (own ? [...easiest].reverse().find(m => own.has(m)) : p && easiest.find(m => p.any.has(m))) || how.chosen.map, back: how.chosen.back };
    };
  }

  // The page's stack, kept tidy for the review page: a card whose question has left the quiz set aside (x) until it is
  // back; a card from before cards had maps given one, once, the map worked out for it; the layers' names, each
  // card's name, the groups of a layer, the maps this page's cards can be sorted onto.
  function stack(srs, storage, how) {
    const page = storage.page;
    const owner = {}; // '<family>|<id>' -> [play key, id] (a family shared: the first kind that has it)
    for (const K of kinds.list) for (const way of kinds.ways(K)) { const P = kinds.play(K.key, way); for (const id of K.ids) owner[P.cards + '|' + id] ??= [P.key, id]; }
    const deck = srs.deck(page);
    const old = Object.keys(deck.c).filter(c => parse(c).look === null && !deck.c[c].m && owner[c]);
    if (old.length) {
      const wayOf = wayFor(how), to = new Map();
      for (const c of old) {
        const { family, id } = parse(c), [key] = owner[c], m = wayOf(kinds.playOf(key), id, deck.c[c]), k = family + '\n' + lookOf(m);
        (to.get(k) || to.set(k, new Set()).get(k)).add(id);
      }
      for (const [k, ids] of to) { const [family, look] = k.split('\n'); srs.sort(page, family, look, ids); }
      const run = srs.run(), moved = storage.moved();
      const renamed = k => (parse(k).look === null && moved[k] && moved[k].to ? k.replace('|', '@' + moved[k].to + '|') : k);
      if (run.left[page] || run.again[page]) { for (const list of [run.left, run.again]) if (list[page]) list[page] = list[page].map(renamed); srs.setRun(run); }
      if (!srs.opts().perMap) srs.single(page);
      return stack(srs, storage, how);
    }
    let changed = storage.cardKeys().sort().join() !== Object.keys(deck.c).sort().join();
    const items = {};
    for (const c in deck.c) { const p = parse(c), o = owner[p.family + '|' + p.id]; if (o) items[c] = o; }
    for (const c in deck.c) {
      const gone = !items[c];
      if (!!deck.c[c].x !== gone) { if (gone) deck.c[c].x = 1; else delete deck.c[c].x; changed = true; }
    }
    if (changed) srs.save(page, deck);
    const names = {}, called = {}, grouped = {};
    for (const c in deck.c) { const f = parse(c).family, P = kinds.list.flatMap(K => kinds.ways(K).map(w => kinds.play(K.key, w))).find(P => P.cards === f); if (P) names[f] = P.label; }
    if (Object.keys(names).length) srs.setLayers(page, names);
    for (const c in items) { const [key, id] = items[c]; called[parse(c).family + '|' + id] ??= cardName(kinds.playOf(key).kind, id); }
    srs.setNames(page, called);
    for (const c in items) {
      const [key, id] = items[c], K = kinds.playOf(key).kind, f = parse(c).family;
      if (!K.groups || K.groups.length < 2) continue;
      const g = K.groups.find(g => g.ids.includes(id)); if (!g) continue;
      const list = (grouped[f] ||= K.groups.map(x => [x.title, []])), at = list.find(x => x[0] === g.title);
      if (!at[1].includes(id)) at[1].push(id);
    }
    for (const f in grouped) grouped[f] = grouped[f].filter(x => x[1].length);
    srs.setGroups(page, grouped);
    if (Object.keys(deck.c).length) srs.setLooks(page, quiz.maps);
    return { deck, items };
  }

  // Each card asked on its own map (its look, where the page offers it); cards asked alike stay together, in the order
  // their way first comes up, a play's run of cards one round.
  function plan(srs, keys, items, deck, how) {
    const ways = new Map(), wayOf = wayFor(how);
    for (const c of keys) {
      const look = parse(c).look, ok = look && quiz.maps.includes(look.split('+')[0]);
      const way = ok ? wayOfLook(look) : { ...wayOf(kinds.playOf(items[c][0]), items[c][1], deck.c[c]), look };
      const k = ok ? look : `${look}/${way.map}/${way.back}`;
      (ways.get(k) || ways.set(k, [way, []]).get(k))[1].push(c);
    }
    const out = [];
    for (const [way, cards] of ways.values()) for (const c of cards) enqueue(out, items[c][0], items[c][1], way);
    return out;
  }
  // a card at the end: in the last round if that asks the same play the same way, else in a new one
  function enqueue(list, play, id, way) {
    const last = list[list.length - 1];
    if (last && last.play === play && last.way === way) last.ids.push(id); else list.push({ play, ids: [id], way });
  }

  return { cardKey, lookOf, parse, times, grade, stack, plan, enqueue, cardName };
}
