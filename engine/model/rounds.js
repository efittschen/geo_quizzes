// The rounds a quiz offers: the config's (QUIZ.rounds), else the standard rule for every quiz.
//
//   const rounds = makeRounds(quiz, kinds, geo)
//   rounds.list       [{ id, kind, label, sub, key, box, random, of, level }]: of the kinds on the page, each followed
//                     by the same round in each other language or label of its kind (of: the round it belongs to,
//                     whose box offers it)
//   rounds.items(r)   a round's items, each once (drawn anew each time where it is random)
//   levelOf(n)        a round's level by its size alone: 0 Beginner (under 10), 1 Intermediate (under 30), 2 Hard
//                     (under 60), 3 Expert
//
// A config's round: { kind, label, sub?, key?, box?, and one of ids: [...] or () => [...] | groups: [titles] |
// preset: label | top: N (rank: i, a ranking other than the first) }; without them every item of its kind. key tells
// apart rounds with the same label; box frames a part of the map while the round is chosen and played. A round drawn
// at random (ids or its preset a function) has no best result and no stars.
//
// The standard rule, per layer (the kinds that are not `of` another, and the layers that only group), coarse first:
//   - under 10 items: one round, named after the layer;
//   - else, each of 3 items or more and not the same items as another: its presets; codes cut by the coarsest layer of
//     codes above it (else its own groups), runs of first digits joined while a round stays under 30 ("Area codes ·
//     02–04"), or cut by name where the units have names; names cut by every layer above that holds them (a unit
//     each: "Bavaria"), then by their own groups; and last all of it ("All states");
//   - a layer above holds this one where nearly all its items (90%) lie each inside one of its units, and few (10%) in
//     two; a layer that only groups (North, South) never makes a round, it only cuts.

export const LEVELS = ['Beginner', 'Intermediate', 'Hard', 'Expert'];
export const levelOf = n => (n < 10 ? 0 : n < 30 ? 1 : n < 60 ? 2 : 3);

const once = ids => [...new Set(ids)];
const call = v => (typeof v === 'function' ? v() : v);

export function makeRounds(quiz, kinds, geo) {
  const K = key => kinds.byKey[key];
  const presetOf = r => (K(r.kind).presets || []).find(p => p.label === r.preset);
  function items(r) {
    const k = K(r.kind);
    let ids = k.ids;
    if (r.ids) ids = call(r.ids);
    else if (r.groups) ids = k.groups.filter(g => r.groups.includes(g.title)).flatMap(g => g.ids);
    else if (r.preset) ids = call(presetOf(r).ids);
    else if (r.top) { const rank = k.rankings[r.rank || 0]; ids = rank.order.slice(0, r.top); if (rank.expand) ids = ids.flatMap(rank.expand); }
    return once(ids).filter(id => k.areas[id]);
  }

  let list = (quiz.rounds || standard()).filter(r => K(r.kind));
  if (!list.length) list = quiz.kinds.filter(k => !K(k.of)).map(k => ({ kind: k.key, label: k.label, sub: k.sub }));
  list = list.map(r => ({ ...r, id: r.kind + ':' + (r.key || r.label), random: typeof r.ids === 'function' || (!!r.preset && typeof presetOf(r).ids === 'function') }));
  list = list.flatMap(r => [r, ...quiz.kinds.filter(k => k.of === r.kind && K(k.key)).map(k => {
    const mine = () => items(r).filter(id => K(k.key).areas[id]);
    return { ...r, kind: k.key, id: k.key + ':' + (r.key || r.label), of: r, ids: r.random ? mine : mine(), groups: null, preset: null, top: null };
  }).filter(v => v.random || v.ids.length)]);
  for (const r of list) r.level = levelOf(items(r).length);

  function standard() {
    const layers = [...kinds.list.filter(k => !K(k.of)), ...kinds.grouping]
      .map(k => ({ k, ids: once(k.ids), code: !['name', 'text', 'photo'].includes(k.prompt) }))
      .sort((a, b) => a.ids.length - b.ids.length);
    // the units of a coarser layer P that hold the items of L: [[short, items, name]…], or null
    const cut = (L, P) => {
      const held = new Map(P.ids.map(p => [p, []]));
      for (const id of L.ids) {
        const areas = L.k.areas[id];
        for (const p of areas.length ? P.k.at[areas[0]] || [] : []) if (held.has(p) && areas.every(a => (P.k.at[a] || []).includes(p))) held.get(p).push(id);
      }
      const units = P.ids.map(p => [P.k.short(p), held.get(p), P.k.name(p)]).filter(u => u[1].length);
      const n = new Set(units.flatMap(u => u[1])).size, twice = units.reduce((s, u) => s + u[1].length, 0) - n;
      return units.length > 1 && n >= .9 * L.ids.length && twice <= .1 * L.ids.length ? units : null;
    };
    const rounds = [], [W, H] = quiz.size;
    layers.forEach((L, i) => {
      const { k, ids } = L;
      if (k.groupsOnly) return;
      if (ids.length < 10) return rounds.push({ kind: k.key, label: k.label });
      // a round over a small part of the map (under a quarter of it) frames that part
      const boxOf = list => {
        let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        for (const id of list) for (const a of k.areas[id]) {
          const A = geo.area(a), r = Math.sqrt(A.a || 0) * .7;
          x0 = Math.min(x0, A.lx - r); y0 = Math.min(y0, A.ly - r); x1 = Math.max(x1, A.lx + r); y1 = Math.max(y1, A.ly + r);
        }
        return (x1 - x0) * (y1 - y0) < .25 * W * H ? [x0, y0, x1, y1] : undefined;
      };
      const seen = new Set([ids.slice().sort().join('|')]), labels = new Set();
      const add = (label, list, key, which) => {
        const sig = list.slice().sort().join('|');
        if (list.length < 3 || seen.has(sig)) return;
        if (labels.has(label) && which) label = `${label} · ${which}`;
        seen.add(sig); labels.add(label);
        rounds.push({ kind: k.key, label, key, ids: list, box: boxOf(list) });
      };
      for (const p of k.presets || []) if (typeof p.ids !== 'function') add(p.label, once(p.ids).filter(id => k.areas[id]), 'preset ' + p.label);
      const above = layers.slice(0, i).map(P => [P, cut(L, P)]).filter(c => c[1]);
      const own = k.groups.length > 1 ? k.groups.map(g => [g.title, once(g.ids)]) : null;
      if (L.code) {
        const units = (above.find(c => c[0].code) || [])[1] || own;
        if (units && units.every(u => /^[\d(+][\d\s()x·…-]*$/.test(u[0]))) {
          const runs = [];
          for (const [short, list] of units) {
            const last = runs[runs.length - 1];
            if (last && (last.ids.length < 3 || last.ids.length + list.length < 30)) { last.to = short; last.ids.push(...list); }
            else runs.push({ from: short, to: short, ids: [...list] });
          }
          if (runs.length > 1 && runs[runs.length - 1].ids.length < 3) { const end = runs.pop(), last = runs[runs.length - 1]; last.to = end.to; last.ids.push(...end.ids); }
          if (runs.length > 1) for (const r of runs) add(`${k.label} · ${r.from === r.to ? r.from : `${r.from}–${r.to}`}`, once(r.ids), 'cut ' + r.from);
        } else if (units) for (const [short, list, name] of units) add(name || short, list, 'cut ' + short);
      } else {
        for (const [P, units] of above) if (!P.code) for (const [short, list, name] of units) add(name || short, list, `in ${P.k.key} ${short}`, P.k.label);
        if (own) for (const [title, list] of own) add(title, list, 'group ' + title, 'groups');
      }
      const proper = /^\p{Lu}/u.test(k.noun[1]);
      rounds.push({ kind: k.key, label: rounds.some(r => r.kind === k.key) ? `All ${proper ? k.label : k.label[0].toLowerCase() + k.label.slice(1)}` : k.label });
    });
    return rounds;
  }

  return { list, items, of: id => list.find(r => r.id === id) || null };
}
