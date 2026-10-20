// Japan Power Company Logos: config for ../shared/area-quiz.js. See an electric utility's logo, click the region it
// serves. The ten utilities each serve one region (Kanto: TEPCO, Chubu: Chubu Electric…), and their marks show up
// on poles, plates, covers and vans. The pictures (img/<utility>-<n>.jpg) are the ones of the player's reference
// documents (logos, and the marks as seen in the street; Tohoku's two and Okinawa's second from the "English Guide to
// Regional Plates on Japanese Utility Poles"), one to three per utility; NTT's, the telephone company's, is left out,
// as it is the same everywhere. Learn shows them all, utility by utility, with the area each serves. The map is the utilities' areas of ../japan-regions/data.js (field
// pw: prefectures split where a border between two utilities runs through them), each utility drawn as one region.

// utility (pw in data.js) -> [region, utility, Japanese name, regions served]
const UTILITIES = {
  hokkaido: ['Hokkaido', 'Hokkaido Electric Power', '北海道電力', 'Hokkaido'],
  tohoku: ['Tohoku', 'Tohoku Electric Power', '東北電力', 'Aomori, Iwate, Miyagi, Akita, Yamagata, Fukushima and Niigata'],
  hokuriku: ['Hokuriku', 'Hokuriku Electric Power', '北陸電力', 'Mainly Toyama, Ishikawa and Fukui'],
  tepco: ['Kanto', 'Tokyo Electric Power (TEPCO)', '東京電力', 'Tokyo, Kanagawa, Saitama, Chiba, Ibaraki, Tochigi, Gunma, Yamanashi and eastern Shizuoka'],
  chubu: ['Chubu', 'Chubu Electric Power', '中部電力', 'Mainly Aichi, Gifu, Mie, Nagano and central and western Shizuoka'],
  kansai: ['Kansai', 'Kansai Electric Power', '関西電力', 'Osaka, Kyoto, Hyogo, Nara, Shiga and Wakayama'],
  chugoku: ['Chugoku', 'Chugoku Electric Power (Energia)', '中国電力', 'Tottori, Shimane, Okayama, Hiroshima and Yamaguchi'],
  shikoku: ['Shikoku', 'Shikoku Electric Power', '四国電力', 'Kagawa, Tokushima, Ehime and Kochi'],
  kyushu: ['Kyushu', 'Kyushu Electric Power', '九州電力', 'Fukuoka, Saga, Nagasaki, Kumamoto, Oita, Miyazaki and Kagoshima'],
  okinawa: ['Okinawa', 'Okinawa Electric Power', '沖縄電力', 'Okinawa'],
};
// [picture, utility, a note on it]
const LOGOS = [
  ['hokkaido-1', 'hokkaido', ''],
  ['tohoku-1', 'tohoku', 'Its service area takes in Niigata too'], ['tohoku-2', 'tohoku', 'Its service area takes in Niigata too'],
  ['hokuriku-1', 'hokuriku', ''], ['hokuriku-2', 'hokuriku', ''], ['hokuriku-3', 'hokuriku', 'The mark as seen in the street'],
  ['tepco-1', 'tepco', ''], ['tepco-2', 'tepco', ''], ['tepco-3', 'tepco', 'The mark as seen in the street'],
  ['chubu-1', 'chubu', ''], ['chubu-2', 'chubu', ''], ['chubu-3', 'chubu', 'The mark as seen in the street'],
  ['kansai-1', 'kansai', ''], ['kansai-2', 'kansai', ''],
  ['chugoku-1', 'chugoku', 'E for Energia, its brand: "Energia" written on a sign is Chugoku too'], ['chugoku-2', 'chugoku', ''],
  ['shikoku-1', 'shikoku', ''], ['shikoku-2', 'shikoku', ''], ['shikoku-3', 'shikoku', 'The mark as seen in the street'],
  ['kyushu-1', 'kyushu', 'Often between 安 and 全 ("safety")'], ['kyushu-2', 'kyushu', ''], ['kyushu-3', 'kyushu', 'The mark as seen in the street; often between 安 and 全 ("safety")'],
  ['okinawa-1', 'okinawa', ''], ['okinawa-2', 'okinawa', ''],
];
// rounds of neighbouring utilities, each under ten logos (Beginner), then all of them
const PARTS = [['North', ['hokkaido', 'tohoku', 'hokuriku']], ['Kanto and Chubu', ['tepco', 'chubu']], ['Kansai, Chugoku and Shikoku', ['kansai', 'chugoku', 'shikoku']], ['Kyushu and Okinawa', ['kyushu', 'okinawa']]];

const L = Object.fromEntries(LOGOS.map(([id, pw, note]) => [id, { pw, note }]));
const ALL = LOGOS.map(l => l[0]);
const AREAS_OF = {};
for (const r of DATA.reg) (AREAS_OF[r.pw] ||= []).push(r.id);
const PW = Object.fromEntries(DATA.reg.map(r => [r.id, r.pw]));
const DIR = new URL('img/', document.currentScript.src).href;
const nameOf = pw => `${UTILITIES[pw][1]} · ${UTILITIES[pw][2]}`;
const aboutOf = id => [UTILITIES[L[id].pw][3], L[id].note].filter(Boolean).join(' · ');
const photo = id => ({ src: `${DIR}${id}.jpg`, alt: 'power company logo', label: `${UTILITIES[L[id].pw][0]}: ${nameOf(L[id].pw)}${L[id].note ? ' · ' + L[id].note : ''}`, link: '' });
const GROUPS = PARTS.map(([title, pws]) => ({ title, sub: '', ids: ALL.filter(id => pws.includes(L[id].pw)) }));

const QUIZ = {
  key: 'jplogos',
  areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: '' })),
  borders: [],
  context: DATA.ctx,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 40, labelScale: 0.22, fly: { pad: 1.6, min: 0.0375 },
  hintLabel: '', hintsDefault: false,
  exploreKind: 'photos',
  explore: a => { const pw = PW[a]; return { code: UTILITIES[pw][0], title: nameOf(pw), sub: UTILITIES[pw][3], photos: ALL.filter(id => L[id].pw === pw).map(photo) }; },
  // Learn: every utility with its area and all its logos, north to south
  learn: {
    title: 'Japan’s power companies', sub: 'Each region’s electric utility, the area it serves and its logos. Tap a logo to see it large.',
    sections: Object.keys(UTILITIES).map(pw => ({ title: UTILITIES[pw][0], sub: [nameOf(pw), UTILITIES[pw][3]], areas: AREAS_OF[pw], photos: ALL.filter(id => L[id].pw === pw).map(photo) })),
  },
  rounds: [...GROUPS.map(g => ({ kind: 'photos', label: g.title, groups: [g.title] })), { kind: 'photos', label: 'All logos' }],
  kinds: [{
    key: 'photos', label: 'Logos', sub: `${ALL.length} logos`, noun: ['logo', 'logos'], pickTitle: 'Logos to practice',
    groups: GROUPS,
    areasOf: id => AREAS_OF[L[id].pw],
    areaRank: false, hints: false,
    short: id => UTILITIES[L[id].pw][0], name: id => nameOf(L[id].pw), about: aboutOf,
    clicked: a => `${UTILITIES[PW[a]][0]}: ${UTILITIES[PW[a]][1]}`,
    prompt: 'photo', photo,
    chip: id => UTILITIES[L[id].pw][0], chipTitle: id => UTILITIES[L[id].pw][1],
  }],
};
