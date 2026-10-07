// Argentina National Routes: config for ../shared/area-quiz.js. The map is the 24 provinces (IGN), colored by the
// 1935 route-number range they belong to. Two kinds:
//   ranges  the 8 regional number ranges of the 1935 Vialidad Nacional scheme (51–300) -> their provinces
//   routes  every national route (RN 1 … RN 293, access routes A001 …) -> every province it runs through
// Ranges: es.wikipedia "Rutas nacionales de Argentina", citing Sánchez de Bustamante, Vialidad Nacional (1939), p. 85.
// Routes and provinces: routes.js (IGN). Santa Fe is split between ranges II (north) and V (centre and south) with no
// fixed line, so the whole province counts for both.

const P = Object.fromEntries(DATA.reg.map(r => [r.id, r]));
const pname = id => P[id].name;
const RANGES = [
  { id: 'I', from: 51, to: 80, p: ['Y', 'A', 'T', 'K', 'F'], sub: 'Northwest' },
  { id: 'II', from: 81, to: 100, p: ['P', 'H', 'G', 'S'], sub: 'Chaco region', note: { S: 'northern Santa Fe' } },
  { id: 'III', from: 101, to: 140, p: ['N', 'W', 'E'], sub: 'Mesopotamia' },
  { id: 'IV', from: 141, to: 155, p: ['J', 'M', 'D', 'L'], sub: 'Cuyo & La Pampa' },
  { id: 'V', from: 156, to: 185, p: ['X', 'S'], sub: 'Córdoba & Santa Fe', note: { S: 'central & southern Santa Fe' } },
  { id: 'VI', from: 186, to: 230, p: ['C', 'B'], sub: 'Buenos Aires' },
  { id: 'VII', from: 231, to: 255, p: ['Q', 'R'], sub: 'Neuquén & Río Negro' },
  { id: 'VIII', from: 256, to: 300, p: ['U', 'Z', 'V'], sub: 'Southern Patagonia' },
];
const RG = Object.fromEntries(RANGES.map(r => [r.id, r]));
const span = r => `${r.from}–${r.to}`;
const rangeProvinces = r => r.p.map(id => (r.note && r.note[id]) || pname(id)).join(', ');
const rangesOf = prov => RANGES.filter(r => r.p.includes(prov));

const R = Object.fromEntries(ROUTES.map(r => [r.id, r]));
const num = id => id[0] === 'A' ? null : +id;
const rangeOfRoute = id => { const n = num(id); return n === null ? null : RANGES.find(r => n >= r.from && n <= r.to) || null; };
// Trunk routes (1935 scheme): 1–14 radial from Buenos Aires, 15–31 east–west, 32–40 north–south.
const ROUTE_GROUPS = [
  { title: '1–14', sub: 'Radial from Buenos Aires', test: n => n >= 1 && n <= 14 },
  { title: '15–31', sub: 'East–west', test: n => n >= 15 && n <= 31 },
  { title: '32–40', sub: 'North–south', test: n => n >= 32 && n <= 40 },
  ...RANGES.map(r => ({ title: r.id === 'I' ? '50–80' : span(r), sub: `Range ${r.id}`, test: n => r.id === 'I' ? n >= 41 && n <= 80 : n >= r.from && n <= r.to })),
];
const groupOf = id => num(id) === null ? 'Access routes' : ROUTE_GROUPS.find(g => g.test(num(id))).title;
const ids = ROUTES.map(r => r.id);
const inGroups = titles => ids.filter(id => titles.includes(groupOf(id)));
const label = id => `RN ${id}`;
// Whether a regional route (51–300) stays inside the provinces of its 1935 range.
const leaves = id => { const r = rangeOfRoute(id); return r && R[id].p.some(p => !r.p.includes(p)); };
const routeRangeLine = id => {
  const r = rangeOfRoute(id);
  if (r) return `Range ${r.id}: ${span(r)}` + (leaves(id) ? ' · leaves its range' : '');
  const n = num(id);
  if (n === null) return 'Access route';
  return n <= 14 ? 'Radial: 1–14' : n <= 31 ? 'East–west: 15–31' : n <= 40 ? 'North–south: 32–40' : 'Below the ranges';
};
const routesIn = prov => ids.filter(id => R[id].p.includes(prov));

// The City of Buenos Aires is a few map units wide: drawn as a larger circle on top of its neighbours (quiz map only).
const ENLARGED = { C: 9 };
const circle = (x, y, r) => `M${x - r},${y}a${r},${r} 0 1,0 ${2 * r},0a${r},${r} 0 1,0 ${-2 * r},0z`;

const QUIZ = {
  key: 'arroutes',
  areas: DATA.reg.map(r => ({
    id: r.id, d: ENLARGED[r.id] ? circle(r.lx, r.ly, ENLARGED[r.id]) : r.d, lx: r.lx, ly: r.ly, a: r.a, top: r.id in ENLARGED,
    g: r.id === 'S' ? 'II-V' : rangesOf(r.id)[0].id,
  })),
  borders: [],
  context: DATA.ctx,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 60, labelScale: 0.12, fly: { pad: 1.6, min: 1 / 30 },
  geo: GEO,
  street: { bounds: [[-55.1, -73.6], [-21.8, -53.6]], maxBounds: [[-60, -90], [-15, -40]] },
  hintLabel: 'Color by number range',
  exploreKind: 'ranges',
  explore: id => ({
    code: rangesOf(id).map(r => r.id).join(', '), title: pname(id),
    sub: [rangesOf(id).map(r => `RN ${span(r)}`).join(' · '), 'RN ' + routesIn(id).join(', ')],
  }),
  rounds: [
    { kind: 'ranges', label: 'Number ranges', sub: '51–300' },
    { kind: 'routes', label: 'Trunk routes', sub: 'RN 1–40', groups: ['1–14', '15–31', '32–40'] },
    { kind: 'routes', label: 'Access routes', sub: 'A001–A026', groups: ['Access routes'] },
    { kind: 'routes', label: 'North', sub: 'RN 50–140', groups: ['50–80', '81–100', '101–140'] },
    { kind: 'routes', label: 'Centre & south', sub: 'RN 141–300', groups: ['141–155', '156–185', '186–230', '231–255', '256–300'] },
    { kind: 'routes', label: 'All national routes' },
  ],
  kinds: [
    {
      key: 'ranges', label: 'Number ranges', sub: '8 regional ranges', noun: ['range', 'ranges'], pickTitle: 'Ranges to practice',
      groups: [{ title: 'Ranges', sub: 'RN 51–300', ids: RANGES.map(r => r.id) }],
      areasOf: id => RG[id].p,
      short: id => id, name: id => `RN ${span(RG[id])}`,
      about: id => [rangeProvinces(RG[id]), 'RN ' + ids.filter(x => rangeOfRoute(x) === RG[id]).join(', ')],
      clicked: a => `${pname(a)} · ${rangesOf(a).map(r => `RN ${span(r)}`).join(', ')}`,
      prompt: 'dial', dial: id => [['RN ', 'cold'], [span(RG[id]), 'hot']],
      hints: false, // the colors are these ranges
      chip: id => span(RG[id]), chipTitle: id => rangeProvinces(RG[id]),
    },
    {
      key: 'routes', label: 'Routes', sub: `All ${ids.length}`, noun: ['route', 'routes'], pickTitle: 'Routes to practice',
      groups: [...ROUTE_GROUPS.map(g => ({ title: g.title, sub: g.sub, ids: ids.filter(id => num(id) !== null && g.test(num(id))) })),
        { title: 'Access routes', sub: 'A001–A026', ids: ids.filter(id => num(id) === null) }].filter(g => g.ids.length),
      areasOf: id => R[id].p,
      clickAll: true, labelPerArea: true,
      short: id => id, name: label,
      about: id => [R[id].p.map(pname).join(', '), routeRangeLine(id)],
      clicked: a => pname(a),
      prompt: 'dial', dial: id => [['RN ', 'cold'], [id, 'hot']],
      detail: { label: 'Show number range', text: id => routeRangeLine(id).replace(' · leaves its range', '') },
      presets: [{ label: 'Leave their range', ids: ids.filter(leaves) }],
      chip: id => id, chipTitle: id => R[id].p.map(pname).join(', '),
    },
  ],
};
