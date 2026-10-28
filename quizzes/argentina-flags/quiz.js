// Argentina Province Flags: the flags of ../shared/flag-config.js. Every province and the City of Buenos Aires has a
// flag, most adopted since the 1980s, flown on its offices beside Argentina's. The flags (img/<ISO letter>.svg) are
// those of Wikimedia Commons, each the one Wikidata names for its province. The map is the provinces map of
// ../argentina-codes (INDEC): its outlines DATA.ent, area pv<i> the i-th.

const FLAGS = {
  key: 'arflags', alt: 'province flag',
  map: {
    areas: DATA.ent.map((d, i) => ({ id: 'pv' + i, d, g: '', ...(DATA.entAt ? { lx: DATA.entAt[i][0], ly: DATA.entAt[i][1], s: DATA.entAt[i][2] } : {}) })), context: DATA.ctx,
    proj: DATA.proj, kpu: DATA.kpu, // the map made ready in Web Mercator (tools/builds/mercator), the street map under it
    street: {"bounds":[[-55.1,-73.6],[-21.8,-53.6]],"maxBounds":[[-60,-90],[-15,-40]]},
    size: [800, 1761], pad: 16, maxZoom: 90, labelScale: 0.12, fly: { pad: 1.6, min: 0.025 },
  },
  parts: ['Northwest', 'Northeast', 'Cuyo', 'Pampas', 'Patagonia'],
  // [ISO 3166-2 letter, name, part, its area]
  items: [
    ['K', 'Catamarca', 'Northwest', ['pv7']], ['Y', 'Jujuy', 'Northwest', ['pv2']], ['F', 'La Rioja', 'Northwest', ['pv8']], ['A', 'Salta', 'Northwest', ['pv1']],
    ['G', 'Santiago del Estero', 'Northwest', ['pv20']], ['T', 'Tucumán', 'Northwest', ['pv19']],
    ['H', 'Chaco', 'Northeast', ['pv5']], ['W', 'Corrientes', 'Northeast', ['pv6']], ['P', 'Formosa', 'Northeast', ['pv3']], ['N', 'Misiones', 'Northeast', ['pv4']],
    ['M', 'Mendoza', 'Cuyo', ['pv10']], ['J', 'San Juan', 'Cuyo', ['pv9']], ['D', 'San Luis', 'Cuyo', ['pv21']],
    ['B', 'Buenos Aires', 'Pampas', ['pv16']], ['C', 'Ciudad de Buenos Aires', 'Pampas', ['pv17'], { short: 'CABA' }], ['X', 'Córdoba', 'Pampas', ['pv23']],
    ['E', 'Entre Ríos', 'Pampas', ['pv0']], ['L', 'La Pampa', 'Pampas', ['pv22']], ['S', 'Santa Fe', 'Pampas', ['pv18']],
    ['U', 'Chubut', 'Patagonia', ['pv12']], ['Q', 'Neuquén', 'Patagonia', ['pv11']], ['R', 'Río Negro', 'Patagonia', ['pv13']], ['Z', 'Santa Cruz', 'Patagonia', ['pv14']],
    ['V', 'Tierra del Fuego', 'Patagonia', ['pv15']],
  ],
};
