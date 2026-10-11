#!/usr/bin/env node
// languages: everything of the script quizzes that is not written by hand.
//
//   node tools/builds/languages/build.mjs
//
// A script is a row of SCRIPTS below and its file, quizzes/<script>-letters/<script>.js (SCRIPT: its letters, as
// each country reads them, and the words of their signs: see quizzes/shared/reading.js). For each one this writes
//   - SCRIPT.eg, at the end of that file: a place written with each letter, said with the letter's answer. The places
//     are the cities of a country that writes the letter that way (READING below), from its cities.js, whose name
//     on the map is what its letters spell (not Delhi for दिल्ली: the example would contradict the letter's sound),
//     first those that spell the letter the usual way (ভ as bh, not the v of Savar). Rare letters choose first, and
//     each takes the largest city no letter has taken yet, so the examples differ; a letter no such city has gets
//     none.
//   - its pages, <script>-letters/ and <script>-words/ (quizzes/shared/lang-config.js), tabs of each other, and
//     with them, where several countries or regions write the script, <script>-countries/ or <script>-regions/ (a
//     page of the world quizzes, see quizzes/shared/world-config.js). A script's own regions (SCRIPT.regions: the
//     Hindi states as one area) are drawn for that page, regions.js beside it: the districts of India's district
//     quiz melted into one outline per region (their shared borders drop out), on the world map.
//   - their entries in data/quizzes.json: scope "Languages", the script's name as `area` (its folder in the
//     Languages folder of "All quizzes"), one star per level their rounds reach. (A language quiz without an `area`
//     is not theirs: the home page lists those in a section of their own, which stays as it is.)
// Latin has no letters to learn and no file written by hand. Its pages are written here, from the languages of
// quizzes/world-languages/data.js: quizzes/latin-countries/ (their letters, by area) and quizzes/latin-words/, the
// words of their signs with their meanings on the board of tiles, whose SCRIPT (latin.js beside the page) is made
// of them: a theme per language, a column per area, so that an area is chosen first and then a language of it.
// And quizzes/latin-alphabets/, the Countries page the other way round on the board of tiles: a country, click the
// letters it writes. Its file (alphabets.js beside the page) is what the Countries page itself makes of the
// languages (QUIZ.parts of quizzes/shared/world-config.js, run here), so both ask the same countries and letters.
// And for every country of READING, whose names are written in such a script: its Reading quiz,
// quizzes/<country>-reading/ (the country's city map with typed answers, quizzes/shared/city-config.js). It
// belongs to the country: its entry has the country's code and the role "reading", and it is a tab of the country's
// city pages (tools/builds/town-names keeps that tab when it writes them).
// Run it again after changing a script's file or the cities read from.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
// [name, what its sounds follow, its tab after Letters and Words: the page that tells its countries or regions apart]
const SCRIPTS = [
  ['cyrillic', 'the names on the map (Russia: BGN/PCGN)', 'Countries'],
  ['devanagari', 'Hunterian romanisation', 'Regions'],
  ['bengali', 'the names on the map', ''],
];
// [country (its cities quiz), its script, the language its names are read in]
const READING = [
  ['russia', 'cyrillic', 'ru'], ['ukraine', 'cyrillic', 'uk'], ['bulgaria', 'cyrillic', 'bg'], ['kazakhstan', 'cyrillic', 'kk'],
  ['india', 'devanagari', 'hi'], ['bangladesh', 'bengali', 'bn'],
];
const FONTS = {
  latn: 'family=Noto+Sans:wght@400;500;600;700',
  cyrl: 'family=Noto+Sans:wght@500;600&family=PT+Serif:ital,wght@0,700;1,400&family=Oswald:wght@500&family=Caveat:wght@700&family=Russo+One',
  deva: 'family=Noto+Sans:wght@500;600&family=Noto+Sans+Devanagari:wght@500;600&family=Tiro+Devanagari+Hindi&family=Kalam:wght@700&family=Khand:wght@600&family=Rozha+One',
  beng: 'family=Noto+Sans:wght@500;600&family=Noto+Sans+Bengali:wght@500;600&family=Tiro+Bangla&family=Hind+Siliguri:wght@600&family=Baloo+Da+2:wght@700&family=Galada',
};
const EG = '\n// A place written with each letter (made by tools/builds/languages/build.mjs: run it again, don\'t edit).\nSCRIPT.eg = ';
const READING_JS = fs.readFileSync(path.join(ROOT, 'quizzes', 'shared', 'reading.js'), 'utf8');
const DOT = /^[़়]/; // the dot under a letter makes another letter of it (ढ़ is not ढ)
const nf = s => s.normalize('NFC'), plain = s => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
const tier = n => 1 + [10, 30, 60, Infinity].findIndex(max => n < max); // a round's level, by its size
const read = (file, name) => vm.runInNewContext(fs.readFileSync(file, 'utf8') + `;${name}`);
const cap = s => s[0].toUpperCase() + s.slice(1);
const quiz = (...p) => path.join(ROOT, 'quizzes', ...p);

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
<link rel="stylesheet" href="../shared/area-quiz.css">
<link rel="stylesheet" href="../shared/lang-quiz.css">
</head>`;
const body = (folders, back, title, note, scripts, cls = '') => `
<body${cls ? ` class="${cls}"` : ''}${folders ? ` data-folders="${folders}"` : ''}>
${back}
<h1>${title}</h1>
<p class="note">${note}</p>
<script src="../shared/quiz-page.js"></script>
${scripts}
<script src="../shared/area-quiz.js"></script>
</body>
</html>
`;

// A page of the world quizzes (a script's countries on the map).
const world = (title, description, script, folders, note, scripts) => head(title, description, script)
  .replace('<link rel="stylesheet" href="../shared/lang-quiz.css">', '<link rel="stylesheet" href="../shared/photo-quiz.css">\n<link rel="stylesheet" href="../shared/world-quiz.css">')
  + body(folders, '<a class="back" href="../../country.html?area=Languages">← Languages</a>', title, note,
    `<script src="../shared/world.js"></script>\n<script src="../shared/world-facts.js"></script>\n<script src="../world-languages/data.js"></script>\n${scripts}\n<script src="../shared/world-config.js"></script>`, 'writing own-hover');

/* ---------- a script's own regions, drawn on the world map ---------- */
// The districts of quizzes/india-districts (their rings as latitude and longitude: geo.js) that belong to a region,
// by state or one by one, melted into the region's outline: an edge two of them share drops out, the rest is joined
// into rings. With them the region's whole countries, from the world map. All of it in the world map's own Web
// Mercator, so the page draws it there as one more place.
function regions(S) {
  const WORLD = read(quiz('shared', 'world.js'), 'WORLD'), P = WORLD.proj, RAD = Math.PI / 180;
  const D = read(quiz('india-districts', 'data.js'), 'DATA').reg, GEO = read(quiz('india-districts', 'geo.js'), 'GEO');
  const r2 = v => Math.round(v * 100) / 100;
  const at = ([lat, lng]) => [r2((lng - P.lng0) * P.k), r2((P.y0 - Math.log(Math.tan(Math.PI / 4 + lat * RAD / 2)) / RAD) * P.k)];
  const out = {};
  for (const [id, R] of Object.entries(S.regions)) {
    const states = (R.states || '').split(' '), districts = (R.districts || '').split(' ');
    const edges = new Map();
    for (const d of D) if (states.includes(d.st) || districts.includes(d.id)) for (const ring of GEO[d.id].rings) for (let i = 0; i < ring.length - 1; i++) {
      const a = ring[i].join(','), b = ring[i + 1].join(',');
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
      rings.push(run.slice(0, -1).map(p => at(p.split(',').map(Number))));
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
  return `// Generated by tools/builds/languages/build.mjs: the regions of ${S.name} (quizzes/${S.name.toLowerCase()}-letters) as areas on the\n// world map (../shared/world.js), each the outline of its states and districts (India: © OpenStreetMap contributors, ODbL)\n// and countries. Read by ../shared/world-config.js.\nconst EXTRA_AREAS = ${JSON.stringify(out)};\n`;
}

/* ---------- the list of quizzes: the entries of before go, the new ones are put in below ---------- */
const LIST = path.join(ROOT, 'data', 'quizzes.json');
let list = fs.readFileSync(LIST, 'utf8')
  .replace(/,\n    \{\n      "id": "[^"]+",\n      "scope": "Languages",\n      "area": "[^"]+",[\s\S]*?\n    \}/g, '') // (its own: each is in a script's folder; a language quiz without one is someone else's and stays)
  .replace(/,\n    \{\n      "id": "[^"]+",\n      "country": "\d+",\n      "title": "Reading",[\s\S]*?\n    \}/g, '');
const entry = (id, where, title, levels) => `    {\n      "id": "${id}",\n${where}      "title": "${title}",\n      "levels": ${levels},\n      "url": "quizzes/${id}/index.html"\n    }`;
const atEnd = text => { list = list.replace(/\n  \]\n\}\n$/, `,\n${text}\n  ]\n}\n`); };

/* ---------- the scripts ---------- */
const BY_SCRIPT = {};
for (const [name, system, third] of SCRIPTS) {
  const file = quiz(`${name}-letters`, `${name}.js`);
  const src = fs.readFileSync(file, 'utf8').split(EG)[0].replace(/\s*$/, '\n');
  const S = vm.runInNewContext(src + ';SCRIPT'), R = vm.runInNewContext(`${src}\n${READING_JS};READING`);
  const TAGS = Object.keys(S.langs), inScript = new RegExp(`\\p{Script=${S.unicode}}`, 'u');
  BY_SCRIPT[name] = { S, inScript };

  // the letters asked (as lang-config.js makes them), each with the languages that read it so
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
  for (const [country, script, tag] of READING) if (script === name) {
    cities[tag] = read(quiz(`${country}-cities`, 'cities.js'), 'CITIES').list.filter(c => c.local && inScript.test(c.local) && R.of(tag).accepts(c.local, c.en));
  }
  const has = (c, forms) => forms.some(f => nf(c.local).toLowerCase().split(f.toLowerCase()).slice(1).some(rest => !DOT.test(rest)));
  const found = [...letters].map(([id, l]) => {
    const at = (cities[l.langs.find(t => cities[t])] || []).filter(c => has(c, l.forms)), spelled = c => plain(c.en).includes(l.usual);
    return { id, at: [...at.filter(spelled), ...at.filter(c => !spelled(c))] };
  }).filter(l => l.at.length);
  const taken = new Set(), eg = {};
  for (const l of [...found].sort((a, b) => a.at.length - b.at.length)) {
    const c = l.at.find(c => !taken.has(c)) || l.at[0];
    taken.add(c); eg[l.id] = [c.local, c.en];
  }
  const ordered = Object.fromEntries([...letters.keys()].filter(id => eg[id]).map(id => [id, eg[id]]));
  fs.writeFileSync(file, src + EG.slice(1) + JSON.stringify(ordered) + ';\n');

  // the pages, tabs of each other
  const parts = ['Letters', 'Words', ...(third ? [third] : [])], back = '<a class="back" href="../../country.html?area=Languages">← Languages</a>';
  const tabs = here => parts.map(t => (t === here ? t : `${t}=../${name}-${t.toLowerCase()}/index.html`)).join('|');
  const lang = `<script src="../${name}-letters/${name}.js"></script>\n<script src="../shared/reading.js"></script>`;
  const countries = [...new Set(TAGS.flatMap(t => S.langs[t].where.split(' · ')))].join(', ');
  for (const [part, description, note] of [
    ['Letters', `Read a ${S.name} letter, click its sound: ${countries}.`, `Sounds: ${system}`],
    ['Words', `Read a word from a sign in ${S.name}, click its meaning: ${countries}.`, 'Words seen on signs'],
  ]) {
    const dir = quiz(`${name}-${part.toLowerCase()}`), title = `${S.name} ${part}`;
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), head(title, description, S.script) + body(tabs(part), back, title, note,
      `${lang}\n<script>const LANG_OPTS = { part: '${part.toLowerCase()}' };</script>\n<script src="../shared/lang-config.js"></script>`));
  }
  if (third) { // the script's countries or regions on the world map
    const dir = quiz(`${name}-${third.toLowerCase()}`), title = `${S.name} ${third}`;
    fs.mkdirSync(dir, { recursive: true });
    if (S.regions) fs.writeFileSync(path.join(dir, 'regions.js'), regions(S));
    fs.writeFileSync(path.join(dir, 'index.html'), world(title, `Read a letter or a word in ${S.name}, click where it is written: ${countries}.`, S.script, tabs(third), 'Places with Street View · Map: Natural Earth' + (S.regions ? ' · Districts: © OpenStreetMap contributors (ODbL)' : ''),
      `${S.regions ? '<script src="regions.js"></script>\n' : ''}${lang}\n<script>const WORLD_OPTS = { type: 'writing', script: '${S.script}', key: '${name}-${third.toLowerCase()}' };</script>`));
  }

  // the entries: one star per level the rounds reach, and the round of everything is the largest
  // (a language that is `like` another has that one's words, but for its own: see reading.js)
  const COLS = TAGS.filter(t => !S.langs[t].like);
  const wordsOf = cells => TAGS.map(tag => { const L = S.langs[tag], word = (cells[COLS.indexOf(L.like || tag)] || '').split('|')[0]; return L.but && word in L.but ? L.but[word] : word; }).filter(Boolean);
  const words = new Set(S.words.themes.flatMap(t => t.rows.flatMap(([meaning, ...cells]) => wordsOf(cells).map(w => `${meaning}:${nf(w)}`))));
  const where = `      "scope": "Languages",\n      "area": "${S.name}",\n`;
  atEnd(entry(`${name}-letters`, where, 'Letters', tier(letters.size)));
  atEnd(entry(`${name}-words`, where, 'Words', tier(words.size)));
  if (third) {
    // Its largest round asks every word of the table that not every country or region writes (see world-config.js).
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
  const src = ['shared/world.js', 'shared/world-facts.js', 'world-languages/data.js'].map(f => fs.readFileSync(quiz(...f.split('/')), 'utf8'));
  const parts = vm.runInNewContext([...src, `const WORLD_OPTS = { type: 'writing', script: 'latn' };`, fs.readFileSync(quiz('shared', 'world-config.js'), 'utf8'), ';QUIZ.parts'].join('\n'),
    { document: { currentScript: { src: 'file:///quizzes/shared/world-config.js' } }, console, URL });
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
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'alphabets.js'), `// Generated by tools/builds/languages/build.mjs from the language areas of ../latin-countries (QUIZ.parts, see\n// ../shared/world-config.js): each area's countries with the letters beyond a to z that they write, and their languages.\nconst SCRIPT = ${JSON.stringify({ name: 'Latin', script: 'latn', alphabets })};\n`);
  fs.writeFileSync(path.join(dir, 'index.html'), head('Latin Alphabets', 'A country: click every letter beyond a to z that is written there.', 'latn')
    + body('', '<a class="back" href="../../country.html?area=Languages">← Languages</a>', 'Latin Alphabets', 'Official and main sign languages · Places with Street View',
      `<script src="alphabets.js"></script>\n<script>const LANG_OPTS = { part: 'alphabets' };</script>\n<script src="../shared/lang-config.js"></script>`));
  atEnd(entry('latin-alphabets', '      "scope": "Languages",\n      "area": "Latin",\n', 'Alphabets', tier(Math.max(...alphabets.map(A => A.rows.length)))));
  console.log(`Latin Alphabets: ${alphabets.length} areas, ${alphabets.reduce((n, A) => n + A.rows.length, 0)} countries, ${alphabets.reduce((n, A) => n + new Set(A.rows.flatMap(r => r[1].split(' '))).size, 0)} tiles`);
}
{
  const W = read(quiz('world-languages', 'data.js'), 'WRITING'), P = W.pages.latn, sv = new Set(read(quiz('shared', 'world-facts.js'), 'FACTS').sv), not = new Set((P.not || '').split(' '));
  const NAME = Object.fromEntries(read(quiz('shared', 'world.js'), 'WORLD').reg.map(r => [r.id, r.n]));
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
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'latin.js'), `// Generated by tools/builds/languages/build.mjs from the Latin-script languages of ../world-languages/data.js: the\n// words of their signs, a theme per language, a column per area of its Countries page (see ../shared/reading.js).\nconst SCRIPT = ${JSON.stringify(SCRIPT)};\n`);
  fs.writeFileSync(path.join(dir, 'index.html'), head('Latin Words', 'Read a word from a sign in a Latin-script language, click its meaning.', 'latn')
    + body('', '<a class="back" href="../../country.html?area=Languages">← Languages</a>', 'Latin Words', 'Words seen on signs',
      `<script src="latin.js"></script>\n<script src="../shared/reading.js"></script>\n<script>const LANG_OPTS = { part: 'words' };</script>\n<script src="../shared/lang-config.js"></script>`));
  atEnd(entry('latin-words', '      "scope": "Languages",\n      "area": "Latin",\n', 'Words', tier(new Set(themes.flatMap(t => t.rows.map(r => `${r[0]}:${r.slice(1).find(Boolean).split('|')[0]}`))).size)));
  console.log(`Latin Words: ${themes.length} languages, ${themes.reduce((n, t) => n + t.rows.length, 0)} words`);
}
{
  const dir = quiz('latin-countries');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), world('Latin Countries', 'A letter, several letters or a word of a sign in Latin script: click the countries of the area that write it.', 'latn', '',
    'Official and main sign languages · Places with Street View · Map: Natural Earth', `<script>const WORLD_OPTS = { type: 'writing', script: 'latn', key: 'latin-countries' };</script>`));
  atEnd(entry('latin-countries', '      "scope": "Languages",\n      "area": "Latin",\n', 'Countries', 4)); // (its rounds of a whole part of the world are its largest)
}

/* ---------- a country's Reading quiz ---------- */
for (const [country, script, tag] of READING) {
  const { S, inScript } = BY_SCRIPT[script], id = `${country}-reading`;
  const cityPage = fs.readFileSync(quiz(`${country}-cities`, 'index.html'), 'utf8');
  const [, code, name] = /country\.html\?code=(\d+)">← ([^<]+)</.exec(cityPage), credits = /<p class="note">([^<]*)<\/p>/.exec(cityPage)[1];
  const names = read(quiz(`${country}-cities`, 'cities.js'), 'CITIES').list.filter(c => c.local && inScript.test(c.local)).length;
  // the tabs of the country's city pages, with this one last
  const others = ['cities', 'cities-coverage', 'town-names'].filter(p => fs.existsSync(quiz(`${country}-${p}`, 'index.html')));
  const LABEL = { cities: 'Cities', 'cities-coverage': 'By coverage', 'town-names': 'Town names', reading: 'Reading' };
  const tabs = here => [...others, 'reading'].map(p => (p === here ? LABEL[p] : `${LABEL[p]}=../${country}-${p}/index.html`)).join('|');
  fs.mkdirSync(quiz(id), { recursive: true });
  fs.writeFileSync(quiz(id, 'index.html'), head(`${name} Reading`, `Read ${name}'s place names in ${S.name}, type them in Latin letters.`, S.script)
    + body(tabs('reading'), `<a class="back" href="../../country.html?code=${code}">← ${name}</a>`, `${name} Reading`, credits,
      `<script src="../${country}-cities/cities.js"></script>\n<script src="../${script}-letters/${script}.js"></script>\n<script src="../shared/reading.js"></script>\n<script>const CITY_OPTS = { key: '${id}', typed: '${tag}' };</script>\n<script src="../shared/city-config.js"></script>`));
  for (const p of others) {
    const page = quiz(`${country}-${p}`, 'index.html');
    fs.writeFileSync(page, fs.readFileSync(page, 'utf8').replace(/ data-folders="[^"]*"/, '').replace(/<body([^>]*)>/, `<body$1 data-folders="${tabs(p)}">`));
  }
  // its entry, after the country's last city quiz
  const mine = entry(id, `      "country": "${code}",\n`, 'Reading', tier(names)).replace('"title": "Reading",', '"title": "Reading",\n      "role": "reading",');
  const after = new RegExp(`(      "id": "${country}-${others[others.length - 1]}",[\\s\\S]*?\\n    \\})`);
  if (!after.test(list)) throw new Error(`${country}: no city quiz in data/quizzes.json to put its Reading after`);
  list = list.replace(after, `$1,\n${mine}`);
  console.log(`${name} Reading: ${names} names in ${S.name}`);
}
JSON.parse(list);
fs.writeFileSync(LIST, list);
