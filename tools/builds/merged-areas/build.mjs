#!/usr/bin/env node
// merged-areas: a country's map areas joined into larger ones, once, here, for the pages that click the larger ones
// (a picture quiz's states): each one outline on the Web Mercator map it is made from: d, lx, ly, a (in its units), s
// (its size on the ground, as the map's own areas have it), so the page joins nothing as it opens.
//
//   node tools/builds/merged-areas/build.mjs us-states | japan-prefs | south-asia
//
//   us-states    data/maps/us-states/states.js: the 50 states and Washington, D.C., each its counties (the map
//                data/maps/us-states, US Census Bureau) joined; with the map's size and projection
//   japan-prefs  quizzes/japan-diamonds/prefs.js: the prefectures that data/maps/japan-regions splits by power
//                utility, each its parts joined
//   south-asia   quizzes/south-asia-scripts/data.js: India's states and territories (their districts of
//                data/maps/india-districts joined), Nepal, Bangladesh and Bhutan (each its regions map joined), on
//                India's map; the four countries' outlines as its borders (cty); s: the size in km² (the four maps' own
//                sizes being in units of their own). Only its map: the file's scripts and sentences (SA) stay
// (japan-diamonds and south-asia-scripts are pages with a quiz.js of their own: their files stay in their folder.)
//
// The maps are read by readMap (tools/lib/quiz-files.mjs: from their split files or data.js, whichever they have).
// Joining is polygon-clipping's union of the areas' latitudes and longitudes (read off their outlines on their own
// map: exact; rings taken even-odd). Every
// piece stays (islands too); a hole stays where it is one of an area's own (a lake, an enclave), and goes where it lies
// in none of the areas (a gap between two areas' lines). The joined outline is put on the map: each ring turned whole
// to the map's side of the 180th meridian, its points rounded to the map's grain.
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { my, latlng, pathRuns } from '../../lib/geo.mjs';
import { readMap } from '../../lib/quiz-files.mjs';
const require = createRequire(new URL('../../', import.meta.url));
const pc = require('polygon-clipping');
const polylabel = ((m) => m.default || m)(require('polylabel'));

const Q = new URL('../../../quizzes/', import.meta.url).pathname, MAPS = new URL('../../../data/maps/', import.meta.url).pathname;
// A file of a page with a quiz.js of its own (quizzes/<id>/), read as it is
const read = (file, name) => { const ctx = {}; vm.runInNewContext(fs.readFileSync(Q + file, 'utf8') + `\nthis.out = ${name};`, ctx); return ctx.out; };
// An area's rings in latitude and longitude, [[lat, lng]…], from its outline on its own map (an area drawn as a circle:
// its own outline, real, else a ring of 32 points around it)
function fromMap(D) {
  const P = D.proj;
  return (r) => {
    let list = pathRuns(r.real || r.d);
    if (!list) { const m = /a\s*(\d*\.?\d+)/i.exec(r.d), rad = m ? +m[1] : 0.5; list = [{ pts: Array.from({ length: 32 }, (_, i) => [r.lx + rad * Math.cos(i * Math.PI / 16), r.ly + rad * Math.sin(i * Math.PI / 16)]) }]; }
    return { rings: list.map((run) => run.pts.map(([x, y]) => latlng(x, y, P))) };
  };
}

const close = (r) => (r.length && (r[0][0] !== r.at(-1)[0] || r[0][1] !== r.at(-1)[1]) ? [...r, r[0]] : r);
const evenOdd = (rings) => rings.map(close).filter((r) => r.length >= 4).reduce((acc, r) => (acc ? pc.xor(acc, [[r]]) : [[r]]), null) || [];
const ringArea = (ring) => ring.reduce((a, [x, y], i) => { const [u, v] = ring[(i + 1) % ring.length]; return a + x * v - u * y; }, 0) / 2;
const polyArea = (poly) => Math.abs(ringArea(poly[0])) - poly.slice(1).reduce((a, r) => a + Math.abs(ringArea(r)), 0);
const inRing = ([x, y], ring) => { let c = false; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const [xi, yi] = ring[i], [xj, yj] = ring[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };
// the union, without the gaps between the areas (counted in gaps)
function join(shapes, gaps) {
  const outer = shapes.flatMap((mp) => mp.map((p) => p[0]));
  return pc.union(...shapes).map(([ring, ...holes]) => [ring, ...holes.filter((h) => {
    const own = outer.some((r) => inRing(polylabel([h], 1e-6), r));
    if (!own) gaps.n++;
    return own;
  })]);
}
const biggest = (mp) => mp.reduce((b, p) => (polyArea(p) > polyArea(b) ? p : b));
const r1 = (v) => Math.round(v * 10) / 10;
// a polygon's size in km² ([lat, lng] rings; the sinusoidal projection is equal-area)
const km2 = (poly) => polyArea(poly.map((r) => r.map(([lat, lng]) => [lng * 111.32 * Math.cos(lat * Math.PI / 180), lat * 110.574])));

// A map (its data's w and proj: { type: 'mercator', k, lng0, y0, grain }): where a ring of [lat, lng] goes on it, and
// how its points are rounded.
function onMap(D) {
  const P = D.proj;
  const dec = Math.round(-Math.log10(P.grain)), rq = (v) => Math.round(v * 10 ** dec) / 10 ** dec, mid = P.lng0 + D.w / P.k / 2;
  const turn = (lng) => 360 * Math.round((mid - lng) / 360);
  const at = (lat, lng, t = turn(lng)) => [(lng + t - P.lng0) * P.k, (P.y0 - my(lat)) * P.k];
  // a ring turned whole (by its mean longitude); as a path's run, consecutive points that round alike once
  const ringXY = (r) => { const t = turn(r.reduce((s, p) => s + p[1], 0) / r.length); return r.map(([lat, lng]) => at(lat, lng, t)); };
  const ring = (r) => { let w = '', last = ''; for (const [x, y] of ringXY(r)) { const p = rq(x) + ',' + rq(y); if (p !== last) w += (w ? 'L' : 'M') + p; last = p; } return w + 'Z'; };
  return { at, ring, ringXY, rq, meta: { w: D.w, h: D.h, kpu: D.kpu, proj: P } };
}

// areas (data entries with their latitudes and longitudes: GEO(entry)) grouped by key -> { d, lx, ly, a, s } per group
// on map M; size(entries, joined) -> s (default: the entries' own s summed)
function merge(groups, GEO, M, size) {
  const out = {};
  for (const [key, rs] of groups) {
    const gaps = { n: 0 };
    const missing = rs.filter((r) => !GEO(r));
    if (missing.length) throw new Error(`${key}: no latitude and longitude for ${missing.map((r) => r.id).join(' ')}`);
    if (!size && rs.some((r) => typeof r.s !== 'number')) throw new Error(`${key}: an area without s`);
    const sz = size || ((xs) => xs.reduce((s, r) => s + r.s, 0));
    const gmp = join(rs.map((r) => evenOdd(GEO(r).rings)), gaps);
    const inGeo = rs.reduce((s, r) => s + evenOdd(GEO(r).rings).length, 0);
    if (!gmp.length) {
      // a place the map has only as points (its islands too small for an outline): a dot at each, as the engine draws
      // what is too small to see (dot: true, a path "Mx,yl0,0" per point); else the join failed
      const rings = rs.flatMap((r) => GEO(r).rings), point = (ring) => ring.every((p) => p[0] === ring[0][0] && p[1] === ring[0][1]);
      if (!rings.length || !rings.every(point)) throw new Error(`${key}: nothing left after joining`);
      const pts = rings.map((ring) => ring[0]), lab = [0, 1].map((k) => pts.reduce((s, p) => s + p[k], 0) / pts.length), [lx, ly] = M.at(lab[0], lab[1]);
      out[key] = { d: pts.map(([lat, lng]) => 'M' + M.at(lat, lng).map(M.rq).join(',') + 'l0,0').join(''), lx: r1(lx), ly: r1(ly), a: 0, s: r1(sz(rs, [])), dot: true, parts: rs.length, inGeo, pieces: pts.length, holes: 0, gaps: 0 };
      continue;
    }
    const rings = gmp.flatMap((p) => p.map((r) => r.slice(0, -1)));
    const [lx, ly] = M.at(...polylabel(biggest(gmp), 0.001));
    // (a: as mercator.js counts an area's, every ring's own size on the map summed)
    out[key] = {
      d: rings.map(M.ring).join(''), lx: r1(lx), ly: r1(ly), a: r1(rings.reduce((s, r) => s + Math.abs(ringArea(M.ringXY(r))), 0)), s: r1(sz(rs, gmp)),
      parts: rs.length, inGeo, pieces: gmp.length, holes: gmp.reduce((s, p) => s + p.length - 1, 0), gaps: gaps.n,
    };
  }
  return out;
}
const by = (list, key) => { const m = new Map(); for (const r of list) { const k = key(r); if (!m.has(k)) m.set(k, []); m.get(k).push(r); } return m; };
// (per joined area: its areas, their pieces → the joined pieces, holes kept, gaps closed)
const report = (S) => console.log(Object.entries(S).map(([k, v]) => `${k} ${v.parts}: ${v.inGeo}→${v.pieces} h${v.holes} g${v.gaps}`).join('\n'));
const shape = ({ d, lx, ly, a, s, dot }) => ({ d, lx, ly, a, s, ...(dot ? { dot: true } : {}) });

const TARGETS = {
  'us-states'() {
    const { DATA } = readMap('us-states'), M = onMap(DATA);
    const S = merge(by(DATA.reg, (r) => r.ab), fromMap(DATA), M);
    report(S);
    const name = Object.fromEntries(DATA.reg.map((r) => [r.ab, r.st]));
    const US_STATES = { ...M.meta, reg: Object.entries(S).map(([ab, m]) => ({ id: ab, name: name[ab], ...shape(m) })) };
    fs.writeFileSync(MAPS + 'us-states/states.js', '// The 50 states and Washington, D.C. (id: USPS code), each its counties (data/maps/us-states, US Census Bureau) joined\n'
      + '// into one outline, on the same map (its size and projection): the map of the pages that click a state.\n'
      + '// Made by tools/builds/merged-areas/build.mjs us-states.\n'
      + `const US_STATES = ${JSON.stringify(US_STATES)};\n`);
    return 'data/maps/us-states/states.js';
  },
  'japan-prefs'() {
    const { DATA } = readMap('japan-regions'), M = onMap(DATA);
    const S = merge([...by(DATA.reg, (r) => r.pf)].filter(([, rs]) => rs.length > 1), fromMap(DATA), M);
    report(S);
    fs.writeFileSync(Q + 'japan-diamonds/prefs.js', '// The prefectures that data/maps/japan-regions splits by power utility, each joined into one outline on its map\n'
      + '// (JIS number -> { d, lx, ly, a, s }), so that a click picks the whole prefecture. Made by\n'
      + '// tools/builds/merged-areas/build.mjs japan-prefs.\n'
      + 'const PREF_SHAPES = {\n' + Object.entries(S).map(([k, m]) => `  ${k}: ${JSON.stringify(shape(m))},`).join('\n') + '\n};\n');
    return 'quizzes/japan-diamonds/prefs.js';
  },
  'south-asia'() {
    const IN = readMap('india-districts'), M = onMap(IN.DATA), inGeo = fromMap(IN.DATA);
    // the page's ids where India's map has others
    const ID = { CG: 'CT', DD: 'DH', OD: 'OR', UK: 'UT' };
    const OLD = read('south-asia-scripts/data.js', 'DATA'), NAME = Object.fromEntries(OLD.reg.map((r) => [r.id, r.n]));
    const groups = [...by(IN.DATA.reg, (r) => ID[r.st] || r.st)].map(([id, rs]) => [id, rs.map((r) => ({ ...r, geo: inGeo(r) }))]);
    for (const [id, map] of [['NP', 'nepal-regions'], ['BD', 'bangladesh-regions'], ['BT', 'bhutan-regions']]) {
      const D = readMap(map).DATA, G = fromMap(D);
      groups.push([id, D.reg.map((r) => ({ ...r, geo: G(r) }))]);
    }
    const ids = groups.map(([id]) => id).sort(), want = Object.keys(NAME).sort();
    if (ids.join() !== want.join()) throw new Error(`south-asia: areas ${ids.join(' ')} are not the page's ${want.join(' ')}`);
    const sizeKm = (rs, gmp) => gmp.reduce((s, p) => s + km2(p), 0);
    const S = merge(new Map(groups), (r) => r.geo, M, sizeKm);
    report(S);
    // the countries' outlines: India's states joined, and the three others' own
    const india = merge(new Map([['IN', groups.filter(([id]) => !['NP', 'BD', 'BT'].includes(id)).flatMap(([, rs]) => rs)]]), (r) => r.geo, M, sizeKm).IN;
    const DATA = { ...M.meta, reg: Object.keys(NAME).map((id) => ({ id, n: NAME[id], ...shape(S[id]) })), cty: [india.d, S.NP.d, S.BD.d, S.BT.d] };
    const head = '// India\'s states and territories (their districts of data/maps/india-districts joined), Nepal, Bangladesh and Bhutan\n'
      + '// (each its regions map joined: data/maps/nepal-regions, bangladesh-regions, bhutan-regions), on India\'s map; s in km²;\n'
      + '// cty: the four countries\' outlines. Made by tools/builds/merged-areas/build.mjs south-asia.\n';
    // (the map only: the file's other parts, the scripts and sentences (SA), stay as they are)
    const lines = fs.readFileSync(Q + 'south-asia-scripts/data.js', 'utf8').split('\n'), at = lines.findIndex((l) => l.startsWith('const DATA = '));
    if (at < 1 || !lines[at - 1].startsWith('//')) throw new Error('south-asia-scripts/data.js: no "const DATA" line under its comment');
    let top = at - 1; while (top > 0 && lines[top - 1].startsWith('//')) top--;
    lines.splice(top, at - top + 1, ...head.trimEnd().split('\n'), `const DATA = ${JSON.stringify(DATA)};`);
    fs.writeFileSync(Q + 'south-asia-scripts/data.js', lines.join('\n'));
    return 'quizzes/south-asia-scripts/data.js';
  },
};
const t = TARGETS[process.argv[2]];
if (!t) throw new Error('usage: node tools/builds/merged-areas/build.mjs ' + Object.keys(TARGETS).join(' | '));
const file = t();
console.log(`${file}: ${Math.round(fs.statSync(new URL('../../../' + file, import.meta.url)).size / 1000)} kB`);
