#!/usr/bin/env node
// Which picked photos has Mapillary analysed? For each distinct photo of <cc>_picked2.json: its detections (label and
// when the detection was made), one request per photo, no images. Kept in tools/cache/builds/mapillary/<cc>_detections.json.
//   node tools/builds/mapillary/detections.mjs KE [picked file, default <cc>_picked2.json]
import fs from 'node:fs';
import path from 'node:path';
import { CACHE, sleep } from '../../lib/geo.mjs';

const cc = process.argv[2].toUpperCase(), OUT = path.join(CACHE, 'builds', 'mapillary');
const TOKEN = fs.readFileSync(path.join(CACHE, 'mapillary-token'), 'utf8').trim();
const photos = [...new Map(JSON.parse(fs.readFileSync(path.join(OUT, process.argv[3] || `${cc}_picked2.json`), "utf8")).filter(p => p.photo).map(p => [p.photo.id, p.photo])).values()];
const file = path.join(OUT, `${cc}_detections.json`), det = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
let next = 0, errors = [];
await Promise.all(Array.from({ length: 20 }, async () => {
  while (next < photos.length) {
    const ph = photos[next++];
    if (det[ph.id]) continue;
    const res = await fetch(`https://graph.mapillary.com/${ph.id}/detections?fields=value,created_at`, { headers: { Authorization: `OAuth ${TOKEN}` } }).catch(e => ({ ok: false, statusText: e.message }));
    const j = res.ok ? await res.json() : null;
    if (!j || j.error) { errors.push(j?.error?.message || res.statusText); continue; }
    const counts = {}; for (const d of j.data) counts[d.value] = (counts[d.value] || 0) + 1;
    det[ph.id] = { n: j.data.length, counts, made: j.data.map(d => d.created_at).sort()[0] || null };
    await sleep(60);
  }
}));
fs.writeFileSync(file, JSON.stringify(det));
console.log(`${cc}: ${photos.length} photos, ${errors.length} errors${errors.length ? ': ' + [...new Set(errors)].join('; ') : ''}`);
