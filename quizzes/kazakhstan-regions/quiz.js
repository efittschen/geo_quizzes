// Kazakhstan Regions: config for ../shared/area-quiz.js. The map is the 20 first-level units since June 2022
// (17 regions and the cities of Astana, Almaty and Shymkent; OpenStreetMap). Kinds: English names, Kazakh (Cyrillic)
// names, number-plate codes and five macro-regions.
//   kk     official Kazakh name (OpenStreetMap name, matches the Wikidata Kazakh label)
//   plate  region code on number plates since 2012 (traffic rules, 24pdd.kz; Wikipedia "Vehicle registration plates
//          of Kazakhstan")
//   cap    administrative centre;  tel  its landline code (ITU-T numbering plan of Kazakhstan, 2022)
//   macro  economic-geographic region (ru.wikipedia "Экономическое районирование Казахстана"; conventional, unofficial)

const KZ = {
  astana: { plate: '01', cap: 'Astana', tel: '7172', macro: 'north' },
  almaty: { plate: '02', cap: 'Almaty', tel: '727', macro: 'south' },
  akmola: { plate: '03', cap: 'Kokshetau', tel: '7162', macro: 'north' },
  aktobe: { plate: '04', cap: 'Aktobe', tel: '7132', macro: 'west' },
  'almaty-region': { plate: '05', cap: 'Konaev', tel: '72772', macro: 'south' },
  atyrau: { plate: '06', cap: 'Atyrau', tel: '7122', macro: 'west' },
  'west-kazakhstan': { plate: '07', cap: 'Oral', tel: '7112', macro: 'west' },
  zhambyl: { plate: '08', cap: 'Taraz', tel: '7262', macro: 'south' },
  karaganda: { plate: '09', cap: 'Karaganda', tel: '7212', macro: 'central' },
  kostanay: { plate: '10', cap: 'Kostanay', tel: '7142', macro: 'north' },
  kyzylorda: { plate: '11', cap: 'Kyzylorda', tel: '7242', macro: 'south' },
  mangystau: { plate: '12', cap: 'Aktau', tel: '7292', macro: 'west' },
  turkistan: { plate: '13', cap: 'Turkistan', tel: '72533', macro: 'south' },
  pavlodar: { plate: '14', cap: 'Pavlodar', tel: '7182', macro: 'north' },
  'north-kazakhstan': { plate: '15', cap: 'Petropavl', tel: '7152', macro: 'north' },
  'east-kazakhstan': { plate: '16', cap: 'Oskemen', tel: '7232', macro: 'east' },
  shymkent: { plate: '17', cap: 'Shymkent', tel: '7252', macro: 'south' },
  abai: { plate: '18', cap: 'Semey', tel: '7222', macro: 'east' },
  jetisu: { plate: '19', cap: 'Taldykorgan', tel: '7282', macro: 'south' },
  ulytau: { plate: '20', cap: 'Zhezkazgan', tel: '7102', macro: 'central' },
};
const MACRO = { north: 'North', south: 'South', west: 'West', east: 'East', central: 'Central' };
const R = Object.fromEntries(DATA.reg.map(r => [r.id, { ...r, ...KZ[r.id] }]));
const IDS = DATA.reg.map(r => r.id);
const MACROS = ['west', 'north', 'central', 'east', 'south'];
const inMacro = m => IDS.filter(id => R[id].macro === m).sort((a, b) => R[a].plate - R[b].plate);
const CITIES = ['astana', 'almaty', 'shymkent'];
const NEW_2022 = ['abai', 'jetisu', 'ulytau'];
const en = id => CITIES.includes(id) ? R[id].en : `${R[id].en}${id === 'almaty-region' ? '' : ' Region'}`;
const facts = id => [R[id].kk, `${CITIES.includes(id) ? '' : `Capital ${R[id].cap} · `}Plate ${R[id].plate} · Phone ${R[id].tel}`];
const BY_PLATE = IDS.slice().sort((a, b) => R[a].plate - R[b].plate);
const groupsBy = () => MACROS.map(m => ({ title: MACRO[m], sub: '', ids: inMacro(m) }));

// Astana, Almaty and Shymkent are a few pixels wide: on the quiz map they are drawn as slightly larger circles on top of
// the region around them. The street map keeps the real outlines.
const circle = (x, y, r) => `M${x - r},${y}a${r},${r} 0 1,0 ${2 * r},0a${r},${r} 0 1,0 ${-2 * r},0z`;

const QUIZ = {
  key: 'kzregions',
  areas: DATA.reg.map(r => ({ id: r.id, d: CITIES.includes(r.id) ? circle(r.lx, r.ly, 7) : r.d, lx: r.lx, ly: r.ly, a: r.a, g: r.id, top: CITIES.includes(r.id) })),
  borders: [],
  context: DATA.ctx,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 30, labelScale: 0.3, fly: { pad: 1.6, min: 1.5 / 30 },
  geo: GEO,
  street: { bounds: [[40.6, 46.5], [55.4, 87.3]], maxBounds: [[34, 38], [60, 95]] },
  hintLabel: 'Color regions',
  exploreKind: 'regions',
  explore: id => ({ code: R[id].plate, title: en(id), sub: facts(id) }),
  rounds: [
    { kind: 'macro', label: 'Five macro-regions' },
    { kind: 'regions', label: 'West', groups: ['West'] },
    { kind: 'regions', label: 'North', sub: 'with Astana', groups: ['North'] },
    { kind: 'regions', label: 'Centre and East', groups: ['Central', 'East'] },
    { kind: 'regions', label: 'South', sub: 'with Almaty and Shymkent', groups: ['South'] },
    { kind: 'plates', label: 'Plate codes 01–09', ids: BY_PLATE.slice(0, 9) },
    { kind: 'kazakh', label: 'Kazakh: West and North', groups: ['West', 'North'] },
    { kind: 'regions', label: 'All 20 regions' },
    { kind: 'kazakh', label: 'Kazakh: Centre, East, South', groups: ['Central', 'East', 'South'] },
    { kind: 'kazakh', label: 'All 20 in Kazakh' },
    { kind: 'plates', label: 'Plate codes 10–20', ids: BY_PLATE.slice(9) },
    { kind: 'plates', label: 'All 20 plate codes' },
  ],
  kinds: [
    {
      key: 'regions', label: 'Regions', sub: '20 by name', noun: ['region', 'regions'], pickTitle: 'Regions to practice',
      groups: groupsBy(),
      presets: [{ label: 'New in 2022', ids: NEW_2022 }],
      areasOf: id => [id],
      short: id => R[id].en, name: en,
      about: facts,
      clicked: en,
      prompt: 'name',
      detail: { label: 'Show capital', text: id => CITIES.includes(id) ? 'City' : R[id].cap },
      chip: id => R[id].en, chipTitle: id => R[id].kk,
    },
    {
      key: 'kazakh', label: 'Kazakh names', sub: 'Cyrillic', noun: ['region', 'regions'], pickTitle: 'Regions to practice',
      groups: groupsBy(),
      areasOf: id => [id],
      short: id => R[id].kk, name: id => R[id].kk,
      about: id => [en(id), `Russian: ${R[id].ru}`],
      clicked: id => `${R[id].kk} · ${en(id)}`,
      prompt: 'text', text: id => ({ text: R[id].kk, lang: 'kk', cls: 'kk' }),
      chip: id => R[id].kk, chipTitle: en,
    },
    {
      key: 'plates', label: 'Plate codes', sub: '01–20', noun: ['code', 'codes'], pickTitle: 'Codes to practice',
      groups: [{ title: '01–09', sub: '', ids: BY_PLATE.slice(0, 9) }, { title: '10–17', sub: '', ids: BY_PLATE.slice(9, 17) }, { title: '18–20', sub: 'since 2022', ids: BY_PLATE.slice(17) }],
      areaRank: false,
      areasOf: id => [id],
      short: id => R[id].plate, name: id => R[id].plate,
      about: id => [en(id), R[id].kk],
      clicked: id => `${R[id].plate} · ${en(id)}`,
      prompt: 'dial', dial: id => [[R[id].plate, 'hot']],
      chip: id => R[id].plate, chipTitle: en,
    },
    {
      key: 'macro', label: 'Macro-regions', sub: 'Beginner', noun: ['area', 'areas'], pickTitle: 'Macro-regions to practice',
      groups: [{ title: 'Macro-regions', sub: 'unofficial', ids: MACROS }],
      areasOf: inMacro,
      short: m => MACRO[m], name: m => MACRO[m],
      about: m => inMacro(m).map(id => R[id].en).join(', '),
      clicked: id => `${MACRO[R[id].macro]} · ${R[id].en}`,
      prompt: 'name',
      hints: false, // the colors would show the groups
      chip: m => MACRO[m], chipTitle: m => inMacro(m).map(id => R[id].en).join(', '),
    },
  ],
};
