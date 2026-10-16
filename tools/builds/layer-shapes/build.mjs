#!/usr/bin/env node
// The shapes of every layer whose items group areas (a state of Kreise, a code zone of towns), worked out once and
// kept beside the page as shapes.js, so the page does not work them out each time it opens.
//
//   node tools/builds/layer-shapes/build.mjs [quizzes/<page>/index.html …] [--dry]
//
// Without pages: every page of the area quiz engine. Each page is opened in headless Chromium with
// window.SHAPES_DUMP set, and the engine itself (quizzes/shared/area-quiz.js) works out, for each of the page's kinds
// that groups areas: the units' colors, each unit as one shape and its outlines in both versions (zoomed out, zoomed
// in). Their lines are then kept once each (arcs, as in TopoJSON: a line two units share is in both their shapes and
// in both versions of their outlines), and the shapes as lists of arcs. That is written to the page's folder as
// shapes.js, and the page gets <script src="shapes.js"> before the engine. A page with no such kind gets neither
// (an old shapes.js is removed). --dry writes nothing and says what would change.
// The street map's outlines (the overlay) are worked out by the page from the same arcs, on a Mercator quiz map.
//
// The engine checks that the units it finds in the page's data are the ones the shapes were made for (sig) and
// else works everything out itself, as before: data changed and this not run again only makes the page slower to
// open. Run it again after a change to a page's areas, its kinds, or the engine's way of drawing units.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright-core';
import { ROOT } from '../../lib/geo.mjs';

const { values: o, positionals } = parseArgs({ allowPositionals: true, options: { dry: { type: 'boolean', default: false } } });
const ENGINE = /^(\s*)<script src="([^"]*)shared\/area-quiz\.js"><\/script>$/m, TAG = '<script src="shapes.js"></script>';
const pages = positionals.length ? positionals : fs.readdirSync(path.join(ROOT, 'quizzes')).map(d => `quizzes/${d}/index.html`)
  .filter(p => fs.existsSync(path.join(ROOT, p)) && ENGINE.test(fs.readFileSync(path.join(ROOT, p), 'utf8')));

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' };
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const file = path.join(ROOT, rel);
  // (a page is opened without the shapes it has now: they are what is being made)
  if (!file.startsWith(ROOT) || path.basename(file) === 'shapes.js' || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end('not found'); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/`;
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 860 } });
await context.addInitScript(() => { window.SHAPES_DUMP = true; });
await context.route(/fonts\.(googleapis|gstatic)\.com|tile\.openstreetmap\.org/, r => r.abort());

const kb = n => (n / 1024).toFixed(0) + ' KB';

/* Paths -> arcs. Points in 1/q of a map unit (q: the engine's own rounding, QN). A point is the end of an arc where
   lines meet or part (it has other than two neighbours) or where an open line ends; a ring with no such point is cut
   at its least point. Every arc is kept once, either way round. */
function topo({ q: QN, kinds }) {
  const seqs = [];
  const parse = (d, closed) => (d || '').split('M').filter(Boolean).map(part => {
    let pts = part.replace(/Z$/, '').split('L').map(t => t.split(',').map(v => Math.round(+v * QN)).join(','));
    pts = pts.filter((k, i) => i === 0 || k !== pts[i - 1]);
    if (closed && pts.length > 1 && pts[0] === pts.at(-1)) pts.pop();
    const seq = { pts, closed };
    if (pts.length >= (closed ? 3 : 2)) seqs.push(seq);
    return seq;
  }).filter(seq => seq.pts.length >= (closed ? 3 : 2));
  const parsed = Object.fromEntries(Object.entries(kinds).map(([k, K]) => [k, {
    fill: K.fill.map(d => d && parse(d, true)),
    lines: K.lines.map(ls => ls.map(d => parse(d, false))),
  }]));
  const nb = new Map(), J = new Set();
  for (const q of seqs) {
    const n = q.pts.length;
    for (let i = 0; i < n; i++) {
      const k = q.pts[i]; let s = nb.get(k); if (!s) nb.set(k, s = new Set());
      if (q.closed || i > 0) s.add(q.pts[(i - 1 + n) % n]);
      if (q.closed || i < n - 1) s.add(q.pts[(i + 1) % n]);
    }
    if (!q.closed) { J.add(q.pts[0]); J.add(q.pts[n - 1]); }
  }
  for (const [k, s] of nb) if (s.size !== 2) J.add(k);
  const least = pts => pts.reduce((m, k) => { const [x, y] = k.split(',').map(Number), [mx, my] = m.split(',').map(Number); return x < mx || (x === mx && y < my) ? k : m; });
  for (const q of seqs) if (q.closed && !q.pts.some(k => J.has(k))) J.add(least(q.pts));
  const arcs = [], index = new Map();
  const ref = pts => {
    const f = pts.join(';'); if (index.has(f)) return index.get(f);
    const r = pts.slice().reverse().join(';'); if (index.has(r)) return ~index.get(r);
    index.set(f, arcs.length); arcs.push(pts); return arcs.length - 1;
  };
  const cut = q => {
    let p = q.pts;
    if (q.closed) { const s = p.findIndex(k => J.has(k)); p = [...p.slice(s), ...p.slice(0, s), p[s]]; }
    const out = []; let from = 0;
    for (let i = 1; i < p.length; i++) if (J.has(p[i])) { out.push(ref(p.slice(from, i + 1))); from = i; }
    // (check: the arcs give the line back, point for point; a ring may start at another of its points)
    const back = []; for (const r of out) { const a = r < 0 ? arcs[~r].slice().reverse() : arcs[r]; back.pop(); back.push(...a); }
    if (back.join(';') !== p.join(';')) throw new Error('arcs do not give the line back');
    return out;
  };
  const out = {};
  for (const [k, K] of Object.entries(kinds)) out[k] = {
    sig: K.sig, color: K.color,
    fill: parsed[k].fill.map(rings => rings && rings.map(cut)),
    lines: parsed[k].lines.map(ls => ls.map(runs => runs.map(cut))),
    loose: K.loose,
  };
  const enc = arcs.map(pts => { const flat = []; let px = 0, py = 0; pts.forEach((k, i) => { const [x, y] = k.split(',').map(Number); flat.push(i ? x - px : x, i ? y - py : y); px = x; py = y; }); return flat; });
  return { v: 1, q: QN, arcs: enc, lv: arcs.map(pts => levels(pts.map(k => k.split(',').map(Number)))), kinds: out };
}

/* How fine a view needs each point of an arc (as Douglas–Peucker simplifies, once for every tolerance): a point's
   importance is how far it lies off the line between the points kept around it, at most that of the point that split
   its stretch (so a point kept at some tolerance keeps those around it). Stored as a level, for the points between the
   arc's ends (which always stay): 0 under one unit of 1/q, else 1 + whole log2 of the importance in those units. The
   engine keeps, at a tolerance of 2^(T-1) units, the points of level T or more. */
function levels(pts) {
  const n = pts.length, imp = new Float64Array(n), stack = [[0, n - 1, Infinity]];
  while (stack.length) {
    const [i, j, cap] = stack.pop(); if (j - i < 2) continue;
    const [ax, ay] = pts[i], [bx, by] = pts[j], len = Math.hypot(bx - ax, by - ay);
    let m = -1, md = -1;
    for (let k = i + 1; k < j; k++) {
      const [x, y] = pts[k], d = len ? Math.abs((bx - ax) * (ay - y) - (ax - x) * (by - ay)) / len : Math.hypot(x - ax, y - ay); // (a closed arc: off its one end)
      if (d > md) { md = d; m = k; }
    }
    imp[m] = Math.min(md, cap);
    stack.push([i, m, imp[m]], [m, j, imp[m]]);
  }
  const out = [];
  for (let k = 1; k < n - 1; k++) out.push(imp[k] >= 1 ? Math.min(40, Math.floor(Math.log2(imp[k])) + 1) : 0);
  return out;
}
let written = 0, removed = 0, failed = 0;
for (const p of pages) {
  const html = path.join(ROOT, p), dir = path.dirname(html), out = path.join(dir, 'shapes.js');
  const page = await context.newPage(), errors = [];
  page.on('pageerror', e => errors.push(e.message));
  try {
    await page.goto(base + p, { waitUntil: 'load' });
    const shapes = await page.waitForFunction(() => window.SHAPES_OUT, null, { timeout: 120000 }).then(h => h.jsonValue());
    if (errors.length) throw new Error(errors[0]);
    const kinds = Object.keys(shapes.kinds), src = fs.readFileSync(html, 'utf8'), has = src.includes(TAG);
    if (!kinds.length) {
      console.log(`${p}: no kind groups areas`);
      if (!o.dry) { if (has) fs.writeFileSync(html, src.replace(new RegExp('^\\s*' + TAG.replace(/[.]/g, '\\.') + '\\n', 'm'), '')); if (fs.existsSync(out)) fs.rmSync(out); }
      if (has || fs.existsSync(out)) removed++;
    } else {
      const text = `// Made by tools/builds/layer-shapes/build.mjs from this page's data (the layers whose items group areas)\nconst SHAPES = ${JSON.stringify(topo(shapes))};\n`;
      const same = fs.existsSync(out) && fs.readFileSync(out, 'utf8') === text && has;
      console.log(`${p}: ${kinds.map(k => `${k} (${shapes.kinds[k].fill.length} units)`).join(', ')} · ${kb(text.length)}${same ? ' · unchanged' : ''}`);
      if (!same) written++;
      if (!o.dry && !same) {
        fs.writeFileSync(out, text);
        if (!has) fs.writeFileSync(html, src.replace(ENGINE, (line, indent) => `${indent}${TAG}\n${line}`));
      }
    }
  } catch (e) {
    failed++;
    console.log(`${p}: FAILED ${e.message.split('\n')[0]}`);
  }
  await page.close();
}
await browser.close(); server.close();
console.log(`${pages.length} pages: ${written} shapes.js ${o.dry ? 'to write' : 'written'}, ${removed} ${o.dry ? 'to remove' : 'removed'}, ${failed} failed`);
process.exit(failed ? 1 : 0);
