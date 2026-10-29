// Shared map building for the quiz tools: a map's Web Mercator frame and projection, its polygons projected and
// simplified with their borders shared, SVG paths in its map units, and the way back from a map to latitude and
// longitude.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import * as d3 from 'd3-geo';
import { geoProject } from 'd3-geo-projection';
import { topology } from 'topojson-server';
import { presimplify, simplify } from 'topojson-simplify';
import { feature, merge, mesh } from 'topojson-client';
import polylabel from 'polylabel';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const CACHE = path.join(ROOT, 'tools', 'cache');
export const UA = 'GeoQuizzes/1.0 (https://github.com/efittschen/geo_quizzes)';
fs.mkdirSync(CACHE, { recursive: true });

export const sleep = ms => new Promise(r => setTimeout(r, ms));
const round = (v, n) => Math.round(v * 10 ** n) / 10 ** n;

// Download a file once into tools/cache (shared by everyone working in this checkout); retries politely.
export async function cached(url, name) {
  const file = path.join(CACHE, name || url.replace(/^https?:\/\//, '').replace(/[^a-z0-9.]+/gi, '_').slice(-150));
  if (fs.existsSync(file) && fs.statSync(file).size > 0) return file;
  for (let i = 0; i < 6; i++) {
    const res = await fetch(url, { headers: { 'User-Agent': UA } }).catch(e => ({ ok: false, status: 0, e }));
    if (res.ok) {
      const tmp = `${file}.${process.pid}.part`;
      fs.writeFileSync(tmp, Buffer.from(await res.arrayBuffer()));
      fs.renameSync(tmp, file);
      return file;
    }
    if (res.status && res.status < 500 && res.status !== 429) throw new Error(`HTTP ${res.status} for ${url}`);
    await sleep(1500 * 2 ** i + Math.random() * 1500);
  }
  throw new Error(`Giving up on ${url}`);
}

// One file out of a zip archive (macOS/Linux unzip).
export function unzipText(zipFile, member) {
  return execFileSync('unzip', ['-p', zipFile, member], { maxBuffer: 1 << 30 }).toString('utf8');
}

export function readGeoJSON(file) {
  const g = JSON.parse(fs.readFileSync(file, 'utf8'));
  return rewind(g.type === 'FeatureCollection' ? g : { type: 'FeatureCollection', features: [g] });
}

// d3-geo reads polygons on the sphere: an exterior ring must enclose less than half the globe and a hole the
// rest. GeoJSON files wind rings the other way round (RFC 7946), so fix each ring by its spherical area.
export function rewind(fc) {
  const big = ring => d3.geoArea({ type: 'Polygon', coordinates: [ring] }) > 2 * Math.PI;
  for (const f of fc.features) {
    const g = f.geometry; if (!g) continue;
    const polys = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
    for (const p of polys) p.forEach((ring, i) => { if (big(ring) !== (i > 0)) ring.reverse(); });
  }
  return fc;
}

// Natural Earth countries (public domain), for the grey neighbouring land around a country.
export async function naturalEarthCountries() {
  return readGeoJSON(await cached('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson', 'ne_50m_admin_0_countries.geojson'));
}

/* ---------- maps in Web Mercator, as every quiz page draws them (engine/lib/mercator.js) ---------- */
// A map's proj: { type: 'mercator', k, lng0, y0, grain }: k map units per degree of longitude, lng0 its west edge,
// y0 its north edge as Mercator's y in degrees, so x = (lng − lng0)·k, y = (y0 − my(lat))·k; grain the step its
// points are rounded to (a city map has none).
const RAD = Math.PI / 180;
export const my = lat => Math.log(Math.tan(Math.PI / 4 + Math.max(-85.05, Math.min(85.05, lat)) * RAD / 2)) / RAD; // Mercator's y, in degrees
export const latOf = y => (2 * Math.atan(Math.exp(y * RAD)) - Math.PI / 2) / RAD;
// A point of a map -> [lat, lng].
export const latlng = (x, y, P) => [latOf(P.y0 - y / P.k), P.lng0 + x / P.k];
// The d3 projection of a map's proj, turned to half a turn east of its west edge so that a map over the 180th
// meridian (Russia) stays in one piece.
export function projectionFrom(def) {
  if (def.type !== 'mercator') throw new Error(`a map in ${def.type}: every map is Web Mercator`);
  return d3.geoMercator().rotate([-(def.lng0 + 180), 0]).scale(def.k * 180 / Math.PI).translate([180 * def.k, def.y0 * def.k]);
}
// The frame of a new map: W map units wide over the features' box (across the 180th meridian too), its height from
// Mercator. Its points are rounded no coarser than the latitudes and longitudes they come from (thousandths of a
// degree): to tenths of a map unit where k is 50 or more, else hundredths or thousandths (digits; def.grain).
// -> { def, proj, w, h, kpu, digits }
export function mercatorFrame(fc, W) {
  const [[w, s], [e, n]] = d3.geoBounds(fc), span = e >= w ? e - w : e + 360 - w;
  const k = W / span, y0 = my(n), mid = latOf((y0 + my(s)) / 2), digits = Math.min(3, Math.max(1, Math.ceil(-Math.log10(0.002 * k))));
  const def = { type: 'mercator', k, lng0: w, y0, grain: 10 ** -digits };
  return { def, proj: projectionFrom(def), w: W, h: Math.ceil((y0 - my(s)) * k), kpu: round(111.32 * Math.cos(mid * RAD) / k, 4), digits };
}
// The runs of points of an SVG path of straight lines (M L H V Z, either case, also without their letters), as
// [{ closed, pts: [[x, y]…] }]; null when it has anything else (an arc: an area drawn as a circle).
export function pathRuns(d) {
  if (!d || /[^MLHVZmlhvz\d\s,.eE+-]/.test(d)) return null;
  const out = [], re = /([MLHVZmlhvz])|(-?\d*\.?\d+(?:e-?\d+)?)/g;
  let cmd = '', nums = [], x = 0, y = 0, run = null, m;
  const flush = () => {
    const C = cmd.toUpperCase(), rel = cmd !== C;
    if (C === 'H' || C === 'V') for (const v of nums) { if (C === 'H') x = rel ? x + v : v; else y = rel ? y + v : v; run.pts.push([x, y]); }
    else for (let i = 0; i + 1 < nums.length; i += 2) {
      x = rel ? x + nums[i] : nums[i]; y = rel ? y + nums[i + 1] : nums[i + 1];
      if (C === 'M' && i === 0) out.push(run = { pts: [], closed: false });
      run.pts.push([x, y]);
    }
    nums = [];
  };
  while ((m = re.exec(d))) {
    if (m[1]) { if (cmd) flush(); cmd = m[1]; if (cmd === 'Z' || cmd === 'z') { if (run) { run.closed = true; [x, y] = run.pts[0]; } cmd = ''; } }
    else { if (!cmd) cmd = 'L'; nums.push(+m[2]); }
  }
  if (cmd) flush();
  return out;
}
// An area's outline on a map -> its rings in [lat, lng] (read off the map, exact to its grain).
export const latlngRings = (d, P) => (pathRuns(d) || []).map(r => r.pts.map(([x, y]) => latlng(x, y, P)));

const pathOf = (obj, digits = 1) => d3.geoPath(null).digits(digits)(obj) || '';

// Polygons -> projected, simplified features that share their borders (topology-aware simplification).
// minArea: points whose triangle is smaller than this many square map units are dropped (0.4 keeps detail at
// a 1000-wide map); dropRing: rings smaller than this are dropped, except each feature's largest.
export function planarFeatures(fc, proj, { minArea = 0.4, dropRing = 0.6, key = 'id' } = {}) {
  const projected = geoProject(fc, proj);
  const topo = topology({ a: projected }, 1e6);
  const simp = simplify(presimplify(topo), minArea);
  const feats = feature(simp, simp.objects.a).features.map(f => {
    const g = f.geometry;
    if (!g) return f;
    const polys = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
    const areaOf = poly => Math.abs(d3.geoPath(null).area({ type: 'Polygon', coordinates: poly }));
    const sized = polys.map(p => [p, areaOf(p)]).filter(([p]) => p[0] && p[0].length >= 4);
    const maxA = Math.max(0, ...sized.map(([, a]) => a));
    const kept = sized.filter(([, a]) => a >= dropRing || a === maxA).map(([p]) => p);
    return { ...f, geometry: { type: 'MultiPolygon', coordinates: kept } };
  });
  return { topo: simp, features: feats, keyOf: f => String(f.properties[key]) };
}

// Label point (pole of inaccessibility of the largest polygon) and total area of a planar feature.
export function labelAndArea(f) {
  const polys = f.geometry.coordinates;
  let best = null, bestA = -1, total = 0;
  for (const p of polys) {
    const a = Math.abs(d3.geoPath(null).area({ type: 'Polygon', coordinates: p }));
    total += a;
    if (a > bestA) { bestA = a; best = p; }
  }
  const lab = best ? polylabel(best, 0.5) : [0, 0];
  return { lx: round(lab[0], 1), ly: round(lab[1], 1), a: round(total, 1) };
}

// The country's outline and its inner region borders, from a set of regions (e.g. first-level divisions).
export function landAndLines(topo, obj = 'a', digits = 1) {
  const o = topo.objects[obj];
  return {
    land: pathOf(merge(topo, o.geometries), digits),
    lines: pathOf(mesh(topo, o, (a, b) => a !== b), digits),
  };
}

export const svgPath = pathOf;
