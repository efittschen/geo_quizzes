// Malaysia State Flags: config for ../shared/area-quiz.js. See a state's flag, click the state on the map. Two ways to
// see the flags, each a round box's switch: Clear, and Blurred (the picture blurred until answered: the colors and
// the layout, not the emblem's detail). Each has its own best results and its own review cards. The flags
// (img/<id>.jpg) are those of Wikimedia Commons, drawn into a 640x400 picture: the 13 states and the 3 federal
// territories, each of which has a flag of its own. Once a flag is answered, the answer box says what is on it and
// why (SYMBOLS). The map is the states map of ../malaysia-regions (DOSM), Kuala Lumpur and Putrajaya drawn larger, as
// there; the quiz map only (no street map).

// [id, name, region] in the regions of ../malaysia-regions (informal, plus East Malaysia).
const STATES = [
  ['KDH', 'Kedah', 'North'], ['PNG', 'Penang', 'North'], ['PRK', 'Perak', 'North'], ['PLS', 'Perlis', 'North'],
  ['KUL', 'Kuala Lumpur', 'Central'], ['PJY', 'Putrajaya', 'Central'], ['SGR', 'Selangor', 'Central'],
  ['JHR', 'Johor', 'South'], ['MLK', 'Melaka', 'South'], ['NSN', 'Negeri Sembilan', 'South'],
  ['KTN', 'Kelantan', 'East Coast'], ['PHG', 'Pahang', 'East Coast'], ['TRG', 'Terengganu', 'East Coast'],
  ['LBN', 'Labuan', 'East Malaysia'], ['SBH', 'Sabah', 'East Malaysia'], ['SWK', 'Sarawak', 'East Malaysia'],
];
const TERRITORY = ['KUL', 'PJY', 'LBN'];
// What a flag shows and why, said once the flag is answered.
const SYMBOLS = {
  KDH: 'Red with the state emblem in the corner: a crescent for Islam, a shield for the Sultan, and a wreath of rice stalks, as Kedah is Malaysia\'s "rice bowl".',
  PNG: 'A pinang (areca nut) palm, which gave the island its name (Pulau Pinang), between light blue for the sea, white for peace and yellow for prosperity.',
  PRK: 'White, yellow and black stripes for the Sultan, the Raja Muda (the heir) and the Raja di-Hilir, the next in line. Pahang\'s has no yellow.',
  PLS: 'Yellow over blue: yellow for the Raja, the ruler, and blue for the people.',
  KUL: 'Modelled on the national flag: red and white stripes, and a blue band with the yellow crescent and 14-pointed star.',
  PJY: 'The federal coat of arms (two tigers holding a shield) on yellow between blue bands: Putrajaya is the seat of the federal government.',
  SGR: 'Quartered red and yellow, the state\'s colors, with a white crescent and star for Islam in the red corner. Johor\'s has a blue field.',
  JHR: 'Blue for the state government, a red corner for its warriors, and a white crescent and star for the Sultan and Islam.',
  MLK: 'The national flag\'s colors: red over white, with a blue corner holding a yellow crescent and star.',
  NSN: 'Yellow for the Yang di-Pertuan Besar, the ruler; in the corner red for the people and black for the Undang, the chiefs who elect him.',
  KTN: 'In white on red: a crescent and star for Islam, with two kris (Malay daggers) and two spears.',
  PHG: 'White over black: white for the Sultan, black for the people. Perak\'s has a yellow stripe between them.',
  TRG: 'A white crescent and star for Islam on black for the people, framed in white for the Sultan who protects them.',
  LBN: 'Red, white and blue, the national flag\'s colors, with its yellow crescent and 14-pointed star: Labuan is a federal territory.',
  SBH: 'Mount Kinabalu, Malaysia\'s highest peak, in the corner, over stripes of blue (peace), white (purity) and red (courage).',
  SWK: 'Yellow, red and black, the colors of the Brooke Rajahs\' flag, and a nine-pointed star for the nine divisions the state had when it was adopted in 1988.',
};

const NAME = Object.fromEntries(STATES.map(([id, name]) => [id, name]));
const REGION = Object.fromEntries(STATES.map(([id, , region]) => [id, region]));
const KIND = id => (TERRITORY.includes(id) ? 'Federal territory' : 'State') + ' · ' + REGION[id];
const ALL = STATES.map(s => s[0]);
// Kuala Lumpur and Putrajaya drawn as circles, as in ../malaysia-regions/layers.js: their own shapes are too small to click.
const DRAWN = { KUL: 'M96.8,214.8a5.5,5.5 0 1,0 11,0a5.5,5.5 0 1,0 -11,0z', PJY: 'M98.2,226.6a4.5,4.5 0 1,0 9,0a4.5,4.5 0 1,0 -9,0z' };

const DIR = new URL('img/', document.currentScript.src).href;
const flag = (id, cls = '') => ({ src: `${DIR}${id}.jpg`, alt: 'state flag', label: NAME[id], cls, link: '' });
const GROUPS = ['North', 'Central', 'South', 'East Coast', 'East Malaysia'].map(title => ({ title, sub: '', ids: ALL.filter(id => REGION[id] === title) }));
// A way to see the flags: Clear, or Blurred (cls 'blur', see area-quiz.js), each a kind of its own.
const kind = (key, label, lang, cls, more = {}) => ({
  key, label, lang, sub: `${ALL.length} flags`, noun: ['flag', 'flags'], pickTitle: 'Flags to practice',
  groups: GROUPS,
  areasOf: id => [id],
  areaLabel: a => NAME[a], flashArea: true,
  areaRank: false, hints: false,
  short: id => id, name: id => NAME[id], about: id => [KIND(id), SYMBOLS[id]],
  clicked: a => NAME[a],
  prompt: 'photo', photo: id => flag(id, cls),
  modes: ['list', 'type', 'pairs'], looks: true,
  chip: id => NAME[id], chipTitle: id => KIND(id),
  ...more,
});

const QUIZ = {
  key: 'myflags',
  areas: DATA.reg.map(r => ({ id: r.id, d: DRAWN[r.id] || r.d, lx: r.lx, ly: r.ly, a: r.a, g: '', ...(DRAWN[r.id] ? { top: true } : {}) })),
  borders: [],
  context: DATA.ctx,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 40, labelScale: 0.3, fly: { pad: 1.6, min: 0.0375 },
  hintLabel: '', hintsDefault: false,
  langsAlways: true, // every round box shows Clear | Blurred
  exploreKind: 'flags',
  explore: a => ({ code: a, title: NAME[a], sub: [KIND(a), SYMBOLS[a]], photos: [flag(a)] }),
  rounds: [
    { kind: 'flags', label: 'North and Central', groups: ['North', 'Central'] },
    { kind: 'flags', label: 'South and East Coast', groups: ['South', 'East Coast'] },
    { kind: 'flags', label: 'East Malaysia', groups: ['East Malaysia'] },
    { kind: 'flags', label: 'All flags' },
  ],
  kinds: [kind('flags', 'Flags', 'Clear', ''), kind('blurred', 'Blurred flags', 'Blurred', 'blur', { of: 'flags' })],
};
