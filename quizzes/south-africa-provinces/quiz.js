// South Africa Provinces: config for ../shared/area-quiz.js, using the province outlines from
// ../south-africa-codes/data.js (DATA.ent) as the map areas. Names come from geo.js (PROVINCE_NAMES).

const PROVINCES = DATA.ent.map((d, i) => ({ id: 'pv' + i, d, name: PROVINCE_NAMES[i] }));
const P = Object.fromEntries(PROVINCES.map(p => [p.id, p]));
const ABBR = { 'Eastern Cape': 'EC', 'Free State': 'FS', 'Gauteng': 'GP', 'KwaZulu-Natal': 'KZN', 'Limpopo': 'LP', 'Mpumalanga': 'MP', 'North West': 'NW', 'Northern Cape': 'NC', 'Western Cape': 'WC' };
const CAPITAL = { 'Eastern Cape': 'Bhisho', 'Free State': 'Bloemfontein', 'Gauteng': 'Johannesburg', 'KwaZulu-Natal': 'Pietermaritzburg', 'Limpopo': 'Polokwane', 'Mpumalanga': 'Mbombela', 'North West': 'Mahikeng', 'Northern Cape': 'Kimberley', 'Western Cape': 'Cape Town' };
// Area codes used in each province (code areas often straddle two provinces, "Gauteng / North West").
const codesIn = name => [...new Set(DATA.reg.filter(r => r.st.split(' / ').includes(name)).flatMap(r => r.k))].sort().map(k => '0' + k);

const QUIZ = {
  key: 'zaprov',
  areas: PROVINCES.map((p, i) => ({ id: p.id, d: p.d, g: String(i + 1) })), // label point and size come from the path
  borders: [],
  context: DATA.ctx,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 30, labelScale: 0.25, fly: { pad: 1.6, min: 1 / 20 },
  geo: GEO,
  street: { bounds: [[-34.9, 16.4], [-22.1, 32.9]], maxBounds: [[-45, 5], [-12, 45]] },
  hintLabel: 'Color each province',
  exploreKind: 'provinces',
  explore: id => {
    const n = P[id].name;
    return { code: ABBR[n], title: n, sub: [`Capital: ${CAPITAL[n]}`, `Area codes: ${codesIn(n).join(', ')}`] };
  },
  rounds: [
    { kind: 'provinces', label: 'All provinces' },
  ],
  kinds: [
    {
      key: 'provinces', label: 'Provinces', sub: 'All 9 by name', noun: ['province', 'provinces'], pickTitle: 'Provinces to practice',
      groups: [{ title: 'Provinces', sub: '', ids: PROVINCES.map(p => p.id).sort((a, b) => P[a].name.localeCompare(P[b].name)) }],
      areasOf: id => [id],
      short: id => ABBR[P[id].name], name: id => P[id].name,
      about: id => [`Capital: ${CAPITAL[P[id].name]}`, `Area codes: ${codesIn(P[id].name).join(', ')}`],
      clicked: id => P[id].name,
      prompt: 'name',
      chip: id => P[id].name, chipTitle: id => `Capital: ${CAPITAL[P[id].name]}`,
    },
  ],
};
