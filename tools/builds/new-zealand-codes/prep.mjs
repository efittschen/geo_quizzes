// lica_s.geojson -> lica_inset.geojson (Chatham Islands moved next to the South Island, as on the regions map) with ids
import fs from 'node:fs';
const D = decodeURIComponent(new URL('./', import.meta.url).pathname); // this folder: scripts, inputs, downloads and intermediates
const fc = JSON.parse(fs.readFileSync(D + 'lica_s.geojson', 'utf8'));
const G = JSON.parse(fs.readFileSync(D + 'groups.json', 'utf8')); const main = {}; for (const [k, v] of Object.entries(G)) { main[k] = k; for (const m of v) main[m] = k; }
const slug = s => s.toLowerCase().replace(/\(chatham is\.\)/, 'chatham').replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '');
const CHAT = { dlng: -7, dlat: -1.5 };
for (const f of fc.features) {
  const p = f.properties;
  f.properties = { id: slug(p.lica), lica: p.lica, code: p.code, main: slug(main[p.lica]) };
  if (p.lica.startsWith('Waitangi')) { const g = f.geometry, P = g.type === 'Polygon' ? [g.coordinates] : g.coordinates; for (const poly of P) for (const r of poly) for (const pt of r) { if (pt[0] < 0) pt[0] += 360; pt[0] += CHAT.dlng; pt[1] += CHAT.dlat; } }
}
fs.writeFileSync(D + 'lica_inset.geojson', JSON.stringify(fc));
console.log(fc.features.map(f => f.properties.id).join(' '));
