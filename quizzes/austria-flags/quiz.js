// Austria State Flags: the flags of ../shared/flag-config.js. Every state flies its two or three stripes beside
// Austria's, on offices, at town entrances, on houses and in the mountains. The flags (img/<state>.svg) are those of
// Wikimedia Commons, each the one Wikidata names for its state. The map is the districts map of ../austria-regions
// (Statistik Austria), each state its districts drawn as one.

const AREAS_OF = {};
for (const r of DATA.reg) (AREAS_OF[r.st] ||= []).push(r.id);
const state = (id, name, part) => [id, name, part, AREAS_OF[id]];

const FLAGS = {
  key: 'atflags', alt: 'state flag',
  map: {
    areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, s: r.s, g: '' })), 
    proj: DATA.proj, // the map made ready in Web Mercator (tools/builds/mercator), the street map under it
    
    size: [1000, 516], pad: 16, maxZoom: 40, labelScale: 0.25, fly: { pad: 1.8, min: 0.0375 },
  },
  parts: ['West', 'East'],
  items: [
    state('8', 'Vorarlberg', 'West'), state('7', 'Tirol', 'West'), state('5', 'Salzburg', 'West'), state('2', 'Kärnten', 'West'),
    state('4', 'Oberösterreich', 'East'), state('3', 'Niederösterreich', 'East'), state('9', 'Wien', 'East'), state('1', 'Burgenland', 'East'), state('6', 'Steiermark', 'East'),
  ],
};
