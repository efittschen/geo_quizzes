#!/usr/bin/env node
// townnames: the parts of a country's place names that mark a region -> quizzes/<slug>-town-names/names.js for the
// painting quiz (shared/paint-quiz.js).
//
//   node tools/townnames.mjs --iso2 DE --map quizzes/germany-cities/cities.js --out quizzes/germany-town-names/names.js
//        [--chosen tools/cache/builds/town-names/chosen.json]
//        [--min-places 60] [--parts 100] [--tight 90] [--gain 500] [--brush 120] [--cover 90] [--skip=-lde,-ke]
//
// With --chosen (what tools/builds/town-names/build.mjs passes): the parts are exactly the country's in that file
// (tools/builds/town-names/choose.mjs: the best 500 over all countries by smoothed ratio maps), best first, and each
// is graded against its 80% area (the smallest area holding 80% of its smoothed places): cover and painted are what
// that area holds of the part's places and of all places, and cut is the share of all places outside it. Without it,
// the older rule below picks the parts and the best drawing of the brush sets cover and painted.
//
// Places: GeoNames country dump (CC BY 4.0), every populated place but the sections inside a city (India: its own list, see lib/names.mjs). A part is an ending or a beginning of 2 to 7
// letters, or a separate word, found in --min-places places or more. A part is kept when knowing it adds --gain
// points or more to a guess on a map of the country (GeoGuessr's 5000 x exp(-10 d / D), D the map's diagonal: the
// best single guess for the part's places against the best single guess for all places); a part spread over the
// whole country adds nothing. Of those the --parts with the most places x gain are written, and every one whose
// outlines leave --tight percent of all places or more outside (the small local ones: -büll, -by), up to 150 parts
// in all (tools/lib/names.mjs). --skip leaves parts out by their label. A part is written a letter
// longer while nine in ten of its places agree on that letter (-ghausen becomes -inghausen).
// The map (land, region borders, neighbours, projection) is taken from --map: a cities.js made by tools/cities.mjs.
//
// Written per part: its places (x, y in map units; a sample of 3000 when it has more) and the names of 80 of them
// to ask with, gain (the points it adds to a guess), cut (the share of all places its outlines leave
// outside, percent), side (N, E, S or W: where the middle of its places lies from the middle of the country; the
// page sorts its rounds by these and by the number of places), dot (see dotOf) and the best drawing: at most three separate lines
// of the quiz's brush (--brush, its radius in map units) that cover --cover percent of the part's places or more
// and paint the fewest of all places; see bestDrawing. Also written: how many places each cell of the painting
// grid holds, so the page can tell how much was painted.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import { geoConicEqualArea } from 'd3-geo';
import { projectionFrom } from './lib/geo.mjs';
import { loadPlaces, candidates, select, label, sourceOf, countryPoints } from './lib/names.mjs';

const { values: o } = parseArgs({ options: { iso2: { type: 'string' }, map: { type: 'string' }, out: { type: 'string' }, 'min-places': { type: 'string', default: '60' }, parts: { type: 'string', default: '100' }, tight: { type: 'string', default: '90' }, gain: { type: 'string', default: '500' }, brush: { type: 'string', default: '120' }, cover: { type: 'string', default: '90' }, skip: { type: 'string', default: '' }, chosen: { type: 'string' } } });
for (const k of ['iso2', 'map', 'out']) if (!o[k]) { console.error(`missing --${k}`); process.exit(1); }
const CC = o.iso2.toUpperCase(), SKIP = new Set(o.skip.split(',').map(s => s.trim()).filter(Boolean));
const MOST = 150;   // parts written at most
const ASK = 80, SHOW = 3000;   // names to ask per part; places written per part
const CELL = 5, R = +o.brush, COVER = +o.cover / 100, LINES = 3, MIN_GAIN = 0.002, MIN_LINE = 0.02, MAX_CIRCLES = 400;

const MAP = vm.runInNewContext(fs.readFileSync(o.map, 'utf8') + ';CITIES');
// The map's projection; an Albers USA map by its lower-48 part, as shared/city-config.js reads it (Alaska and
// Hawaii are insets there).
const proj = MAP.proj.type === 'albersUsa' ? geoConicEqualArea().parallels([29.5, 45.5]).rotate([96, 0]).center([-0.6, 38.7]).scale(MAP.proj.scale).translate(MAP.proj.translate) : projectionFrom(MAP.proj);
// Places that fall off the map (those of an inset: Alaska, the Azores, Rapa Nui) are left out altogether.
const places = (await loadPlaces(CC)).filter(p => { [p.x, p.y] = proj([p.lng, p.lat]); return p.x >= 0 && p.x <= MAP.w && p.y >= 0 && p.y <= MAP.h; });

/* ---------- which parts ---------- */
const cands = candidates(places, { min: +o['min-places'] });
let picked;
if (o.chosen) {   // the parts choose.mjs picked for this country, in its order, each with its 80% area (x.aim)
  const mine = JSON.parse(fs.readFileSync(o.chosen, 'utf8'))[CC] || [], byLabel = new Map(cands.map(x => [label(x.kind, x.s), x]));
  picked = mine.map(c => { const x = byLabel.get(c.label); if (!x) console.error(`  ${c.label}: chosen, but not a part here`); else x.aim = c; return x; }).filter(Boolean);
  for (const x of cands) if (!picked.includes(x)) x.why = 'not chosen';
} else {
  const every = select(cands, { floor: +o.gain, rows: 1e4, places }).filter(x => !SKIP.has(label(x.kind, x.s)) || !(x.why = 'skipped'));
  picked = every.filter((x, i) => i < +o.parts || x.cut >= +o.tight / 100).slice(0, MOST);   // best value first, so the cap drops the smallest local ones
  for (const x of every) if (!picked.includes(x)) x.why = `beyond the first ${+o.parts}`;
}
// A part a letter longer while nine in ten of its places agree on the letter before it (after it, for a beginning).
function longer(x) {
  let s = x.s;
  if (x.kind === 'word') return s;
  const word = p => x.kind === 'ending' ? p.words.filter(w => w.length >= 4).pop() : p.words.find(w => w.length >= 4);
  for (;;) {
    const seen = new Map();
    for (const i of x.ids) { const w = word(places[i]), at = x.kind === 'ending' ? w.length - s.length - 1 : s.length; if (at >= 0 && at < w.length) seen.set(w[at], (seen.get(w[at]) || 0) + 1); }
    const [letter, n] = [...seen].sort((a, b) => b[1] - a[1])[0] || [];
    if (!letter || n < 0.9 * x.n || s.length >= 12) return s;
    s = x.kind === 'ending' ? letter + s : s + letter;
  }
}
const med = a => { const v = [...a].sort((x, y) => x - y); return v[v.length >> 1]; };
// The middle of the country: of the box around all its places (not where most places are, which in a country
// listed as unevenly as India would put nearly everything on one side).
const span = v => { let a = Infinity, b = -Infinity; for (const x of v) { if (x < a) a = x; if (x > b) b = x; } return (a + b) / 2; };
const mid = [span(places.map(p => p.x)), span(places.map(p => p.y))];
// How large a part's places are drawn in the preview so that they run together into a shape: a little more than
// the usual distance from a place to its third-nearest fellow place, within limits (map units).
function dotOf(x) {
  // (For a part with thousands of places, from every so-many-th place, the distances scaled back to all of them.)
  const step = Math.ceil(x.ids.length / 2000), pts = x.ids.filter((_, i) => i % step === 0).map(i => places[i]), third = pts.map(p => { let a = Infinity, b = Infinity, c = Infinity; for (const q of pts) { if (q === p) continue; const d = (q.x - p.x) ** 2 + (q.y - p.y) ** 2; if (d < a) { c = b; b = a; a = d; } else if (d < b) { c = b; b = d; } else if (d < c) c = d; } return Math.sqrt(c); });
  return Math.round(Math.min(30, Math.max(6, 1.3 * med(third) * Math.sqrt(pts.length / x.ids.length))));
}
const sideOf = x => { const dx = med(x.ids.map(i => places[i].x)) - mid[0], dy = med(x.ids.map(i => places[i].y)) - mid[1]; return Math.abs(dy) >= Math.abs(dx) ? (dy < 0 ? 'N' : 'S') : (dx > 0 ? 'E' : 'W'); };

/* ---------- the painting grid ---------- */
const gw = Math.ceil(MAP.w / CELL), gh = Math.ceil(MAP.h / CELL), r = R / CELL;
const cellOf = p => Math.min(gh - 1, Math.max(0, Math.floor(p.y / CELL))) * gw + Math.min(gw - 1, Math.max(0, Math.floor(p.x / CELL)));
const counts = new Array(gw * gh).fill(0);
for (const p of places) counts[cellOf(p)]++;
const disc = [];
for (let dy = -Math.ceil(r); dy <= Math.ceil(r); dy++) for (let dx = -Math.ceil(r); dx <= Math.ceil(r); dx++) if (dx * dx + dy * dy <= r * r) disc.push([dx, dy]);
const rows = [];   // the same circle as rows: [dy, half its width there]
for (let dy = -Math.floor(r); dy <= Math.floor(r); dy++) rows.push([dy, Math.floor(Math.sqrt(r * r - dy * dy))]);

// Every cell whose centre is within the brush of the line between two cell centres (a circle when they are one).
function swept(a0, b0, a1, b1, fn) {
  const dx = a1 - a0, dy = b1 - b0, len2 = dx * dx + dy * dy;
  for (let y = Math.max(0, Math.floor(Math.min(b0, b1) - r)); y <= Math.min(gh - 1, Math.ceil(Math.max(b0, b1) + r)); y++)
    for (let x = Math.max(0, Math.floor(Math.min(a0, a1) - r)); x <= Math.min(gw - 1, Math.ceil(Math.max(a0, a1) + r)); x++) {
      const t = len2 ? Math.max(0, Math.min(1, ((x - a0) * dx + (y - b0) * dy) / len2)) : 0, px = a0 + t * dx - x, py = b0 + t * dy - y;
      if (px * px + py * py <= r * r) fn(y * gw + x);
    }
}
// A drawing for a part at a price of paint: at most LINES separate lines of the brush.
//   1. Circles are added one at a time, each the one that gains most, while one still gains MIN_GAIN.
//   2. Circles that touch are joined into one line, nearest first.
//   3. While there are more than LINES lines, or two can be joined at no loss: the two whose join loses least are
//      joined (the brush drawn from one to the other), or the line that gains least is given up, whichever costs less.
//   4. A line that gains less than MIN_LINE in all (around a stray place or two) is given up.
// Gain is the share of the part's places covered minus the price times the share of all places painted.
function drawing(ids, price) {
  const worth = new Float64Array(gw * gh), mine = new Float64Array(gw * gh);
  for (let c = 0; c < worth.length; c++) worth[c] = -price * counts[c] / places.length;
  for (const i of ids) { const c = cellOf(places[i]); worth[c] += 1 / ids.length; mine[c] += 1 / ids.length; }
  const weight = Float64Array.from(worth);
  // What a circle at a cell gains: the weights under it, summed row by row from running sums along each row.
  const sums = new Float64Array((gw + 1) * gh);
  const sumRow = y => { for (let x = 0; x < gw; x++) sums[y * (gw + 1) + x + 1] = sums[y * (gw + 1) + x] + weight[y * gw + x]; };
  for (let y = 0; y < gh; y++) sumRow(y);
  const gainAt = (a, b) => { let s = 0; for (const [dy, half] of rows) { const y = b + dy; if (y >= 0 && y < gh) s += sums[y * (gw + 1) + Math.min(gw - 1, a + half) + 1] - sums[y * (gw + 1) + Math.max(0, a - half)]; } return s; };
  const gain = new Float64Array(gw * gh);
  for (let b = 0; b < gh; b++) for (let a = 0; a < gw; a++) gain[b * gw + a] = gainAt(a, b);
  const found = [];   // the circles: [a, b]
  while (found.length < MAX_CIRCLES) {
    let at = 0; for (let c = 1; c < gain.length; c++) if (gain[c] > gain[at]) at = c;
    if (gain[at] < MIN_GAIN) break;
    const a = at % gw, b = Math.floor(at / gw);
    found.push([a, b]);
    for (const [dx, dy] of disc) { const x = a + dx, y = b + dy; if (x >= 0 && x < gw && y >= 0 && y < gh) weight[y * gw + x] = 0; }
    for (const [dy] of rows) if (b + dy >= 0 && b + dy < gh) sumRow(b + dy);
    const R2 = Math.ceil(2 * r);
    for (let y = Math.max(0, b - R2); y <= Math.min(gh - 1, b + R2); y++) for (let x = Math.max(0, a - R2); x <= Math.min(gw - 1, a + R2); x++) gain[y * gw + x] = gainAt(x, y);
  }
  // Lines: which line a circle belongs to, the strokes drawn between circles, and which circle painted a cell first.
  const of = found.map((_, i) => i), top = i => { while (of[i] !== i) i = of[i] = of[of[i]]; return i; };
  const strokes = [], owner = new Int32Array(gw * gh).fill(-1), given = new Set();
  const paint = (i, j) => swept(found[i][0], found[i][1], found[j][0], found[j][1], c => { if (owner[c] < 0) owner[c] = i; });
  const join = (i, j) => { of[top(j)] = top(i); strokes.push([i, j]); paint(i, j); };
  const d2 = (i, j) => (found[i][0] - found[j][0]) ** 2 + (found[i][1] - found[j][1]) ** 2;
  found.forEach((_, i) => paint(i, i));
  const pairs = []; for (let i = 0; i < found.length; i++) for (let j = i + 1; j < found.length; j++) pairs.push([d2(i, j), i, j]);
  pairs.sort((x, y) => x[0] - y[0]);
  for (const [d, i, j] of pairs) if (d <= (2 * r) ** 2 && top(i) !== top(j)) join(i, j);
  for (;;) {
    const gains = new Map(); for (let c = 0; c < owner.length; c++) if (owner[c] >= 0) { const t = top(owner[c]); gains.set(t, (gains.get(t) || 0) + worth[c]); }
    const lines = [...gains.keys()]; if (!lines.length) break;
    // For every two lines their two nearest circles; of those joins the one that loses least.
    const near = new Map();
    for (const [d, i, j] of pairs) { const a = top(i), b = top(j); if (a === b || given.has(a) || given.has(b)) continue; const k = a < b ? a + ',' + b : b + ',' + a; if (!near.has(k)) near.set(k, [i, j]); }
    let best = null;
    for (const [i, j] of near.values()) { let g = 0; swept(found[i][0], found[i][1], found[j][0], found[j][1], c => { if (owner[c] < 0) g += worth[c]; }); if (!best || g > best.g) best = { i, j, g }; }
    const weakest = lines.reduce((m, t) => gains.get(t) < gains.get(m) ? t : m);
    const giveUp = t => { given.add(t); for (let c = 0; c < owner.length; c++) if (owner[c] >= 0 && top(owner[c]) === t) owner[c] = -2; };
    if (best && best.g >= 0) join(best.i, best.j);
    else if (lines.length > LINES) { if (best && -best.g <= gains.get(weakest)) join(best.i, best.j); else giveUp(weakest); }
    else if (gains.get(weakest) < MIN_LINE && lines.length > 1) giveUp(weakest);
    else break;
  }
  const kept = i => !given.has(top(i)), linked = new Set(strokes.flat());
  const drawn = [...strokes.filter(([i]) => kept(i)), ...found.map((_, i) => [i, i]).filter(([i]) => kept(i) && !linked.has(i))];
  let cover = 0, all = 0; for (let c = 0; c < owner.length; c++) if (owner[c] >= 0) { cover += mine[c]; all += counts[c]; }
  const at = v => Math.round((v + 0.5) * CELL);
  return { strokes: drawn.flatMap(([i, j]) => [at(found[i][0]), at(found[i][1]), at(found[j][0]), at(found[j][1])]), lines: new Set(found.map((_, i) => i).filter(kept).map(top)).size, share: cover, cover: Math.round(cover * 100), painted: Math.round(all / places.length * 1000) / 10 };
}
// The best drawing for a part: the one that paints the least of all places while covering COVER of the part's
// places or more. The dearer the paint, the less is painted and covered, so the highest price whose drawing still
// covers enough is searched for. (If even nearly free paint doesn't reach COVER in LINES lines, that drawing stands.)
function bestDrawing(ids) {
  let lo = 0.02, hi = 8, best = drawing(ids, lo);
  if (best.share < COVER) return best;
  for (let i = 0; i < 8; i++) { const mid = Math.sqrt(lo * hi), d = drawing(ids, mid); if (d.share >= COVER) { best = d; lo = mid; } else hi = mid; }
  return best;
}

/* ---------- write ---------- */
let seed = 20261002; const rnd = () => { seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const parts = picked.map(x => {
  // the aim: the 80% area (chosen parts) or the best drawing of the brush
  const best = x.aim ? { strokes: [], lines: 0, cover: Math.round(100 * x.aim.cover), painted: Math.round(1000 * x.aim.painted) / 10 } : bestDrawing(x.ids), ids = [...x.ids];
  // The places in a shuffled order (the same on every run): the first SHOW are written, the first ASK with names.
  for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]]; }
  ids.length = Math.min(ids.length, SHOW);
  return { label: label(x.kind, longer(x)), where: x.kind, n: x.n, gain: Math.round(x.gain), cut: x.aim ? Math.round(100 - 100 * x.aim.painted) : Math.round(x.cut * 100), side: sideOf(x), dot: dotOf(x), x: ids.map(i => Math.round(places[i].x)), y: ids.map(i => Math.round(places[i].y)), names: ids.slice(0, ASK).map(i => places[i].name), ...(x.aim ? { area: x.aim.area } : { best: best.strokes, lines: best.lines }), cover: best.cover, painted: best.painted };
});
const NAMES = { country: MAP.country, iso2: CC, w: MAP.w, h: MAP.h, kpu: MAP.kpu, cell: CELL, gw, gh, brush: R, total: places.length, points: Math.round(countryPoints(places)), counts, parts };
// Every part looked at, with its numbers and why it is out (next to the build's log, for checking):
// tools/cache/builds/town-names/<ISO2>.parts.json
const LOOKED = path.join(path.dirname(fileURLToPath(import.meta.url)), 'cache', 'builds', 'town-names');
fs.mkdirSync(LOOKED, { recursive: true });
fs.writeFileSync(path.join(LOOKED, `${CC}.parts.json`), JSON.stringify(cands.map(x => ({ label: label(x.kind, x.s), n: x.n, gain: Math.round(x.gain), cut: Math.round(x.cut * 100), in: picked.includes(x), why: x.why || null }))));
fs.mkdirSync(path.dirname(o.out), { recursive: true });
fs.writeFileSync(o.out, `// ${MAP.country}: ${parts.length} parts of place names that mark a region, generated by tools/townnames.mjs.
// Places: ${sourceOf(CC)}, ${places.length} populated places. Base map: ${o.map}.
// Fields: w/h (the map itself is the base map's: the page loads that cities.js); cell, gw, gh, counts (the painting grid: cells of ${CELL} map
// units and how many places each holds); brush (its radius in map units); parts: label, where (ending, beginning,
// word), n (places with the part), gain (the points knowing it adds to a guess; points: the best guess knowing
// only the country), cut (percent of all places ${o.chosen ? "outside the part's 80% area" : 'its outlines leave outside'}), side (N, E, S, W),
// dot (how large its places are drawn in the preview of a round, map units),
// x/y (those places, in map units; ${SHOW} of them, picked at random, when there are more), names (the names of the
// first ${ASK} of them, to ask with), ${o.chosen ? `cover and painted (what the part's 80% area, the smallest area holding
// 80% of its smoothed places, covers of the part and of all places, percent: what a drawing is graded against),
// area (that area's outline, the part's shape on the map: rings of x, y in map units).
// Parts: the country's of the best 500 over all countries (tools/builds/town-names/choose.mjs).` : `best (the strokes of the best drawing:
// x, y of one end and x, y of the other, in turn; a stroke with both ends alike is a dab), lines (how many separate
// lines they make), cover and painted (what the best drawing covers of the part and of all places, percent).`}
const NAMES = ${JSON.stringify(NAMES)};\n`);
console.log(`${places.length} places, ${parts.length} parts, map ${MAP.w}x${MAP.h}, grid ${gw}x${gh}, ${(fs.statSync(o.out).size / 1024).toFixed(0)} KB -> ${o.out}`);
for (const p of parts) console.log(`  ${p.label.padEnd(12)} ${p.side} ${String(p.n).padStart(5)} places, +${String(p.gain).padStart(4)} points, cut ${String(p.cut).padStart(2)}% | ${p.best ? `best drawing: ${p.lines} line${p.lines > 1 ? 's' : ' '} (${String(p.best.length / 4).padStart(2)} strokes)` : '80% area:'} cover ${String(p.cover).padStart(3)}%, paint ${String(p.painted).padStart(3)}% of all places`);
