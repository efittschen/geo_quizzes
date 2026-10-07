// Place names for the town-name quizzes: a country's populated places (GeoNames; India from its own list), the parts of their names
// (endings, beginnings, separate words), and how much each part tells about where in the country a place is.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, CACHE, cached, unzipText } from './geo.mjs';

const DUMP = 'https://download.geonames.org/export/dump';
// Countries read in their own script: the name is the place's Russian name from the GeoNames alternate names
// (the preferred one if there are several), else the first of its other names written in Cyrillic.
// Places without one are left out. ё counts as е, as signs and lists write either.
const CYRILLIC = new Set(['RU']), isCyrillic = s => /^[Ѐ-ӿ][Ѐ-ӿ \-.]*$/.test(s);
async function cyrillicNames(CC) {
  const best = new Map();
  for (const l of unzipText(await cached(`${DUMP}/alternatenames/${CC}.zip`, `geonames_alt_${CC}.zip`), `${CC}.txt`).split('\n')) {
    const p = l.split('\t');
    if (p[2] !== 'ru' || !isCyrillic(p[3] || '') || p[6] === '1' || p[7] === '1') continue;   // not colloquial, not historic
    if (!best.has(p[1]) || p[4] === '1') best.set(p[1], p[3]);
  }
  return best;
}
// Countries with a list of their own, where GeoNames covers the regions too unevenly: tools/cache/places_<CC>.tsv
// (name, lat, lng), written by the script named here.
const OWN_LIST = { IN: 'tools/builds/town-names/india-places.mjs' };
// Where a country's places come from, for the head of its names.js.
export const sourceOf = CC => OWN_LIST[CC] ? `the country's own list (${OWN_LIST[CC]})` : 'GeoNames (geonames.org, CC BY 4.0)';
const wordsOf = name => name.replace(/\(.*?\)/g, '').toLowerCase().replace(/ё/g, 'е').split(/[\s\-\/]+/).filter(w => w && !/[^\p{L}'’.]/u.test(w));
function ownPlaces(CC) {
  const file = path.join(CACHE, `places_${CC}.tsv`), places = [];
  if (!fs.existsSync(file)) throw new Error(`no ${path.relative(ROOT, file)}: run node ${OWN_LIST[CC]}`);
  for (const l of fs.readFileSync(file, 'utf8').split('\n')) {
    const [name, lat, lng] = l.split('\t'); if (!lng) continue;
    const words = wordsOf(name);
    if (words.length) places.push({ name, words, lat: +lat, lng: +lng });
  }
  return places;
}
// Sections of a place (PPLX) that lie inside a city are left out: GeoNames lists the neighbourhoods of some cities
// one by one, and Kobe's 128 "-dori" streets made a regional pattern of one city. A city is a place of CITY people
// or more, reaching CITY_KM km from its middle at that size and further with the root of its size (Kobe, 1.5
// million: 19 km). Elsewhere PPLX is kept: some countries file their rural localities under it (Chile's, Hungary's
// tanyák, Paraguay's compañías).
const CITY = 100000, CITY_KM = 5;
function inCity(lines) {
  const cells = new Map(), key = (lat, lng) => Math.floor(lat) * 1000 + Math.floor(lng);
  for (const p of lines) if (p[6] === 'P' && p[7] !== 'PPLX' && +p[14] >= CITY) {
    const lat = +p[4], lng = +p[5], r = CITY_KM * Math.sqrt(+p[14] / CITY);
    for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { const k = key(lat + a, lng + b); (cells.get(k) || cells.set(k, []).get(k)).push([lat, lng, r]); }
  }
  return (lat, lng) => (cells.get(key(lat, lng)) || []).some(([a, b, r]) => Math.hypot((lat - a) * 111.3, (lng - b) * 111.3 * Math.cos(lat * Math.PI / 180)) <= r);
}
// Every populated place (feature class P; not the historical, abandoned or destroyed ones, nor a city's sections):
// its name, the words of the name in lower case, and where it is.
export async function loadPlaces(CC) {
  if (OWN_LIST[CC]) return ownPlaces(CC);
  const own = CYRILLIC.has(CC) ? await cyrillicNames(CC) : null, places = [];
  const lines = unzipText(await cached(`${DUMP}/${CC}.zip`, `geonames_${CC}.zip`), `${CC}.txt`).split('\n').map(l => l.split('\t')), city = inCity(lines);
  for (const p of lines) {
    if (p[6] !== 'P' || /PPL[HQW]/.test(p[7]) || (p[7] === 'PPLX' && city(+p[4], +p[5]))) continue;
    const name = own ? own.get(p[0]) || p[3].split(',').find(isCyrillic) : p[1];
    if (!name) continue;
    const words = wordsOf(name);
    if (words.length) places.push({ name, words, lat: +p[4], lng: +p[5] });
  }
  return places;
}

// The parts of a name. Endings come from its last word of four letters or more, beginnings from its first.
const KINDS = {
  ending: p => { const w = p.words.filter(w => w.length >= 4).pop(); return w ? [2, 3, 4, 5, 6, 7].filter(L => w.length > L + 1).map(L => w.slice(-L)) : []; },
  beginning: p => { const w = p.words.find(w => w.length >= 4); return w ? [2, 3, 4, 5, 6, 7].filter(L => w.length > L + 1).map(L => w.slice(0, L)) : []; },
  word: p => p.words.length > 1 ? p.words : [],
};
// The places with a part, looked up by its label (-hausen, ober-, san).
export function placesWith(places, lab) {
  const kind = lab.startsWith('-') ? 'ending' : lab.endsWith('-') ? 'beginning' : 'word', s = lab.replace(/^-|-$/g, '');
  const has = kind === 'word' ? p => p.words.length > 1 && p.words.includes(s) : p => { const w = kind === 'ending' ? p.words.filter(w => w.length >= 4).pop() : p.words.find(w => w.length >= 4); return !!w && w.length > s.length + 1 && (kind === 'ending' ? w.endsWith(s) : w.startsWith(s)); };
  return places.map((p, i) => has(p) ? i : -1).filter(i => i >= 0);
}
export const label = (kind, s) => kind === 'ending' ? '-' + s : kind === 'beginning' ? s + '-' : s;

/* ---------- how well a part marks a region ----------
   Set the few stray places of the part aside, draw up to three outlines without dents (convex hulls) around the
   rest, and count the share of all places left outside them. */
const GRID = 60, FINE = 100, STRAY = 0.05, BLOBS = 3;
// Flat coordinates in km, and all places counted on a fine grid for a fast "how many places are inside".
function flatten(places) {
  if (places.km) return places.km;
  let s = 90, n = -90, w = 999, e = -999;
  for (const p of places) { s = Math.min(s, p.lat); n = Math.max(n, p.lat); w = Math.min(w, p.lng); e = Math.max(e, p.lng); }
  const cos = Math.cos((s + n) / 2 * Math.PI / 180), X = places.map(p => (p.lng - w) * cos * 111.3), Y = places.map(p => (p.lat - s) * 111.3);
  const size = Math.max((e - w) * cos * 111.3, (n - s) * 111.3), diag = Math.hypot((e - w) * cos * 111.3, (n - s) * 111.3), fs = size / FINE, fine = new Map();
  places.forEach((_, i) => { const k = Math.floor(X[i] / fs) * 1000 + Math.floor(Y[i] / fs); fine.set(k, (fine.get(k) || 0) + 1); });
  const cells = [...fine].map(([k, c]) => [(Math.floor(k / 1000) + 0.5) * fs, (k % 1000 + 0.5) * fs, c]);
  return places.km = { X, Y, size, diag, cells };
}
const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
function hull(pts) {   // points [x, y, place]; counter-clockwise
  pts = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const lo = [], up = [];
  for (const p of pts) { while (lo.length > 1 && cross(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i]; while (up.length > 1 && cross(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}
const within = (h, x, y) => { for (let i = 0; i < h.length; i++) if (cross(h[i], h[(i + 1) % h.length], [x, y]) < 0) return false; return true; };
// Groups of points for k outlines: k-means from the points furthest apart.
function groups(pts, k) {
  if (k === 1) return [pts];
  const d2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
  const mean = [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length];
  let cs = [pts.reduce((b, p) => d2(p, mean) > d2(b, mean) ? p : b)];
  while (cs.length < k) cs.push(pts.reduce((b, p) => Math.min(...cs.map(c => d2(p, c))) > Math.min(...cs.map(c => d2(b, c))) ? p : b));
  cs = cs.map(c => [c[0], c[1]]);
  let out = [];
  for (let it = 0; it < 12; it++) {
    out = cs.map(() => []);
    for (const p of pts) { let b = 0; for (let j = 1; j < k; j++) if (d2(p, cs[j]) < d2(p, cs[b])) b = j; out[b].push(p); }
    cs = out.map((g, j) => g.length ? [g.reduce((s, p) => s + p[0], 0) / g.length, g.reduce((s, p) => s + p[1], 0) / g.length] : cs[j]);
  }
  return out;
}
// The outlines of a part: its places without the STRAY share that sits where the part is thinnest, in the fewest
// groups (up to BLOBS) that leave nearly as much outside as the best number does. Returns the share of all places
// left outside and the share of the part's own places outside the outlines.
export function marker(places, ids) {
  const { X, Y, size, cells } = flatten(places), gs = size / GRID, count = new Map();
  const key = i => Math.floor(X[i] / gs) * 1000 + Math.floor(Y[i] / gs);
  for (const i of ids) count.set(key(i), (count.get(key(i)) || 0) + 1);
  const thick = i => { const k = key(i); let s = 0; for (const d of [-1001, -1000, -999, -1, 0, 1, 999, 1000, 1001]) s += count.get(k + d) || 0; return s; };
  const kept = ids.map(i => [thick(i), i]).sort((a, b) => b[0] - a[0]).slice(0, Math.ceil(ids.length * (1 - STRAY))).map(x => [X[x[1]], Y[x[1]], x[1]]);
  const tries = [];
  for (let k = 1; k <= BLOBS; k++) {
    const hulls = groups(kept, k).filter(g => g.length >= 3).map(hull).filter(h => h.length >= 3);
    const boxes = hulls.map(h => [Math.min(...h.map(p => p[0])), Math.max(...h.map(p => p[0])), Math.min(...h.map(p => p[1])), Math.max(...h.map(p => p[1]))]);
    let inAll = 0;
    for (const [x, y, c] of cells) for (let j = 0; j < hulls.length; j++) { const b = boxes[j]; if (x >= b[0] && x <= b[1] && y >= b[2] && y <= b[3] && within(hulls[j], x, y)) { inAll += c; break; } }
    tries.push({ out: 1 - inAll / places.length, hulls });
  }
  const best = Math.max(...tries.map(t => t.out)), pick = tries.find(t => t.out >= best - 0.05);
  const missed = ids.filter(i => !pick.hulls.some(h => within(h, X[i], Y[i]))).length / ids.length;
  return { out: pick.out, blobs: pick.hulls.length, missed, hulls: pick.hulls };
}
// What chance gives: the mean share left outside for random sets of n places, simulated for a ladder of sizes
// (always the same random numbers, so a rebuild gives the same result) and read off between them.
function chanceLevel(places, runs = 40) {
  let seed = 12345; const rnd = () => { seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const sizes = [60, 90, 128, 180, 250, 350, 500, 700, 1000, 1400, 2000, 4000, 8000].filter(n => n < places.length / 4);
  const mean = sizes.map(n => { let sum = 0; for (let r = 0; r < runs; r++) { const ids = new Set(); while (ids.size < n) ids.add(Math.floor(rnd() * places.length)); sum += marker(places, [...ids]).out; } return sum / runs; });
  return n => {
    if (n >= sizes[sizes.length - 1]) return mean[mean.length - 1];
    const i = Math.max(1, sizes.findIndex(s => s >= n)), t = (Math.log(n) - Math.log(sizes[i - 1])) / (Math.log(sizes[i]) - Math.log(sizes[i - 1]));
    return mean[i - 1] + Math.max(0, t) * (mean[i] - mean[i - 1]);
  };
}
/* ---------- how many points a part is worth ----------
   On a map of the country GeoGuessr gives 5000 x exp(-10 d / D) points for a guess d away, D being the map's
   diagonal. Knowing only the country, the best single guess gets some number of points on average over all its
   places; knowing the part, the best single guess for the part's places gets more. A part spread over the whole
   country gains nothing, however thin its outlines; a part in two far regions gains for the larger one only. */
const POINTS = 5000, LATTICE = 16, PLOT = 200;
// The average points of the best single guess for weighted points [x, y, weight] (km), k = 10 / D: the best of a
// lattice over them, then of two finer ones around it.
function bestGuess(pts, k) {
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity, total = 0;
  for (const p of pts) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); total += p[2]; }
  let best = -1, bx = 0, by = 0, sx = (x1 - x0) / (LATTICE - 1) || 1, sy = (y1 - y0) / (LATTICE - 1) || 1;
  const tryAt = (gx, gy) => { let v = 0; for (const p of pts) v += p[2] * Math.exp(-k * Math.hypot(p[0] - gx, p[1] - gy)); if (v > best) { best = v; bx = gx; by = gy; } };
  for (let j = 0; j < LATTICE; j++) for (let i = 0; i < LATTICE; i++) tryAt(x0 + i * sx, y0 + j * sy);
  for (let finer = 0; finer < 2; finer++) { sx /= 4; sy /= 4; const cx = bx, cy = by; for (let j = -4; j <= 4; j++) for (let i = -4; i <= 4; i++) if (i || j) tryAt(cx + i * sx, cy + j * sy); }
  return POINTS * best / total;
}
// The points of the best guess for some of the places (counted on a grid of a 200th of the country).
function pointsOf(places, ids) {
  const { X, Y, size, diag } = flatten(places), fs = size / PLOT, bins = new Map();
  for (const i of ids) { const k = Math.floor(X[i] / fs) * 1000 + Math.floor(Y[i] / fs); bins.set(k, (bins.get(k) || 0) + 1); }
  return bestGuess([...bins].map(([k, c]) => [(Math.floor(k / 1000) + 0.5) * fs, (k % 1000 + 0.5) * fs, c]), 10 / diag);
}
// What chance gives: the points of the best guess for random sets of n places (a small set always has a guess
// that suits it better than the country's), simulated for a ladder of sizes and read off between them.
function chancePoints(places, runs = 20) {
  let seed = 54321; const rnd = () => { seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const sizes = [60, 90, 128, 180, 250, 350, 500, 700, 1000, 1400, 2000, 4000, 8000].filter(n => n < places.length / 4);
  const mean = sizes.map(n => { let sum = 0; for (let r = 0; r < runs; r++) { const ids = new Set(); while (ids.size < n) ids.add(Math.floor(rnd() * places.length)); sum += pointsOf(places, [...ids]); } return sum / runs; });
  return n => {
    if (n >= sizes[sizes.length - 1]) return mean[mean.length - 1];
    const i = Math.max(1, sizes.findIndex(s => s >= n)), t = (Math.log(n) - Math.log(sizes[i - 1])) / (Math.log(sizes[i]) - Math.log(sizes[i - 1]));
    return mean[i - 1] + Math.max(0, t) * (mean[i] - mean[i - 1]);
  };
}
// The points of the best guess knowing only the country.
export const countryPoints = places => { const { cells, diag } = flatten(places); return bestGuess(cells, 10 / diag); };

// What some places (a part's) are worth: `cut` and `gain` as below, and the outlines (hulls of [x, y, place]).
export function worth(places, ids) {
  const level = places.level || (places.level = chanceLevel(places)), chance = places.chance || (places.chance = chancePoints(places));
  const m = marker(places, ids), base = level(ids.length);
  return { cut: Math.max(0, (m.out - base) / (1 - base)), gain: pointsOf(places, ids) - chance(ids.length), out: m.out, blobs: m.blobs, missed: m.missed, hulls: m.hulls };
}
// Every part found in `min` places or more. For each: `gain`, the points knowing it adds to a guess (counted from
// what chance adds for a part of its size), and `cut`, the share of all places its outlines leave outside
// (counted from what chance leaves outside). value = places x gain. Best value first.
export function candidates(places, { min = 60 } = {}) {
  const cands = [];
  for (const [kind, parts] of Object.entries(KINDS)) {
    const by = new Map();
    places.forEach((p, i) => { for (const s of new Set(parts(p))) (by.get(s) || by.set(s, []).get(s)).push(i); });
    for (const [s, ids] of by) {
      if (ids.length < min) continue;
      const { cut, gain, blobs, missed } = worth(places, ids);
      cands.push({ kind, s, ids, n: ids.length, cut, gain, value: ids.length * Math.max(0, gain), blobs, missed });
    }
  }
  return cands.sort((a, b) => b.value - a.value);
}
const setOf = x => x.set || (x.set = new Set(x.ids));
const shared = (a, b) => { const [small, big] = a.n <= b.n ? [a, b] : [b, a], s = setOf(big); let c = 0; for (const i of small.ids) if (s.has(i)) c++; return c; };
// The best `rows` parts that gain `floor` points or more. Of two parts that share most of their places only one is
// kept as a rule (-witz in -itz): the one with the higher value, or the narrower one when it is worth nearly as much
// (-itz for -tz), or the longer spelling of the same places ("làng" for "là-"). But a narrower spelling that gains
// SHARPER times the points of the broader part it sits in (-baru in -ru, -ghausen in -hausen) is kept as well, and
// the broader part then stays only if its places without the narrower ones still gain `floor` points (needs
// `places`). Every part that is not kept gets `why`.
const SHARPER = 1.2;
export function select(cands, { floor = 500, rows = 30, places = null } = {}) {
  const kept = [], name = x => label(x.kind, x.s);
  const holds = (broad, inner) => { if (!places) return false; const out = new Set(inner.flatMap(o => o.ids)); return worth(places, broad.ids.filter(i => !out.has(i))).gain >= floor; };
  for (const x of cands) {
    if (x.gain < floor) { x.why = `under ${floor} points`; continue; }
    if (kept.length >= rows && x.value < 0.85 * Math.min(...kept.map(k => k.base))) { x.why = 'not ranked'; continue; }
    let clash = null, both = 0, most = 0.6;
    for (const k of kept) { const c = shared(k.c, x), f = c / Math.min(k.c.n, x.n); if (f > most) { clash = k; both = c; most = f; } }
    if (!clash) { if (kept.length < rows) kept.push({ c: x, base: x.value, inner: [] }); else x.why = 'not ranked'; continue; }
    const k = clash.c, same = both / Math.max(x.n, k.n) > 0.9;
    if (!same && x.n < k.n && both / x.n > 0.9 && x.gain >= SHARPER * k.gain) {   // sharper, inside a kept broader part
      kept.push({ c: x, base: x.value, inner: [] });
      if (holds(k, [...clash.inner, x])) clash.inner.push(x);
      else { kept.splice(kept.indexOf(clash), 1); k.why = `not without ${name(x)}`; }
      continue;
    }
    if (!same && x.n > k.n && both / k.n > 0.9 && k.gain >= SHARPER * x.gain) {   // broader, around kept sharper parts
      const inner = kept.filter(o => o.c.n < x.n && shared(o.c, x) / o.c.n > 0.9 && o.c.gain >= SHARPER * x.gain).map(o => o.c);
      if (holds(x, inner)) kept.push({ c: x, base: x.value, inner }); else x.why = `not without ${name(k)}`;
      continue;
    }
    if ((x.n < k.n || (same && x.s.length > k.s.length)) && both / x.n > 0.9 && x.value >= 0.85 * clash.base) { k.why = `replaced by ${name(x)}`; clash.c = x; }
    else x.why = `inside ${name(k)}`;
  }
  return kept.map(k => k.c).sort((a, b) => b.value - a.value);
}
