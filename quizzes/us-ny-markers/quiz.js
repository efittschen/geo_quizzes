// New York Reference Markers: config for ../shared/area-quiz.js. Each map area is one of the 62 counties (data.js, id =
// the county's region-county code on NYSDOT reference markers). The second line of a marker starts with this code: the
// NYSDOT region digit (1-9, 0 for Region 10 Long Island, X for Region 11 New York City), then the county within the
// region, in alphabetical order (NYSDOT Reference Marker Manual, 1996, appendix "Region/County Codes").
// Tioga County is now in Region 9 (NYSDOT regional contacts, 2025; code 97 in NYSDOT data), but its markers still read 65
// (NYSDOT Region 9 Pavement Data Report 2021: Tioga route codes 17C 65…, 34 65…, 38 65…), so it counts under 6 here.

const R = Object.fromEntries(DATA.reg.map(r => [r.id, r]));
// Region digit -> NYSDOT region number and its office.
const REGION = {
  1: [1, 'Albany'], 2: [2, 'Utica'], 3: [3, 'Syracuse'], 4: [4, 'Rochester'], 5: [5, 'Buffalo'], 6: [6, 'Hornell'],
  7: [7, 'Watertown'], 8: [8, 'Poughkeepsie'], 9: [9, 'Binghamton'], 0: [10, 'Long Island'], X: [11, 'New York City'],
};
const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'X'];
const regionName = d => `Region ${REGION[d][0]} · ${REGION[d][1]}`;
const countiesIn = d => DATA.reg.filter(r => r.rg === d).map(r => r.id).sort();
// The NYSDOT region a county belongs to today (Tioga: 9, though its markers say 6).
const officeOf = id => id === '65' ? `Region 9 · ${REGION[9][1]}` : regionName(R[id].rg);

const PARTS = [
  ['West', ['4', '5', '6']],
  ['Central & North', ['2', '3', '7']],
  ['East & Hudson', ['1', '8', '9']],
  ['Downstate', ['0', 'X']],
];

const QUIZ = {
  key: 'usnymarkers',
  areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: r.rg })),
  borders: [],
  context: DATA.ctx,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 40, labelScale: 0.3, fly: { pad: 1.6, min: 1.5 / 40 },
  geo: GEO,
  street: { bounds: [[40.5, -79.8], [45.0, -71.8]], maxBounds: [[37, -85], [48, -66]] },
  hintLabel: 'Color by region',
  exploreKind: 'codes',
  explore: a => ({ code: a, title: `${R[a].name} County`, sub: officeOf(a) }),
  rounds: [
    { kind: 'regions', label: 'Upstate west', sub: '3 4 5 6 7', ids: ['3', '4', '5', '6', '7'] },
    { kind: 'regions', label: 'Upstate east & downstate', sub: '1 2 8 9 0 X', ids: ['1', '2', '8', '9', '0', 'X'] },
    { kind: 'codes', label: 'Downstate', sub: 'Long Island, New York City', groups: ['0', 'X'].map(regionName) },
    { kind: 'regions', label: 'All region digits' },
    ...PARTS.slice(0, 3).map(([label, ds]) => ({ kind: 'codes', label, sub: ds.join(' '), groups: ds.map(regionName) })),
    { kind: 'codes', label: 'Upstate west & central', sub: '2 3 4 5 6 7', groups: ['2', '3', '4', '5', '6', '7'].map(regionName) },
    { kind: 'codes', label: 'All county codes' },
  ],
  kinds: [
    {
      key: 'regions', label: 'Region digit', sub: `All ${DIGITS.length}`, noun: ['region', 'regions'], pickTitle: 'Region digits to practice',
      groups: PARTS.map(([title, ds]) => ({ title, sub: '', ids: ds })),
      areasOf: countiesIn,
      primary: a => R[a].rg,
      short: d => d, name: d => d,
      about: d => [regionName(d), countiesIn(d).map(id => R[id].name).join(', ')],
      clicked: a => `${R[a].rg} · ${regionName(R[a].rg)}`,
      prompt: 'dial', dial: d => [[d, 'hot'], ['···', 'cold']],
      chip: d => d, chipTitle: regionName,
    },
    {
      key: 'codes', label: 'County codes', sub: `All ${DATA.reg.length}`, noun: ['code', 'codes'], pickTitle: 'Codes to practice',
      groups: DIGITS.map(d => ({ title: regionName(d), sub: '', ids: countiesIn(d) })),
      areasOf: id => [id],
      short: id => id, name: id => id,
      about: id => [`${R[id].name} County`, officeOf(id)],
      clicked: a => `${a} · ${R[a].name}`,
      prompt: 'dial', dial: id => [[id, 'hot'], ['··', 'cold']],
      detail: { label: 'Show region', text: id => regionName(R[id].rg) },
      chip: id => id, chipTitle: id => R[id].name,
    },
  ],
};
