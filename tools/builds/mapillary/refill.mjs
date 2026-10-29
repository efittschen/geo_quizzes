#!/usr/bin/env node
// For the sample points of pick.mjs without a photo of quality ≥ 0.5 within 50 m (none at all, or only worse ones):
// a box search of ±0.0025° (about 550 m across; --half 0.005 for Mapillary's largest box, about 1.1 km) around each, fields only (no images); the nearest photo of quality
// ≥ 0.5 not yet taken. Updates tools/cache/builds/mapillary/<cc>_picked.json (photo, and its distance in m).
//
//   node tools/builds/mapillary/refill.mjs KE [--half 0.0025]
import fs from 'node:fs';
import path from 'node:path';
import { CACHE, sleep } from '../../lib/geo.mjs';

const HALF = process.argv.includes('--half') ? +process.argv[process.argv.indexOf('--half') + 1] : 0.0025;
const cc = process.argv[2].toUpperCase(), OUT = path.join(CACHE, 'builds', 'mapillary'), file = path.join(OUT, `${cc}_picked.json`);
const TOKEN = fs.readFileSync(path.join(CACHE, 'mapillary-token'), 'utf8').trim();
const picked = JSON.parse(fs.readFileSync(file, 'utf8'));
const FIELDS = 'id,geometry,is_pano,camera_type,quality_score,width,height,captured_at,compass_angle';
const RAD = Math.PI / 180, m = (a, b) => 6371000 * Math.acos(Math.min(1, Math.sin(a[1] * RAD) * Math.sin(b[1] * RAD) + Math.cos(a[1] * RAD) * Math.cos(b[1] * RAD) * Math.cos((a[0] - b[0]) * RAD)));
const taken = new Set(picked.filter(p => p.photo).map(p => p.photo.id));
const todo = picked.map((p, i) => i).filter(i => !picked[i].photo);
const answers = {}; let next = 0, errors = [];
await Promise.all(Array.from({ length: 4 }, async () => {
  while (next < todo.length) {
    const i = todo[next++], p = picked[i];
    const bbox = [p.lng - HALF, p.lat - HALF, p.lng + HALF, p.lat + HALF].map(v => v.toFixed(5)).join(',');
    const res = await fetch(`https://graph.mapillary.com/images?bbox=${bbox}&limit=2000&fields=${FIELDS}`, { headers: { Authorization: `OAuth ${TOKEN}` } }).catch(e => ({ ok: false, statusText: e.message }));
    const j = res.ok ? await res.json() : null;
    if (!j || j.error) { errors.push(j?.error?.message || res.statusText); continue; }
    answers[i] = j.data;
    await sleep(80);
  }
}));
let filled = 0, any = 0;
for (const i of todo) {
  const p = picked[i], ph = (answers[i] || []).filter(x => x.quality_score >= 0.5 && !taken.has(x.id)).map(x => ({ ...x, m: m(x.geometry.coordinates, [p.lng, p.lat]) })).sort((a, b) => a.m - b.m);
  if ((answers[i] || []).length) any++;
  if (ph[0]) { taken.add(ph[0].id); p.photo = ph[0]; p.box = true; filled++; }
}
fs.writeFileSync(file, JSON.stringify(picked));
const d = picked.filter(p => p.box).map(p => p.photo.m).sort((a, b) => a - b);
console.log(`${cc}: ${todo.length} points searched, ${errors.length} errors${errors.length ? ': ' + [...new Set(errors)].join('; ') : ''}; any photo in the box: ${any}; filled with quality ≥ 0.5: ${filled}${d.length ? ` (distance to the point: median ${Math.round(d[d.length >> 1])} m, max ${Math.round(d.at(-1))} m)` : ''}`);
console.log(`now ${picked.filter(p => p.photo).length} of ${picked.length} points have a photo`);
