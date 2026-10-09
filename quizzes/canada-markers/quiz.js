// Canada Kilometre Markers: config for ../shared/area-quiz.js. See a kilometre marker, click its province.
// Each province signs the kilometres along its highways in a design of its own: the ten shown on plonkit.net/canada
// ("Each province has its own unique kilometre markers"; Ontario's white square at the bottom is the one named there
// as unique). The pictures (img/<postal code>.svg) are drawings made for this quiz after those designs, not photos.
// Prince Edward Island, the Northwest Territories and Nunavut have none there, so no question is about them.
// The map is the provinces of ../canada-codes/provinces.js, as in ../canada-provinces.

// [postal code, what tells it apart]
const MARKERS = [
  ['YT', 'Tall, narrow board with small digits and no "km"'],
  ['BC', '"km" on a plate of its own above the number plate'],
  ['AB', 'One rounded plate: "km" and large digits'],
  ['SK', 'Wide plate with the number on one line'],
  ['MB', 'White-edged plate, "km" in a box, thin digits'],
  ['ON', 'White square with the decimal at the bottom'],
  ['QC', 'Bright green, blank band on the left, "km" boxed'],
  ['NB', 'Narrow plate with a band on the left, "km" boxed'],
  ['NS', 'Pale green: highway and direction on top, "KM" at the bottom'],
  ['NL', 'Black-edged plate, small "km", heavy digits'],
];
const WEST = ['YT', 'BC', 'AB', 'SK', 'MB'];

const PROV = Object.fromEntries(PROVINCES.map(p => [p.postal, p]));
const NOTE = Object.fromEntries(MARKERS);
const ALL = MARKERS.map(m => m[0]);
const DIR = new URL('img/', document.currentScript.src).href;
const photo = id => ({ src: `${DIR}${id}.svg`, alt: 'kilometre marker', label: `${PROV[id].name} · ${NOTE[id]}`, link: '' });
const GROUPS = [
  { title: 'West and north', sub: '', ids: ALL.filter(id => WEST.includes(id)) },
  { title: 'East', sub: '', ids: ALL.filter(id => !WEST.includes(id)) },
];

const QUIZ = {
  key: 'camarkers',
  areas: PROVINCES.map(p => ({ id: p.id, d: p.d, lx: p.lx, ly: p.ly, a: p.a, g: '' })),
  borders: [],
  context: DATA.ctx,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 40, labelScale: 0.2, fly: { pad: 1.6, min: 0.04 },
  hintLabel: '', hintsDefault: false,
  exploreKind: 'photos',
  explore: a => { const p = PROVINCES.find(p => p.id === a), has = ALL.includes(p.postal); return { code: p.postal, title: p.name, sub: has ? NOTE[p.postal] : 'No marker in this quiz', photos: has ? [photo(p.postal)] : [] }; },
  rounds: [...GROUPS.map(g => ({ kind: 'photos', label: g.title, groups: [g.title] })), { kind: 'photos', label: 'All markers' }],
  kinds: [{
    key: 'photos', label: 'Kilometre markers', sub: `${ALL.length} markers`, noun: ['marker', 'markers'], pickTitle: 'Markers to practice',
    groups: GROUPS,
    areasOf: id => [PROV[id].id],
    areaLabel: a => a.slice(2), flashArea: true,
    areaRank: false, hints: false,
    short: id => id, name: id => PROV[id].name, about: id => NOTE[id],
    clicked: a => PROVINCES.find(p => p.id === a).name,
    prompt: 'photo', photo,
    chip: id => id, chipTitle: id => PROV[id].name,
  }],
};
