// US Road Grid: config for ../shared/area-quiz.js. Interstate and US-route numbers follow a national grid: odd
// Interstates run north-south, rising from west to east, even ones east-west, rising from south to north; US routes
// do the reverse (US 1 on the Atlantic, US 101 on the Pacific, US 10 in the north, US 90 in the south). Major routes:
// Interstates divisible by 5, US routes ending in 1 or 0 (Wikipedia: Interstate Highway System, United States Numbered
// Highway System).
// Each map area is a cell of lower-48 counties (US Census Bureau 2024) that share the same nearest major route of each
// of the four systems, measured from the county's centroid to the route line (TIGER/Line 2024 primary and secondary
// roads). A band is every county nearer to that route than to the other major routes of its system, so its edges
// are approximate.

const R = Object.fromEntries(DATA.reg.map(r => [r.id, r]));
const cellsWhere = (prop, v) => DATA.reg.filter(r => r[prop] === v).map(r => r.id);
const I_NS = [5, 15, 25, 35, 45, 55, 65, 75, 85, 95].map(n => 'I' + n);
const I_EW = [10, 20, 30, 40, 70, 80, 90].map(n => 'I' + n);
const US_NS = [1, 11, 21, 31, 41, 51, 61, 71, 81, 91, 101].map(n => 'US' + n);
const US_EW = [10, 20, 30, 40, 50, 60, 70, 80, 90].map(n => 'US' + n);
const label = k => k.startsWith('I') ? 'I-' + k.slice(1) : 'US ' + k.slice(2);
const num = k => k.replace(/^\D+/, '');

const kind = (key, prop, ids, extra) => ({
  key, prop, noun: ['route', 'routes'], pickTitle: 'Routes to practice',
  areasOf: k => cellsWhere(prop, k),
  primary: a => R[a][prop],
  short: label, name: label,
  clicked: a => label(R[a][prop]),
  prompt: 'dial', dial: k => k.startsWith('I') ? [['I-', 'cold'], [num(k), 'hot']] : [['US ', 'cold'], [num(k), 'hot']],
  chip: label, chipTitle: label,
  about: k => [`${cellsWhere(prop, k).reduce((s, a) => s + R[a].n, 0)} counties`],
  ...extra,
});

const QUIZ = {
  key: 'usroadgrid',
  areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: r.ins })),
  borders: [DATA.lines],
  context: DATA.ctx,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 30, labelScale: 0.5, fly: { pad: 1.6, min: 1.5 / 30 },
  geo: GEO,
  street: { bounds: [[24.4, -124.8], [49.4, -66.9]], maxBounds: [[10, -140], [60, -50]] },
  hintLabel: 'Color by band',
  exploreKind: 'ins',
  explore: a => ({ code: `${label(R[a].ins)} · ${label(R[a].iew)}`, title: `${label(R[a].usns)} · ${label(R[a].usew)}`, sub: `${R[a].n} counties` }),
  rounds: [
    { kind: 'ins', label: 'Interstates west', sub: 'I-5 to I-45', ids: I_NS.slice(0, 5) },
    { kind: 'ins', label: 'Interstates east', sub: 'I-55 to I-95', ids: I_NS.slice(5) },
    { kind: 'iew', label: 'Interstates east-west', sub: 'I-10 to I-90' },
    { kind: 'usew', label: 'US routes east-west', sub: 'US 10 to US 90' },
    { kind: 'usns', label: 'US routes east', sub: 'US 1 to US 51', ids: US_NS.slice(0, 6) },
    { kind: 'usns', label: 'US routes west', sub: 'US 61 to US 101', ids: US_NS.slice(6) },
    { kind: 'ins', label: 'Interstates north-south', sub: 'I-5 to I-95' },
    { kind: 'usns', label: 'US routes north-south', sub: 'US 1 to US 101' },
  ],
  kinds: [
    kind('ins', 'ins', I_NS, {
      label: 'Interstates N-S', sub: 'I-5 to I-95',
      groups: [{ title: 'West', sub: '', ids: I_NS.slice(0, 5) }, { title: 'East', sub: '', ids: I_NS.slice(5) }],
    }),
    kind('iew', 'iew', I_EW, {
      label: 'Interstates E-W', sub: 'I-10 to I-90',
      groups: [{ title: 'South', sub: '', ids: I_EW.slice(0, 4) }, { title: 'North', sub: '', ids: I_EW.slice(4) }],
    }),
    kind('usns', 'usns', US_NS, {
      label: 'US routes N-S', sub: 'US 1 to US 101',
      groups: [{ title: 'East', sub: '', ids: US_NS.slice(0, 6) }, { title: 'West', sub: '', ids: US_NS.slice(6) }],
    }),
    kind('usew', 'usew', US_EW, {
      label: 'US routes E-W', sub: 'US 10 to US 90',
      groups: [{ title: 'North', sub: '', ids: US_EW.slice(0, 4) }, { title: 'South', sub: '', ids: US_EW.slice(4) }],
    }),
  ],
};
