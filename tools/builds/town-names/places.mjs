#!/usr/bin/env node
// places: a country's places for ratio.py: names, lat/lng, position on the quiz map (from its cities.js), the map's
// outline (land) and its neighbours (ctx), and the parts its town-name quiz asks now. Places off the map (insets:
// Alaska, the Azores) are left out as in tools/townnames.mjs, so both see the same places in the same order.
//   node tools/builds/town-names/places.mjs <slug> <ISO2> <out.json>
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { geoConicEqualArea } from 'd3-geo';
import { ROOT, projectionFrom } from '../../lib/geo.mjs';
import { loadPlaces } from '../../lib/names.mjs';

const [slug, CC, out] = process.argv.slice(2), t0 = Date.now();
const MAP = vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'quizzes', `${slug}-cities`, 'cities.js'), 'utf8') + ';CITIES');
// An Albers USA map by its lower-48 part, as tools/townnames.mjs reads it (Alaska and Hawaii are insets there).
const proj = MAP.proj.type === 'albersUsa' ? geoConicEqualArea().parallels([29.5, 45.5]).rotate([96, 0]).center([-0.6, 38.7]).scale(MAP.proj.scale).translate(MAP.proj.translate) : projectionFrom(MAP.proj);
const places = (await loadPlaces(CC)).filter(p => { [p.x, p.y] = proj([p.lng, p.lat]); return p.x >= 0 && p.x <= MAP.w && p.y >= 0 && p.y <= MAP.h; });
const quizFile = path.join(ROOT, 'quizzes', `${slug}-town-names`, 'names.js');
const quiz = fs.existsSync(quizFile) ? vm.runInNewContext(fs.readFileSync(quizFile, 'utf8') + ';NAMES').parts.map(p => p.label) : [];
fs.writeFileSync(out, JSON.stringify({ country: MAP.country, w: MAP.w, h: MAP.h, land: MAP.land, ctx: MAP.ctx || '', quiz, names: places.map(p => p.name), ll: places.map(p => [+p.lat.toFixed(5), +p.lng.toFixed(5)]), xy: places.map(p => [Math.round(p.x), Math.round(p.y)]) }));
console.log(`${MAP.country}: ${places.length} places -> ${path.relative(ROOT, out)} (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
