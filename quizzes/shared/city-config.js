// City quizzes: builds the QUIZ config for ./area-quiz.js from a country's CITIES data (made by tools/cities.mjs).
// Each city is a dot (Q.dots) on the country's land and region borders (Q.base); clicking the right dot answers.
// The kind 'en' asks the name in Latin letters: the English name, or, where the page names the language of the
// country's signs (CITY_OPTS.names), the name in that language, which is what a player sees there (München, not
// Munich; the English name is said with the answer). Where the local language is written in another script than
// Latin, the page names it (CITY_OPTS.lang) and the kind 'local' asks the name in that language and script: every
// round then offers both languages in its box (see area-quiz.js), the local one with the round's cities that have
// such a name. Rounds take the cities in list
// order: largest first, or the order cities.js names in CITIES.order (e.g. 'signs': the order players meet them on
// direction signs). Custom quizzes group them by region and can take the top N by that order or by population.
// Cities that share a name are asked with their region ("Portland, Oregon").
//
// Map play (QUIZ.free, see area-quiz.js): the click is turned into a place on Earth with the map's own projection
// (CITIES.proj, an equal-area conic), and the distance shown is the great-circle distance to the city. Cities drawn
// off the projection (insets such as Alaska, the Azores or Rapa Nui) are found by comparing their x/y with the
// projection; each inset is a frame of its own, with k (km per map unit, from cities.js, else the map's kpu).
// Points follow the distance as drawn on the map, so an inset is as forgiving per pixel as the main map; a click
// in another frame than the city scores by the real distance.
//
// A page loads its cities.js, optionally sets CITY_OPTS, then this file, then area-quiz.js:
//   CITY_OPTS = { key, lang: 'Thai', top: [8, 25, 50, 100] }
//     key         localStorage prefix (default <iso3>cities)
//     lang        the local language, when its script is not Latin: 'Thai', 'Russian', 'Local script' (India)
//     names       the language(s) of the country's signs, when written in Latin letters: 'de', ['fr']. A city whose
//                 local name (cities.js: local, lang) is in one of them is asked by it instead of its English name.
//                 Not for a second language of a country (Swedish in Finland, Māori in New Zealand): there the
//                 English name is the one on the signs.
//     top         sizes of the "Top N" rounds; a round with every city is added at the end
//     list        another list of cities on the country's map: { order, list }, from a file of the page's own. The
//                 page then loads the country's cities.js for the map and the regions, and this list replaces
//                 its cities (us-cities-coverage: the cities picked by Street View coverage).

const QUIZ = (() => {
  const O = typeof CITY_OPTS === 'object' ? CITY_OPTS : {}, C = O.list ? { ...CITIES, ...O.list } : CITIES;
  const BY = Object.fromEntries(C.list.map(c => [c.id, c]));
  const ALL = C.list.map(c => c.id); // list order: largest first, or CITIES.order
  const BY_POP = ALL.slice().sort((a, b) => BY[b].pop - BY[a].pop);
  const LATIN = /^[\p{Script=Latin}\p{Script=Common}\p{Script=Inherited}]*$/u;
  const LOCAL = O.lang ? ALL.filter(id => BY[id].local && !LATIN.test(BY[id].local)) : [];
  const NAMES = [].concat(O.names || []);
  // A city's name in Latin letters: as on the signs there, where the page says which language that is.
  const latin = id => { const c = BY[id]; return c.local && NAMES.includes(c.lang) && LATIN.test(c.local) ? c.local : c.en; };
  const english = id => (latin(id) === BY[id].en ? [] : [BY[id].en]); // said with it, where it is another name
  const region = id => C.regions[BY[id].adm] || BY[id].adm;
  const REGIONS = [...new Set(C.list.map(c => c.adm))]; // ordered by their largest city
  const groupsOf = ids => REGIONS.map(r => ({ title: C.regions[r] || r, sub: '', ids: ids.filter(id => BY[id].adm === r) })).filter(g => g.ids.length);
  const fmtPop = n => n >= 1e6 ? `${(n / 1e6).toFixed(n >= 1e7 ? 0 : 1)} million` : n.toLocaleString('en-US');
  const rank = id => (C.order ? BY_POP : ALL).indexOf(id) + 1; // "#N" next to the population: the population rank
  // Names asked twice in the list get their region, so "Portland" is never a coin flip.
  const dupes = of => { const n = {}; for (const c of C.list) if (of(c)) n[of(c)] = (n[of(c)] || 0) + 1; return n; };
  const DUP_EN = dupes(c => latin(c.id)), DUP_LOCAL = dupes(c => c.local);
  const fullEn = id => DUP_EN[latin(id)] > 1 ? `${latin(id)}, ${region(id)}` : latin(id);
  const fullLocal = id => DUP_LOCAL[BY[id].local] > 1 ? `${BY[id].local}, ${region(id)}` : BY[id].local;
  const capitals = ids => ids.filter(id => /^PPL[CA]$/.test(BY[id].fc));
  const sizes = O.top || [8, 25, 50, 100];

  const kind = (key, ids, extra) => ({
    key, noun: ['city', 'cities'], pickTitle: 'Cities to practice',
    groups: groupsOf(ids),
    areasOf: id => [id], primary: a => a,
    areaRank: false,
    rankings: C.order ? [{ label: C.order, order: ids }, { label: 'population', order: BY_POP.filter(id => ids.includes(id)) }] : [{ label: 'population', order: ids }],
    presets: [{ label: 'Capitals', ids: capitals(ids) }],
    merge: false,
    about: id => [...english(id), region(id), `#${rank(id)} · ${fmtPop(BY[id].pop)}`],
    chipTitle: id => region(id),
    ...extra,
  });

  const kinds = [
    kind('en', ALL, {
      label: 'English', lang: 'English', sub: `${ALL.length} cities`,
      prompt: 'name', name: fullEn, short: latin,
      clicked: a => fullEn(a), chip: fullEn,
    }),
  ];
  if (LOCAL.length) kinds.push(kind('local', LOCAL, {
    label: O.lang, lang: O.lang, of: 'en', sub: `${LOCAL.length} cities`,
    prompt: 'text', text: id => ({ text: fullLocal(id), lang: BY[id].lang, cls: 'city' }),
    name: fullLocal, short: id => BY[id].local,
    clicked: a => BY[a].local ? `${fullLocal(a)} · ${latin(a)}` : fullEn(a),
    chip: fullLocal, chipTitle: id => `${latin(id)} · ${region(id)}`,
  }));

  // Hint colors by region from the shared palette (--h1…--h24): each region takes the color least used among its
  // nearest regions (by the mean position of its cities), so neighbours rarely share one.
  const PAL = 24, pos = {}, color = {}, used = Array(PAL).fill(0);
  for (const c of C.list) { const p = pos[c.adm] ??= { x: 0, y: 0, n: 0 }; p.x += c.x; p.y += c.y; p.n++; }
  for (const r of REGIONS) {
    const near = REGIONS.filter(q => color[q] !== undefined)
      .sort((a, b) => Math.hypot(pos[a].x / pos[a].n - pos[r].x / pos[r].n, pos[a].y / pos[a].n - pos[r].y / pos[r].n)
        - Math.hypot(pos[b].x / pos[b].n - pos[r].x / pos[r].n, pos[b].y / pos[b].n - pos[r].y / pos[r].n)).slice(0, 8);
    const taken = new Set(near.map(q => color[q]));
    const pick = [...Array(PAL).keys()].filter(i => !taken.has(i)).sort((a, b) => used[a] - used[b])[0] ?? 0;
    color[r] = pick; used[pick]++;
  }
  const style = document.createElement('style');
  style.textContent = REGIONS.map(r => `.r[data-g="${CSS.escape(r)}"]{--hint:var(--h${color[r] + 1})}`).join('\n');
  document.head.append(style);

  /* ---------- map play: where a click is on Earth ---------- */
  const RAD = Math.PI / 180;
  const hav = (a, b) => {
    const dl = (b.lat - a.lat) * RAD, dn = (b.lng - a.lng) * RAD;
    const h = Math.sin(dl / 2) ** 2 + Math.cos(a.lat * RAD) * Math.cos(b.lat * RAD) * Math.sin(dn / 2) ** 2;
    return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(h)));
  };
  // The map's projection, as d3's geoConicEqualArea: Albers USA maps use its lower-48 part (Alaska and Hawaii are insets).
  const PR = C.proj.type === 'albersUsa' ? { parallels: [29.5, 45.5], rotate: [96, 0], center: [-0.6, 38.7], scale: C.proj.scale, translate: C.proj.translate } : C.proj;
  const sy0 = Math.sin(PR.parallels[0] * RAD), cn = (sy0 + Math.sin(PR.parallels[1] * RAD)) / 2, cc = 1 + sy0 * (2 * cn - sy0), r0 = Math.sqrt(cc) / cn;
  const raw = (l, f) => { const r = Math.sqrt(cc - 2 * cn * Math.sin(f)) / cn; return [r * Math.sin(l * cn), r0 - r * Math.cos(l * cn)]; };
  const CEN = PR.center || [0, 33.6442]; // d3.geoConicEqualArea's own default centre, which tools/lib/geo.mjs keeps
  const [pcx, pcy] = raw(CEN[0] * RAD, CEN[1] * RAD);
  const forward = (lng, lat) => {
    const l = ((lng + PR.rotate[0] + 540) % 360 - 180) * RAD, [x, y] = raw(l, lat * RAD);
    return [PR.translate[0] + PR.scale * (x - pcx), PR.translate[1] - PR.scale * (y - pcy)];
  };
  const invert = (X, Y) => {
    const x = (X - PR.translate[0]) / PR.scale + pcx, y = (PR.translate[1] - Y) / PR.scale + pcy, ry = r0 - y;
    let l = Math.atan2(x, Math.abs(ry)) * Math.sign(ry);
    if (ry * cn < 0) l -= Math.PI * Math.sign(x) * Math.sign(ry);
    const s = (cc - (x * x + ry * ry) * cn * cn) / (2 * cn);
    return { lat: Math.asin(Math.max(-1, Math.min(1, s))) / RAD, lng: ((l / cn / RAD - PR.rotate[0] + 540) % 360) - 180 };
  };
  // Frames: 0 is the map itself; cities drawn off the projection form inset frames (those drawn at one scale together).
  const kOf = c => c.k || C.kpu, FRAME = {};
  let frames = 0;
  for (const c of C.list) { const [x, y] = forward(c.lng, c.lat); FRAME[c.id] = Math.hypot(x - c.x, y - c.y) > 2 ? -1 : 0; }
  for (const c of C.list) if (FRAME[c.id] === -1) {
    FRAME[c.id] = ++frames;
    for (const o of C.list) if (FRAME[o.id] === -1) { const real = hav(c, o); if (Math.abs(Math.hypot(c.x - o.x, c.y - o.y) * kOf(c) - real) < 0.25 * real + 5) FRAME[o.id] = frames; }
  }
  // A click belongs to the frame of the nearest city; in an inset its place is worked out from that city.
  const locate = p => {
    let near = C.list[0], best = Infinity;
    for (const c of C.list) { const d = (c.x - p.x) ** 2 + (c.y - p.y) ** 2; if (d < best) { best = d; near = c; } }
    const f = FRAME[near.id];
    if (!f) return { f, ...invert(p.x, p.y) };
    const k = kOf(near), lat = near.lat - (p.y - near.y) * k / 110.574;
    return { f, lat, lng: near.lng + (p.x - near.x) * k / (111.32 * Math.cos(lat * RAD)) };
  };
  const free = {
    span: Math.hypot(C.w, C.h) * C.kpu, // the map's diagonal in km: the D of the points formula
    frameOf: id => FRAME[id], // 0 = on the map itself, 1… = an inset
    // [km shown, km scored] for a click at map point p when city id is asked
    measure(p, id) {
      const c = BY[id], at = locate(p), drawn = Math.hypot(p.x - c.x, p.y - c.y);
      if (at.f !== FRAME[id]) { const km = hav(at, c); return [km, km]; }
      return at.f ? [drawn * kOf(c), drawn * C.kpu] : [hav(at, c), hav(at, c)];
    },
  };

  const rounds = [
    ...sizes.filter(n => n < ALL.length).map(n => ({ kind: 'en', label: `Top ${n}`, top: n })),
    { kind: 'en', label: 'All cities' },
  ];

  return {
    key: O.key || C.iso3.toLowerCase() + 'cities',
    areas: C.list.map(c => ({ id: c.id, d: `M${c.x},${c.y}l0,0`, lx: c.x, ly: c.y, a: 1, g: c.adm })),
    borders: [],
    context: C.ctx,
    base: { land: C.land, lines: C.lines },
    dots: true,
    free,
    streets: C,
    size: [C.w, C.h], pad: 16, maxZoom: 40, labelScale: 0.25, fly: { pad: 1.6, min: 1.5 / 40 },
    hintLabel: 'Color by region',
    exploreKind: 'en',
    explore: a => ({ code: LATIN.test(BY[a].local || '') ? latin(a) : BY[a].local, title: latin(a), sub: [...english(a), region(a), `#${rank(a)} · ${fmtPop(BY[a].pop)}`] }),
    rounds,
    kinds,
  };
})();
