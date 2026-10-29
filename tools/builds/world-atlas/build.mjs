#!/usr/bin/env node
// world-atlas: the countries of the home, country and review pages' world map (data/site/world.json, WORLD_URL in
// assets/js/common.js). world-atlas's countries-110m, light enough for a phone, lacks the smallest countries (Malta,
// Andorra, San Marino, Liechtenstein, Singapore…), whose country pages then found no country. So this takes the
// 110m countries and adds, from countries-50m, every country 110m does not have, in one TopoJSON with the same object
// ("countries") and ids (ISO 3166-1 numeric) as world-atlas: the pages read it as before.
//
//   node tools/builds/world-atlas/build.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { topology } from 'topojson-server';
import { feature } from 'topojson-client';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const UA = 'GeoQuizzes/1.0 (geography quiz build script)';
const get = async res => (await fetch(`https://cdn.jsdelivr.net/npm/world-atlas@2/countries-${res}.json`, { headers: { 'User-Agent': UA } })).json();
const [small, large] = await Promise.all([get('110m'), get('50m')]);
const base = feature(small, small.objects.countries).features;
const have = new Set(base.map(f => f.id));
// (marked small: the home map fits its projection to the 110m countries alone, the one tools/coverage.mjs draws the
// roads on)
const added = feature(large, large.objects.countries).features.filter(f => f.id && !have.has(f.id))
  .map(f => ({ ...f, properties: { ...f.properties, small: true } }));
const world = topology({ countries: { type: 'FeatureCollection', features: [...base, ...added] } }, 1e5);
const out = path.join(ROOT, 'data', 'site', 'world.json');
fs.writeFileSync(out, JSON.stringify(world));
console.log(`${base.length} countries of 110m + ${added.length} of 50m (${added.map(f => f.properties.name).slice(0, 12).join(', ')}…) → ${path.relative(ROOT, out)}, ${Math.round(fs.statSync(out).size / 1024)} KB`);
