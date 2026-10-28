// One-off, after build.mjs --write: the configs take the maps as they are made ready, without geo.js (latitudes
// and longitudes): no `geo` handed to the engine, the projection always (its grain tells the engine the map is made
// ready), the old equal-area size (s) and the own outline of an area drawn as a circle (real) passed with each area;
// and the pages stop loading geo.js. Every change must find its text exactly, or nothing is written.
import fs from 'node:fs';
import { Q, pages, scriptsOf } from './pages.mjs';
const out = new Map(), read = (p) => out.get(p) ?? fs.readFileSync(Q + p, 'utf8');
const edit = (p, from, to, n = 1) => { const s = read(p), k = s.split(from).length - 1; if (k !== n) throw new Error(`${p}: ${k} of ${JSON.stringify(from.slice(0, 80))}`); out.set(p, s.split(from).join(to)); };
const OLD = '// the map redrawn in Web Mercator (mercator.js), the street map under it', NEW = '// the map made ready in Web Mercator (tools/builds/mercator), the street map under it';

// the shared configs
edit('shared/layer-config.js', `      areas: M.list.map(r => { const id = String(r[M.idKey]); return { id, d: d[id] || r.d, lx: r.lx, ly: r.ly, a: r.a, g: g[id], ...(top.has(id) ? { top: true } : {}) }; }),`,
  `      // (a map made ready in Web Mercator: s, the area's size on the old equal-area map; real, its own outline where
      // the layer draws it as a circle)
      areas: M.list.map(r => { const id = String(r[M.idKey]); return { id, d: d[id] || r.d, lx: r.lx, ly: r.ly, a: r.a, g: g[id], ...(top.has(id) ? { top: true } : {}), ...(r.s !== undefined ? { s: r.s } : {}), ...(d[id] && r.s !== undefined ? { real: r.d } : {}) }; }),`);
// (the map's projection: on what holds its areas, FINE for FINE.reg, else its data.js; made ready, it needs no geo.js)
edit('shared/layer-config.js', `    return { list, idKey, AREAS, R, FV, kinds: {} };`, `    const holder = String(path).includes('.') ? resolve(String(path).split('.')[0]) : null; // (what holds the areas: DATA for DATA.reg)
    return { list, idKey, AREAS, R, FV, kinds: {}, holder };`);
edit('shared/layer-config.js', `      ...(typeof DATA === 'object' && DATA.proj ? { proj: DATA.proj, kpu: DATA.kpu } : {}), // how the map is projected, where its data.js says`,
  `      ...(P ? { proj: P.proj, kpu: P.kpu } : {}), // how the map is projected, where its data says`);
edit('shared/layer-config.js', `      ...(L.geo === false ? {} : { geo: resolve(L.geo || 'GEO'), street: L.street }),`,
  `      street: L.street, ...(L.geo === false || (P && P.proj.grain) ? {} : { geo: resolve(L.geo || 'GEO') }), // (latitudes and longitudes: a map not made ready in Web Mercator)`);
edit('shared/layer-config.js', `    const g = table(L.g, M.AREAS, a => quizVars(M, a)), top = new Set(L.top || []), d = L.d || {};`,
  `    const g = table(L.g, M.AREAS, a => quizVars(M, a)), top = new Set(L.top || []), d = L.d || {};
    const P = M.holder && M.holder.proj ? M.holder : typeof DATA === 'object' && DATA.proj ? DATA : null; // (the map's projection: where its areas are, else its data.js)`);
edit('shared/post-config.js', `    areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: LETTERS ? r.id : ((P.area[r.id] || [''])[0][0] || '') })),`,
  `    areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, ...(r.s !== undefined ? { s: r.s } : {}), g: LETTERS ? r.id : ((P.area[r.id] || [''])[0][0] || '') })),`);
edit('shared/post-config.js', `    geo: GEO,\n`, ``);

// a list of bare outlines as a layer's areas (map: { paths, cols }): their label points and old sizes (<path>At)
edit('shared/layer-config.js', `    const list = m.paths ? resolve(path).map((d, i) => ({ d, ...Object.fromEntries(Object.entries(m.cols).map(([f, col]) => [f, col[i]])) })) : resolve(path);`,
  `    // (bare outlines: their label points and old sizes beside them, where the map is made ready: <path>At)
    const at = m.paths && resolve(path + 'At');
    const list = m.paths ? resolve(path).map((d, i) => ({ d, ...(at && at[i] ? { lx: at[i][0], ly: at[i][1], s: at[i][2] } : {}), ...Object.fromEntries(Object.entries(m.cols).map(([f, col]) => [f, col[i]])) })) : resolve(path);`);

// the configs of their own
for (const d of fs.readdirSync(Q)) for (const f of ['quiz.js']) {
  const p = `${d}/${f}`; if (!fs.existsSync(Q + p)) continue;
  let s = read(p); if (!/\bgeo:/.test(s)) continue;
  const hasProj = /\bproj:/.test(s);
  const before = s;
  s = s.replace(`geo: GEO, proj: DATA.proj, kpu: DATA.kpu, ${OLD}`, `proj: DATA.proj, kpu: DATA.kpu, ${NEW}`)
    .replace(`geo: US_STATES.geo, proj: US_STATES.proj, kpu: US_STATES.kpu, ${OLD}`, `proj: US_STATES.proj, kpu: US_STATES.kpu, ${NEW}`)
    .replace(`geo: STATES.geo, proj: US_STATES.proj, kpu: US_STATES.kpu, ${OLD}`, `proj: US_STATES.proj, kpu: US_STATES.kpu, ${NEW}`)
    .replace(`geo: PREF_LATLNG, proj: DATA.proj, kpu: DATA.kpu, ${OLD}`, `proj: DATA.proj, kpu: DATA.kpu, ${NEW}`)
    .replace(`geo: GEO, kpu: DATA.kpu, ${OLD}`, `proj: DATA.proj, kpu: DATA.kpu, ${NEW}`)
    .replace(`geo: GEO, ${OLD}`, hasProj ? NEW : `proj: DATA.proj, kpu: DATA.kpu, ${NEW}`)
    .replace(/^(\s*)geo: GEO,\s*\n/m, hasProj ? '' : '$1proj: DATA.proj, kpu: DATA.kpu,\n');
  if (/\bgeo:/.test(s)) throw new Error(`${p}: a geo left: ${s.split('\n').find((l) => /\bgeo:/.test(l)).trim()}`);
  // each area's old equal-area size (s) with it, and a list of bare outlines with its label points and sizes
  s = s.replace(/\ba: (r|p)\.a\b/g, 'a: $1.a, s: $1.s')
    .replace(/DATA\.ent\.map\(\(d, i\) => \(\{ id: '(\w+)' \+ i, d, g: '' \}\)\)/g, "DATA.ent.map((d, i) => ({ id: '$1' + i, d, g: '', ...(DATA.entAt ? { lx: DATA.entAt[i][0], ly: DATA.entAt[i][1], s: DATA.entAt[i][2] } : {}) }))")
    // an area drawn as a circle: its own outline with it (real, for Shape)
    .replace("...(DRAWN[r.id] ? { top: true } : {})", "...(DRAWN[r.id] ? { top: true, real: r.d } : {})")
    .replace("...(DOT[r.id] ? { top: true } : {})", "...(DOT[r.id] ? { top: true, real: r.d } : {})")
    .replace("top: r.id in ENLARGED,", "top: r.id in ENLARGED, ...(ENLARGED[r.id] ? { real: r.d } : {}),");
  if (s !== before) out.set(p, s);
}
for (const p of ['geohints/us-config.js']) { edit(p, `geo: US_STATES.geo, proj: US_STATES.proj, kpu: US_STATES.kpu, ${OLD}`, `proj: US_STATES.proj, kpu: US_STATES.kpu, ${NEW}`); edit(p, 'a: r.a,', 'a: r.a, s: r.s,'); }
// what only the latitudes and longitudes were for
edit('japan-diamonds/quiz.js', `// … and in latitude and longitude: its own of ../japan-regions/geo.js, or the joined one of prefs.js\nconst PREF_LATLNG = Object.fromEntries(Object.entries(PIECES).map(([pf, [r]]) => ['p' + String(pf).padStart(2, '0'), PREF_GEO[pf] || GEO[r.id]]));\n`, ``);
edit('us-plate-designs/quiz.js', `    geo[id] = US_STATES.geo[r.id];\n`, ``);
edit('us-plate-designs/quiz.js', `  const areas = [], geo = {}, name = {}, title = {};`, `  const areas = [], name = {}, title = {};`);
edit('us-plate-designs/quiz.js', `  return { areas, geo, id: st => name[st], name: id => title[id] };`, `  return { areas, id: st => name[st], name: id => title[id] };`);

// the latitudes and longitudes inside two map files (made by tools/builds/merged-areas): no page reads them now
{ const p = 'us-states/states.js', t = read(p).split('\n'), i = t.findIndex((l) => l.startsWith('const US_STATES = '));
  const v = JSON.parse(t[i].slice('const US_STATES = '.length, -1)); if (!v.geo) throw new Error(p + ': no geo'); delete v.geo; t[i] = 'const US_STATES = ' + JSON.stringify(v) + ';'; out.set(p, t.join('\n')); }
{ const p = 'japan-diamonds/prefs.js', t = read(p).split('\n'), i = t.findIndex((l) => l.startsWith('const PREF_GEO = '));
  if (i < 0) throw new Error(p + ': no PREF_GEO'); t.splice(i, 1); out.set(p, t.join('\n')); }
// the pages: no geo.js (any file named geo.js holds only latitudes and longitudes, for the tools that build the maps)
let tags = 0;
for (const page of pages()) {
  const p = `${page}/index.html`, s = read(p);
  const t = s.replace(/^[ \t]*<script src="[^"]*\bgeo\.js"><\/script>\n/gm, () => { tags++; return ''; });
  if (t !== s) out.set(p, t);
}
if (process.argv.includes('--write')) {
  const SNAP = Q + '../tools/cache/builds/mercator/snapshot/quizzes/'; // (each file as it was, first)
  for (const p of out.keys()) { fs.mkdirSync(SNAP + p.replace(/[^/]*$/, ''), { recursive: true }); if (!fs.existsSync(SNAP + p)) fs.copyFileSync(Q + p, SNAP + p); }
  for (const [p, s] of out) fs.writeFileSync(Q + p, s);
}
console.log(`${out.size} files${process.argv.includes('--write') ? ' written' : ' would change'}; ${tags} geo.js tags`);
