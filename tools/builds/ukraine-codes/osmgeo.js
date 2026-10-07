// OSM relations (out body) + ways (out skel geom) -> polygons. Shared helpers for assemble.js.
const fs = require('fs');
const { REPO } = require('./lib.js');
const pc = require(REPO + '/tools/node_modules/polygon-clipping');

function load(dir) {
  const rels = new Map(), ways = new Map();
  for (const f of fs.readdirSync(dir).filter(f => /^r\d+\.json$/.test(f))) {
    const d = JSON.parse(fs.readFileSync(dir + '/' + f, 'utf8'));
    for (const e of d.elements) {
      if (e.type === 'way') ways.set(e.id, e.geometry.map(p => [p.lon, p.lat]));
      else if (e.type === 'relation') rels.set(e.id, e);
    }
  }
  return { rels, ways };
}
const key = p => p[0] + ',' + p[1];
// Join ways end to end into closed rings.
function joinRings(segs, name) {
  const rings = [], open = [];
  const left = segs.map(s => s.slice());
  while (left.length) {
    let cur = left.pop();
    for (;;) {
      if (key(cur[0]) === key(cur[cur.length - 1]) && cur.length > 3) { rings.push(cur); break; }
      const end = key(cur[cur.length - 1]);
      const i = left.findIndex(s => key(s[0]) === end || key(s[s.length - 1]) === end);
      if (i < 0) { open.push(cur); break; }
      const s = left.splice(i, 1)[0];
      cur = cur.concat((key(s[0]) === end ? s : s.slice().reverse()).slice(1));
    }
  }
  return { rings, open };
}
function polyOf(rel, ways) {
  const seg = { outer: [], inner: [] }; let missing = 0;
  for (const m of rel.members) {
    if (m.type !== 'way') continue;
    const g = ways.get(m.ref); if (!g) { missing++; continue; }
    seg[m.role === 'inner' ? 'inner' : 'outer'].push(g);
  }
  const o = joinRings(seg.outer), i = joinRings(seg.inner);
  let geom = [];
  if (o.rings.length) geom = pc.union(...o.rings.map(r => [[r]]));
  if (i.rings.length && geom.length) geom = pc.difference(geom, ...i.rings.map(r => [[r]]));
  return { geom, open: o.open.length + i.open.length, missing };
}
// km² of a multipolygon in lon/lat (local equirectangular)
function ringArea(r) { const k = Math.PI / 180, R = 6371; let lat0 = 0; for (const p of r) lat0 += p[1]; const c = Math.cos(lat0 / r.length * k); let a = 0; for (let i = 0, j = r.length - 1; i < r.length; j = i++) a += (r[j][0] * r[i][1] - r[i][0] * r[j][1]); return Math.abs(a) / 2 * k * k * R * R * c; }
const polyArea = p => p.reduce((s, r, i) => s + (i ? -1 : 1) * ringArea(r), 0);
const area = mp => mp.reduce((s, p) => s + polyArea(p), 0);
function inRing(r, x, y) { let c = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const [x0, y0] = r[i], [x1, y1] = r[j]; if ((y0 > y) !== (y1 > y) && x < (x1 - x0) * (y - y0) / (y1 - y0) + x0) c = !c; } return c; }
const inPoly = (p, x, y) => { let c = false; for (const r of p) if (inRing(r, x, y)) c = !c; return c; };
const inMulti = (mp, x, y) => mp.some(p => inPoly(p, x, y));
const perimeter = p => { let s = 0; const k = Math.PI / 180, R = 6371; for (const r of p) for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const lat = (r[i][1] + r[j][1]) / 2 * k; s += Math.hypot((r[i][0] - r[j][0]) * k * Math.cos(lat) * R, (r[i][1] - r[j][1]) * k * R); } return s; };
const bbox = mp => { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const p of mp) for (const [x, y] of p[0]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } return [x0, y0, x1, y1]; };
module.exports = { pc, load, polyOf, area, polyArea, inMulti, inPoly, perimeter, bbox };
