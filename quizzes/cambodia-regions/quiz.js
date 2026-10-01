// Cambodia Provinces: config for ../shared/area-quiz.js. Map areas: the 24 provinces and Phnom Penh (geoBoundaries ADM1,
// ids are ISO 3166-2 codes). Kinds: the four census regions, provinces by English name and in Khmer script, and
// "Roads & signs": the national highways 1–8 (every province each one runs through, from OpenStreetMap) and the
// Khmer–Chinese shop signs of Preah Sihanouk.

const R = Object.fromEntries(DATA.reg.map(r => [r.id, r]));
// Census regions of the 2019 General Population Census (NIS, provisional report, note to table 2.1).
const ZONES = [['CP', 'Central Plain'], ['TS', 'Tonle Sap'], ['CS', 'Coastal and Sea'], ['PM', 'Plateau and Mountains']];
const ZONE = Object.fromEntries(ZONES);
// Khmer names: Wikidata labels of the ISO 3166-2 KH items, without the prefix ខេត្ត "province".
const KM = {
  'KH-1': 'បន្ទាយមានជ័យ', 'KH-2': 'បាត់ដំបង', 'KH-3': 'កំពង់ចាម', 'KH-4': 'កំពង់ឆ្នាំង', 'KH-5': 'កំពង់ស្ពឺ',
  'KH-6': 'កំពង់ធំ', 'KH-7': 'កំពត', 'KH-8': 'កណ្ដាល', 'KH-9': 'កោះកុង', 'KH-10': 'ក្រចេះ', 'KH-11': 'មណ្ឌលគិរី',
  'KH-12': 'ភ្នំពេញ', 'KH-13': 'ព្រះវិហារ', 'KH-14': 'ព្រៃវែង', 'KH-15': 'ពោធិ៍សាត់', 'KH-16': 'រតនគិរី',
  'KH-17': 'សៀមរាប', 'KH-18': 'ព្រះសីហនុ', 'KH-19': 'ស្ទឹងត្រែង', 'KH-20': 'ស្វាយរៀង', 'KH-21': 'តាកែវ',
  'KH-22': 'ឧត្ដរមានជ័យ', 'KH-23': 'កែប', 'KH-24': 'ប៉ៃលិន', 'KH-25': 'ត្បូងឃ្មុំ',
};
// Population, 2019 census (NIS, provisional report, table 2.2).
const POP = {
  'KH-1': 859545, 'KH-2': 987400, 'KH-3': 895763, 'KH-4': 525932, 'KH-5': 872219, 'KH-6': 677260, 'KH-7': 592845,
  'KH-8': 1195547, 'KH-9': 123618, 'KH-10': 372825, 'KH-11': 88649, 'KH-12': 2129371, 'KH-13': 251352, 'KH-14': 1057428,
  'KH-15': 411759, 'KH-16': 204027, 'KH-17': 1006512, 'KH-18': 302887, 'KH-19': 159565, 'KH-20': 524554, 'KH-21': 899485,
  'KH-22': 261252, 'KH-23': 41798, 'KH-24': 71600, 'KH-25': 775296,
};
// National highways 1–8 (OpenStreetMap WikiProject Cambodia) and the provinces each runs through: OpenStreetMap ways
// with that ref, at least 5 km inside the province.
const ROADS = {
  1: { to: 'Phnom Penh → Bavet', p: ['KH-12', 'KH-8', 'KH-14', 'KH-20'] },
  2: { to: 'Phnom Penh → Phnom Den', p: ['KH-12', 'KH-8', 'KH-21'] },
  3: { to: 'Phnom Penh → Kampot → Veal Renh', p: ['KH-12', 'KH-8', 'KH-21', 'KH-7', 'KH-18'] },
  4: { to: 'Phnom Penh → Sihanoukville', p: ['KH-12', 'KH-8', 'KH-5', 'KH-18'] },
  5: { to: 'Phnom Penh → Battambang → Poipet', p: ['KH-12', 'KH-8', 'KH-4', 'KH-15', 'KH-2', 'KH-1'] },
  6: { to: 'Phnom Penh → Skun → Siem Reap → Sisophon', p: ['KH-12', 'KH-8', 'KH-3', 'KH-6', 'KH-17', 'KH-1'] },
  7: { to: 'Skun → Kratie → Stung Treng', p: ['KH-3', 'KH-25', 'KH-10', 'KH-19'] },
  8: { to: 'Prek Tamak → Tbong Khmum', p: ['KH-8', 'KH-14', 'KH-25'] },
};
const ROAD_IDS = Object.keys(ROADS).map(n => 'nr' + n);
const road = id => ROADS[id.slice(2)];
const roadsAt = a => Object.keys(ROADS).filter(n => ROADS[n].p.includes(a));
const CLUES = {
  zh: { name: 'Khmer–Chinese signs', short: '中文', areas: ['KH-18'], about: ['Preah Sihanouk', 'Sihanoukville'],
    // "Restaurant" in Khmer over "Chinese restaurant" in Chinese, Khmer first as the sign rules ask.
    text: { text: 'ភោជនីយដ្ឋាន\n中餐厅', cls: 'zh', lang: 'km' } },
};

const name = id => R[id].name;
const fmtPop = n => n.toLocaleString('en-US');
const byName = ids => ids.slice().sort((a, b) => name(a).localeCompare(name(b)));
const zoneGroups = ZONES.map(([z, title]) => ({ title, sub: '', ids: byName(DATA.reg.filter(r => r.zone === z).map(r => r.id)) }));
const byPop = DATA.reg.map(r => r.id).sort((a, b) => POP[b] - POP[a]);
const aboutProvince = id => [`${ZONE[R[id].zone]} · ${fmtPop(POP[id])} people`, roadsAt(id).length ? 'NR ' + roadsAt(id).join(', ') : ''].filter(Boolean);

const QUIZ = {
  key: 'khprov',
  areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: r.zone })),
  borders: [],
  context: DATA.ctx,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 40, labelScale: 0.3, fly: { pad: 1.6, min: 1.5 / 40 },
  geo: GEO,
  street: { bounds: [[10.4, 102.3], [14.7, 107.7]], maxBounds: [[6, 98], [19, 112]] },
  hintLabel: 'Color by census region',
  exploreKind: 'provinces',
  explore: id => ({ code: KM[id], title: name(id), sub: aboutProvince(id) }),
  rounds: [
    { kind: 'zones', label: 'Census regions' },
    { kind: 'clues', label: 'Roads & signs', sub: 'NR 1–8, Khmer–Chinese' },
    { kind: 'provinces', label: 'Central Plain', groups: ['Central Plain'] },
    { kind: 'provinces', label: 'Tonle Sap', groups: ['Tonle Sap'] },
    { kind: 'provinces', label: 'Coast & mountains', sub: 'Coastal and Sea, Plateau and Mountains', groups: ['Coastal and Sea', 'Plateau and Mountains'] },
    { kind: 'provinces', label: 'All provinces' },
    { kind: 'khmer', label: 'Khmer: Central Plain', groups: ['Central Plain'] },
    { kind: 'khmer', label: 'Khmer: Tonle Sap', groups: ['Tonle Sap'] },
    { kind: 'khmer', label: 'Khmer: all provinces' },
  ],
  kinds: [
    {
      key: 'provinces', label: 'Provinces', sub: `All ${DATA.reg.length} by name`, noun: ['province', 'provinces'], pickTitle: 'Provinces to practice',
      groups: zoneGroups,
      rankings: [{ label: 'population', order: byPop }],
      areasOf: id => [id],
      short: name, name,
      about: aboutProvince,
      clicked: name,
      prompt: 'name',
      chip: name, chipTitle: id => KM[id],
    },
    {
      key: 'khmer', label: 'Khmer script', sub: `All ${DATA.reg.length} in Khmer`, noun: ['province', 'provinces'], pickTitle: 'Provinces to practice',
      groups: zoneGroups,
      rankings: [{ label: 'population', order: byPop }],
      areasOf: id => [id],
      short: id => KM[id], name: id => `${KM[id]} · ${name(id)}`,
      about: aboutProvince,
      clicked: a => `${KM[a]} · ${name(a)}`,
      prompt: 'text', text: id => ({ text: KM[id], lang: 'km', cls: 'km' }),
      chip: id => KM[id], chipTitle: name,
    },
    {
      key: 'zones', label: 'Census regions', sub: 'Beginner', noun: ['region', 'regions'], pickTitle: 'Regions to practice',
      groups: [{ title: 'Census regions', sub: '2019 census', ids: ZONES.map(([z]) => z) }],
      areasOf: z => DATA.reg.filter(r => r.zone === z).map(r => r.id),
      short: z => ZONE[z], name: z => ZONE[z],
      about: z => byName(DATA.reg.filter(r => r.zone === z).map(r => r.id)).map(name).join(', '),
      clicked: a => `${name(a)} · ${ZONE[R[a].zone]}`,
      prompt: 'name',
      hints: false, // the colors are these regions
      chip: z => ZONE[z], chipTitle: z => `${DATA.reg.filter(r => r.zone === z).length} provinces`,
    },
    {
      key: 'clues', label: 'Roads & signs', sub: 'National roads 1–8', noun: ['clue', 'clues'], pickTitle: 'Clues to practice',
      groups: [{ title: 'National roads', sub: 'every province on the road', ids: ROAD_IDS }, { title: 'Signs', sub: '', ids: Object.keys(CLUES) }],
      areasOf: id => CLUES[id] ? CLUES[id].areas : road(id).p,
      clickAll: true, merge: false,
      short: id => CLUES[id] ? CLUES[id].short : 'NR' + id.slice(2),
      name: id => CLUES[id] ? CLUES[id].name : `National Road ${id.slice(2)}`,
      about: id => CLUES[id] ? CLUES[id].about : [road(id).to, road(id).p.map(name).join(', ')],
      clicked: a => roadsAt(a).length ? `${name(a)} · NR ${roadsAt(a).join(', ')}` : name(a),
      prompt: 'text', text: id => CLUES[id] ? CLUES[id].text : { text: id.slice(2), cls: 'stone' },
      chip: id => CLUES[id] ? CLUES[id].short : 'NR' + id.slice(2), chipTitle: id => CLUES[id] ? CLUES[id].name : road(id).to,
    },
  ],
};
