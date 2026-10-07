const g = require('./osmgeo.js'); const { pc } = g; const fs = require('fs');
const fc = JSON.parse(fs.readFileSync('ukr_code_areas.geojson', 'utf8'));
let un = [];
// union oblast by oblast, then all
const by = {}; for (const f of fc.features) (by[f.properties.g] ??= []).push(f.geometry.coordinates);
const parts = Object.values(by).map(l => pc.union(...l));
un = pc.union(...parts);
console.log('polygons', un.length);
for (const p of un) { for (let i = 1; i < p.length; i++) { const a = g.polyArea([p[i]]); const bb = g.bbox([[p[i]]]); console.log('hole', a.toFixed(3), 'km²', ((bb[1] + bb[3]) / 2).toFixed(4) + ',' + ((bb[0] + bb[2]) / 2).toFixed(4)); } }
console.log(un.map(p => g.polyArea(p).toFixed(1)).sort((a, b) => b - a).slice(0, 30).join(' '));
