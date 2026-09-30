// Turkey Provinces: config for ../shared/area-quiz.js, using the province areas from ../turkey-codes/data.js.
// İstanbul is one province drawn as two areas (European and Asian side); clicking either counts.

const R = Object.fromEntries(DATA.reg.map(r => [r.id, r]));
const provinceName = r => r.ct[0].replace(/ \(.*\)$/, '');
// One item per province (İstanbul's two areas share the name "İstanbul").
const provinceId = r => 'pv-' + provinceName(r);
const PROVINCES = [...new Map(DATA.reg.map(r => [provinceId(r), { id: provinceId(r), name: provinceName(r), region: r.st }])).values()];
const P = Object.fromEntries(PROVINCES.map(p => [p.id, p]));
const areasOf = id => DATA.reg.filter(r => provinceId(r) === id).map(r => r.id);
const REGIONS = [
  ['MAR', 'Marmara'], ['EGE', 'Aegean'], ['AKD', 'Mediterranean'], ['IA', 'Central Anatolia'],
  ['KAR', 'Black Sea'], ['DA', 'Eastern Anatolia'], ['GDA', 'Southeastern Anatolia'],
];
const REGION_KEY = Object.fromEntries(REGIONS.map(([k, n]) => [n, k]));
const codesOf = id => areasOf(id).map(a => '0' + R[a].k[0]).join(' / ');

const QUIZ = {
  key: 'trprov',
  areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: REGION_KEY[r.st] })),
  borders: [],
  context: DATA.ctx,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 40, labelScale: 0.22, fly: { pad: 1.6, min: 1.5 / 40 },
  geo: GEO,
  street: { bounds: [[35.8, 25.6], [42.2, 44.9]], maxBounds: [[30, 15], [47, 55]] },
  hintLabel: 'Color by region',
  exploreKind: 'provinces',
  explore: area => { const r = R[area]; return { code: '0' + r.k[0], title: provinceName(r), sub: `${r.st} region` }; },
  rounds: [
    { kind: 'provinces', label: 'Aegean', groups: ['Aegean'] },
    { kind: 'provinces', label: 'Mediterranean', groups: ['Mediterranean'] },
    { kind: 'provinces', label: 'Black Sea', groups: ['Black Sea'] },
    { kind: 'provinces', label: 'The West', sub: 'Marmara, Aegean, Mediterranean, Central Anatolia', groups: ['Marmara', 'Aegean', 'Mediterranean', 'Central Anatolia'] },
    { kind: 'provinces', label: 'All provinces' },
  ],
  kinds: [
    {
      key: 'provinces', label: 'Provinces', sub: `All ${PROVINCES.length} by name`, noun: ['province', 'provinces'], pickTitle: 'Provinces to practice',
      groups: REGIONS.map(([, name]) => ({ title: name, sub: '', ids: PROVINCES.filter(p => p.region === name).map(p => p.id).sort((a, b) => P[a].name.localeCompare(P[b].name, 'tr')) })),
      areasOf,
      primary: area => provinceId(R[area]),
      short: id => P[id].name, name: id => P[id].name,
      about: id => [`${P[id].region} region`, `Area code ${codesOf(id)}`],
      clicked: area => provinceName(R[area]),
      prompt: 'name',
      chip: id => P[id].name, chipTitle: id => `Area code ${codesOf(id)}`,
    },
  ],
};
