// Malaysia Rulers: config for ../shared/area-quiz.js. The nine states with a hereditary ruler (Sultan, Raja, Yang
// di-Pertuan Besar), whose portraits hang in their state's offices and on its roadside banners: see the ruler, click
// the state (or name it from a list, type it, match it in pairs: MODES there). Two ways, each a round box's switch:
// Portrait, and Name (the ruler's name read, as on the banners). The rulers as of October 2026 (Wikipedia, "List of
// current heads of states and governments of Malaysia"): Johor's Sultan Ibrahim is also the King (the Yang di-Pertuan
// Agong) until 2029, his son Tunku Ismail Regent of Johor meanwhile. The portraits (img/<state>.jpg) are those of
// Wikimedia Commons, credited on the page. The map is the states map of ../malaysia-regions (DOSM).

// [state, state name, ruler as named, his full name and title, reigning since]
const RULERS = [
  ['PLS', 'Perlis', 'Tuanku Syed Sirajuddin', 'Raja of Perlis', 2000],
  ['KDH', 'Kedah', 'Sultan Sallehuddin', 'Sultan of Kedah', 2017],
  ['PRK', 'Perak', 'Sultan Nazrin Shah', 'Sultan Nazrin Muizzuddin Shah, Sultan of Perak', 2014],
  ['SGR', 'Selangor', 'Sultan Sharafuddin', 'Sultan Sharafuddin Idris Shah, Sultan of Selangor', 2001],
  ['NSN', 'Negeri Sembilan', 'Tuanku Muhriz', 'Yang di-Pertuan Besar of Negeri Sembilan', 2008],
  ['KTN', 'Kelantan', 'Sultan Muhammad V', 'Sultan of Kelantan', 2010],
  ['TRG', 'Terengganu', 'Sultan Mizan Zainal Abidin', 'Sultan of Terengganu', 1998],
  ['PHG', 'Pahang', 'Al-Sultan Abdullah', 'Al-Sultan Abdullah Ri\'ayatuddin, Sultan of Pahang', 2019],
  ['JHR', 'Johor', 'Sultan Ibrahim', 'Sultan Ibrahim Iskandar, Sultan of Johor, King of Malaysia since 2024', 2010],
];
const STATE = Object.fromEntries(RULERS.map(([id, state]) => [id, state]));
const RULER = Object.fromEntries(RULERS.map(([id, , ruler]) => [id, ruler]));
const TITLE = Object.fromEntries(RULERS.map(([id, , , title, since]) => [id, `${title} · since ${since}`]));
const ALL = RULERS.map(r => r[0]);
const GROUPS = [
  { title: 'West coast', sub: '', ids: ['PLS', 'KDH', 'PRK', 'SGR', 'NSN'] },
  { title: 'East coast and south', sub: '', ids: ['KTN', 'TRG', 'PHG', 'JHR'] },
];
// (the states and territories without a ruler, for a click on them)
const NAME_OF = { ...STATE, PNG: 'Pulau Pinang', MLK: 'Melaka', SBH: 'Sabah', SWK: 'Sarawak', KUL: 'Kuala Lumpur', LBN: 'Labuan', PJY: 'Putrajaya' };

const DIR = new URL('img/', document.currentScript.src).href;
const portrait = id => ({ src: `${DIR}${id}.jpg`, alt: 'portrait of a ruler', label: `${RULER[id]} · ${STATE[id]}`, link: '' });
// A way to be asked, each a kind of its own: by the portrait, or by the name. The answer is the state either way.
const kind = (key, label, lang, more) => ({
  key, label, lang, sub: `${ALL.length} rulers`, noun: ['ruler', 'rulers'], pickTitle: 'Rulers to practice',
  groups: GROUPS,
  areasOf: id => [id],
  areaLabel: a => STATE[a] || NAME_OF[a], flashArea: true,
  areaRank: false, hints: false,
  short: id => id, about: id => TITLE[id],
  clicked: a => (RULER[a] ? `${STATE[a]} · ${RULER[a]}` : NAME_OF[a]),
  modes: ['list', 'type', 'pairs'],
  chip: id => STATE[id], chipTitle: id => RULER[id],
  ...more,
});

const QUIZ = {
  key: 'myrulers',
  areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: '' })),
  borders: [],
  context: DATA.ctx,
  geo: GEO, proj: DATA.proj, kpu: DATA.kpu, // the map redrawn in Web Mercator (mercator.js), the street map under it
  street: {"bounds":[[0.8,99.6],[7.4,119.3]],"maxBounds":[[-6,90],[14,128]]},
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 40, labelScale: 0.3, fly: { pad: 1.6, min: 0.0375 },
  hintLabel: '', hintsDefault: false,
  langsAlways: true, // every round box shows Portrait | Name
  exploreKind: 'portraits',
  explore: a => (RULER[a] ? { code: a, title: RULER[a], sub: [STATE[a], TITLE[a]], photos: [portrait(a)] } : { code: a, title: NAME_OF[a], sub: 'Governor' }),
  rounds: [...GROUPS.map(g => ({ kind: 'portraits', label: g.title, groups: [g.title] })), { kind: 'portraits', label: 'All rulers' }],
  kinds: [
    kind('portraits', 'Portraits', 'Portrait', { name: id => STATE[id], prompt: 'photo', photo: portrait }),
    kind('names', 'Names', 'Name', { of: 'portraits', name: id => RULER[id], prompt: 'name' }),
  ],
};
