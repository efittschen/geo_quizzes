// Best results and stars.
//
// A best result is kept per play, map and exact set of items: '<play>/<map>/<items>' (items: their number and a
// fingerprint, storage.print), so it counts for any round or custom quiz that asks just those items. It is
// { s: score, t: time in ms, p: points (map play) }, kept with the name of the round it was played as.
//
//   const results = makeResults(quiz, kinds, rounds, storage)
//   results.best(play, ids, map)          the best result, or null
//   results.keep(play, round, map)        a finished round: kept if it is a best (complete, not a retry, not a page of
//                                         one round); -> { prev, better }
//   results.levels(rounds)                each level's progress, Beginner first, of these rounds (all of them: the
//                                         quiz's): the average best share of first tries, on any map and in any way;
//                                         1 is a star. A level without rounds follows the next harder one.
//   results.stars()                       the levels, kept for the home and country pages
//   results.perfect(asked)                per card family: { any: maps with a perfect result, on: { item: maps with
//                                         one that has the item } }; asked: [[play key, ids]] besides the rounds

export const MAPS = ['quiz', 'overlay', 'street', 'bare', 'sat', 'free'];

export function makeResults(quiz, kinds, rounds, storage) {
  const keyOf = (playKey, ids, map) => `${playKey}/${map}/${storage.print(ids)}`;
  const best = (P, ids, map) => storage.best(keyOf(P.key, ids, map));
  // the name a set of items is played as: the round's, else the saved quiz's
  const nameOf = (P, ids) => {
    const p = storage.print(ids), r = rounds.list.find(r => r.kind === P.kind.key && !r.random && storage.print(rounds.items(r)) === p);
    return r ? r.label : (storage.customs().find(c => c.kind === P.kind.key && storage.print(c.ids) === p) || {}).name;
  };

  function keep(P, R, map) {
    const prev = best(P, R.items, map), free = map === 'free';
    const better = !prev || (free ? R.points > (prev.p || 0) || (R.points === prev.p && R.ms < prev.t) : R.score > prev.s || (R.score === prev.s && R.ms < prev.t));
    if (!R.retry && R.complete && !quiz.single) {
      // map play keeps two records: the most points (with its time) and the most close answers, which the stars count
      if (free && (better || R.score > (prev ? prev.s : 0))) storage.keepBest(keyOf(P.key, R.items, map), { s: Math.max(R.score, prev ? prev.s : 0), t: better ? R.ms : prev.t, p: better ? R.points : prev.p }, R.items.length, nameOf(P, R.items));
      else if (!free && better) storage.keepBest(keyOf(P.key, R.items, map), { s: R.score, t: R.ms }, R.items.length, nameOf(P, R.items));
      else return { prev, better };
      shares = null;
      stars();
    }
    return { prev, better };
  }

  // each round's best share of first tries, on any map and in any way (worked out once, until a best is kept)
  let shares = null;
  function shareOf(r) {
    if (!(shares ||= new Map()).has(r)) {
      const ids = rounds.items(r), p = storage.print(ids), K = kinds.byKey[r.kind];
      shares.set(r, Math.max(0, ...kinds.ways(K).flatMap(w => MAPS.map(map => { const b = storage.best(`${kinds.play(r.kind, w).key}/${map}/${p}`); return b ? b.s / ids.length : 0; }))));
    }
    return shares.get(r);
  }
  function levels(list = rounds.list) {
    const counted = quiz.single ? [] : list.filter(r => !r.random).map(r => ({ level: r.level, share: shareOf(r) }));
    if (!counted.length) return [];
    const top = Math.max(...counted.map(r => r.level)), out = [];
    for (let l = top; l >= 0; l--) {
      const own = counted.filter(r => r.level === l);
      out[l] = own.length ? own.reduce((s, r) => s + r.share, 0) / own.length : out[l + 1];
    }
    return out;
  }
  function stars() { const l = levels(); if (l.length) storage.keepStars(l); }

  function perfect(asked = []) {
    const out = {}, maps = {}; // '<play>/<items>' -> the maps those items were played perfectly on
    for (const [k, b] of Object.entries(storage.bests())) {
      const i = k.lastIndexOf('/'), j = k.lastIndexOf('/', i - 1), P = kinds.playOf(k.slice(0, j)), map = k.slice(j + 1, i);
      if (!P || !quiz.maps.includes(map) || !(b.score >= b.of)) continue;
      (maps[P.key + '/' + k.slice(i + 1)] ||= new Set()).add(map);
      (out[P.cards] ||= { any: new Set(), on: {} }).any.add(map);
    }
    const all = [...rounds.list.filter(r => !r.random).map(r => [r.kind, rounds.items(r)]), ...storage.customs().map(c => [c.kind, c.ids]), ...asked];
    for (const [key, ids] of all) {
      const P = kinds.playOf(key);
      for (const map of maps[key + '/' + storage.print(ids)] || []) for (const id of ids) (out[P.cards].on[id] ||= new Set()).add(map);
    }
    return out;
  }

  // (results kept before they had names: those of this page's rounds get theirs)
  {
    const bests = storage.bests(), unnamed = [];
    for (const r of rounds.list) if (!r.random) for (const map of MAPS) {
      const k = keyOf(r.kind, rounds.items(r), map);
      if (bests[k] && !bests[k].name) unnamed.push([k, r.label]);
    }
    if (unnamed.length) storage.nameBests(unnamed);
  }

  return { best, keep, levels, stars, perfect };
}
