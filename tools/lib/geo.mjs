// Shared map building for the quiz tools: fit an equal-area projection to a country, project and simplify its
// polygons, and produce SVG paths in the map space the quiz engine uses, plus [lat, lng] rings for the street map.
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

// Equal-area conic fitted to the features: standard parallels at 1/6 and 5/6 of the latitude range, centred on
// the middle longitude (works across the antimeridian). Returns the projection and its definition (DATA.proj),
// so other tools (cities) can place points in the same map space.
export function fitProjection(fc, width, pad = 0) {
  const [[w, s], [e, n]] = d3.geoBounds(fc);
  const span = e >= w ? e - w : e + 360 - w;
  let lon0 = w + span / 2; if (lon0 > 180) lon0 -= 360;
  const p1 = round(s + (n - s) / 6, 4), p2 = round(n - (n - s) / 6, 4);
  const proj = d3.geoConicEqualArea().parallels([p1, p2]).rotate([round(-lon0, 4), 0]);
  proj.fitWidth(width - 2 * pad, fc);
  const b = d3.geoPath(proj).bounds(fc);
  const [tx, ty] = proj.translate();
  proj.translate([round(tx + pad - b[0][0], 3), round(ty + pad - b[0][1], 3)]);
  proj.scale(round(proj.scale(), 3));
  const h = Math.ceil(b[1][1] - b[0][1] + 2 * pad);
  return { proj, w: width, h, def: projectionDef(proj) };
}
export function projectionDef(proj) {
  return { type: 'conicEqualArea', parallels: proj.parallels(), rotate: proj.rotate().slice(0, 2), scale: proj.scale(), translate: proj.translate() };
}
export function projectionFrom(def) {
  return d3.geoConicEqualArea().parallels(def.parallels).rotate(def.rotate).scale(def.scale).translate(def.translate);
}

// Kilometres per map unit at the centre of the map.
export function kmPerUnit(proj, w, h) {
  const a = proj.invert([w / 2 - 50, h / 2]), b = proj.invert([w / 2 + 50, h / 2]);
  return round(d3.geoDistance(a, b) * 6371 / 100, 4);
}

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

// Planar feature -> street-map rings ([lat, lng], 3 decimals ≈ 100 m) by inverting the projection.
export function geoRings(f, proj) {
  const inv = ([x, y]) => { const [lng, lat] = proj.invert([x, y]); return [round(lat, 3), round(lng, 3)]; };
  return f.geometry.coordinates.flatMap(poly => poly.map(ring => ring.map(inv)));
}

// Grey land of the neighbours: Natural Earth countries clipped to the map (plus a margin), without the country.
export async function contextPath(proj, w, h, iso3, { margin = 60, minArea = 1.5 } = {}) {
  const ne = await naturalEarthCountries();
  const others = { type: 'FeatureCollection', features: ne.features.filter(f => ![f.properties.ADM0_A3, f.properties.ISO_A3, f.properties.SOV_A3].includes(iso3)) };
  const clipped = proj.clipExtent([[-margin, -margin], [w + margin, h + margin]]);
  const projected = geoProject(others, clipped);
  proj.clipExtent(null);
  const topo = topology({ c: projected }, 1e6);
  const simp = simplify(presimplify(topo), minArea);
  return pathOf(feature(simp, simp.objects.c));
}

// The country's outline and its inner region borders, from a set of regions (e.g. first-level divisions).
export function landAndLines(topo, obj = 'a') {
  const o = topo.objects[obj];
  return {
    land: pathOf(merge(topo, o.geometries)),
    lines: pathOf(mesh(topo, o, (a, b) => a !== b)),
  };
}

export const svgPath = pathOf;
