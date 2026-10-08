#!/usr/bin/env node
// The cities of quizzes/<country>-cities-coverage: picked and ordered by Street View coverage, so that the list
// spreads over the covered roads of the country and no city on it lies away from them.
//
//   node tools/builds/city-coverage/build.mjs US|RU [--dry]
//
// Needs the coverage cache of the country (node tools/coverage.mjs fetch --only US) and its cities quiz, whose
// map, regions and names are used again. Writes quizzes/<country>-cities-coverage/cities.js: the list alone,
// for CITY_OPTS.list (see quizzes/shared/city-config.js). --dry prints the list and writes nothing.
//
// The rule. A player dropped on a covered road guesses the nearest city they know, and loses points by the
// distance, as GeoGuessr counts them on the world map: 5000 · (1 − e^(−d / 1492.7 km)). The points lost, summed
// over all covered road, are what a list of cities is worth. Cities are picked in turn: each time the one with
// the largest population × (points it saves, given the cities picked before it)². So far-off roads with no city
// picked near them weigh much, a suburb of a city already picked weighs little, and of two places that would
// serve the same roads the larger one wins. The pick order is the list order. (With size and points weighing the
// same, √(population × points), 19 of the 200 US picks and 12 of Russia's differ: suburbs such as Plano, Mesa and
// Newark come in, and Fairbanks, Dodge City and Williston go.)
//   Candidates: GeoNames populated places (PPL, PPLA–PPLA4, PPLC, PPLG) of 10,000 people or more, and the
//   capitals of first-level regions of any size, with covered road within 1 km of their point: closed cities
//   and towns no car has been to are out, capitals too. (Nearly every covered town has it within 0.5 km; a town
//   with a covered road passing 1 to 2 km off is one the car did not enter.)
//   Coverage: the Vali location pool, as covered squares of about 330 m (a third of a kilometre of road each),
//   summed into cells of 0.1°.
//   List: the first 200 picks, then every remaining capital that has coverage, in pick order.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { geoAlbersUsa, geoDistance } from 'd3-geo';
import { ROOT, CACHE, UA, cached, unzipText, projectionFrom, sleep } from '../../lib/geo.mjs';

const COUNTRIES = {
  US: {
    slug: 'us', name: 'United States', lang: 'en', box: [17, 72, -180, -64],
    // GeoNames places that are no city of their own
    out: {
      5110266: 'The Bronx: part of New York City', 5110302: 'Brooklyn: part of New York City', 5125771: 'Manhattan: part of New York City',
      5133273: 'Queens: part of New York City', 5139568: 'Staten Island: part of New York City',
      4839745: 'North Stamford: part of Stamford', 5052361: 'West Coon Rapids: Coon Rapids a second time',
      4297999: 'Lexington-Fayette: Lexington a second time', 4300488: 'Meads KY: a hamlet with a county\'s population',
      4684724: 'Cypress TX: unincorporated, the population is that of a wider area', 5509952: 'Paradise NV: unincorporated, the Strip beside Las Vegas',
    },
    fix: { 4180531: { pop: 202081 } }, // Augusta GA: GeoNames has 43,459; the 2020 census counted 202,081 (Augusta-Richmond County)
  },
  RU: {
    slug: 'russia', name: 'Russia', lang: 'ru', box: [40, 82, 19, 192], // the box runs past 180° for Chukotka
    out: { 830844: 'Tryokhgorny: a closed town, the covered road ends at its gate' },
    fix: {
      6313621: { lat: 43.1667, lng: 44.8 }, // Magas: GeoNames has it in the middle of Nazran, 7 km off
      548602: { local: 'Кингисепп' }, // Kingisepp: the Wikidata item with its GeoNames ID is the municipality (Кингисеппское городское поселение)
    },
  },
};
const cc = (process.argv[2] || '').toUpperCase(), DRY = process.argv.includes('--dry'), K = COUNTRIES[cc];
if (!K) { console.error('usage: build.mjs US|RU [--dry]'); process.exit(1); }
const TOP = 200, FLOOR = 10000, NEAR_KM = 1, SCALE = 1492.7, EARTH = 6371, SIZE = 1 / 3; // SIZE: the weight of the population, the points saved have the rest
const WORK = path.join(CACHE, 'builds', 'city-coverage');
fs.mkdirSync(WORK, { recursive: true });

/* ---------- coverage: covered squares, and their sum in cells ---------- */
const [LAT0, LAT1, LNG0, LNG1] = K.box, DLAT = 0.003, DLNG = 0.004, KM = 0.33, CELL = 0.1;
const rows = Math.ceil((LAT1 - LAT0) / DLAT), cols = Math.ceil((LNG1 - LNG0) / DLNG), crow = Math.ceil((LAT1 - LAT0) / CELL), ccol = Math.ceil((LNG1 - LNG0) / CELL);
const covered = new Uint8Array(Math.ceil(rows * cols / 8));
const cw = new Float64Array(crow * ccol), clat = new Float64Array(crow * ccol), clng = new Float64Array(crow * ccol);
const lngOf = l => (l < LNG0 ? l + 360 : l);
const dir = path.join(CACHE, 'coverage', cc);
if (!fs.existsSync(dir)) { console.error(`no coverage cache for ${cc}: run node tools/coverage.mjs fetch --only ${cc}`); process.exit(1); }
let locations = 0;
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.loc'))) {
  const b = fs.readFileSync(path.join(dir, f)), n = b.readUInt32LE(4), ll = new Float32Array(b.buffer.slice(b.byteOffset + 16, b.byteOffset + 16 + 8 * n));
  for (let i = 0; i < n; i++) {
    const lat = ll[2 * i], lng = lngOf(ll[2 * i + 1]), r = Math.floor((lat - LAT0) / DLAT), c = Math.floor((lng - LNG0) / DLNG);
    if (r < 0 || r >= rows || c < 0 || c >= cols) continue;
    locations++;
    const k = r * cols + c; if (covered[k >> 3] & (1 << (k & 7))) continue;
    covered[k >> 3] |= 1 << (k & 7);
    const j = Math.floor((lat - LAT0) / CELL) * ccol + Math.floor((lng - LNG0) / CELL); cw[j] += KM; clat[j] += lat; clng[j] += lng;
  }
}
const RAD = Math.PI / 180, xyz = (lat, lng) => [Math.cos(lat * RAD) * Math.cos(lng * RAD), Math.cos(lat * RAD) * Math.sin(lng * RAD), Math.sin(lat * RAD)];
const W = [], X = [], Y = [], Z = [];
for (let j = 0; j < cw.length; j++) if (cw[j]) { const n = cw[j] / KM, [x, y, z] = xyz(clat[j] / n, clng[j] / n); W.push(cw[j]); X.push(x); Y.push(y); Z.push(z); }
const N = W.length, total = W.reduce((a, b) => a + b, 0);
// is there a covered square within `km` of a place
function roadNear(lat, lng, km) {
  const dr = Math.ceil(km / 111.2 / DLAT), kx = 111.2 * Math.cos(lat * RAD), dc = Math.ceil(km / kx / DLNG), r0 = Math.floor((lat - LAT0) / DLAT), c0 = Math.floor((lngOf(lng) - LNG0) / DLNG);
  for (let r = Math.max(0, r0 - dr); r <= Math.min(rows - 1, r0 + dr); r++) for (let c = Math.max(0, c0 - dc); c <= Math.min(cols - 1, c0 + dc); c++) {
    if (((r - r0) * DLAT * 111.2) ** 2 + ((c - c0) * DLNG * kx) ** 2 > km * km) continue;
    const k = r * cols + c; if (covered[k >> 3] & (1 << (k & 7))) return true;
  }
  return false;
}

/* ---------- candidates ---------- */
const KEEP = new Set(['PPL', 'PPLA', 'PPLA2', 'PPLA3', 'PPLA4', 'PPLC', 'PPLG']), isCapital = c => c.fc === 'PPLA' || c.fc === 'PPLC';
const dump = unzipText(await cached(`https://download.geonames.org/export/dump/${cc}.zip`, `geonames_${cc}.zip`), `${cc}.txt`);
const all = [];
for (const line of dump.split('\n')) {
  const c = line.split('\t');
  if (c.length < 15 || c[6] !== 'P' || c[8] !== cc || !KEEP.has(c[7]) || K.out[c[0]]) continue;
  const p = { id: c[0], name: c[1], lat: +c[4], lng: +c[5], fc: c[7], adm: c[10], pop: +c[14] };
  Object.assign(p, K.fix?.[p.id]);
  if (p.pop >= FLOOR || isCapital(p)) all.push(p);
}
for (const c of all) c.near = roadNear(c.lat, c.lng, NEAR_KM);
const cities = all.filter(c => c.near), away = all.filter(c => !c.near).sort((a, b) => b.pop - a.pop);

/* ---------- the picks (lazy: what a city saves only falls as others are picked) ---------- */
const LS = new Float64Array(N).fill(1), DOT = new Float64Array(N).fill(-2); // per cell: the share of the points lost, and how near the nearest pick is (as a dot product)
function saves(c, take) {
  const [x, y, z] = c.v; let g = 0;
  for (let i = 0; i < N; i++) {
    const d = x * X[i] + y * Y[i] + z * Z[i]; if (d <= DOT[i]) continue;
    const l = 1 - Math.exp(-EARTH * Math.acos(Math.min(1, d)) / SCALE); g += W[i] * (LS[i] - l);
    if (take) { LS[i] = l; DOT[i] = d; }
  }
  return Math.max(0, g); // rounding can leave a hair below zero for a place on top of a pick
}
const score = c => Math.pow(Math.max(c.pop, 1), SIZE) * Math.pow(c.g, 1 - SIZE);
for (const c of cities) { c.v = xyz(c.lat, lngOf(c.lng)); c.g = saves(c); c.s = score(c); }
const heap = cities.slice().sort((a, b) => b.s - a.s), picked = [];
let lost = total;
const lostAt = {};
while (heap.length && (picked.length < TOP || heap.some(isCapital))) {
  const top = heap.shift();
  if (picked.length >= TOP && !isCapital(top)) continue; // after the first 200: the capitals only
  top.g = saves(top); top.s = score(top);
  const next = picked.length >= TOP ? heap.find(isCapital) : heap[0];
  if (!next || top.s >= next.s - 1e-12) { saves(top, true); lost -= top.g; picked.push(top); lostAt[picked.length] = Math.round(5000 * lost / total); }
  else { let lo = 0, hi = heap.length; while (lo < hi) { const m = (lo + hi) >> 1; if (heap[m].s >= top.s) lo = m + 1; else hi = m; } heap.splice(lo, 0, top); }
}

/* ---------- the cities quiz: map, regions, the entries it has ---------- */
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'quizzes', `${K.slug}-cities`, 'cities.js'), 'utf8').replace('const CITIES', 'var CITIES'), ctx);
const C = ctx.CITIES, HAVE = Object.fromEntries(C.list.map(c => [c.id, c]));
const proj = C.proj.type === 'albersUsa' ? geoAlbersUsa().scale(C.proj.scale).translate(C.proj.translate) : projectionFrom(C.proj);
const round = (v, n) => Math.round(v * 10 ** n) / 10 ** n;

/* ---------- Wikidata: names of the cities the quiz has not got ---------- */
const namesFile = path.join(WORK, `names_${cc}.json`), NAMES = fs.existsSync(namesFile) ? JSON.parse(fs.readFileSync(namesFile, 'utf8')) : {};
const fresh = picked.filter(c => !HAVE[c.id] && !NAMES[c.id]);
const more = list => (list.length > TOP ? `the first ${TOP}, then the ${list.length - TOP} capital${list.length - TOP > 1 ? 's' : ''} not among them` : `the first ${TOP}, every capital with coverage among them`);
for (let i = 0; i < fresh.length && !DRY; i += 150) {
  const batch = fresh.slice(i, i + 150);
  const query = `SELECT ?gn ?en ?local WHERE { VALUES ?gn { ${batch.map(p => `"${p.id}"`).join(' ')} } ?item wdt:P1566 ?gn .
    OPTIONAL { ?item rdfs:label ?en FILTER(LANG(?en) = "en") } OPTIONAL { ?item rdfs:label ?local FILTER(LANG(?local) = "${K.lang}") } }`;
  let rows = null;
  for (let t = 0; t < 6 && !rows; t++) {
    const res = await fetch('https://query.wikidata.org/sparql', { method: 'POST', headers: { 'User-Agent': UA, Accept: 'application/sparql-results+json', 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'query=' + encodeURIComponent(query) }).catch(() => null);
    if (res?.ok) rows = (await res.json()).results.bindings; else await sleep(3000 * 2 ** t);
  }
  if (!rows) throw new Error('Wikidata query failed repeatedly');
  for (const p of batch) NAMES[p.id] = {};
  for (const r of rows) { // several items can carry one GeoNames ID (a town and its municipality): the one with the most names is kept, of those the shortest
    const rec = { en: r.en?.value, local: r.local?.value }, n = x => Object.values(x).filter(Boolean).length, len = x => (x.local || x.en || '').length;
    const cur = NAMES[r.gn.value];
    if (n(rec) > n(cur) || (n(rec) === n(cur) && len(rec) < len(cur))) NAMES[r.gn.value] = rec;
  }
  fs.writeFileSync(namesFile, JSON.stringify(NAMES));
  await sleep(1500);
}

/* ---------- write ---------- */
const list = picked.map(p => {
  if (HAVE[p.id] && !K.fix?.[p.id]) return HAVE[p.id];
  const wd = HAVE[p.id] || NAMES[p.id] || {}, [x, y] = proj([p.lng, p.lat]);
  const c = { id: p.id, en: wd.en || p.name, local: K.lang === 'en' ? null : p.local || wd.local || null, lang: K.lang, lat: round(p.lat, 4), lng: round(p.lng, 4), x: round(x, 1), y: round(y, 1), pop: p.pop, adm: p.adm, fc: p.fc };
  // Albers USA: km per map unit at the city, as the cities quiz has it (it sets the scale inside an inset)
  if (C.proj.type === 'albersUsa') c.k = round(geoDistance(proj.invert([x - 0.5, y]), proj.invert([x + 0.5, y])) * EARTH, 3);
  return c;
});
const fmt = n => n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : Math.round(n / 1000) + 'k';
const added = list.filter(c => !HAVE[c.id]), gone = C.list.filter(c => !list.some(l => l.id === c.id));
console.log(`${cc}: ${locations.toLocaleString('en')} locations, ${Math.round(total).toLocaleString('en')} km of covered road in ${N} cells; ${cities.length} candidates, ${away.length} away from coverage`);
console.log(`${list.length} cities (${TOP} picks + ${list.length - TOP} capitals); ${added.length} the cities quiz has not got, ${gone.length} of its ${C.list.length} not here`);
console.log(`points lost by guessing the nearest city of the first 8 / 25 / 50 / 100 / 200: ${[8, 25, 50, 100, 200].map(n => lostAt[n]).join(' / ')}`);
console.log('\n' + picked.map((c, i) => `${i + 1} ${c.name} (${c.adm}) ${fmt(c.pop)}${HAVE[c.id] ? '' : ' *'}`).join(' | '));
console.log('\naway from coverage, largest and capitals: ' + away.filter((c, i) => i < 25 || isCapital(c)).map(c => `${c.name} ${fmt(c.pop)}${isCapital(c) ? ' (capital)' : ''}`).join(', '));
console.log('\nin the cities quiz, not here: ' + gone.map(c => c.en).join(', '));
const noRegion = [...new Set(list.filter(c => !C.regions[c.adm]).map(c => c.adm))], noLocal = list.filter(c => K.lang !== 'en' && !c.local);
if (noRegion.length) console.log('\nregions without a name in the cities quiz: ' + noRegion.join(', '));
if (noLocal.length) console.log('\nwithout a local name: ' + noLocal.map(c => c.en).join(', '));
if (DRY) process.exit(0);

const notHere = gone.filter(c => away.some(a => a.id === c.id)).map(c => c.en);
const out = path.join(ROOT, 'quizzes', `${K.slug}-cities-coverage`, 'cities.js');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, `// ${K.name}: ${list.length} cities picked by Street View coverage, made by tools/builds/city-coverage/build.mjs.
// A player dropped on a covered road guesses the nearest city they know and loses points by the distance (GeoGuessr,
// world map: 5000 · (1 − e^(−d / 1492.7 km))). Cities are picked in turn, each time the one with the largest
// population × (points it saves over all covered road, given the picks before it)²: far-off roads with no city picked
// near them weigh much, a suburb of a picked city little. The list is the pick order: ${more(list)}.
// No city without covered road within ${NEAR_KM} km of its point is on it${notHere.length ? ` (so not ${notHere.join(', ')})` : ''}.
// Coverage: Vali location pool (github.com/slashP/Vali), ${Math.round(total).toLocaleString('en')} km of covered road. Cities: GeoNames (geonames.org,
// CC BY 4.0), filtered and modified. Names: Wikidata (CC0).${Object.keys(K.out).length ? ` Left out by hand: ${Object.values(K.out).map(s => s.split(':')[0]).join(', ')}.` : ''}${K.fix ? ` Set right by hand: ${Object.keys(K.fix).map(id => picked.find(c => c.id === id)).filter(Boolean).map(c => `${c.name} (${Object.keys(K.fix[c.id]).map(k => ({ pop: 'population', lat: 'place', local: 'name' })[k]).filter(Boolean).join(', ')})`).join(', ')}.` : ''}
// The page loads the map and the regions from ../${K.slug}-cities/cities.js; this list takes the place of its cities
// (CITY_OPTS.list, see shared/city-config.js). Fields as there.
const BY_COVERAGE = ${JSON.stringify({ order: 'coverage', list })};\n`);
console.log(`\n${(fs.statSync(out).size / 1024).toFixed(0)} KB -> ${path.relative(ROOT, out)}`);
