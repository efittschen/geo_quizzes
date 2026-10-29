// Germany State Flags: the flags of ../shared/flag-config.js. Each state's flag as flown on its buildings, and Bayern
// twice, its lozenges as well as its stripes, as both are seen. The flags (img/<flag>.svg) are those of Wikimedia
// Commons (public domain). The map is the districts map of ../germany-regions (BKG), each state its districts drawn as
// one.

const AREAS_OF = {};
for (const r of DATA.reg) (AREAS_OF[r.st] ||= []).push(r.id);
const state = (st, name, part) => [st, name, part, AREAS_OF[st], { short: st }];

const FLAGS = {
  key: 'deflags', alt: 'state flag',
  map: {
    areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, s: r.s, g: '' })), 
    proj: DATA.proj, // the map made ready in Web Mercator (tools/builds/mercator), the street map under it
    
    size: [DATA.w, DATA.h], pad: 16, maxZoom: 30, labelScale: 0.3, fly: { pad: 1.6, min: 0.0375 },
  },
  parts: ['North', 'East', 'West', 'South'],
  items: [
    state('SH', 'Schleswig-Holstein', 'North'), state('HH', 'Hamburg', 'North'), state('HB', 'Bremen', 'North'), state('NI', 'Niedersachsen', 'North'),
    state('MV', 'Mecklenburg-Vorpommern', 'North'),
    state('BE', 'Berlin', 'East'), state('BB', 'Brandenburg', 'East'), state('ST', 'Sachsen-Anhalt', 'East'), state('SN', 'Sachsen', 'East'), state('TH', 'Thüringen', 'East'),
    state('NW', 'Nordrhein-Westfalen', 'West'), state('HE', 'Hessen', 'West'), state('RP', 'Rheinland-Pfalz', 'West'), state('SL', 'Saarland', 'West'),
    state('BW', 'Baden-Württemberg', 'South'), state('BY', 'Bayern', 'South'),
    ['BY2', 'Bayern', 'South', AREAS_OF.BY, { short: 'BY', what: 'Rautenflagge' }],
  ],
};
