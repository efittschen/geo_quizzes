#!/usr/bin/env node
// places: a country's places for ratio.py: names, lat/lng, position on the quiz map (from its city list,
// data/maps/<slug>-cities/cities.js), the map's outline (land) and its neighbours' land (ctx: the world's map,
// data/maps/world/world.js, laid under it as the pages lay it, without the country), and the parts its town-name quiz
// asks now (data/maps/<slug>-town-names/names.js). Places off the map are left out as in tools/townnames.mjs, so both
// see the same places in the same order.
//   node tools/builds/town-names/places.mjs <slug> <ISO2> <out.json>
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { ROOT, projectionFrom } from '../../lib/geo.mjs';
import { loadPlaces } from '../../lib/names.mjs';

const [slug, CC, out] = process.argv.slice(2), t0 = Date.now();
const read = (file, name) => vm.runInNewContext(fs.readFileSync(path.join(ROOT, file), 'utf8') + ';' + name);
const MAP = read(`data/maps/${slug}-cities/cities.js`, 'CITIES'), proj = projectionFrom(MAP.proj);
// the neighbours' land: every place of the world's map but the country, moved onto this map (engine/lib/mercator.js world())
const WORLD = read('data/maps/world/world.js', 'WORLD'), MERCATOR = read('engine/lib/mercator.js', 'MERCATOR'), PAD = 50;
const ctx = MERCATOR.world(WORLD, MAP.proj, MAP.w).flatMap(([s, dx, dy]) => WORLD.reg.filter(r => r.a && r.id !== MAP.iso3).flatMap(r => r.d.split('M').filter(Boolean).map(ring => {
  const pts = ring.replace('Z', '').split('L').map(t => t.split(',').map(Number)).map(([x, y]) => [x * s + dx, y * s + dy]);
  const out = pts.every(([x]) => x < -PAD) || pts.every(([x]) => x > MAP.w + PAD) || pts.every(([, y]) => y < -PAD) || pts.every(([, y]) => y > MAP.h + PAD);
  return out ? '' : 'M' + pts.map(([x, y]) => `${+x.toFixed(1)},${+y.toFixed(1)}`).join('L') + 'Z';
}))).join('');
const places = (await loadPlaces(CC)).filter(p => { [p.x, p.y] = proj([p.lng, p.lat]); return p.x >= 0 && p.x <= MAP.w && p.y >= 0 && p.y <= MAP.h; });
const quizFile = path.join(ROOT, 'data', 'maps', `${slug}-town-names`, 'names.js');
const quiz = fs.existsSync(quizFile) ? vm.runInNewContext(fs.readFileSync(quizFile, 'utf8') + ';NAMES').parts.map(p => p.label) : [];
fs.writeFileSync(out, JSON.stringify({ country: MAP.country, w: MAP.w, h: MAP.h, land: MAP.land, ctx, quiz, names: places.map(p => p.name), ll: places.map(p => [+p.lat.toFixed(5), +p.lng.toFixed(5)]), xy: places.map(p => [Math.round(p.x), Math.round(p.y)]) }));
console.log(`${MAP.country}: ${places.length} places -> ${path.relative(ROOT, out)} (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
