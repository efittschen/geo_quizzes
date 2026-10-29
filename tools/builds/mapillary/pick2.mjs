#!/usr/bin/env node
// One Mapillary photo for each sample point (points on good tracks): the photos around each point, fetched once and
// kept (tools/cache/builds/mapillary/<cc>_cands.json: a box of ±0.0025°, about 550 m; where that leaves no unused
// photo of quality ≥ 0.5, also ±0.005°, Mapillary's largest), fields only, no images. Then per point: the nearest ring
// with an unused photo of quality ≥ 0.5 (within 50 m, 275 m, 550 m, 1.1 km), in it a 360° photo before a flat one and
// the higher quality first; a photo taken by another point only when no unused one is left in any ring.
// Writes tools/cache/builds/mapillary/<cc>_picked2.json.
//
//   node tools/builds/mapillary/pick2.mjs KE <points.json>
import fs from 'node:fs';
import path from 'node:path';
import { CACHE, sleep } from '../../lib/geo.mjs';

const [cc, src] = [process.argv[2].toUpperCase(), process.argv[3]];
const TOKEN = fs.readFileSync(path.join(CACHE, 'mapillary-token'), 'utf8').trim(), OUT = path.join(CACHE, 'builds', 'mapillary');
const points = JSON.parse(fs.readFileSync(src, 'utf8'));
const FIELDS = 'id,geometry,is_pano,camera_type,quality_score,width,height,captured_at,compass_angle,sequence';
const RAD = Math.PI / 180, m = (a, b) => 6371000 * Math.acos(Math.min(1, Math.sin(a[1] * RAD) * Math.sin(b[1] * RAD) + Math.cos(a[1] * RAD) * Math.cos(b[1] * RAD) * Math.cos((a[0] - b[0]) * RAD)));
const cfile = path.join(OUT, `${cc}_cands.json`), cands = fs.existsSync(cfile) ? JSON.parse(fs.readFileSync(cfile, 'utf8')) : {};
const key = (p, h) => `${p.lng.toFixed(5)},${p.lat.toFixed(5)},${h}`;
async function fetchBoxes(list, h) {
  let next = 0, errors = [];
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (next < list.length) {
      const p = list[next++], k = key(p, h);
      if (cands[k]) continue;
      const bbox = [p.lng - h, p.lat - h, p.lng + h, p.lat + h].map(v => v.toFixed(5)).join(',');
      const res = await fetch(`https://graph.mapillary.com/images?bbox=${bbox}&limit=2000&fields=${FIELDS}`, { headers: { Authorization: `OAuth ${TOKEN}` } }).catch(e => ({ ok: false, statusText: e.message }));
      const j = res.ok ? await res.json() : await res.json?.().catch(() => null);
      if (!j || j.error) { errors.push(j?.error?.message || res.statusText); cands[k] = { error: true, data: [] }; continue; }
      cands[k] = { data: j.data.map(x => ({ id: x.id, c: x.geometry.coordinates, q: x.quality_score, pano: x.is_pano, w: x.width, t: x.captured_at, dir: x.compass_angle })) };
      await sleep(80);
    }
  }));
  fs.writeFileSync(cfile, JSON.stringify(cands));
  return errors;
}
const distinct = [...new Map(points.map(p => [key(p, 0), p])).values()];
let errs = await fetchBoxes(distinct, 0.0025);
const RINGS = [50, 275, 550, 1100];
function choose(useBig) {
  const used = new Map();
  return points.map(p => {
    const all = [...(cands[key(p, 0.0025)]?.data || []), ...(useBig ? cands[key(p, 0.005)]?.data || [] : [])];
    const seen = new Set(), ph = all.filter(x => x.q >= 0.5 && !seen.has(x.id) && seen.add(x.id)).map(x => ({ ...x, m: m(x.c, [p.lng, p.lat]) }));
    const rank = (a, b) => (b.pano - a.pano) || (b.q - a.q);
    let pick = null, ring = null;
    for (const r of RINGS) { const c = ph.filter(x => x.m <= r && !used.has(x.id)).sort(rank); if (c[0]) { pick = c[0]; ring = r; break; } }
    let shared = false;
    if (!pick && ph.length) { pick = ph.sort((a, b) => a.m - b.m)[0]; ring = RINGS.find(r => pick.m <= r); shared = true; }
    if (pick) used.set(pick.id, (used.get(pick.id) || 0) + 1);
    return { ...p, photo: pick, ring, shared };
  });
}
let picked = choose(false);
const short = distinct.filter(d => picked.some(p => key(p, 0) === key(d, 0) && (!p.photo || p.shared)));
if (short.length) errs = errs.concat(await fetchBoxes(short, 0.005));
picked = choose(true);
fs.writeFileSync(path.join(OUT, `${cc}_picked2.json`), JSON.stringify(picked));
const n = picked.length, f = c => picked.filter(c).length;
console.log(`${cc}: ${distinct.length} distinct points (${n} in all); box searches: ${distinct.length} at 550 m, ${short.length} at 1.1 km; ${errs.length} errors${errs.length ? ': ' + [...new Set(errs)].join('; ') : ''}`);
console.log(`with a photo of quality ≥ 0.5: ${f(p => p.photo)} | shared with another point: ${f(p => p.shared)} | none: ${f(p => !p.photo)}`);
for (const r of RINGS) console.log(`  found within ${r} m: ${f(p => p.photo && p.ring === r)}`);
const ph = picked.filter(p => p.photo).map(p => p.photo);
console.log(`picked: 360° ${f(p => p.photo?.pano)}; quality ≥ 0.7: ${ph.filter(x => x.q >= 0.7).length}, ≥ 0.8: ${ph.filter(x => x.q >= 0.8).length}`);
