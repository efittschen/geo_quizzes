// Picture quizzes on the world map ("which country is this?"): builds QUIZ, the engine's config (engine/model/quiz.js), from a set of
// pictures (PHOTOS, data/pictures/<set>/photos.js, made by tools/cache/builds/geohints-all/scripts/build.mjs from
// GeoHints) and the world map (WORLD in world.js). As engine/types/photo.js (the bollards), and besides:
//   - a picture may be found in several places (a beer's logo): its c is then a list, and a click on any of them answers
//     it. It belongs to the region of its first place (on a continent page: its first place there), and is
//     listed under it.
//   - the pictures may come in parts (PHOTOS.parts, each picture's k: the Google vehicles, cars, boats…): the rounds
//     start with one per part (and, on the world page, a part of more than 60 pictures also by continent), the
//     custom quiz picks a part at a click.
// Each picture is a question, answered by a click on its country. Countries without pictures are plain land, and
// places too small to hit are dots. Rounds: the pictures of small sets of neighbours, of parts of a continent, of each
// continent, then all of them; their size alone sets their level. A continent page (<body data-scope="Europe">) keeps
// that continent's pictures and frames it. Continents are the source's.
//
// A page loads world.js and its photos.js, optionally sets PHOTO_OPTS, then this file, then the engine (engine/main.js):
//   PHOTO_OPTS = { key, noun: ['sign', 'signs'], dir }

const QUIZ = (() => {
  const O = typeof PHOTO_OPTS === 'object' ? PHOTO_OPTS : {};
  const W = Object.fromEntries(WORLD.reg.map(r => [r.id, r]));
  const scope = document.body.dataset.scope || '';
  const noun = O.noun || ['picture', 'pictures'];
  const DIR = O.dir || new URL('img/', document.querySelector('script[src$="photos.js"]').src).href;
  const PARTS = PHOTOS.parts || [];

  const inScope = c => !scope || PHOTOS.continent[c] === scope;
  const placesOf = it => [].concat(it.c).filter(inScope);
  const list = PHOTOS.items.filter(it => placesOf(it).length);
  const P = Object.fromEntries(list.map(it => [String(it.n), { ...it, at: placesOf(it) }]));
  const ALL = Object.keys(P);
  const home = id => P[id].at[0];
  const byName = (a, b) => W[a].n.localeCompare(b && W[b].n);
  const PLACES = [...new Set(list.flatMap(placesOf))].sort(byName);
  const CONTINENTS = [...new Set(PLACES.map(c => PHOTOS.continent[c]))].sort();
  // A place's pictures (those listed under it first), in the source's order.
  const OF = Object.fromEntries(PLACES.map(c => [c, ALL.filter(id => P[id].at.includes(c)).sort((a, b) => (home(a) !== c) - (home(b) !== c) || P[a].n - P[b].n)]));
  const OWN = Object.fromEntries(PLACES.map(c => [c, OF[c].filter(id => home(id) === c)]));

  const names = ids => ids.map(c => W[c].n);
  const where = id => { const n = names(P[id].at); return n.length > 4 ? `${n.slice(0, 3).join(' · ')} +${n.length - 3}` : n.join(' · '); };
  const about = id => P[id].t || '';
  const photo = id => ({ src: `${DIR}${P[id].n}.webp`, alt: noun[0], label: [where(id), about(id)].filter(Boolean).join(' · '), link: P[id].m ? 'https://' + P[id].m : '' });

  // The part of the map that holds these places: their main land, with some room around it.
  const boxOf = ids => {
    const b = ids.map(id => W[id].b);
    const x0 = Math.min(...b.map(v => v[0])), y0 = Math.min(...b.map(v => v[1])), x1 = Math.max(...b.map(v => v[2])), y1 = Math.max(...b.map(v => v[3]));
    const m = Math.max(x1 - x0, y1 - y0) * .06;
    return [x0 - m, y0 - m, x1 + m, y1 + m];
  };
  const homeBox = scope ? boxOf(PLACES) : null, span = homeBox ? homeBox[2] - homeBox[0] : WORLD.w;

  // Regions: as the bollards' (engine/types/photo.js).
  const REGIONS = [
    ['Scandinavia & Iceland', 'Northern Europe', 'DNK NOR SWE ISL FRO SJM'],
    ['Finland & Baltics', 'Northern Europe', 'FIN ALD EST LVA LTU'],
    ['British Isles', 'Northern Europe', 'GBR IRL IMN JEY GGY'],
    ['Benelux & France', 'Western Europe', 'BEL NLD LUX FRA'],
    ['Germany & Alps', 'Western Europe', 'DEU AUT CHE LIE'],
    ['Southwest Europe & Italy', 'Southern & Eastern Europe', 'PRT ESP AND MCO ITA SMR MLT GIB VAT'],
    ['Central Europe', 'Southern & Eastern Europe', 'POL CZE SVK HUN SVN'],
    ['Balkans & Turkey', 'Southern & Eastern Europe', 'HRV BIH SRB MNE KOS MKD ALB GRC BGR ROU TUR CYP'],
    ['Ukraine, Belarus & Caucasus', 'Southern & Eastern Europe', 'UKR BLR MDA GEO ARM AZE'],
    ['Russia & East Asia', 'Asia', 'RUS JPN KOR PRK CHN TWN HKG MAC MNG'],
    ['Southeast Asia', 'Asia', 'KHM MYS VNM THA LAO MMR IDN PHL SGP BRN TLS CXR CCK'],
    ['South Asia', 'Asia', 'IND BGD BTN NPL LKA PAK MDV'],
    ['Middle East', 'Asia', 'QAT ARE OMN JOR ISR PSX LBN SAU KWT BHR IRQ IRN SYR YEM'],
    ['Central Asia', 'Asia', 'KAZ KGZ UZB TJK TKM AFG'],
  ];
  const REGION = {}; // place -> [region, part]
  for (const [region, part, ids] of REGIONS) for (const id of ids.split(' ')) REGION[id] = [region, part];
  const regionOf = c => REGION[c] || [PHOTOS.continent[c], PHOTOS.continent[c]];

  const places = ids => [...new Set(ids.flatMap(id => P[id].at))];
  const ORDER = REGIONS.flatMap(([region, part]) => [region, part]);
  const rank = n => (ORDER.indexOf(n) + 1 || ORDER.length + 1);
  const levelNames = level => [...new Set(PLACES.map(level))].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
  const framed = (key, label, ids) => ({ kind: 'photos', key, label, ids, box: boxOf(places(ids)) });
  const whole = (key, label, ids) => ({ kind: 'photos', key, label, ids });
  const ofPart = k => ALL.filter(id => P[id].k === k);
  const candidates = [
    ...PARTS.flatMap((label, k) => {
      const ids = ofPart(k);
      if (!ids.length) return [];
      const split = !scope && ids.length > 60 ? CONTINENTS.map(n => framed(`part${k}.${n}`, `${label} · ${n}`, ids.filter(id => PHOTOS.continent[home(id)] === n))) : [];
      return [scope ? framed('part' + k, label, ids) : whole('part' + k, label, ids), ...split];
    }),
    ...levelNames(c => regionOf(c)[0]).map(n => framed('region.' + n, n, ALL.filter(id => regionOf(home(id))[0] === n))),
    ...levelNames(c => regionOf(c)[1]).map(n => framed('part.' + n, n, ALL.filter(id => regionOf(home(id))[1] === n))),
    ...(scope ? [] : CONTINENTS.map(n => framed('continent.' + n, n, ALL.filter(id => PHOTOS.continent[home(id)] === n)))),
    whole('all', `All ${noun[1]}`, ALL),
  ];
  // Every round asks about at least two countries, and no two rounds ask the same pictures (the wider one stays).
  const sig = r => [...r.ids].sort().join(',');
  const rounds = candidates.filter((r, i) => r.ids.length && (places(r.ids).length > 1 || r.key === 'all') && !candidates.slice(i + 1).some(q => sig(q) === sig(r)));

  return {
    key: (O.key || PHOTOS.meta) + (scope ? '.' + scope.toLowerCase().replace(/\W+/g, '-') : ''),
    // dots last, so they lie on top of their neighbours
    areas: [...PLACES.filter(id => !W[id].dot), ...PLACES.filter(id => W[id].dot)]
      .map(id => ({ id, d: W[id].dot ? `M${W[id].lx},${W[id].ly}l0,0` : W[id].d, lx: W[id].lx, ly: W[id].ly, a: W[id].a, g: '', dot: !!W[id].dot })),
    borders: [],
    // every other country, and the real outline of each dot
    context: WORLD.reg.filter(r => !OF[r.id] || r.dot).map(r => r.d).join(''),
    size: [WORLD.w, WORLD.h], pad: 12, home: homeBox, flyAnswer: true,
    maxZoom: Math.max(8, Math.round(60 * span / WORLD.w)), labelScale: .38, fly: { pad: 2.4, min: Math.min(.5, 90 / span) },
    hintLabel: '', hintsDefault: false,
    exploreKind: 'photos',
    explore: a => ({
      code: W[a].i2 || a, title: W[a].n,
      sub: PARTS.length ? PARTS.map((label, k) => [label, OF[a].filter(id => P[id].k === k).length]).filter(([, n]) => n).map(([label, n]) => `${label} ${n}`).join(' · ') : '',
      photos: OF[a].map(photo),
    }),
    rounds,
    kinds: [{
      key: 'photos', label: noun[1][0].toUpperCase() + noun[1].slice(1), sub: `${ALL.length} pictures`, noun, pickTitle: 'Countries to practice',
      groups: PLACES.filter(c => OWN[c].length).map(c => ({ title: W[c].n, sub: scope ? '' : PHOTOS.continent[c], ids: OWN[c] })),
      presets: PARTS.map((label, k) => ({ label, ids: ofPart(k) })).filter(p => p.ids.length),
      areasOf: id => P[id].at,
      areaLabel: a => W[a].i2 || a, flashArea: true,
      areaRank: false, hints: false,
      short: id => W[home(id)].i2 || home(id), name: id => where(id), about,
      clicked: a => W[a].n,
      prompt: 'photo', photo,
      chip: id => String(OWN[home(id)].indexOf(id) + 1), chipTitle: id => photo(id).label,
    }],
  };
})();
