// Colombia Department Flags: the flags of ../shared/flag-config.js. Every department and Bogotá has a flag, mostly
// stripes, flown on town halls and schools beside Colombia's and painted on walls; Antioquia's, Valle del Cauca's and
// Santander's with real pride. The flags (img/<ISO code>.svg) are those of Wikimedia Commons, each the one Wikidata
// names for its department. The map is the departments map of ../colombia-regions (DANE); names as there.

const NAME = Object.fromEntries(DATA.reg.map(r => [r.id, r.name]));
// [ISO 3166-2 code, DANE department, part]
const DEPTS = [
  ['ANT', '05', 'Andes north'], ['BOY', '15', 'Andes north'], ['CUN', '25', 'Andes north'], ['DC', '11', 'Andes north'], ['NSA', '54', 'Andes north'], ['SAN', '68', 'Andes north'],
  ['CAL', '17', 'Andes south'], ['QUI', '63', 'Andes south'], ['RIS', '66', 'Andes south'], ['TOL', '73', 'Andes south'], ['HUI', '41', 'Andes south'],
  ['ATL', '08', 'Caribbean'], ['BOL', '13', 'Caribbean'], ['CES', '20', 'Caribbean'], ['COR', '23', 'Caribbean'], ['LAG', '44', 'Caribbean'], ['MAG', '47', 'Caribbean'],
  ['SUC', '70', 'Caribbean'], ['SAP', '88', 'Caribbean'],
  ['CAU', '19', 'Pacific'], ['CHO', '27', 'Pacific'], ['NAR', '52', 'Pacific'], ['VAC', '76', 'Pacific'],
  ['ARA', '81', 'Llanos'], ['CAS', '85', 'Llanos'], ['MET', '50', 'Llanos'], ['VID', '99', 'Llanos'],
  ['AMA', '91', 'Amazon'], ['CAQ', '18', 'Amazon'], ['GUA', '94', 'Amazon'], ['GUV', '95', 'Amazon'], ['PUT', '86', 'Amazon'], ['VAU', '97', 'Amazon'],
];

const FLAGS = {
  key: 'coflags', alt: 'department flag',
  map: {
    areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, s: r.s, g: '' })), context: DATA.ctx,
    proj: DATA.proj, kpu: DATA.kpu, // the map made ready in Web Mercator (tools/builds/mercator), the street map under it
    street: {"bounds":[[-4.3,-79.1],[12.6,-66.8]],"maxBounds":[[-10,-90],[18,-60]]},
    size: [1000, 1192], pad: 16, maxZoom: 30, labelScale: 0.3, fly: { pad: 1.6, min: 0.05 },
  },
  parts: ['Andes north', 'Andes south', 'Caribbean', 'Pacific', 'Llanos', 'Amazon'],
  items: DEPTS.map(([id, dane, part]) => [id, NAME['d' + dane], part, ['d' + dane]]),
};
