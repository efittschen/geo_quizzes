// The kinds of a quiz, and the plays: a kind asked one way.
//
// A kind as its config makes it (QUIZ.kinds; every field: the configs' headers). What the Model reads:
//   key, label, noun [one, many], sub, pickTitle, groups [{ title, sub, ids }], areasOf(id), name(id), short(id)
//   prompt         what its question shows: 'name', 'dial' (a code), 'text', 'photo', 'area' (its place outlined)
//   of, lang       the items of kind `of` in another language or under another label; start: the one shown first
//   cards          '<kind>': it shares that kind's review cards
//   modes, defaultMode, answer(id), answers(id) (other spellings that count), typeMode, typed(id, text) (or true: typed,
//                  checked from its name and answers), choices(), time(id)
//   rankings, areaRank, primary(area), presets, pickAll, clickAll, fresh, areaLabel, labelPerArea, dim, plates
// Worked out here, on each kind:
//   ids            its items in its groups' order (an item in two groups twice); areas[id]; at[area]: the items an
//                  area belongs to, in that order
//   size(id)       its size on the ground: its areas', each shared equally by the items over it
//   rankings       'largest area' first (unless areaRank: false), then the config's
//   primary(area)  the item a tap on the area is (the config's, else the area's first)
//   sub, pickTitle "16 states", "States to practice"
//
// A play: a kind and a way to answer it (WAYS). Every kind is played on the map ('map'), and in the ways its config
// names (modes), Name it and Shape where it names one place (nameable), Draw where a place is tapped (drawable). A
// play other than the map is kept apart under '<kind>~<way>': its best results, its review cards, its stars.
//   play.kind, play.way, play.key, play.cards, play.label
//   play.format    how the question shows: name, code, text, picture, outline, shape
//   play.mode      how it is answered: map, all (every area: tapped, or picked and checked), list, type, picks,
//                  pairs, draw ('free', map play, is chosen by the map instead)
//   play.answerName(id)   the name answered (the kind it is `of` names it, else its own answer or name)
//   play.drawn            the kind as the map draws it in this play (its layout: map/layouts.js)
//   play.time(id, ask)    how many times a tap's time the review's clock gives it (ask: { all: every area to tap,
//                         group: the codes asked together })

import { codeChecks, namedChecks, plainName, typedOf } from './checks.js';

export const WAYS = { map: 'Map', list: 'List', type: 'Type', pairs: 'Pairs', pick: 'Pick', pickback: 'Pick back', code: 'Type code', name: 'Name it', shape: 'Shape', draw: 'Draw' };
const FORMAT = { name: 'name', dial: 'code', text: 'text', photo: 'picture', area: 'outline' };

export function makeKinds(quiz, geo) {
  const kind = k => {
    const ids = k.groups.flatMap(g => g.ids), areas = {}, at = {};
    for (const id of ids) areas[id] ??= k.areasOf(id);
    for (const id of ids) for (const a of areas[id]) (at[a] ??= []).push(id);
    const size = id => areas[id].reduce((sum, a) => { const A = geo.area(a); return sum + (A.s ?? A.a ?? 0) / at[a].length; }, 0);
    const count = new Set(ids).size, [one, many] = k.noun;
    return {
      ...k, ids, areas, at, size,
      rankings: [...(k.areaRank === false ? [] : [{ label: 'largest area', order: ids.slice().sort((a, b) => size(b) - size(a)) }]), ...(k.rankings || [])],
      primary: k.primary || (a => (at[a] || [])[0]),
      dim: k.pickAll ? false : k.dim,
      sub: k.sub ?? `${count.toLocaleString('en-US')} ${count === 1 ? one : many}`,
      pickTitle: k.pickTitle ?? many[0].toUpperCase() + many.slice(1) + ' to practice',
    };
  };
  const byKey = Object.fromEntries(quiz.kinds.map(k => [k.key, kind(k)]));
  const list = Object.values(byKey), grouping = quiz.grouping.map(kind);

  // (Draw: a place tapped on the map, one a question: not a city's dot, a tile of a board, a place outlined or typed)
  const drawable = K => !quiz.dots && !quiz.board && K.prompt !== 'area' && !K.typed && !K.fresh && !K.pickAll;
  // (Name it, Shape: one place a question, asked by its name, or its name in another script or on a sign)
  const nameable = K => !quiz.board && (K.prompt === 'name' || K.prompt === 'text') && !K.typed && !K.fresh && !K.pickAll && !K.clickAll && !K.areaLabel && !K.labelPerArea;
  const ways = K => ['map', ...(K.modes || []), ...(nameable(K) ? ['name', ...(quiz.dots ? [] : ['shape'])] : []), ...(drawable(K) ? ['draw'] : [])];

  const answerNameOf = K => K.answer || (byKey[K.of] ? i => byKey[K.of].name(i) : K.name);
  // (Name it and Shape share their names, made as the page opens: a text drawn at random is drawn there)
  const named = new Map(list.filter(nameable).map(K => [K.key, namedChecks(K, answerNameOf(K))]));
  const plays = new Map();
  function play(key, way = 'map') {
    const K = byKey[key], id = way === 'map' ? key : key + '~' + way;
    if (!K || !ways(K).includes(way)) return null;
    if (plays.has(id)) return plays.get(id);
    const answerName = answerNameOf(K);
    const P = { kind: K, way, key: id, cards: way === 'map' ? K.cards || key : (K.cards || key) + '~' + way, answerName, label: way === 'map' ? K.label : `${K.label} · ${wayLabel(K, way)}` };
    // (as the map draws it: a way answered off the map draws the kind's places as units, though they are tapped one by one
    // on the map: clickAll)
    P.drawn = ['map', 'name', 'shape', 'draw'].includes(way) || !K.clickAll ? K : { ...K, key: id, like: K.like || key, clickAll: false };
    let typed = null; // (the forms, made when first asked for)
    const std = (i, t) => (typed ||= typedOf(Object.fromEntries(K.ids.map(x => [x, [...new Set([answerName(x), ...[].concat(K.answers ? K.answers(x) : [])].filter(Boolean).map(plainName))]]))))(i, t);
    if (way === 'map') Object.assign(P, {
      format: FORMAT[K.prompt] || 'name',
      mode: K.pickAll || K.clickAll ? 'all' : K.typed ? (K.choices ? 'list' : 'type') : 'map',
      typed: K.typed === true ? std : K.typed, choices: K.choices && K.choices(),
      time: (i, ask) => (K.time ? K.time(i) : (ask && ask.all) || K.pickAll ? 1 + (K.areas[i].length - 1) / 2 : 1),
    });
    else if (way === 'list' || way === 'type') {
      const reading = way === 'type' && K.typeMode;
      Object.assign(P, {
        format: FORMAT[K.prompt] || 'name', mode: way,
        typed: reading ? (i, t) => K.typeMode.typed(i, t) ?? std(i, t) : std,
        time: reading && K.typeMode.time ? K.typeMode.time : () => (way === 'list' ? 2 : 3),
        text: reading ? K.typeMode.text : K.text, say: reading ? K.typeMode.say : K.say,
      });
      lazy(P, 'choices', () => (way === 'list' ? [...new Set(K.ids.map(answerName))].sort((a, b) => a.localeCompare(b)) : null));
    } else if (way === 'pairs') Object.assign(P, { format: FORMAT[K.prompt] || 'name', mode: 'pairs', time: () => 1.5 });
    else if (way === 'pick' || way === 'pickback') Object.assign(P, { format: way === 'pickback' ? 'name' : FORMAT[K.prompt] || 'name', mode: 'picks', back: way === 'pickback', time: () => 1.5 });
    else if (way === 'code') Object.assign(lazy(P, 'code', () => codeChecks(K)), { format: 'outline', mode: 'type', fresh: true, keyboard: K.plates ? 'text' : 'numeric', time: (i, ask) => 3 * Math.max(1, ((ask && ask.group) || []).length) });
    else if (way === 'name' || way === 'shape') Object.assign(P, { format: way === 'name' ? 'outline' : 'shape', mode: 'list', ...named.get(key), time: () => 3 });
    else if (way === 'draw') Object.assign(P, { format: FORMAT[K.prompt] || 'name', mode: 'draw', time: () => 6 });
    plays.set(id, P);
    return P;
  }
  // A way's name on its switch: the picks by the languages they go between, where the kind and the one it is of say theirs.
  function wayLabel(K, way) {
    const mine = K.lang, theirs = byKey[K.of] && byKey[K.of].lang;
    if (mine && theirs && (way === 'pick' || way === 'pickback')) return way === 'pick' ? `${mine} → ${theirs}` : `${theirs} → ${mine}`;
    return WAYS[way];
  }
  // (a part of a play made when first asked for: Type code's checks, a list's names)
  function lazy(P, name, make) { let v; Object.defineProperty(P, name, { get: () => (v ??= make()), enumerable: true }); return P; }
  // A play's key read back: '<kind>' or '<kind>~<way>'.
  const playOf = id => { const [key, way] = id.split('~'); return play(key, way); };

  return { byKey, list, grouping, ways, wayLabel, play, playOf, WAYS };
}
