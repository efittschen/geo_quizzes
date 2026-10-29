#!/usr/bin/env node
// The towns lloyd.py may choose from, in one country, with covered road within 1 km of their point (2 or 5 km where
// more than 15% of them have none within 1 km: the pool is thin there, as in Laos or Korea, and a town without a pool
// location near it is mostly a gap in the pool):
//   every town of the country's city quiz as it was (its names, point and population, set right by hand, or taken
//   from a census where the quiz was built from one: Austria, Bangladesh, Nepal, South Korea, ...);
//   where that list was made from GeoNames (its towns have GeoNames IDs), also GeoNames populated places (PPL,
//   PPLA–PPLA4, PPLC, PPLG; not PPLX, parts of towns) of 10,000 people or more and the capitals of first-level regions;
//   where that gives fewer than 200 towns (twice the largest level), the floor goes down, to 5,000, 2,000 and at last
//   1,000 people, until it gives 200. Such a GeoNames town must lie 25 km or more from every larger town of the old
//   list: nearer, it is a suburb or a part of it (Logan City, Puente Alto, a second San José in Costa Rica, a
//   "Central Business District"), and the old list, checked by hand, has the town itself. Lists built from other sources get no GeoNames towns: their ids do not match,
//   and GeoNames is poorer there (Bangladesh: districts and unions as towns, with the population of a whole upazila).
// Left out of the GeoNames towns: what the country's city quiz left out by hand when it was made (tools/cities.mjs --exclude, e.g. the
// districts of Bangkok or Prague): a place larger than the smallest town on the quiz's old list (by 20%, as
// populations change) that is not on it and lies within 12 km of a larger town that is: a part of that town. (Without
// the 12 km, real towns go too: Wels, Wiener Neustadt, Jamalpur, where an old list was made from other numbers.) Not
// from a list in another order (the US one is by direction signs). And the hand corrections of tools/builds/city-coverage/build.mjs (US, Russia): kept the same;
// and the GeoNames towns a check by hand dropped (drop.json beside this file: per country, GeoNames ID -> reason).
//
//   node tools/builds/city-vali/towns.mjs <cc>
//
// Needs the coverage cache (tools/coverage.mjs fetch) and tools/cache/builds/city-vali/countries.json (the city
// quizzes: slug, iso3, cc). Writes tools/cache/builds/city-vali/<cc>_towns.json: the towns, the floor used, what was
// left out and why.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { ROOT, CACHE, cached, unzipText } from '../../lib/geo.mjs';

const HAND = {
  US: {
    out: [5110266, 5110302, 5125771, 5133273, 5139568, 4839745, 5052361, 4297999, 4300488, 4684724, 5509952],
    fix: { 4180531: { pop: 202081 } }, // Augusta GA: Augusta-Richmond County
  },
  RU: { out: [830844], fix: { 6313621: { lat: 43.1667, lng: 44.8 } } }, // Tryokhgorny (closed); Magas at its real place
};
const WORK = path.join(CACHE, 'builds', 'city-vali');
const cc = (process.argv[2] || '').toUpperCase();
const Q = JSON.parse(fs.readFileSync(path.join(WORK, 'countries.json'), 'utf8')).find(q => q.cc === cc);
if (!Q) { console.error('usage: towns.mjs <cc of a country with a city quiz>'); process.exit(1); }
const H = HAND[cc] || { out: [], fix: {} };
const DROP = JSON.parse(fs.readFileSync(new URL('drop.json', import.meta.url), 'utf8'))[cc] || {};
const FLOORS = [10000, 5000, 2000, 1000], ENOUGH = 200;

// the old list of the city quiz: what it left out by hand
// (the copy kept before quiz.mjs wrote the new list, tools/cache/builds/city-vali/old/; never the new list itself)
const oldFile = path.join(WORK, 'old', `${Q.slug}-cities.js`), quizFile = path.join(ROOT, 'data', 'maps', `${Q.slug}-cities`, 'cities.js');
const oldSrc = fs.readFileSync(fs.existsSync(oldFile) ? oldFile : quizFile, 'utf8');
if (oldSrc.includes('"A Moving World"')) { console.error(`${cc}: the quiz has the new list already and no copy of the old one is kept; ${cc}_towns.json stays as it is`); process.exit(1); }
const ctx = {}; vm.createContext(ctx);
vm.runInContext(oldSrc.replace('const CITIES', 'var CITIES'), ctx);
const OLD = new Map(ctx.CITIES.list.map(c => [c.id, c]));
const oldTowns = ctx.CITIES.list.map(c => ({ id: c.id, name: c.en, lat: c.lat, lng: c.lng, fc: c.fc || 'PPL', adm: c.adm, pop: c.pop || 0 }));
const oldFloor = Math.min(...ctx.CITIES.list.filter(c => c.fc !== 'PPLA' && c.fc !== 'PPLC').map(c => c.pop));

const KEEP = new Set(['PPL', 'PPLA', 'PPLA2', 'PPLA3', 'PPLA4', 'PPLC', 'PPLG']), isCapital = p => p.fc === 'PPLA' || p.fc === 'PPLC';
const dump = unzipText(await cached(`https://download.geonames.org/export/dump/${cc}.zip`, `geonames_${cc}.zip`), `${cc}.txt`);
let places = [];
const left = { hand: [], quiz: [], near: 0 };
for (const line of dump.split('\n')) {
  const c = line.split('\t');
  if (c.length < 15 || c[6] !== 'P' || c[8] !== cc || !KEEP.has(c[7])) continue;
  const p = { id: c[0], name: c[1], lat: +c[4], lng: +c[5], fc: c[7], adm: c[10], pop: +c[14] };
  Object.assign(p, H.fix[p.id]);
  if (H.out.includes(+p.id) || DROP[p.id]) { left.hand.push(p.name); continue; }
  if (OLD.has(p.id)) continue; // (the quiz's own entry is taken)
  if (p.pop > oldFloor * 1.2 && !isCapital(p)) left.quiz.push(p);
  places.push(p);
}
const kmTo = (a, b) => 6371 * Math.acos(Math.min(1, Math.sin(a.lat * RAD) * Math.sin(b.lat * RAD) + Math.cos(a.lat * RAD) * Math.cos(b.lat * RAD) * Math.cos((a.lng - b.lng) * RAD)));
const RAD = Math.PI / 180, oldList = [...OLD.values()];
const geoAt = new Map(); for (const line of dump.split('\n')) { const c = line.split('\t'); if (OLD.has(c[0])) geoAt.set(c[0], { lat: +c[4], lng: +c[5] }); }
// the old list is from GeoNames if its ids are GeoNames places at its points (Japan's numbers are municipality codes)
const fromGeo = ctx.CITIES.list.filter(c => geoAt.has(c.id) && kmTo(geoAt.get(c.id), c) < 25).length >= 0.9 * OLD.size;
if (!fromGeo) places = [];
left.quiz = left.quiz.filter(p => oldList.some(o => o.pop > p.pop && kmTo(o, p) <= 12));
left.near = places.filter(p => oldList.some(o => o.pop > p.pop && kmTo(o, p) < 25)).length;
places = places.filter(p => !oldList.some(o => o.pop > p.pop && kmTo(o, p) < 25));
const fromQuiz = fromGeo && !ctx.CITIES.order;
if (fromQuiz) { const out = new Set(left.quiz.map(p => p.id)); places = places.filter(p => !out.has(p.id)); }
left.quiz = fromQuiz ? left.quiz.map(p => `${p.name} ${p.pop}`) : [];
// covered squares of about 330 m, as in build.mjs, in the box of the places (not of the pool: a pool file can hold a
// stray point on another continent); across 180° the west longitudes count past 180
const index = JSON.parse(fs.readFileSync(path.join(CACHE, 'coverage', 'index.json'), 'utf8'));
const files = Object.entries(index).filter(([k]) => k.startsWith(cc + '/'));
const ext = (a, f) => a.reduce(([lo, hi], p) => [Math.min(lo, f(p)), Math.max(hi, f(p))], [Infinity, -Infinity]);
const all = [...oldTowns, ...places];
const [w0, w1] = ext(all, p => p.lng), wrapped = w1 - w0 > 180;
const [l0, l1] = ext(all, p => (wrapped && p.lng < 0 ? p.lng + 360 : p.lng)), [a0, a1] = ext(all, p => p.lat);
const LNG0 = l0 - 0.1, LNG1 = l1 + 0.1, LAT0 = a0 - 0.1, LAT1 = a1 + 0.1;
const DLAT = 0.003, DLNG = 0.004;
const rows = Math.ceil((LAT1 - LAT0) / DLAT), cols = Math.ceil((LNG1 - LNG0) / DLNG), covered = new Uint8Array(Math.ceil(rows * cols / 8));
const lngOf = l => (wrapped && l < 0 ? l + 360 : l);
for (const [key] of files) {
  const b = fs.readFileSync(path.join(CACHE, 'coverage', key.replace(/\.zip$/, '.loc'))), n = b.readUInt32LE(4);
  const ll = new Float32Array(b.buffer.slice(b.byteOffset + 16, b.byteOffset + 16 + 8 * n));
  for (let i = 0; i < n; i++) {
    const r = Math.floor((ll[2 * i] - LAT0) / DLAT), c = Math.floor((lngOf(ll[2 * i + 1]) - LNG0) / DLNG);
    if (r >= 0 && r < rows && c >= 0 && c < cols) { const k = r * cols + c; covered[k >> 3] |= 1 << (k & 7); }
  }
}
function roadNear(lat, lng, km) {
  const dr = Math.ceil(km / 111.2 / DLAT), kx = 111.2 * Math.cos(lat * RAD), dc = Math.ceil(km / kx / DLNG), r0 = Math.floor((lat - LAT0) / DLAT), c0 = Math.floor((lngOf(lng) - LNG0) / DLNG);
  for (let r = Math.max(0, r0 - dr); r <= Math.min(rows - 1, r0 + dr); r++) for (let c = Math.max(0, c0 - dc); c <= Math.min(cols - 1, c0 + dc); c++) {
    if (((r - r0) * DLAT * 111.2) ** 2 + ((c - c0) * DLNG * kx) ** 2 > km * km) continue;
    const k = r * cols + c; if (covered[k >> 3] & (1 << (k & 7))) return true;
  }
  return false;
}

let floor, towns, away, near;
for (floor of FLOORS) {
  const cand = [...oldTowns, ...places.filter(p => p.pop >= floor || isCapital(p))];
  for (near of [1, 2, 5]) {
    towns = cand.filter(p => ((p.near ??= {})[near] ??= roadNear(p.lat, p.lng, near)));
    away = cand.length - towns.length;
    if (away <= 0.15 * cand.length) break;
  }
  if (towns.length >= ENOUGH) break;
}
const out = path.join(WORK, `${cc}_towns.json`);
fs.mkdirSync(WORK, { recursive: true });
fs.writeFileSync(out, JSON.stringify({ cc, slug: Q.slug, floor: fromGeo ? floor : null, near, fromGeo, fromQuiz, towns: towns.map(({ near, ...t }) => t), left }));
console.log(`${cc}: ${towns.length} towns (${OLD.size} on the old list${fromGeo ? `, GeoNames ones of ${floor}+ people` : ', no GeoNames ones: the list is not from GeoNames'}${fromGeo ? `, ${left.near} within 25 km of a larger one left out` : ''}; road within ${near} km, ${away} without)${fromQuiz ? `; left out as the quiz did: ${left.quiz.length}` : ''}${left.hand.length ? `, by hand: ${left.hand.length}` : ''}`);
