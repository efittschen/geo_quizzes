// Russia Languages: config for ../shared/area-quiz.js, on the federal-subject map of ../russia-codes.
// Republics whose own language shows up on signs next to Russian: click the republic for a language, for the extra
// letters of its alphabet, or for its word for "street".
//
// Sources: which republics sign bilingually: Plonk It (plonkit.net/russia: Tatar, Bashkir, Chuvash, Mari, Komi street
// signs and their words for "street"; Saransk's street signs in up to 4 languages) and Wikimedia Commons photos of
// bilingual town-entry, district and street signs (Udmurt, Sakha, Buryat, Tuvan, Altai, Kalmyk, Chechen, Ossetian,
// Karelian). Letters beyond the Russian alphabet: Unicode CLDR 48 exemplar characters (tt, ba, cv, sah, bua, tyv, ce,
// os) and the alphabets in Russian Wikipedia (Komi, Udmurt, Mari, Altai, Kalmyk, Karelian). Republics with no
// evidence of signs in their own language found (Adygea, Kabardino-Balkaria, Karachay-Cherkessia, Ingushetia,
// Dagestan, Khakassia) are not asked; Erzya and Moksha use no letters beyond Russian, so Mordovia has no letter set.

const R = Object.fromEntries(DATA.reg.map(r => [r.id, r]));
// Language family of each republic's language, for the hint colors.
const FAMILY = {
  TA: 'turkic', BA: 'turkic', CU: 'turkic', SA: 'turkic', TY: 'turkic', AL: 'turkic',
  ME: 'uralic', KO: 'uralic', UD: 'uralic', MO: 'uralic', KR: 'uralic',
  BU: 'mongolic', KL: 'mongolic', CE: 'caucasian', SE: 'iranian',
};
// Languages: [id, name, republics, letters beyond Russian ('' if none)].
const LANGS = [
  ['tt', 'Tatar', ['TA'], 'ә ө ү җ ң һ'],
  ['ba', 'Bashkir', ['BA'], 'ә ғ ҙ ҡ ң ө ҫ ү һ'],
  ['cv', 'Chuvash', ['CU'], 'ӑ ӗ ҫ ӳ'],
  ['chm', 'Mari', ['ME'], 'ҥ ӧ ӱ · ӓ ӹ'],
  ['myv', 'Erzya & Moksha', ['MO'], ''],
  ['udm', 'Udmurt', ['UD'], 'ӝ ӟ ӥ ӧ ӵ'],
  ['kv', 'Komi', ['KO'], 'і ӧ'],
  ['krl', 'Karelian', ['KR'], 'č š ž ä ö'],
  ['sah', 'Sakha (Yakut)', ['SA'], 'ҕ ҥ ө ү һ'],
  ['bua', 'Buryat', ['BU'], 'ө ү һ'],
  ['tyv', 'Tuvan', ['TY'], 'ң ө ү'],
  ['alt', 'Altai', ['AL'], 'ј ҥ ӧ ӱ'],
  ['xal', 'Kalmyk', ['KL'], 'ә һ җ ң ө ү'],
  ['ce', 'Chechen', ['CE'], 'Ӏ'],
  ['os', 'Ossetian', ['SE'], 'ӕ'],
];
const LANG = Object.fromEntries(LANGS.map(([id, n, r, x]) => [id, { n, r, x }]));
// Letter sets as asked: each language's extra letters; Tatar and Kalmyk add the same six, so they are one item.
// Mari: Meadow Mari (ҥ ӧ ӱ) and Hill Mari (ӓ ӧ ӱ ӹ), both state languages of Mari El.
const LETTERS = {
  'tt+xal': { t: 'ә ө ү җ ң һ', langs: ['tt', 'xal'] },
  ba: { t: 'ә ғ ҙ ҡ ң ө ҫ ү һ', langs: ['ba'] },
  cv: { t: 'ӑ ӗ ҫ ӳ', langs: ['cv'] },
  mhr: { t: 'ҥ ӧ ӱ', langs: ['chm'], n: 'Meadow Mari' },
  mrj: { t: 'ӓ ӧ ӱ ӹ', langs: ['chm'], n: 'Hill Mari' },
  udm: { t: 'ӝ ӟ ӥ ӧ ӵ', langs: ['udm'] },
  kv: { t: 'і ӧ', langs: ['kv'] },
  krl: { t: 'č š ž ä ö', langs: ['krl'], latin: true },
  sah: { t: 'ҕ ҥ ө ү һ', langs: ['sah'] },
  bua: { t: 'ө ү һ', langs: ['bua'] },
  tyv: { t: 'ң ө ү', langs: ['tyv'] },
  alt: { t: 'ј ҥ ӧ ӱ', langs: ['alt'] },
  ce: { t: 'Ӏ', langs: ['ce'] },
  os: { t: 'ӕ', langs: ['os'] },
};
const letterName = id => LETTERS[id].n || LETTERS[id].langs.map(l => LANG[l].n).join(' & ');
const letterAreas = id => [...new Set(LETTERS[id].langs.flatMap(l => LANG[l].r))];
// Words for "street" on bilingual street signs (Plonk It). Tatar and Bashkir both write урамы.
const STREET = {
  'урамы': { langs: ['tt', 'ba'] },
  'урамӗ': { langs: ['cv'] },
  'урем': { langs: ['chm'] },
  'улича': { langs: ['kv'] },
};
const streetAreas = w => [...new Set(STREET[w].langs.flatMap(l => LANG[l].r))];
const streetName = w => STREET[w].langs.map(l => LANG[l].n).join(' & ');

const LANG_OF = {}; // republic -> languages
for (const [id, , r] of LANGS) for (const a of r) (LANG_OF[a] ??= []).push(id);
const langsIn = a => (LANG_OF[a] || []).map(l => LANG[l].n).join(', ');
const clickedArea = a => LANG_OF[a] ? `${R[a].n} (${langsIn(a)})` : R[a].n;
const VOLGA = ['TA', 'BA', 'CU', 'ME', 'MO', 'UD', 'KO'];
const inVolga = l => LANG[l].r.some(a => VOLGA.includes(a));
const LANG_GROUPS = [
  { title: 'Volga, Urals & Komi', sub: '', ids: LANGS.map(l => l[0]).filter(inVolga) },
  { title: 'Siberia, Caucasus, Kalmykia & Karelia', sub: '', ids: LANGS.map(l => l[0]).filter(l => !inVolga(l)) },
];
const letterIds = Object.keys(LETTERS);
const letterInVolga = id => letterAreas(id).some(a => VOLGA.includes(a));

const QUIZ = {
  key: 'rulangs',
  areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: FAMILY[r.id] || 'none' })),
  borders: DATA.fd,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 45, labelScale: 0.3, fly: { pad: 1.6, min: 1 / 30 },
  geo: GEO,
  street: { bounds: [[41.2, 19.6], [77.7, 190]], maxBounds: [[25, 0], [86, 215]] },
  hintLabel: 'Color by language family',
  exploreKind: 'langs',
  explore: id => ({
    code: LANG_OF[id] ? LANG_OF[id].map(l => LANG[l].x).filter(Boolean).join(' · ') || '–' : '–',
    title: R[id].n,
    sub: LANG_OF[id] ? [langsIn(id)] : ['Russian only'],
  }),
  rounds: [
    { kind: 'street', label: 'Street words', sub: 'урамы, урамӗ, урем, улича' },
    { kind: 'langs', label: 'Volga, Urals & Komi', groups: ['Volga, Urals & Komi'] },
    { kind: 'langs', label: 'Siberia, Caucasus & more', sub: 'Siberia, Caucasus, Kalmykia & Karelia', groups: ['Siberia, Caucasus, Kalmykia & Karelia'] },
    { kind: 'letters', label: 'Volga, Urals & Komi letters', ids: letterIds.filter(letterInVolga) },
    { kind: 'langs', label: 'All languages' },
    { kind: 'letters', label: 'All letter sets' },
  ],
  kinds: [
    {
      key: 'langs', label: 'Languages', sub: `${LANGS.length} languages`, noun: ['language', 'languages'], pickTitle: 'Languages to practice',
      groups: LANG_GROUPS,
      areasOf: l => LANG[l].r, dim: false,
      short: l => LANG[l].n, name: l => LANG[l].n,
      about: l => [LANG[l].r.map(a => R[a].n).join(', '), LANG[l].x || 'Russian alphabet'],
      clicked: a => clickedArea(a),
      prompt: 'name',
      chip: l => LANG[l].n, chipTitle: l => LANG[l].r.map(a => R[a].n).join(', '),
    },
    {
      key: 'letters', label: 'Letters', sub: `${letterIds.length} letter sets`, noun: ['letter set', 'letter sets'], pickTitle: 'Letter sets to practice',
      groups: [
        { title: 'Volga, Urals & Komi', sub: '', ids: letterIds.filter(letterInVolga) },
        { title: 'Siberia, Caucasus, Kalmykia & Karelia', sub: '', ids: letterIds.filter(id => !letterInVolga(id)) },
      ],
      areasOf: letterAreas, dim: false, merge: false,
      short: id => LETTERS[id].t, name: letterName,
      about: id => [letterAreas(id).map(a => R[a].n).join(', '), LETTERS[id].latin ? 'Latin script' : 'Cyrillic'],
      clicked: a => clickedArea(a),
      prompt: 'text', text: id => ({ text: LETTERS[id].t, lang: LETTERS[id].langs[0] === 'tt' ? 'tt' : id.slice(0, 3), cls: 'letters' }),
      chip: id => LETTERS[id].t, chipTitle: letterName,
    },
    {
      key: 'street', label: 'Street words', sub: 'Beginner', noun: ['word', 'words'], pickTitle: 'Words to practice',
      groups: [{ title: 'Street', sub: '', ids: Object.keys(STREET) }],
      areasOf: streetAreas, dim: false, merge: false,
      short: w => w, name: streetName,
      about: w => [streetAreas(w).map(a => R[a].n).join(', '), `${streetName(w)} · улица`],
      clicked: a => clickedArea(a),
      prompt: 'text', text: w => ({ text: w, lang: STREET[w].langs[0] === 'chm' ? 'mhr' : STREET[w].langs[0], cls: 'word' }),
      chip: w => w, chipTitle: streetName,
    },
  ],
};
