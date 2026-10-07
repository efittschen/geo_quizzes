// Picture quizzes ("which country is this?"): builds the QUIZ config for ./area-quiz.js from a set of pictures
// (PHOTOS, made by tools/geohints.mjs) and the world map (WORLD in ./world.js, made by tools/worldmap.mjs).
// Each picture is a question, answered by a click on its country. Countries without pictures are plain land, and
// places too small to hit (Monaco, Jersey) are dots.
//
// The rounds are about the common pictures (a country's standard bollard), and their size alone sets the level, as
// in every quiz: Beginner under 10 pictures, Intermediate under 30, Hard under 60, Expert above. So the common
// pictures come in small sets of neighbours (REGIONS: "Benelux & France", each under 10), then in parts of a
// continent, then by continent, then all of them. Each such round frames its part of the map. A round always has
// pictures of at least two countries. The world page ends with every picture; a continent page
// (<body data-scope="Europe">) keeps only that continent's pictures, frames it and adds its uncommon ones, its rare
// ones and everything. Continents are the source's (geohints lists Russia under Asia, Turkey under Europe).
// Custom quizzes pick pictures by country; Explore shows a country's pictures.
//
// A page loads world.js and its photos.js, optionally sets PHOTO_OPTS, then this file, then area-quiz.js:
//   PHOTO_OPTS = { key, noun: ['bollard', 'bollards'], dir }
//     key   localStorage prefix (default: the meta's name; a continent page adds its continent)
//     noun  what a picture shows, one and many
//     dir   where the pictures are (default: img/ next to photos.js)

const QUIZ = (() => {
  const O = typeof PHOTO_OPTS === 'object' ? PHOTO_OPTS : {};
  const W = Object.fromEntries(WORLD.reg.map(r => [r.id, r]));
  const RARITY = ['Common', 'Uncommon', 'Rare'];
  const scope = document.body.dataset.scope || '';
  const noun = O.noun || ['picture', 'pictures'];
  const DIR = O.dir || new URL('img/', document.querySelector('script[src$="photos.js"]').src).href;

  const list = PHOTOS.items.filter(it => !scope || PHOTOS.continent[it.c] === scope);
  const P = Object.fromEntries(list.map(it => [String(it.n), it]));
  const ALL = Object.keys(P);
  const RATED = list.some(it => it.r !== undefined);
  const byName = (a, b) => W[a].n.localeCompare(b && W[b].n);
  const PLACES = [...new Set(list.map(it => it.c))].sort(byName);
  const CONTINENTS = [...new Set(PLACES.map(c => PHOTOS.continent[c]))].sort();
  // A country's pictures, the common ones first.
  const OF = Object.fromEntries(PLACES.map(c => [c, ALL.filter(id => P[id].c === c).sort((a, b) => (P[a].r ?? 0) - (P[b].r ?? 0) || P[a].n - P[b].n)]));
  const ofRarity = (ids, r) => ids.filter(id => P[id].r === r);

  const place = id => W[P[id].c];
  const rarity = id => RARITY[P[id].r] || '';
  const about = id => [rarity(id), P[id].t].filter(Boolean).join(' · ');
  const photo = id => ({
    src: `${DIR}${P[id].n}.webp`, alt: noun[0], label: [place(id).n, about(id)].filter(Boolean).join(' · '),
    link: P[id].m ? 'https://' + P[id].m : '', cls: RATED ? 'rar' + P[id].r : '',
  });

  // The part of the map that holds these places: their main land, with some room around it.
  const boxOf = ids => {
    const b = ids.map(id => W[id].b);
    const x0 = Math.min(...b.map(v => v[0])), y0 = Math.min(...b.map(v => v[1])), x1 = Math.max(...b.map(v => v[2])), y1 = Math.max(...b.map(v => v[3]));
    const m = Math.max(x1 - x0, y1 - y0) * .06;
    return [x0 - m, y0 - m, x1 + m, y1 + m];
  };
  const home = scope ? boxOf(PLACES) : null, span = home ? home[2] - home[0] : WORLD.w;

  // Regions: neighbours worth telling apart, few enough that a region's common pictures stay under 10 (a Beginner
  // round), each in a part of its continent. A place in no region goes by its continent.
  const REGIONS = [
    ['Scandinavia & Iceland', 'Northern Europe', 'DNK NOR SWE ISL FRO'],
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

  // Rounds. The pictures they are made of: the common ones, or all of them when the source has no rarity.
  const BASE = RATED ? ofRarity(ALL, 0) : ALL;
  const places = ids => [...new Set(ids.map(id => P[id].c))];
  const ORDER = REGIONS.flatMap(([region, part]) => [region, part]);
  const rank = n => (ORDER.indexOf(n) + 1 || ORDER.length + 1);
  const names = level => [...new Set(PLACES.map(level))].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b)); // in the table's order
  const framed = (key, label, ids) => ({ kind: 'photos', key, label, ids, box: boxOf(places(ids)), ...(RATED ? { sub: RARITY[0] } : {}) });
  const whole = (key, label, ids) => ({ kind: 'photos', key, label, ids });
  const candidates = [
    ...names(c => regionOf(c)[0]).map(n => framed('region.' + n, n, BASE.filter(id => regionOf(P[id].c)[0] === n))),
    ...names(c => regionOf(c)[1]).map(n => framed('part.' + n, n, BASE.filter(id => regionOf(P[id].c)[1] === n))),
    ...(scope ? [] : CONTINENTS.map(n => framed('continent.' + n, n, BASE.filter(id => PHOTOS.continent[P[id].c] === n)))),
    ...(RATED ? [whole('common', `All ${RARITY[0].toLowerCase()}`, BASE)] : []),
    ...(RATED && scope ? [whole('uncommon', RARITY[1], ofRarity(ALL, 1)), whole('rare', RARITY[2], ofRarity(ALL, 2))] : []),
    whole('all', `All ${noun[1]}`, ALL),
  ];
  // Every round asks about at least two countries, and no two rounds ask the same pictures (the wider one stays).
  const sig = r => [...r.ids].sort().join(',');
  const rounds = candidates.filter((r, i) => (places(r.ids).length > 1 || r.key === 'all') && !candidates.slice(i + 1).some(q => sig(q) === sig(r)));

  return {
    key: (O.key || PHOTOS.meta) + (scope ? '.' + scope.toLowerCase().replace(/\W+/g, '-') : ''),
    // dots last, so they lie on top of their neighbours
    areas: [...PLACES.filter(id => !W[id].dot), ...PLACES.filter(id => W[id].dot)]
      .map(id => ({ id, d: W[id].dot ? `M${W[id].lx},${W[id].ly}l0,0` : W[id].d, lx: W[id].lx, ly: W[id].ly, a: W[id].a, g: '', dot: !!W[id].dot })),
    borders: [],
    // every other country, and the real outline of each dot
    context: WORLD.reg.filter(r => !OF[r.id] || r.dot).map(r => r.d).join(''),
    size: [WORLD.w, WORLD.h], pad: 12, home, flyAnswer: true,
    maxZoom: Math.max(8, Math.round(60 * span / WORLD.w)), labelScale: .38, fly: { pad: 2.4, min: Math.min(.5, 90 / span) },
    hintLabel: '', hintsDefault: false,
    exploreKind: 'photos',
    explore: a => ({
      code: W[a].i2 || a, title: W[a].n,
      sub: RATED ? RARITY.map((label, r) => [label, ofRarity(OF[a], r).length]).filter(([, n]) => n).map(([label, n]) => `${label} ${n}`).join(' · ') : '',
      photos: OF[a].map(photo),
    }),
    rounds,
    kinds: [{
      key: 'photos', label: noun[1][0].toUpperCase() + noun[1].slice(1), sub: `${ALL.length} pictures`, noun, pickTitle: 'Countries to practice',
      groups: PLACES.map(c => ({ title: W[c].n, sub: scope ? '' : PHOTOS.continent[c], ids: OF[c] })),
      presets: RATED ? RARITY.map((label, r) => ({ label, ids: ofRarity(ALL, r) })).filter(p => p.ids.length) : [],
      areasOf: id => [P[id].c],
      areaLabel: a => W[a].i2 || a, flashArea: true,
      areaRank: false, hints: false,
      short: id => place(id).i2 || P[id].c, name: id => place(id).n, about,
      clicked: a => W[a].n,
      prompt: 'photo', photo,
      chip: id => String(OF[P[id].c].indexOf(id) + 1), chipTitle: id => photo(id).label, chipClass: id => RATED ? 'rar' + P[id].r : '',
    }],
  };
})();
