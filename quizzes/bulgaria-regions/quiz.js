// Bulgaria Provinces: config for ../shared/area-quiz.js. Each map area is one of the 28 provinces (oblasti), with
// their NUTS-2 planning regions (Eurostat) and the three electricity distribution areas, which follow province lines:
// ERM Zapad (Electrohold group, CEZ until 2021) in 10 western provinces, Elektrorazpredelenie Yug (EVN) in 9 in the
// south-east and Elektrorazpredelenie Sever (Energo-Pro) in 9 in the north-east.

const R = Object.fromEntries(DATA.reg.map(r => [r.id, r]));
const IDS = DATA.reg.map(r => r.id);
const EN = id => ({ 22: 'Sofia City', 23: 'Sofia Province' })[id] || R[id].en;
const BG = id => ({ 22: 'София-град', 23: 'Софийска област' })[id] || R[id].bg;
const NUTS = { BG31: 'North-West', BG32: 'North-Central', BG33: 'North-East', BG34: 'South-East', BG41: 'South-West', BG42: 'South-Central' };
const POWER = {
  W: { name: 'Electrohold (CEZ)', bg: 'ЕРМ Запад · Електрохолд' },
  S: { name: 'EVN', bg: 'Електроразпределение Юг · EVN' },
  N: { name: 'Energo-Pro', bg: 'Електроразпределение Север · Energo-Pro' },
};
// Area code of each province's capital (CRC list of geographic codes, 2014).
const CODE = { '01': '073', '02': '056', '03': '052', '04': '062', '05': '094', '06': '092', '07': '066', '08': '058', '09': '036', 10: '078', 11: '068', 12: '096', 13: '034', 14: '076', 15: '064', 16: '032', 17: '084', 18: '082', 19: '086', 20: '044', 21: '030', 22: '02', 23: '02', 24: '042', 25: '060', 26: '038', 27: '054', 28: '046' };
const byName = (a, b) => EN(a).localeCompare(EN(b));
const inNuts = n => IDS.filter(id => R[id].nuts === n).sort(byName);
const NORTH = ['BG31', 'BG32', 'BG33'], SOUTH = ['BG41', 'BG42', 'BG34'];
const provGroups = Object.keys(NUTS).map(n => ({ title: NUTS[n], sub: '', ids: inNuts(n) }));
const about = id => [`${NUTS[R[id].nuts]} · ${POWER[R[id].power].name}`, `Area code ${CODE[id]}`];

const QUIZ = {
  key: 'bgregions',
  areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: r.nuts })),
  borders: [],
  context: DATA.ctx,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 30, labelScale: 0.25, fly: { pad: 1.6, min: 1.5 / 30 },
  geo: GEO,
  street: { bounds: [[41.2, 22.3], [44.25, 28.65]], maxBounds: [[38, 17], [47, 34]] },
  hintLabel: 'Color by planning region',
  exploreKind: 'provinces',
  explore: id => ({ code: BG(id), title: EN(id), sub: [NUTS[R[id].nuts], POWER[R[id].power].bg] }),
  rounds: [
    { kind: 'power', label: 'Power companies' },
    { kind: 'nuts', label: 'Planning regions' },
    { kind: 'provinces', label: 'North', sub: NORTH.map(n => NUTS[n]).join(', '), groups: NORTH.map(n => NUTS[n]) },
    { kind: 'provinces', label: 'South', sub: SOUTH.map(n => NUTS[n]).join(', '), groups: SOUTH.map(n => NUTS[n]) },
    { kind: 'provinces', label: 'All provinces' },
    { kind: 'cyrillic', label: 'Cyrillic: North', groups: NORTH.map(n => NUTS[n]) },
    { kind: 'cyrillic', label: 'Cyrillic: South', groups: SOUTH.map(n => NUTS[n]) },
    { kind: 'cyrillic', label: 'Cyrillic: all provinces' },
  ],
  kinds: [
    {
      key: 'provinces', label: 'Provinces', sub: `All ${IDS.length} by name`, noun: ['province', 'provinces'], pickTitle: 'Provinces to practice',
      groups: provGroups,
      areasOf: id => [id],
      short: EN, name: EN, about,
      clicked: EN,
      prompt: 'name',
      detail: { label: 'Show capital area code', text: id => CODE[id] },
      chip: EN, chipTitle: BG,
    },
    {
      key: 'cyrillic', label: 'Cyrillic', sub: `All ${IDS.length} in Cyrillic`, noun: ['province', 'provinces'], pickTitle: 'Provinces to practice',
      groups: provGroups,
      areasOf: id => [id],
      short: BG, name: id => `${BG(id)} · ${EN(id)}`, about,
      clicked: id => `${BG(id)} · ${EN(id)}`,
      prompt: 'text', text: id => ({ text: BG(id), lang: 'bg', cls: 'city' }),
      chip: BG, chipTitle: EN,
    },
    {
      key: 'nuts', label: 'Planning regions', sub: 'Beginner: 6 regions', noun: ['region', 'regions'], pickTitle: 'Regions to practice',
      groups: [{ title: 'Planning regions', sub: 'NUTS 2', ids: Object.keys(NUTS) }],
      areasOf: inNuts,
      short: n => NUTS[n], name: n => NUTS[n], about: n => [inNuts(n).map(EN).join(', ')],
      clicked: id => `${NUTS[R[id].nuts]} (${EN(id)})`,
      prompt: 'name',
      hints: false, // the colors are these regions
      chip: n => NUTS[n], chipTitle: n => inNuts(n).map(EN).join(', '),
    },
    {
      key: 'power', label: 'Power companies', sub: 'Beginner: 3 areas', noun: ['company', 'companies'], pickTitle: 'Companies to practice',
      groups: [{ title: 'Distribution areas', sub: '', ids: Object.keys(POWER) }],
      areasOf: k => IDS.filter(id => R[id].power === k),
      short: k => POWER[k].name, name: k => POWER[k].name,
      about: k => [POWER[k].bg, IDS.filter(id => R[id].power === k).map(EN).sort().join(', ')],
      clicked: id => `${POWER[R[id].power].name} (${EN(id)})`,
      prompt: 'name',
      hints: false, // planning regions nest inside the power areas
      chip: k => POWER[k].name, chipTitle: k => POWER[k].bg,
    },
  ],
};
