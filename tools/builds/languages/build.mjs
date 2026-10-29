#!/usr/bin/env node
// languages: everything of the script quizzes that is not written by hand.
//
//   node tools/builds/languages/build.mjs
//
// A script is a row of SCRIPTS below and its file, data/letters/<script>.js (SCRIPT: its letters, as each country
// reads them, and the words of their signs: see engine/types/reading.js). For each one this writes
//   - SCRIPT.eg, at the end of that file: a place written with each letter, said with the letter's answer. The places
//     are the cities of a country that writes the letter that way (READING below), from its city list,
//     data/maps/<country>-cities/cities.js (and then the real names of names/<script>.json, NAMES below), whose name
//     on the map is what its letters spell (not Delhi for दिल्ली: the example would contradict the letter's sound),
//     first those that spell the letter the usual way (ভ as bh, not the v of Savar). Rare letters choose first, and
//     each takes the largest city no letter has taken yet, so the examples differ; a letter no such city has gets
//     none.
//   - its pages, quizzes/<script>-letters/ and <script>-words/ (engine/types/lang.js), tabs of each other, and
//     with them, where several countries or regions write the script, <script>-countries/ or <script>-regions/ (a
//     page of the world quizzes, see engine/types/world.js). A script's own regions (SCRIPT.regions: the
//     Hindi states as one area) are drawn for that page, data/maps/<script>-regions/regions.js: the districts of
//     India's district map melted into one outline per region (their shared borders drop out), on the world map.
//   - their entries in data/site/quizzes.json: scope "Languages", the script's name as `area` (its folder in the
//     Languages folder of "All quizzes"), one star per level their rounds reach. (A language quiz without an `area`
//     is not theirs: the home page lists those in a section of their own, which stays as it is.)
// Latin has no letters to learn and no file written by hand. Its pages are written here, from the languages of
// data/maps/world-languages/data.js: quizzes/latin-countries/ (their letters, by area) and quizzes/latin-words/, the
// words of their signs with their meanings on the board of tiles, whose SCRIPT (data/maps/latin-words/latin.js) is
// made of them: a theme per language, a column per area, so that an area is chosen first and then a language of it.
// And quizzes/latin-alphabets/, the Countries page the other way round on the board of tiles: a country, click the
// letters it writes. Its file (data/maps/latin-alphabets/alphabets.js) is what the Countries page itself makes of the
// languages (QUIZ.parts of engine/types/world.js, run here), so both ask the same countries and letters.
// And the Type mode of every name written in such a script, which is reading it (engine/types/reading.js): each page
// with a script side, a city quiz's names in another script or a layer of them (below), gets the files of the scripts
// its names are written in, reading.js and the scripts' fonts (their typefaces: engine/css/formats.css), written in
// before its type's script (engine/types/city.js or layer.js). India's other scripts (READING rows with a fourth
// field) take their places from the towns of their state(s), in tools/builds/languages/towns/<fourth>.js (once small
// city quizzes of their own, removed on 2026-10-23).
// Run it again after changing a script's file or the cities read from, and after a city or region page is written anew.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { readMap } from '../../lib/quiz-files.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
// [name, what its sounds follow, its tab after Letters and Words: the page that tells its countries or regions apart]
const SCRIPTS = [
  ['cyrillic', 'the names on the map (Russia: BGN/PCGN)', 'Countries'],
  ['devanagari', 'Hunterian romanisation', 'Regions'],
  ['bengali', 'the names on the map', ''],
  ['thai', 'the Royal Thai General System (RTGS)', ''],
  ['khmer', 'UNGEGN romanisation and the names on signs', ''],
  ['hangul', 'Revised Romanization of Korean', ''],
  ['sinhala', 'the names on the map', ''],
  ['tamil', 'the names on the map (Sri Lanka)', ''],
  ['arabic', 'the names on the map (Oman; Jammu and Kashmir, Malaysia)', ''],
  ['tibetan', 'Bhutan\'s spelling of its place names, as on its signs', ''],
  ['javanese', 'the Latin names on the same signs', ''],
  ['balinese', 'the Latin names on the same signs', ''],
  ['sundanese', 'the Latin names on the same signs', ''],
  ['syllabics', 'Inuktitut in Latin letters', ''],
  ['cherokee', 'the standard Latin values', ''],
  ['greek', 'ELOT 743, as on Greek and Cypriot signs', ''],
  ['hebrew', 'the names on the map and signs (CBS)', ''],
  ['georgian', 'the national romanisation as on signs (no apostrophes)', ''],
  ['japanese', 'Hepburn, as on road signs (long vowels unmarked)', ''],
  ['chinese', 'Hanyu Pinyin without tones, as on Taiwan\'s signs (older names kept: Taipei, Kaohsiung)', ''],
  ['lao', 'Laos\'s French-based romanisation, as on its signs and maps (Xay, Gnommalat, Phou)', ''],
  ['telugu', 'Hunterian romanisation, as on India\'s signs and maps', ''],
  ['kannada', 'Hunterian romanisation, as on India\'s signs and maps', ''],
  ['malayalam', 'Hunterian romanisation, as on India\'s signs and maps', ''],
  ['gujarati', 'Hunterian romanisation, as on India\'s signs and maps', ''],
  ['gurmukhi', 'Hunterian romanisation, as on India\'s signs and maps', ''],
  ['odia', 'Hunterian romanisation, as on India\'s signs and maps', ''],
];
// [country (its cities quiz), its script, the language its names are read in]: the cities that give the letters their
// examples (SCRIPT.eg; a page's own scripts are found from its names, see "the pages with names in a script")
const READING = [
  ['russia', 'cyrillic', 'ru'], ['ukraine', 'cyrillic', 'uk'], ['bulgaria', 'cyrillic', 'bg'], ['kazakhstan', 'cyrillic', 'kk'],
  ['india', 'devanagari', 'hi'], ['bangladesh', 'bengali', 'bn'],
  ['thailand', 'thai', 'th'], ['cambodia', 'khmer', 'km'], ['south-korea', 'hangul', 'ko'], ['sri-lanka', 'sinhala', 'si'], ['oman', 'arabic', 'ar'],
  ['serbia', 'cyrillic', 'sr'], ['north-macedonia', 'cyrillic', 'mk'], ['kyrgyzstan', 'cyrillic', 'ky'], ['mongolia', 'cyrillic', 'mn'], ['tunisia', 'arabic', 'ar'], ['bosnia-and-herzegovina', 'cyrillic', 'sr'],
  ['nepal', 'devanagari', 'ne'],
  ['jordan', 'arabic', 'ar'], ['lebanon', 'arabic', 'ar'], ['qatar', 'arabic', 'ar'], ['united-arab-emirates', 'arabic', 'ar'], ['palestine', 'arabic', 'ar'],
  ['bhutan', 'tibetan', 'dz'],
  ['greece', 'greek', 'el'], ['cyprus', 'greek', 'el'], ['israel', 'hebrew', 'he'], ['georgia', 'georgian', 'ka'],
  ['japan', 'japanese', 'ja'],
  ['taiwan', 'chinese', 'zh-TW'], ['laos', 'lao', 'lo'],
  // India's other scripts: the places from the towns of the state(s) that write it (fourth: towns/<fourth>.js beside
  // this file, a CITIES list as a city quiz has it)
  ['india', 'telugu', 'te', 'india-telugu-cities'], ['india', 'kannada', 'kn', 'india-kannada-cities'],
  ['india', 'malayalam', 'ml', 'india-malayalam-cities'], ['india', 'gujarati', 'gu', 'india-gujarati-cities'],
  ['india', 'gurmukhi', 'pa', 'india-gurmukhi-cities'], ['india', 'odia', 'or', 'india-odia-cities'],
];
// [country, script, language]: more cities whose names give a script's letters their examples (SCRIPT.eg)
const EXAMPLES = [['sri-lanka', 'tamil', 'ta'], ['india', 'tamil', 'ta'], ['india', 'bengali', 'as']];
// scripts whose letters take their examples from real names too, after the cities: names/<script>.json, { source,
// names: { <language>: [[name, the Latin name of the same place]…] } }, the larger places first (OpenStreetMap,
// Wikidata), for scripts that no city quiz writes (Javanese) or writes in few names (Bhutan's Dzongkha)
const NAMES = ['tibetan', 'javanese', 'balinese', 'sundanese', 'syllabics', 'cherokee', 'arabic'];
const FONTS = {
  latn: 'family=Noto+Sans:wght@400;500;600;700',
  cyrl: 'family=Noto+Sans:wght@500;600&family=PT+Serif:ital,wght@0,700;1,400&family=Oswald:wght@500&family=Caveat:wght@700&family=Russo+One',
  deva: 'family=Noto+Sans:wght@500;600&family=Noto+Sans+Devanagari:wght@500;600&family=Tiro+Devanagari+Hindi&family=Kalam:wght@700&family=Khand:wght@600&family=Rozha+One',
  beng: 'family=Noto+Sans:wght@500;600&family=Noto+Sans+Bengali:wght@500;600&family=Tiro+Bangla&family=Hind+Siliguri:wght@600&family=Baloo+Da+2:wght@700&family=Galada',
  thai: 'family=Noto+Sans:wght@500;600&family=Noto+Sans+Thai+Looped:wght@500;600&family=Noto+Serif+Thai:wght@600&family=Kanit:wght@500',
  khmr: 'family=Noto+Sans:wght@500;600&family=Noto+Sans+Khmer:wght@500;600&family=Battambang:wght@700&family=Moul',
  hang: 'family=Noto+Sans:wght@500;600&family=Noto+Sans+KR:wght@500;600&family=Nanum+Myeongjo:wght@700&family=Black+Han+Sans',
  sinh: 'family=Noto+Sans:wght@500;600&family=Noto+Sans+Sinhala:wght@500;600&family=Noto+Serif+Sinhala:wght@600&family=Abhaya+Libre:wght@600',
  taml: 'family=Noto+Sans:wght@500;600&family=Noto+Sans+Tamil:wght@500;600&family=Noto+Serif+Tamil:wght@600&family=Mukta+Malar:wght@600',
  arab: 'family=Noto+Sans:wght@500;600&family=Noto+Naskh+Arabic:wght@500;600&family=Noto+Kufi+Arabic:wght@600&family=Amiri:wght@700&family=Noto+Nastaliq+Urdu:wght@500;700&family=Gulzar',
  tibt: 'family=Noto+Sans:wght@500;600&family=Noto+Serif+Tibetan:wght@500;600&family=Jomolhari',
  java: 'family=Noto+Sans:wght@500;600&family=Noto+Sans+Javanese:wght@500;600',
  bali: 'family=Noto+Sans:wght@500;600&family=Noto+Sans+Balinese:wght@500;600&family=Noto+Serif+Balinese',
  sund: 'family=Noto+Sans:wght@500;600&family=Noto+Sans+Sundanese:wght@500;600',
  cans: 'family=Noto+Sans:wght@500;600&family=Noto+Sans+Canadian+Aboriginal:wght@500;600',
  cher: 'family=Noto+Sans:wght@500;600&family=Noto+Sans+Cherokee:wght@500;600',
  grek: 'family=Noto+Sans:wght@500;600&family=Noto+Serif:ital,wght@0,700;1,400&family=Fira+Sans+Extra+Condensed:wght@600&family=Mansalva',
  hebr: 'family=Noto+Sans:wght@500;600&family=Noto+Sans+Hebrew:wght@500;600&family=Frank+Ruhl+Libre:wght@700&family=Secular+One&family=Amatic+SC:wght@700',
  geor: 'family=Noto+Sans:wght@500;600&family=Noto+Sans+Georgian:wdth,wght@62.5,800;100,500;100,600&family=Noto+Serif+Georgian:wght@700',
  jpan: 'family=Noto+Sans:wght@500;600&family=Noto+Sans+JP:wght@500;600&family=Noto+Serif+JP:wght@600&family=Zen+Maru+Gothic:wght@500&family=Klee+One:wght@600',
  hani: 'family=Noto+Sans:wght@500;600&family=Noto+Sans+TC:wght@500;600&family=Noto+Sans+SC:wght@500;600&family=Noto+Serif+TC:wght@600&family=LXGW+WenKai+TC',
  laoo: 'family=Noto+Sans:wght@500;600&family=Noto+Sans+Lao:wght@500;600&family=Noto+Serif+Lao:wght@600&family=Phetsarath:wght@700',
  telu: 'family=Noto+Sans:wght@500;600&family=Noto+Sans+Telugu:wght@500;600&family=Tiro+Telugu&family=Hind+Guntur:wght@600&family=Ramabhadra',
  knda: 'family=Noto+Sans:wght@500;600&family=Noto+Sans+Kannada:wght@500;600&family=Tiro+Kannada&family=Baloo+Tamma+2:wght@700&family=Anek+Kannada:wght@600',
  mlym: 'family=Noto+Sans:wght@500;600&family=Noto+Sans+Malayalam:wght@500;600&family=Noto+Serif+Malayalam:wght@600&family=Manjari:wght@700&family=Chilanka',
  gujr: 'family=Noto+Sans:wght@500;600&family=Noto+Sans+Gujarati:wght@500;600&family=Rasa:wght@600&family=Hind+Vadodara:wght@600&family=Shrikhand',
  guru: 'family=Noto+Sans:wght@500;600&family=Noto+Sans+Gurmukhi:wght@500;600&family=Tiro+Gurmukhi&family=Mukta+Mahee:wght@600&family=Baloo+Paaji+2:wght@700',
  orya: 'family=Noto+Sans:wght@500;600&family=Noto+Sans+Oriya:wght@500;600&family=Noto+Serif+Oriya:wght@600&family=Baloo+Bhaina+2:wght@700&family=Anek+Odia:wght@600',
};
const EG = '\n// A place written with each letter (made by tools/builds/languages/build.mjs: run it again, don\'t edit).\nSCRIPT.eg = ';
// … and after it, the script among those the page loaded (a page may load several: engine/types/reading.js)
const LOADED = '// (one of the scripts the page loaded: engine/types/reading.js reads names in each)\n(globalThis.ALL_SCRIPTS ||= []).push(SCRIPT);\n';
const READING_JS = fs.readFileSync(path.join(ROOT, 'engine', 'types', 'reading.js'), 'utf8');
const DOT = /^[़়਼઼଼಼]/; // the dot under a letter makes another letter of it (ढ़ is not ढ, ਸ਼ not ਸ)
// scripts whose joined letters hide the shapes of the letters in them (their virama): a letter's place is first one
// that writes it on its own, not next to the virama (Malayalam ന in പുനലൂർ, not in മട്ടന്നൂർ), and the virama's one that
// shows it, at the end of a word (പാലക്കാട്)
const STACKED = { telugu: '్', kannada: '್', malayalam: '്', gujarati: '્', gurmukhi: '੍', odia: '୍' };
const nf = s => s.normalize('NFC'), plain = s => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
const tier = n => 1 + [10, 30, 60, Infinity].findIndex(max => n < max); // a round's level, by its size
const read = (file, name) => vm.runInNewContext(fs.readFileSync(file, 'utf8') + `;${name}`);
const cap = s => s[0].toUpperCase() + s.slice(1);
const quiz = (...p) => path.join(ROOT, 'quizzes', ...p), data = (...p) => path.join(ROOT, 'data', ...p);

const head = (title, description, script) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title} · Geo Quizzes</title>
<meta name="description" content="${description}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@500;600;700&${FONTS[script]}&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../../assets/css/base.css">
<link rel="stylesheet" href="../../engine/css/quiz-page.css">
<link rel="stylesheet" href="../../engine/css/quiz-map.css">
<link rel="stylesheet" href="../../engine/css/formats.css">
<link rel="stylesheet" href="../../engine/css/lang-quiz.css">
</head>`;
const body = (folders, back, title, note, scripts, cls = '') => `
<body${cls ? ` class="${cls}"` : ''}${folders ? ` data-folders="${folders}"` : ''}>
${back}
<h1>${title}</h1>
<p class="note">${note}</p>
<script src="../../engine/page.js"></script>
${scripts}
<script type="module" src="../../engine/main.js"></script>
</body>
</html>
`;

// A page of the world quizzes (a script's countries on the map).
const world = (title, description, script, folders, note, scripts) => head(title, description, script)
  .replace('\n<link rel="stylesheet" href="../../engine/css/lang-quiz.css">', '')
  + body(folders, '<a class="back" href="../../country.html?area=Languages">← Languages</a>', title, note,
    `<script src="../../data/maps/world/world.js"></script>\n<script src="../../data/maps/world/world-facts.js"></script>\n<script src="../../data/maps/world-languages/data.js"></script>\n${scripts}\n<script src="../../engine/types/world.js"></script>`, 'writing own-hover');

/* ---------- a script's own regions, drawn on the world map ---------- */
// The districts of India's map (data/maps/india-districts, read as tools/lib/quiz-files.mjs reads a map) that belong
// to a region, by state or one by one, melted into the region's outline: an edge two of them share (point for point on
// that map) drops out, the rest is joined into rings, each point put on the world map through the two maps'
// projections. With them the region's whole countries, from the world map. All of it in the world map's own Web
// Mercator, so the page draws it there as one more place.
function regions(S) {
  const WORLD = read(data('maps', 'world', 'world.js'), 'WORLD'), P = WORLD.proj, RAD = Math.PI / 180;
  const IN = readMap('india-districts').DATA, D = IN.reg, PI = IN.proj;
  const ringsOf = d => { if (/[^MLZ\d\s,.eE+-]/.test(d)) throw new Error(`a district not of straight lines: ${d.slice(0, 40)}`); return d.split('M').filter(Boolean).map(s => s.replace(/Z/g, '').split('L')); };
  const latlng = ([x, y]) => [(2 * Math.atan(Math.exp((PI.y0 - y / PI.k) * RAD)) - Math.PI / 2) / RAD, PI.lng0 + x / PI.k];
  const r2 = v => Math.round(v * 100) / 100;
  const at = ([lat, lng]) => [r2((lng - P.lng0) * P.k), r2((P.y0 - Math.log(Math.tan(Math.PI / 4 + lat * RAD / 2)) / RAD) * P.k)];
  const out = {};
  for (const [id, R] of Object.entries(S.regions)) {
    const states = (R.states || '').split(' '), districts = (R.districts || '').split(' ');
    const edges = new Map();
    for (const d of D) if (states.includes(d.st) || districts.includes(d.id)) for (const ring of ringsOf(d.d)) for (let i = 0; i < ring.length; i++) {
      const a = ring[i], b = ring[(i + 1) % ring.length];
      if (a === b) continue;
      const k = a < b ? `${a}|${b}` : `${b}|${a}`;
      if (edges.has(k)) edges.delete(k); else edges.set(k, [a, b]);
    }
    const ends = new Map(), used = new Set(), rings = [];
    for (const e of edges.values()) for (const p of e) (ends.get(p) || ends.set(p, []).get(p)).push(e);
    for (const e of edges.values()) {
      if (used.has(e)) continue;
      used.add(e);
      const run = [e[0], e[1]];
      for (let end = e[1]; end !== run[0];) { const f = ends.get(end).find(f => !used.has(f)); if (!f) break; used.add(f); end = f[0] === end ? f[1] : f[0]; run.push(end); }
      if (run[0] !== run[run.length - 1]) throw new Error(`${id}: an outline that does not close`);
      rings.push(run.slice(0, -1).map(p => at(latlng(p.split(',').map(Number)))));
    }
    // each ring's area and middle (shoelace); the label goes to the largest one
    const stats = rings.map(r => { let A = 0, cx = 0, cy = 0; r.forEach(([x0, y0], i) => { const [x1, y1] = r[(i + 1) % r.length], c = x0 * y1 - x1 * y0; A += c; cx += (x0 + x1) * c; cy += (y0 + y1) * c; }); return { A: Math.abs(A / 2), x: cx / (3 * A), y: cy / (3 * A) }; });
    const whole = (R.places || '').split(' ').filter(Boolean).map(p => WORLD.reg.find(r => r.id === p));
    const big = [...stats.map(s => ({ a: s.A, lx: r2(s.x), ly: r2(s.y) })), ...whole].sort((x, y) => y.a - x.a)[0];
    const xs = rings.flat().map(p => p[0]), ys = rings.flat().map(p => p[1]);
    for (const w of whole) { xs.push(w.b[0], w.b[2]); ys.push(w.b[1], w.b[3]); }
    out[id] = {
      n: R.name, i2: R.label,
      d: whole.map(w => w.d).join('') + rings.map(r => `M${r.map(p => p.join(',')).join('L')}Z`).join(''),
      lx: big.lx, ly: big.ly, a: r2(stats.reduce((n, s) => n + s.A, 0) + whole.reduce((n, w) => n + w.a, 0)),
      b: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)].map(r2),
    };
  }
  return `// Generated by tools/builds/languages/build.mjs: the regions of ${S.name} (SCRIPT.regions of data/letters/${S.name.toLowerCase()}.js) as areas\n// on the world map (data/maps/world/world.js), each the outline of its states and districts (India: © OpenStreetMap\n// contributors, ODbL) and countries. Read by engine/types/world.js.\nconst EXTRA_AREAS = ${JSON.stringify(out)};\n`;
}

/* ---------- the list of quizzes: the entries of before go, the new ones are put in below ---------- */
const LIST = data('site', 'quizzes.json');
let list = fs.readFileSync(LIST, 'utf8')
  .replace(/,\n    \{\n      "id": "[^"]+",\n      "scope": "Languages",\n      "area": "[^"]+",[\s\S]*?\n    \}/g, '') // (its own: each is in a script's folder; a language quiz without one is someone else's and stays)
  .replace(/,\n    \{\n      "id": "[^"]+",\n      "country": "\d+",\n      "title": "Reading(?: · [^"]+)?",[\s\S]*?\n    \}/g, '') // (the Reading pages of before 2026-10-21, now the Type mode)
  .replace(new RegExp(`,\\n    \\{\\n      "id": "(?:${READING.filter(r => r[3]).map(r => r[3]).join('|')})",[\\s\\S]*?\\n    \\}`, 'g'), ''); // (India's other scripts' city quizzes, removed on 2026-10-23)
const entry = (id, where, title, levels) => `    {\n      "id": "${id}",\n${where}      "title": "${title}",\n      "levels": ${levels},\n      "url": "quizzes/${id}/index.html"\n    }`;
const atEnd = text => { list = list.replace(/\n  \]\n\}\n$/, `,\n${text}\n  ]\n}\n`); };

/* ---------- the scripts ---------- */
const BY_SCRIPT = {};
for (const [name, system, third] of SCRIPTS) {
  const file = data('letters', `${name}.js`);
  const src = fs.readFileSync(file, 'utf8').split(EG)[0].replace(/\s*$/, '\n').replace(/^const SCRIPT = /m, 'var SCRIPT = '); // (var: a page may load several)
  const S = vm.runInNewContext(src + ';SCRIPT'), R = vm.runInNewContext(`${src}\n${READING_JS};READING`);
  const TAGS = Object.keys(S.langs), inScript = new RegExp(`\\p{Script=${S.unicode}}`, 'u');
  BY_SCRIPT[name] = { S, inScript, src };

  // the letters asked (as engine/types/lang.js makes them), each with the languages that read it so
  const usual = (r, type) => (r[2] ? r[2].split(' ')[0] : /^[cj]$/.test(type || '') ? r[1].replace(/a$/, '') : r[1]).replace(/[^a-z]/g, '');
  const letters = new Map();
  for (const g of S.letters) for (const r of g.rows) { const forms = nf(r[0]).split(' '); letters.set(forms[0], { forms, usual: usual(r, g.type), langs: [TAGS[0]] }); }
  for (const tag of TAGS.slice(1)) for (const r of (S.own || {})[S.langs[tag].like || tag]?.rows || []) {
    const forms = nf(r[0]).split(' '), id = `${forms[0]}/${r[1]}`;
    if (!letters.has(id)) letters.set(id, { forms, usual: plain(usual(r)).replace(/[^a-z]/g, ''), langs: [] });
    letters.get(id).langs.push(tag);
  }
  // a place for each letter, from a country that reads it so
  const cities = {};
  for (const [country, script, tag, page] of [...READING, ...EXAMPLES]) if (script === name) {
    cities[tag] = [...(cities[tag] || []), ...read(page ? path.join(ROOT, 'tools', 'builds', 'languages', 'towns', `${page}.js`) : data('maps', `${country}-cities`, 'cities.js'), 'CITIES').list.filter(c => c.local && inScript.test(c.local) && R.of(tag).accepts(c.local, c.en))];
  }
  if (NAMES.includes(name)) for (const [tag, list] of Object.entries(JSON.parse(fs.readFileSync(path.join(ROOT, 'tools', 'builds', 'languages', 'names', `${name}.json`), 'utf8')).names)) {
    cities[tag] = [...(cities[tag] || []), ...list.map(([local, en]) => ({ local: nf(local), en })).filter(c => inScript.test(c.local) && R.of(tag).accepts(c.local, c.en))];
  }
  const has = (c, forms) => forms.some(f => nf(c.local).toLowerCase().split(f.toLowerCase()).slice(1).some(rest => !DOT.test(rest)));
  const found = [...letters].map(([id, l]) => {
    const at = (cities[l.langs.find(t => cities[t])] || []).filter(c => has(c, l.forms)), spelled = c => plain(c.en).includes(l.usual);
    const V = STACKED[name], seen = c => !V || l.forms.some(f => { const p = nf(c.local).split(nf(f)); return p.slice(1).some((rest, i) => !DOT.test(rest) && (nf(f) === V ? !rest || /^[\s-]/.test(rest) : !rest.startsWith(V) && !p[i].endsWith(V))); });
    return { id, at: [...at.filter(c => spelled(c) && seen(c)), ...at.filter(c => spelled(c) && !seen(c)), ...at.filter(c => !spelled(c))] };
  }).filter(l => l.at.length);
  const taken = new Set(), eg = {};
  for (const l of [...found].sort((a, b) => a.at.length - b.at.length)) {
    const c = l.at.find(c => !taken.has(c)) || l.at[0];
    taken.add(c); eg[l.id] = [c.local, c.en];
  }
  const ordered = Object.fromEntries([...letters.keys()].filter(id => eg[id]).map(id => [id, eg[id]]));
  fs.writeFileSync(file, src + EG.slice(1) + JSON.stringify(ordered) + ';\n' + LOADED);

  // the pages, tabs of each other
  const WORDS = S.words.themes.length > 0; // (a script whose sign words are not written yet has no Words page)
  const parts = ['Letters', ...(WORDS ? ['Words'] : []), ...(third ? [third] : [])], back = '<a class="back" href="../../country.html?area=Languages">← Languages</a>';
  const tabs = here => (parts.length < 2 ? '' : parts.map(t => (t === here ? t : `${t}=../${name}-${t.toLowerCase()}/index.html`)).join('|')); // (a page alone has no tabs)
  const lang = `<script src="../../data/letters/${name}.js"></script>\n<script src="../../engine/types/reading.js"></script>`;
  const countries = [...new Set(TAGS.flatMap(t => S.langs[t].where.split(' · ')))].join(', ');
  for (const [part, description, note] of [
    ['Letters', `Read ${/^[AEIOU]/.test(S.name) ? 'an' : 'a'} ${S.name} letter, click its sound: ${countries}.`, `Sounds: ${system}`],
    ...(WORDS ? [['Words', `Read a word from a sign in ${S.name}, click its meaning: ${countries}.`, 'Words seen on signs']] : []),
  ]) {
    const dir = quiz(`${name}-${part.toLowerCase()}`), title = `${S.name} ${part}`;
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), head(title, description, S.script) + body(tabs(part), back, title, note,
      `${lang}\n<script>const LANG_OPTS = { part: '${part.toLowerCase()}' };</script>\n<script src="../../engine/types/lang.js"></script>`));
  }
  if (third) { // the script's countries or regions on the world map (its own regions: data/maps/<page>/regions.js)
    const id = `${name}-${third.toLowerCase()}`, dir = quiz(id), title = `${S.name} ${third}`;
    fs.mkdirSync(dir, { recursive: true });
    if (S.regions) { fs.mkdirSync(data('maps', id), { recursive: true }); fs.writeFileSync(data('maps', id, 'regions.js'), regions(S)); }
    fs.writeFileSync(path.join(dir, 'index.html'), world(title, `Read a letter or a word in ${S.name}, click where it is written: ${countries}.`, S.script, tabs(third), 'Places with Street View · Map: Natural Earth' + (S.regions ? ' · Districts: © OpenStreetMap contributors (ODbL)' : ''),
      `${S.regions ? `<script src="../../data/maps/${id}/regions.js"></script>\n` : ''}${lang}\n<script>const WORLD_OPTS = { type: 'writing', script: '${S.script}', key: '${id}' };</script>`));
  }

  // the entries: one star per level the rounds reach, and the round of everything is the largest
  // (a language that is `like` another has that one's words, but for its own: see reading.js)
  const COLS = TAGS.filter(t => !S.langs[t].like);
  const wordsOf = cells => TAGS.map(tag => { const L = S.langs[tag], word = (cells[COLS.indexOf(L.like || tag)] || '').split('|')[0]; return L.but && word in L.but ? L.but[word] : word; }).filter(Boolean);
  const words = new Set(S.words.themes.flatMap(t => t.rows.flatMap(([meaning, ...cells]) => wordsOf(cells).map(w => `${meaning}:${nf(w)}`))));
  const where = `      "scope": "Languages",\n      "area": "${S.name}",\n`;
  atEnd(entry(`${name}-letters`, where, 'Letters', tier(letters.size)));
  if (WORDS) atEnd(entry(`${name}-words`, where, 'Words', tier(words.size)));
  if (third) {
    // Its largest round asks every word of the table that not every country or region writes (see engine/types/world.js).
    const places = new Set(TAGS.map(t => S.langs[t].at)), by = {}; // word -> where it is written
    for (const t of S.words.themes) for (const [meaning, ...cells] of t.rows) TAGS.forEach(tag => {
      const L = S.langs[tag], word = (cells[COLS.indexOf(L.like || tag)] || '').split('|')[0], mine = L.but && word in L.but ? L.but[word] : word;
      if (mine) (by[`${meaning}:${nf(mine)}`] ||= new Set()).add(L.at);
    });
    const told = Object.values(by).filter(at => at.size < places.size).length;
    atEnd(entry(`${name}-${third.toLowerCase()}`, where, third, tier(told)));
    console.log(`${S.name} ${third}: ${told} words that not all of them write`);
  }
  console.log(`${S.name}: ${letters.size} letters (${Object.keys(ordered).length} with a place), ${words.size} words, ${TAGS.length} languages`);
}

/* ---------- Latin: its Alphabets, its Words, and its Countries page ---------- */
{
  const src = ['world/world.js', 'world/world-facts.js', 'world-languages/data.js'].map(f => fs.readFileSync(data('maps', ...f.split('/')), 'utf8'));
  const parts = vm.runInNewContext([...src, `const WORLD_OPTS = { type: 'writing', script: 'latn' };`, fs.readFileSync(path.join(ROOT, 'engine', 'types', 'world.js'), 'utf8'), ';QUIZ.parts'].join('\n'),
    { document: { currentScript: { src: 'file:///engine/types/world.js' } }, console, URL });
  // A question is the countries of an area that write exactly the same letters, the same ones of them rarely (Norway
  // and Denmark; not Sweden and Finland, where å is rare in Finland only): they have one answer. It names its
  // countries, or its languages where one of its language areas has more than three (Spanish, Mexico to Argentina).
  // (A country that writes no letter beyond a to z has nothing to click, and is not asked.)
  // a row: [name, letters, languages, those of the letters that are rare there, each language's own: [name, letters,
  // the rare ones of them]] (the last is what Explore shows for a language picked there)
  const sorted = a => [...a].sort((x, y) => x.localeCompare(y, 'en')).join(' '), uniq = a => [...new Set(a)];
  const alphabets = parts.map(A => {
    const same = new Map();
    for (const u of A.units) if (u.letters.length) { const k = `${sorted(u.letters)}|${sorted(u.rare)}`; same.set(k, [...(same.get(k) || []), u]); }
    return { title: A.label, rows: [...same.values()].map(us => [
      (us.some(u => u.places.length > 3) ? uniq(us.flatMap(u => u.langs)) : us.flatMap(u => u.places)).join(' · '),
      sorted(us[0].letters), uniq(us.flatMap(u => u.langs)).join(' · '), sorted(us[0].rare),
      uniq(us.flatMap(u => u.langs)).map(n => { const [, x, r] = us.flatMap(u => u.by).find(b => b[0] === n); return [n, sorted(x), sorted(r)]; }),
    ]) };
  });
  const dir = quiz('latin-alphabets');
  for (const d of [dir, data('maps', 'latin-alphabets')]) fs.mkdirSync(d, { recursive: true });
  fs.writeFileSync(data('maps', 'latin-alphabets', 'alphabets.js'), `// Generated by tools/builds/languages/build.mjs from the language areas of quizzes/latin-countries (QUIZ.parts, see\n// engine/types/world.js): each area's countries with the letters beyond a to z that they write, and their languages.\nconst SCRIPT = ${JSON.stringify({ name: 'Latin', script: 'latn', alphabets })};\n`);
  fs.writeFileSync(path.join(dir, 'index.html'), head('Latin Alphabets', 'A country: click every letter beyond a to z that is written there.', 'latn')
    + body('', '<a class="back" href="../../country.html?area=Languages">← Languages</a>', 'Latin Alphabets', 'Official and main sign languages · Places with Street View',
      `<script src="../../data/maps/latin-alphabets/alphabets.js"></script>\n<script>const LANG_OPTS = { part: 'alphabets' };</script>\n<script src="../../engine/types/lang.js"></script>`));
  atEnd(entry('latin-alphabets', '      "scope": "Languages",\n      "area": "Latin",\n', 'Alphabets', tier(Math.max(...alphabets.map(A => A.rows.length)))));
  console.log(`Latin Alphabets: ${alphabets.length} areas, ${alphabets.reduce((n, A) => n + A.rows.length, 0)} countries, ${alphabets.reduce((n, A) => n + new Set(A.rows.flatMap(r => r[1].split(' '))).size, 0)} tiles`);
}
{
  const W = read(data('maps', 'world-languages', 'data.js'), 'WRITING'), P = W.pages.latn, sv = new Set(read(data('maps', 'world', 'world-facts.js'), 'FACTS').sv), not = new Set((P.not || '').split(' '));
  const NAME = Object.fromEntries(read(data('maps', 'world', 'world.js'), 'WORLD').reg.map(r => [r.id, r.n]));
  const areas = P.areas.map(([label, ids]) => [label, ids.split(' ')]);
  const themes = [];
  for (const l of W.languages.filter(l => l.s === 'latn' && l.w.length)) {
    const places = l.p.split(' ').filter(p => sv.has(p) && !not.has(p)), cols = areas.map(([, ids]) => places.some(p => ids.includes(p)));
    if (!cols.some(Boolean)) continue;
    // said with a word: where the language is on signs (up to three places by name)
    const where = places.length > 3 ? l.n : places.map(p => NAME[p]).join(', ');
    themes.push({ title: l.n, tag: l.t, rows: l.w.map(([text, meaning]) => [meaning, ...cols.map(on => (on ? `${text}|${where}` : ''))]) });
  }
  const SCRIPT = { name: 'Latin', script: 'latn', unicode: 'Latin', faces: 1, pick: ['Area', 'All areas'], langs: Object.fromEntries(areas.map(([label]) => [label, { name: label, where: label }])), letters: [], words: { one: true, themes } };
  const dir = quiz('latin-words');
  for (const d of [dir, data('maps', 'latin-words')]) fs.mkdirSync(d, { recursive: true });
  fs.writeFileSync(data('maps', 'latin-words', 'latin.js'), `// Generated by tools/builds/languages/build.mjs from the Latin-script languages of data/maps/world-languages/data.js:\n// the words of their signs, a theme per language, a column per area of its Countries page (see engine/types/reading.js).\nconst SCRIPT = ${JSON.stringify(SCRIPT)};\n`);
  fs.writeFileSync(path.join(dir, 'index.html'), head('Latin Words', 'Read a word from a sign in a Latin-script language, click its meaning.', 'latn')
    + body('', '<a class="back" href="../../country.html?area=Languages">← Languages</a>', 'Latin Words', 'Words seen on signs',
      `<script src="../../data/maps/latin-words/latin.js"></script>\n<script src="../../engine/types/reading.js"></script>\n<script>const LANG_OPTS = { part: 'words' };</script>\n<script src="../../engine/types/lang.js"></script>`));
  atEnd(entry('latin-words', '      "scope": "Languages",\n      "area": "Latin",\n', 'Words', tier(new Set(themes.flatMap(t => t.rows.map(r => `${r[0]}:${r.slice(1).find(Boolean).split('|')[0]}`))).size)));
  console.log(`Latin Words: ${themes.length} languages, ${themes.reduce((n, t) => n + t.rows.length, 0)} words`);
}
{
  const dir = quiz('latin-countries');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), world('Latin Countries', 'A letter, several letters or a word of a sign in Latin script: click the countries of the area that write it.', 'latn', '',
    'Official and main sign languages · Places with Street View · Map: Natural Earth', `<script>const WORLD_OPTS = { type: 'writing', script: 'latn', key: 'latin-countries' };</script>`));
  atEnd(entry('latin-countries', '      "scope": "Languages",\n      "area": "Latin",\n', 'Countries', 4)); // (its rounds of a whole part of the world are its largest)
  // Which Script (quizzes/which-script, made by hand): the scripts told apart, in a folder of its own
  atEnd(entry('which-script', '      "scope": "Languages",\n      "area": "All scripts",\n', 'Which Script', 3));
}

/* ---------- the pages with names in a script: their Type mode reads them ---------- */
// A city quiz's names in another script (its kind 'local', CITY_OPTS.lang) and a layer of names in another script (a
// kind `of` another, asked by its text; of those the page shows: data-kinds) are read in their Type mode
// (engine/types/reading.js, READING.name). Such a page loads the files of the scripts its names are written in,
// reading.js and the scripts' fonts (the link marked data-faces), all written in here, before its type's script
// (engine/types/city.js or layer.js); a page whose names no script here writes is left without them (its Type mode
// then the usual one).
const RCTX = vm.createContext({}); // every script, and reading.js, as a page with all of them runs them
for (const [name] of SCRIPTS) vm.runInContext(BY_SCRIPT[name].src + LOADED, RCTX);
const NAME = vm.runInContext(`${READING_JS};READING.name`, RCTX), FILE = Object.fromEntries(SCRIPTS.map(([n]) => [BY_SCRIPT[n].S.script, n]));
const TYPE = /^\.\.\/\.\.\/engine\/types\/(city|layer)\.js$/; // (the type scripts of the pages with a script side)
// The names of a page's script side, [text, language]…: a city page's from its own scripts, run as the page runs them;
// a map-type page's from its SETTINGS and NAMES (data/quizzes/<id>/settings.js, names.js: every kind written out in
// full, and the texts it shows).
function namesOf(dir, html) {
  const tags = [...html.matchAll(/<script(?: src="([^"]+)")?>([\s\S]*?)<\/script>/g)], at = tags.findIndex(m => TYPE.test(m[1] || ''));
  const city = TYPE.exec(tags[at][1])[1] === 'city';
  const own = tags.slice(0, at).filter(([, src]) => (city ? !src || !/^\.\.\/\.\.\/(?:engine|data\/letters)\//.test(src) : /\/data\/quizzes\/[^/]+\/(?:settings|names)\.js$/.test(src || ''))); // (a city page's: not the engine's or the scripts')
  const text = own.map(([, src, inline]) => (src ? fs.readFileSync(path.join(dir, src), 'utf8') : inline));
  // (no names in another language: no CITY_OPTS.lang, no layer asked by its text; such a page's scripts are not run,
  // some need a browser: world-places)
  if (city ? !text.some(t => /\blang:\s*["']/.test(t)) : !text.some(t => /"of":"/.test(t) && /"prompt":"text"/.test(t))) return [];
  const ctx = vm.createContext({});
  for (const t of text) vm.runInContext(t, ctx);
  if (city) {
    const O = vm.runInContext('typeof CITY_OPTS === "object" ? CITY_OPTS : {}', ctx), C = O.list ? { ...vm.runInContext('CITIES', ctx), ...O.list } : vm.runInContext('CITIES', ctx);
    const LATIN = /^[\p{Script=Latin}\p{Script=Common}\p{Script=Inherited}]*$/u;
    return O.lang ? C.list.filter(c => c.local && !LATIN.test(c.local)).map(c => [c.local, c.lang]) : [];
  }
  const S = vm.runInContext('SETTINGS', ctx), N = vm.runInContext('NAMES', ctx);
  const shown = (/<body[^>]* data-kinds="([^"]*)"/.exec(html) || [])[1], out = [];
  for (const k of S.kinds) {
    if (!k.of || k.typed || k.groupsOnly || k.prompt !== 'text' || (shown && !shown.split(/\s+/).includes(k.key))) continue;
    for (const t of Object.values(N.kinds[k.key].text || {})) if (t && t.text) out.push([t.text, t.lang]);
  }
  return out;
}
// The fonts of some scripts as one link's families (each family once).
function fontsOf(scripts) {
  const seen = new Map();
  for (const f of scripts.flatMap(s => FONTS[BY_SCRIPT[s].S.script].split('&'))) {
    const family = f.split(':')[0];
    if (seen.has(family) && seen.get(family) !== f) throw new Error(`${family}: two ways in FONTS`);
    seen.set(family, f);
  }
  return [...seen.values()].join('&');
}
const SCRIPT_LINES = /\n<script src="\.\.\/\.\.\/data\/letters\/[a-z]+\.js"><\/script>|\n<script src="\.\.\/\.\.\/engine\/types\/reading\.js"><\/script>|\n<link [^>]*data-faces>/g;
const wired = [];
for (const dir of fs.readdirSync(quiz()).sort()) {
  const file = quiz(dir, 'index.html');
  if (!fs.existsSync(file)) continue;
  const html = fs.readFileSync(file, 'utf8');
  if (!/<script src="\.\.\/\.\.\/engine\/types\/(?:city|layer)\.js"><\/script>/.test(html)) continue;
  const names = namesOf(quiz(dir), html), by = {};
  for (const [text, tag] of names) { const r = NAME(text, tag); if (r) by[FILE[r.script]] = (by[FILE[r.script]] || 0) + 1; }
  const scripts = SCRIPTS.map(([n]) => n).filter(n => by[n]);
  let out = html.replace(SCRIPT_LINES, '');
  if (scripts.length) {
    const fonts = `<link href="https://fonts.googleapis.com/css2?${fontsOf(scripts)}&display=swap" rel="stylesheet" data-faces>`;
    out = /<link href="https:\/\/fonts\.googleapis\.com\/css2\?[^"]*" rel="stylesheet">/.test(out) ? out.replace(/(<link href="https:\/\/fonts\.googleapis\.com\/css2\?[^"]*" rel="stylesheet">)/, `$1\n${fonts}`) : out.replace('<link rel="stylesheet" href="../../assets/css/base.css">', `${fonts}\n$&`);
    out = out.replace(/\n<script src="\.\.\/\.\.\/engine\/types\/(?:city|layer)\.js"><\/script>/, m => `\n${scripts.map(n => `<script src="../../data/letters/${n}.js"></script>`).join('\n')}\n<script src="../../engine/types/reading.js"></script>${m}`);
    wired.push(`${dir} (${scripts.map(n => `${n} ${by[n]}`).join(', ')} of ${names.length})`);
  }
  if (out !== html) fs.writeFileSync(file, out);
}
console.log(`Read in their Type mode: ${wired.length} pages\n  ${wired.join('\n  ')}`);
JSON.parse(list);
fs.writeFileSync(LIST, list);
