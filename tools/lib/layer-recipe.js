// The recipe language of the map type, run at build time only: tools/lib/quiz-files.mjs runs a quiz's recipe (LAYERS)
// on its map with this, once, and writes what it works out (every word, every list of areas) into the quiz's
// settings.js, names.js and facts.js, which the browser's engine/types/layer.js only looks up. It is the map type as
// it was until 2026-10-29, when every page's recipe was written out this way.
//
// A recipe, LAYERS, is one map quiz (regions, area codes, postcodes, and the other clues that share their maps): what
// each item of each layer is called, where it is and what is shown with it, in tables and patterns over the map's
// fields. Run with the map's globals (DATA …) beside it, this file builds the QUIZ the engine reads
// (engine/model/quiz.js); quiz-files.mjs writes that out. Rounds are not in a recipe: the engine makes them the same
// way for every quiz (engine/model/rounds.js).
//
//   LAYERS = { key, map, borders, size, pad, maxZoom, labelScale, fly, hintLabel, exploreKind,
//              g, d, top, explore, kinds: [layer…] }
//     map        where the areas are: 'DATA.reg' (the default), or ['DATA.ddd', 'c'] when their id has another name,
//                or { paths: 'DATA.ent', cols: { id: […], name: […] } } for a bare list of outlines: cols gives
//                each one its id and fields
//     borders    a name too ('[DATA.rb]': a list holding it), or the paths themselves
//     g          each area's hint-color group; d: paths that replace the map's (a tiny area drawn as a circle),
//                top: the areas drawn above their neighbours
//     explore    what Explore shows for an area: { code, title, sub }
//     phone      true: the layers asked with prompt 'dial' are phone area codes (they are played the other way round
//                too, the area outlined and its code typed: Type code, engine/model/kinds.js)
//     plates     true: the same for licence plate codes, of letters as well as digits (Romania's CJ, Russia's 77)
//   layer = { key, label, noun, prompt, groups: [[title, sub, ids]…], areas, name, short, chip, chipTitle, about,
//             detail: [label, text], dial, text, pin, clicked, primary, areaLabel, colors (per area: the colors a
//             group of areas may take, by its first area), presets: [[label, ids]…],
//             rankings: [[label, order]…], of, lang, and the engine's switches (hints, clickAll, merge, dim…) }
//     areas      the areas of each item: '@code' (those whose field `code` is the item's id), '@codes[]' (whose list
//                holds it), '@code^' (whose value starts with it), or a table
//     of, lang   the same items in another language or under another label (see engine/model/rounds.js); names in another
//                script (prompt 'text') are read in its Type mode where the page loads their script (engine/types/reading.js)
//     like       '<key>': the layer is another one asked another way: it takes that layer's groups, areas and
//                tables, and its own say what differs (its key, label, prompt…). Its review cards are its own.
//     typed      the answer is typed, not clicked: { answers: a table of the other names that count (a list per
//                item; the item's name always counts), time: how many clicks' time an answer may take in a review }.
//                Capitals, accents, spaces and punctuation don't matter, nor one letter wrong in a name of six or
//                more (or two letters swapped), unless what is typed is another item's name. Mostly with prompt: 'area' (see engine/model/kinds.js)
//     groupsOnly the layer is not asked: it only cuts the layers below it into rounds (see engine/model/rounds.js)
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
    // (bare outlines: their label points and sizes on the ground beside them: <path>At)
    const at = m.paths && resolve(path + 'At');
    const list = m.paths ? resolve(path).map((d, i) => ({ d, ...(at && at[i] ? { lx: at[i][0], ly: at[i][1], s: at[i][2] } : {}), ...Object.fromEntries(Object.entries(m.cols).map(([f, col]) => [f, col[i]])) })) : resolve(path);
    const AREAS = list.map(r => String(r[idKey]));
    const R = Object.fromEntries(list.map(r => [String(r[idKey]), r]));
    const FV = Object.fromEntries(AREAS.map(a => [a, fieldVars(R[a])]));
    const holder = String(path).includes('.') ? resolve(String(path).split('.')[0]) : null; // (what holds the areas: DATA for DATA.reg)
    return { list, idKey, AREAS, R, FV, kinds: {}, holder };
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

  const SWITCHES = ['prompt', 'hints', 'clickAll', 'merge', 'dim', 'labelPerArea', 'areaRank', 'flashArea', 'hintLabel', 'of', 'lang', 'sub', 'pickTitle', 'groupsOnly', 'like', 'ask'];
  // A typed name as it is compared: no capitals, accents, spaces or punctuation ("&" is "and").
  const plainName = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/&/g, 'and').replace(/[^\p{L}\p{N}]+/gu, '');
  // Whether two names are one slip apart: a letter added, dropped or changed, or two letters swapped.
  function oneOff(a, b) {
    if (Math.abs(a.length - b.length) > 1) return false;
    let i = 0; while (i < a.length && a[i] === b[i]) i++;
    return a.slice(i + 1) === b.slice(i + 1) || a.slice(i) === b.slice(i + 1) || a.slice(i + 1) === b.slice(i)
      || (a[i] === b[i + 1] && a[i + 1] === b[i] && a.slice(i + 2) === b.slice(i + 2));
  }
  // typed(id, text) of a layer: its items' names and other names (forms[id]: plain names).
  function typedOf(forms) {
    const owner = new Map();
    for (const [id, list] of Object.entries(forms)) for (const f of list) (owner.get(f) || owner.set(f, new Set()).get(f)).add(id);
    return (id, text) => {
      const t = plainName(text), mine = forms[id] || [];
      if (mine.includes(t)) return true;
      if (owner.has(t)) return false; // another item's name, exactly
      return t.length >= 6 && mine.some(f => f.length >= 6 && oneOff(t, f));
    };
  }
  function quiz(L, resolve) {
    const M = model(L, resolve), PHONE = L.phone === true, PLATES = L.plates === true;
    const at = v => typeof v !== 'string' ? v : /^\[.*\]$/.test(v) ? [resolve(v.slice(1, -1))] : resolve(v);
    // A table drawn at random (pool): one of an item's entries each time it is asked, by weight (w) if given.
    const draw = (list, w) => { let i = Math.random() * list.length | 0; if (w) { let x = Math.random() * w.reduce((s, v) => s + v, 0); i = Math.max(0, w.findIndex(v => (x -= v) < 0)); } return list[i]; };
    const kinds = L.kinds.map(k => {
      if (k.like) { const base = L.kinds.find(b => b.key === k.like); if (base) k = { ...base, ...k }; }
      const K = layer(M, k), T = K.T, fn = t => T[t] && (id => T[t][id]);
      const out = { key: k.key, label: k.label, noun: k.noun, groups: k.groups.map(([title, sub, ids]) => ({ title, sub, ids })), areasOf: id => K.areas[id] };
      for (const s of SWITCHES) if (k[s] !== undefined) out[s] = k[s];
      if (k.of && !k.typed) out.modes = ['list', 'type', 'pairs', 'pick', 'pickback']; // (its names picked from a list or from four, typed or matched with those of the layer it is of, and the other way round: see the ways, engine/model/kinds.js)
      // a layer of phone codes (LAYERS.phone) is played the other way round too: the area outlined, its code typed
      // (MODES 'code'); not a layer of places dialled (their names have no digits)
      else if (PHONE && k.prompt === 'dial' && !k.groupsOnly && T.short && K.ids.every(id => /\d/.test(T.short[id]))) out.modes = ['code'];
      else if (PLATES && k.prompt === 'dial' && !k.groupsOnly && T.short) { out.modes = ['code']; out.plates = true; }
      for (const t of ['name', 'short', 'chip', 'chipTitle', 'about', 'dial', 'text', 'pin', 'chipClass', 'areaLabel']) if (T[t]) out[t] = fn(t);
      if (T.clicked) out.clicked = a => T.clicked[a];
      for (const t in k.pool || {}) if (t !== 'w') out[t] = id => { const p = k.pool[t], e = draw(p.e[id], k.pool.w && k.pool.w[id]); return p.t === undefined ? e : build(p.t, e); };
      if (k.primary !== undefined) out.primary = a => K.primary[a] ?? undefined;
      if (k.detail) out.detail = { label: k.detail[0], text: id => T.detail[id] };
      if (T.colors) out.unitColors = u => T.colors[u[0]];
      if (k.presets) out.presets = k.presets.map(([label, ids]) => ({ label, ids }));
      if (k.rankings) out.rankings = k.rankings.map(([label, order, expand]) => ({ label, order, ...(expand ? { expand: id => expand[id] } : {}) }));
      if (k.typed) {
        const more = k.typed.answers ? table(k.typed.answers, K.ids, id => itemVars(M, K, id)) : {};
        out.typed = typedOf(Object.fromEntries(K.ids.map(id => [id, [...new Set([T.name && T.name[id], ...[].concat(more[id] || [])].filter(Boolean).map(plainName))]])));
        const time = k.typed.time || 3; out.time = () => time;
      }
      // a layer of names in another script: its Type mode reads them (READING.name), where the page loads the files
      // of their scripts and engine/types/reading.js (tools/builds/languages writes them in)
      if (out.modes && out.modes.includes('type') && k.prompt === 'text' && T.text && typeof READING === 'object') {
        const read = {}, ofName = id => ((M.kinds[k.of] || {}).T || {}).name?.[id];
        for (const id of K.ids) { const t = T.text[id], r = t && READING.name(t.text, t.lang); if (r) read[id] = r; }
        if (Object.keys(read).length) out.typeMode = {
          text: id => (read[id] ? { ...T.text[id], cls: read[id].face() } : T.text[id]),
          typed: (id, text) => (read[id] && read[id].accepts(text, [ofName(id)].filter(Boolean))) || undefined, // (else the usual check)
          say: id => T.text[id] && { text: T.text[id].text, lang: T.text[id].lang },
          time: id => 1 + String(T.text[id]?.text || '').length / 4, // a click's time for reading, and as much again for every four letters
        };
      }
      return out;
    });
    const g = table(L.g, M.AREAS, a => quizVars(M, a)), top = new Set(L.top || []), d = L.d || {};
    const P = M.holder && M.holder.proj ? M.holder : typeof DATA === 'object' && DATA.proj ? DATA : null; // (the map's projection: where its areas are, else its data.js)
    const explore = table(L.explore, M.AREAS, a => quizVars(M, a));
    return {
      key: L.key,
      // (s: the area's size on the ground; real: its own outline where the layer draws it as a circle)
      areas: M.list.map(r => { const id = String(r[M.idKey]); return { id, d: d[id] || r.d, lx: r.lx, ly: r.ly, a: r.a, g: g[id], ...(top.has(id) ? { top: true } : {}), ...(r.s !== undefined ? { s: r.s } : {}), ...(d[id] && r.s !== undefined ? { real: r.d } : {}) }; }),
      borders: at(L.borders || []),
      size: L.size, pad: L.pad, maxZoom: L.maxZoom, labelScale: L.labelScale, fly: L.fly,
      ...(P ? { proj: P.proj } : {}), // how the map is projected, where its data says
      hintLabel: L.hintLabel, exploreKind: L.exploreKind,
      ...(L.hintsDefault === undefined ? {} : { hintsDefault: L.hintsDefault }),
      ...(L.langsAlways ? { langsAlways: true } : {}),
      explore: a => explore[a],
      kinds,
    };
  }
  return { quiz, model, layer, table, areasOf, itemVars, areaVars, quizVars, fill, build, ITEM_TABLES, AREA_TABLES, SWITCHES };
})();

// The page's quiz. (Names like 'DATA.reg' are looked up among the page's scripts.)
const QUIZ = typeof LAYERS === 'object' ? layerLib.quiz(LAYERS, name => new Function(`return ${name}`)()) : undefined;
