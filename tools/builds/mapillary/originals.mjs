#!/usr/bin/env node
// The original image of each photo in a list (e.g. <cc>_text_photos.json): one request for its link (thumb_original_url),
// then the file, into tools/cache/builds/mapillary/originals/<id>.jpg. Files already there are skipped.
//   node tools/builds/mapillary/originals.mjs tools/cache/builds/mapillary/KE_text_photos.json
import fs from 'node:fs';
import path from 'node:path';
import { CACHE, sleep } from '../../lib/geo.mjs';

const list = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const TOKEN = fs.readFileSync(path.join(CACHE, 'mapillary-token'), 'utf8').trim(), OUT = path.join(CACHE, 'builds', 'mapillary', 'originals');
fs.mkdirSync(OUT, { recursive: true });
let next = 0, done = 0, bytes = 0, errors = [];
const t0 = Date.now();
await Promise.all(Array.from({ length: 20 }, async () => {
  while (next < list.length) {
    const p = list[next++], file = path.join(OUT, `${p.id}.jpg`);
    if (fs.existsSync(file)) { done++; continue; }
    try {
      const j = await (await fetch(`https://graph.mapillary.com/${p.id}?fields=thumb_original_url`, { headers: { Authorization: `OAuth ${TOKEN}` } })).json();
      if (!j.thumb_original_url) throw new Error(j.error?.message || 'no link');
      const res = await fetch(j.thumb_original_url); if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer()); fs.writeFileSync(file + '.part', buf); fs.renameSync(file + '.part', file);
      bytes += buf.length; done++;
      if (done % 50 === 0) console.log(`${done}/${list.length}, ${(bytes / 1e6).toFixed(0)} MB, ${Math.round((Date.now() - t0) / 1000)} s`);
    } catch (e) { errors.push(`${p.id}: ${e.message}`); }
    await sleep(150);
  }
}));
console.log(`done ${done}/${list.length}, ${(bytes / 1e6).toFixed(0)} MB new, ${errors.length} errors${errors.length ? '\n' + errors.join('\n') : ''}`);
