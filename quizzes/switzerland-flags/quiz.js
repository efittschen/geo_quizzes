// Switzerland Canton Flags: the flags of ../shared/flag-config.js. The flags (img/<canton>.svg) are those of Wikimedia
// Commons (public domain), square as the cantons fly them. The map (data.js) is made by tools/geo2quiz.mjs from
// Natural Earth's cantons. Names as in the canton itself (Genève, Ticino, Graubünden): DATA.reg[].name.

const NAME = Object.fromEntries(DATA.reg.map(r => [r.id, r.name]));
const PARTS = [
  ['West', ['GE', 'VD', 'VS', 'NE', 'JU', 'FR']],
  ['Mittelland & Northwest', ['BE', 'SO', 'BS', 'BL', 'AG']],
  ['Central & Zürich', ['LU', 'UR', 'SZ', 'OW', 'NW', 'ZG', 'ZH']],
  ['East & Ticino', ['GL', 'SH', 'AR', 'AI', 'SG', 'GR', 'TG', 'TI']],
];

const FLAGS = {
  key: 'chflags', alt: 'canton flag',
  map: {
    areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: '' })), context: DATA.ctx,
    geo: GEO, proj: DATA.proj, kpu: DATA.kpu, // the map redrawn in Web Mercator (mercator.js), the street map under it
    street: {"bounds":[[45.8,5.95],[47.81,10.5]],"maxBounds":[[43,2],[50,14]]},
    size: [DATA.w, DATA.h], pad: 16, maxZoom: 30, labelScale: 0.3, fly: { pad: 1.6, min: 0.0375 },
  },
  parts: PARTS.map(([part]) => part),
  items: PARTS.flatMap(([part, ids]) => ids.map(id => [id, NAME[id], part, [id], { short: id }])),
};
