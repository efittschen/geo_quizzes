#!/usr/bin/env node
// Germany Postcodes: the quiz's own map, from the real postcode areas: the five-digit postcode areas of OpenStreetMap
// (ODbL), as github.com/yetzt/postleitzahlen publishes them (release 2026.02, postleitzahlen.topojson.br), merged
// into the three-digit zones once, here. The zones' states and places come from GeoNames (CC BY 4.0): the states of
// their postcodes (postal codes file), the largest towns inside them (gazetteer).
//
//   node tools/builds/germany-postcodes/build.mjs
//   node tools/builds/layer-shapes/build.mjs quizzes/germany-postcodes/index.html
//
// The user's choices (2026-10-28): the zones are OpenStreetMap's, 671 of three digits: 683 (Mannheim's north-east,
// which GeoNames lists without a location) included; 602 left out (Frankfurt's company postcodes, of which only one
// building is mapped), as 335, 380, 390, 480 and 760 are not there (each one company postcode, without an area); the
// German postcodes outside Germany (Kleinwalsertal and Jungholz in Austria, Büsingen in Switzerland) are left out;
// the detail of every new map (simplified at 1.5 square map units, as tools/geo2quiz.mjs does); a town is named in
// the zone whose outline holds it, by its German name where its main name in GeoNames is English (München, not
// Munich); a zone with no town of a known
// population inside it is named by its postcodes' place names, as before, and one without those either by the places
// inside it (683: its districts). Until then the page drew its zones from the local networks of the area-code quiz
// (germany-codes), which no longer has them.
//
// Writes data/maps/germany-postcodes/data.js (the three-digit zones, in the Mercator frame of the area-code map) and
// post.js (per zone at every level: its states, places and number of postcodes); the page's hint colours
// (data/quizzes/germany-postcodes/hints.css) stay as they are. The two-digit and first-digit zones are the engine's
// merged shapes of the three-digit ones, in data/quizzes/germany-postcodes/shapes.js (the second command).
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import * as d3 from 'd3-geo';
import { merge } from 'topojson-client';
import polylabel from 'polylabel';
import { cached, unzipText, rewind, projectionFrom, planarFeatures, labelAndArea, svgPath, ROOT } from '../../lib/geo.mjs';

const RELEASE = '2026.02';
const OUT = path.join(ROOT, 'data', 'maps', 'germany-postcodes');
const LEVELS = [1, 2, 3];
const ABROAD = new Set(['87491', '87567', '87568', '87569', '78266']); // Jungholz, Kleinwalsertal (AT); Büsingen (CH)
const LEFT_OUT = new Set(['602']); // zones of company postcodes only
// The frame of the area-code map (data/maps/germany-codes), so the postcode map lies where it lay before.
const PROJ = { type: 'mercator', k: 109.0155892292598, lng0: 5.867, y0: 66.23570758017497, grain: 0.1 }, W = 1000, H = 1359, KPU = 0.638;
const round = (v, n) => Math.round(v * 10 ** n) / 10 ** n;

/* ---------- the postcode areas, merged into zones ---------- */
const br = await cached(`https://github.com/yetzt/postleitzahlen/releases/download/${RELEASE}/postleitzahlen.topojson.br`, `yetzt-postleitzahlen-${RELEASE}/postleitzahlen.topojson.br`);
const topo = JSON.parse(zlib.brotliDecompressSync(fs.readFileSync(br)));
const areas = topo.objects.postleitzahlen.geometries.filter(g => /^\d{5}$/.test(g.properties.postcode) && !ABROAD.has(g.properties.postcode)
  && !LEFT_OUT.has(g.properties.postcode.slice(0, LEVELS[LEVELS.length - 1])));
const codes = new Set(areas.map(g => g.properties.postcode));
const FINE = LEVELS[LEVELS.length - 1];
const byZone = new Map();
for (const g of areas) { const z = g.properties.postcode.slice(0, FINE); if (!byZone.has(z)) byZone.set(z, []); byZone.get(z).push(g); }
const zones = [...byZone.keys()].sort();
const geo = rewind({ type: 'FeatureCollection', features: zones.map(z => ({ type: 'Feature', properties: { id: z }, geometry: merge(topo, byZone.get(z)) })) });
console.log(`${areas.length} postcode areas (${codes.size} postcodes; left out abroad: ${[...ABROAD].join(' ')}; zones left out: ${[...LEFT_OUT].join(' ')}), ${zones.length} zones of ${FINE} digits`);

/* ---------- the map: projected, simplified with the borders shared ---------- */
const proj = projectionFrom(PROJ);
const planar = planarFeatures(geo, proj, { minArea: 1.5 }).features;
const inRing = (ring, x, y) => { // even-odd
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};
// A hole no other zone fills is a gap between two OpenStreetMap areas of the zone: it is filled.
const pieces = planar.flatMap(f => f.geometry.coordinates.map(p => ({ id: f.properties.id, outer: p[0] })));
let gaps = 0, kept = 0;
for (const f of planar) f.geometry.coordinates = f.geometry.coordinates.map(([outer, ...holes]) => [outer, ...holes.filter(h => {
  const at = polylabel([h], 0.01); // (the point inside the hole furthest from its edges)
  const inner = pieces.some(p => p.id !== f.properties.id && inRing(p.outer, ...at));
  if (inner) kept++; else gaps++;
  return inner;
})]);
console.log(`holes: ${kept} kept (another zone inside), ${gaps} filled (gaps between areas)`);

const km2 = f => d3.geoArea(geo.features.find(g => g.properties.id === f.properties.id).geometry) * 6371 ** 2;
const reg = planar.map(f => {
  const d = svgPath(f.geometry);
  if (!d) throw new Error(`zone ${f.properties.id} vanished in the simplification`);
  const { lx, ly, a } = labelAndArea(f);
  return { id: f.properties.id, d, lx, ly, a, s: round(km2(f) / KPU ** 2, 1) }; // s: its true size, in map units at the centre
});
if (reg.length !== zones.length) throw new Error(`${zones.length - reg.length} zones missing on the map`);

/* ---------- names and counts per zone, at every level ---------- */
const prefixes = code => LEVELS.map(l => code.slice(0, l));
const Z = {}; // zone (any level) -> { n, states: name -> Set(codes), names: name -> Set(codes), towns: [[name, pop]], places: [names] }
for (const c of codes) for (const p of prefixes(c)) (Z[p] ??= { n: 0, states: new Map(), names: new Map(), towns: [], places: [] }).n++;
const tally = (m, k, code) => { if (!k) return; if (!m.has(k)) m.set(k, new Set()); m.get(k).add(code); };
const postal = fs.readFileSync(path.join(ROOT, 'tools', 'cache', 'postal', 'DE.txt'), 'utf8');
for (const line of postal.split('\n')) {
  const c = line.split('\t');
  if (c.length < 11 || !codes.has(c[1])) continue;
  for (const p of prefixes(c[1])) {
    tally(Z[p].states, c[3].trim(), c[1]);
    if ((c[11] || '').trim()) tally(Z[p].names, c[2].trim(), c[1]); // (the rows without an accuracy are companies)
  }
}
// towns: the gazetteer's places with a population, in the zone whose outline holds them (the merged areas, unsimplified);
// the places without one (and the parts of towns, PPLX) only name a zone that has no town
const boxes = geo.features.map(f => ({ id: f.properties.id, polys: f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates, box: d3.geoBounds(f) }));
const KEEP = new Set(['PPL', 'PPLA', 'PPLA2', 'PPLA3', 'PPLA4', 'PPLC', 'PPLG']);
// geonameid -> its German name (the preferred one, else the first; not colloquial, historic or short), and its English ones
const GERMAN = new Map(), ENGLISH = new Map();
for (const line of unzipText(path.join(ROOT, 'tools', 'cache', 'geonames_alt_DE.zip'), 'DE.txt').split('\n')) {
  const p = line.split('\t');
  if (!p[3] || p[5] === '1' || p[6] === '1' || p[7] === '1') continue;
  if (p[2] === 'en') (ENGLISH.get(p[1]) || ENGLISH.set(p[1], new Set()).get(p[1])).add(p[3]);
  if (p[2] === 'de' && (!GERMAN.has(p[1]) || p[4] === '1')) GERMAN.set(p[1], p[3]);
}
const german = (id, name) => GERMAN.has(id) && GERMAN.get(id) !== name && ENGLISH.get(id)?.has(name) && !GERMAN.get(id).includes(',') ? GERMAN.get(id) : name;
let towns = 0, outside = 0;
for (const line of unzipText(path.join(ROOT, 'tools', 'cache', 'geonames_DE.zip'), 'DE.txt').split('\n')) {
  const c = line.split('\t');
  if (c.length < 15 || c[6] !== 'P' || !(KEEP.has(c[7]) || c[7] === 'PPLX')) continue;
  const town = KEEP.has(c[7]) && +c[14] > 0;
  const lat = +c[4], lng = +c[5];
  const hit = boxes.find(b => lng >= b.box[0][0] && lng <= b.box[1][0] && lat >= b.box[0][1] && lat <= b.box[1][1]
    && b.polys.some(([outer, ...holes]) => inRing(outer, lng, lat) && !holes.some(h => inRing(h, lng, lat))));
  if (!hit) { if (town) outside++; continue; }
  const name = german(c[0], c[1]);
  if (!town) { Z[hit.id].places.push(name); continue; }
  towns++;
  for (const p of prefixes(hit.id)) Z[p].towns.push([name, +c[14]]);
}
console.log(`towns: ${towns} in a zone, ${outside} in none (abroad, or between areas)`);
const top = (m, n, minShare = 0) => {
  const total = [...m.values()].reduce((s, v) => s + v.size, 0);
  return [...m].sort((a, b) => b[1].size - a[1].size || a[0].localeCompare(b[0])).filter(([, v]) => v.size >= total * minShare).slice(0, n).map(([k]) => k);
};
const NAME = {}, N = {};
for (const p of Object.keys(Z).sort()) {
  const z = Z[p];
  const big = [...new Map(z.towns.sort((a, b) => b[1] - a[1]).map(t => [t[0], t])).keys()].slice(0, 3);
  NAME[p] = [top(z.states, 3, 0.12).join(', '), (big.length ? big : z.names.size ? top(z.names, 3) : [...new Set(z.places)].sort((a, b) => a.localeCompare(b, 'de')).slice(0, 3)).join(', ')];
  N[p] = z.n;
}
const unnamed = Object.keys(NAME).filter(p => !NAME[p][1]);
if (unnamed.length) console.log(`zones without a place: ${unnamed.join(' ')}`);

/* ---------- files ---------- */
let s = 90, w = 180, n = -90, e = -180;
for (const f of geo.features) { const [[x0, y0], [x1, y1]] = d3.geoBounds(f); w = Math.min(w, x0); s = Math.min(s, y0); e = Math.max(e, x1); n = Math.max(n, y1); }
const POST = { digits: 5, mask: '#####', levels: LEVELS, bounds: [[round(s, 2), round(w, 2)], [round(n, 2), round(e, 2)]], area: Object.fromEntries(zones.map(z => [z, [z]])), name: NAME, n: N };
const DATA = { w: W, h: H, kpu: KPU, proj: PROJ, reg };
const head = `// Generated by tools/builds/germany-postcodes/build.mjs: the ${reg.length} three-digit postcode zones of Germany, each the\n// five-digit postcode areas of OpenStreetMap (© OpenStreetMap contributors, ODbL; github.com/yetzt/postleitzahlen,\n// release ${RELEASE}) merged into one shape, simplified, in Web Mercator (the frame of data/maps/germany-codes)\n`;
fs.writeFileSync(path.join(OUT, 'data.js'), `${head}const DATA = ${JSON.stringify(DATA)};\n`);
fs.writeFileSync(path.join(OUT, 'post.js'), `// Generated by tools/builds/germany-postcodes/build.mjs: the zones of each map area (each zone its own area), and per\n// zone its states and places (GeoNames, CC BY 4.0) and its number of postcodes (its OpenStreetMap postcode areas)\nconst POST = ${JSON.stringify(POST)};\n`);
const kb = f => `${f} ${(fs.statSync(path.join(OUT, f)).size / 1024).toFixed(0)} kB`;
console.log(`levels ${LEVELS.map(l => `${l}: ${Object.keys(NAME).filter(k => k.length === l).length}`).join(', ')}; ${kb('data.js')}, ${kb('post.js')}`);
