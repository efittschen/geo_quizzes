// Argentina Provinces: config for ../shared/area-quiz.js, using the province outlines from
// ../argentina-codes/data.js (DATA.ent). Names come from geo.js (PROVINCE_NAMES, from the towns inside each).

const DISPLAY = { 'Buenos Aires': 'Buenos Aires Province', 'Buenos Aires (city)': 'City of Buenos Aires' };
const PROVINCES = DATA.ent.map((d, i) => ({ id: 'pv' + i, d, key: PROVINCE_NAMES[i], name: DISPLAY[PROVINCE_NAMES[i]] || PROVINCE_NAMES[i] }));
const P = Object.fromEntries(PROVINCES.map(p => [p.id, p]));
const CAPITAL = {
  'Buenos Aires': 'La Plata', 'Buenos Aires (city)': 'the national capital', 'Catamarca': 'San Fernando del Valle de Catamarca', 'Chaco': 'Resistencia',
  'Chubut': 'Rawson', 'Córdoba': 'Córdoba', 'Corrientes': 'Corrientes', 'Entre Ríos': 'Paraná', 'Formosa': 'Formosa', 'Jujuy': 'San Salvador de Jujuy',
  'La Pampa': 'Santa Rosa', 'La Rioja': 'La Rioja', 'Mendoza': 'Mendoza', 'Misiones': 'Posadas', 'Neuquén': 'Neuquén', 'Río Negro': 'Viedma',
  'Salta': 'Salta', 'San Juan': 'San Juan', 'San Luis': 'San Luis', 'Santa Cruz': 'Río Gallegos', 'Santa Fe': 'Santa Fe',
  'Santiago del Estero': 'Santiago del Estero', 'Tierra del Fuego': 'Ushuaia', 'Tucumán': 'San Miguel de Tucumán',
};
// INDEC's statistical regions, used for grouping and colors.
const REGIONS = [
  ['NOA', 'Northwest', ['Catamarca', 'Jujuy', 'La Rioja', 'Salta', 'Santiago del Estero', 'Tucumán']],
  ['NEA', 'Northeast', ['Chaco', 'Corrientes', 'Formosa', 'Misiones']],
  ['CUY', 'Cuyo', ['Mendoza', 'San Juan', 'San Luis']],
  ['PAM', 'Pampas', ['Buenos Aires', 'Buenos Aires (city)', 'Córdoba', 'Entre Ríos', 'La Pampa', 'Santa Fe']],
  ['PAT', 'Patagonia', ['Chubut', 'Neuquén', 'Río Negro', 'Santa Cruz', 'Tierra del Fuego']],
];
const regionOf = key => REGIONS.find(r => r[2].includes(key));
const idOf = key => PROVINCES.find(p => p.key === key).id;
// Area codes used in each province (code areas around Buenos Aires straddle the city and the province).
const codesIn = key => [...new Set(DATA.reg.filter(r => r.st.split(' / ').includes(key)).flatMap(r => r.k))].sort().map(k => '0' + k);
const codeList = key => { const ks = codesIn(key); return ks.length > 12 ? `${ks.length} area codes` : `Area codes ${ks.join(', ')}`; };
const capital = key => key === 'Buenos Aires (city)' ? 'Argentina\'s capital' : `Capital: ${CAPITAL[key]}`;

const QUIZ = {
  key: 'arprov',
  areas: PROVINCES.map(p => ({ id: p.id, d: p.d, g: regionOf(p.key)[0] })), // label point and size come from the path
  borders: [],
  context: DATA.ctx,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 90, labelScale: 0.12, fly: { pad: 1.6, min: 1 / 40 },
  geo: GEO,
  street: { bounds: [[-55.1, -73.6], [-21.8, -53.6]], maxBounds: [[-60, -90], [-15, -40]] },
  hintLabel: 'Color by region',
  exploreKind: 'provinces',
  explore: id => { const k = P[id].key; return { code: regionOf(k)[1], title: P[id].name, sub: [capital(k), codeList(k)] }; },
  rounds: [
    { kind: 'provinces', label: 'Patagonia & Cuyo', groups: ['Patagonia', 'Cuyo'] },
    { kind: 'provinces', label: 'The North', sub: 'Northwest and Northeast', groups: ['Northwest', 'Northeast'] },
    { kind: 'provinces', label: 'All provinces' },
  ],
  kinds: [
    {
      key: 'provinces', label: 'Provinces', sub: 'All 24 by name', noun: ['province', 'provinces'], pickTitle: 'Provinces to practice',
      groups: REGIONS.map(([, title, keys]) => ({ title, sub: '', ids: keys.map(idOf) })),
      areasOf: id => [id],
      short: id => P[id].name, name: id => P[id].name,
      about: id => [capital(P[id].key), codeList(P[id].key)],
      clicked: id => P[id].name,
      prompt: 'name',
      chip: id => P[id].name, chipTitle: id => capital(P[id].key),
    },
  ],
};
