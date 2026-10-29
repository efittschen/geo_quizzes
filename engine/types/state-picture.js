// Picture quizzes on the US states map ("which state?"): builds QUIZ, the engine's config (engine/model/quiz.js), from PHOTOS (made by
// tools/cache/builds/geohints-all/scripts/build.mjs from geohints.com/countries/us) on the US states map, as
// ../us-bollards/quiz.js: each state one area (its counties joined, data/maps/us-states/states.js).
//   Pictures: { n, s: [states], t, m, p }: see a picture, click its state (one of them, where it names several).
//     p: the picture's path when it is a world set's (data/pictures/scenery/img/12.webp), else img/<n>.webp.
//   Routes (PHOTOS.routes): { n, r: 'US 1', s, a, z }: see a route's name, click every state it runs through; its
//     map comes with the answer.
// Rounds: by Census region (by division too where there are more than 60), then all; groups by region.
// A page loads data/maps/us-states/states.js and its photos.js, sets PHOTO_OPTS = { key, noun }, then this file, then the engine (engine/main.js).

const QUIZ = (() => {
  const O = typeof PHOTO_OPTS === 'object' ? PHOTO_OPTS : {};
  const noun = O.noun || ['picture', 'pictures'];
  const USPS = {
    'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT',
    'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
    'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD', 'Massachusetts': 'MA', 'Michigan': 'MI',
    'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH',
    'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
    'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC', 'South Dakota': 'SD', 'Tennessee': 'TN',
    'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'Washington, D.C.': 'DC', 'West Virginia': 'WV',
    'Wisconsin': 'WI', 'Wyoming': 'WY',
  };
  const NAME = Object.fromEntries(Object.entries(USPS).map(([name, code]) => [code, name]));
  // US Census Bureau regions and divisions.
  const DIVISIONS = [
    ['Northeast', 'New England', 'CT ME MA NH RI VT'], ['Northeast', 'Middle Atlantic', 'NJ NY PA'],
    ['Midwest', 'East North Central', 'IL IN MI OH WI'], ['Midwest', 'West North Central', 'IA KS MN MO NE ND SD'],
    ['South', 'South Atlantic', 'DE DC FL GA MD NC SC VA WV'], ['South', 'East South Central', 'AL KY MS TN'], ['South', 'West South Central', 'AR LA OK TX'],
    ['West', 'Mountain', 'AZ CO ID MT NV NM UT WY'], ['West', 'Pacific', 'AK CA HI OR WA'],
  ];
  const REGION = {}, DIVISION = {};
  for (const [region, division, sts] of DIVISIONS) for (const st of sts.split(' ')) { REGION[st] = region; DIVISION[st] = division; }
  const SEVERAL = 'Several regions';

  // One area per state: its counties of the US Regions map joined (data/maps/us-states/states.js).
  const AREAS = Object.keys(USPS).map(st => { const r = US_STATES.reg.find(r => r.id === USPS[st]); return { id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, s: r.s, g: '' }; });

  const ROUTES = !!PHOTOS.routes;
  const BASE = new URL('.', document.querySelector('script[src$="photos.js"]').src).href;
  const P = Object.fromEntries(PHOTOS.items.map(it => [String(it.n), it]));
  const ALL = Object.keys(P);
  for (const id of ALL) for (const st of P[id].s) if (!NAME[st]) throw new Error(`unknown state: ${st}`);
  const states = id => P[id].s.map(st => NAME[st]).join(' · ');
  const one = (id, of) => { const rs = new Set(P[id].s.map(st => of[st])); return rs.size === 1 ? [...rs][0] : ''; };
  const regionOf = id => one(id, REGION) || SEVERAL;
  const GROUPS = [...new Set(DIVISIONS.map(d => d[0])), SEVERAL].map(title => ({ title, sub: '', ids: ALL.filter(id => regionOf(id) === title) })).filter(g => g.ids.length);
  const inState = code => ALL.filter(id => P[id].s.includes(code));
  const about = id => ROUTES ? [P[id].a, P[id].z].filter(Boolean).join(' – ') : (P[id].t || '');
  const photo = id => ({
    src: P[id].p ? new URL(P[id].p, BASE).href : `${BASE}img/${P[id].n}.webp`, alt: noun[0],
    label: [ROUTES ? P[id].r : states(id), ROUTES ? states(id) : about(id)].filter(Boolean).join(' · '), link: P[id].m ? 'https://' + P[id].m : '',
  });
  const hasPhoto = id => !ROUTES || P[id].f;

  // Rounds: each region's (and with more than 60 in all, each division's), at least two states each, then all.
  const statesOf = ids => new Set(ids.flatMap(id => P[id].s));
  const big = ALL.length > 60;
  const candidates = [
    ...(big ? DIVISIONS.map(([, division]) => ({ kind: 'photos', key: 'div.' + division, label: division, ids: ALL.filter(id => one(id, DIVISION) === division) })) : []),
    ...GROUPS.filter(g => g.title !== SEVERAL).map(g => ({ kind: 'photos', key: 'region.' + g.title, label: g.title, ids: g.ids })),
    { kind: 'photos', key: 'all', label: `All ${noun[1]}`, ids: ALL },
  ];
  const sig = r => [...r.ids].sort().join(',');
  const rounds = candidates.filter((r, i) => r.ids.length && (statesOf(r.ids).size > 1 || r.key === 'all') && !candidates.slice(i + 1).some(q => sig(q) === sig(r)));

  return {
    key: O.key || 'us' + PHOTOS.meta.replace(/\W+/g, ''),
    areas: AREAS,
    borders: [US_STATES.reg.map(r => r.d).join('')], // every state's outline, also where a round leaves it out
    
    proj: US_STATES.proj, // Web Mercator: the street map under it
    
    size: [US_STATES.w, US_STATES.h], pad: 16, maxZoom: 60, labelScale: 0.14, fly: { pad: 1.6, min: 0.03 },
    hintLabel: '', hintsDefault: false,
    exploreKind: 'photos',
    explore: a => ({ code: a, title: NAME[a], sub: ROUTES ? inState(a).map(id => P[id].r).join(' · ') : '', photos: inState(a).filter(hasPhoto).map(photo) }),
    rounds,
    kinds: [{
      key: 'photos', label: noun[1][0].toUpperCase() + noun[1].slice(1), sub: `${ALL.length} ${noun[1]}`, noun, pickTitle: `${noun[1][0].toUpperCase() + noun[1].slice(1)} to practice`,
      groups: GROUPS,
      areasOf: id => P[id].s,
      areaLabel: a => a, flashArea: true,
      areaRank: false, hints: false,
      short: id => ROUTES ? P[id].r : P[id].s.join(' '), name: id => ROUTES ? P[id].r : states(id), about,
      clicked: a => NAME[a],
      ...(ROUTES
        ? { prompt: 'name', clickAll: true, dim: false, primary: () => null, photo, chip: id => P[id].r.replace(/^(US |I-)/, ''), chipTitle: id => `${P[id].r} · ${states(id)}` }
        : { prompt: 'photo', photo, chip: id => String(GROUPS.find(g => g.ids.includes(id)).ids.indexOf(id) + 1), chipTitle: id => photo(id).label }),
    }],
  };
})();
