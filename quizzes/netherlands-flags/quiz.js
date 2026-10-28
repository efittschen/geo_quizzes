// Netherlands Province Flags: the flags of ../shared/flag-config.js. Every province has a flag, flown on its offices
// and town halls; Fryslân's pompeblêden flies on houses and farms all over Friesland. The flags (img/<ISO code>.svg)
// are those of Wikimedia Commons, each the one Wikidata names for its province. The map (data.js) is made by
// tools/geo2quiz.mjs from Natural Earth's provinces, the twelve in Europe; names as there (Fryslân).

const NAME = Object.fromEntries(DATA.reg.map(r => [r.id, r.name]));
const PARTS = [['North & East', ['GR', 'FR', 'DR', 'OV', 'FL', 'GE']], ['West & South', ['NH', 'ZH', 'UT', 'ZE', 'NB', 'LI']]];

const FLAGS = {
  key: 'nlflags', alt: 'province flag',
  map: {
    areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, s: r.s, g: '' })), context: DATA.ctx,
    proj: DATA.proj, kpu: DATA.kpu, // the map made ready in Web Mercator (tools/builds/mercator), the street map under it
    street: {"bounds":[[50.75,3.36],[53.56,7.23]],"maxBounds":[[48,0],[56,11]]},
    size: [DATA.w, DATA.h], pad: 16, maxZoom: 30, labelScale: 0.3, fly: { pad: 1.6, min: 0.05 },
  },
  parts: PARTS.map(([part]) => part),
  items: PARTS.flatMap(([part, ids]) => ids.map(id => [id, NAME[id], part, [id], { short: id }])),
};
