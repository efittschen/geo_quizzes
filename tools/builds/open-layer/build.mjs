#!/usr/bin/env node
// A page loads only the layer that is open. A layer whose shapes are stored (data/quizzes/<id>/shapes.js) is drawn
// without the outlines of the map's areas, so those go to a file of their own, data/maps/<map>/outlines.js, which gives
// the map's DATA its outlines when it is loaded. For each page, by the engine's own model:
//   it opens on a layer drawn from stored shapes  <body data-outlines="…/outlines.js">: the engine brings the file when
//                                                 something asks for the areas themselves (engine/map/shapes.js)
//   else                                          <script src="…/outlines.js"> right after the map: as before
// What the opening layer draws by the area itself (a unit of one area, an area on top) goes into its shapes.js (own), with
// the outlines' length that a stored layer's fingerprint counts (n). Only a map with a page that gains is split.
//
// Likewise the words of a layer that is not open (data/quizzes/<id>/names.js): they go to names-<layer>.js beside it,
// which fills that layer's tables, left empty, when the layer is opened (<body data-words="…/names-">, engine/app/words.js).
// A layer stays in names.js where a page opens on it, or the layer open is in another language of it, where it holds
// text read as the page opens (Reading), or where a page's rounds come out any different without its words.
//
//   node tools/builds/open-layer/build.mjs [--dry]
//
// Run it after tools/builds/layer-shapes (which writes shapes.js anew) and after a builder writes a map anew. A file that
// does not read back exactly as it was stops the run: nothing of that map is written.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import zlib from 'node:zlib';
import { parseArgs } from 'node:util';
import { ROOT } from '../../lib/geo.mjs';
import { readQuiz } from '../../../engine/model/quiz.js';
import { makeKinds } from '../../../engine/model/kinds.js';
import { makeRounds } from '../../../engine/model/rounds.js';
import { quantum, signature, unitsOf } from '../../../engine/map/geometry.js';

const { values: o } = parseArgs({ options: { dry: { type: 'boolean', default: false } } });
const stop = why => { console.error('open-layer: ' + why + '; stopped'); process.exit(1); };
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const has = f => fs.existsSync(path.join(ROOT, f));
const gz = s => zlib.gzipSync(Buffer.from(s), { level: 6 }).length;
const KB = n => Math.round(n / 1024);
const MAP_FILE = /^data\/maps\/[^/]+\/(shapes|data)\.js$/;
const outlinesOf = mapFile => path.posix.join(path.posix.dirname(mapFile), 'outlines.js');

// A page's scripts, in order: { src } (from the site's root) or { text }
const scriptsOf = (html, dir) => [...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)].flatMap(([, attrs, text]) => {
  if (/type="module"/.test(attrs)) return [];
  const src = attrs.match(/src="([^"]+)"/);
  return [src ? { src: path.posix.normalize(path.posix.join(dir, src[1])) } : { text }];
});
const dataOf = f => [...read(f).matchAll(/^const DATA = (.*);$/gm)];

const NAMES_FILE = /^data\/quizzes\/[^/]+\/names\.js$/;
const laterFiles = f => fs.readdirSync(path.join(ROOT, path.posix.dirname(f))).filter(x => /^names-.+\.js$/.test(x)).map(x => path.posix.join(path.posix.dirname(f), x));
const BLANK = `const blank = keys => { for (const k of keys) { const n = NAMES.kinds[k]; if (n) for (const t in n) { if (t === 'pool') for (const p in n.pool) n.pool[p] = {}; else n[t] = {}; } } };`;
// A page's QUIZ and SHAPES, as the browser has them with the outlines and all its words there (blank: but those layers')
function pageData(scripts, blank = []) {
  let body = '';
  for (const s of scripts) {
    if (s.text !== undefined) { body += s.text + '\n'; continue; }
    if (/engine\/page\.js$|engine\/types\/reading\.js$|^data\/letters\/|outlines\.js$/.test(s.src) || !has(s.src)) continue;
    body += read(s.src) + '\n';
    if (MAP_FILE.test(s.src) && has(outlinesOf(s.src))) body += read(outlinesOf(s.src)) + '\n';
    if (NAMES_FILE.test(s.src)) { for (const f of laterFiles(s.src)) body += read(f) + '\n'; if (blank.length) body += `${BLANK}\nblank(${JSON.stringify(blank)});\n`; }
  }
  // (a page's globals: the map type looks them up by name)
  return vm.runInNewContext(body + ';({ QUIZ, SHAPES: typeof SHAPES === "object" ? SHAPES : null, SETTINGS: typeof SETTINGS === "object" ? SETTINGS : null, NAMES: typeof NAMES === "object" ? NAMES : null })');
}

// What the layer a page opens on takes, by the rules of engine/map/layouts.js
function judge(html, { QUIZ, SHAPES }) {
  const data = {};
  for (const [, k, v] of (html.match(/<body([^>]*)>/)?.[1] || '').matchAll(/data-(kinds|key)="([^"]*)"/g)) data[k] = v;
  const Q = readQuiz(QUIZ, data), facts = Object.fromEntries(Q.areas.map(a => [a.id, a])), ids = Q.areas.map(a => a.id), geo = { area: id => facts[id] };
  const kinds = makeKinds(Q, geo), rounds = makeRounds(Q, kinds, geo);
  const first = rounds.list.find(r => !r.of), opening = first && (rounds.list.filter(v => v === first || v.of === first).find(v => kinds.byKey[v.kind].start) || first).kind;
  const n = ids.reduce((s, a) => s + (facts[a].d || '').length, 0);
  const stored = SHAPES && SHAPES.v === 1 && SHAPES.q === quantum(Q.proj) ? SHAPES : null;
  const fillOf = u => u.filter(a => !facts[a].top && !facts[a].dot);
  const layoutOf = K => {
    if (K.clickAll || K.areaLabel || K.merge === false || !stored) return null;
    const units = unitsOf(K, ids); if (!units.some(u => u.length > 1)) return null;
    const P = stored.kinds[K.key] || stored.kinds[K.like];
    if (!P || P.sig !== signature(units, n, Q.size, Q.proj && Q.proj.grain)) return null;
    return { K, units, P };
  };
  const whole = L => L && L.units.every((u, i) => fillOf(u).length < 2 || L.P.fill[i]) && (L.P.color || !(L.K.hints === false && L.K.prompt !== 'photo'));
  const L = opening && layoutOf(kinds.byKey[opening]), open = !!whole(L), own = new Set();
  if (open) for (const u of L.units) { const f = fillOf(u); for (const a of f.length < 2 ? u : u.filter(x => !f.includes(x))) own.add(a); }
  const roundsSig = JSON.stringify(rounds.list.map(r => [r.id, r.kind, r.label, r.sub, r.key, r.box, r.level, r.random, r.random ? null : rounds.items(r)]));
  return { opening, n, ownIds: own, open, facts, ids, roundsSig, ofOpening: opening && kinds.byKey[opening].of };
}

/* ---------- every page ---------- */
const pages = [];
for (const q of fs.readdirSync(path.join(ROOT, 'quizzes')).sort()) {
  const file = `quizzes/${q}/index.html`; if (!has(file)) continue;
  const html = read(file), scripts = scriptsOf(html, `quizzes/${q}`);
  const maps = [...new Set(scripts.map(s => s.src).filter(s => s && MAP_FILE.test(s)))];
  const page = { q, file, html, scripts, maps, lazy: false };
  pages.push(page);
  if (maps.length !== 1 || !scripts.some(s => /engine\/types\/(layer|post)\.js$/.test(s.src || ''))) continue;
  let got; try { got = pageData(scripts); } catch (e) { stop(`${q}: ${e.message}`); }
  if (got.SETTINGS && got.SETTINGS.map !== 'DATA.reg') continue; // (a map whose areas are another list)
  const J = judge(html, got), shapesFile = scripts.map(s => s.src).find(s => s && /^data\/quizzes\/[^/]+\/shapes\.js$/.test(s));
  const chars = [...J.ownIds].reduce((s, a) => s + (J.facts[a].d || '').length, 0);
  Object.assign(page, { J, shapesFile, ownChars: chars, lazy: J.open && !!shapesFile && chars < J.n * .6 });
}
const lazy = pages.filter(p => p.lazy), split = new Set(lazy.flatMap(p => p.maps));

/* ---------- which layers' words wait ---------- */
const wordPages = new Map(); // names file -> its pages
for (const p of pages) { const f = p.J && p.scripts.map(s => s.src).find(s => s && NAMES_FILE.test(s)); if (f) (wordPages.get(f) || wordPages.set(f, []).get(f)).push(p); }
const laterOf = new Map();
for (const [f, list] of wordPages) {
  const { NAMES } = pageData(list[0].scripts), keys = Object.keys(NAMES.kinds);
  const free = k => /^[\w-]+$/.test(k) && !NAMES.kinds[k].text && list.every(p => p.J.opening !== k && p.J.ofOpening !== k);
  const safe = keys.filter(k => free(k) && list.every(p => judge(p.html, pageData(p.scripts, [k])).roundsSig === p.J.roundsSig));
  // (all of them together: the same rounds still)
  if (safe.length && !list.every(p => judge(p.html, pageData(p.scripts, safe)).roundsSig === p.J.roundsSig)) stop(`${f}: rounds differ with all its waiting layers empty`);
  if (safe.length) laterOf.set(f, { safe, NAMES });
}

/* ---------- what is written ---------- */
const writes = new Map(); // file -> text
const pageOn = new Map();
for (const f of split) {
  const lines = dataOf(f); if (lines.length !== 1) stop(`${f}: not one line of DATA`);
  const text = read(f), DATA = JSON.parse(lines[0][1]);
  if (!Array.isArray(DATA.reg)) stop(`${f}: no DATA.reg`);
  if (DATA.reg.every(r => r.d === undefined)) continue; // (split already)
  const outlines = DATA.reg.map(r => { if (typeof r.d !== 'string') stop(`${f}: an area with no outline`); return r.d; });
  const rest = { ...DATA, reg: DATA.reg.map(({ d, ...r }) => r) };
  const base = text.replace(lines[0][0], () => `const DATA = ${JSON.stringify(rest)};`);
  const part = `// Made by tools/builds/open-layer/build.mjs: the outlines of the areas of ./${path.basename(f)}, in its order, for a page that\n// needs them: with the map where it opens on them, else when something asks for them (engine/map/shapes.js).\n${JSON.stringify(outlines)}.forEach((d, i) => { DATA.reg[i].d = d; });\n`;
  // read back as a browser does
  const back = new Function(base + part + ';return DATA;')();
  if (JSON.stringify(back.reg.map(r => r.d)) !== JSON.stringify(outlines)) stop(`${f}: outlines not read back`);
  back.reg.forEach((r, i) => { for (const k of Object.keys(DATA.reg[i])) if (JSON.stringify(r[k]) !== JSON.stringify(DATA.reg[i][k])) stop(`${f}: area ${i} not read back`); });
  writes.set(f, base); writes.set(outlinesOf(f), part);
}
for (const p of pages) {
  const map = p.maps.find(m => split.has(m)); if (!map) continue;
  const dest = outlinesOf(map), rel = path.posix.relative(`quizzes/${p.q}`, dest), tag = `<script src="${rel}"></script>`;
  let html = p.html.replace(/ data-outlines="[^"]*"/, '').replace(new RegExp(`^\\s*${tag.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}\\n`, 'm'), '');
  if (p.lazy) html = html.replace(/<body([^>]*)>/, (_, a) => `<body${a} data-outlines="${rel}">`);
  else {
    const mapTag = new RegExp(`^(\\s*)<script src="${path.posix.relative(`quizzes/${p.q}`, map).replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}"></script>\\n`, 'm');
    if (!mapTag.test(html)) stop(`${p.q}: its map's script not found`);
    html = html.replace(mapTag, (m, indent) => `${m}${indent}${tag}\n`);
  }
  if (html !== p.html) writes.set(p.file, html);
}
// the words: names.js with those layers' tables empty, and a file for each
const emptied = t => Object.fromEntries(Object.entries(t).map(([k, v]) => [k, k === 'pool' ? Object.fromEntries(Object.keys(v).map(p => [p, {}])) : {}]));
for (const [f, { safe, NAMES }] of laterOf) {
  const text = read(f), m = [...text.matchAll(/^const NAMES = (.*);$/gm)]; if (m.length !== 1) stop(`${f}: not one line of NAMES`);
  const full = JSON.parse(JSON.stringify(NAMES)); delete full.later;
  const base = { ...full, later: safe, kinds: Object.fromEntries(Object.entries(full.kinds).map(([k, t]) => [k, safe.includes(k) ? emptied(t) : t])) };
  const out = text.replace(m[0][0], () => `const NAMES = ${JSON.stringify(base)};`);
  writes.set(f, out);
  const parts = safe.map(k => [path.posix.join(path.posix.dirname(f), `names-${k}.js`), `// The words of the layer ${k} (made by tools/builds/open-layer/build.mjs from ./names.js), brought when it is opened.\n{ const n = NAMES.kinds[${JSON.stringify(k)}], w = ${JSON.stringify(full.kinds[k])}; for (const t in w) { if (t === 'pool') for (const p in w.pool) Object.assign(n.pool[p], w.pool[p]); else Object.assign(n[t], w[t]); } }\n`]);
  // read back as a browser does
  const back = new Function(out + parts.map(([, t]) => t).join('') + ';return NAMES;')(); delete back.later;
  if (JSON.stringify(back.kinds) !== JSON.stringify(full.kinds) || JSON.stringify(back.groups) !== JSON.stringify(full.groups)) {
    const sorted = o => (o && typeof o === 'object' && !Array.isArray(o) ? Object.fromEntries(Object.keys(o).sort().map(k => [k, sorted(o[k])])) : Array.isArray(o) ? o.map(sorted) : o);
    if (JSON.stringify(sorted(back.kinds)) !== JSON.stringify(sorted(full.kinds))) stop(`${f}: words not read back`);
  }
  for (const [g, t] of parts) writes.set(g, t);
  for (const g of laterFiles(f)) if (!parts.some(([x]) => x === g)) fs.rmSync(path.join(ROOT, g));
}
for (const [f, list] of wordPages) for (const p of list) {
  const html = writes.get(p.file) ?? p.html, rel = path.posix.relative(`quizzes/${p.q}`, path.posix.join(path.posix.dirname(f), 'names-'));
  let next = html.replace(/ data-words="[^"]*"/, '');
  if (laterOf.has(f)) next = next.replace(/<body([^>]*)>/, (_, a) => `<body${a} data-words="${rel}">`);
  if (next !== p.html) writes.set(p.file, next); else writes.delete(p.file);
}
// a stored layer's own areas, and the outlines' length
const held = new Map();
for (const p of lazy) { const h = held.get(p.shapesFile) || held.set(p.shapesFile, { n: p.J.n, own: {} }).get(p.shapesFile); for (const a of p.J.ownIds) h.own[a] = p.J.facts[a].d; }
for (const [f, h] of held) {
  const text = read(f), m = [...text.matchAll(/^const SHAPES = (.*);$/gm)]; if (m.length !== 1) stop(`${f}: not one line of SHAPES`);
  const S = JSON.parse(m[0][1]), { n, own, ...rest } = S, next = { ...rest, n: h.n, own: h.own };
  const out = text.replace(m[0][0], () => `const SHAPES = ${JSON.stringify(next)};`);
  const back = new Function(out + ';return SHAPES;')();
  if (JSON.stringify(back.arcs) !== JSON.stringify(S.arcs) || JSON.stringify(back.kinds) !== JSON.stringify(S.kinds)) stop(`${f}: not read back`);
  if (out !== text) writes.set(f, out);
}

/* ---------- what it comes to ---------- */
const textOf = f => writes.get(f) ?? (has(f) ? read(f) : '');
const sizes = p => {
  const before = p.scripts.filter(s => s.src && s.src.startsWith('data/') && !/outlines\.js$/.test(s.src) && has(s.src)).reduce((t, s) => t + gz(read(s.src)) + (MAP_FILE.test(s.src) && has(outlinesOf(s.src)) ? gz(read(outlinesOf(s.src))) : 0), 0);
  const after = p.scripts.filter(s => s.src && s.src.startsWith('data/') && !/outlines\.js$/.test(s.src) && has(s.src)).reduce((t, s) => t + gz(textOf(s.src)), 0);
  return { before, after };
};
const on = pages.filter(p => p.J), kept = on.filter(p => !p.lazy);
const rows = lazy.map(p => ({ p, ...sizes(p) })).sort((a, b) => (b.before - b.after) - (a.before - a.after));
console.log(`${pages.length} pages; ${on.length} of the map and postcode types; ${lazy.length} open without the outlines; ${kept.length} keep them; ${split.size} maps split`);
for (const { p, before, after } of rows.slice(0, 16)) console.log(`  ${p.q.padEnd(30)} ${String(KB(before)).padStart(4)} -> ${String(KB(after)).padStart(4)} KB  opens on ${p.J.opening}, ${p.J.ownIds.size} areas drawn by themselves`);
const total = rows.reduce((t, r) => [t[0] + r.before, t[1] + r.after], [0, 0]);
console.log(`  all ${lazy.length}: ${KB(total[0])} -> ${KB(total[1])} KB; median page ${KB(rows.map(r => r.before).sort((a, b) => a - b)[rows.length >> 1] || 0)} -> ${KB(rows.map(r => r.after).sort((a, b) => a - b)[rows.length >> 1] || 0)} KB`);
const why = kept.filter(p => p.J.open).map(p => p.q);
if (why.length) console.log(`  stored but too much drawn by the area itself: ${why.join(', ')}`);
console.log(`  keep them, why: opens on a layer without stored shapes ${kept.filter(p => !p.J.open).length}`);
const waiting = [...laterOf.entries()].map(([f, { safe, NAMES }]) => [f, safe, safe.reduce((s, k) => s + gz(JSON.stringify(NAMES.kinds[k])), 0)]).sort((a, b) => b[2] - a[2]);
console.log(`words: ${laterOf.size} of ${wordPages.size} quizzes have layers that wait, ${KB(waiting.reduce((s, w) => s + w[2], 0))} KB in all; most: ${waiting.slice(0, 8).map(w => `${w[0].split('/')[2]} ${KB(w[2])} (${w[1].join(' ')})`).join(', ')}`);
const changed = [...writes].filter(([f, text]) => !has(f) || read(f) !== text);
console.log(`files to write: ${changed.length}${o.dry ? ' (--dry: none written)' : ''}`);
if (!o.dry) for (const [f, text] of changed) fs.writeFileSync(path.join(ROOT, f), text);
