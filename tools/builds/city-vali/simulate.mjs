#!/usr/bin/env node
// Where the locations of a map made with Vali fall in one country: Vali's standard method run again on the
// coverage cache, many times over, for optimize.py.
//
//   node tools/builds/city-vali/simulate.mjs <cc> [--map MovingWorld] [--total 200000] [--spawns 100000] [--jobs 8]
//
// Vali (github.com/slashP/Vali), "FixedCountByMaxMinDistance", as LocationDistributor.WithMaxMinDistance has it:
//   the country's count is the map's total × its share of the map (Weights.cs, e.g. MovingWorld);
//   a region's count is the country's × the region's weight over those of all regions in the pool (SubdivisionWeights.cs,
//   Vali's default: a map maker can set others, and nobody knows whether the makers of the big maps did);
//   in each region the pool is shuffled, and locations are placed in that order, each one at least d from those placed
//   before it, until the region's count is reached; d is the largest of Vali's distances (25 m to 75 km) at which it is.
// So a region's locations are spread over its covered land, as far apart as they can be, not over its streets.
// Runs: as many as give --spawns locations in all (at least 20, at most 400), so a small country, where the map puts
// a few dozen locations, still has a smooth density. A pool location far outside its region (a stray point, as one in
// Mississippi's file that lies in Japan: beyond the region's middle 99.8% by 1°) is left out.
// Not done here: Vali's filters on what the cache does not keep (tunnels, road types, ...), so the map is one made
// without filters. Distances as Vali measures them (flat, by the cosine of the middle latitude).
//
// Writes tools/cache/builds/city-vali/<cc>_<map>_<total>.bin, the runs one after the other, each its locations as
// float32 lat, lng; and .json beside it: the count of each run, and per region its count and spacing in each run.
import fs from 'node:fs';
import path from 'node:path';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { parseArgs } from 'node:util';
import { CACHE, cached } from '../../lib/geo.mjs';

const DISTANCES = [25, 50, 75, 100, 125, 150, 175, 200, 225, 250, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000, 1250, 1500, 1750, 2000, 2250, 2500, 2750, 3000, 3300, 3600, 3900, 4200, 4500, 5000, 6000, 7000, 8000, 9000, 10000, 12500, 15000, 20000, 25000, 30000, 35000, 40000, 45000, 50000, 55000, 60000, 65000, 70000, 75000];
const M_PER_DEG = 6371137 * Math.PI / 180; // as Vali's LocationDistributor and Extensions

/* ---------- one run: every region, as Vali does it ---------- */
// a seeded shuffle, so a run can be made again (Vali's own is not seeded)
const rng = seed => () => { seed |= 0; seed = seed + 0x6d2b79f5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

// PlaceSpaced: in the order given, each point at least d from those placed; stops at the goal
function place(ll, order, goal, d, box) {
  const cosRef = Math.max(Math.cos(Math.min(Math.max(Math.abs(box[0]), Math.abs(box[1])), 89) * Math.PI / 180), 1e-6);
  const cLat = d / M_PER_DEG, cLng = d / (M_PER_DEG * cosRef), d2 = d * d;
  const x0 = Math.floor(box[2] / cLng) - 1, y0 = Math.floor(box[0] / cLat) - 1, nx = Math.floor(box[3] / cLng) - x0 + 2, ny = Math.floor(box[1] / cLat) - y0 + 2;
  const grid = nx * ny <= 8e6 ? new Int32Array(nx * ny).fill(-1) : null, far = grid ? null : new Map(); // cell -> last placed in it
  const next = [], out = [];
  const head = k => grid ? grid[k] : (far.get(k) ?? -1);
  for (let i = 0; i < order.length && out.length < goal; i++) {
    const j = order[i], lat = ll[2 * j], lng = ll[2 * j + 1], cx = Math.floor(lng / cLng) - x0, cy = Math.floor(lat / cLat) - y0;
    let ok = true;
    for (let dx = -1; dx <= 1 && ok; dx++) for (let dy = -1; dy <= 1 && ok; dy++) {
      for (let p = head((cx + dx) * ny + cy + dy); p >= 0; p = next[p]) {
        const q = out[p], dlat = ll[2 * q] - lat;
        if (dlat * dlat > d2 / (M_PER_DEG * M_PER_DEG)) continue;
        const x = (ll[2 * q + 1] - lng) * Math.cos((ll[2 * q] + lat) * Math.PI / 360);
        if (M_PER_DEG * M_PER_DEG * (x * x + dlat * dlat) < d2) { ok = false; break; }
      }
    }
    if (!ok) continue;
    const k = cx * ny + cy;
    next.push(head(k)); out.push(j);
    if (grid) grid[k] = out.length - 1; else far.set(k, out.length - 1);
  }
  return out;
}

// WithMaxMinDistance: the largest distance whose count reaches the goal, by bisection from a guess
function region(ll, n, goal, seed) {
  const order = new Uint32Array(n);
  for (let i = 0; i < n; i++) order[i] = i;
  const r = rng(seed);
  for (let i = n - 1; i > 0; i--) { const k = Math.floor(r() * (i + 1)); const t = order[i]; order[i] = order[k]; order[k] = t; }
  const box = [Infinity, -Infinity, Infinity, -Infinity];
  for (let i = 0; i < n; i++) { const a = ll[2 * i], b = ll[2 * i + 1]; if (a < box[0]) box[0] = a; if (a > box[1]) box[1] = a; if (b < box[2]) box[2] = b; if (b > box[3]) box[3] = b; }
  const h = (box[1] - box[0]) * M_PER_DEG, w = (box[3] - box[2]) * M_PER_DEG * Math.cos((box[0] + box[1]) * Math.PI / 360);
  const guess = Math.sqrt(Math.max(h, 1) * Math.max(w, 1) / Math.max(goal, 1));
  let probe = 0;
  for (let i = 0; i < DISTANCES.length; i++) if (Math.abs(DISTANCES[i] - guess) < Math.abs(DISTANCES[probe] - guess)) probe = i;
  const memo = new Map(), at = i => { if (!memo.has(i)) memo.set(i, place(ll, order, goal, DISTANCES[i], box)); return memo.get(i); };
  let lo = 0, hi = DISTANCES.length - 1, best = null, bestD = 0;
  while (lo <= hi) {
    const got = at(probe);
    if (got.length >= goal) { best = got; bestD = DISTANCES[probe]; lo = probe + 1; } else hi = probe - 1;
    if (lo > hi) break;
    probe = lo + ((hi - lo) >> 1);
  }
  if (!best) { best = at(0); bestD = best.length ? DISTANCES[0] : 0; }
  return { idx: best, d: bestD };
}

if (!isMainThread) {
  const { shared, regions, runs } = workerData, all = new Float32Array(shared);
  for (const run of runs) {
    const pts = [], spacing = [];
    regions.forEach((g, ri) => {
      if (!g.goal || !g.n) { spacing.push(0); return; }
      const ll = all.subarray(2 * g.at, 2 * (g.at + g.n));
      const { idx, d } = region(ll, g.n, g.goal, run * 1000003 + ri * 7919 + 1);
      for (const i of idx) pts.push(ll[2 * i], ll[2 * i + 1]);
      spacing.push(d);
    });
    parentPort.postMessage({ run, pts: new Float32Array(pts), spacing });
  }
  process.exit(0);
}

/* ---------- the country: its regions, their counts, the runs ---------- */
const { values: o, positionals: [arg] } = parseArgs({ allowPositionals: true, options: { map: { type: 'string', default: 'MovingWorld' }, total: { type: 'string', default: '200000' }, spawns: { type: 'string', default: '100000' }, jobs: { type: 'string', default: '8' } } });
const cc = (arg || '').toUpperCase(), TOTAL = +o.total;
const dir = path.join(CACHE, 'coverage', cc);
if (!cc || !fs.existsSync(dir)) { console.error(`usage: simulate.mjs <country> (needs tools/cache/coverage/<country>)`); process.exit(1); }
const RAW = 'https://raw.githubusercontent.com/slashP/Vali/main/src/Vali.Core/';
const weightsCs = fs.readFileSync(await cached(RAW + 'Weights.cs', 'vali_Weights.cs'), 'utf8');
const subCs = fs.readFileSync(await cached(RAW + 'SubdivisionWeights.cs', 'vali_SubdivisionWeights.cs'), 'utf8');
const mapBlock = weightsCs.match(new RegExp(`\\b${o.map} =\\s*\\[([\\s\\S]*?)\\];`));
if (!mapBlock) { console.error(`no map ${o.map} in Weights.cs`); process.exit(1); }
const shares = Object.fromEntries([...mapBlock[1].matchAll(/\("(\w+)",\s*(\d+)\)/g)].map(m => [m[1], +m[2]]));
if (!shares[cc]) { console.error(`${cc} is not on ${o.map}`); process.exit(1); }
const goal = Math.round(TOTAL * shares[cc] / Object.values(shares).reduce((a, b) => a + b, 0));
const subBlock = subCs.match(new RegExp(`Dictionary<string, \\(int weight, string subdivisionName\\)> ${cc} = new\\(\\)\\s*\\{([\\s\\S]*?)\\};`));
const subW = Object.fromEntries([...subBlock[1].matchAll(/\{\s*"([^"]+)",\s*\((\d+),\s*"([^"]*)"\)/g)].map(m => [m[1], { w: +m[2], name: m[3] }]));

const files = fs.readdirSync(dir).filter(f => f.endsWith('.loc')).sort();
const regions = [], parts = [];
let at = 0, strays = 0;
const q = (a, p) => a[Math.min(a.length - 1, Math.floor(p * a.length))];
for (const f of files) {
  const code = f.slice(f.indexOf('+') + 1, -4), b = fs.readFileSync(path.join(dir, f)), n0 = b.readUInt32LE(4);
  let ll = new Float32Array(b.buffer.slice(b.byteOffset + 16, b.byteOffset + 16 + 8 * n0));
  const lat = Float32Array.from({ length: n0 }, (_, i) => ll[2 * i]).sort(), lng = Float32Array.from({ length: n0 }, (_, i) => ll[2 * i + 1]).sort();
  const box = [q(lat, 0.001) - 1, q(lat, 0.999) + 1, q(lng, 0.001) - 1, q(lng, 0.999) + 1];
  const keep = [];
  for (let i = 0; i < n0; i++) { const a = ll[2 * i], g = ll[2 * i + 1]; if (a >= box[0] && a <= box[1] && g >= box[2] && g <= box[3]) keep.push(a, g); }
  strays += n0 - keep.length / 2;
  ll = Float32Array.from(keep);
  const n = ll.length / 2;
  parts.push(ll);
  regions.push({ code, name: subW[code]?.name, n, at, w: subW[code]?.w || 0 });
  at += n;
}
const wSum = regions.reduce((a, g) => a + g.w, 0);
for (const g of regions) g.goal = Math.round(g.w / wSum * goal);
const noWeight = regions.filter(g => !g.w).map(g => g.code);
const RUNS = Math.max(20, Math.min(400, Math.ceil(+o.spawns / Math.max(goal, 1))));
const shared = new SharedArrayBuffer(8 * at), all = new Float32Array(shared);
parts.forEach((p, i) => all.set(p, 2 * regions[i].at));
console.log(`${cc} on ${o.map}: ${shares[cc]} of ${Object.values(shares).reduce((a, b) => a + b, 0)}, so ${goal} of ${TOTAL} locations; ${regions.length} regions, ${at.toLocaleString('en')} pool locations${strays ? ` (${strays} stray ones left out)` : ''}${noWeight.length ? `; no weight (left out, as Vali would): ${noWeight.join(', ')}` : ''}; ${RUNS} runs`);

const t0 = Date.now(), results = new Array(RUNS), jobs = Math.min(+o.jobs, RUNS);
await Promise.all(Array.from({ length: jobs }, (_, w) => new Promise((ok, fail) => {
  const runs = Array.from({ length: RUNS }, (_, i) => i).filter(i => i % jobs === w);
  const worker = new Worker(new URL(import.meta.url), { workerData: { shared, regions: regions.map(({ n, at, goal }) => ({ n, at, goal })), runs } });
  worker.on('message', m => { results[m.run] = m; console.log(`run ${m.run + 1}/${RUNS}: ${m.pts.length / 2} locations, ${Math.round((Date.now() - t0) / 1000)} s`); });
  worker.on('error', fail); worker.on('exit', ok);
})));

const WORK = path.join(CACHE, 'builds', 'city-vali'), base = path.join(WORK, `${cc}_${o.map}_${TOTAL}`);
fs.mkdirSync(WORK, { recursive: true });
fs.writeFileSync(base + '.bin', Buffer.concat(results.map(r => Buffer.from(r.pts.buffer))));
fs.writeFileSync(base + '.json', JSON.stringify({
  cc, map: o.map, total: TOTAL, goal, runs: results.map(r => r.pts.length / 2),
  regions: regions.map((g, i) => ({ code: g.code, name: g.name, pool: g.n, weight: g.w, goal: g.goal, spacing: results.map(r => r.spacing[i]) })),
}, null, 1));
const sp = regions.filter(g => g.goal).map(g => results[0].spacing[regions.indexOf(g)]).sort((a, b) => a - b);
console.log(`-> ${path.relative(process.cwd(), base)}.bin; spacing in run 1: ${sp[0]} m to ${sp.at(-1)} m, middle ${sp[sp.length >> 1]} m`);
