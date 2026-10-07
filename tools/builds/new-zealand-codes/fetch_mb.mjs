// Stats NZ meshblocks 2026 (with their SA2) for the SA2s in split.json -> mb/<sa2>.geojson
import fs from 'node:fs';
const D = decodeURIComponent(new URL('./', import.meta.url).pathname); // this folder: scripts, inputs, downloads and intermediates
const UA = 'GeoQuizzes/1.0 (https://github.com/efittschen/geo_quizzes)';
const URL0 = 'https://services2.arcgis.com/vKb0s8tBIA3bdocZ/arcgis/rest/services/Meshblock_Higher_Geographies_2026/FeatureServer/0/query';
const list = JSON.parse(fs.readFileSync(D + 'split.json', 'utf8')).filter(s => !fs.existsSync(D + 'mb/' + s + '.geojson'));
const sleep = ms => new Promise(r => setTimeout(r, ms));
console.log('to fetch', list.length);
for (const sa2 of list) {
  const feats = [];
  for (let off = 0; ; off += 400) {
    const p = new URLSearchParams({ where: `SA22026_V1_00='${sa2}'`, outFields: 'MB2026_V1_00,SA22026_V1_00,LANDWATER_NAME', outSR: '4326', geometryPrecision: '5', orderByFields: 'OBJECTID', resultOffset: String(off), resultRecordCount: '400', f: 'geojson' });
    let j = null;
    for (let i = 0; i < 5 && !j; i++) { try { const r = await fetch(URL0, { method: 'POST', headers: { 'User-Agent': UA, 'Content-Type': 'application/x-www-form-urlencoded' }, body: p }); if (r.ok) j = await r.json(); else await sleep(2000 * (i + 1)); } catch (e) { await sleep(2000 * (i + 1)); } }
    if (!j || !j.features) throw new Error('failed ' + sa2 + ' ' + JSON.stringify(j).slice(0, 200));
    feats.push(...j.features);
    if (j.features.length < 400) break;
  }
  fs.writeFileSync(D + 'mb/' + sa2 + '.geojson', JSON.stringify({ type: 'FeatureCollection', features: feats }));
  console.log(sa2, feats.length);
  await sleep(250);
}
