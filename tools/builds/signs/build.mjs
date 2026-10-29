// Builds the country signs for the city quizzes (see engine/signs/signs.js) from the sign drawings in
// tools/cache/builds/signs: lib.js, shared/ (as parts/), countries/<ISO2>.js, fonts/ and review.json, the user's
// verdict on every drawing next to its reference picture (review.mjs there). Only drawings marked as matching (1)
// go in, and only countries with a city quiz (data/maps/<slug>-cities/cities.js). Each font is cut down to the
// letters the city names and the drawings use (pyftsubset, woff2), plus whole blocks of the scripts whose letters a
// drawing works out from a name (transliterations, capitals, digits). Writes the drawing code to engine/signs (lib.js,
// parts/, countries/), the data to data/signs (index.js: which country has which drawings; fonts/ and fonts.css), and
// the line SIGN_COUNTRIES in engine/types/city.js (the countries that load signs, and the build's version).
// Usage: node tools/builds/signs/build.mjs
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import vm from 'node:vm';

const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../..');
const SRC = `${REPO}/tools/cache/builds/signs`, CODE = `${REPO}/engine/signs`, DATA = `${REPO}/data/signs`;
const SUBSET = '/usr/local/anaconda3/bin/pyftsubset';   // fontTools with brotli (for woff2)
const read = (f) => fs.readFileSync(f, 'utf8');

// the countries with a city quiz, and every character of their city names
const quizIso = new Set(), names = [];
for (const d of fs.readdirSync(`${REPO}/data/maps`).filter((d) => d.endsWith('-cities'))) {
  const f = `${REPO}/data/maps/${d}/cities.js`;
  if (!fs.existsSync(f)) continue;
  const src = read(f), C = JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf('}') + 1));
  quizIso.add(C.iso3);
  for (const c of C.list) names.push(c.en, c.local || '');
}

// the approved drawings: review.json { "<ISO2>/<id>": { v: 1 | 2 } }
const review = JSON.parse(read(`${SRC}/review.json`));
const ok = {};
for (const [k, m] of Object.entries(review)) if (m.v === 1) { const [cc, id] = k.split('/'); (ok[cc] ||= []).push(id); }
// the drawings each country file really defines (some make their ids in a loop): the files run as a page would
const parts = fs.readdirSync(`${SRC}/shared`).filter((f) => f.endsWith('.js')).sort();
const box = { console }; box.window = box; box.globalThis = box; vm.createContext(box);
for (const f of [`${SRC}/lib.js`, ...parts.map((p) => `${SRC}/shared/${p}`)]) vm.runInContext(read(f), box, { filename: f });
const countries = {};
for (const cc of Object.keys(ok).sort()) {
  const ex = JSON.parse(read(`${SRC}/examples/${cc}.json`));
  if (!quizIso.has(ex.iso3)) continue;
  vm.runInContext(read(`${SRC}/countries/${cc}.js`), box, { filename: `${cc}.js` });
  const have = new Set((box.TS.signs[cc] || []).map((t) => t.id));
  const ids = ok[cc].filter((id) => have.has(id));
  if (ids.length) countries[ex.iso3] = { cc, ids: ids.sort() };
}

// fresh output: the code (lib.js, parts/, countries/) in engine/signs, the data (index.js, fonts/, fonts.css) in data/signs
for (const d of [`${CODE}/parts`, `${CODE}/countries`, `${DATA}/fonts`]) { fs.rmSync(d, { recursive: true, force: true }); fs.mkdirSync(d, { recursive: true }); }
fs.copyFileSync(`${SRC}/lib.js`, `${CODE}/lib.js`);
for (const p of parts) fs.copyFileSync(`${SRC}/shared/${p}`, `${CODE}/parts/${p}`);
for (const { cc } of Object.values(countries)) fs.copyFileSync(`${SRC}/countries/${cc}.js`, `${CODE}/countries/${cc}.js`);
const code = [`${CODE}/lib.js`, ...parts.map((p) => `${CODE}/parts/${p}`), ...Object.values(countries).map(({ cc }) => `${CODE}/countries/${cc}.js`)].map(read).join('\n');

// fonts: those whose family the drawings name, cut to the letters needed
const fonts = fs.readdirSync(`${SRC}/fonts`).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(read(`${SRC}/fonts/${f}`)))
  .filter((f) => fs.existsSync(`${SRC}/fonts/${f.file}`) && (code.includes(`'${f.family}'`) || code.includes(`"${f.family}"`)));
const text = [...new Set([...names.join(''), ...code])].filter((ch) => ch.codePointAt(0) > 0x7e).join('');
fs.writeFileSync(`${SRC}/subset-text.txt`, text);
const blocks = ['0020-024F', '0300-036F', '0370-03FF', '0400-052F', '0590-05FF', '0600-06FF', '0900-0DFF', '0E00-0EFF', '0F00-0FFF',
  '10A0-10FF', '1400-167F', '1780-17FF', '1C90-1CBF', '1E00-1EFF', '2000-206F', '20A0-20BF', '2100-218F', '2190-21FF', 'FFFD'].map((b) => 'U+' + b).join(',');
const faces = [];
for (const f of fonts) {
  const out = f.file.replace(/\.(ttf|otf|woff2?)$/i, '') + '.woff2';
  execFileSync(SUBSET, [`${SRC}/fonts/${f.file}`, `--unicodes=${blocks}`, `--text-file=${SRC}/subset-text.txt`, '--layout-features=*', '--flavor=woff2',
    '--no-hinting', '--desubroutinize', `--output-file=${DATA}/fonts/${out}`], { stdio: ['ignore', 'ignore', 'pipe'] });
  faces.push(`/* ${f.family}${f.stands_in_for ? ` (for ${f.stands_in_for})` : ''}: ${f.license || 'licence unknown'}, ${f.source || ''} */\n` +
    `@font-face{font-family:'${f.family}';src:url('fonts/${out}') format('woff2');font-weight:${f.weight || 'normal'};font-style:${f.style || 'normal'};font-display:block}`);
}
fs.writeFileSync(`${DATA}/fonts.css`, `/* Fonts of the country signs (tools/builds/signs/build.mjs): free fonts, cut down to the letters the signs use. */\n${faces.join('\n')}\n`);

// credit lines a country's signs need on its page (drawings under CC BY-SA, from shared/shields.js)
const CREDITS = {
  CRI: 'Route marker: Roqz, Wikimedia Commons (CC BY-SA 4.0)',
  VNM: 'Motorway symbol: มองโกเลีย๔๔, Wikimedia Commons (CC BY-SA 4.0)',
};
for (const [iso3, c] of Object.entries(CREDITS)) if (countries[iso3]) countries[iso3].credit = c;
fs.writeFileSync(`${DATA}/index.js`, `// Written by tools/builds/signs/build.mjs. The country signs of the city quizzes (engine/signs/signs.js): per country
// (ISO3) the drawings reviewed against their reference pictures. Drawn after GeoHints pictures (geohints.com) and
// Wikimedia Commons photos (sources and licences per country in tools/cache/builds/signs/examples); symbols from Commons
// as named in engine/signs/parts/; fonts as in fonts.css.
window.SIGN_INDEX = ${JSON.stringify({ parts, countries })};
`);

// the version: changes whenever anything written changes, or signs.js (browsers then load the new files)
const h = crypto.createHash('sha1');
for (const d of [CODE, `${CODE}/parts`, `${CODE}/countries`, DATA, `${DATA}/fonts`]) for (const f of fs.readdirSync(d).sort()) { const p = `${d}/${f}`; if (fs.statSync(p).isFile()) h.update(f).update(fs.readFileSync(p)); }
const version = h.digest('hex').slice(0, 8);
const cfg = `${REPO}/engine/types/city.js`, line = `  const SIGN_COUNTRIES = '${Object.keys(countries).sort().join(' ')}', SIGN_VERSION = '${version}'; // (written by tools/builds/signs/build.mjs)`;
const before = read(cfg);
if (!/^ {2}const SIGN_COUNTRIES = .*$/m.test(before)) throw new Error('engine/types/city.js has no SIGN_COUNTRIES line');
fs.writeFileSync(cfg, before.replace(/^ {2}const SIGN_COUNTRIES = .*$/m, line));

const size = (d) => fs.readdirSync(d).reduce((a, f) => a + fs.statSync(`${d}/${f}`).size, 0);
console.log(`${Object.keys(countries).length} countries, ${Object.values(countries).reduce((a, c) => a + c.ids.length, 0)} signs, ${faces.length} fonts`);
console.log(`sizes: countries ${(size(`${CODE}/countries`) / 1e3).toFixed(0)} kB, parts ${(size(`${CODE}/parts`) / 1e3).toFixed(0)} kB, fonts ${(size(`${DATA}/fonts`) / 1e6).toFixed(2)} MB · version ${version}`);
