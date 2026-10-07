import fs from 'node:fs';
const UA = 'GeoQuizzes/1.0 (https://github.com/efittschen/geo_quizzes)';
const URL0 = 'https://services2.arcgis.com/vKb0s8tBIA3bdocZ/arcgis/rest/services/Meshblock_Higher_Geographies_2026/FeatureServer/0/query';
const rows = [];
for (let off = 0; ; off += 2000) {
  const p = new URLSearchParams({ where: '1=1', outFields: 'MB2026_V1_00,SA22026_V1_00,UR2026_V1_00,UR2026_V1_00_NAME,IUR2026_V1_00_NAME', returnGeometry: 'false', orderByFields: 'OBJECTID', resultOffset: String(off), resultRecordCount: '2000', f: 'json' });
  const r = await fetch(URL0, { method: 'POST', headers: { 'User-Agent': UA, 'Content-Type': 'application/x-www-form-urlencoded' }, body: p });
  const j = await r.json(); if (!j.features) throw new Error(JSON.stringify(j).slice(0, 300));
  rows.push(...j.features.map(f => f.attributes));
  if (j.features.length < 2000) break;
  await new Promise(r => setTimeout(r, 200));
}
fs.writeFileSync('mb_ur.json', JSON.stringify(rows.map(a => [a.MB2026_V1_00, a.SA22026_V1_00, a.UR2026_V1_00, a.UR2026_V1_00_NAME, a.IUR2026_V1_00_NAME])));
console.log(rows.length, rows[0]);
const t = {}; for (const a of rows) t[a.IUR2026_V1_00_NAME] = (t[a.IUR2026_V1_00_NAME] || 0) + 1; console.log(t);
