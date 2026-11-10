#!/usr/bin/env node
// Places too small to tap, drawn as dots in their layer (engine/model/quiz.js: DOTS). list.json names them: per page,
// per layer, groups of the page's areas, each group one dot. It is the list of 2026-11-10: the items under 3 px with the
// whole map in view (a 1000×700 map) and under an eighth of their layer's typical item, those still under a dot's size
// (11 px) at the page's full zoom, and those whose outline is no area at all; less those too close together for dots
// (they keep their outline). An item asked by tapping every area has only its tiny areas in a dot. Areas of the same
// items lying within a dot's size of each other share one. The world map's places are dots of their own (worldmap.mjs).
//
// For each page the dot goes at the middle of its group's largest area: the centre of the largest circle inside it
// (polylabel), or the area's label point where its outline is no area. It writes data/quizzes/<page>/dots.js
// (const DOTS = { layer: [[x, y, area, …], …] }) and the page's <script> for it before the engine; a page that is no longer
// on the list loses both.
//
//   node tools/builds/tap-dots/build.mjs [--dry]
//
// Run it again after a builder writes a listed page's map anew. An area of the list that is not on its page, or not in
// its layer, stops the run before anything is written.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { parseArgs } from 'node:util';
import { createRequire } from 'node:module';
import { pathRuns, ROOT } from '../../lib/geo.mjs';

const { values: o } = parseArgs({ options: { dry: { type: 'boolean', default: false } } });
const require = createRequire(import.meta.url);
const polylabel = (m => m.default || m)(await import(require.resolve('polylabel')));
const LIST = JSON.parse(fs.readFileSync(new URL('./list.json', import.meta.url), 'utf8'));
const stop = why => { console.error('tap-dots: ' + why + '; stopped, nothing written'); process.exit(1); };

// A page's QUIZ, as the browser has it with every outline there: its scripts run in order in a stand-in for the page
function pageQuiz(id) {
  const dir = path.join(ROOT, 'quizzes', id), html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  const attrs = tag => Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(m => [m[1], m[2]]));
  const body = attrs((html.match(/<body[^>]*>/) || [''])[0]), dataset = {};
  for (const [k, v] of Object.entries(body)) if (k.startsWith('data-')) dataset[k.slice(5).replace(/-(\w)/g, (_, c) => c.toUpperCase())] = v;
  const scripts = [...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)].map(m => ({ ...attrs(m[1]), text: m[2] }));
  const href = 'file://' + path.join(dir, 'index.html');
  let current = null;
  const el = () => ({ style: {}, dataset: {}, classList: { add() {}, remove() {}, toggle() {}, contains: () => false }, setAttribute() {}, append() {}, appendChild() {}, addEventListener() {}, getContext: () => ({ measureText: t => ({ width: String(t).length * 8 }), fillText() {} }) });
  const document = {
    get currentScript() { return current; }, body: { dataset, classList: el().classList, append() {}, appendChild() {} }, head: { append() {}, appendChild() {} },
    documentElement: { dataset: {}, classList: el().classList }, getElementById: () => null, querySelectorAll: () => [], createElement: el, createElementNS: el, write() {}, addEventListener() {},
    querySelector: q => { const m = q.match(/script\[src\$="([^"]+)"\]/), s = m && scripts.find(x => x.src && x.src.endsWith(m[1])); return s ? { src: 'file://' + path.resolve(dir, s.src) } : null; },
  };
  const ctx = { document, location: { href, search: '', pathname: `/quizzes/${id}/index.html` }, URL, URLSearchParams, CSS: { escape: String }, console: { log() {}, warn() {}, error() {} }, navigator: { userAgent: 'node' }, localStorage: { getItem: () => null, setItem() {} }, addEventListener() {}, matchMedia: () => ({ matches: false, addEventListener() {} }), setTimeout, clearTimeout, performance };
  ctx.window = ctx; vm.createContext(ctx);
  const run = (code, file) => vm.runInContext(code.replace(/^(const|let) (\w+)\s*=/gm, 'var $2 ='), ctx, { filename: file });
  const read = f => fs.readFileSync(f, 'utf8');
  for (const s of scripts) {
    if (s.type === 'module') continue;
    if (!s.src) { if (s.text.trim()) { current = { src: href }; run(s.text, id); } continue; }
    const f = path.resolve(dir, s.src);
    if (/engine\/page\.js$/.test(f)) { const m = path.join(ROOT, 'engine/lib/mercator.js'); current = { src: 'file://' + m }; run(read(m), m); continue; }
    if (/data\/quizzes\/[^/]+\/dots\.js$/.test(f)) continue;
    if (/engine\/types\//.test(f)) { // (the outlines and every layer's words before the config, as if brought)
      if (dataset.outlines) { const p = path.resolve(dir, dataset.outlines); if (fs.existsSync(p)) run(read(p), p); }
      if (dataset.words) { const p = path.resolve(dir, dataset.words), d = path.dirname(p); for (const n of fs.readdirSync(d)) if (n.startsWith(path.basename(p)) && n.endsWith('.js')) run(read(path.join(d, n)), n); }
    }
    current = { src: 'file://' + f }; run(read(f), f);
  }
  if (!ctx.QUIZ) throw new Error('no QUIZ');
  return { Q: ctx.QUIZ, html, dataset };
}

// An outline's largest circle inside it: [x, y, diameter]; null where it is no area
const ringArea = r => { let s = 0; for (let i = 0, j = r.length - 1; i < r.length; j = i++) s += (r[j][0] + r[i][0]) * (r[j][1] - r[i][1]); return s / 2; };
const inRing = (r, x, y) => { let c = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const [xi, yi] = r[i], [xj, yj] = r[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
function inside(d) {
  const runs = pathRuns(d); if (!runs) return null;
  const rings = runs.map(r => r.pts).filter(p => p.length >= 3 && Math.abs(ringArea(p)) > 0).sort((a, b) => Math.abs(ringArea(b)) - Math.abs(ringArea(a))), polys = [];
  for (const r of rings) { const [x, y] = r[0], outer = polys.find(P => inRing(P[0], x, y)); if (outer && !outer.slice(1).some(h => inRing(h, x, y))) outer.push(r); else polys.push([r]); }
  let best = null;
  for (const P of polys) {
    const xs = P[0].map(p => p[0]), ys = P[0].map(p => p[1]), c = polylabel(P, Math.max(1e-3, Math.min(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) / 200));
    if (!best || 2 * c.distance > best[2]) best = [c[0], c[1], 2 * c.distance];
  }
  return best && best[2] > 0 ? best : null;
}

// every page first: nothing is written unless all of the list is right
const out = [];
for (const [page, layers] of Object.entries(LIST)) {
  let P; try { P = pageQuiz(page); } catch (e) { stop(`${page}: its page does not load (${e.message})`); }
  const { Q } = P, byId = new Map(Q.areas.map(a => [String(a.id), a])), grain = (Q.proj && Q.proj.grain) || 0.1;
  const round = v => +(Math.round(v / grain) * grain).toFixed(Math.max(0, -Math.floor(Math.log10(grain))));
  const DOTS = {};
  for (const [key, groups] of Object.entries(layers)) {
    const K = Q.kinds.find(k => k.key === key); if (!K) stop(`${page}: no layer ${key}`);
    const ofKind = new Set(K.groups.flatMap(g => g.ids).flatMap(id => (K.areasOf(id) || []).map(String)));
    DOTS[key] = groups.map(g => {
      for (const a of g) { if (!byId.has(String(a))) stop(`${page} ${key}: no area ${a}`); if (!ofKind.has(String(a))) stop(`${page} ${key}: area ${a} is no item's`); }
      const at = g.map(a => ({ a, c: inside(byId.get(String(a)).d) })).sort((x, y) => (y.c ? y.c[2] : -1) - (x.c ? x.c[2] : -1))[0];
      const A = byId.get(String(at.a)), [x, y] = at.c || [A.lx, A.ly];
      if (!isFinite(x) || !isFinite(y)) stop(`${page} ${key}: no place for ${g.join(',')}`);
      return [round(x), round(y), ...g.map(String)];
    });
  }
  out.push({ page, DOTS, html: P.html });
}

const TAG = id => `<script src="../../data/quizzes/${id}/dots.js"></script>`;
const ENGINE = /^(\s*)<script type="module" src="[^"]*engine\/main\.js"><\/script>$/m;
let n = 0;
for (const { page, DOTS, html } of out) {
  const file = path.join(ROOT, 'data/quizzes', page, 'dots.js'), dots = Object.values(DOTS).flat().length;
  const text = `// Made by tools/builds/tap-dots/build.mjs from its list: the places of ${page} too small to tap, as dots, per layer\n// ([x, y, and the areas each stands for]; engine/model/quiz.js)\nconst DOTS = ${JSON.stringify(DOTS)};\n`;
  const next = html.includes(TAG(page)) ? html : html.replace(ENGINE, (m, indent) => `${indent}${TAG(page)}\n${m}`);
  if (next === html && !html.includes(TAG(page))) stop(`${page}: no engine script to put the dots before`);
  console.log(`${page}: ${dots} dot${dots === 1 ? '' : 's'} (${Object.entries(DOTS).map(([k, v]) => `${k} ${v.length}`).join(', ')})`);
  n += dots;
  if (o.dry) continue;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
  if (next !== html) fs.writeFileSync(path.join(ROOT, 'quizzes', page, 'index.html'), next);
}
// a page no longer on the list
for (const id of fs.readdirSync(path.join(ROOT, 'quizzes'))) {
  if (LIST[id]) continue;
  const f = path.join(ROOT, 'quizzes', id, 'index.html'), dots = path.join(ROOT, 'data/quizzes', id, 'dots.js');
  if (!fs.existsSync(f)) continue;
  const html = fs.readFileSync(f, 'utf8');
  if (!html.includes(TAG(id)) && !fs.existsSync(dots)) continue;
  console.log(`${id}: off the list, its dots removed`);
  if (o.dry) continue;
  fs.writeFileSync(f, html.replace(new RegExp(`^\\s*${TAG(id).replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}\\n`, 'm'), ''));
  if (fs.existsSync(dots)) fs.rmSync(dots);
}
console.log(`${out.length} pages, ${n} dots${o.dry ? ' (dry: nothing written)' : ''}`);
