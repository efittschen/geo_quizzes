#!/usr/bin/env node
// One Mapillary photo for each sample point, as pick2.mjs, for dense countries too: the photos around each point are
// fetched in growing boxes (±0.0005°, about 55 m; then ±0.0025°; then ±0.005°, Mapillary's largest) only where the
// smaller box leaves no unused photo, so a city box never hits the 2,000-result cap unseen (a capped box is reported).
// Photos count only with quality ≥ 0.5 and taken 2021 or later. Per point: the nearest ring with an unused photo
// (50 m, 275 m, 550 m, 1.1 km), in it a 360° photo before a flat one and the higher quality first; a photo taken by
// another point only when no unused one is left. Text plays no part. Fields only, no images.
// Writes tools/cache/builds/mapillary/<cc>_picked_qy.json (candidates kept in <cc>_cands3.json).
//
//   node tools/builds/mapillary/pick3.mjs DE tools/cache/builds/mapillary/de_sample1000_qy.json
import fs from 'node:fs';
import path from 'node:path';
import { CACHE, sleep } from '../../lib/geo.mjs';

const [cc, src] = [process.argv[2].toUpperCase(), process.argv[3]];
const TOKEN = fs.readFileSync(path.join(CACHE, 'mapillary-token'), 'utf8').trim(), OUT = path.join(CACHE, 'builds', 'mapillary');
const points = JSON.parse(fs.readFileSync(src, 'utf8'));   // a point with lng null (no good track on its piece of land) gets no photo
const FIELDS = 'id,geometry,is_pano,quality_score,width,height,captured_at,compass_angle';
const SINCE = Date.UTC(2021, 0, 1), CAP = 2000;
const RAD = Math.PI / 180, m = (a, b) => 6371000 * Math.acos(Math.min(1, Math.sin(a[1] * RAD) * Math.sin(b[1] * RAD) + Math.cos(a[1] * RAD) * Math.cos(b[1] * RAD) * Math.cos((a[0] - b[0]) * RAD)));
const cfile = path.join(OUT, `${cc}_cands3.json`), cands = fs.existsSync(cfile) ? JSON.parse(fs.readFileSync(cfile, 'utf8')) : {};
const key = (p, h) => `${p.lng.toFixed(5)},${p.lat.toFixed(5)},${h}`;
let requests = 0, capped = 0;
const errors = [];
async function fetchBoxes(list, h) {
  let next = 0;
  await Promise.all(Array.from({ length: 20 }, async () => {
    while (next < list.length) {
      const p = list[next++], k = key(p, h);
      if (cands[k]) continue;
      const bbox = [p.lng - h, p.lat - h, p.lng + h, p.lat + h].map(v => v.toFixed(5)).join(',');
      requests++;
      const res = await fetch(`https://graph.mapillary.com/images?bbox=${bbox}&limit=${CAP}&fields=${FIELDS}`, { headers: { Authorization: `OAuth ${TOKEN}` } }).catch(e => ({ ok: false, statusText: e.message }));
      const j = res.ok ? await res.json() : await res.json?.().catch(() => null);
      if (!j || j.error) { errors.push(j?.error?.message || res.statusText); cands[k] = { error: true, data: [] }; continue; }
      if (j.data.length >= CAP) capped++;
      cands[k] = { capped: j.data.length >= CAP, data: j.data.map(x => ({ id: x.id, c: x.geometry.coordinates, q: x.quality_score, pano: x.is_pano, w: x.width, t: x.captured_at, dir: x.compass_angle })) };
      await sleep(80);
    }
  }));
  fs.writeFileSync(cfile, JSON.stringify(cands));
}
const BOXES = [0.0005, 0.0025, 0.005], RINGS = [50, 275, 550, 1100];
const distinct = [...new Map(points.filter(p => p.lng != null).map(p => [key(p, 0), p])).values()];
function choose() {
  const used = new Map();
  return points.map(p => {
    if (p.lng == null) return { ...p, photo: null, ring: null, shared: false };
    const all = BOXES.flatMap(h => cands[key(p, h)]?.data || []);
    const seen = new Set(), ph = all.filter(x => x.q >= 0.5 && x.t >= SINCE && !seen.has(x.id) && seen.add(x.id)).map(x => ({ ...x, m: m(x.c, [p.lng, p.lat]) }));
    const rank = (a, b) => (b.pano - a.pano) || (b.q - a.q);
    let pick = null, ring = null, shared = false;
    for (const r of RINGS) { const c = ph.filter(x => x.m <= r && !used.has(x.id)).sort(rank); if (c[0]) { pick = c[0]; ring = r; break; } }
    if (!pick && ph.length) { pick = ph.sort((a, b) => a.m - b.m)[0]; ring = RINGS.find(r => pick.m <= r) ?? null; shared = true; }
    if (pick) used.set(pick.id, (used.get(pick.id) || 0) + 1);
    return { ...p, photo: pick, ring, shared };
  });
}
const searched = {};
let picked = [];
for (const h of BOXES) {
  const todo = h === BOXES[0] ? distinct : distinct.filter(d => picked.some(p => p.lng != null && key(p, 0) === key(d, 0) && (!p.photo || p.shared)));
  searched[h] = todo.length;
  if (todo.length) await fetchBoxes(todo, h);
  picked = choose();
}
fs.writeFileSync(path.join(OUT, `${cc}_picked_qy.json`), JSON.stringify(picked));
const n = picked.length, f = c => picked.filter(c).length;
console.log(`${cc}: ${distinct.length} distinct points (${n} in all); box searches ${Object.entries(searched).map(([h, k]) => `${k} at ±${h}°`).join(', ')}; ${requests} requests, ${capped} hit the ${CAP} cap; ${errors.length} errors${errors.length ? ': ' + [...new Set(errors)].join('; ') : ''}`);
console.log(`with a photo (quality ≥ 0.5, 2021+): ${f(p => p.photo)} | shared with another point: ${f(p => p.shared)} | none: ${f(p => !p.photo)} (no good track on their piece of land: ${f(p => p.lng == null)})`);
for (const r of RINGS) console.log(`  found within ${r} m: ${f(p => p.photo && p.ring === r)}`);
console.log(`picked: 360° ${f(p => p.photo?.pano)}; distinct photos ${new Set(picked.filter(p => p.photo).map(p => p.photo.id)).size}`);
