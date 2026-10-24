#!/usr/bin/env node
// The towns lloyd.py chose that the country's old city list did not have (GeoNames ones), for a check by hand:
// name, region, population, point, and the nearest town of the old list.
//   node tools/builds/city-vali/new-towns.mjs [cc ...]   (default: every country with a result)
// Writes tools/cache/builds/city-vali/new-towns.tsv.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { ROOT, CACHE } from '../../lib/geo.mjs';

const WORK = path.join(CACHE, 'builds', 'city-vali'), RAD = Math.PI / 180;
const km = (a, b) => 6371 * Math.acos(Math.min(1, Math.sin(a.lat * RAD) * Math.sin(b.lat * RAD) + Math.cos(a.lat * RAD) * Math.cos(b.lat * RAD) * Math.cos((a.lng - b.lng) * RAD)));
const Qs = JSON.parse(fs.readFileSync(path.join(WORK, 'countries.json'), 'utf8'));
const want = process.argv.slice(2).map(s => s.toUpperCase());
const rows = [['cc', 'id', 'name', 'adm', 'pop', 'lat', 'lng', 'level', 'nearest old-list town', 'km'].join('\t')];
for (const Q of Qs) {
  if (want.length && !want.includes(Q.cc)) continue;
  const lf = path.join(WORK, `${Q.cc}_MovingWorld_200000_levels.json`);
  if (!fs.existsSync(lf)) continue;
  const L = JSON.parse(fs.readFileSync(lf, 'utf8')), T = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(WORK, `${Q.cc}_towns.json`), 'utf8')).towns.map(t => [t.id, t]));
  const ctx = {}; vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'quizzes', `${Q.slug}-cities`, 'cities.js'), 'utf8').replace('const CITIES', 'var CITIES'), ctx);
  const OLD = ctx.CITIES.list, have = new Set(OLD.map(c => c.id));
  for (const lv of L.levels) for (const id of lv.new) {
    if (have.has(id)) continue;
    const t = T[id], near = OLD.map(o => [o, km(o, t)]).sort((a, b) => a[1] - b[1])[0];
    rows.push([Q.cc, id, t.name, t.adm, t.pop, t.lat, t.lng, lv.k, `${near[0].en} (${near[0].pop})`, near[1].toFixed(0)].join('\t'));
  }
}
fs.writeFileSync(path.join(WORK, 'new-towns.tsv'), rows.join('\n') + '\n');
console.log(`${rows.length - 1} new towns -> ${path.relative(ROOT, path.join(WORK, 'new-towns.tsv'))}`);
