#!/usr/bin/env node
// mercator: every quiz page's map made ready in Web Mercator once, here, and written into its map files, so a page
// takes it as it is: nothing is redrawn as it opens and geo.js (latitudes and longitudes) is not loaded.
//
//   node tools/builds/mercator/build.mjs [--write] [page…]
//
// Each page is run as the browser runs it (pages.mjs) and its map redrawn by quizzes/shared/mercator.js itself, the
// code that did it as the page opened. What it made is written where the old map was:
//   area quizzes  every area's outline, label point and size (a; the old equal-area size kept as s), the borders
//                 and pins, in the files that hold them (data.js, layers.js, provinces.js, quiz.js…); the map's
//                 size, projection (proj: { type: 'mercator', k, lng0, y0, grain }) and km per unit; the neighbouring
//                 land (context) goes, the map lying on the world's. A map that pages frame differently (one draws
//                 its area codes, one its provinces) gets one frame for all of them: the box around all their areas.
//   city quizzes  cities.js as mercator.js's cities() leaves it (land, lines, dots, span), names.js as names() does.
//   the pages     no longer load geo.js.
// A new map (tools/geo2quiz.mjs and the country builders draw one in an equal-area projection, with its geo.js) is
// made ready by running this on its pages; its config then passes the map's proj (with grain) and no geo, as
// shared/layer-config.js does. The tools that put more on a map that is ready (postcodes.mjs, townnames.mjs,
// city-vali/quiz.mjs) place it through the map's own projection (tools/lib/geo.mjs projectionFrom).
// Without --write it only checks and reports: what would change, every page's outlines found in its files, no two
// pages wanting one file different. Anything else stops it before a file is written.
import fs from 'node:fs';
import vm from 'node:vm';
import { runPage, pages, ROOT, Q } from './pages.mjs';

const args = process.argv.slice(2), WRITE = args.includes('--write'), only = args.filter((a) => !a.startsWith('--'));
const r1 = (v) => Math.round(v * 10) / 10;
const fail = (msg) => { console.error('STOP: ' + msg); process.exit(1); };

/* ---------- area quizzes: each page before and after ---------- */
const files = new Map(); // path -> { text, strings: Set of its string literals }
const fileOf = (p) => {
  if (!files.has(p)) {
    const text = fs.readFileSync(ROOT + p, 'utf8'), strings = new Set();
    for (const m of text.matchAll(/"((?:[^"\\\n]|\\.)*)"|'((?:[^'\\\n]|\\.)*)'/g)) strings.add(m[1] ?? m[2]);
    files.set(p, { text, strings });
  }
  return files.get(p);
};
const own = (src) => src.startsWith('quizzes/') && !src.startsWith('quizzes/shared/');
function convert(page, box) {
  const P = runPage(page);
  if (!P.QUIZ || !P.QUIZ.areas) return null;
  const M = P.ctx.MERCATOR, Z = P.QUIZ;
  const before = { areas: Z.areas.map((a) => ({ id: a.id, d: a.d, lx: a.lx, ly: a.ly, a: a.a, dot: !!a.dot })), borders: [...(Z.borders || [])], context: Z.context || null, size: Z.size && [...Z.size] };
  const Qz = { ...Z, areas: Z.areas.map((a) => ({ ...a })) };
  const res = M.quiz(Qz, box);
  if (!res) return null;
  return { page, P, before, after: Qz, res, scripts: P.scripts.filter(own) };
}
const list = (only.length ? only : pages()).filter((p) => { try { return fs.readFileSync(`${Q}${p}/index.html`, 'utf8').includes('shared/area-quiz.js'); } catch { return false; } });
let runs = [];
for (const page of list) { try { const r = convert(page); if (r) runs.push(r); } catch (e) { fail(`${page}: ${e.message}`); } }

// which of a page's files hold its outlines, borders and neighbouring land
for (const r of runs) {
  const want = [...r.before.areas.map((a) => a.d), ...r.before.borders.filter(Boolean), ...(r.before.context ? [r.before.context] : [])];
  r.holders = r.scripts.filter((s) => want.some((w) => fileOf(s).strings.has(w)));
  r.unfound = want.filter((w) => !r.holders.some((s) => fileOf(s).strings.has(w)));
}
// pages that share a file are one map: one frame for all of them (rerun with the box around all their areas)
const parent = new Map(), find = (x) => (parent.get(x) === x ? x : (parent.set(x, find(parent.get(x))), parent.get(x)));
for (const r of runs) for (const h of r.holders) { if (!parent.has(h)) parent.set(h, h); parent.set(find(h), find(r.holders[0])); }
const groupOf = (r) => (r.holders.length ? find(r.holders[0]) : 'page:' + r.page);
const groups = new Map();
for (const r of runs) (groups.get(groupOf(r)) || groups.set(groupOf(r), []).get(groupOf(r))).push(r);
const frameKey = (r) => JSON.stringify([r.after.size, r.after.proj]);
for (const [g, rs] of groups) {
  if (new Set(rs.map(frameKey)).size === 1) continue;
  if (new Set(rs.map((r) => r.before.size[0])).size > 1) fail(`${g}: pages of one map with different widths: ${rs.map((r) => `${r.page} ${r.before.size[0]}`).join(', ')}`);
  const bx = rs.map((r) => r.res.box), box = [[Math.min(...bx.map((b) => b[0][0])), Math.min(...bx.map((b) => b[0][1]))], [Math.max(...bx.map((b) => b[1][0])), Math.max(...bx.map((b) => b[1][1]))]];
  console.log(`one frame for ${rs.map((r) => r.page).join(', ')} (${g})`);
  const again = rs.map((r) => Object.assign(convert(r.page, box), { holders: r.holders, unfound: r.unfound }));
  runs = runs.map((r) => again.find((x) => x.page === r.page) || r);
  groups.set(g, again);
  if (new Set(again.map(frameKey)).size > 1) fail(`${g}: still framed differently`);
}

// what changes, per map: strings (outlines, borders), entries (label point, size), the neighbouring land going
const plans = [];
for (const [g, rs] of groups) {
  const str = new Map(), entry = new Map(), gone = new Set(), clash = [];
  // (a line one page draws as an area's outline and another as a border, Argentina's provinces: the area's, made
  // from its latitudes and longitudes, not the border's, made through the old projection)
  const put = (m, k, v, page, area = true) => {
    const was = m.get(k);
    if (was && JSON.stringify(was.v) !== JSON.stringify(v)) { if (was.area === area) clash.push(`${page} vs ${was.page}: ${k.slice(0, 50)}`); else if (area) m.set(k, { v, page, area }); }
    else if (!was) m.set(k, { v, page, area });
  };
  for (const r of rs) {
    r.before.areas.forEach((b, i) => { const a = r.after.areas[i]; put(str, b.d, a.d, r.page); put(entry, b.d, { lx: a.lx, ly: a.ly, a: a.a, s: b.a }, r.page); });
    r.before.borders.forEach((b, i) => { if (b) put(str, b, r.after.borders[i], r.page, false); });
    if (r.before.context) gone.add(r.before.context);
  }
  for (const c of gone) if (str.has(c)) clash.push(`${[...gone].length} neighbouring land is also an outline or border`);
  if (clash.length) fail(`${g}: pages want one string different ways:\n  ` + clash.slice(0, 8).join('\n  '));
  // areas a page draws as a circle (too small to see; d: an arc): their own outline, where the data has it, made from
  // their latitudes and longitudes as mercator.js makes any area's (Shape mode draws it), by id
  const real = new Map();
  for (const r of rs) {
    const { F, turn, rq } = r.res, geo = r.P.QUIZ.geo;
    r.before.areas.forEach((b, i) => {
      if (!/[Aa]/.test(b.d) || !geo || !geo[b.id]) return;
      const d = geo[b.id].rings.map((ring) => { const t = turn(ring.reduce((s, p) => s + p[1], 0) / ring.length); let w = '', last = ''; for (const [lat, lng] of ring) { const [x, y] = F.at(lat, lng + t), p = rq(x) + ',' + rq(y); if (p !== last) w += (w ? 'L' : 'M') + p; last = p; } return w + 'Z'; }).join('');
      const a = r.after.areas[i];
      real.set(String(b.id), { d, lx: a.lx, ly: a.ly, a: a.a, s: b.a });
    });
  }
  const A = rs[0].after;
  plans.push({ g, rs, str, entry, gone, real, place: rs[0].res.place, meta: { w: A.size[0], h: A.size[1], kpu: A.kpu, proj: { ...A.proj, grain: A.grain } } });
}

/* ---------- the files ---------- */
// A file's statements `const NAME = <JSON>;` (one line each) are read as data and written again; any other file
// (a layers.js, a quiz.js) has its string literals replaced where they are, and its pins and size.
const out = new Map(); // path -> new text
const report = { strings: 0, entries: 0, real: 0, pins: 0, sizes: 0, gone: 0, meta: 0 }, left = new Map(); // left: outlines in a map's data no page draws (file -> count)
function editData(obj, plan, touched) {
  const walk = (o) => {
    if (Array.isArray(o)) { for (let i = 0; i < o.length; i++) { if (typeof o[i] === 'string' && plan.str.has(o[i])) { o[i] = plan.str.get(o[i]).v; report.strings++; touched.n++; } else if (o[i] && typeof o[i] === 'object') walk(o[i]); } return; }
    for (const k of Object.keys(o)) {
      const v = o[k];
      // a list of bare outlines that are a page's areas (provinces: DATA.ent): beside it, <key>At, each one's label
      // point and old equal-area size [lx, ly, s] (the outlines themselves come with no fields of their own)
      if (Array.isArray(v) && v.some((x) => typeof x === 'string' && plan.entry.has(x))) { const e = v.map((x) => (typeof x === 'string' && plan.entry.has(x) ? plan.entry.get(x).v : null)); o[k + 'At'] = e.map((x) => x && [x.lx, x.ly, x.s]); touched.n++; }
      if (typeof v === 'string') {
        if (plan.gone.has(v)) { delete o[k]; report.gone++; touched.n++; continue; }
        if (plan.str.has(v)) {
          if (k === 'd' && plan.entry.has(v)) { const e = plan.entry.get(v).v; for (const f of ['lx', 'ly', 'a']) if (f in o) o[f] = e[f]; if ('a' in o) o.s = e.s; report.entries++; }
          o[k] = plan.str.get(v).v; report.strings++; touched.n++;
        } else if (k === 'd' && /^M/.test(v)) {
          const e = plan.real.get(String(o.id ?? o.c));
          if (e && !/[Aa]/.test(v)) { o.d = e.d; for (const f of ['lx', 'ly', 'a']) if (f in o) o[f] = e[f]; if ('a' in o) o.s = e.s; report.real++; touched.n++; }
          else touched.left = (touched.left || 0) + 1;
        }
      } else if (v && typeof v === 'object') walk(v);
    }
  };
  walk(obj);
}
for (const plan of plans) {
  const holders = new Set(plan.rs.flatMap((r) => r.holders)), configs = new Set(plan.rs.flatMap((r) => r.scripts));
  for (const p of new Set([...holders, ...configs])) {
    let text = out.get(p) ?? fileOf(p).text;
    const touched = { n: 0 };
    const lines = text.split('\n'), data = new Set(); // (the lines read as data)
    for (let i = 0; i < lines.length; i++) {
      const m = /^(const [A-Za-z_$][\w$]*\s*=\s*)(.*);\s*$/.exec(lines[i]);
      if (!m) continue;
      let v; try { v = JSON.parse(m[2]); } catch { continue; }
      if (!v || typeof v !== 'object') continue;
      data.add(i);
      editData(v, plan, touched);
      // the map's own: its size, projection and km per unit
      if (!Array.isArray(v) && typeof v.w === 'number' && typeof v.h === 'number' && touched.n) { Object.assign(v, plan.meta); report.meta++; }
      lines[i] = m[1] + JSON.stringify(v) + ';';
    }
    // every other line is code (layers.js, quiz.js, an object written over lines): its string literals where they
    // are, and an area written as {"d":…,"lx":…,"ly":…,"a":…} whole (with s, its old size)
    for (let i = 0; i < lines.length; i++) {
      if (data.has(i)) continue;
      lines[i] = lines[i].replace(/"d":"([^"\\]*)","lx":(-?[\d.]+),"ly":(-?[\d.]+),"a":(-?[\d.]+)/g, (all, d) => {
        if (!plan.entry.has(d) || !plan.str.has(d)) return all;
        const e = plan.entry.get(d).v; report.strings++; report.entries++;
        return `"d":"${plan.str.get(d).v}","lx":${e.lx},"ly":${e.ly},"a":${e.a},"s":${e.s}`;
      }).replace(/"((?:[^"\\\n]|\\.)*)"|'((?:[^'\\\n]|\\.)*)'/g, (all, a, b) => {
        const s = a ?? b, q = a !== undefined ? '"' : "'";
        if (plan.gone.has(s)) { report.gone++; return q + q; }
        if (plan.str.has(s)) { report.strings++; return q + plan.str.get(s).v + q; }
        return all;
      });
    }
    text = lines.join('\n');
    // pins: { x, y, ll: [lat, lng] } -> where the latitude and longitude go
    text = text.replace(/"x":(-?[\d.]+),"y":(-?[\d.]+),"ll":\[(-?[\d.]+),(-?[\d.]+)\]/g, (all, x, y, lat, lng) => { const [nx, ny] = plan.place(+lat, +lng); report.pins++; return `"x":${r1(nx)},"y":${r1(ny)},"ll":[${lat},${lng}]`; });
    // the size a config gives the map
    for (const r of plan.rs) {
      const [w, h] = r.before.size, re = new RegExp(`(size:\\s*\\[)\\s*${w}\\s*,\\s*${h}\\s*(\\])`, 'g');
      text = text.replace(re, (all, a, b) => { report.sizes++; return `${a}${plan.meta.w}, ${plan.meta.h}${b}`; });
    }
    if (touched.left) left.set(p, touched.left);
    if (text !== (out.get(p) ?? fileOf(p).text)) out.set(p, text);
  }
}

// the pages made ready load no geo.js (a file of latitudes and longitudes, kept for the tools that build the maps)
for (const r of runs) {
  const p = `quizzes/${r.page}/index.html`, s = out.get(p) ?? fileOf(p).text, t = s.replace(/^[ \t]*<script src="[^"]*\bgeo\.js"><\/script>\n/gm, '');
  if (t !== s) out.set(p, t);
}

/* ---------- city quizzes: cities.js, and the town names' names.js on its map ---------- */
// (each file's one line const CITIES / const NAMES, run through a fresh mercator.js; the town names' grid counts kept
// to four decimals: each old cell's places spread over the new cells in ninths)
const fresh = () => { const c = vm.createContext({ performance }); vm.runInContext(fs.readFileSync(Q + 'shared/mercator.js', 'utf8') + '\nthis.M = MERCATOR;', c); return c.M; };
const lineOf = (p, name) => { const text = out.get(p) ?? fileOf(p).text, lines = text.split('\n'), i = lines.findIndex((l) => l.startsWith(`const ${name} = `)); if (i < 0) return null; const m = /^(const \w+ = )(.*);\s*$/.exec(lines[i]); return { lines, i, head: m[1], value: JSON.parse(m[2]) }; };
const cityFiles = new Map(), nameFiles = new Map(); // cities.js -> { before, after }, names.js -> its cities.js
for (const page of (only.length ? only : pages())) {
  let srcs; try { srcs = (await import('./pages.mjs')).scriptsOf(page).filter((x) => x.src && own(x.src)).map((x) => x.src); } catch { continue; }
  const c = srcs.find((x) => fileOf(x).text.includes('\nconst CITIES = ') || fileOf(x).text.startsWith('const CITIES = ')), n = srcs.find((x) => /\/names\.js$/.test(x) && fileOf(x).text.includes('const NAMES = '));
  if (c && !cityFiles.has(c)) cityFiles.set(c, null);
  if (n) { if (!c) fail(`${page}: town names without a cities.js`); if (nameFiles.has(n) && nameFiles.get(n) !== c) fail(`${n}: on two maps`); nameFiles.set(n, c); }
}
let cities = 0, names = 0;
for (const c of cityFiles.keys()) {
  const L = lineOf(c, 'CITIES'); if (!L) fail(c + ': no const CITIES line');
  if (L.value.proj && L.value.proj.type === 'mercator') continue;
  const C = JSON.parse(JSON.stringify(L.value));
  if (!fresh().cities(C)) fail(c + ': not redrawn');
  L.lines[L.i] = L.head + JSON.stringify(C) + ';'; out.set(c, L.lines.join('\n')); cities++;
  cityFiles.set(c, L.value);
}
for (const [n, c] of nameFiles) {
  const L = lineOf(n, 'NAMES'); if (!L) fail(n + ': no const NAMES line');
  const before = cityFiles.get(c); if (!before) { console.log(`  ${n}: its map ${c} is ready already, left as it is`); continue; }
  const M = fresh(), N = L.value, moved = M.cities(JSON.parse(JSON.stringify(before)));
  if (!M.names(N, moved)) fail(n + ': not redrawn');
  N.counts = Array.from(N.counts, (v) => Math.round(v * 1e4) / 1e4);
  L.lines[L.i] = L.head + JSON.stringify(N) + ';'; out.set(n, L.lines.join('\n')); names++;
}
console.log(`city quizzes: ${cities} city maps, ${names} town-name maps`);

/* ---------- report ---------- */
const unfound = runs.filter((r) => r.unfound.length);
console.log(`area quizzes: ${runs.length} pages made ready, ${plans.length} maps; ${out.size} files would change`);
console.log(`  outlines and borders ${report.strings}, entries ${report.entries}, own outlines of areas drawn as circles ${report.real}, pins ${report.pins}, sizes ${report.sizes}, neighbouring land gone ${report.gone}, map headers ${report.meta}`);
if (unfound.length) {
  console.log(`  pages with outlines not found in their files (made by their config as the page opens): ${unfound.length}`);
  for (const r of unfound.slice(0, 30)) console.log(`    ${r.page}: ${r.unfound.length} of ${r.before.areas.length + r.before.borders.length}`);
}
const noMeta = plans.filter((p) => ![...out.keys()].some((f) => p.rs.some((r) => r.holders.includes(f)) && /"proj":\{"type":"mercator"/.test(out.get(f))));
if (noMeta.length) console.log(`  maps without a header written (no data file with w and h): ${noMeta.map((p) => p.rs.map((r) => r.page).join('+')).join(', ')}`);
if (left.size) console.log(`  outlines in map data that no page draws, left as they are: ${[...left].map(([p, n]) => `${p} ${n}`).join(', ')}`);
if (WRITE) {
  // (each file as it was, first: tools/cache/builds/mercator/snapshot/<path>, so a write can be undone without git)
  const SNAP = ROOT + 'tools/cache/builds/mercator/snapshot/';
  for (const p of out.keys()) { fs.mkdirSync(SNAP + p.replace(/[^/]*$/, ''), { recursive: true }); if (!fs.existsSync(SNAP + p)) fs.copyFileSync(ROOT + p, SNAP + p); }
  for (const [p, t] of out) fs.writeFileSync(ROOT + p, t);
  console.log(`wrote ${out.size} files (as they were: ${SNAP})`);
}
