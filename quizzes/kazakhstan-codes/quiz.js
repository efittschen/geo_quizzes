// Kazakhstan Area Codes: config for ../shared/area-quiz.js. Each map area is a district or a city with its own
// administration (OpenStreetMap, 2026); a few newer units are joined to the area they were split from (Alatau to Ile,
// Kosshy to Tselinograd, Munaily to Aktau, Baikonur to Karmakshy). Codes and places are in ./codes.js: each code is
// drawn on the district its place lies in, and each area takes the telephone zone (710–729) of its codes.

const R = Object.fromEntries(DATA.reg.map(r => [r.id, r]));
const REGION = {
  'KZ-10': 'Abai', 'KZ-11': 'Akmola', 'KZ-15': 'Aktobe', 'KZ-19': 'Almaty Region', 'KZ-23': 'Atyrau', 'KZ-27': 'West Kazakhstan',
  'KZ-31': 'Zhambyl', 'KZ-33': 'Jetisu', 'KZ-35': 'Karaganda', 'KZ-39': 'Kostanay', 'KZ-43': 'Kyzylorda', 'KZ-47': 'Mangystau',
  'KZ-55': 'Pavlodar', 'KZ-59': 'North Kazakhstan', 'KZ-61': 'Turkistan', 'KZ-62': 'Ulytau', 'KZ-63': 'East Kazakhstan',
  'KZ-71': 'Astana', 'KZ-75': 'Almaty', 'KZ-79': 'Shymkent',
};
const C = Object.fromEntries(KZ_CODES.map(([code, place, areas]) => [code, { code, place, areas }]));
const CODES = KZ_CODES.map(r => r[0]);
const ZONES = [...new Set(CODES.map(k => k.slice(0, 3)))].sort();
const DIGITS = ['71', '72'];
const ZONE = {
  710: 'Ulytau, Balkhash', 711: 'West Kazakhstan', 712: 'Atyrau', 713: 'Aktobe', 714: 'Kostanay', 715: 'North Kazakhstan',
  716: 'Akmola', 717: 'Astana', 718: 'Pavlodar', 721: 'Karaganda', 722: 'Semey, western Abai', 723: 'East Kazakhstan, eastern Abai',
  724: 'Kyzylorda', 725: 'Shymkent, Turkistan', 726: 'Zhambyl', 727: 'Almaty, Almaty Region', 728: 'Jetisu', 729: 'Mangystau',
};
const DIGIT = { 71: 'West, North, Ulytau', 72: 'Centre, East, South' };
const inZone = z => CODES.filter(k => k.startsWith(z));
const areasOfZone = z => DATA.reg.filter(r => r.zone === z).map(r => r.id);
const zones = (...zs) => zs.flatMap(inZone);
// The capitals of the 17 regions and the 3 cities of republican significance.
const BIG = ['7172', '727', '7252', '7212', '7132', '7222', '7232', '7182', '7142', '7152', '7162', '7112', '7122', '7292', '7242', '7262', '72533', '7282', '72772', '7102'];
const unit = id => R[id].type === 'city' ? `${R[id].en} city` : `${R[id].en} district`;
const where = k => C[k].areas.map(unit).join(', ');
const regionOf = k => [...new Set(C[k].areas.map(a => REGION[R[a].iso]))].join(', ');
const codesIn = id => CODES.filter(k => C[k].areas.includes(id));

const QUIZ = {
  key: 'kzcodes',
  areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: r.zone })),
  borders: [REGION_LINES],
  context: DATA.ctx,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 60, labelScale: 0.25, fly: { pad: 1.6, min: 1.5 / 60 },
  geo: GEO,
  street: { bounds: [[40.6, 46.5], [55.4, 87.3]], maxBounds: [[34, 38], [60, 95]] },
  hintLabel: 'Color by zone',
  exploreKind: 'codes',
  explore: id => ({ code: codesIn(id)[0], title: unit(id), sub: [REGION[R[id].iso], codesIn(id).map(k => `${k} ${C[k].place}`).join(', ')] }),
  rounds: [
    { kind: 'digit', label: '71x or 72x' },
    { kind: 'zone', label: '71x zones', sub: 'West, North, Ulytau', groups: ['71x'] },
    { kind: 'zone', label: '72x zones', sub: 'Centre, East, South', groups: ['72x'] },
    { kind: 'zone', label: 'All 18 zones' },
    { kind: 'codes', label: 'Big cities', sub: 'Regional capitals', preset: 'Big cities' },
    { kind: 'codes', label: 'West', sub: '711, 712, 713, 729', ids: zones('711', '712', '713', '729') },
    { kind: 'codes', label: 'Kostanay, North Kazakhstan', sub: '714, 715', ids: zones('714', '715') },
    { kind: 'codes', label: 'Akmola, Astana, Pavlodar', sub: '716, 717, 718', ids: zones('716', '717', '718') },
    { kind: 'codes', label: 'Centre', sub: '710, 721', ids: zones('710', '721') },
    { kind: 'codes', label: 'East', sub: '722, 723', ids: zones('722', '723') },
    { kind: 'codes', label: 'South-west', sub: '724, 725, 726', ids: zones('724', '725', '726') },
    { kind: 'codes', label: 'Almaty, Jetisu', sub: '727, 728', ids: zones('727', '728') },
    { kind: 'codes', label: 'All area codes' },
  ],
  kinds: [
    {
      key: 'codes', labelPerArea: true, label: 'Area codes', sub: `All ${CODES.length}`, noun: ['code', 'codes'], pickTitle: 'Codes to practice',
      groups: ZONES.map(z => ({ title: z, sub: ZONE[z], ids: inZone(z) })),
      presets: [{ label: 'Big cities', ids: BIG }],
      areasOf: k => C[k].areas,
      short: k => k, name: k => k,
      about: k => [C[k].place, where(k)],
      clicked: id => `${codesIn(id).join(' / ')} · ${unit(id)}`,
      prompt: 'dial',
      detail: { label: 'Show region', text: regionOf },
      chip: k => k, chipTitle: k => C[k].place,
    },
    {
      key: 'zone', label: 'Zones', sub: '18 zones', noun: ['zone', 'zones'], pickTitle: 'Zones to practice',
      groups: DIGITS.map(d => ({ title: d + 'x', sub: DIGIT[d], ids: ZONES.filter(z => z.startsWith(d)) })),
      areasOf: areasOfZone,
      short: z => z, name: z => z, about: z => [ZONE[z], `${inZone(z).length} codes`],
      clicked: id => `${R[id].zone} · ${ZONE[R[id].zone]}`,
      prompt: 'dial', dial: z => [[z, 'hot']],
      hints: false, // the colors are these zones
      chip: z => z, chipTitle: z => ZONE[z],
    },
    {
      key: 'digit', label: '71x or 72x', sub: 'Beginner', noun: ['zone', 'zones'], pickTitle: 'Zones to practice',
      groups: [{ title: 'Zones', sub: '', ids: DIGITS }],
      areasOf: d => ZONES.filter(z => z.startsWith(d)).flatMap(areasOfZone),
      short: d => d + 'x', name: d => d + 'x', about: d => [DIGIT[d], ZONES.filter(z => z.startsWith(d)).join(', ')],
      clicked: id => `${R[id].zone.slice(0, 2)}x · ${DIGIT[R[id].zone.slice(0, 2)]}`,
      prompt: 'dial', dial: d => [[d, 'hot'], ['x', 'cold']],
      hints: false,
      chip: d => d + 'x', chipTitle: d => DIGIT[d],
    },
  ],
};
