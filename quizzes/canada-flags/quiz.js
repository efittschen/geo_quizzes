// Canada Province Flags: the flags of ../shared/flag-config.js. Québec's fleurdelisé flies everywhere there, the
// Atlantic provinces' and Alberta's often. The flags (img/<postal code>.svg) are those of Wikimedia Commons, each the
// one Wikidata names for its province. The map is the provinces map of ../canada-codes (Natural Earth), names as
// there (Québec).

const PROV = Object.fromEntries(PROVINCES.map(p => [p.postal, p]));
const PARTS = [['West', ['BC', 'AB', 'SK', 'MB']], ['East', ['ON', 'QC', 'NB', 'NS', 'PE', 'NL']], ['North', ['YT', 'NT', 'NU']]];

const FLAGS = {
  key: 'caflags', alt: 'province flag',
  map: {
    areas: PROVINCES.map(p => ({ id: p.id, d: p.d, lx: p.lx, ly: p.ly, a: p.a, s: p.s, g: '' })), 
    proj: DATA.proj, // the map made ready in Web Mercator (tools/builds/mercator), the street map under it
    
    size: [1200, 1564], pad: 16, maxZoom: 40, labelScale: 0.2, fly: { pad: 1.6, min: 0.04 },
  },
  parts: PARTS.map(([part]) => part),
  items: PARTS.flatMap(([part, ids]) => ids.map(id => [id, PROV[id].name, part, [PROV[id].id], { short: id }])),
};
