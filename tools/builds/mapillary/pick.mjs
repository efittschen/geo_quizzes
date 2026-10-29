#!/usr/bin/env node
// One Mapillary photo for each sample point of a country (points on good tracks, see the sampling notes): a radius
// search of 50 m around the point, fields only (no images); of the photos with quality > 0.5 the nearest one not yet
// taken. Answers in tools/cache/builds/mapillary/<cc>_picked.json.
//
//   node tools/builds/mapillary/pick.mjs KE <points.json>
import fs from 'node:fs';
import path from 'node:path';
import { CACHE, sleep } from '../../lib/geo.mjs';

const [cc, src] = [process.argv[2].toUpperCase(), process.argv[3]];
const TOKEN = fs.readFileSync(path.join(CACHE, 'mapillary-token'), 'utf8').trim(), OUT = path.join(CACHE, 'builds', 'mapillary');
const points = JSON.parse(fs.readFileSync(src, 'utf8'));
const FIELDS = 'id,geometry,is_pano,camera_type,quality_score,width,height,captured_at,compass_angle';
const RAD = Math.PI / 180, m = (a, b) => 6371000 * Math.acos(Math.min(1, Math.sin(a[1] * RAD) * Math.sin(b[1] * RAD) + Math.cos(a[1] * RAD) * Math.cos(b[1] * RAD) * Math.cos((a[0] - b[0]) * RAD)));
const answers = new Array(points.length); let next = 0, errors = [];
await Promise.all(Array.from({ length: 4 }, async () => {
  while (next < points.length) {
    const i = next++, p = points[i];
    const res = await fetch(`https://graph.mapillary.com/images?lat=${p.lat}&lng=${p.lng}&radius=50&limit=100&fields=${FIELDS}`, { headers: { Authorization: `OAuth ${TOKEN}` } }).catch(e => ({ ok: false, statusText: e.message }));
    const j = res.ok ? await res.json() : null;
    if (!j || j.error) { errors.push(j?.error?.message || res.statusText); answers[i] = null; continue; }
    answers[i] = j.data;
    await sleep(80);
  }
}));
const taken = new Set(), picked = points.map((p, i) => {
  const ph = (answers[i] || []).filter(x => x.quality_score > 0.5 && !taken.has(x.id)).sort((a, b) => m(a.geometry.coordinates, [p.lng, p.lat]) - m(b.geometry.coordinates, [p.lng, p.lat]));
  if (ph[0]) taken.add(ph[0].id);
  return { ...p, found: (answers[i] || []).length, photo: ph[0] || null };
});
fs.writeFileSync(path.join(OUT, `${cc}_picked.json`), JSON.stringify(picked));
const cls = p => p.spawn_km <= 1 ? 'spawn ≤ 1 km' : p.spawn_km <= 10 ? 'spawn 1-10 km' : 'spawn > 10 km';
console.log(`${cc}: ${points.length} points, ${errors.length} errors${errors.length ? ': ' + [...new Set(errors)].join('; ') : ''}`);
for (const c of ['spawn ≤ 1 km', 'spawn 1-10 km', 'spawn > 10 km', 'all']) {
  const g = picked.filter(p => c === 'all' || cls(p) === c), n = g.length;
  console.log(`${c.padEnd(15)} ${String(n).padStart(4)} points | any photo within 50 m: ${Math.round(100 * g.filter(p => p.found).length / n)}% | a photo with quality > 0.5: ${Math.round(100 * g.filter(p => p.photo).length / n)}%`);
}
const ph = picked.filter(p => p.photo).map(p => p.photo);
console.log(`picked photos: ${ph.length}; 360°: ${Math.round(100 * ph.filter(x => x.is_pano).length / ph.length)}%; ≥ 1920 px: ${Math.round(100 * ph.filter(x => x.width >= 1920).length / ph.length)}%; years: ${JSON.stringify(ph.reduce((o, x) => { const y = new Date(x.captured_at).getFullYear(); o[y] = (o[y] || 0) + 1; return o; }, {}))}`);
