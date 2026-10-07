#!/usr/bin/env node
// geohints: the pictures of a geohints.com meta page -> the data of a picture quiz ("which country is this?").
//
//   node tools/geohints.mjs --meta bollards --out quizzes/world-bollards [--width 800] [--quality 72]
//
// Reads https://geohints.com/meta/<meta>: every picture with its country, continent, note (e.g. the US states a
// bollard is found in) and Street View link, and its rarity (the page's Common / Uncommon / Rare filter, read from
// the three filtered views). Writes:
//   <out>/photos.js     const PHOTOS = { meta, source, continent: { [place id]: continent }, items: [{ n, c, r, t, m }] }
//                       n: picture number, c: place id in quizzes/shared/world.js, r: 0 common, 1 uncommon, 2 rare,
//                       t: note, m: Street View link without https://
//   <out>/img/<n>.webp  the pictures, scaled down (needs cwebp)
// Pages and pictures are kept in tools/cache/geohints, so a second run downloads nothing. Run tools/worldmap.mjs first.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { parseArgs } from 'node:util';
import { execFileSync } from 'node:child_process';
import { cached, sleep, CACHE, ROOT } from './lib/geo.mjs';

const { values: o } = parseArgs({ options: { meta: { type: 'string' }, out: { type: 'string' }, width: { type: 'string', default: '800' }, quality: { type: 'string', default: '72' } } });
if (!o.meta || !o.out) { console.error('usage: geohints --meta bollards --out quizzes/world-bollards'); process.exit(1); }

const SITE = 'https://geohints.com';
const RARITY = ['Common', 'Uncommon', 'Rare'];
// geohints' names that differ from the ones in world.js.
const ALIAS = { 'Czech Republic': 'Czechia', 'Macedonia': 'North Macedonia', 'Turkiye': 'Turkey', 'Türkiye': 'Turkey', 'Swaziland': 'Eswatini', 'Macao': 'Macau', 'Curacao': 'Curaçao', 'US Virgin Islands': 'United States Virgin Islands' };

const unescape = s => s.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'");
// A download that waits a moment after every request that really went out.
fs.mkdirSync(path.join(CACHE, 'geohints', o.meta), { recursive: true });
async function get(url, name) {
  const file = path.join(CACHE, 'geohints', name), had = fs.existsSync(file) && fs.statSync(file).size > 0;
  await cached(url, path.join('geohints', name));
  if (!had) await sleep(400);
  return file;
}
// The pictures of one view of the page, in page order.
function parse(html) {
  const body = html.slice(html.indexOf('id="search-results"')), out = [];
  const parts = body.split(/<div class="text-center text-3xl font-bold">([^<]+)<\/div>/);
  for (let i = 1; i < parts.length; i += 2) {
    const continent = unescape(parts[i].trim());
    for (const block of parts[i + 1].split('<div class="text-white text-md p-2 ">').slice(1)) {
      const country = /<span class="font-bold">\s*([^<]+?)\s*<\/span>/.exec(block), src = /<img[^>]*\ssrc="([^"]+)"/.exec(block);
      if (!country || !src) throw new Error('unexpected picture block: ' + block.slice(0, 200));
      const link = /<a href="(https?:\/\/[^"]+)"/.exec(block), note = /<div[^>]*>\s*([^<]*?)\s*<\/div>/.exec(block);
      out.push({ continent, country: unescape(country[1]), src: new URL(src[1], SITE).href, link: link ? link[1] : '', note: note ? unescape(note[1]).trim() : '' });
    }
  }
  return out;
}

const page = `${SITE}/meta/${o.meta}`;
const all = parse(fs.readFileSync(await get(page, `${o.meta}.html`), 'utf8'));
if (!all.length) throw new Error(`no pictures found on ${page}`);
const rarity = new Map();
for (const [r, name] of RARITY.entries()) {
  for (const e of parse(fs.readFileSync(await get(`${page}?Rarity=${name}`, `${o.meta}_Rarity_${name}.html`), 'utf8'))) {
    if (rarity.has(e.src)) throw new Error(`two rarities for ${e.src}`);
    rarity.set(e.src, r);
  }
}
const unrated = all.filter(e => !rarity.has(e.src));
if (rarity.size && unrated.length) throw new Error(`${unrated.length} pictures without a rarity, e.g. ${unrated[0].src}`);

// Places by name, from the world map.
const world = vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'quizzes', 'shared', 'world.js'), 'utf8') + ';WORLD');
const byName = new Map(world.reg.map(r => [r.n, r.id]));
const idOf = name => byName.get(ALIAS[name] || name);
const unknown = [...new Set(all.map(e => e.country))].filter(n => !idOf(n));
if (unknown.length) throw new Error(`not on the world map (add to ALIAS): ${unknown.join(', ')}`);

const imgDir = path.join(o.out, 'img');
fs.mkdirSync(imgDir, { recursive: true });
const items = [], continent = {}, seen = new Set();
let made = 0;
for (const [i, e] of all.entries()) {
  const base = path.basename(new URL(e.src).pathname), n = +(/(\d+)\.\w+$/.exec(base) || [])[1];
  if (!n || seen.has(n)) throw new Error(`no number of its own in ${e.src}`);
  seen.add(n);
  const c = idOf(e.country);
  if (continent[c] && continent[c] !== e.continent) throw new Error(`${e.country} is listed under two continents`);
  continent[c] = e.continent;
  const file = await get(e.src, path.join(o.meta, base)), webp = path.join(imgDir, `${n}.webp`);
  if (!fs.existsSync(webp)) { execFileSync('cwebp', ['-quiet', '-q', o.quality, '-resize', o.width, '0', file, '-o', webp]); made++; }
  items.push({ n, c, ...(rarity.size ? { r: rarity.get(e.src) } : {}), ...(e.note ? { t: e.note } : {}), ...(e.link ? { m: e.link.replace(/^https?:\/\//, '') } : {}) });
  if ((i + 1) % 200 === 0) console.log(`${i + 1}/${all.length}`);
}

const head = `// Generated by tools/geohints.mjs from geohints.com/meta/${o.meta}: ${items.length} pictures of ${Object.keys(continent).length} places\n`;
fs.writeFileSync(path.join(o.out, 'photos.js'), `${head}const PHOTOS = ${JSON.stringify({ meta: o.meta, source: `geohints.com/meta/${o.meta}`, continent, items })};\n`);
const mb = fs.readdirSync(imgDir).reduce((sum, f) => sum + fs.statSync(path.join(imgDir, f)).size, 0) / 1048576;
console.log(`${items.length} pictures, ${Object.keys(continent).length} places, ${made} converted, img ${mb.toFixed(1)} MB`);
if (rarity.size) console.log(RARITY.map((name, r) => `${name} ${items.filter(it => it.r === r).length}`).join(' · '));
