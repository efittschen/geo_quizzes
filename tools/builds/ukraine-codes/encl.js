const g = require('./osmgeo.js'); const { pc } = g;
const { rels, ways } = g.load('osm'); const index = require('./rel_index.json');
const units = require('./units.json');
const enc = units.filter(u => u.kind === 'rest' && !u.towns.length && u.area > 3 && u.area < 60);
for (const u of enc) {
  const c = [(u.bbox[0] + u.bbox[2]) / 2, (u.bbox[1] + u.bbox[3]) / 2];
  const hits = [];
  for (const r of index) {
    if (r.o !== u.o || !/^h/.test(r.kind) || !rels.has(r.id)) continue;
    const G = g.polyOf(rels.get(r.id), ways).geom; if (!G.length) continue;
    const bb = g.bbox(G); if (bb[2] < u.bbox[0] || u.bbox[2] < bb[0] || bb[3] < u.bbox[1] || u.bbox[3] < bb[1]) continue;
    let a = 0; try { a = g.area(pc.intersection(u.geom, G)); } catch (e) {}
    if (a > 0.3) hits.push(`${r.name} ${r.koatuu || ''} ${a.toFixed(1)}`);
  }
  console.log(u.o, u.area.toFixed(1), c[1].toFixed(3) + ',' + c[0].toFixed(3), '::', hits.join(' | '));
}
