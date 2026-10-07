#!/usr/bin/env node
// Area-code zones with land of their own. Three quizzes asked codes finer than their map: several codes lay on one
// department or district and could not be told apart. Here the map is redrawn from the places each code is known in:
// inside every area of the old map the land goes to the nearest such place (tools/postcodes.mjs draws that, staying
// inside the area's border), so a code keeps every area it was listed for and shares none with another code. Where
// no place of a code is known in one of its areas, the area's middle stands in. The lines between two codes inside
// one area are therefore estimates; the lines of the old areas are real.
// Two things keep the estimate honest. A phone number seen on OpenStreetMap counts only where a second place of
// its code lies within 15 km (a branch far away often shows its head office's number), unless the code has no other
// place in that area. And codes whose places are the same town (two blocks of numbers in one city) are not cut
// apart: they share one zone, as they share the town.
//
//   node tools/builds/code-zones/build.mjs BO     (or SN, KZ)
//
// Inputs in this folder: <cc>.tsv (code, lat, lng, place, source: where each code is known), and <cc>.items.json
// (what the quiz says of each item, per layer: names, towns, groups, and the areas of the old map it lies on).
// Writes the quiz's data.js, geo.js and layers.js.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { ROOT, CACHE } from '../../lib/geo.mjs';

const HERE = path.dirname(new URL(import.meta.url).pathname), Q = f => path.join(ROOT, 'quizzes', f);
const CONFIG = {
  BO: { quiz: 'bolivia-codes', base: 'bolivia-regions', key: 'bocodes', kinds: ['codes', 'first', 'prefixes'], finest: 'prefixes',
    parent: { first: f => f.slice(0, 2), codes: f => f[0] }, clicked: '{name} · {chipTitle}',
    explore: { code: '{prefixes.name}', title: '{prefixes.chipTitle}', sub: ['{first.name}'] },
    note: 'Bolivia Area Codes: the land of each prefix, drawn from the localities of the ITU list of 2001 and from landline numbers on OpenStreetMap.' },
  SN: { quiz: 'senegal-codes', base: 'senegal-regions', key: 'sncodes', kinds: ['codes', 'codes2', 'codes3'], finest: 'codes3',
    parent: { codes2: f => [f.slice(0, 2), '93'], codes: f => '33' + f[0] }, clicked: '{name} ({chipTitle})', areaName: 'n',
    explore: { code: '{codes3.name}', title: '{codes3.chipTitle}', sub: ['{codes2.name} · {codes2.chipTitle}'] },
    note: 'Senegal Area Codes: the land of each exchange, drawn from landline numbers on OpenStreetMap and in public directories.' },
  KZ: { quiz: 'kazakhstan-codes', base: 'kazakhstan-codes', baseFiles: ['districts.js', 'districts-geo.js'], key: 'kzcodes', kinds: ['codes', 'zone', 'digit'], finest: 'codes',
    parent: { zone: f => f.slice(0, 3), digit: f => f.slice(0, 2) }, clicked: '{p} · {about1}',
    explore: { code: '{codes.p}', title: '{codes.chipTitle}', sub: ['{codes.about1}', '{zone.p} · {zone.chipTitle}'] },
    note: 'Kazakhstan Area Codes: the land of each code, drawn from the places the ITU numbering plan names for it (placed with GeoNames).' },
};
const cc = process.argv[2], C = CONFIG[cc];
if (!C) { console.error('usage: build.mjs BO|SN|KZ'); process.exit(1); }

const run = (file, name) => { const ctx = {}; vm.createContext(ctx); vm.runInContext(fs.readFileSync(file, 'utf8').replace(new RegExp(`^(?:const|let)\\s+${name}\\s*=`, 'm'), `var ${name} =`), ctx); return ctx[name]; };
// Kazakhstan's zone map replaces its district map in the same folder: the districts are kept beside it as the base.
const [baseData, baseGeo] = C.baseFiles || ['data.js', 'geo.js'];
if (C.baseFiles && !fs.existsSync(path.join(Q(C.base), baseData))) { fs.renameSync(path.join(Q(C.base), 'data.js'), path.join(Q(C.base), baseData)); fs.renameSync(path.join(Q(C.base), 'geo.js'), path.join(Q(C.base), baseGeo)); }
const BASE = run(path.join(Q(C.base), baseData), 'DATA'), BGEO = run(path.join(Q(C.base), baseGeo), 'GEO');

/* ---------- what the quiz says of each item ---------- */
const itemsFile = path.join(HERE, `${cc}.items.json`);
const ITEMS = JSON.parse(fs.readFileSync(itemsFile, 'utf8')), K = Object.fromEntries(ITEMS.kinds.map(k => [k.key, k])), FINE = K[C.finest];
const codes = Object.keys(FINE.areas);

/* ---------- the places: checked against the areas each code is listed for, the area's middle where none is known ---------- */
const inRing = (ring, lat, lng) => { let s = false; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const [a, b] = ring[i], [d, e] = ring[j]; if ((b > lng) !== (e > lng) && lat < (d - a) * (lng - b) / (e - b) + a) s = !s; } return s; };
const inArea = (id, lat, lng) => BGEO[id].rings.reduce((s, r) => s !== inRing(r, lat, lng), false);
const km = (a, b) => { const R = Math.PI / 180, dl = (b[0] - a[0]) * R, dn = (b[1] - a[1]) * R, h = Math.sin(dl / 2) ** 2 + Math.cos(a[0] * R) * Math.cos(b[0] * R) * Math.sin(dn / 2) ** 2; return 12742 * Math.asin(Math.min(1, Math.sqrt(h))); };
const tsv = path.join(HERE, `${cc}.tsv`), stats = { known: 0, outside: 0, unknownCode: 0, alone: 0, middle: 0, blind: 0 };
const at = {}; // code|area -> its places there: { ll, place, soft }
for (const line of fs.existsSync(tsv) ? fs.readFileSync(tsv, 'utf8').split('\n') : []) {
  const [code, lat, lng, place = '', source = ''] = line.split('\t');
  if (!code || !isFinite(+lat) || !isFinite(+lng)) continue;
  if (!FINE.areas[code]) { stats.unknownCode++; continue; }
  const area = FINE.areas[code].find(a => inArea(a, +lat, +lng));
  if (!area) { stats.outside++; continue; }
  (at[code + '|' + area] ??= []).push({ ll: [+lat, +lng], place, soft: /^osm/.test(source) });
}
for (const key in at) { // a number seen once, far from every other place of its code, is likely a head office's
  const list = at[key], firm = list.filter(p => !p.soft || list.some(q => q !== p && km(p.ll, q.ll) < 15));
  stats.alone += list.length - (firm.length || list.length); if (firm.length) at[key] = firm;
}
// The zones: per area of the old map, the codes listed there in groups that share the land. Two codes are one group
// where the places of the one with fewer lie among the places of the other (four in five within 6 km): two blocks
// of numbers in the same town. (Not the other way round: one stray number of a rural code in a city would put the
// city's own code "among" it.) A code with no known place in the area cannot be told apart there and joins the
// group with the most places. An area no code of the finest layer covers stays whole.
const share = (P, Q) => P.filter(p => Q.some(q => km(p.ll, q.ll) < 6)).length / P.length;
const among = (P, Q) => (P.length <= Q.length && share(P, Q) >= 0.8) || (Q.length <= P.length && share(Q, P) >= 0.8);
const zones = [];
for (const a of BASE.reg.map(r => r.id)) {
  const here = codes.filter(c => FINE.areas[c].includes(a)), P = c => at[c + '|' + a] || [];
  const known = here.filter(c => P(c).length), blind = here.filter(c => !P(c).length), grp = Object.fromEntries(known.map(c => [c, c]));
  const find = c => (grp[c] === c ? c : (grp[c] = find(grp[c])));
  for (const c of known) for (const d of known) if (c < d && among(P(c), P(d))) grp[find(d)] = find(c);
  const groups = Object.values(known.reduce((m, c) => ((m[find(c)] ??= []).push(c), m), {})).sort((x, y) => y.flatMap(P).length - x.flatMap(P).length);
  if (!groups.length) groups.push([]);
  groups[0].push(...blind); stats.blind += here.length > 1 ? blind.length : 0;
  for (const g of groups) zones.push({ area: a, codes: g, pts: g.flatMap(P) });
}
zones.forEach((z, i) => { z.id = String(i + 1); });
const rows = zones.flatMap(z => (z.pts.length ? z.pts.map(p => [z.id, ...p.ll, p.place]) : [[z.id, ...BGEO[z.area].lab, '']]));
stats.known = zones.reduce((n, z) => n + z.pts.length, 0); stats.middle = zones.filter(z => !z.pts.length).length;
const work = path.join(CACHE, 'builds', 'code-zones', cc);
fs.mkdirSync(work, { recursive: true });
fs.writeFileSync(path.join(work, 'points.txt'), rows.map(([code, lat, lng, place]) => [cc, code, place, '', '', '', '', '', '', lat, lng, '6'].join('\t')).join('\n') + '\n');
console.log(`${cc}: ${codes.length} codes; places used ${stats.known} (left out: ${stats.outside} outside their code's areas, ${stats.alone} lone numbers, ${stats.unknownCode} of unknown codes); zones drawn from the area's middle: ${stats.middle}; codes with no known place in an area they share: ${stats.blind}`);
const together = zones.filter(z => z.codes.length > 1).map(z => `${z.codes.join(' = ')} (${z.area})`);
if (together.length) console.log('one zone for several codes:', together.join('; '));

/* ---------- the zones ---------- */
const out = path.join('tools', 'cache', 'builds', 'code-zones', cc, 'out');
fs.rmSync(path.join(ROOT, out), { recursive: true, force: true });
console.log(execFileSync('node', ['tools/postcodes.mjs', '--cc', cc, '--out', out, '--voronoi', `quizzes/${C.base}`, '--data-file', baseData, '--geo-file', baseGeo, '--prefix', '^[0-9]+', '--frames', 'base:id', '--keep-all', '--min-area', '0.3',
  '--points', path.join(work, 'points.txt'), '--source', 'tools/builds/code-zones'], { cwd: ROOT }).toString().trim().split('\n').slice(1, 2).join('\n'));
const DATA = run(path.join(ROOT, out, 'data.js'), 'DATA'), GEO = run(path.join(ROOT, out, 'geo.js'), 'GEO');
const drawn = new Set(DATA.reg.map(r => r.id)), live = zones.filter(z => drawn.has(z.id));
const head = `// ${C.note}\n// Made by tools/builds/code-zones/build.mjs on the areas of ../${C.base}${C.baseFiles ? '/' + baseData : ''}: inside each of them the land goes to the\n// nearest place a code is known in, so the lines between codes inside one area are estimates.\n`;
fs.writeFileSync(path.join(Q(C.quiz), 'data.js'), `${head}const DATA = ${JSON.stringify({ ...DATA, ctx: BASE.ctx ?? DATA.ctx })};\n`);
fs.writeFileSync(path.join(Q(C.quiz), 'geo.js'), `// Street-map rings [lat, lng] for the areas in data.js (same simplification)\nconst GEO = ${JSON.stringify(GEO)};\n`);

/* ---------- the quiz's data on the new map: every item is a group of zones ---------- */
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const has = (key, id, z) => (key === C.finest ? z.codes.includes(String(id)) : z.codes.length ? z.codes.some(f => [].concat(C.parent[key](f)).includes(String(id))) : K[key].areas[id].includes(z.area));
const kinds = C.kinds.map(key => {
  const k = K[key], ids = Object.keys(k.areas), x = t => ({ x: t });
  const areas = Object.fromEntries(ids.map(id => [id, live.filter(z => has(key, id, z)).map(z => z.id)]));
  // every item keeps its land: the areas it was on before are the areas its zones lie in now
  for (const id of ids) { const before = [...new Set(k.areas[id])].sort(), now = [...new Set(areas[id].map(z => zones[z - 1].area))].sort(); if (!same(before, now)) console.warn(`  ${key} ${id}: was on ${before.join(' ')}, now on ${now.join(' ')}`); }
  // where several items lie on one zone, the one a click on it "is": the one the old map named for that area
  const primary = Object.fromEntries(live.map(z => [z.id, (k.primary || {})[z.area]]).filter(([z, p]) => p != null && areas[p].includes(z) && ids.filter(id => areas[id].includes(z)).length > 1));
  const mine = new Set(Object.values(areas).flat()), bare = Object.fromEntries(live.filter(z => !mine.has(z.id)).map(z => [z.id, k.clickedOn[z.area]]));
  return { key, label: k.label, noun: k.noun, ...k.flags, groups: k.groups, areas: x(areas),
    name: x(k.name), ...(same(k.short, k.name) ? { short: '{name}' } : { short: x(k.short) }), ...(same(k.chip, k.name) ? { chip: '{name}' } : { chip: x(k.chip) }), chipTitle: x(k.chipTitle), about: x(k.about),
    ...(k.dial ? { dial: x(k.dial) } : {}), ...(k.detail ? { detail: [k.detail[0], x(k.detail[1])] } : {}),
    ...(Object.keys(primary).length ? { primary: x(primary) } : {}), clicked: Object.keys(bare).length ? { t: C.clicked, x: bare } : C.clicked, ...(k.presets.length ? { presets: k.presets } : {}) };
});
const whole = live.filter(z => !z.codes.length);
if (whole.length) console.log('areas kept whole (no code of the finest layer):', whole.map(z => z.area).join(' '));
const LAYERS = { key: C.key, ...(ITEMS.quiz.borders.length ? { borders: ITEMS.quiz.borders } : {}), size: ITEMS.quiz.size, pad: ITEMS.quiz.pad, maxZoom: Math.max(ITEMS.quiz.maxZoom, 40), labelScale: ITEMS.quiz.labelScale, fly: ITEMS.quiz.fly, street: ITEMS.quiz.street,
  hintLabel: ITEMS.quiz.hintLabel, exploreKind: C.finest, kinds, g: { x: Object.fromEntries(live.map(z => [z.id, ITEMS.g[z.area]])) },
  explore: whole.length ? { t: C.explore, x: Object.fromEntries(whole.map(z => [z.id, { code: K[C.kinds[0]].clickedOn[z.area], title: BASE.reg.find(r => r.id === z.area)[C.areaName] || '', sub: [] }])) } : C.explore };
const ident = k => /^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k);
const lit = L => '{\n' + Object.entries(L).map(([k, v]) => k === 'kinds' ? '  kinds: [\n' + v.map(kind => '    {\n' + Object.entries(kind).map(([p, x]) => `      ${ident(p)}: ${JSON.stringify(x)},`).join('\n') + '\n    },').join('\n') + '\n  ],' : `  ${ident(k)}: ${JSON.stringify(v)},`).join('\n') + '\n}';
fs.writeFileSync(path.join(Q(C.quiz), 'layers.js'), `${head}// Places: ${path.basename(tsv)} here; what is said of each code: ${path.basename(itemsFile)}.\n\nconst LAYERS = ${lit(LAYERS)};\n`);
const lost = codes.filter(c => !live.some(z => z.codes.includes(c)));
console.log(`${codes.length} codes on ${live.length} zones${lost.length ? '; codes without a zone: ' + lost.join(' ') : ''}`);
