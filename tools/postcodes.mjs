#!/usr/bin/env node
// postcodes: the zones of a postcode quiz (engine/types/post.js), from the GeoNames postal codes
// (download.geonames.org/export/zip, CC BY 4.0): one point per postcode and place.
//
//   node tools/postcodes.mjs --cc ES --out spain-postcodes --base spain-regions --levels 2
//   node tools/postcodes.mjs --cc GB --out united-kingdom-postcodes --voronoi united-kingdom-regions
//        --prefix '^[A-Z]{1,2}' --levels 2 [--mask '##-###'] [--names c=5] [--head] [--skip '^(AA|AE|AP)$']
//
// --out takes the quiz id: post.js (and with --voronoi the zones' own map, data.js) go to data/maps/<id>/, the hint
// colours to data/quizzes/<id>/hints.css. --base and --voronoi take the name of a map in data/maps/, read by readMap
// (tools/lib/quiz-files.mjs: from its split files or its data.js, whichever it has; a city list from its cities.js).
// For tools/builds/code-zones, which draws zones that are no page: a value with a "/" is a path from the repository
// (--out a folder that gets every file, --base or --voronoi a file holding DATA). A quiz folder holds its page
// only, so quizzes/… is refused.
//
// A zone is every postcode starting with the same characters (--levels: the prefix lengths asked, coarse to fine;
// --prefix: a regular expression whose match is the zone, for letter systems). Two ways to draw the zones:
//   --base <map>        the areas of an existing map (in its own map units, a postcode placed on it by the map's
//                       projection) are the building blocks: each area gets the zones of the postcodes inside it
//                       (every zone with at least --min-share of the area's postcodes, default 0.2, and each zone at
//                       least where it has the most postcodes). The page
//                       loads the base map itself; this tool writes only post.js and hints.css. Areas without
//                       a postcode point take the zone of the nearest area that has one (--parent <field>: first
//                       among the areas with the same value of that field, e.g. the same county). Where the
//                       coordinates are rough, --match 5:name finds the area by name instead (GeoNames column 5,
//                       admin2, against the base map's `name` field; --alias 'Comilla=Cumilla,…' for other spellings).
//   --voronoi <map>     the zones get their own map, in the map space of an existing one (its projection, land and
//                       neighbours: its areas, or a city list's land): every point of land goes to the zone of the
//                       nearest postcode. Single points with no neighbour of their zone are dropped as misplaced.
//                       Writes data.js, post.js and hints.css. --frames keeps "nearest" inside one region at a
//                       time, so zones that follow state lines get the real line: --frames ne (the country's
//                       states, Natural Earth admin-1, which then also give the land) or --frames base:<field>
//                       (the map's own areas, grouped by a field).
// --full reads GeoNames' file of every postcode (GB, CA, NL: <cc>_full.csv.zip) where the standard file has only the
// first part of each code. --areas <file> names the postcodes with an area of their own (the first column of each
// line; tools/builds/postcodes/areas.mjs writes the lists), where a country also has postcodes for PO boxes and single
// organisations. A zone with none of them is not drawn: it would be land around a post office. And a zone that has
// some is never dropped whole as misplaced: where its points are scattered among others, those of the listed
// postcodes stay.
// --points <file> reads the postcodes from a file in the GeoNames layout instead (tab-separated: country, postcode,
// place, region, region code, …, latitude and longitude in columns 10 and 11), with --source naming where they are
// from (it goes into the notes of the files written). Brazil: tools/builds/postcodes/brazil-cnefe.mjs. With
// --keep-all no point is dropped as misplaced (tools/builds/code-zones uses the tool to draw area-code zones).
// post.js: const POST = { digits, mask, levels, bounds, area: { areaId: [finest zones] }, name: { zone: [regions,
// places] }, n: { zone: postcodes } }. Names: the regions (GeoNames admin1) and places with the most postcodes in the
// zone. Regions: the GeoNames admin1 names with the most postcodes in the zone (--names r=<column>: 3 admin1,
// 5 admin2). Places: the largest towns in the zone by population (GeoNames gazetteer; a town belongs to the zone of
// the postcode nearest to it), else the place names with the most postcodes (--names c=<column>: 2 place, 5 admin2);
// --head puts the place of the zone's own "…00" postcode first, the head post office.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { parseArgs } from 'node:util';
import * as d3 from 'd3-geo';
import { Delaunay } from 'd3-delaunay';
import polygonClipping from 'polygon-clipping';
import { topology } from 'topojson-server';
import { presimplify, simplify } from 'topojson-simplify';
import { feature, merge, neighbors } from 'topojson-client';
import { geoProject } from 'd3-geo-projection';
import { cached, unzipText, readGeoJSON, projectionFrom, labelAndArea, svgPath, ROOT, CACHE } from './lib/geo.mjs';
import { readMap } from './lib/quiz-files.mjs';

const { values: o } = parseArgs({
  options: {
    cc: { type: 'string' }, out: { type: 'string' }, base: { type: 'string' }, voronoi: { type: 'string' },
    levels: { type: 'string', default: '1,2' }, prefix: { type: 'string' }, mask: { type: 'string' },
    pattern: { type: 'string' }, skip: { type: 'string' }, names: { type: 'string', default: '' }, head: { type: 'boolean', default: false },
    'min-share': { type: 'string', default: '0.2' }, 'min-area': { type: 'string', default: '0.8' },
    'skip-region': { type: 'string' }, 'need-accuracy': { type: 'boolean', default: false }, 'need-region': { type: 'boolean', default: false },
    match: { type: 'string' }, alias: { type: 'string', default: '' }, frames: { type: 'string' }, parent: { type: 'string' },
    points: { type: 'string' }, source: { type: 'string' }, 'keep-all': { type: 'boolean', default: false },
    full: { type: 'boolean', default: false }, areas: { type: 'string' },
  },
});
if (!o.cc || !o.out || (!o.base && !o.voronoi)) { console.error('usage: postcodes --cc XX --out <quiz id> (--base <map> | --voronoi <map>) [--levels 1,2]'); process.exit(1); }
for (const k of ['out', 'base', 'voronoi']) if (/^quizzes\//.test(o[k] || '')) { console.error(`--${k} ${o[k]}: a quiz folder holds its page only; give the quiz id or the map's name`); process.exit(1); }
const CC = o.cc.toUpperCase(), LEVELS = o.levels.split(',').map(Number), FINE = LEVELS[LEVELS.length - 1];
const PREFIX = o.prefix ? new RegExp(o.prefix) : null, SKIP = o.skip ? new RegExp(o.skip) : null, SKIP_REGION = o['skip-region'] ? new RegExp(o['skip-region']) : null;
const NAMES = { r: 3, c: 2, ...Object.fromEntries(o.names.split(',').filter(Boolean).map(s => { const [k, v] = s.split('='); return [k, +v]; })) };
const round = (v, n) => Math.round(v * 10 ** n) / 10 ** n;
// where the files go: the quiz's map (post.js, data.js) and its own folder (hints.css); a path: one folder for all
const [OUT_MAP, OUT_QUIZ] = o.out.includes('/') ? [o.out, o.out] : [`data/maps/${o.out}`, `data/quizzes/${o.out}`];
const out = f => path.join(ROOT, OUT_MAP, f);
const mapPath = m => (m.includes('/') ? m : `data/maps/${m}`);

/* ---------- postcodes ---------- */
const SOURCE = o.source || 'GeoNames postal codes, CC BY 4.0';
const FILE = o.full ? `${CC}_full` : CC;
const postal = o.points ? fs.readFileSync(path.resolve(o.points), 'utf8') : unzipText(await cached(`https://download.geonames.org/export/zip/${FILE}${o.full ? '.csv' : ''}.zip`, `postal/${FILE}.zip`), `${FILE}.txt`);
const OWN = o.areas && new Set(fs.readFileSync(path.resolve(o.areas), 'utf8').split('\n').map(l => l.split(/[\t,;]/)[0].trim().toUpperCase()).filter(Boolean));
let rows = [];
let digits = 0;
for (const line of postal.split('\n')) {
  const c = line.split('\t');
  if (c.length < 11 || !c[9] || !c[10]) continue;
  const code = c[1].replace(/[\s-]/g, '').toUpperCase();
  if (o.pattern ? !new RegExp(o.pattern).test(code) : PREFIX ? !PREFIX.test(code) : !/^\d+$/.test(code)) continue;
  if (SKIP && SKIP.test(code)) continue;
  if (SKIP_REGION && SKIP_REGION.test(c[3])) continue;
  if (o['need-accuracy'] && !(c[11] || '').trim()) continue; // DE: the rows without one are bulk-customer postcodes
  if (o['need-region'] && !c[3].trim()) continue; // US: military post offices abroad
  const zone = PREFIX ? code.match(PREFIX)[0] : code.slice(0, FINE);
  digits = Math.max(digits, code.length);
  rows.push({ code, zone, lat: +c[9], lng: +c[10], f: c, own: OWN ? OWN.has(code) : false });
}
if (OWN) { // zones without a postcode that has an area: not drawn
  const real = new Set(rows.filter(r => r.own).map(r => r.zone)), gone = [...new Set(rows.map(r => r.zone))].filter(z => !real.has(z)).sort();
  rows = rows.filter(r => real.has(r.zone));
  if (gone.length) console.log(`zones left out, no postcode of theirs has an area: ${gone.join(' ')}`);
}
const prefixesOf = zone => PREFIX ? [zone] : LEVELS.map(l => zone.slice(0, l));
console.log(`${CC}: ${rows.length} rows, ${new Set(rows.map(r => r.code)).size} postcodes, ${new Set(rows.map(r => r.zone)).size} finest zones`);

/* ---------- names and counts per zone, at every level ---------- */
function top(counts, n, minShare = 0) {
  const total = [...counts.values()].reduce((s, v) => s + v.size, 0);
  return [...counts].filter(([k]) => k).sort((a, b) => b[1].size - a[1].size || a[0].localeCompare(b[0])).filter(([, v]) => v.size >= total * minShare).slice(0, n).map(([k]) => k);
}
const Z = {}; // zone (any level) -> { codes, r: name -> codes, c: name -> codes }
const codePlace = {};
for (const r of rows) {
  codePlace[r.code] ??= r.f[2];
  for (const p of prefixesOf(r.zone)) {
    const z = Z[p] ??= { codes: new Set(), r: new Map(), c: new Map() };
    z.codes.add(r.code);
    for (const k of ['r', 'c']) { const name = (r.f[NAMES[k]] || '').trim(); if (!z[k].has(name)) z[k].set(name, new Set()); z[k].get(name).add(r.code); }
  }
}
/* ---------- an existing map: its areas, projection and land ---------- */
// (a map of data/maps/ by readMap; a city list (no shapes.js, no data.js) by its cities.js; a path: that file)
function loadMap(map) {
  const dir = path.join(ROOT, 'data/maps', map), has = f => fs.existsSync(path.join(dir, f));
  if (!map.includes('/') && (has('shapes.js') || has('data.js'))) return { D: readMap(map).DATA };
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(map.includes('/') ? path.join(ROOT, map) : path.join(dir, 'cities.js'), 'utf8') + '\nthis.D = typeof DATA !== "undefined" ? DATA : CITIES;', ctx);
  return { D: ctx.D };
}
// An SVG path's rings, [x, y] points (an area drawn as a circle: a ring of 32 points around it)
const ringsOf = d => d.split(/M/).filter(Boolean).map(s => {
  const n = s.match(/-?\d*\.?\d+(?:e-?\d+)?/g).map(Number);
  if (/a/i.test(s)) { const r = n[2], cx = n[0] + r, cy = n[1]; return Array.from({ length: 32 }, (_, i) => [cx + r * Math.cos(i * Math.PI / 16), cy + r * Math.sin(i * Math.PI / 16)]); }
  const ring = []; for (let i = 0; i + 1 < n.length; i += 2) ring.push([n[i], n[i + 1]]); return ring;
}).filter(r => r.length >= 3);
const inRings = (rings, x, y) => { // even-odd, rings of [a, b] pairs; (x, y) in the same order
  let inside = false;
  for (const ring of rings) for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};
const km = (a, b) => d3.geoDistance([a[1], a[0]], [b[1], b[0]]) * 6371; // [lat, lng] pairs

let AREA = {}, bounds, styleRules = '', townZone = null;
const DIGIT_HINT = { 0: 11, 1: 1, 2: 8, 3: 2, 4: 7, 5: 3, 6: 12, 7: 5, 8: 6, 9: 4 };

if (o.base) {
  /* ---------- building blocks: the areas of an existing map, in its own map units ---------- */
  const { D } = loadMap(o.base);
  const proj = projectionFrom(D.proj), xy = (lat, lng) => proj([lng, lat]), ll = ([x, y]) => { const [lng, lat] = proj.invert([x, y]); return [lat, lng]; };
  const atoms = D.reg.map(r => {
    const rings = ringsOf(r.d); let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const ring of rings) for (const [x, y] of ring) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    return { id: r.id, rings, lab: ll([r.lx, r.ly]), box: [x0, y0, x1, y1], zones: new Map() };
  });
  const near = (a, x, y, m = 0) => x >= a.box[0] - m && x <= a.box[2] + m && y >= a.box[1] - m && y <= a.box[3] + m;
  const atomAt = (x, y) => atoms.find(a => near(a, x, y) && inRings(a.rings, x, y));
  { // (Mercator: west and east by x, north and south by y)
    const [s, w] = ll([Math.min(...atoms.map(a => a.box[0])), Math.max(...atoms.map(a => a.box[3]))]), [n, e] = ll([Math.max(...atoms.map(a => a.box[2])), Math.min(...atoms.map(a => a.box[1]))]);
    bounds = [[s, w], [n, e]];
  }
  let outside = 0, far = 0;
  const [mcol, mprop] = (o.match || '').split(':'), norm = s => String(s || '').normalize('NFD').replace(/[^a-z]/gi, '').toLowerCase();
  const alias = Object.fromEntries(o.alias.split(',').filter(Boolean).map(s => s.split('=').map(norm)));
  const byName = o.match ? Object.fromEntries(D.reg.map(r => [norm(r[mprop]), atoms.find(a => a.id === r.id)])) : {};
  const unmatched = new Map();
  for (const r of rows) {
    let hit = null;
    if (o.match) { const k = norm(r.f[+mcol]); hit = byName[alias[k] || k]; if (!hit) unmatched.set(r.f[+mcol], (unmatched.get(r.f[+mcol]) || 0) + 1); }
    const [x, y] = xy(r.lat, r.lng);
    hit ??= atomAt(x, y);
    if (!hit) { // off the simplified coast or on a small island: the area with the nearest border point, within 60 km
      outside++;
      const reach = 60 / (111.32 * Math.cos(r.lat * Math.PI / 180) / D.proj.k); // (60 km in map units there)
      let best = null, bd = Infinity, at = null;
      for (const a of atoms) {
        if (!near(a, x, y, reach)) continue;
        for (const ring of a.rings) for (const p of ring) { const dd = (p[0] - x) ** 2 + (p[1] - y) ** 2; if (dd < bd) { bd = dd; best = a; at = p; } }
      }
      if (!best || km([r.lat, r.lng], ll(at)) > 60) { far++; continue; }
      hit = best;
    }
    if (!hit.zones.has(r.zone)) hit.zones.set(r.zone, new Set());
    hit.zones.get(r.zone).add(r.code);
  }
  const minShare = +o['min-share'];
  const placed = new Set();
  for (const a of atoms) {
    const total = [...a.zones.values()].reduce((s, v) => s + v.size, 0);
    const ranked = [...a.zones].sort((x, y) => y[1].size - x[1].size || x[0].localeCompare(y[0]));
    a.keep = ranked.filter(([, v], i) => i === 0 || (v.size >= total * minShare && v.size >= 2)).map(([z]) => z);
    a.keep.forEach(z => placed.add(z));
  }
  // every real zone is on the map: one that reaches the share nowhere goes where it has the most postcodes
  const allZones = [...new Set(rows.map(r => r.zone))].sort();
  let forced = 0;
  for (const z of allZones) if (!placed.has(z)) {
    let best = null, n = 0;
    for (const a of atoms) { const s = a.zones.get(z); if (s && s.size > n) { n = s.size; best = a; } }
    if (best) { best.keep.push(z); forced++; }
  }
  // areas without a postcode point take the zones of the nearest area that has some
  const withData = atoms.filter(a => a.keep.length);
  let filled = 0;
  const parentOf = Object.fromEntries(D.reg.map(r => [r.id, o.parent ? String(r[o.parent]) : '']));
  for (const a of atoms) if (!a.keep.length) {
    let best = null, bd = Infinity;
    const near = withData.filter(b => parentOf[b.id] === parentOf[a.id]);
    for (const b of near.length ? near : withData) { const dd = km(a.lab, b.lab); if (dd < bd) { bd = dd; best = b; } }
    a.keep = [best.keep[0]]; filled++;
  }
  for (const a of atoms) AREA[a.id] = a.keep.sort();
  townZone = (lat, lng) => { const a = atomAt(...xy(lat, lng)); return a && a.keep.length === 1 ? a.keep[0] : null; };
  if (unmatched.size) console.log('names not matched (placed by coordinates):', [...unmatched].map(([k, v]) => `${k} ${v}`).join(', '));
  console.log(`areas ${atoms.length}; points off the map ${outside} (dropped as too far: ${far}); zones placed by most postcodes only: ${forced}; areas without points: ${filled}`);
  if (!PREFIX) styleRules = Object.entries(DIGIT_HINT).map(([d, h]) => `.r[data-g="${d}"]{--hint:var(--h${h})}`).join(' ');
} else {
  /* ---------- own map: nearest postcode, in the map space of an existing map ---------- */
  const { D } = loadMap(o.voronoi);
  const proj = projectionFrom(D.proj);
  const evenOdd = d => { const rings = ringsOf(d); return rings.length ? polygonClipping.xor(...rings.map(r => [[r]])) : []; };
  const land = D.land ? evenOdd(D.land) : polygonClipping.union(...D.reg.map(r => evenOdd(r.d)).filter(mp => mp.length));
  // frames: "nearest postcode" is decided inside one frame at a time (without --frames, all the land is one).
  let landFrames;
  if (o.frames === 'ne') {
    const ne = readGeoJSON(path.join(CACHE, 'ne_10m_admin_1_states_provinces.geojson'));
    const states = { type: 'FeatureCollection', features: ne.features.filter(f => f.properties.iso_a2 === CC && f.geometry) };
    landFrames = geoProject(states, proj).features.filter(f => f.geometry).map(f => f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates);
  } else if (o.frames?.startsWith('base:')) {
    const prop = o.frames.slice(5), groups = {};
    for (const r of D.reg) (groups[r[prop]] ??= []).push(evenOdd(r.d));
    landFrames = Object.values(groups).map(g => polygonClipping.union(...g.filter(mp => mp.length)));
  } else landFrames = [land];
  const FR = landFrames.map((_, i) => i);
  const boxes = landFrames.map(mp => { let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity; for (const poly of mp) for (const [x, y] of poly[0]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } return [x0, y0, x1, y1]; });
  const frameAt = (x, y) => FR.find(i => x >= boxes[i][0] && x <= boxes[i][2] && y >= boxes[i][1] && y <= boxes[i][3] && landFrames[i].some(poly => inRings(poly, x, y)));
  // one point per place on the map: the zone with the most postcodes there
  const spots = new Map();
  for (const r of rows) {
    const xy = proj([r.lng, r.lat]);
    if (!xy || xy[0] < -80 || xy[1] < -80 || xy[0] > D.w + 80 || xy[1] > D.h + 80) continue;
    const key = `${xy[0].toFixed(2)},${xy[1].toFixed(2)}`;
    if (!spots.has(key)) spots.set(key, { x: xy[0], y: xy[1], frame: FR.length === 1 ? 0 : frameAt(xy[0], xy[1]), zones: new Map() });
    const s = spots.get(key); s.zones.set(r.zone, (s.zones.get(r.zone) || 0) + 1);
    if (r.own) (s.own ??= new Set()).add(r.zone);
  }
  let pts = [...spots.values()].map(s => ({ ...s, zone: [...s.zones].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0] }));
  for (const p of pts) p.own = !!p.own?.has(p.zone);
  { // points just off the land (coast, small islands) join the frame of the nearest point on it
    const on = pts.filter(p => p.frame !== undefined), find = Delaunay.from(on, p => p.x, p => p.y);
    for (const p of pts) if (p.frame === undefined) p.frame = on[find.find(p.x, p.y)].frame;
  }
  const zoneSize = () => { const m = {}; for (const p of pts) m[p.zone] = (m[p.zone] || 0) + 1; return m; };
  let dropped = 0;
  for (let pass = 0; pass < (o['keep-all'] ? 0 : 2); pass++) { // --keep-all: the points are checked ones, none is a stray
    const size = zoneSize(), keep = [], stray = [];
    for (const f of FR) {
      const fp = pts.filter(p => p.frame === f); if (fp.length < 3) { keep.push(...fp); continue; }
      const del = Delaunay.from(fp, p => p.x, p => p.y);
      fp.forEach((p, i) => { let same = false; for (const j of del.neighbors(i)) if (fp[j].zone === p.zone) { same = true; break; } (same || size[p.zone] < 3 ? keep : stray).push(p); });
    }
    const left = new Set(keep.map(p => p.zone)); // --areas: a zone with no point left is scattered, not misplaced
    for (const p of stray) if (p.own && !left.has(p.zone)) keep.push(p); else dropped++;
    pts = keep;
  }
  const feats = [];
  for (const f of FR) {
    let fp = pts.filter(p => p.frame === f); if (!fp.length || !landFrames[f].length) continue;
    if (fp.length > 3) { // a point whose neighbours are all of its own zone moves no line between zones: left out, for speed
      const all = fp, del = Delaunay.from(all, p => p.x, p => p.y);
      fp = all.filter((p, i) => { for (const j of del.neighbors(i)) if (all[j].zone !== p.zone) return true; return false; });
      if (!fp.length) fp = [all[0]];
    }
    const cells = { type: 'FeatureCollection', features: [] };
    if (fp.length >= 2) { // (two points: the line halfway between them)
      const vor = Delaunay.from(fp, p => p.x, p => p.y).voronoi([-200, -200, D.w + 200, D.h + 200]);
      fp.forEach((p, i) => { const poly = vor.cellPolygon(i); if (poly) cells.features.push({ type: 'Feature', properties: { z: p.zone }, geometry: { type: 'Polygon', coordinates: [poly] } }); });
    } else cells.features.push({ type: 'Feature', properties: { z: fp[0].zone }, geometry: { type: 'Polygon', coordinates: [[[-200, -200], [D.w + 200, -200], [D.w + 200, D.h + 200], [-200, D.h + 200], [-200, -200]]] } });
    const topo = topology({ a: cells }, 1e7), geoms = topo.objects.a.geometries;
    for (const z of [...new Set(fp.map(p => p.zone))]) {
      const mp = merge(topo, geoms.filter(g => g.properties.z === z));
      const clipped = polygonClipping.intersection(mp.coordinates, landFrames[f]);
      if (clipped.length) feats.push({ z, coords: clipped });
    }
  }
  // one feature per zone: its pieces from every frame, joined where they touch
  const byZone = {};
  for (const f of feats) (byZone[f.z] ??= []).push(f.coords);
  // (With very many points the pieces can meet in nearly the same point and the join fails: then with the points
  // rounded, and if that fails too the pieces stay side by side.)
  const joined = parts => {
    for (const d of [null, 4, 3, 2]) try { return polygonClipping.union(...(d === null ? parts : parts.map(mp => mp.map(poly => poly.map(ring => ring.map(([x, y]) => [round(x, d), round(y, d)])))))); } catch (e) { /* next */ }
    return parts.flat();
  };
  const fc = { type: 'FeatureCollection', features: Object.entries(byZone).map(([z, parts]) => ({ type: 'Feature', properties: { id: z }, geometry: { type: 'MultiPolygon', coordinates: parts.length > 1 ? joined(parts) : parts[0] } })) };
  const topo = simplify(presimplify(topology({ a: fc }, 1e6)), +o['min-area']);
  const areaOf = poly => Math.abs(d3.geoPath(null).area({ type: 'Polygon', coordinates: poly }));
  // (points as fine as the map's own, a step finer for a zone drawn in its own shape; s: a zone's size on the ground,
  // which "largest area" goes by, from its size on the map at its latitude)
  const digits = D.proj.grain ? Math.round(-Math.log10(D.proj.grain)) : Math.min(3, Math.max(1, Math.ceil(-Math.log10(0.002 * D.proj.k)))), reg = [];
  let s = 90, w = 180, n = -90, e = -180;
  const inv = ([x, y]) => { const ll = proj.invert([x, y]); return ll ? [round(ll[1], 3), round(ll[0], 3)] : null; };
  const done = feature(topo, topo.objects.a).features, raw = Object.fromEntries(fc.features.map(f => [f.properties.id, f.geometry.coordinates]));
  const small = []; // drawn after the others, so above them
  for (const f of done) {
    const polys = (!f.geometry ? [] : f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates).filter(p => p[0] && p[0].length >= 4);
    const sized = polys.map(p => [p, areaOf(p)]), maxA = Math.max(0, ...sized.map(([, a]) => a));
    let kept = sized.filter(([, a]) => a >= 0.6 || a === maxA), fine = false;
    // A small or scattered zone (a campus, a few suburbs among a city's zone) is mostly lost in the simplifying, which
    // works to a tenth of a map unit. Where less than half of its land is left it keeps its own shape, drawn finer.
    const own = raw[f.properties.id].map(p => [p, areaOf(p)]), land = l => l.reduce((t, [, a]) => t + a, 0);
    if (land(kept) < land(own) / 2) { const top = Math.max(...own.map(([, a]) => a)); kept = own.filter(([, a]) => a >= top / 10); fine = true; }
    kept = kept.map(([p]) => p);
    if (!kept.length) { console.warn(`zone ${f.properties.id} vanished`); continue; }
    const g = { type: 'Feature', properties: f.properties, geometry: { type: 'MultiPolygon', coordinates: kept } };
    const { lx, ly, a } = labelAndArea(g);
    const lat = inv([lx, ly])[0], s = Math.round(a * (111.32 * Math.cos(lat * Math.PI / 180) / D.proj.k) ** 2);
    (fine ? small : reg).push({ id: f.properties.id, d: svgPath(g.geometry, fine ? digits + 1 : digits), lx, ly, a, s });
    const rings = kept.flatMap(poly => poly.map(ring => ring.map(inv).filter(Boolean)));
    for (const ring of rings) for (const [la, ln] of ring) { if (la < s) s = la; if (la > n) n = la; if (ln < w) w = ln; if (ln > e) e = ln; }
    AREA[f.properties.id] = [f.properties.id];
  }
  reg.push(...small);
  if (small.length) console.log(`small zones in their own shape: ${small.map(r => r.id).sort().join(' ')}`);
  bounds = [[s, w], [n, e]];
  // hint colors: by first digit, or (letter zones) every zone its own color, never a neighbour's
  if (!PREFIX) styleRules = Object.entries(DIGIT_HINT).map(([d, h]) => `.r[data-g="${d}"]{--hint:var(--h${h})}`).join(' ');
  else {
    const nb = neighbors(topo.objects.a.geometries), ids = topo.objects.a.geometries.map(g => g.properties.id), color = {}, used = Array(24).fill(0);
    for (const i of ids.map((_, i) => i).sort((a, b) => nb[b].length - nb[a].length)) {
      const taken = new Set(nb[i].map(j => color[ids[j]]).filter(Boolean));
      let best = 1; for (let h = 1; h <= 24; h++) if (!taken.has(h) && (taken.has(best) || used[h - 1] < used[best - 1])) best = h;
      color[ids[i]] = best; used[best - 1]++;
    }
    styleRules = ids.slice().sort().map(id => `.r[data-g="${id}"]{--hint:var(--h${color[id]})}`).join(' ');
  }
  fs.mkdirSync(out(''), { recursive: true });
  const DATA = { w: D.w, h: D.h, kpu: D.kpu, proj: D.proj, reg };
  fs.writeFileSync(out('data.js'), `// Generated by tools/postcodes.mjs: ${reg.length} postcode zones (nearest postcode, ${SOURCE}),\n// in the map space of ${mapPath(o.voronoi)} (${D.w}x${D.h} map units)\nconst DATA = ${JSON.stringify(DATA)};\n`);
  console.log(`places ${pts.length} (dropped as misplaced: ${dropped}); zones drawn ${reg.length} of ${new Set(rows.map(r => r.zone)).size}`);
}

/* ---------- names: towns by population; a town is in the zone of its map area (when that has one zone), else of the
   nearest postcode point within 25 km ---------- */
{
  const KEEP = new Set(['PPL', 'PPLA', 'PPLA2', 'PPLA3', 'PPLA4', 'PPLC', 'PPLG']);
  const lat0 = rows.reduce((s, r) => s + r.lat, 0) / rows.length, kx = Math.cos(lat0 * Math.PI / 180);
  const del = Delaunay.from(rows, r => r.lng * kx, r => r.lat);
  const dump = unzipText(await cached(`https://download.geonames.org/export/dump/${CC}.zip`, `geonames_${CC}.zip`), `${CC}.txt`);
  let last = 0;
  for (const line of dump.split('\n')) {
    const c = line.split('\t');
    if (c.length < 15 || c[6] !== 'P' || !KEEP.has(c[7]) || !(+c[14] > 0)) continue;
    const lat = +c[4], lng = +c[5], i = del.find(lng * kx, lat, last); last = i;
    const r = rows[i];
    const zone = (townZone && townZone(lat, lng)) || (d3.geoDistance([lng, lat], [r.lng, r.lat]) * 6371 <= 25 ? r.zone : null);
    if (!zone) continue;
    for (const p of prefixesOf(zone)) if (Z[p]) (Z[p].towns ??= []).push([c[1], +c[14]]);
  }
}
const NAME = {}, N = {};
for (const [p, z] of Object.entries(Z)) {
  const regions = top(z.r, 3, 0.12);
  const towns = [...new Map((z.towns || []).sort((a, b) => b[1] - a[1]).map(t => [t[0], t])).keys()].slice(0, 3);
  const places = towns.length ? towns : top(z.c, 3);
  if (o.head) { const head = codePlace[p.padEnd(digits, '0')]; if (head) { const i = places.indexOf(head); if (i >= 0) places.splice(i, 1); places.unshift(head); places.length = Math.min(places.length, 3); } }
  NAME[p] = [regions.join(', '), places.join(', ')];
  N[p] = z.codes.size;
}

/* ---------- post.js, hints.css ---------- */
const shown = new Set(Object.values(AREA).flatMap(zs => zs.flatMap(prefixesOf)));
const pick = obj => Object.fromEntries(Object.entries(obj).filter(([k]) => shown.has(k)).sort(([a], [b]) => a.localeCompare(b)));
const POST = {
  digits, mask: o.mask || '#'.repeat(digits), levels: PREFIX ? [0] : LEVELS,
  bounds: bounds.map(p => p.map(v => round(v, 2))), area: AREA, name: pick(NAME), n: pick(N),
};
fs.mkdirSync(out(''), { recursive: true });
const cmd = process.argv.slice(2).map(a => /^[\w./:,=-]+$/.test(a) ? a : `'${a}'`).join(' ');
fs.writeFileSync(out('post.js'), `// Generated by tools/postcodes.mjs from the postcodes of ${CC} (${SOURCE}): the zones of each map area,\n// and per zone its regions, largest places and number of postcodes\n//   node tools/postcodes.mjs ${cmd}\nconst POST = ${JSON.stringify(POST)};\n`);
fs.mkdirSync(path.join(ROOT, OUT_QUIZ), { recursive: true });
const css = path.join(ROOT, OUT_QUIZ, 'hints.css'), block = `/* hints: postcode zone (tools/postcodes.mjs) */\n${styleRules}\n/* end hints: postcode zone */\n`;
const old = fs.existsSync(css) ? fs.readFileSync(css, 'utf8') : '';
fs.writeFileSync(css, /\/\* hints: postcode zone[\s\S]*?end hints: postcode zone \*\/\n?/.test(old) ? old.replace(/\/\* hints: postcode zone[\s\S]*?end hints: postcode zone \*\/\n?/, block) : old + block);
const missing = [...new Set(rows.map(r => r.zone))].filter(z => !shown.has(z));
console.log(`levels ${POST.levels.map(l => `${l}: ${Object.keys(POST.name).filter(k => PREFIX || k.length === l).length}`).join(', ')}${missing.length ? `; zones not on the map: ${missing.join(' ')}` : ''}`);
