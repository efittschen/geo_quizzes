// Namibia Area Codes: config for ../shared/area-quiz.js, on the map pieces of ../namibia-regions/data.js.
// The landline codes 061–067 are legacy: since CRAN's numbering plan of 2016 (GN 97/2016) the 06x ranges serve
// existing lines only and new fixed lines get 086 numbers, but the old codes are still on most landline numbers.
// No official map of the code areas exists. The areas here are approximate: the places of Telecom Namibia's trunk
// dialling code list (directory 2026) were located with GeoNames (185 of 225; ambiguous names left out); each
// constituency (COD-AB 2011) takes the codes of the listed places inside it, split between them by nearest place
// (Voronoi), and a constituency without a listed place takes the code of the nearest places; Etosha National Park
// (OSM) is treated apart, so it takes the code of its camps (067). Pieces under 300 km² join their neighbour.

const R = Object.fromEntries(DATA.reg.map(r => [r.id, r]));
const regionName = k => k === 'Karas' ? 'ǁKharas' : k;
const CODES = ['061', '062', '063', '064', '065', '066', '067'];
// A few places with each code, from Telecom Namibia's trunk dialling code list.
const TOWNS = {
  '061': 'Windhoek',
  '062': 'Rehoboth, Okahandja, Gobabis',
  '063': 'Keetmanshoop, Mariental, Lüderitz',
  '064': 'Walvis Bay, Swakopmund, Henties Bay',
  '065': 'Oshakati, Ondangwa, Opuwo',
  '066': 'Rundu, Katima Mulilo, Nkurenkuru',
  '067': 'Otjiwarongo, Tsumeb, Grootfontein',
};
// The codes of the ten largest towns (GeoNames population): Windhoek, Rundu, Walvis Bay, Swakopmund, Oshakati, Rehoboth,
// Katima Mulilo, Otjiwarongo, Ondangwa, Okahandja.
const BIG = ['061', '066', '064', '065', '062', '067'];
const regionsOf = k => [...new Set(DATA.reg.filter(r => r.code === k).map(r => regionName(r.region)))].join(', ');

const QUIZ = {
  key: 'namcodes',
  areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: r.code })),
  borders: [],
  context: DATA.ctx,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 30, labelScale: 0.3, fly: { pad: 1.6, min: 1.5 / 30 },
  geo: GEO,
  street: { bounds: [[-29.0, 11.7], [-16.9, 25.3]], maxBounds: [[-35, 5], [-10, 32]] },
  hintLabel: 'Color each code',
  exploreKind: 'codes',
  explore: a => ({ code: R[a].code, title: TOWNS[R[a].code], sub: regionName(R[a].region) }),
  rounds: [
    { kind: 'codes', label: 'North', sub: '065 · 066 · 067', groups: ['North'] },
    { kind: 'codes', label: 'Centre & south', sub: '061 · 062 · 063 · 064', groups: ['Centre & south'] },
    { kind: 'codes', label: 'All 7 area codes' },
  ],
  kinds: [
    {
      key: 'codes', label: 'Area codes', sub: 'All 7', noun: ['code', 'codes'], pickTitle: 'Codes to practice',
      groups: [
        { title: 'North', sub: '', ids: ['065', '066', '067'] },
        { title: 'Centre & south', sub: '', ids: ['061', '062', '063', '064'] },
      ],
      presets: [{ label: 'Big cities', ids: BIG }],
      areasOf: k => DATA.reg.filter(r => r.code === k).map(r => r.id),
      primary: a => R[a].code,
      short: k => k, name: k => k,
      about: k => [TOWNS[k], regionsOf(k)],
      clicked: a => `${R[a].code} · ${TOWNS[R[a].code]}`,
      prompt: 'dial',
      detail: { label: 'Show towns', text: k => TOWNS[k] },
      chip: k => k, chipTitle: k => TOWNS[k],
    },
  ],
};
