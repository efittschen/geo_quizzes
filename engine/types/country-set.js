// Quizzes of sets of countries on the world map (a currency's symbol, a camera generation, road lines), without
// pictures of their own: builds QUIZ, the engine's config (engine/model/quiz.js), from SETS (a quiz's data.js, made by
// tools/cache/builds/geohints-all/scripts/build-text.mjs from GeoHints) and the world map (WORLD in world.js). Every
// place on the map can be clicked.
//   SETS = { meta, source, kinds: [{ key, label, noun: [one, many], mode, prompt, sets: [{ key, label, places, … }] }] }
//   mode 'any': a set is one question, answered by a click on any of its places (a currency's symbol: a place that
//               uses it); shown as text (text, tag) on the sign card. Rounds: the sets of each continent, then all.
//   mode 'all': a set is asked once per continent, and every place of the continent in it is to be clicked (Gen 2 ·
//               Europe); shown by name, or as a drawing (svg: the road lines, with the continent under them). A set's
//               photo comes with the answer. Rounds: each continent (framed), each set, then all.
// Size alone sets a round's level, as everywhere.

const QUIZ = (() => {
  const W = Object.fromEntries(WORLD.reg.map(r => [r.id, r]));
  const BASE = new URL('.', document.querySelector('script[src$="data.js"]').src).href;
  const CONT = ['Africa', 'Asia', 'Europe', 'North America', 'Oceania', 'South America'];
  const continentOf = id => W[id].c;
  const names = ids => ids.map(id => W[id].n);
  const short = ids => { const n = names(ids); return n.length > 6 ? `${n.slice(0, 5).join(' · ')} +${n.length - 5}` : n.join(' · '); };
  const boxOf = ids => {
    const b = ids.map(id => W[id].b);
    const x0 = Math.min(...b.map(v => v[0])), y0 = Math.min(...b.map(v => v[1])), x1 = Math.max(...b.map(v => v[2])), y1 = Math.max(...b.map(v => v[3]));
    const m = Math.max(x1 - x0, y1 - y0) * .06;
    return [x0 - m, y0 - m, x1 + m, y1 + m];
  };
  // The frame of a continent's rounds: all of it, not only its answers (which it would give away); Europe without Russia,
  // Oceania without the islands east of the date line.
  const FRAME = Object.fromEntries(CONT.map(c => [c, boxOf(WORLD.reg.filter(r => r.c === c && r.id !== 'RUS' && (c !== 'Oceania' || r.b[0] > 1000)).map(r => r.id))]));
  const ABBR = { 'Africa': 'AF', 'Asia': 'AS', 'Europe': 'EU', 'North America': 'NA', 'Oceania': 'OC', 'South America': 'SA' };

  const COLORS = { white: '#f4f4f4', yellow: '#f2c200', red: '#d22', blue: '#1f5fd1', orange: '#f28c00', green: '#1a9e3c' };
  // Road lines: a stretch of road from above, its left edge, centre and right edge lines, the continent under it.
  const drawLines = (lines, caption) => {
    const x = [34, 120, 206], bars = lines.flatMap((cols, i) => cols.map((col, j) => `<rect x="${x[i] - (cols.length - 1) * 7 + j * 14 - 4}" y="0" width="8" height="200" fill="${COLORS[col] || col}"/>`)).join('');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 236"><rect width="240" height="236" fill="#fff"/><rect x="10" y="0" width="220" height="200" fill="#5b5d60"/>${bars}<text x="120" y="226" font-family="Arial,sans-serif" font-size="20" font-weight="600" text-anchor="middle" fill="#222">${caption}</text></svg>`;
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
  };

  const areas = [...WORLD.reg.filter(r => !r.dot), ...WORLD.reg.filter(r => r.dot)]
    .map(r => ({ id: r.id, d: r.dot ? `M${r.lx},${r.ly}l0,0` : r.d, lx: r.lx, ly: r.ly, a: r.a, g: '', dot: !!r.dot }));

  const rounds = [], kinds = [], explain = [];
  for (const k of SETS.kinds) {
    const ITEM = {};
    if (k.mode === 'all') {
      for (const [si, s] of k.sets.entries()) for (const c of CONT) {
        const at = s.places.filter(id => W[id] && continentOf(id) === c);
        if (at.length) ITEM[`${si}.${c}`] = { s, si, c, at, name: k.sets.length > 1 ? `${s.label} · ${c}` : c };
      }
    } else {
      for (const [si, s] of k.sets.entries()) { const at = s.places.filter(id => W[id]); if (at.length) ITEM[String(si)] = { s, si, at, name: s.label }; }
    }
    const ids = Object.keys(ITEM);
    const inCont = c => ids.filter(id => k.mode === 'all' ? ITEM[id].c === c : ITEM[id].at.some(p => continentOf(p) === c));
    const groups = k.mode === 'all'
      ? k.sets.map((s, si) => ({ title: s.label, sub: '', ids: ids.filter(id => ITEM[id].si === si) })).filter(g => g.ids.length)
      : CONT.map(c => ({ title: c, sub: '', ids: ids.filter(id => continentOf(ITEM[id].at[0]) === c) })).filter(g => g.ids.length);
    const one = k.noun[0], many = k.noun[1];
    for (const c of CONT) { const r = inCont(c); if (r.length) rounds.push({ kind: k.key, key: 'cont.' + c, label: SETS.kinds.length > 1 ? `${k.label} · ${c}` : c, ids: r, box: FRAME[c] }); }
    if (k.mode === 'all' && k.sets.length > 1) for (const g of groups) if (g.ids.length > 1) rounds.push({ kind: k.key, key: 'set.' + g.title, label: g.title, ids: g.ids });
    rounds.push({ kind: k.key, key: 'all', label: `All ${many}`, ids });
    const photoOf = id => {
      const it = ITEM[id];
      if (k.prompt === 'photo') return { src: drawLines(it.s.lines, it.c || ''), alt: one, label: it.name };
      const f = it.s.photo || k.photo;
      return f ? { src: `${BASE}img/${f}`, alt: one, label: it.s.label } : null;
    };
    const withPhoto = k.prompt === 'photo' || k.sets.some(s => s.photo) || k.photo;
    kinds.push({
      key: k.key, label: k.label, noun: k.noun, sub: `${k.sets.length} ${k.sets.length === 1 ? one : many}`, pickTitle: `${many[0].toUpperCase()}${many.slice(1)} to practice`,
      groups,
      areasOf: id => ITEM[id].at,
      ...(k.mode === 'all' ? { clickAll: true, dim: false, primary: () => null } : {}),
      areaLabel: a => W[a].i2 || a, flashArea: true, areaRank: false, hints: false, merge: false,
      short: id => ITEM[id].s.short || ITEM[id].name, name: id => ITEM[id].name,
      about: id => k.mode === 'all' ? '' : [ITEM[id].s.about, short(ITEM[id].at)].filter(Boolean).join(' · '),
      clicked: a => W[a].n,
      prompt: k.prompt,
      ...(k.prompt === 'text' ? { text: id => ({ text: ITEM[id].s.text || ITEM[id].s.label, tag: ITEM[id].s.tag || '', cls: 's-latn', lang: '' }) } : {}),
      ...(withPhoto ? { photo: id => photoOf(id) || { src: drawLines([[], [], []], ''), alt: '', label: ITEM[id].name } } : {}),
      chip: id => k.mode === 'all' ? ABBR[ITEM[id].c] : String(groups.find(g => g.ids.includes(id)).ids.indexOf(id) + 1),
      chipTitle: id => ITEM[id].name,
    });
    explain.push(a => { const mine = ids.filter(id => ITEM[id].at.includes(a)); return !mine.length ? '' : k.sets.length === 1 ? k.label : `${k.label}: ${[...new Set(mine.map(id => ITEM[id].s.short || ITEM[id].s.label))].join(' · ')}`; });
  }

  return {
    key: SETS.meta,
    areas, borders: [],
    size: [WORLD.w, WORLD.h], pad: 12, flyAnswer: true,
    maxZoom: 60, labelScale: .38, fly: { pad: 2.4, min: .5 },
    hintLabel: '', hintsDefault: false,
    exploreKind: SETS.kinds[0].key,
    explore: a => ({ code: W[a].i2 || a, title: W[a].n, sub: explain.map(f => f(a)).filter(Boolean) }),
    rounds, kinds,
  };
})();
