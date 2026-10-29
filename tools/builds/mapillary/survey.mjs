#!/usr/bin/env node
// Is there a Mapillary photo where the map drops you? For a sample of simulated spawns of a country
// (tools/builds/city-vali/simulate.mjs), the photos Mapillary has within 50 m of each: one radius search per spawn,
// fields only (no images). Answers kept in tools/cache/builds/mapillary/<cc>_survey.json; the summary splits the
// spawns by setting: in town (a town of the city-vali candidates within 2 km), near town (2-10 km), remote.
//
//   node tools/builds/mapillary/survey.mjs DE [--n 300] [--seed 1]
//
// Needs the token in tools/cache/mapillary-token (a Mapillary client token, read access).
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { CACHE, sleep } from '../../lib/geo.mjs';

const { values: o, positionals: [arg] } = parseArgs({ allowPositionals: true, options: { n: { type: 'string', default: '300' }, seed: { type: 'string', default: '1' } } });
const cc = (arg || '').toUpperCase(), N = +o.n;
const TOKEN = fs.readFileSync(path.join(CACHE, 'mapillary-token'), 'utf8').trim();
const V = path.join(CACHE, 'builds', 'city-vali'), OUT = path.join(CACHE, 'builds', 'mapillary');
fs.mkdirSync(OUT, { recursive: true });
const ll = new Float32Array(fs.readFileSync(path.join(V, `${cc}_MovingWorld_200000.bin`)).buffer.slice(0));
const towns = JSON.parse(fs.readFileSync(path.join(V, `${cc}_towns.json`), 'utf8')).towns;
let s = +o.seed; const rnd = () => ((s = Math.imul(s ^ (s >>> 15), 2246822507) + 0x6d2b79f5 | 0) >>> 0) / 4294967296;
const RAD = Math.PI / 180, km = (a, b) => 6371 * Math.acos(Math.min(1, Math.sin(a.lat * RAD) * Math.sin(b.lat * RAD) + Math.cos(a.lat * RAD) * Math.cos(b.lat * RAD) * Math.cos((a.lng - b.lng) * RAD)));
const spawns = Array.from({ length: N }, () => { const i = Math.floor(rnd() * ll.length / 2); return { lat: ll[2 * i], lng: ll[2 * i + 1] }; });
for (const p of spawns) { const d = Math.min(...towns.map(t => km(p, t))); p.setting = d < 2 ? 'in town' : d < 10 ? 'near town' : 'remote'; }

const FIELDS = 'id,geometry,is_pano,camera_type,quality_score,width,height,captured_at,compass_angle';
const file = path.join(OUT, `${cc}_survey.json`), done = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
let next = 0, errors = 0;
await Promise.all(Array.from({ length: 4 }, async () => {
  while (next < spawns.length) {
    const p = spawns[next++], key = `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`;
    if (done[key]) { p.photos = done[key].photos; continue; }
    const url = `https://graph.mapillary.com/images?lat=${p.lat}&lng=${p.lng}&radius=50&limit=100&fields=${FIELDS}`;
    const res = await fetch(url, { headers: { Authorization: `OAuth ${TOKEN}` } }).catch(e => ({ ok: false, statusText: e.message }));
    const j = res.ok ? await res.json() : null;
    if (!j || j.error) { errors++; p.error = j?.error?.message || res.statusText; continue; }
    p.photos = j.data; done[key] = { setting: p.setting, photos: j.data };
    await sleep(100);
  }
}));
fs.writeFileSync(file, JSON.stringify(done));

// summary
const yr = x => new Date(x.captured_at).getFullYear();
const rows = [['setting', 'spawns', 'any photo', '360°', 'forward-facing', 'quality ≥ 0.5', '≥ 1920 px wide', 'since 2018', 'good: ≥0.5, ≥1920 px, since 2018']];
for (const set of ['in town', 'near town', 'remote', 'all']) {
  const g = spawns.filter(p => p.photos && (set === 'all' || p.setting === set)), n = g.length, pct = f => n ? `${Math.round(100 * g.filter(f).length / n)}%` : '-';
  const has = c => p => p.photos.some(c);
  rows.push([set, n, pct(p => p.photos.length), pct(has(x => x.is_pano)), pct(has(x => !x.is_pano)), pct(has(x => x.quality_score >= 0.5)), pct(has(x => x.width >= 1920)), pct(has(x => yr(x) >= 2018)), pct(has(x => x.quality_score >= 0.5 && x.width >= 1920 && yr(x) >= 2018))]);
}
console.log(`${cc}: ${spawns.length} spawns, ${errors} errors${errors ? ' (' + [...new Set(spawns.filter(p => p.error).map(p => p.error))].join('; ') + ')' : ''}`);
for (const r of rows) console.log(r.map((v, i) => String(v).padEnd(i ? 15 : 10)).join(''));
