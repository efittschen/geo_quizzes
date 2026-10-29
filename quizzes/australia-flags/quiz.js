// Australia State Flags: the flags of ../shared/flag-config.js. Each state and territory flies its flag beside
// Australia's on its offices, schools and at sports grounds. The flags (img/<ISO code>.svg) are those of Wikimedia
// Commons, each the one Wikidata names for its state. The map is the states map of ../australia-prefixes (ABS): its
// outlines DATA.ent, area st<i> the i-th.

const FLAGS = {
  key: 'auflags', alt: 'state flag',
  map: {
    areas: DATA.ent.map((d, i) => ({ id: 'st' + i, d, g: '', ...(DATA.entAt ? { lx: DATA.entAt[i][0], ly: DATA.entAt[i][1], s: DATA.entAt[i][2] } : {}) })), 
    proj: DATA.proj, // the map made ready in Web Mercator (tools/builds/mercator), the street map under it
    
    size: [1100, 1063], pad: 16, maxZoom: 40, labelScale: 0.2, fly: { pad: 1.6, min: 0.04 },
  },
  parts: ['States', 'Territories'],
  items: [
    ['WA', 'Western Australia', 'States', ['st0']], ['SA', 'South Australia', 'States', ['st2']], ['QLD', 'Queensland', 'States', ['st3']],
    ['NSW', 'New South Wales', 'States', ['st4']], ['VIC', 'Victoria', 'States', ['st5']], ['TAS', 'Tasmania', 'States', ['st6']],
    ['NT', 'Northern Territory', 'Territories', ['st1']], ['ACT', 'Australian Capital Territory', 'Territories', ['st7']],
  ].map(it => [...it, { short: it[0] }]),
};
