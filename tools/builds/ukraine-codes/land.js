// OSM simplified land polygons (EPSG:3857 shapefile) -> land.json: the land around the Black Sea and the Sea of Azov
// as a lon/lat multipolygon, cut to a window that holds Ukraine's coastal oblasts.
const fs = require('fs');
const g = require('./osmgeo.js');
const { pc } = g;
const WIN = [27, 43.5, 41.5, 50]; // lon0, lat0, lon1, lat1
const R = 6378137, toLon = x => x / R * 180 / Math.PI, toLat = y => (2 * Math.atan(Math.exp(y / R)) - Math.PI / 2) * 180 / Math.PI;
const mx = lon => lon * Math.PI / 180 * R, my = lat => Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360)) * R;
const W = [mx(WIN[0]), my(WIN[1]), mx(WIN[2]), my(WIN[3])];
const buf = fs.readFileSync('land/simplified-land-polygons-complete-3857/simplified_land_polygons.shp');
// Sutherland-Hodgman against the window (a ring may come back with edges along the window: fine, they are far from the coast we need)
function clipRing(r) {
  const edges = [[0, W[0], 1], [0, W[2], -1], [1, W[1], 1], [1, W[3], -1]];
  for (const [ax, v, s] of edges) {
    const inside = p => (p[ax] - v) * s >= 0, out = [];
    for (let i = 0; i < r.length; i++) {
      const a = r[i], b = r[(i + 1) % r.length], ia = inside(a), ib = inside(b);
      if (ia) out.push(a);
      if (ia !== ib) { const t = (v - a[ax]) / (b[ax] - a[ax]); out.push(ax === 0 ? [v, a[1] + t * (b[1] - a[1])] : [a[0] + t * (b[0] - a[0]), v]); }
    }
    r = out; if (r.length < 3) return null;
  }
  return r;
}
let pos = 100, n = 0, kept = 0; const polys = [];
while (pos < buf.length) {
  const len = buf.readInt32BE(pos + 4) * 2; const rec = pos + 8; pos = rec + len; n++;
  if (buf.readInt32LE(rec) !== 5) continue;
  const x0 = buf.readDoubleLE(rec + 4), y0 = buf.readDoubleLE(rec + 12), x1 = buf.readDoubleLE(rec + 20), y1 = buf.readDoubleLE(rec + 28);
  if (x1 < W[0] || x0 > W[2] || y1 < W[1] || y0 > W[3]) continue;
  const np = buf.readInt32LE(rec + 36), npt = buf.readInt32LE(rec + 40), parts = [];
  for (let i = 0; i < np; i++) parts.push(buf.readInt32LE(rec + 44 + 4 * i));
  const base = rec + 44 + 4 * np;
  for (let i = 0; i < np; i++) {
    const a = parts[i], b = i + 1 < np ? parts[i + 1] : npt; let ring = [];
    for (let k = a; k < b - 1; k++) ring.push([buf.readDoubleLE(base + 16 * k), buf.readDoubleLE(base + 16 * k + 8)]);
    ring = clipRing(ring); if (!ring) continue;
    const ll = ring.map(([x, y]) => [+toLon(x).toFixed(6), +toLat(y).toFixed(6)]);
    ll.push(ll[0]); polys.push([ll]); kept++;
  }
}
console.log('records', n, 'rings in window', kept, 'points', polys.reduce((s, p) => s + p[0].length, 0));
const land = pc.union(...polys);
console.log('land polygons', land.length, 'area km²', Math.round(g.area(land)), 'points', land.reduce((s, p) => s + p.reduce((a, r) => a + r.length, 0), 0));
fs.writeFileSync('land.json', JSON.stringify(land));
