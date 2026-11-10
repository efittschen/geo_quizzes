// A country's town-name quiz as a map quiz (engine/types/layer.js), from the parts tools/townnames.mjs found (NAMES,
// on the map of the country's city quiz: CITIES, data/maps/<slug>-cities/cities.js, which the page draws under it):
//   data/maps/<slug>-town-names/shapes.js   DATA: each part's 80% area (the smallest area holding 80% of its smoothed
//                                            places, ratio.py) on the country's land, shown only once answered (hide)
//   data/quizzes/<slug>-town-names/         settings.js: its rounds and Explore's list; names.js: each part's name, and
//                                            80 of its town names with the part marked (mark) and the town's place (at),
//                                            one asked at random; facts.js: each part's area and its places (points);
//                                            places.js: the names of those places (PLACE_NAMES), which Explore brings
//   quizzes/<slug>-town-names/index.html
// A part is drawn (Draw, graded as Draw grades a place: by its 80% area); once answered, its area, its places as dots
// and the town asked show with the drawing for 1.5 s (alone), or until the next drawing begins.
//
// Rounds: Common (the 9 parts with the most places, in a country with 10 or more), one per side of the country with
// every part on it (3 or more, not all of them), and always All, last; a round with just the parts of one before it is
// left out. Their keys are the ones the town-name page had, so its results carry over (assets/js/store.js paintIn).
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathRuns } from '../../lib/geo.mjs';
import { writeMap, quizFiles, quizScripts } from '../../lib/quiz-files.mjs';

const require = createRequire(new URL('../../', import.meta.url));
const pc = require('polygon-clipping');
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..', '..');
const SIDES = [['N', 'North'], ['E', 'East'], ['S', 'South'], ['W', 'West']], ASK = 80;   // (the town names asked of a part)
const r1 = v => Math.round(v * 10) / 10;

// rings taken even-odd, as one shape (polygon-clipping: a list of polygons, each its outer ring and its holes)
const evenOdd = rings => (rings.length ? pc.xor(...rings.map(r => [r])) : []);
const flatRings = flat => flat.map(f => { const r = []; for (let k = 0; k < f.length; k += 2) r.push([f[k], f[k + 1]]); return r; });
const area = r => { let a = 0; for (let i = 0, j = r.length - 1; i < r.length; j = i++) a += (r[j][0] - r[i][0]) * (r[j][1] + r[i][1]); return Math.abs(a / 2); };

// The name with the part found in it: [from, to], or null. An ending at the end of the name or of one of its words, a
// beginning at the start of one, a word as a word of its own (ё read as е).
function markOf(name, p) {
  const s = p.label.replace(/^-|-$/g, ''), low = name.toLowerCase().replace(/ё/g, 'е'), edge = '[\\s\\-\\/]', esc = s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(p.where === 'ending' ? `${esc}(?=$|${edge})` : p.where === 'beginning' ? `(?<=^|${edge})${esc}` : `(?<=^|${edge})${esc}(?=$|${edge})`);
  const m = low.length === name.length ? re.exec(low) : null;
  return m ? [m.index, m.index + s.length] : null;
}
// Where a part is thickest, its label's place: the middle of its places in the fullest square of 30 map units (with
// its neighbours).
function spotOf(p) {
  const cell = 30, key = i => Math.floor(p.x[i] / cell) * 1000 + Math.floor(p.y[i] / cell), count = new Map();
  for (let i = 0; i < p.x.length; i++) count.set(key(i), (count.get(key(i)) || 0) + 1);
  let best = null, most = -1;
  for (const k of count.keys()) { let s = 0; for (const d of [-1001, -1000, -999, -1, 0, 1, 999, 1000, 1001]) s += count.get(k + d) || 0; if (s > most) { most = s; best = k; } }
  let x = 0, y = 0, n = 0;
  for (let i = 0; i < p.x.length; i++) if (key(i) === best) { x += p.x[i]; y += p.y[i]; n++; }
  return [r1(x / n), r1(y / n)];
}

export function writeTownQuiz(slug, N, C, page) {
  const id = `${slug}-town-names`, P = N.parts;
  const land = evenOdd(pathRuns(C.land).map(r => r.pts).filter(p => p.length >= 3));
  // an item's id: its label; a second part of the same label (Bolivia's two -pampa, which the town-name page showed
  // alike too) has its number after it, its name stays the label
  const seen = new Map(), ids = P.map(p => { const k = (seen.get(p.label) || 0) + 1; seen.set(p.label, k); return k > 1 ? `${p.label} (${k})` : p.label; }), aid = i => 'p' + i;
  if (ids.length !== new Set(ids).size) throw new Error(`${slug}: ids not unique`);

  // the map: each part's 80% area on the land, those with the most places first (a tap on patches that overlap finds
  // the one with the fewest, drawn last: Explore's overview)
  const byPlaces = P.map((_, i) => i).sort((a, b) => P[b].n - P[a].n);
  const reg = byPlaces.map(i => {
    const p = P[i];
    const shape = pc.intersection(evenOdd(flatRings(p.area)), land);
    const rings = shape.flat().map(r => r.slice(0, -1).map(([x, y]) => [r1(x), r1(y)])).filter(r => r.length >= 3);
    if (!rings.length) throw new Error(`${slug}: ${p.label}'s area lies off the land`);
    const a = shape.reduce((s, poly) => s + area(poly[0]) - poly.slice(1).reduce((h, r) => h + area(r), 0), 0);
    const [lx, ly] = spotOf(p);
    return { id: aid(i), d: rings.map(r => 'M' + r.map(q => q.join(',')).join('L') + 'Z').join(''), lx, ly, a: r1(a), hide: true };
  });
  writeMap(id, { DATA: { w: C.w, h: C.h, kpu: C.kpu, proj: C.proj, reg } },
    `// Made by tools/builds/town-names/quiz.mjs: each part's 80% area on ${N.country}'s land (the map of its city quiz), shown once answered`);

  // the rounds, the parts with the most places first
  const rounds = [];
  const add = (key, label, list) => { if (list.length >= 3 && list.length < P.length && !rounds.some(r => r.ids.length === list.length && r.ids.every(i => list.includes(i)))) rounds.push({ key, label, ids: list }); };
  if (P.length >= 10) add('common9', 'Common', byPlaces.slice(0, 9));
  for (const [s, name] of SIDES) add(s, name, byPlaces.filter(i => P[i].side === s));
  rounds.push({ key: 'all', label: 'All', ids: byPlaces });
  // groups (Custom quizzes): by side, then any part without one
  const groups = [...SIDES.map(([s, name]) => [name, byPlaces.filter(i => P[i].side === s)]), ['Other', byPlaces.filter(i => !SIDES.some(([s]) => s === P[i].side))]].filter(([, list]) => list.length);

  const examples = p => p.names.slice(0, 6).join(' · ');
  // each part's colour in Explore's overview (map.tint; quiz-map.css --h1…--h24): the one whose nearest part of that colour lies
  // furthest from its own spot, an unused one first; the parts with the most places choose first
  const colour = [], spots = P.map(spotOf);
  for (const i of byPlaces) {
    const far = Array.from({ length: 24 }, (_, c) => Math.min(Infinity, ...byPlaces.filter(j => colour[j] === c).map(j => Math.hypot(spots[j][0] - spots[i][0], spots[j][1] - spots[i][1]))));
    colour[i] = far.indexOf(Math.max(...far));
  }
  const hue = i => `var(--h${colour[i] + 1})`;
  const numbers = p => [p.gain != null ? `+${p.gain.toLocaleString('en-US')} points` : '', p.cut != null ? `${p.cut}% outside` : ''].filter(Boolean).join(' · ');
  const settings = {
    key: id, map: 'DATA.reg', base: 'CITIES', size: [C.w, C.h], pad: 16, maxZoom: 40, labelScale: 0.18, fly: { pad: 1.6, min: 1.5 / 40 },
    hintLabel: '', hintsDefault: false, exploreKind: 'parts',
    exploreList: { label: 'Parts', overview: true, names: `../../data/quizzes/${id}/places.js`, items: byPlaces.map(i => ({ label: P[i].label, item: ids[i], areas: [aid(i)], color: hue(i), count: P[i].n.toLocaleString('en-US'), code: P[i].label, title: `${P[i].n.toLocaleString('en-US')} places`, sub: [numbers(P[i]), examples(P[i])].filter(Boolean) })) },
    rounds: rounds.map(r => ({ kind: 'parts', label: r.label, key: r.key, ids: r.ids.map(i => ids[i]) })),
    kinds: [{ key: 'parts', label: 'Parts', noun: ['part', 'parts'], prompt: 'text', pool: ['text'], ways: ['draw'], alone: 1500, hints: false, dim: false, areaRank: false, rankings: [['most places', byPlaces.map(i => ids[i])]] }],
  };
  const names = {
    explore: {}, groups: { parts: groups.map(([title]) => [title, '']) },
    kinds: { parts: {
      ...Object.fromEntries(['name', 'short', 'chip', 'chipTitle'].map(f => [f, Object.fromEntries(P.map((p, i) => [ids[i], p.label]))])),
      about: Object.fromEntries(P.map((p, i) => [ids[i], `${p.n.toLocaleString('en-US')} places`])),
      clicked: Object.fromEntries(P.map((p, i) => [aid(i), p.label])),
      pool: { text: Object.fromEntries(P.map((p, i) => [ids[i], p.names.slice(0, ASK).map((name, k) => { const mark = markOf(name, p); return { text: name, ...(mark ? { mark } : {}), at: [r1(p.x[k]), r1(p.y[k])] }; })])) },
    } },
  };
  const facts = {
    g: {}, groups: { parts: groups.map(([, list]) => list.map(i => ids[i])) },
    kinds: { parts: {
      areas: Object.fromEntries(P.map((p, i) => [ids[i], [aid(i)]])),
      points: Object.fromEntries(P.map((p, i) => [ids[i], p.x.flatMap((x, k) => [r1(x), r1(p.y[k])])])),
    } },
  };
  for (const [f, t] of Object.entries(quizFiles(id, { settings, names, facts }, 'tools/builds/town-names/quiz.mjs'))) { fs.mkdirSync(path.dirname(path.join(ROOT, f)), { recursive: true }); fs.writeFileSync(path.join(ROOT, f), t); }
  // the names of each part's places, in the order of its points (Explore shows the one pointed at; brought when it opens)
  fs.writeFileSync(path.join(ROOT, 'data', 'quizzes', id, 'places.js'), `// ${id}: the names of each part's places, in the order of its points (written by tools/builds/town-names/quiz.mjs; Explore brings it)\nconst PLACE_NAMES = ${JSON.stringify(Object.fromEntries(P.map((p, i) => [ids[i], p.names])))};\n`);

  // the page
  const scripts = ['../../engine/page.js', `../../data/maps/${slug}-cities/cities.js`].map(s => `<script src="${s}"></script>`).concat(quizScripts(id, id));
  const dir = path.join(ROOT, 'quizzes', id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${page.title} · Geo Quizzes</title>
<meta name="description" content="Draw where in ${N.country} the parts of town names are found.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../../assets/css/base.css">
<link rel="stylesheet" href="../../engine/css/quiz-page.css">
<link rel="stylesheet" href="../../engine/css/quiz-map.css">
<link rel="stylesheet" href="../../engine/css/formats.css">
</head>
<body>
<a class="back" href="../../country.html?code=${page.code}">← ${page.back}</a>
<h1>${page.title}</h1>
<p class="note">Places: ${page.places}${page.borders ? ' · ' + page.borders : ''}</p>
${scripts.join('\n')}
<script type="module" src="../../engine/main.js"></script>
</body>
</html>
`);
  return { parts: P.length, rounds: rounds.length };
}
