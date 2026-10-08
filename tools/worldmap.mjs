#!/usr/bin/env node
// worldmap: Natural Earth countries -> quizzes/shared/world.js, the map of the world and continent quizzes, in Web
// Mercator like every quiz map (see quizzes/shared/mercator.js): the world as GeoGuessr's own map shows it.
//
//   node tools/worldmap.mjs [--width 2000] [--min-area 0.12] [--dot 8]
//
// Writes  const WORLD = { w, h, kpu, proj, reg: [{ id, n, i2, iso, c, d, lx, ly, a, b, dot? }] }
//   proj { type: 'mercator', k, lng0, y0 } as mercator.js describes it; kpu: km to a map unit at the equator
//   id   Natural Earth's three-letter code (ISO 3166-1 alpha-3, plus KOS for Kosovo)
//   n    English name; i2: ISO alpha-2 code (the label on the map); iso: ISO numeric code, as in data/quizzes.json
//   c    continent (Natural Earth); d: SVG path in map units; lx, ly: label point; a: size in square map units
//   b    [x0, y0, x1, y1] of the main land (every piece at least a tenth the size of the largest: Alaska yes,
//        Hawaii no), for framing a continent without its far-off islands
//   dot  1 for places too small to hit at any sensible zoom (Monaco, Jersey…): quizzes draw them as a dot
// Territories that GeoGuessr treats as places of their own are cut out of their country (Réunion from France,
// Svalbard from Norway, Christmas Island and the Cocos Islands apart); Gibraltar, missing at this scale, is added.
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import * as d3 from 'd3-geo';
import { naturalEarthCountries, planarFeatures, labelAndArea, svgPath, rewind, ROOT } from './lib/geo.mjs';

const { values: o } = parseArgs({ options: { width: { type: 'string', default: '2000' }, 'min-area': { type: 'string', default: '0.12' }, dot: { type: 'string', default: '8' } } });

// Short everyday names where Natural Earth's are formal or abbreviated.
const NAMES = { USA: 'United States', KOR: 'South Korea', PRK: 'North Korea', HKG: 'Hong Kong', MAC: 'Macau', ALD: 'Åland', FRO: 'Faroe Islands', SRB: 'Serbia', TZA: 'Tanzania', BHS: 'Bahamas', COG: 'Republic of the Congo', COD: 'DR Congo', CIV: 'Ivory Coast', SWZ: 'Eswatini', TLS: 'East Timor', FSM: 'Micronesia', VAT: 'Vatican City', GNB: 'Guinea-Bissau', CZE: 'Czechia', MKD: 'North Macedonia', BIH: 'Bosnia and Herzegovina', CPV: 'Cape Verde', STP: 'São Tomé and Príncipe', CUW: 'Curaçao', BLM: 'Saint Barthélemy' };
// Pieces of a country that become places of their own: [country, new id, name, alpha-2, numeric, continent, bbox w s e n].
const CUT = [
  ['FRA', 'REU', 'Réunion', 'RE', '638', 'Africa', [55, -21.6, 56, -20.6]],
  ['FRA', 'MYT', 'Mayotte', 'YT', '175', 'Africa', [44.8, -13.2, 45.5, -12.4]],
  ['FRA', 'GUF', 'French Guiana', 'GF', '254', 'South America', [-55, 1.8, -51, 6.2]],
  ['FRA', 'GLP', 'Guadeloupe', 'GP', '312', 'North America', [-62, 15.7, -60.8, 16.7]],
  ['FRA', 'MTQ', 'Martinique', 'MQ', '474', 'North America', [-61.4, 14.3, -60.7, 15]],
  ['NOR', 'SJM', 'Svalbard', 'SJ', '744', 'Europe', [-10, 70.5, 40, 82]],
  ['IOA', 'CXR', 'Christmas Island', 'CX', '162', 'Asia', [105, -11, 106.2, -10]],
  ['IOA', 'CCK', 'Cocos (Keeling) Islands', 'CC', '166', 'Asia', [96, -12.6, 97.5, -11.5]],
];
// Places Natural Earth leaves out at 1:50m: [id, name, alpha-2, numeric, continent, lng, lat].
const ADD = [['GIB', 'Gibraltar', 'GI', '292', 'Europe', -5.35, 36.14]];
const MAIN = 0.1; // a piece of land this large, compared with the country's largest, is part of its main land
const DROP = new Set(['ATA', 'IOA']); // Antarctica; the Indian Ocean Territories are cut into their two islands

const ne = await naturalEarthCountries();
const polysOf = g => g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
const inBox = (poly, [w, s, e, n]) => { const [x, y] = d3.geoCentroid({ type: 'Polygon', coordinates: poly }); return x >= w && x <= e && y >= s && y <= n; };
const feats = [];
for (const f of ne.features) {
  const p = f.properties, id = p.ADM0_A3;
  let polys = polysOf(f.geometry);
  for (const [from, cut, n, i2, iso, c, box] of CUT) {
    if (from !== id) continue;
    const mine = polys.filter(poly => inBox(poly, box));
    if (!mine.length) { console.warn(`warning: nothing of ${n} found in ${from}`); continue; }
    polys = polys.filter(poly => !mine.includes(poly));
    feats.push({ type: 'Feature', properties: { id: cut, n, i2, iso, c }, geometry: { type: 'MultiPolygon', coordinates: mine } });
  }
  if (DROP.has(id)) continue;
  const iso = p.ISO_N3_EH !== '-99' ? p.ISO_N3_EH : p.ISO_N3 !== '-99' ? p.ISO_N3 : '';
  const i2 = p.ISO_A2_EH !== '-99' ? p.ISO_A2_EH : '';
  const c = p.CONTINENT === 'Seven seas (open ocean)' ? 'Oceans' : p.CONTINENT;
  feats.push({ type: 'Feature', properties: { id, n: NAMES[id] || p.NAME_EN || p.ADMIN, i2, iso, c }, geometry: { type: 'MultiPolygon', coordinates: polys } });
}
// Added places are a small square, only there to be turned into a dot.
for (const [id, n, i2, iso, c, x, y] of ADD) {
  const r = 0.02;
  feats.push({ type: 'Feature', properties: { id, n, i2, iso, c }, geometry: { type: 'MultiPolygon', coordinates: [[[[x - r, y - r], [x + r, y - r], [x + r, y + r], [x - r, y + r], [x - r, y - r]]]] } });
}
const ids = feats.map(f => f.properties.id);
if (new Set(ids).size !== ids.length) throw new Error('duplicate ids');
const fc = rewind({ type: 'FeatureCollection', features: feats });

const width = +o.width, round = v => Math.round(v * 10) / 10;
// All 360 degrees across the width, cut at the northernmost and southernmost land.
const proj = d3.geoMercator().scale(width / (2 * Math.PI)).translate([width / 2, 0]);
const bounds = d3.geoPath(proj).bounds(fc);
proj.translate([width / 2, -bounds[0][1]]);
const h = Math.ceil(bounds[1][1] - bounds[0][1]);
const north = proj.invert([0, 0])[1], my = lat => Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360)) * 180 / Math.PI;
const def = { type: 'mercator', k: width / 360, lng0: -180, y0: my(north) };
// Small places keep their shape through the simplification: nothing is dropped, every feature keeps its largest ring.
const { features } = planarFeatures(fc, proj, { minArea: +o['min-area'], dropRing: 0.05 });

const reg = [];
for (const f of features) {
  const p = f.properties;
  let d = svgPath(f.geometry);
  let { lx, ly, a } = labelAndArea(f);
  if (!d) {
    // simplified away entirely (a speck of an island): keep it as a point at its projected centre
    const src = fc.features.find(g => g.properties.id === p.id);
    [lx, ly] = proj(d3.geoCentroid(src)).map(round); a = 0; d = `M${lx},${ly}l0,0`;
  }
  const sized = f.geometry.coordinates.map(poly => [poly, Math.abs(d3.geoPath(null).area({ type: 'Polygon', coordinates: poly }))]);
  const main = sized.filter(([, A]) => A >= MAIN * Math.max(...sized.map(([, A]) => A))).map(([poly]) => poly);
  const b = main.length ? d3.geoPath(null).bounds({ type: 'MultiPolygon', coordinates: main }).flat().map(round) : [lx, ly, lx, ly];
  reg.push({ id: p.id, n: p.n, i2: p.i2, iso: p.iso, c: p.c, d, lx, ly, a, b, ...(a < +o.dot ? { dot: 1 } : {}) });
}
reg.sort((x, y) => x.n.localeCompare(y.n));

const out = path.join(ROOT, 'quizzes', 'shared', 'world.js');
const head = `// Generated by tools/worldmap.mjs: ${reg.length} countries and territories (Natural Earth 1:50m, public domain), Web Mercator, ${width}x${h} map units\n`;
fs.writeFileSync(out, `${head}const WORLD = ${JSON.stringify({ w: width, h, kpu: Math.round(40075.017 / width * 1e4) / 1e4, proj: def, reg })};\n`);
console.log(`${reg.length} places, map ${width}x${h}, ${(fs.statSync(out).size / 1024).toFixed(0)} KB, dots: ${reg.filter(r => r.dot).map(r => r.id).join(' ')}`);
