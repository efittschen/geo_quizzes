// Spain Regional Flags: the flags of ../shared/flag-config.js. Every autonomous community and the two autonomous
// cities fly their flag beside Spain's; Cataluña's senyera, the Basque ikurriña, Galicia's, Andalucía's and the
// Canaries' are on houses and balconies too, and in Cataluña the estelada besides the senyera. The flags
// (img/<ISO code>.svg) are those of Wikimedia Commons, each the one Wikidata names for its community. The map is the
// provinces map of ../spain-regions (IGN), each community its provinces drawn as one; names as there.

const AREAS_OF = {};
for (const r of DATA.reg) (AREAS_OF[r.ccaa] ||= []).push(r.id);
const community = (id, name, part) => [id, name, part, AREAS_OF[id], { short: id }];
// Ceuta and Melilla drawn as dots, large enough to click (as on ../spain-regions)
const DOT = {"p51":"M598.5,425.4a7,7 0 1,0 14,0a7,7 0 1,0 -14,0z","p52":"M704.3,454.9a7,7 0 1,0 14,0a7,7 0 1,0 -14,0z"};

const FLAGS = {
  key: 'esflags', alt: 'regional flag',
  map: {
    areas: DATA.reg.map(r => ({ id: r.id, d: DOT[r.id] || r.d, lx: r.lx, ly: r.ly, a: r.a, g: '', ...(DOT[r.id] ? { top: true } : {}) })), context: DATA.ctx,
    geo: GEO, proj: DATA.proj, kpu: DATA.kpu, // the map redrawn in Web Mercator (mercator.js), the street map under it
    street: {"bounds":[[27.6,-18.2],[43.8,4.4]],"maxBounds":[[22,-25],[48,10]]},
    size: [1000, 848], pad: 16, maxZoom: 40, labelScale: 0.25, fly: { pad: 1.6, min: 0.0375 },
  },
  parts: ['Northwest', 'Northeast', 'Centre and south', 'Islands and cities'],
  items: [
    community('GA', 'Galicia', 'Northwest'), community('AS', 'Asturias', 'Northwest'), community('CB', 'Cantabria', 'Northwest'), community('CL', 'Castilla y León', 'Northwest'),
    community('PV', 'País Vasco', 'Northeast'), community('NC', 'Navarra', 'Northeast'), community('RI', 'La Rioja', 'Northeast'), community('AR', 'Aragón', 'Northeast'),
    community('CT', 'Cataluña', 'Northeast'), ['estelada', 'Cataluña', 'Northeast', AREAS_OF.CT, { short: 'CT', what: 'Estelada' }],
    community('MD', 'Madrid', 'Centre and south'), community('CM', 'Castilla-La Mancha', 'Centre and south'), community('EX', 'Extremadura', 'Centre and south'),
    community('VC', 'Comunidad Valenciana', 'Centre and south'), community('MC', 'Murcia', 'Centre and south'), community('AN', 'Andalucía', 'Centre and south'),
    community('IB', 'Islas Baleares', 'Islands and cities'), community('CN', 'Canarias', 'Islands and cities'), community('CE', 'Ceuta', 'Islands and cities'),
    community('ML', 'Melilla', 'Islands and cities'),
  ],
};
