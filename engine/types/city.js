// City quizzes: builds QUIZ, the engine's config (./engine/model/quiz.js), from a country's CITIES data (made by tools/cities.mjs).
// Each city is a dot (Q.dots) on the country's land and region borders (Q.base); clicking the right dot answers.
// The kind 'en' asks the name in Latin letters: the English name, or, where the page names the language of the
// country's signs (CITY_OPTS.names), the name in that language, which is what a player sees there (München, not
// Munich; the English name is said with the answer). Where the local language is written in another script than
// Latin, the page names it (CITY_OPTS.lang) and the kind 'local' asks the name in that language and script: every
// round then offers both languages in its box (see engine/screens/setup.js), the local one with the round's cities that have
// such a name. Its Type mode is reading (typeMode, see engine/model/kinds.js), where the page loads the files of the scripts
// its names are written in and engine/types/reading.js (tools/builds/languages writes them in): the name is shown in another
// typeface of its script each time, typed in Latin letters (the name on the map, the English one, or any spelling
// its letters allow; a slip in a long name, as in every Type), and said aloud once answered. Rounds take the cities
// in list order: largest first, or the order cities.js names in CITIES.order (e.g. 'signs': the order players meet
// them on direction signs). Custom quizzes group them by region and can take the top N by that order or by population.
// Cities that share a name are asked with their region ("Portland, Oregon").
//
// Map play (QUIZ.free, see engine/model/round.js): the click is turned into a place on Earth with the map's projection
// (CITIES.proj, Web Mercator), and the distance shown is the great-circle distance to the city.
//
// A page loads its cities.js, optionally sets CITY_OPTS, then this file, then the engine (engine/main.js):
//   CITY_OPTS = { key, lang: 'Thai', top: [8, 25, 50, 100] }
//     key         localStorage prefix (default <iso3>cities)
//     lang        the local language, when its script is not Latin: 'Thai', 'Russian', 'Local script' (India)
//     latin       what the Latin names are, the other half of that switch (default 'English'): 'French' where the
//                 Latin names are French (Tunisia), 'Latin' where they are the country's own Latin spelling (Serbia)
//     names       the language(s) of the country's signs, when written in Latin letters: 'de', ['fr']. A city whose
//                 local name (cities.js: local, lang) is in one of them is asked by it instead of its English name.
//                 Not for a second language of a country (Swedish in Finland, Māori in New Zealand): there the
//                 English name is the one on the signs.
//     top         sizes of the "Top N" rounds; a round with every city is added at the end, "Top <their number>"
//     back        the map behind the dots a player starts with, until they pick another: 'sat' (the satellite map),
//                 'street', 'bare', 'overlay' (default: the drawn map)
//     maxZoom     how far the map zooms in, times its whole (default 40; a map of the world needs more)
//     dotKm       the dots' size on the ground in km, the same at every zoom (a Web Mercator map), instead of the
//                 size on screen that grows with the zoom: for dots never tapped, only showing where an answer was
//     single      a page of one round only, played by distance and started anew each time (see engine/model/quiz.js, single):
//                 { draw() -> the round's cities in the order asked, points(km, point, id, i) -> { base, mult, pts },
//                 tag(i), max(n), cls(base) -> 0 to 3, legend } (world-places/points.js). Its rounds give no review
//                 cards and keep no best.
//     list        another list of cities on the country's map: { order, list }, from a file of the page's own. The
//                 page then loads the country's cities.js for the map and the regions, and this list replaces
//                 its cities (once the "By coverage" lists of the US and Russia; none uses it now).

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
  const fullEn = id => DUP_EN[latin(id)] > 1 && !O.single ? `${latin(id)}, ${region(id)}` : latin(id); // (on a page of one round a name twice is one place asked on two days)
  // Signs (engine/signs, see signs.js there; their data in data/signs): where the country has sign drawings reviewed against their pictures,
  // the kind 'en' shows the asked city on one of its signs (the "Sign" switch), the names of the other places on it
  // blurred: its nearest towns stand there. Loaded after the page, so the first question may show the plain name.
  const SIGN_COUNTRIES = 'ALB AND ARE ARG AUS AUT BGD BGR BIH BOL BRA BTN BWA CAN CHL COL CRI CYP CZE DEU DNK ECU ESP EST FIN FRA GEO GHA GRC GTM HRV HUN IDN IND IRL ISL ISR ITA JOR JPN KAZ KEN KGZ KHM KOR LAO LBN LKA LSO LTU LUX LVA MEX MKD MLT MNE MNG MYS NAM NGA NOR NPL NZL OMN PAN PER PHL POL PRT PRY PSE QAT ROU RUS RWA SEN SRB SVK SVN SWE SWZ THA TUN TUR TWN UGA UKR URY USA VNM ZAF', SIGN_VERSION = '8e30a60c'; // (written by tools/builds/signs/build.mjs)
  const SIGNS = SIGN_COUNTRIES.split(' ').includes(C.iso3) && document.currentScript ? (() => {
    const code = new URL('../signs/', document.currentScript.src).href, data = new URL('../../data/signs/', document.currentScript.src).href;
    const box = { draw: () => false }, s = document.createElement('script');
    s.src = `${code}signs.js?v=${SIGN_VERSION}`; s.onload = () => Object.assign(box, CitySigns.init(code, data, C.iso3, SIGN_VERSION));
    document.head.append(s);
    return box;
  })() : null;
  const onSign = id => (BY[id].local && !LATIN.test(BY[id].local) ? BY[id].local : latin(id)); // as written on its signs
  const signPlace = id => {
    const n = C.list.filter(c => c.id !== id).map(c => [c.id, hav(BY[id], c)]).sort((a, b) => a[1] - b[1]);
    const alt = x => (LATIN.test(onSign(x)) ? undefined : BY[x].en); // the Latin line of a sign in another script
    return { name: onSign(id), alt: alt(id), region: region(id), next: n[0] && onSign(n[0][0]), nextAlt: n[0] && alt(n[0][0]),
      next2: n[1] && onSign(n[1][0]), km: n[0] ? Math.max(1, Math.round(n[0][1])) : 5 };
  };
  const fullLocal = id => DUP_LOCAL[BY[id].local] > 1 ? `${BY[id].local}, ${region(id)}` : BY[id].local;
  const capitals = ids => ids.filter(id => /^PPL[CA]$/.test(BY[id].fc));
  const sizes = O.top || [8, 25, 50, 100];
  // How each local name is read, where the page loaded its script (READING.name)
  const READ = typeof READING === 'object' ? Object.fromEntries(LOCAL.map(id => [id, READING.name(BY[id].local, BY[id].lang)]).filter(e => e[1])) : {};

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
      label: O.latin || 'English', lang: O.latin || 'English', sub: `${ALL.length} cities`,
      prompt: 'name', name: fullEn, short: latin,
      clicked: a => fullEn(a), chip: fullEn,
      ...(SIGNS ? { sign: (id, el) => SIGNS.draw(signPlace(id), el, fullEn(id) !== latin(id) ? region(id) : '') } : {}),
    }),
  ];
  if (LOCAL.length) kinds.push(kind('local', LOCAL, {
    label: O.lang, lang: O.lang, of: 'en', sub: `${LOCAL.length} cities`,
    modes: ['type', 'pairs', 'pick', 'pickback'], answers: id => [latin(id), BY[id].en], // (typed in Latin letters, matched with them, picked from four, or the other way round: see the ways, engine/model/kinds.js)
    prompt: 'text', text: id => ({ text: fullLocal(id), lang: BY[id].lang, cls: 'city' }),
    name: fullLocal, short: id => BY[id].local,
    clicked: a => BY[a].local ? `${fullLocal(a)} · ${latin(a)}` : fullEn(a),
    chip: fullLocal, chipTitle: id => `${latin(id)} · ${region(id)}`,
    ...(Object.keys(READ).length ? { typeMode: {
      text: id => ({ text: fullLocal(id), lang: BY[id].lang, cls: READ[id] ? READ[id].face() : 'city' }),
      typed: (id, text) => (READ[id] && READ[id].accepts(text, [latin(id), BY[id].en])) || undefined, // (else the usual check: a slip in a long name)
      say: id => ({ text: BY[id].local, lang: BY[id].lang }),
      time: id => 1 + BY[id].local.length / 4, // a click's time for reading, and as much again for every four letters to type
    } } : {}),
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
  // The map is Web Mercator (CITIES.proj, see mercator.js): a click is turned back into a place on Earth, and the
  // distance shown and scored is the great-circle distance to the city.
  const RAD = Math.PI / 180, P = C.proj;
  const hav = (a, b) => {
    const dl = (b.lat - a.lat) * RAD, dn = (b.lng - a.lng) * RAD;
    const h = Math.sin(dl / 2) ** 2 + Math.cos(a.lat * RAD) * Math.cos(b.lat * RAD) * Math.sin(dn / 2) ** 2;
    return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(h)));
  };
  const free = {
    span: C.span, // the map's diagonal in km: the D of the points formula
    // [km shown, km scored] for a click at map point p when city id is asked
    measure(p, id) { const [lat, lng] = MERCATOR.latlng(p.x, p.y, P), km = hav({ lat, lng }, BY[id]); return [km, km]; },
  };

  const rounds = O.single ? [{ kind: 'en', label: 'Places', key: 'All cities' }] : [
    ...sizes.filter(n => n < ALL.length).map(n => ({ kind: 'en', label: `Top ${n}`, top: n })),
    { kind: 'en', label: `Top ${ALL.length}`, key: 'All cities' }, // (every city: "Top 100" where the list has 100; the key keeps the round's id of before)
  ];

  return {
    key: O.key || C.iso3.toLowerCase() + 'cities',
    areas: C.list.map(c => ({ id: c.id, d: `M${c.x},${c.y}l0,0`, lx: c.x, ly: c.y, a: 1, g: c.adm, ...(O.dotKm ? { w: +(O.dotKm / (111.32 * Math.cos(c.lat * RAD) / C.proj.k)).toFixed(4) } : {}) })), // (w: dotKm in map units, at its latitude)
    borders: [],
    proj: C.proj,
    base: { land: C.land, lines: C.lines },
    dots: true,
    free,
    size: [C.w, C.h], pad: 16, maxZoom: O.maxZoom || 40, labelScale: 0.25, back: O.back, single: O.single || null, fly: { pad: 1.6, min: 1.5 / 40 },
    hintLabel: 'Color by region',
    exploreKind: 'en',
    explore: a => ({ code: LATIN.test(BY[a].local || '') ? latin(a) : BY[a].local, title: latin(a), sub: [...english(a), region(a), `#${rank(a)} · ${fmtPop(BY[a].pop)}`] }),
    rounds,
    kinds,
  };
})();
