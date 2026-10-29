// Belgium Flags: the flags of ../shared/flag-config.js. The regions' and communities' flags, flown widely: Vlaanderen's
// black lion all over Flanders, Wallonie's red rooster, Brussels' iris, and the German-speaking Community's in the
// east of Liège; and the ten provinces' own flags, flown on their offices. The flags (img/<ISO code>.svg) are those
// of Wikimedia Commons, each the one Wikidata names for its region or province. The map (data.js) is made by
// tools/geo2quiz.mjs from Natural Earth's provinces; names in the province's own language.

const NAME = Object.fromEntries(DATA.reg.map(r => [r.id, r.name]));
const FLEMISH = ['VAN', 'VLI', 'VOV', 'VBR', 'VWV'], WALLOON = ['WBR', 'WHT', 'WLG', 'WLX', 'WNA'];

const FLAGS = {
  key: 'beflags', alt: 'flag',
  map: {
    areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, s: r.s, g: '' })), 
    proj: DATA.proj, // the map made ready in Web Mercator (tools/builds/mercator), the street map under it
    
    size: [DATA.w, DATA.h], pad: 16, maxZoom: 30, labelScale: 0.3, fly: { pad: 1.6, min: 0.05 },
  },
  parts: ['Regions', 'Vlaanderen', 'Wallonie'],
  items: [
    ['VLG', 'Vlaanderen', 'Regions', FLEMISH], ['WAL', 'Wallonie', 'Regions', WALLOON], ['BRU', 'Bruxelles / Brussel', 'Regions', ['BRU']],
    ['DG', 'Ostbelgien', 'Regions', ['WLG'], { what: 'Deutschsprachige Gemeinschaft' }],
    ...FLEMISH.map(id => [id, NAME[id], 'Vlaanderen', [id], { what: 'Provincie' }]),
    ...WALLOON.map(id => [id, NAME[id], 'Wallonie', [id], { what: 'Province' }]),
  ],
  areaName: a => NAME[a],
};
