// The files a quiz page loads, written from what the builders make (docs.local/SPEC.md, "A quiz page"; "Where things
// are"). A map is a folder data/maps/<map>/:
//   shapes.js   loaded by the pages: each global of the map (DATA …) with its outlines, label points, sizes and lines
//               only, and in `drawn` what its quizzes add to its drawing (circles, top, pins, lines:
//               engine/types/layer.js)
//   names.js    MAP_NAMES: the words of its areas (the fields whose values are words), row by row as in shapes.js
//   facts.js    MAP_FACTS: everything else (codes, groups, populations …), the same way
// names.js and facts.js are the source the quizzes on the map are made from; no page loads them. A quiz of the map
// type is a folder data/quizzes/<id>/ with settings.js, names.js and facts.js, written out by writeQuiz from its
// recipe (LAYERS, tools/lib/layer-recipe.js) so the browser only looks things up.
//
//   readMap(map)                 -> { DATA, … }: the map's globals with every field back on its areas (for builders
//                                   that work on a map: a recipe is run on this, a base map is read from it)
//   writeMap(map, globals, head) the map's files from its globals (head: the comment lines on top); what its quizzes
//                                   add to its drawing is kept
//   writeQuiz(id, LAYERS, map)   the quiz's three files, from its recipe run on the map; what it adds to the map's
//                                   drawing goes into the map's shapes.js
//   quizScripts(id, map)         the <script> lines of such a page, between engine/page.js and the engine
//
// From the command line, for a build script that writes its recipe to a file (const LAYERS = …):
//   node tools/lib/quiz-files.mjs <quiz id> <map> <recipe file>
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..'); // (as geo.mjs's, without its map packages)

const MAPS = path.join(ROOT, 'data/maps'), QUIZZES = path.join(ROOT, 'data/quizzes');
const GEO = new Set(['d', 'lx', 'ly', 'a', 's', 'tx', 'ty', 'w', 'dot', 'pin']), FRAME = ['w', 'h', 'kpu', 'proj', 'L'];
const isPath = v => typeof v === 'string' && /^M[\d.\-]/.test(v);
const isGeo = v => isPath(v) || (Array.isArray(v) && v.length > 0 && v.every(x => isPath(x) || x === null || (Array.isArray(x) && x.every(n => typeof n === 'number' || n === null))));
const wordy = v => (typeof v === 'string' && /\p{L}/u.test(v)) || (Array.isArray(v) && v.length > 0 && v.every(x => typeof x === 'string' && /\p{L}/u.test(x)));
const records = v => Array.isArray(v) && v.length > 0 && v[0] && typeof v[0] === 'object' && !Array.isArray(v[0]);
const globalsOf = src => [...src.matchAll(/^(?:const|let|var) (\w+)\s*=/gm)].map(m => m[1]);
const run = (src, names) => new Function(src + `;return {${names.join(',')}}`)();

/* ---------- a map ---------- */
export function readMap(map) {
  const dir = path.join(MAPS, map), file = f => path.join(dir, f);
  if (!fs.existsSync(file('shapes.js'))) { // (a map not split yet: its data.js)
    const src = fs.readFileSync(file('data.js'), 'utf8');
    return run(src, globalsOf(src));
  }
  const src = fs.readFileSync(file('shapes.js'), 'utf8'), out = run(src, globalsOf(src));
  const part = f => (fs.existsSync(file(f)) ? new Function(fs.readFileSync(file(f), 'utf8') + `;return ${f === 'names.js' ? 'MAP_NAMES' : 'MAP_FACTS'}`)() : {});
  for (const source of [part('names.js'), part('facts.js')]) for (const [, globals] of Object.entries(source)) for (const [g, fields] of Object.entries(globals)) {
    const v = out[g];
    for (const [k, x] of Object.entries(fields)) {
      if (records(v && v[k]) && Array.isArray(x)) v[k].forEach((r, i) => Object.assign(r, x[i] || {}));
      else if (v) v[k] = x;
    }
  }
  for (const v of Object.values(out)) if (v && typeof v === 'object') delete v.drawn;
  return out;
}

export function writeMap(map, globals, head = '') {
  const dir = path.join(MAPS, map), shapes = [], names = {}, facts = {};
  const kept = fs.existsSync(path.join(dir, 'shapes.js')) ? (src => run(src, globalsOf(src)))(fs.readFileSync(path.join(dir, 'shapes.js'), 'utf8')) : {};
  for (const [g, v] of Object.entries(globals)) {
    if (Array.isArray(v)) { shapes.push(`const ${g} = ${JSON.stringify(v)};`); continue; } // (a bare list of outlines)
    const geo = {}, nm = {}, ft = {};
    for (const [k, x] of Object.entries(v)) {
      if (k === 'drawn') continue;
      if (FRAME.includes(k) || isGeo(x)) geo[k] = x;
      else if (records(x)) {
        // (an area keeps its id and outline here; its other fields go to names.js or facts.js, row by row: ids may repeat)
        geo[k] = x.map(r => Object.fromEntries(Object.entries(r).filter(([f]) => f === 'id' || f === 'c' || GEO.has(f))));
        const N = x.map(() => null), F = x.map(() => null);
        x.forEach((r, i) => { for (const [f, y] of Object.entries(r)) { if (GEO.has(f) || f === 'id' || f === 'c') continue; ((wordy(y) ? N : F)[i] ||= {})[f] = y; } });
        if (N.some(Boolean)) nm[k] = N; if (F.some(Boolean)) ft[k] = F;
      } else (wordy(x) ? nm : ft)[k] = x;
    }
    if (kept[g] && kept[g].drawn) geo.drawn = kept[g].drawn;
    shapes.push(`const ${g} = ${JSON.stringify(geo)};`);
    if (Object.keys(nm).length) names.map = { ...names.map, [g]: nm };
    if (Object.keys(ft).length) facts.map = { ...facts.map, [g]: ft };
  }
  fs.mkdirSync(dir, { recursive: true });
  const top = (head ? head.trimEnd() + '\n' : '') + `// (data/maps/${map}: the outlines, label points and sizes; its words are in names.js, the rest in facts.js.)\n`;
  fs.writeFileSync(path.join(dir, 'shapes.js'), top + shapes.join('\n') + '\n');
  const source = (what, name, o) => `// data/maps/${map}: the ${what} of the map, the source the quizzes on it are made from (not loaded by a page)\nconst ${name} = {};\n${name}["data.js"] = ${JSON.stringify(o.map || {})};\n`;
  for (const [f, name, o] of [['names.js', 'MAP_NAMES', names], ['facts.js', 'MAP_FACTS', facts]]) {
    if (o.map) fs.writeFileSync(path.join(dir, f), source(f === 'names.js' ? 'words' : 'facts', name, o)); else fs.rmSync(path.join(dir, f), { force: true });
  }
}

/* ---------- a quiz of the map type ---------- */
const RECIPE = fs.readFileSync(new URL('./layer-recipe.js', import.meta.url), 'utf8');
const ITEM = ['name', 'short', 'chip', 'chipTitle', 'about', 'dial', 'text', 'pin', 'chipClass', 'areasOf', 'time'], AREA = ['clicked', 'primary', 'areaLabel'];
const tab = (keys, f) => { const t = {}; for (const k of keys) { const v = f(k); if (v !== undefined && v !== '') t[k] = v; } return t; };

// What a recipe's QUIZ gives, every function asked for every item or area
export function evaluate(Q, each = (f, keys) => tab(keys, f), tries = {}) {
  const areaIds = Q.areas.map(a => a.id), out = { quiz: {}, explore: each(a => Q.explore(a), areaIds), kinds: {} };
  for (const [k, v] of Object.entries(Q)) if (k !== 'kinds' && k !== 'explore') out.quiz[k] = v;
  for (const K of Q.kinds) {
    const ids = [...new Set(K.groups.flatMap(g => g.ids))], o = { fields: {}, items: {}, areas: {}, typed: {} };
    for (const [k, v] of Object.entries(K)) {
      if (typeof v === 'function') {
        if (k === 'pin') o.items.pin = each(id => (p => p && { x: p.x, y: p.y, label: p.label })(v(id)), ids);
        else if (ITEM.includes(k)) o.items[k] = each(v, ids);
        else if (AREA.includes(k)) o.areas[k] = each(v, areaIds);
        else if (k === 'unitColors') o.areas.unitColors = each(a => v([a]), areaIds);
        else if (k === 'typed') o.typed.typed = each(id => (tries[K.key]?.[id] || []).map(t => v(id, t)), ids);
        else if (k === 'answers') o.items.answers = each(v, ids);
        else throw new Error(`${K.key}.${k}: a function not known here`);
      } else if (k === 'detail') { o.fields.detail = v.label; o.items.detail = each(v.text, ids); }
      else if (k === 'typeMode') { o.items.tmText = each(v.text, ids); o.items.tmSay = each(v.say, ids); o.items.tmTime = each(v.time, ids); o.typed.tm = each(id => (tries[K.key]?.[id] || []).map(t => v.typed(id, t) ?? null), ids); }
      else if (k === 'rankings') o.fields.rankings = v.map(r => ({ label: r.label, order: r.order, ...(r.expand ? { expand: each(r.expand, ids) } : {}) }));
      else if (k === 'typed' && v === true) o.fields.typed = true;
      else o.fields[k] = v;
    }
    out.kinds[K.key] = o;
  }
  return out;
}

// A recipe run on its map: { QUIZ, LAYERS, lib } (the map's globals and any other scripts the page loads beside it)
export function runRecipe(globals, LAYERS, extra = '') {
  const ctx = { console, URL, Math, JSON, Object, Array, Set, Map, String, Number, RegExp, document: { body: { dataset: {} } } };
  ctx.window = ctx; vm.createContext(ctx);
  const decl = Object.keys(globals).map(g => `const ${g} = __g.${g};`).join('\n');
  ctx.__g = structuredClone(globals); ctx.__L = structuredClone(LAYERS);
  vm.runInContext(`${decl}\n${extra}\nconst LAYERS = __L;\n${RECIPE}\n;globalThis.__Q = QUIZ; globalThis.__lib = layerLib; globalThis.__R = n => new Function('return ' + n)();`, ctx);
  return { QUIZ: ctx.__Q, lib: ctx.__lib, resolve: ctx.__R, LAYERS: ctx.__L };
}

// The quiz's three files from what its recipe gives, and what it adds to its map's drawing
export function splitQuiz(Q, L, lib, resolve, old = evaluate(Q)) {
  const where = L.map || 'DATA.reg', listExpr = typeof where === 'string' ? where : Array.isArray(where) ? where[0] : where.paths;
  const raw = typeof where === 'object' && where.paths ? null : resolve(listExpr);
  const rowD = raw ? Object.fromEntries(raw.map(r => [String(r[Array.isArray(where) ? where[1] : 'id']), r.d])) : null;
  const areaIds = Q.areas.map(a => a.id), byId = Object.fromEntries(Q.areas.map(a => [a.id, a]));
  const drawn = {};
  const circles = rowD ? tab(areaIds, a => (byId[a].d !== rowD[a] ? byId[a].d : undefined)) : {};
  if (Object.keys(circles).length) drawn.circles = circles;
  const top = Q.areas.filter(a => a.top).map(a => a.id); if (top.length) drawn.top = top;
  if (Array.isArray(L.borders)) drawn.lines = L.borders;
  const settings = { key: Q.key, map: typeof where === 'string' ? where : Array.isArray(where) ? { list: where[0], id: where[1] } : { paths: where.paths, ids: where.cols.id } };
  if (typeof L.borders === 'string') settings.borders = L.borders.replace(/^\[(.*)\]$/, '$1'); else if (Array.isArray(L.borders)) settings.borders = `${listExpr.split('.')[0]}.drawn.lines`;
  for (const [k, v] of Object.entries(old.quiz)) if (!['areas', 'borders', 'proj', 'key'].includes(k)) settings[k] = v;
  if (drawn.circles) settings.circles = true;
  if (drawn.top) settings.top = true;
  const names = { explore: old.explore, groups: {}, kinds: {} }, facts = { g: tab(areaIds, a => byId[a].g), groups: {}, kinds: {} };
  settings.kinds = [];
  for (const K of Q.kinds) {
    const o = old.kinds[K.key], k = L.kinds.find(x => x.key === K.key), n = {}, f = { areas: o.items.areasOf };
    const s = {}; for (const [x, v] of Object.entries(o.fields)) if (!['groups', 'presets', 'rankings', 'modes'].includes(x)) s[x] = v;
    if (K.modes) s.modes = K.modes;
    if (K.presets) s.presets = K.presets.map(p => [p.label, p.ids]);
    if (K.rankings) { s.rankings = K.rankings.map(r => [r.label, r.order]); const ex = o.fields.rankings.map(r => r.expand); if (ex.some(Boolean)) f.expand = ex.map(e => e || null); }
    if (K.typed) {
      s.typed = true; s.time = K.time ? K.time() : 3;
      const base = k && k.like ? { ...L.kinds.find(b => b.key === k.like), ...k } : k;
      if (base && base.typed && base.typed.answers) {
        const M = lib.model(L, resolve), KK = lib.layer(M, base), more = lib.table(base.typed.answers, KK.ids, x => lib.itemVars(M, KK, x));
        n.answers = tab(Object.keys(more), x => ([].concat(more[x] || []).length ? [].concat(more[x]) : undefined));
      }
    }
    const pool = Object.keys((k && k.pool) || {}).filter(t => t !== 'w');
    if (pool.length) { s.pool = pool; n.pool = {}; for (const t of pool) n.pool[t] = Object.fromEntries(Object.entries(k.pool[t].e).map(([x, list]) => [x, list.map(e => (k.pool[t].t === undefined ? e : lib.build(k.pool[t].t, e)))])); if (k.pool.w) f.weights = k.pool.w; }
    for (const t of ['name', 'short', 'chip', 'chipTitle', 'about', 'dial', 'text', 'detail']) if (o.items[t] && !pool.includes(t)) n[t] = o.items[t];
    if (o.items.pin) { n.pin = tab(Object.keys(o.items.pin), x => (o.items.pin[x] === null ? null : o.items.pin[x].label)); (drawn.pins ||= {})[K.key] = Object.fromEntries(Object.entries(o.items.pin).filter(([, p]) => p).map(([x, p]) => [x, [p.x, p.y]])); }
    if (o.items.chipClass) f.chipClass = o.items.chipClass;
    if (o.areas.clicked) n.clicked = o.areas.clicked;
    if (o.areas.areaLabel) n.areaLabel = o.areas.areaLabel;
    if (o.areas.primary) f.primary = o.areas.primary;
    if (o.areas.unitColors) f.colors = o.areas.unitColors;
    names.groups[K.key] = K.groups.map(g => [g.title, g.sub]); facts.groups[K.key] = K.groups.map(g => g.ids);
    names.kinds[K.key] = n; facts.kinds[K.key] = f; settings.kinds.push(s);
  }
  return { settings, names, facts, drawn, holder: listExpr.split('.')[0] };
}

export const quizFiles = (id, { settings, names, facts }, made = 'tools/lib/quiz-files.mjs') => {
  const js = (name, o, what) => `// ${what} (written by ${made})\nconst ${name} = ${JSON.stringify(o)};\n`;
  return {
    [`data/quizzes/${id}/settings.js`]: js('SETTINGS', settings, `${id}: the quiz's key and view, and its layers: how each is asked`),
    [`data/quizzes/${id}/names.js`]: js('NAMES', names, `${id}: every word the quiz shows, per layer and item, per area`),
    [`data/quizzes/${id}/facts.js`]: js('FACTS', facts, `${id}: the areas of every item, the items of every group, each area's hint group`),
  };
};

// What a quiz adds to its map's drawing, written into the map's shapes.js (warned of where another quiz drew it
// otherwise: one map, one drawing)
export function addDrawn(map, holder, drawn) {
  const file = path.join(MAPS, map, 'shapes.js'), src = fs.readFileSync(file, 'utf8');
  const m = src.match(new RegExp(`^const ${holder} = (.*);$`, 'm'));
  if (!m) throw new Error(`${map}/shapes.js has no ${holder}`);
  const v = JSON.parse(m[1]), D = (v.drawn ||= {});
  for (const [k, x] of Object.entries(drawn)) {
    if (k === 'pins') { D.pins = { ...(D.pins || {}), ...x }; continue; }
    if (D[k] !== undefined && JSON.stringify(D[k]) !== JSON.stringify(x)) console.warn(`warning: ${map}: ${k} differ from what another quiz drew; written as this one's`);
    D[k] = x;
  }
  fs.writeFileSync(file, src.replace(m[0], () => `const ${holder} = ${JSON.stringify(v)};`));
}

export function writeQuiz(id, LAYERS, map, { extra = '', made } = {}) {
  const globals = readMap(map), { QUIZ, lib, resolve } = runRecipe(globals, LAYERS, extra);
  const split = splitQuiz(QUIZ, LAYERS, lib, resolve);
  for (const [f, t] of Object.entries(quizFiles(id, split, made))) { fs.mkdirSync(path.dirname(path.join(ROOT, f)), { recursive: true }); fs.writeFileSync(path.join(ROOT, f), t); }
  if (Object.keys(split.drawn).length) addDrawn(map, split.holder, split.drawn);
  return split;
}

export const quizScripts = (id, map) => [`../../data/maps/${map}/shapes.js`, `../../data/quizzes/${id}/settings.js`, `../../data/quizzes/${id}/names.js`, `../../data/quizzes/${id}/facts.js`, '../../engine/types/layer.js']
  .map(s => `<script src="${s}"></script>`).join('\n');

if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  const [id, map, file] = process.argv.slice(2);
  if (!id || !map || !file) { console.error('usage: node tools/lib/quiz-files.mjs <quiz id> <map> <recipe file>'); process.exit(1); }
  const LAYERS = new Function(fs.readFileSync(path.resolve(file), 'utf8') + ';return LAYERS')();
  const { settings } = writeQuiz(id, LAYERS, map, { made: `tools/lib/quiz-files.mjs from ${path.relative(ROOT, path.resolve(file))}` });
  console.log(`data/quizzes/${id}: settings.js, names.js, facts.js (${settings.kinds.map(k => k.key).join(', ')})`);
}
