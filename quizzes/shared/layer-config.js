// Layer quizzes: one base script for every map quiz that is layers of labels on a map (regions, area codes,
// postcodes, and the other clues that share their maps). It builds the QUIZ config for ./area-quiz.js from a quiz's
// data, LAYERS (the folder's layers.js), and its map. No quiz has code of its own: a layers.js says what each item
// is called, where it is and what is shown with it, and nothing else.
//
// A page loads its map (data.js, geo.js), layers.js, this file and area-quiz.js. Rounds are not in the data: the
// engine makes them the same way for every quiz (see "rounds" in area-quiz.js).
//
//   LAYERS = { key, map, geo, context, borders, size, pad, maxZoom, labelScale, fly, street, hintLabel, exploreKind,
//              g, d, top, explore, kinds: [layer…] }
//     map        where the areas are: 'DATA.reg' (the default), or ['DATA.ddd', 'c'] when their id has another name,
//                or { paths: 'DATA.ent', cols: { id: […], name: […] } } for a bare list of outlines: cols gives
//                each one its id and fields
//     geo, context, borders   names too ('GEO', 'DATA.ctx', '[DATA.rb]': a list holding it), or the paths themselves
//     g          each area's hint-color group; d: paths that replace the map's (a tiny area drawn as a circle),
//                top: the areas drawn above their neighbours
//     explore    what Explore shows for an area: { code, title, sub }
//   layer = { key, label, noun, prompt, groups: [[title, sub, ids]…], areas, name, short, chip, chipTitle, about,
//             detail: [label, text], dial, text, pin, clicked, primary, areaLabel, colors (per area: the colors a
//             group of areas may take, by its first area), presets: [[label, ids]…],
//             rankings: [[label, order]…], of, lang, and the engine's switches (hints, clickAll, merge, dim…) }
//     areas      the areas of each item: '@code' (those whose field `code` is the item's id), '@codes[]' (whose list
//                holds it), '@code^' (whose value starts with it), or a table
//     of, lang   the same items in another language or under another label (see area-quiz.js)
//     pool       tables drawn at random: { dial: { t: pattern, e: { item: [entries] } }, w: { item: [weights] } }
//                shows one of an item's entries each time it is asked (an example number of an area code, a town's
//                sign); an entry is the list of what fills the pattern's {0}, {1}…, or the value itself without t
//
// Everything said per item or per area is a table. A table is written as a pattern where one fits: "{name}, {@city}"
// is filled in for every row from what is known about it. For an item: {id}, its other tables ({name}, {short},
// {chip}, {chipTitle}, {detail}), its group's {group} and {groupSub}, and the fields its areas share ({@region}:
// the map's field `region`, lists joined with ", "). For an area: {a}, its fields, and the same of the item the area
// belongs to in this layer ({p} is that item's id, {about0} its first line). Explore knows every layer's:
// {codes.name}. A table is one of
//   "pattern"                          every row
//   { t: pattern, x: { row: value } }  the rows in x are written out
//   { x: { row: value } }              no pattern
// A pattern can be a list or an object of patterns (lines, the parts of a code); with drop: true, lines that come
// out empty are left out.

const layerLib = (() => {
  const SKIP = new Set(['d', 'lx', 'ly', 'a']);
  const flat = v => Array.isArray(v) ? v.every(x => x === null || typeof x !== 'object') ? v.join(', ') : null : v === null || v === undefined || typeof v === 'object' ? null : String(v);
  const fill = (t, v) => t.replace(/\{([^{}]+)\}/g, (_, k) => v[k] ?? '');
  const build = (tree, v) => typeof tree === 'string' ? fill(tree, v)
    : Array.isArray(tree) ? tree.map(x => build(x, v))
    : tree && typeof tree === 'object' ? Object.fromEntries(Object.entries(tree).map(([k, x]) => [k, build(x, v)])) : tree;
  // The rows of a table (see the top of the file): keys are item or area ids, varsOf(key) what is known about one.
  function table(spec, keys, varsOf) {
    const out = {};
    const pattern = typeof spec === 'string' ? spec : spec.t, x = (typeof spec === 'object' && spec.x) || {};
    for (const k of keys) {
      if (k in x) { out[k] = x[k]; continue; }
      if (pattern === undefined) continue;
      const v = build(pattern, varsOf(k));
      out[k] = spec.drop ? v.filter(Boolean) : v;
    }
    return out;
  }
  // What is known about an area from the map: its fields as text.
  const fieldVars = r => { const v = {}; for (const f in r) if (!SKIP.has(f)) { const s = flat(r[f]); if (s !== null) v['@' + f] = s; } return v; };
  // … and about an item: the fields its areas share.
  function sharedVars(areas, FV) {
    const v = {};
    if (!areas.length) return v;
    for (const f in FV[areas[0]]) { const s = FV[areas[0]][f]; if (areas.every(a => FV[a][f] === s)) v[f] = s; }
    return v;
  }
  // The areas of each item of a layer.
  function areasOf(spec, ids, list, idKey) {
    if (typeof spec !== 'string') return Object.fromEntries(ids.map(id => [id, spec.x[id] || []]));
    const m = spec.match(/^@(.+?)(\[\])?(\^)?$/), f = m[1], many = !!m[2], prefix = !!m[3];
    const out = Object.fromEntries(ids.map(id => [id, []])), lengths = [...new Set(ids.map(id => String(id).length))];
    for (const r of list) {
      const seen = new Set();
      for (const v of many ? r[f] || [] : r[f] === undefined || r[f] === null ? [] : [r[f]]) for (const key of prefix ? lengths.map(n => String(v).slice(0, n)) : [String(v)]) {
        if (seen.has(key) || !Object.hasOwn(out, key) || (prefix && !String(v).startsWith(key))) continue;
        seen.add(key); out[key].push(String(r[idKey]));
      }
    }
    return out;
  }

  // The parts of a quiz that the tables are filled from; the compressor (tools/builds/layers) uses the same ones.
  function model(L, resolve) {
    const m = L.map || 'DATA.reg', [path, idKey] = m.paths ? [m.paths, 'id'] : [].concat(m).concat('id');
    const list = m.paths ? resolve(path).map((d, i) => ({ d, ...Object.fromEntries(Object.entries(m.cols).map(([f, col]) => [f, col[i]])) })) : resolve(path);
    const AREAS = list.map(r => String(r[idKey]));
    const R = Object.fromEntries(list.map(r => [String(r[idKey]), r]));
    const FV = Object.fromEntries(AREAS.map(a => [a, fieldVars(R[a])]));
    return { list, idKey, AREAS, R, FV, kinds: {} };
  }
  const ITEM_TABLES = ['name', 'short', 'chip', 'chipTitle', 'detail', 'about', 'dial', 'text', 'pin', 'chipClass'];
  const AREA_TABLES = ['clicked', 'areaLabel', 'colors'];
  // What is known about an item while its tables are filled, one after the other.
  function itemVars(M, K, id) {
    if (!K.groupOf) { K.groupOf = new Map(); for (const g of K.groups) for (const i of g[2]) if (!K.groupOf.has(i)) K.groupOf.set(i, g); }
    const g = K.groupOf.get(id) || [];
    const v = { id: String(id), group: g[0] || '', groupSub: g[1] || '', ...sharedVars(K.areas[id], M.FV) };
    for (const t of ['name', 'short', 'chip', 'chipTitle', 'detail']) if (K.T[t] && typeof K.T[t][id] === 'string') v[t] = K.T[t][id];
    return v;
  }
  // … and about an area in a layer: its fields and the item it belongs to there.
  function areaVars(M, K, a, prefix = '') {
    const p = K.primary[a], v = {};
    if (p === undefined || p === null) return v;
    v[prefix + 'p'] = String(p);
    for (const t of ['name', 'short', 'chip', 'chipTitle', 'detail']) if (K.T[t] && typeof K.T[t][p] === 'string') v[prefix + t] = K.T[t][p];
    const about = K.T.about && K.T.about[p];
    if (Array.isArray(about)) about.forEach((line, i) => { if (typeof line === 'string') v[prefix + 'about' + i] = line; });
    return v;
  }
  // One layer: its items, their areas and its tables, in the order they can refer to each other.
  function layer(M, k) {
    const ids = [...new Set(k.groups.flatMap(g => g[2]))];
    const K = M.kinds[k.key] = { key: k.key, groups: k.groups, ids, areas: areasOf(k.areas, ids, M.list, M.idKey), T: {}, primary: {} };
    const first = {};
    for (const id of ids) for (const a of K.areas[id]) first[a] ??= id;
    for (const t of ITEM_TABLES) {
      const spec = t === 'detail' ? k.detail && k.detail[1] : k[t];
      if (spec !== undefined) K.T[t] = table(spec, ids, id => itemVars(M, K, id));
    }
    K.primary = k.primary === undefined ? first : { ...first, ...table(k.primary, M.AREAS, a => ({ a, ...M.FV[a] })) };
    for (const a of M.AREAS) if (K.primary[a] === undefined) K.primary[a] = null;
    for (const t of AREA_TABLES) {
      if (k[t] !== undefined) K.T[t] = table(k[t], M.AREAS, a => ({ a, ...M.FV[a], ...areaVars(M, K, a) }));
    }
    return K;
  }
  const quizVars = (M, a) => Object.assign({ a }, M.FV[a], ...Object.values(M.kinds).map(K => areaVars(M, K, a, K.key + '.')));

  const SWITCHES = ['prompt', 'hints', 'clickAll', 'merge', 'dim', 'labelPerArea', 'areaRank', 'flashArea', 'hintLabel', 'of', 'lang', 'sub', 'pickTitle'];
  function quiz(L, resolve) {
    const M = model(L, resolve);
    const at = v => typeof v !== 'string' ? v : /^\[.*\]$/.test(v) ? [resolve(v.slice(1, -1))] : resolve(v);
    // A table drawn at random (pool): one of an item's entries each time it is asked, by weight (w) if given.
    const draw = (list, w) => { let i = Math.random() * list.length | 0; if (w) { let x = Math.random() * w.reduce((s, v) => s + v, 0); i = Math.max(0, w.findIndex(v => (x -= v) < 0)); } return list[i]; };
    const kinds = L.kinds.map(k => {
      const K = layer(M, k), T = K.T, fn = t => T[t] && (id => T[t][id]);
      const out = { key: k.key, label: k.label, noun: k.noun, groups: k.groups.map(([title, sub, ids]) => ({ title, sub, ids })), areasOf: id => K.areas[id] };
      for (const s of SWITCHES) if (k[s] !== undefined) out[s] = k[s];
      for (const t of ['name', 'short', 'chip', 'chipTitle', 'about', 'dial', 'text', 'pin', 'chipClass', 'areaLabel']) if (T[t]) out[t] = fn(t);
      if (T.clicked) out.clicked = a => T.clicked[a];
      for (const t in k.pool || {}) if (t !== 'w') out[t] = id => { const p = k.pool[t], e = draw(p.e[id], k.pool.w && k.pool.w[id]); return p.t === undefined ? e : build(p.t, e); };
      if (k.primary !== undefined) out.primary = a => K.primary[a] ?? undefined;
      if (k.detail) out.detail = { label: k.detail[0], text: id => T.detail[id] };
      if (T.colors) out.unitColors = u => T.colors[u[0]];
      if (k.presets) out.presets = k.presets.map(([label, ids]) => ({ label, ids }));
      if (k.rankings) out.rankings = k.rankings.map(([label, order, expand]) => ({ label, order, ...(expand ? { expand: id => expand[id] } : {}) }));
      return out;
    });
    const g = table(L.g, M.AREAS, a => quizVars(M, a)), top = new Set(L.top || []), d = L.d || {};
    const explore = table(L.explore, M.AREAS, a => quizVars(M, a));
    return {
      key: L.key,
      areas: M.list.map(r => { const id = String(r[M.idKey]); return { id, d: d[id] || r.d, lx: r.lx, ly: r.ly, a: r.a, g: g[id], ...(top.has(id) ? { top: true } : {}) }; }),
      borders: at(L.borders || []),
      ...(L.context === false ? {} : { context: typeof L.context === 'object' ? L.context.d : resolve(L.context || 'DATA.ctx') }),
      size: L.size, pad: L.pad, maxZoom: L.maxZoom, labelScale: L.labelScale, fly: L.fly,
      ...(L.geo === false ? {} : { geo: resolve(L.geo || 'GEO'), street: L.street }),
      hintLabel: L.hintLabel, exploreKind: L.exploreKind,
      ...(L.hintsDefault === undefined ? {} : { hintsDefault: L.hintsDefault }),
      explore: a => explore[a],
      kinds,
    };
  }
  return { quiz, model, layer, table, areasOf, itemVars, areaVars, quizVars, fill, build, ITEM_TABLES, AREA_TABLES, SWITCHES };
})();

// The page's quiz. (Names like 'DATA.reg' are looked up among the page's scripts.)
const QUIZ = typeof LAYERS === 'object' ? layerLib.quiz(LAYERS, name => new Function(`return ${name}`)()) : undefined;
