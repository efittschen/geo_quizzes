#!/usr/bin/env node
// town-names: the town-name quiz of every country that has a cities quiz (the map comes from its city list, which
// both quizzes load from data/maps/<slug>-cities/cities.js).
//
//   node tools/builds/town-names/build.mjs [slug …]      (every country without arguments; from the repository root)
//   node tools/builds/town-names/build.mjs --pages [slug …]      (only the pages and the list again, from the names.js there are)
//
// For each country: tools/townnames.mjs -> data/maps/<slug>-town-names/names.js (four countries at a time, their
// output in tools/cache/builds/town-names/<slug>.log), then the page (quizzes/<slug>-town-names/index.html) and the
// entry in data/site/quizzes.json, right after the country's cities quiz. A country with fewer than MIN parts gets no
// quiz: its page, its names.js and its entry in the list are removed, and it is named at the end.
// The parts: those choose.mjs picked over all countries (tools/cache/builds/town-names/chosen.json; run it first),
// each graded against its 80% area; without that file, tools/townnames.mjs's older rule.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { spawn } from 'node:child_process';
import { ROOT, CACHE } from '../../lib/geo.mjs';
import { ISO2, PLACES } from './countries.mjs';

const MIN = 3, AT_ONCE = 4, LOGS = path.join(CACHE, 'builds', 'town-names'), CHOSEN = path.join(LOGS, 'chosen.json');
const chosenArgs = fs.existsSync(CHOSEN) ? ['--chosen', CHOSEN, '--min-places', '200'] : [];   // (every chosen part has 200 places or more)
const PAGES_ONLY = process.argv.includes('--pages'), named = process.argv.slice(2).filter(a => !a.startsWith('--'));
const slugs = named.length ? named : Object.keys(ISO2);
// A country's city list: data/maps/<slug>-cities/cities.js, the map of its city quiz and of its town-name quiz.
const cityList = s => path.join(ROOT, 'data', 'maps', `${s}-cities`, 'cities.js');
for (const s of slugs) if (!ISO2[s] || !fs.existsSync(cityList(s))) { console.error(`no cities quiz or country code for ${s}`); process.exit(1); }
fs.mkdirSync(LOGS, { recursive: true });

/* ---------- the data, four countries at a time ---------- */
const todo = PAGES_ONLY ? [] : [...slugs], failed = [];
await Promise.all(Array.from({ length: AT_ONCE }, async () => {
  for (let s; (s = todo.shift());) {
    const log = fs.openSync(path.join(LOGS, `${s}.log`), 'w');
    const code = await new Promise(done => spawn(process.execPath, ['--max-old-space-size=8192', 'tools/townnames.mjs', '--iso2', ISO2[s], '--map', path.relative(ROOT, cityList(s)), '--out', `data/maps/${s}-town-names/names.js`, ...chosenArgs], { cwd: ROOT, stdio: ['ignore', log, log] }).on('close', done));
    fs.closeSync(log);
    console.log(`${s}: ${code ? 'failed' : fs.readFileSync(path.join(LOGS, `${s}.log`), 'utf8').split('\n')[0]}`);
    if (code) failed.push(s);
  }
}));

/* ---------- the pages and the list of quizzes ---------- */
const page = o => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${o.title} · Geo Quizzes</title>
<meta name="description" content="Paint where in ${o.country} the parts of town names are found.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../../assets/css/base.css">
<link rel="stylesheet" href="../../engine/css/quiz-page.css">
<link rel="stylesheet" href="../../engine/css/quiz-map.css">
<link rel="stylesheet" href="../../engine/css/paint-quiz.css">
</head>
<body data-page="paint">
<a class="back" href="../../country.html?code=${o.code}">← ${o.back}</a>
<h1>${o.title}</h1>
<p class="note">Places: ${o.places}${o.borders ? ' · ' + o.borders : ''}</p>
<script src="../../engine/page.js"></script>
<script src="../../data/maps/${o.slug}-cities/cities.js"></script>
<script src="../../data/maps/${o.slug}-town-names/names.js"></script>
<script src="../../engine/paint.js"></script>
</body>
</html>
`;
const LIST = path.join(ROOT, 'data', 'site', 'quizzes.json');
let list = fs.readFileSync(LIST, 'utf8');
const built = [], none = [];
for (const s of slugs) {
  // the page in quizzes/, its names.js in data/maps/ (the page folder holds the page only)
  const dir = path.join(ROOT, 'quizzes', `${s}-town-names`), file = path.join(ROOT, 'data', 'maps', `${s}-town-names`, 'names.js');
  if (failed.includes(s) || !fs.existsSync(file)) continue;
  const N = vm.runInNewContext(fs.readFileSync(file, 'utf8') + ';NAMES');
  if (N.parts.length < MIN) {
    for (const d of [dir, path.dirname(file)]) fs.rmSync(d, { recursive: true, force: true });
    none.push(`${s} (${N.parts.length})`);
    list = list.replace(new RegExp(`,\\n    \\{\\n      "id": "${s}-town-names",[\\s\\S]*?\\n    \\}`), '');   // its entry, with the comma before it
    continue;
  }
  const cities = fs.readFileSync(path.join(ROOT, 'quizzes', `${s}-cities`, 'index.html'), 'utf8');
  const [, code, back] = /country\.html\?code=(\d+)">← ([^<]+)</.exec(cities), title = /<h1>([^<]+)<\/h1>/.exec(cities)[1].replace(/ Cities$/, ' Town Names');
  const borders = (/<p class="note">[^<]*?(Borders:[^<]*)<\/p>/.exec(cities) || [])[1];
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), page({ title, country: N.country, code, back, borders, slug: s, places: PLACES[s] || 'GeoNames (CC BY 4.0)' }));
  // One star per level its rounds reach: the round of all parts is the largest.
  const levels = 1 + [10, 30, 60, Infinity].findIndex(max => N.parts.length < max), id = `${s}-town-names`;
  const entry = `    {\n      "id": "${id}",\n      "country": "${code}",\n      "title": "Town Names",\n      "role": "names",\n      "levels": ${levels},\n      "url": "quizzes/${id}/index.html"\n    }`;
  const mine = new RegExp(`    \\{\\n      "id": "${id}",[\\s\\S]*?\\n    \\}`), after = new RegExp(`(      "id": "${s}-cities",[\\s\\S]*?\\n    \\})`);
  if (mine.test(list)) list = list.replace(mine, entry);
  else if (after.test(list)) list = list.replace(after, `$1,\n${entry}`);
  else { console.error(`${s}: no cities quiz in data/site/quizzes.json to put it after`); continue; }
  built.push(`${s} (${N.parts.length})`);
}
JSON.parse(list);
fs.writeFileSync(LIST, list);
console.log(`\nquizzes: ${built.join(', ')}`);
if (none.length) console.log(`no quiz, under ${MIN} parts: ${none.join(', ')}`);
if (failed.length) console.log(`failed (see ${path.relative(ROOT, LOGS)}): ${failed.join(', ')}`);
