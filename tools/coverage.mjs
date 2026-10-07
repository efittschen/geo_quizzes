#!/usr/bin/env node
// coverage: where Google Street View has official coverage -> data/coverage/ (the map tiles of coverage.html).
//
//   node tools/coverage.mjs fetch [--only RU,BO] [--jobs 6]   the location pool -> tools/cache/coverage/ (about 20 GB
//                                                             to download, 4 GB kept; a second run fetches only new files)
//   node tools/coverage.mjs tiles [--zoom 9] [--gap 3] [--jobs 6] [--out dir]   the tiles and meta.json, from the cache
//        --zoom: the map zoom of the finest level; 9 is about 300 m per pixel (49 MB), 10 is 150 m (134 MB)
//        --also tmp/cov/9,tmp/cov/11   names other builds (made with --out) for the page to offer next to this one
//   node tools/coverage.mjs countries [--only DE,BO]          each country's roads for the home map and its country
//                                                             page, which draw them on the country under the pointer
//
// Source: the location pool of Vali (github.com/slashP/Vali), the map generator behind "An Arbitrary World": road
// points from OpenStreetMap, each looked up in Google Street View and kept with the panorama's position and date.
// One file per region: bzip2 (named .zip), holding protobuf records
//   Location { 1 NodeId, 2 Lat, 3 Lng, 4 Google { 2 Lat, 3 Lng, 7 Year, 8 Month, 13 IsScout }, 5 Osm { 20 WayIds } }.
// The pool is a sample, one location per OpenStreetMap node, so a straight road is a row of dots. fetch joins the
// locations that share an OpenStreetMap way into a line (the shortest tree through them, see `ways`); tiles draws
// the joins up to --gap km.
//
// Cache: one <region>.loc per pool file (points: lat, lng, date; joins: pairs of points) and index.json.
// Home map and country pages: data/coverage/home/<alpha-2>_<scale>.png, shape/<alpha-2>.png and home.json (see `countries`).
// Tiles: data/coverage/<z>/<x>/<y>.png, 1024 px, z = map zoom - 2 (Leaflet: tileSize 1024, zoomOffset -2), four
// colors: clear, and the newest capture at that spot in three steps (see YEARS).
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { spawn } from 'node:child_process';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { parseArgs } from 'node:util';
import * as d3 from 'd3-geo';
import { feature } from 'topojson-client';
import { ROOT, CACHE, UA, cached, sleep, readGeoJSON, naturalEarthCountries } from './lib/geo.mjs';

const POOL = 'https://vali-download.slashp.workers.dev';
const CODES = 'https://raw.githubusercontent.com/slashP/Vali/main/src/Vali.Core/Data/CountryCodes.cs';
const DIR = path.join(CACHE, 'coverage'), INDEX = path.join(DIR, 'index.json');
const YEARS = [2015, 2019]; // color steps: before 2015, 2015-2018, 2019 and later
const MAX_JOIN_KM = 25;     // longest join kept in the cache

const { values: o, positionals: [cmd] } = parseArgs({
  allowPositionals: true,
  options: { only: { type: 'string' }, jobs: { type: 'string', default: '6' }, zoom: { type: 'string', default: '9' }, gap: { type: 'string', default: '3' }, out: { type: 'string' }, also: { type: 'string' }, part: { type: 'string' } },
});
const OUT = o.out ? path.resolve(o.out) : path.join(ROOT, 'data', 'coverage');
const ONLY = o.only ? new Set(o.only.toUpperCase().split(',')) : null;
fs.mkdirSync(DIR, { recursive: true });
const index = fs.existsSync(INDEX) ? JSON.parse(fs.readFileSync(INDEX, 'utf8')) : {};
const saveIndex = () => { fs.writeFileSync(INDEX + '.part', JSON.stringify(index)); fs.renameSync(INDEX + '.part', INDEX); };
const locFile = key => path.join(DIR, key.replace(/\.zip$/, '.loc'));

/* ---------- fetch: pool files -> .loc ---------- */
// The protobuf reader works on B from p; a file's records arrive in chunks and are read one whole record at a time.
let B, p;
const varint = () => { let v = 0, m = 1, b; do { b = B[p++]; v += (b & 0x7f) * m; m *= 128; } while (b & 0x80); return v; };
const skip = wt => {
  if (wt === 0) { while (B[p++] & 0x80); } else if (wt === 1) p += 8; else if (wt === 5) p += 4;
  else if (wt === 2) { const n = varint(); p += n; } else throw new Error(`wire type ${wt}`);
};
const grow = (a, n) => { const b = new a.constructor(n); b.set(a); return b; };

function readLocation(end, J) {
  let lat = NaN, lng = NaN, lat0 = NaN, lng0 = NaN, year = 0, month = 0, scout = 0;
  const i = J.n, w0 = J.w;
  while (p < end) {
    const tag = varint(), f = tag >>> 3, wt = tag & 7;
    if (f === 4 && wt === 2) {
      const e = varint() + p;
      while (p < e) {
        const t = varint(), g = t >>> 3, w = t & 7;
        if (g === 2 && w === 1) { lat = B.readDoubleLE(p); p += 8; }
        else if (g === 3 && w === 1) { lng = B.readDoubleLE(p); p += 8; }
        else if (g === 7 && w === 0) year = varint();
        else if (g === 8 && w === 0) month = varint();
        else if (g === 13 && w === 0) scout = varint();
        else skip(w);
      }
    } else if (f === 5 && wt === 2) {
      const e = varint() + p;
      while (p < e) {
        const t = varint(), g = t >>> 3, w = t & 7;
        if (g === 20 && (w === 0 || w === 2)) {
          const e2 = w === 2 ? varint() + p : p + 1;
          do {
            if (J.w === J.wayId.length) { J.wayId = grow(J.wayId, J.w * 2); J.wayPt = grow(J.wayPt, J.w * 2); }
            J.wayId[J.w] = varint(); J.wayPt[J.w++] = i;
          } while (w === 2 && p < e2);
        } else skip(w);
      }
    } else if (f === 2 && wt === 1) { lat0 = B.readDoubleLE(p); p += 8; }
    else if (f === 3 && wt === 1) { lng0 = B.readDoubleLE(p); p += 8; }
    else skip(wt);
  }
  if (!(Math.abs(lat) > 0) || !(Math.abs(lng) > 0)) { lat = lat0; lng = lng0; }
  if (!isFinite(lat) || !isFinite(lng)) { J.w = w0; return; }
  if (i === J.ym.length) { J.ll = grow(J.ll, i * 4); J.ym = grow(J.ym, i * 2); }
  J.ll[2 * i] = lat; J.ll[2 * i + 1] = lng;
  J.ym[i] = (scout ? 0x8000 : 0) | Math.max(0, Math.min(127, year - 2000)) << 4 | (month & 15);
  J.n++;
}

// Joins: the locations on one OpenStreetMap way, linked by the shortest tree through them (Prim). For points along
// a road that tree is the road itself; a crossing belongs to both ways, so the lines of the two meet there.
function ways(J) {
  const { ll, wayId, wayPt } = J, order = new Uint32Array(J.w).map((_, k) => k).sort((a, b) => wayId[a] - wayId[b]);
  let segs = new Uint32Array(Math.max(16, J.w * 2)), s = 0;
  const rad = Math.PI / 180;
  for (let a = 0; a < order.length;) {
    let b = a + 1; while (b < order.length && wayId[order[b]] === wayId[order[a]]) b++;
    const n = b - a;
    if (n > 1) {
      const pts = new Uint32Array(n); for (let k = 0; k < n; k++) pts[k] = wayPt[order[a + k]];
      const k0 = Math.cos(ll[2 * pts[0]] * rad) * 111.32;
      const best = new Float64Array(n).fill(Infinity), from = new Int32Array(n).fill(-1), done = new Uint8Array(n);
      let cur = 0; done[0] = 1;
      for (let step = 1; step < n; step++) {
        const cy = ll[2 * pts[cur]], cx = ll[2 * pts[cur] + 1];
        let next = -1, nd = Infinity;
        for (let k = 0; k < n; k++) {
          if (done[k]) continue;
          const dy = (ll[2 * pts[k]] - cy) * 110.57, dx = (ll[2 * pts[k] + 1] - cx) * k0, d = dx * dx + dy * dy;
          if (d < best[k]) { best[k] = d; from[k] = cur; }
          if (best[k] < nd) { nd = best[k]; next = k; }
        }
        done[next] = 1; cur = next;
        if (nd <= MAX_JOIN_KM ** 2 && nd > 0) {
          if (s + 2 > segs.length) segs = grow(segs, segs.length * 2);
          segs[s++] = pts[from[next]]; segs[s++] = pts[next];
        }
      }
    }
    a = b;
  }
  return segs.subarray(0, s);
}

async function fetchFile(f) {
  const res = await fetch(`${POOL}/countries-v2/${f.key.split('/').map(encodeURIComponent).join('/')}`, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const guess = Math.max(1024, Math.ceil(f.size / 40));
  const J = { n: 0, w: 0, ll: new Float32Array(guess * 2), ym: new Uint16Array(guess), wayId: new Float64Array(guess * 2), wayPt: new Uint32Array(guess * 2) };
  const bz = spawn('bzip2', ['-dc'], { stdio: ['pipe', 'pipe', 'ignore'] });
  const exit = new Promise(ok => { bz.on('error', () => ok(-1)); bz.on('close', ok); });
  // A dropped connection fails the pipe while the records are still being read: keep the error for after the loop.
  let dropped = null;
  const pump = pipeline(Readable.fromWeb(res.body), bz.stdin).catch(e => { dropped = e; });
  let carry = null;
  try {
  for await (const chunk of bz.stdout) {
    B = carry ? Buffer.concat([carry, chunk]) : chunk; p = 0;
    let at = 0;
    for (;;) {
      if (at >= B.length) break;
      if (B[at] !== 0x0a) throw new Error('not a location record');
      p = at + 1;
      let len = 0, m = 1, whole = false;
      while (p < B.length) { const b = B[p++]; len += (b & 0x7f) * m; m *= 128; if (!(b & 0x80)) { whole = true; break; } }
      if (!whole || p + len > B.length) break;
      const end = p + len;
      readLocation(end, J);
      at = end;
    }
    carry = at < B.length ? B.subarray(at) : null;
  }
  } finally { bz.kill(); }
  await pump;
  if (dropped) throw new Error(`connection dropped (${dropped.cause?.code || dropped.message})`);
  if (await exit !== 0) throw new Error('bzip2 failed');
  if (carry) throw new Error('cut off');
  const segs = ways(J), n = J.n, ll = J.ll.subarray(0, 2 * n), ym = J.ym.subarray(0, n);
  let x0 = 180, y0 = 90, x1 = -180, y1 = -90; const years = {};
  for (let i = 0; i < n; i++) {
    const la = ll[2 * i], lo = ll[2 * i + 1], y = 2000 + (ym[i] >> 4 & 127);
    if (lo < x0) x0 = lo; if (lo > x1) x1 = lo; if (la < y0) y0 = la; if (la > y1) y1 = la;
    years[y] = (years[y] || 0) + 1;
  }
  const head = Buffer.alloc(16); head.write('COV1'); head.writeUInt32LE(n, 4); head.writeUInt32LE(segs.length / 2, 8);
  const file = locFile(f.key), raw = a => Buffer.from(a.buffer, a.byteOffset, a.byteLength);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file + '.part', Buffer.concat([head, raw(ll), raw(segs), raw(ym)]));
  fs.renameSync(file + '.part', file);
  index[f.key] = { uploaded: f.uploaded, size: f.size, n, joins: segs.length / 2, box: [x0, y0, x1, y1].map(v => Math.round(v * 1e4) / 1e4), years };
}

// A .loc file: points as [lat, lng] pairs, joins as pairs of point numbers, dates as (scout << 15 | year - 2000 << 4 | month).
function readLoc(key) {
  const b = fs.readFileSync(locFile(key)), n = b.readUInt32LE(4), s = b.readUInt32LE(8);
  const cut = (T, off, len) => new T(b.buffer.slice(b.byteOffset + off, b.byteOffset + off + len * T.BYTES_PER_ELEMENT));
  return { n, ll: cut(Float32Array, 16, 2 * n), segs: cut(Uint32Array, 16 + 8 * n, 2 * s), ym: cut(Uint16Array, 16 + 8 * n + 8 * s, n) };
}

async function fetchAll() {
  const codes = [...new Set(fs.readFileSync(await cached(CODES, 'vali_CountryCodes.cs'), 'utf8').match(/"[A-Z]{2}"/g).map(s => s.slice(1, 3)))].sort();
  const only = ONLY;
  const todo = [], listed = new Set();
  let c = 0;
  await Promise.all(Array.from({ length: 8 }, async () => {
    while (c < codes.length) {
      const cc = codes[c++];
      if (only && !only.has(cc)) continue;
      const res = await fetch(`${POOL}/list-countries/${cc}`, { headers: { 'User-Agent': UA } });
      if (!res.ok) throw new Error(`list ${cc}: HTTP ${res.status}`);
      for (const f of await res.json()) {
        listed.add(f.key);
        if (index[f.key]?.uploaded !== f.uploaded || !fs.existsSync(locFile(f.key))) todo.push(f);
      }
    }
  }));
  if (!only) for (const key of Object.keys(index)) if (!listed.has(key)) { delete index[key]; fs.rmSync(locFile(key), { force: true }); }
  todo.sort((a, b) => b.size - a.size);
  const total = todo.reduce((a, f) => a + f.size, 0), failed = [], t0 = Date.now();
  console.log(`${listed.size} pool files, ${todo.length} to fetch (${(total / 1e9).toFixed(2)} GB)`);
  let next = 0, done = 0, bytes = 0, shown = Date.now();
  await Promise.all(Array.from({ length: +o.jobs }, async () => {
    while (next < todo.length) {
      const f = todo[next++];
      for (let tries = 1; ; tries++) {
        try { await fetchFile(f); break; }
        catch (e) {
          if (tries === 6) { failed.push(`${f.key}: ${e.message}`); break; }
          console.log(`${f.key}: ${e.message}, try ${tries + 1}`);
          await sleep(2000 * 2 ** tries);
        }
      }
      done++; bytes += f.size;
      saveIndex();
      if (Date.now() - shown > 30000) {
        shown = Date.now();
        const sec = (shown - t0) / 1000;
        console.log(`${done}/${todo.length} files, ${(bytes / 1e9).toFixed(2)}/${(total / 1e9).toFixed(2)} GB, ${Math.round(sec / 60)} min, about ${Math.round(sec * (total - bytes) / Math.max(bytes, 1) / 60)} min left`);
      }
    }
  }));
  saveIndex();
  const sum = Object.values(index).reduce((a, e) => a + e.n, 0);
  console.log(`cache: ${Object.keys(index).length} files, ${sum} locations, ${new Set(Object.keys(index).map(k => k.slice(0, 2))).size} countries`);
  if (failed.length) { console.error(`FAILED (${failed.length}):\n` + failed.join('\n')); process.exit(1); }
}

/* ---------- tiles: .loc -> data/coverage/<z>/<x>/<y>.png ---------- */
const T = 1024;
const COLORS = ['000000', '6fb7f0', '2a7de1', '0b3596']; // clear, then oldest to newest
const crcChunk = (type, data) => {
  const body = Buffer.concat([Buffer.from(type), data]), out = Buffer.alloc(body.length + 8);
  out.writeUInt32BE(data.length, 0); body.copy(out, 4); out.writeUInt32BE(zlib.crc32(body), body.length + 4);
  return out;
};
const PNG_HEAD = (() => {
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(T, 0); ihdr.writeUInt32BE(T, 4); ihdr[8] = 2; ihdr[9] = 3;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), crcChunk('IHDR', ihdr),
    crcChunk('PLTE', Buffer.from(COLORS.join(''), 'hex')), crcChunk('tRNS', Buffer.from([0]))]);
})();
// One tile out of a square of pixel values 0-3 (side `side`), as a PNG with two bits per pixel.
function png(px, side, x0, y0) {
  const raw = Buffer.alloc(T * (T / 4 + 1));
  for (let y = 0, q = 0; y < T; y++) {
    let i = (y0 + y) * side + x0; raw[q++] = 0;
    for (let x = 0; x < T; x += 4, i += 4) raw[q++] = px[i] << 6 | px[i + 1] << 4 | px[i + 2] << 2 | px[i + 3];
  }
  return Buffer.concat([PNG_HEAD, crcChunk('IDAT', zlib.deflateSync(raw, { level: 9 })), crcChunk('IEND', Buffer.alloc(0))]);
}
// Half the size: each pixel the newest of its four.
function halve(px, side) {
  const h = side / 2, out = new Uint8Array(h * h);
  for (let y = 0; y < h; y++) {
    let a = 2 * y * side, b = a + side, q = y * h;
    for (let x = 0; x < h; x++, a += 2, b += 2) out[q++] = Math.max(px[a], px[a + 1], px[b], px[b + 1]);
  }
  return out;
}

// A tile run draws the finest level in squares of 16 x 16 tiles, each square by one of --jobs processes (--part k/n),
// which also makes the coarser levels inside its square. The main process then makes the few levels above the squares.
const PARTS = path.join(OUT, '.parts');
function plan(idx) {
  const top = +o.zoom - 2;                               // the finest tile level
  const base = Math.max(0, top - 4), side = 2 ** (top - base) * T;
  const W = T * 2 ** top, rad = Math.PI / 180;
  const mx = lng => (lng + 180) / 360 * W, my = lat => (1 - Math.log(Math.tan(Math.PI / 4 + lat * rad / 2)) / Math.PI) / 2 * W;
  const squares = [];
  for (let ry = 0; ry < 2 ** base; ry++) for (let rx = 0; rx < 2 ** base; rx++) {
    const X0 = rx * side, Y0 = ry * side, X1 = X0 + side, Y1 = Y0 + side;
    const files = Object.keys(idx).filter(k => { const [a, b, c, d] = idx[k].box; return mx(c) + 2 >= X0 && mx(a) - 2 < X1 && my(b) + 2 >= Y0 && my(d) - 2 < Y1; });
    if (files.length) squares.push({ rx, ry, X0, Y0, X1, Y1, files, n: files.reduce((a, k) => a + idx[k].n, 0) });
  }
  squares.sort((a, b) => b.n - a.n); // the heavy squares first, so they spread over the processes
  return { top, base, side, mx, my, rad, squares };
}
function writer() {
  const w = { have: {}, files: 0, bytes: 0 };
  w.write = (z, x, y, px, s, x0, y0) => {
    const buf = png(px, s, x0, y0), dir = path.join(PARTS, 'new', String(z), String(x));
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(path.join(dir, `${y}.png`), buf);
    (w.have[z] ||= []).push(`${x}/${y}`); w.files++; w.bytes += buf.length;
  };
  return w;
}

function drawPart() {
  const [part, parts] = o.part.split('/').map(Number), GAP = +o.gap;
  const idx = JSON.parse(fs.readFileSync(path.join(PARTS, 'index.json'), 'utf8'));
  const { top, base, side, mx, my, rad, squares } = plan(idx), w = writer();
  const any = (px, s, x0, y0) => { for (let y = 0; y < T; y++) { const r = (y0 + y) * s + x0; for (let x = 0; x < T; x++) if (px[r + x]) return true; } return false; };
  const px = new Uint8Array(side * side);
  squares.forEach(({ rx, ry, X0, Y0, X1, Y1, files }, at) => {
    if (at % parts !== part) return;
    px.fill(0);
    let drawn = false;
    const dot = (x, y, v) => { // a 2 x 2 brush
      for (let yy = y; yy < y + 2; yy++) for (let xx = x; xx < x + 2; xx++) {
        if (xx < X0 || xx >= X1 || yy < Y0 || yy >= Y1) continue;
        const i = (yy - Y0) * side + (xx - X0); if (px[i] < v) px[i] = v; drawn = true;
      }
    };
    for (const k of files) {
      const { n, ll, segs, ym } = readLoc(k);
      const xs = new Float64Array(n), ys = new Float64Array(n), cls = new Uint8Array(n);
      for (let i = 0; i < n; i++) {
        xs[i] = mx(ll[2 * i + 1]); ys[i] = my(ll[2 * i]);
        const year = 2000 + (ym[i] >> 4 & 127); cls[i] = year < YEARS[0] ? 1 : year < YEARS[1] ? 2 : 3;
      }
      for (let s = 0; s < segs.length; s += 2) {
        const a = segs[s], b = segs[s + 1], dx = xs[b] - xs[a], dy = ys[b] - ys[a];
        if (Math.max(xs[a], xs[b]) < X0 - 2 || Math.min(xs[a], xs[b]) > X1 + 2 || Math.max(ys[a], ys[b]) < Y0 - 2 || Math.min(ys[a], ys[b]) > Y1 + 2) continue;
        const kx = (ll[2 * b + 1] - ll[2 * a + 1]) * Math.cos(ll[2 * a] * rad) * 111.32, ky = (ll[2 * b] - ll[2 * a]) * 110.57;
        if (kx * kx + ky * ky > GAP * GAP) continue;
        const steps = Math.ceil(Math.max(Math.abs(dx), Math.abs(dy))), v = Math.max(cls[a], cls[b]);
        for (let t = 1; t < steps; t++) dot(Math.floor(xs[a] + dx * t / steps), Math.floor(ys[a] + dy * t / steps), v);
      }
      for (let i = 0; i < n; i++) dot(Math.floor(xs[i]), Math.floor(ys[i]), cls[i]);
    }
    if (!drawn) return;
    let cur = px, s = side;
    for (let z = top; z > base; z--, cur = halve(cur, s), s /= 2) {
      const per = s / T, f = 2 ** (z - base);
      for (let ty = 0; ty < per; ty++) for (let tx = 0; tx < per; tx++) if (any(cur, s, tx * T, ty * T)) w.write(z, rx * f + tx, ry * f + ty, cur, s, tx * T, ty * T);
    }
    fs.writeFileSync(path.join(PARTS, `base_${rx}_${ry}.bin`), cur); // the square as one tile, for the levels above
  });
  fs.writeFileSync(path.join(PARTS, `tiles_${part}.json`), JSON.stringify(w));
}

async function tiles() {
  const keys = Object.keys(index).filter(k => index[k].n && (!ONLY || ONLY.has(k.slice(0, 2))));
  fs.mkdirSync(OUT, { recursive: true });
  fs.rmSync(PARTS, { recursive: true, force: true });
  fs.mkdirSync(PARTS);
  // The processes work from one copy of the index, so a fetch running alongside cannot shift the plan between them.
  const idx = Object.fromEntries(keys.map(k => [k, index[k]]));
  fs.writeFileSync(path.join(PARTS, 'index.json'), JSON.stringify(idx));
  const { top, base, squares } = plan(idx), parts = Math.max(1, Math.min(+o.jobs, squares.length));
  await Promise.all(Array.from({ length: parts }, (_, k) => new Promise((ok, no) => {
    const child = spawn(process.execPath, ['--max-old-space-size=4096', process.argv[1], 'tiles', '--zoom', o.zoom, '--gap', o.gap, '--out', OUT, '--part', `${k}/${parts}`], { stdio: 'inherit' });
    child.on('close', code => code ? no(new Error(`tile process ${k} failed`)) : ok());
  })));
  const w = writer();
  let level = new Map();
  for (const f of fs.readdirSync(PARTS)) {
    const sq = f.match(/^base_(\d+)_(\d+)\.bin$/);
    if (sq) level.set(`${sq[1]}/${sq[2]}`, new Uint8Array(fs.readFileSync(path.join(PARTS, f))));
    else if (f.startsWith('tiles_')) {
      const part = JSON.parse(fs.readFileSync(path.join(PARTS, f), 'utf8'));
      for (const [z, list] of Object.entries(part.have)) (w.have[z] ||= []).push(...list);
      w.files += part.files; w.bytes += part.bytes;
    }
  }
  // the squares' own level and the levels above it: each tile from its four children
  for (let z = base; z >= 0; z--) {
    const up = new Map();
    for (const [k, tile] of level) {
      const [x, y] = k.split('/').map(Number);
      w.write(z, x, y, tile, T, 0, 0);
      if (z === 0) continue;
      const pk = `${x >> 1}/${y >> 1}`, half = halve(tile, T), ox = (x & 1) * T / 2, oy = (y & 1) * T / 2;
      let parent = up.get(pk); if (!parent) up.set(pk, parent = new Uint8Array(T * T));
      for (let r = 0; r < T / 2; r++) parent.set(half.subarray(r * T / 2, (r + 1) * T / 2), (oy + r) * T + ox);
    }
    level = up;
  }
  // The new tiles were drawn aside (so the page kept showing the old layer): swap them in now.
  for (const d of fs.readdirSync(OUT)) if (/^\d+$/.test(d)) fs.rmSync(path.join(OUT, d), { recursive: true });
  for (const d of fs.readdirSync(path.join(PARTS, 'new'))) fs.renameSync(path.join(PARTS, 'new', d), path.join(OUT, d));
  fs.rmSync(PARTS, { recursive: true });
  for (const list of Object.values(w.have)) list.sort();
  const countries = {};
  for (const k of keys) {
    const c = countries[k.slice(0, 2)] ||= { n: 0, first: 9999, last: 0 };
    c.n += index[k].n;
    for (const y of Object.keys(index[k].years)) { if (+y > 2000 && +y < c.first) c.first = +y; if (+y > c.last) c.last = +y; }
  }
  const meta = {
    source: 'Vali location pool (github.com/slashP/Vali)', updated: keys.map(k => index[k].uploaded.slice(0, 10)).sort().pop(),
    zoom: +o.zoom, gap: +o.gap, years: YEARS, colors: COLORS.slice(1).map(c => '#' + c),
    locations: keys.reduce((a, k) => a + index[k].n, 0), size: w.bytes, also: o.also ? o.also.split(',') : undefined, countries, tiles: w.have,
  };
  fs.writeFileSync(path.join(OUT, 'meta.json'), JSON.stringify(meta));
  console.log(`${w.files} tiles, ${(w.bytes / 1e6).toFixed(1)} MB, levels 0-${top} (map zoom ${o.zoom}), ${meta.locations} locations in ${Object.keys(countries).length} countries, pool of ${meta.updated}`);
}

/* ---------- countries: each country's roads for the home map ---------- */
// The home map (assets/js/map.js) draws a country's covered roads on it while the pointer is on the country. They
// are pictures in the home map's own projection: data/coverage/home/<alpha-2>_<scale>.png, the roads in one color
// on a clear ground, at SCALES pixels per unit of the map (it is 960 units wide, and zooms in 12 times), so the page
// can take the one that fits its zoom. home.json lists them by the ISO numeric code the home map uses for its
// countries, and by name for the few without one (Kosovo): [alpha-2, x, y, width, height] in map units, then the
// box around the country's coverage as [west, south, east, north].
// The country page draws the same roads on its outline of the country, which has a projection of its own (see
// drawShape in assets/js/country.js): data/coverage/shape/<alpha-2>.png, the outline's 120 x 120 square at 4 pixels
// per unit. The box around the coverage is what its coverage map opens on.
// That map shades everything but the country: data/coverage/outline/<key>.json is the country's border (Natural
// Earth 1:10m, thinned to about 400 m, islets dropped), for every country of the home map; <key> is its ISO numeric
// code, or its name in lower-case letters and dashes where it has none. A file is a list of rings, each a flat list
// of whole numbers: latitude and longitude of the first point in thousandths of a degree, then the step to each
// next point. A country across the 180th meridian is kept in one piece, with longitudes running past 180.
// The pool has a few locations filed under a country far away from it. So a location more than a degree outside
// the boxes around its country's pieces of land (Natural Earth 1:50m) counts only if at least five others are in
// the same one-degree square: islands that Natural Earth leaves out (San Andrés, Fernando de Noronha) stay in.
const WORLD_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'; // the home map's countries, as in assets/js/common.js
const HOME = [960, 500], SCALES = [2, 4, 8, 16], ROAD = 'f2b705'; // --yellow of base.css

// A picture of pixel values 0 (clear) and 1 (road), as a PNG with one bit per pixel.
function roadPicture(px, w, h) {
  const row = Math.ceil(w / 8) + 1, raw = Buffer.alloc(row * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (px[y * w + x]) raw[y * row + 1 + (x >> 3)] |= 128 >> (x & 7);
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 1; ihdr[9] = 3;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), crcChunk('IHDR', ihdr), crcChunk('PLTE', Buffer.from('000000' + ROAD, 'hex')),
    crcChunk('tRNS', Buffer.from([0])), crcChunk('IDAT', zlib.deflateSync(raw, { level: 9 })), crcChunk('IEND', Buffer.alloc(0))]);
}

async function countries() {
  const GAP = +o.gap, rad = Math.PI / 180;
  const home = feature(JSON.parse(fs.readFileSync(await cached(WORLD_URL, 'world-atlas_countries-110m.json'), 'utf8')), 'countries').features
    .filter(f => f.properties.name !== 'Antarctica');
  const proj = d3.geoNaturalEarth1().fitSize(HOME, { type: 'FeatureCollection', features: home }); // as in map.js
  const shapes = (await naturalEarthCountries()).features;
  if (!ONLY) await outlines(home);
  const listFile = path.join(OUT, 'home.json');
  // --only redraws some countries and keeps the others; a full run draws aside and swaps the folders in at the end,
  // so the pages keep their pictures meanwhile
  const list = ONLY && fs.existsSync(listFile) ? JSON.parse(fs.readFileSync(listFile, 'utf8')) : { scales: SCALES, ids: {}, names: {} };
  const dirs = Object.fromEntries(['home', 'shape'].map(d => [d, path.join(OUT, ONLY ? d : `.${d}`)]));
  for (const d of Object.values(dirs)) { if (!ONLY) fs.rmSync(d, { recursive: true, force: true }); fs.mkdirSync(d, { recursive: true }); }
  const SHAPE = 120, SHAPE_SCALE = 4; // the country page's outline: a square of 120 units
  let bytes = 0, made = 0; const left = [];
  for (const place of home) {
    const name = place.properties.name;
    const shape = shapes.find(f => place.id ? f.properties.ISO_N3_EH === place.id : f.properties.NAME === name);
    const cc = shape && (shape.properties.ISO_A2_EH !== '-99' ? shape.properties.ISO_A2_EH : shape.properties.ADM0_A3);
    if (!cc || (ONLY && !ONLY.has(cc))) continue;
    const files = Object.keys(index).filter(k => k.startsWith(cc + '/') && index[k].n).map(readLoc);
    if (!files.length) continue;
    const boxes = (shape.geometry.type === 'Polygon' ? [shape.geometry.coordinates] : shape.geometry.coordinates).map(p => {
      let b = [180, 90, -180, -90];
      for (const [x, y] of p[0]) b = [Math.min(b[0], x), Math.min(b[1], y), Math.max(b[2], x), Math.max(b[3], y)];
      return [b[0] - 1, b[1] - 1, b[2] + 1, b[3] + 1];
    });
    // every location in map units (xs, ys) and in the units of the country page's outline (us, vs: Mercator, centred
    // on the home map's shape of the country and fitted to it, as drawShape does); NaN for the ones left out
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity, out = 0;
    const around = [180, 90, -180, -90]; // the box around the coverage: west, south, east, north
    const mid = d3.geoCentroid(place)[0];
    const outline = d3.geoMercator().rotate([-mid, 0]).fitSize([SHAPE, SHAPE], place), ok = outline.scale(), [otx, oty] = outline.translate();
    const far = new Map(); // locations outside the boxes, by one-degree square: [file, number, file, number, ...]
    const put = (f, i) => {
      const lat = f.ll[2 * i], lng = f.ll[2 * i + 1], q = proj([lng, lat]); f.xs[i] = q[0]; f.ys[i] = q[1];
      f.us[i] = ok * (((lng - mid + 540) % 360) - 180) * rad + otx; f.vs[i] = oty - ok * Math.log(Math.tan(Math.PI / 4 + lat * rad / 2));
      if (q[0] < x0) x0 = q[0]; if (q[0] > x1) x1 = q[0]; if (q[1] < y0) y0 = q[1]; if (q[1] > y1) y1 = q[1];
      if (lng < around[0]) around[0] = lng; if (lat < around[1]) around[1] = lat; if (lng > around[2]) around[2] = lng; if (lat > around[3]) around[3] = lat;
    };
    for (const f of files) {
      f.xs = new Float32Array(f.n).fill(NaN); f.ys = new Float32Array(f.n); f.us = new Float32Array(f.n); f.vs = new Float32Array(f.n);
      for (let i = 0; i < f.n; i++) {
        const lat = f.ll[2 * i], lng = f.ll[2 * i + 1];
        if (boxes.some(b => lng >= b[0] && lng <= b[2] && lat >= b[1] && lat <= b[3])) { put(f, i); continue; }
        const k = `${Math.floor(lat)},${Math.floor(lng)}`;
        if (!far.has(k)) far.set(k, []);
        far.get(k).push(f, i);
      }
    }
    for (const [k, a] of far) {
      if (a.length < 12) { out += a.length / 2; left.push(`${cc} ${a.length / 2} at ${k}`); continue; }
      for (let n = 0; n < a.length; n += 2) put(a[n], a[n + 1]);
    }
    if (x0 === Infinity) continue;
    x0 = Math.floor(x0) - 1; y0 = Math.floor(y0) - 1; x1 = Math.ceil(x1) + 1; y1 = Math.ceil(y1) + 1;
    // the roads as a picture: the locations (X, Y: which of their coordinates) from (x0, y0) on, r pixels per unit
    const draw = (X, Y, x0, y0, r, w, h) => {
      const px = new Uint8Array(w * h);
      const dot = (x, y) => { // a 2 x 2 brush
        const cx = Math.floor((x - x0) * r), cy = Math.floor((y - y0) * r);
        for (let yy = cy; yy < cy + 2; yy++) for (let xx = cx; xx < cx + 2; xx++) if (xx >= 0 && xx < w && yy >= 0 && yy < h) px[yy * w + xx] = 1;
      };
      for (const f of files) {
        const { n, ll, segs } = f, xs = f[X], ys = f[Y], counted = f.xs;
        for (let k = 0; k < segs.length; k += 2) {
          const a = segs[k], b = segs[k + 1];
          if (counted[a] !== counted[a] || counted[b] !== counted[b]) continue;
          const kx = (ll[2 * b + 1] - ll[2 * a + 1]) * Math.cos(ll[2 * a] * rad) * 111.32, ky = (ll[2 * b] - ll[2 * a]) * 110.57;
          if (kx * kx + ky * ky > GAP * GAP) continue;
          const steps = Math.ceil(Math.max(Math.abs(xs[b] - xs[a]), Math.abs(ys[b] - ys[a])) * r);
          for (let t = 1; t < steps; t++) dot(xs[a] + (xs[b] - xs[a]) * t / steps, ys[a] + (ys[b] - ys[a]) * t / steps);
        }
        for (let i = 0; i < n; i++) if (counted[i] === counted[i]) dot(xs[i], ys[i]);
      }
      return roadPicture(px, w, h);
    };
    const save = (file, buf) => { fs.writeFileSync(file, buf); bytes += buf.length; };
    for (const r of SCALES) save(path.join(dirs.home, `${cc}_${r}.png`), draw('xs', 'ys', x0, y0, r, (x1 - x0) * r, (y1 - y0) * r));
    save(path.join(dirs.shape, `${cc}.png`), draw('us', 'vs', 0, 0, SHAPE_SCALE, SHAPE * SHAPE_SCALE, SHAPE * SHAPE_SCALE));
    (place.id ? list.ids : list.names)[place.id || name] = [cc, x0, y0, x1 - x0, y1 - y0, around.map(v => Math.round(v * 1000) / 1000)];
    made++;
  }
  if (!ONLY) for (const d of ['home', 'shape']) { fs.rmSync(path.join(OUT, d), { recursive: true, force: true }); fs.renameSync(dirs[d], path.join(OUT, d)); }
  fs.writeFileSync(listFile, JSON.stringify(list));
  console.log(`${made} countries, ${SCALES.length + 1} pictures each, ${(bytes / 1e6).toFixed(1)} MB`);
  if (left.length) console.log(`locations left out as far from their country (number at latitude,longitude): ${left.join('; ')}`);
}

// Fewer points along a ring of [lng, lat]: Douglas-Peucker, `tol` in degrees of latitude.
function thin(ring, tol) {
  const k = Math.cos(ring[0][1] * Math.PI / 180), keep = new Uint8Array(ring.length), todo = [[0, ring.length - 1]];
  keep[0] = keep[ring.length - 1] = 1;
  while (todo.length) {
    const [a, b] = todo.pop(), ax = ring[a][0] * k, ay = ring[a][1], dx = ring[b][0] * k - ax, dy = ring[b][1] - ay, len = Math.hypot(dx, dy);
    let far = -1, most = tol;
    for (let i = a + 1; i < b; i++) {
      const px = ring[i][0] * k - ax, py = ring[i][1] - ay, d = len ? Math.abs(px * dy - py * dx) / len : Math.hypot(px, py);
      if (d > most) { most = d; far = i; }
    }
    if (far > 0) { keep[far] = 1; todo.push([a, far], [far, b]); }
  }
  return ring.filter((_, i) => keep[i]);
}

async function outlines(home) {
  const fine = readGeoJSON(await cached('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_countries.geojson', 'ne_10m_admin_0_countries.geojson')).features;
  const dir = path.join(OUT, 'outline');
  fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  let bytes = 0, made = 0;
  for (const place of home) {
    const name = place.properties.name, shape = fine.find(f => place.id ? f.properties.ISO_N3_EH === place.id : f.properties.NAME === name);
    if (!shape) { console.warn(`no border for ${name}`); continue; }
    let rings = (shape.geometry.type === 'Polygon' ? [shape.geometry.coordinates] : shape.geometry.coordinates).flat();
    // across the 180th meridian: the smaller side moves over to the larger one
    const count = side => rings.reduce((a, r) => a + (Math.sign(r[0][0]) === side ? r.length : 0), 0);
    if (rings.some(r => r[0][0] > 150) && rings.some(r => r[0][0] < -150)) {
      const main = count(1) >= count(-1) ? 1 : -1;
      rings = rings.map(r => (Math.sign(r[0][0]) === -main && Math.abs(r[0][0]) > 150 ? r.map(([x, y]) => [x + 360 * main, y]) : r));
    }
    const out = [];
    for (const ring of rings) {
      const t = thin(ring, 0.004);
      let x0 = 180 * 3, y0 = 90, x1 = -180 * 3, y1 = -90;
      for (const [x, y] of t) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      if (t.length < 4 || (rings.length > 1 && Math.max((x1 - x0) * Math.cos(y0 * Math.PI / 180), y1 - y0) < 0.03)) continue; // an islet (the country's only land stays)
      const flat = []; let py = 0, px = 0;
      for (const [x, y] of t) { const iy = Math.round(y * 1000), ix = Math.round(x * 1000); flat.push(iy - py, ix - px); py = iy; px = ix; }
      out.push(flat);
    }
    const buf = JSON.stringify(out);
    fs.writeFileSync(path.join(dir, `${place.id || name.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '')}.json`), buf);
    bytes += buf.length; made++;
  }
  console.log(`${made} borders, ${(bytes / 1e6).toFixed(1)} MB`);
}

if (cmd === 'fetch') await fetchAll();
else if (cmd === 'tiles') await (o.part ? drawPart() : tiles());
else if (cmd === 'countries') await countries();
else if (cmd === 'outlines') await outlines(feature(JSON.parse(fs.readFileSync(await cached(WORLD_URL, 'world-atlas_countries-110m.json'), 'utf8')), 'countries').features.filter(f => f.properties.name !== 'Antarctica'));
else { console.error('usage: coverage fetch|tiles|countries (see the top of this file)'); process.exit(1); }
