// The map type: every quiz of items placed on a map (regions, area codes, postcodes, plate codes, road numbers, and
// the other clues that share their maps). It builds QUIZ, the engine's config (engine/model/quiz.js), from the
// map's outlines and the quiz's own three files, which a tool writes out in full:
//   data/maps/<map>/shapes.js       DATA (the map's global): outlines, label points, sizes, lines, and in DATA.drawn
//                                   what its quizzes add to its drawing: circles (tiny areas drawn as one), top
//                                   (areas drawn above their neighbours), pins (a layer's points), lines
//   data/quizzes/<id>/settings.js   SETTINGS: the quiz's key and view, and its layers: how each is asked
//   data/quizzes/<id>/names.js      NAMES: every word the quiz shows, per layer and item, per area
//   data/quizzes/<id>/facts.js      FACTS: the areas of every item, the items of every group, each area's hint group
// Nothing is worked out here but what depends on the moment: a random example is drawn each time an item is asked,
// and a name in another script is read where the page loads engine/types/reading.js. Typed answers are checked by
// the engine, from an item's name and its other spellings (answers).
//
//   SETTINGS = { key, map, borders, size, pad, maxZoom, labelScale, fly, hintLabel, exploreKind, hintsDefault,
//                langsAlways, kinds: [layer…] }
//     map        where the areas are: 'DATA.reg', { list: 'DATA.ddd', id: 'c' } where their id has another name, or
//                { paths: 'DATA.ent', ids } for a bare list of outlines (label points and sizes beside it, in <paths>At)
//     borders    the map's lines drawn over the areas ('DATA.rb')
//     circles, top   true: the quiz draws the map's tiny areas as circles, the map's top areas above their neighbours
//   layer = { key, label, noun, prompt, modes, detail (its option's label), typed, time, presets, rankings, pool,
//             and the engine's switches (hints, clickAll, merge, dim, of, lang, like, groupsOnly …) }
//     typed      true: the answer is typed, checked from the item's name and NAMES' answers; time: a typed
//                answer's clock, in clicks
//     pool       the tables drawn at random (NAMES' pool: an item's entries; FACTS' weights)
//   NAMES = { explore: { area: { code, title, sub } }, groups: { layer: [[title, sub]…] },
//             kinds: { layer: { name, short, chip, chipTitle, about, dial, text, detail, pin, answers (per item),
//                               clicked, areaLabel (per area), pool: { table: { item: [entries] } } } } }
//   FACTS = { g: { area: hint group }, groups: { layer: [[ids]…] },
//             kinds: { layer: { areas, chipClass (per item), primary, colors (per area), expand: [per ranking],
//                               weights: { item: [weights] } } } }
const QUIZ = (() => {
  const S = SETTINGS, N = NAMES, F = FACTS;
  const map = name => new Function(`return ${name}`)(); // (a list of the map: 'DATA.reg')
  const look = t => t && (k => t[k]);
  // a random example: one of an item's entries, by its weights if it has them
  const draw = (list, w) => { let i = Math.random() * list.length | 0; if (w) { let x = Math.random() * w.reduce((s, v) => s + v, 0); i = Math.max(0, w.findIndex(v => (x -= v) < 0)); } return list[i]; };
  const kind = k => {
    const n = N.kinds[k.key] || {}, f = F.kinds[k.key] || {}, { pool, detail, typed, time, rankings, presets, ...rest } = k;
    const K = { ...rest, groups: N.groups[k.key].map(([title, sub], i) => ({ title, sub, ids: F.groups[k.key][i] })), areasOf: id => f.areas[id] };
    for (const t of ['name', 'short', 'chip', 'chipTitle', 'about', 'dial', 'text']) if (n[t]) K[t] = look(n[t]);
    if (f.chipClass) K.chipClass = look(f.chipClass);
    if (n.pin) K.pin = id => { const p = drawn.pins && drawn.pins[k.key] && drawn.pins[k.key][id]; return p ? { x: p[0], y: p[1], label: n.pin[id] } : n.pin[id] === null ? null : undefined; }; // (null: an item with no pin)
    if (n.areaLabel) K.areaLabel = look(n.areaLabel);
    if (n.clicked) K.clicked = look(n.clicked);
    for (const t of pool || []) K[t] = id => draw(n.pool[t][id], f.weights && f.weights[id]);
    if (f.primary) K.primary = a => f.primary[a] ?? undefined;
    if (detail) K.detail = { label: detail, text: look(n.detail) };
    if (f.colors) K.unitColors = u => f.colors[u[0]];
    if (presets) K.presets = presets.map(([label, ids]) => ({ label, ids }));
    if (rankings) K.rankings = rankings.map(([label, order], i) => ({ label, order, ...(f.expand && f.expand[i] ? { expand: look(f.expand[i]) } : {}) }));
    if (typed) { K.typed = true; if (n.answers) K.answers = id => n.answers[id] || []; const c = time || 3; K.time = () => c; }
    // a layer of names in another script: its Type mode reads them (READING.name), where the page loads the files of
    // their scripts and engine/types/reading.js
    if (K.modes && K.modes.includes('type') && k.prompt === 'text' && n.text && typeof READING === 'object') {
      const read = {}, ofName = id => N.kinds[k.of]?.name?.[id];
      for (const id in n.text) { const t = n.text[id], r = t && READING.name(t.text, t.lang); if (r) read[id] = r; }
      if (Object.keys(read).length) K.typeMode = {
        text: id => (read[id] ? { ...n.text[id], cls: read[id].face() } : n.text[id]),
        typed: (id, text) => (read[id] && read[id].accepts(text, [ofName(id)].filter(Boolean))) || undefined, // (else the usual check)
        say: id => n.text[id] && { text: n.text[id].text, lang: n.text[id].lang },
        time: id => 1 + String(n.text[id]?.text || '').length / 4, // a click's time for reading, and as much again for every four letters
      };
    }
    return K;
  };
  const { kinds, map: where, borders, circles, top: above, ...view } = S;
  const listName = typeof where === 'string' ? where : where.list || where.paths, idKey = where.id || 'id';
  const holder = map(listName.split('.')[0]) || {}, drawn = holder.drawn || {}; // (what holds the areas: DATA for DATA.reg)
  const at = where.paths ? map(where.paths + 'At') : null;
  const list = where.paths ? map(where.paths).map((d, i) => ({ id: where.ids[i], d, ...(at && at[i] ? { lx: at[i][0], ly: at[i][1], s: at[i][2] } : {}) })) : map(listName);
  const top = new Set(above ? drawn.top : []), d = circles ? drawn.circles : {};
  return {
    ...view,
    areas: list.map(r => { const id = String(r[idKey]); return { id, d: d[id] || r.d, lx: r.lx, ly: r.ly, a: r.a, g: F.g[id], ...(top.has(id) ? { top: true } : {}), ...(r.s !== undefined ? { s: r.s } : {}), ...(d[id] && r.s !== undefined ? { real: r.d } : {}) }; }),
    borders: borders ? [].concat(map(borders)) : [],
    ...(holder.proj ? { proj: holder.proj } : typeof DATA === 'object' && DATA.proj ? { proj: DATA.proj } : {}),
    explore: a => N.explore[a],
    kinds: kinds.map(kind),
  };
})();
