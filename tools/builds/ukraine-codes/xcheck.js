// Cross-check: ru.wikipedia's table (code -> raion or city) against the codes given to the OSM units.
const g = require('./osmgeo.js'); const { rels } = g.load('osm');
const assign = require('./assign.json'); const units = require('./units.json'); const ru = require('./ru_rows.json');
const { UA } = require('./lib.js');
const idOf = new Map(units.filter(u => u.id).map(u => [u.o + '|' + u.name, u.id]));
const oblOf = Object.fromEntries(Object.entries(UA.regions).map(([k, v]) => [v.phone, k]));
const nrm = s => s.toLowerCase().replace(/ё/g, 'е').replace(/\s*\(.*\)/, '').trim();
const byRu = new Map();
for (const u of assign.units) { const id = idOf.get(u.key); if (!id) continue; const t = rels.get(id).tags; const n = t['name:ru'] || (/[ыэъ]|ский район/.test(t.name) ? t.name : null); if (n) byRu.set(u.o + '|' + nrm(n), u); }
let ok = 0, bad = [], miss = [];
for (const r of ru) {
  const o = oblOf[r.obl]; if (!o) continue;
  for (const l of r.links.filter(l => /район/.test(l))) {
    const u = byRu.get(o + '|' + nrm(l));
    if (!u) { miss.push(`${r.code} ${l}`); continue; }
    // the ru table writes capitals as "56 2xx", cities as 3 digits
    const same = u.code === r.code || u.code.startsWith(r.code) || r.code.startsWith(u.code);
    if (same) ok++; else bad.push(`${l}: ru ${r.code}, here ${u.code} (${u.how})`);
  }
}
console.log('agree', ok, '\ndiffer', bad.length, bad.join('\n  '), '\nnot matched by name', miss.length, miss.join('; '));
