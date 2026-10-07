#!/usr/bin/env node
// learnablemeta: every map on learnablemeta.com/maps with its list of metas.
//
//   node tools/learnablemeta.mjs [--out tools/cache/learnablemeta] [--map <geoguessr id>]... [--images] [--refresh]
//
// Reads https://learnablemeta.com/maps (the list of maps) and the page of every map (its metas). Writes:
//   <out>/maps.json                 the list: [{ id, geoguessrId, name, description, authors, difficulty, regions,
//                                   modifiedAt, locationsCount, metasCount, ... }], as the site sends it
//   <out>/maps/<geoguessr id>.json  the map's entry in the list + metas: [{ id, name, note, images, locationsCount,
//                                   footer }]; note and footer are HTML, images are urls
// --map reads only the maps named (the id at the end of a map's address), --images also downloads the pictures of
// their metas, to tools/cache/learnablemeta/images/<the url's path after /images/>, one at a time (about 0.3 MB each);
// a picture the site no longer serves is named at the end and left out.
// The list is read anew on every run. A map's page is kept in tools/cache/learnablemeta/raw until the list shows a
// newer modifiedAt, so a second run downloads only the maps that changed; --refresh downloads every page again.
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { cached, sleep, CACHE } from './lib/geo.mjs';

const { values: o } = parseArgs({ options: { out: { type: 'string', default: path.join(CACHE, 'learnablemeta') }, map: { type: 'string', multiple: true }, images: { type: 'boolean' }, refresh: { type: 'boolean' } } });

const SITE = 'https://learnablemeta.com';
const RAW = path.join('learnablemeta', 'raw'), IMAGES = path.join('learnablemeta', 'images');
fs.mkdirSync(path.join(CACHE, RAW), { recursive: true });
fs.mkdirSync(path.join(o.out, 'maps'), { recursive: true });

// A download that waits a moment after every request that really went out.
async function get(url, name) {
  const file = path.join(CACHE, name), had = fs.existsSync(file) && fs.statSync(file).size > 0;
  if (!had) fs.mkdirSync(path.dirname(file), { recursive: true });
  await cached(url, name);
  if (!had) await sleep(300);
  return file;
}

// The data of a page (SvelteKit's __data.json): a line with the page's values, then a line for every value that was
// sent later (a "Promise" in the first). Values are flat arrays in which everything is an index into the array.
const SPECIAL = { [-1]: undefined, [-2]: undefined, [-3]: NaN, [-4]: Infinity, [-5]: -Infinity, [-6]: -0 };
function unflatten(values, chunks) {
  const done = new Map();
  const value = i => {
    if (i < 0) return SPECIAL[i];
    if (done.has(i)) return done.get(i);
    const v = values[i];
    let out = v;
    if (Array.isArray(v) && typeof v[0] === 'string') {
      if (v[0] === 'Promise') {
        const chunk = chunks.get(values[v[1]]);
        if (!chunk || !chunk.data) throw new Error(`a value of the page did not arrive: ${JSON.stringify(chunk)}`);
        out = unflatten(chunk.data, chunks);
      } else if (v[0] === 'Date') out = v[1];
      else throw new Error(`unknown kind of value: ${v[0]}`);
      done.set(i, out);
    } else if (Array.isArray(v)) {
      done.set(i, out = []);
      for (const j of v) out.push(value(j));
    } else if (v && typeof v === 'object') {
      done.set(i, out = {});
      for (const k in v) out[k] = value(v[k]);
    }
    return out;
  };
  return value(0);
}
function pageData(file) {
  const [head, ...rest] = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l));
  if (head.type !== 'data') throw new Error(`no data in ${file}: ${JSON.stringify(head).slice(0, 200)}`);
  const chunks = new Map(rest.map(c => [c.id, c]));
  return Object.assign({}, ...head.nodes.filter(n => n && n.type === 'data').map(n => unflatten(n.data, chunks)));
}

fs.rmSync(path.join(CACHE, RAW, 'maps.json'), { force: true });
const all = pageData(await get(`${SITE}/maps/__data.json`, path.join(RAW, 'maps.json'))).allMaps;
if (!Array.isArray(all) || !all.length) throw new Error(`no maps found on ${SITE}/maps`);
const odd = all.filter(m => !/^\w+$/.test(m.geoguessrId));
if (odd.length) throw new Error(`unexpected map id: ${odd[0].geoguessrId} (${odd[0].name})`);
const unknown = (o.map || []).filter(id => !all.some(m => m.geoguessrId === id));
if (unknown.length) throw new Error(`not on ${SITE}/maps: ${unknown.join(', ')}`);
const maps = o.map ? all.filter(m => o.map.includes(m.geoguessrId)) : all;
fs.writeFileSync(path.join(o.out, 'maps.json'), JSON.stringify(all, null, 1));

const kept = fs.readdirSync(path.join(CACHE, RAW));
const differ = [], broken = [];
let metas = 0, pages = 0, pictures = 0, got = 0;
for (const [i, m] of maps.entries()) {
  const name = `${m.geoguessrId}_${m.modifiedAt}.json`;
  for (const f of kept) if (f.startsWith(`${m.geoguessrId}_`) && (o.refresh || f !== name)) fs.rmSync(path.join(CACHE, RAW, f), { force: true });
  if (!fs.existsSync(path.join(CACHE, RAW, name))) pages++;
  const list = pageData(await get(`${SITE}/maps/${m.geoguessrId}/__data.json`, path.join(RAW, name))).metaList;
  if (!Array.isArray(list)) throw new Error(`no meta list for ${m.name} (${m.geoguessrId})`);
  if (list.length !== +m.metasCount) differ.push(`${m.name}: ${list.length} metas, ${m.metasCount} in the list of maps`);
  fs.writeFileSync(path.join(o.out, 'maps', `${m.geoguessrId}.json`), JSON.stringify({ ...m, metas: list }, null, 1));
  metas += list.length;
  if (o.images) for (const src of list.flatMap(e => e.images || [])) {
    const u = new URL(src, SITE), file = path.join(IMAGES, u.origin === SITE ? u.pathname.replace(/^\/images\//, '') : u.hostname + u.pathname);
    const had = fs.existsSync(path.join(CACHE, file));
    try { await get(u.href, file); } catch (e) { broken.push(`${m.name}: ${e.message}`); continue; }
    if (!had) got++;
    pictures++;
  }
  if ((i + 1) % 25 === 0) console.log(`${i + 1}/${maps.length}`);
}
for (const d of [...differ, ...broken]) console.warn(d);
console.log(`${maps.length} maps, ${metas} metas (${pages} pages downloaded)${o.images ? `, ${pictures} pictures (${got} downloaded, ${broken.length} broken)` : ''} -> ${o.out}`);
