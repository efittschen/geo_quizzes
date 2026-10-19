#!/usr/bin/env node
// japan-diamonds: the pictures of quizzes/japan-diamonds, img/<design>.svg.
//
//   node tools/builds/japan-diamonds/build.mjs
//
// Draws the Japanese crossing-ahead diamonds (ダイヤマーク) of plonkit.net's "Japan Diamonds Infographic Map" as SVGs.
// A diamond is four painted bands, one per edge, clockwise: UR (top→right), LR (right→bottom), LL (bottom→left),
// UL (left→top). Each end of a band is 'v' (it holds the corner: cut along the next edge's outer line), 'g' (stops
// short of a corner the next band holds: cut parallel to that band, a gap from it) or 'h' (cut level with the corner,
// half a gap above or below it).
import { writeFileSync } from 'node:fs';

const W = 640, H = 400, CX = 320, CY = 200;
const D = {
  thick: { h: 330, t: 0.125 }, thin: { h: 330, t: 0.068 }, small: { h: 224, t: 0.125 }, smallSaga: { h: 236, t: 0.13 },
};
const GAP = 0.035; // of the standard height
const SPEC = {
  'two-right': ['thick', { UR: 'vv', LR: 'vg', LL: 'vv', UL: 'vg' }],
  'two-right-thin': ['thin', { UR: 'vv', LR: 'vg', LL: 'vv', UL: 'vg' }],
  'two-left': ['thick', { UL: 'vv', UR: 'gv', LR: 'vv', LL: 'gv' }],
  'two-left-small': ['small', { UL: 'vv', UR: 'gv', LR: 'vv', LL: 'gv' }],
  'side': ['thick', { UR: 'vv', LR: 'vv', UL: 'vg', LL: 'gv' }],
  'side-thin': ['thin', { UR: 'vv', LR: 'vv', UL: 'vg', LL: 'gv' }],
  'whole-thin': ['thin', { UR: 'vv', LR: 'vv', LL: 'vv', UL: 'vv' }],
  'whole': ['thick', { UR: 'vv', LR: 'vv', LL: 'vv', UL: 'vv' }],
  'across': ['thick', { UR: 'vh', LR: 'hv', LL: 'vh', UL: 'hv' }],
  'across-small': ['smallSaga', { UR: 'vh', LR: 'hv', LL: 'vh', UL: 'hv' }],
  'across-thin': ['thin', { UR: 'vh', LR: 'hv', LL: 'vh', UL: 'hv' }],
  'two-corners': ['thick', { UR: 'vv', LR: 'gv', LL: 'vv', UL: 'gv' }],
  'four-left': ['thick', { UL: 'vv', UR: 'gg', LR: 'vv', LL: 'gg' }],
  'four-right': ['thick', { UR: 'vv', LR: 'gg', LL: 'vv', UL: 'gg' }],
  'four-right-thin': ['thin', { UR: 'vv', LR: 'gg', LL: 'vv', UL: 'gg' }],
  'wheel-left': ['thick', { UR: 'gv', LR: 'gv', LL: 'gv', UL: 'gv' }],
  'wheel-right': ['thick', { UR: 'vg', LR: 'vg', LL: 'vg', UL: 'vg' }],
  'wheel-right-thin': ['thin', { UR: 'vg', LR: 'vg', LL: 'vg', UL: 'vg' }],
};
const ORDER = ['UR', 'LR', 'LL', 'UL'];
const cross = (p, d, q, e) => { const den = d[0] * e[1] - d[1] * e[0]; const s = ((q[0] - p[0]) * e[1] - (q[1] - p[1]) * e[0]) / den; return [p[0] + s * d[0], p[1] + s * d[1]]; };
function draw(size, ends) {
  const { h, t: tf } = D[size], b = h / 2, a = b * 0.59, t = tf * h, g = GAP * 330;
  const V = { T: [CX, CY - b], R: [CX + a, CY], B: [CX, CY + b], L: [CX - a, CY] };
  const EDGE = { UR: ['T', 'R'], LR: ['R', 'B'], LL: ['B', 'L'], UL: ['L', 'T'] };
  const line = e => { const [s, f] = EDGE[e], p = V[s], q = V[f], d = [q[0] - p[0], q[1] - p[1]], len = Math.hypot(...d);
    const n = [-d[1] / len, d[0] / len], m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], inward = (CX - m[0]) * n[0] + (CY - m[1]) * n[1] > 0 ? n : [-n[0], -n[1]];
    return { p, d, n: inward, off: k => [p[0] + inward[0] * k, p[1] + inward[1] * k] }; };
  const polys = [];
  for (const e of ORDER) {
    if (!ends[e]) continue;
    const L = line(e), i = ORDER.indexOf(e), prev = line(ORDER[(i + 3) % 4]), next = line(ORDER[(i + 1) % 4]);
    const cut = (spec, adj, atStart) => {
      if (spec === 'v') return [adj.p, adj.d];
      if (spec === 'g') return [adj.off(t + g), adj.d];
      const y = ['UR', 'UL'].includes(e) ? CY - g / 2 : CY + g / 2; return [[0, y], [1, 0]]; // 'h'
    };
    const [c0p, c0d] = cut(ends[e][0], prev, true), [c1p, c1d] = cut(ends[e][1], next, false);
    const inner = L.off(t);
    polys.push([cross(L.p, L.d, c0p, c0d), cross(L.p, L.d, c1p, c1d), cross(inner, L.d, c1p, c1d), cross(inner, L.d, c0p, c0d)]);
  }
  const path = polys.map(q => 'M' + q.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join('L') + 'Z').join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#3a3d42"/><path d="${path}" fill="#f3f3ee"/></svg>\n`;
}
const out = new URL('../../../quizzes/japan-diamonds/img/', import.meta.url);
for (const [k, [size, ends]] of Object.entries(SPEC)) writeFileSync(new URL(`${k}.svg`, out), draw(size, ends));
console.log(Object.keys(SPEC).join(' '));
