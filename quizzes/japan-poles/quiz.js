// Japan Pole Plates: config for ../shared/area-quiz.js. See the plate on a utility pole, click the region it is in.
// Each electric utility labels its poles with plates of its own design: the ten regions of plonkit.net/japan's
// "Japan Pole Plates Infographic Map", one utility each (Kanto: TEPCO, Chubu: Chubu Electric…). The pictures
// (img/<picture>.svg) are drawings made for this quiz after those designs, not photos; the yellow plates of Hokkaido
// and Chubu are pictures of their own. NTT's plates (the telephone poles') are much the same everywhere, so they are
// not asked. The map is the utilities' areas of ../japan-regions/data.js (field pw: prefectures split where a
// border between two utilities runs through them), each utility drawn as one region.

// region key (pw in data.js) -> [region, utility]
const REGIONS = {
  hokkaido: ['Hokkaido', 'Hokkaido Electric'], tohoku: ['Tohoku', 'Tohoku Electric'], tepco: ['Kanto', 'TEPCO'],
  chubu: ['Chubu', 'Chubu Electric'], hokuriku: ['Hokuriku', 'Hokuriku Electric'], kansai: ['Kansai', 'Kansai Electric'],
  chugoku: ['Chugoku', 'Chugoku Electric (Energia)'], shikoku: ['Shikoku', 'Shikoku Electric'], kyushu: ['Kyushu', 'Kyushu Electric'],
  okinawa: ['Okinawa', 'Okinawa Electric'],
};
// [picture, region key, what tells it apart]
const PLATES = [
  ['hokkaido', 'hokkaido', 'Tall plate full of characters: columns of numbers and kanji'],
  ['hokkaido-yellow', 'hokkaido', 'The same plate in yellow, as it sometimes is'],
  ['tohoku', 'tohoku', 'Silver, wider than tall: lightning mark, 地方名位置, a line like 12南3東4'],
  ['kanto', 'tepco', 'Often silver: 場所 across the top, three hand-written digits down the plate'],
  ['chubu', 'chubu', 'Rounded ends: a mark on top, a short line across, digits down'],
  ['chubu-yellow', 'chubu', 'The rounded plate in yellow, as it sometimes is'],
  ['hokuriku', 'hokuriku', 'Several horizontal plates, NTT\'s among them (also often in Niigata and Nagano)'],
  ['kansai', 'kansai', 'Japanese written down the right, other characters below in rows of two'],
  ['chugoku', 'chugoku', 'Often a larger plate with "Energia" in Latin letters; an orange arrow on the pole'],
  ['shikoku', 'shikoku', 'Several rows of characters, read left to right; an orange band on the pole'],
  ['kyushu', 'kyushu', 'Three numbers across near the top, four characters down the right below them'],
  ['okinawa', 'okinawa', 'Up to three or four plates; bars between the characters'],
];
const EAST = ['hokkaido', 'tohoku', 'tepco', 'chubu', 'hokuriku'];

const P = Object.fromEntries(PLATES.map(([id, region, note]) => [id, { region, note }]));
const ALL = PLATES.map(p => p[0]);
const AREAS_OF = {};
for (const r of DATA.reg) (AREAS_OF[r.pw] ||= []).push(r.id);
const PW = Object.fromEntries(DATA.reg.map(r => [r.id, r.pw]));
const DIR = new URL('img/', document.currentScript.src).href;
const nameOf = region => `${REGIONS[region][0]} (${REGIONS[region][1]})`;
const photo = id => ({ src: `${DIR}${id}.svg`, alt: 'utility pole plate', label: `${nameOf(P[id].region)} · ${P[id].note}`, link: '' });
const GROUPS = [
  { title: 'East and north', sub: '', ids: ALL.filter(id => EAST.includes(P[id].region)) },
  { title: 'West and south', sub: '', ids: ALL.filter(id => !EAST.includes(P[id].region)) },
];

const QUIZ = {
  key: 'jppoles',
  areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, s: r.s, g: '' })),
  borders: [],
  context: DATA.ctx,
  proj: DATA.proj, kpu: DATA.kpu, // the map made ready in Web Mercator (tools/builds/mercator), the street map under it
  street: {"bounds":[[24,123],[45.6,146]],"maxBounds":[[18,115],[50,158]]},
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 40, labelScale: 0.22, fly: { pad: 1.6, min: 0.0375 },
  hintLabel: '', hintsDefault: false,
  exploreKind: 'photos',
  explore: a => { const region = PW[a]; return { code: REGIONS[region][0], title: REGIONS[region][1], sub: '', photos: ALL.filter(id => P[id].region === region).map(photo) }; },
  rounds: [...GROUPS.map(g => ({ kind: 'photos', label: g.title, groups: [g.title] })), { kind: 'photos', label: 'All plates' }],
  kinds: [{
    key: 'photos', label: 'Pole plates', sub: `${ALL.length} plates`, noun: ['plate', 'plates'], pickTitle: 'Plates to practice',
    groups: GROUPS,
    areasOf: id => AREAS_OF[P[id].region],
    areaRank: false, hints: false,
    short: id => REGIONS[P[id].region][0], name: id => nameOf(P[id].region), about: id => P[id].note,
    clicked: a => nameOf(PW[a]),
    prompt: 'photo', photo,
    chip: id => REGIONS[P[id].region][0], chipTitle: id => P[id].note,
  }],
};
