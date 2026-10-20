// Ecuador Province Flags: the flags of ../shared/flag-config.js. Every province has a flag, mostly stripes, flown on
// its offices and town halls; Guayas' light blue and white with its stars all over the coast. The flags (img/<ISO
// code>.svg) are those of Wikimedia Commons, each the one Wikidata names for its province. The map is the provinces
// map of ../ecuador-regions (INEC), Galápagos at its own place; names as there.

const NAME = Object.fromEntries(DATA.reg.map(r => [r.id, r.name]));
// [ISO 3166-2 code, INEC province, part]
const PROVS = [
  ['E', '08', 'Coast and Galápagos'], ['M', '13', 'Coast and Galápagos'], ['SD', '23', 'Coast and Galápagos'], ['R', '12', 'Coast and Galápagos'],
  ['G', '09', 'Coast and Galápagos'], ['SE', '24', 'Coast and Galápagos'], ['O', '07', 'Coast and Galápagos'], ['W', '20', 'Coast and Galápagos'],
  ['C', '04', 'Andes north'], ['I', '10', 'Andes north'], ['P', '17', 'Andes north'], ['X', '05', 'Andes north'], ['T', '18', 'Andes north'],
  ['H', '06', 'Andes south'], ['B', '02', 'Andes south'], ['F', '03', 'Andes south'], ['A', '01', 'Andes south'], ['L', '11', 'Andes south'],
  ['U', '21', 'Amazon'], ['N', '15', 'Amazon'], ['D', '22', 'Amazon'], ['Y', '16', 'Amazon'], ['S', '14', 'Amazon'], ['Z', '19', 'Amazon'],
];

const FLAGS = {
  key: 'ecflags', alt: 'province flag',
  map: {
    areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: '' })), context: DATA.ctx,
    geo: GEO, proj: DATA.proj, kpu: DATA.kpu, // the map redrawn in Web Mercator (mercator.js), the street map under it
    street: {"bounds":[[-5.1,-81.2],[1.5,-75.1]],"maxBounds":[[-9,-95],[5,-70]]},
    size: [1000, 682], pad: 16, maxZoom: 30, labelScale: 0.3, fly: { pad: 1.6, min: 0.05 },
  },
  parts: ['Coast and Galápagos', 'Andes north', 'Andes south', 'Amazon'],
  items: PROVS.map(([id, inec, part]) => [id, NAME['p' + inec], part, ['p' + inec]]),
};
