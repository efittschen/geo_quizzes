#!/usr/bin/env node
// The review page's map (By map, assets/js/review-map.js): every quiz's layers as the quiz map draws them, laid on
// the plain world map, kept once as data/review/<page>.json, and the world itself as data/review/world.json, so the
// review page draws them as they come and works nothing out.
//
//   node tools/builds/review-map/build.mjs [<page> …] [--world] [--dry]
//
// Without pages: every page in data/site/quizzes.json with the area quiz engine (and the world). Each page is opened in
// headless Chromium with window.REVIEW_DUMP set, served from this folder as the layer-shapes tool serves it (no stored
// shapes, the areas' outlines from the start), and the engine itself says, for each kind: its units (the areas it
// draws as one shape, engine/map/layouts.js, or each area alone), the items each unit stands for, and each unit's
// shape (layouts' whole shape for a unit of several areas, else its area's outline; a dot as its point). Those are
// moved from the page's map units onto the world's plane by the page's projection, thinned (Douglas-Peucker, about a
// thousandth of the page's map) and rounded.
//
// The world's plane (shared with world.json): Web Mercator, x from 169° W (so that no land but a sliver of Chukotka is
// cut), W units for 360°, y from 83.7° N down to 56.5° S; whole units (W = 200,000: about 200 m at the equator).
//
// <page>.json: { v: 1, W, kinds: { <kind>: { n, box, units } } }   (a page without a projection: { v, W, kinds: {} },
//   n per kind still, units none)
//   n       how many items the kind has (its total)
//   box     [x, y, w, h]: what to show of it: the rings that make up 98% of its land, any ring of 0.1% or more, and
//           every dot (so a far island doesn't shrink the rest)
//   units   [{ i: [items], r: [ring, …], l: [line, …] } or { i: [items], p: [x, y] }]: a ring or line its points as
//           [x, y, dx, dy, dx, dy, …] (the first point, then each the step from the one before); p: a dot
// world.json: { v: 1, W, H, countries: [{ id, n, r: [ring, …] }] }   (id: ISO 3166 numeric, as data/site/world.json)
//
// Run it again after a page's areas or kinds change (with tools/builds/layer-shapes), or for a new page.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { createRequire } from 'node:module';
import { chromium } from 'playwright-core';
import { ROOT } from '../../lib/geo.mjs';

const require = createRequire(import.meta.url);
const d3 = require('d3-geo'), topo = require('topojson-client');
const { values: o, positionals } = parseArgs({ allowPositionals: true, options: { dry: { type: 'boolean', default: false }, world: { type: 'boolean', default: false } } });
const OUT = path.join(ROOT, 'data/review');
const ENGINE = /<script type="module" src="[^"]*engine\/main\.js"><\/script>/;
const listed = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/site/quizzes.json'), 'utf8')).quizzes;
const pageOf = q => (q.url || '').match(/^quizzes\/([^/]+)\/index\.html$/)?.[1];
const all = [...new Set(listed.map(pageOf).filter(Boolean))].filter(id => { const f = path.join(ROOT, 'quizzes', id, 'index.html'); return fs.existsSync(f) && ENGINE.test(fs.readFileSync(f, 'utf8')); });
const pages = positionals.length ? positionals : o.world ? [] : all;
const world = o.world || !positionals.length;

/* ---------- the plane ---------- */
const W = 200000, L0 = -169, S = W / 360, RAD = Math.PI / 180;
const my = lat => Math.log(Math.tan(Math.PI / 4 + Math.max(-85.05, Math.min(85.05, lat)) * RAD / 2)) / RAD;
const YMAX = my(83.7), YMIN = my(-56.5), H = Math.round((YMAX - YMIN) * S);

/* ---------- outlines: read, thinned, written ---------- */
// An SVG path (M, L, H, V, Z, absolute or relative; what the pages' outlines use) as runs of points, each closed or not.
function runs(d) {
  const out = [], re = /([MLHVZmlhvz])|(-?\d*\.?\d+(?:e-?\d+)?)/g; let cmd = '', nums = [], x = 0, y = 0, run = null, m;
  const flush = () => {
    const C = cmd.toUpperCase(), rel = cmd !== C;
    if (C === 'H' || C === 'V') for (const v of nums) { if (C === 'H') x = rel ? x + v : v; else y = rel ? y + v : v; run.pts.push([x, y]); }
    else for (let i = 0; i + 1 < nums.length; i += 2) {
      x = rel ? x + nums[i] : nums[i]; y = rel ? y + nums[i + 1] : nums[i + 1];
      if (C === 'M' && i === 0) out.push(run = { pts: [], closed: false });
      if (!run) out.push(run = { pts: [], closed: false });
      run.pts.push([x, y]);
    }
    nums = [];
  };
  while ((m = re.exec(d))) {
    if (m[1]) { if (cmd) flush(); cmd = m[1]; if (cmd === 'Z' || cmd === 'z') { if (run) { run.closed = true; [x, y] = run.pts[0] || [x, y]; } cmd = ''; } }
    else { if (!cmd) cmd = 'L'; nums.push(+m[2]); }
  }
  if (cmd) flush();
  return out.filter(r => r.pts.length);
}
// Douglas-Peucker, iterative
function thin(pts, tol) {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1; const st = [[0, pts.length - 1]];
  while (st.length) {
    const [i, j] = st.pop(), [ax, ay] = pts[i], [bx, by] = pts[j], L = Math.hypot(bx - ax, by - ay) || 1e-9; let md = -1, mi = -1;
    for (let k = i + 1; k < j; k++) { const dd = Math.abs((bx - ax) * (ay - pts[k][1]) - (ax - pts[k][0]) * (by - ay)) / L; if (dd > md) { md = dd; mi = k; } }
    if (md > tol) { keep[mi] = 1; st.push([i, mi], [mi, j]); }
  }
  return pts.filter((_, k) => keep[k]);
}
// A run on the plane, thinned and in whole units: [x, y, dx, dy, …], or null where nothing is left. A closed one is cut
// at its point farthest from the first, so that neither half's ends are the same point; rings: its size and box, kept.
function encode(r, f, tol, rings) {
  let p = r.pts.map(f);
  if (r.closed) {
    let far = 0, fd = -1; for (let k = 1; k < p.length; k++) { const dd = Math.hypot(p[k][0] - p[0][0], p[k][1] - p[0][1]); if (dd > fd) { fd = dd; far = k; } }
    p = far ? [...thin(p.slice(0, far + 1), tol).slice(0, -1), ...thin([...p.slice(far), p[0]], tol).slice(0, -1)] : [];
  } else p = thin(p, tol);
  const q = []; for (const [x, y] of p) { const X = Math.round(x), Y = Math.round(y); if (!q.length || X !== q[q.length - 1][0] || Y !== q[q.length - 1][1]) q.push([X, Y]); }
  if (r.closed && q.length > 1 && q[0][0] === q[q.length - 1][0] && q[0][1] === q[q.length - 1][1]) q.pop();
  if (q.length < (r.closed ? 3 : 2)) return null;
  if (r.closed) {
    let a = 0, x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (let i = 0; i < q.length; i++) { const [xa, ya] = q[i], [xb, yb] = q[(i + 1) % q.length]; a += xa * yb - xb * ya; x0 = Math.min(x0, xa); y0 = Math.min(y0, ya); x1 = Math.max(x1, xa); y1 = Math.max(y1, ya); }
    if (Math.abs(a / 2) < 1) return null;
    if (rings) rings.push({ a: Math.abs(a / 2), b: [x0, y0, x1, y1] });
  }
  const out = [q[0][0], q[0][1]];
  for (let i = 1; i < q.length; i++) out.push(q[i][0] - q[i - 1][0], q[i][1] - q[i - 1][1]);
  return out;
}

/* ---------- the world ---------- */
function buildWorld() {
  const w = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/site/world.json'), 'utf8'));
  const proj = d3.geoMercator().rotate([-(L0 + 180), 0]).scale(S * 180 / Math.PI).translate([W / 2, YMAX * S]).clipExtent([[0, 0], [W, H]]);
  const gp = d3.geoPath(proj).digits(1), tol = W / 4000;
  const countries = topo.feature(w, w.objects.countries).features.filter(f => f.id !== '010').map(f => {
    const r = runs(gp(f) || '').filter(x => x.closed).map(x => encode(x, p => p, tol, null)).filter(Boolean);
    return r.length ? { id: f.id, n: f.properties.name, r } : null;
  }).filter(Boolean);
  return { v: 1, W, H, countries };
}

/* ---------- a page ---------- */
function buildPage(id, dump) {
  const out = { v: 1, W, kinds: {} };
  const { proj, size } = dump;
  for (const K of dump.kinds) {
    const entry = (out.kinds[K.key] = { n: K.n });
    if (!proj) continue;
    // page map units -> the plane (lng = lng0 + x/k, Mercator y = y0 - y/k), the page's middle kept within the plane
    let { k, lng0, y0 } = proj, c = lng0 + size[0] / k / 2;
    while (c - L0 >= 360) { lng0 -= 360; c -= 360; } while (c - L0 < 0) { lng0 += 360; c += 360; }
    const f = ([x, y]) => [(lng0 - L0) * S + x * S / k, (YMAX - y0) * S + y * S / k];
    const tol = Math.max(size[0], size[1]) * 0.0006 * S / k;
    const units = [], rings = [];
    for (const u of K.units) {
      if (u.p) { const [x, y] = f(u.p); units.push({ i: u.i, p: [Math.round(x), Math.round(y)] }); continue; }
      const rs = runs(u.d), r = [], l = [];
      for (const x of rs) { const e = encode(x, f, tol, x.closed ? rings : null); if (e) (x.closed ? r : l).push(e); }
      if (r.length || l.length) units.push({ i: u.i, ...(r.length ? { r } : {}), ...(l.length ? { l } : {}) });
      else if (rs.length) { const [x, y] = f(rs[0].pts[0]); units.push({ i: u.i, p: [Math.round(x), Math.round(y)] }); } // (an outline of no length: a dot)
    }
    if (!units.length) continue;
    let box = null; const grow = b => { box = box ? [Math.min(box[0], b[0]), Math.min(box[1], b[1]), Math.max(box[2], b[2]), Math.max(box[3], b[3])] : b.slice(); };
    const tot = rings.reduce((x, r) => x + r.a, 0); let acc = 0;
    for (const r of rings.sort((a, b) => b.a - a.a)) { if (acc < tot * 0.98 || r.a >= tot * 0.001) grow(r.b); acc += r.a; }
    for (const u of units) if (u.p) grow([u.p[0], u.p[1], u.p[0], u.p[1]]);
    if (!box) for (const u of units) for (const run of [...(u.l || [])]) { let x = run[0], y = run[1]; grow([x, y, x, y]); for (let i = 2; i < run.length; i += 2) { x += run[i]; y += run[i + 1]; grow([x, y, x, y]); } }
    entry.box = box && [box[0], box[1], box[2] - box[0], box[3] - box[1]];
    entry.units = units;
  }
  return out;
}

/* ---------- the pages, opened as the layer-shapes tool opens them ---------- */
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname), file = path.join(ROOT, rel);
  const stored = /^\/(data\/quizzes|quizzes)\/[^/]+\/shapes\.js$/.test(rel); // (no stored shapes: the engine works them out)
  if (!file.startsWith(ROOT) || stored || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end('not found'); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
  // (a page that leaves the areas' outlines for later has them from the start)
  if (file.endsWith('.html')) { const html = fs.readFileSync(file, 'utf8'), lazy = /data-outlines="([^"]*)"/.exec(html); return res.end(html.replace(/ data-outlines="([^"]*)"/, '').replace(/(<script src="[^"]*data\/maps\/[^"/]+\/(?:shapes|data)\.js"><\/script>)/, tag => (lazy ? `${tag}<script src="${lazy[1]}"></script>` : tag))); }
  fs.createReadStream(file).pipe(res);
});

// What the page's engine says (run in the page): per kind its total and its units, as plain data.
function readOut() {
  const { quiz, model, map } = window.REVIEW_IN, A = id => map.area(id) || {};
  const byId = new Map(quiz.areas.map(a => [String(a.id), a]));
  const outline = a => { const x = byId.get(String(a)); return (x && (x.d || (quiz.outlineOf && quiz.outlineOf(x.id)))) || ''; };
  const kinds = model.kinds.list.filter(K => K.ids && K.at).map(K => {
    const L = map.layout(K), dump = L ? map.dump([K]).kinds[K.key] : null, at = K.at;
    const groups = L ? L.units : quiz.areas.filter(a => !a.only).map(a => [String(a.id)]);
    const units = [];
    groups.forEach((u, i) => {
      const items = at[u[0]] ? [...at[u[0]]].map(String) : null; if (!items || !items.length) return;
      const solo = u.length === 1 ? A(u[0]) : null;
      if (solo && solo.dot) { units.push({ i: items, p: [solo.lx, solo.ly] }); return; }
      const whole = dump && dump.fill[i] ? String(dump.fill[i]) : u.map(outline).join('');
      if (whole) units.push({ i: items, d: whole });
    });
    // (a layer's own dots, drawn alone where its areas are too small to tap: each a unit of the items it stands for)
    for (const a of quiz.areas) if (a.only && at[a.id]) units.push({ i: [...at[a.id]].map(String), p: [a.lx, a.ly] });
    return { key: K.key, n: new Set(K.ids.map(String)).size, units };
  });
  return { proj: quiz.proj ? { k: quiz.proj.k, lng0: quiz.proj.lng0, y0: quiz.proj.y0 } : null, size: quiz.size, kinds };
}

if (world) {
  const w = buildWorld(), text = JSON.stringify(w);
  if (!o.dry) { fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(path.join(OUT, 'world.json'), text); }
  console.log('world', w.countries.length, 'countries', (text.length / 1024).toFixed(0), 'KB');
}
if (pages.length) {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}/`;
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 860 } });
  await context.addInitScript(() => { window.REVIEW_DUMP = true; });
  await context.route(u => !u.href.startsWith(base), r => r.abort());
  let done = 0, failed = [], bytes = 0;
  const queue = pages.slice();
  const work = async () => {
    for (let id; (id = queue.shift()); ) {
      const page = await context.newPage(), errs = [];
      page.on('pageerror', e => errs.push(String(e)));
      try {
        await page.goto(`${base}quizzes/${id}/index.html`, { waitUntil: 'load' });
        await page.waitForFunction(() => window.REVIEW_IN || null, null, { timeout: 60000 });
        const out = buildPage(id, await page.evaluate(readOut)), text = JSON.stringify(out);
        bytes += text.length;
        if (!o.dry) { fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(path.join(OUT, `${id}.json`), text); }
        done++;
        console.log('ok', id, Object.entries(out.kinds).map(([k, v]) => `${k}:${v.units ? v.units.length : '-'}`).join(' '), (text.length / 1024).toFixed(0), 'KB');
      } catch (e) { failed.push(id); console.log('FAIL', id, String(e).split('\n')[0].slice(0, 160), errs[0] ? '| ' + errs[0].slice(0, 160) : ''); }
      await page.close();
    }
  };
  await Promise.all(Array.from({ length: 4 }, work));
  await browser.close(); server.close();
  console.log(`${done} pages, ${(bytes / 1048576).toFixed(1)} MB${o.dry ? ' (dry: nothing written)' : ''}${failed.length ? `; failed: ${failed.join(' ')}` : ''}`);
  if (failed.length) process.exitCode = 1;
}
