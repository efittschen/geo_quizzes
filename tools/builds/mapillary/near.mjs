#!/usr/bin/env node
// For the drawn coverage dots of a country (sample.py), the Mapillary photos within about 500 m of each: one box
// search (0.01° square around the dot; a coarse tile places its dots to about 300 m) per dot, fields only, no images.
// Answers kept in tools/cache/builds/mapillary/<cc>_near.json; the summary: dots with a photo of quality > 0.5 taken
// in 2018 or later, and with as many as the dot was drawn.
//
//   node tools/builds/mapillary/near.mjs KE
import fs from 'node:fs';
import path from 'node:path';
import { CACHE, sleep } from '../../lib/geo.mjs';

const cc = (process.argv[2] || '').toUpperCase(), lc = cc.toLowerCase();
const TOKEN = fs.readFileSync(path.join(CACHE, 'mapillary-token'), 'utf8').trim(), OUT = path.join(CACHE, 'builds', 'mapillary');
const dots = JSON.parse(fs.readFileSync(path.join(OUT, `${lc}_drawn.json`), 'utf8')); // [{lng, lat, draws}]
const file = path.join(OUT, `${cc}_near.json`), done = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
const FIELDS = 'id,geometry,is_pano,camera_type,quality_score,width,height,captured_at,compass_angle';
let next = 0, errors = [];
await Promise.all(Array.from({ length: 4 }, async () => {
  while (next < dots.length) {
    const d = dots[next++], key = `${d.lng.toFixed(4)},${d.lat.toFixed(4)}`;
    if (done[key]) continue;
    const bbox = [d.lng - 0.005, d.lat - 0.005, d.lng + 0.005, d.lat + 0.005].map(v => v.toFixed(5)).join(',');
    const res = await fetch(`https://graph.mapillary.com/images?bbox=${bbox}&limit=2000&fields=${FIELDS}`, { headers: { Authorization: `OAuth ${TOKEN}` } }).catch(e => ({ ok: false, statusText: e.message }));
    const j = res.ok ? await res.json() : await res.json?.().catch(() => null);
    if (!j || j.error) { errors.push(j?.error?.message || res.statusText); continue; }
    done[key] = { ...d, photos: j.data };
    await sleep(100);
  }
}));
fs.writeFileSync(file, JSON.stringify(done));
const good = x => x.quality_score > 0.5 && new Date(x.captured_at).getFullYear() >= 2018;
const all = Object.values(done), n = all.length, draws = all.reduce((a, d) => a + d.draws, 0);
const pct = (k, of) => `${k} (${Math.round(100 * k / of)}%)`;
console.log(`${cc}: ${n} dots searched, ${errors.length} errors${errors.length ? ': ' + [...new Set(errors)].join('; ') : ''}`);
console.log(`dots with any photo: ${pct(all.filter(d => d.photos.length).length, n)}`);
console.log(`dots with a good photo (quality > 0.5, 2018 or later): ${pct(all.filter(d => d.photos.some(good)).length, n)}`);
console.log(`draws that get their own good photo: ${pct(all.reduce((a, d) => a + Math.min(d.draws, d.photos.filter(good).length), 0), draws)} of ${draws}`);
const g = all.flatMap(d => d.photos.filter(good));
console.log(`good photos found: ${g.length}; 360°: ${Math.round(100 * g.filter(x => x.is_pano).length / Math.max(1, g.length))}%; width ≥ 1920 px: ${Math.round(100 * g.filter(x => x.width >= 1920).length / Math.max(1, g.length))}%; quality > 0.7: ${Math.round(100 * g.filter(x => x.quality_score > 0.7).length / Math.max(1, g.length))}%`);
const yrs = {}; for (const x of all.flatMap(d => d.photos)) { const y = new Date(x.captured_at).getFullYear(); yrs[y] = (yrs[y] || 0) + 1; }
console.log('all photos by year:', JSON.stringify(yrs));
