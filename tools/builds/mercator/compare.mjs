// Every page's map as recorded before and after (record.mjs): the same areas, borders, cities and town names, each
// point within `TOL` of where it was. Where a page's frame changed (one frame for a map several pages share), the
// points are compared as latitude and longitude, in map units of the old frame.
//   node tools/builds/mercator/compare.mjs [before] [after]
import fs from 'node:fs';
import zlib from 'node:zlib';
import { ROOT } from './pages.mjs';
const [A = 'before', B = 'after'] = process.argv.slice(2);
const DIR = ROOT + 'tools/cache/builds/mercator/';
const load = (label, page) => { try { return JSON.parse(zlib.gunzipSync(fs.readFileSync(`${DIR}${label}/${page}.json.gz`))); } catch { return null; } };
const RAD = Math.PI / 180, my = (lat) => Math.log(Math.tan(Math.PI / 4 + Math.max(-85.05, Math.min(85.05, lat)) * RAD / 2)) / RAD;
const latOf = (y) => (2 * Math.atan(Math.exp(y * RAD)) - Math.PI / 2) / RAD;
const nums = (d) => (String(d || '').match(/-?\d*\.?\d+(?:e-?\d+)?/g) || []).map(Number);
// a point of frame q moved into frame p (both Mercator)
const into = (p, q) => (!p || !q || (p.k === q.k && p.lng0 === q.lng0 && p.y0 === q.y0) ? null : ([x, y]) => [((q.lng0 + x / q.k) - p.lng0) * p.k, (p.y0 - (q.y0 - y / q.k)) * p.k]);
const TOL = 0.051; // a point rounded to tenths may land a tenth off where float rounding differs; more is a change
function diff(a, b, move) {
  const x = nums(a), y = nums(b);
  if (x.length !== y.length) return { n: Math.abs(x.length - y.length), max: Infinity };
  let max = 0;
  for (let i = 0; i + 1 < x.length; i += 2) { const [u, v] = move ? move([y[i], y[i + 1]]) : [y[i], y[i + 1]]; max = Math.max(max, Math.abs(x[i] - u), Math.abs(x[i + 1] - v)); }
  return { n: 0, max };
}
const pages = fs.readdirSync(DIR + A).map((f) => f.replace(/\.json\.gz$/, ''));
const bad = [], framed = [], same = [];
for (const page of pages) {
  const a = load(A, page), b = load(B, page);
  if (!b) { bad.push(`${page}: no record after`); continue; }
  const issues = [];
  if (b.errors && b.errors.length) issues.push('errors: ' + b.errors[0].slice(0, 80));
  if (a.quiz && b.quiz) {
    const P = a.quiz.proj, R = b.quiz.proj, move = into(P, R);
    if (move) framed.push(page);
    if (P && R && P.type !== R.type) issues.push(`projection ${P.type} -> ${R.type}`);
    if (!!a.quiz.world !== !!b.quiz.world) issues.push(`world ${a.quiz.world} -> ${b.quiz.world}`);
    if (!move && JSON.stringify(a.quiz.size) !== JSON.stringify(b.quiz.size)) issues.push(`size ${a.quiz.size} -> ${b.quiz.size}`);
    if ((a.quiz.grain || null) !== (b.quiz.grain || null)) issues.push(`grain ${a.quiz.grain} -> ${b.quiz.grain}`);
    const byId = new Map(b.quiz.areas.map((x) => [x[0], x]));
    let worst = 0, off = 0, labels = 0, sizes = 0;
    for (const [id, d, lx, ly, ar, size] of a.quiz.areas) {
      const o = byId.get(id); if (!o) { issues.push(`area ${id} gone`); continue; }
      const r = diff(d, o[1], move); worst = Math.max(worst, r.max); if (r.max > TOL) off++;
      const l = diff(`${lx},${ly}`, `${o[2]},${o[3]}`, move); if (l.max > TOL) labels++;
      if (!move && Math.abs((size ?? ar) - (o[5] ?? o[4])) > 0.051 + 1e-3 * Math.abs(size ?? ar)) sizes++;
    }
    if (a.quiz.areas.length !== b.quiz.areas.length) issues.push(`areas ${a.quiz.areas.length} -> ${b.quiz.areas.length}`);
    if (off) issues.push(`${off} of ${a.quiz.areas.length} outlines moved (worst ${worst === Infinity ? 'point count' : worst.toFixed(2)})`);
    if (labels) issues.push(`${labels} label points moved`);
    if (sizes) issues.push(`${sizes} sizes changed`);
    const bb = a.quiz.borders.map((x, i) => diff(x, b.quiz.borders[i], move)).filter((r) => r.max > TOL);
    if (a.quiz.borders.length !== b.quiz.borders.length) issues.push(`borders ${a.quiz.borders.length} -> ${b.quiz.borders.length}`);
    else if (bb.length) issues.push(`${bb.length} borders moved (worst ${Math.max(...bb.map((r) => r.max)).toFixed(2)})`);
  } else if (!!a.quiz !== !!b.quiz) issues.push(`quiz map ${!!a.quiz} -> ${!!b.quiz}`);
  if (a.cities || b.cities) {
    const c = a.cities, d = b.cities;
    if (!c || !d) issues.push('city map missing');
    else {
      for (const k of ['w', 'h', 'world']) if (c[k] !== d[k]) issues.push(`cities ${k} ${c[k]} -> ${d[k]}`);
      if (Math.abs(c.span - d.span) > 1e-6 * c.span) issues.push(`span ${c.span} -> ${d.span}`);
      for (const k of ['land', 'lines']) { const r = diff(c[k], d[k]); if (r.max > TOL) issues.push(`cities ${k} moved (${r.max})`); }
      const r = diff(c.list.map((x) => x[1] + ',' + x[2]).join(' '), d.list.map((x) => x[1] + ',' + x[2]).join(' ')); if (r.max > TOL) issues.push(`city dots moved (${r.max})`);
    }
  }
  if (a.names || b.names) {
    const c = a.names, d = b.names;
    if (!c || !d) issues.push('town names missing');
    else {
      for (const k of ['w', 'h', 'gw', 'gh', 'brush']) if (c[k] !== d[k]) issues.push(`names ${k} ${c[k]} -> ${d[k]}`);
      let worst = 0; for (let i = 0; i < c.counts.length; i++) worst = Math.max(worst, Math.abs(c.counts[i] - (d.counts[i] || 0)));
      if (worst > 1e-3) issues.push(`grid counts differ by ${worst}`);
      const r = diff(JSON.stringify(c.parts), JSON.stringify(d.parts)); if (r.max > TOL) issues.push(`town-name parts moved (${r.max})`);
    }
  }
  (issues.length ? bad : same).push(issues.length ? `${page}: ${issues.join('; ')}` : page);
}
console.log(`${pages.length} pages: ${same.length} the same, ${bad.length} not; ${framed.length} in one shared frame now (${framed.join(', ')})`);
if (bad.length) console.log(bad.join('\n'));
