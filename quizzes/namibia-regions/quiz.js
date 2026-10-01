// Namibia Regions: config for ../shared/area-quiz.js. The map areas (data.js) are pieces of the 14 regions, cut where
// another grouping splits a region: the Red Line (veterinary cordon fence), the D-road number zones and the phone
// codes (../namibia-codes uses the same areas).
//   region  COD-AB region name (Namibia Statistics Agency 2011, with the 2013 Kavango split and Zambezi rename)
//   fence   N / S of the Red Line: whole 2011 constituencies, Etosha National Park (OSM) counted north; approximate
//   dz      D-road zone: the first digit of most D-road numbers (OSM ref tags, by length) in the piece's constituencies;
//           0 = three-digit numbers (D201–D861)
//   code    landline area code (see ../namibia-codes/quiz.js)

const R = Object.fromEntries(DATA.reg.map(r => [r.id, r]));
const NAME = { Karas: 'ǁKharas' };
const regionName = k => NAME[k] || k;
const CAPITAL = {
  Erongo: 'Swakopmund', Hardap: 'Mariental', Karas: 'Keetmanshoop', 'Kavango East': 'Rundu', 'Kavango West': 'Nkurenkuru',
  Khomas: 'Windhoek', Kunene: 'Opuwo', Ohangwena: 'Eenhana', Omaheke: 'Gobabis', Omusati: 'Outapi', Oshana: 'Oshakati',
  Oshikoto: 'Omuthiya', Otjozondjupa: 'Otjiwarongo', Zambezi: 'Katima Mulilo',
};
const GROUPS = [
  ['North-central', ['Omusati', 'Oshana', 'Ohangwena', 'Oshikoto']],
  ['Northeast', ['Kavango West', 'Kavango East', 'Zambezi']],
  ['West & centre', ['Kunene', 'Erongo', 'Otjozondjupa', 'Khomas', 'Omaheke']],
  ['South', ['Hardap', 'Karas']],
];
const GROUP_OF = Object.fromEntries(GROUPS.flatMap(([g, rs]) => rs.map(r => [r, g])));
const areasWhere = (key, v) => DATA.reg.filter(r => String(r[key]) === v).map(r => r.id);
const regionsWhere = (key, v) => [...new Set(DATA.reg.filter(r => String(r[key]) === v).map(r => regionName(r.region)))].join(', ');
const codesOf = region => [...new Set(DATA.reg.filter(r => r.region === region).map(r => r.code))].sort().join(' · ');

const FENCE = { N: 'North of the Red Line', S: 'South of the Red Line' };
const FENCE_SHORT = { N: 'North', S: 'South' };
const DZ = { 0: 'Dxxx', 1: 'D1xxx', 2: 'D2xxx', 3: 'D3xxx' };
const DZ_SUB = { 0: 'three digits', 1: 'first digit 1', 2: 'first digit 2', 3: 'first digit 3' };

const QUIZ = {
  key: 'namregions',
  areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: r.region })),
  borders: [],
  context: DATA.ctx,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 30, labelScale: 0.22, fly: { pad: 1.6, min: 1.5 / 30 },
  geo: GEO,
  street: { bounds: [[-29.0, 11.7], [-16.9, 25.3]], maxBounds: [[-35, 5], [-10, 32]] },
  hintLabel: 'Color by region',
  exploreKind: 'regions',
  explore: a => ({ code: regionName(R[a].region), title: FENCE[R[a].fence], sub: [`D roads: ${DZ[R[a].dz]}`, `Area code ${R[a].code}`] }),
  rounds: [
    { kind: 'fence', label: 'Red Line', sub: 'Veterinary fence' },
    { kind: 'droads', label: 'D-road numbers', sub: 'First digit' },
    { kind: 'regions', label: 'North', sub: 'North-central, Northeast', groups: ['North-central', 'Northeast'] },
    { kind: 'regions', label: 'West, centre & south', groups: ['West & centre', 'South'] },
    { kind: 'regions', label: 'All 14 regions' },
  ],
  kinds: [
    {
      key: 'regions', label: 'Regions', sub: 'All 14 by name', noun: ['region', 'regions'], pickTitle: 'Regions to practice',
      groups: GROUPS.map(([title, rs]) => ({ title, sub: '', ids: rs })),
      areasOf: k => areasWhere('region', k),
      primary: a => R[a].region,
      short: regionName, name: regionName,
      about: k => [`Capital: ${CAPITAL[k]}`, `Area code ${codesOf(k)}`],
      clicked: a => regionName(R[a].region),
      prompt: 'name',
      chip: regionName, chipTitle: k => CAPITAL[k],
    },
    {
      key: 'fence', label: 'Red Line', sub: 'North or south of the veterinary fence', noun: ['side', 'sides'], pickTitle: 'Sides to practice',
      groups: [{ title: 'Red Line', sub: 'veterinary cordon fence', ids: ['N', 'S'] }],
      areasOf: k => areasWhere('fence', k),
      primary: a => R[a].fence,
      short: k => FENCE_SHORT[k], name: k => FENCE[k],
      about: k => regionsWhere('fence', k),
      clicked: a => FENCE[R[a].fence],
      prompt: 'name', hints: false,
      chip: k => FENCE_SHORT[k], chipTitle: k => FENCE[k],
    },
    {
      key: 'droads', label: 'D-road numbers', sub: '4 zones by first digit', noun: ['zone', 'zones'], pickTitle: 'Zones to practice',
      groups: [{ title: 'D roads', sub: 'by first digit', ids: ['0', '1', '2', '3'] }],
      areasOf: k => areasWhere('dz', k),
      primary: a => String(R[a].dz),
      short: k => DZ[k], name: k => DZ[k],
      about: k => [DZ_SUB[k], regionsWhere('dz', k)],
      clicked: a => `${DZ[R[a].dz]} · ${regionName(R[a].region)}`,
      prompt: 'name', hints: false,
      chip: k => DZ[k], chipTitle: k => DZ_SUB[k],
    },
  ],
};
