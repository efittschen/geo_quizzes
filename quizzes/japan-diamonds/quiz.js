// Japan Diamonds: config for ../shared/area-quiz.js. See a diamond painted on the road (ダイヤマーク, "a crossing
// ahead"), pick every prefecture it may be seen in, then Check (pickAll, see area-quiz.js). Prefectures paint them
// in designs of their own: those of plonkit.net/japan's "Japan Diamonds Infographic Map", with its notes (Nagano
// uses two designs; Saga may paint its design small or thin, Niigata and Ibaraki theirs thin). The plain unbroken
// diamond is found everywhere, so it is not asked; a prefecture with nothing else paints only that one. The pictures
// (img/<design>.svg) are drawings made for this quiz after those designs (tools/builds/japan-diamonds), not photos.
// The map is the prefectures of ../shared/maps/japan-regions/data.js, those split there by power utility joined (prefs.js).

const PREF = ['Hokkaido', 'Aomori', 'Iwate', 'Miyagi', 'Akita', 'Yamagata', 'Fukushima', 'Ibaraki', 'Tochigi', 'Gunma',
  'Saitama', 'Chiba', 'Tokyo', 'Kanagawa', 'Niigata', 'Toyama', 'Ishikawa', 'Fukui', 'Yamanashi', 'Nagano', 'Gifu',
  'Shizuoka', 'Aichi', 'Mie', 'Shiga', 'Kyoto', 'Osaka', 'Hyogo', 'Nara', 'Wakayama', 'Tottori', 'Shimane', 'Okayama',
  'Hiroshima', 'Yamaguchi', 'Tokushima', 'Kagawa', 'Ehime', 'Kochi', 'Fukuoka', 'Saga', 'Nagasaki', 'Kumamoto', 'Oita',
  'Miyazaki', 'Kagoshima', 'Okinawa']; // in JIS order: p01 Hokkaido … p47 Okinawa
const PID = Object.fromEntries(PREF.map((name, i) => [name, 'p' + String(i + 1).padStart(2, '0')]));
const NAME = Object.fromEntries(PREF.map(name => [PID[name], name]));

// [design (its picture), group, prefectures, what it looks like, a note]
const DESIGNS = [
  ['two-right', 'Two pieces', ['Mie', 'Kochi'], 'Thick, in two halves: the right one holds the top, the left one the bottom (gaps top left and bottom right)', ''],
  ['two-right-thin', 'Two pieces', ['Ishikawa', 'Kumamoto'], 'Thin, in two halves: gaps top left and bottom right', ''],
  ['two-left', 'Two pieces', ['Miyagi', 'Kyoto', 'Hyogo', 'Okayama'], 'Thick, in two halves: the left one holds the top, the right one the bottom (gaps top right and bottom left)', ''],
  ['two-left-small', 'Two pieces', ['Hiroshima', 'Tokushima'], 'Small, in two halves: gaps top right and bottom left', ''],
  ['side', 'Two pieces', ['Kagawa'], 'Thick: the right side whole, the left side cut short at both ends', ''],
  ['side-thin', 'Two pieces', ['Shizuoka', 'Nagano'], 'Thin: the right side whole, the left side cut short at both ends', 'Nagano also paints the thin unbroken one'],
  ['two-corners', 'Two pieces', ['Aomori'], 'Thick, a top and a bottom piece: gaps just above the left corner and just below the right one', ''],
  ['across', 'Two pieces', ['Tottori', 'Shimane', 'Saga'], 'Thick, cut straight across the middle', 'Saga may also paint it small or thin'],
  ['across-small', 'Two pieces', ['Saga'], 'Small, cut straight across the middle', 'Saga\'s own variant of the design of Tottori, Shimane and Saga'],
  ['across-thin', 'Two pieces', ['Saga'], 'Thin, cut straight across the middle', 'Saga\'s own variant of the design of Tottori, Shimane and Saga'],
  ['four-left', 'Four pieces', ['Toyama', 'Oita'], 'Thick, in four: long sides top left and bottom right, short ones between', ''],
  ['four-right', 'Four pieces', ['Ibaraki', 'Tochigi', 'Saitama', 'Niigata', 'Shiga', 'Okinawa'], 'Thick, in four: long sides top right and bottom left, short ones between', 'Niigata and Ibaraki may also paint it thin'],
  ['four-right-thin', 'Four pieces', ['Ibaraki', 'Niigata'], 'Thin, in four: long sides top right and bottom left', 'The thin variant of Niigata and Ibaraki'],
  ['wheel-left', 'Four pieces', ['Nara', 'Wakayama'], 'Thick, in four like a pinwheel: the top corner on the left piece', ''],
  ['wheel-right', 'Four pieces', ['Gunma', 'Chiba', 'Gifu'], 'Thick, in four like a pinwheel: the top corner on the right piece', ''],
  ['wheel-right-thin', 'Four pieces', ['Yamanashi'], 'Thin, in four like a pinwheel: the top corner on the right piece', ''],
  ['whole-thin', 'Unbroken', ['Nagano', 'Aichi', 'Yamaguchi', 'Kagoshima'], 'Thin and unbroken: "regular but thin" (the thick unbroken one is everywhere)', 'Nagano also paints the thin one with the left side cut short'],
];
const D = Object.fromEntries(DESIGNS.map(([id, group, prefs, look, note]) => [id, { group, prefs, look, note }]));
const ALL = DESIGNS.map(d => d[0]);
const AT = {}; // prefecture -> its designs
for (const [id, , prefs] of DESIGNS) for (const name of prefs) (AT[PID[name]] ||= []).push(id);

// One area per prefecture: its own from data.js, or the joined one of prefs.js where data.js splits it.
const PIECES = {};
for (const r of DATA.reg) (PIECES[r.pf] ||= []).push(r);
const PREF_AREAS = Object.entries(PIECES).map(([pf, [r]]) => ({ id: 'p' + String(pf).padStart(2, '0'), ...(PREF_SHAPES[pf] || { d: r.d, lx: r.lx, ly: r.ly, a: r.a, s: r.s }), g: '' }));

const DIR = new URL('img/', document.currentScript.src).href;
const prefsOf = id => D[id].prefs.join(', ');
const photo = id => ({ src: `${DIR}${id}.svg`, alt: 'diamond road marking', label: `${prefsOf(id)} · ${D[id].look}`, link: '' });
const PLAIN = { src: `${DIR}whole.svg`, alt: 'diamond road marking', label: 'Everywhere · thick and unbroken', link: '' };
const GROUPS = ['Two pieces', 'Four pieces', 'Unbroken'].map(title => ({ title, sub: '', ids: ALL.filter(id => D[id].group === title) }));

const QUIZ = {
  key: 'jpdiamonds',
  areas: PREF_AREAS,
  borders: [],
  
  proj: DATA.proj, // the map made ready in Web Mercator (tools/builds/mercator), the street map under it
  
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 40, labelScale: 0.22, fly: { pad: 1.6, min: 0.0375 },
  hintLabel: '', hintsDefault: false,
  exploreKind: 'diamonds',
  explore: a => {
    const ids = AT[a] || [];
    return { code: a.slice(1), title: NAME[a], sub: ids.length ? [...ids.map(id => D[id].look), 'And the plain one, as everywhere'] : 'Only the plain one, found everywhere', photos: ids.length ? ids.map(photo) : [PLAIN] };
  },
  rounds: [
    { kind: 'diamonds', label: 'Two pieces', groups: ['Two pieces'] },
    { kind: 'diamonds', label: 'Four pieces or unbroken', groups: ['Four pieces', 'Unbroken'] },
    { kind: 'diamonds', label: 'All diamonds' },
  ],
  kinds: [{
    key: 'diamonds', label: 'Diamonds', sub: `${ALL.length} designs`, noun: ['diamond', 'diamonds'], pickTitle: 'Diamonds to practice',
    groups: GROUPS,
    areasOf: id => D[id].prefs.map(name => PID[name]),
    pickAll: true, areaNoun: 'prefectures',
    areaLabel: a => NAME[a],
    areaRank: false, hints: false,
    short: id => prefsOf(id), name: id => prefsOf(id), about: id => [D[id].look, D[id].note].filter(Boolean),
    clicked: a => NAME[a],
    prompt: 'photo', photo,
    chip: id => prefsOf(id), chipTitle: id => D[id].look,
  }],
};
