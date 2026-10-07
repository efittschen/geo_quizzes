const g = require('./osmgeo.js'); const { pc } = g; const fs = require('fs');
const fc = JSON.parse(fs.readFileSync('ukr_code_areas.geojson', 'utf8'));
const F = fc.features.map(f => ({ id: f.properties.id, geom: f.geometry.coordinates, bb: g.bbox(f.geometry.coordinates) }));
let n = 0, tot = 0;
for (let i = 0; i < F.length; i++) for (let j = i + 1; j < F.length; j++) {
  const a = F[i], b = F[j]; if (a.bb[2] < b.bb[0] || b.bb[2] < a.bb[0] || a.bb[3] < b.bb[1] || b.bb[3] < a.bb[1]) continue;
  n++; let x; try { x = g.area(pc.intersection(a.geom, b.geom)); } catch (e) { console.log('err', a.id, b.id); continue; }
  if (x > 0.2) { console.log('overlap', a.id, b.id, x.toFixed(2), 'km²'); tot += x; }
}
console.log('pairs', n, 'overlap total', tot.toFixed(1));
