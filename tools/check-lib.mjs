// Helpers for tools/check.mjs: a local server for a site folder, Firefox pages with nothing sent outside this computer,
// and page-side probes (the item asked, the map's transform, drawing, answering). Taken from the test builds in
// tools/cache/builds (draw, name-modes, stats, replay-rating), kept here so the check runs without them.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { firefox } from 'playwright-core';

export const TOOLS = path.dirname(fileURLToPath(import.meta.url));
const TILES = path.join(TOOLS, 'cache', 'builds', 'bare-map', 'tiles-cache'), CDN = path.join(TOOLS, 'cache', 'check', 'cdn');
const PIXEL = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.txt': 'text/plain', '.gs': 'text/plain' };

// The site folder on a free local port.
export async function serve(root) {
  root = path.resolve(root);
  const server = http.createServer((req, res) => {
    let file;
    try { file = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname)); } catch { file = ''; }
    if (file && fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!file.startsWith(root) || !fs.existsSync(file)) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'max-age=3600' }); // (a new port each run: nothing stale)
    fs.createReadStream(file).pipe(res);
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  return { server, base: `http://127.0.0.1:${server.address().port}/` };
}
export const launch = () => firefox.launch();

// Requests leaving this computer: OpenStreetMap tiles from the recorded ones (else a pixel), the satellite map's
// (EOX) a pixel, the d3 and topojson
// scripts of the home and country pages from a copy (fetched once, nothing of the user in it), everything else
// (Google's tiles, fonts) an empty answer.
export const TILE_COUNT = { cached: 0, pixel: 0 };
const cdnWait = new Map();
async function cdn(url) {
  const file = path.join(CDN, url.replace(/^https?:\/\//, '').replace(/[^\w.@-]+/g, '_'));
  if (!fs.existsSync(file)) {
    if (!cdnWait.has(url)) cdnWait.set(url, (async () => {
      const res = await fetch(url); if (!res.ok) throw new Error(res.status + ' ' + url);
      fs.mkdirSync(CDN, { recursive: true }); fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
    })());
    try { await cdnWait.get(url); } catch { return { status: 404, body: '' }; }
  }
  return { status: 200, headers: { 'Content-Type': /\.json$/.test(url) ? 'application/json' : 'text/javascript', 'Access-Control-Allow-Origin': '*' }, body: fs.readFileSync(file) };
}
async function outside(route) {
  const url = route.request().url(), m = url.match(/tile\.openstreetmap\.org\/(\d+)\/(\d+)\/(\d+)\.png/);
  if (m) {
    const f = path.join(TILES, `${m[1]}-${m[2]}-${m[3]}.png`), hit = fs.existsSync(f);
    TILE_COUNT[hit ? 'cached' : 'pixel']++;
    return route.fulfill({ status: 200, headers: { 'Content-Type': 'image/png', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'max-age=86400' }, body: hit ? fs.readFileSync(f) : PIXEL });
  }
  if (/^https:\/\/tiles\.maps\.eox\.at\//.test(url)) { TILE_COUNT.pixel++; return route.fulfill({ status: 200, headers: { 'Content-Type': 'image/png', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'max-age=86400' }, body: PIXEL }); }
  if (/^https:\/\/cdn\.jsdelivr\.net\//.test(url)) return route.fulfill(await cdn(url));
  if (/fonts\.googleapis/.test(url)) return route.fulfill({ status: 200, headers: { 'Content-Type': 'text/css' }, body: '' });
  return route.fulfill({ status: 200, headers: { 'Access-Control-Allow-Origin': '*' }, body: '' });
}
const NOISE = /fonts\.g|tile\.|favicon|NS_ERROR|net::|blocked|google|gstatic|downloadable font/i;

// A page in a context of its own; errors collected. opts: viewport, clock (Playwright's clock, installed before the
// page loads: it runs as time does until fastForward jumps), wait (a selector to wait for after load).
export async function open(browser, url, opts = {}) {
  const ctx = await browser.newContext({ viewport: opts.viewport || { width: 1280, height: 860 }, colorScheme: 'light' });
  await ctx.route(/^https?:\/\/(?!127\.0\.0\.1[:/])/, outside);
  const page = await ctx.newPage(), errors = page.errors = [];
  page.on('pageerror', e => errors.push('page error: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !NOISE.test(m.text())) errors.push('console: ' + m.text()); });
  await page.addInitScript(() => { // (synthetic pointers: Firefox refuses to capture ids it doesn't know)
    const set = Element.prototype.setPointerCapture, rel = Element.prototype.releasePointerCapture;
    Element.prototype.setPointerCapture = function (id) { try { return set.call(this, id); } catch (e) {} };
    Element.prototype.releasePointerCapture = function (id) { try { return rel.call(this, id); } catch (e) {} };
  });
  if (opts.clock) await page.clock.install();
  if (url) await go(page, url, opts.wait);
  return { page, ctx, errors };
}
// To a page; waits for its rounds (a quiz page) or the selector given, at most 15 s, or 1.5 s past a script error.
export async function go(page, url, wait = '#rounds .round') {
  await page.goto(url, { waitUntil: 'load' });
  if (wait) {
    let stop = false;
    const broken = (async () => { while (!stop && !(page.errors || []).length) await new Promise(r => setTimeout(r, 100)); if (!stop) await new Promise(r => setTimeout(r, 1500)); if (!stop) throw new Error(`no ${wait} (a script error)`); })();
    try { await Promise.race([page.waitForSelector(wait, { state: 'attached', timeout: 15000 }), broken]); } finally { stop = true; broken.catch(() => {}); }
  }
  await page.waitForTimeout(150);
}
// Until the map has stopped moving (a round's or a review's view framed), at most 3 s.
export const mapStill = page => page.evaluate(async () => {
  const M = window.QUIZ_MAP; if (!M) return;
  let last = '';
  for (let i = 0; i < 30; i++) {
    const a = M.toScreen(0, 0), b = M.toScreen(1, 0), k = [b[0] - a[0], a[0], a[1]].map(v => v.toFixed(2)).join();
    if (k === last) return; last = k;
    await new Promise(r => setTimeout(r, 100));
  }
});
export const visible = (page, id) => page.evaluate(id => { const e = document.getElementById(id); return !!(e && !e.hidden && e.offsetParent); }, id);

// Pick a round (by label, else the first), a mode and a map, and start. -> the round's modes (not started where the
// mode asked for isn't one of them)
export async function startRound(page, { round, mode, map = 'quiz', hard = false } = {}) {
  const boxes = page.locator('#rounds .round');
  const box = round ? boxes.filter({ hasText: round }).first() : boxes.first();
  await box.click({ position: { x: 10, y: 10 } });
  const picked = page.locator('#rounds .round[aria-pressed="true"]');
  await picked.waitFor({ timeout: 5000 });
  const modes = await picked.locator('.modes button').allTextContents();
  if (mode) {
    if (!modes.includes(mode) && !(mode === 'Map' && !modes.length)) return modes; // (a page without modes plays Map)
    if (modes.length) await picked.locator('.modes button', { hasText: new RegExp(`^${mode}$`) }).click();
  }
  if (hard) {
    const h = picked.locator('.helps button', { hasText: 'Hard mode' });
    modes.hard = !!(await h.count());
    if (modes.hard && (await h.getAttribute('aria-pressed')) !== 'true') await h.click();
  }
  const maps = page.locator(`#mapSeg button[data-map="${map}"]`);
  if (await maps.count() && await maps.isVisible()) await maps.click();
  await page.locator('#startBtn').click();
  await page.waitForSelector('#play', { state: 'visible', timeout: 8000 });
  await mapStill(page);
  modes.started = true;
  return modes;
}

// The item asked, from the question on screen and the page's QUIZ. -> { kind, id, areas: [{ id, d, dot, lx, ly }] }
export function probe(page) {
  return page.evaluate(() => {
    const vis = id => { const e = document.getElementById(id); return e && !e.hidden && e.offsetParent ? e : null; };
    const name = vis('bigname') && (vis('bigname').dataset.name || vis('bigname').textContent.trim()), code = vis('dial') && document.getElementById('code').textContent.trim();
    const src = vis('photo') && document.getElementById('photoImg').dataset.src;
    const keys = document.body.dataset.kinds ? document.body.dataset.kinds.split(/\s+/) : null;
    const found = [];
    for (const k of QUIZ.kinds) {
      if (keys && !keys.includes(k.key)) continue;
      for (const id of [...new Set(k.groups.flatMap(g => g.ids))]) {
        let hit = false;
        if (name && k.name && k.name(id) === name) hit = true;
        if (code && ((k.dial && k.dial(id).map(p => p[0]).join('') === code) || (k.short && String(k.short(id)) === code))) hit = true;
        if (src && k.photo && k.photo(id).src === src) hit = true;
        if (hit) found.push({ kind: k.key, id });
      }
    }
    if (!found.length) return { name, code, src, found: [] };
    const A = Object.fromEntries(QUIZ.areas.map(a => [a.id, a]));
    const { kind, id } = found[0], k = QUIZ.kinds.find(x => x.key === kind);
    return { name, code, src, found, kind, id, areas: k.areasOf(id).map(a => ({ id: a, d: A[a].d, dot: !!A[a].dot, lx: A[a].lx, ly: A[a].ly })) };
  });
}
// The item asked of a kind (a name may be two kinds' at once), waiting for the question to show.
export async function askedItem(page, kind, timeout = 4000) {
  const t0 = Date.now();
  for (;;) {
    const it = await probe(page);
    if (it && it.areas) { const f = kind && it.found.find(x => x.kind === kind); return f ? { ...it, kind: f.kind, id: f.id } : it; }
    if (Date.now() - t0 > timeout) return null;
    await page.waitForTimeout(80);
  }
}

// Click an item of a kind at its first area's label point; then wait for the answer to show (the feedback or the
// question changes), at most 2 s.
export async function clickItem(page, kind, id) {
  const { pt, was } = await page.evaluate(({ kind, id }) => {
    const k = QUIZ.kinds.find(x => x.key === kind), A = Object.fromEntries(QUIZ.areas.map(a => [a.id, a])), a = A[k.areasOf(id)[0]];
    return { pt: QUIZ_MAP.toScreen(a.lx, a.ly), was: document.getElementById('fb').textContent + '|' + document.getElementById('sQ').textContent + '|' + !!document.querySelector('.rv-rate') };
  }, { kind, id });
  await page.mouse.click(pt[0], pt[1]);
  await page.waitForFunction(was => document.getElementById('fb').textContent + '|' + document.getElementById('sQ').textContent + '|' + !!document.querySelector('.rv-rate') !== was, was, { timeout: 2000, polling: 30 }).catch(() => {});
}
// Another item of the kind, none of whose areas are this one's.
export const otherItem = (page, kind, id) => page.evaluate(({ kind, id }) => {
  const k = QUIZ.kinds.find(x => x.key === kind), mine = new Set(k.areasOf(id)), ids = [...new Set(k.groups.flatMap(g => g.ids))];
  return ids.find(x => x !== id && !k.areasOf(x).some(a => mine.has(a)));
}, { kind, id });
export const feedback = page => page.evaluate(() => { const fb = document.getElementById('fb'); return { cls: fb.className, t: (fb.querySelector('.t') || {}).textContent || '', pct: (fb.querySelector('.pct') || {}).textContent || '', c: [...fb.querySelectorAll('.c')].map(p => p.textContent) }; });

/* ---------- Draw ---------- */
function rings(d) {
  const out = []; let ring = null, x = 0, y = 0, cmd = 'M';
  const toks = d.match(/[MmLlZzHhVv]|-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?/g) || [];
  for (let i = 0; i < toks.length;) {
    const t = toks[i];
    if (/[A-Za-z]/.test(t)) { i++; if (/z/i.test(t)) { if (ring) out.push(ring); ring = null; } else cmd = t; continue; }
    if (/h/i.test(cmd)) { x = cmd === 'h' ? x + +t : +t; ring.push([x, y]); i++; continue; }
    if (/v/i.test(cmd)) { y = cmd === 'v' ? y + +t : +t; ring.push([x, y]); i++; continue; }
    const a = +toks[i], b = +toks[i + 1]; i += 2;
    if (cmd === 'M' || cmd === 'm') { if (cmd === 'm') { x += a; y += b; } else { x = a; y = b; } if (ring) out.push(ring); ring = [[x, y]]; cmd = cmd === 'M' ? 'L' : 'l'; }
    else { if (cmd === 'l') { x += a; y += b; } else { x = a; y = b; } ring.push([x, y]); }
  }
  if (ring) out.push(ring);
  return out;
}
const shoelace = r => { let s = 0; for (let i = 0; i < r.length; i++) { const [x0, y0] = r[i], [x1, y1] = r[(i + 1) % r.length]; s += x0 * y1 - x1 * y0; } return s / 2; };
function outer(d) {
  const rs = rings(d).filter(r => r.length > 2);
  const inside = (p, r) => { let c = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const [xi, yi] = r[i], [xj, yj] = r[j]; if ((yi > p[1]) !== (yj > p[1]) && p[0] < (xj - xi) * (p[1] - yi) / (yj - yi) + xi) c = !c; } return c; };
  return rs.filter(r => !rs.some(o => o !== r && Math.abs(shoelace(o)) > Math.abs(shoelace(r)) && inside(r[0], o)));
}
const boxOf = pts => { const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]); return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]; };
export function placeOf(item) {
  const rs = item.areas.flatMap(a => (a.dot ? [[[a.lx - .5, a.ly - .5], [a.lx + .5, a.ly - .5], [a.lx + .5, a.ly + .5], [a.lx - .5, a.ly + .5]]] : outer(a.d)));
  return { rings: rs, box: boxOf(rs.flat()) };
}
// A perfect outline of the place asked, or a circle of its size beside it; then Done. -> { item, fb }
// All in the page, by pointer and wheel events (a round trip per mouse move is slow): the map moved (right button)
// and zoomed (wheel) until the place fills a good part of the stage, then the outline drawn (left button).
export async function drawOne(page, how) {
  const item = await askedItem(page);
  if (!item) return { item: null, fb: null };
  const P = placeOf(item);
  const t = await page.evaluate(async ({ rings, box, how }) => {
    const surface = QUIZ_MAP.surface, stage = document.getElementById('stage'), fill = how === 'beside' ? 0.25 : 0.6;
    const frame = () => new Promise(r => requestAnimationFrame(() => r())), sleep = ms => new Promise(r => setTimeout(r, ms));
    const to = (m, [x, y]) => QUIZ_MAP.toScreen(x, y); // (m: unused, the view of now)
    const ptr = (type, [x, y], button, buttons) => surface.dispatchEvent(new PointerEvent(type, { pointerId: 1, pointerType: 'mouse', isPrimary: true, clientX: x, clientY: y, button, buttons, bubbles: true, cancelable: true }));
    const line = (pts, button = 0) => { const bs = button === 2 ? 2 : 1; ptr('pointerdown', pts[0], button, bs); for (const p of pts.slice(1)) ptr('pointermove', p, -1, bs); ptr('pointerup', pts[pts.length - 1], button, 0); };
    let steps = 0;
    for (; steps < 40; steps++) {
      const m = null, S = stage.getBoundingClientRect();
      const [x0, y0] = to(m, [box[0], box[1]]), [x1, y1] = to(m, [box[2], box[3]]);
      const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, sx = S.left + S.width / 2, sy = S.top + S.height / 2, k = Math.max((x1 - x0) / S.width, (y1 - y0) / S.height);
      if (Math.hypot(cx - sx, cy - sy) > 20) {
        const dx = sx - cx, dy = sy - cy, f = Math.min(1, (Math.min(S.width, S.height) * 0.4) / Math.hypot(dx, dy));
        const a = [sx - dx * f / 2, sy - dy * f / 2], b = [sx + dx * f / 2, sy + dy * f / 2];
        line([a, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], b], 2);
      } else if (k > Math.min(0.85, fill * 1.33) || k < fill * 0.75) {
        const f = Math.min(1.8, Math.max(1 / 1.8, fill / k));
        surface.dispatchEvent(new WheelEvent('wheel', { deltaY: -Math.log(f) / 0.0022, deltaMode: 0, clientX: sx, clientY: sy, bubbles: true, cancelable: true }));
      } else break;
      await frame(); await frame();
    }
    await sleep(200); await frame(); // (the picture drawn again for the view)
    const m = null, bx = r => { const xs = r.map(p => p[0]), ys = r.map(p => p[1]); return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]; };
    const tool = document.querySelector('.drawbar .tools [data-tool="outline"]');
    if (tool && tool.getAttribute('aria-pressed') !== 'true') tool.click();
    if (how === 'outline') {
      for (const r of rings.map(r => r.map(p => to(m, p))).filter(r => { const b = bx(r); return b[2] - b[0] > 3 || b[3] - b[1] > 3; })) {
        const k = Math.ceil(r.length / 150), pts = r.filter((_, i) => i % k === 0); pts.push(pts[0]);
        line(pts); await frame();
      }
    } else {
      const [x0, y0] = to(m, [box[0], box[1]]), [x1, y1] = to(m, [box[2], box[3]]), r = Math.max(x1 - x0, y1 - y0) / 2, cx = (x0 + x1) / 2 + (x1 - x0) * 1.1, cy = (y0 + y1) / 2;
      line(Array.from({ length: 41 }, (_, i) => [cx + r * Math.cos(i / 40 * 2 * Math.PI), cy + r * Math.sin(i / 40 * 2 * Math.PI)]));
      await frame();
    }
    return { steps, pieces: QUIZ_MAP.pieces() };
  }, { rings: P.rings, box: P.box, how });
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => /ok|bad/.test(document.getElementById('fb').className) && document.querySelector('#fb .pct'), null, { timeout: 5000 }).catch(() => {});
  return { item, fb: await feedback(page), ...t };
}

/* ---------- Name it and Shape: the place asked, by the box of its outline or shape ---------- */
export function asked(page, kind) {
  return page.evaluate(kind => {
    const K = QUIZ.kinds.find(k => k.key === kind), A = Object.fromEntries(QUIZ.areas.map(a => [a.id, a]));
    const boxOfD = d => {
      const t = d.match(/[MmLlZzHhVv]|-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?/g) || []; let x = 0, y = 0, c = 'M', b = [Infinity, Infinity, -Infinity, -Infinity];
      const add = () => { b = [Math.min(b[0], x), Math.min(b[1], y), Math.max(b[2], x), Math.max(b[3], y)]; };
      for (let i = 0; i < t.length;) {
        if (/[A-Za-z]/.test(t[i])) { c = t[i++]; if (/z/i.test(c)) c = 'L'; continue; }
        if (/h/i.test(c)) { x = c === 'h' ? x + +t[i] : +t[i]; i++; add(); continue; }
        if (/v/i.test(c)) { y = c === 'v' ? y + +t[i] : +t[i]; i++; add(); continue; }
        const a = +t[i], q = +t[i + 1]; i += 2;
        if (c === 'm' || c === 'l') { x += a; y += q; } else { x = a; y = q; }
        if (c === 'M') c = 'L'; if (c === 'm') c = 'l';
        add();
      }
      return b;
    };
    const ids = [...new Set(K.groups.flatMap(g => g.ids))];
    const own = id => (K.prompt === 'text' && K.text ? K.text(id).text : K.name(id));
    const of = K.of && QUIZ.kinds.find(k => k.key === K.of);
    const out = id => ({ id, own: own(id), name: K.name(id), latin: of ? of.name(id) : K.name(id) });
    const line = QUIZ_MAP.asked(), shape = document.querySelector('.shape:not([hidden]) .fill');
    if (!shape && !line) return null;
    const want = shape ? (bb => [bb.x, bb.y, bb.x + bb.width, bb.y + bb.height])(shape.getBBox()) : boxOfD(line);
    let best = null, err = Infinity;
    for (const id of ids) {
      const b = K.areasOf(id).map(a => boxOfD(A[a].d)).reduce((m, b) => [Math.min(m[0], b[0]), Math.min(m[1], b[1]), Math.max(m[2], b[2]), Math.max(m[3], b[3])], [Infinity, Infinity, -Infinity, -Infinity]);
      const e = b.reduce((s, v, i) => s + Math.abs(v - want[i]), 0);
      if (e < err) { err = e; best = id; }
    }
    return { ...out(best), err };
  }, kind);
}
export const listed = page => page.locator('#typedList .opt').allTextContents();

/* ---------- the answer log and the cards ---------- */
export const hasLog = page => page.evaluate(() => typeof ANSWERS === 'object' && typeof ANSWERS.all === 'function');
export const lastAnswers = (page, n) => page.evaluate(async n => { if (ANSWERS.flush) await ANSWERS.flush(true); return (await ANSWERS.all()).answers.slice(-n); }, n);
export const card = (page, key) => page.evaluate(key => { const id = document.body.dataset.quiz || location.pathname.replace(/\/(index\.html)?$/, '').split('/').pop(); const c = SRS.deck(id).c[key]; return c ? { ...c } : null; }, key);

/* ---------- a stand-in of the online copy (the sheet script's answers, rows in memory) ---------- */
export async function standin() {
  const APP = 'geo-quizzes', WHAT = /^(settings|review|quiz\.[\w.-]+)$/;
  const rows = new Map(); let rev = 0;
  const changed = since => Object.fromEntries([...rows].filter(([, r]) => r.rev > since).map(([k, r]) => [k, JSON.parse(r.text)]));
  const server = http.createServer((req, res) => {
    const send = o => { res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }); res.end(JSON.stringify({ app: APP, ...o })); };
    const u = new URL(req.url, 'http://x');
    if (req.method === 'GET') { const since = +u.searchParams.get('since') || 0; return send({ rev, items: since === rev ? {} : changed(since > rev ? 0 : since) }); }
    let body = ''; req.on('data', c => { body += c; }); req.on('end', () => {
      try {
        const sent = JSON.parse(body), since = +sent.since || 0, others = changed(since > rev ? 0 : since), keys = Object.keys(sent.items).filter(k => WHAT.test(k));
        if (keys.some(k => k in others)) return send({ ok: false, rev, items: others });
        rev++;
        for (const k of keys) rows.set(k, { rev, text: JSON.stringify(sent.items[k]) });
        send({ ok: true, rev, items: others });
      } catch (e) { send({ error: String(e.message) }); }
    });
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  return { server, url: `http://127.0.0.1:${server.address().port}/exec`, rows };
}
